import { useState, useEffect } from "react";
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
import api from "@/lib/api";

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

  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const activeTab = searchParams.get("tab") || "proof";
  const setTab = (tab: string) => {
    const p = new URLSearchParams(searchParams);
    p.set("tab", tab);
    setSearchParams(p, { replace: true });
  };

  useEffect(() => {
    const fetchFinding = async () => {
      try {
        const res = await api.get(`/findings/${findingId}`);
        const f = res.data;

        // If it's a mock UUID we can merge it with mockFindings for nice UI demo, else fallback
        const mockFallback = mockFindings[f.id] || mockFindings["F-001"];

        setFinding({
          id: f.id,
          status: f.status,
          impact: f.type || "Data Exposure",
          summary: f.plain_language_summary || "No summary provided",
          route: f.route || "/",
          method: f.method || "GET",
          repo: f.repos?.name || "Unknown",
          confidence: f.final_confidence || 80,
          detectedAt: f.created_at || new Date().toISOString(),
          sandboxPassed: f.status === "confirmed",

          attackType: mockFallback.attackType,
          authContext: mockFallback.authContext,
          targetResource: mockFallback.targetResource,
          attackerUser: mockFallback.attackerUser,
          victimUser: mockFallback.victimUser,
          curlCommand: mockFallback.curlCommand,
          responseBody: mockFallback.responseBody,
          attackerData: mockFallback.attackerData,
          victimData: mockFallback.victimData,
          verdict: f.status === "confirmed" ? mockFallback.verdict : "ADVISORY. Sandbox trace unavailable.",
          exploitChain: mockFallback.exploitChain,
          exploitEdges: mockFallback.exploitEdges,
          patchState: f.status === "confirmed" ? mockFallback.patchState : "pending",
          patchDiff: mockFallback.patchDiff,
          validationSteps: mockFallback.validationSteps,
          history: mockFallback.history
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (findingId) fetchFinding();
  }, [findingId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <div className="space-y-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className={`px-4 py-1.5 border ${finding.status === "confirmed" ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-primary/10 border-primary/30 text-primary"} font-mono text-[10px] uppercase font-bold tracking-[0.3em]`}>
              {finding.status}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">{finding.impact} Detected</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white uppercase italic leading-[1.1]">
            {finding.summary}
          </h1>

          <div className="flex items-center gap-6 flex-wrap font-mono text-[10px] text-white/30 uppercase tracking-widest border-l-2 border-white/10 pl-6">
            <div className="flex flex-col">
              <span className="text-white/60 font-bold">{finding.method} {finding.route}</span>
              <span>TARGET_VECTOR</span>
            </div>
            <div className="w-[1px] h-6 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-primary font-bold">{finding.confidence}% CONFIDENT</span>
              <span>NEURAL_SCORE</span>
            </div>
            <div className="w-[1px] h-6 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-white/60 font-bold">{finding.repo}</span>
              <span>ASSET_ID</span>
            </div>
            <div className="w-[1px] h-6 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-white/60 font-bold">{new Date(finding.detectedAt).toLocaleDateString()}</span>
              <span>SYNC_TIMESTAMP</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="bg-white/5 border border-white/10 rounded-none p-1 h-auto flex-wrap">
            <TabsTrigger value="proof" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Proof</TabsTrigger>
            <TabsTrigger value="exploit" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Exploit_Graph</TabsTrigger>
            <TabsTrigger value="patch" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Patch_PR</TabsTrigger>
            <TabsTrigger value="history" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Ledger</TabsTrigger>
          </TabsList>

          {/* TAB: Proof */}
          <TabsContent value="proof" className="mt-8 space-y-6">
            {finding.sandboxPassed ? (
              <>
                <Card className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-none overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <CardHeader className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Execution Context Vectors</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 py-8 font-mono text-[10px] space-y-4 uppercase tracking-widest text-white/40">
                    <Row label="Attack Strategy" value={finding.attackType} />
                    <Row label="Identity Context" value={finding.authContext} />
                    <Row label="Terminal Vector" value={finding.targetResource} />
                    <div className="h-px w-full bg-white/5 my-4" />
                    <Row label="Infiltrator_ID" value={finding.attackerUser} />
                    <Row label="Compromised_Target" value={finding.victimUser} />
                  </CardContent>
                </Card>

                <Card className="bg-black/80 border border-white/10 rounded-none overflow-hidden group">
                  <CardHeader className="px-8 py-4 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">Payload_Request</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-white/20 hover:text-white transition-colors">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="p-8 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap text-white/60 leading-relaxed">{finding.curlCommand}</pre>
                  </CardContent>
                </Card>

                <Card className="bg-black/80 border border-white/10 rounded-none overflow-hidden group">
                  <CardHeader className="px-8 py-4 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-red-500/50">Exfiltrated_Response</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="p-8 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap text-red-500/80 leading-relaxed">{finding.responseBody}</pre>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white/[0.02] border border-white/10 rounded-none">
                    <CardHeader className="px-6 py-4 border-b border-white/5">
                      <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Source_Node_State</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <pre className="text-[10px] font-mono text-white/40 leading-relaxed uppercase">{finding.attackerData}</pre>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-500/[0.02] border border-red-500/10 rounded-none">
                    <CardHeader className="px-6 py-4 border-b border-red-500/5">
                      <CardTitle className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-red-500/40">Compromised_Asset_State</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <pre className="text-[10px] font-mono text-red-500/60 leading-relaxed uppercase">{finding.victimData}</pre>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Shield className="w-16 h-16 text-primary" />
                  </div>
                  <p className="font-mono text-xs font-bold text-primary uppercase tracking-[0.2em] leading-relaxed relative z-10">
                    [ VERDICT ]: {finding.verdict}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all">
                    <Copy className="mr-2 w-3.5 h-3.5" /> Replicate Script
                  </Button>
                  <Button variant="outline" className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all">
                    <Download className="mr-2 w-3.5 h-3.5" /> Archive Evidence
                  </Button>
                </div>
              </>
            ) : (
              <Card className="bg-black/40 border border-white/10 rounded-none relative overflow-hidden">
                <CardContent className="p-16 text-center">
                  <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-6 opacity-40" />
                  <h3 className="font-heading text-2xl font-bold uppercase tracking-widest text-white italic mb-4">Advisory Signal Identified</h3>
                  <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-10 max-w-lg mx-auto leading-relaxed">
                    This finding was identified through neural pattern matching. Sandbox validation is pending to confirm exfiltration viability.
                  </p>
                  <Button className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all shadow-[0_0_15px_rgba(125,131,250,0.3)]">
                    <Play className="mr-3 w-4 h-4 fill-current" /> Initialize Sandbox Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB: Exploit Path */}
          <TabsContent value="exploit" className="mt-8 space-y-6">
            {/* Visual chain */}
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none hidden md:block">
              <CardHeader className="px-8 py-6 border-b border-white/5">
                <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Neural Traversal Path</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <div className="flex items-start gap-0 overflow-x-auto pb-4 custom-scrollbar">
                  {finding.exploitChain.map((step, i) => (
                    <div key={i} className="flex items-start shrink-0">
                      <div className="flex flex-col items-center w-52 text-center group">
                        <div className={`w-14 h-14 border flex items-center justify-center mb-4 transition-all duration-500 ${step.type === "actor" ? "border-primary/30 bg-primary/5 text-primary" :
                          step.type === "endpoint" ? "border-white/10 bg-white/5 text-white" :
                            step.type === "gap" ? "border-red-500/30 bg-red-500/5 text-red-500" :
                              step.type === "model" ? "border-white/5 bg-white/[0.02] text-white/40" :
                                "border-red-500/30 bg-red-500/5 text-red-500"
                          } group-hover:border-primary group-hover:scale-110`}>
                          {step.type === "actor" && <Shield className="w-6 h-6" />}
                          {step.type === "endpoint" && <Terminal className="w-6 h-6" />}
                          {step.type === "gap" && <AlertTriangle className="w-6 h-6" />}
                          {step.type === "model" && <FileCode className="w-6 h-6" />}
                          {step.type === "data" && <EyeOff className="w-6 h-6" />}
                        </div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white leading-tight px-4">{step.node}</span>
                        <span className="font-mono text-[9px] text-white/30 mt-2 uppercase tracking-widest leading-relaxed px-4 h-8 overflow-hidden">{step.detail}</span>
                        {step.file && (
                          <div className="mt-3 px-3 py-1 bg-black/40 border border-white/5 font-mono text-[8px] text-primary uppercase tracking-tighter hover:border-primary/30 transition-colors">
                            {step.file}:{step.line}
                          </div>
                        )}
                      </div>
                      {i < finding.exploitChain.length - 1 && (
                        <div className="flex flex-col items-center justify-center pt-5 px-0">
                          <div className="w-10 h-px bg-white/10 relative">
                            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1.5 h-1.5 border-t border-r border-white/20 rotate-45" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Text trace */}
            <Card className="bg-black/60 border border-white/10 rounded-none overflow-hidden">
              <CardHeader className="px-8 py-6 border-b border-white/5">
                <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Step-by-Step Logic Proof</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <ol className="space-y-8">
                  {finding.exploitChain.map((step, i) => (
                    <li key={i} className="flex items-start gap-8 group/trace">
                      <div className="w-8 h-8 border border-white/10 bg-white/5 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-white/40 group-hover/trace:border-primary group-hover/trace:text-primary transition-all">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="pt-1">
                        <p className="font-mono text-[11px] font-bold text-white uppercase tracking-widest leading-none mb-2">{step.node}</p>
                        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">{step.detail}</p>
                        {step.file && (
                          <p className="font-mono text-[9px] text-primary uppercase tracking-widest mt-3 flex items-center gap-2">
                            <Terminal className="h-3 w-3" /> {step.file} <span className="opacity-40">LINE</span> {step.line}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                {finding.exploitEdges.length > 0 && (
                  <div className="mt-10 pt-10 border-t border-white/5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] font-bold text-white/20 mb-6">Attack_Vector_Inference_Rules</p>
                    <div className="space-y-3">
                      {finding.exploitEdges.map((edge, i) => (
                        <div key={i} className="font-mono text-[10px] text-white/40 uppercase tracking-widest bg-white/[0.02] border border-white/5 p-4 flex items-center gap-4">
                          <span className="text-primary font-bold">»</span> {edge}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Patch */}
          <TabsContent value="patch" className="mt-8 space-y-6">
            {finding.patchState === "pending" ? (
              <Card className="bg-black/40 border border-white/10 rounded-none">
                <CardContent className="p-16 text-center">
                  <FileCode className="w-12 h-12 text-white/10 mx-auto mb-6" />
                  <h3 className="font-heading text-2xl font-bold uppercase tracking-widest text-white italic mb-4">Patch Generation Required</h3>
                  <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-10 max-w-lg mx-auto leading-relaxed">
                    {finding.status === "advisory"
                      ? "AART has identified the logic gap. Neural patch synthesis is available for confirmed vectors."
                      : "Initialize neural synthesis to generate a verified, sandbox-tested fix for this attack surface."}
                  </p>
                  {finding.status === "confirmed" && (
                    <Button className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all shadow-[0_0_15px_rgba(125,131,250,0.3)]">
                      <Play className="mr-3 w-4 h-4 fill-current" /> Synthesize Neural Patch
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : finding.patchState === "generating" ? (
              <Card className="bg-black/80 border border-white/10 rounded-none overflow-hidden text-center p-16">
                <div className="relative w-16 h-16 mx-auto mb-10">
                  <Loader2 className="w-full h-full text-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white">AI</div>
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase tracking-widest text-white italic mb-4">Neutral Synthesis Initiated</h3>
                <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-10">Analyzing sandbox exfiltration points and crafting deterministic fix…</p>
                <div className="max-w-sm mx-auto space-y-4">
                  {finding.validationSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 transition-all">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-white/20 shrink-0" />
                      )}
                      <span className={`font-mono text-[9px] uppercase tracking-widest ${step.done ? "text-white/40" : "text-white font-bold"}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <>
                {/* Diff */}
                <Card className="bg-black/90 border border-white/10 rounded-none overflow-hidden">
                  <CardHeader className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
                    <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Proposed Code Modification</CardTitle>
                    <div className="font-mono text-[9px] text-primary uppercase font-bold tracking-widest px-3 py-1 border border-primary/20 bg-primary/5">AART_GENERATED_FIX</div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="p-8 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {finding.patchDiff.split("\n").map((line, i) => (
                        <div key={i} className={`px-4 py-0.5 ${line.startsWith("+") ? "bg-green-500/10 text-green-500" :
                          line.startsWith("-") ? "bg-red-500/10 text-red-500" :
                            line.startsWith("@@") ? "bg-primary/10 text-primary opacity-60" :
                              "text-white/40"
                          }`}>
                          {line}
                        </div>
                      ))}
                    </pre>
                  </CardContent>
                </Card>

                {/* Validation Steps */}
                <Card className="bg-black/60 border border-white/10 rounded-none">
                  <CardHeader className="px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Sandbox Verification Proof</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    {finding.validationSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 shadow-sm ${step.done ? "text-primary shadow-primary/20" : "text-white/5"}`} />
                        <span className={step.done ? "text-white/80" : "text-white/20"}>{step.label}</span>
                      </div>
                    ))}
                    {finding.patchState === "verified" && (
                      <div className="mt-8 p-6 bg-primary/10 border border-primary/30 flex items-center justify-between">
                        <p className="font-mono text-[11px] font-bold text-primary uppercase tracking-[0.2em] leading-none italic">
                          PROTOCOL_VERIFICATION_PASSED: Exploit vector successfully neutralized.
                        </p>
                        <Shield className="w-5 h-5 text-primary opacity-40" />
                      </div>
                    )}
                    {finding.patchState === "failed" && (
                      <div className="mt-8 p-6 bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                        <p className="font-mono text-[11px] font-bold text-red-500 uppercase tracking-[0.2em] leading-none italic">
                          VERIFICATION_FAILED: Logic gap persists. Synthesizing iterative fix…
                        </p>
                        <AlertTriangle className="w-5 h-5 text-red-500 opacity-40" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB: History */}
          <TabsContent value="history" className="mt-8">
            <Card className="bg-black/60 border border-white/10 rounded-none relative overflow-hidden">
              <CardHeader className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Neural Ledger Entries</CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <div className="relative">
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-white/10" />
                  <div className="space-y-12">
                    {finding.history.map((event, i) => (
                      <div key={i} className="flex gap-10 relative group/entry">
                        <div className="w-6 h-6 border-2 border-white/10 bg-black flex items-center justify-center shrink-0 z-10 group-hover/entry:border-primary group-hover/entry:shadow-[0_0_10px_rgba(125,131,250,0.5)] transition-all">
                          <Clock className="w-3 h-3 text-white/30 group-hover/entry:text-primary" />
                        </div>
                        <div className="pb-1 max-w-2xl">
                          <div className="flex items-center gap-4 flex-wrap mb-2">
                            <span className="font-mono text-[11px] font-bold text-white uppercase tracking-widest">{event.event}</span>
                            <div className="font-mono text-[8px] px-2 py-0.5 border border-white/5 bg-white/[0.03] text-white/30 uppercase tracking-[0.2em]">{event.actor}</div>
                          </div>
                          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed mb-3 group-hover/entry:text-white/60 transition-colors">{event.description}</p>
                          <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">{new Date(event.timestamp).toLocaleString().replace(',', ' ·')}</p>
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
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-2xl">
          <div className="max-w-[1280px] mx-auto px-10 py-5 flex items-center justify-between gap-6 overflow-x-auto">
            <div className="flex items-center gap-4 shrink-0">
              <Button
                className="hacktron-clip bg-white hover:bg-white/90 text-black uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all disabled:opacity-20"
                disabled={finding.patchState !== "verified" || finding.status !== "confirmed"}
              >
                <GitPullRequest className="mr-3 w-4 h-4" /> Create Fix Pull Request
              </Button>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all"
                onClick={() => setFpModalOpen(true)}
              >
                <Flag className="mr-2 w-3.5 h-3.5" /> Flag False Positive
              </Button>
              <Button variant="outline" className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all">
                <Play className="mr-2 w-3.5 h-3.5" /> Force Re-Assessment
              </Button>
              <Button variant="outline" className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all">
                <Download className="mr-2 w-3.5 h-3.5" /> Export Intelligence
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* False Positive Feedback Modal */}
      <Dialog open={fpModalOpen} onOpenChange={setFpModalOpen}>
        <DialogContent className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-none sm:max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(125,131,250,0.5)]" />
          <DialogHeader>
            <DialogTitle className="font-mono text-[11px] font-bold uppercase tracking-[0.4em] text-white">
              [ Corrective Feedback Loop ]
            </DialogTitle>
            <DialogDescription className="font-mono text-[9px] text-white/40 uppercase tracking-widest mt-2 leading-relaxed">
              Your intelligence update will calibrate AART threat memory for this sector and future assessments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-6">
            {[
              "Sandbox constraints misaligned with production environment.",
              "Target vector inaccessible in runtime sector.",
              "Security abstraction layer detected (non-parsable).",
              "Intentional risk tolerance / designated exception.",
              "Neural misclassification - Pattern mismatch.",
            ].map((option) => (
              <label
                key={option}
                className={`flex items-start gap-4 p-4 border transition-all cursor-pointer group ${fpRadio === option
                  ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(125,131,250,0.1)]"
                  : "border-white/5 bg-white/[0.02] hover:border-white/20"
                  }`}
              >
                <input
                  type="radio"
                  name="fp-reason"
                  value={option}
                  checked={fpRadio === option}
                  onChange={() => setFpRadio(option)}
                  className="mt-1 accent-primary"
                />
                <span className={`font-mono text-[10px] uppercase tracking-widest ${fpRadio === option ? "text-white font-bold" : "text-white/40 group-hover:text-white/60"}`}>{option}</span>
              </label>
            ))}
          </div>
          <Textarea
            placeholder="ADDITIONAL_NEURAL_CONTEXT_REQUIRED…"
            className="bg-black/60 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest rounded-none min-h-[100px] mt-6 focus:border-primary/50 transition-all placeholder:text-white/10"
            value={fpContext}
            onChange={(e) => setFpContext(e.target.value)}
          />
          <DialogFooter className="mt-8 flex-col sm:flex-row gap-4">
            <Button variant="outline" className="hacktron-clip border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-8 hover:bg-white/5 transition-all" onClick={() => { setFpModalOpen(false); setFpRadio(""); setFpContext(""); }}>
              Abort
            </Button>
            <Button
              className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-8 transition-all shadow-[0_0_15px_rgba(125,131,250,0.2)]"
              disabled={!fpRadio}
              onClick={() => {
                setFpModalOpen(false);
                setFpRadio("");
                setFpContext("");
                import("@/hooks/use-toast").then(({ toast }) => {
                  toast({
                    title: "Intelligence Calibrated",
                    description: "Neural weights adjusted for this pattern in sector-repo-1.",
                  });
                });
              }}
            >
              Calibrate Engine
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
