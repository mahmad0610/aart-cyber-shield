import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  /** If true, applies parallax to a background image style */
  backgroundImage?: string;
}

const ParallaxSection = ({
  children,
  className,
  speed = 0.3,
  backgroundImage,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  if (backgroundImage) {
    return (
      <div ref={ref} className={cn("relative overflow-hidden", className)}>
        <motion.div
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={{
            y,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

export default ParallaxSection;
