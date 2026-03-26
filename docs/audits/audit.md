# AART Implementation Audit (Phase 1 & Foundation)

This document tracks the current implementation status against the goals defined in `PRD/Improvements.md`.

## ✅ PHASE 1: COMPLETED (CORE FIXES)

| ID | Feature | Status | Details |
| :--- | :--- | :--- | :--- |
| **1.1** | Symbolic Engine Taint Tracking | **DONE** | Traces `req.params/body/query` directly to DB sinks. Handles direct and variable-based flow. |
| **1.2** | Router-Level Extraction | **DONE** | Supports `express.Router()` and cross-file handler resolution via `resolver.py`. |
| **1.3** | Enhanced Graph Builder | **DONE** | Added Model nodes, Data Flow edges, and constraint metadata (e.g. `ownership_check`). |
| **1.4** | Patch Validator | **DONE** | Implemented `validate_patch` with sandbox re-testing to verify fixes. |
| **2.2** | Attack Template System | **DONE** | Registry created in `templates.py`. Supports IDOR and PrivEsc patterns. |
| **2.3** | Enhanced Bias Application | **DONE** | Heuristic scanner now accepts `scan_bias_weights` from threat memory. |
| **3.3** | Resource Isolation | **DONE** | Docker container limits (CPU/Mem) added to `harness.py`. |
| **4.1** | Auto Patch PR System | **DONE** | `PRPusher` integrated into `remediation_node` for GitHub automation. |

---

## 🟡 REMAINING GAPS

### 1. Evidence Package (Item 8)
*   **Gap**: `responseDiff` logic remains somewhat naive. `reproScript` is still generic.
*   **Plan**: Refactor `evidence.py` to generate functional `curl` commands from the actual `requests.Response` object.

### 2. Complexity Fast-Path (Item 10)
*   **Gap**: Tier is detected but the pipeline runs the same nodes for all tiers.
*   **Plan**: Modify `pipeline/__init__.py` to skip `symbolic_node` for "Simple" repos if heuristic findings are below a certain risk threshold.

### 3. Scaling & Infrastructure (Phase 3)
*   **Gap**: No multi-scan queue (Celery/Redis). Sandbox is currently serial per repo.
*   **Plan**: Implement a job queue to handle concurrent scan requests.

### 4. Exploit Path Rendering (Item 4.2)
*   **Gap**: Exploit paths are structured in the DB but not rendered visually in the UI.
*   **Plan**: Build a React Flow or Phaser components for the "Exploit Visualization" tab.

---

## 🚀 CURRENT FOCUS: Implementing the Complexity Fast-Path (Optimization)
Proceeding to optimize the pipeline logic to meet PRD's "Simple < 3 min" promise.
