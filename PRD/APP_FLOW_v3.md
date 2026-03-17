# APP_FLOW.md — [AART]
> Autonomous API Red Teaming Tool
> Version 3.0 — MVP Edition (Feature-Complete) | Senior UX/Frontend Reference Document
> Stack: Framer (marketing) · Lovable/React (app) · Mock Auth (testing) → Supabase Auth (production) · Supabase DB · GitHub App

---

## DESIGN DECISIONS (LOCKED)

| Decision | Choice | Rationale |
|---|---|---|
| Scan before GitHub App install | ✅ On-demand scan first | Lower friction, value before commitment |
| Color mode | Dark only at launch | Developer-native, brand-consistent |
| Auth — MVP/testing | Mock auth (hardcoded test user, no real sessions) | Ship faster, validate product before auth complexity |
| Auth — production | Supabase Auth + GitHub OAuth | Swap in post-validation, no architecture change needed |
| Domain structure | `yourname.com` (Framer) + `app.yourname.com` (Lovable) | Standard subdomain split |
| First finding target | < 3 min simple, < 8 min medium | Per PRD acceptance criteria |
| Repo limits | None | No restrictions during testing phase |
| Paid plans | None | Introduced post-validation only |
| Feature gates | None | All 7 features available to all users |

---

## MVP SCOPE NOTE

> **Auth:** Mock auth during testing phase — single hardcoded test user, bypass all auth screens, direct to dashboard. Swap to Supabase Auth when moving to production. No architecture changes required.
>
> **Features:** All 7 differentiation features are in scope for MVP. No feature gates, no plan limits.
>
> **Billing/Limits:** `[POST-MVP]` — documented at bottom, not built now.

### Mock Auth Implementation
```
MVP testing:
  - Single test user: { id: "test-user-001", email: "dev@test.com", name: "Test User" }
  - All auth routes (/login, /register) redirect directly to /onboarding/connect or /dashboard
  - No sessions, no tokens, no OAuth flows during testing
  - Supabase DB still used for all app data (repos, findings, scans)
  - Auth swap: replace mock user object with supabase.auth.getUser() — one file change

Production swap checklist:
  [ ] Enable Supabase Auth in project settings
  [ ] Add GitHub OAuth provider credentials
  [ ] Replace mockUser with supabase.auth.getSession()
  [ ] Enable /auth/callback route
  [ ] Enable email verification flow
  [ ] Remove mock auth bypass
```

---

## FEATURE OVERVIEW — 7 DIFFERENTIATION FEATURES

| # | Feature | Status | Core Differentiator |
|---|---|---|---|
| 1 | Verified Exploit Confirmation | ✅ MVP Core | We execute the attack and show proof — nobody else does |
| 2 | Auto Patch PR + Deterministic Re-Test | ✅ MVP Core | Closed-loop: patch → rebuild → re-exploit → confirm fixed |
| 3 | Product-Specific Threat Memory | ✅ MVP Core | Gets smarter per-repo over time — sticky moat |
| 4 | Deterministic + AI Hybrid Reasoning | ✅ MVP Core | AI-assisted, deterministically validated — no hallucinations |
| 5 | Exploit Path Visualization | ✅ MVP Core | Graph view of full attack chain — nobody visualizes this well |
| 6 | Impact-First Risk Prioritization | ✅ MVP Core | Prioritize by confirmed damage, not theoretical CVSS |
| 7 | Selective Runtime Blocking | 🔶 POST-MVP | Smart per-pattern blocking (not WAF) |

---

## 1. ENTRY POINTS

```
MVP (mock auth — all auth entries bypass to app directly):
1. Direct URL            → yourname.com                           (Framer landing)
2. Direct URL            → app.yourname.com                       (→ /dashboard directly in mock auth)
3. CTA from landing      → app.yourname.com/dashboard             (Mock: skip register)
4. PR comment link       → app.yourname.com/findings/[id]         (Deep link from GitHub PR)
5. Email — finding alert → app.yourname.com/findings/[id]         (Finding notification)
6. Email — weekly digest → app.yourname.com/dashboard             (Weekly report CTA)
7. GitHub App install    → app.yourname.com/onboarding/github-app (Post-install redirect)

Production (add these when Supabase Auth enabled):
8. GitHub OAuth          → app.yourname.com/auth/callback         (Supabase OAuth callback)
9. Email — verify        → app.yourname.com/auth/verify           (Email verification)
10. Search engines       → yourname.com                           (SEO — Framer handles)
```

---

## 2. CORE USER FLOWS

---

### FLOW 1 — Onboarding & First Scan (Critical Path)

> Primary goal: reach first confirmed finding with exploit proof as fast as possible.
> Mock auth: skip register/login entirely. Land on /onboarding/connect.

---

#### HAPPY PATH

**Step 1 — Landing Page** `yourname.com`
- Hero: outcome-first copy → single CTA → trust bar → social proof counters
- CTA: `"Scan your API free →"` → `app.yourname.com/onboarding/connect` (mock) or `/register` (prod)
- Trust bar: `"We execute real attacks in isolated sandboxes · We never touch production · Plain English findings"`
- Social proof: `[X] repos scanned · [X] exploits confirmed · [X] patches verified`

---

**Step 2 — Connect Repo** `app.yourname.com/onboarding/connect`
- Single-focus screen, no sidebar
- Headline: `"Connect a repo to scan"`
- Subtext: `"Read-only access. We run attacks in our sandboxes, never against your live app."`
- Primary: `"Connect GitHub repo"` button
- Expandable permissions explainer:
  - `contents (read)` → `"To read your code and routes. We never modify anything."`
  - `metadata (read)` → `"Repo name and basic info only."`
- User selects repo(s) → ingestion begins → redirect `/onboarding/scanning`

---

**Step 3 — Scanning** `app.yourname.com/onboarding/scanning`
- Full-screen terminal aesthetic, monospaced live feed:
  ```
  > Cloning repository...                              ✓
  > Detecting stack... Node.js / Express found          ✓
  > Reading routes... 12 endpoints detected             ✓
  > Building attack surface graph...                    ✓
  > Classifying complexity... Medium tier               ✓
  > Symbolic evaluation: GET /users/:id...
  > Checking ownership constraints...
  > Scoring exploit candidates...
  > Confidence threshold met — spawning sandbox...      ✓
  > Seeding test users A and B...                       ✓
  > Executing exploit scenario: IDOR on /invoices/:id...
  > Capturing evidence payload...                       ✓
  > Exploit confirmed. Building proof package...        ✓
  ```
- Progress bar: 0%→100%, estimated time shown per tier
- Collapsed `"What are we doing?"` section — educates during wait
- Soft nav lock: toast if user tries to leave
- On complete → `/onboarding/findings` or `/onboarding/clean`

---

**Step 4A — First Findings** `app.yourname.com/onboarding/findings`

> Feature 1 (Verified Exploit Confirmation) + Feature 6 (Impact-First Prioritization) surface here.

- Headline: `"We found [X] confirmed issue[s] in [repo-name]"`
- Subheadline: `"These aren't theoretical. We executed the attacks. Here's proof."`
- Findings sorted by **real impact** (confirmed > data exposed > privilege escalated) — not CVSS
- Finding card:
  ```
  [🔴 CONFIRMED · EXECUTED]         Impact: Cross-user data exposure

  "Anyone can read any user's invoice."

  GET /invoices/:id — no ownership check detected.
  We authenticated as User A and retrieved User B's invoice.

  Evidence: Response contained userId: B_UUID, amount: $4,200   [View full proof →]

  Confidence: 0.92 · Sandbox: PASS · Auth context: JWT (User A)

  [ View Exploit Proof ]    [ Create Fix PR ]    [ See all findings ]
  ```
- Primary CTA: `"View exploit proof"` → finding detail (Feature 1 in full)
- Secondary CTA: `"Set up PR protection →"` → GitHub App install

**Step 4B — Clean Repo** `app.yourname.com/onboarding/clean`
- Headline: `"No critical issues confirmed in this scan"`
- Subtext: `"Here's what we checked and attacked:"` → checklist of all patterns + attack scenarios attempted
- CTA: `"Set up PR protection →"`

---

**Step 5 — GitHub App Install** `app.yourname.com/onboarding/github-app`
- Headline: `"Catch vulnerabilities before they merge"`
- 3-step (text, no illustrations):
  - `01 · You open a PR`
  - `02 · We execute attack scenarios against the changes`
  - `03 · We post proof + a verified fix in the PR`
- Primary: `"Install GitHub App →"` (new tab)
- Secondary: `"Skip for now →"` (nudge banner persists on dashboard)
- Post-install: `"✓ GitHub App installed. Every PR is now covered."` → `"Go to dashboard →"`

---

**Step 6 — Dashboard** `app.yourname.com/dashboard`
- Onboarding checklist widget:
  - [x] Connect repo
  - [x] Run first scan
  - [ ] Install GitHub App
  - [ ] Fix first finding

---

#### ERROR STATES — Flow 1

| Error | Trigger | Display | Recovery |
|---|---|---|---|
| GitHub OAuth failure | GitHub error | `"GitHub connection failed. Try again."` toast | Retry |
| Repo access denied | User cancels | `"No repo connected"` inline | `"Try again"` |
| Scan timeout | Exceeds 15 min | `"Taking longer than expected."` | Auto-retry; email when done |
| Scan error | Internal failure | `"Something went wrong. Queued for retry."` | Auto-retry; email |
| No routes detected | No Express routes | `"No API routes found. Is this a Node.js/Express app?"` | Link to docs |
| Sandbox failure | Docker error | `"Sandbox unavailable. Running static analysis only."` | Heuristic result shown |

---

#### EDGE CASES — Flow 1

| Scenario | Handling |
|---|---|
| User abandons mid-scan | Scan + exploit execution continues server-side. Email on completion. |
| Sandbox runs but exploit fails | Finding reported as ADVISORY (not CONFIRMED). No false confirmation. |
| All candidates below confidence threshold | Heuristic findings shown. Never silent. |
| Session expires during scan (prod auth) | Scan continues server-side. On re-login → redirect to findings. |

---

### FLOW 2 — Returning User / Daily Use

**Entry:** `app.yourname.com` → mock user loaded → `/dashboard`

**Dashboard** `app.yourname.com/dashboard`

> Feature 6 (Impact-First Prioritization) is the primary dashboard organizing principle.

- Sidebar: Logo · Dashboard · Repos · Findings · Exploit Paths · Threat Memory · Settings
- Main area:
  ```
  [Security Grade: B]  ↑ from C last week

  [2 Confirmed · Executed]   [1 Advisory]   [1 Resolved this week]   [8 PRs scanned]

  Impact-prioritized findings:
  🔴 Cross-user data exposure    GET /invoices/:id      [View proof →]
  🔴 Privilege escalation        POST /admin/users      [View proof →]
  🟡 Mass assignment risk        PUT /users/:id         [View guidance →]

  [Scan now]   [View all findings]
  ```
- Findings ordered by: confirmed + data exposed → confirmed + privilege escalated → confirmed + role broken → advisory

---

### FLOW 3 — Finding Detail & Exploit Proof

`app.yourname.com/findings/[id]`

> Feature 1 (Verified Exploit Confirmation) + Feature 5 (Exploit Path Visualization) live here.
> This is the most important screen in the product.

---

**Layout:** Full-width header + 4 tabs

**Header:**
```
🔴 CONFIRMED · EXECUTED                    Impact: Cross-user data exposure
"Anyone can read any user's invoice."
GET /invoices/:id · Confidence: 0.92 · Sandbox PASS · Detected: 2h ago
```

**Tab 1 — Proof** *(Feature 1: Verified Exploit Confirmation)*
```
ATTACK EXECUTION RECORD
─────────────────────────────────────────────────────
Attack type:      IDOR — Horizontal privilege escalation
Auth context:     JWT Bearer token (User A, role: user)
Target:           GET /invoices/B_INVOICE_UUID
Sandbox users:    User A (attacker) · User B (victim)

REQUEST SENT:
  curl -X GET https://sandbox.app/invoices/B_INVOICE_UUID \
    -H "Authorization: Bearer USER_A_JWT"

RESPONSE RECEIVED:
  HTTP 200 OK
  {
    "id": "B_INVOICE_UUID",
    "userId": "USER_B_UUID",       ← User B's data, returned to User A
    "amount": 4200,
    "status": "paid",
    "clientEmail": "client@example.com"
  }

RESPONSE DIFF (User A's own invoice vs User B's):
  - userId: USER_A_UUID
  + userId: USER_B_UUID            ← Different user's data confirmed
  - amount: 1200
  + amount: 4200

VERDICT: EXPLOIT CONFIRMED — cross-user data extracted
─────────────────────────────────────────────────────
[Copy reproducible script]   [Download evidence package]
```

**Tab 2 — Exploit Path** *(Feature 5: Exploit Path Visualization)*
- Interactive graph — dark theme, nodes connected by edges
- Node types:
  - `[USER A · JWT]` → `[GET /invoices/:id]` → `[Missing ownership check]` → `[Invoice model]` → `[USER B data exposed]`
- Each node clickable → shows detail panel (code location, constraint, what was evaluated)
- Edge labels: `authenticated`, `no ownership constraint`, `direct DB read`, `data returned`
- Bottom: deterministic trace — list of graph nodes + symbolic constraints evaluated

**Tab 3 — Patch** *(Feature 2: Auto Patch PR + Deterministic Re-Test)*

```
SUGGESTED FIX (LLM-drafted · deterministically validated · labeled draft)
─────────────────────────────────────────────────────
// controllers/invoiceController.js  line 34

- const invoice = await Invoice.findById(req.params.id);
+ const invoice = await Invoice.findOne({
+   _id: req.params.id,
+   userId: req.user.id        // ownership check added
+ });
+ if (!invoice) return res.status(404).json({ error: 'Not found' });

FIX VALIDATION (run in sandbox before PR):
  Step 1: Apply patch in sandbox             ✓
  Step 2: Rebuild app                        ✓
  Step 3: Re-execute same exploit            ✓
  Step 4: Result → HTTP 404 (exploit blocked) ✓
  VERDICT: FIX VERIFIED — exploit no longer reproducible
─────────────────────────────────────────────────────
[ Create Fix PR (pre-verified) ]   [ Copy diff ]   [ Re-run exploit ]
```

- `"Create Fix PR"` → [AART] opens PR with:
  - Before/after diff
  - Exploit proof (original)
  - Fix validation log (sandbox result)
  - Re-test result showing exploit blocked

**Tab 4 — History**
- Timeline: detected → sandbox executed → confirmed → patch suggested → PR created → fix merged → re-tested → resolved
- Each event timestamped with actor (system / developer)

**Sticky action bar:**
`[Create Fix PR]` `[Mark False Positive]` `[Re-run Exploit]` `[Download Evidence]`

---

### FLOW 4 — Auto Patch PR (Feature 2)

`/findings/[id]` → `"Create Fix PR"` button

**System flow:**
1. LLM drafts minimal patch (constrained schema)
2. Deterministic engine validates patch structure
3. Patch applied in sandbox copy of app
4. App rebuilt in sandbox
5. Same exploit re-executed against patched version
6. Result captured (PASS = exploit blocked / FAIL = still vulnerable)
7. If PASS → PR auto-generated containing:
   - Patch diff
   - Original exploit proof
   - Fix validation log
   - Re-test result
8. PR opened in developer's repo → developer reviews + merges

**PR body includes:**
```
## [AART] Security Fix — Verified

This patch was generated and pre-verified in an isolated sandbox.

### What was fixed
IDOR on GET /invoices/:id — cross-user data exposure

### Fix validation
- Patch applied in sandbox ✓
- App rebuilt ✓
- Original exploit re-executed ✓
- Result: HTTP 404 (exploit blocked) ✓

### Before (vulnerable)
[diff snippet]

### After (fixed + verified)
[diff snippet]

[View full exploit proof →]   [View sandbox re-test log →]
```

**Developer actions:**
- Review diff → merge → webhook fires → [AART] runs final re-test → marks resolved

**If patch validation FAILS (exploit still reproducible after patch):**
- PR not created
- Finding detail shows: `"Our suggested patch didn't fully resolve this. Here's what we still see:"` + updated proof
- LLM drafts alternative approach → re-validates → shows revised patch

---

### FLOW 5 — PR Check (CI Integration, Automated)

> Feature 1 (Confirmed execution) + Feature 6 (Impact-first) in PR context.

**Trigger:** Developer opens PR

**System:**
1. GitHub webhook → [AART] backend
2. Complexity Router classifies delta (changed routes only)
3. Pipeline runs (fast-path or full per tier)
4. High-confidence candidates → sandbox → exploit executed
5. PR comment posted with proof or advisory

**PR Comment (confirmed exploit):**
```
## [AART] Security Check — Exploit Confirmed

🔴 CONFIRMED · EXECUTED · High Impact

**Anyone can read any user's invoice.**

We executed this attack in an isolated sandbox. Here's proof:

Authentication: User A (JWT Bearer)
Attack:         GET /invoices/B_INVOICE_UUID
Result:         HTTP 200 — returned User B's private invoice data

curl -X GET https://sandbox/invoices/B_INVOICE_UUID \
  -H "Authorization: Bearer USER_A_JWT"
# → 200 OK { userId: USER_B_UUID, amount: 4200 }

Confidence: 0.92 | Runtime: PASS | This is not theoretical.

A pre-verified fix is ready:
---
[Create Fix PR (pre-tested) →]   [View full proof →]   [Mark false positive →]
```

**PR Comment (advisory — below sandbox threshold):**
```
## [AART] Security Advisory

🟡 ADVISORY · Static analysis · Confidence: 0.68

**GET /users/:id may lack an ownership check.**

We detected a potential IDOR pattern but confidence was below our
execution threshold (0.75). No sandbox test was run.

Review: Does this route verify req.user.id === resource.userId?

[View analysis →]   [Trigger manual sandbox test →]   [Mark false positive →]
```

---

### FLOW 6 — Threat Memory View

`app.yourname.com/threat-memory`

> Feature 3 (Product-Specific Threat Memory) — new screen.

**Layout:**
- Header: `"[Repo name] — Security Memory"`
- Subtext: `"[AART] learns your codebase over time. Each scan gets smarter."`
- Sections:

**Weakness Patterns (this repo):**
```
Ownership check gaps          ████████░░  4 confirmed, 1 resolved
Missing auth middleware        ██░░░░░░░░  1 confirmed
Mass assignment risk           ███░░░░░░░  2 advisory
```

**Dev Team Patterns:**
- `"This codebase frequently uses direct model.findById() without ownership filtering"`
- `"Auth middleware is consistently applied to GET routes but missed on PUT routes"`

**Scan Bias (next scan will prioritize):**
- `PUT /users/:id` — mass assignment candidate (flagged by memory)
- `GET /documents/:id` — same pattern as confirmed IDOR on /invoices/:id
- `POST /admin/*` — role boundary check history

**History:**
- Timeline of all confirmed exploits, patterns learned, memory updates

**User action:** `"Run targeted scan →"` (memory-biased, faster, higher signal)

---

### FLOW 7 — False Positive / Feedback

`/findings/[id]/feedback` (modal)

- Headline: `"Tell us why this isn't a real issue"`
- Options:
  - `"The sandbox test doesn't reflect our real auth setup"`
  - `"This route isn't accessible in production"`
  - `"The check exists in a layer we don't parse yet"`
  - `"The risk is acceptable for this use case"`
  - `"Other"`
- Optional text
- Submit → `Ignored` · Threat Memory updated (deprioritize this pattern for this repo) · toast: `"Noted. We'll adjust future scans for this repo."`

---

### FLOW 8 — Fix & Resolve (Manual)

1. Developer applies fix manually (or merges AART PR)
2. Merge webhook fires
3. [AART] re-executes same exploit in sandbox
4A. **Blocked:** `Resolved` · green badge · email: `"✓ Exploit confirmed blocked. Fix verified."` · Threat Memory updated
4B. **Still reproducible:** Status stays `Open` · PR comment: `"Fix didn't fully close this. New proof attached."`

---

### FLOW 9 — Add Repo (Post-Onboarding)

`/repos` → `"Add repo"` → GitHub selector → ingestion → scan → findings

---

### FLOW 10 — Settings

- `/settings/profile` — name, email (mock: pre-filled from test user)
- `/settings/repos` — connected repos, per-repo config (confidence thresholds, scan frequency, memory bias)
- `/settings/github-app` — install status, reconnect
- `/settings/notifications` — email preferences
- `/settings/danger` — export data, reset threat memory, delete repo

---

## 3. NAVIGATION MAP

```
yourname.com (Framer — public)
├── / (Landing)
├── /docs
└── /blog

app.yourname.com (Lovable/React)
│
├── PUBLIC (mock: bypass all → /onboarding/connect or /dashboard)
│   ├── /login            [mock: → /dashboard]
│   ├── /register         [mock: → /onboarding/connect]
│   ├── /auth/callback    [prod only]
│   └── /auth/verify      [prod only]
│
├── ONBOARDING (first-time)
│   ├── /onboarding/connect
│   ├── /onboarding/scanning
│   ├── /onboarding/findings
│   ├── /onboarding/clean
│   └── /onboarding/github-app
│
└── APP (post-onboarding)
    ├── /dashboard
    ├── /repos
    │   ├── /repos/[id]
    │   └── /repos/[id]/scans
    ├── /findings
    │   ├── /findings
    │   └── /findings/[id]
    │       └── /findings/[id]/feedback
    ├── /exploit-paths           ← NEW: Feature 5 standalone view
    ├── /threat-memory           ← NEW: Feature 3 view
    │   └── /threat-memory/[repo-id]
    └── /settings
        ├── /settings/profile
        ├── /settings/repos
        ├── /settings/github-app
        ├── /settings/notifications
        └── /settings/danger
```

---

## 4. SCREEN INVENTORY

| Screen | Route | Access | Purpose | Key Elements | States |
|---|---|---|---|---|---|
| Landing | `yourname.com` | Public | Convert visitors | Hero, CTA, trust bar, social proof | Default (Framer) |
| Register | `/register` | Public (mock: bypass) | Create account | GitHub OAuth, email form | Default · Mock bypass |
| Login | `/login` | Public (mock: bypass) | Authenticate | GitHub OAuth, email | Default · Mock bypass |
| Auth callback | `/auth/callback` | Prod only | Supabase token handler | Spinner | Processing · Error |
| Connect repo | `/onboarding/connect` | Auth | Link GitHub repo | Connect btn, permissions | Default · Connecting · Error |
| Scanning | `/onboarding/scanning` | Auth | Analysis + exploit execution | Terminal feed, progress | Running · Exploiting · Complete · Error |
| First findings | `/onboarding/findings` | Auth | First results with proof | Finding cards + proof preview | Has findings · Clean |
| GitHub App install | `/onboarding/github-app` | Auth | Install CI integration | How-it-works, install CTA | Pre · Post |
| Dashboard | `/dashboard` | Auth | Impact-prioritized overview | Grade, confirmed count, findings | Default · Empty · Loading |
| Repos list | `/repos` | Auth | Manage repos | Repo cards, add btn | Default · Empty |
| Repo detail | `/repos/[id]` | Auth | Per-repo overview | Fingerprint, grade, findings | Default · Scanning · Empty |
| Scan history | `/repos/[id]/scans` | Auth | Scan timeline | Scans list, exploit counts | Default · Empty |
| Findings list | `/findings` | Auth | All findings, impact-sorted | Filter, finding cards | Default · Empty · Loading |
| Finding detail | `/findings/[id]` | Auth | Full proof + path + patch | Tabs: Proof/Path/Patch/History | Open · Resolved · Ignored · Loading |
| Feedback modal | `/findings/[id]/feedback` | Auth | False positive report | Radios, text field | Default · Submitted |
| Exploit Paths | `/exploit-paths` | Auth | Graph view all exploit chains | Interactive graph, all repos | Default · Empty |
| Threat Memory | `/threat-memory/[id]` | Auth | Per-repo learned patterns | Weakness bars, dev patterns, scan bias | Default · Empty |
| Settings profile | `/settings/profile` | Auth | Edit profile | Name, email | Default · Saving |
| Settings repos | `/settings/repos` | Auth | Repo + threshold config | Repo list, sliders | Default |
| Settings GitHub App | `/settings/github-app` | Auth | App install mgmt | Status, reconnect | Connected · Disconnected |
| Settings notifications | `/settings/notifications` | Auth | Email prefs | Toggles | Default |
| Settings danger | `/settings/danger` | Auth | Destructive actions | Delete, export, reset memory | Default · Confirming |
| 404 | `*` | Public | Not found | Message, back to dashboard | — |

---

## 5. DECISION POINTS

### Authentication (Mock → Prod)

```
MVP (mock auth):
  IF user visits any route
    THEN load mockUser = { id: "test-user-001", email: "dev@test.com" }
         IF user.onboarding_complete = false
           THEN redirect to /onboarding/connect
         ELSE
           THEN proceed to requested route

Production (Supabase):
  IF user visits app.yourname.com/*
    IF supabase.auth.getSession() returns valid session
      THEN proceed
    ELSE IF route is /login, /register, /auth/*
      THEN render public page
    ELSE
      THEN redirect to /login WITH ?return_url=[route]
           AFTER login → redirect to return_url
```

### Onboarding Gate

```
IF user.onboarding_complete = false
  IF repo_connected = false
    THEN → /onboarding/connect
  ELSE IF scan_complete = false
    THEN → /onboarding/scanning
  ELSE IF github_app_installed = false
    THEN → /onboarding/github-app  (skippable)
  ELSE
    THEN set onboarding_complete = true → proceed
```

### Repo Tier Routing

```
IF repo ingested
  IF routes <= 10 AND roles <= 1
    THEN tier = "simple" · pipeline = heuristic_fast_path · time = "~2 min"
  ELSE IF routes <= 50 AND roles <= 3
    THEN tier = "medium" · pipeline = graph + symbolic + selective_sandbox · time = "~6 min"
  ELSE
    THEN tier = "complex" · pipeline = full (graph + symbolic + sandbox + LLM) · time = "~12 min"
```

### Sandbox Execution Decision (Feature 1)

```
IF symbolic_score >= 0.50
  THEN query LLM Reasoner (constrained schema)
       merge LLM hint → final_confidence

IF final_confidence >= 0.75
  THEN spawn sandbox
       seed DB with User A + User B + test data
       execute attack scenario
       capture: request · response · response diff · auth context
       IF response contains cross-user data OR privilege gained
         THEN status = "confirmed" · runtime_validated = true
              build evidence package (request + response + diff + auth context)
       ELSE
         THEN status = "advisory" · runtime_validated = false

IF final_confidence < 0.75
  THEN status = "advisory" · no sandbox · log to threat memory
```

### Patch Validation Decision (Feature 2)

```
IF developer clicks "Create Fix PR"
  THEN LLM drafts patch (constrained schema)
       deterministic engine validates patch structure
       apply patch in sandbox
       rebuild app in sandbox
       re-execute original exploit
       IF exploit blocked (404 / 403 / correct ownership enforced)
         THEN fix_verified = true
              open PR with: diff + original proof + fix validation log
       ELSE
         THEN fix_verified = false
              show: "Patch didn't resolve this. Alternative approach:"
              LLM drafts v2 patch → re-validates → shows revised suggestion
```

### Finding Display Logic (Feature 6 — Impact-First)

```
Sort order (impact-first, not CVSS):
  1. confirmed + cross_user_data_exposed = true
  2. confirmed + privilege_escalated = true
  3. confirmed + admin_boundary_broken = true
  4. confirmed (other)
  5. advisory
  6. resolved
  7. ignored

Display per finding:
  IF status = "confirmed" AND runtime_validated = true
    THEN badge = 🔴 RED "CONFIRMED · EXECUTED"
         show Proof tab + Exploit Path + "Create Fix PR"
  ELSE IF status = "advisory"
    THEN badge = 🟡 AMBER "ADVISORY"
         show analysis only, no proof tab, no "Create Fix PR"
  ELSE IF status = "resolved"
    THEN badge = 🟢 GREEN "RESOLVED · VERIFIED"
         show resolution + re-test result
  ELSE IF status = "ignored"
    THEN badge = ⚪ GREY "IGNORED"
         show reason + "Reopen"
```

### Threat Memory Bias (Feature 3)

```
AFTER every confirmed exploit:
  store in ThreatMemory:
    - exploit_type (IDOR / escalation / mass-assignment)
    - route_pattern (e.g., "GET /:resource/:id without ownership")
    - middleware_pattern (e.g., "auth applied, ownership check missing")
    - model_pattern (e.g., "findById without userId filter")
    - resolution (fixed / ignored)

ON next scan for same repo:
  IF ThreatMemory has patterns for this appFingerprint
    THEN boost_priority for routes matching stored patterns
         adjust symbolic_score upward for known weakness types
         log: "Threat memory: prioritizing [X] based on previous findings"
```

### PR Comment Decision

```
IF exploit_confirmed = true AND confidence >= 0.90
  THEN post 🔴 CONFIRMED comment with proof payload
       apply "aart/confirmed" label
       include pre-verified fix PR link
       IF pr_blocking_enabled = true → block merge

ELSE IF confidence >= 0.60
  THEN post 🟡 ADVISORY comment (static analysis only, no proof)
       do NOT block merge
       offer "Trigger sandbox test" link

ELSE
  THEN no comment (below noise threshold)
       log to threat memory
```

---

## 6. ERROR HANDLING

### 404
- `"This page doesn't exist."` + `"← Back to dashboard"`

### 500
- `"Something went wrong on our end."` + incident ID + `"We've been notified."`
- `"Try again"` + `"Go to dashboard"`

### Network Offline
- Top banner: `"You appear to be offline."`
- Dashboard: cached read-only state
- Auto-dismiss on reconnect

### Sandbox Errors

| Error | Display | Recovery |
|---|---|---|
| Docker unavailable | `"Sandbox offline. Running static analysis only."` | Show heuristic advisory |
| Sandbox timeout | `"Exploit execution timed out."` | Show partial evidence if captured |
| Seeding failure | `"Test environment setup failed. Retrying."` | Auto-retry once |

### Patch Validation Errors

| Error | Display | Recovery |
|---|---|---|
| Build fails in sandbox | `"App wouldn't build with this patch. We're drafting an alternative."` | LLM v2 patch |
| Re-exploit not blocked | `"This patch didn't fully close the issue."` | Show diff of what still fails |
| LLM schema rejection | `"Patch draft failed validation. Showing manual guidance instead."` | Manual fix guidance |

### Auth Errors (Production only)

| Error | Message | Recovery |
|---|---|---|
| `oauth_error` | `"GitHub connection failed. Try again."` | Retry |
| `invalid_credentials` | `"Incorrect email or password."` | Stay on form |
| Session expired | `"Session expired. Sign in again."` toast | Redirect /login |

---

## 7. RESPONSIVE BEHAVIOR

### Mobile (< 768px)
| Element | Behavior |
|---|---|
| Sidebar | Bottom tab bar: Dashboard · Findings · Repos · Settings |
| Exploit path graph | Simplified list view (graph on desktop/tablet only) |
| Proof tab code blocks | Horizontal scroll, visible scrollbar |
| PR comment preview | Link to dashboard instead of inline |
| Threat memory bars | Full-width stacked |
| Finding tabs | Horizontal scroll |

### Tablet (768–1024px)
| Element | Behavior |
|---|---|
| Sidebar | Icon-only 72px, expand on tap |
| Exploit path graph | Scaled interactive graph |
| Finding detail | Tabs stack vertically |

### Desktop (> 1024px)
| Element | Behavior |
|---|---|
| Sidebar | Full 240px, always visible |
| Finding detail | 3-panel: proof · graph · patch |
| Exploit path graph | Full interactive canvas |
| Dashboard | Full data density |

---

## 8. ANIMATIONS & TRANSITIONS

| Element | Spec |
|---|---|
| Page transitions | Fade `opacity 0→1`, `150ms ease-out`. No slide, no scale. |
| Modal | Backdrop `100ms` fade. Modal `scale 0.97→1.0 + fade`, `150ms ease-out`. |
| Skeleton loaders | `#1A1A1E` base, `#232327` shimmer, `1.5s` loop. Not spinners. |
| Scanning terminal feed | Lines: fade in + slide up `4px`, `80ms ease-out`, sequential. Checkmarks: `200ms` delay. |
| Exploit execution lines | Same as above — `"Executing exploit..."` line pulses amber until result returns, then turns red (confirmed) or amber (advisory) |
| Exploit path graph | Nodes fade in sequentially along attack chain, `100ms` each, `50ms` stagger |
| Graph edges | Draw along path after nodes appear, `200ms` per edge |
| Finding cards | Staggered fade: `150ms` per card, `50ms` stagger |
| Status badge change | Color transition `200ms` |
| Success checkmark | `scale 0.8→1.0`, `150ms`. No confetti. |
| Toast | Slide in top-right `150ms`. Auto-dismiss `4s`. |
| Hover | `150ms` on `background-color` + `border-color`. Cards: `#232327→#3A3A42`. |

---

## 9. COMPONENT STATES

### Finding Card
```
confirmed  → 🔴 Red left border #DC2626  · "CONFIRMED · EXECUTED" badge · full action bar
advisory   → 🟡 Amber left border #D97706 · "ADVISORY" badge            · guidance only
resolved   → 🟢 Green left border #16A34A · "RESOLVED · VERIFIED" badge  · no actions
ignored    → ⚪ Grey left border #3A3A42  · "IGNORED" badge              · reopen option
loading    → Skeleton shimmer
```

### Repo Card
```
healthy          → Green grade · "No confirmed issues"
issues-found     → Red count badge · "X confirmed · Y advisory"
scanning         → Pulsing · "Scanning + executing exploits..."
not-scanned      → Grey · "Not yet scanned" · "Scan now" CTA
app-disconnected → Amber · "PR checks inactive · Reconnect →"
```

### Health Grade
```
A → #16A34A   B → #65A30D   C → #D97706   D → #EA580C   F → #DC2626

Inputs (impact-weighted):
- Confirmed findings with cross-user data exposure   (weight: 3x)
- Confirmed findings with privilege escalation       (weight: 3x)
- Confirmed findings (other)                         (weight: 2x)
- Advisory findings                                  (weight: 0.5x)
- Time since last scan
- GitHub App installed (yes/no)
```

### Exploit Path Graph Node Types
```
user-node        → Purple #7C3AED  · "User A (attacker)" / "User B (victim)"
endpoint-node    → Cyan #06B6D4    · "GET /invoices/:id"
gap-node         → Red #DC2626     · "No ownership check"
model-node       → Grey #8A8A96    · "Invoice model"
exposure-node    → Red #DC2626     · "User B data exposed"
```

---

## 10. URL & STATE CONVENTIONS

```
Auth (mock):
  mockUser stored in React context (not persisted)
  All routes accessible without session check

Auth (production):
  Session: Supabase httpOnly cookie
  OAuth:   /auth/callback
  Refresh: Automatic via Supabase JS client

Query params:
  ?tab=         proof | path | patch | history
  ?filter=      confirmed | advisory | resolved | ignored
  ?sort=        impact | date | confidence
  ?repo=[id]    pre-select repo
  ?installed=   true (post GitHub App)
  ?return_url=  post-login redirect (prod only)

New routes (v3):
  /exploit-paths            all exploit chain graphs
  /threat-memory            all repos memory overview
  /threat-memory/[repo-id]  per-repo threat memory

Deep links:
  /findings/[uuid]               from PR comments + emails
  /findings/[uuid]?tab=proof     direct to proof tab
  /findings/[uuid]?tab=path      direct to exploit graph
  /repos/[uuid]/scans/[uuid]     from scan history

State storage:
  Supabase DB   → all app data (repos, findings, scans, threat memory, evidence packages)
  URL params    → filter/tab/sort state (shareable)
  React context → mock user (testing), UI-only state
  No localStorage
```

---

## [POST-MVP] — Not Built Now

- Real Supabase Auth swap (checklist above defines exact steps)
- Paid plans + plan limits
- Stripe billing
- Selective Runtime Blocking (Feature 7) — smart per-pattern blocking
- Slack/Jira integrations
- ATT&CK mapping
- GitLab/Bitbucket CI support
- Multi-repo exploit chaining

---

*APP_FLOW.md v3.0 — MVP Feature-Complete Edition | [AART] | Update after name confirmed*
