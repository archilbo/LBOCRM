<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSystemAppearanceRequest;
use App\Services\PermissionRegistry;
use App\Services\SystemSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemAppearanceController extends Controller
{
    public function __construct(
        private readonly SystemSettingsService $systemSettings,
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
}
