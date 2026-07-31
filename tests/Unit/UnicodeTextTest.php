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

            'ÉTUDE D&apos;ARCHITECTURE' => "ÉTUDE D'ARCHITECTURE",

            'L&apos;œuvre située à côté de l&apos;école' => "L'œuvre située à côté de l'école",

            'M. &amp; Mme' => 'M. & Mme',

            'Surface &lt; 100 m²' => 'Surface < 100 m²',

            'N° 12 – Résidence Al Qods' => 'N° 12 – Résidence Al Qods',

            'Français, العربية, English' => 'Français, العربية, English',
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

    public function test_every_french_accented_character_preserved(): void
    {
        // Every French accented character
        $chars = [
            'é' => 'é',
            'è' => 'è',
            'ê' => 'ê',
            'ë' => 'ë',
            'É' => 'É',
            'È' => 'È',
            'Ê' => 'Ê',
            'Ë' => 'Ë',
            'à' => 'à',
            'â' => 'â',
            'ä' => 'ä',
            'À' => 'À',
            'Â' => 'Â',
            'Ä' => 'Ä',
            'ù' => 'ù',
            'û' => 'û',
            'ü' => 'ü',
            'Ù' => 'Ù',
            'Û' => 'Û',
            'Ü' => 'Ü',
            'ô' => 'ô',
            'ö' => 'ö',
            'Ô' => 'Ô',
            'Ö' => 'Ö',
            'î' => 'î',
            'ï' => 'ï',
            'Î' => 'Î',
            'Ï' => 'Ï',
            'ç' => 'ç',
            'Ç' => 'Ç',
            'œ' => 'œ',
            'Œ' => 'Œ',
        ];

        foreach ($chars as $char => $expected) {
            $this->assertSame($expected, UnicodeText::normalize($char), "normalize failed for: {$char}");
            $this->assertSame($expected, UnicodeText::forDocument($char), "forDocument failed for: {$char}");
        }
    }

    public function test_french_punctuation_and_special_symbols(): void
    {
        $values = [
            '«' => '«',
            '»' => '»',
            '—' => '—', // em dash
            '–' => '–', // en dash
            '°' => '°', // degree
            'N°' => 'N°',
            '±' => '±', // plus-minus
            '×' => '×', // multiplication
            '·' => '·', // middle dot
            '€' => '€', // euro
            'M. & Mme' => 'M. & Mme',
            'c\'est-à-dire' => 'c\'est-à-dire',
            'vis-à-vis' => 'vis-à-vis',
            'pièce' => 'pièce',
            'hôpital' => 'hôpital',
            'aéroport' => 'aéroport',
            'coût' => 'coût',
            'déjà' => 'déjà',
            'grâce' => 'grâce',
            'mûr' => 'mûr',
            'Vosges' => 'Vosges',
            '„Allée“' => '„Allée“', // German-style quotes (preserve)
        ];

        foreach ($values as $input => $expected) {
            $this->assertSame($expected, UnicodeText::normalize($input), "normalize failed for: {$input}");
            $this->assertSame($expected, UnicodeText::forDocument($input), "forDocument failed for: {$input}");
        }
    }

    public function test_real_world_french_contract_text(): void
    {
        $texts = [
            "CONTRAT D'ARCHITECTURE",
            'CONTRAT D’ARCHITECTURE',
            "ÉTUDE D'ARCHITECTURE D'UN PROJET DE CONSTRUCTION",
            'ÉTUDE D’ARCHITECTURE D’UN PROJET DE CONSTRUCTION',
            'RÈGLEMENT DE VOIRIE',
            'BÂTIMENT À USAGE D\'HABITATION',
            'PROJET DE CONSTRUCTION D\'UN R+2',
            'FAÇADE PRINCIPALE',
            "À côté de l'école primaire",
            'M. & Mme Ahmed Saïdi',
            'Surface habitable : 150 m²',
            'N° de permis : 2024/153',
            'Superficie du terrain : 500 m²',
            '« Projet d’habitation individuelle »',
            'LOTS N° 12 – RÉSIDENCE AL QODS',
            'VILLA À USAGE D\'HABITATION – R+1 –',
            'M. l\'Architecte & Mme le Client',
            'Surface < 100 m² (VEFA)',
            'PROPRIÉTÉ > 500 m²',
            'Français, العربية, English',
            'Prix : 1 500 000,00 €',
            'TVA 20% incluse',
            'déclaration d\'achèvement des travaux',
            'certificat de conformité',
            'permis de construire n° 47/2024',
            'l\'œuvre architecturale contemporaine',
        ];

        foreach ($texts as $text) {
            $normalized = UnicodeText::normalize($text);
            $this->assertSame($text, $normalized, "normalize altered text: {$text}");

            $forDoc = UnicodeText::forDocument($text);
            $this->assertSame($text, $forDoc, "forDocument altered plain text: {$text}");
        }
    }

    public function test_document_normalization_with_mixed_encodings(): void
    {
        $cases = [
            // Legacy HTML entities in stored data
            'D&apos;UN' => "D'UN",
            'D&apos;UN &amp; D&apos;AUTRE' => "D'UN & D'AUTRE",
            'M. &amp; Mme &amp; Cie' => 'M. & Mme & Cie',

            // Numbers with entities
            'Prix &lt; 500 &euro;' => 'Prix < 500 €',

            // French accented via entities
            'L&agrave;-bas' => 'Là-bas',
            'A bient&ocirc;t' => 'A bientôt',
            'D&eacute;part' => 'Départ',
            'Pr&egrave;s de' => 'Près de',
            'Et&eacute; &eacute;t&eacute;' => 'Eté été',

            // Typographic apostrophes
            "CONTRAT D'ARCHITECTURE" => "CONTRAT D'ARCHITECTURE",
            'CONTRAT D’ARCHITECTURE' => 'CONTRAT D’ARCHITECTURE',
            "D'UN" => "D'UN",
            'D’UN' => 'D’UN',
            "L'œuvre" => "L'œuvre",
            'L’œuvre' => 'L’œuvre',

            // Realistic contract values
            'LOTS N° 12 &amp; 13 – RÉSIDENCE' => 'LOTS N° 12 & 13 – RÉSIDENCE',
            'R+2 avec sous-sol &amp; parking' => 'R+2 avec sous-sol & parking',
            'M. &amp; Mme SAIDI' => 'M. & Mme SAIDI',
        ];

        foreach ($cases as $input => $expected) {
            $result = UnicodeText::forDocument($input);
            $this->assertSame(
                $expected,
                $result,
                "Failed for: {$input}".PHP_EOL.
                "  Expected: {$expected}".PHP_EOL.
                "  Got:      {$result}"
            );
        }
    }

    public function test_normalize_handles_edge_cases(): void
    {
        // Null/empty
        $this->assertSame('', UnicodeText::normalize(null));
        $this->assertSame('', UnicodeText::normalize(''));

        // Numbers
        $this->assertSame('123', UnicodeText::normalize(123));
        $this->assertSame('45.67', UnicodeText::normalize(45.67));

        // Null byte is valid UTF-8 (control char), normalize keeps it, forDocument strips it
        $normalized = UnicodeText::normalize("a\x00");
        $this->assertSame("a\x00", $normalized);
        $this->assertSame('a', UnicodeText::forDocument("a\x00"));
    }

    public function test_for_document_handles_edge_cases(): void
    {
        // Null/empty returns fallback hyphen
        $this->assertSame('-', UnicodeText::forDocument(null));
        $this->assertSame('-', UnicodeText::forDocument(''));

        // Numbers
        $this->assertSame('123', UnicodeText::forDocument(123));
        $this->assertSame('45.67', UnicodeText::forDocument(45.67));

        // Control chars that should be stripped
        $this->assertSame('AB', UnicodeText::forDocument("A\x01B"));

        // Multiple consecutive decodes
        $this->assertSame("D'UN", UnicodeText::forDocument('D&amp;apos;UN'));
        $this->assertSame("D'UN", UnicodeText::forDocument('D&amp;amp;apos;UN'));
    }

    public function test_arabic_text_preserved(): void
    {
        $arabic = [
            'العربية',
            'اللغة العربية',
            'مرحبا بالعالم',
            'Français, العربية, English',
            'ÉTUDE D’ARCHITECTURE – دراسة معمارية',
        ];

        foreach ($arabic as $text) {
            $this->assertSame($text, UnicodeText::normalize($text), "normalize failed for Arabic: {$text}");
            $this->assertSame($text, UnicodeText::forDocument($text), "forDocument failed for Arabic: {$text}");
        }
    }

    public function test_multiple_languages_mixed(): void
    {
        $mixed = [
            'Français, العربية, English',
            'Bienvenue – مرحبا – Welcome',
            'Projet n° 12/2024 – مشروع رقم ١٢/٢٠٢٤',
            'Architecte · مهندس معماري · Architect',
            'Villa avec piscine – فيلا مع مسبح',
        ];

        foreach ($mixed as $text) {
            $this->assertSame($text, UnicodeText::normalize($text), "normalize failed for mixed: {$text}");
            $this->assertSame($text, UnicodeText::forDocument($text), "forDocument failed for mixed: {$text}");
        }
    }

    public function test_french_oe_ligature(): void
    {
        $words = [
            'œuvre',
            'Œuvre',
            'cœur',
            'Cœur',
            'sœur',
            'Sœur',
            'œil',
            'Œil',
            'vœu',
            'Vœu',
            'bœuf',
            'BŒUF',
        ];

        foreach ($words as $word) {
            $this->assertSame($word, UnicodeText::normalize($word), "normalize failed for: {$word}");
            $this->assertSame($word, UnicodeText::forDocument($word), "forDocument failed for: {$word}");
        }
    }

    public function test_nfc_normalization(): void
    {
        // é can be represented as:
        //   1. Single character U+00E9 (NFC)
        //   2. e + combining accent U+0301 (NFD)
        // After normalization, both should become same NFC form

        $eAcuteNfc = "\xC3\xA9"; // U+00E9 é (NFC)
        $eAcuteNfd = "e\xCC\x81"; // e + combining acute (NFD)

        $normalizedNfc = UnicodeText::normalize($eAcuteNfc);
        $normalizedNfd = UnicodeText::normalize($eAcuteNfd);

        $this->assertSame($normalizedNfc, $normalizedNfd, 'NFC normalization should produce identical forms');
        $this->assertSame('é', $normalizedNfc, 'NFC normalized é should be single character');

        // Test in context: "française" with NFD cedilla on 'c' (U+00E7 = c + combining cedilla U+0327)
        $nfdText = 'franc'."\xCC\xA7".'aise'; // c + combining cedilla
        $nfcText = 'française'; // single-character ç
        $this->assertSame(
            UnicodeText::normalize($nfcText),
            UnicodeText::normalize($nfdText),
            "NFD 'franc".bin2hex("\xCC\xA7")."aise' should normalize to NFC 'française'"
        );
    }
}
