<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateDossierWorkflowRequirementRequest;
use App\Models\Dossier;
use App\Services\Dossiers\DossierWorkflowRequirementService;
use Illuminate\Http\RedirectResponse;

class DossierWorkflowRequirementController extends Controller
{
    public function update(
        UpdateDossierWorkflowRequirementRequest $request,
        Dossier $dossier,
        DossierWorkflowRequirementService $service,
    ): RedirectResponse {
        $service->update($dossier, $request->validated());

        return back()->with('success', 'Workflow dossier mis a jour.');
    }
}
