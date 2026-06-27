<?php

namespace App\Console\Commands;

use App\Http\Resources\FinanceDocumentResource;
use App\Models\FinanceDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class FinanceUiLockPayloadQaCommand extends Command
{
    protected $signature = 'archilbo:finance-ui-lock-payload-qa';

    protected $description = 'Verify finance document resource exposes UI lock awareness payload.';

    public function handle(): int
    {
        $this->info('Finance UI lock payload QA started...');

        if (! Schema::hasTable('finance_documents')) {
            $this->error('Missing table: finance_documents.');

            return self::FAILURE;
        }

        foreach (['number', 'number_locked', 'number_locked_at'] as $column) {
            if (! Schema::hasColumn('finance_documents', $column)) {
                $this->error("Missing finance_documents column: {$column}");

                return self::FAILURE;
            }
        }

        $document = FinanceDocument::query()
            ->where('number_locked', true)
            ->orderByDesc('id')
            ->first();

        if (! $document) {
            $this->error('No locked finance document found. Run finance export QA first.');

            return self::FAILURE;
        }

        $payload = (new FinanceDocumentResource($document))->resolve();

        foreach (['numberLocked', 'numberLockedAt', 'lock'] as $key) {
            if (! array_key_exists($key, $payload)) {
                $this->error("Missing resource key: {$key}");

                return self::FAILURE;
            }
        }

        foreach (['isLocked', 'lockedAt', 'lockedAtFormatted', 'message', 'blockedFields', 'canEditNumberFields', 'canRegenerateExports', 'canGeneratePdf', 'canGenerateExcel'] as $key) {
            if (! array_key_exists($key, $payload['lock'])) {
                $this->error("Missing lock payload key: lock.{$key}");

                return self::FAILURE;
            }
        }

        if ($payload['numberLocked'] !== true) {
            $this->error('numberLocked should be true for exported locked document.');

            return self::FAILURE;
        }

        if (($payload['lock']['isLocked'] ?? null) !== true) {
            $this->error('lock.isLocked should be true.');

            return self::FAILURE;
        }

        if (($payload['lock']['canEditNumberFields'] ?? true) !== false) {
            $this->error('lock.canEditNumberFields should be false.');

            return self::FAILURE;
        }

        if (($payload['lock']['canRegenerateExports'] ?? false) !== true) {
            $this->error('lock.canRegenerateExports should be true.');

            return self::FAILURE;
        }

        $this->table(
            ['Number', 'Locked', 'Locked At', 'Can Edit Number Fields', 'Can Regenerate Exports'],
            [[
                $payload['number'] ?? 'n/a',
                $payload['numberLocked'] ? 'yes' : 'no',
                $payload['numberLockedAt'] ?? 'n/a',
                $payload['lock']['canEditNumberFields'] ? 'yes' : 'no',
                $payload['lock']['canRegenerateExports'] ? 'yes' : 'no',
            ]]
        );

        $this->info('Finance UI lock payload QA passed.');

        return self::SUCCESS;
    }
}