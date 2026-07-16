<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Synthèse Mensuelle</title>
    <style>
        @font-face {
            font-family: 'Inter';
            font-weight: 400;
            font-style: normal;
            src: url({{ $interRegular }}) format('truetype');
        }
        @font-face {
            font-family: 'Inter';
            font-weight: 600;
            font-style: normal;
            src: url({{ $interSemiBold }}) format('truetype');
        }
        @font-face {
            font-family: 'Inter';
            font-weight: 700;
            font-style: normal;
            src: url({{ $interBold }}) format('truetype');
        }
        @font-face {
            font-family: 'Inter';
            font-weight: 800;
            font-style: normal;
            src: url({{ $interExtraBold }}) format('truetype');
        }

        @page {
            margin: 15mm 12mm 18mm;
        }
        body {
            font-family: Inter, DejaVu Sans, sans-serif;
            font-size: 10pt;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* ----- TOP BAR ----- */
        .topbar {
            width: 100%;
            height: 4px;
            background: #6366f1;
            margin-bottom: 16px;
            border-radius: 2px;
        }

        /* ----- HEADER ----- */
        .header {
            width: 100%;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .header table {
            width: 100%;
            border-collapse: collapse;
        }
        .header table td {
            padding: 0;
            vertical-align: middle;
        }
        .header-logo-cell {
            width: 48px;
            padding-right: 10px !important;
        }
        .header-logo {
            width: 48px;
            height: 48px;
        }
        .h-name {
            font-size: 14pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.3px;
        }
        .h-meta {
            font-size: 7.5pt;
            color: #64748b;
            margin-top: 2px;
            line-height: 1.5;
        }
        .h-meta .sep { margin: 0 4px; color: #cbd5e1; }
        .h-right { text-align: right; white-space: nowrap; }
        .h-tag {
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #94a3b8;
        }
        .h-title {
            font-size: 14pt;
            font-weight: 800;
            color: #6366f1;
            margin: 2px 0 0;
        }
        .h-range {
            font-size: 8pt;
            color: #475569;
            margin-top: 2px;
        }
        .h-gen {
            font-size: 7pt;
            color: #94a3b8;
            margin-top: 3px;
        }

        /* ----- KPI 3×2 ----- */
        .kpi-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 5px;
            margin-bottom: 12px;
        }
        .kpi-table td {
            width: 33.33%;
            border: 1px solid #e2e8f0;
            padding: 10px 12px;
            background: #fafbfc;
            border-radius: 5px;
        }
        .kpi-table td.accent {
            border-color: #6366f1;
            background: #eef2ff;
        }
        .kpi-table td.danger {
            border-color: #ef4444;
            background: #fef2f2;
        }
        .kpi-table td.accent .kv { color: #4f46e5; }
        .kpi-table td.danger .kv { color: #dc2626; }
        .kl {
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #94a3b8;
        }
        .kv {
            font-size: 13pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
        }
        .ks {
            font-size: 7pt;
            color: #94a3b8;
            margin-top: 1px;
        }

        /* ----- SECTION ----- */
        .section-label {
            font-size: 9pt;
            font-weight: 700;
            color: #0f172a;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #e2e8f0;
            margin-bottom: 6px;
        }

        /* ----- DATA TABLE ----- */
        table.data {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
        }
        table.data thead th {
            background: #f8fafc;
            color: #64748b;
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            padding: 5px 6px;
            border-bottom: 2px solid #cbd5e1;
            text-align: left;
        }
        table.data thead th.r { text-align: right; }
        table.data tbody td {
            padding: 4px 6px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            white-space: nowrap;
        }
        table.data tbody td.r { text-align: right; }
        table.data tbody tr:nth-child(even) td { background: #fafbfc; }

        /* ----- BADGES ----- */
        .badge {
            display: inline-block;
            border-radius: 3px;
            padding: 1px 6px;
            font-size: 7pt;
            font-weight: 700;
        }
        .b-device  { background: #e0f2fe; color: #0369a1; }
        .b-invoice { background: #ede9fe; color: #6d28d9; }
        .b-receipt { background: #d1fae5; color: #047857; }
        .b-payment { background: #fef3c7; color: #b45309; }

        /* ----- PILLS ----- */
        .pill {
            display: inline-block;
            border-radius: 6px;
            padding: 1px 7px;
            font-size: 7.5pt;
            font-weight: 600;
        }
        .p-ok  { background: #d1fae5; color: #047857; }
        .p-info   { background: #dbeafe; color: #1d4ed8; }
        .p-gry { background: #f1f5f9; color: #64748b; }
        .p-bad    { background: #fee2e2; color: #b91c1c; }
        .p-pur { background: #ede9fe; color: #6d28d9; }

        /* ----- CHART SECTION ----- */
        .chart-wrap {
            margin-top: 10px;
            margin-bottom: 4px;
        }
        .chart-title {
            font-size: 7pt;
            font-weight: 700;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 3px;
        }

        /* ----- FOOTER ----- */
        .footer {
            position: fixed;
            bottom: -16mm;
            left: 12mm;
            right: 12mm;
            height: 10mm;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid #e2e8f0;
            padding-top: 3px;
            font-size: 7pt;
            color: #94a3b8;
        }
        .footer .pn:after { content: counter(page); }
    </style>
</head>
<body>

<div class="topbar"></div>

<!-- ===== HEADER ===== -->
<div class="header">
    <table cellpadding="0" cellspacing="0">
        <tr>
            <td class="header-logo-cell">
                @if (!empty($company['logoDataUri']))
                    <img src="{{ $company['logoDataUri'] }}" class="header-logo" alt="">
                @endif
            </td>
            <td>
                <div class="h-name">{{ $company['name'] ?: 'ARCHI LBO' }}</div>
                <div class="h-meta">
                    <span>{{ $company['address'] ?: '—' }}</span>
                    @if ($company['phone'])<span class="sep">|</span><span>{{ $company['phone'] }}</span>@endif
                    @if ($company['email'])<span class="sep">|</span><span>{{ $company['email'] }}</span>@endif
                    @if ($company['ice'])<span class="sep">|</span><span>ICE {{ $company['ice'] }}</span>@endif
                </div>
            </td>
            <td class="h-right">
                <div class="h-tag">Rapport financier</div>
                <div class="h-title">Synthèse Mensuelle</div>
                <div class="h-range">{{ $monthLabels }}</div>
                <div class="h-gen">Généré le {{ $generatedAt }}</div>
            </td>
        </tr>
    </table>
</div>

<!-- ===== KPI 3×2 ===== -->
<table class="kpi-table" cellpadding="0" cellspacing="0">
    <tr>
        <td><div class="kl">Devis</div><div class="kv">{{ $quotesTotalFmt }}</div><div class="ks">{{ $quotesCountFmt }}</div></td>
        <td><div class="kl">Factures</div><div class="kv">{{ $invoicesTotalFmt }}</div><div class="ks">{{ $invoicesCountFmt }}</div></td>
        <td><div class="kl">Reçus</div><div class="kv">{{ $receiptsTotalFmt }}</div><div class="ks">{{ $receiptsCountFmt }}</div></td>
    </tr>
    <tr>
        <td><div class="kl">Encaissements</div><div class="kv">{{ $paidTotalFmt }}</div><div class="ks">{{ $paymentsCountFmt }}</div></td>
        <td><div class="kl">Dépenses</div><div class="kv">{{ $expensesTotalFmt }}</div><div class="ks">sur la période</div></td>
        <td class="@if ($netTotal >= 0) accent @else danger @endif">
            <div class="kl">Net</div>
            <div class="kv">{{ $netTotalFmt }}</div>
            <div class="ks">{{ $netTotal >= 0 ? 'Recettes − Dépenses' : 'Dépenses > Recettes' }}</div>
        </td>
    </tr>
</table>

<!-- ===== DETAIL TABLE ===== -->
<div class="section-label">Documents &amp; Paiements</div>
<table class="data" cellpadding="0" cellspacing="0">
    <thead>
        <tr>
            <th style="width:40px;">Type</th>
            <th>N°</th>
            <th>Client</th>
            <th style="width:50px;">Date</th>
            <th style="width:44px;">Statut</th>
            <th class="r" style="width:50px;">Total</th>
            <th class="r" style="width:50px;">Restant</th>
        </tr>
    </thead>
    <tbody>
        @forelse($rows as $row)
            @php
                $t  = $row['type'] ?? '';
                $bc = match($t) { 'quote'=>'b-device', 'invoice'=>'b-invoice', 'receipt'=>'b-receipt', 'payment'=>'b-payment', default=>'b-device' };
                $bl = match($t) { 'quote'=>'D', 'invoice'=>'F', 'receipt'=>'R', 'payment'=>'P', default=>'—' };
                $s  = $row['status'] ?? '';
                $sl = match($s) {
                    'paid' => 'Paye',
                    'accepted' => 'Accepte',
                    'sent' => 'Envoye',
                    'draft' => 'Brouillon',
                    'rejected' => 'Refuse',
                    'cancelled' => 'Annule',
                    'overdue' => 'En retard',
                    'partial' => 'Partiel',
                    'converted' => 'Converti',
                    'issued' => 'Emis',
                    'partially_paid' => 'Partiel',
                    default => ucfirst($s),
                };
                $pc = match($s) {
                    'paid','accepted','partially_paid' => 'p-ok',
                    'sent','issued' => 'p-info',
                    'draft','cancelled' => 'p-gry',
                    'rejected','overdue' => 'p-bad',
                    'converted' => 'p-pur',
                    default => 'p-gry',
                };
            @endphp
            <tr>
                <td><span class="badge {{ $bc }}">{{ $bl }}</span></td>
                <td class="num">{{ $row['number'] }}</td>
                <td>{{ $row['client'] }}</td>
                <td>{{ $row['date'] }}</td>
                <td><span class="pill {{ $pc }}">{{ $sl }}</span></td>
                <td class="r num">{{ $row['totalFmt'] }}</td>
                <td class="r">{{ $row['amountFmt'] }}</td>
            </tr>
        @empty
            <tr><td colspan="7" style="text-align:center;padding:12px;color:#94a3b8;">Aucun document trouvé.</td></tr>
        @endforelse
    </tbody>
</table>

<!-- ===== CHART / FILTER INFO ===== -->
@if ($typeFilter === 'all')
<div class="chart-wrap">
    <div class="chart-title">Repartition par type</div>
    <img src="{{ $chartDataUri }}" alt="Bar chart" width="640" height="200" style="display:block;margin:0 auto;">
    <table style="width:100%;border-collapse:collapse;margin-top:4px;">
        <tr>
            <td style="width:50%;font-size:6.5pt;color:#64748b;">Recettes <strong style="color:#d97706;">{{ $paidTotalFmt }}</strong></td>
            <td style="width:50%;font-size:6.5pt;color:#64748b;text-align:right;">
                Periode : {{ $monthLabels }}
            </td>
        </tr>
        <tr>
            <td style="font-size:6.5pt;color:#64748b;">Depenses <strong style="color:#e11d48;">{{ $expensesTotalFmt }}</strong></td>
            <td style="font-size:6.5pt;color:#94a3b8;text-align:right;">
                {{ $quotesCount + $invoicesCount + $receiptsCount }} docs · {{ $paymentsCount }} paiements
            </td>
        </tr>
        <tr>
            <td style="font-size:7pt;font-weight:700;color:#4f46e5;padding-top:2px;border-top:1px solid #cbd5e1;">Net {{ $netTotalFmt }}</td>
            <td></td>
        </tr>
    </table>
</div>
@else
<div style="margin-top:8px;padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;font-size:7pt;color:#64748b;">
    Filtre applique : <strong>{{ match($typeFilter) { 'quote' => 'Devis', 'invoice' => 'Factures', 'receipt' => 'Recus', 'payment' => 'Paiements', default => $typeFilter } }}</strong>
    · {{ count($rows) }} element(s) · {{ $monthLabels }}
</div>
@endif

<!-- ===== FOOTER ===== -->
<div class="footer">
    <span>{{ $company['name'] ?: 'ARCHI LBO' }}</span>
    <span>Synthèse Mensuelle</span>
    <span>Page <span class="pn"></span></span>
</div>

</body>
</html>
