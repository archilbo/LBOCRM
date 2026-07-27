<?php

namespace App\Services\Finance;

use App\Models\CompanySetting;
use Illuminate\Support\Facades\Storage;

class FinanceSettingsService
{
    public function allGrouped(): array
    {
        return [
            'finance' => $this->finance(),
            'company' => $this->companyInfo(),
            'bank' => $this->bankInfo(),
        ];
    }

    public function finance(): array
    {
        return [
            'defaultTvaRate' => self::getTvaRate(),
            'defaultCurrency' => self::getCurrency(),
            'defaultPaymentTermsDays' => self::getPaymentTermsDays(),
            'defaultQuoteValidityDays' => self::getQuoteValidityDays(),
            'defaultUnitPriceM2' => self::getUnitPriceM2(),
            'defaultArchitectRate' => self::getArchitectRate(),
        ];
    }

    public function companyInfo(): array
    {
        return [
            'companyName' => self::getCompanyName(),
            'companyAddress' => self::getCompanyAddress(),
            'companyPhone' => self::getCompanyPhone(),
            'companyEmail' => self::getCompanyEmail(),
            'companyIce' => self::getCompanyIce(),
            'companyTva' => self::getCompanyTva(),
            'companyPatente' => self::getCompanyPatente(),
            'companyCnss' => self::getCompanyCnss(),
            'companyLogoPath' => self::getCompanyLogoPath(),
            'companyLogoUrl' => self::getCompanyLogoUrl(),
            'companyLogoDataUri' => self::getCompanyLogoDataUri(),
            'companyLogoHtml' => self::getCompanyLogoHtml(),
        ];
    }

    public function bankInfo(): array
    {
        return [
            'bankName' => self::getBankName(),
            'bankRib' => self::getBankRib(),
        ];
    }

    public function defaultTvaRate(): float
    {
        return self::getTvaRate();
    }

    public function defaultCurrency(): string
    {
        return self::getCurrency();
    }

    public function defaultPaymentTermsDays(): int
    {
        return self::getPaymentTermsDays();
    }

    public function defaultQuoteValidityDays(): int
    {
        return self::getQuoteValidityDays();
    }

    public function defaultUnitPriceM2(): float
    {
        return self::getUnitPriceM2();
    }

    public function defaultArchitectRate(): float
    {
        return self::getArchitectRate();
    }

    /**
     * Backward-compatible generic settings getter.
     *
     * Supports:
     * - FinanceSettingsService::get('finance', 'default_currency', 'MAD')
     * - FinanceSettingsService::get('finance.default_currency', 'MAD')
     * - FinanceSettingsService::get('default_currency', 'MAD')
     * - app(FinanceSettingsService::class)->get('company.company_name', 'ARCHI LBO')
     */
    public static function get(string $groupOrKey, mixed $keyOrDefault = null, mixed $default = null): mixed
    {
        $groups = ['finance', 'company', 'bank'];

        if (in_array($groupOrKey, $groups, true)) {
            $group = $groupOrKey;
            $key = (string) $keyOrDefault;
            $fallback = $default;

            return CompanySetting::getValue($group, self::normalizeKey($key), $fallback);
        }

        if (str_contains($groupOrKey, '.')) {
            [$group, $key] = explode('.', $groupOrKey, 2);

            return CompanySetting::getValue($group, self::normalizeKey($key), $keyOrDefault);
        }

        $key = self::normalizeKey($groupOrKey);
        $group = self::inferGroupFromKey($key);

        return CompanySetting::getValue($group, $key, $keyOrDefault);
    }

    public static function set(string $groupOrKey, mixed $keyOrValue, mixed $value = null, string $type = 'string', ?string $description = null): mixed
    {
        $groups = ['finance', 'company', 'bank'];

        if (in_array($groupOrKey, $groups, true)) {
            return CompanySetting::setValue(
                $groupOrKey,
                self::normalizeKey((string) $keyOrValue),
                $value,
                $type,
                $description
            );
        }

        if (str_contains($groupOrKey, '.')) {
            [$group, $key] = explode('.', $groupOrKey, 2);

            return CompanySetting::setValue(
                $group,
                self::normalizeKey($key),
                $keyOrValue,
                $type,
                $description
            );
        }

        $key = self::normalizeKey($groupOrKey);

        return CompanySetting::setValue(
            self::inferGroupFromKey($key),
            $key,
            $keyOrValue,
            $type,
            $description
        );
    }

    private static function normalizeKey(string $key): string
    {
        return match ($key) {
            'currency' => 'default_currency',
            'tva_rate' => 'default_tva_rate',
            'tax_rate' => 'default_tva_rate',
            'payment_terms_days' => 'default_payment_terms_days',
            'payment_days' => 'default_payment_terms_days',
            'quote_validity_days' => 'default_quote_validity_days',
            'unit_price_m2' => 'default_unit_price_m2',
            'unit_price' => 'default_unit_price_m2',
            'architect_rate' => 'default_architect_rate',
            'name' => 'company_name',
            'address' => 'company_address',
            'phone' => 'company_phone',
            'email' => 'company_email',
            'ice' => 'company_ice',
            'tva' => 'company_tva',
            'patente' => 'company_patente',
            'cnss' => 'company_cnss',
            'logo_path' => 'company_logo_path',
            'logo_url' => 'company_logo_url',
            'bank_name' => 'bank_name',
            'rib' => 'bank_rib',
            default => $key,
        };
    }

    private static function inferGroupFromKey(string $key): string
    {
        if (str_starts_with($key, 'company_')) {
            return 'company';
        }

        if (str_starts_with($key, 'bank_')) {
            return 'bank';
        }

        return 'finance';
    }

    public static function getTvaRate(): float
    {
        return (float) CompanySetting::getValue('finance', 'default_tva_rate', 20);
    }

    public static function getDefaultTvaRate(): float
    {
        return self::getTvaRate();
    }

    public static function getCurrency(): string
    {
        return (string) CompanySetting::getValue('finance', 'default_currency', 'MAD');
    }

    public static function getDefaultCurrency(): string
    {
        return self::getCurrency();
    }

    public static function getPaymentTermsDays(): int
    {
        return (int) CompanySetting::getValue('finance', 'default_payment_terms_days', 30);
    }

    public static function getDefaultPaymentTermsDays(): int
    {
        return self::getPaymentTermsDays();
    }

    public static function getDefaultPaymentDays(): int
    {
        return self::getPaymentTermsDays();
    }

    public static function getDefaultPaymentTerms(): string
    {
        return (string) CompanySetting::getValue('finance', 'payment_terms', 'Paiement à réception');
    }

    public static function getQuoteValidityDays(): int
    {
        return (int) CompanySetting::getValue('finance', 'default_quote_validity_days', 30);
    }

    public static function getDefaultQuoteValidityDays(): int
    {
        return self::getQuoteValidityDays();
    }

    public static function getUnitPriceM2(): float
    {
        return (float) CompanySetting::getValue('finance', 'default_unit_price_m2', 900);
    }

    public static function getDefaultUnitPriceM2(): float
    {
        return self::getUnitPriceM2();
    }

    public static function getDefaultUnitPrice(): float
    {
        return self::getUnitPriceM2();
    }

    public static function getArchitectRate(): float
    {
        return (float) CompanySetting::getValue('finance', 'default_architect_rate', 0.5);
    }

    public static function getDefaultArchitectRate(): float
    {
        return self::getArchitectRate();
    }

    public static function getCompanyName(): string
    {
        return (string) CompanySetting::getValue('company', 'company_name', 'ARCHI LBO SARLAU');
    }

    public static function getCompanyAddress(): string
    {
        return (string) CompanySetting::getValue('company', 'company_address', 'Immeuble nr 959 lotissement AL MASSAR Marrakech');
    }

    public static function getCompanyPhone(): string
    {
        return (string) CompanySetting::getValue('company', 'company_phone', '');
    }

    public static function getCompanyEmail(): string
    {
        return (string) CompanySetting::getValue('company', 'company_email', 'contact@archilbo.local');
    }

    public static function getCompanyIce(): string
    {
        return (string) CompanySetting::getValue('company', 'company_ice', '003614682000039');
    }

    public static function getCompanyTva(): string
    {
        return (string) CompanySetting::getValue('company', 'company_tva', '66121376');
    }

    public static function getCompanyPatente(): string
    {
        return (string) CompanySetting::getValue('company', 'company_patente', '64007633');
    }

    public static function getCompanyCnss(): string
    {
        return (string) CompanySetting::getValue('company', 'company_cnss', '5850815');
    }

    public static function getCompanyLogoPath(): string
    {
        return (string) CompanySetting::getValue('company', 'company_logo_path', '');
    }

    public static function getCompanyLogoUrl(): string
    {
        $path = self::getCompanyLogoPath();

        if (!$path) {
            return '';
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    public static function getCompanyLogoDataUri(): string
    {
        $path = self::getCompanyLogoPath();

        if (!$path || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return '';
        }

        if (!Storage::disk('public')->exists($path)) {
            return '';
        }

        $absolutePath = Storage::disk('public')->path($path);
        $contents = file_get_contents($absolutePath);

        if ($contents === false) {
            return '';
        }

        $mime = mime_content_type($absolutePath) ?: 'image/png';

        return 'data:' . $mime . ';base64,' . base64_encode($contents);
    }

    public static function getCompanyLogoHtml(): string
    {
        $dataUri = self::getCompanyLogoDataUri();
        $url = $dataUri ?: self::getCompanyLogoUrl();

        if ($url) {
            return '<img src="' . e($url) . '" alt="ARCHI LBO" class="company-logo-img">';
        }

        return '<div class="logo-mark"><span></span><span></span><span></span></div><div class="logo-text">ARCHI LBO</div>';
    }

    public static function getBankName(): string
    {
        return (string) CompanySetting::getValue('bank', 'bank_name', '');
    }

    public static function getBankRib(): string
    {
        return (string) CompanySetting::getValue('bank', 'bank_rib', '');
    }
}
