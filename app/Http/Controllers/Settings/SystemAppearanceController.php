<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\RemoveSystemBrandingAssetRequest;
use App\Http\Requests\Settings\UpdateSystemAppearanceColorRequest;
use App\Http\Requests\Settings\UpdateSystemAppearanceRequest;
use App\Http\Requests\Settings\UpdateSystemIdentityRequest;
use App\Http\Requests\Settings\UploadSystemBrandingAssetRequest;
use App\Services\PermissionRegistry;
use App\Services\SystemBrandingAssetService;
use App\Services\SystemSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemAppearanceController extends Controller
{
    public function __construct(
        private readonly SystemSettingsService $systemSettings,
        private readonly SystemBrandingAssetService $brandingAssets,
        private readonly PermissionRegistry $permissions,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user && $this->permissions->allows($user, 'system.settings.view'), 403);

        return Inertia::render('settings/system-appearance', [
            'branding' => $this->systemSettings->publicBrandingArray(),
            'permissions' => [
                'view' => $this->permissions->allows($user, 'system.settings.view'),
                'update' => $this->permissions->allows($user, 'system.settings.update'),
                'branding_update' => $this->permissions->allows($user, 'system.branding.update'),
            ],
        ]);
    }

    public function update(UpdateSystemAppearanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->systemSettings->setMany([
            'app.name' => $validated['app_name'],
            'app.short_name' => $validated['short_name'],
            'app.description' => $validated['description'],
            'branding.accent_color' => $validated['accent_color'],
        ], $request->user());

        // setMany() clears the branding cache after the transaction commits.

        return back()->with('success', 'Les paramètres système ont été mis à jour.');
    }

    public function updateIdentity(UpdateSystemIdentityRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->systemSettings->setMany([
            'app.name' => $validated['app_name'],
            'app.short_name' => $validated['short_name'],
            'app.description' => $validated['description'],
        ], $request->user());

        // setMany() clears the branding cache after the transaction commits.

        return back()->with('success', 'Les paramètres système ont été mis à jour.');
    }

    public function updateAppearance(UpdateSystemAppearanceColorRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->systemSettings->setMany([
            'branding.accent_color' => $validated['accent_color'],
        ], $request->user());

        // setMany() clears the branding cache after the transaction commits.

        return back()->with('success', 'Les paramètres système ont été mis à jour.');
    }

    public function uploadAsset(UploadSystemBrandingAssetRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $assetType = $validated['asset_type'];

        // Persist the new file first so a failed write never leaves a broken
        // reference. Only after the database commit is the old file removed.
        $newPath = $this->brandingAssets->store($request->file('file'), $assetType);
        $oldPath = $this->brandingAssets->currentPath($assetType);

        try {
            $this->systemSettings->setMany([
                $this->brandingAssets->settingKey($assetType) => $newPath,
            ], $request->user());
        } catch (\Throwable $exception) {
            // Never keep an orphaned file when persistence fails.
            $this->brandingAssets->safeDelete($newPath);

            throw $exception;
        }

        $this->brandingAssets->safeDelete($oldPath);

        return back()->with('success', 'L’image de marque a été mise à jour.');
    }

    public function removeAsset(RemoveSystemBrandingAssetRequest $request): RedirectResponse
    {
        $assetType = $request->validated()['asset_type'];

        // Always clear the stored value first so the setting can never point
        // at a missing file; deletion is best-effort cleanup after the commit.
        $oldPath = $this->brandingAssets->currentPath($assetType);

        $this->systemSettings->setMany([
            $this->brandingAssets->settingKey($assetType) => null,
        ], $request->user());

        $this->brandingAssets->safeDelete($oldPath);

        return back()->with('success', 'L’image de marque a été supprimée.');
    }
}
