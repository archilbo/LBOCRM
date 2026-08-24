<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Make CIN files client-specific for shared projects.
 *
 * Existing CIN records were historically project-wide. They are assigned to
 * the project primary client so legacy files remain visible and are not
 * silently treated as belonging to every linked client.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('dossier_documents') || Schema::hasColumn('dossier_documents', 'client_id')) {
            return;
        }

        Schema::table('dossier_documents', function (Blueprint $table): void {
            $table->foreignId('client_id')
                ->nullable()
                ->after('dossier_id')
                ->constrained('clients')
                ->nullOnDelete();

            // The previous single-client constraint only allowed one recto
            // and one verso per project. Replace it with a client-aware
            // invariant so every linked client has exactly one pair.
            $table->dropUnique('dossier_documents_template_side_unique');
            $table->unique(
                ['dossier_id', 'document_template_id', 'client_id', 'document_side'],
                'dossier_documents_template_client_side_unique',
            );
        });

        // Join-free updates keep this migration compatible with both MySQL
        // and SQLite. Only an existing CIN pair is assigned; project-level
        // documents deliberately remain unassigned.
        $legacyCinDocuments = DB::table('dossier_documents as documents')
            ->join('dossiers', 'dossiers.id', '=', 'documents.dossier_id')
            ->join('document_templates', 'document_templates.id', '=', 'documents.document_template_id')
            ->whereNull('documents.client_id')
            ->where(function ($query): void {
                $query
                    ->whereIn('document_templates.code', ['CIN', 'TMPL-CIN'])
                    ->orWhereIn('document_templates.name', ['CIN', 'CNI', 'Carte nationale']);
            })
            ->whereNotNull('dossiers.client_id')
            ->select(['documents.id', 'dossiers.client_id'])
            ->get();

        foreach ($legacyCinDocuments as $document) {
            DB::table('dossier_documents')
                ->where('id', $document->id)
                ->update(['client_id' => $document->client_id]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('dossier_documents') || ! Schema::hasColumn('dossier_documents', 'client_id')) {
            return;
        }

        // Restore the legacy uniqueness rule before dropping client_id. If
        // several client CIN pairs exist, this intentionally fails safely
        // rather than deleting identity documents during rollback.
        Schema::table('dossier_documents', function (Blueprint $table): void {
            $table->unique(
                ['dossier_id', 'document_template_id', 'document_side'],
                'dossier_documents_template_side_unique',
            );
        });

        Schema::table('dossier_documents', function (Blueprint $table): void {
            $table->dropUnique('dossier_documents_template_client_side_unique');
            $table->dropForeign(['client_id']);
            $table->dropColumn('client_id');
        });
    }
};
