<?php

namespace App\Enums\ProjectDesign;

enum ConversionStatus: string
{
    case Uploaded = 'uploaded';
    case Queued = 'queued';
    case Validating = 'validating';
    case Converting = 'converting';
    case ExtractingMetadata = 'extracting_metadata';
    case GeneratingThumbnails = 'generating_thumbnails';
    case Ready = 'ready';
    case Failed = 'failed';
    case Unsupported = 'unsupported';

    public function label(): string
    {
        return match ($this) {
            self::Uploaded => 'Uploaded',
            self::Queued => 'Queued',
            self::Validating => 'Validating',
            self::Converting => 'Converting',
            self::ExtractingMetadata => 'Extracting metadata',
            self::GeneratingThumbnails => 'Generating thumbnails',
            self::Ready => 'Ready',
            self::Failed => 'Failed',
            self::Unsupported => 'Unsupported format',
        };
    }

    public function isProcessing(): bool
    {
        return in_array($this, [
            self::Queued,
            self::Validating,
            self::Converting,
            self::ExtractingMetadata,
            self::GeneratingThumbnails,
        ], true);
    }
}
