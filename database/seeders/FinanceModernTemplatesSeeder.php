<?php

namespace Database\Seeders;

use App\Models\FinanceTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class FinanceModernTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();

        FinanceTemplate::updateOrCreate(
            ['slug' => 'moderne-devis'],
            array_merge($this->quote(), ['created_by' => $admin?->id]),
        );

        FinanceTemplate::updateOrCreate(
            ['slug' => 'moderne-facture'],
            array_merge($this->invoice(), ['created_by' => $admin?->id]),
        );

        FinanceTemplate::updateOrCreate(
            ['slug' => 'moderne-recu'],
            array_merge($this->receipt(), ['created_by' => $admin?->id]),
        );

        $this->command?->info('Modern templates seeded: moderne-devis, moderne-facture, moderne-recu');
    }

    private function css(): string
    {
        return <<<'CSS'
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DejaVu Sans',sans-serif;font-size:10pt;color:#1e293b;line-height:1.6;background:#ffffff}
.page-wrapper{max-width:210mm;margin:0 auto;padding:30px 35px}
.accent-bar{width:100%;height:5px;background:linear-gradient(90deg,#1a365d,#3b82f6);border-radius:3px;margin-bottom:30px}
.header-grid{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
.company-block h1{font-size:16pt;color:#1a365d;font-weight:700;margin-bottom:4px;letter-spacing:-0.3px}
.company-block .slogan{font-size:8pt;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px}
.company-block p{font-size:8.5pt;color:#64748b;margin:1px 0}
.doc-block{text-align:right}
.doc-block .badge{display:inline-block;background:#1a365d;color:#fff;font-size:14pt;font-weight:700;padding:6px 18px;border-radius:4px;margin-bottom:8px;letter-spacing:0.08em}
.doc-block p{font-size:9pt;color:#475569;margin:2px 0}
.doc-block .meta-label{color:#94a3b8;font-size:8pt}
.info-cards{display:flex;gap:20px;margin-bottom:28px}
.info-card{flex:1;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px}
.info-card .card-label{font-size:7.5pt;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:6px}
.info-card h3{font-size:10pt;color:#1a365d;margin-bottom:4px}
.info-card p{font-size:8.5pt;color:#475569;margin:1px 0}
.items-table{width:100%;border-collapse:separate;border-spacing:0;margin-bottom:24px;border-radius:6px;overflow:hidden}
.items-table thead{background:#1a365d}
.items-table th{color:#fff;font-size:8.5pt;padding:10px 12px;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
.items-table td{padding:9px 12px;font-size:9pt;border-bottom:1px solid #e2e8f0}
.items-table tbody tr:last-child td{border-bottom:none}
.items-table tbody tr:nth-child(even){background:#f8fafc}
.items-table .text-right{text-align:right}
.items-table .text-center{text-align:center}
.totals-section{margin-left:auto;width:48%;margin-bottom:24px}
.totals-table{width:100%;border-collapse:collapse}
.totals-table td{padding:6px 12px;font-size:9pt}
.totals-table .label{color:#64748b}
.totals-table .value{text-align:right;font-weight:600}
.totals-table .sep td{padding:0;border-bottom:1px solid #e2e8f0}
.totals-table .grand-total td{padding:10px 12px;font-size:11pt;font-weight:700;color:#1a365d;border-top:2px solid #1a365d}
.totals-table .grand-total .value{font-size:12pt}
.terms-block{border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:20px;background:#fafbfc}
.terms-block strong{font-size:8.5pt;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;display:block;margin-bottom:6px}
.terms-block p{font-size:8.5pt;color:#475569;margin:2px 0}
.footer{border-top:1px solid #e2e8f0;padding-top:12px;margin-top:10px;font-size:8pt;color:#94a3b8;text-align:center}
.footer .bank-row{margin-bottom:3px}
CSS;
    }

    private function sharedBody(string $title, string $metaLine, bool $includePayments = false): string
    {
        $body = <<<'HTML'
<div class="page-wrapper">
  <div class="accent-bar"></div>

  <div class="header-grid">
    <div class="company-block">
      <p class="slogan">ARCHI LBO</p>
      <h1>{{company.name}}</h1>
      <p>{{company.address}}</p>
      <p>{{company.phone}} &bullet; {{company.email}}</p>
      <p>ICE {{company.ice}}</p>
    </div>
    <div class="doc-block">
      <div class="badge">__TITLE__</div>
      <p>{{document.number}}</p>
      <p><span class="meta-label">Date d&eacute;mission:</span> {{document.issue_date}}</p>
      <p>__META_LINE__</p>
    </div>
  </div>

  <div class="info-cards">
    <div class="info-card">
      <p class="card-label">Client</p>
      <h3>{{client.name}}</h3>
      <p>{{client.address}}</p>
      <p>{{client.phone}} &bullet; {{client.email}}</p>
      <p>CIN {{client.cin}}</p>
    </div>
    <div class="info-card">
      <p class="card-label">Dossier</p>
      <h3>{{dossier.number}}</h3>
      <p>{{dossier.project_object}}</p>
      <p>{{dossier.address}}</p>
      <p>{{dossier.commune}}</p>
    </div>
  </div>

  {{items_table}}

  __PAYMENTS_TABLE__

  <div class="totals-section">
    <table class="totals-table">
      <tr><td class="label">Total HT</td><td class="value">{{totals.subtotal_ht}}</td></tr>
      <tr><td class="label">Remise</td><td class="value">{{totals.discount_total}}</td></tr>
      <tr class="sep"><td colspan="2"></td></tr>
      <tr><td class="label">TVA</td><td class="value">{{totals.tax_total}}</td></tr>
      <tr class="sep"><td colspan="2"></td></tr>
      <tr class="grand-total"><td>Total TTC</td><td class="value">{{totals.total_ttc}}</td></tr>
      <tr><td class="label">Pay&eacute;</td><td class="value">{{totals.paid_total}}</td></tr>
      <tr><td class="label">Restant</td><td class="value">{{totals.remaining_total}}</td></tr>
    </table>
  </div>

  <div class="terms-block">
    <strong>Conditions &amp; Notes</strong>
    <p>{{document.terms}}</p>
    <p>{{document.notes}}</p>
  </div>

  <div class="footer">
    <p class="bank-row">{{company.name}} &bullet; {{company.address}} &bullet; {{company.phone}}</p>
    <p>{{bank.name}} &bullet; RIB {{bank.rib}}</p>
  </div>
</div>
HTML;

        return str_replace(
            ['__TITLE__', '__META_LINE__', '__PAYMENTS_TABLE__'],
            [$title, $metaLine, $includePayments ? '{{payments_table}}' : ''],
            $body,
        );
    }

    private function quote(): array
    {
        return [
            'type' => 'quote',
            'name' => 'Devis Moderne',
            'slug' => 'moderne-devis',
            'is_default' => false,
            'paper_size' => 'A4',
            'orientation' => 'portrait',
            'header_html' => '',
            'body_html' => $this->sharedBody('DEVIS', '<span class="meta-label">Valable jusqu\'au:</span> {{document.valid_until}}'),
            'footer_html' => '',
            'css' => $this->css(),
            'settings' => json_encode(['accent_color' => '#1a365d', 'style' => 'moderne']),
            'logo_path' => '',
        ];
    }

    private function invoice(): array
    {
        return [
            'type' => 'invoice',
            'name' => 'Facture Moderne',
            'slug' => 'moderne-facture',
            'is_default' => false,
            'paper_size' => 'A4',
            'orientation' => 'portrait',
            'header_html' => '',
            'body_html' => $this->sharedBody('FACTURE', '<span class="meta-label">&Eacute;ch&eacute;ance:</span> {{document.due_date}}'),
            'footer_html' => '',
            'css' => $this->css(),
            'settings' => json_encode(['accent_color' => '#1a365d', 'style' => 'moderne']),
            'logo_path' => '',
        ];
    }

    private function receipt(): array
    {
        return [
            'type' => 'receipt',
            'name' => 'Reçu Moderne',
            'slug' => 'moderne-recu',
            'is_default' => false,
            'paper_size' => 'A4',
            'orientation' => 'portrait',
            'header_html' => '',
            'body_html' => $this->sharedBody('REÇU', '', true),
            'footer_html' => '',
            'css' => $this->css(),
            'settings' => json_encode(['accent_color' => '#1a365d', 'style' => 'moderne']),
            'logo_path' => '',
        ];
    }
}
