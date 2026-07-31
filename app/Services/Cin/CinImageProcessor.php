<?php

namespace App\Services\Cin;

use App\Exceptions\CinScanException;
use GdImage;
use Illuminate\Http\UploadedFile;
use Throwable;

final class CinImageProcessor
{
    private const MAX_DIMENSION = 2400;

    private const MAX_SOURCE_PIXELS = 40_000_000;

    private const MAX_SOURCE_DIMENSION = 12_000;

    private const MIN_LONG_SIDE = 600;

    private const MIN_SHORT_SIDE = 350;

    public function process(UploadedFile $file, string $side): ProcessedCinImage
    {
        if (! extension_loaded('gd')) {
            throw new CinScanException(
                'image_processor_unavailable',
                'L\'extension PHP GD est obligatoire pour analyser les images de CNI.',
                503,
            );
        }

        $path = $file->getRealPath();

        if (! is_string($path) || ! is_file($path)) {
            throw CinScanException::unreadableImage($side);
        }

        try {
            $originalBytes = file_get_contents($path);

            if (! is_string($originalBytes) || $originalBytes === '') {
                throw CinScanException::unreadableImage($side);
            }

            $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->file($path);

            if (! in_array($mimeType, [
                'image/jpeg',
                'image/png',
                'image/webp',
            ], true)) {
                throw new CinScanException(
                    'unsupported_image_type',
                    'Utilisez une image JPEG, PNG ou WEBP.',
                    422,
                );
            }

            $sourceInfo = @getimagesizefromstring(
                $originalBytes
            );
            $sourceWidth = (int) ($sourceInfo[0] ?? 0);
            $sourceHeight = (int) ($sourceInfo[1] ?? 0);

            if (
                $sourceWidth < 1
                || $sourceHeight < 1
                || $sourceWidth > self::MAX_SOURCE_DIMENSION
                || $sourceHeight > self::MAX_SOURCE_DIMENSION
                || ($sourceWidth * $sourceHeight)
                    > self::MAX_SOURCE_PIXELS
            ) {
                throw new CinScanException(
                    'image_dimensions_invalid',
                    "L\'image {$side} a des dimensions non prises en charge.",
                    422,
                );
            }

            $image = @imagecreatefromstring($originalBytes);

            if (! $image instanceof GdImage) {
                throw CinScanException::unreadableImage($side);
            }

            if ($mimeType === 'image/jpeg') {
                $image = $this->applyExifOrientation($image, $path);
            }

            $width = imagesx($image);
            $height = imagesy($image);

            if ($width < 1 || $height < 1) {
                imagedestroy($image);
                throw CinScanException::unreadableImage($side);
            }

            [$qualityScore, $warnings] = $this->qualityAssessment(
                $image,
                $width,
                $height,
            );

            $longSide = max($width, $height);
            $shortSide = min($width, $height);
            $isReadable = $longSide >= self::MIN_LONG_SIDE
                && $shortSide >= self::MIN_SHORT_SIDE
                && $qualityScore >= 30;

            if ($longSide > self::MAX_DIMENSION) {
                $image = $this->resizePreservingRatio(
                    $image,
                    $width,
                    $height,
                    self::MAX_DIMENSION,
                );
                $width = imagesx($image);
                $height = imagesy($image);
            }

            $flattened = imagecreatetruecolor($width, $height);
            $white = imagecolorallocate($flattened, 255, 255, 255);
            imagefill($flattened, 0, 0, $white);
            imagecopy($flattened, $image, 0, 0, 0, 0, $width, $height);
            imagedestroy($image);

            imagefilter($flattened, IMG_FILTER_CONTRAST, -4);

            ob_start();
            imagejpeg($flattened, null, 92);
            $processedBytes = ob_get_clean();
            imagedestroy($flattened);

            if (! is_string($processedBytes) || $processedBytes === '') {
                throw CinScanException::unreadableImage($side);
            }

            return new ProcessedCinImage(
                bytes: $processedBytes,
                mimeType: 'image/jpeg',
                width: $width,
                height: $height,
                qualityScore: $qualityScore,
                isReadable: $isReadable,
                warnings: $warnings,
                sha256: hash('sha256', $processedBytes),
            );
        } catch (CinScanException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            throw new CinScanException(
                'image_processing_failed',
                "L\'image {$side} n\'a pas pu être préparée.",
                422,
                $exception,
            );
        }
    }

    private function applyExifOrientation(GdImage $image, string $path): GdImage
    {
        if (! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($path);
        $orientation = (int) ($exif['Orientation'] ?? 1);

        return match ($orientation) {
            2 => $this->flip($image, IMG_FLIP_HORIZONTAL),
            3 => $this->rotate($image, 180),
            4 => $this->flip($image, IMG_FLIP_VERTICAL),
            5 => $this->rotate(
                $this->flip($image, IMG_FLIP_HORIZONTAL),
                -90,
            ),
            6 => $this->rotate($image, -90),
            7 => $this->rotate(
                $this->flip($image, IMG_FLIP_HORIZONTAL),
                180,
                90,
            ),
            8 => $this->rotate($image, 90),
            default => $image,
        };
    }

    private function rotate(GdImage $image, int $degrees): GdImage
    {
        $rotated = imagerotate($image, $degrees, 0);

        if (! $rotated instanceof GdImage) {
            return $image;
        }

        imagedestroy($image);

        return $rotated;
    }

    private function flip(GdImage $image, int $mode): GdImage
    {
        imageflip($image, $mode);

        return $image;
    }

    private function resizePreservingRatio(
        GdImage $image,
        int $width,
        int $height,
        int $maxDimension,
    ): GdImage {
        $ratio = $maxDimension / max($width, $height);
        $newWidth = max(1, (int) round($width * $ratio));
        $newHeight = max(1, (int) round($height * $ratio));
        $resized = imagecreatetruecolor($newWidth, $newHeight);
        $white = imagecolorallocate($resized, 255, 255, 255);
        imagefill($resized, 0, 0, $white);
        imagecopyresampled(
            $resized,
            $image,
            0,
            0,
            0,
            0,
            $newWidth,
            $newHeight,
            $width,
            $height,
        );
        imagedestroy($image);

        return $resized;
    }

    /**
     * @return array{0:int,1:array<int,string>}
     */
    private function qualityAssessment(
        GdImage $image,
        int $width,
        int $height,
    ): array {
        $warnings = [];
        $score = 100;
        $longSide = max($width, $height);
        $shortSide = min($width, $height);

        if ($longSide < 1200 || $shortSide < 700) {
            $warnings[] = 'low_resolution';
            $score -= 22;
        }

        if ($longSide < self::MIN_LONG_SIDE || $shortSide < self::MIN_SHORT_SIDE) {
            $warnings[] = 'resolution_too_small';
            $score -= 45;
        }

        $sampleStepX = max(1, intdiv($width, 80));
        $sampleStepY = max(1, intdiv($height, 50));
        $values = [];
        $edgeTotal = 0.0;
        $edgeCount = 0;

        for ($y = 0; $y < $height; $y += $sampleStepY) {
            $previous = null;

            for ($x = 0; $x < $width; $x += $sampleStepX) {
                $rgb = imagecolorat($image, $x, $y);
                $red = ($rgb >> 16) & 0xFF;
                $green = ($rgb >> 8) & 0xFF;
                $blue = $rgb & 0xFF;
                $luminance = 0.2126 * $red + 0.7152 * $green + 0.0722 * $blue;
                $values[] = $luminance;

                if ($previous !== null) {
                    $edgeTotal += abs($luminance - $previous);
                    $edgeCount++;
                }

                $previous = $luminance;
            }
        }

        if ($values !== []) {
            $mean = array_sum($values) / count($values);
            $variance = array_sum(array_map(
                static fn (float $value): float => ($value - $mean) ** 2,
                $values,
            )) / count($values);
            $contrast = sqrt($variance);
            $edgeStrength = $edgeCount > 0 ? $edgeTotal / $edgeCount : 0.0;

            if ($mean < 45) {
                $warnings[] = 'image_too_dark';
                $score -= 25;
            } elseif ($mean > 225) {
                $warnings[] = 'image_too_bright';
                $score -= 25;
            }

            if ($contrast < 24) {
                $warnings[] = 'low_contrast';
                $score -= 18;
            }

            if ($edgeStrength < 5.5) {
                $warnings[] = 'possible_blur';
                $score -= 22;
            }
        }

        return [max(0, min(100, $score)), array_values(array_unique($warnings))];
    }
}
