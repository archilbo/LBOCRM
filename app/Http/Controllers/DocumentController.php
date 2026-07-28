<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDossierDocumentRequest;
use App\Http\Requests\ReplaceDossierDocumentRequest;
use App\Http\Requests\UpdateDossierDocumentStatusRequest;
use App\Http\Resources\DossierDocumentResource;
use App\Models\Client;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\DossierWorkflowRequirement;
use App\Notifications\DocumentNotification;
use App\Services\Documents\DocumentGroupingService;
use App\Services\Documents\DossierDocumentFileService;
use App\Services\Dossiers\DossierPathBuilder;
use App\Services\CompanyContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    public function index(
        Request $request,
        DocumentGroupingService $documentGroupingService,
        CompanyContext $companyContext,
    ): Response
    {
        $this->authorize('viewAny', DossierDocument::class);
        $query = $this->scopedDocumentQuery($request, $companyContext);

        if ($dossierId = $request->input('dossier_id')) {
            $query->where('dossier_id', $dossierId);
        }

        $documents = $query->latest()->get();

        return Inertia::render('Documents/Index', [
            'documents' => DossierDocumentResource::collection($documents)->resolve(),
            'documentGroups' => $documentGroupingService->groups($request->user()),
            'clients' => $this->clientOptions($request, $companyContext),
            'dossiers' => $this->dossierOptions($request, $companyContext),
            'templates' => $this->templateOptions(),
            'metrics' => [
                'total' => (clone $query)->count(),
                'uploaded' => (clone $query)->whereIn('status', ['uploaded', 'verified'])->count(),
                'verified' => (clone $query)->where('status', 'verified')->count(),
                'missing' => (clone $query)->where('status', 'missing')->count(),
                'templates' => DocumentTemplate::where('is_active', true)->count(),
            ],
        ]);
    }

    public function store(StoreDossierDocumentRequest $request, CompanyContext $companyContext): RedirectResponse
    {
        $this->authorize('create', DossierDocument::class);
        $data = $request->validated();

        $dossier = $companyContext->applyTo(Dossier::query(), $request->user())
            ->with(['city', 'client'])
            ->findOrFail($data['dossier_id']);
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

        return $this->redirectToReturnPath($request, 'Document saved successfully.');
    }

    public function updateStatus(
        UpdateDossierDocumentStatusRequest $request,
        DossierDocument $dossierDocument
    ): RedirectResponse {
        $this->authorize('update', $dossierDocument);
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

    public function destroy(Request $request, DossierDocument $dossierDocument): RedirectResponse
    {
        $this->authorize('delete', $dossierDocument);
        $this->deleteStoredDocument($dossierDocument);

        $dossierDocument->delete();

        return $this->redirectToReturnPath($request, 'Document deleted successfully.');
    }

    public function replace(
        ReplaceDossierDocumentRequest $request,
        DossierDocument $dossierDocument,
        DossierPathBuilder $pathBuilder,
    ): RedirectResponse {
        $this->authorize('update', $dossierDocument);

        $dossierDocument->loadMissing(['dossier.city', 'dossier.client', 'template']);
        $dossier = $dossierDocument->dossier;
        abort_unless($dossier, 404, 'Le dossier du document est introuvable.');

        $file = $request->file('file');
        $relativePath = $pathBuilder->documentPath($dossier, $dossierDocument->template, $file->getClientOriginalName());
        $storedPath = $file->storeAs(dirname($relativePath), basename($relativePath), 'local');
        $previousPath = $dossierDocument->stored_path;
        $status = $request->string('status')->toString() ?: $dossierDocument->status;

        $dossierDocument->update([
            'original_filename' => $file->getClientOriginalName(),
            'stored_path' => $storedPath,
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
            'status' => $status,
            'notes' => $request->input('notes', $dossierDocument->notes),
            'uploaded_at' => now(),
            'verified_at' => $status === 'verified' ? now() : null,
        ]);

        if ($previousPath && $previousPath !== $storedPath) {
            $this->deleteStoredPath($previousPath);
        }

        $request->user()?->notify(new DocumentNotification(
            $dossierDocument->fresh(),
            'replaced',
            'Document replaced: '.$dossierDocument->original_filename,
        ));

        return $this->redirectToReturnPath($request, 'Document replaced successfully.');
    }

    public function download(DossierDocument $dossierDocument, DossierDocumentFileService $files): BinaryFileResponse
    {
        $this->authorize('download', $dossierDocument);

        return $files->response($dossierDocument);
    }

    public function view(DossierDocument $dossierDocument, DossierDocumentFileService $files): BinaryFileResponse
    {
        $this->authorize('view', $dossierDocument);
        abort_unless($files->canPreview($dossierDocument), 422, 'Ce format ne peut pas etre previsualise.');

        return $files->response($dossierDocument, true);
    }

    public function print(DossierDocument $dossierDocument, DossierDocumentFileService $files)
    {
        $this->authorize('view', $dossierDocument);
        abort_unless($files->canPreview($dossierDocument), 422, 'Ce format ne peut pas etre imprime depuis le navigateur.');

        $viewUrl = route('documents.view', $dossierDocument);
        $filename = e($dossierDocument->original_filename ?? 'Document');
        $isImage = str_starts_with((string) $dossierDocument->mime_type, 'image/');
        $content = $isImage
            ? '<img src="'.$viewUrl.'" alt="'.$filename.'">'
            : '<iframe src="'.$viewUrl.'" title="'.$filename.'"></iframe>';

        return response('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>'.$filename.'</title><style>html,body,iframe{width:100%;height:100%;margin:0;border:0}img{display:block;max-width:100%;margin:auto}</style></head><body>'.$content.'<script>window.addEventListener("load",()=>window.setTimeout(()=>window.print(),350));</script></body></html>')
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'private, no-store, max-age=0');
    }

    private function deleteStoredDocument(DossierDocument $dossierDocument): void
    {
        $this->deleteStoredPath($dossierDocument->stored_path);
    }

    private function redirectToReturnPath(Request $request, string $message): RedirectResponse
    {
        $returnTo = $request->input('return_to');

        if ($this->isSafeLocalReturnPath($returnTo)) {
            return redirect()->to($returnTo)->with('success', $message);
        }

        return redirect()->back()->with('success', $message);
    }

    private function isSafeLocalReturnPath(mixed $returnTo): bool
    {
        return is_string($returnTo)
            && str_starts_with($returnTo, '/')
            && ! str_starts_with($returnTo, '//')
            && parse_url($returnTo, PHP_URL_HOST) === null;
    }

    private function deleteStoredPath(?string $path): void
    {
        if (! $path) {
            return;
        }

        foreach (['local', 'public'] as $disk) {
            if (Storage::disk($disk)->exists($path)) {
                Storage::disk($disk)->delete($path);
                return;
            }
        }
    }

    private function dossierOptions(Request $request, CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Dossier::query(), $request->user())
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

    private function clientOptions(Request $request, CompanyContext $companyContext): array
    {
        return $companyContext->applyTo(Client::query(), $request->user())
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

    private function scopedDocumentQuery(Request $request, CompanyContext $companyContext): Builder
    {
        return DossierDocument::query()
            ->with(['dossier.client', 'template'])
            ->whereHas('dossier', fn (Builder $dossierQuery) => $companyContext->applyTo($dossierQuery, $request->user()));
    }
}
