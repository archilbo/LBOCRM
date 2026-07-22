<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private function isSqlite(): bool
    {
        return DB::getDriverName() === 'sqlite';
    }

    public function up(): void
    {
        Schema::table('project_design_annotations', function (Blueprint $table) {
            $table->foreignId('dossier_id')->nullable()->after('company_id');
            $table->foreignId('file_id')->nullable()->after('dossier_id');
            $table->foreignId('asset_id')->nullable()->after('version_id');
            $table->foreignId('remark_id')->nullable()->after('asset_id');
            $table->unsignedInteger('page_number')->nullable()->after('remark_id');
            $table->string('coordinate_space', 50)->default('legacy-viewer-pixels')->after('type');
            $table->json('style_json')->nullable()->after('geometry');
            $table->json('viewport_json')->nullable()->after('style_json');
            $table->unsignedInteger('reference_width')->nullable()->after('viewport_json');
            $table->unsignedInteger('reference_height')->nullable()->after('reference_width');
            $table->unsignedTinyInteger('source_rotation')->default(0)->after('reference_height');
            $table->foreignId('created_by')->nullable()->after('authored_by');
            $table->softDeletes()->after('updated_at');
        });

        $rows = DB::table('project_design_annotations')
            ->join('project_design_file_versions', 'project_design_annotations.version_id', '=', 'project_design_file_versions.id')
            ->select(
                'project_design_annotations.id as anno_id',
                'project_design_annotations.authored_by',
                'project_design_file_versions.dossier_id',
                'project_design_file_versions.file_id'
            )->get();

        foreach ($rows as $row) {
            DB::table('project_design_annotations')
                ->where('id', $row->anno_id)
                ->update([
                    'dossier_id' => $row->dossier_id,
                    'file_id' => $row->file_id,
                    'coordinate_space' => 'legacy-viewer-pixels',
                    'created_by' => $row->authored_by,
                ]);
        }

        if (!$this->isSqlite()) {
            DB::statement('ALTER TABLE project_design_annotations MODIFY dossier_id BIGINT UNSIGNED NOT NULL');
            DB::statement('ALTER TABLE project_design_annotations MODIFY file_id BIGINT UNSIGNED NOT NULL');

            Schema::table('project_design_annotations', function (Blueprint $table) {
                $table->foreign('dossier_id')->references('id')->on('dossiers')->cascadeOnDelete();
                $table->foreign('file_id')->references('id')->on('project_design_files')->cascadeOnDelete();
                $table->foreign('asset_id')->references('id')->on('project_design_assets')->nullOnDelete();
                $table->foreign('remark_id')->references('id')->on('project_design_remarks')->nullOnDelete();
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            });
        }

        Schema::table('project_design_annotations', function (Blueprint $table) {
            $table->index(['company_id', 'dossier_id']);
            $table->index(['version_id', 'asset_id']);
            $table->index(['asset_id', 'page_number']);
            $table->index('remark_id');
            $table->index('created_by');
            $table->index('record_version');
        });

        Schema::table('project_design_annotations', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'version_id']);
        });
    }

    public function down(): void
    {
        Schema::table('project_design_annotations', function (Blueprint $table) {
            $table->index(['company_id', 'version_id']);
            $table->index('version_id');
            $table->index('company_id');
        });

        if (!$this->isSqlite()) {
            Schema::table('project_design_annotations', function (Blueprint $table) {
                $table->dropForeign(['dossier_id']);
                $table->dropForeign(['file_id']);
                $table->dropForeign(['asset_id']);
                $table->dropForeign(['remark_id']);
                $table->dropForeign(['created_by']);
            });
        }

        Schema::table('project_design_annotations', function (Blueprint $table) {
            $table->dropIndex(['company_id', 'dossier_id']);
            $table->dropIndex(['version_id', 'asset_id']);
            $table->dropIndex(['asset_id', 'page_number']);
            $table->dropIndex(['remark_id']);
            $table->dropIndex(['created_by']);
            $table->dropIndex(['record_version']);

            $table->dropColumn([
                'dossier_id', 'file_id', 'asset_id', 'remark_id',
                'page_number', 'coordinate_space', 'style_json',
                'viewport_json', 'reference_width', 'reference_height',
                'source_rotation', 'created_by', 'deleted_at',
            ]);
        });
    }
};
