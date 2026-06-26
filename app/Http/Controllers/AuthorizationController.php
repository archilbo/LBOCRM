<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAuthorizationRequest;
use App\Http\Requests\UpdateAuthorizationRequest;
use App\Http\Requests\UpdateAuthorizationStatusRequest;
use App\Http\Resources\AuthorizationResource;
use App\Models\Authorization as ProjectAuthorization;
use App\Models\Dossier;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AuthorizationController extends Controller
{
    public function index(): Response
    {
        $authorizations = ProjectAuthorization::query()
            ->with(['dossier.client'])
            ->latest()
            ->get();

        return Inertia::render('Authorizations/Index', [
            'authorizations' => AuthorizationResource::collection($authorizations)->resolve(),
            'dossiers' => $this->dossierOptions(),
            'metrics' => [
                'total' => ProjectAuthorization::count(),
                'notStarted' => ProjectAuthorization::where('status', 'not_started')->count(),
                'submitted' => ProjectAuthorization::where('status', 'submitted')->count(),
                'approved' => ProjectAuthorization::where('status', 'approved')->count(),
                'received' => ProjectAuthorization::where('status', 'received')->count(),
                'observations' => ProjectAuthorization::where('status', 'observations')->count(),
            ],
        ]);
    }

    public function store(StoreAuthorizationRequest $request): RedirectResponse
    {
        ProjectAuthorization::create($this->prepareAuthorizationData($request->validated()));

        return redirect()
            ->route('authorizations.index')
            ->with('success', 'Authorization created successfully.');
    }

    public function update(UpdateAuthorizationRequest $request, ProjectAuthorization $authorization): RedirectResponse
    {
        $authorization->update($this->prepareAuthorizationData($request->validated()));

        return redirect()
            ->route('authorizations.index')
            ->with('success', 'Authorization updated successfully.');
    }

    public function updateStatus(
        UpdateAuthorizationStatusRequest $request,
        ProjectAuthorization $authorization
    ): RedirectResponse {
        $status = $request->validated('status');

        $payload = [
            'status' => $status,
        ];

        if ($status === 'submitted' && !$authorization->submitted_at) {
            $payload['submitted_at'] = now()->toDateString();
        }

        if ($status === 'approved' && !$authorization->approved_at) {
            $payload['approved_at'] = now()->toDateString();
        }

        if ($status === 'received' && !$authorization->received_at) {
            $payload['received_at'] = now()->toDateString();
        }

        $authorization->update($payload);

        return redirect()
            ->route('authorizations.index')
            ->with('success', 'Authorization status updated successfully.');
    }

    public function destroy(ProjectAuthorization $authorization): RedirectResponse
    {
        $authorization->delete();

        return redirect()
            ->route('authorizations.index')
            ->with('success', 'Authorization deleted successfully.');
    }

    private function prepareAuthorizationData(array $data): array
    {
        $observationsText = trim((string) ($data['observations_text'] ?? ''));

        unset($data['observations_text']);

        $data['status'] = $data['status'] ?? 'not_started';

        $data['observations'] = $observationsText !== ''
            ? collect(preg_split('/\r\n|\r|\n/', $observationsText))
                ->filter(fn ($line) => trim((string) $line) !== '')
                ->values()
                ->map(fn ($line) => [
                    'text' => trim((string) $line),
                    'created_at' => now()->toDateTimeString(),
                ])
                ->all()
            : null;

        if (($data['submitted_at'] ?? null) === '') {
            $data['submitted_at'] = null;
        }

        if (($data['approved_at'] ?? null) === '') {
            $data['approved_at'] = null;
        }

        if (($data['received_at'] ?? null) === '') {
            $data['received_at'] = null;
        }

        return $data;
    }

    private function dossierOptions(): array
    {
        return Dossier::query()
            ->with(['client', 'authorization'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ' - ' . $dossier->project_object . ' - ' . ($dossier->client?->full_name ?? '-'),
                'hasAuthorization' => $dossier->authorization !== null,
            ])
            ->values()
            ->all();
    }
}