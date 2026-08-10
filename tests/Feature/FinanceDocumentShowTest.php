<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\FinanceTemplate;
use App\Models\User;
use App\Services\Finance\DefaultFinanceTemplateFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Inertia\Testing\AssertableInertia as Assert;

class FinanceDocumentShowTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private FinanceDocument $document;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::query()->firstOrFail();
        $branch = Branch::query()->where('company_id', $company->id)->firstOrFail();
        $this->user = User::factory()->create([
            'name' => 'Test Admin',
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);
        Role::findOrCreate('admin', 'web');
        $this->user->assignRole('admin');

        $client = Client::factory()->create(['full_name' => 'Test Client']);
        $dossier = Dossier::factory()->create(['client_id' => $client->id, 'dossier_number' => 'DOS-TEST-001']);

        $factory = app(DefaultFinanceTemplateFactory::class);
        $template = FinanceTemplate::create(array_merge(
            $factory->invoice(),
            ['slug' => 'test-invoice', 'created_by' => $this->user->id, 'company_id' => $company->id, 'branch_id' => $branch->id]
        ));

        $this->document = FinanceDocument::create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'type' => 'invoice',
            'number' => 'FAC-TEST-001',
            'status' => 'sent',
            'client_id' => $client->id,
            'dossier_id' => $dossier->id,
            'issue_date' => '2026-07-01',
            'due_date' => '2026-08-01',
            'currency' => 'MAD',
            'tva_rate' => 20,
            'template_id' => $template->id,
            'created_by' => $this->user->id,
        ]);

        $items = [
            ['position' => 1, 'title' => 'Consulting', 'quantity' => 1, 'unit_price' => 50000, 'total_ht' => 50000, 'total_tva' => 10000, 'total_ttc' => 60000],
            ['position' => 2, 'title' => 'Travel', 'quantity' => 100, 'unit_price' => 3.50, 'total_ht' => 350, 'total_tva' => 70, 'total_ttc' => 420],
        ];

        foreach ($items as $data) {
            $this->document->items()->create($data);
        }

        $this->document->recalculateTotals()->save();
    }

    public function test_show_returns_document_via_inertia(): void
    {
        $response = $this->actingAs($this->user)
            ->get("/finance/documents/{$this->document->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Finance/Documents/Show')
            ->where('document.number', 'FAC-TEST-001')
            ->where('document.type', 'invoice')
            ->where('document.status', 'sent')
            ->where('document.subtotalHt', fn ($value) => (float) $value === 50350.0)
            ->has('document.items', 2)
            ->where('document.client.name', 'Test Client'));
    }

    public function test_show_returns_404_for_missing_document(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/finance/documents/99999');

        $response->assertStatus(404);
    }

    public function test_bulk_delete_removes_selected_finance_documents(): void
    {
        $this->document->forceFill(['status' => 'draft', 'issued_at' => null, 'number_locked' => false])->save();
        $second = $this->document->replicate();
        $second->number = 'FAC-TEST-002';
        $second->status = 'draft';
        $second->issued_at = null;
        $second->number_locked = false;
        $second->save();

        $this->actingAs($this->user)
            ->post(route('finance.documents.bulk.destroy'), ['document_ids' => [$this->document->id, $second->id]])
            ->assertRedirect(route('finance.documents.index'));

        $this->assertSoftDeleted('finance_documents', ['id' => $this->document->id]);
        $this->assertSoftDeleted('finance_documents', ['id' => $second->id]);
    }

    public function test_show_redirects_unauthenticated(): void
    {
        $response = $this->get("/finance/documents/{$this->document->id}");

        $response->assertStatus(302);
    }
}
