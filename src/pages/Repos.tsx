import { useState } from "react";
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

const mockRepos: Repo[] = [
  {
    id: "repo-1",
    name: "api-gateway",
    owner: "acme-corp",
    grade: "B+",
    confirmedFindings: 3,
    advisoryFindings: 5,
    tier: "complex",
    lastScanned: "2026-03-01T09:42:00Z",
    scanning: false,
    githubAppConnected: true,
  },
  {
    id: "repo-2",
    name: "user-service",
    owner: "acme-corp",
    grade: "A-",
    confirmedFindings: 1,
    advisoryFindings: 2,
    tier: "medium",
    lastScanned: "2026-02-28T14:30:00Z",
    scanning: false,
    githubAppConnected: true,
  },
  {
    id: "repo-3",
    name: "billing-api",
    owner: "acme-corp",
    grade: "C",
    confirmedFindings: 7,
    advisoryFindings: 8,
    tier: "complex",
    lastScanned: "2026-02-27T11:15:00Z",
    scanning: true,
    githubAppConnected: false,
  },
  {
    id: "repo-4",
    name: "auth-microservice",
    owner: "acme-corp",
    grade: null,
    confirmedFindings: 0,
    advisoryFindings: 0,
    tier: "simple",
    lastScanned: null,
    scanning: false,
    githubAppConnected: true,
  },
];

const availableRepos = [
  { owner: "acme-corp", name: "notification-service" },
  { owner: "acme-corp", name: "analytics-pipeline" },
  { owner: "acme-corp", name: "admin-dashboard" },
  { owner: "acme-corp", name: "webhook-handler" },
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
  const [repos] = useState<Repo[]>(mockRepos);
  const hasRepos = repos.length > 0;

  const filteredAvailable = availableRepos.filter((r) =>
    `${r.owner}/${r.name}`.toLowerCase().includes(search.toLowerCase())
  );

  if (!hasRepos) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="bg-card border-border max-w-md w-full text-center">
          <CardContent className="p-10">
            <div className="w-16 h-16 rounded-sm bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-3">
              No Repos Connected
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Connect your first repository to start autonomous security scanning.
            </p>
            <Button
              className="uppercase tracking-wider text-xs font-semibold rounded-sm"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="mr-2 w-4 h-4" /> Connect Repository
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
            Repositories
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {repos.length} connected {repos.length === 1 ? "repo" : "repos"}
          </p>
        </div>
        <Button
          className="uppercase tracking-wider text-xs font-semibold rounded-sm w-fit"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus className="mr-2 w-4 h-4" /> Add Repo
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
              className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/repos/${repo.id}`)}
            >
              <CardContent className="p-5 space-y-4">
                {/* Name + Grade */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-tight truncate">
                      {repo.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {repo.owner}/{repo.name}
                    </p>
                  </div>
                  {repo.grade ? (
                    <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
                      <span className={`font-heading text-lg font-bold ${gradeColors[repo.grade] || "text-foreground"}`}>
                        {repo.grade}
                      </span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="uppercase tracking-wider text-[10px] font-semibold rounded-sm h-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Play className="mr-1 w-3 h-3" /> Scan
                    </Button>
                  )}
                </div>

                {/* Findings counts */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{repo.confirmedFindings}</span> confirmed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{repo.advisoryFindings}</span> advisory
                    </span>
                  </div>
                </div>

                {/* Tier + Last Scanned */}
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`rounded-sm text-[10px] uppercase tracking-wider ${tierColors[repo.tier]}`}>
                    {repo.tier}
                  </Badge>
                  {repo.scanning ? (
                    <div className="flex items-center gap-1.5 text-xs text-primary">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Scanning…</span>
                    </div>
                  ) : repo.lastScanned ? (
                    <span className="text-[11px] text-muted-foreground">
                      Scanned {new Date(repo.lastScanned).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Never scanned</span>
                  )}
                </div>

                {/* GitHub App Warning */}
                {!repo.githubAppConnected && (
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <Badge variant="outline" className="rounded-sm text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                      PR checks inactive
                    </Badge>
                    <button
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Reconnect <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Repo Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm font-bold uppercase tracking-wider">
              Connect Repository
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select a repository to add to AART for autonomous scanning.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories…"
                className="pl-9 bg-background border-border rounded-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredAvailable.map((repo) => (
                <button
                  key={`${repo.owner}/${repo.name}`}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-muted/50 transition-colors text-left"
                  onClick={() => setAddModalOpen(false)}
                >
                  <span className="text-sm font-mono">
                    {repo.owner}/<span className="font-medium text-foreground">{repo.name}</span>
                  </span>
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
              {filteredAvailable.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No matching repositories found.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Repos;
