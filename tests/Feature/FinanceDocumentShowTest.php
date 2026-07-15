<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\FinanceTemplate;
use App\Models\User;
use App\Services\Finance\DefaultFinanceTemplateFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceDocumentShowTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private FinanceDocument $document;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['name' => 'Test Admin']);

        $client = Client::factory()->create(['full_name' => 'Test Client']);
        $dossier = Dossier::factory()->create(['dossier_number' => 'DOS-TEST-001']);

        $factory = app(DefaultFinanceTemplateFactory::class);
        $template = FinanceTemplate::create(array_merge(
            $factory->invoice(),
            ['slug' => 'test-invoice', 'created_by' => $this->user->id]
        ));

        $this->document = FinanceDocument::create([
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
            ->get("/finance/documents/{$this->document->id}", [
                'X-Inertia' => 'true',
                'X-Inertia-Version' => 'test',
            ]);

        $response->assertStatus(200);
        $response->assertHeader('X-Inertia', 'true');

        $json = $response->json();

        $this->assertSame('Finance/Documents/Show', $json['component'] ?? null, 'Component name mismatch');

        $props = $json['props'] ?? [];
        $this->assertArrayHasKey('document', $props, 'Response is missing document prop');

        $doc = $props['document'];
        $this->assertSame('FAC-TEST-001', $doc['number'] ?? null);
        $this->assertSame('invoice', $doc['type'] ?? null);
        $this->assertSame('sent', $doc['status'] ?? null);
        $this->assertSame(60350.0, (float) ($doc['subtotalHt'] ?? 0));
        $this->assertArrayHasKey('items', $doc);
        $this->assertCount(2, $doc['items']);
        $this->assertArrayHasKey('client', $doc);
        $this->assertSame('Test Client', $doc['client']['name'] ?? null);
    }

    public function test_show_returns_404_for_missing_document(): void
    {
        $response = $this->actingAs($this->user)
            ->get('/finance/documents/99999', [
                'X-Inertia' => 'true',
                'X-Inertia-Version' => 'test',
            ]);

        $response->assertStatus(404);
    }

    public function test_show_redirects_unauthenticated(): void
    {
        $response = $this->get("/finance/documents/{$this->document->id}", [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => 'test',
        ]);

        $response->assertStatus(302);
    }
}
