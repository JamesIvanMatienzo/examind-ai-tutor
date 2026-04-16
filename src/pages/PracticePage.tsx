import BottomNav from "@/components/BottomNav";
import { Zap } from "lucide-react";

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-card px-6 pt-12 pb-4 border-b">
        <h1 className="text-2xl font-bold">Practice</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <Zap className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground">Practice hub coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">Generate practice exams from your subject folders</p>
      </div>
      <BottomNav />
    </div>
  );
}
