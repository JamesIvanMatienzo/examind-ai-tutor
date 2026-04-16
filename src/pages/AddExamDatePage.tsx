import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const subjects = [
  { id: "1", name: "Mathematics", color: "#D85A30" },
  { id: "2", name: "Physics", color: "#1D9E75" },
  { id: "3", name: "Filipino", color: "#534AB7" },
  { id: "4", name: "History", color: "#EF9F27" },
];

const examTypes = ["Quiz", "Midterm", "Finals", "Seatwork", "Project"];

export default function AddExamDatePage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const canSave = selectedSubject && examType && date;

  const handleSave = () => {
    setShowAIPrompt(true);
  };

  const handleConfirm = (generateSchedule: boolean) => {
    if (generateSchedule) {
      navigate("/schedule/ai-plan");
    } else {
      navigate("/schedule");
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display">Add Exam Date</h1>
          <p className="text-xs text-muted-foreground">Set an exam or deadline</p>
        </div>
      </div>

      <div className="px-6 mt-5 space-y-6">
        {/* Subject */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">SUBJECT</h2>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`p-3 rounded-xl text-left text-sm font-medium border transition-colors ${
                  selectedSubject === s.id
                    ? "border-primary bg-secondary text-foreground"
                    : "bg-card border-border text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Type */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">EXAM TYPE</h2>
          <div className="flex gap-2 flex-wrap">
            {examTypes.map((t) => (
              <button
                key={t}
                onClick={() => setExamType(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  examType === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">DATE</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full p-3 rounded-xl border bg-card text-left text-sm flex items-center gap-2",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "MMMM d, yyyy") : "Select exam date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">TIME (OPTIONAL)</h2>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Recurring */}
        <div className="flex items-center justify-between bg-card border rounded-xl p-3">
          <div>
            <p className="text-sm font-medium">Recurring</p>
            <p className="text-xs text-muted-foreground">e.g. quiz every Friday</p>
          </div>
          <button
            onClick={() => setRecurring(!recurring)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center ${
              recurring ? "bg-primary justify-end" : "bg-muted justify-start"
            }`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
          </button>
        </div>

        {/* Notes */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">NOTES (OPTIONAL)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any extra details..."
            rows={3}
            className="w-full p-3 rounded-xl border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Save */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!canSave}
          onClick={handleSave}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors ${
            canSave ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Save Exam Date
        </motion.button>
      </div>

      {/* AI Prompt Dialog */}
      {showAIPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold mb-2">Exam Saved! 🎉</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Would you like me to generate a study schedule for this exam?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
              >
                Not now
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                Generate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
