<?php

namespace Tests\Feature;

use App\Models\ArchiveRecord;
use App\Models\Branch;
use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectOverviewArchiveChipTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Branch $branch;

    private City $cityModel;

    private const PERMISSIONS = [
        'dossiers.view',
        'documents.view',
        'contracts.view',
        'finance.view',
        'archive.view',
    ];

    public function test_archive_payload_exposes_display_sequence_and_city_for_the_chip(): void
    {
        [$user, $project, $archive] = $this->scenario(
            archiveSequence: 1,
            archiveStatus: 'ready_to_archive',
        );

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord.id', $archive->id)
                ->where('archiveRecord.archiveNumber', 'MAR-2026-0001')
                ->where('archiveRecord.displaySequence', '0001')
                ->where('archiveRecord.status', 'ready_to_archive')
                ->where('archiveRecord.city.id', $this->cityModel->id)
                ->where('archiveRecord.city.name', 'Marrakech')
                ->where('archiveRecord.city.color', '#C9A227')
                ->where('capabilities.canViewArchive', true)
            );
    }

    public function test_display_sequence_is_zero_padded_from_the_structured_sequence_field(): void
    {
        [$user, $project] = $this->scenario(archiveSequence: 7);

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord.displaySequence', '0007')
            );
    }

    public function test_archive_payload_keeps_existing_keys_untouched(): void
    {
        [$user, $project] = $this->scenario(
            archiveSequence: 2,
            archiveStatus: 'checked_out',
        );

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord.displaySequence', '0002')
                ->where('archiveRecord.status', 'checked_out')
                ->where('archiveRecord.isOverdue', false)
                ->where('archiveRecord.room', 'SALLE-A')
                ->where('archiveRecord.shelf', 'R1')
                ->where('archiveRecord.locationLabel', 'SALLE-A / R1')
            );
    }

    public function test_archive_payload_is_null_when_the_project_has_no_archive(): void
    {
        [$user, $project] = $this->scenario(withArchive: false);

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord', null)
                ->where('capabilities.canViewArchive', true)
            );
    }

    public function test_archive_is_hidden_without_archive_view_permission(): void
    {
        [$user, $project] = $this->scenario();

        $noArchiveUser = $this->userWithPermissions(
            $this->company,
            $this->branch,
            array_values(array_diff(self::PERMISSIONS, ['archive.view'])),
        );

        $this->actingAs($noArchiveUser)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord', null)
                ->where('capabilities.canViewArchive', false)
            );
    }

    public function test_archive_without_a_city_falls_back_to_the_dossier_city(): void
    {
        [$user, $project] = $this->scenario(withArchiveCity: false);

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord.city.id', $this->cityModel->id)
                ->where('archiveRecord.city.name', 'Marrakech')
                ->where('archiveRecord.city.color', '#C9A227')
            );
    }

    public function test_archive_city_takes_precedence_over_the_dossier_city(): void
    {
        [$user, $project] = $this->scenario(archiveCityCode: 'AGA', archiveCityName: 'Agadir');

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord.city.name', 'Agadir')
            );
    }

    public function test_archive_city_is_null_when_neither_archive_nor_dossier_have_one(): void
    {
        [$user, $project] = $this->scenario(withArchiveCity: false, withDossierCity: false);

        $this->actingAs($user)
            ->get(route('dossiers.show', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('archiveRecord.city', null)
            );
    }

    /**
     * @return array{0: User, 1: Dossier, 2: ArchiveRecord|null}
     */
    private function scenario(
        bool $withArchive = true,
        bool $withArchiveCity = true,
        bool $withDossierCity = true,
        string $archiveCityCode = 'RAK-CHIP',
        string $archiveCityName = 'Marrakech',
        int $archiveSequence = 1,
        string $archiveStatus = 'stored',
    ): array {
        $this->company = Company::factory()->create();
        $this->branch = $this->branch($this->company, 'MAIN');
        $user = $this->userWithPermissions($this->company, $this->branch, self::PERMISSIONS);
        $city = $this->city('Marrakech', 'RAK-CHIP');
        $this->cityModel = $city;

        $client = Client::factory()->create([
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
        ]);

        $project = Dossier::factory()->create([
            'company_id' => $this->company->id,
            'branch_id' => $this->branch->id,
            'client_id' => $client->id,
            'city_id' => $withDossierCity ? $city->id : null,
            'dossier_number' => 'DOS-CHIP-0001',
            'project_object' => 'Archive Chip Project',
            'status' => 'active',
            'workflow_step' => 'client',
            'opened_at' => now()->toDateString(),
        ]);

        if (! $withArchive) {
            return [$user, $project, null];
        }

        $archiveCityId = null;
        if ($withArchiveCity) {
            $archiveCityId = $archiveCityCode === $city->code
                ? $city->id
                : $this->city($archiveCityName, $archiveCityCode)->id;
        }

        $archive = ArchiveRecord::create([
            'dossier_id' => $project->id,
            'company_id' => $this->company->id,
            'city_id' => $archiveCityId,
            'archive_number' => sprintf('MAR-2026-%04d', $archiveSequence),
            'archive_year' => 2026,
            'archive_sequence' => $archiveSequence,
            'status' => $archiveStatus,
            'room' => 'SALLE-A',
            'shelf' => 'R1',
        ]);

        return [$user, $project, $archive];
    }

    private function branch(Company $company, string $code): Branch
    {
        return Branch::query()->create([
            'company_id' => $company->id,
            'name' => 'Branch '.$code,
            'code' => $code,
            'is_active' => true,
        ]);
    }

    private function city(string $name, string $code): City
    {
        return City::query()->create([
            'name' => $name,
            'code' => $code,
            'color' => '#C9A227',
            'is_active' => true,
        ]);
    }

    private function userWithPermissions(
        Company $company,
        Branch $branch,
        array $permissionNames,
    ): User {
        $permissions = collect($permissionNames)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $roleName = 'project_archive_chip_'.substr(md5(implode('|', $permissionNames)), 0, 12);
        $role = Role::findOrCreate($roleName, 'web');
        $role->syncPermissions($permissions);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
