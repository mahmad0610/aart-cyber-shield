import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ExternalLink, ArrowRight, Eye, GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFindings } from "@/hooks/useAartApi";

const impactIcon: Record<string, string> = {
  data_exposure: "🔓",
  privilege_escalation: "⚡",
  admin_boundary: "🛡️",
};

const statusColor: Record<string, string> = {
  confirmed: "text-red-400 border-red-500/30 bg-red-500/10",
  advisory: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

const FirstFindings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get("scan_id") || undefined;
  const repoName = searchParams.get("repo") || "your repo";

  // Fetch findings sorted by impact (max 3 for onboarding)
  const { data: findings, isLoading } = useFindings({});

  const topFindings = (findings || []).slice(0, 3);
  const totalCount = findings?.length || 0;
  const confirmedCount = findings?.filter((f: any) => f.status === "confirmed").length || 0;

  // If no findings came back, redirect to clean screen
  useEffect(() => {
    if (!isLoading && findings && findings.length === 0) {
      navigate(`/onboarding/clean?repo=${encodeURIComponent(repoName)}`);
    }
  }, [isLoading, findings, navigate, repoName]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-16">
      {/* ─── Impact header ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mb-12"
      >
        <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <span className="text-red-400">{confirmedCount}</span> confirmed{" "}
          {confirmedCount === 1 ? "issue" : "issues"} found in{" "}
          <span className="text-primary">{repoName}</span>
        </h1>
        <p className="text-white/50 font-mono text-sm leading-relaxed">
          These are not theoretical warnings. AART executed real attacks in an isolated
          sandbox and retrieved proof. Each finding below includes the exact request,
          response, and data that was exposed.
        </p>
      </motion.div>

      {/* ─── Finding Cards ─── */}
      <div className="w-full max-w-3xl space-y-4 mb-12">
        {topFindings.map((f: any, i: number) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i }}
            className="border border-white/10 rounded-xl p-5 bg-white/[0.02] backdrop-blur-xl hover:border-white/20 transition-colors group"
          >
            <div className="flex items-start gap-4">
              {/* Status badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-widest border ${statusColor[f.status] || "text-white/40 border-white/10"}`}
              >
                {f.status}
              </span>
              <div className="flex-1 min-w-0">
                {/* Impact type */}
                <p className="font-mono text-[11px] text-white/40 uppercase tracking-wider mb-1">
                  {impactIcon[f.impact_type] || "🔍"} {(f.impact_type || "unknown").replace(/_/g, " ")}
                </p>
                {/* Summary */}
                <p className="font-mono text-sm text-white/90 leading-relaxed">
                  {f.summary}
                </p>
                {/* Route */}
                <p className="font-mono text-xs text-white/30 mt-1.5">{f.route}</p>
                <div className="flex items-center gap-3 mt-3 font-mono text-[11px] text-white/30">
                  <span>Confidence: <span className="text-white/60">{(f.confidence * 100).toFixed(0)}%</span></span>
                  {f.runtime_validated && <span className="text-emerald-400">✓ sandbox ran</span>}
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-mono text-[10px] h-7"
                  onClick={() => navigate(`/findings/${f.id}`)}
                >
                  <Eye className="w-3 h-3 mr-1" /> View Proof
                </Button>
                {f.status === "confirmed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-mono text-[10px] h-7 text-emerald-400 hover:text-emerald-300"
                    onClick={() => navigate(`/findings/${f.id}?tab=patch`)}
                  >
                    <GitPullRequest className="w-3 h-3 mr-1" /> Create Fix PR
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── See all link ─── */}
      {totalCount > 3 && (
        <button
          onClick={() => navigate("/findings")}
          className="font-mono text-xs text-white/40 hover:text-white/70 flex items-center gap-1 mb-12 transition-colors"
        >
          See all {totalCount} findings <ExternalLink className="w-3 h-3" />
        </button>
      )}

      {/* ─── CTAs ─── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => navigate("/onboarding/github-app")}
          className="font-mono text-xs gap-2 h-11 px-6"
        >
          <Shield className="w-4 h-4" /> Set up PR Protection
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="font-mono text-xs gap-2 h-11 px-6 border-white/10 text-white/60 hover:text-white"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FirstFindings;
