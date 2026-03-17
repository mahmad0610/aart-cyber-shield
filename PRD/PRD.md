
---

# AART_PRD_v3.md

```markdown
# Product Requirements Document

# Autonomous API Red Team (AART)

Universal Coverage · Verified Exploit Confirmation · Closed-Loop Remediation  
v3.0 — MVP Feature-Complete Edition

## MVP & Testing Phase — Auth Approach

During the MVP and testing phase, the product uses mock authentication: a single hardcoded test user bypasses all login/register screens and lands directly in the app. This eliminates auth complexity during validation. Production Supabase Auth (GitHub OAuth + email) is a one-file swap once the product is validated.

| Phase           | Auth Method                          | What changes                                                                              |
|-----------------|--------------------------------------|-------------------------------------------------------------------------------------------|
| MVP / Testing   | Mock auth — hardcoded test user, no sessions | Nothing — all routes open, app data in Supabase DB                                       |
| Production      | Supabase Auth + GitHub OAuth         | Replace mockUser with supabase.auth.getUser() — one file                                  |

## Executive Summary

AART is a SaaS that continuously simulates attacker behavior against API-first web applications of any size and complexity — from a solo developer's weekend project to a multi-service startup backend. AART finds real exploit paths (IDOR, broken access control, privilege escalation, mass-assignment), verifies them by actually executing the attacks in ephemeral sandboxes, and delivers closed-loop remediation: patch → rebuild → re-exploit → confirm fixed.

AART is differentiated not by flagging potential issues but by proving them. Every confirmed finding includes an executed attack, an evidence payload, and a pre-verified fix. No competitor does all three.

**Key positioning:** "We don't say it's broken. We break it. Then we fix it. Then we prove it's fixed."

## 7 Core Differentiating Features

These features form the product's competitive moat. All are in scope for MVP.

| # | Feature                            | Core Differentiator                                                                 |
|---|------------------------------------|-------------------------------------------------------------------------------------|
| 1 | Verified Exploit Confirmation      | We execute the attack and show proof - competitors only flag potential issues       |
| 2 | Auto Patch PR + Deterministic Re-Test | Closed loop: patch → rebuild → re-exploit → verified fix PR                         |
| 3 | Product-Specific Threat Memory     | Learns per-repo dev patterns, biases future scans toward known weaknesses           |
| 4 | Deterministic + AI Hybrid Reasoning | Graph → symbolic → LLM Reasoning (schema-constrained) → deterministic validation    |
| 5 | Exploit Path Visualization         | Interactive graph of full attack chain - nobody visualizes logic exploit chains     |
| 6 | Impact-First Risk Prioritization   | Rank by actual confirmed damage (data exposed, privilege escalated) not CVSS        |
| 7 | Selective Runtime Blocking         | Smart blocking per verified exploit pattern only - not noisy WAF [POST-MVP]         |

## Feature Detail

### Feature 1 - Verified Exploit Confirmation

The single most important differentiator. Competitors say "this is vulnerable." AART says "We executed the attack. Here's proof."

**Every confirmed finding includes:**

- Deterministic attack plan generated from graph + symbolic evaluation
- Sandbox execution against two seeded test users (attacker + victim)
- Cross-user data extraction validation (did User A get User B's data?)
- Privilege escalation measurement (did role boundary get crossed?)
- Evidence payload: full request + response + response diff + auth context
- Reproducible script (sanitized curl) developers can run themselves

Finding detail screen tabs: Proof · Exploit Path · Patch · History

### Feature 2 - Auto Patch PR + Deterministic Re-Test

Closed-loop remediation that no competitor offers end-to-end.

**Workflow:**

1. LLM drafts minimal patch (constrained JSON schema)
2. Deterministic engine validates patch structure and safety
3. Patch applied to sandbox copy of the app
4. App rebuilt in sandbox
5. Original exploit re-executed against patched version
6. If exploit blocked: PR auto-generated with diff + original proof + fix validation log
7. Developer reviews and merges — [AART] runs final re-test on merge

If patch fails validation: LLM drafts alternative → re-validates → shows revised suggestion. Never opens a PR for an unverified fix.

### Feature 3 - Product-Specific Threat Memory

Gets smarter with every scan. Builds a per-repo security fingerprint over time.

**Stored per repo:**

- Ownership check patterns (e.g., findById without userId filter)
- Middleware misuse patterns (auth applied to GET, missed on PUT)
- Dev team mistake patterns (recurring exploit types)
- Auth model fingerprint (JWT structure, role fields)
- Historical exploit types and resolutions

**Effect on next scan:**

- Boost priority for routes matching stored weakness patterns
- Adjust symbolic score upward for known weakness types
- Surface: "Threat memory: prioritizing [X] based on previous findings"
- Dedicated /threat-memory/[repo-id] dashboard view

### Feature 4 - Deterministic + AI Hybrid Reasoning

Everyone is adding "AI." AART's AI is constrained and validated — not prompt-and-hope.

**Pipeline:**

- Graph → symbolic evaluation → feasibility score
- If score ≥ T1 (0.5): LLM called with code snippet, returns structured JSON hint only
- Deterministic engine validates or rejects LLM output
- Merged confidence score determines sandbox trigger (T2 = 0.75)
- LLM cannot mark exploit as confirmed — only the deterministic engine can
- All LLM calls logged to audit trail

Messaging: "AI-assisted reasoning with deterministic authority."

### Feature 5 — Exploit Path Visualization

Interactive graph of the full attack chain. Nobody in the market visualizes logic exploit paths well.

**Graph structure:**

- User A (attacker) → JWT token → GET /invoices/:id → Missing ownership check → Invoice model → User B's data exposed
- Each node clickable — shows code location, symbolic constraint evaluated, confidence
- Edge labels: authenticated · no ownership constraint · direct DB read · data returned
- Deterministic trace below graph: ordered list of nodes + constraints
- Node color coding: attacker (violet) · endpoint (cyan) · gap (red) · model (grey) · exposure (red)

### Feature 6 — Impact-First Risk Prioritization

Competitors rank by CVSS scores or theoretical severity. AART ranks by confirmed real-world damage.

**Priority order:**

8. Confirmed + cross-user data exposed
9. Confirmed + privilege escalated
10. Confirmed + admin boundary broken
11. Confirmed (other)
12. Advisory
13. Resolved
14. Ignored

Health Grade is also impact-weighted: cross-user data exposure and privilege escalation carry 3x weight vs generic confirmed findings.

### Feature 7 — Selective Runtime Blocking [POST-MVP]

Instead of a noisy WAF: block only verified exploit patterns backed by deterministic logic. Prevents overblocking and false positives. High-value enterprise feature — designed but not built in MVP.

## Objectives & Success Metrics

### Primary Objectives

- Execute real attacks and deliver verified proof on repos of any complexity.
- Close the loop: patch → re-exploit → confirm fixed → not just suggest fixes.
- Deliver first confirmed finding (or advisory) within 3 minutes for simple repos, 8 minutes for medium.
- Build per-repo threat memory that makes every subsequent scan higher signal.
- Maintain developer trust through deterministic authority, not AI guesswork.

### Success Metrics (12 Months)

- First meaningful finding ≤ 10 minutes for ≥ 80% of repos.
- Confirmed exploit execution rate ≥ 80% of high-confidence candidates.
- False-positive rate for confirmed findings ≤ 5%.
- Patch validation accuracy ≥ 90% (patch verifiably blocks exploit before PR opened).
- Developer adoption: 500 active repos within 12 months.
- Time-to-fix after confirmed finding ≤ 48 hours.

## Target Users & Personas

- **Solo / small-team backend developers ("vibe coders")** shipping API-first apps.
- **Beginners and bootcamp graduates** shipping their first real-world APIs.
- **Early-stage startup engineering teams** without dedicated AppSec.
- **Software houses and agencies** building client APIs.

**Maya — solo founder:** Two-route Express SaaS. Needs plain-English proof she can understand and act on in under 10 minutes.

**Ravi — engineering lead:** Wants continuous confirmed-exploit coverage in CI. Trusts [AART] because it proves findings before reporting them.

**Ammar — agency dev:** Uses evidence package to justify fix time to clients. Needs reproducible proof, not theoretical warnings.

**Dev — bootcamp grad:** First Express API. Needs [AART] to execute the attack, explain the consequence, and verify the fix — without security jargon.

## Value Proposition

- **Verified:** We execute the attack. Here's the evidence. Not theoretical.
- **Closed-loop:** Patch → rebuild → re-exploit → verified fix PR. One workflow.
- **Universal:** Works on any Node.js/Express repo, 3 routes to 300.
- **Plain English:** Impact-first language, not CVE identifiers.
- **Smarter over time:** Threat memory biases every scan toward your repo's known weaknesses.
- **Trustworthy:** Deterministic engine controls all exploit confirmation decisions.

## Key Features - MVP Scope

### Universal Repo Support

- **Complexity Router:** auto-classifies repo as simple / medium / complex on ingestion.
- **Simple repos (≤10 routes):** heuristic fast-path scanner, result in < 3 minutes.
- **Medium/complex repos:** full graph + symbolic + sandbox pipeline.
- **Graceful degradation:** heuristic layer always produces at least advisory-level findings.

### Core Engine

- AST-based route + middleware extractor (Node.js/Express).
- Attack surface graph builder (routes, middleware, models, roles).
- Symbolic-lite engine for ownership constraint evaluation.
- IDOR / Broken access control / Privilege escalation / Mass-assignment attack templates.
- Docker-based ephemeral sandbox with seeded test users and data.
- Execution engine: crafts and sends requests, captures full evidence payload.

### Developer Experience

- GitHub App: PR comments with confirmed exploit proof + pre-verified fix link.
- Impact-first findings dashboard (Feature 6).
- Exploit path graph visualization (Feature 5).
- Threat memory dashboard per repo (Feature 3).
- Auto patch PR with fix validation log (Feature 2).
- Plain-language severity: "Anyone can read any user's invoice" not "IDOR CWE-639".
- "Why this matters" section in every finding.

## Complexity Tiers

| Tier    | Criteria                | Pipeline                               | Target Time |
|---------|-------------------------|----------------------------------------|-------------|
| Simple  | ≤10 routes, 1 role      | Heuristic fast-path scanner            | < 3 min     |
| Medium  | 10–50 routes, 2–3 roles | Graph + symbolic + selective sandbox   | < 8 min     |
| Complex | 50+ routes, multi-role  | Full: graph + symbolic + sandbox + LLM | < 15 min    |

## Technical Architecture (Summary)

- **Ingestion Worker:** clones repo, normalizes code, detects complexity tier.
- **Complexity Router:** routes to fast-path heuristic or full graph + symbolic pipeline.
- **Heuristic Scanner:** lightweight static checks for simple repos (no sandbox needed).
- **Graph Builder:** attack surface graph (routes, middleware, models, roles).
- **Symbolic-Lite Engine:** ownership constraint tracking and feasibility scoring.
- **LLM Reasoner:** schema-constrained semantic interpretation + patch drafting.
- **Attack Planner:** candidate exploit plans from templates + graph traversal.
- **Sandbox Orchestrator:** Docker pool, ephemeral networks, test user seeding.
- **Execution Engine:** sends crafted requests, captures full evidence payload (request + response + diff + auth context).
- **Patch Validator:** applies patch in sandbox, rebuilds, re-exploits, confirms fix.
- **Threat Memory DB:** per-repo exploit patterns, dev team fingerprints, scan bias weights.
- **CI Integrations & GitHub App:** webhook handlers, PR comments with proof, auto-PR patches.
- **Dashboard / API:** findings, exploit paths, threat memory, settings.

## Data & Model Designs

- **AppGraph:** nodes (route, middleware, model, role), edges with ownership fields + auth check metadata.
- **ExploitRecord:** {id, appFingerprint, repoTier, type, route, evidence: {request, response, diff, authContext}, confidence, symbolicScore, runtimeValidated, status, plainLanguageSummary, impactType}
- **EvidencePackage:** {exploitId, request, response, responseDiff, authContext, sandboxLogs, reproScript, confirmedAt}
- **PatchRecord:** {exploitId, patchDiff, validationResult, reTestRequest, reTestResponse, fixVerified, prUrl}
- **ThreatMemory:** {appFingerprint, ownershipPatterns, middlewarePatterns, devTeamPatterns, authFingerprint, historicalExploits, scanBiasWeights}

## Security, Privacy & Compliance

- Sandboxes run in isolated network namespaces — no external access.
- Never store or use production secrets. If accidentally included, flag + notify owner.
- Evidence packages are sanitized (tokens redacted) before display.
- Data retention: configurable (30/90/365 days).
- GDPR: support data export/deletion.
- Enterprise: on-prem/VPC option post-MVP.

## Non-Functional Requirements

- **Performance:** simple < 3 min, medium < 8 min, complex < 15 min.
- **Universal coverage:** no repo rejected due to size or simplicity.
- **Exploit execution accuracy:** ≥ 80% of high-confidence candidates confirmed in sandbox.
- **Patch validation accuracy:** ≥ 90% of auto-generated patches verifiably block exploit before PR.
- **Scalability:** autoscale sandbox workers based on queue depth.
- **Reliability:** 99.5% availability for core API.
- **Explainability:** every confirmed finding includes deterministic trace + plain-language summary + evidence package.

## Governance of AI Usage

- LLM outputs must conform to strict JSON schema — deterministic engine validates all output.
- LLM can propose patches and interpret ambiguous code. It cannot mark an exploit as confirmed.
- All LLM calls logged to immutable audit trail.
- Patch suggestions always labeled "draft" until sandbox validates them.

## Roadmap

- **Month 0–2:** Complexity Router + heuristic scanner + AST parser + graph builder prototype.
- **Month 3–4:** Symbolic-lite engine + IDOR detection + attack planner + sandbox execution engine (Feature 1).
- **Month 5–6:** Patch validator + auto-PR (Feature 2) + threat memory (Feature 3) + PR integration. MVP closed alpha.
- **Month 7–9:** Exploit path visualization (Feature 5) + impact-first prioritization (Feature 6) + LLM patch drafts. Public beta.
- **Month 10–12:** Threat memory dashboard + hardening + go-to-market + enterprise pilots.
- **Post-MVP:** Selective runtime blocking (Feature 7) + Supabase Auth swap + paid plans.

## Risks & Mitigations

- **Sandbox escape:** rootless containers, no egress, strict seccomp/AppArmor, resource caps.
- **LLM hallucination:** strict schema validation, deterministic override, runtime validation required for any confirmation.
- **Patch validation false positive (says fixed when it isn't):** sandbox re-test must actually block exploit before PR opened. Never skip.
- **Simple repos produce no findings:** heuristic layer always returns at least advisory or "here's what we checked".
- **Developer distrust from noisy alerts:** strict confidence thresholds, confirmed = executed, easy FP feedback.
- **High sandbox cost:** budget quotas per account (post-MVP), fast-path avoids sandbox for simple/obvious patterns.

## KPIs

- Repos onboarded by tier (simple / medium / complex)
- Exploit confirmation rate (% of high-confidence candidates confirmed in sandbox)
- Patch validation accuracy (% of auto-generated fixes verified before PR)
- False-positive rate (confirmed findings marked FP by developers)
- First-finding time by tier
- Mean time from confirmation to fix
- Threat memory impact (does biased scanning produce higher confirmation rate over time?)
- Developer response time to AART suggestions
- [POST-MVP] Free-to-paid conversion rate · MRR · churn

## Acceptance Criteria (MVP)

1. A simple repo (≤10 routes, single role) produces at least one advisory or confirmed finding within 3 minutes.
2. A medium-complexity repo produces AppGraph and confirmed findings within 8 minutes.
3. Symbolic-lite engine detects ≥ 3 exploit classes (IDOR, horizontal escalation, mass assignment).
4. Sandbox successfully executes IDOR attack against seeded test users and produces full evidence package.
5. Patch validator applies patch, rebuilds, re-exploits, and correctly reports whether exploit is blocked.
6. Auto-PR includes: original proof + patch diff + fix validation log.
7. GitHub App posts plain-English PR comments with proof payload and pre-verified fix link.
8. Threat memory stores exploit patterns and demonstrably influences next scan priority.
9. Exploit path graph correctly renders attack chain with correct node types and edges.
10. Impact-first sort order correctly prioritizes cross-user data exposure over advisory findings.

## Appendix — Example PR Comment

**Title:** "AART Security Check — Exploit Confirmed"

CONFIRMED · EXECUTED · High Impact

**Plain English:** "Anyone can read any user's invoice."

**Proof:** "We authenticated as User A and retrieved User B's invoice. Response contained userId: USER_B_UUID, amount: $4,200"

Confidence: 0.92 (symbolic 0.86 + sandbox PASS)

Pre-verified fix: LLM-drafted patch applied in sandbox → exploit blocked → PR ready for review.

Actions: [Create Fix PR (pre-tested)] [View full proof] [Mark false positive]