# CIN OCR Testing Guide

## 1. Prerequisites

```bash
# Ensure your GEMINI_API_KEY is set in .env
grep GEMINI_API_KEY .env

# Clear config cache after any .env change
php artisan config:clear
```

## 2. Backend Testing (cURL)

### 2.1 Single-image scan (POST /api/ocr/scan)

```bash
curl -X POST https://your-app.test/api/ocr/scan \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -F "image=@/path/to/cin-front.jpg" \
  -F "side=recto"
```

Expected success response (200):

```json
{
  "success": true,
  "data": {
    "document_type": "Moroccan CIN",
    "recto": {
      "cin_number": "U1234567",
      "last_name": "EL ALAMI",
      "first_name": "Mohamed",
      "date_of_birth": "1985-06-15",
      "place_of_birth": "OUARZAZATE",
      "expiry_date": "2030-12-31",
      "can_number": "123456"
    },
    "verso": {
      "sex": null,
      "civil_status_number": null,
      "filiation": null,
      "address": null
    }
  }
}
```

Expected error response (422):

```json
{
  "message": "The image field is required.",
  "errors": {
    "image": ["The image field is required."]
  }
}
```

### 2.2 Dual-image scan (POST /clients/scan-cin)

```bash
curl -X POST https://your-app.test/clients/scan-cin \
  -H "Accept: application/json" \
  -H "X-CSRF-TOKEN: YOUR_CSRF_TOKEN" \
  -F "front_image=@/path/to/cin-front.jpg" \
  -F "back_image=@/path/to/cin-back.jpg"
```

Expected response — same structure with `recto` and `verso` fully populated.

### 2.3 Test with a bad file

```bash
curl -X POST https://your-app.test/api/ocr/scan \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -F "image=@/path/to/corrupted.jpg"
```

Expected — JSON with `success: false` and all field values `null`.

### 2.4 Size limit test

```bash
# Create a dummy 6MB file
dd if=/dev/urandom of=large.jpg bs=1M count=6
curl -X POST https://your-app.test/api/ocr/scan \
  -F "image=@large.jpg" \
  -F "side=recto"
```

Expected — 422 validation error, "The image must not be greater than 5120 kilobytes."

## 3. Frontend Testing (React Component)

### 3.1 Import the component

```tsx
import { CinScanner } from '@/components/CinScanner';

function MyPage() {
  return (
    <CinScanner
      scanEndpoint="/api/ocr/scan"
      onComplete={(data) => console.log('Extracted CIN data:', data)}
    />
  );
}
```

### 3.2 Mock data for offline rendering

The `CinScanner` component includes a fallback `mockResult` object in its source code. When the API is unavailable and `result` is `null`, the verification form renders with mock data so you can verify the layout and field mapping:

```ts
const mockResult: CinScanResult = {
  document_type: 'Moroccan CIN',
  recto: {
    cin_number: 'U1234567',
    last_name: 'EL ALAMI',
    first_name: 'Mohamed',
    date_of_birth: '1985-06-15',
    place_of_birth: 'OUARZAZATE',
    expiry_date: '2030-12-31',
    can_number: '123456',
  },
  verso: {
    sex: 'M',
    civil_status_number: '1234/5678/1983',
    filiation: 'fils de Ahmed et Fatima',
    address: '12, Avenue Mohammed V, Ouarzazate',
  },
};
```

To force the component into "result" mode without calling the API, you can temporarily override the state in the component source.

### 3.3 Camera mode flow

1. Click "Use Camera" on the select screen.
2. Grant camera permission when prompted.
3. Align the CIN within the yellow rectangular frame overlay.
4. Tap "Capture" — the frame is frozen and a preview appears.
5. Tap "Analyze CIN" — loading spinner appears.
6. On success, the verification form displays with extracted data.

### 3.4 Upload mode flow

1. Click "Upload Image" on the select screen.
2. Select a CIN image from your device.
3. The preview appears in a drop zone.
4. Tap "Analyze CIN".
5. On success, the verification form displays.
6. Edit any incorrect fields, then tap "Confirm & Use".

## 4. Error Handling Scenarios

| Scenario | Expected Behavior |
|---|---|
| Camera permission denied | Auto-falls back to upload mode with explanatory message |
| File > 5 MB | Rejected immediately with "Image must be under 5 MB" |
| Non-image file selected | "Please select a valid image file" |
| API returns 500 or timeout | "Could not read the CIN image. Please try again with a clearer photo." |
| Network offline | "Network error. Please check your connection and try again." |
| Gemini rate limit (429) | Service retries twice with 1s delay, then returns empty result |

## 5. Verification Checklist

- [ ] `POST /api/ocr/scan` returns 200 with `success: true` for a valid CIN image
- [ ] `POST /api/ocr/scan` returns `success: false` with null fields for a blurry/unreadable image
- [ ] `POST /api/ocr/scan` returns 422 for missing/invalid image
- [ ] `POST /api/ocr/scan` returns 422 for image > 5 MB
- [ ] All 11 fields (7 recto + 4 verso) are present in the response
- [ ] Dates are always in `YYYY-MM-DD` format
- [ ] `sex` field is strictly `M` or `F` or `null`
- [ ] Arabic text is absent from all extracted fields
- [ ] Camera captures and submits correctly
- [ ] File upload with drag-and-drop works
- [ ] Verification form pre-fills all fields from API response
- [ ] "Confirm & Use" fires `onComplete` callback with correct data
- [ ] "Rescan" resets back to mode selection
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `php -l` passes for all new PHP files

## 6. Troubleshooting

| Problem | Check |
|---|---|
| Gemini returns empty | Verify `GEMINI_API_KEY` in `.env` and run `php artisan config:clear` |
| 401 from /api/ocr/* | Ensure the request includes an auth token or valid session |
| CORS errors in browser | Verify `config/cors.php` allows your frontend origin |
| Camera not starting | Test on HTTPS or localhost (HTTP blocks getUserMedia) |
| Build fails | Run `npm run build` and check for TypeScript type errors |
