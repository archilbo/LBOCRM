<?php

namespace App\Services\Cin;

use App\Exceptions\CinScanException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

final class GeminiCinExtractionService
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
You are an extraction engine for Moroccan national identity cards (CIN/CNIE).
You receive two images. The user may accidentally swap them.

Supported generations:

1) old_2008
- No MRZ.
- Recto normally contains bilingual Arabic/Latin surname and given names, date of birth, place of birth, expiry date, national identity number, portrait and secondary portrait.
- Verso normally contains the national identity number, expiry date, father and mother names/filiation, optional marital mention, domicile/address, civil-status act number and sex.
- A barcode may exist. Do not invent MRZ lines for this generation.

2) new_2020
- Recto normally contains bilingual surname and given names, date of birth, place of birth, national identity/personal number, expiry date, CAN and portraits.
- Verso normally contains national identity/personal number, civil-status number, father and mother names, address, sex, a separate document number and a three-line TD1 MRZ.
- The MRZ can independently confirm document number, personal/national number, birth date, sex, expiry date and Latin names.

Critical rules:
- Never guess identity data.
- If characters are not readable, return null or lower confidence.
- Do not silently replace O with 0, I with 1, B with 8, S with 5 or similar characters.
- Use Arabic text as corroborating evidence. Preserve Arabic in evidence, but return the Latin/French printed value when it is present.
- Preserve French accents and apostrophes in printed names and addresses.
- Return father_name and mother_name separately. Do not return a combined filiation string.
- Dates must be YYYY-MM-DD when certain. Otherwise return null.
- Return MRZ lines exactly as printed, using < filler characters, without spaces.
- Detect which image is recto and which image is verso.
- Verify that both images belong to the same physical identity card. Compare the repeated CIN/personal number, expiry date, person identity and card generation. Return same_card=false when they disagree or when this cannot be established reliably.
- Detect whether the card is old_2008, new_2020 or unknown.
- A confidence score is evidence confidence, not a promise of authenticity.
- Return JSON only and follow the response schema exactly.
PROMPT;

    public function extract(
        ProcessedCinImage $firstImage,
        ProcessedCinImage $secondImage,
        string $scanId,
    ): array {
        $apiKey = trim((string) config('services.gemini.key'));
        $model = trim((string) config(
            'services.gemini.cin.model',
            'gemini-3.6-flash'
        ));

        if ($apiKey === '' || $model === '') {
            throw CinScanException::configurationMissing();
        }

        $endpoint =
            'https://generativelanguage.googleapis.com/v1beta/interactions';

        $payload = [
            'model' => $model,
            'system_instruction' => self::SYSTEM_PROMPT,
            'input' => [
                [
                    'type' => 'text',
                    'text' => 'IMAGE A follows. It may be recto or verso.',
                ],
                $firstImage->providerPart(),
                [
                    'type' => 'text',
                    'text' => 'IMAGE B follows. It may be recto or verso.',
                ],
                $secondImage->providerPart(),
                [
                    'type' => 'text',
                    'text' => 'Extract the Moroccan CIN/CNIE fields, identify the generation and image sides, and return only schema-valid JSON.',
                ],
            ],
            'response_format' => [
                'type' => 'text',
                'mime_type' => 'application/json',
                'schema' => $this->responseSchema(),
            ],
            'generation_config' => [
                'thinking_level' => 'low',
                'max_output_tokens' => 4096,
                'seed' => 17,
            ],
            /*
             * Do not create a retrievable interaction history for identity
             * documents. Provider abuse-monitoring/ZDR rules still apply.
             */
            'store' => false,
            'background' => false,
        ];

        $timeout = max(15, (int) config('services.gemini.cin.timeout', 45));
        $retries = max(0, min(3, (int) config('services.gemini.cin.retries', 2)));
        $started = microtime(true);
        $response = null;

        for ($attempt = 0; $attempt <= $retries; $attempt++) {
            try {
                $response = Http::acceptJson()
                    ->asJson()
                    ->connectTimeout(10)
                    ->timeout($timeout)
                    ->withHeader('x-goog-api-key', $apiKey)
                    ->withoutVerifying()
                    ->post($endpoint, $payload);
            } catch (ConnectionException $exception) {
                if ($attempt >= $retries) {
                    Log::warning('CIN scanner provider connection failed', [
                        'scan_id' => $scanId,
                        'attempts' => $attempt + 1,
                        'duration_ms' => (int) round((microtime(true) - $started) * 1000),
                    ]);

                    throw CinScanException::providerTimeout($exception);
                }

                usleep(500_000 * ($attempt + 1));

                continue;
            } catch (Throwable $exception) {
                throw CinScanException::providerUnavailable($exception);
            }

            if ($response->successful()) {
                break;
            }

            // A quota response is account-wide, not a transient per-request
            // failure. Retrying immediately only spends more provider calls
            // and cannot make the next document succeed.
            if ($response->status() === 429) {
                break;
            }

            if ($response->serverError() && $attempt < $retries) {
                usleep(750_000 * ($attempt + 1));

                continue;
            }

            break;
        }

        if (! $response instanceof Response) {
            throw CinScanException::providerUnavailable();
        }

        Log::info('CIN scanner provider completed', [
            'scan_id' => $scanId,
            'status' => $response->status(),
            'duration_ms' => (int) round((microtime(true) - $started) * 1000),
            'model' => $model,
        ]);

        if ($response->status() === 429) {
            throw CinScanException::rateLimited();
        }

        if ($response->serverError()) {
            throw CinScanException::providerUnavailable();
        }

        if ($response->failed()) {
            Log::error('CIN scanner provider returned invalid response', [
                'scan_id' => $scanId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw CinScanException::invalidProviderResponse();
        }

        $body = $response->json();

        if (
            ! is_array($body)
            || ($body['status'] ?? null)
                !== 'completed'
        ) {
            throw CinScanException::invalidProviderResponse();
        }

        $text = collect($body['steps'] ?? [])
            ->where('type', 'model_output')
            ->flatMap(
                fn (array $step): array => is_array($step['content'] ?? null)
                        ? $step['content']
                        : []
            )
            ->first(
                fn (mixed $content): bool => is_array($content)
                    && ($content['type'] ?? null) === 'text'
                    && is_string($content['text'] ?? null)
            );
        $text = is_array($text)
            ? ($text['text'] ?? null)
            : null;

        if (! is_string($text) || trim($text) === '') {
            throw CinScanException::invalidProviderResponse();
        }

        $decoded = json_decode($text, true);

        if (! is_array($decoded)) {
            throw CinScanException::invalidProviderResponse();
        }

        return $decoded;
    }

    private function responseSchema(): array
    {
        $field = [
            'type' => 'object',
            'required' => ['value', 'confidence', 'source'],
            'properties' => [
                'value' => [
                    'type' => [
                        'string',
                        'null',
                    ],
                ],
                'confidence' => [
                    'type' => 'number',
                    'minimum' => 0,
                    'maximum' => 1,
                ],
                'source' => [
                    'type' => 'string',
                    'enum' => [
                        'front_printed',
                        'back_printed',
                        'mrz',
                        'barcode',
                        'arabic_crosscheck',
                        'multiple',
                        'unknown',
                    ],
                ],
                'evidence' => [
                    'type' => [
                        'string',
                        'null',
                    ],
                ],
            ],
        ];

        $fieldNames = [
            'cin_number',
            'document_number',
            'can_number',
            'first_name',
            'last_name',
            'birth_date',
            'birth_place',
            'expiry_date',
            'sex',
            'civil_status_number',
            'father_name',
            'mother_name',
            'address',
        ];

        return [
            'type' => 'object',
            'required' => ['document', 'fields', 'mrz', 'warnings'],
            'properties' => [
                'document' => [
                    'type' => 'object',
                    'required' => [
                        'generation',
                        'front_image_index',
                        'back_image_index',
                        'front_detected',
                        'back_detected',
                        'same_card',
                        'same_card_confidence',
                        'confidence',
                    ],
                    'properties' => [
                        'generation' => [
                            'type' => 'string',
                            'enum' => ['old_2008', 'new_2020', 'unknown'],
                        ],
                        'front_image_index' => [
                            'type' => 'integer',
                            'enum' => [1, 2],
                        ],
                        'back_image_index' => [
                            'type' => 'integer',
                            'enum' => [1, 2],
                        ],
                        'front_detected' => ['type' => 'boolean'],
                        'back_detected' => ['type' => 'boolean'],
                        'same_card' => ['type' => 'boolean'],
                        'same_card_confidence' => [
                            'type' => 'number',
                            'minimum' => 0,
                            'maximum' => 1,
                        ],
                        'confidence' => [
                            'type' => 'number',
                            'minimum' => 0,
                            'maximum' => 1,
                        ],
                    ],
                ],
                'fields' => [
                    'type' => 'object',
                    'required' => $fieldNames,
                    'properties' => array_fill_keys($fieldNames, $field),
                ],
                'mrz' => [
                    'type' => 'object',
                    'required' => ['detected', 'lines'],
                    'properties' => [
                        'detected' => ['type' => 'boolean'],
                        'lines' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                            'maxItems' => 3,
                        ],
                    ],
                ],
                'warnings' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
            ],
        ];
    }
}
