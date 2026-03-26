# AART Codebase Alignment Audit
**Spec: [AART_UI_Dev_Plan.md](file:///f:/AART/aart-cyber-shield/PRD/AART_UI_Dev_Plan.md) (22 Screens) + [APP_FLOW_v3.md](file:///f:/AART/aart-cyber-shield/PRD/APP_FLOW_v3.md) (10 Flows)**
**Audit Date: March 19, 2026**

> [!CAUTION]
> This audit reveals significant gaps between the spec and the current implementation. Many screens exist as visual shells but lack live data integration. Several backend endpoints are missing entirely.

---

## VERDICT SUMMARY

| Category | Status |
|---|---|
| **Routes/Pages Exist** | 20/22 screens have files ✅ |
| **Wired to Backend** | ~8/22 screens fetch real data ⚠️ |
| **Spec-Compliant Features** | ~4/22 screens match spec behavior ❌ |
| **Backend Endpoints** | 15/~25 needed exist ⚠️ |
| **Sidebar Navigation** | Misaligned with spec ❌ |

---

## 🔴 CRITICAL ISSUES (Blocking / Breaking)

### 1. Sidebar Navigation Doesn't Match Spec

**Spec says (APP_FLOW §2):** `Dashboard · Repos · Findings · Exploit Paths · Threat Memory · Settings`

**Actual [AppSidebar.tsx](file:///f:/AART/aart-cyber-shield/src/components/AppSidebar.tsx):**
- `Dashboard · Findings · Exploit Paths · Scans · Pull Requests · Repos · Reports`
- [Scans](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts#221-232), `Pull Requests`, `Reports` — **don't exist** (routes lead to 404)
- `Threat Memory` — **missing from sidebar** entirely (page exists but unreachable)

### 2. ExploitPaths Page Is 100% Hardcoded Mock Data

[ExploitPaths.tsx](file:///f:/AART/aart-cyber-shield/src/pages/ExploitPaths.tsx) has a beautiful 3D graph — but the chains array (lines 49-146) is entirely hardcoded mock data. It **never calls the backend**. No [useFindings()](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts#241-250) or `GET /exploit-paths` hook exists.

### 3. ThreatMemory Page Is 100% Hardcoded Mock Data

[ThreatMemory.tsx](file:///f:/AART/aart-cyber-shield/src/pages/ThreatMemory.tsx) displays hardcoded `repoMemories` object (lines 9-54). No backend endpoint for threat memory exists. No API hook exists.

### 4. FindingDetail Evidence — Object Rendering Crashes

Backend returns nested objects (e.g., [auth_context](file:///f:/AART/aart-cyber-shield/AARTv1/backend/sandbox/evidence.py#163-184) as `{user_role, token_type, token_subject}`), but the UI tried to render them as React children. Fixed with `JSON.stringify` safeguards, but the **real fix** is to flatten these in the backend response.

---

## SCREEN-BY-SCREEN AUDIT

### SECTION 1 — ONBOARDING (Screens 1-4)

| Screen | Route | File Exists | Wired to Backend | Spec-Compliant |
|---|---|---|---|---|
| 1. Connect Repo | `/onboarding/connect` | ✅ | ✅ `POST /repos/connect` | ⚠️ 80% |
| 2. Scanning | `/onboarding/scanning` | ✅ | ⚠️ Partially | ❌ 30% |
| 3A. First Findings | `/onboarding/findings` | ✅ | ❌ Mock | ❌ 20% |
| 3B. Clean Repo | `/onboarding/clean` | ✅ | ❌ Mock | ❌ 20% |
| 4. GitHub App Install | `/onboarding/github-app` | ✅ | ❌ Mock | ⚠️ 60% |

**ConnectRepo** — Good: has URL input, permissions explainer, trust bar, error handling. Missing: no inline retry on failure.

**Scanning** — Has [useScanStatus](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts#168-184) polling but no live terminal feed from backend. Spec requires step-by-step terminal output. Backend has `current_step` + `progress_percent` in scan but **no streaming/log endpoint**.

**FirstFindings** — Renders top-3 mock cards. Not wired to `GET /findings?repo_id=X&limit=3`. No evidence preview. No "View Exploit Proof" / "Create Fix PR" CTAs wired.

**CleanRepo** — Static mock. Spec requires checklist of attack patterns attempted. No backend data for "patterns tested."

**GithubAppInstall** — Simulated install via `localStorage`. Acceptable for MVP, but the 3-step explanation doesn't match spec format.

---

### SECTION 2 — CORE APP (Screens 5-13)

| Screen | Route | File Exists | Wired to Backend | Spec-Compliant |
|---|---|---|---|---|
| 5. Dashboard | `/dashboard` | ✅ | ✅ | ⚠️ 65% |
| 6. Repos List | `/repos` | ✅ | ✅ | ⚠️ 70% |
| 7. Repo Detail | `/repos/:id` | ✅ | ✅ | ⚠️ 50% |
| 8. Scan History | `/repos/:id/scans` | ✅ | ✅ | ⚠️ 60% |
| 9. Findings List | `/findings` | ✅ | ✅ | ✅ 85% |
| 10. Finding Detail | `/findings/:id` | ✅ | ✅ | ⚠️ 55% |
| 11. False Positive | Modal on finding | ✅ | ✅ | ✅ 90% |
| 12. Exploit Paths | `/exploit-paths` | ✅ | ❌ Mock | ❌ 10% |
| 13. Threat Memory | `/threat-memory/:id` | ✅ | ❌ Mock | ❌ 10% |

#### Dashboard (Screen 5) — Gaps:
- ✅ Health grade widget, stats bar, onboarding checklist, GitHub nudge banner
- ❌ `grade_trend` is always hardcoded `"up"` in backend — no actual trend calculation
- ❌ `resolved_this_week` is same as all-time `resolved` — timestamp query is a placeholder
- ❌ Finding cards on dashboard don't navigate to finding detail on click
- ❌ Missing "last scan" timestamp (shows "Live Mode" instead)
- ❌ "Scan Now" button not wired (no onClick handler)

#### Repos List (Screen 6) — Gaps:
- ✅ Grid layout, grade display, confirmed/advisory counts, tier display
- ✅ Add repo modal with GitHub selector
- ❌ "Scan now" button on card not wired
- ❌ "PR checks inactive" reconnect link not wired
- ❌ Hardcoded `availableRepos` list in modal — should discover from GitHub API

#### Repo Detail (Screen 7) — Gaps:
- ✅ Repo header, fingerprint card, findings list
- ❌ **Grade history display** — spec requires historical grades, not implemented
- ❌ **"Scan now" button** in header not wired
- ❌ Fingerprint data from backend partially broken (some fields return `null`)

#### Scan History (Screen 8) — Gaps:
- ✅ Scan list with status, tier, trigger type
- ❌ **Retry failed scan** button not wired
- ❌ Click-to-view findings from a specific scan not implemented

#### Findings List (Screen 9) — Best Aligned ✅:
- ✅ Status filters, sort options, repo dropdown
- ✅ URL-driven filter state (shareable)
- ✅ Impact-first sort order
- ⚠️ "Create Fix PR" button on card — not wired (no backend endpoint for patch generation)

#### Finding Detail (Screen 10) — Major Gaps:
- ✅ 4-tab layout (Proof, Exploit Path, Patch, History)
- ✅ Proof tab shows evidence data from backend
- ✅ Exploit path tab shows chain visualization
- ✅ History tab shows events
- ✅ False positive modal wired to `POST /findings/:id/ignore`
- ✅ Re-run button wired to `POST /findings/:id/rerun`
- ❌ **Patch tab**: Entire tab is a static placeholder. No `GET /findings/:id/patch` endpoint. No patch generation flow.
- ❌ **Exploit Path Graph**: Tab 2 renders a list view, not the interactive graph from Exploit Paths page
- ❌ Evidence objects crash when nested (partially fixed but needs backend flatten)
- ❌ `Copy reproducible script` / `Download evidence package` buttons — not wired

#### Exploit Paths (Screen 12) — **Critical Failure**:
- ✅ Beautiful 3D graph with Three.js + ForceGraph3D
- ✅ Repo filter chips, mobile fallback cards, node detail panel, legend
- ❌ **100% hardcoded mock data** — 6 fake chains from "api-gateway" and "billing-api"
- ❌ No `GET /exploit-paths` endpoint exists in backend
- ❌ No `useExploitPaths()` hook exists in [useAartApi.ts](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts)

#### Threat Memory (Screen 13) — **Critical Failure**:
- ✅ Beautiful UI with weakness patterns, dev team patterns, scan bias, timeline
- ❌ **100% hardcoded mock data** — single `repoMemories["repo-1"]` object
- ❌ No `GET /threat-memory/:id` endpoint exists in backend
- ❌ No `useThreatMemory()` hook exists in [useAartApi.ts](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts)
- ❌ "Run targeted scan" button not wired

---

### SECTION 3 — SETTINGS (Screens 14-18)

| Screen | Route | File Exists | Wired to Backend | Spec-Compliant |
|---|---|---|---|---|
| 14. Profile | `/settings/profile` | ✅ | ❌ Mock | ⚠️ 50% |
| 15. Settings Repos | `/settings/repos` | ✅ | ⚠️ Partial | ⚠️ 40% |
| 16. GitHub App | `/settings/github-app` | ✅ | ❌ Mock | ⚠️ 60% |
| 17. Notifications | `/settings/notifications` | ✅ | ❌ Mock | ⚠️ 50% |
| 18. Danger Zone | `/settings/danger` | ✅ | ⚠️ Partial | ⚠️ 55% |

**Profile** — Fixed mockUser. No save functionality. No backend endpoint.

**Settings Repos** — Renders repo list with scan frequency dropdown. Missing: T1/T2 confidence threshold sliders, PR blocking toggle, memory bias toggle. No `PATCH /repos/:id/settings` endpoint.

**GitHub App** — localStorage-based connection state. No real GitHub App install detection.

**Notifications** — Toggle UI exists but changes are not persisted anywhere.

**Danger Zone** — Repo select dropdown wired to [useRepos()](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts#196-205). Export/Reset/Delete — none are wired to backend endpoints. No `DELETE /repos/:id`, `POST /repos/:id/reset-memory`, or `GET /export` endpoints exist.

---

### SECTION 4 — ERROR STATES (Screens 19-20)

| Screen | File Exists | Spec-Compliant |
|---|---|---|
| 19. 404 Not Found | ✅ [NotFound.tsx](file:///f:/AART/aart-cyber-shield/src/pages/NotFound.tsx) | ⚠️ 70% |
| 20. 500 Server Error | ✅ [ServerError.tsx](file:///f:/AART/aart-cyber-shield/src/pages/ServerError.tsx) | ⚠️ 60% |

**404** — Exists, navigates back. Missing: dashboard link.

**500** — Exists with incident ID. Missing: retry button, automatic error boundary integration.

---

## BACKEND ENDPOINT AUDIT

### Endpoints That Exist and Work ✅

| Endpoint | Notes |
|---|---|
| `POST /scan` | Triggers scan, returns scan_id |
| `POST /repos/connect` | Creates repo + scan |
| `GET /dashboard/stats` | Returns stats (some fields are placeholders) |
| `GET /repos` | Returns repo list |
| `GET /repos/:id` | Returns repo detail w/ fingerprint |
| `GET /repos/:id/scans` | Returns scan history |
| `GET /scans/:id` | Returns scan status |
| `GET /findings` | Returns findings with filters |
| `GET /findings/:id` | Returns finding detail |
| `GET /findings/:id/evidence` | Returns evidence package |
| `GET /findings/:id/path` | Returns exploit path graph |
| `GET /findings/:id/events` | Returns finding events |
| `POST /findings/:id/ignore` | Marks finding as ignored |
| `POST /findings/:id/rerun` | Queues rerun (logs intent only) |

### Endpoints Missing From Backend ❌

| Needed For | Endpoint | Priority |
|---|---|---|
| Exploit Paths page | `GET /exploit-paths` | 🔴 HIGH |
| Threat Memory page | `GET /threat-memory/:repoId` | 🔴 HIGH |
| Patch generation | `POST /findings/:id/generate-patch` | 🔴 HIGH |
| Patch retrieval | `GET /findings/:id/patch` | 🔴 HIGH |
| Repo deletion | `DELETE /repos/:id` | 🟡 MEDIUM |
| Memory reset | `POST /repos/:id/reset-memory` | 🟡 MEDIUM |
| Data export | `GET /export` | 🟡 MEDIUM |
| Profile update | `PATCH /user/profile` | 🟢 LOW |
| Notification prefs | `GET/PATCH /user/notifications` | 🟢 LOW |
| Repo settings | `PATCH /repos/:id/settings` | 🟢 LOW |
| Scan trigger (from card) | `POST /repos/:id/scan` | 🟡 MEDIUM |

---

## FRONTEND API HOOK GAPS

Missing hooks in [useAartApi.ts](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts):

| Hook | Needed For |
|---|---|
| `useExploitPaths()` | Exploit Paths page |
| `useThreatMemory(repoId)` | Threat Memory page |
| `usePatchRecord(findingId)` | Finding Detail Patch tab |
| `useGeneratePatch()` | Patch generation mutation |
| `useCreateFixPR()` | Create Fix PR action |
| `useDeleteRepo()` | Danger Zone |
| `useResetMemory()` | Danger Zone |
| `useExportData()` | Danger Zone |
| `useUpdateProfile()` | Profile settings |
| `useUpdateNotifications()` | Notification settings |
| `useUpdateRepoSettings()` | Repo settings |
| `useScanRepo(repoId)` | Trigger scan from repo card |

---

## SUMMARY OF ROOT CAUSES

1. **Frontend-first development** — Beautiful UI shells were built before backend endpoints existed. Many pages have stunning visuals but render hardcoded data.

2. **Evidence data shape mismatch** — Backend stores evidence as nested JSON objects (e.g., [auth_context](file:///f:/AART/aart-cyber-shield/AARTv1/backend/sandbox/evidence.py#163-184) is `{user_role, token_type, token_subject}`), but frontend tries to render these directly as strings.

3. **No data aggregation layer** — Exploit Paths page needs a cross-repo aggregation query. Threat Memory needs a new table or computed view. Neither exists in the DB schema.

4. **Sidebar drift** — Sidebar links were added for future features ([Scans](file:///f:/AART/aart-cyber-shield/src/hooks/useAartApi.ts#221-232), `Pull Requests`, `Reports`) that don't have pages, while existing pages (`Threat Memory`) aren't linked.

5. **Backend placeholder logic** — `grade_trend` is hardcoded `"up"`, `resolved_this_week` uses all-time count, `prs_scanned_this_week` doesn't filter by week.

---

## PRIORITY FIX ROADMAP

### P0 — Fix Right Now (Broken UX)
1. **Fix sidebar** — Remove phantom links, add Threat Memory, match spec order
2. **Wire Dashboard buttons** — "Scan Now" onClick, finding card navigation
3. **Fix `grade_trend`** — Compute from historical data or default to `"flat"`

### P1 — Wire Data (Core Value)
4. **Exploit Paths ← real data** — Build `GET /exploit-paths` aggregating all confirmed findings' paths, replace hardcoded chains
5. **Threat Memory ← real data** — Build `GET /threat-memory/:repoId` from threat_memory table, replace hardcoded object
6. **First Findings page** — Wire to `GET /findings` with scan result data
7. **Scanning page** — Wire terminal feed to real scan steps

### P2 — Complete Features (Feature Parity)
8. **Patch tab** — Build `GET/POST /findings/:id/patch` endpoints and wire UI
9. **Settings** — Wire all save/delete operations with backend endpoints
10. **Danger Zone** — Build delete/export/reset endpoints

### P3 — Polish
11. **Onboarding gate** — Implement redirect logic from APP_FLOW §5
12. **Error boundaries** — Add React error boundary wrapper
13. **Evidence flattening** — Normalize backend evidence response shape
