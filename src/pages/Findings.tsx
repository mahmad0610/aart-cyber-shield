import { useState, useEffect, useMemo } from "react";
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
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFindings, useRepos, Finding } from "@/hooks/useAartApi";
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

  const { data: findingsData, isLoading: loadingFindings } = useFindings();
  const { data: reposData, isLoading: loadingRepos } = useRepos();

  const allFindings = findingsData || [];
  const reposList = useMemo(() => {
    const names = reposData?.map((r) => r.name) || [];
    return ["all", ...Array.from(new Set(names))];
  }, [reposData]);
  const loading = loadingFindings || loadingRepos;

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
      list = list.filter((f) => f.repoName === activeRepo);
    }

    list.sort((a, b) => {
      if (activeSort === "impact") {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return (impactOrder[a.category] ?? 99) - (impactOrder[b.category] ?? 99);
      }
      if (activeSort === "date") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Intelligence Repository</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white uppercase italic">
              Vulnerability <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">Feed</span>
            </h1>
            <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-[0.2em] leading-relaxed">
              {allFindings.length} signals identified · <span className="text-red-500 font-bold">{confirmedCount} confirmed vectors</span> · <span className="text-white/60">{advisoryCount} advisory alerts</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="bg-white/[0.02] border border-white/10 backdrop-blur-md rounded-none">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            {/* Status chips */}
            {statusFilters.map((sf) => {
              const isActive = activeStatus === sf.key;
              return (
                <button
                  key={sf.key}
                  onClick={() => setFilter("status", sf.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 border ${isActive
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "bg-transparent text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                    }`}
                >
                  <sf.icon className={`w-3 h-3 ${isActive ? "text-black" : "text-current"}`} />
                  {sf.label}
                </button>
              );
            })}

            <div className="h-6 w-[1px] bg-white/10 mx-2" />

            {/* Sort */}
            <Select value={activeSort} onValueChange={(v) => setFilter("sort", v)}>
              <SelectTrigger className="w-[160px] h-10 text-[10px] bg-white/5 border-white/10 text-white font-mono uppercase tracking-widest rounded-none hover:bg-white/10 transition-colors">
                <ArrowUpDown className="w-3 h-3 mr-2 opacity-50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-none">
                <SelectItem value="impact" className="text-[10px] uppercase font-mono py-2">By Impact</SelectItem>
                <SelectItem value="date" className="text-[10px] uppercase font-mono py-2">By Date</SelectItem>
                <SelectItem value="confidence" className="text-[10px] uppercase font-mono py-2">By Confidence</SelectItem>
              </SelectContent>
            </Select>

            {/* Repo filter */}
            <Select value={activeRepo} onValueChange={(v) => setFilter("repo", v)}>
              <SelectTrigger className="w-[180px] h-10 text-[10px] bg-white/5 border-white/10 text-white font-mono uppercase tracking-widest rounded-none hover:bg-white/10 transition-colors">
                <SelectValue placeholder="All repos" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-none">
                <SelectItem value="all" className="text-[10px] uppercase font-mono py-2 text-primary font-bold">All Asset Repos</SelectItem>
                {reposList.filter((r) => r !== "all").map((r) => (
                  <SelectItem key={r} value={r} className="text-[10px] uppercase font-mono py-2">{r}</SelectItem>
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
          <Card className="bg-black/60 border border-white/10 rounded-none relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <CardContent className="p-0">
              {filtered.map((finding, i) => (
                <motion.div key={finding.id} variants={fadeUp}>
                  <div
                    className="flex items-start gap-8 px-8 py-8 hover:bg-white/[0.03] transition-all cursor-pointer group/item relative border-b border-white/5"
                    onClick={() => navigate(`/findings/${finding.id}`)}
                  >
                    <div className={`mt-1 h-3 w-1 shrink-0 ${finding.status === "confirmed" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : finding.status === "advisory" ? "bg-primary shadow-[0_0_10px_rgba(125,131,250,0.5)]" : "bg-white/20"}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 flex-wrap mb-2">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">{finding.id}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-primary italic drop-shadow-[0_0_8px_rgba(125,131,250,0.3)]">{finding.category}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest border border-white/5 bg-white/[0.02] px-2 py-0.5">{finding.repoName}</span>
                      </div>
                      <p className="text-base font-medium text-white/90 leading-relaxed mb-4 group-hover/item:text-white transition-colors">
                        {finding.summary}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <code className="text-[10px] text-white/30 bg-black/40 px-3 py-1 font-mono uppercase tracking-tighter border border-white/5">
                          {finding.route}
                        </code>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-white/20">
                          <div className="w-24 h-1 bg-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary opacity-30" style={{ width: `${finding.confidence}%` }} />
                          </div>
                          <span className="font-bold text-white/40">{finding.confidence}% Assurance</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                      {(finding as any).fixReady && finding.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-10 px-6 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          Remediate Vector
                        </Button>
                      )}
                      <div className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group-hover/item:border-white/30">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
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
