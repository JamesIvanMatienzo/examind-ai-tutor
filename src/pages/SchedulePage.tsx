import BottomNav from "@/components/BottomNav";
import { Calendar } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-card px-6 pt-12 pb-4 border-b">
        <h1 className="text-2xl font-bold">Schedule</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <Calendar className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="text-muted-foreground">Smart scheduler coming soon</p>
        <p className="text-xs text-muted-foreground mt-1">AI-generated study schedules will appear here</p>
      </div>
      <BottomNav />
    </div>
  );
}
