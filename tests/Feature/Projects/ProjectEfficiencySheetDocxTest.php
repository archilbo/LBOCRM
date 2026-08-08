<?php

namespace Tests\Feature\Projects;

use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\ProjectEfficiencySheet;
use App\Models\User;
use App\Services\Dossiers\DossierPathBuilder;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Projects\ProjectEfficiencySheetGenerator;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class ProjectEfficiencySheetDocxTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    protected function tearDown(): void
    {
        // Keep generated test files from leaking into project storage.
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

    private function readyFiche(Dossier $dossier): ProjectEfficiencySheet
    {
        return ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => 'Résidentiel',
            'owner_name' => 'M. ZINE ELABIDINE ZOUHAIR',
        ]);
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

    private function masterTemplatePath(): string
    {
        return (string) config('archilbo_templates.fiche_efficacite.template');
    }

    private function generatedXml(string $absoluteDocxPath): string
    {
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($absoluteDocxPath) === true, 'Generated DOCX must be a valid zip.');
        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        $this->assertNotFalse($xml, 'Generated DOCX must contain word/document.xml.');

        return $xml;
    }

    /**
     * Runs merged per paragraph (w:t concatenation) from word/document.xml,
     * mirroring how Word renders each line — the level at which the legacy
     * flattening bug was destroying the layout.
     *
     * Only "leaf" paragraphs are returned: anchored textbox containers
     * (w:drawing > w:txbxContent) embed whole paragraphs inside a single
     * <w:p>, so their descendant text spans every embedded line. Checking
     * the leaf lines is exactly what Word renders.
     *
     * @return list<string>
     */
    private function mergedParagraphTexts(string $absoluteDocxPath): array
    {
        $xml = $this->generatedXml($absoluteDocxPath);

        $dom = new \DOMDocument;
        libxml_use_internal_errors(true);
        $dom->loadXML($xml, LIBXML_PARSEHUGE);
        $xpath = new \DOMXPath($dom);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $texts = [];
        foreach ($xpath->query('//w:p') as $p) {
            if ($xpath->query('.//w:p', $p)->length > 0) {
                continue;
            }

            $text = '';
            foreach ($xpath->query('.//w:t', $p) as $t) {
                $text .= $t->textContent;
            }
            $texts[] = $text;
        }

        return $texts;
    }

    public function test_placeholder_map_contains_every_template_token(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $generator = app(ProjectEfficiencySheetGenerator::class);
        $map = $generator->placeholderMap($fiche);

        $this->assertSame([
            'USAGE_DU_BATIMENT',
            'NOM_PROJET',
            'PROJET_ADDRESS',
            'NOM_PRENOM_DOUVRAGE',
            'CLIENT_ADDRESS',
            'ENTREPRISE_PHONE',
            'ENTREPRISE_FAX',
            'ENTREPRISE_CEO',
            'ENTREPRISE_ADDRESS',
            'ENTREPRISE_MAIL',
        ], array_keys($map));
    }

    public function test_authorized_user_generates_docx_v1_in_project_folder(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();
        $user = $this->userWithRole('manager', $company);

        $response = $this->actingAs($user)
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx");

        $response->assertOk()
            ->assertJsonPath('fiche.status', 'generated')
            ->assertJsonPath('fiche.version', 1)
            ->assertJsonPath('fiche.manual.usageDuBatiment', 'Résidentiel');

        $fiche->refresh();
        $this->assertSame('generated', $fiche->status);
        $this->assertSame(1, $fiche->version);
        $this->assertSame($user->id, $fiche->generated_by);
        $this->assertNotNull($fiche->generated_at);
        $this->assertStringEndsWith('.docx', $fiche->docx_path);

        $expected = app(DossierPathBuilder::class)->efficiencySheetDocxPath($fiche, $dossier, 1);
        $this->assertSame($expected, $fiche->docx_path);
        $this->assertStringContainsString('archilbo/DATA/', $fiche->docx_path);
        $this->assertTrue(Storage::disk('local')->exists($fiche->docx_path));
        $this->assertGreaterThan(0, Storage::disk('local')->size($fiche->docx_path));
    }

    public function test_generated_docx_replaces_all_placeholders_with_values(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $fiche->refresh();
        $xml = $this->generatedXml(Storage::disk('local')->path($fiche->docx_path));

        foreach ([
            'USAGE_DU_BATIMENT', 'NOM_PROJET', 'PROJET_ADDRESS', 'NOM_PRENOM_DOUVRAGE',
            'CLIENT_ADDRESS', 'ENTREPRISE_PHONE', 'ENTREPRISE_FAX',
            'ENTREPRISE_CEO', 'ENTREPRISE_ADDRESS', 'ENTREPRISE_MAIL',
        ] as $token) {
            $this->assertStringNotContainsString('['.$token.']', $xml, "Token [$token] must be replaced.");
        }

        $this->assertStringContainsString('Résidentiel', $xml);
        $this->assertStringContainsString('Villa Marrakech', $xml);
        $this->assertStringContainsString('Route de Casablanca, Marrakech', $xml);
        $this->assertStringContainsString('M. ZINE ELABIDINE ZOUHAIR', $xml);
        $this->assertStringContainsString('Avenue Mohammed V, Casablanca', $xml);
        $this->assertStringContainsString('0524334343', $xml);
        $this->assertStringContainsString('0524334344', $xml);
        // Fragmented ENTREPRISE tokens: values must appear, tokens must not.
        $this->assertStringContainsString('Immeuble nr 959 lotissement AL MASSAR Marrakech', $xml);
        $this->assertStringContainsString('contact@archilbo.local', $xml);
    }

    public function test_generated_docx_contains_no_placeholder_pattern_at_all(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $fiche->refresh();
        $docxPath = Storage::disk('local')->path($fiche->docx_path);

        // Pattern-based scan over run-merged paragraph text: NOTHING shaped
        // like [UPPER_CASE_TOKEN] may survive, mapped or not.
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($docxPath) === true);
        $texts = [];
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $name = $zip->getNameIndex($index);
            if (! $name || ! str_starts_with($name, 'word/') || ! str_ends_with($name, '.xml')) {
                continue;
            }
            $xml = $zip->getFromName($name);
            if ($xml === false) {
                continue;
            }
            $dom = new \DOMDocument;
            libxml_use_internal_errors(true);
            $dom->loadXML($xml, LIBXML_PARSEHUGE);
            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
            foreach ($xpath->query('//w:p') as $p) {
                $text = '';
                foreach ($xpath->query('.//w:t', $p) as $t) {
                    $text .= $t->textContent;
                }
                $texts[] = $text;
            }
        }
        $zip->close();

        foreach ($texts as $text) {
            $this->assertSame(0, preg_match_all('/\[[A-Z][A-Z0-9_]+\]/', $text), "Unresolved placeholder in: $text");
        }
    }

    public function test_regeneration_bumps_version_and_keeps_previous_file(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();
        $user = $this->userWithRole('manager', $company);

        $this->actingAs($user)
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $firstPath = $fiche->fresh()->docx_path;
        $this->assertTrue(Storage::disk('local')->exists($firstPath));

        $this->actingAs($user)
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk()
            ->assertJsonPath('fiche.version', 2);

        $fiche->refresh();
        $this->assertSame(2, $fiche->version);
        $this->assertStringEndsWith('-v2.docx', $fiche->docx_path);
        $this->assertTrue(Storage::disk('local')->exists($fiche->docx_path));
        // Previous version file is preserved, never overwritten/deleted.
        $this->assertTrue(Storage::disk('local')->exists($firstPath));
    }

    public function test_master_template_stays_byte_for_byte_unchanged(): void
    {
        $before = sha1_file($this->masterTemplatePath());
        $this->assertNotFalse($before);

        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $this->assertSame($before, sha1_file($this->masterTemplatePath()));
    }

    public function test_generation_records_an_audit_event(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();
        $user = $this->userWithRole('manager', $company);

        $this->actingAs($user)
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => 'efficiency_sheet.generated',
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
        ]);
    }

    public function test_generate_requires_generate_permission(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('viewer', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertForbidden();

        $this->assertNull($fiche->fresh()->docx_path);
    }

    public function test_generate_hides_dossiers_from_other_companies(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $dossier = $this->makeDossier($companyB);
        $fiche = $this->readyFiche($dossier);

        $this->actingAs($this->userWithRole('manager', $companyA))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertNotFound();
    }

    public function test_generate_rejects_a_fiche_belonging_to_another_project(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $otherDossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create(['dossier_id' => $otherDossier->id]);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertNotFound();
    }

    public function test_generate_fails_cleanly_when_automatic_values_are_missing(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company, [
            'project_address' => null,
            'client_address' => null,
        ]);
        $fiche = $this->readyFiche($dossier);
        $this->clearCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertUnprocessable()
            ->assertJsonPath('missingFields', [
                'PROJET_ADDRESS',
                'CLIENT_ADDRESS',
                'ENTREPRISE_PHONE',
                'ENTREPRISE_FAX',
                'ENTREPRISE_CEO',
                'ENTREPRISE_ADDRESS',
                'ENTREPRISE_MAIL',
            ]);

        $fiche->refresh();
        $this->assertSame('draft', $fiche->status);
        $this->assertNull($fiche->docx_path);
    }

    public function test_generate_fails_cleanly_when_manual_fields_are_missing(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = ProjectEfficiencySheet::factory()->create([
            'dossier_id' => $dossier->id,
            'usage_du_batiment' => null,
            'owner_name' => null,
        ]);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertUnprocessable()
            ->assertJsonPath('missingFields', ['USAGE_DU_BATIMENT', 'NOM_PRENOM_DOUVRAGE']);

        $fiche->refresh();
        $this->assertSame('draft', $fiche->status);
        $this->assertNull($fiche->docx_path);
    }

    public function test_generate_fails_when_entreprise_ceo_is_missing(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->clearCompanySettings();
        $this->setCompanySettings([
            'company_address' => 'Immeuble nr 959 Marrakech',
            'company_phone' => '0524334343',
            'company_fax' => '0524334344',
            'company_email' => 'contact@archilbo.local',
            // company_legal_representative deliberately empty
        ]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertUnprocessable()
            ->assertJsonPath('missingFields', ['ENTREPRISE_CEO']);

        $this->assertNull($fiche->fresh()->docx_path);
    }

    public function test_generate_fails_when_entreprise_address_is_missing(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->clearCompanySettings();
        $this->setCompanySettings([
            'company_legal_representative' => 'M. ZINE ELABIDINE ZOUHAIR',
            'company_phone' => '0524334343',
            'company_fax' => '0524334344',
            'company_email' => 'contact@archilbo.local',
            // company_address deliberately empty
        ]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertUnprocessable()
            ->assertJsonPath('missingFields', ['ENTREPRISE_ADDRESS']);

        $this->assertNull($fiche->fresh()->docx_path);
    }

    public function test_generate_fails_when_entreprise_mail_is_missing(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->clearCompanySettings();
        $this->setCompanySettings([
            'company_legal_representative' => 'M. ZINE ELABIDINE ZOUHAIR',
            'company_address' => 'Immeuble nr 959 Marrakech',
            'company_phone' => '0524334343',
            'company_fax' => '0524334344',
            // company_email deliberately empty
        ]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertUnprocessable()
            ->assertJsonPath('missingFields', ['ENTREPRISE_MAIL']);

        $this->assertNull($fiche->fresh()->docx_path);
    }

    public function test_generate_fails_cleanly_when_template_contains_unknown_token(): void
    {
        // Copy the master template into a scratch location and inject a token
        // the map does not know: generation must fail with that exact code
        // instead of silently shipping an unresolved placeholder.
        $scratch = storage_path('app/private/tests-fixtures/fiche_efficacite-unknown-token.docx');
        File::ensureDirectoryExists(dirname($scratch));
        File::copy($this->masterTemplatePath(), $scratch);

        try {
            $zip = new ZipArchive;
            $this->assertTrue($zip->open($scratch) === true);
            $xml = $zip->getFromName('word/document.xml');
            $this->assertNotFalse($xml);
            $injected = str_replace(
                'USAGE_DU_BATIMENT',
                'USAGE_DU_BATIMENT][UNKNOWN_TOKEN_XYZ',
                $xml
            );
            $zip->addFromString('word/document.xml', $injected);
            $zip->close();

            config(['archilbo_templates.fiche_efficacite.template' => $scratch]);

            $company = Company::factory()->create();
            $dossier = $this->makeDossier($company);
            $fiche = $this->readyFiche($dossier);
            $this->fullCompanySettings();

            $this->actingAs($this->userWithRole('manager', $company))
                ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
                ->assertUnprocessable()
                ->assertJsonPath('missingFields', ['UNKNOWN_TOKEN_XYZ']);

            $this->assertNull($fiche->fresh()->docx_path);
        } finally {
            if (File::exists($scratch)) {
                File::delete($scratch);
            }

            config(['archilbo_templates.fiche_efficacite.template' => $this->masterTemplatePath()]);
        }
    }

    public function test_generation_failure_cleans_up_and_leaves_fiche_untouched(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        config(['archilbo_templates.fiche_efficacite.template' => storage_path('app/private/archi-templates/fiche_efficacite/does-not-exist.docx')]);

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertStatus(500)
            ->assertJsonPath('message', 'La génération de la fiche a échoué. Réessayez plus tard.');

        $fiche->refresh();
        $this->assertSame('draft', $fiche->status);
        $this->assertNull($fiche->docx_path);
        $this->assertNull($fiche->generated_at);
        $this->assertNull($fiche->generated_by);
    }

    /**
     * The generated DOCX must keep the master's run-level structure exactly:
     * same paragraph count, same run count, same number of multi-run
     * paragraphs, same tables/rows/cells and sections. This is the regression
     * guard for the legacy flattening bug that collapsed every paragraph
     * containing a token into a single run (and destroyed the anchored
     * textbox lines).
     */
    public function test_generated_docx_preserves_master_run_structure(): void
    {
        $master = $this->generatedXml($this->masterTemplatePath());
        $masterDom = new \DOMDocument;
        libxml_use_internal_errors(true);
        $masterDom->loadXML($master, LIBXML_PARSEHUGE);
        $masterXpath = new \DOMXPath($masterDom);
        $masterXpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $countMaster = static function (\DOMXPath $xpath, string $query, ?\DOMElement $context = null): int {
            return $xpath->query($query, $context)->length;
        };

        $masterParas = $countMaster($masterXpath, '//w:p');
        $masterRuns = $countMaster($masterXpath, '//w:r');
        $masterMultiRun = 0;
        foreach ($masterXpath->query('//w:p') as $p) {
            if ($countMaster($masterXpath, './/w:r', $p) > 1) {
                $masterMultiRun++;
            }
        }
        $masterTables = $countMaster($masterXpath, '//w:tbl');
        $masterRows = $countMaster($masterXpath, '//w:tr');
        $masterCells = $countMaster($masterXpath, '//w:tc');
        $masterSections = $countMaster($masterXpath, '//w:sectPr');

        $this->assertGreaterThan(100, $masterRuns, 'Sanity: the master really is a multi-run document.');

        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $fiche->refresh();
        $generated = $this->generatedXml(Storage::disk('local')->path($fiche->docx_path));
        $generatedDom = new \DOMDocument;
        libxml_use_internal_errors(true);
        $generatedDom->loadXML($generated, LIBXML_PARSEHUGE);
        $generatedXpath = new \DOMXPath($generatedDom);
        $generatedXpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $this->assertSame($masterParas, $countMaster($generatedXpath, '//w:p'), 'Paragraph count must match the master.');
        $this->assertSame($masterRuns, $countMaster($generatedXpath, '//w:r'), 'Run count must match the master (no run may be deleted or merged).');

        $generatedMultiRun = 0;
        foreach ($generatedXpath->query('//w:p') as $p) {
            if ($countMaster($generatedXpath, './/w:r', $p) > 1) {
                $generatedMultiRun++;
            }
        }
        $this->assertSame($masterMultiRun, $generatedMultiRun, 'Multi-run paragraph count must match the master.');

        $this->assertSame($masterTables, $countMaster($generatedXpath, '//w:tbl'), 'Table count must match the master.');
        $this->assertSame($masterRows, $countMaster($generatedXpath, '//w:tr'), 'Row count must match the master.');
        $this->assertSame($masterCells, $countMaster($generatedXpath, '//w:tc'), 'Cell count must match the master.');
        $this->assertSame($masterSections, $countMaster($generatedXpath, '//w:sectPr'), 'Section count must match the master.');
    }

    /**
     * The generated DOCX must contain EXACTLY the same zip entries as the
     * master, and every shared word/*.xml part must be byte-for-byte
     * identical (the engine may only rewrite parts that contain
     * placeholders and never re-encode style definitions).
     */
    public function test_generated_docx_preserves_style_definitions_byte_for_byte(): void
    {
        $masterZip = new ZipArchive;
        $this->assertTrue($masterZip->open($this->masterTemplatePath()) === true);

        $masterEntries = [];
        for ($index = 0; $index < $masterZip->numFiles; $index++) {
            $masterEntries[] = $masterZip->getNameIndex($index);
        }
        $masterZip->close();

        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $fiche->refresh();
        $generatedZip = new ZipArchive;
        $this->assertTrue($generatedZip->open(Storage::disk('local')->path($fiche->docx_path)) === true);

        $generatedEntries = [];
        for ($index = 0; $index < $generatedZip->numFiles; $index++) {
            $generatedEntries[] = $generatedZip->getNameIndex($index);
        }

        $this->assertSame(
            $masterEntries,
            $generatedEntries,
            'The generated DOCX must contain exactly the same zip entries as the master.'
        );

        foreach ($masterEntries as $entry) {
            $reopened = new ZipArchive;
            $this->assertTrue($reopened->open($this->masterTemplatePath()) === true);
            $masterContent = $reopened->getFromName($entry);
            $reopened->close();

            $generatedContent = $generatedZip->getFromName($entry);
            $this->assertNotFalse($generatedContent, "Generated DOCX must contain {$entry}.");

            // Parts holding placeholders are expected to change (that is the
            // whole point of the replacement); everything else — styles,
            // settings, drawings, relationships, the document shell without
            // tokens — must stay byte-for-byte identical.
            if (preg_match('/\[[A-Z][A-Z0-9_]+\]/', $masterContent) === 1) {
                continue;
            }

            $this->assertSame(
                hash('sha256', $masterContent),
                hash('sha256', $generatedContent),
                "{$entry} must stay byte-for-byte identical to the master (no placeholder pattern was present)."
            );
        }
        $generatedZip->close();
    }

    /**
     * Field lines must stay separate paragraphs exactly like the master:
     * headings keep only their own text (no merged neighbours), and each
     * field value lands in its own line. Guards against the bold-bleed /
     * one-line collapse of the legacy pipeline.
     */
    public function test_generated_docx_keeps_field_lines_separate(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $fiche->refresh();
        $texts = $this->mergedParagraphTexts(Storage::disk('local')->path($fiche->docx_path));

        // No paragraph may glue a heading to the fields that follow it.
        foreach ($texts as $text) {
            $this->assertSame(
                0,
                preg_match('/^Identification du projet.*Usage du bâtiment/s', $text),
                "Heading must not bleed into the field lines: {$text}"
            );
        }

        // The heading paragraphs keep exactly their own text.
        $headingCount = count(array_filter(
            $texts,
            static fn (string $text): bool => trim($text) === 'Identification du projet'
        ));
        $this->assertSame(2, $headingCount, 'The two heading lines must stay isolated.');

        // Each field renders as its own line containing its own value.
        $mailLine = array_filter(
            $texts,
            static fn (string $text): bool => str_starts_with(trim($text), 'E-mail:')
        );
        $this->assertNotEmpty($mailLine, 'An E-mail: line must exist.');
        foreach ($mailLine as $line) {
            $this->assertStringContainsString('contact@archilbo.local', $line);
        }

        $usageLine = array_filter(
            $texts,
            static fn (string $text): bool => str_starts_with(trim($text), 'Usage du bâtiment:')
        );
        $this->assertNotEmpty($usageLine, 'A Usage du bâtiment: line must exist.');
        foreach ($usageLine as $line) {
            $this->assertStringContainsString('Résidentiel', $line);
        }
    }

    /**
     * The signatory value ([ENTREPRISE_CEO]) must appear exactly once per
     * signatory block (2 blocks) and only inside its own "Nom & prénom:"
     * signatory lines — never duplicated into other fields by a
     * paragraph-level merge. (The fixture owner name equals the CEO name, so
     * the check is scoped to the signatory label to stay unambiguous.)
     */
    public function test_generated_docx_places_ceo_only_in_signatory_lines(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->makeDossier($company);
        $fiche = $this->readyFiche($dossier);
        $this->fullCompanySettings();

        $this->actingAs($this->userWithRole('manager', $company))
            ->postJson("/dossiers/{$dossier->id}/efficiency-sheet/{$fiche->id}/generate-docx")
            ->assertOk();

        $fiche->refresh();
        $texts = $this->mergedParagraphTexts(Storage::disk('local')->path($fiche->docx_path));

        $ceoValue = 'M. ZINE ELABIDINE ZOUHAIR';
        $signatoryLines = array_filter(
            $texts,
            static fn (string $text): bool => str_starts_with(trim($text), 'Nom & prénom:')
        );

        $this->assertCount(2, $signatoryLines, 'Exactly two signatory lines must exist (one per signatory block).');

        foreach ($signatoryLines as $line) {
            $this->assertStringContainsString($ceoValue, $line, 'CEO value must stay inside its signatory line.');
        }
    }
}
