<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Contract;
use App\Models\Dossier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractFinanceTtcTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_ttc_falls_back_to_the_contract_ttc_and_never_changes_it(): void
    {
        $company = Company::factory()->create();
        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => null]);
        $dossier = Dossier::factory()->create(['company_id' => $company->id, 'branch_id' => null, 'client_id' => $client->id]);

        $contract = Contract::query()->create([
            'dossier_id' => $dossier->id,
            'contract_number' => 'CTR-FINANCE-TTC-001',
            'surface' => 100,
            'price_per_square_meter' => 900,
            'ht' => 10000,
            'tva' => 2000,
            'ttc' => 12000,
        ]);

        $this->assertSame(12000.0, $contract->effectiveFinanceTtc());

        $contract->update(['finance_ttc' => 9000]);
        $contract->refresh();

        $this->assertSame(12000.0, (float) $contract->ttc);
        $this->assertSame(9000.0, $contract->effectiveFinanceTtc());
    }
}
