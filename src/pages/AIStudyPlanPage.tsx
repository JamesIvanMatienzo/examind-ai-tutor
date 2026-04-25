import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIStudyPlanPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface pb-8">
      <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold font-display">AI Study Plan</h1>
          <p className="text-xs text-muted-foreground">Personalized study schedule</p>
        </div>
      </div>

      <div className="px-6 mt-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-base font-semibold mb-2">No study plan yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Add subjects with exam dates and your study materials, then generate a smart
          plan tailored to your schedule and topic difficulty.
        </p>
        <Button
          onClick={() => navigate("/subjects/add")}
          className="rounded-xl"
        >
          Add a Subject
        </Button>
      </div>
    </div>
  );
}
