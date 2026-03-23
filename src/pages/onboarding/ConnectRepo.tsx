import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ChevronDown, ShieldCheck, Lock, Eye, Server, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConnectRepo } from "@/hooks/useAartApi";
import { Input } from "@/components/ui/input";

const PERMISSIONS = [
  { scope: "repo (read)", icon: Eye, reason: "Read your source code to extract routes, models, and auth patterns." },
  { scope: "metadata (read)", icon: Server, reason: "Read repo metadata to classify complexity tier." },
  { scope: "pull_requests (read)", icon: Github, reason: "Read PR diffs to scan only changed files." },
  { scope: "checks (write)", icon: ShieldCheck, reason: "Post exploit proof and fix suggestions as PR check results." },
];

const TRUST_STATEMENTS = [
  "Read-only. We never write to your repo.",
  "Attacks run in isolated sandboxes, never against your live app.",
  "Evidence packages are encrypted at rest.",
  "You can revoke access at any time.",
];

const ConnectRepo = () => {
  const navigate = useNavigate();
  const connectRepo = useConnectRepo();
  const [showPerms, setShowPerms] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    setError(null);

    // Parse name from URL
    const parts = repoUrl.replace(/\.git$/, "").split("/").filter(Boolean);
    const name = parts[parts.length - 1] || "repo";
    const full_name = parts.length >= 2 ? `${parts[parts.length - 2]}/${name}` : name;

    try {
      const result = await connectRepo.mutateAsync({
        github_url: repoUrl.trim(),
        name,
        full_name,
      });
      // Navigate to scanning screen
      navigate(`/onboarding/scanning?scan_id=${result.scan_id}&repo=${encodeURIComponent(name)}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Connection failed. Please check the URL and try again.");
    }
  }, [repoUrl, connectRepo, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      {/* ─── Main Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
        </div>

        <h1 className="font-mono text-3xl font-bold tracking-tight text-center mb-3">
          Connect a repository to scan
        </h1>
        <p className="font-mono text-sm text-white/50 text-center leading-relaxed mb-8">
          AART reads your code, constructs attack scenarios, and executes them in an
          isolated sandbox. Read-only — nothing is ever written to your repo.
        </p>

        {/* URL Input */}
        <div className="space-y-3 mb-6">
          <Input
            type="url"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="font-mono text-sm h-12 bg-white/[0.03] border-white/10 focus:border-primary/50"
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
          />

          <Button
            onClick={handleConnect}
            disabled={connectRepo.isPending}
            className="w-full font-mono text-sm h-12 gap-2"
          >
            {connectRepo.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Github className="w-4 h-4" />
            )}
            {connectRepo.isPending ? "Connecting…" : "Connect & Scan"}
          </Button>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 rounded-lg border border-red-500/20 bg-red-500/5 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="font-mono text-xs text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permissions explainer */}
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPerms(!showPerms)}
            className="w-full flex items-center justify-between px-4 py-3 font-mono text-[11px] text-white/40 hover:text-white/60 transition-colors"
          >
            <span>What permissions are requested?</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPerms ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showPerms && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {PERMISSIONS.map((p) => (
                    <div key={p.scope} className="flex items-start gap-3">
                      <p.icon className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-mono text-[11px] text-white/60">{p.scope}</p>
                        <p className="font-mono text-[10px] text-white/30">{p.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── Trust bar ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 flex flex-wrap justify-center gap-6"
      >
        {TRUST_STATEMENTS.map((s) => (
          <div key={s} className="flex items-center gap-1.5 font-mono text-[10px] text-white/25">
            <ShieldCheck className="w-3 h-3" />
            <span>{s}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ConnectRepo;
