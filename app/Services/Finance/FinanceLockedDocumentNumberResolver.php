<?php

namespace App\Services\Finance;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class FinanceLockedDocumentNumberResolver
{
    public function __construct(
        protected FinanceDocumentNumberingService $numbering,
    ) {
    }

    public function forModel(
        Model $model,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
    ): string {
        $documentType = $documentType ?: $this->inferDocumentType($model);

        return $this->numbering->assignLockedNumber(
            model: $model,
            documentType: $documentType,
            column: $numberColumn,
            date: $date,
        );
    }

    public function payloadFor(
        Model $model,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
        array $basePayload = [],
    ): array {
        $lockedNumber = $this->forModel($model, $documentType, $numberColumn, $date);

        return array_replace($basePayload, [
            'document_number' => $lockedNumber,
            'finance_document_number' => $lockedNumber,
            'generated_document_number' => $lockedNumber,
            'locked_document_number' => $lockedNumber,
            'display_number' => $lockedNumber,

            // Compatibility aliases for older templates / exports.
            'number' => $basePayload['number'] ?? $lockedNumber,
            'reference' => $basePayload['reference'] ?? $lockedNumber,
            'ref' => $basePayload['ref'] ?? $lockedNumber,
        ]);
    }

    public function inferDocumentType(Model $model): string
    {
        $source = strtolower(class_basename($model).' '.$model->getTable());

        $aliases = [
            'credit_note' => ['credit_note', 'credit note', 'avoir'],
            'invoice' => ['invoice', 'facture'],
            'quote' => ['quote', 'devis'],
            'receipt' => ['receipt', 'recu', 'reÃ§u'],
        ];

        foreach ($aliases as $type => $needles) {
            foreach ($needles as $needle) {
                if (Str::contains($source, $needle)) {
                    return $type;
                }
            }
        }

        return 'invoice';
    }
}