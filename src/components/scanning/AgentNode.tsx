import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type AgentVariant = 'blue' | 'purple' | 'teal' | 'coral' | 'gray';
export type AgentState = 'pending' | 'active' | 'completed' | 'error';

interface AgentNodeData extends Record<string, unknown> {
  label: string;
  subLabel: string;
  variant: AgentVariant;
  state: AgentState;
  onClick?: () => void;
}

const VARIANTS = {
  blue: {
    bg: '#042C53',
    border: '#185FA5',
    textPrimary: '#85B7EB',
    textSecondary: '#378ADD',
    dot: '#378ADD'
  },
  purple: {
    bg: '#26215C',
    border: '#534AB7',
    textPrimary: '#AFA9EC',
    textSecondary: '#7F77DD',
    dot: '#7F77DD'
  },
  teal: {
    bg: '#04342C',
    border: '#1D9E75',
    textPrimary: '#9FE1CB',
    textSecondary: '#1D9E75',
    dot: '#1D9E75'
  },
  coral: {
    bg: '#4A1B0C',
    border: '#D85A30',
    textPrimary: '#F0997B',
    textSecondary: '#D85A30',
    dot: '#D85A30'
  },
  gray: {
    bg: '#1A1A1E',
    border: '#5F5E5A',
    textPrimary: '#B4B2A9',
    textSecondary: '#888780',
    dot: '#5F5E5A'
  }
};

const pulseKeyframes = `
  @keyframes pulseRng {
    0% { transform: scale(1); opacity: 1; }
    70% { transform: scale(1.6); opacity: 0; }
    100% { transform: scale(1.6); opacity: 0; }
  }
`;

export const AgentNode = memo(({ data }: NodeProps<Node<AgentNodeData>>) => {
  const isCompleted = data.state === 'completed';
  const isActive = data.state === 'active';
  const isPending = data.state === 'pending';
  
  // Completed nodes turn teal (except coral blocks which stay coral to emphasize danger found)
  const variant = (isCompleted && data.variant !== 'coral') ? 'teal' : (isPending ? 'gray' : data.variant);
  const colors = VARIANTS[variant];

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div 
        onClick={data.onClick}
        className="relative group transition-transform duration-300 ease-out hover:-translate-y-0.5"
        style={{
          width: '180px',
          padding: '12px 16px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          cursor: data.onClick ? 'pointer' : 'default',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <Handle type="target" position={Position.Top} className="!opacity-0" />
        <Handle type="target" id="left" position={Position.Left} className="!opacity-0" />
        
        <div className="flex items-center gap-2 mb-1">
          <div className="relative w-2 h-2">
             {isActive && (
               <div 
                 className="absolute inset-0 rounded-full" 
                 style={{ background: colors.dot, animation: 'pulseRng 1.4s cubic-bezier(.2,.5,.8,1) infinite' }}
               />
             )}
             <div className="absolute inset-0 rounded-full" style={{ background: colors.dot }} />
          </div>
          <span className="font-mono text-[11px] font-semibold" style={{ color: colors.textPrimary }}>
            {data.label}
          </span>
        </div>
        
        <div className="font-mono text-[9px] mt-1 line-clamp-2 leading-relaxed" style={{ color: colors.textSecondary }}>
          {data.subLabel}
        </div>

        <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        <Handle type="source" id="right" position={Position.Right} className="!opacity-0" />
      </div>
    </>
  );
});
