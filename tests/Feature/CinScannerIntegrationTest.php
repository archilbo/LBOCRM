<?php

namespace Tests\Feature;

use App\Services\Cin\CinImageProcessor;
use App\Services\Cin\CinScanner;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

final class CinScannerIntegrationTest extends TestCase
{
    private string $testImagePath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->testImagePath = storage_path(
            'app/private/archilbo/DATA/MARRAKECH/HARBIL/M\'HAMMED ESSAIDI/P7 CONSTRUCTION D\'UN R+2/documents/Documents'
        );
    }

    public function test_scan_real_cin_images(): void
    {
        $frontPath = $this->testImagePath . '/cin_front_97c9c649_934d_4b46_b58d_5a80a8d133ac_whatsapp_image_2026_07_30_at_12.01.21_(1).jpeg';
        $backPath = $this->testImagePath . '/cin_back_979d4c6d_2f48_4527_85ef_f5117a4b256f_whatsapp_image_2026_07_30_at_12.01.21.jpeg';

        if (! file_exists($frontPath) || ! file_exists($backPath)) {
            $this->markTestSkipped('Test CIN images not found');
        }

        $apiKey = config('services.gemini.key');
        if (empty($apiKey)) {
            $this->markTestSkipped('GEMINI_API_KEY not configured');
        }

        $frontFile = new UploadedFile(
            $frontPath,
            'cin_front.jpg',
            'image/jpeg',
            null,
            true
        );

        $backFile = new UploadedFile(
            $backPath,
            'cin_back.jpg',
            'image/jpeg',
            null,
            true
        );

        $scanner = new CinScanner(
            new CinImageProcessor(),
            app('App\Services\Cin\GeminiCinExtractionService'),
            app('App\Services\Cin\CinResultNormalizer'),
        );

        try {
            $result = $scanner->scan($frontFile, $backFile);

            echo "\n=== CIN Scan Result ===\n";
            echo "Generation: " . ($result['document']['generation'] ?? 'unknown') . "\n";
            echo "Images Swapped: " . ($result['document']['imagesSwapped'] ? 'yes' : 'no') . "\n";
            echo "Front Quality: " . ($result['document']['frontQuality'] ?? 'unknown') . "\n";
            echo "Back Quality: " . ($result['document']['backQuality'] ?? 'unknown') . "\n";
            echo "MRZ Detected: " . ($result['mrz']['detected'] ? 'yes' : 'no') . "\n";

            if (isset($result['fields']['cinNumber'])) {
                echo "CIN Number: " . $result['fields']['cinNumber']['value'] . " (status: " . $result['fields']['cinNumber']['status'] . ")\n";
            }
            if (isset($result['fields']['firstName'])) {
                echo "First Name: " . $result['fields']['firstName']['value'] . " (status: " . $result['fields']['firstName']['status'] . ")\n";
            }
            if (isset($result['fields']['lastName'])) {
                echo "Last Name: " . $result['fields']['lastName']['value'] . " (status: " . $result['fields']['lastName']['status'] . ")\n";
            }
            if (isset($result['fields']['birthDate'])) {
                echo "Birth Date: " . $result['fields']['birthDate']['value'] . " (status: " . $result['fields']['birthDate']['status'] . ")\n";
            }
            if (isset($result['fields']['expiryDate'])) {
                echo "Expiry Date: " . $result['fields']['expiryDate']['value'] . " (status: " . $result['fields']['expiryDate']['status'] . ")\n";
            }
            if (isset($result['fields']['address'])) {
                echo "Address: " . $result['fields']['address']['value'] . " (status: " . $result['fields']['address']['status'] . ")\n";
            }
            if (isset($result['fields']['fatherName'])) {
                echo "Father Name: " . $result['fields']['fatherName']['value'] . " (status: " . $result['fields']['fatherName']['status'] . ")\n";
            }
            if (isset($result['fields']['motherName'])) {
                echo "Mother Name: " . $result['fields']['motherName']['value'] . " (status: " . $result['fields']['motherName']['status'] . ")\n";
            }

            echo "Warnings: " . count($result['warnings'] ?? []) . "\n";
            foreach ($result['warnings'] ?? [] as $warning) {
                echo "  - " . $warning . "\n";
            }
            echo "======================\n";

            $this->assertIsArray($result);
            $this->assertArrayHasKey('document', $result);
            $this->assertArrayHasKey('fields', $result);
            $this->assertArrayHasKey('mrz', $result);
        } catch (\Exception $e) {
            echo "\n=== Scan Failed ===\n";
            echo "Error: " . $e->getMessage() . "\n";
            echo "==================\n";
            $this->fail('CIN scan failed: ' . $e->getMessage());
        }
    }
}
