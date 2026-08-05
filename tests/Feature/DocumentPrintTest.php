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

class DocumentPrintTest extends TestCase
{
    use RefreshDatabase;

    public function test_view_response_is_frameable_for_the_print_page(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view', 'documents.print']);
        $document = $this->documentFor($this->dossierFor($company), [
            'original_filename' => 'plan.pdf',
            'mime_type' => 'application/pdf',
        ]);
        Storage::disk('local')->put($document->stored_path, '%PDF-1.4 fake');

        $response = $this->actingAs($user)->getJson(route('documents.view', $document));

        $response->assertOk();
        // Frame-blocking headers must NOT be on the embedded view response,
        // otherwise the print page's <iframe> stays blank.
        $response->assertHeaderMissing('X-Frame-Options');
        $csp = (string) $response->headers->get('Content-Security-Policy');
        self::assertStringNotContainsString('frame-ancestors', $csp);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_print_page_itself_keeps_frame_blocking_headers(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view', 'documents.print']);
        $document = $this->documentFor($this->dossierFor($company));
        Storage::disk('local')->put($document->stored_path, 'hello!');

        $response = $this->actingAs($user)->get(route('documents.print', $document));

        $response->assertOk();
        $response->assertHeader('X-Frame-Options', 'DENY');
        $csp = (string) $response->headers->get('Content-Security-Policy');
        self::assertStringContainsString("frame-ancestors 'none'", $csp);
        $cacheControl = (string) $response->headers->get('Cache-Control');
        self::assertStringContainsString('no-store', $cacheControl);
        self::assertStringContainsString('private', $cacheControl);
    }

    public function test_print_page_embeds_images_with_load_aware_auto_print(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view', 'documents.print']);
        $document = $this->documentFor($this->dossierFor($company), [
            'original_filename' => 'photo.png',
            'mime_type' => 'image/png',
        ]);
        Storage::disk('local')->put($document->stored_path, 'fake-png-bytes');

        $response = $this->actingAs($user)->get(route('documents.print', $document));

        $response->assertOk()
            ->assertSee('<img src="'.route('documents.view', $document).'"', false)
            ->assertSee('i.addEventListener("load",p)', false)
            ->assertSee('window.print()', false)
            ->assertDontSee('<iframe', false);
    }

    public function test_print_page_embeds_pdfs_with_iframe_load_aware_auto_print(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view', 'documents.print']);
        $document = $this->documentFor($this->dossierFor($company), [
            'original_filename' => 'contract.pdf',
            'mime_type' => 'application/pdf',
        ]);
        Storage::disk('local')->put($document->stored_path, '%PDF-1.4 fake');

        $response = $this->actingAs($user)->get(route('documents.print', $document));

        $response->assertOk()
            ->assertSee('<iframe src="'.route('documents.view', $document).'"', false)
            ->assertSee('f.addEventListener("load",p)', false)
            ->assertSee('window.print()', false);
    }

    public function test_print_page_is_denied_without_the_print_permission(): void
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.view']);
        $document = $this->documentFor($this->dossierFor($company));
        Storage::disk('local')->put($document->stored_path, 'hello!');

        $this->actingAs($user)
            ->get(route('documents.print', $document))
            ->assertForbidden();
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $role = Role::findOrCreate('document_print_'.Str::lower(Str::random(8)), 'web');
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
