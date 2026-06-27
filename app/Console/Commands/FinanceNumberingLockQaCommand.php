<?php

namespace App\Console\Commands;

use App\Services\Finance\FinanceDocumentNumberingService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class FinanceNumberingLockQaCommand extends Command
{
    protected $signature = 'archilbo:finance-numbering-lock-qa';

    protected $description = 'Run QA checks proving finance document numbers stay locked after first generation.';

    public function handle(FinanceDocumentNumberingService $numbering): int
    {
        $this->info('Finance locked numbering QA started...');

        try {
            config([
                'archilbo_finance_numbering.types.qa_lock_invoice' => [
                    'label' => 'QA Lock Invoice',
                    'prefix' => 'QALOCK',
                    'yearly_reset' => true,
                ],
            ]);

            DB::table('finance_document_number_counters')
                ->where('document_type', 'qa_lock_invoice')
                ->delete();

            Schema::dropIfExists('finance_numbering_lock_qa_documents');

            Schema::create('finance_numbering_lock_qa_documents', function (Blueprint $table): void {
                $table->id();
                $table->string('document_number', 80)->nullable();
                $table->boolean('number_locked')->default(false);
                $table->timestamp('number_locked_at')->nullable();
            });

            $document = new class extends Model {
                protected $table = 'finance_numbering_lock_qa_documents';

                public $timestamps = false;

                protected $guarded = [];
            };

            $document->save();

            $first = $numbering->assignLockedNumber($document, 'qa_lock_invoice', 'document_number', '2026-07-01');

            $document->refresh();

            $second = $numbering->assignLockedNumber($document, 'qa_lock_invoice', 'document_number', '2026-07-01');

            if ($first !== 'QALOCK-2026-0001') {
                throw new \RuntimeException("First locked number invalid: {$first}");
            }

            if ($second !== $first) {
                throw new \RuntimeException("Locked number changed from {$first} to {$second}");
            }

            if ((bool) $document->number_locked !== true) {
                throw new \RuntimeException('number_locked was not set to true.');
            }

            if (empty($document->number_locked_at)) {
                throw new \RuntimeException('number_locked_at was not set.');
            }

            $nextPreview = $numbering->preview('qa_lock_invoice', '2026-07-01');

            if ($nextPreview !== 'QALOCK-2026-0002') {
                throw new \RuntimeException("Next preview invalid after locked assignment: {$nextPreview}");
            }

            Schema::dropIfExists('finance_numbering_lock_qa_documents');

            $this->line("OK Locked number remains stable: {$first}");
            $this->info('Finance locked numbering QA passed.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            try {
                Schema::dropIfExists('finance_numbering_lock_qa_documents');
            } catch (Throwable) {
                //
            }

            $this->error('Finance locked numbering QA failed.');
            $this->error($e->getMessage());

            if ($this->option('verbose')) {
                $this->line($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }
}