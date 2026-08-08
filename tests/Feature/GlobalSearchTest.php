<?php

namespace Tests\Feature;

use App\Models\ArchiveRecord;
use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GlobalSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_archive_metadata_is_returned_structurally_for_authorized_project_results(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers', 'manage archives']);

        $dossier = $this->dossierWithArchive($company, 'Architecture ESSAI R+2', 'ARC-2026-0001', 'SALLE-B', 'MAR', 'Ahmed Alaoui');

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'essai']))
            ->assertOk()
            ->assertJsonPath('results.0.id', 'dossier-' . $dossier->id)
            ->assertJsonPath('results.0.type', 'Project')
            ->assertJsonPath('results.0.archive.city', 'MARRAKECH')
            ->assertJsonPath('results.0.archive.number', 'ARC-2026-0001')
            ->assertJsonPath('results.0.archive.room', 'SALLE-B')
            ->assertJsonPath('results.0.archive.requestedBy', 'Ahmed Alaoui')
            ->assertJsonPath('results.0.archive.href', '/archives/' . $dossier->archiveRecord->id)
            ->assertJsonPath('results.0.archive.cityColor', $dossier->city->color);
    }

    public function test_archive_metadata_is_absent_without_archive_permission(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers']);

        $dossier = $this->dossierWithArchive($company, 'Architecture ESSAI R+2', 'ARC-2026-0001', 'SALLE-B');

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'essai']))
            ->assertOk()
            ->assertJsonPath('results.0.id', 'dossier-' . $dossier->id)
            ->assertJsonPath('results.0.archive', null);
    }

    public function test_archive_metadata_is_excluded_for_other_companies(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['manage dossiers', 'manage archives']);

        $own = $this->dossierWithArchive($companyA, 'Architecture ESSAI R+2', 'ARC-2026-0001', 'SALLE-B', 'MAR');
        $foreign = $this->dossierWithArchive($companyB, 'Architecture ESSAI R+2', 'ARC-2026-9999', 'SALLE-X', 'RAB', null, 'RABAT');

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'essai']))
            ->assertOk()
            ->assertJsonCount(2, 'results')
            ->assertJsonPath('results.0.id', 'dossier-' . $own->id)
            ->assertJsonPath('results.1.id', 'archive-' . $own->archiveRecord->id)
            ->assertDontSee($foreign->archive_number);
    }

    public function test_missing_archive_fields_are_nullable(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers', 'manage archives']);

        $this->dossierWithArchive($company, 'Architecture ESSAI R+2', 'ARC-2026-0001', null);

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'essai']))
            ->assertOk()
            ->assertJsonPath('results.0.archive.room', null)
            ->assertJsonPath('results.0.archive.city', 'MARRAKECH');
    }

    public function test_result_shape_remains_backward_compatible(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers', 'manage archives']);

        $dossier = $this->dossierWithArchive($company, 'Architecture ESSAI R+2', 'ARC-2026-0001', 'SALLE-B');

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'essai']))
            ->assertOk()
            ->assertJsonPath('results.0.id', 'dossier-' . $dossier->id)
            ->assertJsonPath('results.0.type', 'Project')
            ->assertJsonStructure([
                'results' => [
                    [
                        'id',
                        'type',
                        'title',
                        'subtitle',
                        'href',
                        'badge',
                    ],
                ],
            ]);
    }

    public function test_multi_word_query_matches_each_token_across_relations(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers']);

        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'full_name' => 'Ahmed Alaoui',
        ]);

        $dossier = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'project_object' => 'Architecture ESSAI R+2',
        ]);

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'ahmed essai']))
            ->assertOk()
            ->assertJsonCount(1, 'results')
            ->assertJsonPath('results.0.id', 'dossier-' . $dossier->id);
    }

    public function test_like_wildcards_in_query_are_escaped(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers']);

        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]);

        $literal = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'project_object' => 'Villa R+2% extension',
        ]);

        Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'project_object' => 'Villa R+2 simple',
        ]);

        $this->actingAs($user)
            ->getJson(route('global-search.index', ['q' => 'R+2%']))
            ->assertOk()
            ->assertJsonCount(1, 'results')
            ->assertJsonPath('results.0.id', 'dossier-' . $literal->id);
    }

    public function test_short_or_blank_queries_return_no_results(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers']);

        $this->dossierWithArchive($company, 'Architecture ESSAI R+2', 'ARC-2026-0001', 'SALLE-B');

        foreach (['e', '  ', '  e  '] as $query) {
            $this->actingAs($user)
                ->getJson(route('global-search.index', ['q' => $query]))
                ->assertOk()
                ->assertJsonCount(0, 'results');
        }
    }

    public function test_search_at_volume_stays_fast_and_query_bounded(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, [
            'manage clients',
            'manage dossiers',
            'manage documents',
            'manage contracts',
            'manage archives',
            'finance.view',
        ]);

        // Seed a realistic volume; every category contains the "villa" needle.
        Client::factory()->count(120)->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'full_name' => fn () => 'Client ' . Str::random(6) . ' Villa',
        ]);

        $dossiers = Dossier::factory()->count(120)->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'project_object' => fn () => 'Villa Residence ' . Str::random(6),
        ]);

        foreach ($dossiers->take(80)->values() as $index => $dossier) {
            ArchiveRecord::create([
                'dossier_id' => $dossier->id,
                'archive_number' => 'ARC-VILLA-' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                'status' => 'stored',
                'room' => 'SALLE-' . ($index % 4),
            ]);

            Contract::create([
                'dossier_id' => $dossier->id,
                'contract_number' => 'CT-VILLA-' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                'status' => 'draft',
            ]);

            DossierDocument::create([
                'dossier_id' => $dossier->id,
                'document_number' => 'DOC-VILLA-' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                'original_filename' => 'Villa-Plan-' . $index . '.pdf',
                'status' => 'ready',
            ]);

            FinanceDocument::create([
                'company_id' => $company->id,
                'branch_id' => null,
                'dossier_id' => $dossier->id,
                'number' => 'FAC-VILLA-' . str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                'type' => 'invoice',
                'status' => 'draft',
            ]);
        }

        $queries = 0;
        DB::listen(function () use (&$queries) {
            $queries++;
        });

        $startedAt = microtime(true);
        $response = $this->actingAs($user)->getJson(route('global-search.index', ['q' => 'villa']));
        $elapsedMs = (microtime(true) - $startedAt) * 1000;

        $response->assertOk();

        $results = $response->json('results');
        $this->assertLessThanOrEqual(18, count($results), 'Results must respect the global cap.');
        $this->assertSame(
            ['Client', 'Project', 'Document', 'Contract', 'Finance', 'Archive'],
            array_values(array_unique(array_column($results, 'type'))),
            'Every authorized category must contribute results.',
        );
        $this->assertLessThan(30, $queries, 'Search must stay bounded (no N+1 blow-up).');
        $this->assertLessThan(3000, $elapsedMs, 'Search must stay fast at volume (got ' . round($elapsedMs, 1) . ' ms).');
    }

    private function dossierWithArchive(Company $company, string $projectObject, string $archiveNumber, ?string $room, string $cityCode = 'MAR', ?string $requestedBy = null, string $cityName = 'MARRAKECH'): Dossier
    {
        $city = City::create([
            'name' => $cityName,
            'code' => $cityCode,
            'color' => '#8b5cf6',
            'is_active' => true,
        ]);

        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]);

        $dossier = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'city_id' => $city->id,
            'project_object' => $projectObject,
        ]);

        ArchiveRecord::create([
            'dossier_id' => $dossier->id,
            'archive_number' => $archiveNumber,
            'status' => 'stored',
            'room' => $room,
            'shelf' => null,
            'box' => null,
            'requested_by' => $requestedBy,
        ]);

        return $dossier;
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $role = Role::findOrCreate('global_search_tester', 'web');
        $role->syncPermissions($permissionModels);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
