<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use RuntimeException;
use Throwable;

class FinanceExcelExporter
{
    public function __construct(private readonly FinanceDocumentRenderData $renderData)
    {
    }

    public function generate(FinanceDocument $document): string
    {
        $spreadsheet = new Spreadsheet();

        try {
            $data = $this->renderData->toArray($document);
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle(substr($data['document']['type_label'] . ' ' . $document->number, 0, 31));

            $row = 1;
            $sheet->setCellValue("A{$row}", $data['company']['name']);
            $sheet->mergeCells("A{$row}:F{$row}");
            $sheet->setCellValue("G{$row}", $data['document']['type_label']);
            $sheet->mergeCells("G{$row}:K{$row}");
            $sheet->getStyle("A{$row}:K{$row}")->getFont()->setBold(true)->setSize(16);
            $sheet->getStyle("G{$row}:K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;

            $sheet->setCellValue("A{$row}", $data['company']['address']);
            $sheet->mergeCells("A{$row}:F{$row}");
            $sheet->setCellValue("G{$row}", $document->number);
            $sheet->mergeCells("G{$row}:K{$row}");
            $sheet->getStyle("G{$row}:K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row++;

            $sheet->setCellValue("A{$row}", 'ICE: ' . $data['company']['ice'] . ' | TVA: ' . $data['company']['tva'] . ' | Patente: ' . $data['company']['patente'] . ' | CNSS: ' . $data['company']['cnss']);
            $sheet->mergeCells("A{$row}:K{$row}");
            $row += 2;

            $sheet->setCellValue("A{$row}", 'Document');
            $sheet->setCellValue("B{$row}", $data['document']['type_label']);
            $sheet->setCellValue("D{$row}", 'Date emission');
            $sheet->setCellValue("E{$row}", $data['document']['issue_date']);
            $sheet->setCellValue("G{$row}", $document->isInvoice() ? 'Echeance' : 'Validite');
            $sheet->setCellValue("H{$row}", $document->isInvoice() ? $data['document']['due_date'] : $data['document']['valid_until']);
            $sheet->getStyle("A{$row}:K{$row}")->getFont()->setBold(true);
            $row += 2;

            $row = $this->section($sheet, $row, 'Client', [
                ['Nom', $data['client']['name'], 'CIN', $data['client']['cin']],
                ['Adresse', $data['client']['address'], 'Contact', trim($data['client']['phone'] . ' ' . $data['client']['email'])],
            ]);

            $row = $this->section($sheet, $row, 'Dossier', [
                ['Numero', $data['dossier']['number'], 'Objet', $data['dossier']['project_object']],
                ['Adresse', $data['dossier']['address'], 'Commune/Province', trim($data['dossier']['commune'] . ' ' . $data['dossier']['province'])],
            ]);

            $headers = ['#', 'Title', 'Description', 'Qty', 'Unit', 'Unit price', 'Discount %', 'TVA %', 'Total HT', 'Total TVA', 'Total TTC'];
            $sheet->fromArray($headers, null, "A{$row}");
            $headerRow = $row;
            $row++;

            foreach ($data['items'] as $item) {
                $sheet->fromArray([
                    $item['position'],
                    $item['title'],
                    $item['description'],
                    $item['quantity'],
                    $item['unit'],
                    $item['unit_price'],
                    $item['discount_rate'],
                    $item['tva_rate'],
                    $item['total_ht'],
                    $item['total_tva'],
                    $item['total_ttc'],
                ], null, "A{$row}");
                $row++;
            }

            $tableEnd = max($headerRow, $row - 1);
            $sheet->getStyle("A{$headerRow}:K{$tableEnd}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $sheet->getStyle("A{$headerRow}:K{$headerRow}")->getFont()->setBold(true);
            $sheet->getStyle("A{$headerRow}:K{$headerRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F3F4F6');
            $sheet->getStyle("F" . ($headerRow + 1) . ":F{$tableEnd}")->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("I" . ($headerRow + 1) . ":K{$tableEnd}")->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("D" . ($headerRow + 1) . ":K{$tableEnd}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $row += 2;

            $totals = [
                ['Subtotal HT', $data['totals']['subtotal_ht_raw']],
                ['Discount', $data['totals']['discount_total_raw']],
                ['TVA', $data['totals']['tax_total_raw']],
                ['Total TTC', $data['totals']['total_ttc_raw']],
                ['Paid', $data['totals']['paid_total_raw']],
                ['Remaining', $data['totals']['remaining_total_raw']],
            ];

            foreach ($totals as [$label, $value]) {
                $sheet->setCellValue("I{$row}", $label);
                $sheet->setCellValue("K{$row}", $value);
                $sheet->getStyle("I{$row}:K{$row}")->getFont()->setBold($label === 'Total TTC');
                $sheet->getStyle("K{$row}")->getNumberFormat()->setFormatCode('#,##0.00');
                $row++;
            }

            $row += 1;
            $sheet->setCellValue("A{$row}", 'Notes');
            $sheet->setCellValue("B{$row}", $data['document']['notes']);
            $sheet->mergeCells("B{$row}:K{$row}");
            $row++;
            $sheet->setCellValue("A{$row}", 'Terms');
            $sheet->setCellValue("B{$row}", $data['document']['terms']);
            $sheet->mergeCells("B{$row}:K{$row}");

            foreach (range('A', 'K') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            $sheet->freezePane('A9');
            $sheet->getStyle('A:K')->getAlignment()->setVertical(Alignment::VERTICAL_TOP);

            $directory = $this->directory($document);
            Storage::disk('public')->makeDirectory($directory);
            $relativePath = $directory . '/' . $document->number . '.xlsx';
            $absolutePath = Storage::disk('public')->path($relativePath);

            IOFactory::createWriter($spreadsheet, 'Xlsx')->save($absolutePath);

            if (!file_exists($absolutePath) || filesize($absolutePath) === 0) {
                throw new RuntimeException('Excel file was not created.');
            }

            $document->forceFill(['excel_path' => $relativePath])->save();

            return $relativePath;
        } catch (Throwable $e) {
            throw new RuntimeException('Unable to generate finance Excel file: ' . $e->getMessage(), previous: $e);
        } finally {
            $spreadsheet->disconnectWorksheets();
        }
    }

    private function section($sheet, int $row, string $title, array $lines): int
    {
        $sheet->setCellValue("A{$row}", $title);
        $sheet->mergeCells("A{$row}:K{$row}");
        $sheet->getStyle("A{$row}:K{$row}")->getFont()->setBold(true);
        $sheet->getStyle("A{$row}:K{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F9FAFB');
        $row++;

        foreach ($lines as $line) {
            $sheet->setCellValue("A{$row}", $line[0]);
            $sheet->setCellValue("B{$row}", $line[1]);
            $sheet->setCellValue("F{$row}", $line[2]);
            $sheet->setCellValue("G{$row}", $line[3]);
            $row++;
        }

        return $row + 1;
    }

    private function directory(FinanceDocument $document): string
    {
        return 'finance/' . match ($document->type) {
            'quote' => 'quotes',
            'invoice' => 'invoices',
            'receipt' => 'receipts',
            default => 'documents',
        } . '/' . $document->number;
    }
}
