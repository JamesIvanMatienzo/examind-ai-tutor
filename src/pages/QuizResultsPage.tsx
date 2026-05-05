import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Zap, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface QuizResult {
  id: number;
  question: string;
  type: string;
  topic: string;
  correctAnswer: string;
  explanation: string;
  userAnswer: string;
  isCorrect: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function QuizResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { results, totalTime, hasTimer } = (location.state || {}) as {
    results: QuizResult[];
    totalTime: number;
    hasTimer: boolean;
  };

  const [expandedReview, setExpandedReview] = useState(false);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate("/practice")} className="text-primary underline">Back to Practice</button>
      </div>
    );
  }

  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);

  // Topic breakdown
  const topicMap: Record<string, { correct: number; total: number }> = {};
  results.forEach((r) => {
    if (!topicMap[r.topic]) topicMap[r.topic] = { correct: 0, total: 0 };
    topicMap[r.topic].total++;
    if (r.isCorrect) topicMap[r.topic].correct++;
  });
  const topics = Object.entries(topicMap);

  const scoreColor = pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive";
  const ringColor = pct >= 75 ? "stroke-success" : pct >= 50 ? "stroke-warning" : "stroke-destructive";

  // Weakest topic for AI feedback
  const weakest = topics.sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center gap-3">
        <button onClick={() => navigate("/practice")} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold font-display">Results</h1>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Score Circle */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" className="stroke-muted" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                className={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 314} 314`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{pct}%</span>
              <span className="text-xs text-muted-foreground">{correct}/{total}</span>
            </div>
          </div>
          {hasTimer && totalTime > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Completed in {formatTime(totalTime)}</p>
          )}
          <p className={`text-sm font-semibold mt-1 ${scoreColor}`}>
            {pct >= 75 ? "Great job! 🎉" : pct >= 50 ? "Not bad, keep going! 💪" : "Needs more review 📚"}
          </p>
        </div>

        {/* Topic Breakdown */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-3">TOPIC BREAKDOWN</h2>
          <div className="space-y-2">
            {topics.map(([topic, data]) => {
              const topicPct = Math.round((data.correct / data.total) * 100);
              const color = topicPct >= 75 ? "bg-success" : topicPct >= 50 ? "bg-warning" : "bg-destructive";
              return (
                <div key={topic} className="bg-card border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium">{topic}</p>
                    <span className="text-xs text-muted-foreground">{data.correct}/{data.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${topicPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Feedback */}
        {weakest && (
          <div className="bg-secondary rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Feedback</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You struggled with <strong>{weakest[0]}</strong> ({weakest[1].correct}/{weakest[1].total} correct). 
                  Consider reviewing this topic before your exam. Try the Guided Learning mode for a deeper dive.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Review */}
        <div>
          <button
            onClick={() => setExpandedReview(!expandedReview)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-xs font-semibold text-muted-foreground">QUESTION REVIEW</h2>
            {expandedReview ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {expandedReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              {results.map((r) => (
                <div key={r.id} className={`bg-card border rounded-xl p-3 border-l-4 ${r.isCorrect ? "border-l-success" : "border-l-destructive"}`}>
                  <div className="flex items-start gap-2">
                    {r.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-relaxed">{r.question}</p>
                      {!r.isCorrect && (
                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-[10px] text-destructive">Your answer: {r.userAnswer || "No answer"}</p>
                          <p className="text-[10px] text-success">Correct: {r.correctAnswer}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1.5">{r.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/practice/setup")}
            className="flex-1 py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" /> Retake
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/practice")}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            New Practice
          </motion.button>
        </div>
      </div>
    </div>
  );
}
