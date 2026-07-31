<?php

namespace App\Services\Cin;

final readonly class ProcessedCinImage
{
    /**
     * @param array<int, string> $warnings
     */
    public function __construct(
        public string $bytes,
        public string $mimeType,
        public int $width,
        public int $height,
        public int $qualityScore,
        public bool $isReadable,
        public array $warnings,
        public string $sha256,
    ) {
    }

    public function providerPart(): array
    {
        return [
            'type' => 'image',
            'data' => base64_encode($this->bytes),
            'mime_type' => $this->mimeType,
            'resolution' => 'high',
        ];
    }

    public function qualityPayload(): array
    {
        return [
            'score' => $this->qualityScore,
            'isReadable' => $this->isReadable,
            'width' => $this->width,
            'height' => $this->height,
            'problems' => $this->warnings,
        ];
    }
}
