<?php

namespace App\Services\Finance;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinanceDocumentSequenceService
{
    private const SUPPORTED_TYPES = ['quote', 'invoice', 'receipt', 'internal_invoice', 'credit_note'];

    public function allocate(string $documentType, int $companyId, Carbon|string|null $date = null): string
    {
        if (! in_array($documentType, self::SUPPORTED_TYPES, true)) {
            throw ValidationException::withMessages(['type' => 'Type de document non pris en charge pour la numerotation.']);
        }

        if ($companyId <= 0) {
            throw ValidationException::withMessages(['company_id' => 'Une societe est requise pour la numerotation.']);
        }

        $date = $date instanceof Carbon ? $date : Carbon::parse($date ?: now());

        return DB::transaction(function () use ($documentType, $companyId, $date): string {
            DB::table('finance_document_sequences')->insertOrIgnore([
                'company_id' => $companyId,
                'document_type' => $documentType,
                'sequence_year' => (int) $date->format('Y'),
                'next_number' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sequence = DB::table('finance_document_sequences')
                ->where('company_id', $companyId)
                ->where('document_type', $documentType)
                ->where('sequence_year', (int) $date->format('Y'))
                ->lockForUpdate()
                ->first();

            if (! $sequence) {
                throw new \RuntimeException('Impossible de verrouiller la sequence de document financier.');
            }

            $number = (int) $sequence->next_number;

            DB::table('finance_document_sequences')
                ->where('id', $sequence->id)
                ->update(['next_number' => $number + 1, 'updated_at' => now()]);

            return $this->format($documentType, $number, (int) $date->format('Y'));
        });
    }

    public function format(string $documentType, int $number, int $year): string
    {
        $sequence = str_pad((string) $number, 3, '0', STR_PAD_LEFT);

        return $documentType === 'internal_invoice'
            ? "INT-{$sequence}/{$year}"
            : "{$sequence}/{$year}";
    }
}
