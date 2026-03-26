import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Clock, BarChart3, Eye, Target, Play, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useThreatMemory } from "@/hooks/useAartApi";
import { ThreatHeatmap } from "@/components/dashboard/ThreatHeatmap";

const ThreatMemory = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const { data: memoryData, isLoading } = useThreatMemory(repoId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const memory = {
    repo: memoryData?.repo || "unknown",
    owner: memoryData?.owner || "unknown",
    lastUpdated: memoryData?.last_updated || "never",
    scanCount: memoryData?.scan_count || 0,
    weaknessPatterns: memoryData?.weakness_patterns || [],
    devPatterns: memoryData?.dev_team_patterns || [],
    scanBias: memoryData?.scan_bias_weights || [],
    timeline: memoryData?.timeline || [],
  };

  const maxTotal = memory.weaknessPatterns.length > 0 
    ? Math.max(...memory.weaknessPatterns.map(p => p.confirmed + p.resolved + p.advisory))
    : 1;

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

      {/* Weakness Patterns / Neural Evolution Heatmap */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none relative overflow-hidden group mb-8">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5">
            <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-primary" /> System Memory Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0 pb-6 relative">
             <ThreatHeatmap timeline={memory.timeline} weaknesses={memory.weaknessPatterns} />
             <div className="flex items-center gap-6 px-10 pt-6 border-t border-white/5 mx-6">
                <span className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-[#B4B2A9]">
                  <div className="w-2 h-2 rounded bg-gradient-to-r from-[#111113] to-[#D85A30] border border-[#3d3d3a]" /> 
                  Evolution Intensity
                </span>
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
