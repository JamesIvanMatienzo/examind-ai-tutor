import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a page with a clean fade-only entrance.
 * No vertical translate — avoids jitter when combined with child animations.
 */
export default function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger helpers for child elements ── */

/** Container variant — apply to a parent that holds stagger children */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

/** Child variant — subtle fade-up with easeOut for a smooth reveal */
export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
  },
};
