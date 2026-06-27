<?php

namespace App\Console\Commands;

use App\Services\Finance\FinanceExportNumberPayloadBuilder;
use App\Services\Finance\FinanceLockedDocumentNumberResolver;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class FinanceExportNumberingQaCommand extends Command
{
    protected $signature = 'archilbo:finance-export-numbering-qa';

    protected $description = 'Run QA checks for locked finance document numbers inside PDF/Excel export payloads.';

    public function handle(
        FinanceLockedDocumentNumberResolver $resolver,
        FinanceExportNumberPayloadBuilder $payloadBuilder,
    ): int {
        $this->info('Finance export numbering QA started...');

        try {
            config([
                'archilbo_finance_numbering.types.qa_export_invoice' => [
                    'label' => 'QA Export Invoice',
                    'prefix' => 'QAEXP',
                    'yearly_reset' => true,
                ],
            ]);

            DB::table('finance_document_number_counters')
                ->where('document_type', 'qa_export_invoice')
                ->delete();

            Schema::dropIfExists('finance_export_numbering_qa_documents');

            Schema::create('finance_export_numbering_qa_documents', function (Blueprint $table): void {
                $table->id();
                $table->string('document_number', 80)->nullable();
                $table->boolean('number_locked')->default(false);
                $table->timestamp('number_locked_at')->nullable();
                $table->timestamps();
            });

            $document = new class extends Model {
                protected $table = 'finance_export_numbering_qa_documents';

                protected $guarded = [];
            };

            $document->save();

            $first = $resolver->forModel($document, 'qa_export_invoice', 'document_number', '2026-08-01');

            $document->refresh();

            $payload = $payloadBuilder->build(
                document: $document,
                documentType: 'qa_export_invoice',
                numberColumn: 'document_number',
                date: '2026-08-01',
                payload: [
                    'client_name' => 'QA Client',
                    'total_ttc' => '1200.00',
                ],
            );

            $second = $resolver->forModel($document, 'qa_export_invoice', 'document_number', '2026-08-01');

            if ($first !== 'QAEXP-2026-0001') {
                throw new \RuntimeException("First export number invalid: {$first}");
            }

            if ($second !== $first) {
                throw new \RuntimeException("Export number changed from {$first} to {$second}");
            }

            foreach ([
                'document_number',
                'finance_document_number',
                'generated_document_number',
                'locked_document_number',
                'display_number',
            ] as $key) {
                if (($payload[$key] ?? null) !== $first) {
                    throw new \RuntimeException("Payload key {$key} does not contain locked number.");
                }
            }

            if ((bool) $document->number_locked !== true) {
                throw new \RuntimeException('number_locked was not set to true.');
            }

            if (empty($document->number_locked_at)) {
                throw new \RuntimeException('number_locked_at was not set.');
            }

            $nextDocument = new class extends Model {
                protected $table = 'finance_export_numbering_qa_documents';

                protected $guarded = [];
            };

            $nextDocument->save();

            $next = $resolver->forModel($nextDocument, 'qa_export_invoice', 'document_number', '2026-08-01');

            if ($next !== 'QAEXP-2026-0002') {
                throw new \RuntimeException("Next export number invalid: {$next}");
            }

            Schema::dropIfExists('finance_export_numbering_qa_documents');

            $this->line("OK Export payload uses locked number: {$first}");
            $this->info('Finance export numbering QA passed.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            try {
                Schema::dropIfExists('finance_export_numbering_qa_documents');
            } catch (Throwable) {
                //
            }

            $this->error('Finance export numbering QA failed.');
            $this->error($e->getMessage());

            if ($this->option('verbose')) {
                $this->line($e->getTraceAsString());
            }

            return self::FAILURE;
        }
    }
}