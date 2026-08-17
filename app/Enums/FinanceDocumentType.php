<?php

namespace App\Enums;

enum FinanceDocumentType: string
{
    case Quote = 'quote';
    case Invoice = 'invoice';
    case InternalInvoice = 'internal_invoice';
    case Receipt = 'receipt';

    public function label(): string
    {
        return match ($this) {
            self::Quote => 'Devis',
            self::Invoice => 'Facture',
            self::InternalInvoice => 'Facture interne',
            self::Receipt => 'Recu',
        };
    }
}
