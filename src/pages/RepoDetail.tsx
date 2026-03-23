import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Shield,
  ExternalLink,
  Loader2,
  Brain,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRepoDetail, useFindings } from "@/hooks/useAartApi";

const gradeColors: Record<string, string> = {
  "A+": "text-success", A: "text-success", "A-": "text-success",
  "B+": "text-primary", B: "text-primary", "B-": "text-primary",
  C: "text-destructive", "C+": "text-primary", "C-": "text-destructive",
  D: "text-destructive", F: "text-destructive",
};

const tierColors: Record<string, string> = {
  simple: "bg-success/10 text-success border-success/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  complex: "bg-destructive/10 text-destructive border-destructive/20",
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const RepoDetail = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();

  const { data: repo, isLoading: loadingRepo } = useRepoDetail(repoId);
  const { data: findingsData, isLoading: loadingFindings } = useFindings({ repo_id: repoId });

  const findings = findingsData || [];
  const loading = loadingRepo || loadingFindings;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="bg-card border-border max-w-md w-full text-center">
          <CardContent className="p-10">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-3">
              Repo Not Found
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              The repository you're looking for doesn't exist or hasn't been connected.
            </p>
            <Button
              variant="outline"
              className="uppercase tracking-wider text-xs font-semibold rounded-sm"
              onClick={() => navigate("/repos")}
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Repos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fingerprint = [
    { key: "Stack", value: repo.stack || "App" },
    { key: "Auth Type", value: repo.auth_type || "Unknown" },
    { key: "Routes", value: repo.num_routes?.toString() || "N/A" },
    { key: "Models", value: repo.num_models?.toString() || "N/A" },
    { key: "Roles", value: repo.num_roles?.toString() || "N/A" },
    { key: "Tier", value: repo.tier ? repo.tier.charAt(0).toUpperCase() + repo.tier.slice(1) : "Simple" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6 pb-24">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground -ml-2"
        onClick={() => navigate("/repos")}
      >
        <ArrowLeft className="mr-1 w-4 h-4" /> Repos
      </Button>

      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 border border-white/10 bg-black/60 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <span className={`font-heading text-3xl font-bold italic ${gradeColors[repo.grade] || "text-white"}`}>
                {repo.grade || "N/A"}
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Neural Asset Profile</span>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-white uppercase italic">{repo.name}</h1>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{repo.owner}/{repo.name}</span>
                <span className="w-1 h-1 bg-white/10 rounded-full" />
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest border border-white/5 bg-white/[0.02] px-2 py-0.5">{repo.stack}</span>
                <span className={`font-mono text-[9px] uppercase tracking-[0.3em] font-bold ${repo.tier === "complex" ? "text-red-500" : "text-primary"}`}>{repo.tier} asset class</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {repo.scanning ? (
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-primary animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing Exploit Vectors…
              </div>
            ) : (
              <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
                LAST SYNC: {repo.lastScanned ? new Date(repo.lastScanned).toLocaleString() : "Live"}
              </span>
            )}
            <Button className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all" disabled={repo.scanning}>
              <Play className="mr-3 w-4 h-4 fill-current" /> Initialize Assessment
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex gap-4 flex-wrap">
        <Link to={`/threat-memory/${repo.id}`}>
          <Button variant="outline" className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all">
            <Brain className="mr-2 w-4 h-4" /> Threat Memory Matrix
          </Button>
        </Link>
        <Link to={`/repos/${repo.id}/scans`}>
          <Button variant="outline" className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all">
            <Clock className="mr-2 w-4 h-4" /> Intelligence History
          </Button>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-2 space-y-6">
          {/* Findings */}
          <motion.div variants={fadeUp}>
            <Card className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-none relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <CardHeader className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                  Confirmed Attack Vectors ({findings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {repo.scanning && findings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-20 text-white/30">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Executing autonomous exploits…</span>
                  </div>
                ) : findings.length === 0 ? (
                  <div className="text-center py-20">
                    <Shield className="w-10 h-10 text-primary mx-auto mb-4 opacity-20" />
                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em]">Asset Perimeter Secured</p>
                  </div>
                ) : (
                  findings.map((finding, i) => (
                    <div key={finding.id}>
                      <div className="flex items-start gap-6 px-8 py-8 hover:bg-white/[0.03] transition-all cursor-pointer group/item border-b border-white/5">
                        <div className={`mt-1 h-3 w-1 shrink-0 ${finding.status === "confirmed" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_10px_rgba(125,131,250,0.5)]"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">{finding.id}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold italic">{finding.category}</span>
                          </div>
                          <p className="text-base font-medium text-white/90 leading-relaxed mb-4">{finding.summary}</p>
                          <code className="text-[10px] text-white/30 bg-black/40 px-3 py-1 font-mono uppercase tracking-tighter border border-white/5">{finding.route}</code>
                        </div>
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all opacity-0 group-hover/item:opacity-100 group-hover/item:border-white/30">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right Column */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          {/* App Fingerprint */}
          <motion.div variants={fadeUp}>
            <Card className="bg-black/40 backdrop-blur-md border border-white/10 rounded-none relative overflow-hidden group">
              <CardHeader className="px-6 py-5 border-b border-white/5">
                <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">
                  Neural Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="font-mono text-[9px] space-y-3 uppercase tracking-widest">
                  {fingerprint.map((item) => (
                    <div key={item.key} className="flex justify-between items-center gap-4">
                      <span className="text-white/20">{item.key}:</span>
                      <span className="text-white/60 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grade History */}
          <motion.div variants={fadeUp}>
            <Card className="bg-black/40 backdrop-blur-md border border-white/10 rounded-none relative overflow-hidden group">
              <CardHeader className="px-6 py-5 border-b border-white/5">
                <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">
                  Trust Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-1">
                  {(repo.gradeHistory || []).slice().reverse().map((entry: any, i: number) => (
                    <button
                      key={i}
                      className="w-full flex items-center justify-between px-4 py-3 border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all text-left group/hist"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-4 ${gradeColors[entry.grade] || "bg-white"} opacity-20 group-hover/hist:opacity-100 transition-opacity`} />
                        <span className={`font-heading text-lg font-bold italic ${gradeColors[entry.grade] || "text-white"}`}>
                          {entry.grade}
                        </span>
                      </div>
                      <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RepoDetail;
