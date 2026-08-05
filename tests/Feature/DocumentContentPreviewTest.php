<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DocumentContentPreviewTest extends TestCase
{
    use RefreshDatabase;

    private function previewLimit(): int
    {
        return (int) config('documents.content_preview_limit', 1024 * 1024);
    }

    public function test_authorized_user_can_read_supported_text_content(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company), [
            'original_filename' => 'notes.txt',
            'mime_type' => 'text/plain',
            'size_bytes' => 6,
            'stored_path' => 'private/tests/notes.txt',
        ]);
        Storage::disk('local')->put($document->stored_path, 'hello!');

        $response = $this->actingAs($user)
            ->getJson(route('documents.content', $document))
            ->assertOk()
            ->assertExactJson([
                'content' => 'hello!',
                'truncated' => false,
                'previewBytes' => 6,
                'totalBytes' => 6,
                'mimeType' => 'text/plain',
            ]);
        $this->assertPrivateCacheHeaders($response);
        $response->assertDontSee('private/tests');
    }

    private function assertPrivateCacheHeaders(\Illuminate\Testing\TestResponse $response): void
    {
        $cacheControl = (string) $response->headers->get('Cache-Control');

        // Symfony normalizes directive order; assert presence, not sequence.
        self::assertStringContainsString('no-store', $cacheControl);
        self::assertStringContainsString('max-age=0', $cacheControl);
        self::assertStringContainsString('private', $cacheControl);
        self::assertSame('no-cache', (string) $response->headers->get('Pragma'));
        self::assertSame('nosniff', (string) $response->headers->get('X-Content-Type-Options'));
    }

    public function test_markdown_content_is_readable_as_text(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company), [
            'original_filename' => 'notes.md',
            'mime_type' => 'text/markdown',
            'size_bytes' => 4,
        ]);
        Storage::disk('local')->put($document->stored_path, '# Hi');

        $this->actingAs($user)
            ->getJson(route('documents.content', $document))
            ->assertOk()
            ->assertJsonPath('content', '# Hi')
            ->assertJsonPath('mimeType', 'text/markdown');
    }

    public function test_unauthorized_user_is_denied(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $outsider = $this->userFor($company, ['documents.create']);
        $document = $this->documentFor($this->dossierFor($company));
        Storage::disk('local')->put($document->stored_path, 'secret');

        $this->actingAs($user)->getJson(route('documents.content', $document))->assertOk();

        $this->actingAs($outsider)
            ->getJson(route('documents.content', $document))
            ->assertForbidden();
    }

    public function test_cross_company_access_is_denied(): void
    {
        Storage::fake('local');

        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['documents.view']);
        $foreignDocument = $this->documentFor($this->dossierFor($companyB));
        Storage::disk('local')->put($foreignDocument->stored_path, 'foreign');

        $this->actingAs($user)
            ->getJson(route('documents.content', $foreignDocument))
            ->assertForbidden();
    }

    public function test_cross_client_and_project_access_is_denied(): void
    {
        Storage::fake('local');

        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['documents.view']);

        $foreignClient = Client::factory()->create([
            'company_id' => $companyB->id,
            'branch_id' => null,
        ]);
        $foreignDossier = $this->dossierFor($companyB, $foreignClient);
        $foreignDocument = $this->documentFor($foreignDossier);
        Storage::disk('local')->put($foreignDocument->stored_path, 'foreign');

        $this->actingAs($user)
            ->getJson(route('documents.content', $foreignDocument))
            ->assertForbidden();
    }

    public function test_unsupported_mime_type_is_rejected(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company), [
            'original_filename' => 'plan.pdf',
            'mime_type' => 'application/pdf',
        ]);
        Storage::disk('local')->put($document->stored_path, '%PDF-1.4');

        $this->actingAs($user)
            ->getJson(route('documents.content', $document))
            ->assertStatus(415)
            ->assertJsonPath('reason', 'unsupported');
    }

    public function test_html_and_javascript_mime_types_are_rejected(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);

        foreach ([
            'page.html' => 'text/html',
            'script.js' => 'text/javascript',
            'script.mjs' => 'application/javascript',
        ] as $filename => $mimeType) {
            $document = $this->documentFor($this->dossierFor($company), [
                'original_filename' => $filename,
                'mime_type' => $mimeType,
            ]);
            Storage::disk('local')->put($document->stored_path, '<script>alert(1)</script>');

            $this->actingAs($user)
                ->getJson(route('documents.content', $document))
                ->assertStatus(415)
                ->assertJsonPath('reason', 'unsupported');
        }
    }

    public function test_denied_extension_is_rejected_even_with_a_text_mime(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);

        foreach (['archive.html', 'script.js', 'payload.exe', 'bundle.zip'] as $filename) {
            $document = $this->documentFor($this->dossierFor($company), [
                'original_filename' => $filename,
                'mime_type' => 'text/plain',
            ]);
            Storage::disk('local')->put($document->stored_path, 'plain-looking bytes');

            $this->actingAs($user)
                ->getJson(route('documents.content', $document))
                ->assertStatus(415);
        }
    }

    public function test_binary_null_byte_content_is_rejected(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company));
        Storage::disk('local')->put($document->stored_path, "abc\0def");

        $this->actingAs($user)
            ->getJson(route('documents.content', $document))
            ->assertStatus(422)
            ->assertJsonPath('reason', 'binary');
    }

    public function test_invalid_utf8_content_returns_a_safe_encoding_error(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company));
        Storage::disk('local')->put($document->stored_path, "\xC3\x28");

        $this->actingAs($user)
            ->getJson(route('documents.content', $document))
            ->assertStatus(422)
            ->assertJsonPath('reason', 'encoding');
    }

    public function test_oversized_content_is_truncated_at_the_configured_limit(): void
    {
        Storage::fake('local');

        $limit = $this->previewLimit();
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company), [
            'size_bytes' => $limit + 100,
        ]);
        Storage::disk('local')->put($document->stored_path, str_repeat('a', $limit + 100));

        $response = $this->actingAs($user)
            ->getJson(route('documents.content', $document))
            ->assertOk()
            ->assertJsonPath('truncated', true)
            ->assertJsonPath('previewBytes', $limit)
            ->assertJsonPath('totalBytes', $limit + 100);

        $this->assertSame($limit, strlen($response->json('content')));
    }

    public function test_missing_physical_file_returns_a_safe_response(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company), [
            'stored_path' => 'private/tests/does-not-exist.txt',
        ]);

        $this->actingAs($user)
            ->getJson(route('documents.content', $document))
            ->assertStatus(404)
            ->assertJsonPath('reason', 'missing')
            ->assertDontSee('private/tests');
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        // Unique role per call: a shared role would be re-synced by the next
        // userFor() and silently strip permissions from earlier users.
        $role = Role::findOrCreate('document_content_'.Str::lower(Str::random(8)), 'web');
        $role->syncPermissions($permissionModels);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }

    private function dossierFor(Company $company, ?Client $client = null): Dossier
    {
        $client ??= Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]);

        return Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
        ]);
    }

    private function documentFor(Dossier $dossier, array $attributes = []): DossierDocument
    {
        return DossierDocument::query()->create(array_merge([
            'dossier_id' => $dossier->id,
            'document_number' => 'DOC-'.Str::upper(Str::random(6)),
            'status' => 'uploaded',
            'original_filename' => 'notes.txt',
            'mime_type' => 'text/plain',
            'size_bytes' => 0,
            'stored_path' => 'private/tests/notes.txt',
        ], $attributes));
    }
}
