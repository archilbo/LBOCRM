<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('dossier_documents', 'document_side')) {
            return;
        }

        $hasDuplicateTemplates = DB::table('dossier_documents')
            ->whereNotNull('document_template_id')
            ->select([
                'dossier_id',
                'document_template_id',
            ])
            ->selectRaw('COUNT(*) AS aggregate')
            ->groupBy([
                'dossier_id',
                'document_template_id',
            ])
            ->havingRaw('COUNT(*) > 1')
            ->exists();

        if ($hasDuplicateTemplates) {
            throw new \RuntimeException(
                'Duplicate dossier/template document records exist. '
                .'Resolve them before adding document sides.'
            );
        }

        Schema::table(
            'dossier_documents',
            function (Blueprint $table): void {
                $table
                    ->string('document_side', 20)
                    ->default('single')
                    ->after('document_template_id');

                $table->unique(
                    [
                        'dossier_id',
                        'document_template_id',
                        'document_side',
                    ],
                    'dossier_documents_template_side_unique'
                );

                $table->index(
                    [
                        'dossier_id',
                        'document_side',
                    ],
                    'dossier_documents_dossier_side_index'
                );
            }
        );

        $cinTemplateIds = DB::table('document_templates')
            ->where(function ($query): void {
                $query
                    ->whereIn('code', [
                        'CIN',
                        'TMPL-CIN',
                    ])
                    ->orWhereIn('name', [
                        'CIN',
                        'CNI',
                        'Carte nationale',
                    ]);
            })
            ->pluck('id');

        if ($cinTemplateIds->isNotEmpty()) {
            DB::table('dossier_documents')
                ->whereIn(
                    'document_template_id',
                    $cinTemplateIds
                )
                ->update([
                    'document_side' => 'front',
                ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn(
            'dossier_documents',
            'document_side'
        )) {
            return;
        }

        Schema::table(
            'dossier_documents',
            function (Blueprint $table): void {
                $table->dropUnique(
                    'dossier_documents_template_side_unique'
                );

                $table->dropIndex(
                    'dossier_documents_dossier_side_index'
                );

                $table->dropColumn('document_side');
            }
        );
    }
};
