<?php

namespace App\Support;

/**
 * Immutable helper for exact decimal-to-cents conversion.
 *
 * All monetary calculations should flow through this class to avoid
 * floating-point drift and to handle French-formatted input consistently.
 */
class DecimalMoney
{
    /**
     * Parse a decimal string from any locale format into integer cents.
     *
     * Accepts:
     *   "1500,50"  (French decimal comma)
     *   "1500.50"  (English decimal point)
     *   "1 500,50" (French with space thousands separator)
     *   "1 500.50" (space-separated with period)
     *   "1500"     (integer)
     *
     * Returns integer cents (150050 for all examples above).
     */
    public static function parse(string $value): int
    {
        $value = trim($value);

        if ($value === '' || $value === '0' || $value === '0,00' || $value === '0.00') {
            return 0;
        }

        // Remove non-breaking and regular spaces (French thousands separator)
        $cleaned = str_replace(["\xc2\xa0", ' '], '', $value);

        // Normalize decimal comma → period
        $cleaned = str_replace(',', '.', $cleaned);

        // Handle multiple dots — keep only the last one
        $dotCount = substr_count($cleaned, '.');
        if ($dotCount > 1) {
            $parts = explode('.', $cleaned);
            $last = array_pop($parts);
            $cleaned = implode('', $parts) . '.' . $last;
        }

        // Remove any remaining non-numeric characters except dot and minus
        $cleaned = preg_replace('/[^0-9.\-]/', '', $cleaned);

        if ($cleaned === '' || $cleaned === '-' || $cleaned === '.') {
            return 0;
        }

        return (int) round((float) $cleaned * 100);
    }

    /**
     * Convert a float to integer cents with proper rounding.
     */
    public static function toCents(float $value): int
    {
        return (int) round($value * 100);
    }

    /**
     * Convert integer cents back to a 2-decimal float.
     */
    public static function fromCents(int $cents): float
    {
        return round($cents / 100, 2);
    }

    /**
     * Format cents as a display string with period decimal: "1500.50".
     */
    public static function format(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }
}
