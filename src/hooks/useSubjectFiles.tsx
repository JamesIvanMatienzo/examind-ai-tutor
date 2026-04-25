import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubjectFile = {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  file_type: string;
  created_at: string;
  updated_at: string;
};

const BUCKET = "subject-files";

function detectFileType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("exam")) return "Exam";
  if (lower.includes("quiz")) return "Quiz";
  if (lower.includes("module") || lower.endsWith(".pdf")) return "Module";
  return "Notes";
}

export function useSubjectFiles(subjectId: string | undefined) {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["subject-files", subjectId],
    queryFn: async (): Promise<SubjectFile[]> => {
      const { data, error } = await supabase
        .from("subject_files")
        .select("*")
        .eq("subject_id", subjectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SubjectFile[];
    },
    enabled: !loading && !!user && !!subjectId,
  });
}

export function useUploadSubjectFile(subjectId: string | undefined) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      if (!subjectId) throw new Error("Missing subject");
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${user.id}/${subjectId}/${Date.now()}_${safeName}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { data, error } = await supabase
        .from("subject_files")
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          name: file.name,
          storage_path: path,
          mime_type: file.type || null,
          size_bytes: file.size,
          file_type: detectFileType(file.name),
        })
        .select()
        .single();
      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw error;
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subject-files", subjectId] }),
  });
}

export function useDeleteSubjectFile(subjectId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: SubjectFile) => {
      await supabase.storage.from(BUCKET).remove([file.storage_path]);
      const { error } = await supabase.from("subject_files").delete().eq("id", file.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subject-files", subjectId] }),
  });
}

export async function getSubjectFileUrl(storage_path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storage_path, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}
