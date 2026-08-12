<?php

namespace App\Services\Archive;

use App\Models\ArchiveRecord;
use App\Models\Dossier;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Per-company × city × year archive numbering: {CITYCODE}-{YEAR}-{SEQ:04d}.
 *
 * The sequence lives in archive_number_sequences (one row per company × city ×
 * year). Callers MUST invoke reserve() inside an open transaction: the counter
 * row is locked with lockForUpdate() before being incremented, and the whole
 * number+create operation commits (or rolls back) atomically — a failed
 * creation never burns a sequence number.
 */
class ArchiveNumberingService
{
    /**
     * Reserve the next archive number for a dossier's company/city/year scope.
     *
     * The year comes from the server-side date (no archived_at/archive_date
     * business-date field exists on archive_records) and is never client-supplied.
     *
     * @return array{number:string, year:int, sequence:int, company_id:int, city_id:int}
     */
    public function reserve(Dossier $dossier, Carbon|string|null $date = null): array
    {
        $year = (int) $this->date($date)->format('Y');
        $scope = $this->scope($dossier, $year);
        $sequence = $this->nextSequence($scope['companyId'], $scope['cityId'], $year);

        return [
            'number' => $this->format($scope['cityCode'], $year, $sequence),
            'year' => $year,
            'sequence' => $sequence,
            'company_id' => $scope['companyId'],
            'city_id' => $scope['cityId'],
        ];
    }

    /**
     * Reserve an exact legacy Excel reference such as BG226.
     *
     * Historical physical files are labelled with this identifier, so it must
     * remain the canonical archive number instead of being reformatted.
     * Call inside the same transaction that creates its ArchiveRecord.
     *
     * @return array{number:string, year:int, sequence:int, company_id:int, city_id:int}
     */
    public function reserveLegacyReference(Dossier $dossier, string $reference, int $year): ?array
    {
        $reference = trim($reference);
        $sequence = $this->legacySequence($reference);
        if ($sequence === null) {
            throw new ArchiveNumberingException("Le numéro d'archive historique {$reference} est invalide.");
        }

        $scope = $this->scope($dossier, $year);
        $existingNumber = ArchiveRecord::query()
            ->where('company_id', $scope['companyId'])
            ->where('archive_number', $reference)
            ->lockForUpdate()
            ->exists();

        if ($existingNumber) {
            throw new ArchiveNumberingException("Le numéro d'archive historique {$reference} existe déjà dans cette société.");
        }

        $existingSequence = ArchiveRecord::query()
            ->where('company_id', $scope['companyId'])
            ->where('city_id', $scope['cityId'])
            ->where('archive_year', $year)
            ->where('archive_sequence', $sequence)
            ->lockForUpdate()
            ->exists();

        if ($existingSequence) {
            throw new ArchiveNumberingException("La séquence historique {$reference} est déjà attribuée dans cette ville pour cette année.");
        }

        $this->ensureSequenceAtLeast($scope['companyId'], $scope['cityId'], $year, $sequence);

        return [
            'number' => $reference,
            'year' => $year,
            'sequence' => $sequence,
            'company_id' => $scope['companyId'],
            'city_id' => $scope['cityId'],
        ];
    }

    public function legacySequence(string $reference): ?int
    {
        if (! preg_match('/(\d{1,9})$/', trim($reference), $matches)) {
            return null;
        }

        $sequence = (int) $matches[1];

        return $sequence > 0 ? $sequence : null;
    }

    /**
     * Single source of truth for the archive number format.
     */
    public function format(string $cityCode, int $year, int $sequence): string
    {
        return sprintf('%s-%d-%04d', strtoupper(trim($cityCode)), $year, $sequence);
    }

    private function nextSequence(int $companyId, int $cityId, int $year): int
    {
        $counter = $this->lockCounter($companyId, $cityId, $year);

        $next = $counter->last_sequence + 1;

        DB::table('archive_number_sequences')
            ->where('id', $counter->id)
            ->update([
                'last_sequence' => $next,
                'updated_at' => now(),
            ]);

        return $next;
    }

    private function ensureSequenceAtLeast(int $companyId, int $cityId, int $year, int $sequence): void
    {
        $counter = $this->lockCounter($companyId, $cityId, $year);

        if ($counter->last_sequence >= $sequence) {
            return;
        }

        DB::table('archive_number_sequences')
            ->where('id', $counter->id)
            ->update([
                'last_sequence' => $sequence,
                'updated_at' => now(),
            ]);
    }

    /**
     * Lock the counter row for the scope, creating it if needed.
     *
     * When two transactions race to create the same row, the loser hits the
     * unique (company_id, city_id, year) constraint and retries against the
     * winner's row (which is now lockable).
     */
    private function lockCounter(int $companyId, int $cityId, int $year): object
    {
        $counter = DB::table('archive_number_sequences')
            ->where('company_id', $companyId)
            ->where('city_id', $cityId)
            ->where('year', $year)
            ->lockForUpdate()
            ->first();

        if ($counter) {
            return $counter;
        }

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            try {
                DB::table('archive_number_sequences')->insert([
                    'company_id' => $companyId,
                    'city_id' => $cityId,
                    'year' => $year,
                    'last_sequence' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } catch (Throwable $e) {
                if ($attempt === 2) {
                    throw $e;
                }
            }

            $counter = DB::table('archive_number_sequences')
                ->where('company_id', $companyId)
                ->where('city_id', $cityId)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            if ($counter) {
                return $counter;
            }
        }

        return DB::table('archive_number_sequences')
            ->where('company_id', $companyId)
            ->where('city_id', $cityId)
            ->where('year', $year)
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function date(Carbon|string|null $date): Carbon
    {
        if ($date instanceof Carbon) {
            return $date;
        }

        if (is_string($date) && trim($date) !== '') {
            return Carbon::parse($date);
        }

        return now();
    }

    /**
     * @return array{companyId:int, cityId:int, cityCode:string}
     */
    private function scope(Dossier $dossier, int $year): array
    {
        $companyId = $dossier->company_id;
        $city = $dossier->city;

        if (! $companyId) {
            throw new ArchiveNumberingException(
                "Impossible de générer le numéro d'archive : le dossier n'est rattaché à aucune société.",
            );
        }

        if (! $city || trim((string) $city->code) === '') {
            throw new ArchiveNumberingException(
                "Impossible de générer le numéro d'archive : le dossier n'a pas de ville (ou de code de ville) valide.",
            );
        }

        if ($year < 1) {
            throw new ArchiveNumberingException(
                "Impossible de générer le numéro d'archive : l'année est invalide.",
            );
        }

        return [
            'companyId' => (int) $companyId,
            'cityId' => (int) $city->id,
            'cityCode' => strtoupper(trim((string) $city->code)),
        ];
    }
}
