<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

/**
 * Storage lifecycle for system branding images (logo_light, logo_dark,
 * logo_compact, favicon).
 *
 * Files live under system/branding/ on the public disk with random names so
 * every upload busts the browser cache. Deletion is strictly guarded: only
 * relative paths inside system/branding/ can ever be removed, so a corrupted
 * database value can never escalate into arbitrary file deletion.
 */
class SystemBrandingAssetService
{
    /** Fixed asset-type allow-list mapped to system branding setting keys. */
    public const ASSET_TYPES = [
        'logo_light' => 'branding.logo_light',
        'logo_dark' => 'branding.logo_dark',
        'logo_compact' => 'branding.logo_compact',
        'favicon' => 'branding.favicon',
    ];

    private const STORAGE_DIRECTORY = 'system/branding';

    private const STORAGE_DISK = 'public';

    public function __construct(private readonly SystemSettingsService $systemSettings)
    {
    }

    public function settingKey(string $assetType): string
    {
        return self::ASSET_TYPES[$this->assertKnownType($assetType)];
    }

    /**
     * Current relative path for an asset type, or null when unset.
     */
    public function currentPath(string $assetType): ?string
    {
        $value = $this->systemSettings->get($this->settingKey($assetType));

        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    /**
     * Store the uploaded file under system/branding/ with a random name.
     *
     * The extension is derived from the detected MIME type (never from the
     * client-provided filename). Returns the new relative storage path.
     *
     * @throws RuntimeException when the underlying filesystem rejects the file
     */
    public function store(UploadedFile $file, string $assetType): string
    {
        $this->assertKnownType($assetType);

        $extension = strtolower($file->extension() ?: 'png');
        $prefix = str_replace('_', '-', $assetType);
        $name = $prefix.'-'.Str::uuid()->toString().'.'.$extension;

        $path = $file->storeAs(self::STORAGE_DIRECTORY, $name, self::STORAGE_DISK);

        if ($path === false) {
            throw new RuntimeException('Unable to store the branding asset.');
        }

        return $path;
    }

    /**
     * Best-effort deletion strictly limited to managed branding paths.
     *
     * Anything outside system/branding/ (traversal, absolute paths, URLs,
     * private/template/client/finance files) is logged and left untouched.
     */
    public function safeDelete(?string $path): void
    {
        if ($path === null || trim($path) === '') {
            return;
        }

        if (! $this->isManagedPath($path)) {
            Log::warning('System branding deletion skipped for a non-managed path.', ['path' => $path]);

            return;
        }

        Storage::disk(self::STORAGE_DISK)->delete($path);
    }

    private function isManagedPath(string $path): bool
    {
        return str_starts_with($path, self::STORAGE_DIRECTORY.'/')
            && ! str_contains($path, '..')
            && ! str_starts_with($path, '/')
            && preg_match('#^[a-z][a-z0-9+.\-]*://#i', $path) !== 1;
    }

    private function assertKnownType(string $assetType): string
    {
        if (! array_key_exists($assetType, self::ASSET_TYPES)) {
            throw new InvalidArgumentException("Unknown branding asset type '{$assetType}'.");
        }

        return $assetType;
    }
}
