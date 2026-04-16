import BottomNav from "@/components/BottomNav";
import { User, BookOpen, FileText, Zap, Clock } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-card px-6 pt-12 pb-6 flex flex-col items-center border-b">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-3">
          <span className="text-primary-foreground text-2xl font-bold">I</span>
        </div>
        <h1 className="text-xl font-bold">Ivan Dela Cruz</h1>
        <p className="text-sm text-muted-foreground">University of the Philippines · 3rd Year</p>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: BookOpen, label: "Subjects", value: "4" },
            { icon: FileText, label: "Files", value: "30" },
            { icon: Zap, label: "Questions", value: "142" },
            { icon: Clock, label: "Study Hours", value: "18" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <stat.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {["Edit Profile", "App Settings", "Help & Feedback", "Sign Out"].map((item) => (
            <button key={item} className="w-full text-left px-4 py-3.5 text-sm font-medium rounded-xl hover:bg-muted transition-colors">
              {item}
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
