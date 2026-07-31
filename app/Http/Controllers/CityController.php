<?php

namespace App\Http\Controllers;

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
        $canViewFinance = $user && $this->permissions->allows($user, 'finance.settings.view');

        abort_unless(
            $user && ($this->permissions->allows($user, 'archive.view') || $canViewFinance),
            403
        );

        [$cities, $usedColors] = $this->cityData();

        return Inertia::render('Admin/Settings', [
            'cities' => $cities,
            'usedColors' => $usedColors,
            'canViewFinanceSettings' => $canViewFinance,
            'financeSettings' => $canViewFinance ? [
                'settings' => app(FinanceSettingsService::class)->allGrouped(),
                'routes' => [
                    'update' => route('finance.settings.update'),
                    'reset' => route('finance.settings.reset'),
                    'templates' => route('finance.templates.index'),
                    'finance' => route('finance.index'),
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

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeArchive($request, 'archive.update');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:cities,name'],
            'code' => ['required', 'string', 'max:8', 'unique:cities,code', 'uppercase'],
            'color' => ['required', 'string', 'max:9', 'regex:/^#[0-9A-Fa-f]{6}$/', 'unique:cities,color'],
            'is_active' => ['boolean'],
        ]);

        City::create($data);

        return redirect()->route($this->backRoute($request))->with('success', 'City created.');
    }

    public function update(Request $request, City $city): RedirectResponse
    {
        $this->authorizeArchive($request, 'archive.update');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:cities,name,' . $city->id],
            'code' => ['required', 'string', 'max:8', 'unique:cities,code,' . $city->id, 'uppercase'],
            'color' => ['required', 'string', 'max:9', 'regex:/^#[0-9A-Fa-f]{6}$/', 'unique:cities,color,' . $city->id],
            'is_active' => ['boolean'],
        ]);

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
