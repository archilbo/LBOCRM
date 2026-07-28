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

        $returnTo = $request->validated('return_to');

        if (is_string($returnTo) && str_starts_with($returnTo, '/') && ! str_starts_with($returnTo, '//') && parse_url($returnTo, PHP_URL_HOST) === null) {
            return redirect()->to($returnTo)->with('success', 'Workflow dossier mis a jour.');
        }

        return back()->with('success', 'Workflow dossier mis a jour.');
    }
}
