<?php

namespace App\Enums;

enum PaymentKind: string
{
    case Invoice = 'invoice';
    case Advance = 'advance';

    public function label(): string
    {
        return match ($this) {
            self::Invoice => 'Paiement de facture',
            self::Advance => 'Avance dossier',
        };
    }
}
