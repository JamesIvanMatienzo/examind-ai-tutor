import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Upload, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    icon: FolderOpen,
    title: "Organize by subject",
    description: "Create folders for each subject. Keep your exams, notes, and modules neatly organized in one place.",
  },
  {
    icon: Upload,
    title: "Upload your materials, AI does the rest",
    description: "Upload past exams, quizzes, and notes. ExaMind's AI analyzes patterns and identifies key topics.",
  },
  {
    icon: MessageSquare,
    title: "Study smarter with your personal AI tutor",
    description: "Chat with an AI that knows your materials. Get guided learning, practice exams, and smart study schedules.",
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 py-8">
      <div className="flex justify-end">
        <button onClick={() => navigate("/home")} className="text-sm text-muted-foreground font-medium">
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center gap-6"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
              {(() => {
                const Icon = slides[current].icon;
                return <Icon className="h-12 w-12 text-primary" />;
              })()}
            </div>
            <h2 className="text-xl font-bold">{slides[current].title}</h2>
            <p className="text-muted-foreground text-sm max-w-xs">{slides[current].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-primary" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      <Button
        className="w-full h-12 rounded-xl text-base font-semibold"
        onClick={() => {
          if (current < slides.length - 1) setCurrent(current + 1);
          else navigate("/home");
        }}
      >
        {current < slides.length - 1 ? "Next" : "Get Started"}
      </Button>
    </div>
  );
}
