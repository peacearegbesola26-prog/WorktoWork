# Stage 1

## Administration substages

### Separate permission-controlled staff area
- [x] Separate staff login/layout/navigation and remove ordinary-menu admin links
- [x] Enforce generic access denial and current per-operation staff permissions
- [x] Verify role restrictions, revocation, suspension and private-record protection without publishing

Staff-area verification: 41 application tests passed; 13 direct staff-area checks, 13 user-management checks, 13 resume checks and 13 staff/privacy checks passed. Browser verified dedicated logged-out login, ordinary-user login/URL denial, restored owner access, AI settings save/refresh, last-owner denial, moderator restrictions, administrator user search, revocation/suspension with the same session, and separate desktop/mobile menus. Existing AI daily-limit live test skipped because owner-configured controls already exist; AI processing and limits were not changed. Permission-change audit records confirmed. Zero production opportunities; no domain or publication changes. Populated opportunity testing still requires genuine data; inbox checks and C–E remain pending as listed below.

### Current request: owner setup and B
- [x] Confirm specified account email and assign initial owner through trusted operation
- [x] Verify owner screens, role permissions, last-owner protection and AI settings persistence
- [x] Add private-safe user search/details and audited suspension/restoration with backend enforcement
- [x] Complete opportunity moderation fields and lifecycle controls
- [ ] Verify opportunity create/edit/publish/unpublish/expire/archive and search visibility — requires a genuine opportunity; production currently has none
- [x] Recheck resume privacy and preserve AI limits; report C–E without publishing

- [x] A: implement owner, administrator and moderator permissions; owner-only role management; last-owner protection; private admin login and navigation
- [x] Connect persistent AI availability, daily request limits and input limits to existing resume AI; record status without private content
- [x] Verify ordinary-user/admin/moderator restrictions, AI daily/input enforcement and existing resume privacy
- [x] Verify owner role UI, last-owner rejection and AI controls save/reload — verified after explicit trusted owner assignment
- [x] B: implement user/suspension and opportunity moderation management; populated opportunity end-to-end verification still awaits genuine data
- [ ] C: published website content and owner site settings
- [ ] D: remaining source, plan and notification controls
- [ ] E: reports, support inbox, analytics and searchable full audit

Initial owner setup requires the user's verified account identification and a trusted assignment; do not assign a registrant automatically. Do not publish.

Trusted owner assignment confirmed for the explicitly requested email-confirmed account. Browser verified owner role controls, last-owner rejection, settings save/reload, user search and owner suspension safeguards. Live tests verified delegation/revocation, non-owner role rejection, account suspension/restoration, AI rejection for suspended users and staff denial of resumes/application notes. 35 frontend tests and both 13-check privacy suites passed. No opportunities inserted. C–E remain open.

Owner setup: ask Lovable to assign the verified signed-in account the initial owner role through a trusted backend operation, confirming the account email first. Then open /admin/login and /admin/access. This operation is not exposed to ordinary accounts. Other substages remain incomplete; existing opportunity/source administration is preserved.

## Saved resumes and factual AI optimization

- [x] Inspect account prerequisites and ownership controls
- [x] Add private saved resumes, editing, duplication, deletion and print layout
- [x] Connect authenticated factual AI suggestions and feedback
- [x] Verify persistence, ownership, all four real AI requests, approval/save and mobile layout
- [x] Report verified results and remaining manual checks without publishing

Resume-stage checks: 33 application tests passed; 13 live account/resume privacy checks passed; authenticated save/refresh, duplication, deletion, print-only rendering, signed-out rejection and all four real AI requests passed. Missing facts return questions without an apply action. Test resumes were removed. Browser Save as PDF output and real inbox links require the user's manual checks. Other source and career integrations remain disconnected.

- [x] Public pages and authentication demonstration layouts
- [x] Shared sample dataset, discovery, details, saved items and tracker
- [x] Demo alerts, career toolkit, resume editor, profile and settings
- [x] Read-only admin demonstration
- [x] Navigation, behavior tests and mobile verification

No backend, live sources, AI connections, payments or real authentication in this stage.

## Frontend review

- [x] Audit pages, controls, accessibility and unusual demo inputs
- [x] Correct discovered issues and add regression tests
- [x] Recheck desktop and mobile flows
- [x] Harden home-page context and verify local page recovery

Hosted preview verification remains unavailable from the test browser: it opens Lovable's internal project loading screen instead of the app.

## Real accounts and user data

- [x] Enable Cloud, email authentication and secure user-owned schema
- [x] Replace account forms, verification, recovery and sign-out; protect real workspace routes
- [x] Connect dashboard, profile, settings, saved records, tracker and alert preferences
- [x] Keep fictional demo and deferred source/AI integrations separate
- [x] Verify account journeys, refresh persistence and cross-user database restrictions
- [x] Report results, exact manual checks and secure administrator setup; do not publish
- [ ] Complete real inbox verification and recovery-link journey — requires the user's real email inbox; exact steps are in README and completion report

## Single real application

- [x] Verify existing Cloud, real authentication and database persistence
- [x] Move useful page designs into protected /app pages and update all navigation
- [x] Remove fictional records and demo entry points; redirect legacy addresses
- [x] Verify authenticated persistence, legacy redirects, privacy rules and mobile layout
- [x] Report functioning features and remaining integrations; do not publish

## Account foundation re-verification

- [x] Preserve intended pages across login, registration and verification links
- [x] Verify private data updates, refresh/session restoration and logout/login persistence
- [x] Verify backend access controls without inserting fictional opportunities
- [x] Report passed checks, unresolved checks, email-inbox steps and trusted initial admin assignment

## Real administration and opportunity management

- [x] Extend opportunity fields, active visibility, source states and immutable admin audit trail
- [x] Add backend-enforced /admin overview, opportunity editing and source management
- [x] Connect real social, web and direct discovery, details, filters and pagination
- [x] Verify available privacy, input-validation, session and desktop/mobile checks
- [ ] Verify full administrator publication, audit, populated filters/pagination and opportunity-action persistence — requires trusted initial admin assignment and genuine opportunity data; isolated transactional account creation is blocked by sandbox permissions
- [x] Report verified checks and initial administrator/inbox manual steps; do not publish
