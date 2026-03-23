import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Shield,
  GitPullRequest,
  Calendar,
  Zap,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRepoScans, useRepoDetail, ScanHistoryItem } from "@/hooks/useAartApi";



const tierColors: Record<string, string> = {
  simple: "bg-success/10 text-success border-success/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  complex: "bg-destructive/10 text-destructive border-destructive/20",
};

const triggerIcons: Record<string, typeof Clock> = {
  manual: Zap,
  pr: GitPullRequest,
  scheduled: Calendar,
};

const triggerLabels: Record<string, string> = {
  manual: "Manual",
  pr: "Pull Request",
  scheduled: "Scheduled",
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

function formatDuration(start: string, end: string | null): string {
  if (!end) return "In progress…";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

const ScanHistory = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  
  const { data: repo, isLoading: loadingRepo } = useRepoDetail(repoId);
  const { data: scansData, isLoading: loadingScans } = useRepoScans(repoId);
  
  const scans = scansData || [];

  if (loadingRepo || loadingScans) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2" onClick={() => navigate(`/repos/${repoId}`)}>
        <ArrowLeft className="mr-1 w-4 h-4" /> {repo?.name || "Back"}
      </Button>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Assessment Log</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white uppercase italic">
              Scan <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">History</span>
            </h1>
            <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-[0.2em] leading-relaxed">
              <span className="text-white/60 font-bold tracking-tighter">{repo?.owner}/{repo?.name}</span> · {scans.length} ASSESSMENT CYCLES
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-3">
        {scans.map((scan) => {
          const TriggerIcon = triggerIcons[scan.trigger] || Zap;
          return (
            <motion.div key={scan.id} variants={fadeUp}>
              <Card
                className={`bg-black/60 backdrop-blur-md border border-white/10 rounded-none transition-all duration-300 relative overflow-hidden group ${scan.status === "completed" || scan.status === "clean" ? "hover:border-primary/50 hover:bg-white/[0.03] cursor-pointer" : ""}`}
                onClick={() => {
                  if (scan.status === "completed" || scan.status === "clean") {
                    navigate(`/findings?scan=${scan.id}`);
                  }
                }}
              >
                <div className="absolute inset-y-0 left-0 w-[2px] bg-primary group-hover:block hidden shadow-[0_0_10px_rgba(125,131,250,0.5)]" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    {/* Status indicator */}
                    <div className="shrink-0">
                      {scan.status === "running" && (
                        <div className="relative w-4 h-4">
                          <div className="absolute inset-0 rounded-full bg-primary animate-pulse" />
                          <div className="absolute inset-[-4px] rounded-full border border-primary/20 animate-ping" />
                        </div>
                      )}
                      {scan.status === "completed" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      {scan.status === "clean" && <Shield className="w-4 h-4 text-primary/60" />}
                      {scan.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-white uppercase tracking-tighter">{scan.id}</span>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${scan.tier === "complex" ? "text-red-500/70" : "text-primary/70"}`}>
                          {scan.tier} ASSESSMENT
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[9px] text-white/30 uppercase tracking-[0.15em]">
                          <TriggerIcon className="w-3 h-3" />
                          <span>{triggerLabels[scan.trigger]}</span>
                          {scan.trigger === "pr" && scan.pr_number && (
                            <span className="text-primary/60">#{scan.pr_number}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-[9px] text-white/20 uppercase tracking-widest">
                        <span>{new Date(scan.started_at).toLocaleString().replace(',', ' ·')}</span>
                        <span className="w-1 h-1 bg-white/5 rounded-full" />
                        <span>DURATION: <span className="text-white/40">{formatDuration(scan.started_at, scan.completed_at)}</span></span>
                      </div>
                      {scan.status === "failed" && (
                        <p className="font-mono text-[9px] text-red-500/60 uppercase tracking-widest mt-2 bg-red-500/5 p-2 border border-red-500/10">ERR: Scan failed during execution</p>
                      )}
                    </div>

                    {/* Right: findings or action */}
                    <div className="shrink-0 flex items-center gap-6">
                      {scan.status === "completed" && (
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-[11px] text-red-500 font-bold tabular-nums">{scan.confirmed_findings}</span>
                            <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Confirmed</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-[11px] text-primary font-bold tabular-nums">{scan.advisory_findings}</span>
                            <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Advisory</span>
                          </div>
                        </div>
                      )}
                      {scan.status === "clean" && (
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-[10px] text-primary/60 font-bold uppercase tracking-widest">CLEAN_BASELINE</span>
                          <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">No Vectors Detected</span>
                        </div>
                      )}
                      {scan.status === "running" && (
                        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-primary animate-pulse">
                          <span>Syncing_Data…</span>
                        </div>
                      )}
                      {scan.status === "failed" && (
                        <Button variant="outline" size="sm" className="hacktron-clip bg-red-500/10 border-red-500/20 text-red-500 uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-red-500/20 transition-all" onClick={(e) => { e.stopPropagation(); }}>
                          <RefreshCw className="mr-2 w-3 h-3" /> Retry Assessment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ScanHistory;
