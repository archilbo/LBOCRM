<?php

use App\Services\Finance\DefaultFinanceTemplateFactory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('finance_templates')) {
            return;
        }

        $template = app(DefaultFinanceTemplateFactory::class)->invoice();

        // This is deliberately limited to the system template. User-created
        // templates and issued-document snapshots remain unchanged.
        DB::table('finance_templates')
            ->where('slug', $template['slug'])
            ->whereNull('deleted_at')
            ->update([
                'name' => $template['name'],
                'paper_size' => $template['paper_size'],
                'orientation' => $template['orientation'],
                'header_html' => $template['header_html'],
                'body_html' => $template['body_html'],
                'footer_html' => $template['footer_html'],
                'css' => $template['css'],
                'settings' => json_encode($template['settings'], JSON_THROW_ON_ERROR),
                'logo_path' => $template['logo_path'],
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // The replaced user-facing HTML has no safe deterministic inverse.
        // Issued documents retain their immutable rendering snapshots.
    }
};
