import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSubject } from "@/hooks/useSubjects";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";

const folderColors = ["#534AB7", "#D85A30", "#1D9E75", "#EF9F27", "#3B82F6", "#EC4899", "#8B5CF6", "#F97316"];

export default function AddSubjectScreen() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(folderColors[0]);
  const [hexInput, setHexInput] = useState(folderColors[0]);
  const [hexTouched, setHexTouched] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [examDate, setExamDate] = useState("");
  const create = useCreateSubject();

  const hexRegex = useMemo(() => /^#([0-9A-F]{3}){1,2}$/i, []);
  const hexValid = hexRegex.test(hexInput.trim());

  useEffect(() => {
    // Keep input in sync when the color is changed via presets or the wheel.
    setHexInput(selectedColor);
    setHexTouched(false);
  }, [selectedColor]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    if (!hexRegex.test(selectedColor)) {
      toast.error("Please select a valid color");
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
          <div className="bg-card border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg border" style={{ backgroundColor: selectedColor }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Selected</p>
                  <p className="text-[11px] text-muted-foreground truncate">{selectedColor}</p>
                </div>
              </div>

              <div className="w-36">
                <Label className="text-[11px] text-muted-foreground">Hex</Label>
                <Input
                  value={hexInput}
                  onChange={(e) => {
                    const next = e.target.value;
                    setHexInput(next);
                    setHexTouched(true);
                    const trimmed = next.trim();
                    if (hexRegex.test(trimmed)) {
                      setSelectedColor(trimmed.toUpperCase());
                    }
                  }}
                  placeholder="#3B82F6"
                  className={`h-10 rounded-xl font-mono ${hexTouched && !hexValid ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  inputMode="text"
                />
                {hexTouched && !hexValid && (
                  <p className="mt-1 text-[11px] text-destructive">Enter a valid hex like #3B82F6</p>
                )}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border bg-background p-3">
              <HexColorPicker color={selectedColor} onChange={(c) => setSelectedColor(c.toUpperCase())} />
            </div>

            <div className="flex gap-3 flex-wrap">
              {folderColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform"
                  style={{ backgroundColor: c, transform: selectedColor === c ? "scale(1.15)" : "scale(1)" }}
                  aria-label={`Select color ${c}`}
                >
                  {selectedColor === c && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
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
