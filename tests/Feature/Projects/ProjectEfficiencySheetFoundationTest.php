<?php

namespace Tests\Feature\Projects;

use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectEfficiencySheet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProjectEfficiencySheetFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_fiche_belongs_to_project(): void
    {
        $dossier = Dossier::factory()->create();
        $fiche = ProjectEfficiencySheet::factory()->create(['dossier_id' => $dossier->id]);

        $this->assertTrue($fiche->dossier->is($dossier));
        $this->assertSame($dossier->id, $fiche->dossier_id);
    }

    public function test_project_exposes_fiche_relationship(): void
    {
        $dossier = Dossier::factory()->create();
        $fiche = ProjectEfficiencySheet::factory()->create(['dossier_id' => $dossier->id]);

        $this->assertTrue($dossier->efficiencySheet->is($fiche));
    }

    public function test_manual_usage_du_batiment_can_be_stored(): void
    {
        $fiche = ProjectEfficiencySheet::factory()->create([
            'usage_du_batiment' => 'Résidentiel',
        ]);

        $this->assertSame('Résidentiel', $fiche->fresh()->usage_du_batiment);
    }

    public function test_manual_owner_name_can_be_stored(): void
    {
        $fiche = ProjectEfficiencySheet::factory()->create([
            'owner_name' => 'Mr. ZINE ELABIDINE ZOUHAIR',
        ]);

        $this->assertSame('Mr. ZINE ELABIDINE ZOUHAIR', $fiche->fresh()->owner_name);
    }

    public function test_automatic_data_is_not_persisted_in_the_row(): void
    {
        /*
         * Selected architecture is Contract-like: automatic values
         * (project/client/entreprise) are read from trusted sources only at
         * generation time and frozen inside the generated file. No snapshot
         * columns and no JSON data column exist on the row.
         */
        foreach ([
            'project_name_snapshot',
            'project_address_snapshot',
            'client_address_snapshot',
            'enterprise_representative_snapshot',
            'enterprise_address_snapshot',
            'enterprise_phone_snapshot',
            'enterprise_fax_snapshot',
            'enterprise_email_snapshot',
            'data',
        ] as $column) {
            $this->assertFalse(
                Schema::hasColumn('project_efficiency_sheets', $column),
                "Column {$column} must not exist on project_efficiency_sheets."
            );
        }

        $this->assertTrue(Schema::hasColumn('project_efficiency_sheets', 'usage_du_batiment'));
        $this->assertTrue(Schema::hasColumn('project_efficiency_sheets', 'owner_name'));
    }

    public function test_docx_path_can_remain_null(): void
    {
        $fiche = ProjectEfficiencySheet::factory()->create();

        $this->assertNull($fiche->fresh()->docx_path);
    }

    public function test_pdf_path_can_remain_null(): void
    {
        $fiche = ProjectEfficiencySheet::factory()->create();

        $this->assertNull($fiche->fresh()->pdf_path);
    }

    public function test_generated_at_can_remain_null(): void
    {
        $fiche = ProjectEfficiencySheet::factory()->create();

        $this->assertNull($fiche->fresh()->generated_at);
    }

    public function test_deleting_a_user_does_not_delete_the_fiche(): void
    {
        $user = User::factory()->create();
        $fiche = ProjectEfficiencySheet::factory()->create([
            'created_by' => $user->id,
            'generated_by' => $user->id,
        ]);

        $user->delete();

        $this->assertDatabaseHas('project_efficiency_sheets', ['id' => $fiche->id]);
        $this->assertNull($fiche->fresh()->created_by);
        $this->assertNull($fiche->fresh()->generated_by);
    }

    public function test_tenant_and_project_relationship_remain_intact(): void
    {
        $company = Company::factory()->create();
        $dossier = Dossier::factory()->create(['company_id' => $company->id]);
        $fiche = ProjectEfficiencySheet::factory()->create(['dossier_id' => $dossier->id]);

        // Fiche -> Project -> Company/Tenant chain.
        $this->assertSame($company->id, $fiche->dossier->company_id);

        // The fiche is reachable through a company-scoped project query.
        $scopedFiche = Dossier::query()
            ->where('company_id', $company->id)
            ->firstOrFail()
            ->efficiencySheet;

        $this->assertTrue($scopedFiche->is($fiche));
    }

    public function test_default_status_version_and_template_key(): void
    {
        $fiche = ProjectEfficiencySheet::factory()->create();

        $this->assertSame('draft', $fiche->fresh()->status);
        $this->assertSame(1, $fiche->fresh()->version);
        $this->assertSame('fiche_efficacite', $fiche->fresh()->template_key);
    }
}
