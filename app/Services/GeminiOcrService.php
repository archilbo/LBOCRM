<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GeminiOcrService
{
    private const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    private const SYSTEM_PROMPT = <<<'PROMPT'
You are a specialized Moroccan CIN card extraction API. Your only job is to extract identity information from CIN card images, even from bad-quality photos.

Critical rules — follow them strictly:
- Extract ALL text in French only. Ignore Arabic text completely.
- Normalize all dates to YYYY-MM-DD format.
- The MRZ (Machine Readable Zone — the 3 lines of text at the bottom filled with '<' characters) is your ABSOLUTE SOURCE OF TRUTH. Cross-reference every field against it. The MRZ rarely lies — trust it over blurry printed text.
- The CIN number format is one uppercase letter followed by 6 or 7 digits (e.g., U1234567, BK123456).
- CAN number is always 6 digits.
- Be AGGRESSIVE in correcting OCR typos: shadows often turn 'U' into '0' or 'O', 'B' into '8', '1' into 'I' or 'l', 'S' into '5'. Use the MRZ to disambiguate.
- If the image is blurry, shadowed, tilted, or has glare, still do your best. Make reasonable inferences from partial characters. Use the MRZ to fill in gaps.
- If a field is completely unreadable even with MRZ cross-reference, set it to null.
- Return ONLY valid JSON. No markdown, no code fences, no explanation.
PROMPT;

    public function extractBoth(string $frontPath, string $backPath): array
    {
        try {
            $frontProcessed = $this->prepareImage($frontPath);
            $backProcessed = $this->prepareImage($backPath);

            $payload = [
                'systemInstruction' => [
                    'parts' => [
                        ['text' => self::SYSTEM_PROMPT],
                    ],
                ],
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inlineData' => [
                                    'mimeType' => 'image/jpeg',
                                    'data' => base64_encode($frontProcessed),
                                ],
                            ],
                            [
                                'inlineData' => [
                                    'mimeType' => 'image/jpeg',
                                    'data' => base64_encode($backProcessed),
                                ],
                            ],
                            [
                                'text' => 'Extract all visible information from this Moroccan CIN card. First image = FRONT (recto): photo, CIN number, full name, date of birth, place of birth, expiry date, CAN number. Second image = BACK (verso): sex, civil status number, filiation/parentage, address. Return JSON now.',
                            ],
                        ],
                    ],
                ],
                'safetySettings' => [
                    ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                    ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_ONLY_HIGH'],
                    ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                    ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'topP' => 0.95,
                    'responseMimeType' => 'application/json',
                    'responseSchema' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'recto' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'cin_number' => ['type' => 'STRING'],
                                    'last_name' => ['type' => 'STRING'],
                                    'first_name' => ['type' => 'STRING'],
                                    'date_of_birth' => ['type' => 'STRING'],
                                    'place_of_birth' => ['type' => 'STRING'],
                                    'expiry_date' => ['type' => 'STRING'],
                                    'can_number' => ['type' => 'STRING'],
                                ],
                            ],
                            'verso' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'sex' => ['type' => 'STRING'],
                                    'civil_status_number' => ['type' => 'STRING'],
                                    'filiation' => ['type' => 'STRING'],
                                    'address' => ['type' => 'STRING'],
                                ],
                            ],
                        ],
                    ],
                ],
            ];

            $response = Http::timeout(60)
                ->retry(2, 1000, function (Throwable $e) {
                    return $e instanceof RequestException && $e->response->status() === 429;
                })
                ->withHeader('x-goog-api-key', config('services.gemini.key'))
                ->post(self::API_URL, $payload);

            if ($response->failed()) {
                Log::error('Gemini OCR API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->emptyResult();
            }

            $body = $response->json();

            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if ($text === null) {
                Log::warning('Gemini OCR returned empty or blocked response', [
                    'full_response' => $response->body(),
                    'finish_reason' => $body['candidates'][0]['finishReason'] ?? 'UNKNOWN',
                ]);

                return $this->emptyResult();
            }

            $decoded = json_decode($text, true);

            if (!is_array($decoded)) {
                Log::warning('Gemini OCR returned invalid JSON', [
                    'raw' => substr($text, 0, 500),
                ]);

                return $this->emptyResult();
            }

            return $this->normalize($decoded);
        } catch (Throwable $e) {
            Log::error('Gemini OCR service exception', [
                'message' => $e->getMessage(),
            ]);

            return $this->emptyResult();
        }
    }

    public function extract(string $imagePath): array
    {
        try {
            $processed = $this->prepareImage($imagePath);

            $payload = [
                'systemInstruction' => [
                    'parts' => [
                        ['text' => self::SYSTEM_PROMPT],
                    ],
                ],
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inlineData' => [
                                    'mimeType' => 'image/jpeg',
                                    'data' => base64_encode($processed),
                                ],
                            ],
                            [
                                'text' => 'Extract all visible information from this Moroccan CIN card image. Return JSON only.',
                            ],
                        ],
                    ],
                ],
                'safetySettings' => [
                    ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                    ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_ONLY_HIGH'],
                    ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                    ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                    'topP' => 0.95,
                    'responseMimeType' => 'application/json',
                    'responseSchema' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'recto' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'cin_number' => ['type' => 'STRING'],
                                    'last_name' => ['type' => 'STRING'],
                                    'first_name' => ['type' => 'STRING'],
                                    'date_of_birth' => ['type' => 'STRING'],
                                    'place_of_birth' => ['type' => 'STRING'],
                                    'expiry_date' => ['type' => 'STRING'],
                                    'can_number' => ['type' => 'STRING'],
                                ],
                            ],
                            'verso' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'sex' => ['type' => 'STRING'],
                                    'civil_status_number' => ['type' => 'STRING'],
                                    'filiation' => ['type' => 'STRING'],
                                    'address' => ['type' => 'STRING'],
                                ],
                            ],
                        ],
                    ],
                ],
            ];

            $response = Http::timeout(60)
                ->retry(2, 1000, function (Throwable $e) {
                    return $e instanceof RequestException && $e->response->status() === 429;
                })
                ->withHeader('x-goog-api-key', config('services.gemini.key'))
                ->post(self::API_URL, $payload);

            if ($response->failed()) {
                Log::error('Gemini OCR API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->emptyResult();
            }

            $body = $response->json();
            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if ($text === null) {
                Log::warning('Gemini OCR returned empty or blocked response', [
                    'full_response' => $response->body(),
                    'finish_reason' => $body['candidates'][0]['finishReason'] ?? 'UNKNOWN',
                ]);

                return $this->emptyResult();
            }

            $decoded = json_decode($text, true);

            if (!is_array($decoded)) {
                Log::warning('Gemini OCR returned invalid JSON', [
                    'raw' => substr($text, 0, 500),
                ]);

                return $this->emptyResult();
            }

            return $this->normalize($decoded);
        } catch (Throwable $e) {
            Log::error('Gemini OCR service exception', [
                'message' => $e->getMessage(),
            ]);

            return $this->emptyResult();
        }
    }

    public function wasSuccessful(array $result): bool
    {
        return $result['recto']['cin_number'] !== null
            || $result['recto']['first_name'] !== null
            || $result['verso']['address'] !== null;
    }

    private function prepareImage(string $path): string
    {
        if (!extension_loaded('gd')) {
            return file_get_contents($path);
        }

        try {
            $info = @getimagesize($path);
            if ($info === false) {
                return file_get_contents($path);
            }

            [$width, $height, $type] = $info;

            $src = match ($type) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
                IMAGETYPE_PNG => @imagecreatefrompng($path),
                IMAGETYPE_WEBP => @imagecreatefromwebp($path),
                default => null,
            };

            if ($src === false || $src === null) {
                return file_get_contents($path);
            }

            // Auto-orient based on EXIF
            if ($type === IMAGETYPE_JPEG) {
                $exif = @exif_read_data($path);
                if ($exif && isset($exif['Orientation'])) {
                    $src = $this->applyExifOrientation($src, (int) $exif['Orientation']);
                }
            }

            // Resize if longest side > 2048px (Gemini doesn't need huge images)
            $maxDim = 2048;
            if ($width > $maxDim || $height > $maxDim) {
                $ratio = min($maxDim / $width, $maxDim / $height);
                $newW = (int) round($width * $ratio);
                $newH = (int) round($height * $ratio);
                $resized = imagecreatetruecolor($newW, $newH);
                imagecopyresampled($resized, $src, 0, 0, 0, 0, $newW, $newH, $width, $height);
                imagedestroy($src);
                $src = $resized;
                $width = $newW;
                $height = $newH;
            }

            // Mild sharpen via contrast adjustment
            imagefilter($src, IMG_FILTER_CONTRAST, -5);

            // Output to buffer
            ob_start();
            imagejpeg($src, null, 90);
            $data = ob_get_clean();
            imagedestroy($src);

            return $data !== false ? $data : file_get_contents($path);
        } catch (Throwable $e) {
            Log::warning('Image pre-processing failed, falling back to raw', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return file_get_contents($path);
        }
    }

    private function applyExifOrientation($image, int $orientation)
    {
        return match ($orientation) {
            3 => imagerotate($image, 180, 0) ?: $image,
            6 => imagerotate($image, -90, 0) ?: $image,
            8 => imagerotate($image, 90, 0) ?: $image,
            default => $image,
        };
    }

    private function normalize(array $data): array
    {
        $recto = $data['recto'] ?? [];
        $verso = $data['verso'] ?? [];

        return [
            'document_type' => 'Moroccan CIN',
            'recto' => [
                'cin_number' => $this->nullIfEmpty($recto['cin_number'] ?? null),
                'last_name' => $this->nullIfEmpty($recto['last_name'] ?? null),
                'first_name' => $this->nullIfEmpty($recto['first_name'] ?? null),
                'date_of_birth' => $this->validateDate($recto['date_of_birth'] ?? null),
                'place_of_birth' => $this->nullIfEmpty($recto['place_of_birth'] ?? null),
                'expiry_date' => $this->validateDate($recto['expiry_date'] ?? null),
                'can_number' => $this->nullIfEmpty($recto['can_number'] ?? null),
            ],
            'verso' => [
                'sex' => $this->validateSex($verso['sex'] ?? null),
                'civil_status_number' => $this->nullIfEmpty($verso['civil_status_number'] ?? null),
                'filiation' => $this->nullIfEmpty($verso['filiation'] ?? null),
                'address' => $this->nullIfEmpty($verso['address'] ?? null),
            ],
        ];
    }

    private function nullIfEmpty(mixed $value): ?string
    {
        if ($value === null || $value === '' || $value === 'null') {
            return null;
        }

        return trim((string) $value);
    }

    private function validateDate(mixed $value): ?string
    {
        $value = $this->nullIfEmpty($value);

        if ($value === null) {
            return null;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            $parts = explode('-', $value);
            if (checkdate((int) $parts[1], (int) $parts[2], (int) $parts[0])) {
                return $value;
            }
        }

        $parsed = date_parse($value);
        if ($parsed['error_count'] === 0 && checkdate($parsed['month'], $parsed['day'], $parsed['year'])) {
            return sprintf('%04d-%02d-%02d', $parsed['year'], $parsed['month'], $parsed['day']);
        }

        return null;
    }

    private function validateSex(mixed $value): ?string
    {
        $value = $this->nullIfEmpty($value);

        if ($value === null) {
            return null;
        }

        $upper = strtoupper($value);

        if (in_array($upper, ['M', 'F'], true)) {
            return $upper;
        }

        if (in_array($upper, ['MASCULIN', 'HOMME', 'MALE', 'H'], true)) {
            return 'M';
        }

        if (in_array($upper, ['FEMININ', 'FÉMININ', 'FEMME', 'FEMALE'], true)) {
            return 'F';
        }

        return null;
    }

    private function emptyResult(): array
    {
        return [
            'document_type' => 'Moroccan CIN',
            'recto' => [
                'cin_number' => null,
                'last_name' => null,
                'first_name' => null,
                'date_of_birth' => null,
                'place_of_birth' => null,
                'expiry_date' => null,
                'can_number' => null,
            ],
            'verso' => [
                'sex' => null,
                'civil_status_number' => null,
                'filiation' => null,
                'address' => null,
            ],
        ];
    }
}
