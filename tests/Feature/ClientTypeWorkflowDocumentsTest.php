<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Services\Documents\WorkflowDocumentTemplateResolver;
use App\Services\Dossiers\DossierWorkflowStepperService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTypeWorkflowDocumentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_person_workflow_adds_bureau_etude_requirements_only_for_people(): void
    {
        $workflow = $this->workflowFor('person');

        $documents = collect($workflow['steps'])->firstWhere('key', 'documents');
        $bureauEtude = collect($workflow['steps'])->firstWhere('key', 'bureau_etude');

        $this->assertContains('desistement', collect($documents['requirements'])->pluck('key'));
        $this->assertContains('procuration', collect($documents['requirements'])->pluck('key'));
        $this->assertNotContains('statut', collect($documents['requirements'])->pluck('key'));
        $this->assertNotContains('rce', collect($documents['requirements'])->pluck('key'));
        $this->assertContains('attestation_situation_reguliere', collect($bureauEtude['requirements'])->pluck('key'));
        $this->assertContains('topographe', collect($bureauEtude['requirements'])->pluck('key'));
    }

    public function test_company_workflow_adds_company_documents_without_person_only_bureau_requirements(): void
    {
        $workflow = $this->workflowFor('company');

        $documents = collect($workflow['steps'])->firstWhere('key', 'documents');
        $bureauEtude = collect($workflow['steps'])->firstWhere('key', 'bureau_etude');

        $this->assertContains('statut', collect($documents['requirements'])->pluck('key'));
        $this->assertContains('rce', collect($documents['requirements'])->pluck('key'));
        $this->assertContains('desistement', collect($documents['requirements'])->pluck('key'));
        $this->assertContains('procuration', collect($documents['requirements'])->pluck('key'));
        $this->assertNotContains('attestation_situation_reguliere', collect($bureauEtude['requirements'])->pluck('key'));
        $this->assertNotContains('topographe', collect($bureauEtude['requirements'])->pluck('key'));
    }

    public function test_new_workflow_templates_are_available_to_the_document_drawer_resolver(): void
    {
        $resolver = app(WorkflowDocumentTemplateResolver::class);
        $map = $resolver->requirementTemplateMap();

        foreach ([
            'statut' => 'STATUT',
            'rce' => 'RCE',
            'desistement' => 'DESISTEMENT',
            'procuration' => 'PROCURATION',
            'attestation_situation_reguliere' => 'ATTESTATION_SITUATION_REGULIERE',
            'topographe' => 'TOPOGRAPHE',
        ] as $requirement => $code) {
            $template = DocumentTemplate::query()->where('code', $code)->firstOrFail();

            $this->assertSame((string) $template->id, $map[$requirement]);
        }
    }

    private function workflowFor(string $clientType): array
    {
        $company = Company::factory()->create();
        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_type' => $clientType,
        ]);
        $dossier = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
        ]);

        return app(DossierWorkflowStepperService::class)->evaluate($dossier);
    }
}
