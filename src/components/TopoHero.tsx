import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TopoHero = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [_mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.clientX) / 30;
      const y = (window.innerHeight / 2 - e.clientY) / 30;
      setMousePos({ x, y });

      if (canvasRef.current) {
        canvasRef.current.style.transform = `rotateX(${55 + y / 2}deg) rotateZ(${-25 + x / 2}deg)`;
      }

      layersRef.current.forEach((layer, index) => {
        if (!layer) return;
        const depth = (index + 1) * 20;
        const moveX = x * (index + 1) * 0.3;
        const moveY = y * (index + 1) * 0.3;
        layer.style.transform = `translateZ(${depth}px) translate(${moveX}px, ${moveY}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Entrance animation for the 3D canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.opacity = "0";
    canvas.style.transform = "rotateX(90deg) rotateZ(0deg) scale(0.7)";

    const timeout = setTimeout(() => {
      canvas.style.transition = "all 2.5s cubic-bezier(0.16, 1, 0.3, 1)";
      canvas.style.opacity = "1";
      canvas.style.transform = "rotateX(55deg) rotateZ(-25deg) scale(1)";
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* SVG filter for grain */}
      <svg className="absolute w-0 h-0">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* Background grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ filter: "url(#grain)" }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-12 bg-primary" />
              <span className="text-primary text-xs font-heading uppercase tracking-[0.3em] font-semibold">
                Autonomous Red Team
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-tight leading-[0.92] mb-8"
            >
              <span className="text-foreground">No False</span>
              <br />
              <span className="text-foreground">Positives.</span>
              <br />
              <span className="text-gradient-primary">Only Verified</span>
              <br />
              <span className="text-gradient-primary">Breaches.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-muted-foreground text-base md:text-lg max-w-md mb-10 leading-relaxed"
            >
              Deterministic attack engine. AI hybrid reasoning. Autonomous exploitation, verification, and patching — in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="uppercase tracking-wider text-xs font-semibold rounded-sm group relative overflow-hidden"
              >
                <span className="relative z-10">Request Demo</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="uppercase tracking-wider text-xs font-semibold rounded-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate("/dashboard")}
              >
                Enter Platform <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </motion.div>

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
              className="mt-16 flex gap-10"
            >
              {[
                { value: "98%", label: "Less noise" },
                { value: "3x", label: "Faster fixes" },
                { value: "0", label: "False positives" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-muted-foreground text-xs uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: 3D Topographic Canvas */}
          <div className="hidden lg:flex items-center justify-center" style={{ perspective: "800px" }}>
            <div
              ref={canvasRef}
              className="relative w-[420px] h-[420px]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Layer 0: Base grid */}
              <div
                ref={(el) => (layersRef.current[0] = el)}
                className="absolute inset-0 border border-border rounded-sm"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 grid-overlay" />
                <div className="absolute inset-0 bg-card/80" />
                {/* Topo lines */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-0 right-0 border-t border-primary/10"
                    style={{ top: `${(i + 1) * 11}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 1.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>

              {/* Layer 1: Data panel */}
              <div
                ref={(el) => (layersRef.current[1] = el)}
                className="absolute inset-8 border border-primary/20 rounded-sm bg-card/60 backdrop-blur-sm"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute top-4 left-4 right-4">
                  <div className="text-primary/60 font-heading text-[10px] tracking-[0.3em] uppercase">
                    THREAT SURFACE ANALYSIS
                  </div>
                  <div className="h-px bg-primary/10 mt-2" />
                </div>

                {/* Mini bar chart */}
                <div className="absolute bottom-8 left-4 right-4 flex items-end gap-1 h-20">
                  {[65, 45, 80, 35, 90, 55, 70, 40, 85, 60, 75, 50].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-primary/20 rounded-t-sm"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 2 + i * 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  ))}
                </div>

                {/* Scanning indicator */}
                <motion.div
                  className="absolute top-12 left-4 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-success"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-success text-[10px] font-body tracking-wider uppercase">
                    Live scanning
                  </span>
                </motion.div>
              </div>

              {/* Layer 2: Floating badge */}
              <div
                ref={(el) => (layersRef.current[2] = el)}
                className="absolute top-12 right-4 px-3 py-2 bg-primary text-primary-foreground rounded-sm"
                style={{ transformStyle: "preserve-3d" }}
              >
                <span className="font-heading text-xs font-bold tracking-wider">
                  14 CONFIRMED
                </span>
              </div>

              {/* Layer 3: Bottom info */}
              <div
                ref={(el) => (layersRef.current[3] = el)}
                className="absolute bottom-4 left-12 right-12 flex justify-between"
                style={{ transformStyle: "preserve-3d" }}
              >
                <span className="text-muted-foreground text-[10px] tracking-[0.2em] font-heading uppercase">
                  DEPTH: 7 LAYERS
                </span>
                <span className="text-muted-foreground text-[10px] tracking-[0.2em] font-heading uppercase">
                  CONF: 94.2%
                </span>
              </div>
            </div>
          </div>

          {/* Mobile fallback */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="lg:hidden relative"
          >
            <div className="border border-border rounded-sm p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-success"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-success text-[10px] tracking-wider uppercase">Live scanning</span>
              </div>
              <div className="flex items-end gap-1 h-16 mb-4">
                {[65, 45, 80, 35, 90, 55, 70, 40].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-primary/20 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: 1.5 + i * 0.05 }}
                  />
                ))}
              </div>
              <div className="text-primary font-heading text-sm font-bold tracking-wider">14 CONFIRMED EXPLOITS</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <span className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          className="w-px h-8 bg-primary/40"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </motion.div>
    </section>
  );
};

export default TopoHero;
