<?php

namespace App\Console\Commands;

use App\Models\ArchiveRecord;
use Illuminate\Console\Command;

final class BackfillLegacyArchiveReferencesCommand extends Command
{
    protected $signature = 'legacy:archive-backfill-references
        {--company-id= : Restrict the backfill to one company}
        {--confirm : Required to update archive records}';

    protected $description = 'Copy historical Excel archive references from legacy notes into the searchable legacy_reference field.';

    public function handle(): int
    {
        if (! $this->option('confirm')) {
            $this->error('Refusing to update archive records without --confirm.');

            return self::FAILURE;
        }

        $updated = 0;
        $unmatched = 0;

        ArchiveRecord::query()
            ->whereNull('legacy_reference')
            ->when($this->option('company-id'), fn ($query, $companyId) => $query->where('company_id', $companyId))
            ->whereNotNull('notes')
            ->orderBy('id')
            ->chunkById(200, function ($records) use (&$updated, &$unmatched): void {
                foreach ($records as $record) {
                    $reference = $this->referenceFromNotes((string) $record->notes);

                    if ($reference === null) {
                        $unmatched++;
                        continue;
                    }

                    $record->update(['legacy_reference' => $reference]);
                    $updated++;
                }
            });

        $this->table(['Updated', 'No reference in notes'], [[$updated, $unmatched]]);

        return self::SUCCESS;
    }

    private function referenceFromNotes(string $notes): ?string
    {
        if (! preg_match('/(?:r(?:é|e)f\.|reference)\s*([^;\r\n]+)/iu', $notes, $matches)) {
            return null;
        }

        $reference = trim($matches[1]);

        return $reference === '' ? null : mb_substr($reference, 0, 120);
    }
}
