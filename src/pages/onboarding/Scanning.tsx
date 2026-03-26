import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useScanStatus } from "@/hooks/useAartApi";
import { useScanStore, PipelineNodeState } from "@/store/scanStore";
import { PipelineGraph } from "@/components/scanning/PipelineGraph";
import { ScanningTerminal } from "@/components/scanning/ScanningTerminal";

export default function Scanning() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get("scan_id") || undefined;
  const repoName = searchParams.get("repo") || "repository";

  const { data: scan } = useScanStatus(scanId);
  const store = useScanStore();

  // Temporary mock progression hook to simulate the agentic flow visually
  useEffect(() => {
    store.startScan(repoName, 'medium');

    const timeline = [
      { t: 0, node: 'ingestion', log: 'Cloning repository...' },
      { t: 800, node: 'ingestion', log: 'Loaded <span class="text-[#9FE1CB]">12 JS files</span> · 847 loc', setNode: 'completed' },
      { t: 900, node: 'ast', log: 'tree-sitter: parsing routes', setNode: 'active' },
      { t: 1500, node: 'ast', log: 'Security graph linked: 24 nodes · 18 edges', setNode: 'completed', stats: { routes: 8 } },
      { t: 1600, node: 'sast', log: 'SAST: running static rules...', setNode: 'active' },
      { t: 1650, node: 'symbolic', log: 'Symbolic: taint tracking...', setNode: 'active' },
      { t: 1700, node: 'dast', log: 'DAST: booting sandbox :44832', setNode: 'active' },
      { t: 3200, node: 'sast', log: 'Semgrep: <span class="text-[#FAC775]">5 findings</span> (3 HIGH)', type: 'warn', setNode: 'completed', stats: { findings: 5 } },
      { t: 4000, node: 'symbolic', log: 'Tracking <code>GET /invoices/:id</code>... no ownership check detected. <span class="text-[#F0997B]">TAINT_FAIL</span>', type: 'warn', setNode: 'completed' },
      { t: 4100, pendingFinding: { category: 'TAINT_NO_OWNERSHIP_CHECK', summary: 'req.params.id flows into findById() with no userId filter', route: 'GET /invoices/:id', confidence: 0.90 } },
      { t: 4800, node: 'dast', log: 'DAST: 22 checks complete', setNode: 'completed' },
      { t: 5000, node: 'triage', log: 'LLM triage · merging scores', setNode: 'active' },
      { t: 6500, node: 'triage', log: 'Triage complete · 3 finding > T2=0.75', setNode: 'completed', stats: { findings: 3 } },
      { t: 6700, node: 'sandbox', log: 'Sandbox targeting <code>/invoices/:id</code>...', setNode: 'active' },
      { t: 8500, node: 'sandbox', log: '<b>EXPLOIT CONFIRMED</b> · diff extracted', type: 'error', setNode: 'completed' }
    ];

    let timers: NodeJS.Timeout[] = [];
    
    timeline.forEach((step: any) => {
      timers.push(setTimeout(() => {
        if (step.log) {
          store.addLog(step.log, (step.type as any) || (step.setNode === 'active' ? 'active' : 'success'));
        }
        if (step.setNode) {
          store.updateNodeState(step.setNode as any, step.setNode === 'active' ? 'active' : 'completed');
        }
        if (step.stats) {
          store.setStats(step.stats);
        }
        if (step.pendingFinding) {
          store.setPendingFinding(step.pendingFinding);
        }
        
        // Update global progress roughly based on time
        store.setProgress((step.t / 10000) * 100);
      }, step.t));
    });

    timers.push(setTimeout(() => {
      store.completeScan();
      setTimeout(() => navigate(`/onboarding/findings?scan_id=${scanId}&repo=${encodeURIComponent(repoName)}`), 1200);
    }, 10000));

    return () => timers.forEach(clearTimeout);
  }, []); // Run mock simulation once on mount

  const isFailed = scan?.status === "error" || scan?.status === "timeout";
  const isComplete = store.progress === 100;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white flex flex-col pt-12 p-6 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full mx-auto mb-6 z-10 flex items-end justify-between"
      >
        <div>
          <h1 className="font-mono text-xl tracking-wide flex items-center gap-3">
            <span className="text-[#888780]">Live Scan Pipeline</span>
            <span className="text-[#3d3d3a]">/</span>
            <span className="text-white">{repoName}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isComplete ? (
            <div className="flex items-center gap-2 bg-[#111113] border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
              <span className="text-[#1D9E75] font-mono text-xs tracking-wider uppercase">Scanning</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#111113] border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
              <span className="text-[#1D9E75] font-mono text-xs tracking-wider uppercase">Complete</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-6xl w-full mx-auto grid grid-cols-[2fr_1fr] gap-6 flex-1 min-h-[500px] max-h-[700px] z-10"
      >
        {/* Left: Interactive Pipeline Graph */}
        <div className="bg-[#111113] border border-white/5 rounded-xl shadow-2xl relative p-1 overflow-hidden">
          <PipelineGraph 
            nodesState={store.nodes} 
            onNodeClick={(id) => {
              if (id === 'ast') navigate('/ast-visualizer');
            }} 
          />
        </div>

        {/* Right: Terminal Feed */}
        <div className="h-full">
          <ScanningTerminal isFailed={isFailed} isComplete={isComplete} />
        </div>
      </motion.div>
    </div>
  );
}
