<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Services\Clients\ClientWorkspaceService;
use App\Services\Dossiers\DossierLocationGroupingService;
use App\Services\Documents\DocumentGroupingService;
use App\Services\Finance\FinanceMonthlySummaryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class WorkflowGroupingQaCommand extends Command
{
    protected $signature = 'archilbo:workflow-grouping-qa';

    protected $description = 'Verify client/project/document/location/monthly finance grouping read models.';

    public function handle(
        ClientWorkspaceService $clientWorkspace,
        DossierLocationGroupingService $dossierGroups,
        DocumentGroupingService $documentGroups,
        FinanceMonthlySummaryService $financeMonths,
    ): int {
        $this->info('ARCHI LBO workflow grouping QA started...');

        foreach (['clients', 'dossiers', 'dossier_documents', 'finance_documents', 'payments'] as $table) {
            if (! Schema::hasTable($table)) {
                $this->error("Missing table: {$table}");

                return self::FAILURE;
            }
        }

        $failures = 0;
        $failures += $this->checkClientWorkspace($clientWorkspace);
        $failures += $this->checkDossierGroups($dossierGroups);
        $failures += $this->checkDocumentGroups($documentGroups);
        $failures += $this->checkFinanceMonths($financeMonths);

        if ($failures > 0) {
            $this->error("Workflow grouping QA failed with {$failures} issue(s).");

            return self::FAILURE;
        }

        $this->info('Workflow grouping QA passed.');

        return self::SUCCESS;
    }

    private function checkClientWorkspace(ClientWorkspaceService $service): int
    {
        $client = Client::query()
            ->withCount('dossiers')
            ->orderByDesc('dossiers_count')
            ->first();

        if (! $client) {
            $this->warn('No clients found. Client workspace grouping skipped.');

            return 0;
        }

        $workspace = $service->forClient($client);

        foreach (['client', 'projects', 'selectedProject'] as $key) {
            if (! array_key_exists($key, $workspace)) {
                return $this->qaFail("Client workspace missing key: {$key}");
            }
        }

        foreach ($workspace['projects'] as $project) {
            foreach (['id', 'clientId', 'dossierNumber', 'projectObject', 'documentsCount', 'financeDocumentsCount', 'paymentsCount'] as $key) {
                if (! array_key_exists($key, $project)) {
                    return $this->qaFail("Client project summary missing key: {$key}");
                }
            }
        }

        $this->line('<fg=green>PASS</> Client workspace payload checked for ' . ($client->full_name ?? $client->id));

        return 0;
    }

    private function checkDossierGroups(DossierLocationGroupingService $service): int
    {
        $groups = $service->groups();
        $groupedCount = collect($groups)
            ->flatMap(fn (array $province) => $province['communes'] ?? [])
            ->sum(fn (array $commune) => count($commune['dossiers'] ?? []));

        $rawCount = Dossier::query()->count();

        if ($groupedCount !== $rawCount) {
            return $this->qaFail("Dossier location grouping count mismatch: grouped {$groupedCount}, raw {$rawCount}");
        }

        foreach ($groups as $province) {
            foreach (['province', 'stats', 'communes'] as $key) {
                if (! array_key_exists($key, $province)) {
                    return $this->qaFail("Dossier province group missing key: {$key}");
                }
            }
        }

        $this->line("<fg=green>PASS</> Dossier location groups checked ({$rawCount} project(s)).");

        return 0;
    }

    private function checkDocumentGroups(DocumentGroupingService $service): int
    {
        $groups = $service->groups();
        $groupedCount = collect($groups)
            ->flatMap(fn (array $province) => $province['communes'] ?? [])
            ->flatMap(fn (array $commune) => $commune['clients'] ?? [])
            ->flatMap(fn (array $client) => $client['projects'] ?? [])
            ->flatMap(fn (array $project) => $project['types'] ?? [])
            ->sum(fn (array $type) => count($type['documents'] ?? []));

        $rawCount = DossierDocument::query()->count();

        if ($groupedCount !== $rawCount) {
            return $this->qaFail("Document grouping count mismatch: grouped {$groupedCount}, raw {$rawCount}");
        }

        $this->line("<fg=green>PASS</> Document groups checked ({$rawCount} document(s)).");

        return 0;
    }

    private function checkFinanceMonths(FinanceMonthlySummaryService $service): int
    {
        $months = $service->months();
        $summaryTotal = round((float) collect($months)->sum('totalTtc'), 2);
        $rawTotal = round((float) FinanceDocument::query()->sum('total_ttc'), 2);

        if ($summaryTotal !== $rawTotal) {
            return $this->qaFail("Finance monthly total mismatch: grouped {$summaryTotal}, raw {$rawTotal}");
        }

        $summaryPaid = round((float) collect($months)->sum('paidTotal'), 2);
        $rawPaid = round((float) Payment::query()->sum('amount'), 2);

        if ($summaryPaid !== $rawPaid) {
            return $this->qaFail("Finance monthly payment mismatch: grouped {$summaryPaid}, raw {$rawPaid}");
        }

        $this->table(
            ['Months', 'Documents TTC', 'Payments'],
            [[count($months), number_format($summaryTotal, 2), number_format($summaryPaid, 2)]]
        );

        $this->line('<fg=green>PASS</> Finance monthly groups checked.');

        return 0;
    }

    private function qaFail(string $message): int
    {
        $this->error($message);

        return 1;
    }
}
