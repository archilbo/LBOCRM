<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class MonthlySummaryExport implements FromArray, WithCustomStartCell, WithEvents
{
    private array $rows;
    private array $company;
    private string $monthLabels;
    private string $generatedAt;
    private string $currency;
    private string $typeFilter;
    private array $totals;

    private const HEADER_ROW = 18;
    private const DATA_START = 19;

    private array $typeLabels = [
        'quote' => 'Devis', 'invoice' => 'Facture',
        'receipt' => 'Recu', 'payment' => 'Paiement',
    ];

    public function __construct(array $rows, array $company, string $monthLabels, string $generatedAt, string $currency, string $typeFilter, array $totals)
    {
        $this->rows = $rows;
        $this->company = $company;
        $this->monthLabels = $monthLabels;
        $this->generatedAt = $generatedAt;
        $this->currency = $currency;
        $this->typeFilter = $typeFilter;
        $this->totals = $totals;
    }

    public function array(): array
    {
        return array_map(fn ($item) => [
            $this->typeLabels[$item['type']] ?? $item['type'],
            $item['number'],
            $item['client'],
            $item['date'],
            $this->statusLabel($item['status']),
            is_numeric($item['total']) ? $item['total'] : 0,
            is_numeric($item['amount']) ? $item['amount'] : 0,
        ], $this->rows);
    }

    public function startCell(): string
    {
        return 'A' . self::DATA_START;
    }

    private function statusLabel(string $s): string
    {
        return match ($s) {
            'paid', 'accepted' => 'Paye',
            'sent', 'issued' => 'Envoye',
            'draft' => 'Brouillon',
            'rejected' => 'Refuse',
            'cancelled' => 'Annule',
            'overdue' => 'En retard',
            'partial', 'partially_paid' => 'Partiel',
            'converted' => 'Converti',
            default => $s,
        };
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $e) {
                $s = $e->sheet;
                $rows = count($this->rows);
                $lastData = self::DATA_START + $rows;
                $tableEnd = $rows > 0 ? $lastData - 1 : self::DATA_START;

                // Page setup
                $s->getPageSetup()
                    ->setPaperSize(PageSetup::PAPERSIZE_A4)
                    ->setOrientation(PageSetup::ORIENTATION_PORTRAIT)
                    ->setFitToWidth(1)
                    ->setFitToHeight(0);
                $s->getPageMargins()->setTop(12)->setBottom(15)->setLeft(10)->setRight(10);

                // Column widths — generous for both KPI (13pt bold) and data table (8.5pt)
                $colWidths = ['A' => 22, 'B' => 22, 'C' => 24, 'D' => 24, 'E' => 20, 'F' => 20, 'G' => 16];
                foreach ($colWidths as $col => $w) {
                    $s->getColumnDimension($col)->setWidth($w);
                }

                $name = $this->company['name'] ?: 'ARCHI LBO';
                $addr = $this->company['address'] ?? '';
                $phone = $this->company['phone'] ?? '';
                $email = $this->company['email'] ?? '';
                $ice  = $this->company['ice'] ?? '';

                // ────────────────────────────────────────────
                //  ROW 1 — indigo bar
                // ────────────────────────────────────────────
                $s->mergeCells('A1:G1');
                $s->getStyle('A1:G1')->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '6366F1']],
                ]);
                $s->getRowDimension(1)->setRowHeight(4);

                // ────────────────────────────────────────────
                //  ROW 2 — company + badge
                // ────────────────────────────────────────────
                $s->setCellValue('A2', $name);
                $s->getStyle('A2')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 15, 'color' => ['rgb' => '0F172A']],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->setCellValue('E2', 'RAPPORT FINANCIER');
                $s->mergeCells('E2:G2');
                $s->getStyle('E2:G2')->applyFromArray([
                    'font' => ['size' => 7.5, 'color' => ['rgb' => '475569'], 'bold' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->getRowDimension(2)->setRowHeight(24);

                // ────────────────────────────────────────────
                //  ROW 3 — address + title
                // ────────────────────────────────────────────
                $s->setCellValue('A3', $addr ?: '');
                $s->getStyle('A3')->applyFromArray([
                    'font' => ['size' => 8, 'color' => ['rgb' => '475569']],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->setCellValue('E3', 'Synthèse Mensuelle');
                $s->mergeCells('E3:G3');
                $s->getStyle('E3:G3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 15, 'color' => ['rgb' => '6366F1']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->getRowDimension(3)->setRowHeight(22);

                // ────────────────────────────────────────────
                //  ROW 4 — contact + period
                // ────────────────────────────────────────────
                $contact = implode(' | ', array_filter([$phone, $email, $ice ? "ICE $ice" : null]));
                $s->setCellValue('A4', $contact ?: '');
                $s->getStyle('A4')->applyFromArray([
                    'font' => ['size' => 7.5, 'color' => ['rgb' => '64748B']],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->setCellValue('E4', $this->monthLabels);
                $s->mergeCells('E4:G4');
                $s->getStyle('E4:G4')->applyFromArray([
                    'font' => ['size' => 8, 'color' => ['rgb' => '475569']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->getRowDimension(4)->setRowHeight(16);

                // ────────────────────────────────────────────
                //  ROW 5 — filter + generated
                // ────────────────────────────────────────────
                $filterLabel = match ($this->typeFilter) {
                    'quote' => 'Devis', 'invoice' => 'Factures',
                    'receipt' => 'Recus', 'payment' => 'Paiements',
                    default => 'Tous les types',
                };
                $s->setCellValue('E5', "Filtre: $filterLabel  |  {$this->generatedAt}");
                $s->mergeCells('E5:G5');
                $s->getStyle('E5:G5')->applyFromArray([
                    'font' => ['size' => 7, 'color' => ['rgb' => '64748B']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->getRowDimension(5)->setRowHeight(14);

                // ────────────────────────────────────────────
                //  ROW 6 — separator
                // ────────────────────────────────────────────
                $s->mergeCells('A6:G6');
                $s->getStyle('A6:G6')->applyFromArray([
                    'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'E2E8F0']]],
                ]);
                $s->getRowDimension(6)->setRowHeight(6);

                // ────────────────────────────────────────────
                //  ROW 7 — section label: INDICATEURS
                // ────────────────────────────────────────────
                $s->setCellValue('A7', 'INDICATEURS');
                $s->mergeCells('A7:G7');
                $s->getStyle('A7')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 8, 'color' => ['rgb' => '0F172A']],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->getRowDimension(7)->setRowHeight(18);

                // ────────────────────────────────────────────
                //  KPI GRID (rows 8–13)
                //  Each KPI spans 2 columns × 3 rows.
                //  Merged PER-ROW so all values survive:
                //    Row 8:  A8:B8 | C8:D8 | E8:F8   (labels)
                //    Row 9:  A9:B9 | C9:D9 | E9:F9   (values)
                //    Row 10: A10:B10 | C10:D10 | E10:F10 (subtitles)
                //    Row 11: A11:B11 | C11:D11 | E11:F11 (labels)
                //    Row 12: A12:B12 | C12:D12 | E12:F12 (values)
                //    Row 13: A13:B13 | C13:D13 | E13:F13 (subtitles)
                // ────────────────────────────────────────────
                $t = $this->totals;
                $netVal = ($t['paidTotal'] ?? 0) - ($t['expensesTotal'] ?? 0);
                $netPos = $netVal >= 0;
                $netCol = $netPos ? '4F46E5' : 'DC2626';

                $kpiData = [
                    // [col, label, value, subtitle, valueColor?]
                    ['A', 'DEVIS',          $t['quotesTotal'] ?? 0,    ($t['quotesCount'] ?? 0) . ' doc.',   null],
                    ['C', 'FACTURES',       $t['invoicesTotal'] ?? 0,  ($t['invoicesCount'] ?? 0) . ' doc.', null],
                    ['E', 'RECUS',          $t['receiptsTotal'] ?? 0,  ($t['receiptsCount'] ?? 0) . ' doc.', null],
                    ['A', 'ENCAISSEMENTS',  $t['paidTotal'] ?? 0,     ($t['paymentsCount'] ?? 0) . ' paie.', null],
                    ['C', 'DEPENSES',       $t['expensesTotal'] ?? 0,  'sur la periode',                      null],
                    ['E', 'NET',            $netVal,                   $netPos ? 'Recettes - Depenses' : 'Depenses > Recettes', $netCol],
                ];

                $kpiRowStarts = [8, 11]; // row groups

                foreach ($kpiData as $idx => $k) {
                    $grp = intdiv($idx, 3);        // 0 or 1
                    $base = $kpiRowStarts[$grp];
                    $col = $k[0];
                    $col2 = chr(ord($col) + 1);    // B, D, F

                    $lRow = $base;     // label
                    $vRow = $base + 1; // value
                    $sRow = $base + 2; // subtitle

                    // Merge columns per single row (value survives)
                    $s->mergeCells("{$col}{$lRow}:{$col2}{$lRow}");
                    $s->mergeCells("{$col}{$vRow}:{$col2}{$vRow}");
                    $s->mergeCells("{$col}{$sRow}:{$col2}{$sRow}");

                    // Label
                    $s->setCellValue("{$col}{$lRow}", $k[1]);
                    $s->getStyle("{$col}{$lRow}")->applyFromArray([
                        'font' => ['size' => 7, 'bold' => true, 'color' => ['rgb' => '475569']],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);

                    // Value
                    $vc = $k[4] ?? '0F172A';
                    $s->setCellValue("{$col}{$vRow}", $this->fmt($k[2]));
                    $s->getStyle("{$col}{$vRow}")->applyFromArray([
                        'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => $vc]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                        'shrinkToFit' => true,
                    ]);

                    // Subtitle
                    $s->setCellValue("{$col}{$sRow}", $k[3]);
                    $s->getStyle("{$col}{$sRow}")->applyFromArray([
                        'font' => ['size' => 7, 'color' => ['rgb' => '64748B']],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);
                }

                // Subtle borders between KPI columns
                $s->getStyle('B8:B13')->applyFromArray([
                    'borders' => ['right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'F1F5F9']]],
                ]);
                $s->getStyle('D8:D13')->applyFromArray([
                    'borders' => ['right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'F1F5F9']]],
                ]);

                // Accent left border on the NET block
                $netBorderColor = $netPos ? '6366F1' : 'EF4444';
                $s->getStyle('E11:E13')->applyFromArray([
                    'borders' => ['left' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $netBorderColor]]],
                ]);

                // Row heights
                $s->getRowDimension(8)->setRowHeight(16);
                $s->getRowDimension(9)->setRowHeight(28);
                $s->getRowDimension(10)->setRowHeight(16);
                $s->getRowDimension(11)->setRowHeight(16);
                $s->getRowDimension(12)->setRowHeight(28);
                $s->getRowDimension(13)->setRowHeight(16);

                // ────────────────────────────────────────────
                //  ROW 14 — spacer
                // ────────────────────────────────────────────
                $s->getRowDimension(14)->setRowHeight(6);

                // ────────────────────────────────────────────
                //  ROW 15 — section label: DOCUMENTS & PAIEMENTS
                // ────────────────────────────────────────────
                $s->setCellValue('A15', 'DOCUMENTS & PAIEMENTS');
                $s->mergeCells('A15:G15');
                $s->getStyle('A15')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 8, 'color' => ['rgb' => '0F172A']],
                    'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'E2E8F0']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->getRowDimension(15)->setRowHeight(18);

                // Rows 16-17: spacers
                $s->getRowDimension(16)->setRowHeight(4);
                $s->getRowDimension(17)->setRowHeight(2);

                // ────────────────────────────────────────────
                //  ROW 18 — table headers
                // ────────────────────────────────────────────
                $headers = ['Type', 'N°', 'Client', 'Date', 'Statut', 'Total', 'Restant'];
                foreach ($headers as $i => $label) {
                    $col = chr(65 + $i);
                    $s->setCellValue($col . self::HEADER_ROW, $label);
                }
                $s->getStyle('A' . self::HEADER_ROW . ':G' . self::HEADER_ROW)->applyFromArray([
                    'font' => ['bold' => true, 'size' => 7.5, 'color' => ['rgb' => '475569']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F8FAFC']],
                    'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'CBD5E1']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'horizontal' => Alignment::HORIZONTAL_LEFT],
                ]);
                $s->getStyle('F' . self::HEADER_ROW)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $s->getStyle('G' . self::HEADER_ROW)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $s->getRowDimension(self::HEADER_ROW)->setRowHeight(18);

                // ────────────────────────────────────────────
                //  DATA ROWS (starting at row 19)
                // ────────────────────────────────────────────
                if ($rows > 0) {
                    $dataRange = 'A' . self::DATA_START . ':G' . $tableEnd;
                    $s->getStyle($dataRange)->applyFromArray([
                        'font' => ['size' => 8.5, 'color' => ['rgb' => '334155']],
                        'borders' => ['bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'F1F5F9']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);
                    $s->getStyle('F' . self::DATA_START . ':G' . $tableEnd)->getNumberFormat()->setFormatCode('#,##0.00');
                    $s->getStyle('F' . self::DATA_START . ':F' . $tableEnd)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $s->getStyle('G' . self::DATA_START . ':G' . $tableEnd)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                    for ($r = self::DATA_START; $r <= $tableEnd; $r++) {
                        if (($r - self::DATA_START) % 2 === 1) {
                            $s->getStyle('A' . $r . ':G' . $r)->applyFromArray([
                                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F1F5F9']],
                            ]);
                        }
                    }

                    $s->freezePane('A' . self::DATA_START);
                }

                // ────────────────────────────────────────────
                //  SUMMARY ROW
                // ────────────────────────────────────────────
                $summaryRow = self::DATA_START + $rows;
                $s->setCellValue('A' . $summaryRow, $rows . ' element(s)  |  ' . $this->monthLabels);
                $s->mergeCells('A' . $summaryRow . ':G' . $summaryRow);
                $s->getStyle('A' . $summaryRow)->applyFromArray([
                    'font' => ['size' => 7.5, 'color' => ['rgb' => '64748B']],
                    'borders' => ['top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'CBD5E1']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $s->getRowDimension($summaryRow)->setRowHeight(18);

                // Print area
                $s->getPageSetup()->setPrintArea('A1:G' . $summaryRow);
            },
        ];
    }

    private function fmt(float $v): string
    {
        $abs = abs($v);
        $sign = $v < 0 ? '-' : '';
        $suffix = '';
        $amount = $abs;

        if ($abs >= 1_000_000_000_000) {
            $amount = $abs / 1_000_000_000_000; $suffix = ' T';
        } elseif ($abs >= 1_000_000_000) {
            $amount = $abs / 1_000_000_000; $suffix = ' Mrd';
        } elseif ($abs >= 1_000_000) {
            $amount = $abs / 1_000_000; $suffix = ' M';
        } elseif ($abs >= 1_000) {
            $amount = $abs / 1_000; $suffix = ' K';
        }

        $formatted = $suffix
            ? number_format($amount, 2, ',', ' ') . $suffix
            : number_format($amount, 2, ',', ' ');

        return $sign . $formatted . ' ' . $this->currency;
    }
}
