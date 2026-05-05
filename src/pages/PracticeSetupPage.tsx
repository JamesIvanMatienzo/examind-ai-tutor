import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Target, Layers } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useSubjects } from "@/hooks/useSubjects";

const questionTypes = [
  "Multiple Choice",
  "True or False",
  "Identification",
  "Fill in the Blank",
];

const itemOptions = [10, 20, 30, 50, 100];
const timeLimits = [
  { label: "No limit", value: 0 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
];
const focusOptions = ["All Topics", "Specific Chapter", "High-Probability Only"];

export default function PracticeSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSubject = searchParams.get("subject") || "";
  const { data: subjects = [], isLoading } = useSubjects();

  const [selectedSubject, setSelectedSubject] = useState(preselectedSubject);
  const [items, setItems] = useState(20);
  const [timeLimit, setTimeLimit] = useState(0);
  const [focus, setFocus] = useState("All Topics");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Multiple Choice", "True or False"]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const canGenerate = selectedSubject && selectedTypes.length > 0 && subjects.length > 0;

  const handleGenerate = async () => {
    const params = new URLSearchParams({
      subject: selectedSubject,
      items: items.toString(),
      time: timeLimit.toString(),
      focus,
      types: selectedTypes.join(","),
    });
    setIsGenerating(true);
    // Navigation kicks off the question load in `ActiveQuizPage`.
    navigate(`/practice/quiz?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-surface pb-8">
      <LoadingOverlay open={isGenerating} title="Generating exam…" subtitle="Sending your request to the AI engine" />
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display">Practice Setup</h1>
          <p className="text-xs text-muted-foreground">Configure your exam</p>
        </div>
      </div>

      <div className="px-6 mt-5 space-y-6">
        {/* Subject */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> SUBJECT
          </h2>
          {isLoading ? (
            <div className="bg-card border rounded-xl p-4 text-sm text-muted-foreground">Loading subjects…</div>
          ) : subjects.length === 0 ? (
            <div className="bg-card border border-dashed rounded-xl p-4 text-sm text-muted-foreground">
              No data yet. Add a subject first before generating a practice exam.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`p-3 rounded-xl text-left text-sm font-medium border transition-colors ${
                    selectedSubject === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {s.name}
                  <span className="block text-[10px] mt-0.5 opacity-70">{s.code ?? "No code"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> NUMBER OF ITEMS
          </h2>
          <div className="flex gap-2">
            {itemOptions.map((n) => (
              <button
                key={n}
                onClick={() => setItems(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  items === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> TIME LIMIT
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {timeLimits.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimeLimit(t.value)}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  timeLimit === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Focus */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">FOCUS AREA</h2>
          <div className="flex gap-2 flex-wrap">
            {focusOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFocus(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  focus === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Question Types */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">QUESTION TYPES</h2>
          <div className="flex gap-2 flex-wrap">
            {questionTypes.map((qt) => (
              <button
                key={qt}
                onClick={() => toggleType(qt)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedTypes.includes(qt)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {qt}
              </button>
            ))}
          </div>
        </div>

        {/* Generate */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!canGenerate || isGenerating}
          onClick={handleGenerate}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors ${
            canGenerate && !isGenerating
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Generate Practice Exam
        </motion.button>
      </div>
    </div>
  );
}
