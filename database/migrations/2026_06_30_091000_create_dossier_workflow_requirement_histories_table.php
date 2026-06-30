<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('dossier_workflow_requirement_histories');

        Schema::create('dossier_workflow_requirement_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id');
            $table->foreignId('dossier_workflow_requirement_id')->nullable();
            $table->string('step_key');
            $table->string('requirement_key');
            $table->boolean('old_is_done')->nullable();
            $table->boolean('new_is_done');
            $table->text('old_notes')->nullable();
            $table->text('new_notes')->nullable();
            $table->foreignId('changed_by')->nullable();
            $table->timestamp('changed_at');
            $table->timestamps();

            $table->foreign('dossier_id', 'dw_req_hist_dossier_fk')->references('id')->on('dossiers')->cascadeOnDelete();
            $table->foreign('dossier_workflow_requirement_id', 'dw_req_hist_req_fk')->references('id')->on('dossier_workflow_requirements')->nullOnDelete();
            $table->foreign('changed_by', 'dw_req_hist_user_fk')->references('id')->on('users')->nullOnDelete();
            $table->index(['dossier_id', 'step_key']);
            $table->index(['changed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossier_workflow_requirement_histories');
    }
};
