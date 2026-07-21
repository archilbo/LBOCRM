<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_design_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dossier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('project_design_folders')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'dossier_id']);
            $table->index('parent_id');
        });

        Schema::create('project_design_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dossier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained('project_design_folders')->nullOnDelete();
            $table->string('name');
            $table->string('code', 100)->nullable();
            $table->text('description')->nullable();
            $table->string('discipline', 100)->default('general');
            $table->string('category', 100)->default('other');
            $table->foreignId('responsible_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('current_version_id')->nullable();
            $table->unsignedBigInteger('latest_approved_version_id')->nullable();
            $table->string('status', 30)->default('active');
            $table->boolean('requires_approval')->default(true);
            $table->dateTime('review_due_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('record_version')->default(1);
            $table->dateTime('archived_at')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'dossier_id']);
            $table->index('folder_id');
            $table->index('discipline');
            $table->index('category');
            $table->index('status');
            $table->index('responsible_user_id');
            $table->index('reviewer_id');
        });

        Schema::create('project_design_file_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dossier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('file_id')->constrained('project_design_files');
            $table->unsignedSmallInteger('version_number');
            $table->unsignedBigInteger('source_version_id')->nullable();
            $table->string('revision_code', 50)->nullable();
            $table->string('status', 30)->default('draft');
            $table->string('upload_status', 30)->default('pending');
            $table->string('preview_status', 30)->default('pending');
            $table->string('review_status', 30)->default('none');
            $table->text('change_summary')->nullable();
            $table->text('upload_note')->nullable();
            $table->text('preview_error')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('submitted_at')->nullable();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('rejected_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('superseded_at')->nullable();
            $table->json('metadata_json')->nullable();
            $table->unsignedBigInteger('record_version')->default(1);
            $table->timestamps();

            $table->unique(['file_id', 'version_number']);
            $table->index(['company_id', 'dossier_id']);
            $table->index('status');
            $table->index('upload_status');
            $table->index('preview_status');
            $table->index('review_status');
            $table->index('uploaded_by');
        });

        Schema::create('project_design_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('design_file_id')->constrained('project_design_files');
            $table->foreignId('version_id')->constrained('project_design_file_versions');
            $table->string('asset_type', 50);
            $table->string('disk');
            $table->string('path');
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('mime_type', 127)->nullable();
            $table->string('extension', 20)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('checksum_sha256', 64)->nullable();
            $table->string('scan_status', 30)->default('pending');
            $table->text('scan_error')->nullable();
            $table->boolean('previewable')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->json('metadata_json')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['company_id', 'design_file_id']);
            $table->index('version_id');
            $table->index('asset_type');
            $table->index('scan_status');
            $table->index('previewable');
        });

        Schema::create('project_design_annotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('version_id')->constrained('project_design_file_versions');
            $table->string('type');
            $table->json('geometry');
            $table->foreignId('authored_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('record_version')->default(1);
            $table->timestamps();

            $table->index(['company_id', 'version_id']);
            $table->index('authored_by');
        });

        Schema::create('project_design_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('version_id')->constrained('project_design_file_versions');
            $table->foreignId('annotation_id')->nullable()->constrained('project_design_annotations')->nullOnDelete();
            $table->string('severity', 30)->default('normal');
            $table->string('status', 30)->default('open');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->date('due_date')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->unsignedBigInteger('record_version')->default(1);
            $table->timestamps();

            $table->index(['company_id', 'version_id']);
            $table->index('status');
            $table->index('assigned_to');
            $table->index('severity');
        });

        Schema::create('project_design_remark_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('remark_id')->constrained('project_design_remarks');
            $table->foreignId('user_id')->constrained('users');
            $table->text('content');
            $table->timestamps();

            $table->index(['company_id', 'remark_id']);
        });

        Schema::create('project_design_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('file_id')->constrained('project_design_files');
            $table->foreignId('version_id')->constrained('project_design_file_versions');
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('reviewer_id')->constrained('users');
            $table->string('status', 30)->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'file_id']);
            $table->index('reviewer_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_design_reviews');
        Schema::dropIfExists('project_design_remark_comments');
        Schema::dropIfExists('project_design_remarks');
        Schema::dropIfExists('project_design_annotations');
        Schema::dropIfExists('project_design_assets');
        Schema::dropIfExists('project_design_file_versions');
        Schema::dropIfExists('project_design_files');
        Schema::dropIfExists('project_design_folders');
    }
};
