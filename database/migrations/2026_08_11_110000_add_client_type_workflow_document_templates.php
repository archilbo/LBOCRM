<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $timestamp = now();

        DB::table('document_templates')->insertOrIgnore([
            [
                'code' => 'STATUT',
                'name' => 'Statut',
                'document_type' => 'company',
                'is_required' => true,
                'is_active' => true,
                'sort_order' => 55,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'RCE',
                'name' => 'RCE',
                'document_type' => 'company',
                'is_required' => true,
                'is_active' => true,
                'sort_order' => 56,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'DESISTEMENT',
                'name' => 'Désistement',
                'document_type' => 'administrative',
                'is_required' => true,
                'is_active' => true,
                'sort_order' => 57,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'PROCURATION',
                'name' => 'Procuration',
                'document_type' => 'administrative',
                'is_required' => true,
                'is_active' => true,
                'sort_order' => 58,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'ATTESTATION_SITUATION_REGULIERE',
                'name' => 'Attestation de situation régulière',
                'document_type' => 'bureau_etude',
                'is_required' => true,
                'is_active' => true,
                'sort_order' => 155,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'code' => 'TOPOGRAPHE',
                'name' => 'Topographe',
                'document_type' => 'bureau_etude',
                'is_required' => true,
                'is_active' => true,
                'sort_order' => 156,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ]);
    }

    public function down(): void
    {
        // Document templates may be referenced by uploaded records; retain
        // them on rollback rather than deleting production document metadata.
    }
};
