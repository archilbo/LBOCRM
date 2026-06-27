<?php

namespace App\Services\Finance;

use Illuminate\Support\Str;

class DefaultFinanceTemplateFactory
{
    public function forType(string $type): array
    {
        return match ($type) {
            'invoice' => $this->invoice(),
            'receipt' => $this->receipt(),
            default => $this->quote(),
        };
    }

    public function quote(): array
    {
        return $this->base('quote', 'Devis standard', 'DEVIS', 'Validite: {{document.valid_until}}');
    }

    public function invoice(): array
    {
        return $this->base('invoice', 'Facture standard', 'FACTURE', 'Echeance: {{document.due_date}}');
    }

    public function receipt(): array
    {
        return $this->base('receipt', 'Recu standard', 'RECU', 'Date: {{document.issue_date}}', true);
    }

    private function base(string $type, string $name, string $title, string $metaLine, bool $includePayments = false): array
    {
        $body = <<<'HTML'
<section class="document-shell">
  <div class="document-grid">
    <div class="company-card">
      <p class="eyebrow">ARCHI LBO</p>
      <h1>{{company.name}}</h1>
      <p>{{company.address}}</p>
      <p>{{company.phone}} - {{company.email}}</p>
      <p>ICE: {{company.ice}}</p>
    </div>
    <div class="document-card">
      <p class="eyebrow">Document</p>
      <h2>{{document.type_label}}</h2>
      <p>{{document.number}}</p>
      <p>Date: {{document.issue_date}}</p>
      <p>__META_LINE__</p>
    </div>
  </div>

  <div class="info-grid">
    <div>
      <p class="eyebrow">Client</p>
      <h3>{{client.name}}</h3>
      <p>{{client.address}}</p>
      <p>CIN: {{client.cin}}</p>
    </div>
    <div>
      <p class="eyebrow">Dossier</p>
      <h3>{{dossier.number}}</h3>
      <p>{{dossier.project_object}}</p>
      <p>{{dossier.address}}</p>
    </div>
  </div>

  {{items_table}}

  <table class="totals-table">
    <tr><td>Total HT</td><td>{{totals.subtotal_ht}}</td></tr>
    <tr><td>Remise</td><td>{{totals.discount_total}}</td></tr>
    <tr><td>TVA</td><td>{{totals.tax_total}}</td></tr>
    <tr class="grand-total"><td>Total TTC</td><td>{{totals.total_ttc}}</td></tr>
    <tr><td>Paye</td><td>{{totals.paid_total}}</td></tr>
    <tr><td>Restant</td><td>{{totals.remaining_total}}</td></tr>
  </table>

  __PAYMENTS_TABLE__

  <div class="terms-block">
    <strong>Conditions</strong>
    <p>{{document.terms}}</p>
    <p>{{document.notes}}</p>
  </div>
</section>
HTML;

        return [
            'type' => $type,
            'name' => $name,
            'slug' => 'default-' . $type,
            'is_default' => true,
            'paper_size' => 'A4',
            'orientation' => 'portrait',
            'header_html' => '',
            'body_html' => str_replace(
                ['{{document.type_label}}', '__META_LINE__', '__PAYMENTS_TABLE__'],
                [$title, $metaLine, $includePayments ? '{{payments_table}}' : ''],
                $body,
            ),
            'footer_html' => '<footer class="legal-footer">{{company.name}} - {{company.address}} - RIB {{bank.rib}}</footer>',
            'css' => $this->css(),
            'settings' => ['accent_color' => '#1a365d', 'footer_text' => 'Merci pour votre confiance.'],
            'logo_path' => '',
        ];
    }

    private function css(): string
    {
        return <<<'CSS'
body{font-family:DejaVu Sans,Arial,sans-serif;font-size:12px;color:#172033;background:#fff}.document-shell{padding:28px}.document-grid,.info-grid{display:table;width:100%;margin-bottom:22px}.document-grid>div,.info-grid>div{display:table-cell;width:50%;vertical-align:top}.document-card{text-align:right}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#64748b;margin:0 0 6px}h1,h2,h3{margin:0 0 8px;color:#1a365d}.items-table,.payments-table,.totals-table{width:100%;border-collapse:collapse;margin-top:18px}.items-table th,.payments-table th{background:#1a365d;color:#fff}.items-table th,.items-table td,.payments-table th,.payments-table td,.totals-table td{border:1px solid #d7dde8;padding:8px}.text-right{text-align:right}.totals-table{margin-left:auto;width:42%}.grand-total{font-weight:bold;background:#eef4ff}.terms-block{margin-top:22px;padding:12px;background:#f7fafc;border:1px solid #d7dde8}.legal-footer{margin:26px 28px 0;padding-top:10px;border-top:1px solid #d7dde8;font-size:10px;color:#64748b;text-align:center}
CSS;
    }
}
