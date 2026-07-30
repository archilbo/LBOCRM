<?php

namespace App\Http\Controllers;

use App\Models\ArchiveRecord;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Services\CompanyContext;
use App\Services\PermissionRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class GlobalSearchController extends Controller
{
    public function index(Request $request, CompanyContext $companyContext, PermissionRegistry $permissions): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([
                'results' => [],
            ]);
        }

        $like = '%' . $query . '%';

        $user = $request->user();
        $results = collect()
            ->when($permissions->allows($user, 'clients.view'), fn ($results) => $results->merge($this->clients($like, $request, $companyContext)))
            ->when($permissions->allows($user, 'dossiers.view'), fn ($results) => $results->merge($this->dossiers($like, $request, $companyContext)))
            ->when($permissions->allows($user, 'documents.view'), fn ($results) => $results->merge($this->documents($like, $request, $companyContext)))
            ->when($permissions->allows($user, 'contracts.view'), fn ($results) => $results->merge($this->contracts($like, $request, $companyContext)))
            ->when($permissions->allows($user, 'finance.view'), fn ($results) => $results->merge($this->finance($like)))
            ->when($permissions->allows($user, 'archive.view'), fn ($results) => $results->merge($this->archives($like, $request, $companyContext)))
            ->take(18)
            ->values();

        return response()->json([
            'results' => $results,
        ]);
    }

    private function clients(string $like, Request $request, CompanyContext $companyContext): Collection
    {
        return $companyContext->applyTo(Client::query(), $request->user())
            ->where(function ($builder) use ($like) {
                $builder
                    ->where('client_number', 'like', $like)
                    ->orWhere('full_name', 'like', $like)
                    ->orWhere('cin', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('email', 'like', $like);
            })
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Client $client) => [
                'id' => 'client-' . $client->id,
                'type' => 'Client',
                'title' => $client->full_name,
                'subtitle' => $client->client_number . ' Â· ' . ($client->cin ?? 'No CIN'),
                'href' => '/clients/' . $client->id,
                'badge' => $client->status,
            ]);
    }

    private function dossiers(string $like, Request $request, CompanyContext $companyContext): Collection
    {
        return $companyContext->applyTo(Dossier::query(), $request->user())
            ->with('client')
            ->where(function ($builder) use ($like) {
                $builder
                    ->where('dossier_number', 'like', $like)
                    ->orWhere('project_object', 'like', $like)
                    ->orWhere('project_address', 'like', $like)
                    ->orWhere('commune', 'like', $like)
                    ->orWhere('province', 'like', $like)
                    ->orWhere('land_title_number', 'like', $like)
                    ->orWhereHas('client', function ($clientQuery) use ($like) {
                        $clientQuery
                            ->where('full_name', 'like', $like)
                            ->orWhere('client_number', 'like', $like)
                            ->orWhere('cin', 'like', $like);
                    });
            })
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => 'dossier-' . $dossier->id,
                'type' => 'Project',
                'title' => $dossier->project_object,
                'subtitle' => $dossier->dossier_number . ' Â· ' . ($dossier->client?->full_name ?? '-'),
                'href' => '/dossiers/' . $dossier->id,
                'badge' => $dossier->workflow_step,
            ]);
    }

    private function documents(string $like, Request $request, CompanyContext $companyContext): Collection
    {
        return DossierDocument::query()
            ->with(['dossier.client', 'template'])
            ->whereHas('dossier', fn ($query) => $companyContext->applyTo($query, $request->user()))
            ->where(function ($builder) use ($like) {
                $builder
                    ->where('document_number', 'like', $like)
                    ->orWhere('original_filename', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('template', function ($templateQuery) use ($like) {
                        $templateQuery
                            ->where('name', 'like', $like)
                            ->orWhere('code', 'like', $like);
                    })
                    ->orWhereHas('dossier', function ($dossierQuery) use ($like) {
                        $dossierQuery
                            ->where('dossier_number', 'like', $like)
                            ->orWhere('project_object', 'like', $like);
                    });
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (DossierDocument $document) => [
                'id' => 'document-' . $document->id,
                'type' => 'Document',
                'title' => $document->template?->name ?? $document->original_filename ?? 'Document',
                'subtitle' => ($document->dossier?->dossier_number ?? '-') . ' Â· ' . ($document->original_filename ?? 'No file'),
                'href' => '/documents',
                'badge' => $document->status,
            ]);
    }

    private function contracts(string $like, Request $request, CompanyContext $companyContext): Collection
    {
        return Contract::query()
            ->with(['dossier.client'])
            ->whereHas('dossier', fn ($query) => $companyContext->applyTo($query, $request->user()))
            ->where(function ($builder) use ($like) {
                $builder
                    ->where('contract_number', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('dossier', function ($dossierQuery) use ($like) {
                        $dossierQuery
                            ->where('dossier_number', 'like', $like)
                            ->orWhere('project_object', 'like', $like);
                    })
                    ->orWhereHas('dossier.client', function ($clientQuery) use ($like) {
                        $clientQuery
                            ->where('full_name', 'like', $like)
                            ->orWhere('cin', 'like', $like);
                    });
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Contract $contract) => [
                'id' => 'contract-' . $contract->id,
                'type' => 'Contract',
                'title' => $contract->contract_number,
                'subtitle' => ($contract->dossier?->dossier_number ?? '-') . ' Â· ' . ($contract->dossier?->client?->full_name ?? '-'),
                'href' => '/contracts',
                'badge' => $contract->status,
            ]);
    }

    private function finance(string $like): Collection
    {
        return FinanceDocument::query()
            ->with(['dossier', 'client'])
            ->where('company_id', auth()->user()->company_id)
            ->when(auth()->user()->branch_id, fn ($query, $branchId) => $query->where('branch_id', $branchId))
            ->where(function ($builder) use ($like) {
                $builder
                    ->where('number', 'like', $like)
                    ->orWhere('type', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('dossier', function ($dossierQuery) use ($like) {
                        $dossierQuery
                            ->where('dossier_number', 'like', $like)
                            ->orWhere('project_object', 'like', $like);
                    })
                    ->orWhereHas('client', function ($clientQuery) use ($like) {
                        $clientQuery
                            ->where('full_name', 'like', $like)
                            ->orWhere('cin', 'like', $like);
                    });
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (FinanceDocument $record) => [
                'id' => 'finance-' . $record->id,
                'type' => 'Finance',
                'title' => $record->number,
                'subtitle' => ($record->client?->full_name ?? '-') . ' Â· ' . number_format((float) $record->total_ttc, 0) . ' MAD',
                'href' => route('finance.documents.show', $record),
                'badge' => $record->status,
            ]);
    }

    private function archives(string $like, Request $request, CompanyContext $companyContext): Collection
    {
        return ArchiveRecord::query()
            ->with(['dossier.client'])
            ->whereHas('dossier', fn ($query) => $companyContext->applyTo($query, $request->user()))
            ->where(function ($builder) use ($like) {
                $builder
                    ->where('archive_number', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhere('room', 'like', $like)
                    ->orWhere('shelf', 'like', $like)
                    ->orWhere('box', 'like', $like)
                    ->orWhere('folder', 'like', $like)
                    ->orWhere('requested_by', 'like', $like)
                    ->orWhereHas('dossier', function ($dossierQuery) use ($like) {
                        $dossierQuery
                            ->where('dossier_number', 'like', $like)
                            ->orWhere('project_object', 'like', $like);
                    });
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (ArchiveRecord $record) => [
                'id' => 'archive-' . $record->id,
                'type' => 'Archive',
                'title' => $record->archive_number,
                'subtitle' => ($record->dossier?->dossier_number ?? '-') . ' Â· ' . collect([$record->room, $record->shelf, $record->box, $record->folder])->filter()->implode(' / '),
                'href' => '/archives',
                'badge' => $record->status,
            ]);
    }
}
