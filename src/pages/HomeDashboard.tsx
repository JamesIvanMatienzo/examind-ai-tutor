import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Upload, Zap, Calendar, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useSubjects, daysUntil } from "@/hooks/useSubjects";
import { useDisplayName } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

function getCountdownColor(days: number) {
  if (days <= 3) return "bg-destructive text-destructive-foreground";
  if (days <= 7) return "bg-warning text-warning-foreground";
  return "bg-success text-success-foreground";
}

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { name, initial } = useDisplayName();
  const { data: subjects = [], isLoading } = useSubjects();

  const withDays = subjects
    .map((s) => ({ ...s, daysUntilExam: daysUntil(s.exam_date) }))
    .filter((s) => s.daysUntilExam !== null) as Array<typeof subjects[number] & { daysUntilExam: number }>;

  const urgentExam = withDays.find((s) => s.daysUntilExam <= 3 && s.daysUntilExam >= 0);
  const upcoming = [...withDays].sort((a, b) => a.daysUntilExam - b.daysUntilExam);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Good morning,</p>
            <h1 className="text-2xl font-bold"><span>{name}</span> <span>👋</span></h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">{initial}</span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 mt-6">
        {/* AI Nudge */}
        {urgentExam && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary rounded-xl p-4 flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(`/subjects/${urgentExam.id}`)}
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                Your {urgentExam.name} exam is in {urgentExam.daysUntilExam} day{urgentExam.daysUntilExam !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">Tap to see your focus guide</p>
            </div>
          </motion.div>
        )}

        {/* Upcoming Exams */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">UPCOMING EXAMS</h2>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {upcoming.map((s) => (
                <div key={s.id} className="bg-card rounded-xl p-3 min-w-[140px] border shrink-0">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${getCountdownColor(s.daysUntilExam)}`}>
                    {s.daysUntilExam}d left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">QUICK ACTIONS</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Upload, label: "Upload File", path: "/subjects" },
              { icon: Zap, label: "Practice", path: "/practice" },
              { icon: Calendar, label: "Schedule", path: "/schedule" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="bg-card border rounded-xl p-4 flex flex-col items-center gap-2"
              >
                <action.icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject Folders */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">YOUR SUBJECTS</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-card border border-dashed rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No subjects yet. Add your first one to get started.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/subjects/add")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add Subject
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((s) => {
                const days = daysUntil(s.exam_date);
                return (
                  <motion.button
                    key={s.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/subjects/${s.id}`)}
                    className="bg-card border rounded-xl p-4 text-left relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: s.color }} />
                    <p className="text-sm font-semibold pl-2">{s.name}</p>
                    <p className="text-xs text-muted-foreground pl-2 mt-1">{s.code ?? "—"}</p>
                    {days !== null && (
                      <span className={`inline-block mt-2 ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${getCountdownColor(days)}`}>
                        {days}d
                      </span>
                    )}
                  </motion.button>
                );
              })}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/subjects/add")}
                className="bg-card border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs font-medium">Add Subject</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
