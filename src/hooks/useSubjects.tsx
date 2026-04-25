import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Subject = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string;
  exam_date: string | null;
  created_at: string;
  updated_at: string;
};

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function useSubjects() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["subjects", user?.id],
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Subject[];
    },
    enabled: !loading && !!user,
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { name: string; code?: string | null; color: string; exam_date?: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          user_id: user.id,
          name: input.name,
          code: input.code ?? null,
          color: input.color,
          exam_date: input.exam_date ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}
