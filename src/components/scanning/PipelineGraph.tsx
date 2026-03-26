import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  Background,
  MarkerType,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { useScanStore } from '@/store/scanStore';
import '@xyflow/react/dist/style.css';
import { AgentNode, AgentState } from './AgentNode';

const nodeTypes = {
  agent: AgentNode,
};

interface PipelineGraphProps {
  nodesState: {
    ingestion: AgentState;
    ast: AgentState;
    sast: AgentState;
    symbolic: AgentState;
    dast: AgentState;
    triage: AgentState;
    sandbox: AgentState;
  };
  onNodeClick?: (nodeId: string) => void;
}

const edgeStyles = `
  @keyframes flowEdge {
    0% { stroke-dashoffset: 24; }
    100% { stroke-dashoffset: 0; }
  }
  .react-flow__edge-path.active-path {
    stroke-dasharray: 6 3;
    animation: flowEdge 0.8s linear infinite;
  }
`;

export function PipelineGraph({ nodesState, onNodeClick }: PipelineGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { progress, stats } = useScanStore();
  const [elapsed, setElapsed] = useState('0.0s');

  useEffect(() => {
    if (!stats.startTime) return;
    const interval = setInterval(() => {
      const diff = (Date.now() - stats.startTime) / 1000;
      setElapsed(diff.toFixed(1) + 's');
    }, 100);
    return () => clearInterval(interval);
  }, [stats.startTime]);

  useEffect(() => {
    // Determine active flow based on which node is currently 'active'
    const newNodes: Node[] = [
      {
        id: 'ingestion',
        type: 'agent',
        position: { x: 50, y: 50 },
        data: {
          label: 'Repo ingestion',
          subLabel: nodesState.ingestion === 'completed' ? '12 files · 847 loc' : 'Cloning repo...',
          variant: 'blue',
          state: nodesState.ingestion,
          onClick: () => onNodeClick?.('ingestion')
        }
      },
      {
        id: 'ast',
        type: 'agent',
        position: { x: 280, y: 50 },
        data: {
          label: 'tree-sitter AST',
          subLabel: nodesState.ast === 'completed' ? `${stats.routes} routes · 3 MW` : (nodesState.ast === 'active' ? 'Parsing routes...' : 'waiting'),
          variant: 'blue',
          state: nodesState.ast,
          onClick: () => onNodeClick?.('ast')
        }
      },
      {
        id: 'security_graph',
        type: 'agent',
        position: { x: 510, y: 50 },
        data: {
          label: 'Security graph',
          subLabel: nodesState.ast === 'completed' ? '24 nodes · 18 edges' : (nodesState.ast === 'active' ? 'Linking endpoints...' : 'waiting'),
          variant: 'purple',
          state: nodesState.ast, // ties to AST phase
          onClick: () => onNodeClick?.('security_graph')
        }
      },
      // Parallel Tier 2 Layer
      {
        id: 'sast',
        type: 'agent',
        position: { x: 50, y: 150 },
        data: {
          label: 'SAST engine',
          subLabel: nodesState.sast === 'completed' ? `${stats.findings} findings tracked` : (nodesState.sast === 'active' ? 'Semgrep rules...' : 'waiting'),
          variant: 'gray',
          state: nodesState.sast,
          onClick: () => onNodeClick?.('sast')
        }
      },
      {
        id: 'symbolic',
        type: 'agent',
        position: { x: 280, y: 150 },
        data: {
          label: 'Symbolic engine',
          subLabel: nodesState.symbolic === 'completed' ? '3 IDOR candidates' : (nodesState.symbolic === 'active' ? 'Taint tracking...' : 'waiting'),
          variant: 'purple',
          state: nodesState.symbolic,
          onClick: () => onNodeClick?.('symbolic')
        }
      },
      {
        id: 'dast',
        type: 'agent',
        position: { x: 510, y: 150 },
        data: {
          label: 'DAST + nuclei',
          subLabel: nodesState.dast === 'completed' ? '22 checks finished' : (nodesState.dast === 'active' ? 'Sandbox port :44832' : 'waiting'),
          variant: 'gray',
          state: nodesState.dast,
          onClick: () => onNodeClick?.('dast')
        }
      },
      // Triage
      {
        id: 'triage',
        type: 'agent',
        position: { x: 280, y: 250 },
        data: {
          label: 'LLM triage · Scout',
          subLabel: nodesState.triage === 'completed' ? '12 in · 3 > T2=0.75' : (nodesState.triage === 'active' ? 'Merging scores...' : 'waiting cascade'),
          variant: 'teal',
          state: nodesState.triage,
          onClick: () => onNodeClick?.('triage')
        }
      },
      // Execution / Sandbox Layer
      {
        id: 'sandbox',
        type: 'agent',
        position: { x: 160, y: 350 },
        data: {
          label: 'Exploit sandbox',
          subLabel: nodesState.sandbox === 'completed' ? 'EXPLOIT CONFIRMED' : (nodesState.sandbox === 'active' ? 'Targeting /invoices/:id...' : 'waiting T2 threshold'),
          variant: 'coral',
          state: nodesState.sandbox,
          onClick: () => onNodeClick?.('sandbox')
        }
      },
      {
        id: 'patch',
        type: 'agent',
        position: { x: 400, y: 350 },
        data: {
          label: 'Patch validator',
          subLabel: nodesState.sandbox === 'completed' ? 'Fix pending...' : 'waiting exploit',
          variant: 'gray',
          state: nodesState.sandbox === 'completed' ? 'active' : 'pending',
          onClick: () => onNodeClick?.('patch')
        }
      }
    ];

    const generateEdgeOptions = (isActive: boolean, isSuccess: boolean = false) => ({
      animated: isActive,
      className: isActive ? 'active-path' : '',
      style: { stroke: isActive ? '#1D9E75' : (isSuccess ? '#1D9E75' : '#3d3d3a'), strokeWidth: isActive || isSuccess ? 1.5 : 1 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isActive ? '#1D9E75' : (isSuccess ? '#1D9E75' : '#3d3d3a'),
      }
    });

    const newEdges: Edge[] = [
      { id: 'e1', source: 'ingestion', target: 'ast', sourceHandle: 'right', targetHandle: 'left', ...generateEdgeOptions(nodesState.ingestion === 'active', nodesState.ast !== 'pending') },
      { id: 'e2', source: 'ast', target: 'security_graph', sourceHandle: 'right', targetHandle: 'left', ...generateEdgeOptions(nodesState.ast === 'active', nodesState.sast !== 'pending') },
      
      { id: 'e3', source: 'security_graph', target: 'sast', sourceHandle: 'bottom', targetHandle: 'top', type: 'step', ...generateEdgeOptions(nodesState.sast === 'active', nodesState.sast === 'completed') },
      { id: 'e4', source: 'security_graph', target: 'symbolic', sourceHandle: 'bottom', targetHandle: 'top', type: 'step', ...generateEdgeOptions(nodesState.symbolic === 'active', nodesState.symbolic === 'completed') },
      { id: 'e5', source: 'security_graph', target: 'dast', sourceHandle: 'bottom', targetHandle: 'top', type: 'step', ...generateEdgeOptions(nodesState.dast === 'active', nodesState.dast === 'completed') },

      { id: 'e6', source: 'sast', target: 'triage', sourceHandle: 'bottom', targetHandle: 'left', type: 'step', ...generateEdgeOptions(nodesState.triage === 'active', nodesState.triage === 'completed') },
      { id: 'e7', source: 'symbolic', target: 'triage', sourceHandle: 'bottom', targetHandle: 'top', type: 'step', ...generateEdgeOptions(nodesState.triage === 'active', nodesState.triage === 'completed') },
      { id: 'e8', source: 'dast', target: 'triage', sourceHandle: 'bottom', targetHandle: 'right', type: 'step', ...generateEdgeOptions(nodesState.triage === 'active', nodesState.triage === 'completed') },
      
      { id: 'e9', source: 'triage', target: 'sandbox', sourceHandle: 'bottom', targetHandle: 'top', type: 'step', ...generateEdgeOptions(nodesState.sandbox === 'active', nodesState.sandbox === 'completed') },
      { id: 'e10', source: 'triage', target: 'patch', sourceHandle: 'bottom', targetHandle: 'top', type: 'step', ...generateEdgeOptions(nodesState.sandbox === 'completed') }
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [nodesState, setNodes, setEdges, onNodeClick, stats.findings, stats.routes]);

  const dashArray = useMemo(() => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return { circumference, offset };
  }, [progress]);

  return (
    <div className="w-full h-full bg-[#0D0D0F] rounded-xl overflow-hidden font-mono relative">
      <style>{edgeStyles}</style>
      
      {/* Floating Stats Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 p-8 flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <div className="flex gap-8">
            <div className="space-y-1">
              <span className="text-[10px] text-[#888780] uppercase tracking-wider block">Routes</span>
              <span className="text-xl text-[#9FE1CB] font-bold">{stats.routes}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#888780] uppercase tracking-wider block">Findings</span>
              <span className="text-xl text-[#FAC775] font-bold">{stats.findings}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#888780] uppercase tracking-wider block">Elapsed</span>
              <span className="text-xl text-[#B4B2A9] font-bold">{elapsed}</span>
            </div>
          </div>

          <div className="relative w-24 h-24 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="36" fill="none" stroke="#2C2C2A" strokeWidth="6" />
                <motion.circle 
                  cx="48" cy="48" r="36" fill="none" stroke="#1D9E75" strokeWidth="6" 
                  strokeDasharray={dashArray.circumference}
                  animate={{ strokeDashoffset: dashArray.offset }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                <span className="text-lg font-bold text-[#9FE1CB]">{Math.round(progress)}%</span>
                <span className="text-[7px] text-[#888780] uppercase tracking-widest">loaded</span>
             </div>
          </div>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background gap={24} size={1} color="#3d3d3a" />
      </ReactFlow>
    </div>
  );
}

