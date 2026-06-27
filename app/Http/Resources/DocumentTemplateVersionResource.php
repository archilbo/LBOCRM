<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentTemplateVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'versionNumber' => $this->version_number,
            'name' => $this->name,
            'type' => $this->type,
            'paperSize' => $this->paper_size ?: 'A4',
            'orientation' => $this->orientation ?: 'portrait',
            'headerHtml' => $this->header_html ?: '',
            'bodyHtml' => $this->body_html ?: '',
            'footerHtml' => $this->footer_html ?: '',
            'css' => $this->css ?: '',
            'settings' => $this->settings ?: [],
            'logoPath' => $this->logo_path ?: '',
            'snapshotReason' => $this->snapshot_reason ?: 'manual',
            'createdBy' => $this->creator?->name,
            'createdAt' => optional($this->created_at)->format('Y-m-d H:i'),
            'createdAtHuman' => optional($this->created_at)->diffForHumans(),
            'urls' => [
                'restore' => route('finance.templates.versions.restore', [$this->document_template_id, $this->id]),
                'delete' => route('finance.templates.versions.destroy', [$this->document_template_id, $this->id]),
            ],
        ];
    }
}