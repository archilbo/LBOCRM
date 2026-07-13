<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiOcrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CinOcrController extends Controller
{
    public function scan(Request $request, GeminiOcrService $ocrService): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        try {
            $result = $ocrService->extract(
                $validated['image']->getRealPath(),
            );

            return response()->json([
                'success' => $ocrService->wasSuccessful($result),
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'data' => [
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
                ],
                'error' => 'OCR processing failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function scanCin(Request $request, GeminiOcrService $ocrService): JsonResponse
    {
        $validated = $request->validate([
            'front_image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'back_image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $result = $ocrService->extractBoth(
            $validated['front_image']->getRealPath(),
            $validated['back_image']->getRealPath(),
        );

        return response()->json($result);
    }
}
