import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, BookOpen, History, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useSubjects } from "@/hooks/useSubjects";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "generated" | "saved" | "history";

export default function PracticePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("generated");
  const { data: subjects = [], isLoading } = useSubjects();

  const tabs: { key: Tab; label: string; icon: typeof Zap }[] = [
    { key: "generated", label: "Generated", icon: Zap },
    { key: "saved", label: "Saved", icon: BookOpen },
    { key: "history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-4 border-b">
        <h1 className="text-2xl font-bold font-display">Practice</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate & take practice exams</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border text-muted-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 mt-5 space-y-5">
        {tab === "generated" && (
          <>
            {/* New Practice CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/practice/setup")}
              className="w-full bg-primary text-primary-foreground rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">New Practice Exam</p>
                <p className="text-xs opacity-80">Choose subject, topics & question types</p>
              </div>
              <ChevronRight className="h-5 w-5 opacity-60" />
            </motion.button>

            {/* By Subject */}
            <div>
              <h2 className="text-xs font-semibold text-muted-foreground mb-3">BY SUBJECT</h2>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="bg-card border border-dashed rounded-xl p-4 text-center text-xs text-muted-foreground">
                  Add a subject to start generating practice exams.
                </div>
              ) : (
                <div className="space-y-2">
                  {subjects.map((s) => (
                    <motion.button
                      key={s.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/practice/setup?subject=${s.id}`)}
                      className="w-full bg-card border rounded-xl p-3 flex items-center gap-3 text-left"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "20" }}>
                        <BookOpen className="h-4 w-4" style={{ color: s.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.code ?? "No code"}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "history" && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground mb-3">RECENT ATTEMPTS</h2>
            <div className="space-y-2">
              {recentAttempts.map((a) => {
                const pct = Math.round((a.score / a.items) * 100);
                return (
                  <div key={a.id} className="bg-card border rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{a.subject}</p>
                        <p className="text-xs text-muted-foreground">{a.topic} · {a.items} items</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}`}>
                          {pct}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">{a.date}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "saved" && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No saved questions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Bookmark questions during practice to see them here</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
