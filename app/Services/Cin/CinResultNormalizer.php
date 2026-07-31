<?php

namespace App\Services\Cin;

use App\Exceptions\CinScanException;
use Illuminate\Support\Str;
use Normalizer;

final class CinResultNormalizer
{
    public function __construct(
        private readonly MoroccanCinMrzParser $mrzParser,
    ) {
    }

    public function normalize(
        array $provider,
        ProcessedCinImage $submittedFront,
        ProcessedCinImage $submittedBack,
        string $scanId,
    ): array {
        $document = is_array($provider['document'] ?? null)
            ? $provider['document']
            : [];

        $generation = in_array(
            $document['generation'] ?? null,
            ['old_2008', 'new_2020', 'unknown'],
            true,
        ) ? $document['generation'] : 'unknown';

        $frontDetected = (bool) ($document['front_detected'] ?? false);
        $backDetected = (bool) ($document['back_detected'] ?? false);
        $documentConfidence = $this->confidence($document['confidence'] ?? 0);
        $sameCard = (bool) ($document['same_card'] ?? false);
        $sameCardConfidence = $this->confidence(
            $document['same_card_confidence'] ?? 0
        );

        if (
            $generation === 'unknown'
            || ! $frontDetected
            || ! $backDetected
            || ! $sameCard
            || $sameCardConfidence < 0.7
            || $documentConfidence < 0.55
        ) {
            throw CinScanException::invalidDocument();
        }

        $frontIndex = (int) ($document['front_image_index'] ?? 1);
        $backIndex = (int) ($document['back_image_index'] ?? 2);
        $imagesSwapped = $frontIndex === 2 && $backIndex === 1;

        $providerMrz = is_array($provider['mrz'] ?? null)
            ? $provider['mrz']
            : [];
        $providerMrzDetected = (bool) (
            $providerMrz['detected'] ?? false
        );

        /*
         * The 2008 CNIE has no MRZ. Do not create a false MRZ warning
         * merely because the supported old card correctly has no lines.
         */
        $mrz = $generation === 'new_2020'
            || $providerMrzDetected
            ? $this->mrzParser->parse(
                is_array($providerMrz['lines'] ?? null)
                    ? $providerMrz['lines']
                    : [],
            )
            : $this->emptyMrz();

        $fields = is_array($provider['fields'] ?? null)
            ? $provider['fields']
            : [];

        $resultFields = [
            'cinNumber' => $this->field(
                $fields['cin_number'] ?? [],
                fn (?string $value): ?string => $this->normalizeCin($value),
                $generation === 'new_2020' ? $mrz['personalNumber'] : null,
                $generation === 'new_2020' && ($mrz['valid'] ?? false),
                0.96,
            ),
            'documentNumber' => $this->field(
                $fields['document_number'] ?? [],
                fn (?string $value): ?string => $this->normalizeIdentifier($value),
                $generation === 'new_2020' ? $mrz['documentNumber'] : null,
                $generation === 'new_2020'
                    && ($mrz['checks']['documentNumber'] ?? false),
                0.96,
            ),
            'canNumber' => $this->field(
                $fields['can_number'] ?? [],
                fn (?string $value): ?string => $this->normalizeCan($value),
                null,
                false,
                0.96,
            ),
            'firstName' => $this->field(
                $fields['first_name'] ?? [],
                fn (?string $value): ?string => $this->normalizeText($value),
                $generation === 'new_2020' ? $mrz['firstName'] : null,
                $generation === 'new_2020' && ($mrz['valid'] ?? false),
                0.93,
                true,
            ),
            'lastName' => $this->field(
                $fields['last_name'] ?? [],
                fn (?string $value): ?string => $this->normalizeText($value),
                $generation === 'new_2020' ? $mrz['lastName'] : null,
                $generation === 'new_2020' && ($mrz['valid'] ?? false),
                0.93,
                true,
            ),
            'birthDate' => $this->field(
                $fields['birth_date'] ?? [],
                fn (?string $value): ?string => $this->normalizeDate($value),
                $generation === 'new_2020' ? $mrz['birthDate'] : null,
                $generation === 'new_2020'
                    && ($mrz['checks']['birthDate'] ?? false),
                0.95,
            ),
            'birthPlace' => $this->field(
                $fields['birth_place'] ?? [],
                fn (?string $value): ?string => $this->normalizeText($value),
                null,
                false,
                0.94,
            ),
            'expiryDate' => $this->field(
                $fields['expiry_date'] ?? [],
                fn (?string $value): ?string => $this->normalizeDate($value),
                $generation === 'new_2020' ? $mrz['expiryDate'] : null,
                $generation === 'new_2020'
                    && ($mrz['checks']['expiryDate'] ?? false),
                0.95,
            ),
            'sex' => $this->field(
                $fields['sex'] ?? [],
                fn (?string $value): ?string => $this->normalizeSex($value),
                $generation === 'new_2020' ? $mrz['sex'] : null,
                $generation === 'new_2020' && ($mrz['valid'] ?? false),
                0.95,
            ),
            'civilStatusNumber' => $this->field(
                $fields['civil_status_number'] ?? [],
                fn (?string $value): ?string => $this->normalizeCivilStatus($value),
                null,
                false,
                0.95,
            ),
            'fatherName' => $this->field(
                $fields['father_name'] ?? [],
                fn (?string $value): ?string => $this->normalizeText($value),
                null,
                false,
                0.95,
            ),
            'motherName' => $this->field(
                $fields['mother_name'] ?? [],
                fn (?string $value): ?string => $this->normalizeText($value),
                null,
                false,
                0.95,
            ),
            'address' => $this->field(
                $fields['address'] ?? [],
                fn (?string $value): ?string => $this->normalizeText($value),
                null,
                false,
                0.96,
            ),
        ];

        $this->applyDateConsistency($resultFields);

        $warnings = collect($provider['warnings'] ?? [])
            ->filter('is_string')
            ->map(fn (string $warning): string => trim($warning))
            ->filter()
            ->merge($mrz['warnings'] ?? [])
            ->when($imagesSwapped, fn ($items) => $items->push('images_swapped'))
            ->when(
                $generation === 'new_2020' && ! ($mrz['detected'] ?? false),
                fn ($items) => $items->push('new_card_mrz_not_detected'),
            )
            ->unique()
            ->values()
            ->all();

        return [
            'success' => true,
            'scanId' => $scanId,
            'document' => [
                'type' => 'moroccan_cin',
                'generation' => $generation,
                'frontDetected' => $frontDetected,
                'backDetected' => $backDetected,
                'imagesSwapped' => $imagesSwapped,
                'sameCard' => $sameCard,
                'sameCardConfidence' => $sameCardConfidence,
                'confidence' => $documentConfidence,
            ],
            'quality' => [
                'front' => $submittedFront->qualityPayload(),
                'back' => $submittedBack->qualityPayload(),
            ],
            'mrz' => $mrz,
            'fields' => $resultFields,
            'warnings' => $warnings,
        ];
    }

    private function field(
        mixed $providerField,
        callable $normalizer,
        ?string $mrzValue,
        bool $mrzValidated,
        float $verifiedThreshold,
        bool $asciiComparable = false,
    ): array {
        $providerField = is_array($providerField) ? $providerField : [];
        $value = $normalizer($this->nullableString($providerField['value'] ?? null));
        $confidence = $this->confidence($providerField['confidence'] ?? 0);
        $source = $this->normalizeSource($providerField['source'] ?? null);
        $normalizedMrz = $normalizer($mrzValue);
        $warnings = [];
        $sources = $source === null ? [] : [$source];

        if ($normalizedMrz !== null) {
            if ($value === null) {
                $value = $normalizedMrz;
                $confidence = $mrzValidated ? 0.99 : max($confidence, 0.75);
                $sources[] = 'mrz';
            } else {
                $matches = $asciiComparable
                    ? $this->comparable($value) === $this->comparable($normalizedMrz)
                    : $value === $normalizedMrz;

                if ($matches) {
                    $sources[] = 'mrz';
                    $confidence = $mrzValidated ? max($confidence, 0.99) : $confidence;
                } else {
                    $warnings[] = 'mrz_mismatch';
                    $sources[] = 'mrz';
                }
            }
        }

        $sources = array_values(array_unique($sources));

        if ($value === null) {
            $status = 'unreadable';
        } elseif ($warnings !== []) {
            $status = 'review';
        } elseif ($sources === [] || in_array('unknown', $sources, true)) {
            $status = 'review';
        } elseif ($mrzValidated && in_array('mrz', $sources, true)) {
            $status = 'verified';
        } elseif ($confidence >= $verifiedThreshold) {
            $status = 'verified';
        } else {
            $status = 'review';
        }

        return [
            'value' => $value,
            'status' => $status,
            'confidence' => round($confidence, 3),
            'sources' => $sources,
            'warnings' => $warnings,
        ];
    }

    /**
     * @param array<string, array<string, mixed>> $fields
     */
    private function applyDateConsistency(
        array &$fields,
    ): void {
        $birthDate = $fields['birthDate']['value'] ?? null;
        $expiryDate = $fields['expiryDate']['value'] ?? null;

        if (
            ! is_string($birthDate)
            || ! is_string($expiryDate)
        ) {
            return;
        }

        if ($expiryDate <= $birthDate) {
            $fields['expiryDate']['status'] = 'review';
            $fields['expiryDate']['warnings'][] =
                'expiry_not_after_birth_date';
            $fields['expiryDate']['warnings'] =
                array_values(array_unique(
                    $fields['expiryDate']['warnings']
                ));
        }
    }

    private function emptyMrz(): array
    {
        return [
            'detected' => false,
            'valid' => false,
            'lines' => [],
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
            'warnings' => [],
        ];
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_scalar($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' || strtolower($value) === 'null' ? null : $value;
    }

    private function normalizeText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (function_exists('mb_scrub')) {
            $value = mb_scrub($value, 'UTF-8');
        }

        if (class_exists(Normalizer::class)) {
            $normalized = Normalizer::normalize($value, Normalizer::FORM_C);

            if (is_string($normalized)) {
                $value = $normalized;
            }
        }

        $value = preg_replace(
            '/[^\x{0009}\x{000A}\x{000D}\x{0020}-\x{D7FF}\x{E000}-\x{FFFD}\x{10000}-\x{10FFFF}]/u',
            '',
            $value,
        ) ?? $value;
        $value = preg_replace('/[ \t]+/u', ' ', $value) ?? $value;
        $value = trim($value);

        return $value === '' ? null : $value;
    }

    private function normalizeCin(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = mb_strtoupper(preg_replace('/[\s\-]+/u', '', $value) ?? '', 'UTF-8');

        return preg_match('/^[A-Z]{1,3}\d{5,10}$/', $value) === 1 ? $value : null;
    }

    private function normalizeIdentifier(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = mb_strtoupper(preg_replace('/\s+/u', '', $value) ?? '', 'UTF-8');

        return preg_match('/^[A-Z0-9]{5,16}$/', $value) === 1 ? $value : null;
    }

    private function normalizeCan(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = preg_replace('/\D+/', '', $value) ?? '';

        return preg_match('/^\d{6}$/', $value) === 1 ? $value : null;
    }

    private function normalizeCivilStatus(?string $value): ?string
    {
        $value = $this->normalizeText($value);

        if ($value === null) {
            return null;
        }

        return preg_match('/^[\p{L}\p{N}\.\/\- ]{1,60}$/u', $value) === 1
            ? $value
            : null;
    }

    private function normalizeSex(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = mb_strtoupper(trim($value), 'UTF-8');

        return match ($value) {
            'M', 'MASCULIN', 'HOMME', 'MALE' => 'M',
            'F', 'FÉMININ', 'FEMININ', 'FEMME', 'FEMALE' => 'F',
            default => null,
        };
    }

    private function normalizeDate(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);
        $patterns = [
            '/^(\d{4})-(\d{2})-(\d{2})$/' => [1, 2, 3],
            '/^(\d{2})\/(\d{2})\/(\d{4})$/' => [3, 2, 1],
            '/^(\d{2})-(\d{2})-(\d{4})$/' => [3, 2, 1],
        ];

        foreach ($patterns as $pattern => [$yearIndex, $monthIndex, $dayIndex]) {
            if (preg_match($pattern, $value, $matches) !== 1) {
                continue;
            }

            $year = (int) $matches[$yearIndex];
            $month = (int) $matches[$monthIndex];
            $day = (int) $matches[$dayIndex];

            if (checkdate($month, $day, $year)) {
                return sprintf('%04d-%02d-%02d', $year, $month, $day);
            }
        }

        return null;
    }

    private function confidence(mixed $value): float
    {
        return max(0, min(1, is_numeric($value) ? (float) $value : 0));
    }

    private function normalizeSource(mixed $source): ?string
    {
        $allowed = [
            'front_printed',
            'back_printed',
            'mrz',
            'barcode',
            'arabic_crosscheck',
            'multiple',
            'unknown',
        ];

        return is_string($source) && in_array($source, $allowed, true)
            ? $source
            : null;
    }

    private function comparable(string $value): string
    {
        return Str::of($value)
            ->ascii()
            ->upper()
            ->replaceMatches('/[^A-Z0-9]/', '')
            ->toString();
    }
}
