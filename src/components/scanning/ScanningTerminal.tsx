import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanStore } from '@/store/scanStore';
import { Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

import { FindingPreviewCard } from './FindingPreviewCard';

export function ScanningTerminal({ isFailed, isComplete }: { isFailed: boolean, isComplete: boolean }) {
  const { logs, pendingFinding } = useScanStore();
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs, pendingFinding]);

  return (
    <div className="flex flex-col h-full bg-[#111113] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
      {/* Title Bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20">
        <Terminal className="w-4 h-4 text-[#1D9E75]" />
        <span className="font-mono text-[11px] text-[#888780] uppercase tracking-wider">Execution Log</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={termRef} 
        className="p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-[1.8] text-[#B4B2A9]"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -5, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              className="flex items-start gap-3 mb-1.5"
            >
              <div className="mt-0.5 shrink-0">
                {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#1D9E75]" />}
                {log.type === 'info' && <span className="text-[#888780] text-lg leading-none">·</span>}
                {log.type === 'warn' && <AlertCircle className="w-3.5 h-3.5 text-[#FAC775]" />}
                {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                {log.type === 'active' && <Loader2 className="w-3.5 h-3.5 text-[#7F77DD] animate-spin" />}
              </div>
              
              <div className="flex gap-3 w-full">
                <span className="text-[#888780] shrink-0 w-10">
                  {((log.timestamp - (logs[0]?.timestamp || log.timestamp)) / 1000).toFixed(1)}s
                </span>
                <span className="break-all" dangerouslySetInnerHTML={{ __html: log.message }} />
              </div>
            </motion.div>
          ))}
          
          {pendingFinding && (
            <FindingPreviewCard {...pendingFinding} />
          )}
        </AnimatePresence>

        {!isFailed && !isComplete && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block w-2.5 h-4 bg-[#1D9E75] ml-16 mt-2 opacity-80"
          />
        )}
      </div>
    </div>
  );
}
