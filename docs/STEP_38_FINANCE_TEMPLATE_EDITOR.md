# Step 38 - Finance Template Editor

## What The Editor Does

The finance template editor lets ARCHI LBO manage PDF templates used by the new finance document workflow:

- Devis / quote
- Facture / invoice
- Recu / receipt

It edits the existing `finance_templates` table, not the older `document_templates` table used for required dossier documents.

## Routes

- `GET /finance/templates`
- `POST /finance/templates`
- `GET /finance/templates/{documentTemplate}`
- `PUT /finance/templates/{documentTemplate}`
- `DELETE /finance/templates/{documentTemplate}`
- `POST /finance/templates/{documentTemplate}/duplicate`
- `PUT /finance/templates/{documentTemplate}/default`
- `PUT /finance/templates/reset/{type}`
- `GET /finance/templates/{documentTemplate}/preview`

## Placeholder List

Company:

- `{{company.name}}`
- `{{company.address}}`
- `{{company.phone}}`
- `{{company.email}}`
- `{{company.ice}}`
- `{{company.tva}}`
- `{{company.patente}}`
- `{{company.cnss}}`

Bank:

- `{{bank.name}}`
- `{{bank.rib}}`

Document:

- `{{document.number}}`
- `{{document.type_label}}`
- `{{document.status}}`
- `{{document.issue_date}}`
- `{{document.due_date}}`
- `{{document.valid_until}}`
- `{{document.notes}}`
- `{{document.terms}}`

Client:

- `{{client.name}}`
- `{{client.cin}}`
- `{{client.address}}`
- `{{client.phone}}`
- `{{client.email}}`

Dossier:

- `{{dossier.number}}`
- `{{dossier.project_object}}`
- `{{dossier.address}}`
- `{{dossier.commune}}`
- `{{dossier.province}}`

Totals:

- `{{totals.subtotal_ht}}`
- `{{totals.discount_total}}`
- `{{totals.tax_total}}`
- `{{totals.total_ttc}}`
- `{{totals.paid_total}}`
- `{{totals.remaining_total}}`

Special:

- `{{items_table}}`
- `{{payments_table}}`

Legacy placeholders such as `{{company_name}}` and `{{items_rows}}` remain supported by `FinanceTemplateRenderer` for old seeded templates.

## How Default Templates Work

Each finance template has:

- `type`
- `slug`
- `is_default`
- `header_html`
- `body_html`
- `footer_html`
- `css`
- `settings`

Only one default template should be active per type. Setting a template as default unsets the other defaults for the same type.

## How PDF Generator Chooses Template

`FinanceTemplateRenderer` chooses templates in this order:

1. `finance_documents.template_id`, if set.
2. Default `finance_templates` row for the finance document type.
3. First available `finance_templates` row for the finance document type.
4. Internal fallback body/CSS if no database template exists.

## Duplicate Templates

The editor can duplicate any template. The duplicate keeps the HTML/CSS/settings from the source template, gets a unique slug, and is not default until explicitly set.

## Reset Defaults

The reset route recreates a new default template for `quote`, `invoice`, or `receipt` using `DefaultFinanceTemplateFactory`. It does not delete custom templates.

## Safety

Store/update requests reject:

- `<script>` tags
- inline JavaScript attributes like `onclick=`, `onerror=`, `onload=`

The frontend also warns about:

- unsupported placeholders
- empty body HTML
- missing `{{items_table}}` for quote/invoice templates

## Known Limitations

- Logo upload is not built yet; `logo_path` is editable as text.
- No heavy WYSIWYG editor in this version.
- No template version history yet.
- Manual browser testing requires MySQL running.

## Future Improvements

- Logo/media upload reuse.
- Drag/drop template blocks.
- Template marketplace/presets.
- Template version history and rollback.
- Better HTML linting.
