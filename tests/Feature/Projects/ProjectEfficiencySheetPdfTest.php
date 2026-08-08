<?php

namespace Tests\Feature\Projects;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectEfficiencySheet;
use App\Models\User;
use App\Services\Dossiers\DossierPathBuilder;
use App\Services\Finance\FinanceSettingsService;
use App\Services\WordDocumentConverter;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use Tests\TestCase;

/**
 * Step 6: PDF generation + DOCX/PDF download/preview/print for the fiche
 * efficacité. The existing Word COM converter is mocked (like the Contract
 * flow would be): success writes a real PDF-looking file, failure throws.
 */
class ProjectEfficiencySheetPdfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    protected function tearDown(): void
    {
        foreach ($this->createdDossiers as $dossier) {
            Storage::disk('local')->deleteDirectory(
                app(DossierPathBuilder::class)->dossierBasePath($dossier)
            );
        }

        parent::tearDown();
    }

    /** @var array<int, Dossier> */
    private array $createdDossiers = [];

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

        $dossier = Dossier::factory()->create(array_merge([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'project_object' => 'Villa Marrakech',
            'project_address' => 'Route de Casablanca, Marrakech',
        ], $overrides));

        $this->createdDossiers[] = $dossier;

        return $dossier;
    }

    private function setCompanySettings(array $values): void
    {
        foreach ($values as $key => $value) {
            FinanceSettingsService::set('company', $key, $value);
        }
    }

    private function fullCompanySettings(): void
    {
        $this->setCompanySettings([
            'company_legal_representative' => 'M. ZINE ELABIDINE ZOUHAIR',
            'company_address' => 'Immeuble nr 959 lotissement AL MASSAR Marrakech',
            'company_phone' => '0524334343',
            'company_fax' => '0524334344',
            'company_email' => 'contact@archilbo.local',
        ]);
    }

    /** Create a fiche and generate its real DOCX (Step 5 machinery). */
    private function ficheWithDocx(Company $company, array $ficheOverrides = []): array
    {
        $dossier = $this->makeDossier($company);
        $this->fullCompanySettings();

        $fiche = ProjectEfficiencySheet::factory()->create(array_merge([
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => 'Résidentiel',
            'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
        ], $ficheOverrides));

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        return [$dossier, $fiche->fresh()];
    }

    private function mockConverterSuccess(): void
    {
        $this->mock(WordDocumentConverter::class, function (MockInterface $mock) {
            $mock->shouldReceive('convertDocxToPdf')
                ->andReturnUsing(function (string $docx, string $pdf) {
                    file_put_contents($pdf, '%PDF-1.4 fake-fiche-efficacite');
                });
        });
    }

    private function mockConverterFailure(): void
    {
        $this->mock(WordDocumentConverter::class, function (MockInterface $mock) {
            $mock->shouldReceive('convertDocxToPdf')
                ->andThrow(new \RuntimeException('Word conversion failed (simulated)'));
        });
    }

    private function masterTemplatePath(): string
    {
        return (string) config('archilbo_templates.fiche_efficacite.template');
    }

    // ---------------------------------------------------------------- PDF generation

    public function test_authorized_user_generates_pdf_from_valid_docx(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);
        $docxSha = sha1_file(Storage::disk('local')->path($fiche->docx_path));

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf");

        $response->assertOk()
            ->assertJsonPath('fiche.version', 1)
            ->assertJsonPath('fiche.status', 'generated')
            ->assertJsonPath('fiche.hasDocx', true)
            ->assertJsonPath('fiche.hasPdf', true);

        $fiche->refresh();
        $this->assertNotNull($fiche->pdf_path);
        $this->assertTrue(Storage::disk('local')->exists($fiche->pdf_path));
        $this->assertGreaterThan(0, Storage::disk('local')->size($fiche->pdf_path));
        $this->assertStringStartsWith(
            '%PDF-',
            Storage::disk('local')->get($fiche->pdf_path)
        );
        // DOCX untouched by PDF conversion.
        $this->assertSame($docxSha, sha1_file(Storage::disk('local')->path($fiche->docx_path)));
    }

    public function test_pdf_generation_without_docx_fails_safely(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $this->fullCompanySettings();
        $fiche = ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => 'Résidentiel',
            'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
            'status' => 'draft',
            'version' => 1,
        ]);

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf");

        $response->assertUnprocessable()
            ->assertJsonPath('message', 'Le document DOCX doit être généré avant de créer le PDF.');

        $this->assertNull($fiche->fresh()->pdf_path);
    }

    public function test_pdf_generation_refuses_docx_with_unresolved_placeholders(): void
    {
        // Simulate a legacy DOCX generated before the full token map existed:
        // the stored file still contains [ENTREPRISE_*] placeholders. PDF
        // conversion must refuse it and ask for a fresh DOCX instead.
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $this->fullCompanySettings();

        $fiche = ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => 'Résidentiel',
            'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
            'status' => 'generated',
            'version' => 1,
        ]);

        // Place a copy of the token-bearing master template at a safe project
        // path and record it as the generated DOCX.
        $projectBase = app(DossierPathBuilder::class)->dossierBasePath($dossier);
        $legacyPath = $projectBase.'/fiche-efficacite-legacy.docx';
        Storage::disk('local')->makeDirectory(dirname($legacyPath));
        File::copy($this->masterTemplatePath(), Storage::disk('local')->path($legacyPath));
        $fiche->update(['docx_path' => $legacyPath]);

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf");

        $response->assertUnprocessable()
            ->assertJsonPath('message', 'Le document DOCX doit être généré avant de créer le PDF.');

        $this->assertNull($fiche->fresh()->pdf_path);
    }

    public function test_pdf_is_stored_next_to_docx_with_same_version_name(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $fiche->refresh();
        $this->assertSame(
            str_replace('.docx', '.pdf', $fiche->docx_path),
            $fiche->pdf_path
        );
        $this->assertStringContainsString('archilbo/DATA/', $fiche->pdf_path);
        $this->assertStringEndsWith('-v1.pdf', $fiche->pdf_path);
        // Relative path: no drive/leading slash.
        $this->assertSame(0, preg_match('#^(/|\\\\)#', $fiche->pdf_path));
        $this->assertDoesNotMatchRegularExpression('/^[A-Za-z]:/', $fiche->pdf_path);
    }

    public function test_generating_pdf_does_not_increment_version(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk()
            ->assertJsonPath('fiche.version', 1);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk()
            ->assertJsonPath('fiche.version', 1);

        $fiche->refresh();
        $this->assertSame(1, $fiche->version);
    }

    public function test_master_template_stays_unchanged_after_pdf_generation(): void
    {
        $this->mockConverterSuccess();
        $before = sha1_file($this->masterTemplatePath());
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $this->assertSame($before, sha1_file($this->masterTemplatePath()));
    }

    public function test_pdf_generation_records_an_audit_event(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);
        $user = $this->userWithRole('manager', $company);

        $this->actingAs($user)
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'efficiency_sheet.pdf_generated',
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
        ]);
    }

    // ------------------------------------------------------------ PDF generation failures

    public function test_conversion_failure_keeps_docx_and_stores_no_pdf_path(): void
    {
        $this->mockConverterFailure();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);
        $docxSha = sha1_file(Storage::disk('local')->path($fiche->docx_path));

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf");

        $response->assertStatus(500)
            ->assertJsonPath('message', 'La génération du PDF a échoué.')
            ->assertJsonMissingPath('pdf_path');

        $fiche->refresh();
        $this->assertNull($fiche->pdf_path);
        $this->assertTrue(Storage::disk('local')->exists($fiche->docx_path));
        $this->assertSame($docxSha, sha1_file(Storage::disk('local')->path($fiche->docx_path)));
        $this->assertFalse(Storage::disk('local')->exists(
            str_replace('.docx', '.pdf', $fiche->docx_path)
        ));
    }

    public function test_conversion_failure_does_not_mark_pdf_available(): void
    {
        $this->mockConverterFailure();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertStatus(500);

        // Drawer payload after a failed attempt still says no PDF.
        $this->actingAs($this->userWithRole('manager', $company))
            ->getJson("/dossiers/{$dossier->id}/efficiency-sheet")
            ->assertOk()
            ->assertJsonPath('fiche.hasPdf', false);
    }

    public function test_incomplete_partial_output_is_cleaned_up(): void
    {
        $this->mock(WordDocumentConverter::class, function (MockInterface $mock) {
            $mock->shouldReceive('convertDocxToPdf')
                ->andReturnUsing(function (string $docx, string $pdf) {
                    file_put_contents($pdf, '');
                    throw new \RuntimeException('empty output (simulated)');
                });
        });

        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertStatus(500);

        $pdfDir = dirname(str_replace('.docx', '.pdf', $fiche->fresh()->docx_path));
        $leftovers = Storage::disk('local')->files($pdfDir);

        foreach ($leftovers as $file) {
            $this->assertStringNotContainsString('.part', $file, 'Partial PDF must be cleaned.');
        }
    }

    // --------------------------------------------------------------- PDF auth + scoping

    public function test_generate_pdf_requires_generate_permission(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('viewer', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertForbidden();

        $this->assertNull($fiche->fresh()->pdf_path);
    }

    public function test_generate_pdf_hides_dossiers_from_other_companies(): void
    {
        $this->mockConverterSuccess();
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        [$dossierB, $ficheB] = $this->ficheWithDocx($companyB);

        $this->actingAs($this->userWithRole('manager', $companyA))
            ->postJson("/dossiers/{$dossierB->id}/efficiency-sheet/{$ficheB->id}/generate-pdf")
            ->assertNotFound();
    }

    public function test_generate_pdf_rejects_fiche_of_another_project(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        $dossierA = $this->makeDossier($company);
        [$dossierB, $ficheB] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossierA->id}/efficiency-sheet/{$ficheB->id}/generate-pdf")
            ->assertNotFound();
    }

    // ---------------------------------------------------------------- DOCX download

    public function test_authorized_user_downloads_existing_docx(): void
    {
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/docx");

        $response->assertOk();
        $this->assertStringContainsString('attachment', (string) $response->headers->get('content-disposition'));
        $this->assertStringContainsString(
            basename($fiche->docx_path),
            (string) $response->headers->get('content-disposition')
        );
        $this->assertStringContainsString(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            (string) $response->headers->get('content-type')
        );
    }

    public function test_viewer_can_download_generated_docx(): void
    {
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('viewer', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/docx")
            ->assertOk();
    }

    public function test_missing_docx_file_returns_controlled_404(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'status' => 'generated',
            'version' => 1,
            'docx_path' => 'archilbo/DATA/Ville/Commune/Client/Projet/Fiche_Efficacite/fiche-efficacite-dos_2026_0001-v1.docx',
        ]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/docx")
            ->assertNotFound()
            ->assertJsonPath('message', 'Le fichier généré est introuvable.');
    }

    public function test_docx_download_requires_download_permission(): void
    {
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('finance_admin', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/docx")
            ->assertForbidden();
    }

    public function test_cross_project_docx_download_denied(): void
    {
        $company = Company::factory()->create();
        $dossierA = $this->makeDossier($company);
        [$dossierB, $ficheB] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossierA->id}/efficiency-sheet/{$ficheB->id}/download/docx")
            ->assertNotFound();
    }

    public function test_master_template_path_cannot_be_served_as_docx(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'status' => 'generated',
            'version' => 1,
            'docx_path' => 'archi-templates/fiche_efficacite/fiche_efficacite.docx',
        ]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/docx")
            ->assertNotFound();
    }

    public function test_arbitrary_query_path_is_ignored(): void
    {
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/docx?path=../../secret.txt&file=evil.pdf");

        $response->assertOk();
        $this->assertStringContainsString(
            basename($fiche->docx_path),
            (string) $response->headers->get('content-disposition')
        );
    }

    // ------------------------------------------------------------------ PDF download/preview

    public function test_authorized_user_downloads_pdf(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/pdf");

        $response->assertOk();
        $this->assertStringContainsString('attachment', (string) $response->headers->get('content-disposition'));
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));
    }

    public function test_authorized_user_previews_pdf_inline(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/preview/pdf");

        $response->assertOk();
        $this->assertStringContainsString('inline', (string) $response->headers->get('content-disposition'));
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));
    }

    public function test_print_route_returns_inline_pdf(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $response = $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/print");

        $response->assertOk();
        $this->assertStringContainsString('inline', (string) $response->headers->get('content-disposition'));
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));
    }

    public function test_missing_pdf_returns_controlled_404(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        // DOCX exists, PDF never generated.
        $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/preview/pdf")
            ->assertNotFound()
            ->assertJsonPath('message', 'Le fichier généré est introuvable.');

        $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/pdf")
            ->assertNotFound();
    }

    public function test_cross_project_pdf_preview_and_download_denied(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        $dossierA = $this->makeDossier($company);
        [$dossierB, $ficheB] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossierB->id}/efficiency-sheet/{$ficheB->id}/generate-pdf")
            ->assertOk();

        $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossierA->id}/efficiency-sheet/{$ficheB->id}/preview/pdf")
            ->assertNotFound();

        $this->actingAs($this->userWithRole('manager', $company))
            ->get("/dossiers/{$dossierA->id}/efficiency-sheet/{$ficheB->id}/download/pdf")
            ->assertNotFound();
    }

    public function test_pdf_download_requires_download_permission(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $this->actingAs($this->userWithRole('finance_admin', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/pdf")
            ->assertForbidden();
    }

    // ------------------------------------------------------------------ path safety

    public function test_traversal_and_absolute_paths_are_rejected(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);

        foreach ([
            'archilbo/DATA/../../secret.txt',
            '..\\..\\secret.txt',
            'C:\\Windows\\win.ini',
            'D:\\secret\\file.docx',
            '/etc/passwd',
            'C:/secret.docx',
            'archilbo/OTHER/fiche.docx',
            'archilbo/DATA/Client/Projet/Fiche_Efficacite/fiche-efficacite-v1.exe',
        ] as $unsafePath) {
            $fiche = ProjectEfficiencySheet::factory()->create([
                'dossier_id' => $dossier->id,
                'status' => 'generated',
                'version' => 1,
                'docx_path' => $unsafePath,
            ]);

            $this->actingAs($this->userWithRole('manager', $company))
                ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/docx")
                ->assertNotFound();

            $fiche->forceDelete();
        }
    }

    // ------------------------------------------------------------------ permission matrix

    public function test_permission_matrix_generate_pdf(): void
    {
        $this->mockConverterSuccess();

        // Aucun project access: no fiche access at all.
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('finance_admin', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertForbidden();

        // Voir: cannot generate PDF.
        $this->actingAs($this->userWithRole('viewer', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertForbidden();

        // Modifier: can generate PDF.
        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        // Complet: can generate PDF.
        $this->actingAs($this->userWithRole('admin', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();
    }

    public function test_viewer_can_preview_and_download_pdf(): void
    {
        $this->mockConverterSuccess();
        $company = Company::factory()->create();
        [$dossier, $fiche] = $this->ficheWithDocx($company);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-pdf")
            ->assertOk();

        $this->actingAs($this->userWithRole('viewer', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/preview/pdf")
            ->assertOk();

        $this->actingAs($this->userWithRole('viewer', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/download/pdf")
            ->assertOk();

        $this->actingAs($this->userWithRole('viewer', $company))
            ->get("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/print")
            ->assertOk();
    }
}
