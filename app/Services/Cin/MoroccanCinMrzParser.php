<?php

namespace App\Services\Cin;

use DateTimeImmutable;

final class MoroccanCinMrzParser
{
    /**
     * Parse the three-line TD1 MRZ used by the 2020 Moroccan CNIE.
     * Old 2008 CNIE cards do not contain an MRZ and should not call this parser.
     *
     * @param array<int, string> $lines
     */
    public function parse(array $lines): array
    {
        $normalized = array_values(array_filter(array_map(
            fn (mixed $line): string => $this->normalizeLine((string) $line),
            $lines,
        ), static fn (string $line): bool => $line !== ''));

        if (count($normalized) !== 3) {
            return $this->invalid($normalized, ['mrz_requires_three_lines']);
        }

        $normalized = array_map([$this, 'normalizeLength'], $normalized);

        if (in_array(null, $normalized, true)) {
            return $this->invalid(
                array_values(array_filter($normalized, 'is_string')),
                ['mrz_line_length_invalid'],
            );
        }

        /** @var array{0:string,1:string,2:string} $normalized */
        [$line1, $line2, $line3] = $normalized;

        $documentNumberField = substr($line1, 5, 9);
        $documentNumberCheck = $line1[14];
        $optionalLine1 = substr($line1, 15, 15);
        $birthField = substr($line2, 0, 6);
        $birthCheck = $line2[6];
        $sex = $line2[7];
        $expiryField = substr($line2, 8, 6);
        $expiryCheck = $line2[14];
        $nationality = substr($line2, 15, 3);
        $optionalLine2 = substr($line2, 18, 11);
        $compositeCheck = $line2[29];

        $checks = [
            'documentNumber' => $this->validateCheckDigit(
                $documentNumberField,
                $documentNumberCheck,
            ),
            'birthDate' => $this->validateCheckDigit(
                $birthField,
                $birthCheck,
            ),
            'expiryDate' => $this->validateCheckDigit(
                $expiryField,
                $expiryCheck,
            ),
            'composite' => $this->validateCheckDigit(
                substr($line1, 5, 25)
                    .substr($line2, 0, 7)
                    .substr($line2, 8, 7)
                    .$optionalLine2,
                $compositeCheck,
            ),
        ];

        [$lastName, $firstName] = $this->parseNames($line3);
        $warnings = [];

        if (substr($line1, 2, 3) !== 'MAR') {
            $warnings[] = 'issuing_country_is_not_mar';
        }

        if ($nationality !== 'MAR') {
            $warnings[] = 'nationality_is_not_mar';
        }

        foreach ($checks as $name => $valid) {
            if (! $valid) {
                $warnings[] = "mrz_{$name}_check_failed";
            }
        }

        $birthDate = $this->parseDate($birthField, false);
        $expiryDate = $this->parseDate($expiryField, true);

        if ($birthDate === null) {
            $warnings[] = 'mrz_birth_date_invalid';
        }

        if ($expiryDate === null) {
            $warnings[] = 'mrz_expiry_date_invalid';
        }

        return [
            'detected' => true,
            'valid' => $warnings === [],
            'lines' => [$line1, $line2, $line3],
            'documentType' => rtrim(substr($line1, 0, 2), '<'),
            'issuingCountry' => substr($line1, 2, 3),
            'documentNumber' => $this->cleanField($documentNumberField),
            'personalNumber' => $this->cleanField($optionalLine1),
            'birthDate' => $birthDate,
            'sex' => in_array($sex, ['M', 'F', 'X'], true) ? $sex : null,
            'expiryDate' => $expiryDate,
            'nationality' => $nationality,
            'lastName' => $lastName,
            'firstName' => $firstName,
            'checks' => $checks,
            'warnings' => $warnings,
        ];
    }

    private function normalizeLine(string $line): string
    {
        return strtoupper(preg_replace(
            '/\s+/u',
            '',
            str_replace(['«', '‹', '﹤'], '<', trim($line)),
        ) ?? '');
    }

    private function normalizeLength(string $line): ?string
    {
        if (strlen($line) === 30) {
            return $line;
        }

        if (strlen($line) < 30) {
            return str_pad($line, 30, '<');
        }

        $extra = substr($line, 30);

        if ($extra !== '' && trim($extra, '<') === '') {
            return substr($line, 0, 30);
        }

        return null;
    }

    private function validateCheckDigit(string $value, string $expected): bool
    {
        if (! ctype_digit($expected)) {
            return false;
        }

        return $this->checkDigit($value) === $expected;
    }

    public function checkDigit(string $value): string
    {
        $weights = [7, 3, 1];
        $total = 0;

        foreach (str_split($value) as $index => $character) {
            $total += $this->characterValue($character) * $weights[$index % 3];
        }

        return (string) ($total % 10);
    }

    private function characterValue(string $character): int
    {
        if ($character === '<') {
            return 0;
        }

        if (ctype_digit($character)) {
            return (int) $character;
        }

        if ($character >= 'A' && $character <= 'Z') {
            return ord($character) - ord('A') + 10;
        }

        return 0;
    }

    private function cleanField(string $value): ?string
    {
        $value = trim(str_replace('<', '', $value));

        return $value === '' ? null : $value;
    }

    /**
     * @return array{0:?string,1:?string}
     */
    private function parseNames(string $line): array
    {
        [$lastName, $firstNames] = array_pad(explode('<<', $line, 2), 2, '');
        $lastName = trim(str_replace('<', ' ', $lastName));
        $firstNames = trim(str_replace('<', ' ', $firstNames));

        return [
            $lastName === '' ? null : $lastName,
            $firstNames === '' ? null : $firstNames,
        ];
    }

    private function parseDate(string $value, bool $expiry): ?string
    {
        if (! preg_match('/^\d{6}$/', $value)) {
            return null;
        }

        $year = (int) substr($value, 0, 2);
        $month = (int) substr($value, 2, 2);
        $day = (int) substr($value, 4, 2);
        $currentYear = (int) date('Y');
        $currentCentury = intdiv($currentYear, 100) * 100;

        if ($expiry) {
            $fullYear = $currentCentury + $year;

            if ($fullYear < $currentYear - 20) {
                $fullYear += 100;
            }
        } else {
            $candidate = $currentCentury + $year;
            $fullYear = $candidate > $currentYear ? $candidate - 100 : $candidate;
        }

        if (! checkdate($month, $day, $fullYear)) {
            return null;
        }

        return (new DateTimeImmutable(sprintf(
            '%04d-%02d-%02d',
            $fullYear,
            $month,
            $day,
        )))->format('Y-m-d');
    }

    private function invalid(array $lines, array $warnings): array
    {
        return [
            'detected' => $lines !== [],
            'valid' => false,
            'lines' => $lines,
            'documentType' => null,
            'issuingCountry' => null,
            'documentNumber' => null,
            'personalNumber' => null,
            'birthDate' => null,
            'sex' => null,
            'expiryDate' => null,
            'nationality' => null,
            'lastName' => null,
            'firstName' => null,
            'checks' => [
                'documentNumber' => false,
                'birthDate' => false,
                'expiryDate' => false,
                'composite' => false,
            ],
            'warnings' => $warnings,
        ];
    }
}
