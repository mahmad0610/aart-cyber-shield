import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

const directionMap: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

const ScrollReveal = ({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 80,
}: ScrollRevealProps) => {
  const d = directionMap[direction];
  const initial = {
    opacity: 0,
    x: d.x * distance,
    y: d.y * distance,
    scale: 0.95,
    filter: "blur(8px)",
  };

  return (
    <motion.div
      initial={initial as any}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
