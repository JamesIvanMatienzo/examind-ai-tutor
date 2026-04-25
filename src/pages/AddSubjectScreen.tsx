import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSubject } from "@/hooks/useSubjects";
import { toast } from "sonner";

const folderColors = ["#534AB7", "#D85A30", "#1D9E75", "#EF9F27", "#3B82F6", "#EC4899", "#8B5CF6", "#F97316"];

export default function AddSubjectScreen() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(folderColors[0]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [examDate, setExamDate] = useState("");
  const create = useCreateSubject();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    try {
      await create.mutateAsync({
        name: name.trim(),
        code: code.trim() || null,
        color: selectedColor,
        exam_date: examDate || null,
      });
      toast.success("Subject created");
      navigate("/subjects");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create subject");
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Add Subject</h1>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Subject Name</Label>
          <Input
            placeholder="e.g. Mathematics"
            className="h-12 rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Course Code (optional)</Label>
          <Input
            placeholder="e.g. MATH 101"
            className="h-12 rounded-xl"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Folder Color</Label>
          <div className="flex gap-3 flex-wrap">
            {folderColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform"
                style={{ backgroundColor: c, transform: selectedColor === c ? "scale(1.2)" : "scale(1)" }}
              >
                {selectedColor === c && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Next Exam Date (optional)</Label>
          <Input
            type="date"
            className="h-12 rounded-xl"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>

        <Button
          className="w-full h-12 rounded-xl text-base font-semibold mt-6"
          onClick={handleSubmit}
          disabled={create.isPending}
        >
          {create.isPending ? "Creating..." : "Create Subject"}
        </Button>
      </div>
    </div>
  );
}
