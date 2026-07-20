<?php

namespace App\Console\Commands;

use App\Models\FinanceDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class FinanceDocumentLockGuardQaCommand extends Command
{
    protected $signature = 'archilbo:finance-document-lock-guard-qa';

    protected $description = 'Verify locked finance documents cannot change number-critical fields but can regenerate exports.';

    public function handle(): int
    {
        $this->info('Finance document lock guard QA started...');

        if (! Schema::hasTable('finance_documents')) {
            $this->error('Missing table: finance_documents.');

            return self::FAILURE;
        }

        foreach (['number', 'type', 'number_locked', 'number_locked_at'] as $column) {
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

        $this->line("Testing locked document: {$document->number}");

        $blockedChecks = [
            'number' => $document->number.'-BAD',
            'type' => $document->type === 'invoice' ? 'quote' : 'invoice',
            'number_locked' => false,
        ];

        if (Schema::hasColumn('finance_documents', 'issue_date')) {
            $blockedChecks['issue_date'] = now()->addDay()->toDateString();
        }

        if (Schema::hasColumn('finance_documents', 'number_locked_at')) {
            $blockedChecks['number_locked_at'] = now()->addDay();
        }

        foreach ($blockedChecks as $field => $badValue) {
            $fresh = FinanceDocument::query()->findOrFail($document->id);

            try {
                DB::transaction(function () use ($fresh, $field, $badValue): void {
                    $fresh->{$field} = $badValue;
                    $fresh->save();
                });

                $this->error("Locked field was changed but should be blocked: {$field}");

                return self::FAILURE;
            } catch (ValidationException) {
                $this->line("OK blocked locked field: {$field}");
            } catch (Throwable $e) {
                $this->error("Unexpected error while checking {$field}: ".$e->getMessage());

                return self::FAILURE;
            }
        }

        try {
            DB::transaction(function () use ($document): void {
                $fresh = FinanceDocument::query()->findOrFail($document->id);
                $fresh->number_locked = true;
                $fresh->save();

                throw new RuntimeException('__ROLLBACK_IDEMPOTENT_LOCK_TEST__');
            });
        } catch (RuntimeException $e) {
            if ($e->getMessage() !== '__ROLLBACK_IDEMPOTENT_LOCK_TEST__') {
                $this->error('Idempotent lock write failed: '.$e->getMessage());

                return self::FAILURE;
            }

            $this->line('OK idempotent number_locked=true write allowed.');
        } catch (Throwable $e) {
            $this->error('Idempotent lock write failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $safeField = null;

        foreach (['paid_total', 'remaining_total', 'status'] as $candidate) {
            if (Schema::hasColumn('finance_documents', $candidate)) {
                $safeField = $candidate;
                break;
            }
        }

        if ($safeField) {
            try {
                DB::transaction(function () use ($document, $safeField): void {
                    $fresh = FinanceDocument::query()->findOrFail($document->id);
                    $original = $fresh->{$safeField};

                    if (is_numeric($original)) {
                        $fresh->{$safeField} = (float) $original + 0.01;
                    } elseif (is_string($original) || is_null($original)) {
                        $fresh->{$safeField} = trim((string) $original).' ';
                    } else {
                        $fresh->{$safeField} = $original;
                    }

                    $fresh->save();

                    throw new RuntimeException('__ROLLBACK_SAFE_FIELD_TEST__');
                });
            } catch (RuntimeException $e) {
                if ($e->getMessage() !== '__ROLLBACK_SAFE_FIELD_TEST__') {
                    $this->error('Safe field update failed: '.$e->getMessage());

                    return self::FAILURE;
                }

                $this->line("OK safe field can be updated: {$safeField}");
            } catch (Throwable $e) {
                $this->error('Safe field update failed: '.$e->getMessage());

                return self::FAILURE;
            }
        }

        $document->refresh();

        $this->table(
            ['ID', 'Number', 'Type', 'Locked', 'Locked At'],
            [[
                $document->id,
                $document->number,
                $document->type,
                $document->number_locked ? 'yes' : 'no',
                (string) $document->number_locked_at,
            ]]
        );

        $this->info('Finance document lock guard QA passed.');

        return self::SUCCESS;
    }
}
