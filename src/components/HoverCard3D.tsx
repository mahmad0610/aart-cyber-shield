import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverCard3DProps {
  children: React.ReactNode;
  className?: string;
  tiltStrength?: number;
}

const HoverCard3D = ({ children, className, tiltStrength = 20 }: HoverCard3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    setRotateX((0.5 - y) * tiltStrength);
    setRotateY((x - 0.5) * tiltStrength);
    setGlowX(x * 100);
    setGlowY(y * 100);
  };

  const reset = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className={cn("relative group", className)}
    >
      {/* Multi-layer glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, hsl(237, 93%, 73%, 0.15), transparent 50%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, hsl(270, 97%, 71%, 0.08), transparent 60%)`,
        }}
      />
      {/* Border glow that follows cursor */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10"
        style={{
          boxShadow: `inset 0 0 30px rgba(125,131,250,${0.05 + (Math.abs(rotateX) + Math.abs(rotateY)) * 0.003})`,
        }}
      />
      {children}
    </motion.div>
  );
};

export default HoverCard3D;
