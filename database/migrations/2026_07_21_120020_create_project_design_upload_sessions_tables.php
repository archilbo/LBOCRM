<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_design_upload_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('client_upload_id')->unique();
            $table->foreignId('company_id')->constrained();
            $table->foreignId('dossier_id')->constrained();
            $table->foreignId('design_file_id')->nullable()->constrained('project_design_files');
            $table->foreignId('version_id')->nullable()->constrained('project_design_file_versions');
            $table->foreignId('user_id')->constrained('users');
            $table->string('operation'); // new_file, new_version, add_review_asset, add_supporting_asset
            $table->string('submission_intent')->nullable(); // draft, submit
            $table->string('status'); // pending, uploading, transferred, finalizing, completed, failed, canceled
            $table->unsignedSmallInteger('total_files')->default(0);
            $table->unsignedSmallInteger('completed_files')->default(0);
            $table->unsignedBigInteger('total_bytes')->default(0);
            $table->unsignedBigInteger('uploaded_bytes')->default(0);
            $table->unsignedTinyInteger('processing_progress')->default(0);
            $table->text('tus_upload_ids_json')->nullable();
            $table->text('metadata_json')->nullable();
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->unsignedInteger('record_version')->default(1);
            $table->timestamps();

            $table->index(['company_id', 'dossier_id'], 'pd_sessions_company_dossier_idx');
            $table->index(['user_id', 'status'], 'pd_sessions_user_status_idx');
        });

        Schema::create('project_design_upload_session_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upload_session_id')->constrained('project_design_upload_sessions')->cascadeOnDelete();
            $table->string('client_file_upload_id');
            $table->string('tus_upload_id')->nullable();
            $table->string('asset_type');
            $table->string('original_filename');
            $table->string('mime_type')->nullable();
            $table->string('extension')->nullable();
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->unsignedBigInteger('uploaded_bytes')->default(0);
            $table->string('status'); // queued, uploading, transferred, finalizing, completed, failed, canceled
            $table->string('temporary_path')->nullable();
            $table->foreignId('asset_id')->nullable()->constrained('project_design_assets');
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->unsignedInteger('record_version')->default(1);
            $table->timestamps();

            $table->unique(['upload_session_id', 'client_file_upload_id'], 'pd_upload_files_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_design_upload_session_files');
        Schema::dropIfExists('project_design_upload_sessions');
    }
};
