<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $templates = [
        ['code' => 'TMPL-Calcul-de-contenance', 'name' => 'Calcul de contenance'],
        ['code' => 'TMPL-Plan-parcellaire', 'name' => 'Plan parcellaire'],
        ['code' => 'TMPL-Attestation-implantation', 'name' => 'Attestation implantation'],
        ['code' => 'TMPL-Contrat-topographie', 'name' => 'Contrat topographie'],
        ['code' => 'TMPL-Contrat-laboratoire', 'name' => 'Contrat laboratoire'],
        ['code' => 'TMPL-Bureau-de-controle', 'name' => 'Bureau de controle'],
    ];

    public function up(): void
    {
        // Rename "Attestation de contenance" to "Calcul de contenance" if it exists
        DB::table('document_templates')
            ->where('name', 'Attestation de contenance')
            ->update(['name' => 'Calcul de contenance']);

        // Insert new templates if they don't already exist
        foreach ($this->templates as $template) {
            $existing = DB::table('document_templates')
                ->where('code', $template['code'])
                ->orWhere('name', $template['name'])
                ->exists();

            if (!$existing) {
                DB::table('document_templates')->insert([
                    'code' => $template['code'],
                    'name' => $template['name'],
                    'document_type' => 'document',
                    'is_required' => false,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        $codes = array_column($this->templates, 'code');
        DB::table('document_templates')->whereIn('code', $codes)->delete();
    }
};
