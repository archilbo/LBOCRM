<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIntermediaryRequest;
use App\Http\Requests\UpdateIntermediaryRequest;
use App\Http\Resources\IntermediaryResource;
use App\Models\Intermediary;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IntermediaryController extends Controller
{
    public function index(): Response
    {
        $intermediaries = Intermediary::query()
            ->withCount('clients')
            ->latest()
            ->get();

        return Inertia::render('Intermediaries/Index', [
            'intermediaries' => IntermediaryResource::collection($intermediaries)->resolve(),
            'metrics' => [
                'total' => Intermediary::count(),
                'active' => Intermediary::where('is_active', true)->count(),
                'inactive' => Intermediary::where('is_active', false)->count(),
                'linkedClients' => Intermediary::query()->withCount('clients')->get()->sum('clients_count'),
            ],
        ]);
    }

    public function store(StoreIntermediaryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['code'] = $this->nextIntermediaryCode();
        $data['type'] = $data['type'] ?? 'person';
        $data['is_active'] = $data['is_active'] ?? true;

        Intermediary::create($data);

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary created successfully.');
    }

    public function update(UpdateIntermediaryRequest $request, Intermediary $intermediary): RedirectResponse
    {
        $data = $request->validated();
        $data['type'] = $data['type'] ?? 'person';
        $data['is_active'] = $data['is_active'] ?? false;

        $intermediary->update($data);

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary updated successfully.');
    }

    public function destroy(Intermediary $intermediary): RedirectResponse
    {
        $intermediary->delete();

        return redirect()
            ->route('intermediaries.index')
            ->with('success', 'Intermediary deleted successfully.');
    }

    private function nextIntermediaryCode(): string
    {
        $year = now()->format('Y');
        $next = Intermediary::count() + 1;

        do {
            $code = sprintf('INT-%s-%04d', $year, $next);
            $next++;
        } while (Intermediary::where('code', $code)->exists());

        return $code;
    }
}
