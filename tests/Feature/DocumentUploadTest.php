<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * CIN upload regression suite (Task 8.1).
 *
 * The frontend used to send `cin_front_file` / `cin_back_file` while the
 * backend validated `file_front` / `file_back`, so every CIN upload failed
 * with generic form errors. These tests pin the backend contract and the
 * content-based MIME validation added for the CIN image fields.
 */
class DocumentUploadTest extends TestCase
{
    use RefreshDatabase;

    private const JPEG = "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00";

    private const PNG = "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde";

    private const WEBP = "RIFF\x24\x00\x00\x00WEBPVP8 \x0A\x00\x00\x00\x00\x00\x00\x00";

    private const PDF = "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF";

    public function test_authorized_user_uploads_cin_jpeg_successfully(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'status' => 'uploaded',
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ]);

        $response->assertRedirect();
        $this->assertSame(2, $dossier->documents()->count());
        $this->assertSame(1, $dossier->documents()->where('document_side', 'front')->where('mime_type', 'image/jpeg')->count());
        $this->assertSame(1, $dossier->documents()->where('document_side', 'back')->where('mime_type', 'image/jpeg')->count());
        $this->assertStoredFilesCount(2);
    }

    public function test_authorized_user_uploads_cin_png_successfully(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.png', self::PNG),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.png', self::PNG),
        ]);

        $response->assertRedirect();
        $this->assertSame(2, $dossier->documents()->count());
        $this->assertSame(1, $dossier->documents()->where('document_side', 'front')->where('mime_type', 'image/png')->count());
        $this->assertStoredFilesCount(2);
    }

    public function test_authorized_user_uploads_cin_webp_successfully(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.webp', self::WEBP),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.webp', self::WEBP),
        ]);

        $response->assertRedirect();
        $this->assertSame(2, $dossier->documents()->count());
        $this->assertSame(1, $dossier->documents()->where('document_side', 'front')->where('mime_type', 'image/webp')->count());
        $this->assertStoredFilesCount(2);
    }

    public function test_authorized_user_uploads_cin_pdf_successfully(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.pdf', self::PDF),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.pdf', self::PDF),
        ]);

        $response->assertRedirect();
        $this->assertSame(2, $dossier->documents()->count());
        $this->assertSame(1, $dossier->documents()->where('document_side', 'front')->where('mime_type', 'application/pdf')->count());
        $this->assertStoredFilesCount(2);
    }

    public function test_missing_cin_file_returns_field_level_errors(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
        ], $this->inertiaHeaders());

        $response->assertStatus(422)
            ->assertJsonValidationErrors('file_back');
        $this->assertSame(0, $dossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_invalid_mime_content_is_rejected(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        // The client truthfully declares the real (non-whitelisted) MIME of the
        // file, the same way an honest scanner or a re-encoded upload would.
        // `mimes` alone would accept it by extension; the `mimetypes` rule must
        // reject the declared content type.
        $textFile = UploadedFile::fake()->createWithContent('cin_front.png', 'just plain text');

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => new UploadedFile($textFile->getPathname(), 'cin_front.png', 'text/plain', null, true),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.png', self::PNG),
        ], $this->inertiaHeaders());

        $response->assertStatus(422)
            ->assertJsonValidationErrors('file_front');
        $this->assertSame(0, $dossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_executable_renamed_to_jpg_is_rejected(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        // A real executable payload renamed to .jpg: the client declares the
        // executable MIME type it actually carries, which must not satisfy the
        // whitelisted image/PDF MIME validation.
        $executable = UploadedFile::fake()->createWithContent('cin_front.jpg', "MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00\xB8\x00\x00\x00");

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => new UploadedFile($executable->getPathname(), 'cin_front.jpg', 'application/x-msdownload', null, true),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ], $this->inertiaHeaders());

        $response->assertStatus(422)
            ->assertJsonValidationErrors('file_front');
        $this->assertSame(0, $dossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_authorized_user_uploads_cin_jpeg_recto_and_png_verso_successfully(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.png', self::PNG),
        ]);

        $response->assertRedirect();
        $this->assertSame(2, $dossier->documents()->count());
        $this->assertSame(1, $dossier->documents()->where('document_side', 'front')->where('mime_type', 'image/jpeg')->count());
        $this->assertSame(1, $dossier->documents()->where('document_side', 'back')->where('mime_type', 'image/png')->count());
        $this->assertStoredFilesCount(2);
    }

    public function test_old_cin_front_and_cin_back_keys_do_not_satisfy_validation(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        // Regression: the frontend previously sent `cin_front_file` /
        // `cin_back_file`, which the backend never read. Those keys must not
        // satisfy the `file_front` / `file_back` requirement.
        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'cin_front_file' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
            'cin_back_file' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ], $this->inertiaHeaders());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file_front', 'file_back']);
        $this->assertSame(0, $dossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_oversized_file_is_rejected(): void
    {
        config(['documents.max_upload_kb' => 2]); // 2 KB ceiling for the test

        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG.str_repeat('x', 3 * 1024)),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ], $this->inertiaHeaders());

        $response->assertStatus(422)
            ->assertJsonValidationErrors('file_front');
        $this->assertSame(0, $dossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_missing_project_is_rejected(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $response = $this->actingAs($user)->post('/documents', [
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ], $this->inertiaHeaders());

        $response->assertStatus(422)
            ->assertJsonValidationErrors('dossier_id');
        $this->assertSame(0, $dossier->documents()->count());
    }

    public function test_project_from_another_company_is_rejected(): void
    {
        Storage::fake('local');

        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['documents.create']);
        $foreignDossier = $this->dossierFor($companyB);
        $template = $this->cinTemplate();

        $response = $this->actingAs($user)->post('/documents', [
            'dossier_id' => $foreignDossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ]);

        $response->assertNotFound();
        $this->assertSame(0, $foreignDossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_unauthorized_user_cannot_upload(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();
        $outsider = $this->userFor($company, ['documents.view']);

        $response = $this->actingAs($outsider)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ]);

        $response->assertForbidden();
        $this->assertSame(0, $dossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_failed_validation_creates_no_database_record_and_no_physical_file(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        // Text content truthfully declared as text/plain: extension passes
        // `mimes`, but the content MIME is not whitelisted.
        $textFile = UploadedFile::fake()->createWithContent('cin_front.jpg', 'not an image at all');

        $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => new UploadedFile($textFile->getPathname(), 'cin_front.jpg', 'text/plain', null, true),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ], $this->inertiaHeaders())->assertStatus(422);

        $this->assertSame(0, $dossier->documents()->count());
        $this->assertStoredFilesCount(0);
    }

    public function test_stored_path_is_server_controlled_and_never_the_original_filename(): void
    {
        [$company, $user, $dossier, $template] = $this->uploadContext();

        $this->actingAs($user)->post('/documents', [
            'dossier_id' => $dossier->id,
            'document_template_id' => $template->id,
            'file_front' => UploadedFile::fake()->createWithContent('cin_front.jpg', self::JPEG),
            'file_back' => UploadedFile::fake()->createWithContent('cin_back.jpg', self::JPEG),
        ])->assertRedirect();

        foreach ($dossier->documents()->get() as $document) {
            $this->assertNotSame('cin_front.jpg', $document->stored_path);
            $this->assertNotSame('cin_back.jpg', $document->stored_path);
            $this->assertTrue(Storage::disk('local')->exists($document->stored_path));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Mimics an Inertia request (the real client sends X-Requested-With), so
     * validation failures render as 422 JSON with field errors, exactly as the
     * browser integration receives them.
     */
    private function inertiaHeaders(): array
    {
        return [
            'X-Requested-With' => 'XMLHttpRequest',
            'Accept' => 'application/json, text/plain, */*',
        ];
    }

    private function assertStoredFilesCount(int $expected): void
    {
        $this->assertCount($expected, Storage::disk('local')->allFiles());
    }

    private function cinTemplate(): DocumentTemplate
    {
        return DocumentTemplate::query()->create([
            'name' => 'CIN',
            'code' => 'CIN',
            'document_type' => 'cin',
            'is_required' => true,
            'is_active' => true,
        ]);
    }

    private function uploadContext(): array
    {
        Storage::fake('local');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['documents.create']);
        $dossier = $this->dossierFor($company);
        $template = $this->cinTemplate();

        return [$company, $user, $dossier, $template];
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $role = Role::findOrCreate('document_upload_'.Str::lower(Str::random(8)), 'web');
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
            'full_name' => 'CLIENT TEST',
        ]);

        return Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            // Deterministic value: faker sentences end with a trailing dot,
            // which produces an invalid folder name on Windows.
            'project_object' => 'PROJET TEST',
        ]);
    }
}
