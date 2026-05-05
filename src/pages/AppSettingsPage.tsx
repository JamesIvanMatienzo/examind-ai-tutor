import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Bell, BellOff, Trash2, HardDrive, BookOpen, Trophy, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/useSubjects";

export default function AppSettingsPage() {
  const navigate = useNavigate();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    examAlerts: true,
    quizResults: false,
    weeklyReport: true,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleNotif = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const getLocalStorageSizeBytes = (key: string) => {
    try {
      const v = localStorage.getItem(key);
      if (!v) return 0;
      return new Blob([v]).size;
    } catch {
      return 0;
    }
  };

  const bytesToMB = (b: number) => Math.round((b / (1024 * 1024)) * 10) / 10;

  const scoreKey = "examind-score-tracker";
  const savedExamsKey = "examind-saved-exams";
  const practiceHistoryKey = "examind-practice-history";
  const notesKey = "examind-notes";

  const scoreBytes = getLocalStorageSizeBytes(scoreKey);
  const savedExamsBytes = getLocalStorageSizeBytes(savedExamsKey);
  const historyBytes = getLocalStorageSizeBytes(practiceHistoryKey);
  const notesBytes = getLocalStorageSizeBytes(notesKey);

  const cacheBytes =
    Object.keys(localStorage)
      .filter((k) => k.startsWith("examind-") && ![scoreKey, savedExamsKey, practiceHistoryKey, notesKey].includes(k))
      .reduce((sum, k) => sum + getLocalStorageSizeBytes(k), 0);

  const storageUsedBytes = scoreBytes + savedExamsBytes + historyBytes + notesBytes + cacheBytes;
  const storageTotalBytes = 5 * 1024 * 1024; // soft cap for UI only (5 MB)

  const handleClearCache = () => {
    const before = cacheBytes + savedExamsBytes + historyBytes;
    try {
      localStorage.removeItem(savedExamsKey);
      localStorage.removeItem(practiceHistoryKey);
      // Clear other non-critical examind-* keys, but keep auth + required state.
      Object.keys(localStorage)
        .filter((k) => k.startsWith("examind-") && !["examind-mock-auth", scoreKey, notesKey].includes(k))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // best effort
    }
    toast({
      title: "Cache cleared",
      description: before > 0 ? `Cleared ~${bytesToMB(before)} MB of cached data.` : "No cache to clear yet.",
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-card border-b">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">App Settings</h1>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Data */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Data
          </h2>
          <div className="bg-card border rounded-xl divide-y">
            {/* Subjects */}
            <button
              onClick={() => navigate("/subjects")}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Subject List</p>
                  <p className="text-[11px] text-muted-foreground">
                    {subjectsLoading ? "Loading…" : subjects.length ? `${subjects.length} subject${subjects.length === 1 ? "" : "s"}` : "No data yet"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">View</span>
            </button>

            {/* Score Tracker */}
            <button
              onClick={() => navigate("/scores")}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Score Tracker</p>
                  <p className="text-[11px] text-muted-foreground">
                    {scoreBytes > 0 ? "Data available" : "No data yet"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Open</span>
            </button>

            {/* Sample / Saved Exams */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Sample Exams</p>
                  <p className="text-[11px] text-muted-foreground">
                    {savedExamsBytes > 0 ? "Saved exams available" : "No data yet"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">—</span>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Appearance
          </h2>
          <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-[11px] text-muted-foreground">Easier on the eyes at night</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Notifications
          </h2>
          <div className="bg-card border rounded-xl divide-y">
            {[
              { key: "studyReminders" as const, label: "Study Reminders", desc: "Daily study session alerts", icon: Bell },
              { key: "examAlerts" as const, label: "Exam Alerts", desc: "Upcoming exam notifications", icon: Bell },
              { key: "quizResults" as const, label: "Quiz Results", desc: "Score updates after practice", icon: BellOff },
              { key: "weeklyReport" as const, label: "Weekly Report", desc: "Performance summary every Sunday", icon: Bell },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={() => toggleNotif(item.key)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Storage */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Storage
          </h2>
          <div className="bg-card border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1.5">
                  <p className="text-sm font-medium">Storage Used</p>
                  <p className="text-xs text-muted-foreground">
                    {bytesToMB(storageUsedBytes)} MB / {bytesToMB(storageTotalBytes)} MB
                  </p>
                </div>
                <Progress value={Math.min(100, (storageUsedBytes / storageTotalBytes) * 100)} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Notes", size: notesBytes > 0 ? `${bytesToMB(notesBytes)} MB` : "No data yet" },
                { label: "Quizzes", size: scoreBytes + historyBytes > 0 ? `${bytesToMB(scoreBytes + historyBytes)} MB` : "No data yet" },
                { label: "Cache", size: cacheBytes + savedExamsBytes > 0 ? `${bytesToMB(cacheBytes + savedExamsBytes)} MB` : "No data yet" },
              ].map((cat) => (
                <div key={cat.label} className="bg-surface rounded-lg py-2">
                  <p className="text-sm font-bold">{cat.size}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.label}</p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleClearCache}
              className="w-full rounded-xl gap-2"
            >
              <Trash2 className="h-4 w-4" /> Clear Cache
            </Button>
          </div>
        </section>

        {/* Danger */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Account
          </h2>
          <Button
            variant="outline"
            className="w-full rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Delete Account
          </Button>
        </section>
      </div>
    </div>
  );
}
