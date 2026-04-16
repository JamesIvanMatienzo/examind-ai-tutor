import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, BookOpen, Clock, CheckCircle2, Calendar } from "lucide-react";

interface StudyDay {
  day: number;
  date: string;
  subject: string;
  topics: string[];
  duration: string;
  difficulty: "hard" | "medium" | "easy";
  resources: string;
  type: "study" | "practice" | "rest" | "review";
}

const demoPlan: StudyDay[] = [
  {
    day: 1, date: "Today", subject: "Mathematics", difficulty: "hard", type: "study",
    topics: ["Chapter 3 — Derivatives", "Chain Rule & Product Rule"],
    duration: "1h 30min", resources: "Module 3.pdf, Lecture Notes Week 5",
  },
  {
    day: 2, date: "Tomorrow", subject: "Mathematics", difficulty: "hard", type: "study",
    topics: ["Integration by Parts", "U-Substitution Method"],
    duration: "1h 15min", resources: "Module 4.pdf, Practice Set 2",
  },
  {
    day: 3, date: "Apr 19", subject: "Mathematics", difficulty: "medium", type: "practice",
    topics: ["Practice Exam — Chapters 3 & 4", "Timed drill: 30 questions"],
    duration: "1h", resources: "AI-generated practice exam",
  },
  {
    day: 4, date: "Apr 20", subject: "Mathematics", difficulty: "medium", type: "study",
    topics: ["Limits & Continuity Review", "L'Hôpital's Rule"],
    duration: "45min", resources: "Module 2.pdf, Past Exam #1",
  },
  {
    day: 5, date: "Apr 21", subject: "Mathematics", difficulty: "easy", type: "rest",
    topics: ["Light review only", "Skim formula sheet"],
    duration: "20min", resources: "Summary notes",
  },
  {
    day: 6, date: "Apr 22", subject: "Mathematics", difficulty: "easy", type: "review",
    topics: ["Final review — weak areas from practice", "Formula memorization"],
    duration: "30min", resources: "Flagged questions, formula sheet",
  },
  {
    day: 7, date: "Apr 23", subject: "Mathematics", difficulty: "hard", type: "practice",
    topics: ["Full mock exam — 50 items", "Simulate exam conditions"],
    duration: "1h 30min", resources: "AI-generated full exam",
  },
];

function getDifficultyLabel(d: string) {
  if (d === "hard") return { text: "Hard", color: "bg-destructive text-destructive-foreground" };
  if (d === "medium") return { text: "Medium", color: "bg-warning text-warning-foreground" };
  return { text: "Easy", color: "bg-success text-success-foreground" };
}

function getTypeIcon(type: string) {
  if (type === "practice") return "📝";
  if (type === "rest") return "☕";
  if (type === "review") return "🔁";
  return "📖";
}

export default function AIStudyPlanPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleDay = (day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="text-sm font-semibold">Generating your study plan...</p>
        <p className="text-xs text-muted-foreground text-center">
          Analyzing your files, exam date, and topic difficulty to build the optimal schedule
        </p>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display">AI Study Plan</h1>
          <p className="text-xs text-muted-foreground">Mathematics Midterm · 7 days</p>
        </div>
      </div>

      <div className="px-6 mt-5 space-y-4">
        {/* Summary */}
        <div className="bg-secondary rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Smart Study Strategy</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hard foundational topics are front-loaded. Practice exams are scheduled mid-week. 
                A rest day is included before the final review push.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(completedDays.size / demoPlan.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{completedDays.size}/{demoPlan.length} done</span>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <AnimatePresence>
            {demoPlan.map((day, i) => {
              const diff = getDifficultyLabel(day.difficulty);
              const completed = completedDays.has(day.day);
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-card border rounded-xl p-4 relative ${completed ? "opacity-60" : ""}`}
                >
                  {/* Timeline connector */}
                  {i < demoPlan.length - 1 && (
                    <div className="absolute left-7 top-full w-0.5 h-3 bg-border z-10" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Day marker */}
                    <button
                      onClick={() => toggleDay(day.day)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                        completed
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {completed ? <CheckCircle2 className="h-5 w-5" /> : `D${day.day}`}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{day.date}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${diff.color}`}>
                          {diff.text}
                        </span>
                        <span className="text-xs">{getTypeIcon(day.type)}</span>
                      </div>

                      <div className="space-y-1">
                        {day.topics.map((topic, ti) => (
                          <p key={ti} className={`text-sm ${ti === 0 ? "font-semibold" : "text-muted-foreground"}`}>
                            {topic}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {day.duration}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {day.resources}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Save to Calendar */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSaved(true)}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            saved
              ? "bg-success text-success-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Saved to Calendar
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" /> Save to Calendar
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
