<?php

namespace App\Enums;

enum PaymentKind: string
{
    case Invoice = 'invoice';
    case InternalInvoice = 'internal_invoice';
    case Advance = 'advance';

    public function label(): string
    {
        return match ($this) {
            self::Invoice => 'Paiement de facture',
            self::InternalInvoice => 'Paiement de facture interne',
            self::Advance => 'Avance dossier',
        };
    }
}
