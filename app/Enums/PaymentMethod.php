<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case BankTransfer = 'bank_transfer';
    case Check = 'check';
    case Card = 'card';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Especes',
            self::BankTransfer => 'Virement bancaire',
            self::Check => 'Cheque',
            self::Card => 'Carte',
            self::Other => 'Autre',
        };
    }
}
