import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Copy,
  Download,
  GitPullRequest,
  Play,
  Flag,
  Clock,
  Terminal,
  ArrowRight,
  Loader2,
  FileCode,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type FindingStatus = "confirmed" | "advisory" | "resolved" | "ignored";

interface FindingData {
  id: string;
  status: FindingStatus;
  impact: string;
  summary: string;
  route: string;
  method: string;
  repo: string;
  confidence: number;
  sandboxPassed: boolean;
  detectedAt: string;
  // Proof
  attackType: string;
  authContext: string;
  targetResource: string;
  attackerUser: string;
  victimUser: string;
  curlCommand: string;
  responseBody: string;
  attackerData: string;
  victimData: string;
  verdict: string;
  // Exploit path
  exploitChain: { node: string; type: string; detail: string; file?: string; line?: number }[];
  exploitEdges: string[];
  // Patch
  patchState: "pending" | "generating" | "verified" | "failed";
  patchDiff: string;
  validationSteps: { label: string; done: boolean }[];
  // History
  history: { timestamp: string; actor: string; event: string; description: string }[];
}

const mockFindings: Record<string, FindingData> = {
  "F-001": {
    id: "F-001",
    status: "confirmed",
    impact: "Data Exposure",
    summary: "User PII exposed via unauthenticated GET /api/users/:id endpoint",
    route: "/api/users/:id",
    method: "GET",
    repo: "api-gateway",
    confidence: 98,
    sandboxPassed: true,
    detectedAt: "2026-02-28T14:22:00Z",
    attackType: "IDOR — Insecure Direct Object Reference",
    authContext: "Attacker authenticated as user_123 (role: member, JWT bearer token)",
    targetResource: "User record of user_456",
    attackerUser: "user_123 (attacker@test.com)",
    victimUser: "user_456 (victim@test.com)",
    curlCommand: `curl -X GET https://app.acme.com/api/users/user_456 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json"`,
    responseBody: `{
  "id": "user_456",
  "email": "victim@test.com",
  "name": "Jane Doe",
  "ssn": "***-**-1234",
  "phone": "+1-555-0199",
  "address": "742 Evergreen Terrace"
}`,
    attackerData: `{ "id": "user_123", "email": "attacker@test.com" }`,
    victimData: `{ "id": "user_456", "email": "victim@test.com", "ssn": "***-**-1234" }`,
    verdict: "CONFIRMED — Attacker user_123 retrieved full PII of victim user_456 without ownership validation.",
    exploitChain: [
      { node: "Attacker (user_123)", type: "actor", detail: "Authenticated as member role" },
      { node: "GET /api/users/:id", type: "endpoint", detail: "No ownership check on :id parameter", file: "src/routes/users.ts", line: 42 },
      { node: "Missing auth middleware", type: "gap", detail: "Route only checks isAuthenticated, not isOwner", file: "src/middleware/auth.ts", line: 18 },
      { node: "User model", type: "model", detail: "Direct database read with full field projection", file: "src/models/User.ts", line: 15 },
      { node: "Victim PII (user_456)", type: "data", detail: "Email, SSN, phone, address returned in response" },
    ],
    exploitEdges: [
      "Authenticated request → GET /api/users/:id",
      "No ownership constraint → Direct database read",
      "Full field projection → Victim PII returned",
    ],
    patchState: "verified",
    patchDiff: `--- a/src/routes/users.ts
+++ b/src/routes/users.ts
@@ -40,6 +40,10 @@ router.get('/users/:id', isAuthenticated, async (req, res) => {
-  const user = await User.findById(req.params.id);
+  const user = await User.findById(req.params.id);
+
+  if (user.id !== req.user.id && req.user.role !== 'admin') {
+    return res.status(403).json({ error: 'Forbidden' });
+  }
+
   res.json(user);
 });`,
    validationSteps: [
      { label: "Apply patch", done: true },
      { label: "Rebuild application", done: true },
      { label: "Re-execute exploit", done: true },
      { label: "Confirm fix blocks exploit", done: true },
    ],
    history: [
      { timestamp: "2026-02-28T14:22:00Z", actor: "System", event: "Detected", description: "Static analysis identified missing ownership check on user endpoint" },
      { timestamp: "2026-02-28T14:23:12Z", actor: "System", event: "Sandbox executed", description: "Exploit sandbox ran IDOR test with two synthetic users" },
      { timestamp: "2026-02-28T14:23:18Z", actor: "System", event: "Confirmed", description: "Attacker successfully retrieved victim PII — finding confirmed at 98% confidence" },
      { timestamp: "2026-02-28T16:05:00Z", actor: "System", event: "Patch suggested", description: "Ownership check patch generated and submitted for validation" },
      { timestamp: "2026-02-28T16:07:42Z", actor: "System", event: "Patch verified", description: "All 4 validation steps passed — exploit no longer reproducible" },
    ],
  },
  "F-004": {
    id: "F-004",
    status: "advisory",
    impact: "Brute Force",
    summary: "Rate limiting absent on /api/auth/login allows brute force",
    route: "/api/auth/login",
    method: "POST",
    repo: "api-gateway",
    confidence: 72,
    sandboxPassed: false,
    detectedAt: "2026-02-28T14:22:00Z",
    attackType: "Brute Force — Missing Rate Limit",
    authContext: "Unauthenticated",
    targetResource: "Login endpoint",
    attackerUser: "N/A",
    victimUser: "N/A",
    curlCommand: "",
    responseBody: "",
    attackerData: "",
    victimData: "",
    verdict: "ADVISORY — No sandbox execution. Static analysis indicates missing rate limit configuration.",
    exploitChain: [
      { node: "Unauthenticated attacker", type: "actor", detail: "No credentials needed to attempt" },
      { node: "POST /api/auth/login", type: "endpoint", detail: "No rate limiting middleware applied", file: "src/routes/auth.ts", line: 12 },
      { node: "Missing rate limiter", type: "gap", detail: "express-rate-limit not imported or configured" },
    ],
    exploitEdges: [
      "Unlimited requests → POST /api/auth/login",
      "No rate limit → Credential stuffing possible",
    ],
    patchState: "pending",
    patchDiff: "",
    validationSteps: [
      { label: "Apply patch", done: false },
      { label: "Rebuild application", done: false },
      { label: "Re-execute exploit", done: false },
      { label: "Confirm fix blocks exploit", done: false },
    ],
    history: [
      { timestamp: "2026-02-28T14:22:00Z", actor: "System", event: "Detected", description: "Static analysis identified missing rate limit on login endpoint" },
    ],
  },
};

const statusIcons: Record<FindingStatus, typeof Shield> = {
  confirmed: Shield,
  advisory: AlertTriangle,
  resolved: CheckCircle2,
  ignored: EyeOff,
};

const statusBadgeVariant: Record<FindingStatus, string> = {
  confirmed: "destructive",
  advisory: "secondary",
  resolved: "outline",
  ignored: "outline",
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const FindingDetail = () => {
  const { findingId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [fpModalOpen, setFpModalOpen] = useState(false);
  const [fpRadio, setFpRadio] = useState("");
  const [fpContext, setFpContext] = useState("");

  const activeTab = searchParams.get("tab") || "proof";
  const setTab = (tab: string) => {
    const p = new URLSearchParams(searchParams);
    p.set("tab", tab);
    setSearchParams(p, { replace: true });
  };

  const finding = mockFindings[findingId || ""];

  if (!finding) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="bg-card border-border max-w-md w-full text-center">
          <CardContent className="p-10">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-3">Finding Not Found</h2>
            <p className="text-muted-foreground text-sm mb-6">This finding doesn't exist or has been removed.</p>
            <Button variant="outline" className="uppercase tracking-wider text-xs font-semibold rounded-sm" onClick={() => navigate("/findings")}>
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Findings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusIcons[finding.status];
  const isActionable = finding.status === "confirmed" || finding.status === "advisory";

  return (
    <div className="p-6 md:p-8 max-w-[1280px] mx-auto space-y-6 pb-24">
      {/* Back */}
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2" onClick={() => navigate("/findings")}>
        <ArrowLeft className="mr-1 w-4 h-4" /> Findings
      </Button>

      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={statusBadgeVariant[finding.status] as any} className="rounded-sm text-[10px] uppercase tracking-wider">
              {finding.status}
            </Badge>
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">{finding.impact}</span>
          </div>
          <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight leading-tight">
            {finding.summary}
          </h1>
          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
            <span className="font-mono">{finding.method} {finding.route}</span>
            <span>·</span>
            <span>{finding.confidence}% confidence</span>
            <span>·</span>
            <span>{finding.sandboxPassed ? "Sandbox ✓" : "No sandbox"}</span>
            <span>·</span>
            <span className="font-mono">{finding.repo}</span>
            <span>·</span>
            <span>{new Date(finding.detectedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="bg-muted rounded-sm w-full sm:w-auto">
            <TabsTrigger value="proof" className="rounded-sm text-xs uppercase tracking-wider">Proof</TabsTrigger>
            <TabsTrigger value="exploit" className="rounded-sm text-xs uppercase tracking-wider">Exploit Path</TabsTrigger>
            <TabsTrigger value="patch" className="rounded-sm text-xs uppercase tracking-wider">Patch</TabsTrigger>
            <TabsTrigger value="history" className="rounded-sm text-xs uppercase tracking-wider">History</TabsTrigger>
          </TabsList>

          {/* TAB: Proof */}
          <TabsContent value="proof" className="mt-6 space-y-4">
            {finding.sandboxPassed ? (
              <>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Attack Execution</CardTitle>
                  </CardHeader>
                  <CardContent className="font-mono text-xs space-y-3">
                    <Row label="Attack Type" value={finding.attackType} />
                    <Row label="Auth Context" value={finding.authContext} />
                    <Row label="Target" value={finding.targetResource} />
                    <Separator />
                    <Row label="Attacker" value={finding.attackerUser} />
                    <Row label="Victim" value={finding.victimUser} />
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-background border border-border rounded-sm p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap text-muted-foreground">{finding.curlCommand}</pre>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-background border border-border rounded-sm p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap text-destructive/80">{finding.responseBody}</pre>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">Attacker's Own Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-background border border-border rounded-sm p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">{finding.attackerData}</pre>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-heading text-xs font-bold uppercase tracking-wider text-destructive">Victim's Data (Exposed)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-background border border-destructive/30 rounded-sm p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap text-destructive/80">{finding.victimData}</pre>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-card border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-primary font-mono">{finding.verdict}</p>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="uppercase tracking-wider text-[10px] font-semibold rounded-sm border-border">
                    <Copy className="mr-1 w-3 h-3" /> Copy Script
                  </Button>
                  <Button variant="outline" size="sm" className="uppercase tracking-wider text-[10px] font-semibold rounded-sm border-border">
                    <Download className="mr-1 w-3 h-3" /> Download Evidence
                  </Button>
                </div>
              </>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-bold uppercase tracking-tight mb-2">Advisory — No Sandbox Execution</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    This finding was identified through static analysis. No exploit sandbox was run because the vulnerability pattern could not be automatically confirmed.
                  </p>
                  <Button className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                    <Play className="mr-2 w-4 h-4" /> Run Sandbox Test
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB: Exploit Path */}
          <TabsContent value="exploit" className="mt-6 space-y-4">
            {/* Visual chain */}
            <Card className="bg-card border-border hidden md:block">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Attack Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-0 overflow-x-auto pb-2">
                  {finding.exploitChain.map((step, i) => (
                    <div key={i} className="flex items-start shrink-0">
                      <button className="group flex flex-col items-center w-40 text-center">
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-2 transition-colors ${
                          step.type === "actor" ? "bg-primary/10 text-primary" :
                          step.type === "endpoint" ? "bg-muted text-foreground" :
                          step.type === "gap" ? "bg-destructive/10 text-destructive" :
                          step.type === "model" ? "bg-muted text-muted-foreground" :
                          "bg-destructive/10 text-destructive"
                        } group-hover:ring-1 group-hover:ring-primary/50`}>
                          {step.type === "actor" && <Shield className="w-5 h-5" />}
                          {step.type === "endpoint" && <Terminal className="w-5 h-5" />}
                          {step.type === "gap" && <AlertTriangle className="w-5 h-5" />}
                          {step.type === "model" && <FileCode className="w-5 h-5" />}
                          {step.type === "data" && <EyeOff className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground leading-tight">{step.node}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 leading-tight">{step.detail}</span>
                        {step.file && (
                          <span className="text-[9px] font-mono text-primary mt-1">{step.file}:{step.line}</span>
                        )}
                      </button>
                      {i < finding.exploitChain.length - 1 && (
                        <div className="flex flex-col items-center justify-center pt-4 px-1">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Text trace (always shown on mobile, also shown below graph on desktop) */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Deterministic Trace</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {finding.exploitChain.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{step.node}</p>
                        <p className="text-xs text-muted-foreground">{step.detail}</p>
                        {step.file && (
                          <p className="text-[10px] font-mono text-primary mt-0.5">{step.file}:{step.line}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {finding.exploitEdges.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Edge labels</p>
                    <div className="space-y-1">
                      {finding.exploitEdges.map((edge, i) => (
                        <p key={i} className="text-xs text-muted-foreground font-mono">→ {edge}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Patch */}
          <TabsContent value="patch" className="mt-6 space-y-4">
            {finding.patchState === "pending" ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <FileCode className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-bold uppercase tracking-tight mb-2">Patch Not Generated</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {finding.status === "advisory"
                      ? "This is an advisory finding. Manual guidance is recommended."
                      : "Generate a verified fix for this vulnerability."}
                  </p>
                  {finding.status === "confirmed" && (
                    <Button className="uppercase tracking-wider text-xs font-semibold rounded-sm">
                      <Play className="mr-2 w-4 h-4" /> Generate Patch
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : finding.patchState === "generating" ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-bold uppercase tracking-tight mb-2">Generating & Validating</h3>
                  <p className="text-sm text-muted-foreground mb-6">Drafting patch and running sandbox validation…</p>
                  <div className="max-w-xs mx-auto space-y-2">
                    {finding.validationSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {step.done ? (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                        )}
                        <span className={step.done ? "text-muted-foreground" : "text-foreground"}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Diff */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Suggested Fix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-background border border-border rounded-sm p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                      {finding.patchDiff.split("\n").map((line, i) => (
                        <span key={i} className={
                          line.startsWith("+") ? "text-success" :
                          line.startsWith("-") ? "text-destructive" :
                          line.startsWith("@@") ? "text-primary" :
                          "text-muted-foreground"
                        }>
                          {line}{"\n"}
                        </span>
                      ))}
                    </pre>
                  </CardContent>
                </Card>

                {/* Validation Steps */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Validation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {finding.validationSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${step.done ? "text-success" : "text-muted-foreground/30"}`} />
                        <span className={step.done ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
                      </div>
                    ))}
                    {finding.patchState === "verified" && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm font-semibold text-success font-mono">✓ Fix verified — exploit no longer reproducible</p>
                      </div>
                    )}
                    {finding.patchState === "failed" && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm font-semibold text-destructive font-mono">✗ Patch failed validation — drafting alternative…</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB: History */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-sm font-bold uppercase tracking-wider">Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {finding.history.map((event, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center shrink-0 z-10">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="pb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{event.event}</span>
                            <Badge variant="outline" className="rounded-sm text-[9px] uppercase tracking-wider">{event.actor}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Sticky Action Bar */}
      {isActionable && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="max-w-[1280px] mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto">
            <Button
              className="uppercase tracking-wider text-xs font-semibold rounded-sm shrink-0"
              disabled={finding.patchState !== "verified" || finding.status !== "confirmed"}
            >
              <GitPullRequest className="mr-1 w-4 h-4" /> Create Fix PR
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="uppercase tracking-wider text-[10px] font-semibold rounded-sm border-border shrink-0"
              onClick={() => setFpModalOpen(true)}
            >
              <Flag className="mr-1 w-3 h-3" /> False Positive
            </Button>
            <Button variant="outline" size="sm" className="uppercase tracking-wider text-[10px] font-semibold rounded-sm border-border shrink-0">
              <Play className="mr-1 w-3 h-3" /> Re-run Exploit
            </Button>
            <Button variant="outline" size="sm" className="uppercase tracking-wider text-[10px] font-semibold rounded-sm border-border shrink-0">
              <Download className="mr-1 w-3 h-3" /> Download Evidence
            </Button>
          </div>
        </div>
      )}

      {/* False Positive Feedback Modal */}
      <Dialog open={fpModalOpen} onOpenChange={setFpModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-sm font-bold uppercase tracking-wider">Why isn't this a real issue?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your feedback trains AART's threat memory so future scans for this repo won't repeat this pattern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              "The sandbox test doesn't reflect our real auth setup.",
              "This route isn't accessible in production.",
              "The check exists in a layer AART doesn't parse yet.",
              "The risk is acceptable for this use case.",
              "Other.",
            ].map((option) => (
              <label
                key={option}
                className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-colors ${
                  fpRadio === option
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <input
                  type="radio"
                  name="fp-reason"
                  value={option}
                  checked={fpRadio === option}
                  onChange={() => setFpRadio(option)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
          <Textarea
            placeholder="Optional: add more context…"
            className="bg-background border-border rounded-sm min-h-[80px]"
            value={fpContext}
            onChange={(e) => setFpContext(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" className="rounded-sm text-xs uppercase tracking-wider" onClick={() => { setFpModalOpen(false); setFpRadio(""); setFpContext(""); }}>
              Cancel
            </Button>
            <Button
              className="rounded-sm text-xs uppercase tracking-wider font-semibold"
              disabled={!fpRadio}
              onClick={() => {
                setFpModalOpen(false);
                setFpRadio("");
                setFpContext("");
                // Show toast
                import("@/hooks/use-toast").then(({ toast }) => {
                  toast({
                    title: "Feedback received",
                    description: "This finding is now marked as Ignored. Future scans for this repo will be adjusted.",
                  });
                });
              }}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}

export default FindingDetail;
