<?php

namespace Tests\Unit;

use App\Exceptions\CinScanException;
use App\Services\Cin\GeminiCinExtractionService;
use App\Services\Cin\ProcessedCinImage;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

final class GeminiCinExtractionServiceTest extends TestCase
{
    public function test_rate_limit_does_not_retry_the_same_identity_document(): void
    {
        config()->set('services.gemini.key', 'test-key');
        config()->set('services.gemini.cin.model', 'test-model');
        config()->set('services.gemini.cin.retries', 2);
        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([], 429),
        ]);

        try {
            (new GeminiCinExtractionService)->extract(
                $this->processedImage('front'),
                $this->processedImage('back'),
                'test-scan-id',
            );
            $this->fail('A rate-limited provider response must fail the scan.');
        } catch (CinScanException $exception) {
            $this->assertSame('provider_rate_limited', $exception->errorCode);
        }

        Http::assertSentCount(1);
    }

    private function processedImage(string $contents): ProcessedCinImage
    {
        return new ProcessedCinImage(
            bytes: $contents,
            mimeType: 'image/jpeg',
            width: 1200,
            height: 800,
            qualityScore: 100,
            isReadable: true,
            warnings: [],
            sha256: hash('sha256', $contents),
        );
    }
}
