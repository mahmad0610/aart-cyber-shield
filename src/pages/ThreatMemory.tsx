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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Link to={`/repos/${repoId || "repo-1"}`} className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-all group">
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> [ Back to Asset Overview ]
        </Link>
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Neural Knowledge Core</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white uppercase italic">
              Threat <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">Memory</span>
            </h1>
            <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-widest leading-relaxed">
              <span className="text-white/60 font-bold tracking-tighter">{memory.owner}/{memory.repo}</span>
              {" · "}Synchronized {memory.lastUpdated} · {memory.scanCount} neural assessments
            </p>
          </div>
          <Button className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all">
            <Play className="h-4 w-4 mr-3 fill-current" /> Initialize Targeted Vector
          </Button>
        </div>
        <Card className="bg-primary/5 border border-primary/20 rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardContent className="p-6 font-mono text-[10px] text-white/50 uppercase tracking-[0.15em] leading-relaxed">
            <span className="text-primary font-bold mr-2">[ PROTOCOL ]:</span> AART neural engine continuously indexes your architecture patterns. Each scan refines its baseline understanding of recurring weaknesses and deployment vectors. Intelligence density increases with every assessment cycle.
          </CardContent>
        </Card>
      </motion.div>

      {/* Weakness Patterns */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5">
            <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-primary" /> Weakness Recurrence Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 py-8 space-y-8">
            {memory.weaknessPatterns.map((p) => {
              const total = p.confirmed + p.resolved + p.advisory;
              return (
                <div key={p.type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/90 italic">{p.type}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[9px] text-red-500 font-bold uppercase tabular-nums tracking-tighter shadow-red-500/20 shadow-sm">{p.confirmed} Confirmed</span>
                        <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Active Vectors</span>
                      </div>
                      <div className="w-[1px] h-6 bg-white/5" />
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[9px] text-primary font-bold uppercase tabular-nums tracking-tighter">{p.advisory} Advisory</span>
                        <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Suspected</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-1.5 bg-white/5 relative overflow-hidden rounded-none border border-white/5">
                    <div className="bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-1000" style={{ width: `${(p.confirmed / maxTotal) * 100}%` }} />
                    <div className="bg-primary shadow-[0_0_8px_rgba(125,131,250,0.5)] opacity-50 transition-all duration-1000" style={{ width: `${(p.advisory / maxTotal) * 100}%` }} />
                    <div className="bg-green-500 opacity-30 transition-all duration-1000" style={{ width: `${(p.resolved / maxTotal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-6 pt-6 border-t border-white/5">
              <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-white/30"><div className="w-2 h-2 bg-red-500" /> Confirmed vectors</span>
              <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-white/30"><div className="w-2 h-2 bg-primary" /> Advisory signals</span>
              <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-white/30"><div className="w-2 h-2 bg-green-500" /> Remediated nodes</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dev Team Patterns */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/60 border border-white/10 rounded-none overflow-hidden group">
          <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 flex items-center gap-3">
              <Eye className="h-4 w-4 text-primary" /> Engineering Behavior Inferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ul className="space-y-6">
              {memory.devPatterns.map((pattern, i) => (
                <li key={i} className="flex gap-6 group/item">
                  <span className="font-mono text-[9px] text-primary/40 font-bold mt-1 group-hover/item:text-primary transition-colors shrink-0">[{String(i + 1).padStart(2, "0")}]</span>
                  <p className="font-mono text-[11px] text-white/50 leading-relaxed uppercase tracking-wider group-hover/item:text-white transition-colors">{pattern}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scan Bias */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-black/60 border border-white/10 rounded-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5">
            <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 flex items-center gap-3">
              <Target className="h-4 w-4 text-primary" /> Predictive Analysis Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-6">
            {memory.scanBias.map((item, i) => (
              <div key={i} className="p-6 border border-white/5 bg-white/[0.02] space-y-4 hover:border-primary/30 transition-all duration-300 relative group/bias">
                <div className="flex items-center justify-between gap-4">
                  <code className="font-mono text-[10px] text-white/80 uppercase tracking-tighter bg-black/40 px-2 py-1 border border-white/5">{item.route}</code>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[11px] text-primary font-bold tabular-nums italic shadow-primary/20 shadow-sm">{item.weight}%</span>
                    <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Heat Scalar</span>
                  </div>
                </div>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.1em] leading-relaxed group-hover/bias:text-white/60 transition-colors">{item.reason}</p>
                <div className="h-px w-full bg-white/5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.weight}%` }}
                    className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_8px_rgba(125,131,250,0.5)]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* History Timeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-black/60 border border-white/10 rounded-none relative overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5">
            <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" /> Intelligence Accumulation Ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="relative pl-10 border-l border-white/10 space-y-12">
              {memory.timeline.map((event, i) => (
                <div key={i} className="relative group/time">
                  <div className="absolute -left-[45px] top-1 w-2.5 h-2.5 bg-white/10 group-hover/time:bg-primary group-hover/time:scale-125 transition-all duration-300" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-6 flex-wrap">
                      <span className="font-mono text-[10px] px-3 py-1 border border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest">{event.event}</span>
                      <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">{event.date}</span>
                    </div>
                    <p className="font-mono text-[11px] text-white/50 uppercase tracking-widest leading-relaxed max-w-2xl group-hover/time:text-white/80 transition-colors">{event.detail}</p>
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
