import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";

const subjects = [
  { id: "1", name: "Mathematics", code: "MATH 101", files: 12, daysUntilExam: 2, color: "#D85A30", lastAccessed: "Today" },
  { id: "2", name: "Physics", code: "PHYS 201", files: 8, daysUntilExam: 5, color: "#1D9E75", lastAccessed: "Yesterday" },
  { id: "3", name: "Filipino", code: "FIL 101", files: 6, daysUntilExam: 10, color: "#534AB7", lastAccessed: "2 days ago" },
  { id: "4", name: "History", code: "HIST 101", files: 4, daysUntilExam: 14, color: "#EF9F27", lastAccessed: "3 days ago" },
];

function getCountdownColor(days: number) {
  if (days <= 3) return "bg-destructive text-destructive-foreground";
  if (days <= 7) return "bg-warning text-warning-foreground";
  return "bg-success text-success-foreground";
}

export default function SubjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-card px-6 pt-12 pb-4 border-b">
        <h1 className="text-2xl font-bold mb-4">Subjects</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        {filtered.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(`/subjects/${s.id}`)}
            className="w-full bg-card border rounded-xl p-4 flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "20" }}>
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.code} · {s.files} files · {s.lastAccessed}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${getCountdownColor(s.daysUntilExam)}`}>
              {s.daysUntilExam}d
            </span>
          </button>
        ))}

        <button
          onClick={() => navigate("/subjects/add")}
          className="w-full border border-dashed rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm font-medium">Add New Subject</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
