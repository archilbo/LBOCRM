<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\UpsertCityRequest;
use App\Models\City;
use App\Services\Finance\FinanceSettingsService;
use App\Services\PermissionRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CityController extends Controller
{
    public function __construct(private readonly PermissionRegistry $permissions)
    {
    }

    public function index(Request $request): Response
    {
        $this->authorizeArchive($request, 'archive.view');
        [$cities, $usedColors] = $this->cityData();

        return Inertia::render('Archives/Cities', [
            'cities' => $cities,
            'usedColors' => $usedColors,
        ]);
    }

    public function settings(Request $request): Response
    {
        $user = $request->user();
        $canViewCities = $user && $this->permissions->allows($user, 'archive.view');
        $canManageCities = $user && $this->permissions->allows($user, 'archive.update');
        $canDeleteCities = $user && $this->permissions->allows($user, 'archive.delete');
        $canViewFinance = $user && $this->permissions->allows($user, 'finance.settings.view');
        $canManageFinance = $user && $this->permissions->allows($user, 'finance.settings.update');

        abort_unless(
            $user && ($canViewCities || $canViewFinance),
            403
        );

        [$cities, $usedColors] = $canViewCities ? $this->cityData() : [[], []];

        return Inertia::render('Admin/Settings', [
            'cities' => $cities,
            'usedColors' => $usedColors,
            'canViewCities' => $canViewCities,
            'canManageCities' => $canManageCities,
            'canDeleteCities' => $canDeleteCities,
            'canViewFinanceSettings' => $canViewFinance,
            'canManageFinanceSettings' => $canManageFinance,
            'financeSettings' => $canViewFinance ? [
                'settings' => app(FinanceSettingsService::class)->allGrouped(),
                'routes' => [
                    'update' => route('finance.settings.update'),
                    'uploadLogo' => route('finance.settings.logo.store'),
                    'deleteLogo' => route('finance.settings.logo.destroy'),
                ],
            ] : null,
        ]);
    }

    private function cityData(): array
    {
        $cities = City::query()
            ->withCount('dossiers')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'code' => $c->code,
                'color' => $c->color,
                'isActive' => $c->is_active,
                'dossiersCount' => $c->dossiers_count,
            ]);

        $usedColors = City::query()
            ->whereNotNull('color')
            ->pluck('color')
            ->toArray();

        return [$cities, $usedColors];
    }

    public function store(UpsertCityRequest $request): RedirectResponse
    {
        $this->authorizeArchive($request, 'archive.update');
        $data = $request->validated();

        City::create($data);

        return redirect()->route($this->backRoute($request))->with('success', 'City created.');
    }

    public function update(UpsertCityRequest $request, City $city): RedirectResponse
    {
        $this->authorizeArchive($request, 'archive.update');
        $data = $request->validated();

        if ($city->dossiers()->exists() && $data['code'] !== $city->code) {
            return back()->withErrors([
                'code' => 'Le code ne peut plus être modifié après la création de dossiers.',
            ]);
        }

        $city->update($data);

        return redirect()->route($this->backRoute($request))->with('success', 'City updated.');
    }

    public function destroy(Request $request, City $city): RedirectResponse
    {
        $this->authorizeArchive($request, 'archive.delete');
        if ($city->dossiers()->exists()) {
            return redirect()->route($this->backRoute($request))->with('error', 'Cannot delete a city that has dossiers.');
        }

        $city->delete();

        return redirect()->route($this->backRoute($request))->with('success', 'City deleted.');
    }

    private function backRoute(Request $request): string
    {
        return $request->routeIs('settings.*') ? 'settings.index' : 'archives.cities.index';
    }

    private function authorizeArchive(Request $request, string $permission): void
    {
        abort_unless($request->user() && $this->permissions->allows($request->user(), $permission), 403);
    }
}
