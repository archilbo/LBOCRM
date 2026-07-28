<?php

namespace Database\Seeders;

use App\Enums\PaymentKind;
use App\Models\Branch;
use App\Models\Client;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Message;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('Dashboard demo data is disabled in production.');

            return;
        }

        $company = Company::query()->where('slug', 'archi-lbo')->first() ?? Company::query()->first();
        $branch = $company
            ? Branch::query()->where('company_id', $company->id)->where('is_active', true)->first()
                ?? Branch::query()->where('company_id', $company->id)->first()
            : null;
        $admin = $company
            ? User::query()->where('company_id', $company->id)->where('branch_id', $branch?->id)->orderBy('id')->first()
            : null;

        if (! $company || ! $branch || ! $admin) {
            $this->command?->error('Run the baseline database seeder before the dashboard demo seeder.');

            return;
        }

        DB::transaction(function () use ($company, $branch, $admin): void {
            $dossiers = $this->seedDossiers($company, $branch);
            $this->seedDocuments($dossiers);
            $this->seedFinance($company, $branch, $admin, $dossiers);
            $this->seedTasks($admin, $dossiers);
            $this->seedConversation($company, $branch, $admin, $dossiers[0]);
        });

        $this->command?->info('Dashboard demo data is ready. It is not part of DatabaseSeeder.');
    }

    /** @return array<int, Dossier> */
    private function seedDossiers(Company $company, Branch $branch): array
    {
        $definitions = [
            ['number' => 'DASH-2026-001', 'cin' => 'DASH-CIN-001', 'name' => 'Amina El Fassi', 'project' => 'Residence Atlas', 'province' => 'Marrakech', 'commune' => 'Gueliz', 'step' => 'documents'],
            ['number' => 'DASH-2026-002', 'cin' => 'DASH-CIN-002', 'name' => 'Youssef Amrani', 'project' => 'Villa Targa', 'province' => 'Marrakech', 'commune' => 'Targa', 'step' => 'contract'],
            ['number' => 'DASH-2026-003', 'cin' => 'DASH-CIN-003', 'name' => 'Salma Bennani', 'project' => 'Immeuble Al Qods', 'province' => 'Casablanca', 'commune' => 'Maarif', 'step' => 'rokhas'],
            ['number' => 'DASH-2026-004', 'cin' => 'DASH-CIN-004', 'name' => 'Karim Tazi', 'project' => 'Extension Dar Al Amal', 'province' => 'Rabat', 'commune' => 'Agdal', 'step' => 'bureau_etude'],
            ['number' => 'DASH-2026-005', 'cin' => 'DASH-CIN-005', 'name' => 'Nadia Alaoui', 'project' => 'Villa Jardin', 'province' => 'Marrakech', 'commune' => 'Hivernage', 'step' => 'permis_habiter'],
            ['number' => 'DASH-2026-006', 'cin' => 'DASH-CIN-006', 'name' => 'Omar Fikri', 'project' => 'Local Commercial Centre', 'province' => 'Marrakech', 'commune' => 'Medina', 'step' => 'archive'],
        ];

        return array_map(function (array $definition, int $index) use ($company, $branch): Dossier {
            [$firstName, $lastName] = explode(' ', $definition['name'], 2);
            $client = Client::query()->updateOrCreate(
                ['company_id' => $company->id, 'cin' => $definition['cin']],
                [
                    'branch_id' => $branch->id,
                    'client_number' => 'DASH-CL-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'full_name' => $definition['name'],
                    'phone' => '0600000' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                    'email' => 'dashboard.client' . ($index + 1) . '@archilbo.local',
                    'address' => $definition['commune'] . ', ' . $definition['province'],
                    'status' => 'active',
                ],
            );

            return Dossier::query()->updateOrCreate(
                ['dossier_number' => $definition['number']],
                [
                    'company_id' => $company->id,
                    'branch_id' => $branch->id,
                    'client_id' => $client->id,
                    'project_object' => $definition['project'],
                    'project_address' => $definition['commune'] . ', ' . $definition['province'],
                    'province' => $definition['province'],
                    'commune' => $definition['commune'],
                    'land_title_number' => 'TF-DASH-' . ($index + 1),
                    'land_surface' => 240 + ($index * 45),
                    'floor_area' => 160 + ($index * 35),
                    'status' => 'active',
                    'workflow_step' => $definition['step'],
                    'opened_at' => now()->subDays(20 + $index),
                    'notes' => 'Temporary dashboard review data.',
                    'updated_at' => $index < 2 ? now()->subDays(9 + $index) : now()->subDays($index),
                ],
            );
        }, $definitions, array_keys($definitions));
    }

    /** @param array<int, Dossier> $dossiers */
    private function seedDocuments(array $dossiers): void
    {
        foreach ($dossiers as $index => $dossier) {
            DossierDocument::query()->updateOrCreate(
                ['dossier_id' => $dossier->id, 'document_number' => 'DASH-DOC-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                [
                    'original_filename' => 'dashboard-document-' . ($index + 1) . '.pdf',
                    'status' => $index < 2 ? 'missing' : 'verified',
                    'uploaded_at' => $index < 2 ? null : now()->subDays($index + 1),
                    'verified_at' => $index < 2 ? null : now()->subDays($index),
                ],
            );
        }
    }

    /** @param array<int, Dossier> $dossiers */
    private function seedFinance(Company $company, Branch $branch, User $admin, array $dossiers): void
    {
        $definitions = [
            ['total' => 68000, 'paid' => 22000, 'status' => 'partially_paid', 'issue' => now()->subMonths(5), 'due' => now()->addDays(10)],
            ['total' => 94000, 'paid' => 0, 'status' => 'overdue', 'issue' => now()->subMonths(3), 'due' => now()->subDays(8)],
            ['total' => 32500, 'paid' => 0, 'status' => 'sent', 'issue' => now()->subMonths(2), 'due' => now()->addDays(18)],
            ['total' => 48000, 'paid' => 48000, 'status' => 'paid', 'issue' => now()->subMonth(), 'due' => now()->addDays(5)],
            ['total' => 78500, 'paid' => 8200, 'status' => 'partially_paid', 'issue' => now(), 'due' => now()->addDays(25)],
        ];

        foreach ($definitions as $index => $definition) {
            $dossier = $dossiers[$index];
            $document = FinanceDocument::query()->updateOrCreate(
                ['number' => 'DASH-FAC-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                [
                    'company_id' => $company->id,
                    'branch_id' => $branch->id,
                    'type' => 'invoice',
                    'status' => $definition['status'],
                    'client_id' => $dossier->client_id,
                    'dossier_id' => $dossier->id,
                    'active_invoice_dossier_key' => "branch:{$branch->id}:dossier:{$dossier->id}",
                    'issue_date' => $definition['issue']->toDateString(),
                    'due_date' => $definition['due']->toDateString(),
                    'currency' => 'MAD',
                    'tva_rate' => 20,
                    'subtotal_ht' => round($definition['total'] / 1.2, 2),
                    'tax_total' => round($definition['total'] - ($definition['total'] / 1.2), 2),
                    'total_ttc' => $definition['total'],
                    'paid_total' => $definition['paid'],
                    'remaining_total' => $definition['total'] - $definition['paid'],
                    'notes' => 'Temporary dashboard finance data.',
                    'terms' => 'Paiement a reception.',
                    'issued_at' => $definition['issue']->copy()->startOfDay(),
                    'created_by' => $admin->id,
                ],
            );

            if ($definition['paid'] <= 0) {
                continue;
            }

            Payment::query()->updateOrCreate(
                ['payment_number' => 'DASH-PAY-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                [
                    'company_id' => $company->id,
                    'branch_id' => $branch->id,
                    'finance_document_id' => $document->id,
                    'payment_kind' => PaymentKind::Invoice,
                    'client_id' => $dossier->client_id,
                    'dossier_id' => $dossier->id,
                    'amount' => $definition['paid'],
                    'method' => $index === 4 ? 'cash' : 'bank_transfer',
                    'reference' => 'DASH-REF-' . ($index + 1),
                    'paid_at' => $index === 4 ? now()->toDateString() : now()->subMonths(max(1, 5 - $index))->toDateString(),
                    'notes' => 'Temporary dashboard payment.',
                    'created_by' => $admin->id,
                ],
            );
        }
    }

    /** @param array<int, Dossier> $dossiers */
    private function seedTasks(User $admin, array $dossiers): void
    {
        $definitions = [
            ['title' => 'Verifier les documents de Residence Atlas', 'status' => 'not_started', 'priority' => 'urgent', 'due' => now()->subDay(), 'dossier' => 0],
            ['title' => 'Finaliser le contrat de Villa Targa', 'status' => 'in_progress', 'priority' => 'high', 'due' => now()->addDay(), 'dossier' => 1],
            ['title' => 'Suivre le depot Rokhas', 'status' => 'in_review', 'priority' => 'medium', 'due' => now()->addDays(3), 'dossier' => 2],
            ['title' => 'Relancer la facture Residence Atlas', 'status' => 'not_started', 'priority' => 'high', 'due' => now()->addDays(2), 'dossier' => 0],
        ];

        foreach ($definitions as $index => $definition) {
            $dossier = $dossiers[$definition['dossier']];
            $task = Task::query()->updateOrCreate(
                ['task_number' => 'DASH-TASK-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                [
                    'title' => $definition['title'],
                    'status' => $definition['status'],
                    'priority' => $definition['priority'],
                    'category' => 'general_admin',
                    'progress' => $definition['status'] === 'in_review' ? 75 : ($definition['status'] === 'in_progress' ? 40 : 0),
                    'due_date' => $definition['due'],
                    'created_by' => $admin->id,
                    'assigned_by' => $admin->id,
                    'dossier_id' => $dossier->id,
                    'client_id' => $dossier->client_id,
                ],
            );
            $task->assignees()->syncWithoutDetaching([$admin->id]);
        }
    }

    private function seedConversation(Company $company, Branch $branch, User $admin, Dossier $dossier): void
    {
        $manager = User::query()
            ->where('company_id', $company->id)
            ->where('branch_id', $branch->id)
            ->where('id', '!=', $admin->id)
            ->orderBy('id')
            ->first();

        if (! $manager) {
            return;
        }

        $conversation = Conversation::query()->firstOrCreate(
            ['company_id' => $company->id, 'branch_id' => $branch->id, 'subject' => 'DASHBOARD-DEMO-OPERATIONS'],
            ['type' => 'group', 'category' => 'operations', 'dossier_id' => $dossier->id, 'client_id' => $dossier->client_id, 'last_message_at' => now()],
        );
        $conversation->participants()->firstOrCreate(['user_id' => $admin->id]);
        $conversation->participants()->firstOrCreate(['user_id' => $manager->id]);

        Message::query()->firstOrCreate(
            ['conversation_id' => $conversation->id, 'user_id' => $manager->id, 'body' => 'Les documents manquants doivent etre traites avant le prochain depot.'],
        );
        $conversation->update(['last_message_at' => now()]);
    }
}
