import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Play,
  Shield,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

interface Repo {
  id: string;
  name: string;
  owner: string;
  grade: string | null;
  confirmedFindings: number;
  advisoryFindings: number;
  tier: "simple" | "medium" | "complex";
  lastScanned: string | null;
  scanning: boolean;
  githubAppConnected: boolean;
}

const availableRepos = [
  { owner: "acme-corp", name: "notification-service", url: "https://github.com/acme-corp/notification-service" },
  { owner: "acme-corp", name: "analytics-pipeline", url: "https://github.com/acme-corp/analytics-pipeline" },
  { owner: "Omer-102", name: "Real-Time-Chat-App-With-NextJS-Express-GraphQL", url: "https://github.com/Omer-102/Real-Time-Chat-App-With-NextJS-Express-GraphQL" },
  { owner: "acme-corp", name: "webhook-handler", url: "https://github.com/acme-corp/webhook-handler" },
];

const tierColors: Record<string, string> = {
  simple: "bg-success/10 text-success border-success/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  complex: "bg-destructive/10 text-destructive border-destructive/20",
};

const gradeColors: Record<string, string> = {
  "A+": "text-success",
  A: "text-success",
  "A-": "text-success",
  "B+": "text-primary",
  B: "text-primary",
  "B-": "text-primary",
  C: "text-destructive",
  D: "text-destructive",
  F: "text-destructive",
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const Repos = () => {
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRepos = async () => {
    try {
      const res = await api.get('/repos');
      setRepos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
    const interval = setInterval(() => {
      setRepos((current) => {
        if (current.some((r) => r.scanning)) {
          fetchRepos();
        }
        return current;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectRepo = async (repoUrl: string, repoName: string, full_name: string) => {
    setAddModalOpen(false);
    setLoading(true);
    try {
      await api.post('/repos/connect', { github_url: repoUrl, name: repoName, full_name });
      await fetchRepos();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const hasRepos = repos.length > 0;

  const filteredAvailable = availableRepos.filter((r) =>
    `${r.owner}/${r.name}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)]">
      {!hasRepos ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 max-w-md w-full text-center rounded-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <CardContent className="p-12 relative z-10">
              <div className="w-16 h-16 border border-primary/20 bg-primary/5 flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(125,131,250,0.1)]">
                <Shield className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h2 className="font-heading text-2xl font-bold uppercase tracking-tighter text-white mb-4 italic">
                No Assets <span className="text-primary">Detected</span>
              </h2>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed mb-10">
                AART NEURAL ENGINE IS WAITING FOR SECTOR ASSIGNMENT. INITIALIZE YOUR FIRST ASSET LINK TO BEGIN SURVEILLANCE.
              </p>
              <Button
                className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-14 px-10 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="mr-3 w-4 h-4" /> Connect Repository
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6 w-full">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
          >
            <div>
              <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Asset Inventory</span>
              <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white uppercase italic">
                Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">Assets</span>
              </h1>
              <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-[0.2em] leading-relaxed">
                {repos.length} core assets indexed and monitored by AART neural engine.
              </p>
            </div>
            <Button
              className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="mr-3 w-4 h-4" /> Link New Asset
            </Button>
          </motion.div>

          {/* Repo Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {repos.map((repo) => (
              <motion.div key={repo.id} variants={fadeUp}>
                <Card
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none hover:border-primary/50 transition-all duration-500 cursor-pointer group relative overflow-hidden"
                  onClick={() => navigate(`/repos/${repo.id}`)}
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <CardContent className="p-8 space-y-6 relative z-10">
                    {/* Name + Grade */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-heading text-lg font-bold uppercase tracking-tight truncate text-white group-hover:text-primary transition-colors">
                          {repo.name}
                        </h3>
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] mt-1 truncate">
                          {repo.owner}/{repo.name}
                        </p>
                      </div>
                      {repo.grade ? (
                        <div className="w-12 h-12 border border-white/10 bg-black/60 flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:scale-110 transition-all duration-500">
                          <span className={`font-heading text-xl font-bold italic ${gradeColors[repo.grade] || "text-white"}`}>
                            {repo.grade}
                          </span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="hacktron-clip bg-primary text-white uppercase tracking-[0.2em] text-[10px] font-bold h-10 px-6 shrink-0 shadow-[0_0_15px_rgba(125,131,250,0.3)]"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Play className="mr-2 w-3 h-3 fill-current" /> Scan
                        </Button>
                      )}
                    </div>

                    {/* Findings counts */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-white/5 bg-white/[0.02] flex flex-col gap-1">
                        <span className="font-mono text-[11px] text-red-500 font-bold uppercase tabular-nums">{repo.confirmedFindings}</span>
                        <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Confirmed vectors</span>
                      </div>
                      <div className="p-3 border border-white/5 bg-white/[0.02] flex flex-col gap-1">
                        <span className="font-mono text-[11px] text-primary font-bold uppercase tabular-nums">{repo.advisoryFindings}</span>
                        <span className="font-mono text-[8px] text-white/20 uppercase tracking-widest">Advisory signals</span>
                      </div>
                    </div>

                    {/* Tier + Last Scanned */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-1.5 h-1.5 ${repo.tier === "complex" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_8px_rgba(125,131,250,0.5)]"}`} />
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] font-bold text-white/40">{repo.tier} asset class</span>
                      </div>

                      {repo.scanning ? (
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-primary animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Syncing…</span>
                        </div>
                      ) : repo.lastScanned ? (
                        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
                          LAST SYNC: {new Date(repo.lastScanned).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">SYNC REQUIRED</span>
                      )}
                    </div>

                    {/* GitHub App Warning */}
                    {!repo.githubAppConnected && (
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-red-500/70 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> PR checks inactive
                        </span>
                        <button
                          className="font-mono text-[9px] text-primary hover:text-white transition-colors uppercase tracking-[0.2em] font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          [ Reconnect Pipeline ]
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-none sm:max-w-md p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(125,131,250,0.5)]" />

          <div className="p-8 space-y-6">
            <DialogHeader className="p-0">
              <DialogTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-white">
                [ Initiate Asset Linking ]
              </DialogTitle>
              <DialogDescription className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-2">
                Select an available repository OR enter a custom GitHub URL to synchronize.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input
                  placeholder="Locating asset ID…"
                  className="pl-12 bg-white/5 border-white/5 text-white font-mono text-[10px] uppercase tracking-[0.1em] rounded-none focus:border-primary/50 h-12 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Manual URL entry if search looks like a URL */}
              {search.includes("github.com/") && (
                <Button
                  className="w-full hacktron-clip bg-primary/20 hover:bg-primary/40 text-primary uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 border border-primary/30 transition-all"
                  onClick={() => {
                    const parts = search.split("github.com/")[1].split("/");
                    const owner = parts[0] || "Custom";
                    const name = parts[1]?.replace(".git", "") || "Repo";
                    handleConnectRepo(search, name, `${owner}/${name}`);
                  }}
                >
                  <Plus className="mr-3 w-4 h-4" /> Link Custom URL: {search.split("github.com/")[1].split("/").slice(0, 2).join("/")}
                </Button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {filteredAvailable.map((repo) => (
                <button
                  key={`${repo.owner}/${repo.name}`}
                  className="w-full flex items-center justify-between p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all text-left group/item"
                  onClick={() => handleConnectRepo(repo.url, repo.name, `${repo.owner}/${repo.name}`)}
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 group-hover/item:text-white transition-colors">
                    {repo.owner}/<span className="font-bold text-white group-hover/item:text-primary transition-colors">{repo.name}</span>
                  </span>
                  <div className="w-8 h-8 border border-white/5 flex items-center justify-center group-hover/item:border-primary/30 text-white/20 group-hover/item:text-primary transition-all">
                    <Plus className="w-3 h-3" />
                  </div>
                </button>
              ))}
              {filteredAvailable.length === 0 && (
                <div className="font-mono text-[9px] text-white/20 text-center py-10 uppercase tracking-[0.3em]">
                  Asset ID not found in current sector.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Repos;
