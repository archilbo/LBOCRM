<?php

namespace App\Console\Commands;

use App\Enums\PaymentKind;
use App\Models\ArchiveRecord;
use App\Models\City;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\DossierCahier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Payment;
use App\Services\Archive\ArchiveNumberingService;
use App\Services\Dossiers\DossierNumberService;
use App\Services\Finance\FinanceNumberService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class ApplyLegacyArchiveMigrationCommand extends Command
{
    protected $signature = 'legacy:archive-apply {report : Dry-run JSON path} {--company-id=1} {--branch-id=1} {--city-code= : Restrict the import to one resolved city code} {--confirm : Required explicit apply switch}';
    protected $description = 'Apply the approved legacy archive migration idempotently.';

    public function handle(ArchiveNumberingService $archives, DossierNumberService $dossiers): int
    {
        if (! $this->option('confirm')) { $this->error('Refusing to write without --confirm.'); return self::FAILURE; }
        $path = (string) $this->argument('report');
        if (! is_file($path)) { $this->error('REPORT_FILE_NOT_FOUND'); return self::FAILURE; }
        $report = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        if (($report['phase'] ?? null) !== 'PHASE_1_DRY_RUN_ONLY') { $this->error('Invalid dry-run report.'); return self::FAILURE; }
        $sourceYear = $this->sourceYear((string) ($report['source'] ?? ''));
        $scope = ['company_id' => (int) $this->option('company-id'), 'branch_id' => (int) $this->option('branch-id')];
        $audit = ['created_clients' => 0, 'created_dossiers' => 0, 'created_archives' => 0, 'created_cahiers' => 0, 'created_quotes' => 0, 'created_invoices' => 0, 'created_payments' => 0, 'skipped' => []];
        $cityCode = strtoupper(trim((string) $this->option('city-code')));
        $rows = array_filter($report['rows'], fn (array $row) => $cityCode === '' || strtoupper((string) ($row['city']['code'] ?? '')) === $cityCode);

        foreach ($rows as $row) {
            if (trim((string) ($row['client']['raw'] ?? '')) === '' && trim((string) ($row['project']['raw'] ?? '')) === '') {
                $audit['skipped'][] = ['ref' => $row['legacy_archive_ref'], 'reason' => 'SOURCE_ROW_EMPTY'];

                continue;
            }

            try {
                DB::transaction(function () use ($row, $scope, $archives, $dossiers, $sourceYear, &$audit) {
                    $cityName = $row['city']['name'] ?? $row['source_sheet'];
                    $city = City::query()->firstOrCreate(['name' => $cityName], ['code' => Str::upper(Str::substr(Str::ascii($cityName), 0, 8)), 'is_active' => true]);
                    $clientName = trim((string) ($row['client']['raw'] ?: 'Client non renseigné'));
                    $client = Client::query()->where($scope)->where('full_name', $clientName)->first();
                    if (! $client) { $client = Client::create([...$scope, 'client_number' => $this->clientNumber(), 'full_name' => $clientName, 'status' => 'active', 'notes' => 'Import historique — données à vérifier.']); $audit['created_clients']++; }
                    $project = trim((string) ($row['project']['raw'] ?: 'Projet non renseigné'));
                    $dossier = Dossier::query()->where($scope)->where('client_id', $client->id)->where('project_object', $project)->first();
                    if (! $dossier) { $number = $dossiers->generate(); $dossier = Dossier::create([...$scope, 'client_id' => $client->id, 'city_id' => $city->id, 'dossier_number' => $number['number'], 'sequence_number' => $number['sequence'], 'period' => $number['period'], 'project_object' => $project, 'project_address' => $row['project']['address_raw'] ?: null, 'floor_area' => is_numeric($row['project']['surface_raw']) ? $row['project']['surface_raw'] : null, 'status' => 'opened', 'workflow_step' => 'client', 'notes' => 'Import historique — réf. '.$row['legacy_archive_ref'].($row['project']['raw'] ? '' : '; projet non renseigné.')]); $audit['created_dossiers']++; }
                    if (! ArchiveRecord::query()->where('dossier_id', $dossier->id)->exists()) { $number = $archives->reserveLegacyReference($dossier, (string) $row['legacy_archive_ref'], $sourceYear) ?? $archives->reserve($dossier, Carbon::create($sourceYear, 1, 1)); ArchiveRecord::create(['company_id' => $number['company_id'], 'city_id' => $number['city_id'], 'archive_number' => $number['number'], 'archive_year' => $number['year'], 'archive_sequence' => $number['sequence'], 'dossier_id' => $dossier->id, 'status' => 'ready_to_archive', 'notes' => 'Import historique — réf. '.$row['legacy_archive_ref']]); $audit['created_archives']++; }
                    if (($row['cahier']['number_raw'] ?? '') !== '' && ($row['cahier']['received_at_normalized'] ?? null) !== null && ! DossierCahier::query()->where('dossier_id', $dossier->id)->exists()) { DossierCahier::create(['dossier_id' => $dossier->id, 'cahier_number' => $row['cahier']['number_raw'], 'received_at' => $row['cahier']['received_at_normalized'], 'delivered_at' => $row['cahier']['delivered_at_normalized']]); $audit['created_cahiers']++; }
                    $finance = $row['finance']; if (($finance['finance_status'] ?? '') !== 'FINANCE_READY') return;
                    $invoice = FinanceDocument::query()->where($scope)->where('dossier_id', $dossier->id)->where('type', 'invoice')->first();
                    if (! $invoice) { $quote = $this->document($scope, $client, $dossier, 'quote', $finance, $project); $invoice = $this->document($scope, $client, $dossier, 'invoice', $finance, $project, $quote->id); $audit['created_quotes']++; $audit['created_invoices']++; }
                    foreach ($finance['payments'] as $legacy) { if (($legacy['payment_status'] ?? '') !== 'NEW_PAYMENT_CANDIDATE') continue; if (Payment::query()->where('dossier_id', $dossier->id)->where('amount', $legacy['amount_normalized'])->whereDate('paid_at', $legacy['payment_date_normalized'])->exists()) continue; Payment::create([...$scope, 'finance_document_id' => $invoice->id, 'payment_kind' => PaymentKind::Invoice, 'client_id' => $client->id, 'dossier_id' => $dossier->id, 'payment_number' => FinanceNumberService::nextPaymentNumber(), 'amount' => $legacy['amount_normalized'], 'method' => $legacy['payment_method_normalized'], 'paid_at' => $legacy['payment_date_normalized'], 'notes' => 'Import historique — avance '.$legacy['avance_sequence']]); $audit['created_payments']++; }
                    $invoice->updatePaymentTotals()->save();
                });
            } catch (\Throwable $e) { $audit['skipped'][] = ['ref' => $row['legacy_archive_ref'], 'reason' => $e->getMessage()]; }
        }
        Storage::disk('local')->put('legacy-migration/apply-'.now()->format('Ymd_His').'.json', json_encode($audit, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->table(['created_clients','created_dossiers','created_archives','created_cahiers','created_quotes','created_invoices','created_payments','skipped'], [[...array_values(array_slice($audit, 0, 7)), count($audit['skipped'])]]);
        return self::SUCCESS;
    }
    private function clientNumber(): string { do { $number = 'LEG-'.str_pad((string) (Client::query()->count() + random_int(1, 9999)), 6, '0', STR_PAD_LEFT); } while (Client::query()->where('client_number', $number)->exists()); return $number; }
    private function sourceYear(string $source): int { return preg_match('/\b(20\d{2})\b/', $source, $matches) ? (int) $matches[1] : (int) now()->year; }
    private function document(array $scope, Client $client, Dossier $dossier, string $type, array $finance, string $project, ?int $source = null): FinanceDocument { $doc = FinanceDocument::create([...$scope, 'type' => $type, 'number' => FinanceNumberService::nextDocumentNumber($type), 'status' => 'draft', 'client_id' => $client->id, 'dossier_id' => $dossier->id, 'source_document_id' => $source, 'issue_date' => $finance['negotiated_date_normalized'] ?? now(), 'currency' => $finance['currency'], 'tva_rate' => 0, 'discount_total' => 0, 'paid_total' => 0, 'remaining_total' => $finance['negotiated_amount_ttc'], 'notes' => 'Import historique']); $item = new FinanceDocumentItem(['position' => 1, 'description' => $project, 'quantity' => 1, 'unit_price' => $finance['negotiated_amount_ttc']]); $item->calculateTotals(); $doc->items()->save($item); $doc->recalculateTotals()->save(); return $doc; }
}
