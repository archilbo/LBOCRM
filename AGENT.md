
ARCHI LBO — Codex Project Instructions

This file is the authoritative instruction router for Codex in this repository. Apply it to every task. Detect the task type automatically, activate only the relevant rule modules, show the user a compact routing summary, and then work without requiring the user to select a workflow.

1. Project profile

Application: ARCHI LBO / LBOCRM, a multi-company business application.

Backend: PHP 8.3+, Laravel 13, MySQL, Inertia Laravel 3.

Frontend: React 19, TypeScript 6, Inertia React 3, Vite 8, Tailwind CSS 4.

UI: HeroUI 3 is primary; also use existing shared components, Lucide, React Aria, Framer Motion, and Sonner where established.

Data and forms: React Hook Form, Zod, TanStack Query/Table/Virtual.

Authorization and realtime: Spatie Laravel Permission, Laravel Reverb, Laravel Echo.

Documents: Dompdf, PHPWord, Laravel Excel.

Quality: PHPUnit, Laravel Pint, ESLint, TypeScript typecheck, Vite production build.

Product UI: compact professional SaaS density, responsive layouts, fixed application shell, content-only scrolling, theme tokens, accessible interactions, and drawers/modals for contextual CRUD where consistent with the module.

2. Default operating mode

CHANGE_MODE: DIRECT_EDIT when Codex has repository access.

Switch to POWERSHELL_PATCH only when the user asks for a portable installer/patch or Codex cannot edit the target repository directly.

DELIVERY_MODE: complete one safe, coherent, reviewable phase at a time for large tasks. Do not artificially split a small fix.

AUTONOMY: proceed without asking when the request is clear and the action is reversible. Ask only when a missing choice materially changes behavior, data, security, permissions, or UX.

OUTPUT: concise, evidence-based, and outcome-first. Do not reveal hidden chain-of-thought.

3. Mandatory automatic task routing

For every new task, silently analyze the request and relevant repository evidence, then classify it. The user never needs to name a task category.

3.1 Routing procedure

Identify one primary task type and zero to three secondary types from the taxonomy below.

Assign a risk level using Section 4.

Activate CORE plus only the relevant modules.

Choose focused inspection targets and validation commands from the validation matrix.

Before making changes, show the compact routing block from Section 3.3.

Continue immediately unless Section 4 requires confirmation or the user asked for review/diagnosis only.

Reclassify if repository evidence shows the original category was incomplete. Briefly update the routing block only when this materially changes scope or risk.

Do not quote or restate the full active modules. Show their IDs and a short practical interpretation only. Do not present private reasoning.

3.2 Task taxonomy and module mapping

Task type

Detection examples

Activate

ADVICE

Explain, compare, recommend, create a prompt, no repository change requested

CORE, ADVICE

DIAGNOSIS

Investigate, find cause, analyze error; no fix requested

CORE, DIAGNOSIS, affected technical module

BUG_FIX

Broken behavior, exception, regression, incorrect result, visual defect

CORE, BUG, affected technical modules

FEATURE

New user-visible behavior, endpoint, workflow, capability

CORE, FEATURE, affected technical modules

BACKEND

Routes, middleware, Form Requests, controllers, services, models, policies, jobs

CORE, BE

FRONTEND

React, Inertia pages/props/forms, hooks, client state, TypeScript

CORE, FE

UI_UX

Layout, responsive behavior, HeroUI, theme, accessibility, interaction design

CORE, FE, UI

DATABASE

Migration, schema, indexes, constraints, query behavior, backfill

CORE, BE, DB, SEC

SECURITY

Auth, permissions, tenant isolation, secrets, injection, uploads, audit

CORE, SEC, affected technical modules

REALTIME

Reverb, Echo, broadcasts, presence, typing, live updates

CORE, BE, FE, RT, SEC

FILES_DOCS

Upload/download, PDF, DOCX, Excel, archives, generated files

CORE, BE, FILE, SEC and FE if UI changes

PERFORMANCE

Slow query/page/build, N+1, excessive renders, bundle or payload size

CORE, PERF, affected technical modules

REFACTOR

Structural cleanup with intended behavior preservation

CORE, REFACTOR, affected technical modules

DEPENDENCY

Add/update/remove Composer or NPM package, lockfile change

CORE, DEP, SEC, affected technical modules

TESTING

Add/fix tests, improve coverage, testing infrastructure

CORE, TEST, affected technical modules

REVIEW

Review code/plan/diff/security without requested implementation

CORE, REVIEW, affected technical modules

DEVOPS

Build, CI, deployment, server, queue worker, environment configuration

CORE, OPS, SEC

GIT

Branch, commit, merge, rebase, push, release

CORE, GIT

Mixed tasks must activate all necessary modules, but keep the set minimal. Example: a tenant-scoped realtime notification UI bug activates CORE + BUG + BE + FE + RT + SEC.

3.3 Required routing block

Before inspection or edits, output at most five short lines in this exact spirit:

Task routing

- Type: BUG_FIX + UI_UX
- Risk: MEDIUM — user-facing behavior, no schema change
- Active rules: CORE + BUG + FE + UI
- Verification: focused behavior check, typecheck, lint

For a trivial advice question, one line is enough: Routing: ADVICE · read-only · CORE + ADVICE.

The routing block is a commitment, not decoration. The subsequent work and validation must match it. Do not list a check that will not be run unless clearly labeled planned.

4. Risk classification and approval gates

LOW

Examples: documentation, copy, isolated visual polish, a test-only correction with no production behavior change.

Proceed automatically.

Run the smallest relevant validation.

MEDIUM

Examples: normal bug fix or feature within established architecture, non-destructive backend/frontend behavior change.

Proceed automatically after inspecting the implementation.

Add regression coverage when practical.

Report assumptions that affect behavior.

HIGH

Examples: authentication/authorization, tenant scoping, financial calculations, schema migrations, file access, realtime privacy, background jobs with side effects, dependency changes, broad shared-component changes.

Inspect the complete affected path before editing.

State the safety invariant in the routing or plan update.

Use stronger focused tests and validate failure/permission paths.

Ask only if a material product or data decision is missing; high risk alone does not require a question.

CRITICAL

Examples: production deployment, destructive/irreversible migration, deleting user data, rotating/revealing credentials, force-push, bypassing security controls, acting on external systems, or running a command against an uncertain environment.

Stop before the critical action.

Resolve the exact target with read-only checks.

Explain the action, impact, recovery path, and exact confirmation needed.

Never infer permission from a general request to inspect, diagnose, or improve code.

5. CORE — always active

Scope and evidence

Read repository instruction files first. Treat the latest explicit user request as authoritative.

Search before reading broadly. Use rg/symbol search to locate definitions and usages; inspect only relevant file ranges.

Trace behavior end to end when applicable: route -> middleware -> request -> controller/action/service -> model/query/policy -> resource/Inertia props -> React page/component -> tests.

Check repository status before edits. Preserve user changes, untracked work, and unrelated diffs. Never reset or overwrite them.

Establish the current behavior or baseline failure before changing code. Do not guess an API, schema, component contract, or installed-library behavior.

Prefer the smallest complete change. Avoid speculative abstraction, unrelated cleanup, whole-file rewrites, broad formatting, and duplicate components.

Engineering quality

Follow established project conventions unless they are unsafe or the root cause. Explain any necessary deviation.

Use clear names, cohesive functions/classes/components, explicit contracts, and strict types.

Avoid any, unsafe casts, non-null assertions, unvalidated arrays/JSON, hidden side effects, and swallowed errors.

Apply SOLID, DRY, KISS, and YAGNI with judgment. Do not add layers or patterns without a concrete need.

Reuse existing shared components, utilities, services, scopes, policies, and tests before adding alternatives.

Comments explain intent, invariants, security decisions, or necessary workarounds—not obvious syntax.

Preserve backward compatibility unless the task explicitly changes a contract and all callers are updated.

Safety

Never expose, print, commit, or log secrets or private data. Do not read .env values unless the task explicitly requires a safe local configuration diagnosis; never reproduce their values.

Do not commit, push, deploy, migrate production data, delete data, send external messages, or rotate credentials unless explicitly requested.

Do not weaken validation, authorization, tenant isolation, TLS, CSRF, CSP, dependency constraints, or tests to make behavior pass.

Distinguish a pre-existing failure from a regression introduced by the task.

Communication and token efficiency

Give concise progress updates only when work takes time or a material discovery changes the plan.

Do not paste complete files, large diffs, manifests, or long logs unless requested. Reference paths and summarize relevant evidence.

Keep plans to three to six concrete steps. Skip a formal plan for trivial work.

Batch independent reads/checks when safe. Do not reread unchanged files.

Ask only blocking questions; otherwise make a bounded assumption and continue.

Final claims must be backed by inspection, executed checks, or clearly labeled inference.

6. Task modules

ADVICE — explanations and prompts

Do not modify files or claim repository-specific facts without inspecting them.

Lead with a concrete recommendation, then the decisive tradeoffs and safe next action.

Separate confirmed facts from assumptions. Use current authoritative sources for unstable technical guidance.

Make prompts directly usable and avoid redundant prose.

DIAGNOSIS — cause analysis only

Reproduce or trace the failure and identify the root cause with exact code/config evidence.

Do not implement a fix unless the request includes fixing it.

Separate primary cause, contributing factors, and unrelated baseline issues.

Provide the smallest credible fix direction and how it would be verified.

BUG — corrective change

Reproduce or establish a deterministic failing path before editing.

Fix the root cause, not only the visible symptom.

Add/update the smallest regression test that fails before and passes after when feasible.

Check sibling paths sharing the same cause; expand scope only with evidence.

Preserve intended behavior outside the acceptance criteria.

FEATURE — new behavior

Translate the request into observable acceptance criteria and identify permissions, tenant ownership, validation, empty/error states, and failure behavior.

Implement the smallest vertical slice that is useful and complete.

Reuse existing architecture and shared UI; do not introduce a parallel framework or data flow.

Update contracts/types/tests together. Avoid half-connected UI or backend-only dead paths.

BE — Laravel/backend

Keep controllers thin. Put input rules and action authorization in Form Requests; use Policies/Gates/Spatie permissions for protected actions.

Put multi-step domain behavior in a focused Action or Service. Do not create a repository layer without a demonstrated need.

Treat all request input as untrusted. Normalize and validate it, then use mass-assignment-safe data.

Scope every tenant-owned query, route binding, search, aggregate, export, job, and action to the authenticated company. Never trust client-supplied company_id.

Shape API/Inertia output deliberately with Resources or explicit props. Do not serialize full models or unrelated personal fields.

Eager-load required relationships and avoid N+1 queries. Select only useful columns for large paths.

Use transactions for atomic multi-write behavior. Make retryable jobs, imports, exports, webhooks, and financial operations idempotent where duplicates are possible.

Return useful validation/domain errors without leaking stack traces or sensitive context.

FE — React/Inertia/TypeScript

Use Inertia for established page navigation, props, and forms. Use TanStack Query only for features that genuinely need client-side server-state caching; do not create two sources of truth.

Keep state local and derive values instead of synchronizing duplicates with effects.

Clean up Echo listeners, subscriptions, timers, observers, object URLs, and async work. Prevent stale closures and updates after unmount.

Use strict meaningful types. Keep server props, form values, validation errors, and component contracts aligned.

Use stable domain identifiers as list keys. Avoid unnecessary effects/memoization and premature optimization.

Prevent duplicate submissions and handle loading, empty, error, success, permission, and stale/realtime states.

Preserve browser navigation, focus restoration, and Inertia state intentionally.

UI — HeroUI, responsiveness, accessibility

Inspect the existing design system and nearby screens before changing visuals.

Use existing application components first, then HeroUI v3. Do not hand-build a primitive already supplied by the project/HeroUI.

Use Tailwind 4 and semantic theme tokens. Avoid hardcoded colors, inline styling, duplicated CSS systems, and global leakage.

Use Lucide icons rather than font emoji or improvised SVG when an appropriate icon exists.

Preserve compact professional SaaS density, visual hierarchy, consistent spacing/radius, and predictable actions.

Validate light and dark themes plus narrow mobile, tablet, laptop, and wide desktop layouts.

Prevent page-level horizontal overflow. Give dense tables an intentional responsive strategy; do not merely hide inaccessible content.

Include loading, skeleton/placeholder when justified, empty, error, validation, disabled, success, and permission-denied states.

Maintain semantic HTML, labels, keyboard operation, visible :focus-visible, focus restoration, adequate contrast, reduced motion, and usable touch targets.

Never globally disable Tab navigation or focus outlines. Prevent accidental destructive actions with confirmation, permissions, safe defaults, and idempotency.

Use restrained motion that explains change and respects prefers-reduced-motion.

Use the project's localization mechanism for user-facing text.

DB — schema, queries, migrations

Inspect the current schema, model casts/relations, query patterns, and production-data implications first.

Migrations must be deterministic, deployment-safe, and reversible when practical. Choose nullability, defaults, foreign keys, unique constraints, and indexes deliberately.

Index actual filters, joins, tenant keys, ordering, and uniqueness patterns; avoid redundant indexes.

Use database constraints as the final integrity boundary. Do not rely only on application-level existence checks.

Prevent races with constraints, atomic operations, transactions, locks, or idempotency keys as appropriate.

Never run migrate:fresh, truncate, mass deletion, or destructive verification on a non-disposable database.

For risky data transformations, use expand/backfill/contract phases and a resumable command/job instead of a long opaque migration.

Test migrations and rollback/recovery on a disposable database with representative existing data.

SEC — security and privacy

Enforce authentication, exact action authorization, tenant isolation, record ownership, and field-level restrictions on the server.

UI visibility is not authorization. Protect every controller/action, API endpoint, download, broadcast channel, queued job, and export.

Use parameterized Eloquent/query-builder operations. Bind every external value if raw SQL is unavoidable.

Keep CSRF protection. Prevent XSS, open redirects, path traversal, SSRF, insecure deserialization, unsafe dynamic evaluation, and over-posting.

For uploads, validate size, MIME type, extension, and content where practical; generate server filenames; use private storage; authorize every preview/download.

Apply rate limits to login, sensitive operations, uploads, exports, and abuse-prone endpoints where appropriate.

Keep secrets in environment/configuration, redact logs/errors, and do not expose personal documents or financial data in payloads.

Add negative tests: unauthenticated, forbidden role, wrong company, invalid input, manipulated identifier, and inaccessible file as applicable.

RT — Reverb/Echo/realtime

Authorize private/presence channels server-side and include tenant/user boundaries in channel design.

Keep event payloads minimal and free of unauthorized or sensitive fields.

Ensure create/update/delete events are handled consistently without duplicates or cross-company leakage.

Make client listeners stable, unsubscribe correctly, and reconcile events with local/Inertia/Query state without requiring refresh.

Design reconnect, out-of-order, duplicate, missing, and optimistic-update failure behavior.

Verify both the authorized happy path and a forbidden cross-tenant subscription.

FILE — uploads, documents, PDFs, Excel

Preserve source templates/layouts unless redesign is explicitly requested. Replace only intended placeholders/fields.

Validate upload and import structure before processing; limit size/count; fail with row/field-level errors that do not leak private data.

Store generated/private files outside public access and authorize every preview, export, and download.

Use streaming/chunking/queues for large exports/imports and clean temporary files reliably.

Prevent formula injection in spreadsheet exports and unsafe HTML/resource loading in document/PDF generation.

For documents where layout matters, render representative output and inspect pagination, fonts, alignment, clipping, and missing assets.

PERF — measured optimization

Establish a concrete bottleneck using timing, query count, payload size, render profile, bundle report, or reproducible evidence.

Fix the dominant cause first. Do not trade correctness, security, or maintainability for unmeasured micro-optimizations.

Backend: inspect N+1 queries, indexes, selected columns, pagination, caching ownership/invalidation, queue boundaries, and serialization size.

Frontend: inspect repeated requests, render churn, large lists, virtualization, code splitting, expensive libraries, and asset size.

State before/after evidence and ensure caching cannot leak tenant or permission-specific data.

REFACTOR — behavior-preserving structure change

Define the behavior invariant and scope before editing.

Add characterization coverage when current behavior is not already protected.

Keep refactoring separate from functional change unless inseparable and explicitly explained.

Prefer incremental extraction and straightforward naming over a large rewrite.

Remove old paths only after confirming all callers have moved and tests/build pass.

DEP — dependency change

Explain the concrete need and check whether the existing stack already solves it.

Inspect the lockfile/current installed version, compatibility, release notes, security status, license, bundle/runtime impact, and migration needs.

Use a supported constrained version; never introduce a wildcard dependency.

Keep manifest and lockfile changes focused. Do not update unrelated packages incidentally.

Run relevant unit/integration tests, typecheck/lint/build, and appropriate Composer/NPM audit checks.

maatwebsite/excel currently has * in composer.json; do not modify it incidentally. Pinning requires a separate verified dependency task based on the lockfile and export tests.

TEST — testing work

Test externally observable behavior and security/data invariants rather than private implementation details.

Choose the correct layer: unit for isolated logic, feature/integration for Laravel boundaries, and browser/component coverage for critical interaction when infrastructure exists.

Keep tests deterministic and isolated. Avoid real external services, real queues, clock randomness, and shared mutable state without explicit fakes/control.

Include happy, validation, authorization, tenant-isolation, failure, and edge cases proportional to risk.

A test change must not simply weaken assertions to accept broken behavior.

REVIEW — read-only review

Do not edit unless the user asks for fixes.

Lead with findings ordered by severity and real-world impact. Include exact path/symbol evidence and the failing scenario.

Distinguish exploitable/correctness issues from style preferences and reject likely false positives.

Check correctness, regressions, authorization/tenant isolation, data integrity, error paths, tests, performance, accessibility, and maintainability as relevant.

If there are no findings, say so and state residual test/coverage uncertainty.

OPS — build, CI, environments, deployment

Identify the exact environment before commands that can affect state. Never assume local, staging, or production.

Keep environment-specific values out of source control and ensure caches/workers use the intended configuration.

Prefer repeatable, non-interactive, observable commands with safe failure behavior.

For deployment-affecting changes, define ordering, maintenance/zero-downtime implications, migrations, workers, cache invalidation, health checks, rollback, and monitoring.

Never run a production deployment or destructive operation without explicit authorization.

GIT — version control

Inspect status, current branch, remotes, and divergence before changing history or pushing.

Preserve unrelated tracked/untracked changes. Do not stage or commit them.

Use focused commits only when requested. Never invent successful push/CI results.

Force-push, hard reset, branch deletion, history rewrite, or destructive cleanup requires exact scope and explicit confirmation.

7. Validation matrix

Select the smallest checks that provide confidence, then broaden according to risk. Adapt commands to repository configuration; do not invent unavailable scripts.

Changed area

Minimum focused validation

Broader validation when warranted

PHP syntax/small backend

targeted PHP syntax plus affected PHPUnit test/file

php artisan test; vendor/bin/pint --test

Authorization/tenant/security

happy path plus unauthenticated, forbidden, and cross-company tests

affected suite; security/audit checks

React/TypeScript

affected behavior test if present; npm run typecheck

npm run lint; npm run build

UI/responsive/theme

inspect changed states and target breakpoints/themes

typecheck, lint, build, browser test if available

Migration/query

disposable-DB migration and focused model/feature tests

rollback/recovery check and affected suite

Realtime

event/channel tests plus client listener behavior

reconnect/duplicate/cross-tenant checks and build

Files/docs/exports

focused generation/import test and representative artifact inspection

authorization, malformed/large input, queue and layout tests

Dependency

focused feature tests and lockfile diff

Composer/NPM audits, complete typecheck/lint/build/test suite

Refactor

characterization/regression tests

affected suite plus typecheck/lint/build

Build/CI

reproduce the exact failing command

adjacent pipeline/build checks

Rules:

Run focused checks first. Do not start with a long full suite unless the change is broad or focused tests are unavailable.

Never say all tests pass when only a subset ran. Name what ran.

If a baseline command fails, record the original failure, ensure the patch adds no new failure, and do not silently repair unrelated problems.

Do not run formatting over unrelated files. Format only touched files or use check mode.

8. Change delivery

DIRECT_EDIT

Edit the repository minimally and preserve its style and line endings.

Review the resulting diff for accidental changes, secrets, debug code, generated artifacts, and unrelated formatting.

Use Git as review/recovery context, but do not discard user work.

POWERSHELL_PATCH

When this mode is active, provide one PowerShell 5.1-compatible and idempotent installer that:

Accepts or resolves the exact project root safely; never targets a broad directory.

Verifies expected branch, files, and baseline anchors/hashes before mutation.

Refuses an unknown or already-conflicting baseline with a useful message.

Creates timestamped backups of only files it will touch.

Applies exact scoped changes while preserving encoding and line endings where practical.

Runs focused compatibility and validation checks.

Restores every touched file automatically if apply or validation fails.

Leaves unrelated files and existing user changes untouched.

Prints a concise summary, backup path, checks, and final success/failure code.

Contains no secrets and performs no commit/push/deploy unless explicitly requested.

9. Definition of done

A task is complete only when all applicable conditions hold:

Requested acceptance criteria and important edge cases are satisfied.

Authorization, tenant isolation, validation, privacy, and data integrity are preserved.

Backend/frontend contracts and strict types agree.

UI uses established components/tokens and is responsive, theme-safe, accessible, and complete across relevant states.

Focused regression checks pass with no new warnings/errors, or limitations are stated honestly.

The final diff contains no unrelated edits, secrets, debug artifacts, or accidental generated files.

Documentation is updated only when behavior, setup, or an important invariant changed.

10. Final response contract

Lead with the outcome. Then include only:

Important files changed and why.

Checks actually run and their results.

Remaining risk, blocker, or manual action—only if one exists.

Do not repeat the routing block, paste full code, or give a long tutorial unless requested. If no files were changed, say so clearly.
