import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => navigate(session ? "/home" : "/welcome"), 1500);
    return () => clearTimeout(timer);
  }, [navigate, session, loading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-3"
      >
        <img src={logo} alt="ExaMind logo" className="w-32 h-32 rounded-2xl object-cover" />
        <p className="text-muted-foreground text-sm">Study smarter. Not harder. Not blindly.</p>
      </motion.div>

      <div className="absolute bottom-20 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
