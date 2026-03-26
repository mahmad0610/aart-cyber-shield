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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProofTab } from "@/components/finding/ProofTab";
import { ExploitPathTab } from "@/components/finding/ExploitPathTab";
import { PatchTab } from "@/components/finding/PatchTab";
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
        route: (f as any).route || "/",
        method: (f as any).method || "ANY",
        repo: (f as any).repoName || "Unknown",
        confidence: (f as any).confidence || 0,
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
        
        exploitChain: pathData?.nodes?.map((n: any) => ({
          node: n.id,
          type: n.type,
          detail: n.detail,
          file: n.file,
          line: n.line
        })) || [],
        exploitEdges: pathData?.edges?.map((e: any) => `${e.source} -> ${e.target}`) || [],
        
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
          <TabsList className="bg-white/5 border border-white/10 rounded-none p-1 h-auto flex-wrap mb-4">
            <TabsTrigger value="proof" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Proof</TabsTrigger>
            <TabsTrigger value="exploit" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Exploit_Graph</TabsTrigger>
            <TabsTrigger value="patch" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Patch_PR</TabsTrigger>
            <TabsTrigger value="history" className="rounded-none text-[9px] uppercase tracking-[0.3em] font-bold px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-black transition-all">Ledger</TabsTrigger>
          </TabsList>

          <TabsContent value="proof" className="mt-8 outline-none">
            <ProofTab curlCommand={finding.curlCommand} responseBody={finding.responseBody} />
          </TabsContent>

          <TabsContent value="exploit" className="mt-8 outline-none">
            <ExploitPathTab nodesData={finding.exploitChain} edgesData={finding.exploitEdges} />
          </TabsContent>

          <TabsContent value="patch" className="mt-8 outline-none">
            <PatchTab 
              patchDiff={finding.patchDiff} 
              patchState={finding.patchState} 
              validationSteps={finding.validationSteps} 
              onCreatePR={handleCreatePR} 
              isCreatingPR={createPRMutation.isPending} 
            />
          </TabsContent>

          <TabsContent value="history" className="mt-8 outline-none">
            <Card className="bg-black/60 border border-white/10 rounded-none relative overflow-hidden">
              <CardContent className="p-10">
                <div className="relative">
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-white/10" />
                  <div className="space-y-12">
                    {finding.history.map((event, i) => (
                      <div key={i} className="flex gap-10 relative group/entry">
                        <div className="w-6 h-6 border-2 border-white/10 bg-black flex items-center justify-center shrink-0 z-10 group-hover/entry:border-primary transition-all">
                          <Clock className="w-3 h-3 text-white/30 group-hover/entry:text-primary" />
                        </div>
                        <div className="pb-1 max-w-2xl">
                          <div className="flex items-center gap-4 flex-wrap mb-2">
                            <span className="font-mono text-[11px] font-bold text-white uppercase tracking-widest">{event.event}</span>
                            <div className="font-mono text-[8px] px-2 py-0.5 border border-white/5 bg-white/[0.03] text-white/30 uppercase tracking-[0.2em]">{event.actor}</div>
                          </div>
                          <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed mb-3">{event.description}</p>
                          <p className="font-mono text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">{new Date(event.timestamp).toLocaleString()}</p>
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
