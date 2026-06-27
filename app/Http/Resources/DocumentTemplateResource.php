<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'typeLabel' => match ($this->type) {
                'invoice' => 'Facture',
                'receipt' => 'Recu',
                'quote' => 'Devis',
                default => ucfirst((string) $this->type),
            },
            'name' => $this->name,
            'slug' => $this->slug,
            'isDefault' => (bool) $this->is_default,
            'paperSize' => $this->paper_size ?: 'A4',
            'orientation' => $this->orientation ?: 'portrait',
            'headerHtml' => $this->header_html ?: '',
            'bodyHtml' => $this->body_html ?: '',
            'footerHtml' => $this->footer_html ?: '',
            'css' => $this->css ?: '',
            'settings' => $this->settings ?: [],
            'logoPath' => $this->logo_path ?: '',
            'createdAt' => optional($this->created_at)->format('Y-m-d'),
            'updatedAt' => optional($this->updated_at)->diffForHumans(),
            'urls' => [
                'update' => route('finance.templates.update', $this->resource),
                'delete' => route('finance.templates.destroy', $this->resource),
                'duplicate' => route('finance.templates.duplicate', $this->resource),
                'setDefault' => route('finance.templates.default', $this->resource),
                'preview' => route('finance.templates.preview', $this->resource),
                'versions' => route('finance.templates.versions.index', $this->resource),
                'snapshot' => route('finance.templates.versions.store', $this->resource),
            ],
        ];
    }
}