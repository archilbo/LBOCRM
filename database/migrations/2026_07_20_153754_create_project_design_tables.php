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
            $table->foreignId('dossier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('project_design_folders')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('dossier_id');
            $table->index('parent_id');
        });

        Schema::create('project_design_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained('project_design_folders')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type')->default('source');
            $table->string('status')->default('active');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedBigInteger('record_version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index('dossier_id');
            $table->index('type');
            $table->index('status');
        });

        Schema::create('project_design_file_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained('project_design_files')->cascadeOnDelete();
            $table->unsignedSmallInteger('version_number');
            $table->string('status')->default('draft');
            $table->string('checksum', 64)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('original_filename');
            $table->string('disk_path');
            $table->string('disk');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('record_version')->default(1);
            $table->timestamps();

            $table->unique(['file_id', 'version_number']);
            $table->index('status');
            $table->index('uploaded_by');
        });

        Schema::create('project_design_annotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('version_id')->constrained('project_design_file_versions')->cascadeOnDelete();
            $table->string('type');
            $table->json('geometry');
            $table->foreignId('authored_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('record_version')->default(1);
            $table->timestamps();

            $table->index('version_id');
            $table->index('authored_by');
        });

        Schema::create('project_design_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('version_id')->constrained('project_design_file_versions')->cascadeOnDelete();
            $table->foreignId('annotation_id')->nullable()->constrained('project_design_annotations')->nullOnDelete();
            $table->string('severity');
            $table->string('status')->default('open');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->date('due_date')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->unsignedBigInteger('record_version')->default(1);
            $table->timestamps();

            $table->index('version_id');
            $table->index('status');
            $table->index('assigned_to');
            $table->index('severity');
        });

        Schema::create('project_design_remark_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('remark_id')->constrained('project_design_remarks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->text('content');
            $table->timestamps();

            $table->index('remark_id');
        });

        Schema::create('project_design_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained('project_design_files')->cascadeOnDelete();
            $table->foreignId('version_id')->constrained('project_design_file_versions')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('reviewer_id')->constrained('users');
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('file_id');
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
        Schema::dropIfExists('project_design_file_versions');
        Schema::dropIfExists('project_design_files');
        Schema::dropIfExists('project_design_folders');
    }
};
