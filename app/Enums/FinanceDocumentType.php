<?php

namespace App\Enums;

enum FinanceDocumentType: string
{
    case Quote = 'quote';
    case Invoice = 'invoice';
    case Receipt = 'receipt';

    public function label(): string
    {
        return match ($this) {
            self::Quote => 'Devis',
            self::Invoice => 'Facture',
            self::Receipt => 'Recu',
        };
    }
}
