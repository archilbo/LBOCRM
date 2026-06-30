<?php

namespace App\Http\Controllers;

use App\Models\ArchiveRecord;
use App\Models\Authorization;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceRecord;
use App\Models\Intermediary;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $financeTotal = (float) FinanceRecord::sum('total_ttc');
        $financePaid = (float) FinanceRecord::sum('paid');
        $financeRemaining = (float) FinanceRecord::sum('remaining');

        return Inertia::render('Dashboard', [
            'metrics' => [
                'clients' => Client::count(),
                'intermediaries' => Intermediary::count(),
                'dossiers' => Dossier::count(),
                'activeDossiers' => Dossier::whereIn('status', ['opened', 'active'])->count(),
                'documents' => DossierDocument::count(),
                'verifiedDocuments' => DossierDocument::where('status', 'verified')->count(),
                'contracts' => Contract::count(),
                'generatedContracts' => Contract::whereIn('status', ['generated', 'signed'])->count(),
                'authorizations' => Authorization::count(),
                'submittedAuthorizations' => Authorization::whereIn('status', ['submitted', 'approved', 'received'])->count(),
                'financeRecords' => FinanceRecord::count(),
                'financeTotal' => $financeTotal,
                'financePaid' => $financePaid,
                'financeRemaining' => $financeRemaining,
                'archives' => ArchiveRecord::count(),
                'storedArchives' => ArchiveRecord::whereIn('status', ['stored', 'checked_out', 'returned'])->count(),
            ],
            'workflow' => [
                [
                    'key' => 'clients',
                    'label' => 'Clients',
                    'count' => Client::count(),
                    'href' => '/clients',
                    'description' => 'Client identities and contact files',
                ],
                [
                    'key' => 'dossiers',
                    'label' => 'Projects',
                    'count' => Dossier::count(),
                    'href' => '/dossiers',
                    'description' => 'Architecture project dossiers',
                ],
                [
                    'key' => 'documents',
                    'label' => 'Documents',
                    'count' => DossierDocument::count(),
                    'href' => '/documents',
                    'description' => 'Required and uploaded files',
                ],
                [
                    'key' => 'contracts',
                    'label' => 'Contracts',
                    'count' => Contract::count(),
                    'href' => '/contracts',
                    'description' => 'Contract calculations and generation',
                ],
                [
                    'key' => 'authorizations',
                    'label' => 'Authorizations',
                    'count' => Authorization::count(),
                    'href' => '/authorizations',
                    'description' => 'Administrative follow-up',
                ],
                [
                    'key' => 'finance',
                    'label' => 'Finance',
                    'count' => FinanceRecord::count(),
                    'href' => '/finance',
                    'description' => 'Devis, invoices, payments',
                ],
                [
                    'key' => 'archives',
                    'label' => 'Archives',
                    'count' => ArchiveRecord::count(),
                    'href' => '/archives',
                    'description' => 'Physical archive tracking',
                ],
            ],
            'latestDossiers' => Dossier::query()
                ->with('client')
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (Dossier $dossier) => [
                    'id' => $dossier->id,
                    'dossierNumber' => $dossier->dossier_number,
                    'projectObject' => $dossier->project_object,
                    'clientName' => $dossier->client?->full_name ?? '-',
                    'status' => $dossier->status,
                    'workflowStep' => $dossier->workflow_step,
                    'updatedAt' => optional($dossier->updated_at)->diffForHumans(),
                ])
                ->values(),
            'latestFinance' => FinanceRecord::query()
                ->with(['dossier', 'client'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (FinanceRecord $record) => [
                    'id' => $record->id,
                    'recordNumber' => $record->record_number,
                    'type' => $record->type,
                    'status' => $record->status,
                    'totalTtc' => (float) $record->total_ttc,
                    'remaining' => (float) $record->remaining,
                    'clientName' => $record->client?->full_name ?? '-',
                    'dossierNumber' => $record->dossier?->dossier_number ?? '-',
                ])
                ->values(),
            'urgentItems' => [
                [
                    'label' => 'Missing documents',
                    'count' => DossierDocument::where('status', 'missing')->count(),
                    'href' => '/documents',
                    'tone' => 'amber',
                ],
                [
                    'label' => 'Overdue finance',
                    'count' => FinanceRecord::where('status', 'overdue')->count(),
                    'href' => '/finance',
                    'tone' => 'red',
                ],
                [
                    'label' => 'Authorization observations',
                    'count' => Authorization::where('status', 'observations')->count(),
                    'href' => '/authorizations',
                    'tone' => 'amber',
                ],
                [
                    'label' => 'Checked out archives',
                    'count' => ArchiveRecord::where('status', 'checked_out')->count(),
                    'href' => '/archives',
                    'tone' => 'blue',
                ],
            ],
        ]);
    }
}