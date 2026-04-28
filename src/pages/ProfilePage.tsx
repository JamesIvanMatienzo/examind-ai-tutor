import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { BookOpen, FileText, Zap, Clock, ChevronRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDisplayName, useProfile } from "@/hooks/useProfile";
import { useSubjects } from "@/hooks/useSubjects";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { name, initial, email } = useDisplayName();
  const { data: profile } = useProfile();
  const { data: subjects = [] } = useSubjects();

  const subtitle = [profile?.school_name, profile?.year_level].filter(Boolean).join(" · ") || email || "";

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-card px-6 pt-12 pb-6 flex flex-col items-center border-b">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-3">
          <span className="text-primary-foreground text-2xl font-bold">{initial}</span>
        </div>
        <h1 className="text-xl font-bold">{name}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: BookOpen, label: "Subjects", value: String(subjects.length) },
            { icon: FileText, label: "Files", value: "0" },
            { icon: Zap, label: "Questions", value: "0" },
            { icon: Clock, label: "Study Hours", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <stat.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <button
            onClick={() => navigate("/scores")}
            className="w-full text-left px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Score Tracker
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          {[
            { label: "Edit Profile", path: "/profile/edit" },
            { label: "App Settings", path: "/settings" },
            { label: "Help & Feedback", path: "/help" },
            { label: "Sign Out", path: null as string | null },
          ].map((item) => (
            <button
              key={item.label}
              onClick={async () => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  // Check if this is a mock session and clean it up
                  try {
                    const storedAuth = localStorage.getItem("examind-mock-auth");
                    if (storedAuth) {
                      const authData = JSON.parse(storedAuth);
                      const mockSession = authData.session;
                      
                      if (mockSession && mockSession.access_token === "mock-dev-token") {
                        // Clean up mock session
                        localStorage.removeItem("examind-mock-auth");
                        // Also clean up Supabase storage
                        const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.replace(/^https?:\/\//, '').replace(/\./g, '-')}-auth-token`;
                        if (storageKey) {
                          localStorage.removeItem(storageKey);
                        }
                        toast.success("Signed out");
                        navigate("/welcome");
                        return;
                      }
                    }
                  } catch (error) {
                    // If there's an error, just proceed with normal sign out
                  }
                  
                  // Normal Supabase sign out
                  await supabase.auth.signOut();
                  toast.success("Signed out");
                  navigate("/welcome");
                }
              }}
              className="w-full text-left px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
