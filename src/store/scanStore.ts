import { create } from 'zustand';

export type PipelineNodeState = 'pending' | 'active' | 'completed' | 'error';

export interface ScanningState {
  isScanning: boolean;
  repoName: string;
  repoTier: 'simple' | 'medium' | 'complex';
  nodes: {
    ingestion: PipelineNodeState;
    ast: PipelineNodeState;
    sast: PipelineNodeState;
    symbolic: PipelineNodeState;
    dast: PipelineNodeState;
    triage: PipelineNodeState;
    sandbox: PipelineNodeState;
  };
  logs: { id: string; message: string; timestamp: number; type: 'info' | 'success' | 'warn' | 'error' | 'active' }[];
  progress: number;
  stats: {
    routes: number;
    findings: number;
    startTime: number;
    estimatedTime: number;
  };
  pendingFinding?: {
    category: string;
    summary: string;
    route: string;
    confidence: number;
  };
}

interface ScanStore extends ScanningState {
  startScan: (repoName: string, repoTier: 'simple' | 'medium' | 'complex') => void;
  updateNodeState: (node: keyof ScanningState['nodes'], state: PipelineNodeState) => void;
  addLog: (message: string, type: 'info' | 'success' | 'warn' | 'error' | 'active') => void;
  setProgress: (progress: number) => void;
  setStats: (stats: Partial<ScanningState['stats']>) => void;
  setPendingFinding: (finding?: ScanningState['pendingFinding']) => void;
  completeScan: () => void;
  reset: () => void;
}

const initialState: ScanningState = {
  isScanning: false,
  repoName: '',
  repoTier: 'simple',
  progress: 0,
  nodes: {
    ingestion: 'pending',
    ast: 'pending',
    sast: 'pending',
    symbolic: 'pending',
    dast: 'pending',
    triage: 'pending',
    sandbox: 'pending',
  },
  logs: [],
  stats: {
    routes: 0,
    findings: 0,
    startTime: 0,
    estimatedTime: 45000,
  },
  pendingFinding: undefined,
};

export const useScanStore = create<ScanStore>((set) => ({
  ...initialState,

  startScan: (repoName, repoTier) => set({ 
    ...initialState, 
    isScanning: true, 
    repoName, 
    repoTier,
    nodes: { ...initialState.nodes, ingestion: 'active' },
    logs: [{ id: 'start', message: `Initializing pipeline for ${repoName}`, timestamp: Date.now(), type: 'info' }],
    stats: { ...initialState.stats, startTime: Date.now() }
  }),

  updateNodeState: (node, state) => set((prev) => ({
    nodes: { ...prev.nodes, [node]: state }
  })),

  addLog: (message, type) => set((prev) => ({
    logs: [...prev.logs, { id: Math.random().toString(36).substring(7), message, timestamp: Date.now(), type }]
  })),

  setProgress: (progress) => set({ progress }),

  setStats: (stats) => set((prev) => ({
    stats: { ...prev.stats, ...stats }
  })),

  setPendingFinding: (pendingFinding) => set({ pendingFinding }),

  completeScan: () => set({ isScanning: false, progress: 100, pendingFinding: undefined }),

  reset: () => set(initialState)
}));
