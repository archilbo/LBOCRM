<?php

namespace App\Support;

final class UnicodeText
{
    /**
     * Normalize normal application text without changing valid characters.
     */
    public static function normalize(mixed $value): string
    {
        $text = (string) ($value ?? '');

        /*
         * Remove malformed UTF-8 byte sequences when mbstring is
         * available. This does not transliterate valid Unicode text.
         */
        if (function_exists('mb_scrub')) {
            $text = mb_scrub($text, 'UTF-8');
        }

        /*
         * Normalize canonically equivalent Unicode sequences.
         *
         * Example:
         * e + combining acute accent becomes é.
         */
        if (class_exists(\Normalizer::class)) {
            $normalized = \Normalizer::normalize(
                $text,
                \Normalizer::FORM_C
            );

            if (is_string($normalized)) {
                $text = $normalized;
            }
        }

        return $text;
    }

    /**
     * Normalize text entering a generated document.
     *
     * This additionally decodes legacy or accidentally stored
     * HTML/XML entities.
     *
     * Do not use this method globally for HTML rendering.
     */
    public static function forDocument(mixed $value): string
    {
        $text = self::normalize($value);

        /*
         * Bounded decoding repairs single and double encoded entities:
         *
         * D&apos;UN
         * becomes:
         * D'UN
         *
         * D&amp;apos;UN
         * becomes:
         * D&apos;UN
         * then:
         * D'UN
         */
        for ($pass = 0; $pass < 3; $pass++) {
            $decoded = html_entity_decode(
                $text,
                ENT_QUOTES | ENT_HTML5,
                'UTF-8'
            );

            if ($decoded === $text) {
                break;
            }

            $text = $decoded;
        }

        /*
         * Remove only characters forbidden by XML 1.0.
         *
         * Preserve:
         * - French accented letters
         * - Arabic
         * - apostrophes
         * - typographic apostrophes
         * - ampersands
         * - angle brackets
         * - tabs
         * - line breaks
         * - Unicode punctuation
         * - mathematical symbols
         */
        $text = preg_replace(
            '/[^\x{0009}\x{000A}\x{000D}'.
            '\x{0020}-\x{D7FF}'.
            '\x{E000}-\x{FFFD}'.
            '\x{10000}-\x{10FFFF}]/u',
            '',
            $text
        ) ?? $text;

        return $text === '' ? '-' : $text;
    }

    private function __construct() {}
}
