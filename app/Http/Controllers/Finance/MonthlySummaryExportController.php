<?php

namespace App\Http\Controllers\Finance;

use App\Exports\MonthlySummaryExport;
use App\Http\Controllers\Controller;
use App\Services\Finance\FinanceMonthlySummaryService;
use App\Services\Finance\FinanceSettingsService;
use App\Services\PermissionRegistry;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MonthlySummaryExportController extends Controller
{
    public function exportPdf(Request $request, FinanceMonthlySummaryService $service): RedirectResponse|BinaryFileResponse|StreamedResponse
    {
        abort_unless(app(PermissionRegistry::class)->allows($request->user(), 'finance.reports.export'), 403);
        $months = $this->parseMonths($request);
        $typeFilter = $this->parseType($request);

        if (empty($months)) {
            return redirect()->back()->with('error', 'Selectionnez au moins un mois pour exporter.');
        }

        $data = $this->gatherData($service, $months, $typeFilter);
        $data['company'] = [
            'name' => FinanceSettingsService::getCompanyName(),
            'address' => FinanceSettingsService::getCompanyAddress(),
            'phone' => FinanceSettingsService::getCompanyPhone(),
            'email' => FinanceSettingsService::getCompanyEmail(),
            'ice' => FinanceSettingsService::getCompanyIce(),
            'logoDataUri' => FinanceSettingsService::getCompanyLogoDataUri(),
        ];
        $data['generatedAt'] = now()->format('d/m/Y H:i');
        $data['currency'] = FinanceSettingsService::getCurrency();
        $data['typeFilter'] = $typeFilter;

        $data['interRegular'] = $this->fontDataUri('Inter-Regular.ttf');
        $data['interSemiBold'] = $this->fontDataUri('Inter-SemiBold.ttf');
        $data['interBold'] = $this->fontDataUri('Inter-Bold.ttf');
        $data['interExtraBold'] = $this->fontDataUri('Inter-ExtraBold.ttf');

        $fmt = fn ($v) => $this->compactMoney($v, $data['currency']);
        $data['quotesTotalFmt'] = $fmt($data['quotesTotal']);
        $data['quotesCountFmt'] = $data['quotesCount'] . ' doc.';
        $data['invoicesTotalFmt'] = $fmt($data['invoicesTotal']);
        $data['invoicesCountFmt'] = $data['invoicesCount'] . ' doc.';
        $data['receiptsTotalFmt'] = $fmt($data['receiptsTotal']);
        $data['receiptsCountFmt'] = $data['receiptsCount'] . ' doc.';
        $data['paidTotalFmt'] = $fmt($data['paidTotal']);
        $data['paymentsCountFmt'] = $data['paymentsCount'] . ' paie.';
        $data['expensesTotalFmt'] = $fmt($data['expensesTotal']);
        $data['netTotalFmt'] = $fmt($data['netTotal']);
        $data['currencySymbol'] = $data['currency'];

        if ($typeFilter === 'all') {
            $data['chartDataUri'] = $this->generateChartImage(
                [
                    ['v' => $data['quotesTotal'], 'f' => $data['quotesTotalFmt'], 'l' => 'Devis'],
                    ['v' => $data['invoicesTotal'], 'f' => $data['invoicesTotalFmt'], 'l' => 'Fact.'],
                    ['v' => $data['receiptsTotal'], 'f' => $data['receiptsTotalFmt'], 'l' => 'Recus'],
                    ['v' => $data['paidTotal'], 'f' => $data['paidTotalFmt'], 'l' => 'Paie.'],
                    ['v' => $data['expensesTotal'], 'f' => $data['expensesTotalFmt'], 'l' => 'Dep.'],
                ],
                $data['currency']
            );
        }

        $pdf = Pdf::loadView('finance.monthly-summary-pdf', $data);
        $pdf->setPaper('A4', 'portrait');

        return response()->streamDownload(
            fn () => print($pdf->output()),
            'synthese-mensuelle.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    public function exportExcel(Request $request, FinanceMonthlySummaryService $service): BinaryFileResponse|RedirectResponse
    {
        abort_unless(app(PermissionRegistry::class)->allows($request->user(), 'finance.reports.export'), 403);
        $months = $this->parseMonths($request);
        $typeFilter = $this->parseType($request);

        if (empty($months)) {
            return redirect()->back()->with('error', 'Selectionnez au moins un mois pour exporter.');
        }

        $data = $this->gatherData($service, $months, $typeFilter);

        return Excel::download(
            new MonthlySummaryExport(
                rows: $data['rows'],
                company: [
                    'name' => FinanceSettingsService::getCompanyName(),
                    'address' => FinanceSettingsService::getCompanyAddress(),
                    'phone' => FinanceSettingsService::getCompanyPhone(),
                    'email' => FinanceSettingsService::getCompanyEmail(),
                    'ice' => FinanceSettingsService::getCompanyIce(),
                ],
                monthLabels: $data['monthLabels'],
                generatedAt: now()->format('d/m/Y H:i'),
                currency: FinanceSettingsService::getCurrency(),
                typeFilter: $typeFilter,
                totals: $data
            ),
            'synthese-mensuelle.xlsx'
        );
    }

    public function exportCsv(Request $request, FinanceMonthlySummaryService $service): StreamedResponse|RedirectResponse
    {
        abort_unless(app(PermissionRegistry::class)->allows($request->user(), 'finance.reports.export'), 403);
        $months = $this->parseMonths($request);
        $typeFilter = $this->parseType($request);

        if (empty($months)) {
            return redirect()->back()->with('error', 'Selectionnez au moins un mois pour exporter.');
        }

        $data = $this->gatherData($service, $months, $typeFilter);

        $callback = function () use ($data) {
            $fh = fopen('php://output', 'wb');
            fputs($fh, "\xEF\xBB\xBF"); // BOM for UTF-8 Excel compat

            fputcsv($fh, ['Type', 'N°', 'Client', 'Date', 'Statut', 'Total', 'Restant'], ';');

            foreach ($data['rows'] as $row) {
                fputcsv($fh, [
                    $row['type'],
                    $row['number'],
                    $row['client'],
                    $row['date'],
                    $row['status'],
                    number_format((float) $row['total'], 2, ',', ' '),
                    $row['amount'] > 0 ? number_format((float) $row['amount'], 2, ',', ' ') : '0,00',
                ], ';');
            }

            fclose($fh);
        };

        $label = match ($typeFilter) {
            'quote' => 'devis', 'invoice' => 'factures',
            'receipt' => 'recus', 'payment' => 'paiements',
            default => 'tous',
        };

        return response()->streamDownload($callback, "synthese-mensuelle-{$label}.csv", [
            'Content-Type' => 'text/csv; charset=utf-8',
        ]);
    }

    private function compactMoney(float $value, string $currency): string
    {
        $abs = abs($value);
        $sign = $value < 0 ? '-' : '';
        $suffix = '';
        $amount = $abs;

        if ($abs >= 1_000_000_000_000) {
            $amount = $abs / 1_000_000_000_000;
            $suffix = ' T';
        } elseif ($abs >= 1_000_000_000) {
            $amount = $abs / 1_000_000_000;
            $suffix = ' Mrd';
        } elseif ($abs >= 1_000_000) {
            $amount = $abs / 1_000_000;
            $suffix = ' M';
        } elseif ($abs >= 1_000) {
            $amount = $abs / 1_000;
            $suffix = ' K';
        }

        $formatted = $suffix
            ? number_format($amount, 2, ',', ' ') . $suffix
            : number_format($amount, 2, ',', ' ');

        return $sign . $formatted . ' ' . $currency;
    }

    private function fontDataUri(string $filename): string
    {
        $path = storage_path('fonts/inter/' . $filename);
        if (!file_exists($path)) {
            return '';
        }
        $data = file_get_contents($path);
        $base64 = base64_encode($data);
        $mime = pathinfo($filename, PATHINFO_EXTENSION) === 'ttf' ? 'font/ttf' : 'font/otf';
        return 'data:' . $mime . ';base64,' . $base64;
    }

    private function parseMonths(Request $request): array
    {
        $months = $request->input('months');

        if (is_string($months)) {
            return array_filter(array_map('trim', explode(',', $months)));
        }

        return is_array($months) ? $months : [];
    }

    private function parseType(Request $request): string
    {
        $type = $request->input('type', 'all');
        return in_array($type, ['all', 'quote', 'invoice', 'receipt', 'payment']) ? $type : 'all';
    }

    private function gatherData(FinanceMonthlySummaryService $service, array $monthKeys, string $typeFilter = 'all'): array
    {
        $allMonths = collect($service->months(null, request()->user()));
        $selectedMonths = $allMonths->whereIn('key', $monthKeys)->values();
        $currency = FinanceSettingsService::getCurrency();

        $quotesCount = 0;
        $quotesTotal = 0;
        $invoicesCount = 0;
        $invoicesTotal = 0;
        $receiptsCount = 0;
        $receiptsTotal = 0;
        $paymentsCount = 0;
        $paidTotal = 0;
        $expensesCount = 0;
        $expensesTotal = 0;

        $rows = [];

        foreach ($selectedMonths as $month) {
            if ($typeFilter === 'all' || $typeFilter === 'quote') {
                $quotesCount += $month['quotesCount'];
                $quotesTotal += $month['quotesTotalTtc'];
            }
            if ($typeFilter === 'all' || $typeFilter === 'invoice') {
                $invoicesCount += $month['invoicesCount'];
                $invoicesTotal += $month['invoicesTotalTtc'];
            }
            if ($typeFilter === 'all' || $typeFilter === 'receipt') {
                $receiptsCount += $month['receiptsCount'];
                $receiptsTotal += $month['receiptsTotalTtc'];
            }
            if ($typeFilter === 'all' || $typeFilter === 'payment') {
                $paymentsCount += $month['paymentsCount'];
                $paidTotal += $month['paidTotal'];
            }
            if ($typeFilter === 'all') {
                $expensesCount += $month['expensesCount'];
                $expensesTotal += $month['expensesTotal'];
            }

            foreach ($month['documents'] as $doc) {
                if ($typeFilter !== 'all' && $doc['type'] !== $typeFilter) {
                    continue;
                }
                $totalRaw = (float) $doc['totalTtc'];
                $amountRaw = (float) $doc['remainingTotal'];
                $rows[] = [
                    'type' => $typeFilter === 'all' ? $doc['type'] : $typeFilter,
                    'number' => $doc['number'],
                    'client' => $doc['clientName'] ?? '—',
                    'date' => $doc['issueDate'] ?? '—',
                    'status' => $doc['status'],
                    'total' => $totalRaw,
                    'amount' => $amountRaw,
                    'totalFmt' => $this->compactMoney($totalRaw, $currency),
                    'amountFmt' => $amountRaw > 0 ? $this->compactMoney($amountRaw, $currency) : '0 ' . $currency,
                ];
            }

            if ($typeFilter === 'all' || $typeFilter === 'payment') {
                foreach ($month['payments'] as $pay) {
                    $amountRaw = (float) $pay['amount'];
                    $rows[] = [
                        'type' => 'payment',
                        'number' => $pay['paymentNumber'],
                        'client' => $pay['clientName'] ?? '—',
                        'date' => $pay['paidAt'] ?? '—',
                        'status' => 'Paye',
                        'total' => $amountRaw,
                        'amount' => 0,
                        'totalFmt' => $this->compactMoney($amountRaw, $currency),
                        'amountFmt' => '—',
                    ];
                }
            }
        }

        return [
            'months' => $selectedMonths,
            'rows' => $rows,
            'quotesCount' => $quotesCount,
            'quotesTotal' => $quotesTotal,
            'invoicesCount' => $invoicesCount,
            'invoicesTotal' => $invoicesTotal,
            'receiptsCount' => $receiptsCount,
            'receiptsTotal' => $receiptsTotal,
            'paymentsCount' => $paymentsCount,
            'paidTotal' => $paidTotal,
            'expensesCount' => $expensesCount,
            'expensesTotal' => $expensesTotal,
            'netTotal' => $paidTotal - $expensesTotal,
            'monthLabels' => $selectedMonths->pluck('label')->implode(', '),
            'currency' => $currency,
        ];
    }

    private function generateChartImage(array $bars, string $currency): string
    {
        $w = 640; $h = 200;
        $cl = 50; $cr = 10; $ct = 12; $cb = 28;
        $cw = $w - $cl - $cr;
        $ch = $h - $ct - $cb;
        $ba = $cw / count($bars);
        $bw = min(64, $ba - 10);

        $img = imagecreatetruecolor($w, $h);
        imagesavealpha($img, true);
        $bg = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefill($img, 0, 0, $bg);

        $white   = imagecolorallocate($img, 255, 255, 255);
        $grid    = imagecolorallocate($img, 226, 232, 240);
        $axis    = imagecolorallocate($img, 148, 163, 184);
        $txtMuted= imagecolorallocate($img, 148, 163, 184);
        $txtLabel= imagecolorallocate($img, 100, 116, 139);
        $barColors = [
            imagecolorallocate($img, 14, 165, 233),   // sky
            imagecolorallocate($img, 139, 92, 246),   // violet
            imagecolorallocate($img, 16, 185, 129),   // emerald
            imagecolorallocate($img, 245, 158, 11),   // amber
            imagecolorallocate($img, 244, 63, 94),    // rose
        ];
        $txtColors = [
            imagecolorallocate($img, 2, 132, 199),
            imagecolorallocate($img, 124, 58, 237),
            imagecolorallocate($img, 5, 150, 105),
            imagecolorallocate($img, 217, 119, 6),
            imagecolorallocate($img, 225, 29, 72),
        ];

        $maxVal = max(array_column($bars, 'v')) ?: 1;
        $fontDir = storage_path('fonts/inter');
        $fontRegular = "$fontDir/Inter-Regular.ttf";
        $fontBold = "$fontDir/Inter-SemiBold.ttf";

        imagefilledrectangle($img, 0, 0, $w, $h, $white);

        // Gridlines + Y-axis labels
        foreach ([0, 0.25, 0.5, 0.75, 1] as $t) {
            $yy = (int) round($ct + $ch * (1 - $t));
            imageline($img, $cl, $yy, $cl + $cw, $yy, $grid);
            $label = round($t * 100) . '%';
            $box = imagettfbbox(7, 0, $fontRegular, $label);
            $tw = $box[2] - $box[0];
            imagettftext($img, 7, 0, $cl - $tw - 4, $yy + 3, $txtMuted, $fontRegular, $label);
        }

        // Axis lines
        imageline($img, $cl, $ct, $cl, $ct + $ch, $axis);
        imageline($img, $cl, $ct + $ch, $cl + $cw, $ct + $ch, $axis);

        // Bars
        foreach ($bars as $i => $bar) {
            $cx = (int) round($cl + $ba * ($i + 0.5));
            $bx = (int) round($cx - $bw / 2);
            $bh = (int) round(($bar['v'] / $maxVal) * ($ch - 2));
            $by = $ct + $ch - $bh;

            imagefilledrectangle($img, $bx, $by, $bx + $bw, $by + $bh, $barColors[$i]);

            // Value above bar
            $box = imagettfbbox(7, 0, $fontBold, $bar['f']);
            $tw = $box[2] - $box[0];
            $tx = $cx - $tw / 2;
            imagettftext($img, 7, 0, (int) $tx, $by - 4, $txtColors[$i], $fontBold, $bar['f']);

            // Label below bar
            $lbox = imagettfbbox(7, 0, $fontRegular, $bar['l']);
            $lw = $lbox[2] - $lbox[0];
            imagettftext($img, 7, 0, (int) ($cx - $lw / 2), $ct + $ch + 16, $txtLabel, $fontRegular, $bar['l']);
        }

        ob_start();
        imagepng($img);
        $data = ob_get_clean();
        imagedestroy($img);

        return 'data:image/png;base64,' . base64_encode($data);
    }
}
