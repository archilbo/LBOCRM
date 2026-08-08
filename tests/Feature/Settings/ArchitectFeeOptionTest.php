<?php

namespace Tests\Feature\Settings;

use App\Models\ArchitectFeeOption;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArchitectFeeOptionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
        $company = Company::factory()->create();
        $this->admin = tap(User::factory()->create(['company_id' => $company->id]), fn (User $user) => $user->assignRole('admin'));
    }

    public function test_setting_a_new_default_unsets_the_previous_default(): void
    {
        $first = ArchitectFeeOption::create([
            'name' => '0,5 %', 'calculation_type' => 'percentage', 'percentage_rate' => 0.5,
            'contract_template_key' => '0_5', 'is_default' => true, 'is_active' => true,
        ]);
        $second = ArchitectFeeOption::create([
            'name' => '2 %', 'calculation_type' => 'percentage', 'percentage_rate' => 2,
            'contract_template_key' => '2', 'is_default' => false, 'is_active' => true,
        ]);

        $this->actingAs($this->admin)
            ->put(route('finance.architect-fee-options.default', $second))
            ->assertRedirect();

        $this->assertFalse($first->fresh()->is_default);
        $this->assertTrue($second->fresh()->is_default);
        $this->assertSame(1, ArchitectFeeOption::query()->where('is_default', true)->count());
    }

    public function test_percentage_option_derives_its_template_key_without_hardcoded_rates(): void
    {
        $this->actingAs($this->admin)
            ->post(route('finance.architect-fee-options.store'), [
                'name' => 'Honoraires 1,25 %',
                'calculation_type' => 'percentage',
                'percentage_rate' => '1,25',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('architect_fee_options', [
            'name' => 'Honoraires 1,25 %',
            'percentage_rate' => '1.2500',
            'contract_template_key' => '1_25',
        ]);
    }
}
