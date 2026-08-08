<?php

namespace Tests\Feature\Projects;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectEfficiencySheet;
use App\Models\User;
use App\Services\Finance\FinanceSettingsService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectEfficiencySheetEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function userWithRole(string $roleName, Company $company): User
    {
        $user = tap(
            User::factory()->create(['company_id' => $company->id, 'branch_id' => null]),
            fn (User $user) => $user->assignRole($roleName)
        );

        return $user->fresh();
    }

    private function makeDossier(Company $company, array $overrides = []): Dossier
    {
        $clientAddress = array_key_exists('client_address', $overrides)
            ? $overrides['client_address']
            : 'Avenue Mohammed V, Casablanca';
        unset($overrides['client_address']);

        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'address' => $clientAddress,
        ]);

        return Dossier::factory()->create(array_merge([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'project_object' => 'Villa Marrakech',
            'project_address' => 'Route de Casablanca, Marrakech',
        ], $overrides));
    }

    private function clearCompanySettings(): void
    {
        foreach ([
            'company_legal_representative',
            'company_address',
            'company_phone',
            'company_fax',
            'company_email',
        ] as $key) {
            FinanceSettingsService::set('company', $key, '');
        }
    }

    private function setCompanySettings(array $values): void
    {
        foreach ($values as $key => $value) {
            FinanceSettingsService::set('company', $key, $value);
        }
    }

    public function test_show_returns_drawer_payload_without_fiche(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $this->setCompanySettings([
            'company_legal_representative' => 'M. ZINE ELABIDINE ZOUHAIR',
            'company_address' => 'Immeuble nr 959 lotissement AL MASSAR Marrakech',
            'company_phone' => '0524334343',
            'company_fax' => '0524334344',
            'company_email' => 'contact@archilbo.local',
        ]);

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->getJson("/dossiers/{$dossier->id}/efficiency-sheet");

        $response->assertOk()
            ->assertJsonPath('fiche', null)
            ->assertJsonPath('prefill.project.name', 'Villa Marrakech')
            ->assertJsonPath('prefill.project.address', 'Route de Casablanca, Marrakech')
            ->assertJsonPath('prefill.client.address', 'Avenue Mohammed V, Casablanca')
            ->assertJsonPath('prefill.enterprise.representative', 'M. ZINE ELABIDINE ZOUHAIR')
            ->assertJsonPath('prefill.enterprise.address', 'Immeuble nr 959 lotissement AL MASSAR Marrakech')
            ->assertJsonPath('prefill.enterprise.phone', '0524334343')
            ->assertJsonPath('prefill.enterprise.fax', '0524334344')
            ->assertJsonPath('prefill.enterprise.email', 'contact@archilbo.local')
            ->assertJsonPath('missingFields', []);
    }

    public function test_show_reports_every_missing_automatic_value(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company, [
            'project_address' => null,
            'client_address' => null,
        ]);
        $this->clearCompanySettings();

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->getJson("/dossiers/{$dossier->id}/efficiency-sheet");

        $response->assertOk()
            ->assertJsonPath('prefill.project.address', null)
            ->assertJsonPath('prefill.client.address', null)
            ->assertJsonPath('missingFields', [
                'PROJET_ADDRESS',
                'CLIENT_ADDRESS',
                'ENTREPRISE_CEO',
                'ENTREPRISE_ADDRESS',
                'ENTREPRISE_PHONE',
                'ENTREPRISE_FAX',
                'ENTREPRISE_MAIL',
            ]);
    }

    public function test_show_returns_existing_fiche_manual_values(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => 'Résidentiel',
            'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
        ]);

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->getJson("/dossiers/{$dossier->id}/efficiency-sheet");

        $response->assertOk()
            ->assertJsonPath('fiche.id', $fiche->id)
            ->assertJsonPath('fiche.status', 'draft')
            ->assertJsonPath('fiche.version', 1)
            ->assertJsonPath('fiche.manual.usageDuBatiment', 'Résidentiel')
            ->assertJsonPath('fiche.manual.ownerName', 'M. ZINE ELABIDINE ZOUHAIR');
    }

    public function test_show_requires_view_permission(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);

        $this->actingAs($this->userWithRole('finance_admin', $company))
            ->getJson("/dossiers/{$dossier->id}/efficiency-sheet")
            ->assertForbidden();
    }

    public function test_show_hides_dossiers_from_other_companies(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $dossier = $this->makeDossier($companyB);

        $this->actingAs($this->userWithRole('manager', $companyA))
            ->getJson("/dossiers/{$dossier->id}/efficiency-sheet")
            ->assertNotFound();
    }

    public function test_store_creates_the_first_draft(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $user = $this->userWithRole('manager', $company);

        $response = $this->actingAs($user)->postJson("/dossiers/{$dossier->id}/efficiency-sheet", [
            'usage_du_batiment' => 'Villa',
            'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
        ]);

        $response->assertCreated()
            ->assertJsonPath('fiche.manual.usageDuBatiment', 'Villa')
            ->assertJsonPath('fiche.manual.ownerName', 'M. ZINE ELABIDINE ZOUHAIR')
            ->assertJsonPath('fiche.status', 'draft')
            ->assertJsonPath('fiche.version', 1);

        $this->assertDatabaseHas('project_efficiency_sheets', [
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => 'Villa',
            'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
            'status' => 'draft',
            'version' => 1,
            'template_key' => 'fiche_efficacite',
            'created_by' => $user->id,
        ]);
    }

    public function test_store_validates_required_manual_fields(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['usage_du_batiment', 'owner_name']);
    }

    public function test_store_rejects_manual_fields_longer_than_255_characters(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet", [
                'usage_du_batiment' => str_repeat('a', 256),
                'owner_name' => str_repeat('b', 256),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['usage_du_batiment', 'owner_name']);
    }

    public function test_store_does_not_create_duplicate_drafts(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        ProjectEfficiencySheet::factory()->create(['dossier_id' => $dossier->id]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet", [
                'usage_du_batiment' => 'Villa',
                'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
            ])
            ->assertStatus(409);

        $this->assertSame(1, ProjectEfficiencySheet::query()->where('dossier_id', $dossier->id)->count());
    }

    public function test_store_requires_create_permission(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);

        $this->actingAs($this->userWithRole('viewer', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet", [
                'usage_du_batiment' => 'Villa',
                'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
            ])
            ->assertForbidden();
    }

    public function test_update_modifies_manual_fields_and_tracks_the_user(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => 'Villa',
            'owner_name' => 'Ancien propriétaire',
        ]);
        $user = $this->userWithRole('manager', $company);

        $response = $this->actingAs($user)->putJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}", [
            'usage_du_batiment' => 'Immeuble résidentiel',
            'owner_name' => 'Nouveau propriétaire',
        ]);

        $response->assertOk()
            ->assertJsonPath('fiche.manual.usageDuBatiment', 'Immeuble résidentiel')
            ->assertJsonPath('fiche.manual.ownerName', 'Nouveau propriétaire');

        $this->assertDatabaseHas('project_efficiency_sheets', [
            'id' => $fiche->id,
            'usage_du_batiment' => 'Immeuble résidentiel',
            'owner_name' => 'Nouveau propriétaire',
            'updated_by' => $user->id,
        ]);

        $this->assertSame(1, ProjectEfficiencySheet::query()->where('dossier_id', $dossier->id)->count());
    }

    public function test_update_rejects_a_fiche_belonging_to_another_project(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $otherDossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create(['dossier_id' => $otherDossier->id]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->putJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}", [
                'usage_du_batiment' => 'Villa',
                'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
            ])
            ->assertNotFound();
    }

    public function test_update_requires_update_permission(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create(['dossier_id' => $dossier->id]);

        $this->actingAs($this->userWithRole('viewer', $company))
            ->putJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}", [
                'usage_du_batiment' => 'Villa',
                'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
            ])
            ->assertForbidden();
    }
}
