<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contract {{ $contractNumber }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; line-height: 1.6; color: #1a1a1a; margin: 40px; }
        h1 { font-size: 18px; text-align: center; margin-bottom: 30px; text-transform: uppercase; }
        h2 { font-size: 14px; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td { padding: 6px 8px; vertical-align: top; }
        td:first-child { width: 180px; font-weight: 600; }
        .total-row td { font-weight: 700; font-size: 14px; padding-top: 10px; border-top: 2px solid #1a1a1a; }
        .footer { margin-top: 40px; font-size: 11px; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 15px; }
        .meta { font-size: 11px; color: #888; margin-bottom: 25px; text-align: right; }
    </style>
</head>
<body>
    <h1>ARCHI LBO</h1>
    <p style="text-align:center;font-size:14px;margin-top:-10px">Contrat d'Architecte</p>

    <div class="meta">Contract: {{ $contractNumber }} | Dossier: {{ $dossierNumber }} | Date: {{ $date }}</div>

    <h2>Client Information</h2>
    <table>
        <tr><td>Client(s)</td><td>{{ $clientName }}</td></tr>
        <tr><td>CIN</td><td>{{ $cin }}</td></tr>
        <tr><td>Primary address</td><td>{{ $clientAddress }}</td></tr>
    </table>

    <h2>Project Information</h2>
    <table>
        <tr><td>Project Object</td><td>{{ $projectObject }}</td></tr>
        <tr><td>Project Address</td><td>{{ $projectAddress }}</td></tr>
        <tr><td>Land Title</td><td>{{ $titre }}</td></tr>
        <tr><td>Land Surface (m&sup2;)</td><td>{{ $sup }}</td></tr>
        <tr><td>Province</td><td>{{ $pref }}</td></tr>
        <tr><td>Commune</td><td>{{ $commune }}</td></tr>
    </table>

    <h2>Calculation</h2>
    <table>
        <tr><td>Floor Area (m&sup2;)</td><td>{{ $plancher }}</td></tr>
        <tr><td>Unit Price (MAD/m&sup2;)</td><td>{{ number_format(900, 2, '.', ' ') }}</td></tr>
        <tr><td>Estimation (MAD)</td><td>{{ $estimation }}</td></tr>
        <tr><td>Fee Rate</td><td>{{ $rate }}%</td></tr>
        <tr><td>HT (MAD)</td><td>{{ $ht }}</td></tr>
        <tr><td>TVA (20%)</td><td>{{ $tva }}</td></tr>
        <tr class="total-row"><td>TTC (MAD)</td><td>{{ $ttc }}</td></tr>
    </table>

    <div class="footer">
        ARCHI LBO OS — Generated on {{ $date }}<br>
        This document is a computer-generated PDF export.
    </div>
</body>
</html>
