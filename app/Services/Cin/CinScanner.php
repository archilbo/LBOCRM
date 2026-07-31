<?php

namespace App\Services\Cin;

use App\Exceptions\CinScanException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

final class CinScanner
{
    public function __construct(
        private readonly CinImageProcessor $images,
        private readonly GeminiCinExtractionService $extraction,
        private readonly CinResultNormalizer $normalizer,
    ) {
    }

    public function scan(
        UploadedFile $submittedFront,
        UploadedFile $submittedBack,
    ): array {
        $scanId = (string) Str::uuid();
        $started = microtime(true);
        $front = $this->images->process($submittedFront, 'recto');
        $back = $this->images->process($submittedBack, 'verso');

        if (! $front->isReadable) {
            throw CinScanException::unreadableImage('recto');
        }

        if (! $back->isReadable) {
            throw CinScanException::unreadableImage('verso');
        }

        $providerResult = $this->extraction->extract(
            $front,
            $back,
            $scanId,
        );

        $result = $this->normalizer->normalize(
            $providerResult,
            $front,
            $back,
            $scanId,
        );

        Log::info('CIN scan completed', [
            'scan_id' => $scanId,
            'generation' => $result['document']['generation'],
            'images_swapped' => $result['document']['imagesSwapped'],
            'front_quality' => $front->qualityScore,
            'back_quality' => $back->qualityScore,
            'duration_ms' => (int) round((microtime(true) - $started) * 1000),
        ]);

        return $result;
    }
}
