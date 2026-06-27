<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinanceTemplate;
use Illuminate\Support\Arr;

class FinanceTemplateRenderer
{
    public function __construct(private readonly FinanceDocumentRenderData $renderData)
    {
    }

    public function renderHtml(FinanceDocument $document): string
    {
        $data = $this->renderData->toArray($document);
        $template = $this->resolveTemplate($document);
        $body = trim((string) ($template?->body_html ?: $this->fallbackBody()));
        $header = trim((string) ($template?->header_html ?: ''));
        $footer = trim((string) ($template?->footer_html ?: ''));
        $css = trim((string) ($template?->css ?: $this->fallbackCss()));
        $content = $header . $body . $footer;
        $content = $this->replaceLegacyPlaceholders($content, $data);
        $content = $this->replacePlaceholders($content, $data);

        return '<!doctype html><html><head><meta charset="utf-8"><style>' . $css . '</style></head><body>' . $content . '</body></html>';
    }

    public function renderPreviewHtml(FinanceDocument $document): string
    {
        return $this->renderHtml($document);
    }

    public function renderTemplatePreview(?FinanceTemplate $template, array $data): string
    {
        $body = trim((string) ($template?->body_html ?: $this->fallbackBody()));
        $header = trim((string) ($template?->header_html ?: ''));
        $footer = trim((string) ($template?->footer_html ?: ''));
        $css = trim((string) ($template?->css ?: $this->fallbackCss()));
        $content = $header . $body . $footer;
        $content = $this->replaceLegacyPlaceholders($content, $data);
        $content = $this->replacePlaceholders($content, $data);

        return '<!doctype html><html><head><meta charset="utf-8"><style>' . $css . '</style></head><body>' . $content . '</body></html>';
    }

    public function replacePlaceholders(string $html, array $data): string
    {
        $html = str_replace('{{items_table}}', $this->renderItemsTable($data['items'], $data['document']['currency']), $html);
        $html = str_replace('{{payments_table}}', $this->renderPaymentsTable($data['payments'], $data['document']['currency']), $html);

        return preg_replace_callback('/{{\s*([a-zA-Z0-9_.]+)\s*}}/', function (array $matches) use ($data) {
            $value = Arr::get($data, $matches[1], '');

            return e(is_scalar($value) ? (string) $value : '');
        }, $html) ?? $html;
    }

    public function renderItemsTable(array $items, string $currency): string
    {
        if ($items === []) {
            return '<p>Aucune ligne.</p>';
        }

        $rows = collect($items)->map(function (array $item): string {
            return '<tr>'
                . '<td>' . e((string) $item['position']) . '</td>'
                . '<td><strong>' . e($item['title']) . '</strong><br><span>' . e($item['description']) . '</span></td>'
                . '<td class="text-right">' . e((string) $item['quantity']) . '</td>'
                . '<td>' . e($item['unit']) . '</td>'
                . '<td class="text-right">' . e($item['unit_price_display']) . '</td>'
                . '<td class="text-right">' . e((string) $item['discount_rate']) . '%</td>'
                . '<td class="text-right">' . e((string) $item['tva_rate']) . '%</td>'
                . '<td class="text-right">' . e($item['total_ht_display']) . '</td>'
                . '<td class="text-right">' . e($item['total_tva_display']) . '</td>'
                . '<td class="text-right">' . e($item['total_ttc_display']) . '</td>'
                . '</tr>';
        })->implode('');

        return '<table class="items-table"><thead><tr><th>#</th><th>Designation</th><th>Qt</th><th>Unite</th><th>PU HT</th><th>Remise</th><th>TVA</th><th>Total HT</th><th>Total TVA</th><th>Total TTC</th></tr></thead><tbody>' . $rows . '</tbody></table>';
    }

    public function renderPaymentsTable(array $payments, string $currency): string
    {
        if ($payments === []) {
            return '<p>Aucun paiement enregistre.</p>';
        }

        $rows = collect($payments)->map(fn (array $payment): string => '<tr>'
            . '<td>' . e($payment['payment_number']) . '</td>'
            . '<td>' . e($payment['paid_at']) . '</td>'
            . '<td>' . e($payment['method']) . '</td>'
            . '<td>' . e($payment['reference']) . '</td>'
            . '<td class="text-right">' . e($payment['amount_display']) . '</td>'
            . '</tr>')->implode('');

        return '<table class="payments-table"><thead><tr><th>Paiement</th><th>Date</th><th>Mode</th><th>Reference</th><th>Montant</th></tr></thead><tbody>' . $rows . '</tbody></table>';
    }

    private function resolveTemplate(FinanceDocument $document): ?FinanceTemplate
    {
        if ($document->template_id) {
            $template = FinanceTemplate::query()->find($document->template_id);
            if ($template) {
                return $template;
            }
        }

        return FinanceTemplate::query()
            ->where('type', $document->type)
            ->where('is_default', true)
            ->first()
            ?: FinanceTemplate::query()->where('type', $document->type)->first();
    }

    private function replaceLegacyPlaceholders(string $html, array $data): string
    {
        $legacy = [
            '{{company_name}}' => Arr::get($data, 'company.name', ''),
            '{{company_address}}' => Arr::get($data, 'company.address', ''),
            '{{company_phone}}' => Arr::get($data, 'company.phone', ''),
            '{{company_email}}' => Arr::get($data, 'company.email', ''),
            '{{company_ice}}' => Arr::get($data, 'company.ice', ''),
            '{{document_number}}' => Arr::get($data, 'document.number', ''),
            '{{issue_date}}' => Arr::get($data, 'document.issue_date', ''),
            '{{due_date}}' => Arr::get($data, 'document.due_date', ''),
            '{{valid_until}}' => Arr::get($data, 'document.valid_until', ''),
            '{{client_name}}' => Arr::get($data, 'client.name', ''),
            '{{client_civility}}' => '',
            '{{client_address}}' => Arr::get($data, 'client.address', ''),
            '{{client_phone}}' => Arr::get($data, 'client.phone', ''),
            '{{client_email}}' => Arr::get($data, 'client.email', ''),
            '{{client_cin}}' => Arr::get($data, 'client.cin', ''),
            '{{client_ice}}' => '',
            '{{dossier_number}}' => Arr::get($data, 'dossier.number', ''),
            '{{project_object}}' => Arr::get($data, 'dossier.project_object', ''),
            '{{project_address}}' => Arr::get($data, 'dossier.address', ''),
            '{{items_rows}}' => $this->renderLegacyItemRows($data['items']),
            '{{total_ht}}' => Arr::get($data, 'totals.subtotal_ht', ''),
            '{{tva_rate}}' => '',
            '{{tax_total}}' => Arr::get($data, 'totals.tax_total', ''),
            '{{total_ttc}}' => Arr::get($data, 'totals.total_ttc', ''),
            '{{payment_terms}}' => Arr::get($data, 'document.terms', ''),
            '{{bank_name}}' => Arr::get($data, 'bank.name', ''),
            '{{bank_rib}}' => Arr::get($data, 'bank.rib', ''),
            '{{bank_iban}}' => '',
            '{{bank_bic}}' => '',
        ];

        $replacements = [];

        foreach ($legacy as $placeholder => $value) {
            $replacements[$placeholder] = $placeholder === '{{items_rows}}'
                ? (string) $value
                : e((string) $value);
        }

        return str_replace(array_keys($replacements), array_values($replacements), $html);
    }

    private function renderLegacyItemRows(array $items): string
    {
        return collect($items)->map(fn (array $item): string => '<tr>'
            . '<td>' . e($item['title']) . '<br><small>' . e($item['description']) . '</small></td>'
            . '<td class="text-right">' . e((string) $item['quantity']) . '</td>'
            . '<td class="text-right">' . e($item['unit_price_display']) . '</td>'
            . '<td class="text-right">' . e($item['total_ht_display']) . '</td>'
            . '</tr>')->implode('');
    }

    private function fallbackBody(): string
    {
        return '<div class="document"><div class="header"><div><h1>{{company.name}}</h1><p>{{company.address}}</p><p>{{company.phone}} {{company.email}}</p></div><div class="document-title"><h2>{{document.type_label}}</h2><p>{{document.number}}</p><p>{{document.issue_date}}</p></div></div><div class="client-info"><h3>Client</h3><p>{{client.name}}</p><p>{{client.address}}</p><p>{{client.phone}} {{client.email}}</p></div><div class="project-info"><p><strong>Dossier:</strong> {{dossier.number}}</p><p><strong>Objet:</strong> {{dossier.project_object}}</p><p><strong>Adresse:</strong> {{dossier.address}}</p></div>{{items_table}}<table class="totals"><tr><td>Total HT</td><td>{{totals.subtotal_ht}}</td></tr><tr><td>Remise</td><td>{{totals.discount_total}}</td></tr><tr><td>TVA</td><td>{{totals.tax_total}}</td></tr><tr class="total"><td>Total TTC</td><td>{{totals.total_ttc}}</td></tr><tr><td>Paye</td><td>{{totals.paid_total}}</td></tr><tr><td>Restant</td><td>{{totals.remaining_total}}</td></tr></table><div class="notes"><p>{{document.notes}}</p><p>{{document.terms}}</p></div>{{payments_table}}</div>';
    }

    private function fallbackCss(): string
    {
        return 'body{font-family:DejaVu Sans,sans-serif;font-size:12px;color:#111}.document{padding:24px}.header{display:table;width:100%;margin-bottom:24px}.header>div{display:table-cell;width:50%;vertical-align:top}.document-title{text-align:right}h1,h2,h3{margin:0 0 8px}.items-table,.payments-table,.totals{width:100%;border-collapse:collapse;margin-top:16px}.items-table th,.items-table td,.payments-table th,.payments-table td,.totals td{border:1px solid #ddd;padding:7px}.items-table th,.payments-table th{background:#f3f4f6}.text-right{text-align:right}.totals{margin-left:auto;width:45%}.total{font-weight:bold;background:#f9fafb}.client-info,.project-info,.notes{margin-top:16px}';
    }
}
