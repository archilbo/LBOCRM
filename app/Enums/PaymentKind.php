<?php

namespace App\Enums;

enum PaymentKind: string
{
    case Invoice = 'invoice';
    case Advance = 'advance';
    case NegotiatedAdvance = 'negotiated_advance';

    public function label(): string
    {
        return match ($this) {
            self::Invoice => 'Paiement de facture',
            self::Advance => 'Avance dossier',
            self::NegotiatedAdvance => 'Avance negociee',
        };
    }
}
