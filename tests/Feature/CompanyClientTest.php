<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CompanyClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_client_stores_its_identity_and_multiple_managers(): void
    {
        $company = Company::factory()->create();
        $user = User::factory()->create(['company_id' => $company->id]);
        Permission::query()->firstOrCreate(['name' => 'clients.create', 'guard_name' => 'web']);
        $user->givePermissionTo('clients.create');

        $this->actingAs($user)->post(route('clients.store'), [
            'client_type' => 'company',
            'company_name' => 'Atlas Construction SARL',
            'ice' => '001234567890123',
            'managers' => ['Amina El Mansouri', 'Youssef Alaoui'],
            'phone' => '+212600000000',
            'email' => 'contact@atlas.test',
            'address' => 'Marrakech',
            'notes' => 'Preferred supplier.',
        ])->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', [
            'company_id' => $company->id,
            'client_type' => 'company',
            'full_name' => 'Atlas Construction SARL',
            'company_name' => 'Atlas Construction SARL',
            'ice' => '001234567890123',
        ]);

        $this->assertSame(
            ['Amina El Mansouri', 'Youssef Alaoui'],
            \App\Models\Client::query()->firstOrFail()->managers,
        );
    }

    public function test_personal_client_cni_expiration_must_be_more_than_three_months_away(): void
    {
        CarbonImmutable::setTestNow('2026-08-11 10:00:00');

        try {
            $company = Company::factory()->create();
            $user = User::factory()->create(['company_id' => $company->id]);
            Permission::query()->firstOrCreate(['name' => 'clients.create', 'guard_name' => 'web']);
            $user->givePermissionTo('clients.create');

            $this->actingAs($user)->post(route('clients.store'), [
                'client_type' => 'person',
                'first_name' => 'Amina',
                'last_name' => 'Test',
                'cni_expiration_date' => '2026-11-11',
            ])->assertSessionHasErrors('cni_expiration_date');

            $this->actingAs($user)->post(route('clients.store'), [
                'client_type' => 'person',
                'first_name' => 'Amina',
                'last_name' => 'Valide',
                'cni_expiration_date' => '2026-11-12',
            ])->assertRedirect(route('clients.index'));
        } finally {
            CarbonImmutable::setTestNow();
        }
    }
}
