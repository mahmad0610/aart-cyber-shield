<system-reminder>
Your operational mode has changed from plan to build.
You are no longer in read-only mode.
You are permitted to make file changes, run shell commands, and utilize your arsenal of tools as needed.
</system-reminder>

# PRD v2 — Context & Expanded Architecture (reference all content from prd/prd.md)

Context: This document expands the prior PRD (prd/prd.md) by preserving the original architecture intent while adding explicit sequencing, maturation milestones, and cross-cutting concerns. It carries the full context of the previous plan and augments it with concrete, testable steps and an expanded triage/prompt model.

1) Recap of the prior plan (context)
- Sandbox already runs Docker with nmap, metasploit, nikto, sqlmap, nuclei inside containers.
- Architecture centers on a 7-layer stack; Tree-sitter and AST graph (Layer 2) feed simultaneous SAST, DAST, and Active Scanning (Layer 3); results merge into LangGraph pipeline.
- The AST engine’s unified security graph enables language-agnostic node mappings across frameworks.
- Active scanning is integrated into the sandbox environment without extra infra.
- A 30+ rule registry under a unified security graph aims for broad universal coverage.
- AI triage layer fuses SAST, DAST, and Active Scan findings into a single decision point.
- Master Fix Prompt consolidates scan output into a patch-ready artifact.

2) Architecture — the 7-layer stack (same mapping, clarified)
- Layer 2: Tree-sitter + AST graph
- Layer 3: SAST, DAST, Active Scanning (parallel)
- Layer 4: LangGraph pipeline (integration/merging)
- Layer 5: Unified Security Graph (language-agnostic abstraction)
- Layer 6: AST engine enhancements + Rule Registry
- Layer 7: AI triage & Master Fix Prompt output

3) Phase 0 — immediate blockers (ingestion/)
- 3 tasks, as in v1:
  - Replace esprima with tree-sitter: one pip install + one file change
  - Recursive route extraction using AST walk
  - Add Semgrep as Python library and wire findings into LangGraph

4) Phase 1 — DAST agent (week 1-2)
- DAST agent runs inside the harness, performing 25 structured HTTP checks against the live app
- Each check yields a SymbolicFinding with deterministic confidence where applicable

5) Phase 2 — Active scanning tools (week 2)
- ActiveScanner runs nuclei, nikto, etc., within a dedicated tools container
- sqlmap is gated to suspected endpoints flagged by SAST

6) Phase 3 — Comprehensive rule engine (week 3)
- Build 30+ rule classes in rules/registry.py
- Each rule uses match(node, graph) => Optional[SymbolicFinding]
- All rules operate on the USG/LangGraph, language-agnostic

7) AI triage layer — advanced decision logic
- Triaging prompts unify 3 sources and decide final confidence, escalate flag
- Example: CORS misconfig detected by Semgrep and confirmed by DAST => high confidence, no sandbox escalation

8) Output: Master Fix Prompt
- The final artifact is a single, copyable patch pack
- Structure includes:
  - Critical fixes
  - Advisory fixes
  - Configuration-only fixes
  - Step-by-step execution order
  - Verification steps between each patch

9) Plan for future work (srd)
- After completing Phase 0-3, replicate this approach for srd (Security Requirements Document) similarly, with a mirrored structure and artifact generation process.

10) Open questions (to resolve before implementation)
- Confirm file naming and versioning strategy for PRDs (prd.md vs prd.md v1/v2 references)
- Decide whether prdv2.md should be a faithful clone with added sections, or a separate doc that cross-references prd/prd.md
- Confirm patch format and integration workflow with your CI

Next actions
- Confirm preferred structure for prdv2 (copy-with-augmentation vs standalone doc with references)
- Once confirmed (Plan Mode off), I’ll provide a precise patch to apply to the repo
