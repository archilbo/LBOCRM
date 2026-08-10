<?php

namespace App\Console\Commands;

use App\Models\ArchiveRecord;
use App\Models\City;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Read-only Phase 1 verifier for the historical ARCHIVE CDCH workbook.
 *
 * This command deliberately has no persistence calls for business data. It
 * produces a JSON data report and a compact Markdown review report, then stops.
 */
final class LegacyExcelDryRunCommand extends Command
{
    protected $signature = 'legacy:archive-dry-run
        {source : Absolute or project-relative XLSX path}
        {--company-id= : Required company scope}
        {--branch-id= : Optional branch scope}
        {--output=legacy-migration : Directory under storage/app for preview files}';

    protected $description = 'Analyze legacy archive/finance Excel data without writing business records.';

    private const CITY_ALIASES = [
        'MARRAKECH' => 'MARRAKECH',
        'BENGUERIR' => 'BENGUERIR',
        'ESSAOUIRA' => 'ESSAOUIRA',
        'AL HAOUZ' => 'AL HAOUZ',
        'KELAA' => 'KELAA',
        'AGADIR' => 'AGADIR',
    ];

    public function handle(): int
    {
        $companyId = filter_var($this->option('company-id'), FILTER_VALIDATE_INT);
        $branchId = $this->option('branch-id') === null ? null : filter_var($this->option('branch-id'), FILTER_VALIDATE_INT);
        $source = $this->resolveSource((string) $this->argument('source'));

        if (! $companyId || ! is_file($source)) {
            $this->error(! is_file($source) ? 'SOURCE_FILE_NOT_FOUND' : 'A valid --company-id is required.');

            return self::FAILURE;
        }

        $clients = Client::query()->where('company_id', $companyId)->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->get();
        $dossiers = Dossier::query()->with(['archiveRecord', 'cahier'])->where('company_id', $companyId)->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->get();
        $cities = City::query()->get();
        $documents = FinanceDocument::query()->where('company_id', $companyId)->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->get();
        $payments = Payment::query()->where('company_id', $companyId)->when($branchId, fn ($q) => $q->where('branch_id', $branchId))->get();

        $workbook = IOFactory::load($source);
        $rows = [];
        $paymentRows = [];
        $headers = [];

        foreach ($workbook->getWorksheetIterator() as $sheet) {
            [$headerRow, $subheaderRow] = $this->headerRows($sheet);
            if (! $headerRow) {
                continue;
            }

            $headers[$sheet->getTitle()] = $this->headers($sheet, $headerRow, $subheaderRow);
            $city = $this->resolveCity($sheet->getTitle(), $cities);

            for ($rowNumber = $subheaderRow + 1; $rowNumber <= $sheet->getHighestRow(); $rowNumber++) {
                $legacyRef = $this->text($sheet, $rowNumber, 1);
                $clientName = $this->text($sheet, $rowNumber, 2);
                $projectName = $this->text($sheet, $rowNumber, 6);
                if ($legacyRef === '' && $clientName === '' && $projectName === '') {
                    continue;
                }

                $client = $this->matchClient($clients, $clientName, $this->text($sheet, $rowNumber, 8), $this->text($sheet, $rowNumber, 9));
                $dossier = $this->matchDossier($dossiers, $client?->id, $projectName, $this->text($sheet, $rowNumber, 9));
                $finance = $this->finance($sheet, $rowNumber, $projectName, $documents, $payments, $dossier?->id);
                $cahier = [
                    'number_raw' => $this->text($sheet, $rowNumber, 3),
                    'received_at_raw' => $this->text($sheet, $rowNumber, 4),
                    'received_at_normalized' => $this->date($sheet, $rowNumber, 4),
                    'delivered_at_raw' => $this->text($sheet, $rowNumber, 5),
                    'delivered_at_normalized' => $this->date($sheet, $rowNumber, 5),
                    'existing_id' => $dossier?->cahier?->id,
                ];
                $reasons = array_filter([
                    $city ? null : 'CITY_UNRESOLVED',
                    $client ? null : ($clientName === '' ? 'CLIENT_MISSING' : 'CLIENT_REVIEW_REQUIRED'),
                    $dossier ? null : ($projectName === '' ? 'PROJECT_MISSING' : 'PROJECT_REVIEW_REQUIRED'),
                ]);

                $rows[] = [
                    'source_sheet' => $sheet->getTitle(),
                    'source_row' => $rowNumber,
                    'legacy_archive_ref' => $legacyRef,
                    'city' => $city ? ['id' => $city->id, 'name' => $city->name, 'code' => $city->code] : null,
                    'archive' => ['existing_id' => $dossier?->archiveRecord?->id, 'existing_number' => $dossier?->archiveRecord?->archive_number, 'phase_2_action' => $dossier?->archiveRecord ? 'EXISTING_ARCHIVE' : 'RESERVE_WITH_ARCHIVE_NUMBERING_SERVICE'],
                    'client' => ['raw' => $clientName, 'candidate_id' => $client?->id, 'candidate_name' => $client?->full_name, 'match_status' => $client ? 'EXACT_OR_PHONE_MATCH' : 'REVIEW_REQUIRED'],
                    'project' => ['raw' => $projectName, 'candidate_id' => $dossier?->id, 'candidate_name' => $dossier?->project_object, 'address_raw' => $this->text($sheet, $rowNumber, 9), 'surface_raw' => $this->text($sheet, $rowNumber, 7), 'match_status' => $dossier ? 'EXACT_MATCH' : 'REVIEW_REQUIRED'],
                    'cahier' => $cahier,
                    'finance' => $finance,
                    'review_reasons' => array_values(array_unique([...$reasons, ...$finance['review_reasons']])),
                ];
                foreach ($finance['payments'] as $payment) {
                    $paymentRows[] = ['source_sheet' => $sheet->getTitle(), 'source_row' => $rowNumber, 'legacy_archive_ref' => $legacyRef, 'project_id_candidate' => $dossier?->id, ...$payment];
                }
            }
        }

        $summary = $this->summary($rows, $paymentRows);
        $report = ['phase' => 'PHASE_1_DRY_RUN_ONLY', 'source' => basename($source), 'generated_at' => now()->toIso8601String(), 'headers' => $headers, 'summary' => $summary, 'rows' => $rows, 'payments' => $paymentRows, 'business_writes' => 0];
        $directory = trim((string) $this->option('output'), '/').'/'.now()->format('Ymd_His');
        Storage::disk('local')->put($directory.'/dry-run.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
        Storage::disk('local')->put($directory.'/review.md', $this->markdown($report));

        $this->info('PHASE 1 COMPLETE — business writes: 0');
        $this->table(['Metric', 'Count'], collect($summary)->map(fn ($value, $key) => [$key, $value])->values()->all());
        $this->line('Review: '.Storage::disk('local')->path($directory.'/review.md'));
        $this->line('Data:   '.Storage::disk('local')->path($directory.'/dry-run.json'));

        return self::SUCCESS;
    }

    private function resolveSource(string $source): string { return is_file($source) ? $source : base_path($source); }

    private function headerRows(Worksheet $sheet): array
    {
        for ($row = 1; $row <= min(10, $sheet->getHighestRow()); $row++) {
            if (Str::contains(Str::lower($this->text($sheet, $row, 1)), 'réf')) return [$row, $row + 1];
        }
        return [null, null];
    }

    private function headers(Worksheet $sheet, int $headerRow, int $subheaderRow): array
    {
        $headers = [];
        for ($column = 1; $column <= 30; $column++) $headers[$column] = trim($this->text($sheet, $headerRow, $column).' '.$this->text($sheet, $subheaderRow, $column));
        return $headers;
    }

    private function text(Worksheet $sheet, int $row, int $column): string { return trim((string) $sheet->getCellByColumnAndRow($column, $row)->getFormattedValue()); }

    private function date(Worksheet $sheet, int $row, int $column): ?string
    {
        $raw = $sheet->getCellByColumnAndRow($column, $row)->getValue();
        if ($raw === null || $raw === '') return null;
        try { return is_numeric($raw) ? \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $raw)->format('Y-m-d') : Carbon::parse((string) $raw)->toDateString(); } catch (\Throwable) { return null; }
    }

    private function money(Worksheet $sheet, int $row, int $column): ?string
    {
        $raw = $sheet->getCellByColumnAndRow($column, $row)->getCalculatedValue();
        if ($raw === null || $raw === '') return null;
        $normalized = preg_replace('/[^0-9,.-]/', '', (string) $raw) ?? '';
        if ($normalized === '' || ! is_numeric(str_replace(',', '.', $normalized))) return null;
        return number_format((float) str_replace(',', '.', $normalized), 2, '.', '');
    }

    private function resolveCity(string $sheetName, $cities): ?City
    {
        $expected = self::CITY_ALIASES[Str::upper(trim($sheetName))] ?? null;
        return $expected ? $cities->first(fn (City $city) => Str::upper(trim($city->name)) === $expected || Str::upper(trim($city->code)) === $expected) : null;
    }

    private function matchClient($clients, string $name, string $field8, string $field9): ?Client
    {
        $normal = fn (string $value) => Str::upper(preg_replace('/[^\pL\pN]/u', '', Str::ascii($value)) ?? '');
        $name = $normal($name);
        $phones = array_filter([$field8, $field9], fn ($value) => preg_match('/\d{6,}/', $value));
        return $clients->first(fn (Client $client) => $name !== '' && $normal((string) $client->full_name) === $name)
            ?? $clients->first(fn (Client $client) => collect($phones)->contains(fn ($phone) => preg_replace('/\D/', '', $phone) !== '' && preg_replace('/\D/', '', (string) $client->phone) === preg_replace('/\D/', '', $phone)));
    }

    private function matchDossier($dossiers, ?int $clientId, string $project, string $address): ?Dossier
    {
        $normal = fn (string $value) => Str::upper(preg_replace('/[^\pL\pN]/u', '', Str::ascii($value)) ?? '');
        return $dossiers->first(fn (Dossier $dossier) => $clientId && $dossier->client_id === $clientId && $normal((string) $dossier->project_object) === $normal($project))
            ?? $dossiers->first(fn (Dossier $dossier) => $clientId && $address !== '' && $dossier->client_id === $clientId && $normal((string) $dossier->project_address) === $normal($address));
    }

    private function finance(Worksheet $sheet, int $row, string $project, $documents, $payments, ?int $dossierId): array
    {
        $negotiated = $this->money($sheet, $row, 12); $excelRemaining = $this->money($sheet, $row, 29);
        $entries = []; $reasons = [];
        for ($sequence = 1; $sequence <= 5; $sequence++) {
            $base = 11 + ($sequence * 3); $amount = $this->money($sheet, $row, $base + 1); $rawMethod = $this->text($sheet, $row, $base + 2);
            if ($amount === null) continue;
            $date = $this->date($sheet, $row, $base); $method = $this->paymentMethod($rawMethod);
            $status = (float) $amount <= 0 ? 'PAYMENT_INVALID_AMOUNT' : ($date === null ? 'PAYMENT_DATE_MISSING' : ($method === null ? 'PAYMENT_METHOD_REVIEW' : 'NEW_PAYMENT_CANDIDATE'));
            $existing = $dossierId ? $payments->first(fn (Payment $payment) => $payment->dossier_id === $dossierId && number_format((float) $payment->amount, 2, '.', '') === $amount && (!$date || $payment->paid_at?->toDateString() === $date)) : null;
            if ($existing) $status = 'EXACT_PAYMENT_CANDIDATE';
            $entries[] = ['avance_sequence' => $sequence, 'payment_date_raw' => $this->text($sheet, $row, $base), 'payment_date_normalized' => $date, 'amount_raw' => $this->text($sheet, $row, $base + 1), 'amount_normalized' => $amount, 'payment_method_raw' => $rawMethod, 'payment_method_normalized' => $method, 'existing_payment_candidate_id' => $existing?->id, 'payment_match_status' => $status, 'payment_status' => $status, 'review_reason' => str_starts_with($status, 'PAYMENT_') ? $status : null];
            if (str_starts_with($status, 'PAYMENT_')) $reasons[] = $status;
        }
        $total = array_sum(array_map(fn ($entry) => in_array($entry['payment_status'], ['NEW_PAYMENT_CANDIDATE', 'EXACT_PAYMENT_CANDIDATE'], true) ? (float) $entry['amount_normalized'] : 0, $entries));
        $remaining = $negotiated === null ? null : number_format((float) $negotiated - $total, 2, '.', '');
        $status = $negotiated === null ? (count($entries) ? 'FINANCE_NO_NEGOTIATED_AMOUNT' : 'NO_FINANCE_DATA') : 'FINANCE_READY';
        if ($negotiated !== null && (float) $negotiated <= 0) $status = 'FINANCE_NEGOTIATED_AMOUNT_INVALID';
        if ($negotiated !== null && $total > (float) $negotiated) $status = 'FINANCE_OVERPAID_REVIEW';
        if ($remaining !== null && $excelRemaining !== null && abs((float) $remaining - (float) $excelRemaining) > 0.009) $status = 'FINANCE_REMAINDER_CONFLICT';
        if ($status !== 'FINANCE_READY' && $status !== 'NO_FINANCE_DATA') $reasons[] = $status;
        $existing = $dossierId ? $documents->where('dossier_id', $dossierId) : collect();
        return ['negotiated_date_raw' => $this->text($sheet, $row, 11), 'negotiated_date_normalized' => $this->date($sheet, $row, 11), 'negotiated_amount_raw' => $this->text($sheet, $row, 12), 'negotiated_amount_ttc' => $negotiated, 'plan_beton_raw' => $this->text($sheet, $row, 13), 'plan_beton_mapping' => 'UNMAPPED_REVIEW', 'currency' => 'MAD', 'proposed_devis_action' => $negotiated ? ($existing->where('type', 'quote')->isEmpty() ? 'CREATE_ON_PHASE_2' : 'EXISTING_CANDIDATE') : 'NONE', 'proposed_facture_action' => $negotiated ? ($existing->where('type', 'invoice')->isEmpty() ? 'CREATE_ON_PHASE_2' : 'EXISTING_CANDIDATE') : 'NONE', 'proposed_devis_total_ttc' => $negotiated, 'proposed_facture_total_ttc' => $negotiated, 'line_title' => '', 'line_description' => $project, 'line_quantity' => 1, 'payments' => $entries, 'payment_count' => count($entries), 'total_payments' => number_format($total, 2, '.', ''), 'calculated_remaining' => $remaining, 'excel_remaining' => $excelRemaining, 'remaining_difference' => $remaining !== null && $excelRemaining !== null ? number_format((float) $remaining - (float) $excelRemaining, 2, '.', '') : null, 'finance_status' => $status, 'review_reasons' => array_values(array_unique($reasons))];
    }

    private function paymentMethod(string $raw): ?string { $value = Str::upper(Str::ascii($raw)); return match (true) { $value === '' => null, Str::contains($value, ['ESPECE', 'CASH']) => 'cash', Str::contains($value, ['VIREMENT', 'TRANSFER']) => 'bank_transfer', Str::contains($value, ['CHEQUE', 'CHECK']) => 'check', Str::contains($value, ['CARTE', 'CARD']) => 'card', default => null, }; }

    private function summary(array $rows, array $payments): array { $finance = collect($rows)->pluck('finance'); return ['source_rows' => count($rows), 'rows_with_negotiated_amount' => $finance->whereNotNull('negotiated_amount_ttc')->count(), 'finance_ready' => $finance->where('finance_status', 'FINANCE_READY')->count(), 'payment_rows_detected' => count($payments), 'valid_payment_candidates' => collect($payments)->whereIn('payment_status', ['NEW_PAYMENT_CANDIDATE', 'EXACT_PAYMENT_CANDIDATE'])->count(), 'remainder_conflicts' => $finance->where('finance_status', 'FINANCE_REMAINDER_CONFLICT')->count(), 'overpaid_cases' => $finance->where('finance_status', 'FINANCE_OVERPAID_REVIEW')->count(), 'review_required' => collect($rows)->filter(fn ($row) => count($row['review_reasons']) > 0)->count()]; }

    private function markdown(array $report): string { $lines = ['# Legacy archive migration — Phase 1 dry run', '', '**Business writes:** 0', '', '## Summary', '']; foreach ($report['summary'] as $key => $value) $lines[] = '- '.str_replace('_', ' ', $key).': **'.$value.'**'; $lines[] = ''; $lines[] = '## First 10 finance-bearing rows'; foreach (collect($report['rows'])->filter(fn ($row) => $row['finance']['negotiated_amount_ttc'] !== null)->take(10) as $row) { $finance = $row['finance']; $lines[] = ''; $lines[] = '### '.$row['legacy_archive_ref'].' — '.$row['project']['raw']; $lines[] = '- Negotiated TTC: '.$finance['negotiated_amount_ttc'].' '.$finance['currency']; $lines[] = '- Proposed Devis / Facture TTC: '.$finance['proposed_devis_total_ttc'].' / '.$finance['proposed_facture_total_ttc']; $lines[] = '- Payments: '.$finance['payment_count'].'; total: '.$finance['total_payments'].'; remaining: '.($finance['calculated_remaining'] ?? 'N/A'); $lines[] = '- Excel Reste: '.($finance['excel_remaining'] ?? 'N/A').'; status: **'.$finance['finance_status'].'**'; foreach ($finance['payments'] as $payment) $lines[] = '  - #'.$payment['avance_sequence'].': '.($payment['payment_date_normalized'] ?? 'MISSING_DATE').' | '.$payment['amount_normalized'].' | '.($payment['payment_method_normalized'] ?? $payment['payment_method_raw']).' — '.$payment['payment_status']; } $lines[] = ''; $lines[] = 'Phase 2 is intentionally not executed. Review this report before authorizing any migration.'; return implode(PHP_EOL, $lines).PHP_EOL; }
}
