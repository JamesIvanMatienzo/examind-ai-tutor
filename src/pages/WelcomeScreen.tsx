import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center gap-8"
      >
        {/* Illustration */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-secondary" />
          <div className="relative flex items-center gap-3">
            <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity }}>
              <BookOpen className="h-10 w-10 text-primary" />
            </motion.div>
            <motion.div animate={{ y: [4, -4, 4] }} transition={{ duration: 3, repeat: Infinity }}>
              <Brain className="h-12 w-12 text-primary" />
            </motion.div>
            <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}>
              <Sparkles className="h-10 w-10 text-warning" />
            </motion.div>
          </div>
        </div>

        {/* Logo & text */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <img src={logo} alt="ExaMind logo" className="w-12 h-12 rounded-xl object-cover" />
            <h1 className="text-3xl font-bold text-foreground">ExaMind</h1>
          </div>
          <p className="text-muted-foreground">Your personal AI exam tutor</p>
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-3 pb-8"
      >
        <Button className="w-full h-12 text-base font-semibold rounded-xl" onClick={() => navigate("/signup")}>
          Get Started
        </Button>
        <Button variant="outline" className="w-full h-12 text-base font-semibold rounded-xl" onClick={() => navigate("/login")}>
          Log In
        </Button>
      </motion.div>
    </div>
  );
}
