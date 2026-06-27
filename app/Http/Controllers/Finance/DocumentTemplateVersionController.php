<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentTemplateResource;
use App\Http\Resources\DocumentTemplateVersionResource;
use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateVersion;
use App\Services\Finance\DocumentTemplateVersionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTemplateVersionController extends Controller
{
    public function index(DocumentTemplate $documentTemplate): Response
    {
        $versions = DocumentTemplateVersion::query()
            ->with('creator')
            ->where('document_template_id', $documentTemplate->id)
            ->orderByDesc('version_number')
            ->get();

        return Inertia::render('Finance/Templates/Versions', [
            'template' => (new DocumentTemplateResource($documentTemplate))->resolve(),
            'versions' => DocumentTemplateVersionResource::collection($versions)->resolve(),
            'routes' => [
                'templates' => route('finance.templates.index', [
                    'type' => $documentTemplate->type,
                    'template' => $documentTemplate->id,
                ]),
                'snapshot' => route('finance.templates.versions.store', $documentTemplate),
            ],
        ]);
    }

    public function store(DocumentTemplate $documentTemplate, DocumentTemplateVersionService $versions): RedirectResponse
    {
        $versions->snapshot($documentTemplate, 'manual');

        return back()->with('success', 'Template snapshot created successfully.');
    }

    public function restore(
        DocumentTemplate $documentTemplate,
        DocumentTemplateVersion $version,
        DocumentTemplateVersionService $versions
    ): RedirectResponse {
        if ((int) $version->document_template_id !== (int) $documentTemplate->id) {
            abort(404);
        }

        $versions->restore($documentTemplate, $version);

        return redirect()
            ->route('finance.templates.index', [
                'type' => $documentTemplate->type,
                'template' => $documentTemplate->id,
            ])
            ->with('success', 'Template version restored successfully.');
    }

    public function destroy(DocumentTemplate $documentTemplate, DocumentTemplateVersion $version): RedirectResponse
    {
        if ((int) $version->document_template_id !== (int) $documentTemplate->id) {
            abort(404);
        }

        $version->delete();

        return back()->with('success', 'Template version deleted successfully.');
    }
}