import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Sparkles, Clock, BookOpen } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const subjects = [
  { id: "1", name: "Mathematics", color: "#D85A30" },
  { id: "2", name: "Physics", color: "#1D9E75" },
  { id: "3", name: "Filipino", color: "#534AB7" },
  { id: "4", name: "History", color: "#EF9F27" },
];

interface ExamEvent {
  id: string;
  subjectId: string;
  subjectName: string;
  type: string;
  date: Date;
  color: string;
}

interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  duration: string;
  color: string;
  date: Date;
  difficulty: "hard" | "medium" | "easy";
}

// Demo data
const today = new Date();
const demoExams: ExamEvent[] = [
  { id: "e1", subjectId: "1", subjectName: "Mathematics", type: "Midterm", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), color: "#D85A30" },
  { id: "e2", subjectId: "2", subjectName: "Physics", type: "Quiz", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), color: "#1D9E75" },
  { id: "e3", subjectId: "3", subjectName: "Filipino", type: "Finals", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10), color: "#534AB7" },
  { id: "e4", subjectId: "4", subjectName: "History", type: "Midterm", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14), color: "#EF9F27" },
];

const demoStudyTasks: StudyTask[] = [
  { id: "s1", subjectId: "1", subjectName: "Mathematics", topic: "Ch.3 — Derivatives & Chain Rule", duration: "45 min", color: "#D85A30", date: today, difficulty: "hard" },
  { id: "s2", subjectId: "1", subjectName: "Mathematics", topic: "Practice problems — Integration", duration: "30 min", color: "#D85A30", date: today, difficulty: "medium" },
  { id: "s3", subjectId: "2", subjectName: "Physics", topic: "Review Kinematics formulas", duration: "20 min", color: "#1D9E75", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), difficulty: "easy" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getDifficultyColor(d: string) {
  if (d === "hard") return "bg-destructive";
  if (d === "medium") return "bg-warning";
  return "bg-success";
}

function getCountdownText(date: Date) {
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff}d left`;
}

function getCountdownColor(date: Date) {
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 3) return "bg-destructive text-destructive-foreground";
  if (diff <= 7) return "bg-warning text-warning-foreground";
  return "bg-success text-success-foreground";
}

export default function SchedulePage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const getExamsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return demoExams.filter((e) => isSameDay(e.date, date));
  };

  const todayTasks = demoStudyTasks.filter((t) => isSameDay(t.date, today));
  const selectedDayExams = demoExams.filter((e) => isSameDay(e.date, selectedDate));
  const selectedDayTasks = demoStudyTasks.filter((t) => isSameDay(t.date, selectedDate));

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Schedule</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Plan your study sessions</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/schedule/add-exam")}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center"
        >
          <Plus className="h-5 w-5 text-primary-foreground" />
        </motion.button>
      </div>

      <div className="px-6 mt-4 space-y-5">
        {/* Calendar */}
        <div className="bg-card border rounded-2xl p-4">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-muted-foreground"><ChevronLeft className="h-5 w-5" /></button>
            <h3 className="text-sm font-semibold">{MONTHS[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} className="p-1 text-muted-foreground"><ChevronRight className="h-5 w-5" /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const cellDate = new Date(currentYear, currentMonth, day);
              const isToday = isSameDay(cellDate, today);
              const isSelected = isSameDay(cellDate, selectedDate);
              const dayExams = getExamsForDay(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(cellDate)}
                  className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-secondary" : ""
                  }`}
                >
                  <span className={`text-xs font-medium ${isSelected ? "" : isToday ? "text-primary font-bold" : ""}`}>{day}</span>
                  {dayExams.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayExams.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: isSelected ? "white" : e.color }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's Plan */}
        {isSameDay(selectedDate, today) && todayTasks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground mb-2">TODAY'S PLAN</h2>
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div key={task.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: task.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.topic}</p>
                    <p className="text-xs text-muted-foreground">{task.subjectName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${getDifficultyColor(task.difficulty)}`} />
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {task.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Day Events */}
        {selectedDayExams.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground mb-2">
              EXAMS ON {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()].toUpperCase()}
            </h2>
            <div className="space-y-2">
              {selectedDayExams.map((exam) => (
                <div key={exam.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: exam.color + "20" }}>
                    <BookOpen className="h-4 w-4" style={{ color: exam.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{exam.subjectName}</p>
                    <p className="text-xs text-muted-foreground">{exam.type}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCountdownColor(exam.date)}`}>
                    {getCountdownText(exam.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSameDay(selectedDate, today) && selectedDayTasks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground mb-2">STUDY TASKS</h2>
            <div className="space-y-2">
              {selectedDayTasks.map((task) => (
                <div key={task.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full" style={{ backgroundColor: task.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.topic}</p>
                    <p className="text-xs text-muted-foreground">{task.subjectName}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-3 w-3" /> {task.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Exams */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground mb-2">UPCOMING EXAMS</h2>
          <div className="space-y-2">
            {demoExams
              .filter((e) => e.date >= today)
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((exam) => (
                <div key={exam.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: exam.color + "20" }}>
                    <BookOpen className="h-4 w-4" style={{ color: exam.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{exam.subjectName}</p>
                    <p className="text-xs text-muted-foreground">{exam.type} · {exam.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCountdownColor(exam.date)}`}>
                    {getCountdownText(exam.date)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* AI Schedule CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/schedule/ai-plan")}
          className="w-full bg-secondary rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">AI Study Schedule</p>
            <p className="text-xs text-muted-foreground">Generate a smart plan for your upcoming exams</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
