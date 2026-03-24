import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "./use-toast";

// --- Types ---
export interface ConnectRepoPayload {
  github_url: string;
  name: string;
  full_name: string;
}

export interface ConnectRepoResponse {
  repo_id: string;
  scan_id: string;
  status: string;
}

export interface ScanStatusResponse {
  id: string;
  repo_id: string;
  status: string; // "queued" | "running" | "complete" | "error" | "timeout"
  progress_percent: number;
  current_step: string;
  tier?: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface DashboardStats {
  grade: string;
  grade_trend: "up" | "down" | "flat";
  confirmed: number;
  advisory: number;
  resolved: number;
  scanned_prs: number;
  has_repos: boolean;
  resolved_this_week?: number;
  prs_scanned_this_week?: number;
}

export interface RepoSummary {
  id: string;
  name: string;
  owner: string;
  grade: string | null;
  confirmedFindings: number;
  advisoryFindings: number;
  tier: string;
  lastScanned: string | null;
  scanning: boolean;
  githubAppConnected: boolean;
  clone_url: string;
}

export interface RepoDetail extends RepoSummary {
  full_name: string;
  stack_detected?: string;
  auth_type?: string;
  route_count?: number;
  model_count?: number;
  role_count?: number;
  // Backend fingerprint fields (from queries.py)
  stack?: string;
  num_routes?: number;
  num_models?: number;
  num_roles?: number;
  gradeHistory?: { grade: string; date: string }[];
}

export interface ScanHistoryItem {
  id: string;
  started_at: string;
  completed_at: string | null;
  tier: string;
  trigger: string; // manual, pr, scheduled
  pr_number: number | null;
  status: string;
  confirmed_findings: number;
  advisory_findings: number;
}

export interface Finding {
  id: string;
  repo_id: string;
  status: string; // confirmed, advisory, resolved, ignored
  summary: string;
  route: string;
  category: string;
  impact_type: string;
  impact_priority: number;
  confidence: number;
  runtime_validated: boolean;
  repoName: string;
  created_at: string;
}

export interface EvidencePackage {
  id: string;
  finding_id: string;
  attack_type: string;
  attacker_id: string;
  victim_id: string;
  method: string;
  url: string;
  request_headers: Record<string, string>;
  request_body: unknown;
  attacker_status: number;
  attacker_response_headers: Record<string, string>;
  attacker_response_body: unknown;
  victim_status?: number;
  victim_response_headers?: Record<string, string>;
  victim_response_body?: unknown;
  attacker_role: string;
  created_at: string;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  color: string;
  detail: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ExploitPath {
  id: string;
  finding_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  deterministic_trace: unknown[];
}

export interface ExploitPathSummary {
  id: string;
  repo_id: string;
  summary: string;
  route: string;
  category: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  deterministic_trace: unknown[];
}

export interface PatchRecord {
  id: string;
  finding_id: string;
  patch_diff: string;
  patch_explanation: string;
  validation_steps: unknown[];
  retest_result: string;
  fix_verified: boolean;
  pr_url?: string;
  created_at: string;
}

export interface FindingEvent {
  id: string;
  finding_id: string;
  type: string;
  actor: string;
  detail: string;
  created_at: string;
}

// --- Hooks ---

// 1. Onboarding
export const useConnectRepo = () => {
  return useMutation({
    mutationFn: async (payload: ConnectRepoPayload) => {
      const { data } = await api.post<ConnectRepoResponse>("/repos/connect", payload);
      return data;
    },
  });
};

export const useStartScan = () => {
  return useMutation({
    mutationFn: async (payload: { repo_url: string }) => {
      const { data } = await api.post<{ status: string; scan_id: string }>("/scan", payload);
      return data;
    },
  });
};

export const useScanStatus = (scanId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!scanId) return;

    const channel = supabase
      .channel(`scan_updates_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          queryClient.setQueryData(['scans', scanId], payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, queryClient]);

  return useQuery({
    queryKey: ["scans", scanId],
    queryFn: async () => {
      if (!scanId) return null;
      const { data } = await api.get<ScanStatusResponse>(`/scans/${scanId}`);
      return data;
    },
    enabled: !!scanId,
    // Refetch every 10s as a fallback (longer than before since we have realtime)
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "running" || status === "queued" ? 10000 : false;
    },
  });
};

// 2. Dashboards
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>("/dashboard/stats");
      return data;
    },
  });
};

export const useRepos = () => {
  return useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
      const { data } = await api.get<RepoSummary[]>("/repos");
      return data;
    },
  });
};

export const useExploitPaths = () => {
  return useQuery({
    queryKey: ["exploit-paths"],
    queryFn: async () => {
      const { data } = await api.get<ExploitPathSummary[]>("/exploit-paths");
      return data;
    },
  });
};

export const useThreatMemory = (repoId?: string) => {
  return useQuery({
    queryKey: ["threat-memory", repoId],
    queryFn: async () => {
      if (!repoId) return null;
      const { data } = await api.get<any>(`/threat-memory/${repoId}`);
      return data;
    },
    enabled: !!repoId,
  });
};

export const usePatchRecord = (findingId?: string) => {
  return useQuery({
    queryKey: ["patch", findingId],
    queryFn: async () => {
      if (!findingId) return null;
      const { data } = await api.get<any>(`/findings/${findingId}/patch`);
      return data;
    },
    enabled: !!findingId,
  });
};

export const useGeneratePatch = () => {
  return useMutation({
    mutationFn: async (findingId: string) => {
      const { data } = await api.post<any>(`/findings/${findingId}/patch`);
      return data;
    },
  });
};

export const useRepoDetail = (repoId?: string) => {
  return useQuery({
    queryKey: ["repos", repoId],
    queryFn: async () => {
      if (!repoId) return null;
      const { data } = await api.get<RepoDetail>(`/repos/${repoId}`);
      return data;
    },
    enabled: !!repoId,
    refetchInterval: (query) => {
      return query.state.data?.scanning ? 5000 : false;
    },
  });
};

export const useRepoScans = (repoId?: string) => {
  return useQuery({
    queryKey: ["repos", repoId, "scans"],
    queryFn: async () => {
      if (!repoId) return null;
      const { data } = await api.get<ScanHistoryItem[]>(`/repos/${repoId}/scans`);
      return data;
    },
    enabled: !!repoId,
  });
};

// 3. Findings
interface FindingsParams {
  status?: string;
  repo_id?: string;
  limit?: number;
  sort?: string;
}

export const useFindings = (params: FindingsParams = {}) => {
  return useQuery({
    queryKey: ["findings", params],
    queryFn: async () => {
      const { data } = await api.get<Finding[]>("/findings", { params });
      return data;
    },
  });
};

export const useFindingDetail = (findingId?: string) => {
  return useQuery({
    queryKey: ["findings", findingId],
    queryFn: async () => {
      if (!findingId) return null;
      const { data } = await api.get<Finding>(`/findings/${findingId}`);
      return data;
    },
    enabled: !!findingId,
  });
};

export const useFindingEvidence = (findingId?: string) => {
  return useQuery({
    queryKey: ["findings", findingId, "evidence"],
    queryFn: async () => {
      if (!findingId) return null;
      const { data } = await api.get<EvidencePackage>(`/findings/${findingId}/evidence`);
      return data;
    },
    enabled: !!findingId,
  });
};

export const useFindingExploitPath = (findingId?: string) => {
  return useQuery({
    queryKey: ["findings", findingId, "path"],
    queryFn: async () => {
      if (!findingId) return null;
      const { data } = await api.get<ExploitPath>(`/findings/${findingId}/path`);
      return data;
    },
    enabled: !!findingId,
  });
};

export const useFindingEvents = (findingId?: string) => {
  return useQuery({
    queryKey: ["findings", findingId, "events"],
    queryFn: async () => {
      if (!findingId) return null;
      const { data } = await api.get<FindingEvent[]>(`/findings/${findingId}/events`);
      return data;
    },
    enabled: !!findingId,
  });
};

// 4. Actions
export const useIgnoreFinding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ findingId, reason }: { findingId: string; reason: string }) => {
      const { data } = await api.post(`/findings/${findingId}/ignore`, { reason });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["findings"] });
      queryClient.invalidateQueries({ queryKey: ["findings", variables.findingId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
};

export const useRerunExploit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (findingId: string) => {
      const { data } = await api.post(`/findings/${findingId}/rerun`);
      return data;
    },
    onSuccess: (_, findingId) => {
      queryClient.invalidateQueries({ queryKey: ["findings", findingId, "events"] });
    },
  });
};
export const useDeleteRepo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repoId: string) => {
      const { data } = await api.delete(`/repos/${repoId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
};

export const useResetMemory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (repoId: string) => {
      const { data } = await api.post(`/repos/${repoId}/reset-memory`);
      return data;
    },
    onSuccess: (_, repoId) => {
      queryClient.invalidateQueries({ queryKey: ["threat-memory", repoId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
};

export const useCreatePR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (findingId: string) => {
      const { data } = await api.post(`/findings/${findingId}/pr`);
      return data;
    },
    onSuccess: (_, findingId) => {
      queryClient.invalidateQueries({ queryKey: ["findings", findingId, "patch"] });
      queryClient.invalidateQueries({ queryKey: ["findings", findingId, "events"] });
    },
  });
};

export const useExportData = () => {
  return useQuery({
    queryKey: ["user", "export"],
    queryFn: async () => {
      const { data } = await api.get("/export");
      return data;
    },
    enabled: false, // Manual trigger only
  });
};
