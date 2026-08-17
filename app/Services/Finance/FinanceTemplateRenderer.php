<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\FinanceTemplate;
use Illuminate\Support\Arr;
use RuntimeException;

class FinanceTemplateRenderer
{
    public function __construct(
        private readonly FinanceDocumentRenderData $renderData,
        private readonly FinanceTemplatePlaceholderRegistry $registry,
    ) {
    }

    public function renderHtml(FinanceDocument $document): string
    {
        $data = $this->renderData->toArray($document);
        $template = $this->templateFor($document);
        $html = $this->assemble($template, $data);

        return $this->guardUnresolved($html);
    }

    public function renderPreviewHtml(FinanceDocument $document): string
    {
        return $this->renderHtml($document);
    }

    public function renderTemplatePreview(?FinanceTemplate $template, array $data): string
    {
        $html = $this->assemble($template, $data);

        return $this->guardUnresolved($html);
    }

    public function templateFor(FinanceDocument $document): ?FinanceTemplate
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

    public function replacePlaceholders(string $html, array $data): string
    {
        // Trusted, pre-generated HTML variables are rendered as-is (never escaped).
        foreach ($this->trustedReplacements($data) as $placeholder => $value) {
            $html = str_replace($placeholder, $value, $html);
        }

        return preg_replace_callback('/{{\s*([a-zA-Z0-9_.]+)\s*}}/', function (array $matches) use ($data) {
            $value = Arr::get($data, $matches[1], '');

            return e(is_scalar($value) ? (string) $value : '');
        }, $html) ?? $html;
    }

    public function renderItemsTable(array $items, string $currency): string
    {
        if ($items === []) {
            return '<p class="finance-items-empty">Aucune ligne.</p>';
        }

        $rows = collect($items)->map(function (array $item, int $index): string {
            $unit = trim((string) ($item['unit'] ?? ''));

            return '<tr class="finance-items-table__row' . ($index % 2 === 1 ? ' finance-items-table__row--alt' : '') . '">'
                . '<td class="designation"><strong>' . e((string) $item['title']) . '</strong>'
                . ($unit !== '' ? ' <span class="unit">(' . e($unit) . ')</span>' : '')
                . '<br><span class="description">' . e((string) $item['description']) . '</span></td>'
                . '<td class="text-right">' . e((string) $item['quantity']) . '</td>'
                . '<td class="text-right">' . e($item['unit_price_display']) . '</td>'
                . '<td class="text-right">' . e($item['total_ht_display']) . '</td>'
                . '</tr>';
        })->implode('');

        return '<table class="items-table finance-items-table">'
            . '<thead class="finance-items-table__head"><tr>'
            . '<th>DÉSIGNATION</th><th class="text-right">QTÉ</th><th class="text-right">PRIX UNITAIRE HT</th><th class="text-right">PRIX TOTAL HT</th>'
            . '</tr></thead><tbody class="finance-items-table__body">' . $rows . '</tbody></table>';
    }

    public function renderPaymentsTable(array $payments, string $currency): string
    {
        if ($payments === []) {
            return '<p class="finance-items-empty">Aucun paiement enregistré.</p>';
        }

        $rows = collect($payments)->map(fn (array $payment, int $index): string => '<tr class="finance-items-table__row' . ($index % 2 === 1 ? ' finance-items-table__row--alt' : '') . '">'
            . '<td>' . e($payment['payment_number']) . '</td>'
            . '<td>' . e($payment['paid_at']) . '</td>'
            . '<td>' . e($payment['method']) . '</td>'
            . '<td>' . e($payment['reference']) . '</td>'
            . '<td class="text-right">' . e($payment['amount_display']) . '</td>'
            . '</tr>')->implode('');

        return '<table class="payments-table finance-items-table">'
            . '<thead class="finance-items-table__head"><tr>'
            . '<th>Paiement</th><th>Date</th><th>Mode</th><th>Référence</th><th class="text-right">Montant</th>'
            . '</tr></thead><tbody class="finance-items-table__body">' . $rows . '</tbody></table>';
    }

    public function renderReceiptTable(array $payments, string $currency): string
    {
        // The receipt table is MANDATORY structure: it must always render,
        // even when no payment is linked yet (empty-state row + zero TOTAL).
        $rows = $payments === []
            ? '<tr class="finance-items-table__row"><td colspan="6" class="receipt-empty">Aucun paiement enregistré.</td></tr>'
            : collect($payments)->map(fn (array $payment, int $index): string => '<tr class="finance-items-table__row' . ($index % 2 === 1 ? ' finance-items-table__row--alt' : '') . '">'
                . '<td>' . e($payment['paid_at']) . '</td>'
                . '<td>' . e($payment['object']) . '</td>'
                . '<td class="text-right">' . e($payment['negotiated_display']) . '</td>'
                . '<td class="text-right">' . e($payment['advance_display']) . '</td>'
                . '<td>' . e($payment['method']) . '</td>'
                . '<td class="text-right">' . e($payment['remaining_display']) . '</td>'
                . '</tr>')->implode('');

        $money = fn (float $value): string => number_format($value, 2, '.', ' ') . ' ' . $currency;
        $last = $payments[array_key_last($payments)] ?? [];
        $totalRow = '<tr class="receipt-total-row">'
            . '<td colspan="2" class="receipt-total-label">TOTAL</td>'
            . '<td class="text-right">' . $money((float) collect($payments)->sum('negotiated')) . '</td>'
            . '<td class="text-right">' . $money((float) collect($payments)->sum('advance')) . '</td>'
            . '<td></td>'
            . '<td class="text-right">' . $money((float) ($last['remaining'] ?? 0)) . '</td>'
            . '</tr>';

        return '<table class="receipt-table finance-items-table">'
            . '<thead class="finance-items-table__head"><tr>'
            . '<th>DATE</th><th>OBJET</th><th class="text-right">MONTANT<br>NÉGOCIÉ</th><th class="text-right">AVANCE</th><th>MODE DE<br>PAIEMENT</th><th class="text-right">RESTE</th>'
            . '</tr></thead><tbody class="finance-items-table__body">' . $rows . $totalRow . '</tbody></table>';
    }

    /**
     * Strict policy: no template token may survive into the final document.
     */
    private function guardUnresolved(string $html): string
    {
        $remaining = $this->findTokens($html);

        if ($remaining !== []) {
            throw new RuntimeException(
                'Impossible de générer le document : placeholders non résolus ' . implode(', ', $remaining) . '.'
            );
        }

        return $html;
    }

    private function findTokens(string $html): array
    {
        preg_match_all('/{{\s*[^{}\s][^{}]*\s*}}/', $html, $matches);

        return array_values(array_unique($matches[0] ?? []));
    }

    private function assemble(?FinanceTemplate $template, array $data): string
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

    private function trustedReplacements(array $data): array
    {
        $currency = (string) Arr::get($data, 'document.currency', FinanceSettingsService::getCurrency());

        return [
            '{{items_table}}' => $this->renderItemsTable(Arr::get($data, 'items', []), $currency),
            '{{payments_table}}' => $this->renderPaymentsTable(Arr::get($data, 'payments', []), $currency),
            '{{receipt_table}}' => $this->renderReceiptTable(Arr::get($data, 'payments', []), $currency),
            '{{company.logo_html}}' => (string) Arr::get($data, 'company.logo_html', ''),
        ];
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
            '{{invoice.reference}}' => Arr::get($data, 'document.number', ''),
            '{{issue_date}}' => Arr::get($data, 'document.issue_date', ''),
            '{{due_date}}' => Arr::get($data, 'document.due_date', ''),
            '{{valid_until}}' => Arr::get($data, 'document.valid_until', ''),
            '{{client_name}}' => Arr::get($data, 'client.name', ''),
            '{{client_civility}}' => '',
            '{{client_address}}' => Arr::get($data, 'client.address', ''),
            '{{client_phone}}' => Arr::get($data, 'client.phone', ''),
            '{{client_email}}' => Arr::get($data, 'client.email', ''),
            '{{client_cin}}' => Arr::get($data, 'client.identifier', Arr::get($data, 'client.cin', '')),
            '{{client_ice}}' => Arr::get($data, 'client.ice', ''),
            '{{dossier_number}}' => Arr::get($data, 'dossier.number', ''),
            '{{project_object}}' => Arr::get($data, 'dossier.project_object', ''),
            '{{project_address}}' => Arr::get($data, 'dossier.address', ''),
            '{{items_rows}}' => $this->renderLegacyItemRows($data['items']),
            '{{total_ht}}' => Arr::get($data, 'totals.subtotal_ht', ''),
            '{{tva_rate}}' => Arr::get($data, 'totals.tax_rate', ''),
            '{{tax_total}}' => Arr::get($data, 'totals.tax_total', ''),
            '{{total_ttc}}' => Arr::get($data, 'totals.total_ttc', ''),
            '{{payment_terms}}' => Arr::get($data, 'document.terms', ''),
            '{{invoice.payment_method}}' => Arr::get($data, 'payment.method', ''),
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
        return 'body{font-family:DejaVu Sans,sans-serif;font-size:12px;color:#111}.document{padding:24px}.header{display:table;width:100%;margin-bottom:24px}.header>div{display:table-cell;width:50%;vertical-align:top}.document-title{text-align:right}h1,h2,h3{margin:0 0 8px}.items-table,.payments-table,.receipt-table,.totals{width:100%;border-collapse:collapse;margin-top:16px}.items-table th,.items-table td,.payments-table th,.payments-table td,.receipt-table th,.receipt-table td,.totals td{border:1px solid #ddd;padding:7px}.items-table th,.payments-table th,.receipt-table th{background:#f3f4f6}.text-right{text-align:right}.totals{margin-left:auto;width:45%}.total{font-weight:bold;background:#f9fafb}.client-info,.project-info,.notes{margin-top:16px}';
    }
}
