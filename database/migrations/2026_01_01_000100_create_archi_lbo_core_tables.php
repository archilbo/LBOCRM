<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intermediaries', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type')->default('person');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intermediary_id')->nullable()->constrained('intermediaries')->nullOnDelete();

            $table->string('client_number')->unique();
            $table->string('civility')->default('Mr');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('full_name');
            $table->string('cin')->nullable()->unique();

            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();

            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->date('cni_expiration_date')->nullable();

            $table->string('status')->default('active');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['status']);
            $table->index(['full_name']);
        });

        Schema::create('dossiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();

            $table->string('dossier_number')->unique();
            $table->string('project_object');
            $table->text('description')->nullable();

            $table->text('project_address')->nullable();
            $table->string('province')->nullable();
            $table->string('commune')->nullable();

            $table->string('land_title_number')->nullable();
            $table->decimal('land_surface', 12, 2)->nullable();
            $table->decimal('floor_area', 12, 2)->nullable();

            $table->string('status')->default('opened');
            $table->string('workflow_step')->default('client');
            $table->date('opened_at')->nullable();
            $table->date('closed_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['client_id']);
            $table->index(['status']);
            $table->index(['workflow_step']);
        });

        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();

            $table->string('code')->unique();
            $table->string('name');
            $table->string('document_type')->default('required_document');
            $table->boolean('is_required')->default(true);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();

            $table->index(['document_type']);
            $table->index(['is_active']);
        });

        Schema::create('dossier_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->foreignId('document_template_id')->nullable()->constrained('document_templates')->nullOnDelete();

            $table->string('document_number')->nullable();
            $table->string('original_filename')->nullable();
            $table->string('stored_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();

            $table->string('status')->default('missing');
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['dossier_id']);
            $table->index(['status']);
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();

            $table->string('contract_number')->unique();
            $table->string('status')->default('draft');

            $table->decimal('surface', 12, 2)->default(0);
            $table->decimal('price_per_square_meter', 12, 2)->default(0);
            $table->decimal('ht', 12, 2)->default(0);
            $table->decimal('tva', 12, 2)->default(0);
            $table->decimal('ttc', 12, 2)->default(0);

            $table->string('generated_document_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('signed_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['dossier_id']);
            $table->index(['status']);
        });

        Schema::create('authorizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();

            $table->string('authorization_number')->nullable();
            $table->string('submission_number')->nullable();
            $table->string('authority_name')->nullable();
            $table->string('authority_type')->nullable();
            $table->string('status')->default('not_started');

            $table->date('submitted_at')->nullable();
            $table->date('approved_at')->nullable();
            $table->date('received_at')->nullable();

            $table->string('receipt_path')->nullable();
            $table->string('final_file_path')->nullable();
            $table->json('observations')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['dossier_id']);
            $table->index(['status']);
        });

        Schema::create('finance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();

            $table->string('record_number')->unique();
            $table->string('type')->default('devis');
            $table->string('status')->default('draft');

            $table->decimal('ht', 12, 2)->default(0);
            $table->decimal('tva', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2)->default(0);
            $table->decimal('paid', 12, 2)->default(0);
            $table->decimal('remaining', 12, 2)->default(0);

            $table->date('issued_at')->nullable();
            $table->date('due_date')->nullable();
            $table->date('paid_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['dossier_id']);
            $table->index(['client_id']);
            $table->index(['type']);
            $table->index(['status']);
        });

        Schema::create('archive_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();

            $table->string('archive_number')->unique();
            $table->string('status')->default('ready_to_archive');

            $table->string('room')->nullable();
            $table->string('shelf')->nullable();
            $table->string('box')->nullable();
            $table->string('folder')->nullable();

            $table->date('in_date')->nullable();
            $table->date('out_date')->nullable();
            $table->date('returned_at')->nullable();
            $table->string('requested_by')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['dossier_id']);
            $table->index(['archive_number']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archive_records');
        Schema::dropIfExists('finance_records');
        Schema::dropIfExists('authorizations');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('dossier_documents');
        Schema::dropIfExists('document_templates');
        Schema::dropIfExists('dossiers');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('intermediaries');
    }
};
