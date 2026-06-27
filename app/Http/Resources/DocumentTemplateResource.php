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
                'quote' => 'Devis',
                'invoice' => 'Facture',
                'receipt' => 'Recu',
                default => ucfirst((string) $this->type),
            },
            'name' => $this->name,
            'slug' => $this->slug,
            'isDefault' => (bool) $this->is_default,
            'paperSize' => $this->paper_size,
            'orientation' => $this->orientation,
            'headerHtml' => $this->header_html ?? '',
            'bodyHtml' => $this->body_html ?? '',
            'footerHtml' => $this->footer_html ?? '',
            'css' => $this->css ?? '',
            'settings' => $this->settings ?? [],
            'logoPath' => $this->logo_path ?? '',
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'urls' => [
                'update' => route('finance.templates.update', $this->resource),
                'delete' => route('finance.templates.destroy', $this->resource),
                'duplicate' => route('finance.templates.duplicate', $this->resource),
                'setDefault' => route('finance.templates.default', $this->resource),
                'preview' => route('finance.templates.preview', $this->resource),
            ],
        ];
    }
}
