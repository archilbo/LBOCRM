# Step 37 - Finance PDF and Excel Export

## Goal

Add real PDF and Excel exports for the new finance document builder using `finance_documents` and `finance_document_items` as the source of truth.

## What Was Added

- PDF generation with DomPDF.
- Excel generation with PhpSpreadsheet.
- Secure download routes through Laravel controllers.
- Per-document export actions in the finance table.
- Artisan QA command: `php artisan archilbo:test-finance-export {finance_document_id}`.

## Source of Truth

Exports read from:

- `finance_documents`
- `finance_document_items`
- `payments`
- related `clients`
- related `dossiers`
- related `finance_templates`

The existing project uses `finance_templates` for editable finance HTML/CSS templates. `document_templates` is a separate dossier/document lookup table in this codebase, so finance exports intentionally render through `finance_templates`.

## Storage

Files are stored on the public disk under:

- `finance/quotes/{number}/{number}.pdf`
- `finance/quotes/{number}/{number}.xlsx`
- `finance/invoices/{number}/{number}.pdf`
- `finance/invoices/{number}/{number}.xlsx`
- `finance/receipts/{number}/{number}.pdf`
- `finance/receipts/{number}/{number}.xlsx`

Controllers return downloads through Laravel routes. The UI does not expose absolute server paths.

## New Backend Services

- `app/Services/Finance/FinanceDocumentRenderData.php`
- `app/Services/Finance/FinanceTemplateRenderer.php`
- `app/Services/Finance/FinancePdfGenerator.php`
- `app/Services/Finance/FinanceExcelExporter.php`

## New Routes

- `PUT /finance/documents/{financeDocument}/generate-pdf`
- `PUT /finance/documents/{financeDocument}/generate-excel`
- `GET /finance/documents/{financeDocument}/download-excel`

Existing compatibility routes remain:

- `PUT /finance/documents/{financeDocument}/generate`
- `GET /finance/documents/{financeDocument}/download`
- `GET /finance/documents/{financeDocument}/download-pdf`

## UI Behavior

In `/finance`, each finance document row now shows:

- Generate PDF if no PDF exists.
- Download PDF if a PDF exists.
- Generate Excel if no Excel exists.
- Download Excel if an Excel file exists.

## Validation Fix

`template_id` validation now checks `finance_templates,id`, matching the actual foreign key used by `finance_documents`.

## QA

Run:

```bash
php artisan optimize:clear
composer dump-autoload
php artisan route:list --path=finance
php artisan storage:link
npm run build
php artisan archilbo:test-finance-export {finance_document_id}
```
