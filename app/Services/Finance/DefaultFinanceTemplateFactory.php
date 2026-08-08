<?php

namespace App\Services\Finance;

/**
 * ARCHI LBO default Finance templates â€” v6, built from the textual
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
 *   A4 portrait     210Ã—297mm   content inset 15mm
 *   A5 landscape    210Ã—148mm   content inset 12mm
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
            'name' => 'ARCHI LBO â€” Devis',
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
    <p class="words-label">Le prÃ©sent devis est arrÃªtÃ© Ã  la somme de :</p>
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
            'css' => $this->css() . $this->portraitCss(),
            'settings' => ['accent_color' => '#D6B000', 'design' => 'archi-lbo', 'version' => '7'],
            'logo_path' => '',
        ];
    }

    public function invoice(): array
    {
        return [
            'type' => 'invoice',
            'name' => 'ARCHI LBO â€” Facture',
            'slug' => 'archi-lbo-facture',
            'is_default' => true,
            'paper_size' => 'A4',
            'orientation' => 'portrait',
            'header_html' => <<<'HTML'
<div class="finance-page">
<div class="brand-header brand-header-invoice">
  <table class="hdr-row"><tr>
    <td class="hdr-logo-cell">{{company.logo_html}}</td>
    <td class="hdr-info-cell">
      <h1 class="doc-title doc-title-facture">Facture</h1>
      <p class="doc-meta-right"><span class="doc-meta-label">REF :</span> {{document.number}}<br><span class="doc-meta-label">DATE :</span> {{document.issue_date}}</p>
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
  <table class="info-row"><tr>
    <td class="info-left">
      <div class="accent-bar"></div>
      <p class="info-line"><span class="info-label">ARCHITECTE :</span> {{company.representative}}</p>
      <p class="info-sub">{{company.address}}</p>
    </td>
    <td class="info-right">
      <p class="info-line"><span class="info-label">CLIENT :</span> {{client.name}}</p>
      <p class="info-line"><span class="info-label">PROJET :</span> {{dossier.project_object}}</p>
      <p class="info-line"><span class="info-label">ADDRESSE :</span> {{dossier.address}}</p>
      <p class="info-line"><span class="info-label">CIN / ICE :</span> {{client.identifier}}</p>
    </td>
  </tr></table>

  {{items_table}}

  <div class="totals-zone">
    <table class="totals">
      <tr><td class="totals-label">Prix total HT</td><td class="totals-value">{{totals.subtotal_ht}}</td></tr>
      <tr><td class="totals-label">TVA {{totals.tax_rate}} %</td><td class="totals-value">{{totals.tax_total}}</td></tr>
      <tr><td class="totals-label">Prix total TTC</td><td class="totals-value">{{totals.total_ttc}}</td></tr>
    </table>
    <p class="totals-secondary">Montant payÃ© : {{totals.paid_total}}&nbsp;&nbsp;Â·&nbsp;&nbsp;Reste Ã  payer : {{totals.remaining_total}}</p>
  </div>

  <div class="words">
    <p class="words-label">La prÃ©sente facture est arrÃªtÃ©e Ã  la somme de :</p>
    <p class="words-value">{{totals.amount_in_words}}</p>
  </div>

  <div class="words words-payment">
    <p class="words-label">Mode de paiement :</p>
    <p class="words-value-small">{{payment.method}} Â· {{payment.reference}}</p>
  </div>

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
            'css' => $this->css() . $this->portraitCss(),
            'settings' => ['accent_color' => '#D6B000', 'design' => 'archi-lbo', 'version' => '7'],
            'logo_path' => '',
        ];
    }

    public function receipt(): array
    {
        return [
            'type' => 'receipt',
            'name' => 'ARCHI LBO â€” ReÃ§u de paiement',
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
  <h1 class="doc-title doc-title-recu">ReÃ§u de paiement</h1>

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
            'css' => $this->css() . $this->landscapeCss(),
            'settings' => ['accent_color' => '#D6B000', 'design' => 'archi-lbo', 'version' => '7'],
            'logo_path' => '',
        ];
    }

    private function css(): string
    {
        return <<<'CSS'
/* â”€â”€ base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#050505;margin:0;padding:0}
@page{margin:0}
p{margin:0}
.text-right{text-align:right}
.finance-page{position:relative;width:210mm;min-height:297mm;background:#fff}
.finance-content{padding:0 15mm}
.finance-footer{position:absolute;bottom:0;left:0;right:0;text-align:center;padding-bottom:8mm}

/* â”€â”€ brand header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ titles / meta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.doc-title{font-size:17pt;font-weight:bold;color:#050505;text-transform:uppercase;letter-spacing:0.02em;margin:0}
.doc-head{width:100%;border-collapse:collapse}
.doc-head td{vertical-align:top;padding:0;border:none}
.doc-head-left{width:55%}
.doc-head-right{width:45%;text-align:right}
.doc-meta{font-size:8pt;color:#050505;margin-top:2.5mm}
.doc-meta-right{font-size:8pt;color:#050505;margin-top:2mm;line-height:1.6}
.doc-meta-label{font-weight:bold;color:#D6B000;font-size:7.5pt}

/* â”€â”€ info blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.info-row{width:100%;border-collapse:collapse}
.info-row td{vertical-align:top;padding:0;border:none}
.info-left{width:48%;padding-right:8mm}
.info-right{width:52%}
.accent-bar{width:1mm;height:13mm;background:#D6B000;margin:0.5mm 4mm 4mm 0;float:left}
.info-line{font-size:8.5pt;color:#050505;margin-bottom:1.6mm;line-height:1.4}
.info-sub{font-size:7.5pt;color:#555;line-height:1.5}
.info-label{font-weight:bold;color:#D6B000;font-size:7.5pt;text-transform:uppercase;letter-spacing:0.05em}
.info-line .info-label{margin-right:1.5mm}

/* â”€â”€ items table (renderer-generated) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ totals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.totals-zone{text-align:right}
.totals{margin-left:auto;width:87mm;border-collapse:collapse}
.totals td{padding:2.1mm 2.6mm;font-size:8.5pt}
.totals td:first-child{width:50%}
.totals-label{background:#050505;color:#D6B000;font-weight:bold;text-transform:uppercase;font-size:7.5pt;letter-spacing:0.05em}
.totals-value{background:#fff;color:#050505;font-weight:bold;text-align:right;border:0.5pt solid #050505}
.totals-discount{font-size:7.5pt;color:#777;margin-bottom:1mm;text-align:right}
.totals-secondary{font-size:7.5pt;color:#777;margin-top:2mm;text-align:right}

/* â”€â”€ amount in words / payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.words{border-left:1.2mm solid #D6B000;padding:0.7mm 0 0.7mm 3.5mm}
.words-label{font-size:7.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.06em;color:#D6B000;margin-bottom:1.5mm}
.words-value{font-size:10pt;font-weight:bold;color:#050505;line-height:1.35}
.words-value-small{font-size:8.5pt;font-weight:bold;color:#050505}

/* â”€â”€ footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.ftr-legal,.ftr-contact{font-size:7pt;color:#444;letter-spacing:0.02em;margin-bottom:1mm}
.footer-gold-line{width:65mm;border-top:0.6pt solid #D6B000;margin:3mm auto 0}

/* â”€â”€ logo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.company-logo-img{max-width:22mm;max-height:13mm}
.logo-mark{display:inline-block;width:15px;height:15px;background:#D6B000;margin-right:8px;vertical-align:middle}
.logo-mark span{display:none}
.logo-text{display:inline-block;font-weight:bold;font-size:15px;color:#050505;letter-spacing:0.1em;vertical-align:middle}
CSS;
    }

    private function portraitCss(): string
    {
        return <<<'CSS'
/* â”€â”€ A4 portrait vertical geometry (mm) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
/* â”€â”€ A5 landscape: dense geometry (mm) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
