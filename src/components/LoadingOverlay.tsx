import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingOverlay({
  open,
  title = "Generating…",
  subtitle = "Building your practice exam with AI",
}: {
  open: boolean;
  title?: string;
  subtitle?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-sm bg-card border rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            <div className="mt-5 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ x: ["-40%", "140%"] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "40%" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

