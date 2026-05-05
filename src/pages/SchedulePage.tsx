import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageTransition, { staggerContainer, staggerItem } from "@/components/PageTransition";
import { useSubjects } from "@/hooks/useSubjects";

interface ExamEvent {
  id: string;
  subjectName: string;
  date: Date;
  color: string;
}

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

function getCountdownText(date: Date, today: Date) {
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return "Past";
  return `${diff}d left`;
}

function getCountdownColor(date: Date, today: Date) {
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "bg-muted text-muted-foreground";
  if (diff <= 3) return "bg-destructive text-destructive-foreground";
  if (diff <= 7) return "bg-warning text-warning-foreground";
  return "bg-success text-success-foreground";
}

export default function SchedulePage() {
  const navigate = useNavigate();
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const { data: subjects = [] } = useSubjects();

  const exams: ExamEvent[] = useMemo(
    () =>
      subjects
        .filter((s) => !!s.exam_date)
        .map((s) => ({
          id: s.id,
          subjectName: s.name,
          date: new Date(s.exam_date as string),
          color: s.color,
        })),
    [subjects]
  );

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
    return exams.filter((e) => isSameDay(e.date, date));
  };

  const selectedDayExams = exams.filter((e) => isSameDay(e.date, selectedDate));
  const upcomingExams = exams
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface pb-20">
        <div className="bg-card px-6 pt-12 pb-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">Schedule</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Plan your study sessions</p>
          </div>
          <button
            onClick={() => navigate("/schedule/add-exam")}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="px-6 mt-4 space-y-5"
        >
          {/* Calendar */}
          <motion.div variants={staggerItem} className="bg-card border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1 text-muted-foreground"><ChevronLeft className="h-5 w-5" /></button>
              <h3 className="text-sm font-semibold">{MONTHS[currentMonth]} {currentYear}</h3>
              <button onClick={nextMonth} className="p-1 text-muted-foreground"><ChevronRight className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">{d}</div>
              ))}
            </div>

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
                    className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors duration-150 ${
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
          </motion.div>

          {/* Selected Day Exams */}
          {selectedDayExams.length > 0 && (
            <motion.div variants={staggerItem}>
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
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCountdownColor(exam.date, today)}`}>
                      {getCountdownText(exam.date, today)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upcoming Exams */}
          <motion.div variants={staggerItem}>
            <h2 className="text-xs font-semibold text-muted-foreground mb-2">UPCOMING EXAMS</h2>
            {upcomingExams.length === 0 ? (
              <div className="bg-card border border-dashed rounded-xl p-4 text-center text-xs text-muted-foreground">
                No upcoming exams. Add an exam date to a subject to see it here.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="bg-card border rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: exam.color + "20" }}>
                      <BookOpen className="h-4 w-4" style={{ color: exam.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{exam.subjectName}</p>
                      <p className="text-xs text-muted-foreground">{exam.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCountdownColor(exam.date, today)}`}>
                      {getCountdownText(exam.date, today)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* AI Schedule CTA */}
          <motion.button
            variants={staggerItem}
            onClick={() => navigate("/schedule/ai-plan")}
            className="w-full bg-secondary rounded-xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
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
        </motion.div>

        <BottomNav />
      </div>
    </PageTransition>
  );
}
