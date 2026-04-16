import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, TrendingUp, Trophy, Target, Sparkles, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ScoreEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  type: string;
  score: number;
  total: number;
  date: string;
  color: string;
}

const subjects = [
  { id: "1", name: "Mathematics", color: "#D85A30" },
  { id: "2", name: "Physics", color: "#1D9E75" },
  { id: "3", name: "Filipino", color: "#534AB7" },
  { id: "4", name: "History", color: "#EF9F27" },
];

const examTypes = ["Quiz", "Midterm", "Finals", "Seatwork", "Project"];

const initialScores: ScoreEntry[] = [
  { id: "1", subjectId: "1", subjectName: "Mathematics", type: "Quiz", score: 72, total: 100, date: "Mar 1", color: "#D85A30" },
  { id: "2", subjectId: "2", subjectName: "Physics", type: "Quiz", score: 65, total: 100, date: "Mar 1", color: "#1D9E75" },
  { id: "3", subjectId: "1", subjectName: "Mathematics", type: "Seatwork", score: 78, total: 100, date: "Mar 8", color: "#D85A30" },
  { id: "4", subjectId: "2", subjectName: "Physics", type: "Seatwork", score: 70, total: 100, date: "Mar 8", color: "#1D9E75" },
  { id: "5", subjectId: "3", subjectName: "Filipino", type: "Quiz", score: 85, total: 100, date: "Mar 15", color: "#534AB7" },
  { id: "6", subjectId: "1", subjectName: "Mathematics", type: "Midterm", score: 82, total: 100, date: "Mar 15", color: "#D85A30" },
  { id: "7", subjectId: "2", subjectName: "Physics", type: "Midterm", score: 75, total: 100, date: "Mar 22", color: "#1D9E75" },
  { id: "8", subjectId: "1", subjectName: "Mathematics", type: "Quiz", score: 88, total: 100, date: "Mar 29", color: "#D85A30" },
  { id: "9", subjectId: "3", subjectName: "Filipino", type: "Midterm", score: 90, total: 100, date: "Mar 29", color: "#534AB7" },
  { id: "10", subjectId: "2", subjectName: "Physics", type: "Quiz", score: 80, total: 100, date: "Apr 5", color: "#1D9E75" },
  { id: "11", subjectId: "4", subjectName: "History", type: "Quiz", score: 76, total: 100, date: "Apr 5", color: "#EF9F27" },
  { id: "12", subjectId: "1", subjectName: "Mathematics", type: "Quiz", score: 92, total: 100, date: "Apr 12", color: "#D85A30" },
];

export default function ScoreTrackerPage() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<ScoreEntry[]>(initialScores);
  const [filter, setFilter] = useState("all");
  const [showLogForm, setShowLogForm] = useState(false);

  // Log form state
  const [logSubject, setLogSubject] = useState("");
  const [logType, setLogType] = useState("");
  const [logScore, setLogScore] = useState("");
  const [logTotal, setLogTotal] = useState("100");

  const filtered = filter === "all" ? scores : scores.filter((s) => s.subjectId === filter);

  // Chart data: group by date
  const dateMap: Record<string, Record<string, number>> = {};
  filtered.forEach((s) => {
    if (!dateMap[s.date]) dateMap[s.date] = {};
    dateMap[s.date][s.subjectName] = Math.round((s.score / s.total) * 100);
  });
  const chartData = Object.entries(dateMap).map(([date, subs]) => ({ date, ...subs }));

  const activeSubjects = filter === "all"
    ? subjects.filter((s) => scores.some((sc) => sc.subjectId === s.id))
    : subjects.filter((s) => s.id === filter);

  // Stats
  const allPcts = filtered.map((s) => Math.round((s.score / s.total) * 100));
  const avg = allPcts.length ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;
  const highest = allPcts.length ? Math.max(...allPcts) : 0;

  // Most improved: subject with largest score increase from first to last entry
  const subjectImprovement: Record<string, number> = {};
  subjects.forEach((s) => {
    const entries = scores.filter((sc) => sc.subjectId === s.id);
    if (entries.length >= 2) {
      const first = (entries[0].score / entries[0].total) * 100;
      const last = (entries[entries.length - 1].score / entries[entries.length - 1].total) * 100;
      subjectImprovement[s.name] = last - first;
    }
  });
  const mostImproved = Object.entries(subjectImprovement).sort((a, b) => b[1] - a[1])[0];

  const handleLog = () => {
    const sub = subjects.find((s) => s.id === logSubject);
    if (!sub || !logType || !logScore) return;
    const newEntry: ScoreEntry = {
      id: Date.now().toString(),
      subjectId: sub.id,
      subjectName: sub.name,
      type: logType,
      score: parseInt(logScore),
      total: parseInt(logTotal) || 100,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      color: sub.color,
    };
    setScores((prev) => [...prev, newEntry]);
    setShowLogForm(false);
    setLogSubject("");
    setLogType("");
    setLogScore("");
    setLogTotal("100");
  };

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display">Score Tracker</h1>
          <p className="text-xs text-muted-foreground">Track your academic progress</p>
        </div>
      </div>

      <div className="px-6 mt-5 space-y-5">
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
              filter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
            }`}
          >
            All Subjects
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: filter === s.id ? "white" : s.color }} />
              {s.name}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card border rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-3">SCORE TREND</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                {activeSubjects.map((s) => (
                  <Line
                    key={s.id}
                    type="monotone"
                    dataKey={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: s.color }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex gap-3 mt-3 flex-wrap">
            {activeSubjects.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border rounded-xl p-3 text-center">
            <Target className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{avg}%</p>
            <p className="text-[10px] text-muted-foreground">Average</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <Trophy className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold">{highest}%</p>
            <p className="text-[10px] text-muted-foreground">Highest</p>
          </div>
          <div className="bg-card border rounded-xl p-3 text-center">
            <TrendingUp className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-sm font-bold truncate">{mostImproved ? mostImproved[0].split(" ")[0] : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Most Improved</p>
          </div>
        </div>

        {/* AI Insight */}
        {scores.length >= 3 && mostImproved && (
          <div className="bg-secondary rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Insight</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your {mostImproved[0]} scores have improved by {Math.round(mostImproved[1])}% since you started using ExaMind. Keep up the great work! 📈
              </p>
            </div>
          </div>
        )}

        {/* Score Log */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">SCORE LOG</h2>
          <div className="space-y-2">
            {[...filtered].reverse().map((s) => {
              const pct = Math.round((s.score / s.total) * 100);
              return (
                <div key={s.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: s.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.subjectName}</p>
                    <p className="text-xs text-muted-foreground">{s.type} · {s.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}`}>
                      {pct}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">{s.score}/{s.total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowLogForm(true)}
        className="fixed bottom-6 right-6 max-w-[430px] w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg z-40"
        style={{ position: "fixed" }}
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </motion.button>

      {/* Log Form Modal */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-card rounded-t-2xl p-6 w-full max-w-[430px] space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Log Score</h3>
                <button onClick={() => setShowLogForm(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">SUBJECT</p>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setLogSubject(s.id)}
                      className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-colors ${
                        logSubject === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: logSubject === s.id ? "white" : s.color }} />
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">EXAM TYPE</p>
                <div className="flex gap-2 flex-wrap">
                  {examTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setLogType(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        logType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">SCORE</p>
                  <input
                    type="number"
                    value={logScore}
                    onChange={(e) => setLogScore(e.target.value)}
                    placeholder="88"
                    className="w-full p-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">TOTAL</p>
                  <input
                    type="number"
                    value={logTotal}
                    onChange={(e) => setLogTotal(e.target.value)}
                    placeholder="100"
                    className="w-full p-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!logSubject || !logType || !logScore}
                onClick={handleLog}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  logSubject && logType && logScore
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Save Score
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
