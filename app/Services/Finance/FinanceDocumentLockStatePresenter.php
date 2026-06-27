<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;

class FinanceDocumentLockStatePresenter
{
    public function toArray(FinanceDocument $document): array
    {
        $locked = (bool) ($document->number_locked ?? false);
        $lockedAt = $document->number_locked_at;

        return [
            'isLocked' => $locked,
            'lockedAt' => $lockedAt ? (string) $lockedAt : null,
            'lockedAtFormatted' => $lockedAt && method_exists($lockedAt, 'format')
                ? $lockedAt->format('d/m/Y H:i')
                : ($lockedAt ? (string) $lockedAt : null),
            'message' => $locked
                ? 'Document locked after export. Number, type, and issue date cannot be changed.'
                : 'Document is not locked yet.',
            'blockedFields' => [
                'number',
                'type',
                'issue_date',
                'number_locked',
                'number_locked_at',
            ],
            'canEditNumberFields' => ! $locked,
            'canRegenerateExports' => true,
            'canGeneratePdf' => true,
            'canGenerateExcel' => true,
        ];
    }
}