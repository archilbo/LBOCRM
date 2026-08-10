<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\User;
use App\Services\Dossiers\DossierWorkflowStepperService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DossierCahierWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_saving_a_cahier_completes_received_once_without_creating_a_document(): void
    {
        $company = Company::factory()->create();
        $user = $this->workflowUser($company);
        $dossier = $this->dossier($company);

        $payload = [
            'cahier_number' => '0055945',
            'received_at' => '2026-08-08',
            'delivered_at' => '2026-08-10',
        ];

        $this->actingAs($user)
            ->put(route('dossiers.cahier.update', $dossier), $payload)
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('dossier_cahiers', [
            'dossier_id' => $dossier->id,
            'cahier_number' => '0055945',
        ]);
        $this->assertSame('2026-08-08', $dossier->fresh()->cahier?->received_at?->format('Y-m-d'));
        $this->assertSame('2026-08-10', $dossier->fresh()->cahier?->delivered_at?->format('Y-m-d'));
        $this->assertDatabaseHas('dossier_workflow_requirements', [
            'dossier_id' => $dossier->id,
            'step_key' => 'cahier_chantier',
            'requirement_key' => 'cahier_received',
            'is_done' => true,
        ]);
        $this->assertDatabaseCount('dossier_documents', 0);

        $this->actingAs($user)
            ->put(route('dossiers.cahier.update', $dossier), [...$payload, 'delivered_at' => null])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('dossier_cahiers', 1);
        $this->assertDatabaseCount('dossier_workflow_requirements', 1);
    }

    public function test_cahier_updates_cannot_cross_company_boundaries(): void
    {
        $company = Company::factory()->create();
        $foreignCompany = Company::factory()->create();
        $user = $this->workflowUser($company);
        $foreignDossier = $this->dossier($foreignCompany);

        $this->actingAs($user)
            ->put(route('dossiers.cahier.update', $foreignDossier), [
                'cahier_number' => '123',
                'received_at' => '2026-08-08',
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('dossier_cahiers', 0);
    }

    public function test_uploaded_workflow_documents_remain_unchecked_until_the_user_marks_them_done(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->dossier($company);
        $template = DocumentTemplate::query()->create([
            'name' => 'Certificat de propriete',
            'code' => 'certificat_propriete',
            'document_type' => 'administratif',
            'is_required' => true,
            'is_active' => true,
        ]);
        DossierDocument::query()->create([
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'document_side' => DossierDocument::SIDE_SINGLE,
            'document_number' => 'DOC-TEST-0001',
            'original_filename' => 'certificat.pdf',
            'stored_path' => 'documents/test/certificat.pdf',
            'status' => 'uploaded',
            'uploaded_at' => now(),
        ]);

        $workflow = app(DossierWorkflowStepperService::class)->evaluate($dossier->fresh());
        $documents = collect($workflow['steps'])->firstWhere('key', 'documents');
        $requirement = collect($documents['requirements'])->firstWhere('key', 'certificat_propriete');

        $this->assertFalse($requirement['done']);
        $this->assertTrue($requirement['hasFile']);
    }

    private function workflowUser(Company $company): User
    {
        $permission = Permission::findOrCreate('manage dossiers', 'web');
        $role = Role::findOrCreate('cahier_workflow_tester', 'web');
        $role->syncPermissions([$permission]);

        return tap(User::factory()->create(['company_id' => $company->id, 'branch_id' => null]), fn (User $user) => $user->assignRole($role));
    }

    private function dossier(Company $company): Dossier
    {
        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => null]);

        return Dossier::factory()->create(['company_id' => $company->id, 'branch_id' => null, 'client_id' => $client->id]);
    }
}
