import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  topic: string;
}

// Demo questions
const generateQuestions = (count: number, types: string[]): Question[] => {
  const pool: Omit<Question, "id">[] = [
    { type: "Multiple Choice", question: "What is the derivative of x²?", options: ["x", "2x", "2", "x²"], correctAnswer: "2x", topic: "Derivatives" },
    { type: "Multiple Choice", question: "The integral of 1/x dx is:", options: ["ln|x| + C", "x² + C", "1/x² + C", "e^x + C"], correctAnswer: "ln|x| + C", topic: "Integrals" },
    { type: "True or False", question: "The derivative of a constant is always zero.", options: ["True", "False"], correctAnswer: "True", topic: "Derivatives" },
    { type: "True or False", question: "Every continuous function is differentiable.", options: ["True", "False"], correctAnswer: "False", topic: "Continuity" },
    { type: "Identification", question: "What theorem states that if f is continuous on [a,b], then f attains a maximum and minimum?", correctAnswer: "Extreme Value Theorem", topic: "Theorems" },
    { type: "Multiple Choice", question: "lim(x→0) sin(x)/x equals:", options: ["0", "1", "∞", "undefined"], correctAnswer: "1", topic: "Limits" },
    { type: "Fill in the Blank", question: "The chain rule states: d/dx[f(g(x))] = f'(g(x)) · ___", correctAnswer: "g'(x)", topic: "Derivatives" },
    { type: "Multiple Choice", question: "Which of the following is NOT a type of discontinuity?", options: ["Jump", "Removable", "Infinite", "Linear"], correctAnswer: "Linear", topic: "Continuity" },
    { type: "True or False", question: "The sum of two convergent series is always convergent.", options: ["True", "False"], correctAnswer: "True", topic: "Series" },
    { type: "Identification", question: "Name the rule used to evaluate limits of the form 0/0 or ∞/∞.", correctAnswer: "L'Hôpital's Rule", topic: "Limits" },
    { type: "Multiple Choice", question: "∫ e^x dx equals:", options: ["e^x + C", "xe^x + C", "e^(x+1) + C", "ln(e^x) + C"], correctAnswer: "e^x + C", topic: "Integrals" },
    { type: "Multiple Choice", question: "What is the second derivative test used for?", options: ["Finding limits", "Classifying critical points", "Evaluating integrals", "Testing convergence"], correctAnswer: "Classifying critical points", topic: "Derivatives" },
    { type: "True or False", question: "A function can have more than one absolute maximum on a closed interval.", options: ["True", "False"], correctAnswer: "False", topic: "Theorems" },
    { type: "Fill in the Blank", question: "The Fundamental Theorem of Calculus connects ___ and integration.", correctAnswer: "differentiation", topic: "Theorems" },
    { type: "Multiple Choice", question: "The derivative of sin(x) is:", options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], correctAnswer: "cos(x)", topic: "Derivatives" },
  ];

  const filtered = types.length > 0 ? pool.filter((q) => types.includes(q.type)) : pool;
  const source = filtered.length > 0 ? filtered : pool;
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    questions.push({ ...source[i % source.length], id: i + 1 });
  }
  return questions;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ActiveQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const itemCount = parseInt(searchParams.get("items") || "10");
  const timeLimitMin = parseInt(searchParams.get("time") || "0");
  const typesParam = searchParams.get("types") || "";
  const types = typesParam ? typesParam.split(",") : [];

  const [questions] = useState(() => generateQuestions(itemCount, types));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimitMin * 60);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasTimer = timeLimitMin > 0;

  useEffect(() => {
    if (!hasTimer) return;
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
  }, [hasTimer]);

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const setAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    const results = questions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      topic: q.topic,
      correctAnswer: q.correctAnswer,
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
      {/* Top Bar */}
      <div className="bg-card px-4 pt-12 pb-3 border-b">
        <div className="flex items-center justify-between">
          <button onClick={() => setShowConfirm(true)} className="text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasTimer && (
              <span className={`text-xs font-mono font-medium flex items-center gap-1 ${timeLeft < 60 ? "text-destructive" : "text-muted-foreground"}`}>
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeLeft)}
              </span>
            )}
            <button onClick={toggleFlag} className={flagged.has(current.id) ? "text-warning" : "text-muted-foreground"}>
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
      </div>

      {/* Bottom Nav */}
      <div className="px-6 pb-8 flex items-center gap-3">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex-1 py-3 rounded-xl border text-sm font-medium disabled:opacity-30 flex items-center justify-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowConfirm(true)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Submit
          </motion.button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirm && (
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
                  onClick={() => setShowConfirm(false)}
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
    </div>
  );
}
