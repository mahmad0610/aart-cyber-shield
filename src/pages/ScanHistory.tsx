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
import { Badge } from "@/components/ui/badge";

type ScanStatus = "completed" | "running" | "failed" | "clean";
type ScanTier = "simple" | "medium" | "complex";
type ScanTrigger = "manual" | "pr" | "scheduled";

interface Scan {
  id: string;
  status: ScanStatus;
  tier: ScanTier;
  trigger: ScanTrigger;
  prNumber?: number;
  startedAt: string;
  completedAt: string | null;
  confirmedFindings: number;
  advisoryFindings: number;
  errorMessage?: string;
}

const repoScans: Record<string, { repoName: string; owner: string; scans: Scan[] }> = {
  "repo-1": {
    repoName: "api-gateway",
    owner: "acme-corp",
    scans: [
      { id: "scan-14", status: "completed" as ScanStatus, tier: "complex" as ScanTier, trigger: "manual" as ScanTrigger, startedAt: "2026-03-02T10:00:00Z", completedAt: "2026-03-02T10:15:00Z", confirmedFindings: 2, advisoryFindings: 1 },
      { id: "scan-13", status: "completed" as ScanStatus, tier: "complex" as ScanTier, trigger: "scheduled" as ScanTrigger, startedAt: "2026-02-25T09:00:00Z", completedAt: "2026-02-25T09:18:00Z", confirmedFindings: 0, advisoryFindings: 3 },
      { id: "scan-12", status: "failed" as ScanStatus, tier: "complex" as ScanTier, trigger: "pr" as ScanTrigger, prNumber: 87, startedAt: "2026-02-22T14:30:00Z", completedAt: "2026-02-22T14:31:00Z", confirmedFindings: 0, advisoryFindings: 0, errorMessage: "Sandbox timeout: application failed to start within 120s" },
      { id: "scan-11", status: "completed" as ScanStatus, tier: "medium" as ScanTier, trigger: "pr" as ScanTrigger, prNumber: 84, startedAt: "2026-02-20T11:00:00Z", completedAt: "2026-02-20T11:08:00Z", confirmedFindings: 1, advisoryFindings: 2 },
      { id: "scan-10", status: "completed" as ScanStatus, tier: "complex" as ScanTier, trigger: "manual" as ScanTrigger, startedAt: "2026-02-18T16:00:00Z", completedAt: "2026-02-18T16:22:00Z", confirmedFindings: 3, advisoryFindings: 4 },
      { id: "scan-9", status: "clean" as ScanStatus, tier: "simple" as ScanTier, trigger: "pr" as ScanTrigger, prNumber: 79, startedAt: "2026-02-15T10:00:00Z", completedAt: "2026-02-15T10:03:00Z", confirmedFindings: 0, advisoryFindings: 0 },
      { id: "scan-8", status: "running" as ScanStatus, tier: "complex" as ScanTier, trigger: "manual" as ScanTrigger, startedAt: "2026-03-04T08:30:00Z", completedAt: null, confirmedFindings: 0, advisoryFindings: 0 },
    ].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
  },
};

const tierColors: Record<ScanTier, string> = {
  simple: "bg-success/10 text-success border-success/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  complex: "bg-destructive/10 text-destructive border-destructive/20",
};

const triggerIcons: Record<ScanTrigger, typeof Clock> = {
  manual: Zap,
  pr: GitPullRequest,
  scheduled: Calendar,
};

const triggerLabels: Record<ScanTrigger, string> = {
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
  const data = repoScans[repoId || ""] || repoScans["repo-1"];

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2" onClick={() => navigate(`/repos/${repoId || "repo-1"}`)}>
        <ArrowLeft className="mr-1 w-4 h-4" /> {data.repoName}
      </Button>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Scan History</h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="text-foreground font-medium">{data.owner}/{data.repoName}</span> · {data.scans.length} scans
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-2">
        {data.scans.map((scan) => {
          const TriggerIcon = triggerIcons[scan.trigger];
          return (
            <motion.div key={scan.id} variants={fadeUp}>
              <Card
                className={`bg-card border-border transition-colors ${scan.status === "completed" || scan.status === "clean" ? "hover:border-primary/50 cursor-pointer" : ""}`}
                onClick={() => {
                  if (scan.status === "completed" || scan.status === "clean") {
                    navigate(`/findings?scan=${scan.id}`);
                  }
                }}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Status indicator */}
                    <div className="shrink-0">
                      {scan.status === "running" && (
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary/50 animate-ping" />
                        </div>
                      )}
                      {scan.status === "completed" && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {scan.status === "clean" && <Shield className="w-4 h-4 text-success" />}
                      {scan.status === "failed" && <XCircle className="w-4 h-4 text-destructive" />}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground font-mono">{scan.id}</span>
                        <Badge variant="outline" className={`rounded-sm text-[10px] uppercase tracking-wider ${tierColors[scan.tier]}`}>
                          {scan.tier}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TriggerIcon className="w-3 h-3" />
                          <span>{triggerLabels[scan.trigger]}</span>
                          {scan.trigger === "pr" && scan.prNumber && (
                            <span className="font-mono">#{scan.prNumber}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(scan.startedAt).toLocaleString()}</span>
                        <span>·</span>
                        <span>{formatDuration(scan.startedAt, scan.completedAt)}</span>
                      </div>
                      {scan.status === "failed" && scan.errorMessage && (
                        <p className="text-xs text-destructive font-mono mt-1">{scan.errorMessage}</p>
                      )}
                    </div>

                    {/* Right: findings or action */}
                    <div className="shrink-0 flex items-center gap-3">
                      {scan.status === "completed" && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-destructive" />
                            <span className="font-medium text-foreground">{scan.confirmedFindings}</span>
                            <span className="text-muted-foreground hidden sm:inline">confirmed</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-primary" />
                            <span className="font-medium text-foreground">{scan.advisoryFindings}</span>
                            <span className="text-muted-foreground hidden sm:inline">advisory</span>
                          </span>
                        </div>
                      )}
                      {scan.status === "clean" && (
                        <span className="text-xs text-success font-medium">No findings</span>
                      )}
                      {scan.status === "running" && (
                        <div className="flex items-center gap-1.5 text-xs text-primary">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Running…</span>
                        </div>
                      )}
                      {scan.status === "failed" && (
                        <Button variant="outline" size="sm" className="uppercase tracking-wider text-[10px] font-semibold rounded-sm" onClick={(e) => { e.stopPropagation(); }}>
                          <RefreshCw className="mr-1 w-3 h-3" /> Retry
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
