<?php

namespace Tests\Unit;

use App\Services\Cin\CinImageProcessor;
use App\Services\Cin\CinResultNormalizer;
use App\Services\Cin\GeminiCinExtractionService;
use App\Services\Cin\MoroccanCinMrzParser;
use Tests\TestCase;

final class CinResultNormalizerTest extends TestCase
{
    private CinResultNormalizer $normalizer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->normalizer = new CinResultNormalizer(
            new MoroccanCinMrzParser(),
        );
    }

    public function test_normalize_rejects_unknown_generation(): void
    {
        $provider = [
            'document' => [
                'generation' => 'unknown',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.8,
            ],
            'fields' => [],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $this->expectException(\App\Exceptions\CinScanException::class);

        $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');
    }

    public function test_normalize_rejects_low_confidence(): void
    {
        $provider = [
            'document' => [
                'generation' => 'new_2020',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.4,
            ],
            'fields' => [],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $this->expectException(\App\Exceptions\CinScanException::class);

        $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');
    }

    public function test_normalize_detects_swapped_images(): void
    {
        $provider = [
            'document' => [
                'generation' => 'new_2020',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.8,
                'front_image_index' => 2,
                'back_image_index' => 1,
            ],
            'fields' => [],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $result = $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');

        $this->assertTrue($result['document']['imagesSwapped']);
    }

    public function test_normalize_marks_field_as_verified_when_confidence_high(): void
    {
        $provider = [
            'document' => [
                'generation' => 'new_2020',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.8,
            ],
            'fields' => [
                'cin_number' => [
                    'value' => 'AB123456',
                    'confidence' => 0.97,
                    'source' => 'front_printed',
                ],
            ],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $result = $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');

        $this->assertEquals('verified', $result['fields']['cinNumber']['status']);
    }

    public function test_normalize_marks_field_as_review_when_confidence_low(): void
    {
        $provider = [
            'document' => [
                'generation' => 'new_2020',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.8,
            ],
            'fields' => [
                'cin_number' => [
                    'value' => 'AB123456',
                    'confidence' => 0.85,
                    'source' => 'front_printed',
                ],
            ],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $result = $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');

        $this->assertEquals('review', $result['fields']['cinNumber']['status']);
    }

    public function test_normalize_normalizes_cin_format(): void
    {
        $provider = [
            'document' => [
                'generation' => 'new_2020',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.8,
            ],
            'fields' => [
                'cin_number' => [
                    'value' => 'ab-123-456',
                    'confidence' => 0.97,
                    'source' => 'front_printed',
                ],
            ],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $result = $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');

        $this->assertEquals('AB123456', $result['fields']['cinNumber']['value']);
    }

    public function test_normalize_normalizes_date_format(): void
    {
        $provider = [
            'document' => [
                'generation' => 'new_2020',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.8,
            ],
            'fields' => [
                'expiry_date' => [
                    'value' => '31/12/2025',
                    'confidence' => 0.97,
                    'source' => 'front_printed',
                ],
            ],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $result = $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');

        $this->assertEquals('2025-12-31', $result['fields']['expiryDate']['value']);
    }

    public function test_normalize_normalizes_sex(): void
    {
        $provider = [
            'document' => [
                'generation' => 'new_2020',
                'front_detected' => true,
                'back_detected' => true,
                'same_card' => true,
                'same_card_confidence' => 0.9,
                'confidence' => 0.8,
            ],
            'fields' => [
                'sex' => [
                    'value' => 'MASCULIN',
                    'confidence' => 0.97,
                    'source' => 'back_printed',
                ],
            ],
            'mrz' => ['detected' => false, 'lines' => []],
        ];

        $front = $this->createMockProcessedImage();
        $back = $this->createMockProcessedImage();

        $result = $this->normalizer->normalize($provider, $front, $back, 'test-scan-id');

        $this->assertEquals('M', $result['fields']['sex']['value']);
    }

    private function createMockProcessedImage(): \App\Services\Cin\ProcessedCinImage
    {
        return new \App\Services\Cin\ProcessedCinImage(
            bytes: 'mock',
            mimeType: 'image/jpeg',
            width: 1200,
            height: 800,
            qualityScore: 85,
            isReadable: true,
            warnings: [],
            sha256: hash('sha256', 'mock'),
        );
    }
}
