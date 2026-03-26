import { motion } from 'framer-motion';

interface FindingPreviewProps {
  category: string;
  summary: string;
  route: string;
  confidence: number;
}

export function FindingPreviewCard({ category, summary, route, confidence }: FindingPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mt-4 bg-[#1A1A1E] border border-[#D85A30] border-l-4 rounded-lg p-3 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-[#4A1B0C] border border-[#D85A30]/30 text-[#F0997B] text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
          Candidate Match
        </div>
        <span className="text-[10px] text-[#888780] font-mono">conf {confidence.toFixed(2)}</span>
        <span className="ml-auto text-[10px] text-[#888780] font-mono uppercase">{route}</span>
      </div>
      
      <div className="text-[11px] font-bold text-[#D3D1C7] font-mono mb-1 uppercase tracking-tight">
        {category}
      </div>
      
      <div className="text-[10px] text-[#888780] leading-relaxed">
        {summary}
      </div>
      
      <div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#5F5E5A] bg-black/40 p-2 rounded">
        <span className="text-[#D85A30]">!</span>
        AART symbolic engine tracing user controlled data flow into sensitive sink without authorization check.
      </div>
    </motion.div>
  );
}
