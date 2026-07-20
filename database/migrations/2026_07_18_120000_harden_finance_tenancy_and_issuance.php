<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('legal_name')->nullable();
                $table->string('slug')->unique();
                $table->string('address')->nullable();
                $table->string('city')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('branches')) {
            Schema::create('branches', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('code');
                $table->string('address')->nullable();
                $table->string('city')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->unique(['company_id', 'code']);
            });
        }

        $companyId = DB::table('companies')->where('slug', 'archi-lbo')->value('id');
        if (! $companyId) {
            $companyId = DB::table('companies')->insertGetId([
                'name' => 'ARCHI LBO',
                'legal_name' => 'ARCHI LBO',
                'slug' => 'archi-lbo',
                'address' => 'Immeuble nr 959 bureau n 1, lotissement Al Massar',
                'city' => 'Marrakech',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $branchId = DB::table('branches')->where('company_id', $companyId)->where('code', 'RAK')->value('id');
        if (! $branchId) {
            $branchId = DB::table('branches')->insertGetId([
                'company_id' => $companyId,
                'name' => 'Marrakech',
                'code' => 'RAK',
                'address' => 'Immeuble nr 959 bureau n 1, lotissement Al Massar',
                'city' => 'Marrakech',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->addTenantColumns('users');
        $this->addTenantColumns('finance_documents');
        $this->addTenantColumns('payments');
        $this->addTenantColumns('expenses');
        $this->addTenantColumns('finance_templates');

        DB::table('users')->whereNull('company_id')->update(['company_id' => $companyId, 'branch_id' => $branchId]);
        foreach (['finance_documents', 'payments', 'expenses', 'finance_templates'] as $table) {
            DB::table($table)->whereNull('company_id')->update(['company_id' => $companyId, 'branch_id' => $branchId]);
        }

        $this->migrateLegacyFinanceRecords($companyId, $branchId);
        DB::table('finance_documents')->where('status', 'partial')->update(['status' => 'partially_paid']);

        Schema::table('finance_documents', function (Blueprint $table) {
            $table->timestamp('issued_at')->nullable()->after('generated_at');
            $table->foreignId('issued_by')->nullable()->after('issued_at')->constrained('users')->nullOnDelete();
            $table->json('template_snapshot')->nullable()->after('issued_by');
            $table->json('render_data_snapshot')->nullable()->after('template_snapshot');
            $table->longText('rendered_html_snapshot')->nullable()->after('render_data_snapshot');
            $table->string('snapshot_hash', 64)->nullable()->after('rendered_html_snapshot');
            $table->string('pdf_checksum', 64)->nullable()->after('pdf_path');
            $table->string('excel_checksum', 64)->nullable()->after('excel_path');
            $table->index(['company_id', 'branch_id', 'type', 'status'], 'finance_docs_scope_status_idx');
            $table->index(['company_id', 'issue_date'], 'finance_docs_scope_date_idx');
        });

        Schema::create('finance_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->morphs('subject');
            $table->string('action')->index();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'branch_id', 'created_at'], 'finance_activity_scope_idx');
        });
    }

    private function addTenantColumns(string $tableName): void
    {
        Schema::table($tableName, function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    private function migrateLegacyFinanceRecords(int $companyId, int $branchId): void
    {
        if (! Schema::hasTable('finance_records')) {
            return;
        }

        DB::table('finance_records')->orderBy('id')->chunkById(100, function ($records) use ($companyId, $branchId) {
            foreach ($records as $record) {
                if (DB::table('finance_documents')->where('number', $record->record_number)->exists()) {
                    continue;
                }

                $type = match ($record->type) {
                    'devis' => 'quote',
                    'payment' => 'receipt',
                    default => 'invoice',
                };
                $status = in_array($record->status, [
                    'draft', 'issued', 'sent', 'accepted', 'rejected', 'converted',
                    'partially_paid', 'paid', 'overdue', 'cancelled',
                ], true) ? $record->status : 'draft';
                $rate = (float) $record->ht > 0 ? round(((float) $record->tva / (float) $record->ht) * 100, 2) : 0;

                DB::table('finance_documents')->insert([
                    'company_id' => $companyId,
                    'branch_id' => $branchId,
                    'type' => $type,
                    'number' => $record->record_number,
                    'status' => $status,
                    'client_id' => $record->client_id,
                    'dossier_id' => $record->dossier_id,
                    'issue_date' => $record->issued_at,
                    'due_date' => $record->due_date,
                    'currency' => 'MAD',
                    'tva_rate' => $rate,
                    'subtotal_ht' => $record->ht,
                    'discount_total' => 0,
                    'tax_total' => $record->tva,
                    'total_ttc' => $record->total_ttc,
                    'paid_total' => $record->paid,
                    'remaining_total' => $record->remaining,
                    'notes' => $record->notes,
                    'pdf_path' => $record->generated_pdf_path ?? null,
                    'excel_path' => $record->generated_file_path ?? null,
                    'generated_at' => $record->generated_at ?? null,
                    'paid_at' => $record->paid_at,
                    'created_at' => $record->created_at,
                    'updated_at' => $record->updated_at,
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_activity_logs');

        Schema::table('finance_documents', function (Blueprint $table) {
            $table->dropForeign(['issued_by']);
            $table->dropColumn([
                'issued_at', 'issued_by', 'template_snapshot', 'render_data_snapshot',
                'rendered_html_snapshot', 'snapshot_hash', 'pdf_checksum', 'excel_checksum',
            ]);
        });

        foreach (['finance_templates', 'expenses', 'payments', 'finance_documents', 'users'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['company_id']);
                $table->dropForeign(['branch_id']);
                $table->dropColumn(['company_id', 'branch_id']);
            });
        }

        Schema::dropIfExists('branches');
        Schema::dropIfExists('companies');
    }
};
