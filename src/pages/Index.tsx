import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useInView, stagger, useAnimate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import ScrollReveal from "@/components/ScrollReveal";
import HoverCard3D from "@/components/HoverCard3D";
import MagneticButton from "@/components/MagneticButton";
import logoIcon from "@/assets/logo-icon.svg";
import Lenis from "lenis";

/* ─── WORD-BY-WORD STAGGER ANIMATION ─── */
const titleContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};
const titleWord = {
  hidden: { opacity: 0, y: 80, rotateX: -60, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ─── TERMINAL TYPEWRITER LINES ─── */
const terminalLines = [
  { prefix: "sys:", text: "Initializing AART Neural Core...", status: "[OK]", statusColor: "text-secondary" },
  { prefix: "sys:", text: "Connecting to target: api.financecore.io...", status: "[OK]", statusColor: "text-secondary" },
  { prefix: "sys:", text: "Bypassing WAF heuristics...", status: "[OK]", statusColor: "text-secondary" },
  { prefix: "sys:", text: "Mapping 412 endpoints & GraphQL mutations...", status: "Found 412", statusColor: "text-secondary" },
  { prefix: ">", text: "Executing probabilistic fuzzer...", status: "", statusColor: "" },
  { prefix: ">", text: "[ALERT] BOLA vulnerability on /api/v2/users/:id/wallet", status: "", statusColor: "", highlight: true },
  { prefix: ">", text: "Extracting proof of concept...", status: "", statusColor: "" },
];

/* ─── TYPEWRITER LINE COMPONENT ─── */
const TypewriterLine = ({ line, index }: { line: typeof terminalLines[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay: index * 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-2 ${line.highlight ? "text-secondary bg-secondary/10 inline-block px-2" : ""}`}
    >
      <span className="text-white/30">{line.prefix}</span>{" "}
      {line.text}
      {line.status && <span className={`${line.statusColor} ml-2`}>{line.status}</span>}
    </motion.p>
  );
};

/* ─── BENTO CELL COMPONENT ─── */
const BentoCell = ({
  index,
  code,
  title,
  description,
  phase,
  accentColor = "primary",
  delay = 0,
}: {
  index: string;
  code: string;
  title: string;
  description: string;
  phase: string;
  accentColor?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Counter-parallax for the huge number
  const numberY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const colorMap: Record<string, string> = {
    primary: "border-primary/30 bg-primary/10 text-primary",
    secondary: "border-secondary/30 bg-secondary/10 text-secondary",
    white: "border-white/20 bg-white/5 text-white",
  };

  return (
    <HoverCard3D tiltStrength={12}>
      <ScrollReveal delay={delay}>
        <div ref={ref} className="p-12 md:p-20 relative group overflow-hidden flex flex-col min-h-[500px]">
          {/* Hover glow bg */}
          <div className={`absolute inset-0 bg-${accentColor}/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

          {/* Parallax giant number */}
          <motion.span
            style={{ y: numberY }}
            className="absolute -top-10 -right-10 text-[250px] font-heading font-bold text-white/[0.02] leading-none pointer-events-none group-hover:text-primary/[0.05] transition-colors duration-700 select-none"
          >
            {index}
          </motion.span>

          <div className="flex justify-between items-start mb-auto relative z-10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={`w-12 h-12 border flex items-center justify-center ${colorMap[accentColor]}`}
            >
              <span className="font-mono text-[10px] tracking-widest font-bold">{code}</span>
            </motion.div>
            <span className="text-[10px] font-mono tracking-[0.2em] text-white/30 uppercase">[ {phase} ]</span>
          </div>

          <div className="relative z-10 mt-20">
            <h3 className="font-heading text-4xl font-bold uppercase tracking-tighter text-white mb-6 group-hover:text-primary transition-colors duration-500">
              {title}
            </h3>
            <p className="font-mono text-[11px] leading-loose text-white/50 tracking-[0.15em] max-w-md uppercase group-hover:text-white/70 transition-colors duration-500">
              {description}
            </p>
          </div>
        </div>
      </ScrollReveal>
    </HoverCard3D>
  );
};

/* ─── MAIN INDEX PAGE ─── */
const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => setLoaded(true), []);

  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Hero parallax: fade + scale on scroll
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 0.7], [1, 0.9]);
  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 150]);
  const asciiY = useTransform(heroScrollProgress, [0, 1], [0, -80]); // ASCII parallax

  // CTA section parallax
  const { scrollYProgress: ctaScrollProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const ctaScale = useTransform(ctaScrollProgress, [0, 0.5], [0.85, 1]);
  const ctaGridY = useTransform(ctaScrollProgress, [0, 1], [50, -50]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-black font-sans">
      {!loaded && <PageLoader onComplete={handleLoaded} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col min-h-screen relative"
      >
        <Header />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION — Cinematic Entrance + Parallax Fade            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <main
          ref={heroRef}
          className="flex-grow pt-32 pb-16 flex flex-col relative border-b border-white/15 min-h-screen justify-center overflow-hidden"
        >
          {/* Background Grid with parallax */}
          <motion.div
            style={{ y: heroY }}
            className="absolute inset-0 pointer-events-none grid-overlay opacity-30 mix-blend-screen"
          />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background to-[hsl(237,93%,73%,0.15)]" />

          {/* Parallax ASCII Art */}
          <motion.div
            style={{ y: asciiY }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none overflow-hidden text-primary/80 mix-blend-screen z-0"
          >
            <pre className="font-mono text-[8px] md:text-[12px] leading-none text-center transform scale-150 relative -top-10">
              {`
        :::      :::    ::: ::::::::::: :::::::::  :::::::::  :::::::::: ::::    :::  ::::::::  :::::::::: 
      :+:+:     :+:    :+:     :+:     :+:    :+: :+:    :+: :+:        :+:+:   :+: :+:    :+: :+:         
    +:+ +:+    +:+    +:+     +:+     +:+    +:+ +:+    +:+ +:+        :+:+:+  +:+ +:+        +:+          
   +#+  +:+   +#+    +:+     +#+     +#++:++#:  +#++:++#:  +#++:++#   +#+ +:+ +#+ +#+        +#++:++#      
  +#+#+#+#+#+  +#+    +#+     +#+     +#+    +#+ +#+    +#+ +#+        +#+  +#+#+# +#+        +#+           
       #+#    #+#    #+#     #+#     #+#    #+# #+#    #+# #+#        #+#   #+#+# #+#    #+# #+#            
      ###    ########      ###     ###    ### ###    ### ########## ###    ####  ########  ##########       
`}
            </pre>
          </motion.div>

          {/* Hero Content with scroll-linked fade */}
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 flex flex-col items-center justify-center flex-grow px-6 max-w-[1400px] mx-auto w-full text-center mt-10"
          >
            {/* Badge - Scale+Blur entrance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
              animate={loaded ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-4 py-2 border border-primary/30 bg-primary/10 mb-10 backdrop-blur-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-primary shadow-[0_0_10px_rgba(125,131,250,0.8)]"
              />
              <span className="text-primary font-mono text-[10px] uppercase tracking-[0.3em] font-bold">AART / ENGINE V2.0</span>
            </motion.div>

            {/* Title - Word-by-word stagger */}
            <motion.h1
              variants={titleContainer}
              initial="hidden"
              animate={loaded ? "visible" : "hidden"}
              className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-bold uppercase tracking-tighter leading-[0.85] text-white mix-blend-screen drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-10 overflow-hidden"
              style={{ perspective: 600 }}
            >
              {["Autonomy"].map((word, i) => (
                <motion.span key={i} variants={titleWord} className="inline-block mr-4">
                  {word}
                </motion.span>
              ))}
              <br />
              {["Is", "Evidence."].map((word, i) => (
                <motion.span
                  key={`g-${i}`}
                  variants={titleWord}
                  className="inline-block mr-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={loaded ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs md:text-sm text-white/50 max-w-2xl mx-auto uppercase tracking-[0.2em] leading-loose mb-14 drop-shadow-md"
            >
              The only offensive security engine that validates vulnerabilities through deterministic exploitation. Zero noise. Pure evidence.
            </motion.p>

            {/* CTA Buttons with magnetic effect */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full sm:w-auto"
            >
              <MagneticButton>
                <Button className="hacktron-clip bg-primary hover:bg-white text-black hover:text-black uppercase tracking-[0.2em] text-xs font-bold h-14 px-12 rounded-none transition-colors duration-300 w-full sm:w-auto drop-shadow-[0_0_20px_rgba(125,131,250,0.4)]">
                  Deploy Engine <span className="ml-3 text-lg leading-none">↗</span>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button variant="outline" className="uppercase tracking-[0.2em] text-xs font-bold h-14 px-12 rounded-none border-white/20 text-white hover:bg-white/10 hover:border-white w-full sm:w-auto transition-all duration-300">
                  Read The Docs
                </Button>
              </MagneticButton>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={loaded ? { opacity: 1 } : {}}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"
              />
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.3em]">Scroll</span>
            </motion.div>
          </motion.div>
        </main>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* LOGO MARQUEE STRIP                                            */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="border-b border-white/15 bg-white/[0.02] flex items-center overflow-hidden relative h-20">
            <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />
            <div className="animate-marquee-slow flex items-center gap-20 whitespace-nowrap w-max">
              {[...Array(3)].map((_, rep) => (
                <div key={rep} className="flex items-center gap-20">
                  {["FINANCECORE", "CLOUDSCALE", "MEDSECURE", "NEXUS", "GOVSHIELD", "DATAFORT"].map((name) => (
                    <span key={`${rep}-${name}`} className="font-heading font-bold text-xl md:text-2xl uppercase tracking-tighter text-white/20 hover:text-white/60 transition-colors duration-500">
                      {name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* BRUTALIST BENTO GRID — Scroll Reveals + 3D + Parallax Numbers */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section className="border-b border-white/15 bg-background relative" id="features">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/15 relative z-10">
            <BentoCell
              index="01"
              code="ATK"
              title="Deterministic Attacks"
              description="AART doesn't guess. It launches real, weaponized payloads in a secure enclave to definitively prove exploitability. If it can be broken, we provide the evidence."
              phase="Execution Phase"
              accentColor="primary"
              delay={0}
            />
            <BentoCell
              index="02"
              code="FIX"
              title="Autonomous Patching"
              description="Once a vulnerability is confirmed, our engine writes the fix, generates a PR, and validates the patch against the original exploit. True closed-loop security."
              phase="Auto-Remediation"
              accentColor="secondary"
              delay={0.15}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/15 border-t border-white/15 relative z-10">
            <BentoCell
              index="03"
              code="INT"
              title="Threat Memory Graph"
              description="AART learns the architecture of your specific targets. It retains architectural context across scans, chaining complex logic flaws that stateless scanners miss."
              phase="Neural Mapping"
              accentColor="white"
              delay={0}
            />

            {/* Cell 4 — Terminal with typewriter */}
            <ScrollReveal delay={0.15}>
              <HoverCard3D tiltStrength={8}>
                <div className="p-0 relative group overflow-hidden flex flex-col min-h-[500px] bg-black/60">
                  <div className="border-b border-white/15 px-6 py-4 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.5 }} className="w-3 h-3 bg-white/20 hover:bg-red-500 transition-colors cursor-pointer" />
                      <motion.div whileHover={{ scale: 1.5 }} className="w-3 h-3 bg-white/20 hover:bg-yellow-500 transition-colors cursor-pointer" />
                      <motion.div whileHover={{ scale: 1.5 }} className="w-3 h-3 bg-white/20 hover:bg-green-500 transition-colors cursor-pointer" />
                    </div>
                    <span className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">TERMINAL // AART-OS v2.0</span>
                  </div>
                  <div className="p-8 md:p-12 font-mono text-[11px] leading-relaxed text-primary/80 flex-grow relative tracking-widest">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10 pointer-events-none" />
                    <div className="relative z-0">
                      {terminalLines.map((line, i) => (
                        <TypewriterLine key={i} line={line} index={i} />
                      ))}

                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2, duration: 0.5 }}
                        className="mt-4 text-primary/60 whitespace-pre font-mono text-[10px]"
                      >
                        {`{
  "status": "success",
  "data": {
    "wallet_id": "usr_99281X",
    "balance": "9,420,000.00 USD",
    "owner": "admin@financecore.io"
  }
}`}
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2.5 }}
                        className="mt-8 text-white flex items-center"
                      >
                        <span className="text-primary mr-2">➜</span> Submitting patch PR...
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="ml-2 w-2 h-4 bg-primary inline-block align-middle"
                        />
                      </motion.p>
                    </div>
                  </div>
                </div>
              </HoverCard3D>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* FULL WIDTH CTA — Parallax Scale + Magnetic Button             */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <section
          ref={ctaRef}
          className="border-b border-white/15 bg-primary text-black relative py-32 md:py-48 px-6 overflow-hidden"
        >
          {/* Parallax grid */}
          <motion.div
            style={{ y: ctaGridY }}
            className="absolute inset-0 grid-overlay opacity-10 mix-blend-multiply pointer-events-none"
          />

          <motion.div
            style={{ scale: ctaScale }}
            className="max-w-[1000px] mx-auto text-center relative z-10 flex flex-col items-center"
          >
            <ScrollReveal>
              <h2 className="font-heading text-6xl md:text-8xl lg:text-[7rem] font-bold uppercase tracking-tighter mb-8 text-background">
                Stop Guessing.<br />Start Proving.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-background/80 mb-16 max-w-2xl leading-loose font-bold">
                Join the elite teams moving past theoretical vulnerabilities. Deploy AART today and secure your infrastructure autonomously.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <MagneticButton>
                <Button className="hacktron-clip bg-background hover:bg-white text-primary hover:text-black uppercase tracking-[0.2em] text-xs font-bold h-16 w-full sm:w-[320px] rounded-none transition-colors duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
                  Initialize Engine <span className="ml-3 text-lg leading-none">↗</span>
                </Button>
              </MagneticButton>
            </ScrollReveal>
          </motion.div>
        </section>

        <Footer />
      </motion.div>

      {/* Global marquee keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 25s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Index;
