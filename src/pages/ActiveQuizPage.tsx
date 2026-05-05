import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ActiveQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const subjectId = searchParams.get("subject") || "";
  const itemCount = parseInt(searchParams.get("items") || "10");
  const timeLimitMin = parseInt(searchParams.get("time") || "0");
  const focus = searchParams.get("focus") || "All Topics";
  const typesParam = searchParams.get("types") || "";
  const types = typesParam ? typesParam.split(",") : [];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimitMin * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hasTimer = timeLimitMin > 0;

  const apiBase = useMemo(() => (import.meta.env.VITE_API_BASE_URL as string | undefined) || "", []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsGenerating(true);
      setGenerationError(null);
      setQuestions([]);
      setAnswers({});
      setFlagged(new Set());
      setCurrentIndex(0);

      try {
        if (!apiBase) {
          throw new Error("AI backend is not configured. Set VITE_API_BASE_URL to continue.");
        }

        const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/practice/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId,
            items: itemCount,
            focus,
            types,
          }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.error || "Failed to generate practice exam");
        }

        const q = (json?.questions || []) as Array<{
          q: string;
          options?: string[];
          correct: number;
          explanation: string;
          topic: string;
          type: string;
        }>;

        if (!q.length) {
          throw new Error("The AI backend returned no questions.");
        }

        const mapped: Question[] = q.map((qq, idx) => ({
          id: idx + 1,
          type: qq.type,
          question: qq.q,
          options: qq.options || [],
          correctAnswer: qq.options?.[qq.correct] ?? qq.explanation,
          explanation: qq.explanation,
          topic: qq.topic,
        }));

        if (!cancelled) {
          setQuestions(mapped);
        }
      } catch (error) {
        if (!cancelled) {
          setGenerationError(error instanceof Error ? error.message : "Failed to generate practice exam");
        }
      }
    };

    run().finally(() => {
      if (!cancelled) setIsGenerating(false);
    });

    return () => {
      cancelled = true;
    };
  }, [apiBase, subjectId, itemCount, focus, typesParam, retryToken]);

  useEffect(() => {
    if (!hasTimer) return;
    if (isGenerating) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasTimer, isGenerating]);

  const current = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const setAnswer = (value: string) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const toggleFlag = () => {
    if (!current) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const exitExam = () => {
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
    setTimeLeft(timeLimitMin * 60);
    navigate("/practice", { replace: true });
  };

  const handleSubmit = useCallback(() => {
    if (!questions.length) return;
    const results = questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      topic: q.topic,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      userAnswer: answers[q.id] || "",
      isCorrect: (answers[q.id] || "").toLowerCase().trim() === q.correctAnswer.toLowerCase().trim(),
    }));

    const elapsed = hasTimer ? timeLimitMin * 60 - timeLeft : 0;

    navigate("/practice/results", {
      state: {
        results,
        totalTime: elapsed,
        hasTimer,
      },
    });
  }, [questions, answers, hasTimer, timeLimitMin, timeLeft, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LoadingOverlay open={isGenerating} title="Generating exam…" subtitle="Please wait while we prepare your questions" />
      {/* Top Bar */}
      <div className="bg-card px-4 pt-12 pb-3 border-b">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowExitConfirm(true)} className="text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">
              {questions.length ? `Question ${currentIndex + 1} of ${questions.length}` : "Preparing…"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasTimer && (
              <span className={`text-xs font-mono font-medium flex items-center gap-1 ${timeLeft < 60 ? "text-destructive" : "text-muted-foreground"}`}>
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeLeft)}
              </span>
            )}
            <button
              onClick={toggleFlag}
              disabled={!current}
              className={!current ? "text-muted-foreground/40" : flagged.has(current.id) ? "text-warning" : "text-muted-foreground"}
            >
              <Flag className="h-4.5 w-4.5" fill={flagged.has(current.id) ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        {/* Progress */}
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 px-6 py-6">
        {generationError ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="bg-card border rounded-2xl p-5 max-w-sm">
              <p className="text-base font-semibold">Could not generate exam</p>
              <p className="text-sm text-muted-foreground mt-2">{generationError}</p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setRetryToken((value) => value + 1)}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Retry
                </button>
                <button
                  onClick={() => navigate("/practice/setup")}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        ) : current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Type Badge */}
              <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground mb-3">
                {current.type}
              </span>

              {/* Question */}
              <h2 className="text-base font-semibold leading-relaxed mb-6">{current.question}</h2>

              {/* Answer Area */}
              {(current.type === "Multiple Choice") && current.options && (
                <div className="space-y-2">
                  {current.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const selected = answers[current.id] === opt;
                    return (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAnswer(opt)}
                        className={`w-full p-3.5 rounded-xl text-left text-sm font-medium border transition-colors flex items-center gap-3 ${
                          selected
                            ? "bg-secondary border-primary text-foreground"
                            : "bg-card border-border text-foreground"
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {letter}
                        </span>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {current.type === "True or False" && current.options && (
                <div className="grid grid-cols-2 gap-3">
                  {current.options.map((opt) => {
                    const selected = answers[current.id] === opt;
                    return (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAnswer(opt)}
                        className={`py-4 rounded-xl text-sm font-semibold border transition-colors ${
                          selected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border"
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {(current.type === "Identification" || current.type === "Fill in the Blank") && (
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={answers[current.id] || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full p-3.5 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Preparing your exam…
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="px-6 pb-8 flex items-center gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={!questions.length || currentIndex === 0}
          className="flex-1 py-3 rounded-xl border text-sm font-medium disabled:opacity-30 flex items-center justify-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {questions.length > 0 && currentIndex === questions.length - 1 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSubmitConfirm(true)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Submit
          </motion.button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={!questions.length}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Submit Confirm Dialog */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold mb-2">Submit Exam?</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {Object.keys(answers).length} of {questions.length} questions answered
              </p>
              {flagged.size > 0 && (
                <p className="text-xs text-warning mb-3">{flagged.size} flagged for review</p>
              )}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirm Dialog */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold mb-2">Exit Exam?</h3>
              <p className="text-sm text-muted-foreground">
                Your current progress will be cleared.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                >
                  Stay
                </button>
                <button
                  onClick={exitExam}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
