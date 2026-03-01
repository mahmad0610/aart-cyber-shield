import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  GitPullRequest,
  Play,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Github,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Mock data
const mockUser = { name: "Marcus" };
const lastScan = "2026-03-01T09:42:00Z";
const securityGrade = "B+";
const gradeTrend: "up" | "down" = "up";

const stats = [
  { label: "Confirmed Open", value: 7, icon: Shield, color: "text-destructive" },
  { label: "Advisory Open", value: 12, icon: AlertTriangle, color: "text-primary" },
  { label: "Resolved This Week", value: 23, icon: CheckCircle2, color: "text-success" },
  { label: "PRs Scanned", value: 41, icon: GitPullRequest, color: "text-muted-foreground" },
];

type FindingStatus = "confirmed" | "advisory";

interface Finding {
  id: string;
  status: FindingStatus;
  summary: string;
  route: string;
  category: string;
}

const findings: Finding[] = [
  { id: "F-001", status: "confirmed", summary: "User PII exposed via unauthenticated GET /api/users/:id endpoint", route: "GET /api/users/:id", category: "Data Exposure" },
  { id: "F-002", status: "confirmed", summary: "Privilege escalation through role parameter injection on PATCH /api/users", route: "PATCH /api/users", category: "Privilege Escalation" },
  { id: "F-003", status: "confirmed", summary: "IDOR on billing endpoint allows access to other tenants' invoices", route: "GET /api/billing/:id", category: "Data Exposure" },
  { id: "F-004", status: "advisory", summary: "Rate limiting absent on /api/auth/login allows brute force", route: "POST /api/auth/login", category: "Brute Force" },
  { id: "F-005", status: "advisory", summary: "JWT tokens do not expire for 30 days, increasing session hijack window", route: "POST /api/auth/token", category: "Session Management" },
];

const onboardingSteps = [
  { label: "Create account", done: true },
  { label: "Connect your first repo", done: true },
  { label: "Install GitHub App", done: false },
  { label: "Run your first scan", done: false },
  { label: "Review findings", done: false },
];

const isOnboardingComplete = onboardingSteps.every((s) => s.done);
const showGitHubNudge = !onboardingSteps.find((s) => s.label === "Install GitHub App")?.done;
const hasRepos = true; // Toggle to false to see empty state

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const Dashboard = () => {
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const completedSteps = onboardingSteps.filter((s) => s.done).length;
  const onboardingProgress = (completedSteps / onboardingSteps.length) * 100;

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
            <Button className="uppercase tracking-wider text-xs font-semibold rounded-sm">
              Connect Repository <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* GitHub nudge banner */}
      {showGitHubNudge && !nudgeDismissed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-sm border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3">
              <Github className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Install the GitHub App</span>{" "}
                <span className="text-muted-foreground">to enable PR scanning and automated fix suggestions.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" className="uppercase tracking-wider text-xs font-semibold rounded-sm h-8">
                Install <ExternalLink className="ml-1 w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setNudgeDismissed(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Greeting + Health Grade */}
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{mockUser.name}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Last scan: {new Date(lastScan).toLocaleString()}
            </p>
          </div>

          {/* Health Grade */}
          <Card className="bg-card border-border w-fit">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-14 h-14 rounded-sm bg-primary/10 flex items-center justify-center">
                <span className="font-heading text-2xl font-bold text-primary">{securityGrade}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Security Grade</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {gradeTrend === "up" ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-success" />
                      <span className="text-sm text-success font-medium">Improved</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive font-medium">Declined</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground ml-1">vs last week</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Bar */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-heading text-xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Findings List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="lg:col-span-2"
        >
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">
                Top Impact Findings
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider text-primary hover:text-primary">
                View All <ChevronRight className="ml-1 w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {findings.map((finding, i) => (
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
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {finding.summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {finding.route}
                      </p>
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
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={fadeUp}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start uppercase tracking-wider text-xs font-semibold rounded-sm">
                  <Play className="mr-2 w-4 h-4" /> Scan Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start uppercase tracking-wider text-xs font-semibold rounded-sm border-border text-foreground hover:border-primary hover:text-primary"
                >
                  <Shield className="mr-2 w-4 h-4" /> View All Findings
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Onboarding Checklist */}
          {!isOnboardingComplete && (
            <motion.div variants={fadeUp}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">
                    Setup Checklist
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedSteps}/{onboardingSteps.length} complete
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={onboardingProgress} className="h-1.5" />
                  <div className="space-y-2 mt-3">
                    {onboardingSteps.map((step) => (
                      <div
                        key={step.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            step.done ? "text-success" : "text-muted-foreground/40"
                          }`}
                        />
                        <span
                          className={
                            step.done
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }
                        >
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
