<?php

namespace App\Services\Finance;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class FinanceExportNumberPayloadBuilder
{
    public function __construct(
        protected FinanceLockedDocumentNumberResolver $resolver,
    ) {
    }

    public function build(
        Model $document,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
        array $payload = [],
    ): array {
        return $this->resolver->payloadFor(
            model: $document,
            documentType: $documentType,
            numberColumn: $numberColumn,
            date: $date,
            basePayload: $payload,
        );
    }

    public function mergeInto(
        array $payload,
        Model $document,
        ?string $documentType = null,
        ?string $numberColumn = null,
        Carbon|string|null $date = null,
    ): array {
        return $this->build(
            document: $document,
            documentType: $documentType,
            numberColumn: $numberColumn,
            date: $date,
            payload: $payload,
        );
    }
}