import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  ArrowUpDown,
  GitPullRequest,
  Play,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FindingStatus = "confirmed" | "advisory" | "resolved" | "ignored";
type ImpactType = "Data Exposure" | "Privilege Escalation" | "Brute Force" | "Session Management" | "Misconfiguration" | "Information Disclosure";
type SortOption = "impact" | "date" | "confidence";

interface Finding {
  id: string;
  status: FindingStatus;
  impact: ImpactType;
  summary: string;
  route: string;
  repo: string;
  confidence: number;
  detectedAt: string;
  fixReady: boolean;
}

const allFindings: Finding[] = [
  { id: "F-001", status: "confirmed", impact: "Data Exposure", summary: "User PII exposed via unauthenticated GET /api/users/:id endpoint", route: "GET /api/users/:id", repo: "api-gateway", confidence: 98, detectedAt: "2026-02-28T14:22:00Z", fixReady: true },
  { id: "F-002", status: "confirmed", impact: "Privilege Escalation", summary: "Privilege escalation through role parameter injection on PATCH /api/users", route: "PATCH /api/users", repo: "api-gateway", confidence: 95, detectedAt: "2026-02-28T14:22:00Z", fixReady: true },
  { id: "F-003", status: "confirmed", impact: "Data Exposure", summary: "IDOR on billing endpoint allows access to other tenants' invoices", route: "GET /api/billing/:id", repo: "api-gateway", confidence: 97, detectedAt: "2026-02-27T10:05:00Z", fixReady: false },
  { id: "F-004", status: "advisory", impact: "Brute Force", summary: "Rate limiting absent on /api/auth/login allows brute force", route: "POST /api/auth/login", repo: "api-gateway", confidence: 72, detectedAt: "2026-02-28T14:22:00Z", fixReady: false },
  { id: "F-005", status: "advisory", impact: "Session Management", summary: "JWT tokens do not expire for 30 days, increasing session hijack window", route: "POST /api/auth/token", repo: "api-gateway", confidence: 68, detectedAt: "2026-02-28T14:22:00Z", fixReady: false },
  { id: "F-010", status: "advisory", impact: "Misconfiguration", summary: "Missing CORS origin validation on /api/profile endpoint", route: "GET /api/profile", repo: "user-service", confidence: 60, detectedAt: "2026-02-25T09:10:00Z", fixReady: false },
  { id: "F-011", status: "resolved", impact: "Information Disclosure", summary: "Verbose error messages expose internal stack traces", route: "ALL /api/*", repo: "user-service", confidence: 85, detectedAt: "2026-02-20T11:00:00Z", fixReady: false },
  { id: "F-020", status: "confirmed", impact: "Data Exposure", summary: "API key leaked in query parameters, logged by proxy", route: "ALL /api/*", repo: "billing-api", confidence: 99, detectedAt: "2026-02-27T11:15:00Z", fixReady: true },
  { id: "F-021", status: "confirmed", impact: "Data Exposure", summary: "Mass assignment on invoice creation allows price manipulation", route: "POST /api/invoices", repo: "billing-api", confidence: 94, detectedAt: "2026-02-27T11:15:00Z", fixReady: false },
  { id: "F-022", status: "confirmed", impact: "Privilege Escalation", summary: "Admin endpoints accessible with regular user API key", route: "GET /api/admin/users", repo: "billing-api", confidence: 96, detectedAt: "2026-02-27T11:15:00Z", fixReady: true },
  { id: "F-023", status: "ignored", impact: "Information Disclosure", summary: "No pagination on listing endpoints enables data scraping", route: "GET /api/invoices", repo: "billing-api", confidence: 45, detectedAt: "2026-02-27T11:15:00Z", fixReady: false },
];

const repos = ["all", "api-gateway", "user-service", "billing-api"];

const statusFilters: { key: FindingStatus | "all"; label: string; icon: typeof Shield }[] = [
  { key: "all", label: "All", icon: Shield },
  { key: "confirmed", label: "Confirmed", icon: Shield },
  { key: "advisory", label: "Advisory", icon: AlertTriangle },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
  { key: "ignored", label: "Ignored", icon: EyeOff },
];

const impactOrder: Record<string, number> = {
  "Data Exposure": 0,
  "Privilege Escalation": 1,
  "Brute Force": 2,
  "Session Management": 3,
  "Misconfiguration": 4,
  "Information Disclosure": 5,
};

const statusOrder: Record<string, number> = {
  confirmed: 0,
  advisory: 1,
  resolved: 2,
  ignored: 3,
};

const statusColors: Record<FindingStatus, string> = {
  confirmed: "destructive",
  advisory: "secondary",
  resolved: "outline",
  ignored: "outline",
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.04 } },
};

const Findings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeStatus = (searchParams.get("status") as FindingStatus | "all") || "all";
  const activeSort = (searchParams.get("sort") as SortOption) || "impact";
  const activeRepo = searchParams.get("repo") || "all";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all" && key !== "sort") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = [...allFindings];

    if (activeStatus !== "all") {
      list = list.filter((f) => f.status === activeStatus);
    }
    if (activeRepo !== "all") {
      list = list.filter((f) => f.repo === activeRepo);
    }

    list.sort((a, b) => {
      if (activeSort === "impact") {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return (impactOrder[a.impact] ?? 99) - (impactOrder[b.impact] ?? 99);
      }
      if (activeSort === "date") {
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      }
      return b.confidence - a.confidence;
    });

    return list;
  }, [activeStatus, activeSort, activeRepo]);

  const confirmedCount = allFindings.filter((f) => f.status === "confirmed").length;
  const advisoryCount = allFindings.filter((f) => f.status === "advisory").length;

  const getEmptyMessage = () => {
    if (activeStatus === "confirmed") return { icon: CheckCircle2, title: "No confirmed findings", desc: "Great news — no confirmed exploits across your repos.", color: "text-success" };
    if (activeStatus === "resolved") return { icon: CheckCircle2, title: "No resolved findings", desc: "Nothing has been resolved yet.", color: "text-muted-foreground" };
    if (activeStatus === "ignored") return { icon: EyeOff, title: "No ignored findings", desc: "You haven't ignored any findings.", color: "text-muted-foreground" };
    return { icon: Shield, title: "No findings", desc: "Connect a repo and run a scan to discover security findings.", color: "text-primary" };
  };

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
              Findings
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {allFindings.length} total · <span className="text-destructive font-medium">{confirmedCount} confirmed</span> · <span className="text-foreground">{advisoryCount} advisory</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="bg-card border-border">
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            {/* Status chips */}
            {statusFilters.map((sf) => {
              const isActive = activeStatus === sf.key;
              return (
                <button
                  key={sf.key}
                  onClick={() => setFilter("status", sf.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <sf.icon className="w-3 h-3" />
                  {sf.label}
                </button>
              );
            })}

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Sort */}
            <Select value={activeSort} onValueChange={(v) => setFilter("sort", v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-muted border-0 rounded-sm uppercase tracking-wider">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="impact">By Impact</SelectItem>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="confidence">By Confidence</SelectItem>
              </SelectContent>
            </Select>

            {/* Repo filter */}
            <Select value={activeRepo} onValueChange={(v) => setFilter("repo", v)}>
              <SelectTrigger className="w-[160px] h-8 text-xs bg-muted border-0 rounded-sm uppercase tracking-wider">
                <SelectValue placeholder="All repos" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Repos</SelectItem>
                {repos.filter((r) => r !== "all").map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      {/* Findings List */}
      {filtered.length === 0 ? (
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              {(() => {
                const empty = getEmptyMessage();
                return (
                  <>
                    <empty.icon className={`w-10 h-10 ${empty.color} mx-auto mb-4`} />
                    <h3 className="font-heading text-lg font-bold uppercase tracking-tight mb-2">{empty.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{empty.desc}</p>
                    {activeStatus === "all" && allFindings.length === 0 && (
                      <Button className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                        <Play className="mr-2 w-4 h-4" /> Run a Scan
                      </Button>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {filtered.map((finding, i) => (
                <motion.div key={finding.id} variants={fadeUp}>
                  {i > 0 && <Separator />}
                  <div
                    className="flex items-start gap-3 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/findings/${finding.id}`)}
                  >
                    <Badge
                      variant={statusColors[finding.status] as any}
                      className="rounded-sm text-[10px] uppercase tracking-wider mt-0.5 shrink-0"
                    >
                      {finding.status}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">{finding.impact}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{finding.repo}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-snug">{finding.summary}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">{finding.route}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {finding.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {finding.fixReady && finding.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="uppercase tracking-wider text-[10px] font-semibold rounded-sm h-7"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <GitPullRequest className="mr-1 w-3 h-3" /> Create Fix PR
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Findings;
