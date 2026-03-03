import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const PageLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("reveal");
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "reveal" || progress < 100 ? null : null}
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        animate={phase === "reveal" ? { y: "-100%" } : { y: 0 }}
        transition={
          phase === "reveal"
            ? { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
            : { duration: 0 }
        }
      >
        {/* Grid background */}
        <div className="absolute inset-0 grid-overlay opacity-30" />

        {/* Scanning lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-px bg-primary/30"
              initial={{ top: `${i * 25}%`, opacity: 0 }}
              animate={{
                top: ["0%", "100%"],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mb-8">
            <motion.div
              className="w-16 h-16 border-2 border-primary rounded-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 bg-primary rounded-sm"
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.span
            className="font-heading text-2xl font-bold tracking-[0.3em] text-foreground mb-6"
            initial={{ letterSpacing: "0.5em", opacity: 0 }}
            animate={{ letterSpacing: "0.3em", opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            AART
          </motion.span>

          {/* Progress bar */}
          <div className="w-48 h-px bg-border relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-muted-foreground text-xs font-body mt-3 tracking-widest uppercase">
            {Math.min(Math.round(progress), 100)}%
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageLoader;
