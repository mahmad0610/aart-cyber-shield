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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock data keyed by id
const repoData: Record<string, {
  id: string;
  name: string;
  owner: string;
  grade: string;
  tier: "simple" | "medium" | "complex";
  lastScanned: string;
  scanning: boolean;
  stack: string;
  authType: string;
  routesDetected: number;
  modelsDetected: number;
  rolesDetected: number;
  gradeHistory: { grade: string; date: string }[];
  findings: {
    id: string;
    status: "confirmed" | "advisory";
    summary: string;
    route: string;
    category: string;
  }[];
}> = {
  "repo-1": {
    id: "repo-1",
    name: "api-gateway",
    owner: "acme-corp",
    grade: "B+",
    tier: "complex",
    lastScanned: "2026-03-01T09:42:00Z",
    scanning: false,
    stack: "Node.js / Express · JWT auth",
    authType: "JWT Bearer",
    routesDetected: 47,
    modelsDetected: 12,
    rolesDetected: 4,
    gradeHistory: [
      { grade: "C", date: "2026-01-15" },
      { grade: "C+", date: "2026-01-29" },
      { grade: "B-", date: "2026-02-12" },
      { grade: "B", date: "2026-02-19" },
      { grade: "B+", date: "2026-03-01" },
    ],
    findings: [
      { id: "F-001", status: "confirmed", summary: "User PII exposed via unauthenticated GET /api/users/:id endpoint", route: "GET /api/users/:id", category: "Data Exposure" },
      { id: "F-002", status: "confirmed", summary: "Privilege escalation through role parameter injection on PATCH /api/users", route: "PATCH /api/users", category: "Privilege Escalation" },
      { id: "F-003", status: "confirmed", summary: "IDOR on billing endpoint allows access to other tenants' invoices", route: "GET /api/billing/:id", category: "Data Exposure" },
      { id: "F-004", status: "advisory", summary: "Rate limiting absent on /api/auth/login allows brute force", route: "POST /api/auth/login", category: "Brute Force" },
      { id: "F-005", status: "advisory", summary: "JWT tokens do not expire for 30 days, increasing session hijack window", route: "POST /api/auth/token", category: "Session Management" },
    ],
  },
  "repo-2": {
    id: "repo-2",
    name: "user-service",
    owner: "acme-corp",
    grade: "A-",
    tier: "medium",
    lastScanned: "2026-02-28T14:30:00Z",
    scanning: false,
    stack: "Python / FastAPI · OAuth2",
    authType: "OAuth2",
    routesDetected: 22,
    modelsDetected: 8,
    rolesDetected: 3,
    gradeHistory: [
      { grade: "B", date: "2026-02-01" },
      { grade: "B+", date: "2026-02-14" },
      { grade: "A-", date: "2026-02-28" },
    ],
    findings: [
      { id: "F-010", status: "advisory", summary: "Missing CORS origin validation on /api/profile endpoint", route: "GET /api/profile", category: "Misconfiguration" },
      { id: "F-011", status: "advisory", summary: "Verbose error messages expose internal stack traces", route: "ALL /api/*", category: "Information Disclosure" },
    ],
  },
  "repo-3": {
    id: "repo-3",
    name: "billing-api",
    owner: "acme-corp",
    grade: "C",
    tier: "complex",
    lastScanned: "2026-02-27T11:15:00Z",
    scanning: true,
    stack: "Go / Gin · API Key auth",
    authType: "API Key",
    routesDetected: 34,
    modelsDetected: 15,
    rolesDetected: 5,
    gradeHistory: [
      { grade: "D", date: "2026-02-01" },
      { grade: "C-", date: "2026-02-15" },
      { grade: "C", date: "2026-02-27" },
    ],
    findings: [
      { id: "F-020", status: "confirmed", summary: "API key leaked in query parameters, logged by proxy", route: "ALL /api/*", category: "Data Exposure" },
      { id: "F-021", status: "confirmed", summary: "Mass assignment on invoice creation allows price manipulation", route: "POST /api/invoices", category: "Data Exposure" },
      { id: "F-022", status: "confirmed", summary: "Admin endpoints accessible with regular user API key", route: "GET /api/admin/users", category: "Privilege Escalation" },
      { id: "F-023", status: "advisory", summary: "No pagination on listing endpoints enables data scraping", route: "GET /api/invoices", category: "Information Disclosure" },
    ],
  },
};

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
  const repo = repoData[repoId || ""];

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
    { key: "Stack", value: repo.stack },
    { key: "Auth Type", value: repo.authType },
    { key: "Routes", value: repo.routesDetected.toString() },
    { key: "Models", value: repo.modelsDetected.toString() },
    { key: "Roles", value: repo.rolesDetected.toString() },
    { key: "Tier", value: repo.tier.charAt(0).toUpperCase() + repo.tier.slice(1) },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-sm bg-muted flex items-center justify-center shrink-0">
              <span className={`font-heading text-2xl font-bold ${gradeColors[repo.grade] || "text-foreground"}`}>
                {repo.grade}
              </span>
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{repo.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono">{repo.owner}/{repo.name}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{repo.stack}</span>
                <Badge variant="outline" className={`rounded-sm text-[10px] uppercase tracking-wider ${tierColors[repo.tier]}`}>
                  {repo.tier}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {repo.scanning ? (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning and executing exploits…
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Last scanned {new Date(repo.lastScanned).toLocaleString()}
              </span>
            )}
            <Button className="uppercase tracking-wider text-xs font-semibold rounded-sm" disabled={repo.scanning}>
              <Play className="mr-2 w-4 h-4" /> Scan Now
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex gap-3 flex-wrap">
        <Link to={`/threat-memory/${repo.id}`}>
          <Button variant="outline" size="sm" className="uppercase tracking-wider text-[10px] font-semibold rounded-sm">
            <Brain className="mr-1 w-3.5 h-3.5" /> Threat Memory
          </Button>
        </Link>
        <Link to={`/repos/${repo.id}/scans`}>
          <Button variant="outline" size="sm" className="uppercase tracking-wider text-[10px] font-semibold rounded-sm">
            <Clock className="mr-1 w-3.5 h-3.5" /> Scan History
          </Button>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-2 space-y-6">
          {/* Findings */}
          <motion.div variants={fadeUp}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">
                  Findings ({repo.findings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {repo.scanning && repo.findings.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm">Scan in progress — findings will appear here…</span>
                  </div>
                ) : repo.findings.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-8 h-8 text-success mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No findings yet. Run a scan to get started.</p>
                  </div>
                ) : (
                  repo.findings.map((finding, i) => (
                    <div key={finding.id}>
                      {i > 0 && <Separator />}
                      <div className="flex items-start gap-3 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                        <Badge
                          variant={finding.status === "confirmed" ? "destructive" : "secondary"}
                          className="rounded-sm text-[10px] uppercase tracking-wider mt-0.5 shrink-0"
                        >
                          {finding.status}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">{finding.summary}</p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">{finding.route}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary shrink-0"
                        >
                          Proof <ExternalLink className="ml-1 w-3 h-3" />
                        </Button>
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
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">
                  App Fingerprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xs space-y-2">
                  {fingerprint.map((item) => (
                    <div key={item.key} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{item.key}</span>
                      <span className="text-foreground text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grade History */}
          <motion.div variants={fadeUp}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">
                  Grade History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...repo.gradeHistory].reverse().map((entry, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className={`font-heading text-sm font-bold ${gradeColors[entry.grade] || "text-foreground"}`}>
                        {entry.grade}
                      </span>
                      <span className="text-xs text-muted-foreground">
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
