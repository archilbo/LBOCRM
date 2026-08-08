<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Services\Contracts\ContractTemplateNamingService;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('architect_fee_options', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('calculation_type', 20);
            $table->decimal('percentage_rate', 8, 4)->nullable();
            $table->decimal('flat_amount', 12, 2)->nullable();
            $table->string('contract_template_key', 50);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'is_default']);
            $table->index(['is_active', 'sort_order']);
        });

        $rate = DB::table('company_settings')
            ->where('group', 'finance')
            ->where('key', 'default_architect_rate')
            ->value('value');

        if ($rate !== null && (float) $rate >= 0) {
            $normalizedRate = number_format((float) $rate, 4, '.', '');
            $label = rtrim(rtrim(str_replace('.', ',', $normalizedRate), '0'), ',') . ' %';

            DB::table('architect_fee_options')->insert([
                'name' => $label,
                'calculation_type' => 'percentage',
                'percentage_rate' => $normalizedRate,
                'flat_amount' => null,
                'contract_template_key' => app(ContractTemplateNamingService::class)->keyFor('percentage', $normalizedRate),
                'is_default' => true,
                'is_active' => true,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('architect_fee_options');
    }
};
