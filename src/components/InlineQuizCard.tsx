import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface InlineQuizCardProps {
  quiz: QuizQuestion;
  onComplete: (correct: boolean) => void;
}

export default function InlineQuizCard({ quiz, onComplete }: InlineQuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === quiz.correctIndex;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    onComplete(selected === quiz.correctIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-4 my-2 max-w-[300px]"
    >
      <p className="text-xs font-semibold text-primary mb-1">Quick Check</p>
      <p className="text-sm font-medium mb-3">{quiz.question}</p>

      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          let style = "bg-surface border text-foreground";
          if (submitted) {
            if (i === quiz.correctIndex) style = "bg-success/10 border-success text-success";
            else if (i === selected) style = "bg-destructive/10 border-destructive text-destructive";
          } else if (i === selected) {
            style = "bg-secondary border-primary text-primary";
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${style}`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-3 w-full text-sm font-semibold py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
        >
          Check Answer
        </button>
      ) : (
        <div className={`mt-3 flex items-start gap-2 text-xs rounded-lg p-2.5 ${isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {isCorrect ? <Check className="h-4 w-4 shrink-0 mt-0.5" /> : <X className="h-4 w-4 shrink-0 mt-0.5" />}
          <span>{isCorrect ? "Correct! " : "Not quite. "}{quiz.explanation}</span>
        </div>
      )}
    </motion.div>
  );
}
