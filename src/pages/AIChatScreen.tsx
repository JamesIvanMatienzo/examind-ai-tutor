import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Mic, Paperclip, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InlineQuizCard from "@/components/InlineQuizCard";

const subjectData: Record<string, { name: string; color: string }> = {
  "1": { name: "Mathematics", color: "#D85A30" },
  "2": { name: "Physics", color: "#1D9E75" },
  "3": { name: "Filipino", color: "#534AB7" },
  "4": { name: "History", color: "#EF9F27" },
};

const modeLabels: Record<string, string> = {
  strategy: "Strategy & Schedule",
  guided: "Guided Learning",
  practice: "Practice Exam",
};

const suggestedPrompts: Record<string, string[]> = {
  strategy: [
    "Build me a study schedule for my exam",
    "What topics should I prioritize?",
    "How should I divide my remaining days?",
  ],
  guided: [
    "What should I focus on first?",
    "Explain Chapter 3 in simple terms",
    "Give me 5 practice questions",
    "Summarize the key formulas",
  ],
  practice: [
    "Generate a 20-item practice exam",
    "Quiz me on high-probability topics",
    "Give me multiple choice questions on Chapter 2",
  ],
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// Simulated AI responses for demo
const demoResponses: Record<string, Message[]> = {
  "What should I focus on first?": [
    {
      id: "a1",
      role: "assistant",
      content:
        "Based on your uploaded materials, I recommend starting with **Chapter 3: Derivatives** — it's a foundational topic that appears in 3 of your 4 uploaded files, and your professor tends to weight it heavily.\n\nHere's why:\n- It's prerequisite for integration (Ch. 5)\n- It appeared in your last midterm\n- Multiple question types were used (MCQ + problem solving)\n\nLet me check your understanding with a quick question:",
    },
    {
      id: "a2",
      role: "assistant",
      content: "",
      quiz: {
        question: "What is the derivative of f(x) = 3x² + 2x?",
        options: ["6x + 2", "3x + 2", "6x² + 2", "6x"],
        correctIndex: 0,
        explanation: "Using the power rule: d/dx(3x²) = 6x and d/dx(2x) = 2, so f'(x) = 6x + 2.",
      },
    },
  ],
  "Explain Chapter 3 in simple terms": [
    {
      id: "b1",
      role: "assistant",
      content:
        '**Chapter 3: Derivatives — The Simple Version** 📝\n\nThink of a derivative as the **rate of change** — how fast something is changing at any given moment.\n\n**Real-life analogy:** If you\'re driving and your speedometer reads 60 km/h, that\'s the derivative of your position. It tells you how quickly your position is changing *right now*.\n\n**The key rules you need:**\n\n1. **Power Rule:** Bring the exponent down, reduce it by 1\n   - x³ → 3x²\n\n2. **Sum Rule:** Take derivatives of each part separately\n   - (x² + 3x) → (2x + 3)\n\n3. **Chain Rule:** For nested functions, work from outside in\n   - (2x+1)³ → 3(2x+1)² · 2\n\nWant me to go deeper into any of these rules? Or try a quick practice question?',
    },
  ],
  "Build me a study schedule for my exam": [
    {
      id: "c1",
      role: "assistant",
      content:
        "📅 **Your 2-Day Study Plan for Mathematics**\n\nSince your exam is in **2 days**, here's a compressed but effective schedule:\n\n---\n\n**Day 1 (Today) — Foundations & Weak Areas**\n- 🔴 **Morning (2 hrs):** Chapter 3 — Derivatives (high priority, frequently tested)\n- 🟡 **Afternoon (1.5 hrs):** Chapter 4 — Applications of Derivatives\n- 📝 **Evening (1 hr):** Practice 15 MCQs on Ch. 3–4\n\n---\n\n**Day 2 (Tomorrow) — Review & Simulate**\n- 🟡 **Morning (1.5 hrs):** Chapter 5 — Integration basics\n- 🟢 **Afternoon (1 hr):** Review all formulas & notes\n- 🔴 **Evening (2 hrs):** Full practice exam (50 items, timed)\n\n---\n\n💡 **Tip:** Your professor favors problem-solving questions (60% of past exams). Focus on *applying* formulas, not just memorizing them.\n\nWant me to save this to your Schedule?",
    },
  ],
};

const defaultResponse: Message = {
  id: "default",
  role: "assistant",
  content:
    "That's a great question! Let me analyze your uploaded materials to give you the best answer.\n\nBased on your files, I can see several key topics that your professor has emphasized. Would you like me to:\n\n1. Break down the topic step by step\n2. Generate practice questions\n3. Show you which topics are most likely to appear\n\nJust let me know how you'd like to proceed! 📚",
};

export default function AIChatScreen() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "guided";
  const subject = subjectData[id || "1"] || subjectData["1"];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your **${subject.name}** tutor in **${modeLabels[mode]}** mode. 👋\n\nI've analyzed all the files in your folder and I'm ready to help. What would you like to work on?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowPrompts(false);
    setIsTyping(true);

    const responses = demoResponses[text] || [{ ...defaultResponse, id: Date.now().toString() + "_r" }];

    // Simulate typing delay
    let delay = 800;
    responses.forEach((resp, i) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { ...resp, id: Date.now().toString() + i }]);
        if (i === responses.length - 1) setIsTyping(false);
      }, delay);
      delay += 600;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  const prompts = suggestedPrompts[mode] || suggestedPrompts.guided;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="shrink-0 px-4 pt-10 pb-3 border-b bg-card flex items-center gap-3">
        <button onClick={() => navigate(`/subjects/${id}`)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: subject.color }}>
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{subject.name} Tutor</p>
          <p className="text-[11px] text-muted-foreground">{modeLabels[mode]}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="text-primary-foreground text-xs font-bold">E</span>
                  </div>
                  <div>
                    {msg.content && (
                      <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                        {renderMarkdownLite(msg.content)}
                      </div>
                    )}
                    {msg.quiz && (
                      <InlineQuizCard quiz={msg.quiz} onComplete={() => {}} />
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              )}
              {msg.role === "user" && (
                <div className="max-w-[75%]">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 text-sm">
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 text-right mr-1">
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xs font-bold">E</span>
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-muted-foreground/40"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggested Prompts */}
      {showPrompts && (
        <div className="shrink-0 px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="shrink-0 text-xs font-medium px-3 py-2 rounded-full bg-secondary text-secondary-foreground border hover:bg-accent transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="shrink-0 px-4 pb-6 pt-2 border-t bg-card">
        <div className="flex items-center gap-2">
          <button type="button" className="text-muted-foreground shrink-0">
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI tutor..."
              className="w-full h-11 px-4 rounded-full bg-surface border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            />
          </div>
          <button type="button" className="text-muted-foreground shrink-0">
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send className="h-4 w-4 text-primary-foreground" />
          </button>
        </div>
      </form>
    </div>
  );
}

/** Minimal markdown: bold and line breaks */
function renderMarkdownLite(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
