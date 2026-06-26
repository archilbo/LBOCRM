<?php

namespace App\Services\Finance;

use App\Models\CompanySetting;

class FinanceSettingsService
{
    public static function getCompanyName(): string
    {
        return self::getString('company', 'name', 'ARCHI LBO');
    }

    public static function getCompanyAddress(): string
    {
        return self::getString('company', 'address', '');
    }

    public static function getCompanyPhone(): string
    {
        return self::getString('company', 'phone', '');
    }

    public static function getCompanyEmail(): string
    {
        return self::getString('company', 'email', '');
    }

    public static function getCompanyIce(): string
    {
        return self::getString('company', 'ice', '');
    }

    public static function getCompanyCin(): string
    {
        return self::getString('company', 'cin', '');
    }

    public static function getQuotePrefix(): string
    {
        return self::getString('numbering', 'quote_prefix', 'DEV');
    }

    public static function getInvoicePrefix(): string
    {
        return self::getString('numbering', 'invoice_prefix', 'INV');
    }

    public static function getReceiptPrefix(): string
    {
        return self::getString('numbering', 'receipt_prefix', 'REC');
    }

    public static function getPaymentPrefix(): string
    {
        return self::getString('numbering', 'payment_prefix', 'PAY');
    }

    public static function getTvaRate(): float
    {
        return (float) self::getDecimal('tax', 'tva_rate', 20);
    }

    public static function getCurrency(): string
    {
        return self::getString('finance', 'currency', 'MAD');
    }

    public static function getDefaultPaymentTerms(): string
    {
        return self::getString('finance', 'payment_terms', 'Paiement à réception');
    }

    public static function getDefaultPaymentDays(): int
    {
        return (int) self::getInteger('finance', 'payment_days', 30);
    }

    public static function getBankName(): string
    {
        return self::getString('bank', 'bank_name', '');
    }

    public static function getBankRib(): string
    {
        return self::getString('bank', 'rib', '');
    }

    public static function getBankIban(): string
    {
        return self::getString('bank', 'iban', '');
    }

    public static function getBankBic(): string
    {
        return self::getString('bank', 'bic', '');
    }

    public static function get(string $group, string $key, mixed $default = null): mixed
    {
        return CompanySetting::getValue($group, $key, $default);
    }

    public static function set(string $group, string $key, mixed $value, string $type = 'string'): void
    {
        CompanySetting::setValue($group, $key, $value, $type);
    }

    private static function getString(string $group, string $key, string $default): string
    {
        return (string) CompanySetting::getValue($group, $key, $default);
    }

    private static function getDecimal(string $group, string $key, float $default): float
    {
        return (float) CompanySetting::getValue($group, $key, (string) $default);
    }

    private static function getInteger(string $group, string $key, int $default): int
    {
        return (int) CompanySetting::getValue($group, $key, (string) $default);
    }
}
