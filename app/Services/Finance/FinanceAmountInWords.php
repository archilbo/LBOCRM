<?php

namespace App\Services\Finance;

/**
 * Converts a monetary amount to French words for Finance documents.
 *
 * Kept dependency-free so it can be used by the template renderer, the
 * placeholder registry preview data and tests.
 */
class FinanceAmountInWords
{
    private const UNITS = [
        'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    ];

    private const TEENS = [
        10 => 'dix', 11 => 'onze', 12 => 'douze', 13 => 'treize', 14 => 'quatorze',
        15 => 'quinze', 16 => 'seize', 17 => 'dix-sept', 18 => 'dix-huit', 19 => 'dix-neuf',
    ];

    private const TENS = [
        2 => 'vingt', 3 => 'trente', 4 => 'quarante', 5 => 'cinquante',
        6 => 'soixante', 7 => 'soixante', 8 => 'quatre-vingt', 9 => 'quatre-vingt',
    ];

    private const CURRENCY_NAMES = [
        'MAD' => ['dirham', 'dirhams', 'centime', 'centimes'],
        'EUR' => ['euro', 'euros', 'centime', 'centimes'],
        'USD' => ['dollar', 'dollars', 'cent', 'cents'],
    ];

    public function format(float $amount, string $currency = 'MAD'): string
    {
        $currency = strtoupper(trim($currency)) ?: 'MAD';
        $amount = round($amount, 2);

        $integer = (int) floor($amount);
        $cents = (int) round(($amount - $integer) * 100);
        if ($cents === 100) {
            $integer += 1;
            $cents = 0;
        }

        $names = self::CURRENCY_NAMES[$currency] ?? [strtolower($currency), strtolower($currency), 'centime', 'centimes'];
        $currencySingular = $names[0];
        $currencyPlural = $names[1];

        $integerWords = $this->numberToWords($integer);
        $integerNoun = $this->pluralize($integerWords, $integer, $currencySingular, $currencyPlural);

        if ($cents === 0) {
            return $integerNoun;
        }

        $centsWords = $this->numberToWords($cents);
        $centsNoun = $this->pluralize($centsWords, $cents, $names[2], $names[3]);

        return $integerNoun . ' et ' . $centsNoun;
    }

    public function numberToWords(int $number): string
    {
        $number = (int) $number;

        if ($number === 0) {
            return self::UNITS[0];
        }

        if ($number < 0) {
            return 'moins ' . $this->numberToWords(-$number);
        }

        $words = [];

        if ($number >= 1000000) {
            $millions = intdiv($number, 1000000);
            $words[] = $this->millionsToWords($millions);
            $number %= 1000000;
        }

        if ($number >= 1000) {
            $thousands = intdiv($number, 1000);
            $words[] = $this->thousandsToWords($thousands);
            $number %= 1000;
        }

        if ($number >= 100) {
            $hundreds = intdiv($number, 100);
            $remainder = $number % 100;

            if ($hundreds === 1) {
                $words[] = 'cent';
            } elseif ($remainder === 0) {
                $words[] = self::UNITS[$hundreds] . ' cents';
            } else {
                $words[] = self::UNITS[$hundreds] . ' cent';
            }

            $number = $remainder;
        }

        if ($number > 0) {
            $words[] = $this->belowHundred($number);
        }

        return implode(' ', $words);
    }

    private function belowHundred(int $number): string
    {
        if ($number < 10) {
            return self::UNITS[$number];
        }

        if ($number < 20) {
            return self::TEENS[$number];
        }

        $ten = intdiv($number, 10);
        $unit = $number % 10;

        $word = self::TENS[$ten];

        if ($ten === 7 || $ten === 9) {
            return $word . '-' . self::TEENS[10 + $unit];
        }

        if ($unit === 0) {
            return $ten === 8 ? 'quatre-vingts' : $word;
        }

        if ($unit === 1) {
            return $word . ' et un';
        }

        return $word . '-' . self::UNITS[$unit];
    }

    private function thousandsToWords(int $thousands): string
    {
        if ($thousands === 1) {
            return 'mille';
        }

        return $this->numberToWords($thousands) . ' mille';
    }

    private function millionsToWords(int $millions): string
    {
        $word = $this->numberToWords($millions);

        if ($millions === 1) {
            return 'un million';
        }

        return $word . ' millions';
    }

    private function pluralize(string $words, int $count, string $singular, string $plural): string
    {
        $noun = $count > 1 ? $plural : $singular;

        // "un" absorbs the singular noun: "un dirham", not "un un dirham".
        if ($count === 1 && $words === 'un') {
            return $singular;
        }

        return $words . ' ' . $noun;
    }
}
