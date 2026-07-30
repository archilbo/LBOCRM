<?php

namespace Tests\Unit;

use App\Support\UnicodeText;
use Tests\TestCase;

class UnicodeTextTest extends TestCase
{
    public function test_normalize_preserves_valid_unicode_characters(): void
    {
        $values = [
            "D'UN",
            'D’UN',
            "L'œuvre",
            'L’œuvre',
            "ÉTUDE D'ARCHITECTURE",
            'ÉTUDE D’ARCHITECTURE',
            'Façade',
            'Propriété',
            'Règlement',
            'Bâtiment',
            "À côté de l'école",
            'M. & Mme',
            'Surface < 100 m²',
            'N° 12 – Résidence Al Qods',
            '« Projet d’habitation »',
            'Français, العربية, English',
        ];

        foreach ($values as $value) {
            $this->assertSame(
                $value,
                UnicodeText::normalize($value),
                sprintf('Failed to preserve: %s', $value)
            );
        }
    }

    public function test_document_normalization_decodes_legacy_entities(): void
    {
        $cases = [
            "D'UN" => "D'UN",
            'D&apos;UN' => "D'UN",
            'D&amp;apos;UN' => "D'UN",
            'D&#039;UN' => "D'UN",
            'D&amp;#039;UN' => "D'UN",

            'ÉTUDE D&apos;ARCHITECTURE'
                => "ÉTUDE D'ARCHITECTURE",

            "L&apos;œuvre située à côté de l&apos;école"
                => "L'œuvre située à côté de l'école",

            'M. &amp; Mme'
                => 'M. & Mme',

            'Surface &lt; 100 m²'
                => 'Surface < 100 m²',

            'N° 12 – Résidence Al Qods'
                => 'N° 12 – Résidence Al Qods',

            'Français, العربية, English'
                => 'Français, العربية, English',
        ];

        foreach ($cases as $input => $expected) {
            $this->assertSame(
                $expected,
                UnicodeText::forDocument($input),
                sprintf('Failed to normalize: %s', $input)
            );
        }
    }

    public function test_document_normalization_preserves_typographic_apostrophes(): void
    {
        $this->assertSame(
            'D’UN',
            UnicodeText::forDocument('D’UN')
        );

        $this->assertSame(
            'L’œuvre',
            UnicodeText::forDocument('L’œuvre')
        );
    }

    public function test_document_normalization_preserves_ampersands_and_angle_brackets(): void
    {
        $this->assertSame(
            'M. & Mme',
            UnicodeText::forDocument('M. & Mme')
        );

        $this->assertSame(
            'Surface < 100 m²',
            UnicodeText::forDocument('Surface < 100 m²')
        );

        $this->assertSame(
            'Surface > 100 m²',
            UnicodeText::forDocument('Surface > 100 m²')
        );
    }
}
