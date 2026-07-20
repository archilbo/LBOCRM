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

# AI Work Report

## Date

2026-06-26

## Step Completed

Finance live builder currency crash fix

## What Was Changed

Fixed a frontend crash where `Intl.NumberFormat` received an invalid currency code such as `2` from finance data/settings.

## Files Modified

- `resources/js/features/finance/utils/calculations.ts`
- `resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx`
- `docs/AI_WORK_REPORT.md`

## Important Decisions

- Added `normalizeCurrency()` to force any invalid currency value back to `MAD`.
- Wrapped `formatMoney()` in a safe fallback so finance UI cannot crash from malformed currency input.
- Normalized builder drawer currency state on create/edit and currency field changes.

## Commands Run

```bash
npm run build
```

## Build/Test Result

`npm run build` passed. Vite still reports the existing large chunk warning.

## Next Recommended Step

Reload `/finance/documents`, open Nouveau devis, and verify there are no console errors while editing line items.

# AI Work Report

## Date

2026-06-26

## Step Completed

Finance document visibility after create fix

## What Was Changed

Fixed the issue where created devis/factures were saved in the database but did not reliably appear in the finance document UI after saving.

## Files Modified

- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx`
- `docs/AI_WORK_REPORT.md`

## Important Decisions

- Finance document index now sends resolved plain arrays to Inertia instead of a paginator/resource hybrid.
- Create/update redirects now include the target finance tab.
- The frontend unwrap helper now tolerates nested Inertia resource shapes.
- The builder switches the active tab to Devis or Factures immediately after save.

## Commands Run

```bash
npm run build
php artisan route:list --path=finance/documents
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
```

## Build/Test Result

`npm run build` passed. Finance document routes and PHP syntax check passed.

## Next Recommended Step

Reload `/finance/documents`, create a devis and a facture, then verify each appears in its matching tab immediately.

# AI Work Report

## Date

2026-06-26

## Step Completed

Finance navigation/module consolidation

## What Was Changed

Merged the visible Finance experience into one module. The newer live finance workspace is now the primary Finance module because it supports devis, factures, payments, line items, quote conversion, and the live builder workflow.

## Files Modified

- `routes/web.php`
- `resources/js/components/layout/navigation.ts`
- `resources/js/lib/appRoutes.ts`
- `docs/AI_WORK_REPORT.md`

## Important Decisions

- `/finance` now renders `FinanceDocumentController@index`, the live builder workspace.
- `/finance/documents` remains available as a compatibility alias.
- The sidebar now shows only one Finance item.
- `financeDocuments` and `financeSettings` route metadata are hidden from navigation/search so users are not split between multiple finance entries.
- The legacy `finance_records` backend was kept in place for existing data and backward compatibility, but it is no longer the visible Finance module.

## Commands Run

```bash
npm run build
php artisan route:list --path=finance
php -l routes/web.php
```

## Build/Test Result

`npm run build` passed. Finance route list and route syntax check passed.

## Next Recommended Step

Reload the app sidebar and confirm Management shows a single Finance item. Click it and verify it opens the live Finance workspace at `/finance`.

---

# AI Work Report

## Date

2026-06-26

## Step Completed

Step 37 - Finance PDF and Excel Export

## What Was Built

Added real PDF and Excel export support for the new finance builder workflow. Finance documents can now generate PDF files with DomPDF and XLSX files with PhpSpreadsheet from the `finance_documents` source of truth.

## Files Created

- `app/Services/Finance/FinanceDocumentRenderData.php`
- `app/Services/Finance/FinanceTemplateRenderer.php`
- `app/Services/Finance/FinancePdfGenerator.php`
- `app/Services/Finance/FinanceExcelExporter.php`
- `app/Console/Commands/TestFinanceExportCommand.php`
- `docs/STEP_37_FINANCE_PDF_EXCEL_EXPORT.md`

## Files Modified

- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `app/Http/Requests/Finance/StoreFinanceDocumentRequest.php`
- `app/Http/Requests/Finance/UpdateFinanceDocumentRequest.php`
- `app/Http/Resources/FinanceDocumentResource.php`
- `resources/js/features/finance/components/FinanceDocumentActions.tsx`
- `resources/js/features/finance/types.ts`
- `routes/web.php`
- `docs/AI_WORK_REPORT.md`

## Database Changes

No migration changes. Validation now correctly checks `template_id` against `finance_templates,id`, matching the existing finance document relation.

## Commands Run

```bash
php artisan optimize:clear
composer dump-autoload
php artisan route:list --path=finance
php artisan storage:link
npm run build
php artisan archilbo:test-finance-export 1
php artisan test
```

## New Routes

- `PUT /finance/documents/{financeDocument}/generate-pdf`
- `PUT /finance/documents/{financeDocument}/generate-excel`
- `GET /finance/documents/{financeDocument}/download-excel`

Existing compatibility routes remain for generate/download/download-pdf.

## Important Decisions

- Used the existing `finance_templates` table for finance HTML/CSS rendering because this codebase stores finance templates there. The older `document_templates` table is a separate dossier/document lookup table.
- Kept old finance document generation/download routes compatible while adding explicit PDF and Excel routes.
- Stored exports under `storage/app/public/finance/{quotes|invoices|receipts}/{number}/`.
- UI now shows generate actions first, then download actions once files exist.

## Build/Test Result

- `npm run build` passed. Vite still reports the existing large chunk warning.
- `php artisan archilbo:test-finance-export 1` passed for `FAC-2026-0001`, generating both PDF and XLSX.
- `php artisan storage:link` reported the link already exists.
- `php artisan test` failed only on `Tests\Feature\ExampleTest::test_the_application_returns_a_successful_response` because `/` returns `302` while the starter test expects `200`.

## How To Test

1. Open `/finance`.
2. Create or use a devis/facture with line items.
3. Click Generate PDF, then Download PDF.
4. Click Generate Excel, then Download Excel.
5. Optionally run `php artisan archilbo:test-finance-export {finance_document_id}`.

## Known Issues

- Starter `ExampleTest` should be updated to expect the app's authenticated redirect or replaced with a real application smoke test.
- Vite large chunk warning remains from the existing app bundle.

## Next Recommended Step

Add payment edit/delete UI and then add proper finance template editing so ARCHI LBO can tune the PDF layout without code changes.
---

# AI Work Report

## Date

2026-06-26

## Step Completed

Finance template schema hotfix

## What Was Changed

Removed the `is_active` filter from the finance document template query because the actual `finance_templates` table has `is_default` but no `is_active` column.

## Files Modified

- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```bash
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
php artisan route:list --path=finance/documents
npm run build
```

## Build/Test Result

All focused checks passed. Vite still reports the existing large chunk warning.

## Next Recommended Step

Reload `/finance` and confirm the finance page opens without the SQL `is_active` error.
---

# AI Work Report

## Date

2026-06-26

## Step Completed

Finance generated files reveal helper

## What Was Changed

Added a local-only Explorer reveal action for generated finance documents. When a PDF or Excel export exists, the finance table shows an `Afficher dans Explorer` action that opens the generated file location on the local Windows machine.

## Files Modified

- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `app/Http/Resources/FinanceDocumentResource.php`
- `resources/js/features/finance/components/FinanceDocumentActions.tsx`
- `resources/js/features/finance/types.ts`
- `routes/web.php`
- `docs/AI_WORK_REPORT.md`

## New Routes

- `POST /finance/documents/{financeDocument}/reveal-generated-files`

## Important Decisions

- The reveal action is only exposed in `APP_ENV=local`.
- The backend only opens files stored under Laravel's configured public storage disk.
- The route does not expose absolute paths to the frontend.
- On non-Windows or non-local environments, the route returns a clear error message instead of attempting to open Explorer.

## Commands Run

```bash
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
php -l app/Http/Resources/FinanceDocumentResource.php
php artisan route:list --path=finance/documents
npm run build
```

## Build/Test Result

Focused PHP syntax checks, route check, and frontend build passed. Vite still reports the existing large chunk warning.

## How To Test

1. Open `/finance` locally on Windows.
2. Generate PDF or Excel for a finance document.
3. Click `Afficher dans Explorer` on that document row.
4. Windows Explorer should open with the generated file selected.

## Next Recommended Step

Add finance template editing so PDF layout can be adjusted from the app.
---

# AI Work Report

## Date

2026-06-26

## Step Completed

Finance document show page fix

## What Was Changed

Added the missing Inertia page for `Finance/Documents/Show` so direct URLs like `/finance/documents/{id}` no longer fail with `Page not found: Finance/Documents/Show`.

## Files Created

- `resources/js/pages/Finance/Documents/Show.tsx`

## Files Modified

- `docs/AI_WORK_REPORT.md`

## Commands Run

```bash
php artisan route:list --path=finance/documents
npm run build
```

## Build/Test Result

Route check and frontend build passed. Vite still reports the existing large chunk warning.

## How To Test

Open `/finance/documents/2` or click `Voir` from `/finance`. The page should show document summary, totals, line items, generated files, and PDF/Excel/Explorer actions.

## Next Recommended Step

Add edit/payment actions from the show page if users need to work from the document detail screen instead of returning to the finance table.
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Step 38 - Editable Finance Template Editor

## What Was Built

Built a standalone finance template editor at `/finance/templates` for Devis, Facture, and Recu templates. The editor manages the existing `finance_templates` table used by PDF generation and keeps the older `document_templates` table untouched.

## Files Created

- `app/Http/Controllers/Finance/DocumentTemplateController.php`
- `app/Http/Requests/Finance/StoreDocumentTemplateRequest.php`
- `app/Http/Requests/Finance/UpdateDocumentTemplateRequest.php`
- `app/Http/Resources/DocumentTemplateResource.php`
- `app/Services/Finance/FinanceTemplatePlaceholderRegistry.php`
- `app/Services/Finance/DefaultFinanceTemplateFactory.php`
- `resources/js/pages/Finance/Templates/Index.tsx`
- `resources/js/features/finance/templates/TemplateList.tsx`
- `resources/js/features/finance/templates/TemplateEditorForm.tsx`
- `resources/js/features/finance/templates/TemplatePlaceholderPanel.tsx`
- `resources/js/features/finance/templates/TemplatePreviewPanel.tsx`
- `resources/js/features/finance/templates/TemplateToolbar.tsx`
- `resources/js/features/finance/templates/templateValidation.ts`
- `docs/STEP_38_FINANCE_TEMPLATE_EDITOR.md`

## Files Modified

- `app/Services/Finance/FinanceTemplateRenderer.php`
- `database/seeders/FinanceFoundationSeeder.php`
- `resources/js/features/finance/types.ts`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `routes/web.php`
- `docs/AI_WORK_REPORT.md`

## Database Changes

No migration changes. The editor uses the existing `finance_templates` schema.

## New Routes

- `GET /finance/templates`
- `POST /finance/templates`
- `GET /finance/templates/{documentTemplate}`
- `PUT /finance/templates/{documentTemplate}`
- `DELETE /finance/templates/{documentTemplate}`
- `POST /finance/templates/{documentTemplate}/duplicate`
- `PUT /finance/templates/{documentTemplate}/default`
- `PUT /finance/templates/reset/{type}`
- `GET /finance/templates/{documentTemplate}/preview`

## Important Decisions

- Used `FinanceTemplate` behind `DocumentTemplateController` because PDF export uses `finance_templates`; the old `document_templates` model is for required dossier documents.
- Kept the editor structured with textareas for HTML/CSS instead of a heavy WYSIWYG editor.
- Added request-level rejection for script tags and inline JavaScript attributes.
- Added local live preview and backend preview through the same `FinanceTemplateRenderer` path used by PDF generation.
- Updated `FinanceFoundationSeeder` to use `DefaultFinanceTemplateFactory` for future consistent defaults.

## Commands Run

```bash
php -l app/Http/Controllers/Finance/DocumentTemplateController.php
php -l app/Http/Requests/Finance/StoreDocumentTemplateRequest.php
php -l app/Http/Requests/Finance/UpdateDocumentTemplateRequest.php
php -l app/Http/Resources/DocumentTemplateResource.php
php -l app/Services/Finance/DefaultFinanceTemplateFactory.php
php -l app/Services/Finance/FinanceTemplatePlaceholderRegistry.php
php -l app/Services/Finance/FinanceTemplateRenderer.php
php -l routes/web.php
php artisan optimize:clear
composer dump-autoload
php artisan route:list --path=finance/templates
php artisan route:list --path=finance
npm run build
php artisan archilbo:test-finance-export 1
Get-ChildItem resources/js -Recurse -Include *.tsx,*.ts | Select-String -Pattern '`r`n|\r\n' -ErrorAction SilentlyContinue
```

## Build/Test Result

- PHP syntax checks passed.
- `composer dump-autoload` passed.
- `php artisan route:list --path=finance/templates` passed and showed 9 template routes.
- `php artisan route:list --path=finance` passed and showed 40 finance routes.
- `npm run build` passed. Vite still reports the existing large chunk warning.
- `php artisan optimize:clear` and `php artisan archilbo:test-finance-export 1` were blocked because MySQL on `127.0.0.1:3306` refused the connection.
- Newline artifact scan found an older unrelated literal marker in `resources/js/features/clients/drawers/ClientDrawer.tsx`; it was not changed in this step.

## How To Test

1. Start MySQL.
2. Open `/finance/templates`.
3. Select a Devis template.
4. Edit footer/body/CSS.
5. Save.
6. Use backend preview.
7. Duplicate the template.
8. Set the duplicate as default.
9. Generate a PDF from an existing Devis/Facture/Recu.
10. Confirm the selected default template is used.
11. Try saving `<script>` or `onclick=` and confirm validation blocks it.

## Known Issues

- MySQL was offline during this run, so DB-backed manual testing and PDF export smoke test could not complete.
- Logo upload is text-only for now.
- Full template version history is not included.

## Next Recommended Step

Start MySQL and manually validate `/finance/templates`, then generate PDFs for a Devis and Facture to confirm the selected defaults are used.
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Finance templates tab runtime hotfix

## What Was Changed

Fixed `/finance` crashing with `ReferenceError: defaultTemplates is not defined` by adding the missing frontend prop type/destructuring and backend props for default finance templates.

## Files Modified

- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```bash
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
npm run build
```

## Build/Test Result

Both checks passed. Vite still reports the existing large chunk warning.

## Next Recommended Step

Reload `/finance` and confirm the Templates tab renders the default templates summary and editor link.
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Finance template editor compact IDE polish

## What Was Changed

Improved the finance template editor UI to be more compact and coding-friendly. The editor now has an IDE-style code area with line numbers, dark code surface, Tab indentation, Ctrl+S save, snippets, quick placeholder insert, and compact sticky side panels.

## Files Created

- `resources/js/features/finance/templates/TemplateCodeEditor.tsx`

## Files Modified

- `resources/js/features/finance/templates/TemplateEditorForm.tsx`
- `resources/js/features/finance/templates/TemplateList.tsx`
- `resources/js/features/finance/templates/TemplatePlaceholderPanel.tsx`
- `resources/js/features/finance/templates/TemplatePreviewPanel.tsx`
- `resources/js/pages/Finance/Templates/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```bash
npm run build
git diff --check
```

## Build/Test Result

`npm run build` passed. Vite still reports the existing large chunk warning.

## Next Recommended Step

Open `/finance/templates` and test editing HTML/CSS with Tab, Ctrl+S, snippets, quick placeholders, and preview.---

# AI Work Report

## Date

2026-06-27

## Step Completed

Finance template editor upgraded with CodeMirror library

## What Was Built

Replaced the handmade template textarea editor with a CodeMirror-powered editor for finance template HTML and CSS editing.

## Files Modified

- `package.json`
- `package-lock.json`
- `resources/js/features/finance/templates/TemplateCodeEditor.tsx`
- `docs/AI_WORK_REPORT.md`

## Frontend Work

- Added CodeMirror React editor integration.
- Added HTML and CSS language support.
- Added dark editor theme, line numbers, fold gutter, active-line highlighting, bracket matching, line wrapping, and Tab indentation.
- Added placeholder autocomplete for ARCHI LBO finance template variables.
- Kept snippets, quick placeholder insertion, and Ctrl+S save behavior.

## Commands Run

```bash
npm install @uiw/react-codemirror @codemirror/lang-html @codemirror/lang-css @codemirror/autocomplete @codemirror/commands @codemirror/view @codemirror/theme-one-dark
npm run build
```

## Build/Test Result

`npm run build` passed. Vite still reports the existing large chunk warning.

## Known Issues

No new known issue. The unrelated local `.gitignore` modification was left untouched.

## Next Recommended Step

Open `/finance/templates`, edit both HTML and CSS templates, test placeholder autocomplete inside `{{...}}`, then save and generate a Devis/Facture preview.
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Finance template editor compact UI pass

## What Was Changed

Reduced spacing and simplified the finance template editor into a cleaner workbench-style layout.

## Files Modified

- `resources/js/features/finance/templates/TemplateEditorForm.tsx`
- `resources/js/features/finance/templates/TemplateCodeEditor.tsx`
- `resources/js/features/finance/templates/TemplateList.tsx`
- `resources/js/features/finance/templates/TemplatePlaceholderPanel.tsx`
- `resources/js/features/finance/templates/TemplatePreviewPanel.tsx`
- `resources/js/pages/Finance/Templates/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Frontend Work

- Reduced page grid gaps and narrowed the template and preview side rails.
- Compressed the template list cards and action controls.
- Reworked the editor header, tabs, and metadata area with smaller spacing.
- Combined CodeMirror snippets and common placeholders into one slim insert toolbar.
- Removed the extra bottom placeholder bar from the editor.
- Reduced editor and preview heights for a cleaner first-screen view.
- Made placeholder and preview cards more compact while keeping search, copy, and exact preview actions.

## Commands Run

```bash
npm run build
git diff --check
```

## Build/Test Result

`npm run build` passed. Vite still reports the existing large chunk warning.

## Known Issues

No new known issue. The unrelated local `.gitignore` modification was left untouched.

## Next Recommended Step

Open `/finance/templates` and check the compact editor at desktop and laptop widths, then tune exact side rail widths if needed after visual review.

---

## Step 45 - Template Editor UI Polish

Replaced TemplateEditorForm with a stable compact editor using native controls, tabs, warnings and placeholder insertion.

Files:
- resources/js/features/finance/templates/TemplateEditorForm.tsx
- docs/STEP_45_TEMPLATE_EDITOR_UI_POLISH.md

---

## Step 46 - Finance Export QA

Added an artisan QA command to generate and verify finance PDF/XLSX exports.

Files:
- app/Console/Commands/FinanceExportQaCommand.php
- docs/STEP_46_FINANCE_EXPORT_QA.md

---

## Step 46 - Finance Export QA

Added an artisan QA command to generate and verify finance PDF/XLSX exports.

Files:
- app/Console/Commands/FinanceExportQaCommand.php
- docs/STEP_46_FINANCE_EXPORT_QA.md
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Step 49-A - Finance UI lock awareness backend payload and discovery

## What Was Built

Verified the finance document lock payload used by the UI and refreshed the React discovery report for the next UI lock-awareness patch.

## Files Created

- `app/Services/Finance/FinanceDocumentLockStatePresenter.php`
- `app/Console/Commands/FinanceUiLockPayloadQaCommand.php`
- `app/Console/Commands/FinanceUiLockAwarenessDiscoveryCommand.php`
- `docs/finance-ui-lock-awareness-discovery.md`

## Files Modified

- `app/Http/Resources/FinanceDocumentResource.php`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Confirmed `FinanceDocumentResource` exposes `numberLocked`, `numberLockedAt`, and `lock`.
- Confirmed `lock` includes `isLocked`, `lockedAt`, `lockedAtFormatted`, `message`, `blockedFields`, `canEditNumberFields`, `canRegenerateExports`, `canGeneratePdf`, and `canGenerateExcel`.
- Confirmed locked documents expose UI-safe rules without changing visible document numbering away from `$document->number`.

## UI Discovery

Top React candidates for Step 49-B:

- `resources/js/pages/Finance/Index.tsx`
- `resources/js/features/finance/types.ts`
- `resources/js/pages/Finance/Documents/Show.tsx`
- `resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx`
- `resources/js/features/finance/drawers/FinanceDocumentDrawer.tsx`
- `resources/js/features/finance/components/FinanceDocumentActions.tsx`
- `resources/js/features/finance/components/FinanceDocumentPreview.tsx`

## Commands Run

```powershell
php artisan optimize:clear
php artisan archilbo:finance-numbering-qa
php artisan archilbo:finance-export-numbering-qa
php artisan archilbo:finance-real-export-numbering-integration-qa
php artisan archilbo:finance-export-qa
php artisan archilbo:finance-document-lock-guard-qa
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-ui-lock-awareness-discovery
```

## Build/Test Result

All listed finance numbering, export, lock guard, UI payload, and UI discovery commands passed.

## Known Issues

PowerShell still displays mojibake for some legacy command symbols. Command results are pass/fail readable and successful.

The working tree contains many existing uncommitted Step 47/48/49 files and unrelated local changes. No React UI lock-awareness rewrite was done in Step 49-A.

## Next Recommended Step

Step 49-B: patch the discovered React types and finance document UI so locked exported documents show a locked badge/message, disable number/type/issue_date editing, and keep PDF/Excel generate/download actions active.
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Step 49-B - Finance document UI lock awareness

## What Was Built

Updated the finance document UI so locked exported documents clearly show lock state and prevent number-critical edit attempts.

## Files Created

- `resources/js/features/finance/components/FinanceDocumentLockNotice.tsx`

## Files Modified

- `resources/js/features/finance/types.ts`
- `resources/js/features/finance/components/FinanceDateFields.tsx`
- `resources/js/features/finance/components/FinanceDocumentActions.tsx`
- `resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `resources/js/pages/Finance/Documents/Show.tsx`
- `docs/AI_WORK_REPORT.md`

## UI Behavior Added

- Locked documents show a Locked badge in lists, recent cards, show page, and edit drawer.
- Locked documents show the backend lock message and locked timestamp where available.
- The edit drawer disables Type and Date emission for locked documents.
- The edit drawer omits `type` and `issue_date` from locked edit submissions.
- PDF/Excel generate and regenerate actions remain active.
- PDF/Excel download actions remain active.
- Notes, terms, payments, and other safe fields remain editable where the existing UI allows them.

## Commands Run

```powershell
php artisan optimize:clear
php artisan archilbo:finance-numbering-qa
php artisan archilbo:finance-export-numbering-qa
php artisan archilbo:finance-real-export-numbering-integration-qa
php artisan archilbo:finance-export-qa
php artisan archilbo:finance-document-lock-guard-qa
```

## Build/Test Result

Initial backend QA passed before UI patch. Final frontend/backend QA is listed in the current assistant response.

## Next Recommended Step

Open `/finance`, edit a locked invoice, confirm Type and Date emission are disabled, then regenerate/download PDF and Excel.
## Step 49-B Final QA Result

Additional commands run after the UI patch:

```powershell
php -l STEP49_B_RUNNER.php
git diff --check
npm run build
php artisan optimize:clear
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-export-qa
php artisan archilbo:finance-document-lock-guard-qa
php artisan archilbo:finance-ui-lock-awareness-discovery
```

Results:

- `php -l STEP49_B_RUNNER.php` passed.
- `git diff --check` passed after normalizing `FinanceDocumentResource.php` EOF.
- `npm run build` passed. Vite still reports the existing large chunk warning.
- `finance-ui-lock-payload-qa` passed.
- `finance-export-qa` passed.
- `finance-document-lock-guard-qa` passed.
- UI discovery report refreshed at `docs/finance-ui-lock-awareness-discovery.md`.
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Contract FORFAIT calculation mode

## What Was Built

Added a contract calculation mode for fixed client prices. Existing percentage contracts keep the 0.5% / 2% calculation. New FORFAIT contracts accept only a final TTC amount and automatically derive HT and TVA.

## Files Created

- `database/migrations/2026_06_27_160000_add_forfait_mode_to_contracts_table.php`
- `app/Console/Commands/ContractForfaitCalculationQaCommand.php`

## Files Modified

- `config/archilbo_templates.php`
- `app/Models/Contract.php`
- `app/Http/Requests/StoreContractRequest.php`
- `app/Http/Requests/UpdateContractRequest.php`
- `app/Http/Resources/ContractResource.php`
- `app/Http/Controllers/ContractController.php`
- `app/Services/ContractDocumentGenerator.php`
- `resources/js/features/contracts/types.ts`
- `resources/js/features/contracts/drawers/ContractDrawer.tsx`
- `resources/js/pages/Contracts/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Behavior

- Percentage mode: HT = surface x price/m2 x selected rate / 100, TVA = HT x TVA rate, TTC = HT + TVA.
- FORFAIT mode: user enters TTC only, HT = TTC / 1.20, TVA = TTC - HT.
- Contract DOCX generation now uses stored HT/TVA/TTC values, so forfait amounts are preserved in generated templates.
- The contract form now sends `fee_rate_percent`, fixing the previous selector-submit mismatch.

## Next Recommended Step

Open `/contracts`, create a FORFAIT contract with TTC 12000, confirm HT is 10000 and TVA is 2000, then generate/download the DOCX.

## Contract FORFAIT Final QA Result

Commands run after implementation:

```powershell
php -l app/Http/Controllers/ContractController.php
php -l app/Models/Contract.php
php -l app/Http/Requests/StoreContractRequest.php
php -l app/Http/Requests/UpdateContractRequest.php
php -l app/Http/Resources/ContractResource.php
php -l app/Services/ContractDocumentGenerator.php
php -l app/Console/Commands/ContractForfaitCalculationQaCommand.php
php -l database/migrations/2026_06_27_160000_add_forfait_mode_to_contracts_table.php
php -l CONTRACT_FORFAIT_RUNNER.php
php artisan migrate
php artisan archilbo:contract-forfait-calculation-qa 12000
npm run build
git diff --check
php artisan archilbo:test-contract-generation 4
```

Results:

- PHP lint passed for all touched PHP files.
- Migration ran successfully.
- FORFAIT QA passed: TTC 12000 gives HT 10000 and TVA 2000.
- `npm run build` passed with the existing large chunk warning.
- `git diff --check` passed.
- Existing contract generation QA passed for `CTR-2026-0001`, including DOCX and PDF export.
---

# AI Work Report

## Date

2026-06-29

## Step Completed

Step 50-C verification - Finance sidebar active state and lock badge UI

## What Was Checked

- Verified finance submenu structure in `navigation.ts`.
- Verified desktop sidebar parent expansion and child active behavior.
- Verified mobile navigation still highlights Finance across finance pages.
- Verified finance overview does not render duplicate locked badges.
- Verified `FinanceDocumentLockNotice.tsx` exports the lock helpers and badge/notice components used by finance pages.

## Files Modified

- `resources/js/lib/appRoutes.ts`
- `resources/js/components/layout/AppSidebar.tsx`
- `resources/js/components/layout/AppMobileNav.tsx`
- `resources/js/locales/en.ts`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Behavior Fixed

- `isActivePath` is now query-aware.
- `/finance` is treated as the exact finance overview route.
- `/finance?tab=payments` activates only the Payments finance child.
- `/finance/documents`, `/finance/templates`, and `/finance/settings` activate only their matching finance child.
- The Finance parent expands but is not highlighted as the active item.
- Mobile navigation still treats the whole `/finance` area as Finance.
- Finance document overview cards now render only the shared locked badge and no old duplicate inline badge.

## Commands Run

```powershell
npm run build
php artisan optimize:clear
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-export-qa
php artisan archilbo:finance-document-lock-guard-qa
git diff --check -- resources/js/lib/appRoutes.ts resources/js/components/layout/AppSidebar.tsx resources/js/components/layout/AppMobileNav.tsx resources/js/locales/en.ts
```

## Build/Test Result

- `npm run build` passed. Vite still reports the existing large chunk warning.
- `php artisan optimize:clear` passed.
---

# AI Work Report

## Date

2026-07-01

## Step Completed

Compact task filters and 4-column board

## What Was Fixed

- Replaced always-visible scope/module chips with compact dropdown controls.
- Kept search, scope, module, view switcher, and reset in one tight command row.
- Reduced vertical space used by filters.
- Changed the task board desktop layout to 4 columns instead of 7 columns.
- Preserved responsive behavior on smaller screens.

## Files Modified

- `resources/js/features/tasks/components/TaskFilters.tsx`
- `resources/js/features/tasks/components/TaskBoard.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan archilbo:operations-foundation-qa
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed with the existing large bundle warning.
- `archilbo:operations-foundation-qa` passed.
- `php artisan optimize:clear` passed.
- `archilbo:finance-ui-lock-payload-qa` passed.
- `archilbo:finance-export-qa` passed.
- `archilbo:finance-document-lock-guard-qa` passed.
- `git diff --check` passed with only the existing CRLF notice for `resources/js/locales/en.ts`.

## Known Issues

- The working tree still contains existing uncommitted Step 49/50 files, backup files, and finance/payment changes. They were not reverted or cleaned.
- `docs/ARCHITECTURE.md` was requested by the general project rules but is not present in this repo.

## Next Recommended Step

Open `/finance`, `/finance?tab=payments`, `/finance/documents`, `/finance/templates`, and `/finance/settings` in the browser and confirm only one finance submenu child is highlighted at a time.
---

# AI Work Report

## Date

2026-06-29

## Step Completed

Step 51-A - Workflow grouping audit and implementation plan

## What Was Built

Created the implementation plan for the next ARCHI LBO workflow improvement:

```txt
Client -> Projects/Dossiers -> Documents / Contracts / Devis / Factures / Paiements / Archive
```

The plan also covers:

- Grouping projects by province and commune/city.
- Showing project owner/client inside grouped views.
- Grouping business documents by location, client, project, and type.
- Grouping devis, factures, receipts, and payments by month with finance statistics.

## Files Created

- `docs/WORKFLOW_GROUPING_PLAN.md`

## Files Modified

- `docs/AI_WORK_REPORT.md`

## Backend Audit

- `Client` already has `dossiers`, `financeDocuments`, and `payments`.
- `Dossier` already has `client`, `documents`, `contract`, `authorization`, `financeDocuments`, `payments`, and `archiveRecord`.
- `Dossier` already has location fields: `province`, `commune`, and `project_address`.
- `FinanceDocument` is the current active devis/facture/recu model and links to client/dossier/payments.
- `Payment` links to finance document, client, dossier, and optional receipt document.
- `FinanceRecord` still exists as legacy finance workflow and should not be the base for new monthly grouping.

## Frontend Audit

- `Clients/Show.tsx` currently shows client details and linked projects, but not a same-page selected project workspace.
- `Dossiers/Index.tsx` currently shows a flat dossier table with commune column and workflow filter.
- `Documents/Index.tsx` currently shows a flat document table with status filter.
- `Finance/Documents/Index.tsx` is the active finance workspace and should receive the monthly summary later.

## Important Decisions

- Build backend read services before deeper UI work.
- Keep current CRUD flows and drawers intact.
- Use `finance_documents` and `payments` for monthly finance grouping.
- Treat `finance_records` routes as legacy.
- Do not build a raw file explorer in this step.
- Add grouping in phases to avoid breaking the finance work that was just stabilized.

## Next Recommended Step

Step 51-B: implement read services and a QA command:

```txt
ClientWorkspaceService
DossierLocationGroupingService
DocumentGroupingService
FinanceMonthlySummaryService
archilbo:workflow-grouping-qa
```

## Commands Run

```powershell
npm run build
php artisan optimize:clear
php artisan route:list --path=clients
php artisan route:list --path=dossiers
php artisan route:list --path=documents
php artisan route:list --path=finance
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-document-lock-guard-qa
php artisan archilbo:finance-export-qa
git diff --check -- docs/WORKFLOW_GROUPING_PLAN.md docs/AI_WORK_REPORT.md
```

## Build/Test Result

- `npm run build` passed. Vite still reports the existing large chunk warning.
- `php artisan optimize:clear` passed.
- Client, dossier, document, and finance route lists loaded successfully.
- `archilbo:finance-ui-lock-payload-qa` passed.
- `archilbo:finance-document-lock-guard-qa` passed.
- `archilbo:finance-export-qa` passed.
- `git diff --check` passed for the docs touched in this step.

## Known Issues

- New docs under `/docs` are ignored by `.gitignore`, so `docs/WORKFLOW_GROUPING_PLAN.md` exists locally but does not appear in normal `git status` unless forced.
- The working tree still contains many existing uncommitted Step 49/50 files and backup files. They were not reverted or cleaned.
---

# AI Work Report

## Date

2026-06-29

## Step Completed

Step 51-B - Workflow grouping backend read services

## What Was Built

Added backend read services for the new grouped workflow direction:

```txt
Client -> Projects/Dossiers -> Documents / Devis / Factures / Paiements
Province -> Commune -> Projects -> Owner
Documents -> Province -> Commune -> Client -> Project -> Type
Finance -> Month -> Devis / Factures / Recus / Paiements
```

## Files Created

- `app/Services/Clients/ClientWorkspaceService.php`
- `app/Services/Dossiers/DossierLocationGroupingService.php`
- `app/Services/Documents/DocumentGroupingService.php`
- `app/Services/Finance/FinanceMonthlySummaryService.php`
- `app/Console/Commands/WorkflowGroupingQaCommand.php`

## Files Modified

- `docs/WORKFLOW_GROUPING_PLAN.md`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- `ClientWorkspaceService` returns compact client workspace data with projects, selected project, documents, contract, authorization, finance documents, payments, and archive summary.
- `DossierLocationGroupingService` groups projects by province and commune, including owner/client and finance/document stats.
- `DocumentGroupingService` groups dossier documents by province, commune, client, project, and document type.
- `FinanceMonthlySummaryService` groups finance documents and payments by month and calculates monthly totals.
- `WorkflowGroupingQaCommand` validates all grouping services against raw database counts and sums.

## Commands Run

```powershell
php -l app\Services\Clients\ClientWorkspaceService.php
php -l app\Services\Dossiers\DossierLocationGroupingService.php
php -l app\Services\Documents\DocumentGroupingService.php
php -l app\Services\Finance\FinanceMonthlySummaryService.php
php -l app\Console\Commands\WorkflowGroupingQaCommand.php
php artisan optimize:clear
php artisan list archilbo
php artisan archilbo:workflow-grouping-qa
npm run build
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-document-lock-guard-qa
php artisan archilbo:finance-export-qa
```

## Build/Test Result

- PHP lint passed for all new service and command files.
- `php artisan optimize:clear` passed.
- New command `archilbo:workflow-grouping-qa` is discovered by Artisan.
- `archilbo:workflow-grouping-qa` passed:
  - Client workspace checked for `Mohamed Ouknin`.
  - Dossier groups checked for 3 projects.
  - Document groups checked for 2 documents.
  - Finance monthly groups checked for 1 month, 5,720.00 document TTC, 2,660.00 payments.
- `npm run build` passed with the existing large chunk warning.
- Finance lock payload QA passed.
- Finance lock guard QA passed.
- Finance export QA passed.

## Known Issues

- `docs/WORKFLOW_GROUPING_PLAN.md` is still ignored by `.gitignore` because `/docs` is ignored for new files.
- No UI has been wired to the new services yet.
- The old `finance_records` workflow still exists beside the newer `finance_documents` workflow.

## Next Recommended Step

Step 51-C: wire `ClientWorkspaceService` into `ClientController@show` and upgrade `Clients/Show.tsx` so selecting a client can show their projects and a selected project workspace with documents, devis, factures, payments, and summaries on the same page.
---

# AI Work Report

## Date

2026-06-29

## Step Completed

Step 51-C - Client workspace UI

## What Was Built

The client show page now works as a client-centered workspace:

```txt
Client
-> Projects
-> Selected project
-> Documents / Devis / Factures / Paiements / Autorisation / Archive
```

## Files Created

- `resources/js/features/clients/components/ClientProjectsPanel.tsx`
- `resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx`

## Files Modified

- `app/Http/Controllers/ClientController.php`
- `resources/js/features/clients/types.ts`
- `resources/js/pages/Clients/Show.tsx`
- `docs/WORKFLOW_GROUPING_PLAN.md`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- `ClientController@show` now receives `Request` and `ClientWorkspaceService`.
- It accepts `?dossier_id=` as the selected project id.
- It passes a new `workspace` Inertia prop while keeping the old `client` and `dossiers` props.

## Frontend Work

- Added typed client workspace payloads.
- Added project selector panel with document, invoice, and paid totals.
- Added selected project workspace with:
  - project summary
  - document list
  - finance documents list
  - payment list
  - authorization summary
  - archive summary
  - quick links to dossier and finance
- Replaced the old linked-project-only client show layout with a two-column workspace.

## Commands Run

```powershell
php -l app\Http\Controllers\ClientController.php
npm run build
php artisan archilbo:workflow-grouping-qa
php artisan optimize:clear
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-document-lock-guard-qa
php artisan archilbo:finance-export-qa
```

## Build/Test Result

- PHP lint passed for `ClientController.php`.
- `npm run build` passed with the existing large chunk warning.
- `archilbo:workflow-grouping-qa` passed.
- `php artisan optimize:clear` passed.
- Finance UI lock payload QA passed.
- Finance lock guard QA passed.
- Finance export QA passed.

## Known Issues

- `docs/WORKFLOW_GROUPING_PLAN.md` is ignored by `.gitignore` because `/docs` is ignored for new files.
- The client workspace now links to `/finance/documents?dossier_id=...`, but the finance documents page does not yet filter by `dossier_id`. That should be handled in the finance grouping/monthly step.

## Next Recommended Step

Step 51-D: add the grouped dossier location explorer to `Dossiers/Index.tsx`, using `DossierLocationGroupingService` so projects can be viewed by province, commune/city, and owner/client.
---

# AI Work Report

## Date

2026-06-29

## Step Completed

Step 52-A - Intermediaries management module

## What Was Built

Added a real Intermediaries management screen so ARCHI LBO can create and maintain intermediaries, agencies, partners, and apporteurs before selecting them on client records.

## Files Created

- `app/Http/Controllers/IntermediaryController.php`
- `app/Http/Requests/StoreIntermediaryRequest.php`
- `app/Http/Requests/UpdateIntermediaryRequest.php`
- `app/Http/Resources/IntermediaryResource.php`
- `resources/js/features/intermediaries/types.ts`
- `resources/js/features/intermediaries/drawers/IntermediaryDrawer.tsx`
- `resources/js/pages/Intermediaries/Index.tsx`

## Files Modified

- `routes/web.php`
- `resources/js/lib/appRoutes.ts`
- `resources/js/locales/en.ts`
- `resources/js/features/clients/drawers/ClientDrawer.tsx`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Added CRUD routes for `/intermediaries`.
- Added `IntermediaryController@index/store/update/destroy`.
- Added form requests for intermediary create/update validation.
- Added `IntermediaryResource` with code, name, type, contact, active state, client count, and timestamps.
- New intermediary codes are generated as `INT-{year}-{number}`.

## Frontend Work

- Added `/intermediaries` page with KPI cards and searchable table.
- Added create/edit drawer for intermediary records.
- Added colored table action buttons for edit/delete.
- Added active/inactive status badges.
- Added sidebar/app route entry for Intermediaries under the main group.
- Added a client drawer shortcut to manage intermediaries.
- Existing client create/edit can still select an active intermediary from the existing select.

## Commands Run

```powershell
php -l app\Http\Controllers\IntermediaryController.php
php -l app\Http\Requests\StoreIntermediaryRequest.php
php -l app\Http\Requests\UpdateIntermediaryRequest.php
php -l app\Http\Resources\IntermediaryResource.php
php artisan route:list --path=intermediaries
npm run build
php artisan optimize:clear
php artisan archilbo:workflow-grouping-qa
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-document-lock-guard-qa
php artisan archilbo:finance-export-qa
git diff --check -- app/Http/Controllers/IntermediaryController.php app/Http/Requests/StoreIntermediaryRequest.php app/Http/Requests/UpdateIntermediaryRequest.php app/Http/Resources/IntermediaryResource.php routes/web.php resources/js/features/intermediaries/types.ts resources/js/features/intermediaries/drawers/IntermediaryDrawer.tsx resources/js/pages/Intermediaries/Index.tsx resources/js/lib/appRoutes.ts resources/js/locales/en.ts resources/js/features/clients/drawers/ClientDrawer.tsx
```

## Build/Test Result

- PHP lint passed for all new backend files.
- Intermediary routes were registered successfully.
- `npm run build` passed with the existing large chunk warning.
- `php artisan optimize:clear` passed.
- Workflow grouping QA passed.
- Finance UI lock payload QA passed.
- Finance lock guard QA passed.
- Finance export QA passed.
- `git diff --check` passed with CRLF warnings only.

## Known Issues

- Intermediaries use the existing database fields: `code`, `name`, `type`, `phone`, `email`, `notes`, and `is_active`. No address field was added in this slice.
- Client drawer now links to `/intermediaries`; creating an intermediary from inside the same drawer can be added later as a nested quick-create flow.

## Next Recommended Step

Step 52-C: ensure FORFAIT contract generation uses the existing FORFAIT DOCX template from the contract templates folder.
---

# AI Work Report

## Date

2026-06-29

## Step Completed

Step 52-C - FORFAIT contract template selection

## What Was Built

FORFAIT contract generation now uses the dedicated ARCHI LBO forfait DOCX template instead of reusing the percentage-based 0.5% or 2% contract templates.

## Files Created

- None

## Files Modified

- `config/archilbo_templates.php`
- `app/Services/ContractDocumentGenerator.php`
- `app/Console/Commands/ContractForfaitCalculationQaCommand.php`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Added the `forfait` contract template path to the private template configuration.
- Updated `ContractDocumentGenerator` so contracts with `calculation_mode = forfait` select `CONTRAT_DARCHITECT _FORFAITAIRES.docx`.
- Kept percentage contracts using the existing `0_5` and `2` templates.
- Extended the forfait QA command to verify both HT/TVA calculation from TTC and the selected FORFAIT template path.

## Frontend Work

- None in this step. The existing FORFAIT UI now benefits from the backend template routing.

## Commands Run

```powershell
php -l config\archilbo_templates.php
php -l app\Services\ContractDocumentGenerator.php
php -l app\Console\Commands\ContractForfaitCalculationQaCommand.php
php artisan optimize:clear
php artisan archilbo:contract-forfait-calculation-qa 12000
php artisan archilbo:test-contract-generation 4
npm run build
git diff --check -- config/archilbo_templates.php app/Services/ContractDocumentGenerator.php app/Console/Commands/ContractForfaitCalculationQaCommand.php docs/AI_WORK_REPORT.md
```

## Build/Test Result

- PHP lint passed for all modified PHP files.
- Laravel cache was cleared.
- FORFAIT calculation QA passed and confirmed this template:
  `storage/app/private/archi-templates/contracts/CONTRAT_DARCHITECT _FORFAITAIRES.docx`
- Existing contract generation smoke test passed for contract `CTR-2026-0001`.
- `npm run build` passed with the existing large chunk warning.
- Focused `git diff --check` passed.

## Known Issues

- No issue found in this slice.

## Next Recommended Step

Step 52-D: add receipt/recu printing and PDF-save flow after payment creation, with a confirmation modal asking whether to print immediately.
---

# AI Work Report

## Date

2026-06-29

## Step Completed

Step 52-D - Payment receipt quick print/save flow

## What Was Built

After creating a payment, the UI now receives the generated receipt payload and shows a confirmation panel with quick actions to open/print the receipt, generate the receipt PDF, download the PDF when available, or generate/download Excel.

## Files Created

- None

## Files Modified

- `app/Http/Middleware/HandleInertiaRequests.php`
- `app/Http/Controllers/Finance/PaymentController.php`
- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `app/Http/Resources/PaymentResource.php`
- `resources/js/features/finance/drawers/PaymentDrawer.tsx`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Added `flash.receipt` to Inertia shared props.
- Payment creation now flashes the new receipt number and secure finance document action URLs.
- Payment resources now expose receipt show, generate PDF, generate Excel, PDF download, Excel download, and default download URLs.
- Finance documents index now eager-loads `receiptDocument` for payments so the payments table can reliably show receipt actions.

## Frontend Work

- Payment drawer now preserves page state after payment creation.
- Added receipt-created modal after successful payment creation.
- Added actions for opening/printing the receipt, generating PDF, downloading PDF, and handling Excel.

## Commands Run

```powershell
php -l app\Http\Middleware\HandleInertiaRequests.php
php -l app\Http\Controllers\Finance\PaymentController.php
php -l app\Http\Resources\PaymentResource.php
php -l app\Http\Controllers\Finance\FinanceDocumentController.php
npm run build
php artisan optimize:clear
php artisan archilbo:finance-payment-receipt-payload-qa
php artisan archilbo:finance-payment-receipt-export-qa
php artisan archilbo:finance-payment-ledger-receipt-qa
```

## Build/Test Result

- PHP lint passed for all modified PHP files.
- `npm run build` passed with the existing large chunk warning.
- Laravel cache was cleared.
- Finance payment receipt payload QA passed.
- Finance payment receipt export QA passed.
- Finance payment ledger + receipt QA passed.

## Known Issues

- The receipt PDF download button is only available after a PDF has been generated. The modal includes a generate PDF action first.
- The existing finance document download routes still use the current project storage disk behavior; no storage architecture change was made in this focused UI slice.

## Next Recommended Step

Step 52-E: build the client/dossier workflow stepper foundation for the six ARCHI LBO operational steps, starting with backend config/enums and readonly progress evaluation before adding editable UI controls.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Step 52-E - Client dossier workflow stepper foundation

## What Was Built

Added a read-only six-step ARCHI LBO workflow evaluator for each selected client project/dossier. The client workspace now shows progress across documents, contract, cahier de chantier, Rokhas, bureau d'etude, and permis d'habiter.

## Files Created

- `config/archilbo_workflow.php`
- `app/Enums/DossierWorkflowStepStatus.php`
- `app/Services/Dossiers/DossierWorkflowStepperService.php`
- `resources/js/features/clients/components/ClientProjectWorkflowStepper.tsx`

## Files Modified

- `app/Services/Clients/ClientWorkspaceService.php`
- `resources/js/features/clients/types.ts`
- `resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Added configurable workflow step definitions and French labels.
- Added workflow step statuses through `DossierWorkflowStepStatus`.
- Added `DossierWorkflowStepperService` to evaluate dossier readiness from existing documents, contract, and authorization data.
- Wired workflow progress into the selected project payload from `ClientWorkspaceService`.
- Kept the evaluator read-only so it does not overwrite dossier status or user decisions.

## Frontend Work

- Added TypeScript types for workflow progress, steps, and requirements.
- Added `ClientProjectWorkflowStepper` to show global percent, completed step count, each step status, and missing requirements.
- Rendered the stepper inside the selected client project workspace.

## Commands Run

```powershell
php -l config\archilbo_workflow.php
php -l app\Enums\DossierWorkflowStepStatus.php
php -l app\Services\Dossiers\DossierWorkflowStepperService.php
php -l app\Services\Clients\ClientWorkspaceService.php
npm run build
php artisan optimize:clear
php artisan tinker --execute "...DossierWorkflowStepperService..."
```

## Build/Test Result

- PHP lint passed for all new/modified PHP files.
- `npm run build` passed with the existing large chunk warning.
- Laravel cache was cleared.
- Runtime smoke test passed against the first dossier and returned workflow progress.

## Known Issues

- This is read-only progress evaluation. It does not yet create editable workflow records or manual overrides.
- Cahier de chantier, Rokhas, bureau d'etude, and permis d'habiter are inferred from existing document names/statuses until dedicated tables/forms are added.

## Next Recommended Step

Step 52-F: add editable workflow controls/drawers so staff can mark each requirement done, attach related files, and keep history instead of relying only on inferred document names.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Step 52-F - Editable dossier workflow requirements

## What Was Built

The six-step client/project workflow is now editable. Staff can manually mark each workflow requirement as done or not done from the client project workspace, while the backend still keeps automatic inference from existing documents, contracts, and authorizations.

## Files Created

- `database/migrations/2026_06_30_090000_create_dossier_workflow_requirements_table.php`
- `app/Models/DossierWorkflowRequirement.php`
- `app/Http/Requests/UpdateDossierWorkflowRequirementRequest.php`
- `app/Http/Controllers/DossierWorkflowRequirementController.php`
- `app/Services/Dossiers/DossierWorkflowRequirementService.php`

## Files Modified

- `app/Models/Dossier.php`
- `app/Services/Clients/ClientWorkspaceService.php`
- `app/Services/Dossiers/DossierWorkflowStepperService.php`
- `routes/web.php`
- `resources/js/features/clients/types.ts`
- `resources/js/features/clients/components/ClientProjectWorkflowStepper.tsx`
- `resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx`
- `docs/AI_WORK_REPORT.md`

## Database Changes

- Added `dossier_workflow_requirements`.
- One unique manual state per dossier, step key, and requirement key.
- Stores done state, checked timestamp, user, and notes placeholder.

## Backend Work

- Added update route: `PUT /dossiers/{dossier}/workflow-requirements`.
- Added form request validation.
- Added workflow requirement service to validate configured step/requirement keys and upsert manual state.
- Updated workflow evaluator so manual states override inferred states.
- Added `workflowRequirements` relation to `Dossier`.

## Frontend Work

- Added manual marker state to workflow requirement types.
- Added compact action buttons for each workflow requirement in the client project stepper.
- Buttons toggle requirements through the new same-page route with Inertia.

## Commands Run

```powershell
php -l database\migrations\2026_06_30_090000_create_dossier_workflow_requirements_table.php
php -l app\Models\DossierWorkflowRequirement.php
php -l app\Http\Requests\UpdateDossierWorkflowRequirementRequest.php
php -l app\Services\Dossiers\DossierWorkflowRequirementService.php
php -l app\Http\Controllers\DossierWorkflowRequirementController.php
php artisan migrate
npm run build
php artisan tinker --execute "...DossierWorkflowRequirementService..."
php artisan optimize:clear
php artisan route:list --path=workflow-requirements
```

## Build/Test Result

- PHP lint passed for all new backend files.
- Migration ran successfully.
- `npm run build` passed with the existing large chunk warning.
- Runtime smoke test marked the first dossier CIN requirement and the evaluator returned `1/3`.
- Workflow route is registered.

## Known Issues

- Notes are supported in the backend but the compact UI does not yet expose a notes drawer.
- There is no workflow history table yet; this slice stores current manual state only.

## Next Recommended Step

Step 52-G: add workflow requirement notes/history and optional file attachment shortcuts so each marked requirement can explain what was done and link to the supporting document.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Step 52-G - Workflow requirement notes and history

## What Was Built

Manual workflow requirement changes now keep a history trail and can carry a short note. The client project stepper displays manual notes, checked date, and checked user metadata when available.

## Files Created

- `database/migrations/2026_06_30_091000_create_dossier_workflow_requirement_histories_table.php`
- `app/Models/DossierWorkflowRequirementHistory.php`

## Files Modified

- `app/Models/Dossier.php`
- `app/Models/DossierWorkflowRequirement.php`
- `app/Services/Clients/ClientWorkspaceService.php`
- `app/Services/Dossiers/DossierWorkflowRequirementService.php`
- `app/Services/Dossiers/DossierWorkflowStepperService.php`
- `resources/js/features/clients/types.ts`
- `resources/js/features/clients/components/ClientProjectWorkflowStepper.tsx`
- `docs/AI_WORK_REPORT.md`

## Database Changes

- Added `dossier_workflow_requirement_histories`.
- History stores old/new done state, old/new notes, changed user, and changed timestamp.
- Migration uses explicit short foreign key names for MySQL compatibility.

## Backend Work

- Requirement updates now run in a transaction.
- Each manual requirement update creates a history row.
- Workflow evaluator now returns manual notes, checked timestamp, and checked-by user name.
- Client workspace eager-loads `workflowRequirements.checkedBy`.

## Frontend Work

- Workflow requirement toggle now prompts for an optional note.
- Requirement cards show note text, checked user, and checked date when present.

## Commands Run

```powershell
php -l database\migrations\2026_06_30_091000_create_dossier_workflow_requirement_histories_table.php
php -l app\Models\DossierWorkflowRequirementHistory.php
php -l app\Services\Dossiers\DossierWorkflowRequirementService.php
php -l app\Services\Dossiers\DossierWorkflowStepperService.php
php artisan migrate
npm run build
php artisan optimize:clear
php artisan tinker --execute "...workflow history smoke test..."
```

## Build/Test Result

- PHP lint passed.
- `npm run build` passed with the existing large chunk warning.
- Initial migration attempt failed because MySQL generated a foreign key name longer than the identifier limit.
- Migration was patched with explicit short foreign key names and then passed.
- Runtime smoke test passed: evaluator returned `QA workflow note` and history count was `1`.
- Laravel cache was cleared.

## Known Issues

- File attachment shortcuts are not implemented yet; workflow requirements can explain completion with notes but cannot directly attach/select a supporting file from this card.
- History is stored but not yet displayed as a full timeline.

## Next Recommended Step

Step 52-H: add a compact workflow history viewer and document shortcut links so users can see who changed each requirement and jump to supporting dossier documents.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Step 52-H - Workflow stepper converted to guided wizard

## What Was Built

Converted the client project workflow from a passive progress grid into a usable guided stepper. The user now works on one active step, opens the relevant module for missing actions, manually marks requirements done, and moves to the next step only when the current step is complete.

## Files Modified

- `app/Services/Dossiers/DossierWorkflowStepperService.php`
- `resources/js/features/clients/types.ts`
- `resources/js/features/clients/components/ClientProjectWorkflowStepper.tsx`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Workflow step payload now includes step order.
- Each step now returns a primary action label and URL.
- Each requirement now returns an action label and URL.
- Documents-related actions go to `/documents?dossier_id=...`.
- Contract actions go to `/contracts?dossier_id=...`.
- Rokhas/authorization actions go to `/authorizations?dossier_id=...`.

## Frontend Work

- Replaced the all-cards display with a wizard-style stepper.
- Added horizontal step navigation.
- Shows only the active step details.
- Added primary action button for the active step.
- Added per-requirement action buttons for upload/open/create.
- Added gated `Etape suivante` button enabled only when the active step is complete.

## Commands Run

```powershell
php -l app\Services\Dossiers\DossierWorkflowStepperService.php
npm run build
php artisan tinker --execute "...workflow action URL smoke test..."
```

## Build/Test Result

- PHP lint passed.
- `npm run build` passed with the existing large chunk warning.
- Runtime smoke test confirmed workflow action URLs and labels are generated.

## Known Issues

- The action buttons currently open the related module page; they do not yet open a targeted upload/create drawer directly inside the workflow card.
- Documents/contracts pages must honor the `dossier_id` query parameter well for the best workflow experience.

## Next Recommended Step

Step 52-I: make workflow action buttons open focused drawers or filtered pages for the exact requirement, starting with document upload shortcuts for CIN, certificat de propriete, plan cadastral, calcul de contenance, and plan parcellaire.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Step 52-I - Client project workspace UI reorganization

## What Was Built

Reworked the client details page so it is easier to use with many project modules. The page now uses a compact client side rail and a tabbed selected-project workspace instead of showing workflow, documents, finance, records, notes, and identity all at once.

## Files Modified

- `resources/js/pages/Clients/Show.tsx`
- `resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx`
- `resources/js/features/clients/components/ClientProjectWorkflowStepper.tsx`
- `docs/AI_WORK_REPORT.md`

## Frontend Work

- Replaced the large identity card stack with a compact client profile side rail.
- Kept project selection in the side rail.
- Removed duplicate client notes and quick actions from the main content.
- Added project workspace tabs:
  - `Vue generale`
  - `Workflow`
  - `Documents`
  - `Finance`
  - `Suivi`
- Made `Workflow` the default selected project tab.
- Moved documents, finance, payments, authorization, archive, and contract panels into focused tabs.
- Removed nested panel styling around the workflow wizard so it fits cleanly inside the tab.

## Commands Run

```powershell
npm run build
git diff -- resources/js/pages/Clients/Show.tsx resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx resources/js/features/clients/components/ClientProjectWorkflowStepper.tsx
```

## Build/Test Result

- `npm run build` passed with the existing large chunk warning.

## Known Issues

- This is a layout reorganization only. Workflow action buttons still open related module pages rather than exact upload/create drawers.

## Next Recommended Step

Step 52-J: connect workflow requirement actions to focused document upload/create drawers or filtered pages for each requirement.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Step 52-J - Same-page quick create from client workspace

## What Was Built

Added quick creation from the client workspace so users can create a project, upload a dossier document, or create a contract without leaving `/clients/{client}`. Drawers are prefilled with the current client/project to avoid reselecting repeated data.

## Files Modified

- `app/Http/Controllers/ClientController.php`
- `app/Http/Controllers/DossierController.php`
- `app/Http/Controllers/DocumentController.php`
- `app/Http/Controllers/ContractController.php`
- `app/Http/Requests/StoreDossierRequest.php`
- `app/Http/Requests/StoreDossierDocumentRequest.php`
- `app/Http/Requests/StoreContractRequest.php`
- `resources/js/pages/Clients/Show.tsx`
- `resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx`
- `resources/js/features/dossiers/drawers/ProjectDrawer.tsx`
- `resources/js/features/documents/drawers/DocumentUploadDrawer.tsx`
- `resources/js/features/contracts/drawers/ContractDrawer.tsx`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Client show now sends active document template options.
- Dossier, document, and contract store requests accept optional `return_to`.
- Dossier, document, and contract store actions redirect back to the client workspace when `return_to` is provided.

## Frontend Work

- Added same-page project drawer on the client page.
- Added same-page document upload drawer on the client page.
- Added same-page contract drawer on the client page.
- Project drawer supports an initial client.
- Document upload drawer supports an initial dossier/template.
- Contract drawer supports an initial dossier and preloads surface when available.
- Selected project header now has quick buttons for upload document and create contract.
- Empty client project workspace can create a new project directly.

## Commands Run

```powershell
php -l app\Http\Controllers\ClientController.php
php -l app\Http\Controllers\DossierController.php
php -l app\Http\Controllers\DocumentController.php
php -l app\Http\Controllers\ContractController.php
php -l app\Http\Requests\StoreDossierRequest.php
php -l app\Http\Requests\StoreDossierDocumentRequest.php
php -l app\Http\Requests\StoreContractRequest.php
npm run build
php artisan optimize:clear
```

## Build/Test Result

- PHP lint passed for modified controllers and requests.
- `npm run build` passed with the existing large chunk warning.
- Laravel cache was cleared.

## Known Issues

- Finance devis/facture quick-create from the client page is not included yet.
- Workflow requirement action buttons still open module pages; they do not yet trigger these client-page drawers directly.

## Next Recommended Step

Step 52-K: connect workflow requirement action buttons to open the matching same-page drawer, starting with document upload from each required document row.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Step 52-K - Workflow stepper actions connected to same-page client drawers

## What Was Built

The client/project workflow stepper now works as an action assistant. Requirement buttons can open the current client page drawers instead of navigating away, keeping the user in the same workspace.

## Files Modified

- `resources/js/features/clients/components/ClientProjectWorkflowStepper.tsx`
- `resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx`
- `resources/js/pages/Clients/Show.tsx`
- `docs/AI_WORK_REPORT.md`

## Frontend Work

- Added typed workflow action callbacks to the project workflow stepper.
- Connected document workflow requirements to the same-page document upload drawer.
- Connected contract workflow actions to the same-page contract drawer.
- Kept route fallback behavior when the stepper is used without drawer callbacks.
- Added document template preselection from workflow requirement aliases when a matching template exists.
- Kept Rokhas-related workflow action routed to the authorization page for now.

## Commands Run

```powershell
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## How To Test

- Open `/clients/{id}`.
- Select a project.
- Go to the `Workflow` tab.
- Click a missing document action such as CIN or Certificat de propriete.
- Confirm the upload drawer opens on the same page with the selected project already filled.
- Click the contract step/action and confirm the contract drawer opens with the selected project already filled.

## Known Issues

- Rokhas workflow action still opens the authorization route instead of a specialized inline drawer.
- Template preselection depends on the available document template names/types matching the workflow aliases.

## Next Recommended Step

Step 52-L: add same-page finance quick actions from the client workspace for devis, facture, payment, and receipt, then group them by month inside the selected project finance tab.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Phase 54-A - Operations Center audit only

## What Was Checked

- Current authenticated routes for tasks, inbox, and notifications.
- Existing User model roles and notification support.
- Sidebar/topbar navigation files.
- Existing operations migrations, models, controllers, resources, policies, services, and frontend pages.
- Existing dashboard command-center data pattern.
- CRM models available for linking tasks to business records.

## Findings

- A first operations foundation already exists: `tasks`, assignees, watchers, checklist items, comments, attachments, activity logs, suggestions, conversations, messages, reads, attachments, and database notifications.
- Existing pages exist for `/tasks`, `/inbox`, and `/notifications`.
- Topbar already shows unread notification and unread message counts.
- Dashboard already includes task/message widgets through `DashboardCommandCenterService`.
- Roles use Spatie, but current permissions do not yet include task/inbox/notification/workload/report permissions.
- Missing requested operation areas: task requests/intake, workload page, operations reports, richer task fields, task type/impact/reviewed/blocking fields, task request policies/resources/controllers, workload/report services.

## Important Gaps For Phase 54-B

- Extend task schema instead of duplicating existing tables.
- Add missing operations permissions to `RolesAndPermissionsSeeder`.
- Add missing models/tables for task requests and richer operations reporting.
- Add missing policies: task request, message, notification.
- Keep controllers thin by moving more task query/write logic into services/actions.

## Commands Run

```powershell
php artisan route:list --path=tasks
php artisan route:list --path=inbox
php artisan route:list --path=notifications
```

## Build/Test Result

- No build was run because this was audit-only per the Phase 54-A prompt.
- Route list commands passed for tasks, inbox, and notifications.

## Known Issues

- `docs/FRONTEND_STRUCTURE.md` is not present in this repo.
- `docs/ARCHITECTURE.md` and other older planning docs requested by the global agent instructions are not present at the repo root; current docs are split under `docs/backend`, `docs/frontend`, `docs/merise`, and step files.
- `TaskController@index` currently contains query/filter logic and a suggestion generation call; this should move into services/actions during cleanup.

## Next Recommended Step

Phase 54-B: extend the existing operations foundation with missing migrations, enums/config, permissions, policies, request intake model/table, workload/report service skeletons, and a focused QA command.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Phase 54-B - Operations Center backend foundation extension

## What Was Built

Extended the existing Tasks/Inbox/Notifications foundation instead of creating duplicate modules. The Operations Center now has a stronger backend contract for typed CRM-linked tasks, request intake, permissions, workload summaries, reports, and QA.

## Files Created

- `config/archilbo_operations.php`
- `database/migrations/2026_06_30_120000_extend_operations_center_foundation.php`
- `app/Models/TaskRequest.php`
- `app/Http/Resources/TaskRequestResource.php`
- `app/Policies/TaskRequestPolicy.php`
- `app/Policies/MessagePolicy.php`
- `app/Policies/NotificationPolicy.php`
- `app/Services/Task/TaskRequestService.php`
- `app/Services/Task/WorkloadService.php`
- `app/Services/Task/OperationsReportService.php`
- `app/Console/Commands/OperationsFoundationQaCommand.php`

## Files Modified

- `app/Models/Task.php`
- `app/Models/User.php`
- `app/Http/Controllers/TaskController.php`
- `app/Http/Requests/Task/StoreTaskRequest.php`
- `app/Http/Requests/Task/UpdateTaskRequest.php`
- `app/Http/Resources/TaskResource.php`
- `database/seeders/RolesAndPermissionsSeeder.php`
- `resources/js/features/tasks/types.ts`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Added shared operations config for task statuses, types, categories, priorities, impacts, and request statuses/types.
- Extended `tasks` with type, impact, reviewed timestamp, blocked reason, estimated/actual minutes, recurrence rule, and linked conversation id.
- Added `task_requests` table for intake/request workflow.
- Added `TaskRequest` model and resource.
- Added task request, message, and notification policies.
- Added workload and operations report service skeletons.
- Added task request numbering/creation service.
- Added `tasksAssigned` and `tasksWatching` relations on `User`.
- Updated task validation to use `config/archilbo_operations.php`.
- Updated task resource and frontend task types for the richer data contract.
- Added operations permissions to `RolesAndPermissionsSeeder`.

## Commands Run

```powershell
php -l config\archilbo_operations.php
php -l database\migrations\2026_06_30_120000_extend_operations_center_foundation.php
php -l app\Models\Task.php
php -l app\Models\TaskRequest.php
php -l app\Models\User.php
php -l app\Http\Requests\Task\StoreTaskRequest.php
php -l app\Http\Requests\Task\UpdateTaskRequest.php
php -l app\Http\Resources\TaskResource.php
php -l app\Http\Resources\TaskRequestResource.php
php -l app\Policies\TaskRequestPolicy.php
php -l app\Policies\MessagePolicy.php
php -l app\Policies\NotificationPolicy.php
php -l app\Services\Task\TaskRequestService.php
php -l app\Services\Task\WorkloadService.php
php -l app\Services\Task\OperationsReportService.php
php -l app\Console\Commands\OperationsFoundationQaCommand.php
php -l app\Http\Controllers\TaskController.php
php -l database\seeders\RolesAndPermissionsSeeder.php
php artisan migrate
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan optimize:clear
php artisan archilbo:operations-foundation-qa
npm run build
```

## Build/Test Result

- PHP lint passed for all touched PHP files.
- Migration passed.
- Operations permissions were seeded.
- `php artisan optimize:clear` passed.
- `php artisan archilbo:operations-foundation-qa` passed.
- `npm run build` passed with the existing large bundle warning.

## Known Issues

- No task request routes/pages are connected yet; this was backend foundation only.
- Workload and operations reports have service skeletons but no pages yet.
- Existing task UI is still the old board/list/calendar and needs Phase 54-D polish.

## Next Recommended Step

Phase 54-C: add task request CRUD/actions, move task query/write logic out of `TaskController`, wire policies into controllers, and expose backend payloads for task board/list/workload/report UI.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Phase 54-C - Operations Center task request routes, service cleanup, and policy wiring

## What Was Built

Operations Center backend behavior is now more usable and safer. Task list/mutation logic was moved out of `TaskController`, task requests have real routes/actions, workload and operations report pages are reachable, and task/inbox/notification controllers now enforce authorization.

## Files Created

- `app/Services/Task/TaskQueryService.php`
- `app/Services/Task/TaskMutationService.php`
- `app/Http/Requests/Task/StoreTaskRequestRequest.php`
- `app/Http/Requests/Task/UpdateTaskRequestRequest.php`
- `app/Http/Controllers/TaskRequestController.php`
- `app/Http/Controllers/WorkloadController.php`
- `app/Http/Controllers/OperationsReportController.php`
- `resources/js/pages/TaskRequests/Index.tsx`
- `resources/js/pages/Workload/Index.tsx`
- `resources/js/pages/Operations/Reports.tsx`

## Files Modified

- `routes/web.php`
- `app/Http/Controllers/TaskController.php`
- `app/Http/Controllers/TaskCommentController.php`
- `app/Http/Controllers/TaskChecklistController.php`
- `app/Http/Controllers/TaskAttachmentController.php`
- `app/Http/Controllers/ConversationController.php`
- `app/Http/Controllers/MessageController.php`
- `app/Http/Controllers/NotificationController.php`
- `app/Http/Requests/Task/StoreTaskRequest.php`
- `app/Http/Requests/Task/UpdateTaskRequest.php`
- `app/Policies/TaskPolicy.php`
- `app/Policies/ConversationPolicy.php`
- `app/Providers/AppServiceProvider.php`
- `app/Services/Task/TaskRequestService.php`
- `app/Console/Commands/OperationsFoundationQaCommand.php`
- `resources/js/lib/appRoutes.ts`
- `resources/js/locales/en.ts`
- `docs/AI_WORK_REPORT.md`

## Backend Work

- Added task request index/store/update/accept/reject/convert routes.
- Added workload and operations report routes.
- Moved task index filtering into `TaskQueryService`.
- Moved task create/update/status mutation logic into `TaskMutationService`.
- Added task request store/update form requests.
- Added policy checks to task, task comments, checklist, attachments, inbox, messages, and notifications.
- Registered `NotificationPolicy` explicitly for Laravel database notifications.
- Extended operations QA to verify new route names.

## Frontend Work

- Added compact placeholder pages for task requests, workload, and operations reports.
- Added sidebar/app route entries for Requests, Workload, and Operations reports.
- Added locale labels for the new routes.

## Commands Run

```powershell
php -l app\Http\Controllers\TaskController.php
php -l app\Http\Controllers\TaskRequestController.php
php -l app\Http\Controllers\WorkloadController.php
php -l app\Http\Controllers\OperationsReportController.php
php -l app\Services\Task\TaskQueryService.php
php -l app\Services\Task\TaskMutationService.php
php -l app\Services\Task\TaskRequestService.php
php -l app\Http\Requests\Task\StoreTaskRequest.php
php -l app\Http\Requests\Task\UpdateTaskRequest.php
php -l app\Http\Requests\Task\StoreTaskRequestRequest.php
php -l app\Http\Requests\Task\UpdateTaskRequestRequest.php
php -l app\Policies\TaskPolicy.php
php -l app\Policies\ConversationPolicy.php
php -l app\Providers\AppServiceProvider.php
php -l app\Console\Commands\OperationsFoundationQaCommand.php
php artisan route:list --path=task-requests
php artisan route:list --path=workload
php artisan route:list --path=operations
php artisan archilbo:operations-foundation-qa
npm run build
php artisan optimize:clear
```

## Build/Test Result

- PHP lint passed for all checked files.
- Task request, workload, and operations report routes are registered.
- `archilbo:operations-foundation-qa` passed.
- `npm run build` passed with the existing large bundle warning.
- `php artisan optimize:clear` passed.

## Known Issues

- Task request, workload, and operations report pages are functional placeholders, not final polished Operations UI.
- Task request creation still needs a drawer/form UI.
- Task board UI still needs Phase 54-D density/polish and better use of type/impact fields.

## Next Recommended Step

Phase 54-D: redesign the Tasks page into the dense Operations board/list/calendar/workload experience, using the existing real task payload and new operations config.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Phase 54-D - Dense Operations task workspace polish

## What Was Built

Upgraded `/tasks` from a basic task page into a denser Operations workspace with immediate operational signals and clearer task cards.

## Files Modified

- `resources/js/pages/Tasks/Index.tsx`
- `resources/js/features/tasks/types.ts`
- `resources/js/features/tasks/components/TaskBoard.tsx`
- `resources/js/features/tasks/components/TaskCard.tsx`
- `resources/js/features/tasks/components/TaskFilters.tsx`
- `resources/js/features/tasks/components/TaskList.tsx`
- `docs/AI_WORK_REPORT.md`

## Frontend Work

- Added top Operations metrics for open, urgent/critical, blocked, overdue, and review tasks.
- Added quick header buttons to Requests and Workload.
- Made task board horizontally scroll with denser fixed-width columns.
- Upgraded task cards with type, impact, priority, linked record, checklist progress, blocker reason, comments, and attachments.
- Added filters for Watching and Blocked.
- Added icon-based board/list/calendar view switcher.
- Extended task list columns with type and impact.
- Added shared task type and impact label/color maps.

## Commands Run

```powershell
npm run build
php artisan archilbo:operations-foundation-qa
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed with the existing large bundle warning.
- `archilbo:operations-foundation-qa` passed.
- `php artisan optimize:clear` passed.

## Known Issues

- Task create drawer does not yet expose type/impact/linked CRM fields.
- Task request creation still needs a drawer/form UI.
- Calendar view is still grouped-list style, not a full monthly calendar.

## Next Recommended Step

Phase 54-E: upgrade task drawer/detail, checklist, comments, activity timeline, attachments, linked CRM record buttons, and task request creation drawer.
---

# AI Work Report

## Date

2026-06-30

## Step Completed

Operations task UI behavior fix

## What Was Fixed

- Marking a task completed now updates local task state immediately, so the card moves into the Completed column without waiting for a visible full refresh.
- Checklist checkbox toggles now update the open task drawer instantly and recalculate progress locally.
- Failed status/checklist updates roll back the local UI state and show an error toast.

## Files Modified

- `resources/js/pages/Tasks/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan archilbo:operations-foundation-qa
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed with the existing large bundle warning.
- `archilbo:operations-foundation-qa` passed.
- `php artisan optimize:clear` passed.

## Next Recommended Step

Continue Phase 54-E: upgrade task drawer/detail with comments, checklist editing, activity timeline, attachments, linked CRM record buttons, and task request creation drawer.
---

# AI Work Report

## Date

2026-07-01

## Step Completed

Tasks layout no-scroll polish

## What Was Fixed

- Removed the horizontal board scrollbar.
- Removed per-column vertical scrollbars.
- Changed the task board to a responsive wrapping grid.
- Reworked the filters into a cleaner command-bar layout.
- Made search larger and more useful.
- Grouped filters into `Scope` and `Module` sections.
- Tightened KPI cards to reduce wasted vertical space.

## Files Modified

- `resources/js/pages/Tasks/Index.tsx`
- `resources/js/features/tasks/components/TaskBoard.tsx`
- `resources/js/features/tasks/components/TaskFilters.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan archilbo:operations-foundation-qa
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed with the existing large bundle warning.
- `archilbo:operations-foundation-qa` passed.
- `php artisan optimize:clear` passed.

## Next Recommended Step

Continue Phase 54-E with the task detail drawer and task request creation drawer.
---

# AI Work Report

## Date

2026-07-01

## Step Completed

Modern task filter panel polish

## What Was Fixed

- Reworked the task filter block into a modern segmented command surface.
- Added a `Focus filters` header with helper text.
- Added a Reset action for scope/module/search.
- Converted filter chips to rounded modern pills with stronger active state.
- Balanced Scope and Module groups to avoid the large empty middle gap.

## Files Modified

- `resources/js/features/tasks/components/TaskFilters.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan archilbo:operations-foundation-qa
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed with the existing large bundle warning.
- `archilbo:operations-foundation-qa` passed.
- `php artisan optimize:clear` passed.

---

# AI Work Report

## Date

2026-07-01

## Step Completed

Phase 54-E task detail workspace

## What Was Built

- Upgraded the task detail drawer from a read-only panel into a compact task workspace.
- Added linked record navigation for client, dossier, and conversation.
- Added task metadata using shared task maps instead of duplicate hardcoded labels.
- Added checklist creation from inside the drawer.
- Added comment creation from inside the drawer.
- Added attachment upload from inside the drawer.
- Added compact collaboration and activity context sections.

## Files Modified

- `resources/js/features/tasks/components/TaskDetailDrawer.tsx`
- `resources/js/pages/Tasks/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan archilbo:operations-foundation-qa
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed with the existing large bundle warning.
- `archilbo:operations-foundation-qa` passed.
- `php artisan optimize:clear` passed.

## Next Recommended Step

Continue with task request conversion flow: approve a request, create/link a task, and keep the request status synchronized.

---

# AI Work Report

## Date

2026-07-01

## Step Completed

Phase 54-F task request conversion flow

## What Was Built

- Moved task request to task mapping into `config/archilbo_operations.php`.
- Moved request conversion into `TaskRequestService` to keep the controller thin.
- Added backend guards so rejected/converted task requests cannot be changed by direct POST.
- Improved `/task-requests` with status filters, labels, counts, clearer linked client/dossier context, and safer action states.

## Files Modified

- `config/archilbo_operations.php`
- `app/Services/Task/TaskRequestService.php`
- `app/Http/Controllers/TaskRequestController.php`
- `resources/js/pages/TaskRequests/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
php -l app/Services/Task/TaskRequestService.php
php -l app/Http/Controllers/TaskRequestController.php
php -l config/archilbo_operations.php
npm run build
php artisan archilbo:operations-foundation-qa
php artisan optimize:clear
```

## Build/Test Result

- PHP lint passed.
- `npm run build` passed with the existing large bundle warning.
- `archilbo:operations-foundation-qa` passed.
- `php artisan optimize:clear` passed.

## Next Recommended Step

Add task request creation drawer from `/tasks` and `/task-requests`, using real users/clients/dossiers instead of fake data.

---

# AI Work Report

## Date

2026-07-01

## Step Completed

Inbox premium chat polish pass

## What Was Built

- Added shared chat helpers for conversation names, initials, online status, and last-message previews.
- Fixed generic `Conversation` labels by deriving direct/group names from real participants and subject.
- Updated inbox workspace height to fill the available viewport and reduce empty black space.
- Reused the shared naming logic in inbox notifications, mobile header, conversation list, message thread, and forward modal.
- Kept existing text/image messaging routes and current backend behavior unchanged.

## Files Created

- `resources/js/features/chat/helpers.ts`

## Files Modified

- `resources/js/pages/Inbox/Index.tsx`
- `resources/js/features/inbox/components/ConversationList.tsx`
- `resources/js/features/inbox/components/MessageThread.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php -l app/Http/Resources/ConversationResource.php
php -l app/Http/Resources/MessageResource.php
php -l app/Http/Controllers/ConversationController.php
php -l app/Http/Controllers/MessageController.php
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed with the existing large bundle warning.
- PHP lint passed for checked chat backend files.
- `php artisan optimize:clear` passed.

## Next Recommended Step

Continue inbox polish with compact desktop header actions, stronger mobile back behavior inside the thread header, and visual QA in browser.

---

# AI Work Report

## Date

2026-07-01

## Step Completed

Inbox chat naming, online status, and bubble polish

## What Was Built

- Exposed `currentUserId` directly from the inbox controller.
- Exposed `lastSeenAt` and `isOnline` through `UserResource`.
- Added `last_seen_at` fillable/cast support on `User`.
- Loaded last-message attachments for conversation previews so image previews can say `Photo` or `N photos`.
- Hardened chat helper fallbacks so direct chats do not show `Direct conversation` when participants exist.
- Fixed message edit/delete callbacks in `MessageThread` to update parent message state safely.
- Polished conversation row selected/unread states with gold accent, stronger preview text, and gold unread badge.
- Polished message bubbles with grouped incoming avatar/name, darker gold outgoing bubbles, subtle chat background, header actions, and a cleaner composer bar.

## Files Modified

- `app/Http/Controllers/ConversationController.php`
- `app/Http/Resources/UserResource.php`
- `app/Models/User.php`
- `resources/js/features/chat/types.ts`
- `resources/js/features/chat/helpers.ts`
- `resources/js/pages/Inbox/Index.tsx`
- `resources/js/features/inbox/components/ConversationList.tsx`
- `resources/js/features/inbox/components/MessageThread.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
php -l app/Http/Controllers/ConversationController.php
php -l app/Http/Resources/UserResource.php
php -l app/Models/User.php
php artisan optimize:clear
npm run build
```

## Build/Test Result

- PHP lint passed.
- `php artisan optimize:clear` passed.
- `npm run build` passed with the existing large bundle warning.

## Next Recommended Step

Open `/inbox` in browser and visually verify full-height layout, real direct conversation names, online dots, image previews, and mobile chat/list switching.

---

# AI Work Report

## Date

2026-07-01

## Step Completed

Inbox 3-pane workspace and archive-aware chat

## What Was Built

- Added backend `displayName` and `avatarInitials` to `ConversationResource`.
- Added backend validation requiring message text or at least one image.
- Added backend reply safety so reply targets must belong to the same conversation.
- Added `ConversationInfoPanel` as the desktop right pane with members, status, shared images, and archive/unarchive action.
- Added archive-aware inbox tabs: Active, Archived, Unread, Direct, Groups.
- Added archived conversation loading through the existing `/inbox/archived` route.
- Added page-level archive/unarchive state updates without full page reload.
- Expanded conversation search to include display name, participant name/email, subject, and last message body.

## Files Created

- `resources/js/features/inbox/components/ConversationInfoPanel.tsx`

## Files Modified

- `app/Http/Controllers/ConversationController.php`
- `app/Http/Controllers/MessageController.php`
- `app/Http/Resources/ConversationResource.php`
- `app/Http/Requests/Chat/StoreMessageRequest.php`
- `resources/js/features/chat/types.ts`
- `resources/js/features/chat/helpers.ts`
- `resources/js/pages/Inbox/Index.tsx`
- `resources/js/features/inbox/components/ConversationList.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
php -l app/Http/Controllers/ConversationController.php
php -l app/Http/Controllers/MessageController.php
php -l app/Http/Resources/ConversationResource.php
php -l app/Http/Requests/Chat/StoreMessageRequest.php
npm run build
php artisan optimize:clear
```

## Build/Test Result

- PHP lint passed.
- `npm run build` passed with the existing large bundle warning.
- `php artisan optimize:clear` passed.

## Next Recommended Step

Browser QA `/inbox`: confirm Active/Archived tabs, archive/unarchive state, right info panel, real display names, search, send/reply/image flows, and mobile behavior.

---

# AI Work Report

## Date

2026-07-01

## Step Completed

Inbox forward message fix

## What Was Fixed

- Fixed the forward endpoint so it no longer uses `StoreMessageRequest`.
- Forward validation now only requires a valid `target_conversation_id`.
- Image-only messages can now be forwarded without failing the send-message body/image validation.
- Forward UI now shows success/error toast instead of silently swallowing failures.

## Files Modified

- `app/Http/Controllers/MessageController.php`
- `resources/js/features/inbox/components/MessageThread.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
php -l app/Http/Controllers/MessageController.php
php artisan optimize:clear
npm run build
```

## Build/Test Result

- PHP lint passed.
- `php artisan optimize:clear` passed.
- `npm run build` passed with the existing large bundle warning.

## Next Recommended Step

Manually forward a text message and an image-only message in `/inbox` to confirm both succeed.

---

# AI Work Report

## Date

2026-07-04

## Step Completed

Fixed task table action dropdown background.

## What Was Built

- Made the task table status action dropdown use an opaque dark CRM background.
- Strengthened the dropdown shadow/ring so table rows no longer bleed visually through the menu.

## Files Created

- None.

## Files Modified

- `resources/js/features/tasks/components/TaskTable.tsx`
- `docs/AI_WORK_REPORT.md`

## Database Changes

- None.

## Commands Run

```powershell
npm run build
npm.cmd run build
```

## New Routes

- None.

## New Permissions

- None.

## Important Decisions

- Kept the existing handmade table menu and changed only the visual surface class.
- Used an opaque dark CRM surface instead of the semi-transparent elevated token in this overlay context.

## How To Test

1. Open Tasks.
2. Switch to Table view.
3. Click the `Move` action on a row.
4. Confirm the menu background is solid and readable over the table.

## Known Issues

- `npm run build` is blocked by PowerShell execution policy for `npm.ps1`; `npm.cmd run build` passes.
- Vite still reports the existing large chunk warning.

## Next Recommended Step

Review the task card/list action menus for the same overlay opacity issue.

---

# AI Work Report

## Date

2026-07-04

## Step Completed

Fixed login internal server error from chat preview query.

## What Was Built

- Replaced Laravel's per-parent eager-load `messages.latest().limit(1)` pattern for conversation previews.
- Added a reusable `ChatService::loadLatestMessagePreviews()` method that uses a grouped latest message ID query and attaches one preview message to each conversation.
- Updated Inertia shared auth data to use a lazy `recent_conversations` prop and the safe preview loader.
- Updated inbox archive/unarchive/list paths to use the same safe preview loader.

## Files Created

- None.

## Files Modified

- `app/Services/Chat/ChatService.php`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `app/Http/Controllers/ConversationController.php`
- `docs/AI_WORK_REPORT.md`

## Database Changes

- None.

## Commands Run

```powershell
C:\tools\php-8.5.8\php.exe -l app\Services\Chat\ChatService.php
C:\tools\php-8.5.8\php.exe -l app\Http\Middleware\HandleInertiaRequests.php
C:\tools\php-8.5.8\php.exe -l app\Http\Controllers\ConversationController.php
C:\tools\php-8.5.8\php.exe artisan optimize:clear
C:\tools\php-8.5.8\php.exe artisan route:list --except-vendor
C:\tools\php-8.5.8\php.exe -r "..."
C:\tools\php-8.5.8\php.exe artisan serve --host=127.0.0.1 --port=8010
curl.exe -I http://127.0.0.1:8010/login
C:\tools\php-8.5.8\php.exe artisan test
```

## New Routes

- None.

## New Permissions

- None.

## Important Decisions

- Kept `ConversationResource` unchanged by preserving its expected loaded `messages` relation shape.
- Avoided changing SQL mode globally; fixed the application query instead.
- Used `MAX(id)` for latest message previews because message IDs are monotonic and avoids unsupported window/eager-limit SQL on the local MySQL/MariaDB setup.

## How To Test

1. Run `php artisan optimize:clear`.
2. Run `php artisan serve`.
3. Open `http://127.0.0.1:8000/login`.
4. Confirm the login page renders instead of the `Illuminate\Database\QueryException`.

## Known Issues

- Full `php artisan test` still has the existing `Tests\Feature\ExampleTest::test_the_application_returns_a_successful_response` failure because `/` returns `302` to login instead of the test's expected `200`.

## Next Recommended Step

Create or confirm a local admin user, then test authenticated inbox and dashboard pages with the same local database.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Inbox realtime message dedupe and diagnostics

## What Was Fixed

- Added a single message upsert/reconciliation path for optimistic messages, API responses, realtime broadcasts, and older-message pagination.
- Prevented duplicate message rows when the sender receives both the HTTP response and the `message.created` broadcast.
- Kept realtime messages inserted immediately even when the user is scrolled up; the floating new-message button now only controls visibility/scrolling.
- Added explicit inbox/conversation realtime diagnostic logs using the requested `[chat] ...` labels.
- Confirmed typing hook already sends/receives full user payloads, ignores the current user, and does not leave the shared Echo channel on cleanup.

## Files Modified

- `resources/js/pages/Inbox/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed.
- `php artisan optimize:clear` passed.
- Vite still reports the existing large bundle warning.

## How To Test

- Open `/inbox` as two different users in separate browser sessions.
- Confirm both users log `[chat] subscribe conversation` for the same conversation.
- Send messages both directions and confirm they appear instantly with no duplicate key warnings.
- Type in one browser and confirm the other browser logs `[chat] typing received` and shows the typing indicator.

## Known Issues

- Full two-user browser QA was not run from this terminal session.

## Next Recommended Step

Run the two-browser Reverb test and then remove or gate temporary `console.debug` logs once realtime is confirmed stable.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Inbox realtime subscription fallback and Echo diagnostics

## What Was Fixed

- Added explicit Echo private auth headers for `/broadcasting/auth`.
- Added Echo connection status diagnostics with Reverb host/port.
- Added subscription success/error diagnostics for inbox, active conversation, and typing channels.
- Added `listenToAll` fallback routing for inbox updates and message created/updated/deleted events.
- Added `listenToAll` fallback routing for `client-typing` whispers.
- Cleaned typing listener cleanup without leaving the shared conversation channel.

## Files Modified

- `resources/js/app.tsx`
- `resources/js/pages/Inbox/Index.tsx`
- `resources/js/features/inbox/components/useTyping.ts`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed.
- `php artisan optimize:clear` passed.
- Vite still reports the existing large bundle warning.

## How To Test

- Restart Vite/Reverb/browser sessions.
- Open `/inbox` as two different users in separate browser profiles.
- Confirm console logs show `echo connection connected`, `subscribed inbox`, `subscribed conversation`, and `typing subscribed`.
- Send a message and confirm the receiving browser logs `conversation event message.created` or `received message.created`.
- Type in one browser and confirm the other logs `typing channel event client-typing` or `typing received`.

## Known Issues

- If subscription success logs do not appear, the next fix is channel auth/session debugging.
- If success logs appear but no event logs appear, the next fix is backend broadcast delivery/event naming.

## Next Recommended Step

Run the two-browser test and use the new console logs to identify any remaining break in the realtime chain.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Inbox realtime private-channel auth bootstrap fix

## What Was Fixed

- Moved `window.csrfToken`, `window.userId`, and `window.Laravel.csrfToken` before the Vite app script.
- Added the standard `<meta name="csrf-token">` tag to the Inertia root view.
- Updated Echo setup to read CSRF from `window.csrfToken` or the meta tag.
- This fixes the likely cause where Echo configured private-channel auth before the CSRF token existed, causing messages to save but realtime subscriptions/typing to fail.

## Files Modified

- `resources/views/app.blade.php`
- `resources/js/app.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed.
- `php artisan optimize:clear` passed.
- Vite still reports the existing large bundle warning.

## How To Test

- Restart `npm run dev`, `php artisan serve`, and Reverb.
- Hard refresh both browser sessions.
- Confirm console logs show subscription success instead of subscription errors.
- Send a message and type between two different users.

## Known Issues

- Browser two-user realtime QA still needs to be confirmed manually.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Inbox typing indicator UI polish

## What Was Changed

- Replaced the flat typing status row with a compact modern typing bubble.
- Added overlapping user initials for active typers.
- Improved typing animation with entrance motion, avatar pulse, and gold bouncing dots.
- Kept the existing realtime typing hook and message logic unchanged.

## Files Modified

- `resources/js/features/inbox/components/MessageThread.tsx`
- `resources/css/archilbo-theme.css`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Browser-check `/inbox` typing on desktop and mobile widths to confirm the bubble feels compact beside the composer.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Inbox online status, archive toggle, and duplicate info panel cleanup

## What Was Changed

- Added frontend `isOnline` support to chat user types.
- Updated the conversation info panel to show online status from `isOnline` or recent `lastSeenAt`.
- Added an online status pill and member online indicators in the right info panel.
- Kept one desktop details panel by hiding the internal thread info drawer on XL screens.
- Removed duplicate archive buttons from the internal/mobile info drawer.
- Updated conversation list row action to archive or unarchive depending on current state.
- Restored conversations now move back to the Active tab when unarchived while selected.

## Files Modified

- `resources/js/features/chat/types.ts`
- `resources/js/features/inbox/components/ConversationInfoPanel.tsx`
- `resources/js/features/inbox/components/ConversationList.tsx`
- `resources/js/features/inbox/components/MessageThread.tsx`
- `resources/js/pages/Inbox/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Browser-check `/inbox`: verify one desktop info panel, online dots/statuses, archive/unarchive from rows and right panel, and mobile info drawer behavior.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Inbox archived conversations persistence and collapsible info panel

## What Was Fixed

- Fixed archived conversations not appearing by adding `archived_at` to `ConversationParticipant` fillable/casts.
- Archive and unarchive endpoints now return the updated `ConversationResource`.
- Archive broadcasts now include the updated conversation payload.
- Archived tab fetch now merges server results with locally archived conversations and filters by `archivedAt`.
- Right conversation info panel can now collapse to a slim rail and expand again.

## Files Modified

- `app/Models/ConversationParticipant.php`
- `app/Http/Controllers/ConversationController.php`
- `resources/js/features/inbox/components/ConversationInfoPanel.tsx`
- `resources/js/pages/Inbox/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
php -l app/Models/ConversationParticipant.php
php -l app/Http/Controllers/ConversationController.php
npm run build
php artisan optimize:clear
```

## Build/Test Result

- PHP lint passed.
- `npm run build` passed.
- `php artisan optimize:clear` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Browser-check `/inbox`: archive a conversation, open Archived tab, restore it, and test collapsing/expanding the right info panel.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Compact CRM table foundation and Clients page pilot

## What Was Changed

- Added reusable compact CRM table shell, toolbar, filter chips, search field, selected row, avatar chip, and mobile record card styles.
- Updated the Clients index to use the shared compact table toolbar pattern.
- Added responsive mobile client cards so the Clients list stays usable on small screens instead of relying only on horizontal table scrolling.
- Kept existing backend data, routes, drawers, filters, pagination, and client actions unchanged.

## Files Modified

- `resources/css/archilbo-theme.css`
- `resources/js/pages/Clients/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Apply the same compact table shell to Projects/Dossiers, Intermediaries, Documents, Finance documents, Archives, and Users one page at a time.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Reference-matched table UI foundation and Clients table conversion

## What Was Changed

- Analyzed the provided reference tables and matched their main structure: light table island, top toolbar, search, update/filter/sort buttons, primary add button, icon headers, selectable rows, compact status pills, row action buttons, mobile cards, and footer pagination.
- Added reusable `crm-reference-*` table classes without replacing the existing dark CRM card/table styles.
- Added a `reference` variant to `AppPagination` for table footer pagination.
- Converted the Clients list table to the reference-style layout while keeping real backend data, drawer creation/editing, filtering, search, and pagination.
- Converted the shared `AppDataTable` component to use the same reference table shell so pages already using the shared component inherit the new header/footer/table rhythm.

## Files Modified

- `resources/css/archilbo-theme.css`
- `resources/js/components/ui/AppDataTable.tsx`
- `resources/js/components/ui/AppPagination.tsx`
- `resources/js/pages/Clients/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Browser-check `/clients`, then apply the same reference table shell to Dossiers/Projects next.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Finance documents table matched to reference table layout

## What Was Changed

- Converted the Finance Documents workspace from the old dark table plus right detail panel into the reference-style table island.
- Added toolbar actions matching the reference idea: search, update, filter, and sort.
- Added selectable rows, icon table headers, compact status pills, clean row action buttons, mobile cards, and reference footer pagination.
- Kept real finance document data, existing document actions, drawer flows, PDF/Excel generation, and payment action routing unchanged.

## Files Modified

- `resources/css/archilbo-theme.css`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Browser-check `/finance/documents`; then apply the same reference table layout to Payments and Dossiers/Projects.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Reference table system recolored to ARCHI LBO dark/gold theme

## What Was Changed

- Kept the reference table layout structure but replaced the white SaaS colors with ARCHI LBO dark surfaces, muted borders, and gold accents.
- Removed hardcoded light colors from the shared table component, reference pagination, Clients table, and Finance Documents table.
- Preserved compact toolbar, icon headers, selectable rows, status pills, row actions, and footer pagination.

## Files Modified

- `resources/css/archilbo-theme.css`
- `resources/js/components/ui/AppDataTable.tsx`
- `resources/js/components/ui/AppPagination.tsx`
- `resources/js/pages/Clients/Index.tsx`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Browser-check `/finance/documents` and `/clients` to confirm the table layout matches the reference while staying dark/gold.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

Shell overflow and page clipping fix

## What Was Changed

- Tightened the main app shell so the sidebar, topbar, and page content stay inside one `100dvh` flex layout.
- Fixed normal pages using mobile bottom padding until `lg`; desktop/tablet pages now use normal page padding from `md` upward.
- Added final CSS hardening for `html`, `body`, `#app`, `.crm-shell`, `.crm-topbar`, and `.crm-page` to prevent top/bottom drift and clipped content.

## Files Modified

- `resources/js/components/layout/AppShell.tsx`
- `resources/css/app.css`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed.
- `php artisan optimize:clear` passed.
- Vite still reports the existing large bundle warning.

## How To Test

- Open `/finance` and confirm the page starts under the topbar without extra top offset.
- Check desktop, tablet width, and mobile width for no clipped bottom content.
- On mobile, confirm bottom nav only appears where expected and does not cover full-screen inbox chat.

## Next Recommended Step

Browser-check the shell at 1440px, 1024px, 768px, and mobile width; then continue table cleanup for other index pages.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

New frontend Phase 0 audit and backup

## What Was Done

- Read `docs/PROJECT_RULES.md` and `docs/new frontend.md`.
- Created a full frontend backup: `resources_BACKUP_20260702-113055`.
- Audited current frontend foundation, shared components, shell files, and Projects/Dossiers page.
- No backend files, routes, controllers, models, or database files were changed.
- No page migration was started yet.

## Current Frontend Structure

- App entry: `resources/js/app.tsx`.
- Main shell: `resources/js/components/layout/AppShell.tsx`.
- Navigation: `resources/js/components/layout/AppSidebar.tsx`, `AppTopbar.tsx`, `AppMobileNav.tsx`.
- Shared UI components already exist under `resources/js/components/ui/`.
- Shared helpers/config currently include `resources/js/lib/cn.ts`, `appRoutes.ts`, `filters.ts`, `i18n.ts`, and form helpers.
- Projects UI is currently implemented as `resources/js/pages/Dossiers/Index.tsx` with real Inertia props.

## HeroUI / UI Library Status

- HeroUI is not installed in `package.json`.
- The local project rule says the UI stack is Tailwind CSS + React Aria Components and explicitly says not to use other UI kits.
- Phase 1 should therefore use the existing React Aria shared components unless the project rules are intentionally changed first.

## Tailwind Status

- Tailwind v4 is installed through `tailwindcss` and `@tailwindcss/vite`.
- No `tailwind.config.*` file was found; styling is currently tokenized through CSS files, mostly `resources/css/app.css` and `resources/css/archilbo-theme.css`.
- Existing dark/gold theme tokens are active and should be preserved.

## Projects Page Map

Old/current data props:
- `dossiers`
- `locationGroups`
- `clients`
- `metrics`

Old/current actions:
- Create project drawer.
- Edit project drawer.
- Delete project with confirmation.
- Open project details route.
- Open linked documents route.
- Open linked finance documents route.
- Search, workflow filters, workspace/location switch, pagination.

Must preserve:
- Existing Inertia props and routes.
- `ProjectDrawer` create/edit submissions.
- Existing search/filter/pagination behavior.
- Location explorer behavior.
- Real backend data only.

## Exact Files Recommended For Phase 1

- `resources/js/config/statuses.ts` for shared status labels, tones, and workflow steps.
- `resources/js/config/navigation.ts` or keep/clean `resources/js/lib/appRoutes.ts` as the single navigation source.
- `resources/js/components/ui/AppPageHeader.tsx` to standardize headers/actions.
- `resources/js/components/ui/AppToolbar.tsx` to standardize search/filter/sort/action rows.
- `resources/js/components/ui/AppDataTable.tsx` to support row click, optional selection, toolbar slots, and working filters without fake buttons.
- `resources/js/components/ui/AppDrawer.tsx` only if drawer sizing/preview mode needs standardization.
- `resources/css/archilbo-theme.css` only for central tokens and shared table/card/sidebar classes.

## Commands Run

```powershell
Copy-Item "resources" "resources_BACKUP_20260702-113055" -Recurse
```

## Build/Test Result

- Build was not run because Phase 0 only created a backup and audit/report notes.

## Next Recommended Step

Start Phase 1 with the shared config/component cleanup only; do not migrate Projects until those shared pieces are stable.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

New frontend rules and dependency setup before Phase 1

## What Was Changed

- Updated `docs/PROJECT_RULES.md` to align with `docs/new frontend.md`.
- Installed HeroUI v3 and its motion dependency.
- Added `resources/js/providers/AppProviders.tsx` to centralize app-level providers.
- Imported HeroUI global styles before the local ARCHI LBO CSS so the dark/gold theme can override component styling.
- Kept existing React Aria components valid for gradual migration.
- Did not migrate Projects/Dossiers yet.
- Did not change backend, routes, controllers, models, or database files.

## Files Created

- `resources/js/providers/AppProviders.tsx`

## Files Modified

- `docs/PROJECT_RULES.md`
- `docs/AI_WORK_REPORT.md`
- `package.json`
- `package-lock.json`
- `resources/js/app.tsx`

## Dependencies Added

- `@heroui/react` v3.2.1
- `framer-motion`

## Important Decisions

- HeroUI v3.2.1 does not expose a `HeroUIProvider` export in the installed package, so setup uses the available global styles plus existing app providers.
- Future frontend work should use HeroUI components where useful through shared wrappers, while preserving existing React Aria components until migration.

## Commands Run

```powershell
npm install @heroui/react framer-motion
npm run build
```

## Build/Test Result

- `npm run build` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Start Phase 1: shared frontend foundation cleanup with central statuses/navigation and shared toolbar/table/header improvements before migrating Projects.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

New frontend Phase 1 foundation config cleanup

## What Was Changed

- Added a shared navigation config bridge so active layout/search/mobile navigation imports use `resources/js/config/navigation.ts`.
- Added shared dossier status/workflow/readiness config in `resources/js/config/statuses.ts`.
- Replaced hardcoded dossier workflow labels, status classes, readiness checks, and drawer select options with the shared config.
- Kept Projects/Dossiers behavior unchanged: create/edit/delete/search/filter/location/pagination routes still use existing logic.
- Did not migrate the Projects UI yet.
- Did not change backend, routes, controllers, models, or database files.

## Files Created

- `resources/js/config/navigation.ts`
- `resources/js/config/statuses.ts`

## Files Modified

- `resources/js/components/layout/AppSidebar.tsx`
- `resources/js/components/layout/AppMobileNav.tsx`
- `resources/js/components/layout/navigation.ts`
- `resources/js/components/layout/AppGlobalSearch.tsx`
- `resources/js/pages/FrontendQa/Index.tsx`
- `resources/js/pages/Dossiers/Index.tsx`
- `resources/js/features/dossiers/drawers/ProjectDrawer.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed.
- `php artisan optimize:clear` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Start Phase 2/3 shell and shared component cleanup, then migrate Projects/Dossiers as the first pilot page.

---

# AI Work Report

## Date

2026-07-02

## Step Completed

New frontend Phase 2 shell/theme foundation wiring

## What Was Changed

- Made `archilboTheme` an active frontend theme source by applying its tokens to CSS variables from `ThemeProvider`.
- Aligned shared theme dimensions with the current shell: sidebar rail, expanded sidebar, topbar, mobile bottom nav, and page padding.
- Updated `AppPageHeader` to use CRM dark/gold tokens instead of generic app tokens.
- Updated `AppShell` to use the shared `AppPageHeader` instead of duplicated header markup.
- Did not migrate Projects/Dossiers UI yet.
- Did not change backend, routes, controllers, models, or database files.

## Files Modified

- `resources/js/config/archilboTheme.ts`
- `resources/js/providers/ThemeProvider.tsx`
- `resources/js/components/ui/AppPageHeader.tsx`
- `resources/js/components/layout/AppShell.tsx`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php artisan optimize:clear
```

## Build/Test Result

- `npm run build` passed.
- `php artisan optimize:clear` passed.
- Vite still reports the existing large bundle warning.

## Next Recommended Step

Continue Phase 3 shared component cleanup: standardize toolbar/table/drawer primitives, then start the Projects/Dossiers pilot redesign.
---

# AI Work Report

## Date

2026-07-04

## Step Completed

Fixed local PHP/Laravel serve runtime.

## What Was Built

- Repaired the broken XAMPP PHP configuration that pointed extensions to an unresolved `${XAMPP_LITE_ROOT}` path.
- Installed official PHP 8.5.8 x64 NTS under `C:\tools\php-8.5.8`.
- Enabled required PHP extensions for the Laravel app: curl, fileinfo, gd, intl, mbstring, mysqli, openssl, pdo_mysql, pdo_sqlite, sqlite3, and zip.
- Updated the user PATH to prefer `C:\tools\php-8.5.8` before the older XAMPP PHP.
- Created the missing local MySQL database `archi_lbo_os`.
- Ran all Laravel migrations successfully.
- Verified `php artisan serve` starts and redirects `/` to `/login`.

## Files Created

- None inside the project.

## Files Modified

- `docs/AI_WORK_REPORT.md`

## Database Changes

- Created local MySQL database `archi_lbo_os`.
- Ran pending migrations for the local development database.

## Commands Run

```powershell
php -v
php --ini
C:\tools\php-8.5.8\php.exe artisan --version
C:\tools\php-8.5.8\php.exe artisan about
C:\xampp\apps\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS `archi_lbo_os` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
C:\tools\php-8.5.8\php.exe artisan migrate --force
C:\tools\php-8.5.8\php.exe artisan serve --host=127.0.0.1 --port=8000
curl.exe -I --max-redirs 0 http://127.0.0.1:8000
```

## New Routes

- None.

## New Permissions

- None.

## Important Decisions

- Kept XAMPP MySQL in use.
- Switched PHP CLI to official PHP 8.5.8 x64 because the installed Composer dependencies require PHP `>= 8.4.1` and a 64-bit build.
- Left application code unchanged.

## How To Test

1. Open a new PowerShell window so the updated user PATH is loaded.
2. Run `php -v` and confirm PHP 8.5.8 x64.
3. Run `php artisan serve`.
4. Open `http://127.0.0.1:8000` and confirm it redirects to `/login`.

## Known Issues

- Existing PowerShell windows may still use the old XAMPP PHP until restarted.
- XAMPP PHP 8.3.13 x86 remains installed but is no longer suitable for this project.

## Next Recommended Step

Seed or create a local admin user if login access is needed on the freshly migrated database.

---

# AI Work Report

## Date

2026-07-18

## Step Completed

Fixed finance document drawer template preview selection.

## What Was Changed

- Fixed the finance document builder template select to use the single selected key API so the selected DB template stays in sync with form state.
- Fixed draft preview CSRF lookup to use `window.document` because the drawer prop named `document` shadows the browser document object.
- Hardened backend draft preview template resolution so selected templates must match the document type or shared `finance` type, then fallback to the default template for the document type.

## Files Modified

- `resources/js/components/drawers/entities/FinanceDocumentBuilderDrawer/index.tsx`
- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `docs/AI_WORK_REPORT.md`

## Commands Run

```powershell
npm run build
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
git diff --check -- resources/js/components/drawers/entities/FinanceDocumentBuilderDrawer/index.tsx app/Http/Controllers/Finance/FinanceDocumentController.php
```

## Build/Test Result

- `npm run build` passed.
- PHP syntax check passed.
- `git diff --check` passed with only an existing CRLF/LF normalization warning.

## How To Test

1. Open Finance.
2. Create a Devis, Facture, or Recu.
3. Go to the Template step.
4. Select a DB template for that document type.
5. Open preview and confirm it changes to the selected template layout.

## Known Issues

- Vite still reports the existing large bundle warning.
- Git reports CRLF normalization for the PHP controller.

## Next Recommended Step

Test the three finance document types in browser and then clean up any template content/placeholder issues found in the DB templates.

---

# AI Work Report

## Date

2026-07-18

## Step Completed

Consolidated and hardened the Finance module.

## What Was Built

- Consolidated active routes, search, dossier counts, seed data, and UI on `FinanceDocument` instead of the empty legacy `FinanceRecord` runtime.
- Added finance document/status/payment enums, granular policies and permissions, company/branch scope, and finance activity logs.
- Added immutable issuance snapshots with template/render data/HTML hashes and export checksums.
- Moved generated PDF/XLSX files to private tenant-scoped storage.
- Added secure view, inline PDF, print, PDF download, Excel download, and local reveal actions.
- Added server-side finance document search, filters, sorting, and pagination.
- Added ARCHI LBO company and Marrakech branch data sourced from the supplied receipt workbook.

## Database Changes

- Added `companies`, `branches`, and `finance_activity_logs`.
- Added tenant columns to users, finance documents, payments, expenses, and finance templates.
- Added issuance snapshot and checksum columns to finance documents.
- Migrated legacy finance rows when their document numbers are not already present.
- Final scope audit: 31 documents, 11 payments, 56 expenses, and 4 templates; zero unscoped rows and zero users without a company.

## New Routes

- `finance.documents.view`
- `finance.documents.view-pdf`
- `finance.documents.print`

## New Permissions

- `finance.view`
- `finance.documents.create|update|issue|cancel|delete`
- `finance.payments.view|create|update|reverse`
- `finance.expenses.view|create|update|delete`
- `finance.templates.view|manage`
- `finance.settings.view|update`
- `finance.reports.export`

## Commands Run

```powershell
php artisan migrate --force
php artisan db:seed --force
php artisan finance:migrate-private-files
php artisan optimize:clear
npm.cmd run build
php artisan test
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-export-qa
php artisan archilbo:finance-document-lock-guard-qa
```

## Build/Test Result

- Migration passed.
- Seed passed.
- Private file migration verified 7 files with 0 missing.
- Frontend build passed.
- Laravel tests passed: 5 tests, 25 assertions.
- All three finance QA commands passed.
- Existing Vite large-bundle and optional `fontaine` notices remain warnings only.

## Important Decisions

- Existing originals are preserved until a private copy is verified; public generated copies are removed only after successful migration.
- Issued document content is immutable, while payment totals and lifecycle status remain mutable.
- The supplied workbook was used only for company/branch values it actually contains; no tax or bank identifiers were invented.

## How To Test

1. Open `/finance`, switch between Devis and Factures, search, filter, and paginate.
2. Generate a draft and confirm it becomes issued and locked.
3. Open View, Print, Download PDF, and Download Excel; confirm no storage path appears in page props.
4. Register a payment and confirm the receipt inherits company/branch scope.
5. Log in as staff/viewer and confirm backend permissions restrict sensitive actions.

## Known Issues

- The production JS bundle remains large and should be code-split in a separate performance step.
- Global company settings predate tenant scoping; finance records and files are scoped, while a future settings migration should make settings company-specific before adding a second company.

## Next Recommended Step

Add focused feature tests for cross-company denial, immutable snapshot regeneration, and secure file response headers, then code-split the finance workspace.

---

# AI Work Report

## Date

2026-07-18

## Step Completed

Finance template database visibility and rename workflow.

## What Was Built

- The Templates workspace now opens the first document type that actually has persisted templates instead of showing an empty Devis tab.
- Selected template state refreshes after Inertia updates, including rename operations.
- Added rename actions to template rows and the selected-template toolbar menu.
- Added a validated, policy-protected rename endpoint and finance activity log event.
- Template slugs remain immutable during rename to protect document and version references.

## Files Created

- `app/Http/Requests/Finance/RenameDocumentTemplateRequest.php`
- `app/Services/Finance/RenameFinanceTemplateService.php`
- `tests/Feature/FinanceTemplateManagementTest.php`

## Files Modified

- `app/Http/Controllers/Finance/DocumentTemplateController.php`
- `app/Http/Resources/DocumentTemplateResource.php`
- `routes/web.php`
- `resources/js/features/finance/types.ts`
- `resources/js/pages/Finance/Templates/Index.tsx`
- `resources/js/pages/Finance/Templates/components/TemplateList.tsx`
- `resources/js/pages/Finance/Templates/components/TemplateToolbar.tsx`

## New Routes

- `PATCH /finance/templates/{documentTemplate}/rename` (`finance.templates.rename`)

## Commands Run

```powershell
npm.cmd run build
php artisan test --filter=FinanceTemplateManagementTest
php artisan test
```

## How To Test

1. Open `/finance/templates`; the first template type present in the database should be selected automatically.
2. Use the pencil action on a template row or choose Rename from the toolbar menu.
3. Rename it and verify the list and editor title update without changing its slug.

## Next Recommended Step

Add template archive/restore controls so unused templates can be hidden without deleting their history.

## Embedded Finance Tab Correction

- Corrected `/finance/documents?tab=templates`, which previously rendered only `defaultTemplates` and incorrectly showed an empty state when persisted templates were not marked default.
- The tab now renders every company/branch-scoped template from the database.
- Added default status, slug, update time, direct editor navigation, and same-page rename controls.
- Consolidated the controller to one template query shared by the tab and finance document drawers.
- Focused result: 3 tests passed with 25 assertions; frontend production build passed.

---

# AI Work Report

## Date

2026-07-18

## Step Completed

Finance workspace UI modernization, phase 1.

## What Was Built

- Replaced the oversized generic Finance page header with a compact Finance command center.
- Added responsive icon tabs with active-state contrast, horizontal overflow protection, and live record counts.
- Reduced KPI card size and changed the overview to six columns on wide screens.
- Standardized document, payment, expense, and monthly surfaces with compact 8px containers and responsive toolbars.
- Added a searchable/filterable template management workspace with direct edit and rename actions.
- Replaced the sparse settings tab with a structured settings summary and working configuration action.
- Preserved the existing dark-gold theme and every Finance workflow.

## Files Created

- `resources/js/features/finance/components/FinanceWorkspaceHeader.tsx`
- `resources/js/features/finance/components/FinanceTemplateManager.tsx`
- `resources/js/features/finance/components/FinanceSettingsSummary.tsx`

## Files Modified

- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `resources/js/features/finance/components/FinanceTabs.tsx`
- `resources/js/features/finance/components/MetricSparklineCard.tsx`
- `resources/js/features/finance/components/ExpensesWorkspace.tsx`
- `resources/js/features/finance/components/FinanceMonthlySummary.tsx`

## Commands Run

```powershell
npm.cmd run build
npx.cmd tsc --noEmit --ignoreDeprecations 6.0
php artisan test
php artisan route:list --name=finance --except-vendor
```

## Build/Test Result

- Production build passed.
- Laravel suite passed: 8 tests, 50 assertions.
- New Finance components have no TypeScript diagnostics.
- The full TypeScript command remains blocked by pre-existing project-wide HeroUI wrapper and declaration errors.
- Existing large-bundle and optional `fontaine` notices remain warnings only.

## How To Test

1. Open `/finance` or `/finance/documents` and test every Finance tab.
2. Resize through desktop, tablet, and mobile widths; tabs should scroll horizontally without clipping.
3. Test the four command-center actions: payment, expense, invoice, and quote.
4. Search/filter templates, rename one, and open its editor.
5. Open Parameters and confirm the configuration button routes to Finance settings.

## Next Recommended Step

Extract the document and payment workspaces from the large Finance index, then standardize their tables on the shared data-table wrapper and code-split heavy Finance charts/editor modules.

## Finance Theme And Tabs Refinement

- Added a HeroUI v3 token bridge so library primitives inherit the ARCHI LBO dark-gold surfaces, borders, fields, focus states, and semantic colors.
- Updated the shared `AppButton` and `AppInput` adapters to use supported HeroUI v3 variants and props while preserving existing call-site compatibility.
- Removed the decorative yellow line from the Finance workspace header.
- Reworked Finance tabs into compact raised dark tiles. The active tab now uses a gold icon treatment and a slim bottom marker instead of a full yellow fill.
- Production build passed.
- Focused TypeScript validation reported no errors in the changed wrappers or Finance header/tabs.
- Laravel suite passed: 8 tests, 50 assertions.
- Existing optional `fontaine` and large bundle notices remain non-blocking build warnings.

## Finance Filter Tabs Refinement

- Added reusable `AppFilterTabs` for compact, accessible secondary filtering.
- Replaced repeated document status/type chips and expense category chips with the shared control.
- Added clear selected states, per-filter reset actions, keyboard focus treatment, and horizontal overflow behavior for narrow screens.
- Kept the ARCHI LBO dark-gold palette and existing server-side document filtering behavior.
- Production build passed. Existing unrelated Finance TypeScript diagnostics remain in lock-badge and confirmation-dialog call sites.
- Aligned the Templates workspace with the Documents toolbar: matching compact search field, collapsible filter trigger, active-filter indicator, result count, shared filter tabs, and per-type template counts.
- Added an accessible close action to the template editor toolbar. Its destination is supplied by Laravel's named `finance.documents.index` route and returns to the Templates tab.

## Template Editor Reliability Pass

- Fixed placeholder insertion incorrectly producing nested braces such as `{{{{company.name}}}}`; registry values are now inserted exactly as stored.
- Added ARCHI LBO dark-gold CodeMirror surface, gutter, cursor, selection, and active-line styling.
- Added native CodeMirror `Ctrl/Cmd+S` handling and visible save/saving/saved states.
- Disabled duplicate saves and saves when the template has no changes.
- Added validation feedback for unsafe scripts, unknown placeholders, missing item tables, and empty content.
- Protected dirty templates on editor close and browser/tab exit.
- Prevented exact server preview from presenting stale output when the current draft is unsaved.
- Made template metadata fields responsive and clarified template search/list labels.
- Production build passed; Laravel suite passed with 8 tests and 50 assertions.
- Pre-existing page-level TypeScript diagnostics remain around the project ES target, an uninitialized ref, and Inertia request payload typing.

## Template Editor HeroUI And Actions Cleanup

- Migrated template toolbar buttons, type controls, overflow menu, metadata inputs/selects, list search, and variable search to HeroUI v3 or the shared HeroUI-backed adapters.
- Kept CodeMirror as the intentional code-editor dependency while retaining ARCHI LBO theme tokens.
- Replaced the hand-built overflow popover with a typed HeroUI `Dropdown` and a closed `TemplateActionId` union.
- Removed duplicated `Exact preview` and global `Reset default` commands from selected-template actions.
- The action menu now contains only Versions, Define as default, Rename, Duplicate, and Delete.
- Removed unused reset URLs from the Inertia template-editor payload.
- Focused TypeScript validation for migrated editor components passed; production build and Laravel tests passed.

## Finance Tables UI And Contract Cleanup

- Added one shared Finance table visual contract for document, payment, expense, monthly, document-detail, and editable item tables.
- Standardized sticky headers, 44px operational rows, tabular numeric alignment, subtle zebra separation, hover states, and action visibility.
- Added stable horizontal overflow only where wide desktop tables require it; expense records now render as dedicated mobile cards instead of a 900px scrolling table.
- Removed unsupported HeroUI v2 `isIconOnly` usage from Finance table actions.
- Migrated the shared confirmation dialog to HeroUI v3 and corrected Finance lock-badge, popover placement, and disabled-input contracts.
- Added v2-compatible `isDisabled` mapping inside the shared HeroUI-backed `AppInput` adapter.
- Corrected remaining malformed Finance separator/receipt labels encountered during the UI audit.
- Focused TypeScript validation passed for all changed table/control files. Production build passed; Laravel suite passed with 8 tests and 50 assertions.

## Finance Pagination And Column Sorting

- Added reusable accessible sortable headers with ascending/descending indicators for Finance tables.
- Added server-side sorting to documents, payments, and expenses through whitelisted database columns.
- Added namespaced server-side search, filtering, page, direction, and page-size parameters for payments and expenses.
- Removed the duplicate client pagination that previously paginated an already paginated server response.
- Added sortable columns and client pagination to the aggregated monthly ledger.
- Updated Finance tab counts to use paginator totals and translated the shared pagination controls to French.
- Production build passed; full Laravel suite passed with 8 tests and 50 assertions.
