import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  school_name: string | null;
  year_level: string | null;
  avatar_url: string | null;
};

export function useProfile() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !loading && !!user,
  });
}

export function useDisplayName(): { name: string; initial: string; email?: string } {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    profile?.full_name ||
    (typeof meta.full_name === "string" ? meta.full_name : "") ||
    (typeof meta.name === "string" ? meta.name : "") ||
    user?.email?.split("@")[0] ||
    "there";
  const initial = (name?.[0] ?? "U").toUpperCase();
  return { name, initial, email: user?.email ?? undefined };
}
