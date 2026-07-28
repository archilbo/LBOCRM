<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\User;
use App\Services\Dashboard\DashboardCommandCenterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardCommandCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_center_is_scoped_to_the_authenticated_users_company_and_branch(): void
    {
        [$company, $branch, $user] = $this->tenant('alpha');
        [$otherCompany, $otherBranch] = $this->tenant('beta');

        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $dossier = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'status' => 'active',
        ]);
        FinanceDocument::create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'type' => 'invoice',
            'number' => 'FAC-ALPHA-001',
            'status' => 'sent',
            'client_id' => $client->id,
            'dossier_id' => $dossier->id,
            'issue_date' => now()->toDateString(),
            'total_ttc' => 1500,
            'remaining_total' => 1500,
        ]);

        $otherClient = Client::factory()->create(['company_id' => $otherCompany->id, 'branch_id' => $otherBranch->id]);
        $otherDossier = Dossier::factory()->create([
            'company_id' => $otherCompany->id,
            'branch_id' => $otherBranch->id,
            'client_id' => $otherClient->id,
            'status' => 'active',
        ]);
        FinanceDocument::create([
            'company_id' => $otherCompany->id,
            'branch_id' => $otherBranch->id,
            'type' => 'invoice',
            'number' => 'FAC-BETA-001',
            'status' => 'sent',
            'client_id' => $otherClient->id,
            'dossier_id' => $otherDossier->id,
            'issue_date' => now()->toDateString(),
            'total_ttc' => 9200,
            'remaining_total' => 9200,
        ]);

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);
        $kpis = collect($data['kpis'])->keyBy('key');

        $this->assertSame('1', $kpis['activeProjects']['value']);
        $this->assertSame('1', $kpis['unpaidInvoices']['value']);
        $this->assertSame(1500.0, collect($data['financeTrend'])->sum('invoiced'));
        $this->assertSame('1', collect($data['systemHealth'])->firstWhere('label', 'Clients')['value']);
    }

    /** @return array{Company, Branch, User} */
    private function tenant(string $suffix): array
    {
        $company = Company::factory()->create(['slug' => "company-{$suffix}"]);
        $branch = Branch::create([
            'company_id' => $company->id,
            'name' => "Branch {$suffix}",
            'code' => strtoupper($suffix),
            'is_active' => true,
        ]);
        $user = User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        return [$company, $branch, $user];
    }
}
