<?php

namespace App\Services\Finance;

/**
 * ARCHI LBO default Finance templates — v6, built from the textual
 * reference specification (ARCHI LBO brand language).
 *
 * Design tokens (fixed, document-level, NOT the app accent):
 *   black       #050505
 *   gold        #D6B000
 *   gold accent #FFD51A
 *   light gray  #F0F0F0 (header band)
 *   row gray    #F5F5F5 / #ECECEC (alternating table rows)
 *
 * Page geometry (physical mm, Dompdf native):
 *   A4 portrait     210×297mm   content inset 15mm
 *   A5 landscape    210×148mm   content inset 12mm
 *
 * Composition rules:
 *   - `.finance-page` opens in header_html, closes at the end of footer_html
 *     so the wrapper is identical in the browser preview and in Dompdf.
 *   - `.brand-header` is a fixed-height block: logo/company row on top,
 *     full-bleed gray architectural band anchored at its bottom.
 *   - Sections live in `.finance-content` aligned on one vertical grid.
 *   - `.finance-footer` is pinned to the bottom of the page
 *     (position:absolute on the `.finance-page` wrapper).
 *
 * settings.version is bumped on design changes; the safe installer only
 * upgrades rows whose stored version is older.
 */
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
        return [
            'type' => 'quote',
            'name' => 'ARCHI LBO — Devis',
            'slug' => 'archi-lbo-devis',
            'is_default' => true,
            'paper_size' => 'A4',
            'orientation' => 'portrait',
            'header_html' => <<<'HTML'
<div class="finance-page">
<div class="brand-header">
  <table class="hdr-row"><tr>
    <td class="hdr-logo-cell">{{company.logo_html}}</td>
    <td class="hdr-info-cell">
      <p class="hdr-label">Architecte</p>
      <p class="hdr-value">{{company.representative}}</p>
      <p class="hdr-sub">{{company.address}}</p>
    </td>
  </tr></table>
  <div class="hdr-zone">
    <div class="hdr-wedge"></div>
    <div class="hdr-diag-gold"></div>
    <div class="hdr-diag-black"></div>
    <div class="hdr-black-line"></div>
    <div class="hdr-cut"></div>
  </div>
</div>
HTML,
            'body_html' => <<<'HTML'
<div class="finance-content">
  <table class="doc-head"><tr>
    <td class="doc-head-left">
      <h1 class="doc-title">Devis architectural</h1>
      <p class="doc-meta"><span class="doc-meta-label">REF :</span> {{document.number}}&nbsp;&nbsp;&nbsp;&nbsp;<span class="doc-meta-label">DATE :</span> {{document.issue_date}}</p>
    </td>
    <td class="doc-head-right">
      <p class="info-line"><span class="info-label">CLIENT :</span> {{client.name}}</p>
      <p class="info-line"><span class="info-label">PROJET :</span> {{dossier.project_object}}</p>
    </td>
  </tr></table>

  {{items_table}}

  <div class="totals-zone">
    <p class="totals-discount">{{totals.discount_line}}</p>
    <table class="totals">
      <tr><td class="totals-label">Prix total HT</td><td class="totals-value">{{totals.subtotal_ht}}</td></tr>
      <tr><td class="totals-label">TVA {{totals.tax_rate}} %</td><td class="totals-value">{{totals.tax_total}}</td></tr>
      <tr><td class="totals-label">Prix total TTC</td><td class="totals-value">{{totals.total_ttc}}</td></tr>
    </table>
  </div>

  <div class="words">
    <p class="words-label">Le présent devis est arrêté à la somme de :</p>
    <p class="words-value">{{totals.amount_in_words}}</p>
  </div>

  <div class="footer-spacer"></div>
</div>
HTML,
            'footer_html' => <<<'HTML'
<div class="finance-footer">
  <div class="footer-gold-line"></div>
</div>
</div>
HTML,
            'css' => $this->css().$this->portraitCss(),
            'settings' => ['accent_color' => '#D6B000', 'design' => 'archi-lbo', 'version' => '7'],
            'logo_path' => '',
        ];
    }

    public function invoice(): array
    {
        return [
            'type' => 'invoice',
            'name' => 'ARCHI LBO — Facture',
            'slug' => 'archi-lbo-facture',
            'is_default' => true,
            'paper_size' => 'A4',
            'orientation' => 'portrait',
            'header_html' => <<<'HTML'
<main class="invoice">
  <header class="top-banner">
    <div class="gold-sweep"></div>
    <div class="brand" aria-label="{{company.name}}">{{company.logo_html}}</div>
    <div class="invoice-heading">
      <h1>FACTURE</h1>
      <div class="invoice-meta"><span>REF : {{document.number}}</span><span>DATE : {{document.issue_date}}</span></div>
    </div>
  </header>
HTML,
            'body_html' => <<<'HTML'
  <section class="content">
    <table class="parties"><tr>
      <td class="seller">
        <div class="seller-name">ARCHITECTE : {{company.representative}}</div>
        <div>{{company.address}}</div>
      </td>
      <td class="client-cell">
        <table class="client-grid">
          <tr><td class="label">CLIENT</td><td>:</td><td>{{client.name}}</td></tr>
          <tr><td class="label">PROJET</td><td>:</td><td>{{dossier.project_object}}</td></tr>
          <tr><td class="label">ADRESSE</td><td>:</td><td>{{dossier.address}}</td></tr>
          <tr><td class="label">CIN/ICE</td><td>:</td><td>{{client.identifier}}</td></tr>
        </table>
      </td>
    </tr></table>

    {{items_table}}

    <table class="totals">
      <tr><th>Prix total HT</th><td>{{totals.subtotal_ht}}</td></tr>
      <tr><th>TVA {{totals.tax_rate}}%</th><td>{{totals.tax_total}}</td></tr>
      <tr><th>Prix total TTC</th><td>{{totals.total_ttc}}</td></tr>
    </table>

    <div class="notes">
      <div class="note">La présente facture est arrêtée à la somme de :<br>{{totals.amount_in_words}}</div>
      <div class="note">Mode de paiement : {{payment.method}}</div>
    </div>
  </section>
HTML,
            'footer_html' => <<<'HTML'
  <footer class="footer">
    <div>{{company.legal_line}}</div>
    <div>{{company.contact_line}}</div>
    <div class="footer-line"></div>
  </footer>
</main>
HTML,
            'css' => $this->suppliedInvoiceCss(),
            'settings' => ['accent_color' => '#E0AE19', 'design' => 'archi-lbo-facture-classic', 'version' => '8'],
            'logo_path' => '',
        ];
    }

    public function receipt(): array
    {
        return [
            'type' => 'receipt',
            'name' => 'ARCHI LBO — Reçu de paiement',
            'slug' => 'archi-lbo-recu',
            'is_default' => true,
            'paper_size' => 'A5',
            'orientation' => 'landscape',
            'header_html' => <<<'HTML'
<div class="finance-page">
<div class="brand-header">
  <table class="hdr-row"><tr>
    <td class="hdr-logo-cell">{{company.logo_html}}</td>
    <td class="hdr-info-cell">
      <p class="hdr-label">Architecte</p>
      <p class="hdr-value">{{company.representative}}</p>
      <p class="hdr-sub">{{company.address}}</p>
    </td>
  </tr></table>
  <div class="hdr-zone">
    <div class="hdr-wedge"></div>
    <div class="hdr-diag-gold"></div>
    <div class="hdr-diag-black"></div>
    <div class="hdr-black-line"></div>
    <div class="hdr-cut"></div>
  </div>
</div>
HTML,
            'body_html' => <<<'HTML'
<div class="finance-content">
  <h1 class="doc-title doc-title-recu">Reçu de paiement</h1>

  <table class="recu-info"><tr>
    <td class="recu-info-left">
      <p class="info-line"><span class="info-label">CLIENT :</span> {{client.name}}</p>
      <p class="info-line"><span class="info-label">T.F :</span> {{dossier.land_title_number}}</p>
    </td>
    <td class="recu-info-right">
      <p class="recu-city">{{dossier.city}}, {{document.issue_date}}</p>
    </td>
  </tr></table>

  {{receipt_table}}

  <div class="footer-spacer"></div>
</div>
HTML,
            'footer_html' => <<<'HTML'
<div class="finance-footer">
  <p class="ftr-legal">{{company.legal_line}}</p>
  <p class="ftr-contact">{{company.contact_line}}</p>
  <div class="footer-gold-line"></div>
</div>
</div>
HTML,
            'css' => $this->css().$this->landscapeCss(),
            'settings' => ['accent_color' => '#D6B000', 'design' => 'archi-lbo', 'version' => '7'],
            'logo_path' => '',
        ];
    }

    private function css(): string
    {
        return <<<'CSS'
/* ── base ─────────────────────────────────────────────── */
body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#050505;margin:0;padding:0}
@page{margin:0}
p{margin:0}
.text-right{text-align:right}
.finance-page{position:relative;width:210mm;min-height:297mm;background:#fff}
.finance-content{padding:0 15mm}
.finance-footer{position:absolute;bottom:0;left:0;right:0;text-align:center;padding-bottom:8mm}

/* ── brand header ─────────────────────────────────────── */
/* height = total box height; padding-top included via content-box sums */
.brand-header{position:relative;height:30mm;padding:7mm 15mm 0}
.hdr-row{width:100%;border-collapse:collapse}
.hdr-row td{vertical-align:top;padding:0;border:none}
.hdr-logo-cell{width:52%}
.hdr-info-cell{width:48%;text-align:right}
.hdr-label{font-size:7pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.08em;color:#D6B000;margin-bottom:0.5mm}
.hdr-value{font-size:9pt;font-weight:bold;color:#050505;margin-bottom:0.5mm}
.hdr-sub{font-size:7.5pt;color:#555;line-height:1.45}
.hdr-zone{position:absolute;left:0;right:0;bottom:0;height:13mm;background:#F0F0F0}
.hdr-cut{position:absolute;right:0;bottom:0;width:0;height:0;border-left:26mm solid transparent;border-bottom:13mm solid #fff}
.hdr-black-line{position:absolute;left:0;bottom:0;width:100%;height:0.4mm;background:#050505}
.hdr-diag-black{position:absolute;right:30mm;bottom:0;width:0;height:0;border-left:46mm solid transparent;border-bottom:1.2mm solid #050505}
.hdr-diag-gold{position:absolute;right:26mm;bottom:1.6mm;width:0;height:0;border-left:40mm solid transparent;border-bottom:1.2mm solid #D6B000}
.hdr-wedge{position:absolute;right:0;top:0;width:0;height:0;border-bottom:11mm solid #FFD51A;border-left:16mm solid transparent}

/* ── titles / meta ────────────────────────────────────── */
.doc-title{font-size:17pt;font-weight:bold;color:#050505;text-transform:uppercase;letter-spacing:0.02em;margin:0}
.doc-head{width:100%;border-collapse:collapse}
.doc-head td{vertical-align:top;padding:0;border:none}
.doc-head-left{width:55%}
.doc-head-right{width:45%;text-align:right}
.doc-meta{font-size:8pt;color:#050505;margin-top:2.5mm}
.doc-meta-right{font-size:8pt;color:#050505;margin-top:2mm;line-height:1.6}
.doc-meta-label{font-weight:bold;color:#D6B000;font-size:7.5pt}

/* ── info blocks ──────────────────────────────────────── */
.info-row{width:100%;border-collapse:collapse}
.info-row td{vertical-align:top;padding:0;border:none}
.info-left{width:48%;padding-right:8mm}
.info-right{width:52%}
.accent-bar{width:1mm;height:13mm;background:#D6B000;margin:0.5mm 4mm 4mm 0;float:left}
.info-line{font-size:8.5pt;color:#050505;margin-bottom:1.6mm;line-height:1.4}
.info-sub{font-size:7.5pt;color:#555;line-height:1.5}
.info-label{font-weight:bold;color:#D6B000;font-size:7.5pt;text-transform:uppercase;letter-spacing:0.05em}
.info-line .info-label{margin-right:1.5mm}

/* ── items table (renderer-generated) ─────────────────── */
.finance-items-table{width:100%;border-collapse:collapse}
.finance-items-table__head th{background:#050505;color:#D6B000;font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;padding:3mm 2mm;text-align:left;border:none;vertical-align:middle}
.finance-items-table__head th.text-right{text-align:right}
.finance-items-table td{padding:2mm;font-size:8.5pt;color:#050505;border-bottom:0.35pt solid #DDD;vertical-align:top}
.finance-items-table__row td{background:#F5F5F5}
.finance-items-table__row--alt td{background:#ECECEC}
.finance-items-table td.designation{width:48%}
.finance-items-table td:nth-child(2){width:10%}
.finance-items-table td:nth-child(3){width:20%}
.finance-items-table td:nth-child(4){width:22%}
.items-table.finance-items-table th:nth-child(2),.items-table.finance-items-table td:nth-child(2){text-align:center}
.items-table.finance-items-table td:nth-child(4){font-weight:600}
.finance-items-table .unit{color:#777;font-size:7.5pt}
.finance-items-table .description{color:#777;font-size:7.5pt}
.finance-items-empty{padding:3mm;color:#888;font-size:8.5pt;border:0.35pt dashed #CCC;margin:6mm 0}
.receipt-empty{color:#888;font-style:italic;text-align:center;padding:3mm}

/* ── totals ───────────────────────────────────────────── */
.totals-zone{text-align:right}
.totals{margin-left:auto;width:87mm;border-collapse:collapse}
.totals td{padding:2.1mm 2.6mm;font-size:8.5pt}
.totals td:first-child{width:50%}
.totals-label{background:#050505;color:#D6B000;font-weight:bold;text-transform:uppercase;font-size:7.5pt;letter-spacing:0.05em}
.totals-value{background:#fff;color:#050505;font-weight:bold;text-align:right;border:0.5pt solid #050505}
.totals-discount{font-size:7.5pt;color:#777;margin-bottom:1mm;text-align:right}
.totals-secondary{font-size:7.5pt;color:#777;margin-top:2mm;text-align:right}

/* ── amount in words / payment ────────────────────────── */
.words{border-left:1.2mm solid #D6B000;padding:0.7mm 0 0.7mm 3.5mm}
.words-label{font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.06em;color:#D6B000;margin-bottom:1.5mm}
.words-value{font-size:10pt;font-weight:bold;color:#050505;line-height:1.35}
.words-value-small{font-size:8.5pt;font-weight:bold;color:#050505}

/* ── footer ───────────────────────────────────────────── */
.ftr-legal,.ftr-contact{font-size:7pt;color:#444;letter-spacing:0.02em;margin-bottom:1mm}
.footer-gold-line{width:65mm;border-top:0.6pt solid #D6B000;margin:3mm auto 0}

/* ── logo ─────────────────────────────────────────────── */
.company-logo-img{max-width:22mm;max-height:13mm}
.logo-mark{display:inline-block;width:15px;height:15px;background:#D6B000;margin-right:8px;vertical-align:middle}
.logo-mark span{display:none}
.logo-text{display:inline-block;font-weight:bold;font-size:15px;color:#050505;letter-spacing:0.1em;vertical-align:middle}
CSS;
    }

    /**
     * The supplied invoice artwork is intentionally self-contained so the
     * document preview and Dompdf use the same A4 geometry.
     */
    private function suppliedInvoiceCss(): string
    {
        return <<<'CSS'
@page{size:A4;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:210mm;min-height:297mm;color:#231f20;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.invoice{position:relative;width:210mm;min-height:297mm;overflow:hidden;background:#fff}
.top-banner{position:relative;height:46mm;background:#f1f1f1;overflow:hidden}
.top-banner:after{content:"";position:absolute;left:-4%;right:-4%;bottom:-13mm;height:25mm;border-radius:50% 50% 0 0/35% 35% 0 0;background:#fff;transform:rotate(-1.1deg);z-index:2}
.gold-sweep{position:absolute;z-index:1;right:-8mm;bottom:5px;width:900%;height:11mm;background:linear-gradient(90deg,#a97600,#e0ae19,#ffd96b);clip-path:polygon(0 52%,100% 0,100% 100%)}
.brand{position:absolute;z-index:3;top:13mm;left:15mm;width:25mm;color:#e0ae19;text-align:center}
.brand .company-logo-img{display:block;max-width:19mm;max-height:19mm;margin:0 auto 2mm}
.brand .logo-mark{display:inline-block;width:19mm;height:19mm;background:#e0ae19;margin:0 auto 2mm}
.brand .logo-text{display:block;font-size:9pt;font-weight:900;white-space:nowrap}
.invoice-heading{position:absolute;z-index:3;top:10mm;right:14mm;text-align:right}
.invoice-heading h1{margin:0;font-size:31pt;line-height:.9;letter-spacing:-.6pt;font-weight:900}
.invoice-meta{margin-top:1.3mm;font-size:9.5pt;font-weight:700;white-space:nowrap}.invoice-meta span+span{margin-left:2mm}
.content{padding:18mm 15mm 0}.parties{width:100%;min-height:31mm;border-collapse:collapse}.parties>tbody>tr>td{vertical-align:top;padding:0}.seller{width:52%;border-left:.7mm solid #e0ae19;padding-left:3mm!important;padding-right:27mm!important;font-size:9.7pt;font-weight:700;line-height:1.25;text-transform:uppercase}.seller-name{margin-bottom:1.5mm;font-size:10.6pt;font-weight:900}.client-cell{width:48%}
.client-grid{width:100%;border-collapse:collapse;font-size:9.6pt;font-weight:700;text-transform:uppercase}.client-grid td{padding:0 0 1.1mm;vertical-align:top}.client-grid td:first-child{width:23mm;white-space:nowrap}.client-grid td:nth-child(2){width:3mm}.client-grid .label{white-space:nowrap}
.items-table{width:100%;margin-top:8mm;border-collapse:collapse;table-layout:fixed;font-size:10pt}.items-table th:nth-child(1){width:38%}.items-table th:nth-child(2){width:14%}.items-table th:nth-child(3){width:24%}.items-table th:nth-child(4){width:24%}
.items-table thead th{height:13mm;padding:3mm;background:#231f20;color:#ffbf00;text-align:center;text-transform:uppercase;font-weight:900}.items-table thead th:first-child{text-align:left}
.items-table tbody tr:nth-child(odd){background:#f1f1f1}.items-table tbody tr:nth-child(even){background:#fafafa}.items-table tbody td{height:13mm;padding:3mm 6mm;font-weight:700;text-align:center;vertical-align:middle}.items-table tbody td:first-child{text-align:left;text-transform:uppercase}.items-table .description,.items-table .unit{font-size:8pt;color:#555;text-transform:none}
.totals{width:93mm;margin:3mm 0 0 auto;border-collapse:collapse;table-layout:fixed;font-size:10pt;font-weight:900;text-transform:uppercase}.totals th{width:50%;height:10mm;padding:2.5mm 7mm;background:#231f20;color:#ffbf00;text-align:left}.totals td{height:10mm;padding:2.2mm 4mm;border:.5mm solid #231f20;text-align:center;background:#fff}
.notes{margin-top:15mm;text-transform:uppercase}.note{border-left:.7mm solid #ffd96b;padding-left:3mm;font-size:10pt;line-height:1.24;font-weight:900}.note+.note{margin-top:7mm}
.footer{position:absolute;left:15mm;right:15mm;bottom:15mm;text-align:center;font-size:8.8pt;line-height:1.35;font-weight:700;text-transform:uppercase}.footer-line{width:86mm;height:.6mm;margin:6mm auto 0;background:#e0ae19}
@media print{html,body{background:#fff}.invoice{margin:0;page-break-after:always}}
CSS;
    }

    private function portraitCss(): string
    {
        return <<<'CSS'
/* ── A4 portrait vertical geometry (mm) ────────────────── */
.brand-header-invoice{height:35mm}
.doc-title-facture{font-size:27pt;letter-spacing:0}
.doc-head{margin-top:15mm}
.doc-meta{margin-bottom:0}
.finance-items-table{margin-top:11mm}
.totals-zone{margin-top:8mm}
.words{margin-top:26mm}
.words-payment{margin-top:7mm}
.footer-spacer{height:10mm}
CSS;
    }

    private function landscapeCss(): string
    {
        return <<<'CSS'
/* ── A5 landscape: dense geometry (mm) ─────────────────── */
.finance-page{min-height:148mm}
.finance-content{padding:0 12mm}
.brand-header{height:22mm;padding:4mm 12mm 0}
.hdr-zone{height:8mm}
.hdr-cut{border-left:16mm solid transparent;border-bottom:8mm solid #fff}
.hdr-black-line{height:0.3mm}
.hdr-diag-black{right:19mm;border-left:30mm solid transparent;border-bottom:0.9mm solid #050505}
.hdr-diag-gold{right:16mm;bottom:1.2mm;border-left:26mm solid transparent;border-bottom:0.9mm solid #D6B000}
.hdr-wedge{border-bottom:7mm solid #FFD51A;border-left:10mm solid transparent}
.company-logo-img{max-width:18mm;max-height:9mm}
.hdr-value{font-size:8.5pt}
.hdr-sub{font-size:7pt}
.doc-title-recu{font-size:17pt}
.recu-info{width:100%;border-collapse:collapse;margin-top:2mm}
.recu-info td{vertical-align:top;padding:0;border:none}
.recu-info-left{width:60%}
.recu-info-right{width:40%;text-align:right}
.recu-city{font-size:9pt;font-weight:bold;color:#050505;margin-top:1mm}
.info-line{font-size:8pt;margin-bottom:1.2mm}
.finance-items-table{margin-top:3.5mm}
.finance-items-table__head th{padding:1.8mm 1.5mm;font-size:7pt}
.finance-items-table td{padding:1.3mm 1.5mm;font-size:7.5pt}
.receipt-table th:nth-child(1),.receipt-table td:nth-child(1){width:11%}
.receipt-table th:nth-child(2),.receipt-table td:nth-child(2){width:29%}
.receipt-table th:nth-child(3),.receipt-table td:nth-child(3){width:16%}
.receipt-table th:nth-child(4),.receipt-table td:nth-child(4){width:13%}
.receipt-table th:nth-child(5),.receipt-table td:nth-child(5){width:18%}
.receipt-table th:nth-child(6),.receipt-table td:nth-child(6){width:13%}
.receipt-total-row td{background:#050505;color:#D6B000;font-weight:bold;border-bottom:none;font-size:8pt}
.receipt-total-label{text-transform:uppercase;letter-spacing:0.05em}
.footer-spacer{height:8mm}
.finance-footer{padding-bottom:5mm}
.finance-footer .ftr-legal,.finance-footer .ftr-contact{font-size:6.5pt}
.footer-gold-line{width:55mm}
CSS;
    }
}
