import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Check, ArrowRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  "User opens a Pull Request",
  "AART executes attack scenarios against the changed code",
  "AART posts proof and a verified fix directly in the PR",
];

const GithubAppInstall = () => {
  const navigate = useNavigate();
  const [installed, setInstalled] = useState(false);

  // Simulate detecting install from GitHub callback
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "github_app_installed" && e.newValue === "true") {
        setInstalled(true);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleInstall = () => {
    // In production, this opens the real GitHub App install page
    // For MVP, we simulate the install
    localStorage.setItem("github_app_installed", "true");
    setInstalled(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
            <Github className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="font-mono text-3xl font-bold tracking-tight mb-3">
          Catch vulnerabilities before they merge
        </h1>
        <p className="font-mono text-sm text-white/50 mb-10">
          Install the AART GitHub App so every pull request is automatically scanned.
        </p>

        {/* ─── How it works ─── */}
        <div className="space-y-4 mb-10 text-left">
          {STEPS.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.01]"
            >
              <span className="font-mono text-[10px] text-primary/80 bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="font-mono text-xs text-white/60">{step}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Install state ─── */}
        {!installed ? (
          <div className="space-y-3">
            <Button onClick={handleInstall} className="w-full font-mono text-sm h-12 gap-2">
              <Github className="w-4 h-4" /> Install GitHub App
            </Button>
            <button
              onClick={() => navigate("/dashboard")}
              className="font-mono text-[11px] text-white/30 hover:text-white/50 flex items-center gap-1.5 mx-auto transition-colors"
            >
              <SkipForward className="w-3 h-3" /> Skip for now
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-sm text-emerald-400">GitHub App installed</span>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full font-mono text-sm h-12 gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GithubAppInstall;
