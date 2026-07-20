<?php

namespace App\Enums;

enum FinanceDocumentStatus: string
{
    case Draft = 'draft';
    case Issued = 'issued';
    case Generated = 'generated';
    case Sent = 'sent';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Converted = 'converted';
    case PartiallyPaid = 'partially_paid';
    case Paid = 'paid';
    case Overdue = 'overdue';
    case Cancelled = 'cancelled';

    public function isFinal(): bool
    {
        return in_array($this, [self::Paid, self::Rejected, self::Converted, self::Cancelled], true);
    }
}
