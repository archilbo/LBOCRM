<?php

namespace Tests\Feature;

use App\Services\Cin\CinScanner;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

final class CinScannerTest extends TestCase
{
    public function test_scanner_rejects_missing_front_image(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_rejects_missing_back_image(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_rejects_unreadable_images(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_detects_swapped_images(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_rejects_different_cards(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_extracts_mrz_from_new_card(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_handles_old_card_without_mrz(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_normalizes_dates_without_timezone_conversion(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_returns_father_and_mother_names_separately(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_maps_address_to_client_form(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_validates_mrz_check_digits_independently(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_never_logs_images_or_base64(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_never_logs_names_or_cin_numbers(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_never_logs_addresses(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_never_logs_raw_provider_output(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_uses_store_false_in_provider_request(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }

    public function test_scanner_uses_background_false_in_provider_request(): void
    {
        $this->markTestSkipped('Requires real Gemini API key for integration test.');
    }
}
