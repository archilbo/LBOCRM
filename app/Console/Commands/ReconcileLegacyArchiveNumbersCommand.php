<?php

namespace App\Console\Commands;

use App\Models\ArchiveRecord;
use App\Services\Archive\ArchiveNumberingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

final class ReconcileLegacyArchiveNumbersCommand extends Command
{
    protected $signature = 'legacy:archive-reconcile-numbers
        {report : Dry-run JSON path}
        {--company-id=1 : Company scope}
        {--city-code= : Restrict the preview or reconciliation to one city code}
        {--confirm : Apply the reviewed reconciliation}';

    protected $description = 'Preview or safely reconcile imported archive numbers with their Excel references.';

    public function handle(ArchiveNumberingService $numbering): int
    {
        $path = (string) $this->argument('report');
        if (! is_file($path)) {
            $this->error('REPORT_FILE_NOT_FOUND');

            return self::FAILURE;
        }

        $report = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        if (($report['phase'] ?? null) !== 'PHASE_1_DRY_RUN_ONLY') {
            $this->error('INVALID_DRY_RUN_REPORT');

            return self::FAILURE;
        }

        $companyId = (int) $this->option('company-id');
        $year = $this->sourceYear((string) ($report['source'] ?? ''));
        $mappings = $this->mappings($report['rows'] ?? [], $companyId, $year, $numbering);
        $cityCode = strtoupper(trim((string) $this->option('city-code')));
        if ($cityCode !== '') {
            $mappings = array_values(array_filter($mappings, fn (array $mapping) => $mapping['cityCode'] === $cityCode));
        }
        if ($mappings === []) {
            $this->error('NO_LEGACY_ARCHIVE_MAPPINGS_FOUND');

            return self::FAILURE;
        }
        $this->markConflicts($mappings, $companyId);

        $summary = collect($mappings)->countBy('status')->all();
        $this->table(
            ['Legacy ref', 'Current', 'Expected', 'Status'],
            collect($mappings)->take(25)->map(fn (array $mapping) => [
                $mapping['legacyReference'],
                $mapping['currentNumber'] ?? '—',
                $mapping['expectedNumber'] ?? '—',
                $mapping['status'],
            ])->all(),
        );
        $this->line('Summary: '.json_encode($summary, JSON_UNESCAPED_UNICODE));

        $ready = array_values(array_filter($mappings, fn (array $mapping) => $mapping['status'] === 'READY'));
        if (! $this->option('confirm')) {
            $this->info('Preview only — rerun with --confirm after reviewing READY and conflict rows.');

            return self::SUCCESS;
        }

        $blocking = array_values(array_filter($mappings, fn (array $mapping) => in_array($mapping['status'], ['DUPLICATE_LEGACY_REFERENCE', 'NUMBER_COLLISION'], true)));
        if ($blocking !== []) {
            $this->error('Reconciliation blocked: resolve all legacy-reference duplicates and number collisions before applying changes.');

            return self::FAILURE;
        }

        $missing = count(array_filter($mappings, fn (array $mapping) => $mapping['status'] === 'MISSING_IMPORTED_RECORD'));
        if ($missing > 0) {
            $this->warn("{$missing} source row(s) have no imported archive yet and will be left unchanged.");
        }

        if ($ready === []) {
            $this->warn('No archive numbers are ready to reconcile.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($ready): void {
            foreach ($ready as $mapping) {
                ArchiveRecord::query()
                    ->whereKey($mapping['archiveId'])
                    ->update([
                        'archive_number' => 'LEGACY-TMP-'.$mapping['archiveId'],
                        'archive_sequence' => 900000000 + $mapping['archiveId'],
                    ]);
            }

            foreach ($ready as $mapping) {
                ArchiveRecord::query()
                    ->whereKey($mapping['archiveId'])
                    ->update([
                        'archive_number' => $mapping['expectedNumber'],
                        'archive_year' => $mapping['year'],
                        'archive_sequence' => $mapping['sequence'],
                    ]);
            }

            foreach (collect($ready)->groupBy(fn (array $mapping) => $mapping['companyId'].'|'.$mapping['cityId'].'|'.$mapping['year']) as $group) {
                $first = $group->first();
                $maxSequence = (int) ArchiveRecord::query()
                    ->where('company_id', $first['companyId'])
                    ->where('city_id', $first['cityId'])
                    ->where('archive_year', $first['year'])
                    ->max('archive_sequence');
                $counter = DB::table('archive_number_sequences')
                    ->where('company_id', $first['companyId'])
                    ->where('city_id', $first['cityId'])
                    ->where('year', $first['year'])
                    ->lockForUpdate()
                    ->first();

                if ($counter) {
                    DB::table('archive_number_sequences')
                        ->where('id', $counter->id)
                        ->update([
                            'last_sequence' => max((int) $counter->last_sequence, $maxSequence),
                            'updated_at' => now(),
                        ]);
                } else {
                    DB::table('archive_number_sequences')->insert([
                        'company_id' => $first['companyId'],
                        'city_id' => $first['cityId'],
                        'year' => $first['year'],
                        'last_sequence' => $maxSequence,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        Storage::disk('local')->put('legacy-migration/reconcile-'.now()->format('Ymd_His').'.json', json_encode([
            'source' => $report['source'] ?? null,
            'year' => $year,
            'updated' => $ready,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->info('Reconciled '.count($ready).' archive number(s).');

        return self::SUCCESS;
    }

    /**
     * @param array<int, array<string, mixed>> $rows
     * @return array<int, array<string, int|string|null>>
     */
    private function mappings(array $rows, int $companyId, int $year, ArchiveNumberingService $numbering): array
    {
        $mappings = [];

        foreach ($rows as $row) {
            $legacyReference = trim((string) ($row['legacy_archive_ref'] ?? ''));
            $city = $row['city'] ?? null;
            $sequence = $numbering->legacySequence($legacyReference);
            if (! is_array($city) || ! $sequence || empty($city['id']) || empty($city['code'])) {
                continue;
            }

            $dossierId = $row['project']['candidate_id'] ?? null;
            $archive = ArchiveRecord::query()
                ->where('company_id', $companyId)
                ->where('city_id', (int) $city['id'])
                ->when($dossierId, fn ($query) => $query->where('dossier_id', $dossierId), fn ($query) => $query->where('notes', 'Import historique — réf. '.$legacyReference))
                ->first();
            $expectedNumber = $numbering->format((string) $city['code'], $year, $sequence);

            $mappings[] = [
                'archiveId' => $archive?->id,
                'companyId' => $companyId,
                'cityId' => (int) $city['id'],
                'cityCode' => strtoupper((string) $city['code']),
                'year' => $year,
                'sequence' => $sequence,
                'legacyReference' => $legacyReference,
                'currentNumber' => $archive?->archive_number,
                'expectedNumber' => $expectedNumber,
                'status' => $archive === null ? 'MISSING_IMPORTED_RECORD' : ($archive->archive_number === $expectedNumber && (int) $archive->archive_sequence === $sequence ? 'ALREADY_MATCHED' : 'PENDING'),
            ];
        }

        return $mappings;
    }

    /**
     * @param array<int, array<string, int|string|null>> $mappings
     */
    private function markConflicts(array &$mappings, int $companyId): void
    {
        $byExpectedNumber = collect($mappings)->groupBy('expectedNumber');
        $candidateIds = collect($mappings)->pluck('archiveId')->filter()->map(fn ($id) => (int) $id)->all();

        foreach ($mappings as &$mapping) {
            if ($mapping['status'] !== 'PENDING') {
                continue;
            }

            if ($byExpectedNumber[$mapping['expectedNumber']]->count() > 1) {
                $mapping['status'] = 'DUPLICATE_LEGACY_REFERENCE';

                continue;
            }

            $owner = ArchiveRecord::query()
                ->where('company_id', $companyId)
                ->where('archive_number', $mapping['expectedNumber'])
                ->first();
            if ($owner && $owner->id !== $mapping['archiveId'] && ! in_array($owner->id, $candidateIds, true)) {
                $mapping['status'] = 'NUMBER_COLLISION';

                continue;
            }

            $mapping['status'] = 'READY';
        }
    }

    private function sourceYear(string $source): int
    {
        return preg_match('/\b(20\d{2})\b/', $source, $matches) ? (int) $matches[1] : (int) now()->year;
    }
}
