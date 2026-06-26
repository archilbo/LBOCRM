# ARCHI LBO OS — AI Work Report

## Current Step

Step 1 — Clean Laravel + Inertia + React Aria foundation.

## Goal

Create a fresh Laravel + React project without old broken UI.

## Rules

- Keep Laravel + Inertia + React + TypeScript.
- Use React Aria Components for UI.
- Do not use shadcn, Chakra, MUI, Ant Design, Bootstrap, DaisyUI, or Flowbite.
- Work step by step.
- Do not start backend modules before MERISE and frontend prototype are approved.

---

## Step 2 â€” Local language file + SaaS AppShell

### Goal

Move UI text into a local editable language file and create a reusable SaaS layout shell.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/lib/i18n.ts
- resources/js/providers/ThemeProvider.tsx
- resources/js/components/ui/AppCard.tsx
- resources/js/components/layout/ThemeToggle.tsx
- resources/js/components/layout/navigation.ts
- resources/js/components/layout/AppSidebar.tsx
- resources/js/components/layout/AppTopbar.tsx
- resources/js/components/layout/AppMobileNav.tsx
- resources/js/components/layout/AppPageHeader.tsx
- resources/js/components/layout/AppShell.tsx
- resources/js/pages/Dashboard.tsx

### Notes

- English only for now.
- No static text should be added directly inside pages/components.
- UI labels should come from resources/js/locales/en.ts.

---

## Step 3 â€” Projects / Dossiers SaaS UI Prototype

### Goal

Create a clean SaaS CRM-style projects/dossiers page using shared components, local English language file, React Aria actions, TanStack Table, icons, visual status badges, progress visualization, and Sonner toasts.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/components/ui/AppBadge.tsx
- resources/js/components/ui/AppStatusBadge.tsx
- resources/js/components/ui/AppEmptyState.tsx
- resources/js/components/ui/AppIconButton.tsx
- resources/js/components/ui/AppDropdownMenu.tsx
- resources/js/components/ui/AppDataTable.tsx
- resources/js/features/dossiers/data/mockDossiers.ts
- resources/js/pages/Dossiers/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Uses mock data only.
- UI text is controlled from resources/js/locales/en.ts.
- Actions show Sonner toasts for now.
- DataTable is shared and reusable.

---

## Step 3 â€” Projects / Dossiers SaaS UI Prototype

### Goal

Create a clean SaaS CRM-style projects/dossiers page using shared components, local English language file, React Aria actions, TanStack Table, icons, visual status badges, progress visualization, and Sonner toasts.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/components/ui/AppBadge.tsx
- resources/js/components/ui/AppStatusBadge.tsx
- resources/js/components/ui/AppEmptyState.tsx
- resources/js/components/ui/AppIconButton.tsx
- resources/js/components/ui/AppDropdownMenu.tsx
- resources/js/components/ui/AppDataTable.tsx
- resources/js/features/dossiers/data/mockDossiers.ts
- resources/js/pages/Dossiers/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Uses mock data only.
- UI text is controlled from resources/js/locales/en.ts.
- Actions show Sonner toasts for now.
- DataTable is shared and reusable.

---

## Step 3.1 - Geist font and compact badges

### Goal

Use Geist font like modern shadcn/Vercel style and make badges/status labels smaller with no text wrapping.

### Files Modified

- resources/js/app.tsx
- resources/css/app.css
- resources/js/components/ui/AppBadge.tsx
- resources/js/components/ui/AppStatusBadge.tsx
- resources/js/components/ui/AppDataTable.tsx
- resources/js/pages/Dossiers/Index.tsx

### Packages Added

- @fontsource-variable/geist
- @fontsource-variable/geist-mono

### Notes

- Badges now use compact no-wrap styling.
- Status badges truncate instead of wrapping.
- Tables are more compact.
- Geist font is centralized in app.css.

---

## Step 4 - Dossier Workspace Prototype

### Goal

Create a clean SaaS workspace for a single project/dossier using React Aria Tabs, shared panels, status badges, visual progress, toasts, and mock data.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/features/dossiers/data/mockDossiers.ts
- resources/js/features/dossiers/components/WorkspaceInfoCard.tsx
- resources/js/features/dossiers/components/WorkspacePanel.tsx
- resources/js/pages/Dossiers/Show.tsx
- resources/js/pages/Dossiers/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Uses mock data only.
- All visible labels are in resources/js/locales/en.ts.
- The workspace route is /dossiers/{id}.
- Dossier tabs are visual prototype only.

---

## Step 5 - Clients page prototype

### Goal

Create a clean SaaS CRM clients page using mock data, shared React Aria fields, drawer form, confirm dialog, TanStack table, icons, status badges, and Sonner toasts.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/ui/AppButton.tsx
- resources/js/components/ui/AppTextField.tsx
- resources/js/components/ui/AppTextarea.tsx
- resources/js/components/ui/AppDrawer.tsx
- resources/js/components/ui/AppConfirmDialog.tsx
- resources/js/components/layout/navigation.ts
- resources/js/features/clients/data/mockClients.ts
- resources/js/features/clients/drawers/ClientDrawer.tsx
- resources/js/pages/Clients/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Uses mock client data only.
- Create/edit/delete actions show toasts.
- Drawer and confirm dialog use React Aria Modal/Dialog.
- All labels are in resources/js/locales/en.ts.

---

## Step 5.1 - Visible colored table actions

### Goal

Replace dropdown menu actions in tables with visible icon-only colored action buttons.

### Files Created / Modified

- resources/js/components/ui/AppTableActionButton.tsx
- resources/js/components/ui/AppTableActions.tsx
- resources/js/pages/Clients/Index.tsx
- resources/js/pages/Dossiers/Index.tsx

### Notes

- Table actions are now visible.
- Buttons use color-coded tones.
- Icons are accessible with aria-label and title.
- Dropdown menu component remains available but is no longer used in Clients/Dossiers tables.

---

## Step 6 - Client Details Workspace Prototype

### Goal

Create a client profile workspace using React Aria Tabs, shared cards, visible colored icon actions, mock projects, mock documents, notes, and activity.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/features/clients/data/mockClients.ts
- resources/js/features/clients/components/ClientInfoCard.tsx
- resources/js/features/clients/components/ClientPanel.tsx
- resources/js/pages/Clients/Show.tsx
- resources/js/pages/Clients/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Client details route is /clients/{id}.
- The Clients table view action now opens the profile workspace.
- All labels are in resources/js/locales/en.ts.

---

## Step 7 - New Project / Dossier Drawer Prototype

### Goal

Create a reusable project/dossier drawer form using React Aria fields and select components.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/ui/AppSelect.tsx
- resources/js/features/dossiers/drawers/ProjectDrawer.tsx
- resources/js/pages/Dossiers/Index.tsx

### Notes

- No backend logic added.
- New Project button now opens a drawer.
- Project form has client, project, property, workflow, and notes sections.
- Save action shows Sonner toast.
- All labels are stored in resources/js/locales/en.ts.

---

## Step 8 - Required Documents Workspace Prototype

### Goal

Create a documents workspace with upload cards, document table, preview placeholder, checklist states, visible colored actions, and toasts.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/features/documents/data/mockDocuments.ts
- resources/js/features/documents/components/DocumentUploadCard.tsx
- resources/js/features/documents/components/DocumentPreviewPanel.tsx
- resources/js/features/documents/components/DocumentChecklist.tsx
- resources/js/pages/Documents/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- File upload uses React Aria FileTrigger.
- Upload is simulated with Sonner toast.
- Document preview is metadata/placeholder only.
- Documents route is /documents.
- All labels are in resources/js/locales/en.ts.

---

## Step 9 - Contract Workspace Prototype

### Goal

Create a contract workspace with calculation panel, workflow timeline, contract table, preview placeholder, visible colored actions, and DOCX/PDF mock actions.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/features/contracts/data/mockContracts.ts
- resources/js/features/contracts/components/ContractCalculationPanel.tsx
- resources/js/features/contracts/components/ContractWorkflow.tsx
- resources/js/features/contracts/components/ContractPreviewPanel.tsx
- resources/js/pages/Contracts/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Calculation is frontend prototype only.
- DOCX/PDF generation is simulated with Sonner toast.
- Contract route is /contracts.
- All labels are in resources/js/locales/en.ts.

---

## Step 10 - Authorization Workspace Prototype

### Goal

Create an authorization workspace with dashboard metrics, submission board, observations panel, preview placeholder, timeline, visible table actions, and toasts.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/features/authorizations/data/mockAuthorizations.ts
- resources/js/features/authorizations/components/AuthorizationBoard.tsx
- resources/js/features/authorizations/components/AuthorizationTimeline.tsx
- resources/js/features/authorizations/components/ObservationsPanel.tsx
- resources/js/features/authorizations/components/AuthorizationPreviewPanel.tsx
- resources/js/pages/Authorizations/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Authorization route is /authorizations.
- Observations and submissions use mock data.
- Visible colored action buttons are used in the table.
- All labels are in resources/js/locales/en.ts.

---

## Step 11 - Planning Workspace Prototype

### Goal

Create a planning workspace with weekly board, task table, selected task focus panel, workflow timeline, visible colored actions, due dates, status, priority, and toasts.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/features/planning/data/mockPlanning.ts
- resources/js/features/planning/components/PlanningBoard.tsx
- resources/js/features/planning/components/PlanningFocusPanel.tsx
- resources/js/features/planning/components/PlanningTimeline.tsx
- resources/js/pages/Planning/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Planning route is /planning.
- Weekly board and task table use mock data.
- Visible colored action buttons are used in the table.
- All labels are in resources/js/locales/en.ts.

---

## Step 11.1 - Planning UI Fix

### Goal

Fix Planning page layout based on visual review.

### Changes

- AppDataTable now has horizontal scroll instead of breaking the page.
- Planning weekly board is more compact and scroll-safe.
- Planning table has fewer columns and better grouped data.
- Focus panel no longer gets clipped on the right.
- Right side panel is only side-by-side on very large screens.
- Timeline is compact and card-based.
- Table actions remain visible colored icon buttons.

### Files Modified

- resources/js/components/ui/AppDataTable.tsx
- resources/js/features/planning/components/PlanningBoard.tsx
- resources/js/features/planning/components/PlanningFocusPanel.tsx
- resources/js/features/planning/components/PlanningTimeline.tsx
- resources/js/pages/Planning/Index.tsx

---

## Step 12 - Finance Workspace Prototype

### Goal

Create a finance workspace with devis, invoices, payments, remaining balances, selected finance focus panel, payment breakdown, workflow timeline, and visible colored action buttons.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/features/finance/data/mockFinance.ts
- resources/js/features/finance/components/FinanceFocusPanel.tsx
- resources/js/features/finance/components/FinanceBreakdownPanel.tsx
- resources/js/features/finance/components/FinanceTimeline.tsx
- resources/js/pages/Finance/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Finance route is /finance.
- Devis/invoices/payments use mock data only.
- Visible colored action buttons are used in the table.
- All labels are in resources/js/locales/en.ts.

---

## Step 13 - Archive Workspace Prototype

### Goal

Create an archive workspace with archive numbers, in/out date tracking, physical location, retrieval status, timeline, selected focus panel, and visible colored action buttons.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/components/layout/navigation.ts
- resources/js/features/archives/data/mockArchives.ts
- resources/js/features/archives/components/ArchiveFocusPanel.tsx
- resources/js/features/archives/components/ArchiveLocationPanel.tsx
- resources/js/features/archives/components/ArchiveTimeline.tsx
- resources/js/pages/Archives/Index.tsx
- routes/web.php

### Notes

- No backend logic added.
- Archive route is /archives.
- Archive records use mock data only.
- Visible colored action buttons are used in the table.
- All labels are in resources/js/locales/en.ts.

---

## Step 14 - Dashboard Redesign

### Goal

Replace the starter dashboard with an operational command center connecting all frontend modules.

### Files Created / Modified

- resources/js/locales/en.ts
- resources/js/features/dashboard/data/mockDashboard.ts
- resources/js/features/dashboard/components/DashboardKpiCard.tsx
- resources/js/features/dashboard/components/DashboardWorkflow.tsx
- resources/js/features/dashboard/components/DashboardUrgentList.tsx
- resources/js/features/dashboard/components/DashboardActivityFeed.tsx
- resources/js/features/dashboard/components/DashboardModulesOverview.tsx
- resources/js/features/dashboard/components/DashboardQuickActions.tsx
- resources/js/pages/Dashboard.tsx

### Notes

- No backend logic added.
- Dashboard uses mock data only.
- Dashboard links all active modules visually.
- Quick actions navigate to existing prototype modules.
- All labels are stored in resources/js/locales/en.ts.

---

## Step 14.1 - Requested UI Changes

### Dashboard

- Quick actions moved to the page header action area.
- Recent activity made smaller.
- Recent activity now collapses/expands.
- Added small finance/company statistics with mini progress charts.

### Client Drawer

- Added mother name field.
- Changed intermediary from manual text field to dropdown.
- Added mock intermediary source to simulate DB-driven options.
- Fixed drawer close icon style.

### Contracts

- Improved responsive layout to reduce cropped UI.
- Right preview panel is now only side-by-side on very large screens.

### Dossiers

- Removed the Planning tab from the Dossier workspace.
- Global Planning module remains available unless removed later.

---

## Step 15 - Global Layout Polish

### Goal

Improve the global app layout foundation before backend/database work.

### Changes

- Removed Planning from main navigation because it is not needed in the project now.
- Removed Planning from dashboard workflow/module overview.
- Improved sidebar active state and density.
- Added compact mobile bottom navigation.
- Improved AppShell page width, spacing, and mobile bottom padding.
- Improved Topbar.
- Added global scrollbar/table layout polish.
- Kept /planning route file hidden in case it is needed later.

### Files Modified

- resources/js/components/layout/navigation.ts
- resources/js/components/layout/AppSidebar.tsx
- resources/js/components/layout/AppMobileNav.tsx
- resources/js/components/layout/AppTopbar.tsx
- resources/js/components/layout/AppShell.tsx
- resources/js/features/dashboard/data/mockDashboard.ts
- resources/js/features/dashboard/components/DashboardQuickActions.tsx
- resources/css/app.css

---

## Step 15.1 - Routing, Global Search, and Prototype Logic QA

### Goal

Finish frontend prototype logic before database/backend.

### Changes

- Added central route registry in resources/js/lib/appRoutes.ts.
- Sidebar now uses the route registry.
- Mobile navigation now uses the route registry.
- Laravel routes were cleaned to only active prototype routes.
- Added real global search logic in the topbar.
- Added prototype search index for modules, clients, dossiers, documents, contracts, authorizations, finance, and archives.
- Added prototype action helpers for navigation, toast, fake download, and not-ready actions.
- Added docs/FRONTEND_QA_CHECKLIST.md.

### Notes

- Planning route has been removed from Laravel active routes.
- Search is still frontend mock logic only.
- Backend/database should start only after QA checklist passes.

---

## Step 16 - MERISE Database Backend Foundation

### Goal

Start real database/backend foundation after frontend prototype QA.

### Created

- Core migration for:
  - intermediaries
  - clients
  - dossiers
  - document_templates
  - dossier_documents
  - contracts
  - authorizations
  - finance_records
  - archive_records

- Models:
  - Intermediary
  - Client
  - Dossier
  - DocumentTemplate
  - DossierDocument
  - Contract
  - Authorization
  - FinanceRecord
  - ArchiveRecord

- Demo seeder:
  - ArchiLboDemoSeeder

- Documentation:
  - docs/BACKEND_DATABASE_FOUNDATION.md

### Notes

- Planning was intentionally excluded.
- Frontend pages are still using mock TypeScript data.
- Next step should connect Clients page to database first.

---

## Step 26 Repair - Validation Errors UI

### Goal

Repair failed PowerShell replace error and finish validation UI step.

### Fixed

- PowerShell -replace stopped because replacement expression was parsed as 3 arguments.
- Replaced risky patch with safe regex replacement.
- Added AppFormErrorSummary support to drawers.
- Added page-level formErrors state.
- Repaired possible broken drawer imports.

---

## Step 27 - Filter Foundation

### Goal

Add reusable frontend filters safely after Step 26 repair.

### Created / Modified

- resources/js/components/ui/AppFilterBar.tsx
- resources/js/lib/filters.ts
- resources/js/pages/Clients/Index.tsx
- resources/js/pages/Dossiers/Index.tsx
- docs/STEP_27_FILTER_FOUNDATION.md

### Notes

- Avoided risky mass regex patches.
- Filters started with Clients and Dossiers.

---

## Step 28 - Remaining Module Filters

### Goal

Add filters to the remaining backend pages safely.

### Modified

- resources/js/components/ui/AppFilterBar.tsx
- resources/js/lib/filters.ts
- resources/js/pages/Documents/Index.tsx
- resources/js/pages/Contracts/Index.tsx
- resources/js/pages/Authorizations/Index.tsx
- resources/js/pages/Finance/Index.tsx
- resources/js/pages/Archives/Index.tsx

### Notes

- No drawer files were patched in this step.
- Bad literal newline scanner runs before build.

---

## Step 31+32 — Contract DOCX Generation

### Goal

Replace placeholder TXT contract files with real DOCX generation from original ARCHI LBO templates. Add PDF export via LibreOffice. Add contract rate selection (0.5% / 2%).

### Files Created

- `database/migrations/2026_06_24_000001_add_fee_rate_percent_to_contracts_table.php` — adds `fee_rate_percent decimal(5,2)` to contracts
- `app/Services/OfficeDocumentConverter.php` — converts DOCX to PDF via LibreOffice headless
- `app/Console/Commands/TestContractGeneration.php` — `php artisan archilbo:test-contract-generation {id}` QA command

### Files Modified

- `app/Services/ContractDocumentGenerator.php` — uses `fee_rate_percent` from model instead of parsing notes; template selection (0.5 → contrat_architecte_0_5.docx, 2 → contrat_architecte_2.docx); replaces `[KEY]` placeholders via TemplateProcessor + XML ZIP fallback; preserves original template layout 100%
- `app/Http/Controllers/ContractController.php` — `generate()` now uses `ContractDocumentGenerator` service; added `exportPdf()` method; `prepareContractData()` uses correct calculation (ESTIMATION * rate / 100); `downloadGenerated()` returns .docx; `downloadPdf()` returns .pdf; deletes entire contract directory on destroy
- `app/Models/Contract.php` — added `fee_rate_percent` to fillable + casts
- `app/Http/Requests/StoreContractRequest.php` — added `fee_rate_percent` validation (in:0.5,2)
- `app/Http/Requests/UpdateContractRequest.php` — added `fee_rate_percent` validation
- `app/Http/Resources/ContractResource.php` — added `feeRatePercent` field
- `routes/web.php` — added `PUT contracts/{contract}/export-pdf`
- `resources/js/features/contracts/types.ts` — added `feeRatePercent` to ContractRow and ContractFormPayload
- `resources/js/features/contracts/drawers/ContractDrawer.tsx` — added fee rate selector (0.5% / 2%), changed default price_per_square_meter to 900
- `resources/js/pages/Contracts/Index.tsx` — added `exportPdf()`, `downloadPdf()` functions; added Export PDF and Download PDF action buttons

### Files Deleted

- `vite.config.js` (conflicting config without React plugin, caused @react-refresh 404)

### Template Storage

- Original templates: `storage/app/private/archi-templates/contracts/`
  - `contrat_architecte_0_5.docx` (0.5% rate)
  - `contrat_architecte_2.docx` (2% rate)
- Generated files: `storage/app/public/contracts/{contract_number}/`

### Template Placeholders

`[DATE]`, `[CIVILITY]`, `[CLIENT_NAME]`, `[CIN]`, `[CLIENT_ADD]`, `[PROJECT_OBJECT]`, `[PROJECT_ADD]`, `[TITRE]`, `[SUP]`, `[PREF]`, `[COMMUNE]`, `[PLANCHER]`, `[ESTIMATION]`, `[HT]`, `[TVA]`, `[TTC]`

### How to Add a New Template

1. Place the DOCX file in `storage/app/private/archi-templates/contracts/`
2. Add its path to `config/archilbo_templates.php` under `contracts.templates`
3. Add the rate value in the `fee_rate_percent` select options if it's a new rate

### How to Test

```bash
# Generate DOCX for a specific contract
php artisan archilbo:test-contract-generation {contract_id}

# Or via UI
# 1. Open /contracts
# 2. Create contract with rate 0.5% or 2%
# 3. Click Generate
# 4. Click Download DOCX
# 5. Click Export PDF (requires LibreOffice)
# 6. Click Download PDF
```

### LibreOffice PDF Export

- Set `LIBREOFFICE_PATH` in `.env` for custom path
- Default paths checked: `C:\Program Files\LibreOffice\program\soffice.exe` and `C:\Program Files (x86)\LibreOffice\program\soffice.exe`
- PDF conversion unavailable gracefully with error toast

### Known Limitations

- PDF export requires LibreOffice installed locally
- Calculations assume 20% TVA and configurable unit price (default 900 MAD/m²)

---

## Step 33 — Finance Excel Generation

### Goal

Replace placeholder TXT finance download with real XLSX generation from original ARCHI LBO Excel templates. Support Devis, Facture, and Reçu types with placeholder replacement via PhpSpreadsheet. Add PDF export via LibreOffice.

### Files Created

- `app/Services/FinanceDocumentGenerator.php` — generates XLSX from original Excel templates; copies template → replaces `[KEY]` and `${KEY}` placeholders across all cells/sheets; supports devis/facture/recu templates
- `database/migrations/2026_06_24_000002_add_generated_fields_to_finance_records_table.php` — adds `generated_file_path`, `generated_pdf_path`, `generated_at` columns to `finance_records`
- `app/Console/Commands/TestFinanceGeneration.php` — `php artisan archilbo:test-finance-generation {id}` QA command

### Files Modified

- `config/archilbo_templates.php` — fixed finance template paths to match actual filenames (DEVIS ARCHI LBO.xlsx, FACTURE.xlsx, RECU ARCHI LBO.xlsx)
- `app/Models/FinanceRecord.php` — added `generated_file_path`, `generated_pdf_path`, `generated_at` to fillable + casts
- `app/Http/Controllers/FinanceController.php` — added `generate()`, `exportPdf()`, `downloadPdf()` methods; `download()` now returns real generated XLSX (or error flash if missing)
- `app/Http/Resources/FinanceRecordResource.php` — added `generatedFilePath`, `generatedPdfPath`, `generatedAt`, `downloadUrl`, `pdfDownloadUrl`, `hasGeneratedFile`, `hasPdf`
- `routes/web.php` — added `PUT /finance/{id}/generate`, `PUT /finance/{id}/export-pdf`, `GET /finance/{id}/download-pdf`
- `resources/js/features/finance/types.ts` — added generation-related fields to `FinanceRecordRow`
- `resources/js/pages/Finance/Index.tsx` — added Generate, Download Excel, Export PDF, Download PDF buttons (both in table actions and preview panel)

### Template Storage

- Originals: `storage/app/private/archi-templates/finance/`
  - `DEVIS ARCHI LBO.xlsx` (devis template)
  - `FACTURE.xlsx` (invoice template)
  - `RECU ARCHI LBO.xlsx` (payment/reçu template)
- Generated files: `storage/app/public/finance/{record_number}/`

### Supported Placeholders

`[DATE]`, `[CLIENT_NAME]`, `[CIN]`, `[CLIENT_ADD]`, `[PROJECT_OBJECT]`, `[PROJECT_ADD]`, `[DOSSIER_NUMBER]`, `[RECORD_NUMBER]`, `[TYPE]`, `[HT]`, `[TVA]`, `[TTC]`, `[PAID]`, `[REMAINING]`, `[NOTES]`

Also supports `${KEY}` syntax.

### How to Test

```bash
# Generate XLSX for a specific record
php artisan archilbo:test-finance-generation {record_id}

# Or via UI
# 1. Open /finance
# 2. Create a devis, invoice, or payment record
# 3. Click Generate
# 4. Click Download Excel
# 5. Open XLSX — confirm original template layout is preserved
# 6. Click Export PDF (requires LibreOffice)
# 7. Click Download PDF
```

### LibreOffice PDF Export

- Reuses `app/Services/OfficeDocumentConverter.php` (contracts path)
- Set `LIBREOFFICE_PATH` in `.env` for custom path
- Default paths: `C:\Program Files\LibreOffice\program\soffice.exe`
- Unavailable LibreOffice shows clear error flash

### Template Type Mapping

| `type` field | Template file |
|---|---|
| `devis` | `DEVIS ARCHI LBO.xlsx` |
| `invoice` | `FACTURE.xlsx` |
| `payment` | `RECU ARCHI LBO.xlsx` |

---

## Step 34 — New Finance Foundation

### Goal

Create the database foundation for the new finance builder system (parallel to the old `finance_records`). Adds settings key-value store, editable HTML/CSS templates for future PDF rendering, new finance documents/items/payments tables, and a settings controller.

### Key Decisions

- **Table name: `finance_templates`** — `document_templates` already exists with a different schema (dossier document type lookup).
- **Placeholder syntax: `{{key}}`** — new HTML templates use double-curly syntax; old `[KEY]` syntax remains for Excel generation.
- **Old `finance_records` unchanged** — new system runs parallel.

### Files Created

**Migrations (5):**
- `2026_06_24_000010_create_company_settings_table` — key-value store with group/key uniqueness
- `2026_06_24_000011_create_finance_templates_table` — editable HTML/CSS templates
- `2026_06_24_000012_create_finance_documents_table` — core finance docs with HT/TVA/TTC, status, soft deletes
- `2026_06_24_000013_create_finance_document_items_table` — line items per document
- `2026_06_24_000014_create_payments_table` — payments linked to documents

**Models (5):**
- `CompanySetting` — static `getValue()`/`setValue()` helpers with type coercion
- `DocumentTemplate` — scopes `default()`, `type()`, maps to `finance_templates` table
- `FinanceDocument` — `recalculateTotals()`, `updatePaymentTotals()`, status helpers
- `FinanceDocumentItem` — `calculateTotals()` (quantity × unit_price × discount × TVA)
- `Payment` — soft deletes, linked to document/client/dossier

**Service:**
- `app/Services/Finance/FinanceSettingsService.php` — static getters for all settings (company, numbering, tax, finance, bank) with defaults

**Controller + Request:**
- `app/Http/Controllers/Finance/FinanceSettingsController` — `index()` + `update()` with Inertia page
- `app/Http/Requests/Finance/UpdateFinanceSettingsRequest` — validates 18 fields

**Routes:**
- `GET finance/settings` → `finance.settings`
- `PUT finance/settings` → `finance.settings.update`

**Seeder:**
- `database/seeders/FinanceFoundationSeeder` — 18 company settings + 3 default HTML templates (quote, invoice, receipt) with CSS

**Model Updates:**
- `Client`: added `financeDocuments()`, `payments()`
- `Dossier`: added `financeDocuments()`, `payments()`

### Verification

```bash
php artisan migrate                    # All 5 tables created
php artisan db:seed --class=FinanceFoundationSeeder  # 18 settings + 3 templates
npm run build                          # Frontend builds successfully
php artisan route:list --name=finance  # Shows 11 routes (old + new)
```

### Next Steps

- Build `resources/js/pages/Finance/Settings.tsx` Inertia page
- Build `FinanceDocumentController` for CRUD + generation
- Build PDF renderer using `{{key}}` HTML template system
- Build payment reconciliation and status workflow

---

## Step 35 — Finance Builder Backend API

### Goal

Build the backend API to support the new finance builder:
- Create/ edit/ delete devis/ factures/ reçus
- Auto-calculate totals (HT/TVA/TTC/remaining)
- Convert devis to factures
- Record payments and update status (draft → issued → partially_paid → paid)
- Generate document numbers (DEV-YEAR-0001, FAC-YEAR-0001, PAY-YEAR-0001)
- Prepare routes and resources for frontend live builder
- Keep old `/finance` routes 100% untouched

### Key Files Created

**Services:**
- `app/Services/Finance/FinanceNumberService.php` — Generates unique document/payment numbers
- `app/Services/Finance/FinanceCalculator.php` — Calculates item/document totals, updates payment status

**Requests (5):**
- `app/Http/Requests/Finance/StoreFinanceDocumentRequest.php`
- `app/Http/Requests/Finance/UpdateFinanceDocumentRequest.php`
- `app/Http/Requests/Finance/StorePaymentRequest.php`
- `app/Http/Requests/Finance/UpdatePaymentRequest.php`
- `app/Http/Requests/Finance/ConvertQuoteToInvoiceRequest.php`

**Resources (3):**
- `app/Http/Resources/FinanceDocumentItemResource.php`
- `app/Http/Resources/FinanceDocumentResource.php`
- `app/Http/Resources/PaymentResource.php`

**Controller:**
- `app/Http/Controllers/Finance/PaymentController.php` — CRUD for payments

**Command:**
- `app/Console/Commands/TestFinanceBuilderCommand.php` — Test the entire backend flow

### Key Files Updated

- `app/Models/FinanceDocument.php` — added `canConvertToInvoice()`, `canRecordPayment()` helpers
- `app/Http/Controllers/Finance/FinanceDocumentController.php` — added `accept()`, `reject()`, `cancel()`, `convertToInvoice()` methods; updated `store()`/`update()` to use new services
- `routes/web.php` — added 9 new finance document/payment routes, kept all old routes

### Verification

```bash
php artisan optimize:clear
composer dump-autoload
php artisan route:list --path=finance  # Shows 20 routes (old + new)
npm run build                          # Frontend build passes
php artisan archilbo:test-finance-builder  # If you have a Client, this runs the full test
```

### Calculation Rules

- **Item totals**: HT = qty × unit price − discount; TVA = HT × rate; TTC = HT + TVA
- **Document totals**: Sum items, apply document discount, calculate remaining from payments
- **Payment status**: `issued` → `partially_paid` → `paid`

### Next Steps

Build the frontend live builder for finance documents, including the document drawer with line items, live totals, and preview.


# AI Work Report

## Date

2026-06-26

## Step Completed

Step 36 - Finance Live Builder UI

## What Was Built

Added a live finance document builder for devis, factures, and recus on the newer `/finance/documents` workflow. The UI includes finance tabs, metric cards, document tables, payment table, create/edit builder drawer, payment drawer, live line-item calculation, totals, and preview.

## Files Created

- `docs/STEP_36_FINANCE_LIVE_BUILDER_UI.md`
- `resources/js/features/finance/utils/calculations.ts`
- `resources/js/features/finance/components/FinanceTabs.tsx`
- `resources/js/features/finance/components/FinanceMetricCards.tsx`
- `resources/js/features/finance/components/FinanceStatusBadge.tsx`
- `resources/js/features/finance/components/FinanceMoneyCell.tsx`
- `resources/js/features/finance/components/FinanceDocumentActions.tsx`
- `resources/js/features/finance/components/FinanceItemsTable.tsx`
- `resources/js/features/finance/components/FinanceTotalsBox.tsx`
- `resources/js/features/finance/components/FinanceDocumentPreview.tsx`
- `resources/js/features/finance/components/FinanceClientDossierFields.tsx`
- `resources/js/features/finance/components/FinanceDateFields.tsx`
- `resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx`
- `resources/js/features/finance/drawers/PaymentDrawer.tsx`

## Files Modified

- `resources/js/features/finance/types.ts`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `resources/js/components/ui/AppDrawer.tsx`
- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `app/Http/Resources/FinanceDocumentResource.php`
- `app/Http/Resources/FinanceDocumentItemResource.php`
- `app/Http/Resources/PaymentResource.php`

## Database Changes

No database changes in this step.

## Commands Run

```bash
npm run build
php artisan optimize:clear
php artisan route:list --path=finance
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
```

## New Routes

No new routes were added. Existing finance document and payment routes are now consumed by the UI.

## New Permissions

No new permissions were added.

## Important Decisions

- Kept the legacy `/finance` records module untouched.
- Built the live builder on `/finance/documents` because Step 34/35 backend already supports finance documents and payments there.
- Reused existing React Aria app components and did not add another UI framework.
- Added optional `panelClassName` support to `AppDrawer` so the builder can use a wide workspace without changing existing drawer behavior.

## How To Test

1. Visit `/finance/documents`.
2. Create a new devis with multiple lines.
3. Confirm HT, TVA, TTC totals update in the drawer and preview.
4. Edit the created devis.
5. Accept/reject a devis.
6. Convert a devis to facture.
7. Record a payment on a facture.
8. Confirm the payment appears in the Paiements tab.

## Known Issues

- Vite reports a large JavaScript chunk warning, but build succeeds.
- Templates and settings tabs are summary placeholders for now.
- Payment edit/delete UI is not included yet.

## Next Recommended Step

Browser-test `/finance/documents` end to end, then add payment edit/delete actions and connect finance settings editing if needed.

# AI Work Report

## Date

2026-06-26

## Step Completed

Finance live builder responsive UI correction

## What Was Changed

Fixed the finance document builder drawer layout after visual QA showed the preview overlapping the form on narrow drawer widths.

## Files Modified

- `resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx`
- `resources/js/features/finance/components/FinanceDocumentPreview.tsx`
- `resources/css/app.css`
- `docs/AI_WORK_REPORT.md`

## Important Decisions

- The two-column builder now uses CSS container queries instead of viewport breakpoints.
- The preview is only sticky when the drawer container is wide enough.
- The drawer width now uses important width utility classes so the default drawer CSS does not force the finance builder back to a narrow panel.

## Commands Run

```bash
npm run build
```

## Build/Test Result

`npm run build` passed. Vite still reports the existing large chunk warning.

## Next Recommended Step

Reload `/finance/documents`, open Nouveau devis, and confirm the form no longer sits behind the preview.
