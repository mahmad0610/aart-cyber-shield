# AART — UI Development Plan
**MVP Screen Inventory · User Journey Order**
Version 1.0

---

## HOW THIS IS ORGANIZED

Screens are listed in the order a user encounters them — from first landing to daily use to settings. Each screen answers three questions: why it exists, what it shows, and what the user can do on it.

Auth note: all screens use mock auth during MVP. The hardcoded test user bypasses login and register entirely. Those two screens are documented last as production-only shells.

---

# SECTION 1 — ONBOARDING
*The path from zero to first confirmed finding. Every screen here has one job: get the user to proof as fast as possible.*

---

## Screen 1 · Connect Repo
**Route:** `/onboarding/connect`

**Purpose:**
The first screen a new user sees after arriving at the app. Single job: connect a GitHub repository so the scan can begin. No sidebar, no distractions. Everything on this screen is focused on one action.

**What it shows:**
- A headline telling the user what to do: connect a repo to scan.
- A subline explaining the access model: read-only, nothing is ever written to their repo, attacks run in isolated sandboxes not against their live app.
- A single primary button to connect their GitHub repo.
- A collapsed expandable section explaining exactly what permissions are being requested and why. Each permission is listed by scope name with a plain-English reason. This is collapsed by default so it doesn't slow down confident users, but available for anyone who wants reassurance.
- A trust bar at the bottom with short statements about how the system works and what it never does.
- If connection fails, an inline error message appears below the button with a retry option.

**What the user can do:**
- Click the connect button to initiate GitHub repo selection.
- Expand the permissions explainer to read what access is being requested.
- Retry if the connection fails.
- On successful repo selection, they are automatically moved to the scanning screen.

---

## Screen 2 · Scanning
**Route:** `/onboarding/scanning`

**Purpose:**
Shows the user that real work is happening — not a spinner, not a progress bar alone, but a live terminal-style feed showing exactly what the system is doing step by step. This screen serves two purposes: it keeps the user informed and it educates them about what AART actually does while they wait.

**What it shows:**
- A headline with the repo name and tier classification (simple / medium / complex) with an estimated time to completion.
- A live terminal feed showing each step of the pipeline as it executes. Lines appear one by one as they complete. Completed steps show a checkmark. The currently running step shows a blinking cursor. The line for exploit execution behaves differently — it pulses while the sandbox is active, then resolves to either confirmed or advisory when the result returns.
- A progress bar beneath the feed showing overall completion percentage with the estimated time remaining.
- A collapsed section titled "What are we doing?" that explains the pipeline in plain English for users who want to understand what's happening while they wait. It is collapsed by default.
- If the user tries to navigate away, a toast message appears telling them the scan will continue server-side and they will be emailed when it is done. The scan is never interrupted by them leaving.
- If the scan errors, the terminal shows an error state with an auto-retry message.
- If the scan times out, a banner explains the delay and confirms the user will be notified by email.

**What the user can do:**
- Watch the scan progress in real time.
- Expand the educational section to understand the pipeline.
- Navigate away if needed — the scan continues on the server.
- On scan completion the user is automatically moved to either the findings screen or the clean screen depending on the result.

---

## Screen 3A · First Findings
**Route:** `/onboarding/findings`

**Purpose:**
The highest-impact moment in the product. This is where the user sees for the first time that AART didn't just flag a warning — it executed an actual attack and retrieved proof. The entire screen is designed around the impact of that revelation.

**What it shows:**
- A headline stating how many confirmed issues were found in their repo by name.
- A subheadline that immediately distinguishes AART from other tools: these are not theoretical. The attacks were executed. Here is proof.
- A list of finding cards, sorted by real impact (cross-user data exposure first, then privilege escalation, then other confirmed, then advisory). Each card shows:
  - A status badge indicating whether the finding was confirmed and executed or advisory only.
  - The impact type in plain English (e.g., "Cross-user data exposure").
  - The plain-language summary of the issue — written as a consequence, not a technical identifier. For example: "Anyone can read any user's invoice."
  - The affected route.
  - A short evidence preview showing what was extracted from the sandbox.
  - Confidence score, whether the sandbox ran, and the auth context used in the attack.
  - Action buttons to view the full proof or create a fix PR.
- Up to three cards are shown on this screen. A link to see all findings is available.
- Below the cards, two CTAs: one to set up PR protection (GitHub App), one to go directly to the dashboard.

**What the user can do:**
- Read each finding and understand what was found and why it matters.
- Click "View Exploit Proof" on a confirmed finding to go to the full finding detail screen.
- Click "Create Fix PR" to immediately start the verified patch workflow.
- Click through to see all findings on the findings list screen.
- Click through to set up PR protection (GitHub App install screen).
- Click through to go directly to the dashboard.

---

## Screen 3B · Clean Repo
**Route:** `/onboarding/clean`

**Purpose:**
Handles the case where no critical issues were confirmed. This screen must still deliver clear value — the user needs to understand what was checked and attacked, not just see a blank result. A clean result is evidence of thoroughness, not absence of effort.

**What it shows:**
- A large confirmation mark and headline: no critical issues confirmed in this scan.
- A subheadline: here is what we checked and attacked.
- A checklist of every attack pattern that was attempted, each with the number of attack scenarios run against it. Each item is marked as clean.
- A CTA to set up PR protection so future changes are covered.

**What the user can do:**
- Read through the patterns that were analyzed to understand the depth of the scan.
- Click through to set up GitHub App PR protection.

---

## Screen 4 · GitHub App Install
**Route:** `/onboarding/github-app`

**Purpose:**
Prompts the user to install the GitHub App so that every pull request is automatically scanned going forward. This is positioned after the first scan result — after the user has already seen value — so they understand what they are protecting before being asked to add the integration.

**What it shows:**
- A headline about catching vulnerabilities before they merge.
- A three-step plain-text explanation of how it works: user opens a PR, AART executes attack scenarios against the changes, AART posts proof and a verified fix in the PR.
- A primary install button that opens the GitHub App installation in a new tab.
- A secondary "skip for now" link. If skipped, a nudge banner will appear on the dashboard until the user installs it.
- After install, the screen updates to confirm the install is detected and shows a button to proceed to the dashboard.

**What the user can do:**
- Install the GitHub App (opens new tab, returns to this screen with install confirmed).
- Skip and go to the dashboard. The nudge persists until they install.
- Proceed to the dashboard after confirming install.

---

# SECTION 2 — CORE APP
*The daily-use screens. All have the sidebar navigation.*

---

## Screen 5 · Dashboard
**Route:** `/dashboard`

**Purpose:**
The daily home base. Shows the current security posture of all connected repos at a glance, with findings sorted by real impact rather than theoretical severity. Every element answers the question: what needs attention right now?

**What it shows:**
- A greeting with the user's name and a timestamp of the last scan.
- A health grade widget showing the current security grade (A through F) for the primary repo, with a trend indicator showing whether the grade improved or declined compared to last week.
- A stats summary bar with four numbers: open confirmed findings, open advisory findings, findings resolved this week, and pull requests scanned this week.
- An impact-prioritized findings list showing the top five open findings across all repos. Each row shows the status badge, the plain-language summary, the affected route, and a link to view the proof. The sort order is strict: confirmed data exposures first, then privilege escalations, then other confirmed, then advisory.
- Quick action buttons: scan now (triggers a new scan on the primary repo) and view all findings.
- If onboarding is not yet complete, an onboarding checklist widget showing which steps are done and which remain. This widget disappears once all steps are complete.
- If the GitHub App is not yet installed and the user previously skipped, a nudge banner appears below the header with a link to install it.
- If no repos are connected, an empty state with a CTA to connect the first repo.

**What the user can do:**
- Trigger an on-demand scan of any connected repo.
- Navigate directly to any finding from the impact list.
- Navigate to any main section via the sidebar.
- Complete remaining onboarding steps from the checklist widget.
- Install the GitHub App from the nudge banner if they previously skipped.

---

## Screen 6 · Repos List
**Route:** `/repos`

**Purpose:**
Shows all connected repositories with their current security state. Lets the user manage which repos AART is watching and trigger scans on demand.

**What it shows:**
- A page header with the total number of connected repos and an "Add repo" button.
- A grid of repo cards. Each card shows:
  - The repo name and owner/repo identifier.
  - The current health grade.
  - The count of confirmed and advisory findings currently open.
  - The repo tier (simple, medium, or complex).
  - When it was last scanned.
  - The current scan status — if a scan is running the card shows a pulsing indicator and the message "Scanning and executing exploits."
  - If the GitHub App is not connected to this repo, an amber chip reading "PR checks inactive" with a reconnect link.
  - If the repo has never been scanned, a "Scan now" CTA replaces the grade.
- If no repos are connected, an empty state with a CTA to connect the first repo.

**What the user can do:**
- Click any repo card to go to the repo detail screen.
- Trigger a scan on any repo directly from its card.
- Click "Add repo" to connect a new repository via a modal selector. On selection, the repo is added and immediately scanned.
- Reconnect the GitHub App for any repo showing it as inactive.

---

## Screen 7 · Repo Detail
**Route:** `/repos/[id]`

**Purpose:**
The per-repo deep dive. Shows everything AART knows about one specific repository: its technical fingerprint, security grade history, and all findings scoped to that repo.

**What it shows:**
- A repo header with the name, full owner/repo identifier, stack detected (e.g., Node.js / Express · JWT auth), tier, and current health grade. A timestamp shows when it was last scanned. A "Scan now" button sits inline with the header.
- An app fingerprint card showing what the system learned during ingestion: stack, auth type, number of routes detected, number of models, number of roles, and complexity tier. This is displayed as a monospaced key-value list.
- A grade history display showing the health grade over time. Each historical scan is shown as a grade letter with a date. Clicking any historical grade navigates to that scan in the scan history.
- A findings list scoped to this repo. Same sort order as the dashboard (impact-first). Uses the same finding card component as the main findings list.
- If a scan is currently running, the findings list shows a scanning state.
- If no scans have been run, an empty state with a scan CTA.

**What the user can do:**
- Trigger a new scan.
- Click any finding to go to its full detail screen.
- Click any historical grade to see that scan in the scan history screen.
- Navigate to the threat memory for this repo via the sidebar or an inline link.

---

## Screen 8 · Scan History
**Route:** `/repos/[id]/scans`

**Purpose:**
Shows the full history of every scan run on a specific repository. Lets the user see when scans ran, what triggered them, what was found in each, and whether any failed.

**What it shows:**
- A header with the repo name and total number of scans run.
- A list of scan rows, newest first. Each row shows:
  - When the scan started and completed.
  - What tier was used (simple, medium, complex).
  - What triggered the scan (manual, PR, or scheduled).
  - If it was a PR scan, the PR number.
  - The count of confirmed and advisory findings produced in that scan.
  - The scan status. Running scans show a pulsing indicator. Completed scans show finding counts. Failed scans show an error state with a retry button. Scans that completed with no findings show a clean indicator.

**What the user can do:**
- Click any completed scan row to see the findings from that specific scan.
- Retry a failed scan.

---

## Screen 9 · Findings List
**Route:** `/findings`

**Purpose:**
The central view of all security findings across all connected repos. The primary daily-use screen for triaging what needs attention. Every finding across every repo is visible here with filtering and sorting.

**What it shows:**
- A page header with the total finding count and a breakdown of confirmed vs advisory.
- A filter bar with:
  - Status filters: All, Confirmed, Advisory, Resolved, Ignored. Active filter shown with a distinct chip.
  - Sort options: By impact (default), by date, by confidence.
  - A repo dropdown to filter findings to a single repo.
  - All filter and sort selections are reflected in the URL so views are shareable.
- The full list of finding cards matching the active filters. Each card shows the status badge, impact type, plain-language summary, route, repo name, confidence score, and action buttons.
- Cards are sorted by impact by default: confirmed data exposures at the top, through to ignored at the bottom.
- Empty states that are specific to the active filter — for example, no confirmed findings shows a positive message, while no findings at all shows a CTA to run a scan.

**What the user can do:**
- Filter findings by status.
- Change the sort order.
- Filter to a single repo.
- Click any finding card to go to the full finding detail screen.
- Use "Create Fix PR" directly from the card for any confirmed finding that has a verified patch ready.
- Share a filtered view via the URL.

---

## Screen 10 · Finding Detail
**Route:** `/findings/[id]`

**Purpose:**
The most important screen in the product. Every feature converges here: the confirmed exploit proof, the visual attack chain, the verified patch, and the full event history. This is where a developer goes from "there's an issue" to "I understand it, I can see the proof, and I have a fix that's already been tested."

**What it shows:**

**Header (always visible):**
- The status badge (confirmed/advisory/resolved/ignored) and impact type.
- The plain-language summary as a large headline. This is the sentence that describes the consequence of the vulnerability in terms any developer can understand.
- The affected route, HTTP method, confidence score, whether the sandbox ran and passed, and how long ago it was detected.

**Tab 1 — Proof:**
Shows the full attack execution record. For confirmed findings this includes: the attack type, the auth context used in the sandbox (which user, which role, which token type), the target resource, the identities of the two sandbox users (attacker and victim), the exact request that was sent including the full curl command, the exact response that was received including the full response body with the victim's data visible, a diff between what the attacker's own data looks like versus what the victim's data looks like so the cross-user access is undeniable, and the final verdict. Two action buttons: copy the reproducible script and download the full evidence package. For advisory findings (no sandbox run), this tab shows a plain explanation of why no execution happened and offers a button to trigger a manual sandbox test.

**Tab 2 — Exploit Path:**
Shows an interactive graph of the full attack chain. Each step in the chain is a node: the attacker user, the API endpoint, the specific gap in the code (the missing check), the database model that was accessed, and the victim's data that was exposed. Edges between nodes are labeled to describe the relationship (authenticated request, no ownership constraint, direct database read, data returned). Each node is clickable and opens a detail panel showing the code file and line number where the issue exists, the symbolic constraint that was evaluated, and its contribution to the confidence score. Below the graph, a text list of the same chain in order — the deterministic trace — is shown for users who prefer reading over interacting with a graph. On mobile, the graph is replaced with this text trace.

**Tab 3 — Patch:**
Shows the suggested fix and its validation status. The patch goes through four states. Before generation: a button to generate the fix. During generation and validation: the diff viewer fills in as the patch is drafted, and a step list shows each sandbox validation step animating through — apply patch, rebuild app, re-execute exploit, confirm result. When verified: the complete diff is shown alongside all four validation steps marked complete with a final verdict confirming the fix blocks the exploit. If the patch fails validation: a message explains what still fails, shows the updated proof of the remaining vulnerability, and the system drafts an alternative patch. The "Create Fix PR" button only becomes active once fix_verified is true. For advisory findings with no confirmed exploit, this tab shows manual guidance instead.

**Tab 4 — History:**
A chronological timeline of every event for this finding from detection to current state. Events include: detected, sandbox executed, confirmed, patch suggested, PR created, fix merged, re-tested, resolved, ignored, reopened. Each event shows the timestamp, who or what caused it (system or developer), and a short description of what happened.

**Sticky action bar (always visible at the bottom):**
Four buttons available depending on the current status of the finding: Create Fix PR (only active when fix is verified and finding is open), Mark False Positive, Re-run Exploit, Download Evidence. All buttons are disabled if the finding is already resolved or ignored.

**What the user can do:**
- Read the full exploit proof and understand exactly what was done and what was exposed.
- Interact with the exploit path graph to trace the attack chain to its source in the code.
- View the suggested patch diff.
- Trigger patch generation if not yet generated.
- Create a fix PR once the patch is verified.
- Copy the curl reproduction script.
- Download the full evidence package.
- Re-run the exploit at any time.
- Mark the finding as a false positive (opens feedback modal).
- Navigate between tabs; the active tab is stored in the URL for shareability.

---

## Screen 11 · False Positive Feedback
**Route:** `/findings/[id]/feedback` (modal overlaid on finding detail)

**Purpose:**
Lets the developer tell AART why a confirmed or advisory finding is not a real issue in their context. This feeds the threat memory so future scans for this repo are not polluted with noise from patterns the developer has already reviewed and dismissed.

**What it shows:**
- A modal overlay on the finding detail screen.
- A headline asking why this isn't a real issue.
- Five radio options for the reason:
  - The sandbox test doesn't reflect our real auth setup.
  - This route isn't accessible in production.
  - The check exists in a layer AART doesn't parse yet.
  - The risk is acceptable for this use case.
  - Other.
- An optional free-text field for additional context.
- A submit button.
- On submission: the modal closes, the finding is marked Ignored, a toast confirms the feedback was received and that future scans for this repo will be adjusted.

**What the user can do:**
- Select the reason that best matches their situation.
- Add optional context.
- Submit to mark the finding as ignored and update threat memory.
- Close the modal without submitting to return to the finding detail without any changes.

---

## Screen 12 · Exploit Paths (All Repos)
**Route:** `/exploit-paths`

**Purpose:**
A single canvas showing every confirmed exploit chain across all connected repos simultaneously. Designed for developers or leads who want to see the full attack surface at once rather than repo by repo.

**What it shows:**
- A page header with the total number of confirmed exploit chains.
- A row of filter chips — one for each connected repo plus an "All repos" chip. Each repo chip shows the count of confirmed findings for that repo.
- The full interactive graph showing all confirmed exploit chains. Each chain is its own connected subgraph. Chains from different repos are visually distinguished. The same node types and edge labels from the individual finding detail graph are used here.
- Controls to fit all chains into view, reset zoom, and a legend explaining the node type color coding.
- On mobile, the graph is replaced with a list of exploit chain summary cards — one per confirmed finding — each showing the repo name, plain-language summary, and a link to the full finding detail.

**What the user can do:**
- Filter to a single repo to isolate its chains.
- Interact with the graph: pan, zoom, click nodes.
- Click any node to open the detail panel showing the code location and constraint for that node.
- Click through from any chain to the corresponding finding detail screen.

---

## Screen 13 · Threat Memory
**Route:** `/threat-memory/[id]`

**Purpose:**
Shows what AART has learned about a specific repository over time and how that knowledge shapes future scans. This screen makes the compounding value of AART visible — the longer it has been watching a repo, the smarter its scans become.

**What it shows:**
- A header with the repo name, when the memory was last updated, and how many scans have contributed to it.
- An explanation that AART learns the codebase over time and each scan gets smarter.
- A weakness patterns section with horizontal bar charts — one per exploit type — showing how many were confirmed, how many were resolved, and how many remain advisory. This makes recurring patterns immediately visible.
- A dev team patterns section listing observations about this specific codebase and team. These are plain-English statements derived from patterns found across scans: for example, that the codebase frequently uses direct model lookups without ownership filters, or that auth middleware is applied to GET routes but missed on PUT routes.
- A scan bias section listing which specific routes and patterns will be prioritized in the next scan and why. Each item shows the route, the reason it is being prioritized (e.g., same pattern as a previously confirmed finding), and the bias weight applied.
- A history timeline showing every threat memory update event in chronological order.

**What the user can do:**
- Read the accumulated knowledge about their codebase.
- Understand which patterns AART will prioritize in the next scan and why.
- Click "Run targeted scan" to immediately trigger a memory-biased scan that focuses on the prioritized routes and patterns — faster than a full scan and higher signal.

---

# SECTION 3 — SETTINGS

---

## Screen 14 · Settings — Profile
**Route:** `/settings/profile`

**Purpose:**
Basic account profile management.

**What it shows:**
- The user's display name (editable) and email address (read-only in mock auth, sourced from GitHub OAuth in production).
- A save button.
- A note that email is managed via GitHub OAuth and cannot be changed here.

**What the user can do:**
- Edit and save their display name.

---

## Screen 15 · Settings — Repos
**Route:** `/settings/repos`

**Purpose:**
Per-repo configuration of AART's scan behavior. Lets developers tune confidence thresholds, scan frequency, and specific feature toggles for each repo independently.

**What it shows:**
- A list of all connected repos. Each repo is expandable into a configuration panel.
- Per repo, the configuration panel shows:
  - Two confidence threshold sliders: T1 (the threshold at which the LLM is called to assist, default 0.5) and T2 (the threshold at which the sandbox is triggered, default 0.75). Both are adjustable within defined ranges with a plain-English description of what changing each threshold means.
  - A scan frequency dropdown with options: manual only, PR only, daily, weekly.
  - A toggle for PR blocking — whether AART should block PR merges when a confirmed exploit is found.
  - A toggle for memory bias — whether the threat memory should influence scan prioritization.
- A save button per repo.
- A "Remove repo" button per repo that disconnects the repo and removes all its data after confirmation.

**What the user can do:**
- Adjust confidence thresholds to make scans more or less aggressive for specific repos.
- Change how frequently each repo is scanned.
- Enable or disable PR blocking per repo.
- Enable or disable memory bias per repo.
- Remove a connected repo.

---

## Screen 16 · Settings — GitHub App
**Route:** `/settings/github-app`

**Purpose:**
Manages the GitHub App integration that enables PR checks.

**What it shows:**
- The current connection status of the GitHub App — connected with a green indicator showing the install date and which repos it covers, or disconnected with a red indicator and a message that PR checks are paused.
- If connected: buttons to reinstall (in case permissions need to be updated) and uninstall.
- If disconnected: a reconnect button.

**What the user can do:**
- Reinstall the GitHub App to update its permissions or repo coverage.
- Uninstall the GitHub App.
- Reconnect a disconnected GitHub App.

---

## Screen 17 · Settings — Notifications
**Route:** `/settings/notifications`

**Purpose:**
Controls which events trigger email notifications.

**What it shows:**
- A list of notification types, each with a toggle:
  - Email when a confirmed exploit is found.
  - Email when a new advisory finding is created.
  - Email when a scan completes.
  - Email when a fix is verified and a PR is ready.
  - Weekly digest of all open findings and resolved items.

**What the user can do:**
- Toggle each notification type on or off.
- Changes save automatically on toggle.

---

## Screen 18 · Settings — Danger Zone
**Route:** `/settings/danger`

**Purpose:**
Hosts destructive actions that require deliberate confirmation. Visually distinct from other settings to prevent accidental use.

**What it shows:**
- A clearly marked danger section with a visual warning treatment.
- Three actions, each requiring confirmation before executing:
  - Export all data: downloads a JSON file containing all findings, evidence packages, and scan history for all repos.
  - Reset threat memory for a specific repo: clears all learned patterns and bias weights for that repo, starting fresh. A dropdown selects which repo.
  - Delete a repo: removes the repo and all associated findings, scans, evidence packages, and threat memory. The user must type the repo name to confirm before the delete button becomes active.

**What the user can do:**
- Export all their data.
- Reset the threat memory for a specific repo without deleting the repo itself.
- Delete a connected repo and all its data. This is irreversible.

---

# SECTION 4 — ERROR STATES
*These are not separate routes but distinct full-screen or inline states that any screen can enter.*

---

## Screen 19 · 404 Not Found

**Purpose:**
Handles navigation to a route that doesn't exist.

**What it shows:**
- A simple message that the page doesn't exist.
- A link back to the dashboard.

**What the user can do:**
- Navigate back to the dashboard.

---

## Screen 20 · 500 Server Error

**Purpose:**
Handles unexpected server errors on any screen.

**What it shows:**
- A message that something went wrong on the server's end.
- A unique incident ID in monospaced text so the user can reference it when contacting support.
- Confirmation that the team has been notified automatically.
- Two buttons: try again and go to dashboard.

**What the user can do:**
- Retry the failed action.
- Navigate back to the dashboard.

---

# SECTION 5 — PRODUCTION-ONLY AUTH SCREENS
*Not built in MVP. Shells can exist but redirect to dashboard under mock auth. Documented here for completeness so the routing structure is in place.*

---

## Screen 21 · Register
**Route:** `/register`
**Mock auth behavior:** Immediately redirects to `/onboarding/connect`.

**Purpose (production):**
Creates a new account. Two paths: GitHub OAuth (recommended, single click) and email plus password.

**What it shows (production):**
- Two options side by side on desktop, stacked on mobile: Continue with GitHub (primary) and Continue with email (secondary).
- A terms and privacy policy note below both options.
- A link to sign in for existing users.
- On email path: an email and password form with inline validation.
- On email path submit: a "check your inbox" confirmation screen with a resend link.

**What the user can do (production):**
- Authenticate via GitHub OAuth.
- Register with email and password.
- Navigate to login if they already have an account.

---

## Screen 22 · Login
**Route:** `/login`
**Mock auth behavior:** Immediately redirects to `/dashboard`.

**Purpose (production):**
Authenticates a returning user.

**What it shows (production):**
- Same two-path layout as register (GitHub OAuth + email/password).
- A link to register for new users.
- A forgot password link for email users.
- Inline validation errors for incorrect credentials.

**What the user can do (production):**
- Sign in via GitHub OAuth.
- Sign in with email and password.
- Reset their password.
- Navigate to register if they don't have an account.

---

*AART UI Development Plan v1.0 · All 22 screens · User journey order*
*Reference: APP_FLOW v3 · PRD v3 · SRD v3*
