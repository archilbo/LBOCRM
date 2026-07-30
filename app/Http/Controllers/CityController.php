<?php

namespace App\Http\Controllers;

use App\Models\City;
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

        return Inertia::render('Archives/Cities', [
            'cities' => $cities,
            'usedColors' => $usedColors,
        ]);
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

        return redirect()->route('archives.cities.index')->with('success', 'City created.');
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

        return redirect()->route('archives.cities.index')->with('success', 'City updated.');
    }

    public function destroy(Request $request, City $city): RedirectResponse
    {
        $this->authorizeArchive($request, 'archive.delete');
        if ($city->dossiers()->exists()) {
            return redirect()->route('archives.cities.index')->with('error', 'Cannot delete a city that has dossiers.');
        }

        $city->delete();

        return redirect()->route('archives.cities.index')->with('success', 'City deleted.');
    }

    private function authorizeArchive(Request $request, string $permission): void
    {
        abort_unless($request->user() && $this->permissions->allows($request->user(), $permission), 403);
    }
}
