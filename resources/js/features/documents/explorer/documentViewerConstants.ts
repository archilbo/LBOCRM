/**
 * Zoom / rotation limits shared by the dedicated preview viewers.
 *
 * Image viewer: fit-to-viewport or explicit 25%–400% zoom (25% steps),
 * rotation applied in 90° increments.
 * PDF viewer: fit width / fit page or explicit 50%–300% scale (25% steps),
 * rotation normalized to 0–359°.
 */
export const IMAGE_ZOOM_MIN = 0.25;
export const IMAGE_ZOOM_MAX = 4;
export const IMAGE_ZOOM_STEP = 0.25;

export const ROTATION_STEP = 90;

export const PDF_SCALE_MIN = 0.5;
export const PDF_SCALE_MAX = 3;
export const PDF_SCALE_STEP = 0.25;

/**
 * JSON is pretty-printed in the text viewer only when the loaded preview is
 * at or below this size; larger payloads stay untouched to keep rendering
 * cheap. The downloaded source is never modified.
 */
export const JSON_PRETTY_PRINT_MAX_BYTES = 512 * 1024;

/**
 * Clamps a value into [min, max]. Non-finite values (NaN, ±Infinity) fall
 * back to `min` so a corrupted state can never produce an invalid transform.
 */
export function clampZoom(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    return Math.min(max, Math.max(min, value));
}

/**
 * Snaps a zoom/scale value to the nearest multiple of `step` and clamps it
 * into [min, max]. Guards against NaN/Infinity input.
 */
export function snapZoom(value: number, step: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    return clampZoom(Math.round(value / step) * step, min, max);
}

/**
 * Normalizes a rotation to the 0–359° range (PDF page rotation). Image
 * rotation uses 90° increments but the same normalization keeps both sane.
 */
export function normalizeRotation(rotation: number): number {
    return ((rotation % 360) + 360) % 360;
}
