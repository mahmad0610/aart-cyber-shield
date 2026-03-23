import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, Terminal, ChevronDown } from "lucide-react";
import { useScanStatus } from "@/hooks/useAartApi";
import { Progress } from "@/components/ui/progress";

/* ─── pipeline steps shown in the terminal feed ─── */
const PIPELINE_STEPS = [
  { key: "loading_files",      label: "Loading source files…" },
  { key: "route_extraction",   label: "Extracting API routes & models…" },
  { key: "complexity_analysis", label: "Classifying complexity tier…" },
  { key: "heuristic_scan",     label: "Running heuristic vulnerability scanner…" },
  { key: "symbolic_analysis",  label: "Symbolic constraint analysis…" },
  { key: "llm_reasoning",      label: "LLM reasoning & triage…" },
  { key: "sandbox_exploit",    label: "Executing exploit in sandbox…" },
  { key: "evidence_capture",   label: "Capturing evidence package…" },
  { key: "graph_building",     label: "Building exploit path graph…" },
  { key: "patch_generation",   label: "Generating & validating fix…" },
  { key: "complete",           label: "Scan complete." },
];

const Scanning = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get("scan_id") || undefined;
  const repoName = searchParams.get("repo") || "repository";

  const { data: scan } = useScanStatus(scanId);
  const termRef = useRef<HTMLDivElement>(null);

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStepKey, setCurrentStepKey] = useState<string>("loading_files");
  const [showExplainer, setShowExplainer] = useState(false);

  // Drive the terminal feed from scan progress
  useEffect(() => {
    if (!scan) return;

    const step = scan.current_step || "loading_files";
    setCurrentStepKey(step);

    // Mark everything before the current step as completed
    const idx = PIPELINE_STEPS.findIndex((s) => s.key === step);
    if (idx >= 0) {
      setCompletedSteps(PIPELINE_STEPS.slice(0, idx).map((s) => s.key));
    }

    // If the scan finished, redirect after a brief delay
    if (scan.status === "complete" || scan.status === "complete_no_findings") {
      setCompletedSteps(PIPELINE_STEPS.map((s) => s.key));
      setTimeout(() => {
        navigate(`/onboarding/findings?scan_id=${scanId}&repo=${encodeURIComponent(repoName)}`);
      }, 1800);
    }
  }, [scan, scanId, repoName, navigate]);

  // Auto-scroll terminal
  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: "smooth" });
  }, [completedSteps, currentStepKey]);

  const progress = scan?.progress_percent ?? 0;
  const tier = scan?.tier || "detecting…";
  const isFailed = scan?.status === "error" || scan?.status === "timeout";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 max-w-2xl"
      >
        <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Scanning <span className="text-primary">{repoName}</span>
        </h1>
        <p className="text-white/50 font-mono text-sm">
          Tier: <span className="text-white/80 uppercase">{tier}</span>
          {scan?.status === "running" && (
            <span className="ml-4">ETA: ~{Math.max(1, Math.ceil((100 - progress) / 10))} min</span>
          )}
        </p>
      </motion.div>

      {/* ─── Terminal Feed ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-3xl rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden"
      >
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-mono text-[11px] text-white/50 uppercase tracking-wider">aart — pipeline</span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>

        {/* Terminal body */}
        <div ref={termRef} className="p-4 max-h-[380px] overflow-y-auto custom-scrollbar space-y-1.5">
          <AnimatePresence>
            {PIPELINE_STEPS.map((step) => {
              const isCompleted = completedSteps.includes(step.key);
              const isCurrent = step.key === currentStepKey && !isCompleted;
              const isSandbox = step.key === "sandbox_exploit";
              const visible = isCompleted || isCurrent;

              if (!visible) return null;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2.5 font-mono text-[13px]"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : isSandbox && isCurrent ? (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    </motion.div>
                  ) : (
                    <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                  )}
                  <span className={isCompleted ? "text-white/40 line-through" : isSandbox && isCurrent ? "text-amber-300" : "text-white/80"}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Blinking cursor */}
          {!isFailed && scan?.status !== "complete" && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-primary ml-6 mt-1"
            />
          )}

          {/* Error state */}
          {isFailed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 border border-red-500/30 rounded-lg bg-red-500/5">
              <p className="font-mono text-sm text-red-400">
                ⚠ Scan {scan?.status === "timeout" ? "timed out" : "encountered an error"}
                {scan?.error_message && `: ${scan.error_message}`}
              </p>
              <p className="font-mono text-xs text-white/40 mt-1">Auto-retrying in 30 seconds…</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ─── Progress Bar ─── */}
      <div className="w-full max-w-3xl mt-6">
        <Progress value={progress} className="h-1.5 bg-white/5" />
        <p className="font-mono text-[11px] text-white/40 mt-2 text-right">{progress}% complete</p>
      </div>

      {/* ─── Explainer Accordion ─── */}
      <div className="w-full max-w-3xl mt-8">
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="flex items-center gap-2 font-mono text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExplainer ? "rotate-180" : ""}`} />
          What are we doing?
        </button>
        <AnimatePresence>
          {showExplainer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 p-4 border border-white/5 rounded-xl bg-white/[0.02]"
            >
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                AART is reading every route, model, and auth pattern from your codebase.
                Next, it constructs attack scenarios and runs them inside a sandboxed copy
                of your app — using real HTTP requests to real database instances. If an
                exploit succeeds, the proof is captured as court-grade evidence. Finally, a
                verified fix patch is generated and tested against the same sandbox so you
                know it works before you merge.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Navigate-away toast hint ─── */}
      <p className="font-mono text-[10px] text-white/20 mt-10">
        You can leave this page — the scan continues server-side. We'll notify you when it's done.
      </p>
    </div>
  );
};

export default Scanning;
