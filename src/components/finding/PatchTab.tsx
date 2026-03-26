import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, GitPullRequest } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatchTabProps {
  patchDiff: string;
  patchState: string;
  validationSteps: any[];
  onCreatePR: () => void;
  isCreatingPR: boolean;
}

export function PatchTab({ patchDiff, patchState, validationSteps, onCreatePR, isCreatingPR }: PatchTabProps) {
  
  // Example mock patching state if empty for display
  const isGenerating = patchState === 'generating' || patchState === 'pending';
  const steps = validationSteps.length > 0 ? validationSteps : [
    { label: 'Drafting patch struct...', done: true },
    { label: 'Applying patch in sandbox...', done: patchState === 'verified' },
    { label: 'Rebuilding express app...', done: patchState === 'verified' },
    { label: 'Re-executing exploit...', done: patchState === 'verified' },
    { label: 'Exploit blocked (HTTP 401)', done: patchState === 'verified' }
  ];

  const diffNew = `const invoice = await Invoice.findOne({
  _id: req.params.id,
  userId: req.user.id
});
if (!invoice) return res.status(404).json({ error: 'Not found' });`;

  const diffOld = `const invoice = await Invoice.findById(req.params.id);`;

  const safeDiff = patchDiff || (patchState === 'verified' ? `--- Before\n+++ After\n@@ -34,1 +34,4 @@\n- ${diffOld}\n+ ${diffNew}` : '');

  // Extract old / new strings safely from unified diff if real
  let oldCode = diffOld;
  let newCode = diffNew;
  
  if (safeDiff && safeDiff.includes('@@')) {
      const parts = safeDiff.split('@@')[1].split('\n').filter(Boolean);
      // naive parse for visualization
      oldCode = parts.filter(p => !p.startsWith('+')).map(p => p.replace(/^- /, '')).join('\n');
      newCode = parts.filter(p => !p.startsWith('-')).map(p => p.replace(/^\+ /, '')).join('\n');
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 animate-in fade-in duration-500">
      
      {/* Diff Viewer Area */}
      <div className="bg-[#111113] rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[500px]">
        <div className="flex items-center px-4 py-3 bg-black/40 border-b border-white/5">
          <span className="font-mono text-[11px] text-[#888780] uppercase tracking-wider">Patch Diff — LLM Drafted</span>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar p-2 relative">
          {isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#7F77DD]" />
              <p className="font-mono text-xs text-[#888780]">Drafting patch structure...</p>
            </div>
          ) : (
            <ReactDiffViewer 
              oldValue={oldCode} 
              newValue={newCode} 
              splitView={true} 
              useDarkTheme={true}
              styles={{
                variables: {
                  dark: {
                    diffViewerBackground: 'transparent',
                    addedBackground: 'rgba(29, 158, 117, 0.1)',
                    addedColor: '#9FE1CB',
                    removedBackground: 'rgba(216, 90, 48, 0.1)',
                    removedColor: '#F0997B',
                    wordAddedBackground: 'rgba(29, 158, 117, 0.3)',
                    wordRemovedBackground: 'rgba(216, 90, 48, 0.3)',
                  }
                },
                line: { fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.6 }
              }}
            />
          )}
        </div>
      </div>

      {/* Validation Panel */}
      <div className="bg-[#111113] rounded-xl border border-white/5 shadow-xl p-5 flex flex-col">
        <h3 className="font-mono text-[11px] text-[#888780] uppercase tracking-wider mb-6">Execution Check</h3>
        
        <div className="space-y-4 flex-1">
          {steps.map((step: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 + 0.5 }}
              className="flex items-center gap-3 font-mono text-xs"
            >
              <div className="shrink-0 relative">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1D9E75]" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-[#5F5E5A] rounded-full mx-[5px]" />
                )}
              </div>
              <span className={step.done ? 'text-white/90' : 'text-white/40'}>{step.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <Button 
            className="w-full bg-[#1D9E75] hover:bg-[#15805d] text-white font-mono text-[11px] uppercase tracking-wider py-5"
            onClick={onCreatePR}
            disabled={!patchState.includes('verified') || isCreatingPR}
          >
            {isCreatingPR ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitPullRequest className="w-4 h-4 mr-2" />}
            {patchState.includes('verified') ? 'Create Fix PR' : 'Awaiting Validation'}
          </Button>
        </div>
      </div>

    </div>
  );
}
