<?php

namespace App\Http\Controllers;

use App\Models\ArchiveRecord;
use App\Models\Client;
use App\Models\Contract;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceRecord;
use App\Models\Intermediary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class BackendQaController extends Controller
{
    public function index(): Response
    {
        $tables = [
            ['name' => 'intermediaries', 'count' => Intermediary::count(), 'expected' => '>= 1'],
            ['name' => 'clients', 'count' => Client::count(), 'expected' => '>= 1'],
            ['name' => 'dossiers', 'count' => Dossier::count(), 'expected' => '>= 1'],
            ['name' => 'document_templates', 'count' => DocumentTemplate::count(), 'expected' => '>= 1'],
            ['name' => 'dossier_documents', 'count' => DossierDocument::count(), 'expected' => '>= 0'],
            ['name' => 'contracts', 'count' => Contract::count(), 'expected' => '>= 0'],
            ['name' => 'finance_records', 'count' => FinanceRecord::count(), 'expected' => '>= 0'],
            ['name' => 'archive_records', 'count' => ArchiveRecord::count(), 'expected' => '>= 0'],
        ];

        $routes = collect([
            ['label' => 'Dashboard', 'name' => 'dashboard', 'href' => '/'],
            ['label' => 'Clients', 'name' => 'clients.index', 'href' => '/clients'],
            ['label' => 'Dossiers', 'name' => 'dossiers.index', 'href' => '/dossiers'],
            ['label' => 'Documents', 'name' => 'documents.index', 'href' => '/documents'],
            ['label' => 'Contracts', 'name' => 'contracts.index', 'href' => '/contracts'],
            ['label' => 'Finance', 'name' => 'finance.index', 'href' => '/finance'],
            ['label' => 'Archives', 'name' => 'archives.index', 'href' => '/archives'],
            ['label' => 'Frontend QA', 'name' => 'frontend-qa.index', 'href' => '/frontend-qa'],
            ['label' => 'Backend QA', 'name' => 'backend-qa.index', 'href' => '/backend-qa'],
        ])->map(fn ($route) => [
            ...$route,
            'exists' => Route::has($route['name']),
        ])->values();

        $relations = [
            [
                'label' => 'Clients with dossiers',
                'count' => Client::has('dossiers')->count(),
                'status' => Client::has('dossiers')->exists() ? 'ok' : 'warning',
            ],
            [
                'label' => 'Dossiers with client',
                'count' => Dossier::whereNotNull('client_id')->count(),
                'status' => Dossier::whereNotNull('client_id')->exists() ? 'ok' : 'warning',
            ],
            [
                'label' => 'Contracts linked to dossiers',
                'count' => Contract::whereNotNull('dossier_id')->count(),
                'status' => 'ok',
            ],
            [
                'label' => 'Finance linked to dossiers',
                'count' => FinanceRecord::whereNotNull('dossier_id')->count(),
                'status' => 'ok',
            ],
            [
                'label' => 'Archive linked to dossiers',
                'count' => ArchiveRecord::whereNotNull('dossier_id')->count(),
                'status' => 'ok',
            ],
        ];

        return Inertia::render('BackendQa/Index', [
            'database' => [
                'connection' => config('database.default'),
                'database' => DB::connection()->getDatabaseName(),
            ],
            'tables' => $tables,
            'routes' => $routes,
            'relations' => $relations,
            'latest' => [
                'client' => Client::latest()->value('full_name'),
                'dossier' => Dossier::latest()->value('dossier_number'),
                'contract' => Contract::latest()->value('contract_number'),
                'finance' => FinanceRecord::latest()->value('record_number'),
                'archive' => ArchiveRecord::latest()->value('archive_number'),
            ],
        ]);
    }
}