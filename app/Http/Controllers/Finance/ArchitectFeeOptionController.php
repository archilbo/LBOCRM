<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ArchitectFeeOptionRequest;
use App\Models\ArchitectFeeOption;
use App\Services\ArchitectFeeOptionService;
use App\Services\PermissionRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ArchitectFeeOptionController extends Controller
{
    public function store(ArchitectFeeOptionRequest $request, ArchitectFeeOptionService $service): RedirectResponse
    {
        $service->save($request->validated());

        return $this->redirectBack()->with('success', 'Taux architecte ajouté avec succès.');
    }

    public function update(ArchitectFeeOptionRequest $request, ArchitectFeeOption $architectFeeOption, ArchitectFeeOptionService $service): RedirectResponse
    {
        $service->save($request->validated(), $architectFeeOption);

        return $this->redirectBack()->with('success', 'Taux architecte modifié avec succès.');
    }

    public function setDefault(Request $request, ArchitectFeeOption $architectFeeOption, ArchitectFeeOptionService $service): RedirectResponse
    {
        abort_unless(app(PermissionRegistry::class)->allows($request->user(), 'finance.settings.update'), 403);

        $service->save([
            ...$architectFeeOption->only(['name', 'calculation_type', 'percentage_rate', 'contract_template_key', 'sort_order']),
            'is_default' => true,
            'is_active' => true,
        ], $architectFeeOption);

        return $this->redirectBack()->with('success', 'Taux architecte défini par défaut.');
    }

    public function deactivate(Request $request, ArchitectFeeOption $architectFeeOption, ArchitectFeeOptionService $service): RedirectResponse
    {
        abort_unless(app(PermissionRegistry::class)->allows($request->user(), 'finance.settings.update'), 403);

        $service->save([
            ...$architectFeeOption->only(['name', 'calculation_type', 'percentage_rate', 'contract_template_key', 'sort_order']),
            'is_default' => false,
            'is_active' => false,
        ], $architectFeeOption);

        return $this->redirectBack()->with('success', 'Taux architecte désactivé.');
    }

    private function redirectBack(): RedirectResponse
    {
        return redirect()->back(302, [], route('settings.index', ['tab' => 'finance']));
    }
}
