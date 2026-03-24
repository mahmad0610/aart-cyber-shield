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
import {
  useFindingDetail,
  useFindingEvidence,
  useFindingExploitPath,
  useFindingEvents,
  useIgnoreFinding,
  useRerunExploit,
  usePatchRecord,
  useGeneratePatch,
  useCreatePR,
} from "@/hooks/useAartApi";
import { toast } from "@/hooks/use-toast";
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
  const [finding, setFinding] = useState<FindingData | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "proof");

  const setTab = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ ...Object.fromEntries(searchParams.entries()), tab }, { replace: true });
  };

  const { data: detailData, isPending: loadingDetail } = useFindingDetail(findingId);
  const { data: evidenceData, isPending: loadingEvidence } = useFindingEvidence(findingId, { enabled: detailData?.status === 'confirmed' });
  const { data: pathData, isPending: loadingPath } = useFindingExploitPath(findingId, { enabled: detailData?.status === 'confirmed' });
  const { data: eventsData, isPending: loadingEvents } = useFindingEvents(findingId);
  const patchQuery = usePatchRecord(findingId);
  const { data: patchData, isPending: loadingPatch } = patchQuery;
  const generatePatchMutation = useGeneratePatch();
  const createPRMutation = useCreatePR();

  const patchState = generatePatchMutation.isPending ? "generating" : (patchData?.status as any) || (patchData as any)?.patch_state || "pending";
  const patchDiff = patchData?.patch_diff || "";
  const validationSteps = (patchData?.validation_steps as any[]) || [];

  const ignoreMutation = useIgnoreFinding();
  const rerunMutation = useRerunExploit();

  const handleCreatePR = () => {
    if (!findingId) return;
    createPRMutation.mutate(findingId, {
      onSuccess: (data) => {
        toast({
          title: "Pull Request Dispatched",
          description: `Draft PR has been created: ${data.pr_url || "Check GitHub"}`,
        });
      },
      onError: (err: any) => {
        toast({
          title: "Dispatch Failed",
          description: err.response?.data?.detail || "Failed to create PR. Check backend logs.",
          variant: "destructive",
        });
      }
    });
  };

  const handleRerun = () => {
    if (!findingId) return;
    rerunMutation.mutate(findingId, {
      onSuccess: () => {
        toast({
          title: "Assessment Initialized",
          description: "Manual sandbox re-test has been queued.",
        });
      }
    });
  };

  const loading = loadingDetail;

  useEffect(() => {
    if (!loadingDetail && detailData) {
      const f = detailData;
      const evidence = evidenceData || ({} as any);
      const path = pathData || { nodes: [], edges: [] };
      const events = eventsData || [];
      
      const patch = patchData || { status: "pending", patch_diff: "", validation_steps: [] as any[] };
      setFinding({
        id: f.id,
        status: f.status as FindingStatus,
        impact: f.category || "Data Exposure",
        summary: f.summary || "No summary provided",
        route: f.route || "/",
        method: f.method || "ANY",
        repo: f.repoName || "Unknown",
        confidence: f.confidence || 0,
        detectedAt: f.created_at || new Date().toISOString(),
        sandboxPassed: f.status === "confirmed",

        attackType: typeof evidence.attack_type === 'object' ? JSON.stringify(evidence.attack_type) : (evidence.attack_type || "Unknown Attack Vector"),
        authContext: typeof evidence.auth_context === 'object' ? JSON.stringify(evidence.auth_context) : (evidence.auth_context || "Unauthenticated"),
        targetResource: evidence.target_resource || "Unknown",
        attackerUser: typeof evidence.attacker_user === 'object' ? JSON.stringify(evidence.attacker_user) : (evidence.attacker_user || "N/A"),
        victimUser: typeof evidence.victim_user === 'object' ? JSON.stringify(evidence.victim_user) : (evidence.victim_user || "N/A"),
        curlCommand: evidence.curl_command || "No evidence output",
        responseBody: typeof evidence.response_body === 'object' ? JSON.stringify(evidence.response_body, null, 2) : (evidence.response_body || "No evidence output"),
        attackerData: typeof evidence.attacker_data === 'object' ? JSON.stringify(evidence.attacker_data, null, 2) : (evidence.attacker_data || "N/A"),
        victimData: typeof evidence.victim_data === 'object' ? JSON.stringify(evidence.victim_data, null, 2) : (evidence.victim_data || "N/A"),
        verdict: evidence.verdict || (f.status === "confirmed" ? "CONFIRMED" : "ADVISORY"),
        
        exploitChain: pathData?.nodes?.map((n: GraphNode) => ({
          node: n.id,
          type: n.type,
          detail: n.detail,
          file: (n as any).file, // metadata might have file
          line: (n as any).line
        })) || [],
        exploitEdges: pathData?.edges?.map((e: GraphEdge) => `${e.source} -> ${e.target}`) || [],
        
        patchState: (patchData as any)?.status || (patchData as any)?.patch_state || "pending",
        patchDiff: patchData?.patch_diff || "",
        validationSteps: (patchData?.validation_steps as any) || [],
        
        history: (eventsData || []).map((e: any) => ({
          timestamp: e.created_at,
          actor: e.actor || "System",
          event: e.type || e.event,
          description: e.detail || e.description
        }))
      });
    }
  }, [detailData, evidenceData, pathData, eventsData, loadingDetail]);

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
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2" onClick={() => navigate("/findings")}>
          <ArrowLeft className="mr-1 w-4 h-4" /> Findings
        </Button>
        {isActionable && (
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              className="text-white/60 hover:text-white border-white/10 hover:bg-white/5 uppercase tracking-widest text-[10px] font-bold h-9"
              onClick={() => {
                if (findingId) {
                  rerunMutation.mutate(findingId, {
                    onSuccess: () => {
                      import("@/hooks/use-toast").then(({ toast }) => {
                        toast({ title: "Exploit Re-run Initiated", description: "The sandbox is verifying this attack vector again." });
                      });
                    }
                  });
                }
              }}
              disabled={rerunMutation.isPending}
            >
              {rerunMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Play className="w-3 h-3 mr-2" />}
              Re-run Exploit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white/60 hover:text-white border-white/10 hover:bg-white/5 uppercase tracking-widest text-[10px] font-bold h-9"
              onClick={() => setFpModalOpen(true)}
            >
              <EyeOff className="w-3 h-3 mr-2" />
              Mark False Positive
            </Button>
          </div>
        )}
      </div>

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
            {patchState === "pending" ? (
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
                    <Button
                      className="hacktron-clip bg-primary hover:bg-primary/90 text-white uppercase tracking-[0.2em] text-[10px] font-bold h-12 px-8 transition-all shadow-[0_0_15px_rgba(125,131,250,0.3)]"
                      onClick={() => {
                        if (!findingId) return;
                        generatePatchMutation.mutate(findingId, {
                          onSuccess: () => patchQuery.refetch(),
                        });
                      }}
                      disabled={generatePatchMutation.isPending}
                    >
                      {generatePatchMutation.isPending ? (
                        <Loader2 className="mr-3 w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="mr-3 w-4 h-4 fill-current" />
                      )}
                      Synthesize Neural Patch
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : patchState === "generating" ? (
              <Card className="bg-black/80 border border-white/10 rounded-none overflow-hidden text-center p-16">
                <div className="relative w-16 h-16 mx-auto mb-10">
                  <Loader2 className="w-full h-full text-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white">AI</div>
                </div>
                <h3 className="font-heading text-2xl font-bold uppercase tracking-widest text-white italic mb-4">Neutral Synthesis Initiated</h3>
                <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-10">Analyzing sandbox exfiltration points and crafting deterministic fix…</p>
                <div className="max-w-sm mx-auto space-y-4">
                  {validationSteps.map((step, i) => (
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
                      {patchDiff.split("\n").map((line, i) => (
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
                    {validationSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 shadow-sm ${step.done ? "text-primary shadow-primary/20" : "text-white/5"}`} />
                        <span className={step.done ? "text-white/80" : "text-white/20"}>{step.label}</span>
                      </div>
                    ))}
                    {patchState === "verified" && (
                      <div className="mt-8 p-6 bg-primary/10 border border-primary/30 flex items-center justify-between">
                        <p className="font-mono text-[11px] font-bold text-primary uppercase tracking-[0.2em] leading-none italic">
                          PROTOCOL_VERIFICATION_PASSED: Exploit vector successfully neutralized.
                        </p>
                        <Shield className="w-5 h-5 text-primary opacity-40" />
                      </div>
                    )}
                    {patchState === "failed" && (
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
                disabled={patchState !== "verified" || finding.status !== "confirmed" || createPRMutation.isPending}
                onClick={handleCreatePR}
              >
                {createPRMutation.isPending ? (
                  <Loader2 className="mr-3 w-4 h-4 animate-spin" />
                ) : (
                  <GitPullRequest className="mr-3 w-4 h-4" />
                )} 
                Create Fix Pull Request
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
              <Button 
                variant="outline" 
                className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all"
                onClick={handleRerun}
                disabled={rerunMutation.isPending}
              >
                {rerunMutation.isPending ? <Loader2 className="mr-2 w-3 h-3 animate-spin" /> : <Play className="mr-2 w-3.5 h-3.5" />} 
                Force Re-Assessment
              </Button>
              <Button 
                variant="outline" 
                className="hacktron-clip bg-white/5 border-white/10 text-white uppercase tracking-[0.2em] text-[9px] font-bold h-10 px-6 hover:bg-white/10 transition-all"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(finding, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `AART_Finding_${finding.id}.json`;
                  a.click();
                }}
              >
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
                if (!findingId || !fpRadio) return;
                ignoreMutation.mutate({ findingId, reason: fpRadio + (fpContext ? " - " + fpContext : "") }, {
                  onSuccess: () => {
                    setFpModalOpen(false);
                    setFpRadio("");
                    setFpContext("");
                    import("@/hooks/use-toast").then(({ toast }) => {
                      toast({
                        title: "Intelligence Calibrated",
                        description: "Neural weights adjusted for this pattern. Finding ignored.",
                      });
                    });
                    navigate("/findings");
                  }
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

function Row({ label, value }: { label: string; value: any }) {
  const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground text-right">{displayValue}</span>
    </div>
  );
}

export default FindingDetail;
