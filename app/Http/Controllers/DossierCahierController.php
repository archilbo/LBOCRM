<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpsertDossierCahierRequest;
use App\Models\Dossier;
use App\Services\Dossiers\DossierCahierService;
use Illuminate\Http\RedirectResponse;

class DossierCahierController extends Controller
{
    public function update(UpsertDossierCahierRequest $request, Dossier $dossier, DossierCahierService $service): RedirectResponse
    {
        $this->authorize('updateWorkflow', $dossier);
        $service->save($dossier, $request->user(), $request->validated());

        return back()->with('success', 'Cahier de chantier mis a jour.');
    }
}
