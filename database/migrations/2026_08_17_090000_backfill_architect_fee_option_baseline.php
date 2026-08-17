<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('architect_fee_options')) {
            return;
        }

        $now = now();
        $hasDefault = DB::table('architect_fee_options')
            ->where('is_default', true)
            ->exists();

        $defaultPercentage = DB::table('architect_fee_options')
            ->where('calculation_type', 'percentage')
            ->where('percentage_rate', '0.5000')
            ->first(['id', 'is_active']);

        if (! $defaultPercentage) {
            DB::table('architect_fee_options')->insert([
                'name' => '0,5 %',
                'calculation_type' => 'percentage',
                'percentage_rate' => '0.5000',
                'flat_amount' => null,
                'contract_template_key' => '0_5',
                'is_default' => ! $hasDefault,
                'is_active' => true,
                'sort_order' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } elseif (! $hasDefault && $defaultPercentage->is_active) {
            DB::table('architect_fee_options')
                ->where('id', $defaultPercentage->id)
                ->update(['is_default' => true, 'updated_at' => $now]);
        }

        $this->createMissingOption([
            'name' => '2%',
            'calculation_type' => 'percentage',
            'percentage_rate' => '2.0000',
            'flat_amount' => null,
            'contract_template_key' => '2',
            'is_default' => false,
            'is_active' => true,
            'sort_order' => 10,
        ], ['calculation_type' => 'percentage', 'percentage_rate' => '2.0000']);

        $this->createMissingOption([
            'name' => 'Forfait',
            'calculation_type' => 'forfait',
            'percentage_rate' => null,
            'flat_amount' => null,
            'contract_template_key' => 'forfait',
            'is_default' => false,
            'is_active' => true,
            'sort_order' => 20,
        ], ['calculation_type' => 'forfait', 'contract_template_key' => 'forfait']);
    }

    public function down(): void
    {
        // The rows may be configured by an administrator after deployment; keep them on rollback.
    }

    /** @param array<string, mixed> $attributes @param array<string, mixed> $identity */
    private function createMissingOption(array $attributes, array $identity): void
    {
        if (DB::table('architect_fee_options')->where($identity)->exists()) {
            return;
        }

        DB::table('architect_fee_options')->insert([
            ...$attributes,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
