<?php

namespace App\Services;

use App\Models\FinanceDocument;
use App\Models\FinanceRecord;
use Illuminate\Support\Facades\File;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FinanceDocumentGenerator
{
    public function generate(FinanceRecord $record): array
    {
        $record->loadMissing(['dossier.primaryClient', 'client']);

        $templatePath = $this->templatePathForType($record->type);
        $relativeDirectory = 'finance/' . $record->record_number;
        $absoluteDirectory = storage_path('app/public/' . $relativeDirectory);
        File::ensureDirectoryExists($absoluteDirectory);

        $relativeXlsxPath = $relativeDirectory . '/' . $record->record_number . '.xlsx';
        $absoluteXlsxPath = storage_path('app/public/' . $relativeXlsxPath);

        File::copy($templatePath, $absoluteXlsxPath);

        $values = $this->buildRecordValues($record);
        $this->replacePlaceholders($absoluteXlsxPath, $values);

        return [
            'xlsx_path' => $relativeXlsxPath,
            'pdf_path' => null,
        ];
    }

    public function generateFromValues(
        string $type,
        string $number,
        array $values,
    ): array {
        $templatePath = $this->templatePathForType($type);
        $relativeDirectory = 'finance/' . $number;
        $absoluteDirectory = storage_path('app/public/' . $relativeDirectory);
        File::ensureDirectoryExists($absoluteDirectory);

        $relativeXlsxPath = $relativeDirectory . '/' . $number . '.xlsx';
        $absoluteXlsxPath = storage_path('app/public/' . $relativeXlsxPath);

        File::copy($templatePath, $absoluteXlsxPath);

        $this->replacePlaceholders($absoluteXlsxPath, $values);

        return [
            'xlsx_path' => $relativeXlsxPath,
            'pdf_path' => null,
        ];
    }

    public static function templatePathForType(string $type): string
    {
        $key = match ($type) {
            'invoice', 'facture' => 'facture',
            'payment', 'receipt', 'recu', 'pay' => 'recu',
            default => 'devis',
        };

        $path = config("archilbo_templates.finance.{$key}");

        if (!$path || !File::exists($path)) {
            throw new \RuntimeException("Finance template not found for type: {$type}");
        }

        return $path;
    }

    public static function adjustTemplatePath(string $configKey): string
    {
        $path = config("archilbo_templates.finance.{$configKey}");

        if (!$path || !File::exists($path)) {
            throw new \RuntimeException("Finance template not found for key: {$configKey}");
        }

        return $path;
    }

    private function replacePlaceholders(string $xlsxPath, array $values): void
    {
        $spreadsheet = IOFactory::load($xlsxPath);

        foreach ($spreadsheet->getAllSheets() as $sheet) {
            $this->replaceInSheet($sheet, $values);
        }

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($xlsxPath);
        $spreadsheet->disconnectWorksheets();
    }

    private function replaceInSheet(Worksheet $sheet, array $values): void
    {
        foreach ($sheet->getRowIterator() as $row) {
            foreach ($row->getCellIterator() as $cell) {
                $original = $cell->getValue();

                if (!is_string($original)) {
                    continue;
                }

                $replaced = $this->applyReplacements($original, $values);

                if ($replaced !== $original) {
                    $cell->setValueExplicit($replaced, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                }
            }
        }
    }

    private function applyReplacements(string $value, array $values): string
    {
        foreach ($values as $placeholder => $replacement) {
            $value = str_replace('[' . $placeholder . ']', $replacement, $value);
            $value = str_replace('${' . $placeholder . '}', $replacement, $value);
        }

        return $value;
    }

    private function buildRecordValues(FinanceRecord $record): array
    {
        $dossier = $record->dossier;
        $client = $record->client ?? $dossier?->primaryClient;

        $ht = (float) $record->ht;
        $tva = (float) $record->tva;
        $ttc = (float) $record->total_ttc;
        $paid = (float) $record->paid;
        $remaining = (float) $record->remaining;

        $date = now()->format('d/m/Y');
        $issuedDate = optional($record->issued_at)->format('d/m/Y') ?? $date;
        $dueDate = optional($record->due_date)->format('d/m/Y') ?? '-';
        $paidDate = optional($record->paid_at)->format('d/m/Y') ?? '-';

        return [
            'DATE' => $date,
            'DUE_DATE' => $dueDate,
            'PAID_DATE' => $paidDate,
            'DATE_AVANCE' => $paidDate,
            'RECORD_NUMBER' => $record->record_number,
            'NUMERO_DEVIS' => $record->record_number,
            'NUMERO_FACTURE' => $record->record_number,
            'TYPE' => $record->type,
            'STATUS' => $record->status,
            'CLIENT_NAME' => $client?->full_name ?? '-',
            'CIVILITY' => $client?->civility ?? 'M',
            'CIN' => $client?->cin ?? '-',
            'ICE' => '-',
            'CLIENT_ADD' => $client?->address ?? '-',
            'CLIENT_PHONE' => $client?->phone ?? '-',
            'CLIENT_EMAIL' => $client?->email ?? '-',
            'DOSSIER_NUMBER' => $dossier?->dossier_number ?? '-',
            'PROJECT_OBJECT' => $dossier?->project_object ?? '-',
            'DESIGNATION' => $dossier?->project_object ?? '-',
            'PROJECT_ADD' => $dossier?->project_address ?? '-',
            'TITRE' => $dossier?->land_title_number ?? '-',
            'COMMUNE' => $dossier?->commune ?? '-',
            'PREF' => $dossier?->province ?? '-',
            'SUP' => $this->formatNumber((float) ($dossier?->land_surface ?? 0)),
            'PLANCHER' => $this->formatNumber((float) ($record->surface ?? $dossier?->floor_area ?? 0)),
            'QU' => '1',
            'HT' => $this->formatMoney($ht),
            'TOTAL_HT' => $this->formatMoney($ht),
            'TVA' => $this->formatMoney($tva),
            'TTC' => $this->formatMoney($ttc),
            'TOTAL_TTC' => $this->formatMoney($ttc),
            'PAID' => $this->formatMoney($paid),
            'REMAINING' => $this->formatMoney($remaining),
            'NOTES' => $record->notes ?? '-',
        ];
    }

    public static function buildDocumentValues(FinanceDocument $document): array
    {
        $document->loadMissing(['client', 'dossier', 'items']);
        $dossier = $document->dossier;
        $client = $document->client;

        $ht = (float) $document->subtotal_ht;
        $tva = (float) $document->tax_total;
        $ttc = (float) $document->total_ttc;
        $paid = (float) $document->paid_total;
        $remaining = (float) $document->remaining_total;

        $date = now()->format('d/m/Y');
        $issueDate = optional($document->issue_date)->format('d/m/Y') ?? $date;
        $dueDate = optional($document->due_date)->format('d/m/Y') ?? '-';
        $paidDate = optional($document->paid_at)->format('d/m/Y') ?? '-';

        $itemsHtml = '';
        foreach ($document->items as $item) {
            $itemsHtml .= sprintf(
                "%s x %s — %s %s\n",
                $item->title,
                $item->quantity,
                self::formatMoneyStatic($item->unit_price),
                $item->unit ?? '',
            );
        }

        return [
            'DATE' => $date,
            'DUE_DATE' => $dueDate,
            'PAID_DATE' => $paidDate,
            'DATE_AVANCE' => $paidDate,
            'RECORD_NUMBER' => $document->number,
            'NUMERO_DEVIS' => $document->number,
            'NUMERO_FACTURE' => $document->number,
            'TYPE' => $document->type,
            'STATUS' => $document->status,
            'CLIENT_NAME' => $client?->full_name ?? '-',
            'CIVILITY' => $client?->civility ?? 'M',
            'CIN' => $client?->cin ?? '-',
            'ICE' => $client?->ice ?? '-',
            'CLIENT_ADD' => $client?->address ?? '-',
            'CLIENT_PHONE' => $client?->phone ?? '-',
            'CLIENT_EMAIL' => $client?->email ?? '-',
            'DOSSIER_NUMBER' => $dossier?->dossier_number ?? '-',
            'PROJECT_OBJECT' => $dossier?->project_object ?? '-',
            'DESIGNATION' => $dossier?->project_object ?? '-',
            'PROJECT_ADD' => $dossier?->project_address ?? '-',
            'TITRE' => $dossier?->land_title_number ?? '-',
            'COMMUNE' => $dossier?->commune ?? '-',
            'PREF' => $dossier?->province ?? '-',
            'SUP' => self::formatNumberStatic((float) ($dossier?->land_surface ?? 0)),
            'PLANCHER' => self::formatNumberStatic((float) ($dossier?->floor_area ?? 0)),
            'QU' => '1',
            'HT' => self::formatMoneyStatic($ht),
            'TOTAL_HT' => self::formatMoneyStatic($ht),
            'TVA' => self::formatMoneyStatic($tva),
            'TTC' => self::formatMoneyStatic($ttc),
            'TOTAL_TTC' => self::formatMoneyStatic($ttc),
            'PAID' => self::formatMoneyStatic($paid),
            'REMAINING' => self::formatMoneyStatic($remaining),
            'NOTES' => $document->notes ?? '-',
        ];
    }

    public static function formatMoneyStatic(float $value): string
    {
        return number_format($value, 2, '.', ' ');
    }

    private static function formatNumberStatic(float $value): string
    {
        if (floor($value) === $value) {
            return number_format($value, 0, '.', ' ');
        }
        return number_format($value, 2, '.', ' ');
    }

    private function formatMoney(float $value): string
    {
        return self::formatMoneyStatic($value);
    }

    private function formatNumber(float $value): string
    {
        return self::formatNumberStatic($value);
    }
}
