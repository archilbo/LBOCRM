<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDossierDocumentRequest;
use App\Http\Requests\UpdateDossierDocumentStatusRequest;
use App\Http\Resources\DossierDocumentResource;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\DossierWorkflowRequirement;
use App\Notifications\DocumentNotification;
use App\Services\Documents\DocumentGroupingService;
use App\Services\Dossiers\DossierPathBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request, DocumentGroupingService $documentGroupingService): Response
    {
        $query = DossierDocument::query()
            ->with(['dossier.client', 'template']);

        if ($dossierId = $request->input('dossier_id')) {
            $query->where('dossier_id', $dossierId);
        }

        $documents = $query->latest()->get();

        return Inertia::render('Documents/Index', [
            'documents' => DossierDocumentResource::collection($documents)->resolve(),
            'documentGroups' => $documentGroupingService->groups(),
            'clients' => $this->clientOptions(),
            'dossiers' => $this->dossierOptions(),
            'templates' => $this->templateOptions(),
            'metrics' => [
                'total' => DossierDocument::count(),
                'uploaded' => DossierDocument::whereIn('status', ['uploaded', 'verified'])->count(),
                'verified' => DossierDocument::where('status', 'verified')->count(),
                'missing' => DossierDocument::where('status', 'missing')->count(),
                'templates' => DocumentTemplate::where('is_active', true)->count(),
            ],
        ]);
    }

    public function store(StoreDossierDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $dossier = Dossier::query()->with(['city', 'client'])->findOrFail($data['dossier_id']);
        $file = $request->file('file');

        $payload = [
            'dossier_id' => $dossier->id,
            'document_template_id' => $data['document_template_id'] ?? null,
            'status' => $data['status'] ?? ($file ? 'uploaded' : 'missing'),
            'notes' => $data['notes'] ?? null,
        ];

        if ($file) {
            $pathBuilder = app(DossierPathBuilder::class);
            $template = $data['document_template_id']
                ? DocumentTemplate::find($data['document_template_id'])
                : null;
            $relativePath = $pathBuilder->documentPath($dossier, $template, $file->getClientOriginalName());
            $storedPath = $file->storeAs(dirname($relativePath), basename($relativePath), 'local');

            $payload['document_number'] = $this->nextDocumentNumber();
            $payload['original_filename'] = $file->getClientOriginalName();
            $payload['stored_path'] = $storedPath;
            $payload['mime_type'] = $file->getClientMimeType();
            $payload['size_bytes'] = $file->getSize();
            $payload['uploaded_at'] = now();
        }

        $existing = null;

        if (!empty($payload['document_template_id'])) {
            $existing = DossierDocument::query()
                ->where('dossier_id', $dossier->id)
                ->where('document_template_id', $payload['document_template_id'])
                ->first();
        }

        if ($existing) {
            if ($file && $existing->stored_path) {
                $this->deleteStoredDocument($existing);
            }

            $existing->update($payload);
            if ($file) {
                $request->user()->notify(new DocumentNotification($existing->fresh(), 'uploaded', 'Document uploaded: ' . ($payload['original_filename'] ?? $existing->document_number)));
            }
        } else {
            $doc = DossierDocument::create($payload);
            if ($file) {
                $request->user()->notify(new DocumentNotification($doc, 'uploaded', 'Document uploaded: ' . ($payload['original_filename'] ?? $doc->document_number)));
            }
        }

        if ($file && $request->filled('workflow_step_key') && $request->filled('workflow_req_key')) {
            DossierWorkflowRequirement::updateOrCreate(
                [
                    'dossier_id' => $dossier->id,
                    'step_key' => $request->string('workflow_step_key')->toString(),
                    'requirement_key' => $request->string('workflow_req_key')->toString(),
                ],
                [
                    'is_done' => true,
                    'checked_at' => now(),
                    'checked_by' => $request->user()?->id,
                ]
            );
        }

        return redirect()
            ->back()
            ->with('success', 'Document saved successfully.');
    }

    public function updateStatus(
        UpdateDossierDocumentStatusRequest $request,
        DossierDocument $dossierDocument
    ): RedirectResponse {
        $data = $request->validated();

        $dossierDocument->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? $dossierDocument->notes,
            'verified_at' => $data['status'] === 'verified' ? now() : $dossierDocument->verified_at,
        ]);

        $request->user()->notify(new DocumentNotification($dossierDocument->fresh(), 'status_changed', 'Document status changed to: ' . $data['status']));

        return redirect()
            ->route('documents.index')
            ->with('success', 'Document status updated successfully.');
    }

    public function destroy(DossierDocument $dossierDocument): RedirectResponse
    {
        $this->deleteStoredDocument($dossierDocument);

        $dossierDocument->delete();

        return redirect()
            ->route('documents.index')
            ->with('success', 'Document deleted successfully.');
    }

    public function download(DossierDocument $dossierDocument): StreamedResponse|RedirectResponse
    {
        $disk = $this->storedDocumentDisk($dossierDocument);

        if (!$disk) {
            return redirect()
                ->route('documents.index')
                ->with('error', 'Document file not found.');
        }

        return Storage::disk($disk)->download(
            $dossierDocument->stored_path,
            $dossierDocument->original_filename ?? 'document'
        );
    }

    private function storedDocumentDisk(DossierDocument $dossierDocument): ?string
    {
        if (!$dossierDocument->stored_path) {
            return null;
        }

        if (Storage::disk('local')->exists($dossierDocument->stored_path)) {
            return 'local';
        }

        if (Storage::disk('public')->exists($dossierDocument->stored_path)) {
            return 'public';
        }

        return null;
    }

    private function deleteStoredDocument(DossierDocument $dossierDocument): void
    {
        $disk = $this->storedDocumentDisk($dossierDocument);

        if ($disk) {
            Storage::disk($disk)->delete($dossierDocument->stored_path);
        }
    }

    private function dossierOptions(): array
    {
        return Dossier::query()
            ->with('client')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ' - ' . $dossier->project_object . ' - ' . ($dossier->client?->full_name ?? '-'),
                'clientId' => (string) ($dossier->client_id ?? $dossier->client?->id ?? ''),
            ])
            ->values()
            ->all();
    }

    private function clientOptions(): array
    {
        return Client::query()
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'label' => $client->client_number . ' - ' . $client->full_name,
            ])
            ->values()
            ->all();
    }

    private function templateOptions(): array
    {
        return DocumentTemplate::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (DocumentTemplate $template) => [
                'id' => (string) $template->id,
                'label' => $template->name,
                'code' => $template->code,
                'documentType' => $template->document_type,
                'isRequired' => (bool) $template->is_required,
            ])
            ->values()
            ->all();
    }

    private function nextDocumentNumber(): string
    {
        $year = now()->format('Y');
        $next = DossierDocument::count() + 1;

        do {
            $number = sprintf('DOC-%s-%04d', $year, $next);
            $next++;
        } while (DossierDocument::where('document_number', $number)->exists());

        return $number;
    }
}
