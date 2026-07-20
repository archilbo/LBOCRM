<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class FinanceDocumentLockGuard
{
    public function assertCanUpdate(FinanceDocument $document): void
    {
        if (! $this->wasAlreadyLocked($document)) {
            return;
        }

        $blockedFields = $this->blockedFields();

        $dirtyBlockedFields = [];

        foreach ($blockedFields as $field) {
            if (! $document->isDirty($field)) {
                continue;
            }

            if ($this->isAllowedIdempotentLockWrite($document, $field)) {
                continue;
            }

            if ($this->valuesAreSemanticallyEqual(
                $field,
                $document->getOriginal($field),
                $document->getAttribute($field),
            )) {
                continue;
            }

            $dirtyBlockedFields[] = $field;
        }

        if ($dirtyBlockedFields === []) {
            return;
        }

        throw ValidationException::withMessages([
            'finance_document_lock' => 'This finance document number is locked after export and cannot be changed. Blocked fields: '.implode(', ', $dirtyBlockedFields).'.',
        ]);
    }

    public function assertCanEditContent(FinanceDocument $document): void
    {
        if (! $document->issued_at && ! $this->wasAlreadyLocked($document)) {
            return;
        }

        throw ValidationException::withMessages([
            'finance_document_lock' => 'Ce document est emis et immuable. Annulez-le puis creez un nouveau document.',
        ]);
    }

    protected function wasAlreadyLocked(FinanceDocument $document): bool
    {
        if (! Schema::hasTable($document->getTable())) {
            return false;
        }

        if (! Schema::hasColumn($document->getTable(), 'number_locked')) {
            return false;
        }

        return (bool) $document->getOriginal('number_locked');
    }

    protected function blockedFields(): array
    {
        return [
            'number',
            'type',
            'company_id',
            'branch_id',
            'client_id',
            'dossier_id',
            'source_document_id',
            'issue_date',
            'due_date',
            'valid_until',
            'currency',
            'tva_rate',
            'subtotal_ht',
            'discount_total',
            'tax_total',
            'total_ttc',
            'notes',
            'terms',
            'template_id',
            'number_locked',
            'number_locked_at',
        ];
    }

    protected function isAllowedIdempotentLockWrite(FinanceDocument $document, string $field): bool
    {
        if ($field === 'number_locked') {
            return (bool) $document->getOriginal('number_locked') === true
                && (bool) $document->getAttribute('number_locked') === true;
        }

        if ($field === 'number_locked_at') {
            $original = $document->getOriginal('number_locked_at');
            $current = $document->getAttribute('number_locked_at');

            return ! empty($original)
                && ! empty($current)
                && (string) $original === (string) $current;
        }

        return false;
    }

    protected function valuesAreSemanticallyEqual(string $field, mixed $original, mixed $current): bool
    {
        if ($field === 'number_locked') {
            return (bool) $original === (bool) $current;
        }

        if ($field === 'issue_date' || $field === 'number_locked_at') {
            return (string) $original === (string) $current;
        }

        return (string) $original === (string) $current;
    }
}
