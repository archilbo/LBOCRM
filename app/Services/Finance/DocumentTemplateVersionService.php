<?php

namespace App\Services\Finance;

use App\Models\DocumentTemplate;
use App\Models\DocumentTemplateVersion;

class DocumentTemplateVersionService
{
    public function snapshot(DocumentTemplate $template, string $reason = 'manual'): DocumentTemplateVersion
    {
        $nextVersion = ((int) DocumentTemplateVersion::query()
            ->where('document_template_id', $template->id)
            ->max('version_number')) + 1;

        return DocumentTemplateVersion::query()->create([
            'document_template_id' => $template->id,
            'version_number' => $nextVersion,
            'name' => $template->name,
            'slug' => $template->slug,
            'type' => $template->type,
            'is_default' => (bool) $template->is_default,
            'paper_size' => $template->paper_size ?: 'A4',
            'orientation' => $template->orientation ?: 'portrait',
            'header_html' => $template->header_html,
            'body_html' => $template->body_html,
            'footer_html' => $template->footer_html,
            'css' => $template->css,
            'settings' => $template->settings ?: [],
            'logo_path' => $template->logo_path,
            'snapshot_reason' => $reason,
            'created_by' => auth()->id(),
        ]);
    }

    public function restore(DocumentTemplate $template, DocumentTemplateVersion $version): DocumentTemplate
    {
        if ((int) $version->document_template_id !== (int) $template->id) {
            abort(404);
        }

        $template->forceFill([
            'name' => $version->name,
            'slug' => $version->slug ?: $template->slug,
            'type' => $version->type,
            'is_default' => (bool) $version->is_default,
            'paper_size' => $version->paper_size ?: 'A4',
            'orientation' => $version->orientation ?: 'portrait',
            'header_html' => $version->header_html,
            'body_html' => $version->body_html,
            'footer_html' => $version->footer_html,
            'css' => $version->css,
            'settings' => $version->settings ?: [],
            'logo_path' => $version->logo_path,
        ])->save();

        return $template;
    }
}