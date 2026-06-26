# Step 36 - Finance Live Builder UI

## Goal

Step 36 adds the frontend live builder for finance documents while keeping the legacy finance records module intact.

The implemented workspace targets the newer finance document backend:

- `/finance/documents`
- `/finance/payments`
- quote to invoice conversion routes
- quote accept/reject routes
- secure document download routes already defined by the backend

## What Was Added

### Frontend Types and Calculations

- `resources/js/features/finance/types.ts`
- `resources/js/features/finance/utils/calculations.ts`

The finance types now cover:

- finance document types: quote, invoice, receipt
- finance statuses
- document items
- finance documents
- settings
- client, dossier, template options
- payments

The calculator supports:

- item-level HT, TVA, TTC calculation
- document-level subtotal, discount, TVA, TTC calculation
- money formatting
- numeric normalization
- empty item creation

## UI Components

Added reusable finance UI components:

- `FinanceTabs`
- `FinanceMetricCards`
- `FinanceStatusBadge`
- `FinanceMoneyCell`
- `FinanceDocumentActions`
- `FinanceItemsTable`
- `FinanceTotalsBox`
- `FinanceDocumentPreview`
- `FinanceClientDossierFields`
- `FinanceDateFields`

## Drawers

Added same-page finance drawers:

- `FinanceDocumentBuilderDrawer`
- `PaymentDrawer`

The document builder supports:

- create and edit modes
- devis, facture, and recu types
- client and dossier selection
- automatic client selection from dossier
- date defaults from finance settings
- item add, duplicate, delete
- live totals
- live A4-style preview
- POST `/finance/documents`
- PUT `/finance/documents/{id}`

The payment drawer supports:

- selecting or passing an invoice
- live total, paid, remaining-after-payment display
- payment method, reference, paid date, notes
- POST `/finance/payments`

## Page Updated

Updated:

- `resources/js/pages/Finance/Documents/Index.tsx`

The page now has tabs:

- Vue generale
- Devis
- Factures
- Paiements
- Templates
- Parametres

The page includes:

- finance metric cards
- recent document overview
- devis table
- facture table
- payments table
- action buttons for edit, accept, reject, convert, payment, delete, download
- templates/settings placeholders without building new modules

## Backend Compatibility

Updated:

- `FinanceDocumentController@index`
- `FinanceDocumentResource`
- `FinanceDocumentItemResource`
- `PaymentResource`

The document index now provides:

- finance documents with items and payments
- payments list
- metrics
- rich client options
- rich dossier options
- template options
- finance settings defaults

Resource output was normalized to expose real project field names and numeric money values.

## Important Decisions

- The legacy `/finance` finance records module was not deleted.
- The live builder is attached to `/finance/documents`, which matches the Step 34/35 finance document backend.
- No new UI framework was added.
- Existing React Aria/Tailwind app components were reused.
- Backend routes remain Laravel/Inertia routes.

## Commands Run

```bash
npm run build
php artisan optimize:clear
php artisan route:list --path=finance
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
```

## Results

- `npm run build`: passed.
- `php artisan optimize:clear`: passed.
- `php artisan route:list --path=finance`: passed after removing BOM from touched PHP files.
- `php -l`: passed.

Vite reported a large chunk warning, but the build completed successfully.

## Known Issues

- Templates and settings tabs are placeholders in this step because this phase is the live builder UI, not full settings/template management.
- Payment delete/edit UI is not included in the tab yet; payment creation is included.
- The old `/finance` route still points to the legacy finance records page by design.

## Next Recommended Step

Open `/finance/documents` in the browser and verify:

1. Create a devis.
2. Edit the devis.
3. Accept or reject a devis.
4. Convert an accepted devis to facture.
5. Record a payment on a facture.
6. Confirm totals update correctly.
