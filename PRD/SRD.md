AART_SRD_v3.md
markdown
# AART System Requirements Document (SRD) v3

## 1. Purpose

Build a developer-first SaaS (AART) that continuously executes attacker-mode reasoning against API-first web apps using a LangGraph-orchestrated, deterministic-first hybrid pipeline. AART doesn't flag vulnerabilities theoretically — it executes the attack in an isolated sandbox, captures proof, validates a fix, and delivers a pre-tested patch PR. Universally scoped from a 3-route Express app to a 60-route multi-tenant API.

## 2. MVP Scope & Auth Strategy

### 2.1 Auth — Mock (Testing) → Supabase (Production)

During MVP and testing phase, auth is mocked. A single hardcoded test user bypasses all login/register screens. Supabase DB is used for all app data. Swapping to real Supabase Auth + GitHub OAuth requires changing one file.

| Phase           | Auth                          | What changes                                                                              |
|-----------------|-------------------------------|-------------------------------------------------------------------------------------------|
| MVP / Testing   | Mock — hardcoded test user, no sessions | Nothing — all routes open, Supabase DB still used                                         |
| Production      | Supabase Auth + GitHub OAuth  | Replace mockUser with supabase.auth.getUser() — one file                                  |

**Production swap checklist:**

- Enable Supabase Auth in project settings
- Add GitHub OAuth provider credentials
- Replace mockUser context with supabase.auth.getSession()
- Enable /auth/callback route handler
- Enable email verification flow
- Remove mock auth bypass from route guards

### 2.2 Orchestration — LangGraph + Deterministic Hybrid

AART uses LangGraph to orchestrate agent handoffs between pipeline stages. The deterministic engine (graph builder, symbolic evaluator, sandbox runner, patch validator) runs as native Python outside the LLM call chain. LangGraph provides: stateful graph execution, conditional edge routing, durable execution, and human-in-the-loop checkpoints.

Not used: Deep Agents SDK (general-purpose harness, unnecessary abstraction for a predefined pipeline). Not used: vanilla LangChain (LangGraph gives direct graph control).

### 2.3 Feature Scope

All 7 differentiation features are in scope for MVP. No plan gates, no limits.

| # | Feature                            | Core Differentiator                                                                 | Status   |
|---|------------------------------------|-------------------------------------------------------------------------------------|----------|
| 1 | Verified Exploit Confirmation      | Execute attack, capture proof — not theoretical flags                               | MVP Core |
| 2 | Auto Patch PR + Deterministic Re-Test | Patch → rebuild → re-exploit → confirm fixed → PR                                   | MVP Core |
| 3 | Product-Specific Threat Memory     | Per-repo dev pattern learning, scan bias                                            | MVP Core |
| 4 | Deterministic + AI Hybrid Reasoning | LLM schema-constrained, deterministically validated                                 | MVP Core |
| 5 | Exploit Path Visualization         | Interactive attack chain graph in dashboard                                         | MVP Core |
| 6 | Impact-First Risk Prioritization   | Sort by confirmed damage, not CVSS                                                  | MVP Core |
| 7 | Selective Runtime Blocking         | Per-pattern smart blocking (not WAF)                                                | POST-MVP |

## 3. Goal & Success Criteria

Execute attacks and deliver reproducible proof for IDOR, horizontal/vertical privilege escalation, and mass-assignment on any repo regardless of size. First meaningful finding within 3 minutes (simple repos) and 8 minutes (medium repos). False-positive rate for confirmed exploits ≤ 5% after runtime validation. Patch validation accuracy ≥ 90% (patch verifiably blocks exploit before PR is opened). Exploit confirmation rate ≥ 80% of high-confidence candidates validated in sandbox. Plain-English PR feedback with evidence payload, reproducible steps, and pre-verified patch. No production systems contacted. Strict ephemeral sandbox isolation.

## 4. Scope

### 4.1 MVP (Must-Have)

- Mock auth for testing phase; Supabase Auth + GitHub OAuth swap for production.
- Repo ingestion (GitHub) and AST-based route extraction for Node.js/Express.
- Complexity Router: auto-detect tier (simple / medium / complex) and route to appropriate pipeline.
- Heuristic Fast-Path Scanner: lightweight static checks for simple repos, < 3 min, always produces advisory-level findings minimum.
- Attack Surface Graph builder (routes, middleware, models, permissions) for medium/complex repos.
- Symbolic-lite engine for ownership/role constraint modeling.
- Attack templates: IDOR, horizontal escalation, mass-assignment, role bypass.
- Sandbox runner (Docker) to execute attacks against seeded test environments.
- Execution Engine: crafts requests, captures full evidence payload (request + response + diff + auth context).
- Patch Validator: applies patch in sandbox, rebuilds app, re-executes exploit, confirms blocked.
- Exploit Path Visualization: graph rendering of full attack chain (Feature 5).
- Threat Memory DB: per-repo exploit patterns, dev fingerprints, scan bias weights (Feature 3).
- Impact-First Prioritization: dashboard and API sort by real confirmed damage (Feature 6).
- PR integration (GitHub App): plain-English comments with proof payload + pre-verified fix link.
- LangGraph orchestration of all agent handoffs.

### 4.2 Phase 2 (Post-MVP)

- Supabase Auth swap + paid plan enforcement.
- Selective Runtime Blocking (Feature 7).
- Additional frameworks: FastAPI, Django, Fastify, GraphQL.
- Expanded attack template library.
- ATT&CK mapping and compliance reporting.
- Slack/Jira integrations, GitLab/Bitbucket CI.
- Multi-repo exploit chaining.

## 5. Key Functional Requirements

1. **Complexity Detection & Routing**: classify repo as simple (≤10 routes), medium (10–50 routes), or complex (50+ routes, multi-role) at ingestion. Route to fast-path or full pipeline.
2. **Heuristic Fast-Path Scanner**: static pattern checks (missing auth middleware, unguarded ID params, mass-assignment). Always produces at least one advisory finding or a 'no critical issues — here's what we checked' summary. No graph, no sandbox.
3. **Repo ingestion and AppGraph**: parse routes, middleware, controllers, model access. Detect auth middleware and ownership checks. Required for medium/complex; optional enrichment for simple.
4. **Attack goal enumeration**: read-other-user-data, escalate-role, access-admin-only-endpoint, mass-assignment. Paths generated deterministically from graph traversal + symbolic constraints.
5. **Symbolic-lite constraint evaluation**: evaluate reachability and variable comparisons. Produce deterministic feasibility score (0–1).
6. **LLM-constrained semantic interpretation**: called only for ambiguous code blocks. Returns structured JSON hint. Deterministic engine validates or rejects all output.
7. **Verified exploit execution**: if confidence ≥ T2 (0.75), spawn Docker sandbox, seed DB with User A + User B + test data, execute attack, capture full evidence package (request + response + response diff + auth context + sandbox logs).
8. **Plain-language reporting**: every finding includes one-sentence plain-English impact summary. Impact statement is the headline, not a CVE identifier.
9. **Patch generation and validation**: LLM drafts minimal patch (constrained schema). Patch applied in sandbox, app rebuilt, same exploit re-executed. If blocked: PR opened. If not blocked: alternative patch drafted. Never opens PR for unverified fix.
10. **Exploit Path Visualization**: every confirmed finding renders an interactive attack chain graph (attacker → endpoint → gap → model → exposure). Nodes clickable with code location detail.
11. **Impact-First Prioritization**: findings sorted by: confirmed + data exposed > confirmed + privilege escalated > confirmed + admin boundary > confirmed (other) > advisory. Dashboard and API both respect this order.
12. **Threat Memory**: stores per-repo exploit patterns, dev team mistake patterns, auth fingerprints. Biases next scan priority toward known weakness areas.
13. **Human-in-loop gating**: developer must approve all auto-PRs before merge. No automatic production changes.
14. **GitHub App CI integration**: PR comments with proof payload, pre-verified fix link, aart/confirmed label, optional PR blocking.

## 6. Non-Functional Requirements

- **Safety**: sandboxes have no external network egress, strict resource limits, rootless containers.
- **Performance**: simple ≤ 3 min, medium ≤ 8 min, complex ≤ 15 min.
- **Universal coverage**: every ingested repo receives at minimum a heuristic scan result. No silent skips.
- **Exploit execution accuracy**: ≥ 80% of high-confidence candidates confirmed in sandbox.
- **Patch validation accuracy**: ≥ 90% of generated patches block the exploit before PR is opened.
- **Scalability**: horizontal scaling of sandbox worker pool and graph processors.
- **Auditability**: immutable logs for every decision, LLM call, exploit execution, patch validation.
- **Explainability**: every confirmed exploit includes deterministic trace + plain-language summary + evidence package.
- **Privacy**: no production secrets stored or used. Secrets detected in repos are flagged and redacted.

## 7. Architectural Design

### 7.1 High-Level Components

| Component               | Responsibility                                                                                             |
|-------------------------|------------------------------------------------------------------------------------------------------------|
| Ingestion Worker        | Clones repo, normalizes code, triggers AST extraction and complexity detection                             |
| Complexity Router       | Classifies repo as simple/medium/complex; routes to appropriate pipeline                                   |
| Heuristic Fast-Path Scanner | Static checks for simple repos: missing auth, unguarded IDs, mass-assignment. No graph or sandbox.      |
| AST & Parser Service    | Babel/SWC/Esprima; produces normalized AST for graph builder                                              |
| Graph Builder           | Constructs AppGraph (routes, middleware, models, auth nodes) for medium/complex repos                     |
| Symbolic-Lite Engine    | Lightweight constraint modeler; evaluates ownership checks and reachability; produces feasibility score   |
| LLM Reasoner (Constrained) | Schema-wrapped interpreter + patch suggester. Stateless. Output validated by deterministic engine.       |
| Attack Planner          | Ordered candidate exploit plans from templates + graph traversal                                          |
| Sandbox Orchestrator    | Docker pool, ephemeral networks, test user seeding. Executes for medium/complex tier by default.          |
| Execution Engine        | Crafts crafted requests, verifies responses, collects full evidence package (request + response + diff + auth context + logs) |
| Patch Validator         | Applies patch in sandbox, rebuilds app, re-executes original exploit, confirms blocked or reports still-open |
| Exploit Path Builder    | Constructs graph visualization data (nodes + edges + types) for frontend rendering                         |
| Threat Memory DB        | Stores per-repo exploit patterns, dev team fingerprints, middleware patterns, scan bias weights            |

### 7.2 LangGraph Agent Roles

Each agent is a LangGraph node. Handoffs are conditional edges. Human-in-loop gates are LangGraph interrupt points.

| Agent                   | Responsibility                                                                                             |
|-------------------------|------------------------------------------------------------------------------------------------------------|
| Complexity Classifier   | Detects repo tier (simple/medium/complex) and routes to appropriate pipeline on every ingestion            |
| Heuristic Scanner       | Simple repos: runs static pattern checks, generates advisory findings. No LLM, no sandbox.                 |
| Recon Agent             | Medium/complex: builds AppGraph, identifies entry points, auth middleware, ownership patterns              |
| Planner Agent           | Enumerates candidate exploit paths using attack templates + symbolic constraint scores                     |
| Reasoning Agent (LLM)   | Schema-constrained: called only when symbolic score ≥ T1 (0.5). Returns JSON hint. Cannot confirm exploits. |
| Executor Agent          | Spins sandbox, seeds test users, executes attack, captures full evidence package                           |
| Patch Validator Agent   | Applies patch in sandbox, rebuilds, re-exploits, confirms blocked. Generates pre-verified fix PR.         |
| Remediation Agent       | Opens PR with patch diff + original proof + fix validation log. Developer approval required.               |
| Memory Agent            | Updates Threat Memory with exploit patterns, dev fingerprints, resolution. Biases next scan.               |

### 7.3 Data Flow Sequence

15. GitHub webhook triggers Ingestion Worker. Repo cloned in ephemeral worker.
16. Complexity Classifier Agent: detects tier (simple / medium / complex).
17. SIMPLE PATH: Heuristic Scanner Agent runs static checks. Produces advisory findings. Skip to step 10.
18. MEDIUM/COMPLEX PATH: AST Service parses code. Graph Builder stores AppGraph. Recon Agent completes.
19. Planner Agent: Symbolic Engine evaluates constraints. Candidate list created with feasibility scores.
20. For candidates ≥ T1 (0.5): Reasoning Agent (LLM) queried. Returns structured JSON hint.
21. Deterministic validator merges LLM hint into final confidence score.
22. If score ≥ T2 (0.75): Executor Agent spawns sandbox, seeds DB (User A + User B + test data), executes attack, captures evidence package.
23. Patch Validator Agent: LLM drafts patch → apply in sandbox → rebuild → re-exploit → confirm blocked. Pre-verified fix PR ready.
24. Results stored in Supabase + Threat Memory. Memory Agent updates scan bias.
25. GitHub App posts PR comment (proof payload + pre-verified fix link + aart/confirmed label).
26. Developer applies fix (manual or via AART PR) → merge webhook → final re-test → mark resolved.

Thresholds: T1 = 0.5 (LLM assist trigger), T2 = 0.75 (sandbox trigger). Both configurable per repo.

### 7.4 Tech Stack

| Layer               | Technology                                                                                              |
|---------------------|---------------------------------------------------------------------------------------------------------|
| Agent Orchestration | LangGraph (Python) — stateful graph, conditional edges, human-in-loop interrupts                        |
| LLM Integration     | LangChain core — provider-agnostic wrapper with strict JSON-schema validation                           |
| Backend API         | Python FastAPI — async, REST endpoints, webhook handlers                                                |
| AST Parsing         | Babel / SWC (JS/TS), Esprima for JS AST                                                                 |
| Graph Store         | Neo4j or in-memory with Postgres persistence (AppGraph snapshots)                                      |
| Symbolic Engine     | Custom Python evaluator — no heavy Z3 in MVP                                                            |
| Sandbox             | Docker — rootless containers, ephemeral networks, seccomp/AppArmor, no egress                           |
| Auth (MVP)          | Mock — hardcoded test user. One-file swap to Supabase Auth for production.                              |
| Auth (Production)   | Supabase Auth + GitHub OAuth                                                                             |
| App Database        | Supabase (PostgreSQL) — repos, findings, scans, evidence packages, threat memory                         |
| Artifact Storage    | S3 — evidence packages, sandbox logs, patch diffs                                                        |
| Task Queue          | Celery + Redis (scan jobs, webhook processing)                                                           |
| Frontend            | Lovable (React/TypeScript) — Tailwind, dark mode only, Supabase client                                   |

### 7.5 Deployment & Scaling

- Stateless FastAPI services autoscale behind API gateway.
- Sandbox worker pool scales horizontally based on queue depth.
- Heuristic scanner is CPU-only, near-zero cost — scales independently from sandbox pool.
- AppGraph snapshots persisted to Postgres. Threat Memory partitioned by repo/org.
- LangGraph state persisted in Redis (durable execution across worker restarts).
- [POST-MVP] Multi-tenant per-org quotas; VPC/On-prem for enterprise.

## 8. Agentic Flow - Detailed

### 8.1 Simple Repo Fast-Path (Heuristic Scanner Agent)

Scenario: 3-route Express app, no auth on one endpoint.

27. Complexity Classifier: 3 routes detected → simple tier → LangGraph routes to Heuristic Scanner Agent.
28. Heuristic Scanner: static AST check detects GET /users/:id has no auth middleware.
29. Advisory finding generated: 'GET /users/:id is publicly accessible. Anyone can read user data.' Confidence: 0.95 (deterministic, static).
30. No sandbox. No LLM call. PR comment posted within 2 minutes.
31. LLM drafts one-line fix suggestion. Deterministic engine validates diff.
32. Developer applies fix → AART re-runs heuristic → passes → marked resolved. Memory Agent updates.

### 8.2 Full Pipeline: IDOR Detection (Medium/Complex Repo)

Scenario: GET /invoices/:id with no ownership check.

33. Recon Agent: parse repo → identify GET /invoices/:id reads Invoice model. No ownership check in AST. AppGraph node created.
34. Symbolic Engine: req.user.id ≡ invoice.userId comparison absent. Feasibility score = 0.68.
35. LangGraph edge: score ≥ T1 (0.5) → route to Reasoning Agent.
36. Reasoning Agent (LLM) returns: { ownership_check: false, ownership_field: null, confidence: 0.85, explanation: 'No equality comparison found.' }
37. Deterministic validator merges: final confidence = 0.74. Additional heuristic check raises to 0.78 → ≥ T2 (0.75) → schedule sandbox.
38. Executor Agent: spawn container, seed DB (User A + User B, invoice owned by B). Auth as A, request GET /invoices/B_INVOICE_UUID. Response contains User B data → EXPLOIT CONFIRMED.
39. Evidence package: request + response + response diff + auth context (JWT User A) + sandbox logs. Confidence: 0.92.
40. Patch Validator Agent: LLM drafts ownership check addition. Apply in sandbox → rebuild → re-execute same exploit → HTTP 404 returned → FIX VERIFIED.
41. Remediation Agent: auto-PR generated with patch diff + original proof + fix validation log.
42. Memory Agent: stores IDOR pattern, findById-without-userId-filter fingerprint, route pattern. Next scan biases toward same class.

### 8.3 Patch Validation Flow (Feature 2)

43. LLM drafts minimal patch (constrained JSON schema: { patch_diff, tests_added, confidence }).
44. Deterministic engine validates patch structure and rejects unsafe content (shell commands, etc.).
45. Patch applied to sandbox copy of the app.
46. App rebuilt in sandbox.
47. Original exploit re-executed against patched version.
48. IF exploit blocked (404 / 403 / correct ownership enforced): fix_verified = true. PR opened.
49. IF exploit still reproducible: fix_verified = false. LLM drafts v2 patch → loop repeats. Never opens PR for unverified fix.

### 8.4 LLM Interaction Schemas (Constrained)

All LLM responses must match strict JSON schemas. Validator rejects schema violations and suspicious content (e.g., shell commands, SQL).

**Interpretation schema:**
```json
{
  "ownership_check": boolean,
  "ownership_field": string|null,
  "confidence": number,
  "explanation": string
}
Patch suggestion schema:

json
{
  "patch_diff": string,
  "tests_added": string|null,
  "confidence": number
}
Impact summary schema:

json
{
  "plain language summary": string,
  "impact_type": "data exposure"|"privilege escalation"|"admin boundary"|"other",
  "affected users": string,
  "one sentence impact": string
}
9. Data Models
9.1 AppGraph Node
json
{
  "id": "route:/invoices/:id",
  "type": "endpoint",
  "method": "GET",
  "auth_required": true,
  "roles": ["user"],
  "accesses": ["model:Invoice"],
  "ownershipField": "invoice.userId",
  "source_files": ["controllers/invoiceController.js:45"]
}
9.2 ExploitCandidate
json
{
  "id": "exploit_0001",
  "appFingerprint": "sha256:abc",
  "repoTier": "medium",
  "type": "IDOR",
  "route": "route:/invoices/:id",
  "symbolicScore": 0.68,
  "llmHintConfidence": 0.85,
  "finalConfidence": 0.78,
  "status": "queued"
}
9.3 EvidencePackage (NEW - Feature 1)
json
{
  "exploitId": "exp-confirm-0001",
  "request": {
    "method": "GET",
    "url": "/invoices/B_UUID",
    "headers": ["Authorization: Bearer [REDACTED]"]
  },
  "response": {
    "status": 200,
    "body": { "userId": "USER_B_UUID", "amount": 4200 }
  },
  "responseDiff": {
    "userId": "USER_A_UUID -> USER_B_UUID",
    "amount": "1200 -> 4200"
  },
  "authContext": {
    "userRole": "user",
    "tokenSubject": "USER_A_UUID"
  },
  "sandboxLogs": "...",
  "reproScript": "curl -X GET .../invoices/B_UUID -H 'Authorization: Bearer USER_A_JWT'",
  "confirmedAt": "2026-02-24T..."
}
9.4 ConfirmedExploit
json
{
  "id": "exp-confirm-0001",
  "repoTier": "medium",
  "impactType": "data_exposure",
  "plainLanguageSummary": "Anyone can read anyone else's invoice.",
  "evidencePackageId": "evidence-0001",
  "exploitPathData": {
    "nodes": [...],
    "edges": [...],
    "patchRecordId": "patch-0001",
    "trace": [{"from": "route:/invoices/:id", "to": "model:Invoice", "note": "no ownership check"}]
  },
  "status": "open",
  "createdAt": "2026-02-24T..."
}
9.5 PatchRecord (NEW — Feature 2)
json
{
  "id": "patch-0001",
  "exploitId": "exp-confirm-0001",
  "patchDiff": "- const invoice = await Invoice.findById(...) + const invoice = await Invoice.findOne({_id: ..., userId: req.user.id })",
  "validationResult": "BLOCKED",
  "reTestRequest": { ... },
  "reTestResponse": { "status": 404 },
  "fixVerified": true,
  "prUrl": "https://github.com/.../pull/42"
}
9.6 ThreatMemory (Updated — Feature 3)
json
{
  "appFingerprint": "sha256:abc",
  "ownershipCheckPatterns": ["findById without userid filter", "no req.user.id comparison"],
  "middlewarePatterns": ["auth on GET routes, missing on PUT routes"],
  "devTeamPatterns": ["direct model lookup without ownership"],
  "authFingerprint": { "type": "JWT", "roleField": "user.role" },
  "historicalExploitTypes": ["IDOR", "mass-assignment"],
  "scanBiasWeights": { "IDOR": 2.4, "mass-assignment": 1.8 },
  "lastUpdated": "2026-02-24T..."
}
9.7 HeuristicFinding (Simple Repos)
json
{
  "id": "heuristic-0001",
  "repoTier": "simple",
  "type": "missing-auth",
  "route": "GET /users/:id",
  "plainLanguageSummary": "GET /users/:id is publicly accessible. Anyone can read user data.",
  "confidence": 0.95,
  "suggestedFix": "Apply authMiddleware to this route.",
  "status": "open"
}
9.8 ExploitPathData (NEW — Feature 5)
json
{
  "exploitId": "exp-confirm-0001",
  "nodes": [
    { "id": "n1", "type": "user-node", "label": "User A (attacker)", "color": "#7C3AED" },
    { "id": "n2", "type": "endpoint-node", "label": "GET /invoices/:id", "color": "#06B6D4" },
    { "id": "n3", "type": "gap-node", "label": "No ownership check", "color": "#DC2626" },
    { "id": "n4", "type": "model-node", "label": "Invoice model", "color": "#8A8A96" },
    { "id": "n5", "type": "exposure-node", "label": "User B data exposed", "color": "#DC2626" }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "label": "authenticated JWT" },
    { "source": "n2", "target": "n3", "label": "no ownership constraint" },
    { "source": "n3", "target": "n4", "label": "direct DB read" },
    { "source": "n4", "target": "n5", "label": "data returned" }
  ]
}
10. API Endpoints
10.1 Core Endpoints (Backend → Frontend)
Endpoint	Method	Purpose
GET /repos	GET	List all connected repos with health grades
POST /repos	POST	Connect new repo, trigger ingestion
GET /repos/:id	GET	Repo detail: fingerprint, grade, findings
POST /repos/:id/scan	POST	Trigger on-demand scan
GET /findings	GET	All findings, impact-sorted, filterable
GET /findings/:id	GET	Full finding detail with evidence + path + patch
GET /findings/:id/evidence	GET	Full evidence package
GET /findings/:id/path	GET	Exploit path graph data (nodes + edges)
POST /findings/:id/patch-pr	POST	Trigger patch generation + validation + PR
POST /findings/:id/rerun	POST	Re-execute same exploit
POST /findings/:id/ignore	POST	Mark as ignored with reason
GET /threat-memory/:repoId	GET	Per-repo threat memory: patterns, bias weights
GET /dashboard	GET	Aggregate: health grade, confirmed count, recent findings
POST /webhook/github	POST	GitHub App webhook (PR open, push, install)
10.2 SSE / WebSocket - Scan Progress Stream
Frontend subscribes to scan progress events during the scanning step. Used to power the live terminal feed in the UI.

Event: scan:started - repo cloned, tier detected

Event: scan:step - each pipeline step with label and status

Event: scan:exploit_executing - sandbox spawned, attack in progress

Event: scan:complete - final results ready

Event: scan:error - with error type and retry status

11. PR Comment Templates
11.1 Confirmed Exploit (Feature 1 + Feature 2)
text
## [AART] Security Check - Exploit Confirmed

CONFIRMED - EXECUTED - High Impact

**Anyone can read any user's invoice.**

We executed this attack in an isolated sandbox. Here's proof:

Authentication: User A (JWT Bearer)

Attack: GET /invoices/B_INVOICE_UUID

Result: HTTP 200 - returned User B's private invoice data

curl -X GET https://sandbox/invoices/B_INVOICE_UUID \
  -H 'Authorization: Bearer USER_A_JWT' # - 200 OK { userId: USER_B_UUID, amount: 4200 }

Confidence: 0.92 | Sandbox: PASS | This is not theoretical.

A pre-verified fix is ready - patch was tested in sandbox before this PR was opened.

[Create Fix PR (pre-tested)] [View full proof] [Mark false positive]
11.2 Advisory (Static Only)
text
## [AART] Security Advisory

[ADVISORY - Static analysis - Confidence: 0.68]

**GET /users/:id may lack an ownership check.**

We detected a potential IDOR pattern but confidence was below our sandbox execution threshold (0.75). No exploit was executed.

Review: does this route verify req.user.id == resource.userId?

[View analysis] [Trigger sandbox test] [Mark false positive]
12. Failure Modes & Mitigations
Failure	Risk	Mitigation
LLM hallucinated exploit	False confirmation	Deterministic engine verifies. LLM cannot confirm exploits. Runtime validation required.
Patch doesn't fix exploit	Bad PR opened	Patch Validator re-runs exploit before PR. Never opens PR for unverified fix.
Sandbox escape	Production impact	Rootless containers, seccomp/AppArmor, no egress, resource caps.
High sandbox cost	Budget overrun	Heuristic scanner avoids sandbox for simple repos. Confidence-first strategy.
Simple repo produces no results	Zero value for mass market	Heuristic layer always returns at least advisory or 'what we checked' summary.
Developer distrust from noise	Churn	Strict confidence thresholds. Confirmed = executed. Easy false-positive marking.
LangGraph state loss on worker crash	Incomplete scans	LangGraph state persisted in Redis. Durable execution resumes from last checkpoint.
Mock auth bypass in production	Security hole	Auth swap checklist. Mock bypass removed in production build. Environment-gated.
13. Testing, QA & Validation Plan
13.1 Unit / Integration Tests
Heuristic scanner: minimal single-file Express apps with known missing-auth patterns.

AST parser: representative frameworks and coding styles.

Symbolic engine: edge-condition ownership logic.

LLM schema validator: adversarial inputs including shell commands and SQL injection.

Sandbox harness: no evidence leakage across runs, repeatability.

Patch Validator: verify it correctly identifies blocked vs still-reproducible exploits.

Complexity Router: correct tier classification across diverse repo set.

Exploit Path Builder: correct node types, edges, and graph structure per exploit type.

LangGraph flow: conditional edge routing under all confidence score scenarios.

13.2 Acceptance Tests
Synthetic vulnerable apps: 5 simple, 3 medium, 2 complex (OWASP Broken Access Control patterns).

Every simple app produces at least one advisory or confirmed finding.

Sandbox confirms ≥ 80% of high-confidence candidates.

Patch validator verifies ≥ 90% of auto-generated patches block the exploit.

All PR comments include: plain-English summary, evidence payload, pre-verified fix link, confidence score.

All LLM outputs are schema-validated and logged to audit trail.

Exploit path graph renders correctly for all 4 attack types (IDOR, escalation, mass-assignment, role bypass).

Impact-first sort order correctly prioritized in both API response and dashboard.

13.3 Security Tests
Internal red-team: attempt sandbox escape.

Fuzzing LLM input and schema validator for injection.

Verify mock auth bypass is fully removed in production build.

14. KPIs & Observability
14.1 Product KPIs
Repos onboarded by tier (simple / medium / complex)

First-finding time by tier (target: < 3 min simple, < 8 min medium)

Exploit confirmation rate (% of high-confidence candidates confirmed in sandbox)

Patch validation accuracy (% of auto-generated patches blocking exploit before PR)

False-positive rate (confirmed findings marked FP by developers)

Mean time from confirmation to fix

Threat memory impact: does biased scanning increase confirmation rate over time?

14.2 Operational
Sandbox cost per confirmed exploit

Heuristic scanner cost per repo (target: near-zero)

LangGraph execution time per pipeline stage

Queue length and processing latency by tier

Number of auto-PRs created vs accepted vs rejected

LLM call count and schema rejection rate

SSE event delivery latency (scan progress stream)

15. Build Priorities (Roadmap)
Mock auth + repo ingestion + Complexity Router + Heuristic Fast-Path Scanner. First value on day one.

AST parser + AppGraph builder + Symbolic-lite Engine for Node.js/Express.

Attack templates + Planner Agent + LangGraph orchestration wiring.

Sandbox runner + Execution Engine + Evidence Package capture (Feature 1).

Patch Validator + Auto-PR generation with fix validation log (Feature 2).

GitHub App + PR comments with proof payload + pre-verified fix link.

Threat Memory DB + Memory Agent + scan bias logic (Feature 3).

Exploit Path Builder + frontend graph visualization (Feature 5).

Impact-First sort in API + dashboard (Feature 6).

Threat Memory dashboard view (/threat-memory/[repo-id]).

[POST-MVP] Supabase Auth swap + Selective Runtime Blocking (Feature 7) + paid plans.

16. Risks & Mitigation Summary
Safety (sandbox escapes): rootless containers, no egress, strict seccomp/AppArmor, non-root.

Hallucination (LLM): strict schema validation, deterministic override, runtime validation required.

Patch correctness: Patch Validator must confirm exploit blocked before PR. No exceptions.

Cost (sandboxes): heuristic fast-path avoids sandbox for simple/obvious patterns. Confidence-first.

Universal coverage (simple repos): Heuristic layer is first-class pipeline, monitored separately.

Developer trust: confirmed = executed (not theoretical). Low FP rate. Plain-language output.

LangGraph state loss: Redis persistence + durable execution checkpoints.

Mock auth in production: environment-gated bypass, checklist-enforced swap, removed in prod build.