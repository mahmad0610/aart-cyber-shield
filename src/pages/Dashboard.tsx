import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  GitPullRequest,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Github,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats, useFindings } from "@/hooks/useAartApi";
import { AttackSurfaceGraph } from "@/components/dashboard/AttackSurfaceGraph";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { ScorecardRadar } from "@/components/dashboard/ScorecardRadar";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [githubInstalled, setGithubInstalled] = useState(false);
  const { data: statsData, isLoading: loadingStats } = useDashboardStats();
  const { data: findingsData, isLoading: loadingFindings } = useFindings({ limit: 5 });
  
  const findings = findingsData || [];
  const loading = loadingStats || loadingFindings;

  useEffect(() => {
    const installed = localStorage.getItem("github-app-installed") === "true";
    setGithubInstalled(installed);
  }, []);

  const onboardingSteps = [
    { label: "Create account", done: true },
    { label: "Connect your first repo", done: statsData?.has_repos || false },
    { label: "Install GitHub App", done: githubInstalled },
    { label: "Run your first scan", done: (statsData?.confirmed || 0) + (statsData?.advisory || 0) + (statsData?.resolved || 0) > 0 },
    { label: "Review findings", done: findings.length > 0 },
  ];

  const isOnboardingComplete = onboardingSteps.every((s) => s.done);
  const showGitHubNudge = !githubInstalled;

  const handleInstall = () => {
    localStorage.setItem("github-app-installed", "true");
    setGithubInstalled(true);
  };

  const completedSteps = onboardingSteps.filter((s) => s.done).length;
  const onboardingProgress = (completedSteps / onboardingSteps.length) * 100;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasRepos = statsData?.has_repos || false;
  const stats = [
    { label: "Confirmed Open", value: statsData?.confirmed || 0, icon: Shield, color: "text-destructive" },
    { label: "Advisory Open", value: statsData?.advisory || 0, icon: AlertTriangle, color: "text-primary" },
    { label: "Resolved This Week", value: statsData?.resolved || 0, icon: CheckCircle2, color: "text-success" },
    { label: "PRs Scanned", value: statsData?.scanned_prs || 0, icon: GitPullRequest, color: "text-muted-foreground" },
  ];

  if (!hasRepos) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 max-w-md w-full text-center hacktron-clip relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <CardContent className="p-10 relative z-10">
            <div className="w-16 h-16 border border-primary/30 bg-primary/5 flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <Shield className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(125,131,250,0.5)]" />
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-white mb-4">
              System Inactive
            </h2>
            <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-10 leading-relaxed">
              No target repositories identified. Connect your first asset to initialize autonomous neural assessment.
            </p>
            <Button
              className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-10 rounded-none transition-all duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              onClick={() => navigate('/onboarding/connect')}
            >
              Connect Repository
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* GitHub nudge banner */}
      <AnimatePresence>
        {showGitHubNudge && !nudgeDismissed && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border border-white/10 bg-white/[0.02] backdrop-blur-md relative group mb-6">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-black">
                  <Github className="w-5 h-5 text-white shrink-0" />
                </div>
                <p className="font-mono text-[11px] tracking-widest leading-loose">
                  <span className="text-white font-bold uppercase">Enable PR Analysis:</span>{" "}
                  <span className="text-white/40 uppercase">Install the GitHub App for automated remediation PRs.</span>
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 relative z-10">
                <Button
                  size="sm"
                  className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-10 px-6 rounded-none transition-all"
                  onClick={handleInstall}
                >
                  Install
                </Button>
                <button
                  className="text-white/30 hover:text-white transition-colors"
                  onClick={() => setNudgeDismissed(true)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting + Health Grade */}
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] mb-3 block">Neural Dashboard</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white uppercase italic">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/50 to-white animate-text-gradient">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="font-mono text-[10px] text-white/30 mt-3 uppercase tracking-widest">
              Last assessment: <span className="text-white/60">Live Mode</span>
            </p>
          </div>

          <Card className="bg-black/60 border border-white/10 w-fit hacktron-clip group relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="flex items-center gap-6 p-6 relative z-10">
              <div className="w-16 h-16 border border-primary/30 bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <span className="font-heading text-3xl font-bold text-primary drop-shadow-[0_0_10px_rgba(125,131,250,0.5)]">{statsData?.grade || "N/A"}</span>
              </div>
              <div className="min-w-[120px]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1">Security Health</p>
                <div className="flex items-center gap-2">
                  {statsData?.grade_trend === "up" ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20">
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                      <span className="font-mono text-[10px] text-green-500 font-bold uppercase">Optimized</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20">
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                      <span className="font-mono text-[10px] text-red-500 font-bold uppercase">Vulnerable</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Bar */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {stats.map((stat, idx) => (
            <Card key={stat.label} className="bg-black/40 backdrop-blur-md border border-white/10 group hover:border-white/30 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 flex flex-col items-start gap-4 relative z-10">
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 border border-white/5 bg-white/[0.03] flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500">
                    <stat.icon className={`w-5 h-5 ${stat.color} transition-all duration-500`} />
                  </div>
                  <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">{`0${idx + 1}`}</span>
                </div>
                <div>
                  <p className="font-heading text-4xl font-bold tracking-tight text-white mb-1">{stat.value}</p>
                  <p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>

      {/* High-end Visualizations Row */}
      <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-6 h-[450px]">
        <div className="lg:col-span-2 relative drop-shadow-[0_4px_30px_rgba(24,95,165,0.05)] h-full">
          <AttackSurfaceGraph />
        </div>
        <div className="relative drop-shadow-[0_4px_30px_rgba(216,90,48,0.05)] h-full">
          <SeverityChart />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 pb-20">
        {/* Findings List */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2">
          <Card className="bg-black/60 backdrop-blur-xl border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">
                Critical Exposure Vectors
              </CardTitle>
              <Button variant="ghost" size="sm" className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary hover:text-white transition-all" onClick={() => navigate('/findings')}>
                Access All Intelligence
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {findings.map((finding) => (
                <div key={finding.id} className="relative overflow-hidden group/item">
                  <div className="flex items-start gap-6 px-8 py-6 hover:bg-white/[0.03] transition-all cursor-pointer relative z-10 border-b border-white/5" onClick={() => navigate(`/findings/${finding.id}`)}>
                    <div className={`mt-1 h-3 w-1 shrink-0 ${finding.status === "confirmed" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_10px_rgba(125,131,250,0.5)]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">{finding.id}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-bold">{finding.category}</span>
                      </div>
                      <p className="text-sm font-medium text-white/90 leading-relaxed mb-2 max-w-2xl">
                        {finding.summary}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 font-mono uppercase tracking-tighter border border-white/5">
                          {finding.route}
                        </code>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 opacity-0 group-hover/item:opacity-100 transition-all duration-300">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-white/10 hover:border-primary/50 text-primary transition-all rounded-none">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column Stack */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          <motion.div variants={fadeUp} className="h-[320px]">
            <ScorecardRadar />
          </motion.div>
          
          <motion.div variants={fadeUp}>
            <Card className="bg-black/40 backdrop-blur-md border border-white/10 hacktron-clip group">
              <CardHeader className="pb-4 border-b border-white/5 px-6">
                <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                  Quick Directives
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-12 transition-all" onClick={() => navigate('/onboarding/connect')}>
                  <Play className="mr-3 w-4 h-4 fill-current" /> Initialize Scan
                </Button>
                <Button variant="outline" className="w-full hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 hover:bg-white/10 transition-all">
                  <Shield className="mr-3 w-4 h-4" /> Global Intelligence
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {!isOnboardingComplete && (
            <motion.div variants={fadeUp}>
              <Card className="bg-black/60 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary animate-pulse" />
                <CardHeader className="pb-4 px-6 pt-8">
                  <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">Neural Synchronization</CardTitle>
                  <p className="font-mono text-[9px] text-white/30 mt-2 uppercase tracking-widest">
                    Link Progress: <span className="text-primary font-bold">{onboardingProgress.toFixed(0)}%</span>
                  </p>
                </CardHeader>
                <CardContent className="px-6 pb-8 space-y-6">
                  <div className="h-[1px] w-full bg-white/10 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${onboardingProgress}%` }}
                      className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(125,131,250,0.5)]"
                    />
                  </div>
                  <div className="space-y-4">
                    {onboardingSteps.map((step) => (
                      <div key={step.label} className="flex items-center gap-4 group/step">
                        <div className={`w-2 h-2 shrink-0 ${step.done ? "bg-primary shadow-[0_0_8px_rgba(125,131,250,0.6)]" : "border border-white/20"}`} />
                        <span className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${step.done ? "text-white/30 line-through" : "text-white/70 group-hover/step:text-white"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
