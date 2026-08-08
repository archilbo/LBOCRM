<?php

namespace Tests\Feature\Settings;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\User;
use App\Services\Finance\FinanceSettingsService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceSettingsTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        $this->company = Company::factory()->create();
    }

    private function adminUser(): User
    {
        return tap(
            User::factory()->create(['company_id' => $this->company->id, 'branch_id' => null]),
            fn (User $user) => $user->assignRole('admin')
        );
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'finance' => [
                'default_tva_rate' => 20,
                'default_currency' => 'MAD',
                'default_payment_terms_days' => 30,
                'default_quote_validity_days' => 30,
                'default_unit_price_m2' => 900,
                'default_architect_rate' => 0.5,
            ],
            'company' => [
                'company_name' => 'ARCHI LBO SARLAU',
                'company_legal_representative' => 'Omar Laabissi',
                'company_address' => 'Immeuble nr 959 lotissement AL MASSAR Marrakech',
                'company_phone' => '0600640858',
                'company_fax' => '0526035012',
                'company_email' => 'contact@archilbo.local',
            ],
            'bank' => [],
        ], $overrides);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->put(route('finance.settings.update'), $this->validPayload())
            ->assertRedirect();
    }

    public function test_user_without_permission_cannot_update_settings(): void
    {
        $user = tap(
            User::factory()->create(['company_id' => $this->company->id, 'branch_id' => null]),
            fn (User $user) => $user->assignRole('staff')
        );

        $this->actingAs($user)
            ->put(route('finance.settings.update'), $this->validPayload())
            ->assertForbidden();

        $this->assertDatabaseCount('company_settings', 0);
    }

    public function test_admin_can_save_fax_and_legal_representative(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->put(route('finance.settings.update'), $this->validPayload())
            ->assertRedirect();

        $this->assertDatabaseHas('company_settings', [
            'group' => 'company',
            'key' => 'company_fax',
            'value' => '0526035012',
        ]);

        $this->assertDatabaseHas('company_settings', [
            'group' => 'company',
            'key' => 'company_legal_representative',
            'value' => 'Omar Laabissi',
        ]);

        // The service exposes both values for document generation.
        $this->assertSame('0526035012', FinanceSettingsService::getCompanyFax());
        $this->assertSame('Omar Laabissi', FinanceSettingsService::getCompanyLegalRepresentative());
    }

    public function test_fax_and_legal_representative_are_nullable(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->put(route('finance.settings.update'), $this->validPayload([
                'company' => [
                    'company_name' => 'ARCHI LBO SARLAU',
                    'company_legal_representative' => '',
                    'company_fax' => '',
                ],
            ]))
            ->assertRedirect();

        $this->assertSame('', FinanceSettingsService::getCompanyFax());
        $this->assertSame('', FinanceSettingsService::getCompanyLegalRepresentative());
    }

    public function test_invalid_fax_is_rejected(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->put(route('finance.settings.update'), $this->validPayload([
                'company' => array_merge($this->validPayload()['company'], [
                    'company_fax' => 'not-a-fax',
                ]),
            ]))
            ->assertSessionHasErrors('company.company_fax');

        $this->assertDatabaseMissing('company_settings', [
            'group' => 'company',
            'key' => 'company_fax',
        ]);
    }

    public function test_legal_representative_longer_than_255_characters_is_rejected(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->put(route('finance.settings.update'), $this->validPayload([
                'company' => array_merge($this->validPayload()['company'], [
                    'company_legal_representative' => str_repeat('a', 256),
                ]),
            ]))
            ->assertSessionHasErrors('company.company_legal_representative');

        $this->assertDatabaseMissing('company_settings', [
            'group' => 'company',
            'key' => 'company_legal_representative',
        ]);
    }

    public function test_unknown_company_fields_are_safely_ignored(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
            ->put(route('finance.settings.update'), $this->validPayload([
                'company' => array_merge($this->validPayload()['company'], [
                    'company_ceo_bank_account' => 'injection',
                ]),
            ]))
            ->assertRedirect();

        $this->assertDatabaseMissing('company_settings', [
            'group' => 'company',
            'key' => 'company_ceo_bank_account',
        ]);
    }

    public function test_company_info_exposes_the_new_fields(): void
    {
        $this->seedCompanySetting('company_fax', '0526035012');
        $this->seedCompanySetting('company_legal_representative', 'Omar Laabissi');

        $info = app(FinanceSettingsService::class)->companyInfo();

        $this->assertSame('0526035012', $info['companyFax']);
        $this->assertSame('Omar Laabissi', $info['companyLegalRepresentative']);
    }

    private function seedCompanySetting(string $key, string $value): void
    {
        CompanySetting::setValue('company', $key, $value, 'string', $key);
    }
}
