<?php

namespace Tests\Feature;

use App\Models\ArchiveRecord;
use App\Models\City;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\User;
use App\Services\Archive\ArchiveNumberingException;
use App\Services\Archive\ArchiveNumberingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ArchiveNumberingTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_format_is_city_code_year_zero_padded_sequence(): void
    {
        $this->assertSame('MAR-2027-0001', $this->service()->format('mar', 2027, 1));
        $this->assertSame('CAS-2027-0042', $this->service()->format('CAS', 2027, 42));
    }

    public function test_sequence_is_per_city_and_per_year(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $company = Company::factory()->create();
        $mar = $this->city('MAR');
        $cas = $this->city('CAS');
        $dossierMar = $this->dossierFor($company, $mar);
        $dossierCas = $this->dossierFor($company, $cas);

        $first = $this->service()->reserve($dossierMar);
        $second = $this->service()->reserve($dossierMar);

        $this->assertSame('MAR-2027-0001', $first['number']);
        $this->assertSame('MAR-2027-0002', $second['number']);
        $this->assertSame(2027, $first['year']);
        $this->assertSame(1, $first['sequence']);
        $this->assertSame(2, $second['sequence']);
        $this->assertSame($company->id, $first['company_id']);
        $this->assertSame($mar->id, $first['city_id']);

        // Other city in the same year starts at 0001 again.
        $this->assertSame('CAS-2027-0001', $this->service()->reserve($dossierCas)['number']);

        // Same city, next year, resets to 0001.
        Carbon::setTestNow('2028-02-01 10:00:00');
        $this->assertSame('MAR-2028-0001', $this->service()->reserve($dossierMar)['number']);
    }

    public function test_sequence_is_scoped_per_company(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $city = $this->city('MAR');

        $first = $this->service()->reserve($this->dossierFor($companyA, $city));

        // A different company with the same city code starts its own sequence at 0001.
        $other = $this->service()->reserve($this->dossierFor($companyB, $city));

        $this->assertSame('MAR-2027-0001', $first['number']);
        $this->assertSame('MAR-2027-0001', $other['number']);
        $this->assertSame($companyB->id, $other['company_id']);
    }

    public function test_concurrent_reservations_never_collide(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $company = Company::factory()->create();
        $dossier = $this->dossierFor($company, $this->city('MAR'));

        $first = DB::transaction(fn () => $this->service()->reserve($dossier));
        $second = DB::transaction(fn () => $this->service()->reserve($dossier));

        $this->assertNotSame($first['number'], $second['number']);
        $this->assertSame(1, $first['sequence']);
        $this->assertSame(2, $second['sequence']);
    }

    public function test_rollback_does_not_burn_a_sequence(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $company = Company::factory()->create();
        $dossier = $this->dossierFor($company, $this->city('MAR'));

        try {
            DB::transaction(function () use ($dossier) {
                $this->service()->reserve($dossier);
                throw new \RuntimeException('boom');
            });
            $this->fail('Expected the transaction to fail.');
        } catch (\RuntimeException) {
            // expected
        }

        $next = $this->service()->reserve($dossier);

        $this->assertSame('MAR-2027-0001', $next['number']);
        $this->assertSame(1, $next['sequence']);
    }

    public function test_store_creates_record_with_scoped_number(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage archives']);
        $city = $this->city('MAR');
        $dossier = $this->dossierFor($company, $city);

        $this->actingAs($user)
            ->post(route('archives.store'), ['dossier_id' => $dossier->id])
            ->assertRedirect(route('archives.index'))
            ->assertSessionHas('success');

        $record = ArchiveRecord::query()->firstOrFail();

        $this->assertSame('MAR-2027-0001', $record->archive_number);
        $this->assertSame(2027, $record->archive_year);
        $this->assertSame(1, $record->archive_sequence);
        $this->assertSame($company->id, $record->company_id);
        $this->assertSame($dossier->city_id, $record->city_id);
        $this->assertSame('ready_to_archive', $record->status);

        // Second creation in the same city/year continues the sequence
        // (each dossier allows exactly one archive record, so use another dossier).
        $dossier2 = $this->dossierFor($company, $city);

        $this->actingAs($user)
            ->post(route('archives.store'), ['dossier_id' => $dossier2->id])
            ->assertRedirect(route('archives.index'));

        $second = ArchiveRecord::latest('id')->firstOrFail();

        $this->assertSame('MAR-2027-0002', $second->archive_number);
        $this->assertSame(2, $second->archive_sequence);
        $this->assertSame(1, ArchiveRecord::where('archive_sequence', 1)->count());
        $this->assertSame(1, ArchiveRecord::where('archive_sequence', 2)->count());
    }

    public function test_store_requires_archive_create_permission(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage dossiers']);
        $dossier = $this->dossierFor($company, $this->city('MAR'));

        $this->actingAs($user)
            ->post(route('archives.store'), ['dossier_id' => $dossier->id])
            ->assertForbidden();

        $this->assertSame(0, ArchiveRecord::count());
    }

    public function test_store_rejects_dossier_outside_company_scope(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $user = $this->userFor($companyA, ['manage archives']);
        $foreignDossier = $this->dossierFor($companyB, $this->city('MAR'));

        $this->actingAs($user)
            ->post(route('archives.store'), ['dossier_id' => $foreignDossier->id])
            ->assertNotFound();

        $this->assertSame(0, ArchiveRecord::count());
    }

    public function test_store_without_city_returns_clear_error_and_consumes_nothing(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage archives']);
        $city = $this->city('MAR');
        $dossier = $this->dossierFor($company, $city, withCity: false);

        $this->actingAs($user)
            ->post(route('archives.store'), ['dossier_id' => $dossier->id])
            ->assertSessionHasErrors('dossier_id');

        $this->assertSame(0, ArchiveRecord::count());

        // The failed attempt must not consume a sequence.
        $dossier->update(['city_id' => $city->id]);

        $this->actingAs($user)
            ->post(route('archives.store'), ['dossier_id' => $dossier->id])
            ->assertRedirect(route('archives.index'));

        $this->assertSame('MAR-2027-0001', ArchiveRecord::firstOrFail()->archive_number);
    }

    public function test_store_with_blank_city_code_returns_clear_error(): void
    {
        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage archives']);
        $dossier = $this->dossierFor($company, $this->city(''));

        $this->actingAs($user)
            ->post(route('archives.store'), ['dossier_id' => $dossier->id])
            ->assertSessionHasErrors('dossier_id');

        $this->assertSame(0, ArchiveRecord::count());
    }

    public function test_update_never_changes_the_archive_number(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage archives']);
        $dossier = $this->dossierFor($company, $this->city('MAR'));

        $this->actingAs($user)->post(route('archives.store'), ['dossier_id' => $dossier->id]);

        $record = ArchiveRecord::firstOrFail();
        $otherCity = $this->city('CAS');
        $otherDossier = $this->dossierFor($company, $otherCity);

        $this->actingAs($user)
            ->put(route('archives.update', $record), ['dossier_id' => $otherDossier->id, 'notes' => 'moved'])
            ->assertRedirect(route('archives.index'));

        $record->refresh();

        $this->assertSame('MAR-2027-0001', $record->archive_number);
        $this->assertSame(2027, $record->archive_year);
        $this->assertSame(1, $record->archive_sequence);
        $this->assertSame('moved', $record->notes);
    }

    public function test_deleted_number_is_never_reused(): void
    {
        Carbon::setTestNow('2027-01-15 10:00:00');

        $company = Company::factory()->create();
        $user = $this->userFor($company, ['manage archives']);
        $dossier = $this->dossierFor($company, $this->city('MAR'));

        $this->actingAs($user)->post(route('archives.store'), ['dossier_id' => $dossier->id]);
        $first = ArchiveRecord::firstOrFail();
        $this->assertSame('MAR-2027-0001', $first->archive_number);

        $this->actingAs($user)->delete(route('archives.destroy', $first))->assertRedirect(route('archives.index'));
        $this->assertSame(0, ArchiveRecord::count());

        $this->actingAs($user)->post(route('archives.store'), ['dossier_id' => $dossier->id]);

        $this->assertSame('MAR-2027-0002', ArchiveRecord::firstOrFail()->archive_number);
    }

    public function test_legacy_records_continue_from_max_sequence(): void
    {
        Carbon::setTestNow('2026-06-01 10:00:00');

        $company = Company::factory()->create();
        $city = $this->city('MAR');
        $dossier = $this->dossierFor($company, $city);

        // Legacy record as the migration backfill would leave it (number untouched,
        // scope snapshot + sequence + pre-seeded counter at MAX).
        ArchiveRecord::create([
            'dossier_id' => $dossier->id,
            'company_id' => $company->id,
            'city_id' => $city->id,
            'archive_number' => 'ARC-2026-0001',
            'archive_year' => 2026,
            'archive_sequence' => 5,
            'status' => 'stored',
        ]);
        DB::table('archive_number_sequences')->insert([
            'company_id' => $company->id,
            'city_id' => $city->id,
            'year' => 2026,
            'last_sequence' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $next = $this->service()->reserve($dossier);

        $this->assertSame('MAR-2026-0006', $next['number']);
        $this->assertSame(6, $next['sequence']);
    }

    public function test_year_comes_from_server_date_not_client_input(): void
    {
        Carbon::setTestNow('2027-03-15 10:00:00');

        $company = Company::factory()->create();
        $dossier = $this->dossierFor($company, $this->city('MAR'));

        $payload = $this->service()->reserve($dossier);

        $this->assertSame(2027, $payload['year']);
        $this->assertSame('MAR-2027-0001', $payload['number']);

        Carbon::setTestNow('2028-12-31 23:59:59');
        $this->assertSame('MAR-2028-0001', $this->service()->reserve($dossier)['number']);
    }

    public function test_reserve_throws_for_missing_company_scope(): void
    {
        $company = Company::factory()->create();
        $dossier = $this->dossierFor($company, $this->city('MAR'));
        $dossier->company_id = null;
        $dossier->save();

        try {
            $this->service()->reserve($dossier);
            $this->fail('Expected ArchiveNumberingException.');
        } catch (ArchiveNumberingException $e) {
            $this->assertStringContainsString('société', $e->getMessage());
        }
    }

    public function test_composite_unique_constraint_blocks_duplicate_scope_sequence(): void
    {
        $company = Company::factory()->create();
        $city = $this->city('MAR');
        $dossier = $this->dossierFor($company, $city);

        ArchiveRecord::create([
            'dossier_id' => $dossier->id,
            'company_id' => $company->id,
            'city_id' => $city->id,
            'archive_number' => 'MAR-2027-0001',
            'archive_year' => 2027,
            'archive_sequence' => 1,
            'status' => 'ready_to_archive',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        ArchiveRecord::create([
            'dossier_id' => $dossier->id,
            'company_id' => $company->id,
            'city_id' => $city->id,
            'archive_number' => 'MAR-2027-9999',
            'archive_year' => 2027,
            'archive_sequence' => 1,
            'status' => 'ready_to_archive',
        ]);
    }

    public function test_archive_number_is_unique_per_company_not_globally(): void
    {
        $companyA = Company::factory()->create();
        $companyB = Company::factory()->create();
        $city = $this->city('MAR');
        $dossierA = $this->dossierFor($companyA, $city);
        $dossierB = $this->dossierFor($companyB, $city);

        $base = [
            'archive_number' => 'MAR-2027-0001',
            'archive_year' => 2027,
            'archive_sequence' => 1,
            'status' => 'stored',
        ];

        ArchiveRecord::create([...$base, 'dossier_id' => $dossierA->id, 'company_id' => $companyA->id, 'city_id' => $city->id]);
        // Same number in another company is allowed.
        ArchiveRecord::create([...$base, 'dossier_id' => $dossierB->id, 'company_id' => $companyB->id, 'city_id' => $city->id]);

        $this->assertSame(2, ArchiveRecord::count());

        // Duplicate number inside the same company is blocked.
        $this->expectException(\Illuminate\Database\QueryException::class);

        ArchiveRecord::create([
            ...$base,
            'dossier_id' => $dossierA->id,
            'company_id' => $companyA->id,
            'city_id' => $city->id,
            'archive_sequence' => 2,
        ]);
    }

    private function service(): ArchiveNumberingService
    {
        return app(ArchiveNumberingService::class);
    }

    private function city(string $code): City
    {
        return City::create([
            'name' => $code === '' ? 'EMPTY' : $code,
            'code' => $code,
            'color' => '#8b5cf6',
            'is_active' => true,
        ]);
    }

    private function dossierFor(Company $company, City $city, bool $withCity = true): Dossier
    {
        $client = Client::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]);

        return Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
            'client_id' => $client->id,
            'city_id' => $withCity ? $city->id : null,
            'project_object' => 'Projet test',
        ]);
    }

    private function userFor(Company $company, array $permissions): User
    {
        $permissionModels = collect($permissions)
            ->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $role = Role::findOrCreate('archive_numbering_tester', 'web');
        $role->syncPermissions($permissionModels);

        return tap(User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => null,
        ]), fn (User $user) => $user->assignRole($role));
    }
}
