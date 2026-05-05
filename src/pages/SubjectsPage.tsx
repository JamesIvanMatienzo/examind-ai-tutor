import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import PageTransition, { staggerContainer, staggerItem } from "@/components/PageTransition";
import { useSubjects, daysUntil } from "@/hooks/useSubjects";
import { Skeleton } from "@/components/ui/skeleton";

function getCountdownColor(days: number) {
  if (days <= 3) return "bg-destructive text-destructive-foreground";
  if (days <= 7) return "bg-warning text-warning-foreground";
  return "bg-success text-success-foreground";
}

export default function SubjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: subjects = [], isLoading } = useSubjects();

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
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

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="px-6 py-4 space-y-3"
        >
          {isLoading ? (
            <>
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </>
          ) : filtered.length === 0 ? (
            <motion.div
              variants={staggerItem}
              className="text-center py-10 text-sm text-muted-foreground"
            >
              {search ? "No subjects match your search." : "No subjects yet. Tap the button below to add one."}
            </motion.div>
          ) : (
            filtered.map((s) => {
              const days = daysUntil(s.exam_date);
              return (
                <motion.button
                  key={s.id}
                  variants={staggerItem}
                  onClick={() => navigate(`/subjects/${s.id}`)}
                  className="w-full bg-card border rounded-xl p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "20" }}>
                    <span className="text-lg font-bold" style={{ color: s.color }}>{s.name[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.code ?? "No course code"}</p>
                  </div>
                  {days !== null && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${getCountdownColor(days)}`}>
                      {days}d
                    </span>
                  )}
                </motion.button>
              );
            })
          )}

          <motion.button
            variants={staggerItem}
            onClick={() => navigate("/subjects/add")}
            className="w-full border border-dashed rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground active:scale-[0.97] transition-transform"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add New Subject</span>
          </motion.button>
        </motion.div>

        <BottomNav />
      </div>
    </PageTransition>
  );
}
