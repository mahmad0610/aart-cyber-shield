import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Clock, BarChart3, Eye, Target, Play, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const repoMemories: Record<string, {
  repo: string;
  owner: string;
  lastUpdated: string;
  scanCount: number;
  weaknessPatterns: { type: string; confirmed: number; resolved: number; advisory: number }[];
  devPatterns: string[];
  scanBias: { route: string; reason: string; weight: number }[];
  timeline: { date: string; event: string; detail: string }[];
}> = {
  "repo-1": {
    repo: "api-gateway",
    owner: "acme-corp",
    lastUpdated: "2 hours ago",
    scanCount: 14,
    weaknessPatterns: [
      { type: "Broken Object-Level Auth (BOLA)", confirmed: 6, resolved: 4, advisory: 3 },
      { type: "Mass Assignment", confirmed: 2, resolved: 2, advisory: 1 },
      { type: "Broken Function-Level Auth", confirmed: 3, resolved: 1, advisory: 2 },
      { type: "Data Exposure", confirmed: 1, resolved: 0, advisory: 4 },
      { type: "Injection", confirmed: 0, resolved: 0, advisory: 2 },
    ],
    devPatterns: [
      "Direct model lookups without ownership filters are used in 8 of 12 resource endpoints.",
      "Auth middleware is applied consistently to GET routes but missed on 3 PUT/PATCH routes.",
      "Role checks use string comparison instead of a centralized RBAC helper — easy to bypass with case variations.",
      "Pagination endpoints return full objects including sensitive fields not needed by the frontend.",
      "Error responses on /api/admin/* leak internal model names and database column identifiers.",
    ],
    scanBias: [
      { route: "PUT /api/users/:id/profile", reason: "Same pattern as confirmed BOLA in GET /api/users/:id", weight: 92 },
      { route: "PATCH /api/orders/:id", reason: "Missing ownership filter — matches 4 prior confirmed findings", weight: 88 },
      { route: "GET /api/admin/reports", reason: "Role check uses string match, bypassed in similar endpoint", weight: 85 },
      { route: "POST /api/invoices/:id/share", reason: "New endpoint added since last scan, shares pattern with vulnerable /api/documents/:id/share", weight: 78 },
      { route: "DELETE /api/teams/:id/members/:uid", reason: "Function-level auth gap — no admin check detected", weight: 74 },
    ],
    timeline: [
      { date: "Mar 2, 2026 · 10:15 AM", event: "Memory updated", detail: "Scan #14 completed. 2 new patterns detected. Bias weights recalculated." },
      { date: "Feb 28, 2026 · 3:42 PM", event: "Pattern confirmed", detail: "BOLA pattern in PUT routes validated — 3rd confirmation of missing ownership filters on write endpoints." },
      { date: "Feb 25, 2026 · 9:00 AM", event: "Memory updated", detail: "Scan #13 completed. Resolved 2 BOLA findings. Dev team pattern updated." },
      { date: "Feb 20, 2026 · 11:30 AM", event: "Bias adjusted", detail: "Increased priority on admin routes after role check bypass confirmed in /api/admin/users." },
      { date: "Feb 15, 2026 · 2:00 PM", event: "New pattern", detail: "Detected recurring use of string-based role comparison across 4 middleware files." },
      { date: "Feb 10, 2026 · 8:45 AM", event: "Memory created", detail: "Initial threat memory established after first 3 scans. 12 routes indexed, 3 patterns identified." },
    ],
  },
};

const ThreatMemory = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const memory = repoMemories[repoId || ""] || repoMemories["repo-1"];

  const maxTotal = Math.max(...memory.weaknessPatterns.map(p => p.confirmed + p.resolved + p.advisory));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Link to={`/repos/${repoId || "repo-1"}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to repo
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="font-heading text-2xl font-bold">Threat Memory</h1>
            </div>
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">{memory.owner}/{memory.repo}</span>
              {" · "}Updated {memory.lastUpdated} · {memory.scanCount} scans contributed
            </p>
          </div>
          <Button className="gap-2">
            <Play className="h-4 w-4" /> Run targeted scan
          </Button>
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <span className="text-primary font-medium">How this works:</span> AART learns your codebase over time. Each scan refines its understanding of your architecture, recurring weaknesses, and team patterns. The longer AART watches, the smarter — and faster — each scan becomes.
          </CardContent>
        </Card>
      </motion.div>

      {/* Weakness Patterns */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Weakness Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {memory.weaknessPatterns.map((p) => {
              const total = p.confirmed + p.resolved + p.advisory;
              return (
                <div key={p.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.type}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="text-destructive">{p.confirmed} confirmed</span>
                      <span className="text-success">{p.resolved} resolved</span>
                      <span>{p.advisory} advisory</span>
                    </div>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                    <div className="bg-destructive transition-all" style={{ width: `${(p.confirmed / maxTotal) * 100}%` }} />
                    <div className="bg-success transition-all" style={{ width: `${(p.resolved / maxTotal) * 100}%` }} />
                    <div className="bg-muted-foreground/30 transition-all" style={{ width: `${(p.advisory / maxTotal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Confirmed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Resolved</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" /> Advisory</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dev Team Patterns */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Dev Team Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {memory.devPatterns.map((pattern, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-primary font-mono text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground">{pattern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scan Bias */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Next Scan Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {memory.scanBias.map((item, i) => (
              <div key={i} className="p-3 rounded-md bg-muted/50 border border-border space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm font-mono text-foreground">{item.route}</code>
                  <Badge variant="outline" className="shrink-0 font-mono text-xs tabular-nums">
                    {item.weight}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
                <Progress value={item.weight} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* History Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Memory Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l border-border space-y-6">
              {memory.timeline.map((event, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[25px] top-1 w-2 h-2 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{event.event}</Badge>
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ThreatMemory;
