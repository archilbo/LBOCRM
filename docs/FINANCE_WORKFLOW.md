# Finance Workflow

## Source Of Truth

`finance_documents` is the only active document ledger for devis, factures, and recus. `payments`, `expenses`, and `finance_templates` belong to the same finance context. Legacy `finance_records` data is copied into `finance_documents` by the 2026-07-18 migration; no active finance route writes to the legacy table.

## Dossier Finance Rules

- A dossier can have multiple devis until one is accepted. Once accepted, no new devis can be created for that dossier.
- A dossier can have only one non-cancelled facture. This is protected by both the finance eligibility service and a scoped database unique key.
- A payment is registered against the facture whenever a devis or facture is already active for the dossier.
- A direct dossier advance is allowed only while there is no active devis and no active facture. It creates a receipt immediately.
- When the first facture is created, eligible pending advances are attached automatically and recalculate the paid and remaining totals. Cancelling or deleting that facture releases those advances again.
- The client and dossier supplied for any finance mutation must match, and the dossier must share the authenticated user's company and branch scope.

## Tenant Scope

Finance records carry `company_id` and optional `branch_id`. Policies require the authenticated user to share the record scope. Clients and dossiers now carry the same ownership fields; the tenant migration backfilled existing ARCHI LBO records to Marrakech (`RAK`). New clients inherit the authenticated user scope and new dossiers inherit the selected scoped client. New payments and receipts inherit scope from their invoice or, for a direct advance, from the scoped dossier. New expenses and templates inherit scope from the authenticated user.

Initial company data was sourced from `RECU ARCHI LBO.xlsx`:

- Company: ARCHI LBO
- Branch: Marrakech (`RAK`)
- Address: Immeuble nr 959 bureau n 1, lotissement Al Massar, Marrakech

Tax, bank, phone, and email values continue to come from Finance Settings because the workbook does not contain authoritative values for them.

## Issuance And Immutability

The first PDF or Excel generation issues the document and stores:

- Template snapshot
- Render-data snapshot
- Rendered HTML snapshot
- SHA-256 snapshot hash
- Issued timestamp and user
- PDF and Excel checksums

Issued content and number-critical fields cannot be edited. Payment totals and lifecycle status may still change. Regeneration always uses the frozen rendered snapshot.

## Private Files

Generated files use the private `local` disk under:

`finance/company-{company_id}/branch-{branch_id}/{type}/{number}/`

Paths are never returned to React. Authorized Laravel routes provide inline view, attachment download, and print responses with private no-store headers. Run `php artisan finance:migrate-private-files` after deployment to relocate existing public finance exports.

## Listing And Actions

The finance document list uses Laravel filtering, sorting, and pagination. Supported query parameters include `tab`, `type`, `status`, `search`, `client_id`, `dossier_id`, `date_from`, `date_to`, `sort`, `direction`, `per_page`, and `page`.

Document actions include open, HTML view, inline PDF view, print, PDF download, Excel download, generation, payment registration, quote workflow, cancellation, and authorized deletion.

## Permissions

Granular permissions use the `finance.*` namespace for document creation/update/issue/cancel/delete, payments, expenses, templates, settings, and report export. Backend policies are authoritative; UI visibility is not a security boundary.

## Audit

`finance_activity_logs` records company, branch, actor, subject, action, old/new values, IP address, user agent, and timestamps for sensitive finance mutations.
