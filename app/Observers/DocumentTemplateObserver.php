<?php

namespace App\Observers;

use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateVersion;
use Illuminate\Support\Facades\Schema;

class DocumentTemplateObserver
{
    public function updating(DocumentTemplate $template): void
    {
        if (!Schema::hasTable('document_template_versions')) {
            return;
        }

        if (!$template->exists || !$template->id) {
            return;
        }

        if (!$template->isDirty([
            'name',
            'type',
            'is_default',
            'paper_size',
            'orientation',
            'header_html',
            'body_html',
            'footer_html',
            'css',
            'settings',
            'logo_path',
        ])) {
            return;
        }

        $nextVersion = ((int) DocumentTemplateVersion::query()
            ->where('document_template_id', $template->id)
            ->max('version_number')) + 1;

        DocumentTemplateVersion::query()->create([
            'document_template_id' => $template->id,
            'version_number' => $nextVersion,
            'name' => $template->getOriginal('name') ?: $template->name,
            'slug' => $template->getOriginal('slug') ?: $template->slug,
            'type' => $template->getOriginal('type') ?: $template->type,
            'is_default' => (bool) $template->getOriginal('is_default'),
            'paper_size' => $template->getOriginal('paper_size') ?: 'A4',
            'orientation' => $template->getOriginal('orientation') ?: 'portrait',
            'header_html' => $template->getOriginal('header_html'),
            'body_html' => $template->getOriginal('body_html'),
            'footer_html' => $template->getOriginal('footer_html'),
            'css' => $template->getOriginal('css'),
            'settings' => $template->getOriginal('settings') ?: [],
            'logo_path' => $template->getOriginal('logo_path'),
            'snapshot_reason' => 'before_update',
            'created_by' => auth()->id(),
        ]);
    }
}