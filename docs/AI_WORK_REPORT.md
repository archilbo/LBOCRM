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

## Finance Table Actions Consolidation

- Added a reusable `FinanceRowActions` component backed by HeroUI Dropdown and the shared accessible action button.
- Standardized document, payment, expense, legacy Finance, and editable line-item table actions.
- Limited visible row commands to the one or two most useful actions and moved secondary commands into a keyboard-accessible overflow menu.
- Grouped preview, file generation/download, payment, workflow, and destructive actions with clear labels and semantic tones.
- Removed hover-only custom menus and prevented action clicks from triggering parent row navigation.
- Updated action styling to the ARCHI LBO dark-gold theme with compact sizing, visible focus, pressed, disabled, success, and danger states.
- Production build passed; full Laravel suite passed with 8 tests and 50 assertions.

## Finance Table Pagination Coverage

- Audited every Finance data table and confirmed server pagination remains active for documents, payments, and expenses.
- Confirmed the legacy Finance overview uses TanStack client pagination and the monthly ledger uses the shared paginator.
- Added reusable client pagination to finance document detail lines, document detail payments, and editable document line items.
- New document lines automatically open on the final page, while deletion safely clamps the selected page to the remaining range.
- Pagination controls remain hidden for one-page datasets to keep compact tables uncluttered.
- Printable previews and generated template HTML are intentionally not paginated because they represent document output rather than application data tables.
- Production build passed.
# Inbox architecture and product upgrade - 2026-07-20

## Step Completed

Inbox architecture, performance, security, realtime, and responsive UX stabilization.

## What Was Built

- Tenant-scoped, paginated conversation listing and full server message search.
- Unique direct-thread keys, participant roles/preferences, bulk read tracking, presence, drafts, retries, shared files, and activity logs.
- Private storage for new chat attachments with secure view/download routes.
- One responsive details panel with media, context links, archive, pin, mute, and mark-unread actions.
- Configurable message edit/delete windows and queued chat notifications.

## Database Changes

- Added Inbox company/branch scope, direct keys, participant roles/preferences/read pointer, attachment storage paths, and `chat_activity_logs`.
- Migration `2026_07_20_100000_harden_inbox_architecture` applied successfully.

## Commands Run

- `php artisan migrate --force` - passed.
- `php artisan optimize:clear` - passed.
- `php artisan test tests/Feature/InboxArchitectureTest.php` - 5 tests, 16 assertions passed.
- `npm.cmd run build` - passed with existing bundle-size/font fallback warnings.

## Known Issue

- New attachments are private. A maintenance command for physically moving historical public attachment copies was not added because workspace permission review timed out; schedule this before production exposure.

## Next Recommended Step

Run two-user browser QA for presence, typing, archive, search, retry, and responsive details behavior, then relocate legacy public attachment copies.

# Inbox HeroUI UX and realtime completion - 2026-07-20

## Step Completed

Rebuilt the Inbox interaction layer with HeroUI v3 and completed realtime group/read synchronization.

## What Was Built

- Replaced legacy/raw conversation controls with HeroUI Drawer, Modal, Popover, Tabs, SearchField, Input, Select, Checkbox, Button, Avatar, Chip, Card, ScrollShadow, Spinner, and Tooltip components.
- Reorganized the conversation list around search, status tabs, group categories, online users, draft previews, unread counts, pin/mute/archive actions, and incremental loading.
- Modernized message bubbles, attachment grids, image preview, forward selection, inline search, reply/edit states, typing presence, retry, and the compact message composer.
- Rebuilt group creation and group management with searchable participants, categories, membership controls, and responsive HeroUI surfaces.
- Removed the duplicate compact-screen thread header and moved back/search/info/group actions into the canonical thread header.
- Replaced the duplicated details overlays with one information model rendered as a collapsible desktop rail or responsive HeroUI Drawer.
- Upgraded the global message popover to the same HeroUI and dark-gold visual contract.

## Backend And Realtime

- Added the `MessagesRead` broadcast event so sender read indicators update without refresh.
- Centralized participant-wide conversation refresh broadcasts in `ChatService`.
- Group rename, participant addition, and participant removal now update every affected Inbox in realtime.
- Removed participants immediately lose the conversation from their local list.
- Added focused regression coverage for the read-receipt event.

## Files Created

- `app/Events/Chat/MessagesRead.php`
- `resources/js/features/inbox/components/InboxIconButton.tsx`

## Main Files Modified

- `app/Http/Controllers/ConversationController.php`
- `app/Services/Chat/ChatService.php`
- `resources/js/pages/Inbox/Index.tsx`
- `resources/js/features/inbox/components/ConversationList.tsx`
- `resources/js/features/inbox/components/MessageThread.tsx`
- `resources/js/features/inbox/components/NewConversationDrawer.tsx`
- `resources/js/features/inbox/components/ConversationInfoPanel.tsx`
- `resources/js/features/inbox/components/MessagePopover.tsx`
- `tests/Feature/InboxArchitectureTest.php`

## Commands Run

- `npm.cmd run build` - passed; existing bundle-size and optional font fallback warnings remain.
- `php artisan test tests/Feature/InboxArchitectureTest.php` - 5 tests and 17 assertions passed.
- `php artisan test` - 13 tests and 67 assertions passed.
- `php artisan optimize:clear` - passed.

## Known Issues

- Historical chat attachments stored on the legacy public disk still need a controlled one-time migration to private storage.
- Production bundle code splitting remains a broader frontend performance task; this change does not add new runtime packages.

## Next Recommended Step

Complete two-user browser QA for group changes, read receipts, typing, attachment preview, and the responsive details drawer, then schedule the legacy attachment migration.

## Inbox Tabs Runtime Fix

- Removed the manually rendered HeroUI `Tabs.Indicator` from the conversation filters.
- HeroUI now owns the underline indicator through the selected tab context, preventing the `SharedElementTransition` runtime exception.

## Inbox Compact Chat UX Follow-up

- Restored the `conversationName` helper import used by Inbox search, fixing the runtime `ReferenceError`.
- Added icon-led, non-wrapping conversation tabs and compact online avatars.
- Reduced conversation rows to a modern operational density with presence, unread, category, pin, mute, preview, and overflow states.
- Redesigned received and sent messages with grouped sender avatars, chat tails, and side-mounted reply/forward/overflow actions.
- Reworked forwarding into a compact recipient picker with previews, removable selected avatars, and recipient count.
- Replaced the hidden double-click message deletion behavior with an explicit HeroUI confirmation modal.

## Inbox Reference-led Visual Redesign

- Reworked the Inbox around the reference applications' flat three-column hierarchy while preserving the ARCHI LBO dark-gold theme.
- Removed card-per-row styling from conversations and members; column separators and selected states now carry hierarchy.
- Reduced the conversation rail to 350px and the details rail to 292px to prioritize the message canvas.
- Added a fixed-height identity header, centered message lane, quiet canvas surface, line-based date separators, grouped sender avatars, and natural-width chat bubbles.
- Rebuilt the composer as a floating HeroUI card with a paperclip action, borderless text area, and circular send button.
- Made message actions pointer- and touch-safe: quick actions appear beside hovered bubbles and the full overflow menu remains available on compact screens.
- Added icon-led linked-context actions and flattened member rows in the details panel.

## Contract Print Hotfix V1

- Corrected the Contract Print installer assertions so they validate literal JavaScript template expressions without PowerShell interpolation.
- The installer now opens contract print PDFs in a new tab with `noopener,noreferrer`; the controller serves the generated PDF inline from the protected flow.
- Kept the focused lint gate active while excluding two existing React Hooks rules unrelated to this print-only patch.

### Files Modified

- `_contract-print-hotfix-v1/install-contract-print-hotfix-v1.ps1`
- `app/Http/Controllers/ContractController.php`
- `resources/js/pages/Contracts/Index.tsx`

### Verification

- `npm run build` passed before and after the hotfix.
- `php -l app/Http/Controllers/ContractController.php` passed.
- `php artisan route:list --name=contracts.print` found the route.
- Focused ESLint passed with three pre-existing unused-variable warnings.

## Project Design Zoom Viewport Fix

- Kept the Project Design tab and editor workspace as bounded flex children in normal mode.
- Moved the zoomed PDF page into an absolutely positioned, clipped viewport so its rerendered canvas cannot increase the parent height or the Konva overlay dimensions.
- Zoom and pan now remain internal to the viewer in both normal and fullscreen editor modes.

### Files Modified

- `resources/js/features/dossiers/components/DesignTab.tsx`
- `resources/js/features/dossiers/components/PdfDesignViewer.tsx`
- `resources/js/features/project-design/components/ProjectDesignTabContent.tsx`

### Verification

- `npm.cmd run build` passed.

### KPI Visual Follow-up

- Simplified the KPI rail into compact horizontal metrics: icon, label, divider, and value. Supporting KPI context remains available to assistive technology without adding visual noise.

### KPI Card Visual Direction

- Replaced the compact KPI rail with equal live-data metric cards inspired by the approved reference: quiet title row, colored module icon, strong value, and real contextual helper text.
- Cards keep the ARCHI LBO dark surfaces, gold accent, and responsive equal-column layout without introducing decorative or fake chart data.

## Project Design Remarks Inspector UX

- Redesigned the right-sidebar Remarks tab as a compact annotation review queue.
- Added open/resolved counters, stronger selected-state feedback, severity and workflow status hierarchy, owner initials, due-date and drawing context.
- Preserved annotation focus and description expansion behavior.

### Files Modified

- `resources/js/features/dossiers/components/DesignInspector.tsx`

### Verification

- `npm.cmd run build` passed.

## Project Design Remarks Inspector Layout Revision

- Replaced the nested-card remarks treatment with a single flat inspector surface and divider-based rows.
- Kept the dark-gold system language through subtle active rails, compact count indicators, and restrained hover states.
- Each row now keeps focus, owner, severity, status, file/version, due date, and description actions in one operational scan path.

### Verification

- `npm.cmd run build` passed.

## Project Design Remarks Detail Cards

- Replaced the flat rows with readable modern review-detail cards for the inspector sidebar.
- Increased title, metadata, and description sizes for practical desk use.
- Added a structured card header, body, and footer; long descriptions collapse after three lines and can be expanded per remark.
- Covered selected, resolved, unassigned, missing description, missing file, missing due-date, and long-text states.

### Verification

- `npm.cmd run build` passed.

## Project Design Remarks Compact Inspector List

- Removed the oversized nested detail cards after visual review.
- Rebuilt remarks as readable, compact issue rows with a small summary header and expandable detail area.
- Kept titles and metadata at practical sizes while hiding description/file/due detail until the user expands a row.

### Verification

- `npm.cmd run build` passed.

## Project Design Editor Upgrade - Step 1: Review Navigation

- Added a shared frontend remark-workflow configuration for filters and open/closed status handling.
- Added inspector filters for all, open, assigned, in-progress, and resolved remarks.
- Added previous/next navigation across open remarks, reusing the existing secure annotation-focus flow.
- Added a clear empty state when no remark matches the selected filter.

### Files Created

- `resources/js/features/project-design/config/remarkWorkflow.ts`

### Files Modified

- `resources/js/features/dossiers/components/DesignInspector.tsx`

### Verification

- `npm.cmd run build` passed.

### Next Step

- Add direct assignment, due-date, and status workflow actions with backend policy enforcement.

## Project Design Editor Upgrade - Step 2: Direct Remark Workflow

- Added a dedicated update request and action so remark updates no longer rely on view-only access.
- Enforced company and dossier scope, backend status-transition rules, granular assignment/address/verification/reopen permissions, and activity audit entries.
- Added compact in-place actions to expanded remarks: assign the current user, set or clear a due date, start work, mark addressed, verify, resolve, and reopen when the user has the matching permission.
- Kept live Project Design broadcasts and TanStack query invalidation so each update is reflected across the workspace.
- Extended the existing remark severity enum to cover the current composer’s cosmetic and question values.

### Files Created

- `app/Actions/ProjectDesign/UpdateProjectDesignRemarkAction.php`
- `app/Http/Requests/ProjectDesign/UpdateProjectDesignRemarkRequest.php`

### Files Modified

- `app/Enums/ProjectDesign/ProjectDesignRemarkSeverity.php`
- `app/Http/Controllers/ProjectDesignController.php`
- `app/Policies/ProjectDesignPolicy.php`
- `resources/js/features/dossiers/components/DesignInspector.tsx`
- `resources/js/features/project-design/api/projectDesignApi.ts`
- `resources/js/features/project-design/components/ProjectDesignTabContent.tsx`
- `resources/js/features/project-design/config/remarkWorkflow.ts`
- `resources/js/features/project-design/types/projectDesign.ts`

### Verification

- `npm.cmd run build` passed.
- `php -l` passed for the new request/action, controller, and policy.
- `php artisan test --filter=ProjectDesign` passed: 40 tests, 116 assertions.
- Repository-wide `npm.cmd run typecheck` still reports pre-existing HeroUI migration/type issues outside this step. The Project Design files changed in this step are clear after the local selector prop correction.

### Next Step

- Add viewer navigation aids: page thumbnails, stronger remark-to-page context, and focused review shortcuts.

## Project Design Editor - Stable Normal Workspace Height

- Kept the Dossier Show page in its standard scrollable application shell.
- Gave the normal Project Design editor a stable responsive height (`clamp(34rem, 72dvh, 56rem)`) inside the Project Design tab.
- The editor panes remain internally bounded, while the surrounding dossier header, workflow, metrics, and other content remain reachable through normal page scrolling.

### Files Modified

- `resources/css/app.css`
- `resources/js/features/dossiers/components/DesignTab.tsx`
- `resources/js/pages/Dossiers/Show.tsx`

### Verification

- `npm.cmd run build` passed.
- `php artisan test --filter=ProjectDesign` passed: 40 tests, 116 assertions.

## Client Finance Template Schema Compatibility

### What Was Fixed

- Added the reusable `FinanceTemplate::active()` query scope.
- The scope applies the `is_active` filter only when the current database actually has that optional column.
- Updated the client workspace finance-template query to use the shared scope, so opening a client no longer fails on older local finance-template schemas.

### Files Modified

- `app/Models/FinanceTemplate.php`
- `app/Http/Controllers/ClientController.php`

### Verification

- Confirmed the active `archi_lbo_os` database does not currently contain `finance_templates.is_active`.
- `php -l app/Models/FinanceTemplate.php` passed.
- `php -l app/Http/Controllers/ClientController.php` passed.
- `php artisan test --filter=Finance --stop-on-failure` passed: 6 tests, 47 assertions.

## Client Finance Document Actions

### What Was Added

- Client project Finance now receives the canonical `FinanceDocumentResource` payload rather than a reduced duplicate document shape.
- Added one shared finance document action definition used by the Finance list and the Client Finance tab.
- Devis actions: open, edit, preview, print, PDF/Excel generation and download, accept, reject, convert to invoice, cancel, and delete.
- Facture actions: open, edit, preview, print, PDF/Excel generation and download, register payment, cancel, and delete.
- Reçu actions: open, edit, preview, print, PDF/Excel generation and download, cancel, and delete.
- Edit opens the existing Finance Document drawer. Invoice payment opens the existing Payment drawer. Lifecycle updates reload the Client workspace without leaving the page.
- Quote conversion now supports a validated local `return_to` path, allowing Client workspace conversion to remain on the current client page while preserving the Finance page's existing default redirect.

### Files Modified

- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `app/Http/Requests/Finance/ConvertQuoteToInvoiceRequest.php`
- `app/Http/Resources/FinanceDocumentResource.php`
- `app/Services/Clients/ClientWorkspaceService.php`
- `resources/js/features/clients/components/ClientFinanceTab.tsx`
- `resources/js/features/clients/types.ts`
- `resources/js/features/finance/components/FinanceDocumentActions.tsx`
- `resources/js/features/finance/types.ts`
- `resources/js/pages/Clients/Show.tsx`
- `resources/js/pages/Finance/Documents/Index.tsx`

### Verification

- Client 9 workspace serialization passed against the active database.
- `npm.cmd run build` passed.
- `php artisan test --filter=Finance --stop-on-failure` passed: 6 tests, 47 assertions.

### Follow-up

- The Client Finance `Ouvrir la fiche` action now uses same-tab Inertia navigation to the finance document detail page. File preview, print, and downloads retain their separate file-view behavior.
- Added a `Paiement` shortcut beside the Client Finance `Facture` and `Nouveau devis` shortcuts.
- Finance document editing now pre-fills and disables the linked client and dossier fields. The update payload omits these fields and the controller preserves them, preventing accidental reassignment for devis, factures, and reçus.
- Creating a finance document from a Client Finance tab now pre-fills both the current client and selected dossier. Editing continues to pre-fill both values from the existing finance document.
- Corrected the shared Client/Dossier HeroUI selectors to use the single-select controlled API, so prefilled values render in the visible triggers. The Client Finance payment drawer also prefilters to the active client.
- Corrected the Payment drawer's Client, Facture, and payment-method HeroUI selectors to use the same controlled single-select API. Client context is locked on the Client Finance page; an invoice-row payment also locks its linked invoice, while the header payment action still lets the user choose among the current project's invoices.
- The header `Paiement` flow keeps the facture selector enabled even when no payable invoice is currently available; only an invoice-row payment locks that invoice.
- The payment drawer now explains when a client has no selectable invoice because every active invoice is already fully paid, while preserving the backend rule that prevents overpayment.
- The Client Finance tab now exposes an authorized payment-reversal action for each listed payment. It uses the existing payment ledger deletion route, cancels the linked receipt, recalculates the invoice, and refreshes the same Client workspace.
- Finance document and payment numbering now reserve numbers held by soft-deleted records, preventing duplicate receipt numbers during later payment creation or QA runs.
- Finance document drawers now preserve an authorized Client Finance return path after create or edit. Deleting a receipt now reverses and soft-deletes its linked payment through the ledger before removing the receipt, so invoice totals remain accurate.
- `npm.cmd run build` and `php artisan test --filter=Finance --stop-on-failure` passed again: 6 tests, 47 assertions.

## Shared Clients And Projects Table Pattern

### What Changed

- Added `AppWorkspaceTable`, a typed shared CRM table shell with a compact toolbar slot, configurable columns, row actions, mobile-row support, empty states, and a pagination footer slot.
- Wrapped the established Projects table in the shared shell without changing its filters, rows, drawer preview, actions, or pagination behavior.
- Replaced the Clients page's separate legacy HeroUI table markup with `AppWorkspaceTable` and client-specific column definitions.
- Clients now follow the Projects list pattern: compact search, a status filter with result counts, sortable headers, compact quick actions, responsive rows, and 15-row pagination.

### Files Created

- `resources/js/components/ui/AppWorkspaceTable.tsx`

### Files Modified

- `resources/js/pages/Dossiers/Index.tsx`
- `resources/js/pages/Clients/Index.tsx`

### Verification

- `npm.cmd run build` passed.
- Existing Vite notices remain: optional `fontaine` font fallbacks and large generated chunks.

### How To Test

- Open `/clients`, search, change the status filter, sort a column, use row actions, and navigate pagination.
- Confirm a client row still opens its existing workspace and Edit still opens the same client drawer.
- Open `/dossiers` and confirm its existing list behavior is unchanged.

## Finance Document Creation Hotfix

### What Changed

- Restored `FinanceSettingsService::getDefaultPaymentTerms()`.
- New finance documents now read their default terms from the existing `finance.payment_terms` company setting instead of failing during creation.

### Files Modified

- `app/Services/Finance/FinanceSettingsService.php`

### Verification

- PHP syntax check passed.
- Direct application lookup resolved `Paiement à réception` from settings.
- `php artisan test --filter=Finance --stop-on-failure` passed: 6 tests, 47 assertions.

## Client Finance Workspace

### What Changed

- Replaced the Client workspace Finance tab placeholder with a selected-project finance workspace.
- The tab now shows real backend totals for devis, invoiced amount, payments received, and outstanding invoice balance.
- Added real finance document rows with backend type/status labels, view, and generated-file download actions.
- Added related payment history and quick actions to create a devis/facture or open the full filtered Finance workspace.
- Client finance creation now receives company-scoped active finance templates and configured finance settings from the backend, instead of hardcoded drawer defaults.

### Files Created

- `resources/js/features/clients/components/ClientFinanceTab.tsx`

### Files Modified

- `app/Enums/FinanceDocumentStatus.php`
- `app/Http/Controllers/ClientController.php`
- `app/Services/Clients/ClientWorkspaceService.php`
- `resources/js/features/clients/types.ts`
- `resources/js/pages/Clients/Show.tsx`

### Verification

- PHP syntax checks passed for modified backend files.
- `npm.cmd run build` passed.
- `php artisan test --filter=Finance --stop-on-failure` passed: 6 tests, 47 assertions.

## Client Document Preview, Storage Location, Download And Print

### What Was Built

- Added secure document preview, download, and print routes for dossier documents.
- Added a dedicated `DossierDocumentFileService` to resolve the stored private file, return no-store file responses, detect browser-previewable formats, and provide a safe logical folder label.
- Added `DossierDocumentPolicy` and applied it to all document controller actions using the existing `manage documents` permission.
- Extended the client workspace payload with file availability, preview/print/download URLs, size, MIME type, and a safe display location such as `DOS-2026-0001 / Documents`.
- Updated Client > Documents rows with compact View, Print, and Download controls. Preview and print are intentionally disabled for formats that browsers cannot render safely, while download stays available.

### Files Created

- `app/Services/Documents/DossierDocumentFileService.php`
- `app/Policies/DossierDocumentPolicy.php`

### Files Modified

- `app/Http/Controllers/DocumentController.php`
- `app/Http/Resources/DossierDocumentResource.php`
- `app/Providers/AppServiceProvider.php`
- `app/Services/Clients/ClientWorkspaceService.php`
- `routes/web.php`
- `resources/js/pages/Clients/Show.tsx`
- `resources/js/features/clients/types.ts`
- `resources/js/locales/en.ts`

### Security And Behavior

- File storage remains private. The client receives routes and a logical folder name only, never an absolute private path.
- Preview and print accept PDFs, images, and plain text. Other uploads can still be downloaded.
- File responses include private/no-store cache headers and `X-Content-Type-Options: nosniff`.

### Verification

- PHP syntax checks passed for all changed PHP files.
- `php artisan route:list --name=documents` confirms `documents.view`, `documents.print`, and `documents.download`.
- `php artisan test --filter=Document --stop-on-failure` passed: 4 tests, 34 assertions.
- `npm.cmd run build` passed. Existing Vite warnings remain for optional `fontaine` and large chunks.

### How To Test

- Open a client, select the Documents tab, and choose a project with uploaded documents.
- Use the eye icon to preview a PDF or image, the printer icon to open the browser print dialog, and the download icon for any stored document.
- Confirm the visible location is a logical dossier folder label, not a Windows or storage-server path.

### Preview Response Follow-up

- Replaced the storage adapter stream response with Laravel's direct `BinaryFileResponse` for dossier-document view and download routes.
- This matches the existing message-attachment preview behavior and correctly serves private PNGs with `image/png` and `Content-Disposition: inline`.
- Verified document `17` is a valid image and the secure response headers are correct; focused document tests still pass.

### Client Document Replacement And Deletion

- Added `documents.replace`, which preserves the dossier-document record while securely replacing its private file, MIME type, size, upload timestamp, and optional status/notes.
- The previous private file is removed only after the replacement has been stored successfully.
- Added compact Replace and Delete actions beside View, Print, and Download in Client > Documents.
- Reused the existing document upload drawer in replacement mode with its client/project context locked.
- Added a confirmation modal for deletion and changed document deletion redirects to return to the current workspace.

### Files Added Or Updated

- `app/Http/Requests/ReplaceDossierDocumentRequest.php`
- `app/Http/Controllers/DocumentController.php`
- `routes/web.php`
- `resources/js/components/drawers/entities/DocumentDrawer/index.tsx`
- `resources/js/pages/Clients/Show.tsx`
- `resources/js/locales/en.ts`

### Verification

- `php -l` passed for the replacement request and document controller.
- `php artisan route:list --name=documents` confirms `documents.replace`.
- `npm.cmd run build` passed.
- `php artisan test --filter=Document --stop-on-failure` passed: 4 tests, 34 assertions.

## Shared KPI Card Consolidation

### What Was Built

- Added `resources/js/components/ui/AppKpiCard.tsx` as the single shared KPI presentation component.
- It supports real sparkline data, optional trends, icon/value/detail content, semantic colors, and pressable/filter states.
- Removed the Finance-owned `MetricSparklineCard` duplicate.

### Pages Migrated

- Finance workspace and monthly summary
- Tasks overview
- Dashboard and legacy dashboard KPI wrapper
- Clients, intermediaries, contracts, and planning
- Authorizations, archives, archive reports, operations reports, and user management

### Important Decisions

- Only Finance and Tasks render sparklines because they provide genuine time-series data.
- Summary and filter KPI cards use the same component without invented chart history. Archive filter behavior is retained.

### Verification

- `npm.cmd run build` passed after extraction and after the full migration.

## Clients HeroUI Migration

### What Changed

- Audited `resources/js/pages/Clients/Index.tsx` against the shared frontend rules and preserved its existing backend props, client-side filtering/sorting, drawer submissions, row navigation, and delete confirmation.
- Replaced native interactive controls with HeroUI `Input`, `Select`, `ListBox`, `Dropdown`, and `Table` composites, plus the existing HeroUI-backed `AppButton` wrapper.
- Replaced the custom click-outside action menu with a keyboard-accessible HeroUI dropdown menu.
- Kept the page on the shared `AppKpiCard`; no local KPI card was reintroduced.

### Verification

- `npm.cmd run build` passed.
- A focused source audit confirms no native `button`, `input`, `select`, or table tags remain in the Clients index page.

### KPI Follow-up

- Added status-specific icons and dark-theme colors to all Clients KPIs: sky for total, emerald for active, amber for inactive, and zinc for archived.

## Dashboard KPI Alignment And In-Place Client Command

### What Changed

- Reworked the primary KPI rail into equal, centered metric cells: icon, label, value, and supporting context now align vertically within every KPI.
- The dashboard quick-action Client command now opens the existing client creation drawer directly over the dashboard and submits through the existing validated `/clients` endpoint.
- Reused the shared `ClientDrawer`; no dashboard-specific client form was introduced.

### Security Decision

- Client and dossier legacy tables do not yet contain company/branch ownership columns. The dashboard therefore does not preload client or dossier selector lists, preventing a new cross-tenant data exposure path.
- Project, document, finance, task, and conversation commands continue to use their established pages until the related selector data has an auditable tenant scope.

### Files Created

- `resources/js/features/dashboard/components/DashboardClientActionDrawer.tsx`

### Files Modified

- `resources/js/pages/Dashboard.tsx`

### Verification

- `npm.cmd run build` passed.

### How To Test

- On Dashboard, confirm all five KPI cells have identical width and vertically centered content.
- In the compact quick-action row, select the Client icon. The New Client drawer should open without leaving Dashboard; submit a valid client and confirm the drawer closes with a success toast.

### Next Recommended Step

- Introduce company/branch ownership and policy-scoped option queries for legacy clients/dossiers, then safely mount the remaining project, document, finance, task, and conversation commands in the dashboard.

## Tasks Operations Workspace Refinement

### What Changed

- Rebuilt the Tasks page hierarchy around the Finance workspace pattern: one compact operations header, grouped commands, one filter/view control bar, then the active task view.
- Removed the duplicate top-level task view tabs; the existing filter bar remains the single source of truth for Overview, Board, List, Table, Timeline, and Calendar views.
- Refined the task overview with HeroUI cards using live task metrics, clearer operational widgets, and the same dark/gold visual language as Finance and Dashboard.
- Added `currentUserId` to the existing task query payload so the “My focus” widget now shows tasks assigned to the signed-in user instead of falling back to global urgent work.

### Files Modified

- `app/Services/Task/TaskQueryService.php`
- `resources/js/pages/Tasks/Index.tsx`
- `resources/js/features/tasks/components/TaskOverview.tsx`

### Backend Work

- Preserved the existing thin controller, request validation, mutation service, status route, drag-and-drop updates, checklist updates, comments, and attachments.
- The authenticated user ID is now returned as a small scalar alongside the already-authorized task payload.

### Verification

- `php -l app/Services/Task/TaskQueryService.php` passed.
- `npm.cmd run build` passed.
- `php artisan test --filter=Task` found no focused task tests in the repository.
- `php artisan test` passed: 77 tests, 249 assertions.

### How To Test

- Open `/tasks`: confirm there is one operations header and one compact filter/view control bar.
- Change Overview/Board/List/Table/Timeline/Calendar from the filter control; each existing view should still render.
- In Overview, confirm “My focus” lists tasks assigned to the current user.
- Create a task, drag a task to another status, update a status, and open a task detail drawer to confirm existing actions remain intact.

### Next Recommended Step

- Add backend pagination and test coverage for task query filters before task volume grows further.

### Tasks KPI Visual Alignment

- Corrected the Task overview KPI source to reuse the active Finance workspace `MetricSparklineCard`, rather than the legacy Finance page card.
- Task cards now share Finance's compact heading, value, detail, and sparkline structure while deriving every series from real task creation, update, completion, and due dates.

## Dashboard Operations Workspace Refresh

### What Was Built

- Reworked the dashboard into a compact Finance-style operations workspace using HeroUI `Card`, `Chip`, `ProgressBar`, and shared HeroUI-backed `AppButton` controls.
- Kept only live operational information: KPI links, priority actions, recent projects, finance follow-up, workflow progress, blocked dossiers, urgent tasks, recent messages, and activity.
- Replaced legacy `crm-*` interactive controls with working HeroUI actions. Every visible action now navigates to its related module or refreshes the live command-center payload.
- Removed the previous redundant system-health and placeholder search areas from the dashboard.

### Backend Improvements

- Eager-load dossier documents for the blocked-dossier queue to prevent per-row document queries.
- Dashboard data continues to come exclusively from `DashboardCommandCenterService`; no frontend demo or static business data was added.

### Files Modified

- `app/Services/Dashboard/DashboardCommandCenterService.php`
- `resources/js/pages/Dashboard.tsx`

### Verification

- Dashboard-only TypeScript check: no errors reported for `Dashboard.tsx` or `DashboardCommandCenterService`.
- `npm.cmd run build` passed.
- `php artisan test` passed: 77 tests, 249 assertions.
- `git diff --check` passed.
- The full repository `npm.cmd run typecheck` still reports existing HeroUI migration errors in unrelated shared components and drawers; none are from this dashboard phase.

### How To Test

- Open `/` and confirm all KPI cards, priority rows, project rows, finance rows, quick links, task rows, and message rows navigate to their target workspace.
- Use `Actualiser` and confirm the command-center counts reload without leaving the dashboard.
- Confirm empty states display cleanly when there are no blocked dossiers, urgent tasks, messages, or projects.

### Compact Operations Refinement

- Replaced the full quick-link panel with a compact, tooltip-backed action rail.
- Added a backend-driven `Focus maintenant` command strip that promotes the first real priority action and exposes current risk signals beside it.
- Reduced the KPI rail to the five primary business indicators and moved task, review, message, and blocked-dossier counts into the focus strip.
- Combined blocked dossiers and urgent tasks into one `Points de vigilance` queue, and combined messages with recent activity into one compact updates panel.
- Reduced panel padding, row heights, and repetition while retaining every useful backend-driven queue and navigation action.

### Verification

- Dashboard-only TypeScript check: no errors reported for `Dashboard.tsx`.
- `npm.cmd run build` passed.
- `git diff --check` passed.

### Dashboard Command Actions And KPI Rail

- Centered the dashboard KPI rail with equal-width metric columns and aligned metric content.
- Converted dashboard quick actions into real workflow commands rather than list-page navigation:
  - New project opens the Project drawer.
  - Upload document opens the Document upload drawer.
  - Create invoice opens the Finance invoice builder.
  - New client opens the Client drawer.
  - New task opens the Task drawer.
  - New conversation opens the Inbox conversation drawer.
- Each receiving page consumes the `command` parameter once, opens its existing drawer, then clears the command from the browser URL.

### Files Modified

- `app/Services/Dashboard/DashboardCommandCenterService.php`
- `resources/js/pages/Dashboard.tsx`
- `resources/js/pages/Clients/Index.tsx`
- `resources/js/pages/Dossiers/Index.tsx`
- `resources/js/pages/Documents/Index.tsx`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `resources/js/pages/Tasks/Index.tsx`
- `resources/js/pages/Inbox/Index.tsx`

### Verification

- Focused TypeScript output: no errors in modified dashboard command pages.
- `npm.cmd run build` passed.
- `git diff --check` passed.

### Focus Queue Refinement

- Removed the duplicate top focus action from the priority list.
- Reduced the top header height and widened the live focus action so it reads as the primary daily decision.
- Made the vigilance rail self-sizing and replaced the oversized empty state with a compact stable-work confirmation.
- `npm.cmd run build` passed again.

### Dashboard Operations Cockpit Redesign

- Replaced the separate KPI cards with one continuous, responsive KPI rail.
- Replaced the former stacked widget layout with a large daily focus command area, compact signal rail, quick-action strip, three operational streams, and one shared lower operations summary.
- Removed duplicate action presentation: the active focus item is no longer repeated in the work queue.
- Preserved backend-only data and working navigation for every visible KPI, queue row, project, finance signal, task, message, and quick action.

### Verification

- Dashboard-only TypeScript check: no errors reported for `Dashboard.tsx`.
- `npm.cmd run build` passed.
- `git diff --check` passed.

## Project Design Review Safety And Revision Workflow

### What Was Built

- Added an unsaved-markup guard before switching design file, asset, or revision. Users can save and continue, discard local markup, or remain in the current drawing.
- Added a native browser leave/reload warning while unsaved markup exists.
- Added global editor shortcuts: `Ctrl/Cmd+S` saves markup and `?` opens a compact shortcut reference. The toolbar now exposes that reference directly.
- Added an in-place revision comparison card in the Versions inspector. It compares the selected earlier revision with the current one, including status and current change notes, and opens either revision directly.
- Added compact explorer overflow actions for files and folders: rename, move to the project root, or move to a valid folder. Drag-and-drop remains available for desktop users.

### Files Modified

- `resources/js/features/project-design/components/ProjectDesignEditorToolbar.tsx`
- `resources/js/features/project-design/components/ProjectDesignFolderTree.tsx`
- `resources/js/features/project-design/components/ProjectDesignTabContent.tsx`
- `resources/js/features/dossiers/components/DesignFileViewer.tsx`
- `resources/js/features/dossiers/components/DesignInspector.tsx`

### How To Test

- Draw an annotation, then select another file, version, or asset. Confirm that Keep editing, Discard changes, and Save and continue behave correctly.
- With unsaved markup, refresh the browser and confirm the browser warning appears.
- Press `Ctrl/Cmd+S` to save and `?` to view editor shortcuts.
- In Inspector > Versions, choose the compare action on an earlier revision, review the comparison card, then open either revision.
- Use the three-dot menu in Explorer to rename or move a file/folder without dragging.

### Verification

- `npm.cmd run build` passed.
- `php artisan test --filter=ProjectDesign` passed: 40 tests, 116 assertions.

### Next Recommended Step

- Add visual revision diffing for PDF/image assets when a reliable render-comparison strategy is selected, then add reviewer assignment and due-date filtering to the review queue.

## Drawer Action Row Consistency

- Shared `AppDrawer` footers now keep their direct actions on one non-wrapping, scroll-safe row.
- The Project Design upload drawer uses the same row behavior.
- The Dossiers project preview action group now uses a compact four-column grid, keeping View, Edit, Archive, and Delete on one line at drawer width.
- The unsaved-markup dialog action row was compacted so all three decisions remain side by side.

### Files Modified

- `resources/js/components/ui/AppDrawer.tsx`
- `resources/js/features/dossiers/components/DesignUploadDrawer.tsx`
- `resources/js/features/project-design/components/ProjectDesignTabContent.tsx`
- `resources/js/pages/Dossiers/Index.tsx`

### Verification

- `npm.cmd run build` passed.

### Follow-up

- Removed the old page-scroll lock and full-height shell treatment for normal editor mode. Fullscreen mode remains isolated as before.
- Removed a competing fixed-height wrapper from the Design tab so its browser, viewer, and inspector siblings receive the remaining flex height and can scroll independently.
- Re-ran `npm.cmd run build` and `php artisan test --filter=ProjectDesign`; both passed.

## Project Design Editor Upgrade - Step 3: Viewer Navigation

- Added a compact direct page-jump field to the existing editor toolbar, with Enter and blur handling plus bounds validation.
- Extended the Project Design remark resource and list query with the annotation page number.
- Expanded remark details now show the exact page alongside the drawing/version context, while the existing focus action continues to navigate and center the annotation.

### Files Modified

- `app/Http/Controllers/ProjectDesignController.php`
- `app/Http/Resources/ProjectDesign/ProjectDesignRemarkResource.php`
- `resources/js/features/dossiers/components/DesignInspector.tsx`
- `resources/js/features/project-design/components/ProjectDesignEditorToolbar.tsx`
- `resources/js/features/project-design/types/projectDesign.ts`

### Verification

- `php -l` passed for the controller and resource.
- `npm.cmd run build` passed.
- `php artisan test --filter=ProjectDesign` passed: 40 tests, 116 assertions.
- The filtered TypeScript output contains no errors for the files touched in this step; unrelated repository-wide migration errors remain.

### Next Step

- Add viewer safety and review ergonomics: unsaved-change protection, clearer keyboard shortcuts, and focused review tools.

## Client Workspace Action And Redirect Audit

### What Changed

- Audited every action exposed by the client workspace: client edit/delete, project creation, workflow actions, contract creation/update/generation, document upload/replace/delete, authorization updates, finance documents, payments, receipts, archive links, and external workspace links.
- Added one local client workspace path helper so mutation redirects preserve the active client tab and selected dossier instead of relying on the browser referrer.
- Project creation, contracts, workflow confirmations, document mutations, finance document mutations, quote conversion, payments, receipt export generation, and payment deletion now return to the intended client workspace context.
- Document and payment controllers now validate and safely honor local return paths. Existing full-workspace actions remain intentional: project workspace, finance workspace, archive record, document preview/print/download, and finance document details.

### Files Modified

- `resources/js/pages/Clients/Show.tsx`
- `resources/js/components/drawers/entities/PaymentDrawer/index.tsx`
- `app/Http/Controllers/DocumentController.php`
- `app/Http/Controllers/DossierWorkflowRequirementController.php`
- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `app/Http/Controllers/Finance/PaymentController.php`
- `app/Http/Requests/StoreDossierDocumentRequest.php`
- `app/Http/Requests/ReplaceDossierDocumentRequest.php`
- `app/Http/Requests/UpdateDossierWorkflowRequirementRequest.php`
- `app/Http/Requests/Finance/StorePaymentRequest.php`
- `app/Http/Requests/Finance/UpdatePaymentRequest.php`

### Verification

- PHP syntax checks and finance ledger QA are run with this step.
- `docs/DOSSIER_WORKFLOW.md` is not present in this checkout; the audit used `PROJECT_RULES.md`, `FINANCE_WORKFLOW.md`, and the existing client workspace implementation.

## Project Design Remarks Hook-Order Fix

- Fixed `RemarksPanel` so empty and populated remark states run the same hooks in the same order.
- Realtime or initial-load transitions from an empty remark list can no longer trigger React's “Rendered more hooks than during the previous render” error.

### Files Modified

- `resources/js/features/dossiers/components/DesignInspector.tsx`

### Verification

- `npm.cmd run build` passed.
- `php artisan test --filter=ProjectDesign` passed: 40 tests, 116 assertions.

## Project Design Persistent Annotation Deletion And Explorer Organization

- Canvas markup now exposes a compact remove action with an in-place confirmation state.
- Deleting a persisted annotation now deletes its linked remarks and remark comments in one transaction, writes an activity entry, and broadcasts both remark and annotation removals to active editors.
- Added scoped explorer update requests and a focused action for file/folder renames and moves.
- Explorer folder/file responses now use their existing API resources, preserving the frontend camelCase contract.
- Added double-click rename for files and folders.
- Added drag-to-folder and drag-to-root behavior with drop-state feedback, cycle protection for folders, company/dossier scope validation, optimistic file locking, and TanStack query refreshes.
- Simplified the editor frame so the toolbar, panel host, and status bar form one continuous workspace instead of layered rounded borders.

### Files Created

- `app/Actions/ProjectDesign/DeleteProjectDesignAnnotationAction.php`
- `app/Actions/ProjectDesign/UpdateProjectDesignExplorerItemAction.php`
- `app/Http/Requests/ProjectDesign/UpdateProjectDesignFileRequest.php`
- `app/Http/Requests/ProjectDesign/UpdateProjectDesignFolderRequest.php`

### Files Modified

- `app/Http/Controllers/ProjectDesignController.php`
- `resources/js/features/dossiers/components/DesignAnnotationLayer.tsx`
- `resources/js/features/dossiers/components/DesignFileViewer.tsx`
- `resources/js/features/project-design/api/projectDesignApi.ts`
- `resources/js/features/project-design/components/ProjectDesignFileBrowser.tsx`
- `resources/js/features/project-design/components/ProjectDesignFolderTree.tsx`

### Verification

- PHP syntax checks passed for the new actions, requests, and controller.
- `npm.cmd run build` passed.
- `php artisan test --filter=ProjectDesign` passed: 40 tests, 116 assertions.

### How To Test

- Select a saved markup in the drawing, choose the trash action, then confirm removal. Refresh the page: the annotation and its linked remark must remain gone.
- Double-click a file or folder name in Explorer, edit it, then press Enter or click away.
- Drag a file into a folder, or drag it onto the highlighted Project Design root zone to unfile it.
- Drag a folder onto another folder. Invalid self/descendant moves are blocked by the backend.

### Follow-up Fixes

- Corrected the Explorer query client scope so rename/move refreshes no longer crash the React tree.
- Corrected Project Design Reverb channel authorization to scope access through the existing company-owned design files/folders, rather than querying the legacy dossier table for a nonexistent `company_id` column.
- Re-ran `npm.cmd run build` and `php artisan test --filter=ProjectDesign`: both passed.

### Explorer Interaction Refinement

- Single-click selection and folder toggling are now delayed briefly so a double-click can enter rename mode without opening the file or changing the folder state.
- Replaced the noisy whole-tree root drop listener with a compact explicit Project Design root target.
- Folder drop highlighting now remains stable while moving across child controls, and the expand/collapse trigger remains immediate on the disclosure icon.
- `npm.cmd run build` and `php artisan test --filter=ProjectDesign` passed again: 40 tests, 116 assertions.

### Explorer Collapse And Toolbar Refinement

- Explorer root folders now receive their default expanded state only on first load. A persisted empty set and the Collapse all command are respected, so folders stay collapsed until the user reopens them.
- Refined the editor toolbar into quieter, labeled control clusters with lightweight dividers. Annotation, navigation, view, and editor actions retain their existing behavior and keyboard hints without the previous layered-border treatment.

### Files Modified

- `resources/js/features/project-design/components/ProjectDesignFolderTree.tsx`
- `resources/js/features/project-design/components/ProjectDesignEditorToolbar.tsx`

### Verification

- `npm.cmd run build` passed.
- `php artisan test --filter=ProjectDesign` passed: 40 tests, 116 assertions.

## Dossier Finance Rules And Tenant Scope

### What Was Built

- Added company and branch ownership to clients and dossiers, with a one-time ARCHI LBO / Marrakech (`RAK`) backfill for existing records.
- Added a server-side eligibility service for the dossier finance rules: one active facture, multiple devis until acceptance, and direct advances only when no active devis or facture exists.
- Added `PaymentKind` so the ledger distinguishes invoice payments from dossier advances.
- Direct advances create a private receipt immediately, attach automatically to the next facture, and are released if that facture is cancelled or deleted.
- The client workspace now receives finance eligibility data and its payment drawer supports the permitted direct-advance path while keeping invoice payments attached to their facture.

### Files Created

- `app/Console/Commands/FinanceDossierRulesQaCommand.php`
- `app/Enums/PaymentKind.php`
- `app/Services/Finance/DossierFinanceEligibilityService.php`
- `database/migrations/2026_07_27_120000_add_dossier_finance_rules.php`
- `database/migrations/2026_07_27_121000_add_client_and_dossier_tenant_scope.php`

### Files Modified

- `app/Http/Controllers/ClientController.php`
- `app/Http/Controllers/DossierController.php`
- `app/Http/Controllers/Finance/FinanceDocumentController.php`
- `app/Http/Controllers/Finance/PaymentController.php`
- `app/Http/Requests/Finance/StorePaymentRequest.php`
- `app/Http/Resources/PaymentResource.php`
- `app/Models/Client.php`
- `app/Models/Dossier.php`
- `app/Models/FinanceDocument.php`
- `app/Models/Payment.php`
- `app/Services/Clients/ClientWorkspaceService.php`
- `app/Services/Finance/PaymentLedgerService.php`
- `resources/js/components/drawers/entities/PaymentDrawer/index.tsx`
- `resources/js/features/clients/components/ClientFinanceTab.tsx`
- `resources/js/features/clients/types.ts`
- `resources/js/features/finance/types.ts`
- `resources/js/pages/Clients/Show.tsx`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `docs/FINANCE_WORKFLOW.md`

### Commands Run

- `php artisan migrate --force`
- `php artisan optimize:clear`
- `php artisan archilbo:finance-dossier-rules-qa`
- `php artisan archilbo:finance-payment-ledger-receipt-qa`
- `php artisan test --stop-on-failure`
- `npm.cmd run build`

### Verification

- Both migrations completed successfully.
- New finance-rules QA passed, including direct advance receipts, accepted devis blocking, the single active facture rule, and advance release.
- Existing finance ledger QA passed.
- Test suite passed: 77 tests, 249 assertions.
- Production frontend build passed. Vite still reports the existing optional `fontaine` and large-chunk warnings.

### Next Recommended Step

- Add finance feature tests for the HTTP endpoints and policy denial cases across two companies before enabling multi-company production users.

## Phase 1 - Runtime Stabilization And Dead Module Removal

### What Was Built

- Removed stale authorization workflow and task-request module references from active backend payloads, task/calendar contracts, dashboard data, client workspace data, and permissions seeding.
- Preserved the operational Rokhas document workflow without relying on the removed authorization model.
- Added `CoreRuntimeSmokeTest` coverage for Dashboard, Dossiers, Project Design, Tasks, and Contracts.
- Made dossier monthly grouping database-driver aware for SQLite tests, MySQL, and PostgreSQL.
- Fixed Dashboard activity-feed collection handling after converting model records into UI payload arrays.

### Files Created

- `tests/Feature/CoreRuntimeSmokeTest.php`

### Files Modified

- `app/Console/Commands/OperationsFoundationQaCommand.php`
- `app/Http/Controllers/DossierController.php`
- `app/Http/Requests/Calendar/StoreCalendarEventRequest.php`
- `app/Http/Requests/Calendar/UpdateCalendarEventRequest.php`
- `app/Http/Requests/Task/StoreTaskRequest.php`
- `app/Http/Requests/Task/UpdateTaskRequest.php`
- `app/Http/Resources/CalendarEventResource.php`
- `app/Http/Resources/TaskResource.php`
- `app/Services/Calendar/CalendarTaskSyncService.php`
- `app/Services/Dashboard/DashboardCommandCenterService.php`
- `app/Services/Dossiers/DossierWorkflowStepperService.php`
- `app/Services/Task/TaskQueryService.php`
- `database/seeders/RolesAndPermissionsSeeder.php`
- `resources/js/features/clients/components/ClientSelectedProjectWorkspace.tsx`
- `resources/js/features/dashboard/data/dashboardCommandCenter.ts`
- `resources/js/features/dashboard/data/mockDashboard.ts`
- `resources/js/features/dossiers/data/mockDossiers.ts`
- `resources/js/features/tasks/components/TaskCreateDrawer.tsx`
- `resources/js/features/tasks/components/TaskFilters.tsx`
- `resources/js/locales/en.ts`

### Files Removed

- `app/Http/Requests/Task/StoreTaskRequestRequest.php`
- `app/Http/Requests/Task/UpdateTaskRequestRequest.php`
- `app/Http/Requests/UpdateAuthorizationStatusRequest.php`

### Commands Run

- `php artisan optimize:clear`
- `php artisan archilbo:operations-foundation-qa`
- `php artisan test --filter=CoreRuntimeSmokeTest --stop-on-failure`
- `php artisan test --stop-on-failure`
- `npm.cmd run build`
- `git diff --check`

### Verification

- Core runtime smoke test passed: 1 test, 7 assertions.
- Full backend suite passed: 78 tests, 256 assertions.
- Operations foundation QA passed.
- Production frontend build passed.
- `git diff --check` passed.

### Known Issues

- `npm run typecheck` still has an existing, broad HeroUI v3 API migration backlog outside this runtime-stabilization scope. No changed Phase 1 file was identified in that failure list.
- Vite still emits the optional `fontaine` and large-chunk warnings.
- The mandatory architecture documentation set is incomplete in this repository: `ARCHITECTURE.md`, `ROLES_AND_PERMISSIONS.md`, `DOSSIER_WORKFLOW.md`, `DOCUMENT_TEMPLATE_SYSTEM.md`, `ARCHIVE_MANAGEMENT.md`, `FRONTEND_STRUCTURE.md`, and `DATABASE_STRUCTURE.md` are absent. This should be repaired before broad cross-module work.

### Next Recommended Step

- Begin the security foundation audit: tenant ownership coverage, policies, permission middleware, and protected private-file access. Keep each change small and backed by feature tests.

## Tenant Authorization Foundation

### What Was Built

- Added a reusable company/branch query boundary in `CompanyContext`.
- Added reusable tenant ownership checks for policies and applied them to Clients and Dossiers.
- Scoped Client and Dossier lists, dashboard-style dossier location grouping, and dossier workspace option data to the authenticated user's company and optional branch.
- Added controller authorization for Client and Dossier read, create, update, delete, and CIN scan actions.
- Replaced the broad global `admin` authorization bypass with the explicit `super_admin` role. Standard admins retain their seeded permissions but are now still constrained to their tenant.
- Added the `super_admin` role to the permission seeder.

### Files Created

- `app/Policies/ClientPolicy.php`
- `app/Policies/DossierPolicy.php`
- `app/Policies/Concerns/HandlesTenantAuthorization.php`
- `tests/Feature/TenantAuthorizationTest.php`

### Files Modified

- `app/Services/CompanyContext.php`
- `app/Policies/Concerns/HandlesFinanceAuthorization.php`
- `app/Providers/AppServiceProvider.php`
- `app/Http/Controllers/ClientController.php`
- `app/Http/Controllers/DossierController.php`
- `app/Services/Dossiers/DossierLocationGroupingService.php`
- `database/seeders/RolesAndPermissionsSeeder.php`
- `tests/Feature/CoreRuntimeSmokeTest.php`

### Authorization Contract

- Every tenant-owned query uses `CompanyContext::applyTo()`.
- Users with a branch are restricted to their own branch.
- Users without a branch may work across their assigned company's branches.
- `super_admin` is the only role permitted to bypass policy checks globally.
- `admin`, `manager`, and `staff` remain permission-driven and tenant-scoped.

### Commands Run

- `php artisan test --filter='(CoreRuntimeSmokeTest|TenantAuthorizationTest)' --stop-on-failure`
- `php artisan test --stop-on-failure`
- `npm.cmd run build`
- `php artisan optimize:clear`
- `php artisan db:seed --class=RolesAndPermissionsSeeder`
- `git diff --check`

### Verification

- Focused runtime and tenant tests passed: 3 tests, 15 assertions.
- Full backend suite passed: 80 tests, 264 assertions.
- Production frontend build passed.
- Cache clear and diff validation passed.

### Next Recommended Step

- Define the durable role matrix and replace broad legacy permissions (`manage clients`, `manage dossiers`, etc.) with granular view/create/update/delete permissions. Migrate policies module by module, beginning with Clients and Dossiers, and add denial tests for each role.

## Clean Local Baseline And Mock Data Removal

### What Was Built

- Replaced the default demo-data seed chain with a clean baseline seed chain.
- A fresh local install now creates only the ARCHI LBO tenant, Marrakech branch, roles, permissions, and five internal role accounts.
- Removed automatic city, finance settings, finance template, client, dossier, task, inbox, calendar, archive, and sample document data from the baseline seed.
- Changed the historical document-template data migration to a no-op so future fresh installs remain empty.
- Removed confirmed-unreferenced frontend mock-data files and their legacy unused preview/dashboard components.

### Baseline Accounts

- `admin@archilbo.local` (`admin`)
- `superadmin@archilbo.local` (`super_admin`)
- `manager@archilbo.local` (`manager`)
- `staff@archilbo.local` (`staff`)
- `viewer@archilbo.local` (`viewer`)

The local baseline seeder reads `LOCAL_BASELINE_PASSWORD` from `.env` when present and applies it to all baseline accounts. The repository keeps only the empty `LOCAL_BASELINE_PASSWORD=` placeholder in `.env.example`; no account password is committed to documentation or source control.

### Files Created

- `database/seeders/CompanyBaselineSeeder.php`

### Files Modified

- `database/seeders/AdminUserSeeder.php`
- `database/seeders/DatabaseSeeder.php`
- `database/migrations/2026_07_20_151950_add_new_document_templates_for_split_workflow.php`

### Files Removed

- Unused frontend mock datasets for clients, contracts, dashboard, documents, dossiers, finance, intermediaries, and planning.
- Unused dashboard, finance, contract, and document preview components that only consumed those mock datasets.

### Commands Run

- `php artisan migrate:fresh --seed`
- Database count verification via `php artisan tinker`
- `npm.cmd run build`
- `php artisan test --stop-on-failure`
- `git diff --check`

### Verification

- Users: 5; roles: 5; permissions: 60.
- Clients, dossiers, finance documents, payments, tasks, conversations, messages, calendar events, archive records, Project Design files, document templates, finance templates, and cities: 0.
- Full backend suite passed: 80 tests, 264 assertions.
- Production frontend build passed.

### Next Recommended Step

- Decide the full operational role matrix for Architect, Assistant, Accountant, Archive Manager, and Employee before creating production users for those roles. Then introduce granular module permissions with policy tests.

## Login Visibility And Remember Session

### What Was Built

- Added an accessible password show/hide control to the login field using the HeroUI-backed `AppButton`.
- Extended `AppTextField` with a reusable optional trailing-content slot.
- Removed the stale hardcoded password hint from the login screen.
- Added feature coverage confirming that login with `remember=true` persists Laravel's remember token.

### Files Modified

- `resources/js/components/ui/AppTextField.tsx`
- `resources/js/pages/Auth/Login.tsx`

### Files Created

- `tests/Feature/RememberSessionTest.php`

### Verification

- `php artisan test --filter=RememberSessionTest --stop-on-failure` passed: 1 test, 6 assertions.
- `npm.cmd run build` passed.
- `git diff --check` passed.

## Login Workspace Visual Refinement

### What Was Built

- Widened the desktop sign-in lane so the form has more comfortable reading and input space.
- Reworked the desktop left panel around a dedicated ARCHI LBO architecture-workspace image, with accessible contrast overlays and a compact module summary.
- Preserved the focused mobile sign-in layout; the visual panel remains desktop-only.

### Files Created

- `public/images/login-architecture-workspace.png`

### Files Modified

- `resources/js/pages/Auth/Login.tsx`

### Verification

- Pending frontend production build after the layout refinement.

## Geist Typography Foundation And Login Refinement

### What Was Built

- Bound Tailwind's shared sans and mono font tokens to the installed Geist Variable and Geist Mono Variable fonts.
- Refined login typography with a less heavy heading scale, clearer label/supporting-text hierarchy, and more deliberate spacing for the widened form.

### Files Modified

- `resources/css/app.css`
- `resources/js/pages/Auth/Login.tsx`

### Verification

- `npm.cmd run build` passed.
- `git diff --check` passed.
- `npm.cmd run typecheck` remains blocked by existing project-wide type errors in unrelated finance, inbox, drawer, and page files; the login/font files report no TypeScript error.

## Login Security Hardening

### What Was Built

- Added configuration-driven login throttling per normalized email and IP address.
- Removed account-state disclosure from login failures; suspended and unaccepted-invitation accounts now receive the same generic failure response as invalid credentials.
- Added browser hardening headers, login no-store responses, and production HTTPS-only/encrypted session defaults.
- Added targeted coverage for security headers, suspended accounts, and repeated invalid login attempts.

### Files Created

- `config/auth_security.php`
- `app/Http/Middleware/ApplySecurityHeaders.php`
- `tests/Feature/LoginSecurityTest.php`

### Files Modified

- `app/Http/Requests/Auth/LoginRequest.php`
- `bootstrap/app.php`
- `config/session.php`
- `.env.example`

### Verification

- Focused login coverage passed: 4 tests, 30 assertions.
- Full backend suite passed: 84 tests, 294 assertions.
- `npm.cmd run build` and `git diff --check` passed.
- `php artisan optimize:clear` completed after the new configuration and middleware were added.

## Logout Security Verification

### What Was Built

- Extended no-store response handling to logout redirects so browser history does not retain sensitive authenticated pages from that response path.
- Added focused tests proving logout is POST-only and authenticated, invalidates the current session, rotates an existing remember token, and returns the standard security headers.

### Files Created

- `tests/Feature/LogoutSecurityTest.php`

### Files Modified

- `app/Http/Middleware/ApplySecurityHeaders.php`

### Verification

- Focused login/logout coverage passed: 6 tests, 42 assertions.
- Full backend suite passed: 86 tests, 306 assertions.
- `git diff --check` passed.

## Dashboard Command Center Data And Visuals

### What Was Built

- Scoped dashboard aggregates, action queues, finance alerts, recent projects, and system health data to the signed-in user's company and branch.
- Added a six-month finance trend widget using actual invoice and payment records.
- Added a compact workflow distribution widget based on active dossier workflow steps.
- Kept the existing shared KPI cards and HeroUI dashboard layout intact.
- Removed dormant dashboard mock-data and mock-only presentation files after confirming they had no imports.

### Files Created

- `resources/js/features/dashboard/components/DashboardFinanceTrend.tsx`
- `resources/js/features/dashboard/components/DashboardWorkflowDonut.tsx`
- `tests/Feature/DashboardCommandCenterTest.php`

### Files Modified

- `app/Http/Controllers/DashboardController.php`
- `app/Services/Dashboard/DashboardCommandCenterService.php`
- `resources/js/features/dashboard/types.ts`
- `resources/js/pages/Dashboard.tsx`

### Files Removed

- `resources/js/features/dashboard/data/dashboardCommandCenter.ts`
- `resources/js/features/dashboard/dashboardDesign.ts`
- `resources/js/features/dashboard/components/DashboardQuickActions.tsx`

### Verification

- Focused dashboard tenant-scope test passed: 1 test, 4 assertions.
- Full backend suite passed: 87 tests, 310 assertions.
- `npm.cmd run build` and `git diff --check` passed.
- Vite still reports its existing large-client-chunk advisory; the dashboard widgets compile successfully.

### Next Recommended Step

- Add dashboard-level date range filtering once the reporting requirements are defined, then keep the selected range in the URL so shared links reproduce the same view.

## Dashboard Review Data And Layout Refinement

### What Was Built

- Added the opt-in `DashboardDemoSeeder`; it is disabled in production and is intentionally excluded from `DatabaseSeeder`.
- The temporary seed creates six company/branch-scoped clients and dossiers, six dossier documents, five invoices, three payments, four assigned tasks, and one operational conversation for realistic dashboard review.
- Reworked the KPI rail to use six shared KPI cards: two columns on small screens, three on laptop, and one aligned six-card row on wide screens.
- Reduced duplicate dashboard noise by keeping the workflow donut as the single workflow visual and removing the repeated progress-list widget.
- Simplified the lower dashboard layout into Finance and Updates widgets, while keeping action queues, projects, and vigilance as separate readable zones.

### Files Created

- `database/seeders/DashboardDemoSeeder.php`
- `tests/Feature/DashboardDemoSeederTest.php`

### Files Modified

- `resources/js/pages/Dashboard.tsx`
- `docs/AI_WORK_REPORT.md`

### How To Use The Temporary Data

- Run `php artisan db:seed --class=DashboardDemoSeeder` locally after the baseline seed.
- The seeder is idempotent and uses the `DASH-` prefix for every temporary client, dossier, document, invoice, payment, task, and conversation record.
- It is not part of the regular baseline seed and must remain out of production data.

### Verification

- Dashboard service and demo seed tests passed: 2 tests, 10 assertions.
- `npm.cmd run build` and `git diff --check` passed.

### Next Recommended Step

- Review the seeded dashboard at `/dashboard` across desktop, tablet, and mobile widths. Once the visual direction is approved, remove the temporary `DASH-*` data before production launch.

## Shared Actions And French I18n Dashboard Pilot

### What Was Built

- Extended the HeroUI-backed `AppButton` with compact shared variants: `toolbar`, `accent`, and `quiet`.
- Added a lightweight application i18n provider with French as the default locale, persisted under `archilbo-locale`, and an English fallback for feature areas not yet migrated.
- Organized the initial French dictionary by responsibility: shared labels in `resources/js/locales/fr/common.ts` and dashboard labels in `resources/js/locales/fr/dashboard.ts`.
- Localized the dashboard headline, buttons, KPIs, chart states, action queue, finance alerts, and activity labels through translation keys.
- Refactored dashboard payloads so new UI labels are resolved in the frontend locale rather than embedded as English presentation text in the service.

### Files Created

- `resources/js/locales/fr/common.ts`
- `resources/js/locales/fr/dashboard.ts`
- `resources/js/locales/fr/index.ts`

### Files Modified

- `resources/js/components/ui/AppButton.tsx`
- `resources/js/lib/i18n.ts`
- `resources/js/providers/AppProviders.tsx`
- `resources/js/pages/Dashboard.tsx`
- `resources/js/features/dashboard/types.ts`
- `resources/js/features/dashboard/components/DashboardFinanceTrend.tsx`
- `resources/js/features/dashboard/components/DashboardWorkflowDonut.tsx`
- `app/Services/Dashboard/DashboardCommandCenterService.php`

### Localization Convention

- New feature text belongs in `resources/js/locales/fr/<feature>.ts` and is composed by `resources/js/locales/fr/index.ts`.
- The current locale is French. English remains only as a safe fallback until each existing feature is migrated.
- To add another locale later, add its feature files, export the composed dictionary, and append its code to `supportedLocales` in `resources/js/lib/i18n.ts`.

### Verification

- `php artisan test --filter='Dashboard(CommandCenter|DemoSeeder)Test' --stop-on-failure` passed: 2 tests, 10 assertions.
- `npm.cmd run build` passed.
- `git diff --check` passed.
- Vite continues to report only the existing optional `fontaine` and large-chunk advisories.

### Next Recommended Step

- Migrate the finance feature next using `resources/js/locales/fr/finance.ts`, then apply the shared compact button variants to its toolbars and row actions.

## Global Geist Typography Enforcement

### What Was Built

- Confirmed that the application entry point loads the local `@fontsource-variable/geist` and `@fontsource-variable/geist-mono` packages.
- Aligned the legacy CRM shell font variables with the shared `--font-sans` and `--font-mono` tokens, so both the modern and legacy shell surfaces inherit Geist consistently.
- Removed the unused Vite/Bunny Instrument Sans integration; production bundles now ship Geist and Geist Mono only for the application UI.
- Kept the Arial/DejaVu declarations inside finance document templates unchanged because they describe rendered PDF/print documents, not the CRM interface.

### Files Modified

- `resources/css/app.css`
- `resources/css/archilbo-theme.css`
- `vite.config.ts`

### Verification

- `npm.cmd run build` passed and its output contains Geist and Geist Mono assets with no Instrument Sans assets.
- `git diff --check` passed.

### Next Recommended Step

- Continue the French locale migration feature by feature, beginning with Finance, while applying the shared `AppButton` variants to its toolbars and table actions.

## Dashboard Operations Widget Layout

### What Was Built

- Reworked the dashboard operations area into a two-column desktop workspace.
- Made Recent Projects the primary panel and stacked Action Queue and Vigilance as a focused right-side operational rail.
- Added a shared dashboard widget-header treatment with compact icon surfaces, stronger title hierarchy, and consistent internal spacing.
- Preserved all existing real dashboard data, routes, actions, and responsive single-column behavior on smaller screens.

### Files Modified

- `resources/js/pages/Dashboard.tsx`

### Verification

- `npm.cmd run build` passed.
- `git diff --check` passed.

### Next Recommended Step

- Review `/dashboard` at desktop and tablet widths, then refine the KPI visual treatment only after the operations workspace direction is approved.

## Client Module Security And Tenant Boundary Hardening

### What Was Audited And Fixed

- Scoped the client search API and client-project API to the authenticated company and optional branch.
- Added policy enforcement to both API endpoints, preventing direct requests for a foreign client or its dossiers.
- Added a `ClientStatus` enum and shared request rules so client status values and intermediary validation are enforced on the server.
- Added company/branch ownership to intermediaries, including a migration that backfills existing ARCHI LBO intermediary records.
- Scoped client-side intermediary options and intermediary CRUD/reporting to the signed-in tenant.
- Scoped document lists, document grouping, document form options, document uploads, and protected file actions through the document dossier owner.
- Prevented a dossier from being reassigned to a client outside the current tenant.
- Added missing authorization to dossier workflow requirement updates.
- Scoped client, dossier, document, contract, and archive results in global search.

### Files Created

- `app/Enums/ClientStatus.php`
- `app/Http/Requests/Concerns/HasClientPayloadRules.php`
- `app/Policies/IntermediaryPolicy.php`
- `database/migrations/2026_07_28_090000_add_intermediary_tenant_scope.php`
- `tests/Feature/ClientSecurityHardeningTest.php`

### Files Modified

- `app/Http/Controllers/Api/ClientController.php`
- `app/Http/Controllers/ClientController.php`
- `app/Http/Controllers/DocumentController.php`
- `app/Http/Controllers/DossierController.php`
- `app/Http/Controllers/DossierWorkflowRequirementController.php`
- `app/Http/Controllers/GlobalSearchController.php`
- `app/Http/Controllers/IntermediaryController.php`
- `app/Http/Requests/StoreClientRequest.php`
- `app/Http/Requests/UpdateClientRequest.php`
- `app/Models/Intermediary.php`
- `app/Policies/DossierDocumentPolicy.php`
- `app/Services/Documents/DocumentGroupingService.php`

### Database Changes

- Applied `2026_07_28_090000_add_intermediary_tenant_scope`.
- `intermediaries` now carries `company_id` and `branch_id`, with an index for tenant lookups.

### Verification

- `php artisan migrate --force` passed.
- `php artisan optimize:clear` passed.
- `php artisan test --filter=ClientSecurityHardeningTest --stop-on-failure` passed: 3 tests, 13 assertions.
- `php artisan test --stop-on-failure` passed: 91 tests, 329 assertions.
- `npm.cmd run build` passed.
- `git diff --check` passed.

### Next Recommended Step

- Audit the remaining dossier-adjacent modules (contracts, archive records, and project design) for the same company/branch boundary pattern, then introduce granular client and dossier permissions without changing the current workflow UI.

## Client Workspace Obsolete Authorization Relation Fix

### What Was Fixed

- Removed the obsolete `Dossier::authorization` eager load, workspace payload, and timeline events from `ClientWorkspaceService`.
- The authorization module was previously removed, so the stale relation caused every client workspace request to fail before rendering.
- Added a direct authorized `/clients/{client}` regression assertion to the client security feature test.

### Files Modified

- `app/Services/Clients/ClientWorkspaceService.php`
- `tests/Feature/ClientSecurityHardeningTest.php`

### Verification

- `php artisan test --filter=ClientSecurityHardeningTest --stop-on-failure` passed: 3 tests, 14 assertions.
- `npm.cmd run build` passed.
- `git diff --check` passed.

## Client Workspace Tab Verification

### What Was Fixed

- Connected the Activity tab to the selected dossier timeline already provided by `ClientWorkspaceService`.
- Removed the obsolete authorization timeline visual configuration.
- Kept the selected tab in the client workspace URL and synchronized it when the page receives a tab query parameter.
- Made the Notes tab actionable through the existing client editor.
- Preserved the current client workspace tab after a client edit, using a validated local return path.

### Files Modified

- `resources/js/pages/Clients/Show.tsx`
- `resources/js/features/clients/components/DossierTimeline.tsx`
- `app/Http/Requests/Concerns/HasClientPayloadRules.php`
- `app/Http/Controllers/ClientController.php`
- `tests/Feature/ClientSecurityHardeningTest.php`

### Verification

- Every client workspace tab was requested in the feature test: Overview, Projects, Workflow, Documents, Finance, Notes, and Activity.
- `php artisan test --filter=ClientSecurityHardeningTest` passed: 3 tests, 21 assertions.
- `npm.cmd run build` passed.
- `php artisan optimize:clear` passed.
- `git diff --check` passed (repository line-ending notices only).

## Client Workspace Activity And Compact Actions

### What Was Changed

- Extended the shared HeroUI-backed `AppButton` with an optional accessible tooltip.
- Changed Client workspace header and tab actions to compact icon buttons with tooltips, keeping action groups aligned to the right.
- Preserved text buttons for destructive confirmations where a visible label is safer.
- Added creator information to finance and payment timeline events when that user is recorded in the database.
- Kept document, contract, and archive timeline events honest: no actor is shown when that legacy record has no stored author.

### Files Modified

- `resources/js/components/ui/AppButton.tsx`
- `resources/js/pages/Clients/Show.tsx`
- `resources/js/features/clients/components/ClientFinanceTab.tsx`
- `resources/js/features/clients/components/ClientArchivesCard.tsx`
- `resources/js/features/clients/components/DossierTimeline.tsx`
- `resources/js/features/clients/types.ts`
- `app/Services/Clients/ClientWorkspaceService.php`

### Verification

- `php artisan test --filter=ClientSecurityHardeningTest` passed: 3 tests, 21 assertions.
- `npm.cmd run build` passed.
- `git diff --check` passed (repository line-ending notices only).

## Client French Locale Completion

### What Was Changed

- Added a dedicated French client locale, covering the client index, client drawer, workspace tabs, project finance, archive card, pagination, workflow actions, and activity timeline.
- Replaced visible hardcoded client finance, archive, drawer, KPI, pagination, and workspace action labels with translation keys.
- Made activity events language-neutral in `ClientWorkspaceService`; React now resolves their labels from the active locale.
- Kept English equivalents for all newly introduced client keys so a future locale switch remains complete.

### Files Created

- `resources/js/locales/fr/clients.ts`

### Files Modified

- `resources/js/locales/fr/index.ts`
- `resources/js/locales/en.ts`
- `resources/js/pages/Clients/Index.tsx`
- `resources/js/pages/Clients/Show.tsx`
- `resources/js/components/drawers/entities/ClientDrawer/index.tsx`
- `resources/js/features/clients/components/ClientFinanceTab.tsx`
- `resources/js/features/clients/components/ClientArchivesCard.tsx`
- `resources/js/features/clients/components/DossierTimeline.tsx`
- `resources/js/features/clients/types.ts`
- `app/Services/Clients/ClientWorkspaceService.php`

### Verification

- `npm.cmd run build` passed.
- `php artisan test --filter=ClientSecurityHardeningTest` passed: 3 tests, 21 assertions.
- `git diff --check` passed (only unrelated line-ending notices were reported).

## Clients Table Refinement

### What Was Changed

- Refined the shared `AppWorkspaceTable` header typography, contrast, and icon support.
- Added optional persisted drag-and-drop column ordering through `localStorage`, without duplicating the table implementation.
- Applied the shared capability to Clients: clear column icons, non-reorderable avatar/actions columns, and a saved column layout.
- Changed Clients pagination to 10 rows per page and compact previous/next icon controls with tooltips.
- Corrected the shared table hook flow so it remains valid for both table-data and children-based usages.

### Files Modified

- `resources/js/components/ui/AppWorkspaceTable.tsx`
- `resources/js/pages/Clients/Index.tsx`
- `resources/js/locales/fr/clients.ts`
- `resources/js/locales/en.ts`

### Verification

- `npm.cmd run build` passed.
- `git diff --check` passed (only unrelated line-ending notices were reported).

## Shared Clients Table Preferences

### What Was Changed

- Improved the shared `AppWorkspaceTable` header hierarchy for the dark CRM theme.
- Added resilient persisted column ordering through native drag-and-drop, including recovery from malformed browser storage.
- Updated the Clients table with icon-led sortable headers while keeping avatar and row-action columns fixed.
- Set Clients pagination to 10 records per page and replaced text pagination controls with compact shared icon buttons and tooltips.

### Files Modified

- `resources/js/components/ui/AppWorkspaceTable.tsx`
- `resources/js/pages/Clients/Index.tsx`
- `resources/js/locales/en.ts`
- `resources/js/locales/fr/clients.ts`
- `docs/AI_WORK_REPORT.md`

### Verification

- `npm.cmd run build` passed.
- `git diff --check` passed (only unrelated line-ending notices were reported).

## Intermediaries List Alignment

### What Was Changed

- Replaced the legacy intermediary index table and custom filters with the shared HeroUI-backed workspace table pattern used by Clients.
- Added compact icon-led KPI cards, sortable icon column headers, local persisted column order, and 10-row pagination with accessible previous/next icon controls.
- Kept row actions compact: view and edit are direct icon actions, while deletion remains inside a focused overflow menu and confirmation dialog.
- Added a dedicated French intermediary locale and localized the intermediary create/edit drawer without changing scoped backend queries, policies, or controller behavior.

### Files Created

- `resources/js/locales/fr/intermediaries.ts`

### Files Modified

- `resources/js/pages/Intermediaries/Index.tsx`
- `resources/js/features/intermediaries/drawers/IntermediaryDrawer.tsx`
- `resources/js/locales/fr/index.ts`
- `resources/js/locales/en.ts`
- `docs/AI_WORK_REPORT.md`

### Verification

- `npm.cmd run build` passed.
- `git diff --check` passed; only unrelated CRLF notices were reported.

## Users Workspace Cleanup And Tenant Safety

### What Was Changed

- Simplified the Users workspace by removing the unused fake firm-profile tab and the duplicate add-user action.
- Replaced the legacy profile side panel, including fake projects and activity, with the shared HeroUI-backed `AppDrawer` using real account, role, status, date, and effective-permission data.
- Improved the responsive Users table toolbar, added icon-led headers, persisted column ordering, and added a distinct suspended-user state and filter.
- Scoped user listing, single-user changes, bulk role/suspend/delete actions, and audit-log results to the authenticated user's company.
- Prevented CSV bulk import from updating an account owned by another company.

### Files Modified

- `resources/js/pages/Admin/Users/Index.tsx`
- `resources/js/features/users/types.ts`
- `app/Http/Resources/UserResource.php`
- `app/Http/Controllers/Admin/AdminUserController.php`
- `app/Http/Controllers/Admin/AdminUserInvitationController.php`
- `docs/AI_WORK_REPORT.md`

### Verification

- PHP lint passed for both admin user controllers and `UserResource`.
- `php artisan route:list --name=admin.users` passed.
- `npm.cmd run build` passed.
- No focused Admin Users test exists yet; add coverage for cross-company direct and bulk actions in the next security test pass.

### Follow-up UI Fix

- Corrected the Users filter control to use the required HeroUI `Dropdown.Popover` wrapper.
- The role and status choices now render as a compact framed menu instead of expanding through the table toolbar.
- `npm.cmd run build` passed again after the fix.

### KPI And Search Refinement

- Kept the Users metrics on the shared `AppKpiCard` component and aligned its live detail and accent configuration with the Finance KPI pattern.
- Replaced the narrow Users search with a responsive, clearable HeroUI search input for names, emails, roles, and permissions.
- `npm.cmd run build` passed.

### Users Filter Consolidation

- Removed the duplicate role-chip filter row below the Users toolbar.
- Kept one compact HeroUI filter menu for role and account status, with an active-filter count and an in-menu reset action.
- `npm.cmd run build` passed.

### Users Search Visibility

- Strengthened the dark-theme search border and added a dedicated accent icon container for faster visual recognition.
- `npm.cmd run build` passed.

### Users Section Spacing

- Added consistent vertical separation between the shared KPI strip and the Users table.
- `npm.cmd run build` passed.

### Users Import, Export, And Bulk Actions

- Moved CSV import beside CSV export in the Users table toolbar.
- Extracted CSV parsing/validation into a focused handler; import validates file type, rows, roles, CSRF response, and duplicate data before review.
- CSV export now reflects the filtered table and safely escapes values.
- Redesigned the selected-row table header into a clear HeroUI-backed bulk action bar for role assignment, suspension, deletion, and deselection.
- `npm.cmd run build` passed.

### Selected Users Export And Protection

- Added `Export selected` to the Users bulk-action bar; it exports only checked accounts.
- Kept toolbar export scoped to the current filtered table.
- Bulk suspension now skips the signed-in account and protects the final active admin account for the current company.
- Updated bulk-action feedback to avoid reporting protected accounts as changed.
- PHP lint and `npm.cmd run build` passed.

### HeroUI Users Selection Controls

- Replaced native table selection buttons with HeroUI `Checkbox` controls, matching the Finance documents table pattern.
- Replaced the hand-built selected-count indicator with a HeroUI `Chip`.
- `npm.cmd run build` passed.

### Users Bulk Control Cleanup

- Replaced the bulk role assignment compatibility wrapper with direct HeroUI `Select` and `ListBox` components.
- Converted the destructive bulk delete action to the shared compact icon-only button with an accessible tooltip and the existing confirmation dialog.
- `npm.cmd run build` passed.

### Client Active Status Control

- Added a HeroUI active/inactive switch column to the shared Clients table; archived clients remain intentionally non-toggleable.
- Added the policy-protected `clients.status.update` route, validated request, and focused action that records the old/new status in `audit_logs`.
- Added tenant-boundary coverage for the status update action.
- `php artisan test tests/Feature/ClientSecurityHardeningTest.php` passed: 4 tests, 26 assertions.
- `npm.cmd run build` passed.

### User Access Switch

- Added a HeroUI Access column to the User Management table while retaining the existing selection checkboxes.
- Each managed user can now be suspended or restored from the table; the signed-in account is disabled in the UI, and the backend also protects self-disable, the last active admin, and cross-company users.
- Added `admin.users.access.update` and audit events for access suspension/restoration.
- `php artisan test tests/Feature/AdminUserAccessTest.php` passed: 1 test, 7 assertions.
- `npm.cmd run build` passed.

### User Table Access Protection

- Added a reusable fixed-end table column option and pinned the User Management Actions column to the far right, including for saved column layouts.
- Admin rows now show a protected access state instead of a switch.
- The access endpoint rejects suspension of any Admin account, in addition to existing self and tenant protections.
- `php artisan test tests/Feature/AdminUserAccessTest.php` passed: 2 tests, 9 assertions.
- `npm.cmd run build` passed.

### User Table Multi-Select Restoration

- Pinned the HeroUI selection checkbox column to the first table position, including when a saved column layout exists.
- Added correct indeterminate selection state and preserved selected users across paginated pages.
- Bulk actions continue to operate on every selected user ID.
- `npm.cmd run build` passed.

### User Checkbox Visibility Fix

- Replaced the invisible Checkbox shorthand with the required HeroUI Checkbox compound controls in the User table header and rows.
- Multi-select, partial selection, and bulk actions remain unchanged.
- `npm.cmd run build` passed.

### User Dropdown Dismissal

- Made the User Management filter and row-action menus controlled HeroUI dropdowns.
- Menus now dismiss reliably when users click outside; row actions also close before opening their follow-up dialog.
- Kept the filter menu open while selecting multiple filter criteria.
- `npm.cmd run build` passed.

### User Role Labels

- Kept database role identifiers unchanged for authorization while formatting visible labels with Laravel's `Str::headline`.
- Role selectors and User Management role displays now render readable names such as `Super Admin`.
- PHP lint and `npm.cmd run build` passed.

### Bulk Role Selector Dismissal

- Renamed the User Management bulk selector placeholder to `Change role`.
- Removed its non-modal popover configuration and added controlled HeroUI open state, so outside clicks and role selections reliably close the menu.
- `npm.cmd run build` passed.

### User Profile Drawer

- Redesigned the User Management profile drawer around the real `UserResource` role, permission, access, and activity payload.
- Added readable role/status badges, compact account metadata, and HeroUI accordion groups for permission modules.
- Replaced raw permission-name walls with concise, expandable action chips.
- `npm.cmd run build` passed.

### Role Matrix, Secure Account Creation, And Permission-Aware Navigation

- Added a configuration-backed role matrix with the assignable roles: `Super Admin`, `Finance Admin`, `Manager`, `Operations Manager`, `Staff`, and `Viewer`.
- Added `Finance Admin` for full Finance operations, and `Operations Manager` for client, dossier, document, contract, archive, task, inbox, workload, and operations-report work without Finance visibility or access.
- Updated `Manager` to retain operational access with Finance read-only permissions. Manager accounts cannot create, edit, issue, cancel, delete, or otherwise manage Finance records.
- Added direct account creation from User Management with validated name, email, role, password confirmation, tenant assignment, role assignment, and audit logging.
- Enforced a privileged-account boundary: only an existing `Super Admin` can create or assign another `Super Admin`; backend validation enforces this even if a request is forged.
- Added permission-aware desktop sidebar and mobile navigation. Modules are hidden when the signed-in user lacks their required backend permission; this is a usability layer and does not replace policy/controller authorization.
- Added role-access coverage for Finance/Operations separation, Super Admin creation protection, and protected-administrator suspension prevention.
- Verification: PHP lint passed; `php artisan test tests/Feature/RoleAccessMatrixTest.php tests/Feature/AdminUserAccessTest.php` passed (4 tests, 23 assertions); `npm.cmd run build` passed. Vite reports only the existing large-chunk warning. PHPUnit could not write its local result-cache file in this sandbox, but the test suite itself passed.

### User Table Role Filter Consistency

- Split the User Management role data into safe assignable roles for creation/bulk assignment and visible roles for table filtering.
- The default `All users` filter now includes existing protected legacy Admin and Super Admin accounts, so the table matches KPI totals without exposing those roles as normal assignable choices.
- `npm.cmd run build` passed. Vite reports only the existing large-chunk warning.

### Finance Permission Visibility And Client Workspace Isolation

- Added a shared `usePermissions` hook and applied it to Finance document actions, Finance workspace header actions, expense actions, payment receipt actions, template management, and Finance settings controls.
- Finance-only tabs and actions are now hidden when the signed-in user lacks the matching permission. Context-specific disabled states remain separate from permission visibility.
- The Client workspace now removes its Finance tab and does not load or return dossier finance documents, payment records, finance totals, eligibility state, or finance timeline entries for users without `finance.view`.
- Finance list payloads now respect payment, expense, and template view permissions, and client/dossier selector data is constrained to the signed-in user's company and branch scope.
- Direct finance routes remain protected by Laravel policies; a manually entered protected URL is denied server-side.
- Verification: PHP lint and `git diff --check` passed; `npm.cmd run build` passed; `php artisan test tests/Feature/RoleAccessMatrixTest.php tests/Feature/AdminUserAccessTest.php` passed (4 tests, 23 assertions). PHPUnit only reported its local result-cache write restriction.

### Central Permission Catalogue And Tenant Enforcement

- Added `config/archilbo_permissions.php`, `PermissionRegistry`, and `permission.route` middleware as the shared authorization source for Clients, Intermediaries, Dossiers, Documents, Contracts, Archives, Finance, and User Management.
- Replaced legacy broad checks in protected controller and policy paths with granular action permissions and company/branch scope checks.
- Added Contract and Archive policies, protected archive bulk operations against cross-company IDs, and constrained contract/archive selectors and reports to the active tenant.
- The User Management access matrix now resolves to real direct Spatie permissions. Standard-role changes clear old direct grants.
- Shared effective permissions through Inertia and hid unavailable create, edit, delete, generation, download, checkout, and return controls in key workspaces.
- Added regression coverage for custom view/edit/delete behavior and protected client mutation routes. Details are in `docs/ROLES_AND_PERMISSIONS.md`.
- Verification: `php artisan test tests/Feature/GranularClientPermissionTest.php tests/Feature/ClientSecurityHardeningTest.php tests/Feature/RoleAccessMatrixTest.php tests/Feature/AdminUserAccessTest.php` passed (11 tests, 75 assertions); `npm.cmd run build`, PHP lint, `git diff --check`, and `php artisan optimize:clear` passed. Vite reports only the existing large-chunk advisory.

### Sidebar Navigation And Keyboard Shortcuts

- Reorganized the desktop sidebar into static icon-and-name `Main`, `Follow-up`, `Finance`, `Communication`, and `Administration` sections, with all authorized items visible by default.
- Moved Archive into operational follow-up and grouped Inbox and Notifications under Communication; removed decorative, non-actionable sidebar status items.
- Added permission-aware sidebar visibility from the central route catalog, including the collapsed rail and its flyouts.
- Added compact shortcut chips and in-app Alt navigation for authorized routes: Dashboard, Clients, Intermediaries, Projects, Documents, Contracts, Finance, Archive, Tasks, Calendar, Workload, Operations reports, Inbox, Notifications, and Users.
- Sidebar shortcuts never run while the user is typing in an input, textarea, select, or contenteditable field. Browser-reserved shortcuts remain under browser control where the browser prevents page-level handling.
- Files modified: `resources/js/components/layout/AppSidebar.tsx`, `resources/js/lib/appRoutes.ts`, `resources/js/locales/en.ts`, `resources/js/locales/fr/common.ts`.
- Verification: `npm.cmd run build` passed. Vite only reports the existing large-chunk advisory.

### Collaboration Permission And Tenant-Scope Audit

- Extended the central route-permission catalogue with exact and wildcard mappings for Dashboard, global search, client API lookup, project design, upload sessions, tasks, inbox, notifications, calendar, workload, operations reports, invitations, and QA routes.
- Added policy registration and granular policy enforcement for Tasks, Calendar Events, Calendar Reminders, Conversations, Messages, and Notifications. Read-only inbox users cannot send or manage conversations.
- Scoped task and calendar queries through their creator's company and branch, then applied that same scope to calendar conflicts, workload, operations reports, suggestions, participants, reminders, and related client/dossier/document/contract/archive/finance records.
- Added `RelatedRecordScopeGuard` so forged cross-company related IDs and user IDs cannot be attached when creating or updating tasks or calendar events.
- Protected global search so it only returns result categories the signed-in user is allowed to view, including Finance results.
- Seeded direct calendar permissions into the standard Operations Manager, Staff, and Viewer roles, while Finance Admin remains Finance-focused.
- Added `CollaborationPermissionScopeTest` coverage for denied cross-company task and calendar access.
- Verification: `php artisan test tests/Feature/CollaborationPermissionScopeTest.php tests/Feature/RoleAccessMatrixTest.php tests/Feature/GranularClientPermissionTest.php tests/Feature/AdminUserAccessTest.php` passed (9 tests, 53 assertions). `php artisan db:seed --class=RolesAndPermissionsSeeder`, `php artisan optimize:clear`, `npm.cmd run build`, and `git diff --check` passed. Vite still reports only the existing large-chunk advisory.
- Known documentation gap: `docs/ARCHITECTURE.md` is not present in this repository. Current task/calendar tenancy is enforced through their creator while those tables lack direct company/branch columns; adding indexed tenant keys is a future schema optimisation, not a current security gap.
