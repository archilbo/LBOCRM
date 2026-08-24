<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FinanceDocumentIssuanceService
{
    public function __construct(
        private readonly FinanceDocumentRenderData $renderData,
        private readonly FinanceTemplateRenderer $renderer,
        private readonly FinanceActivityService $activity,
    ) {
    }

    public function issue(FinanceDocument $document, ?User $user = null): FinanceDocument
    {
        if ($document->issued_at && $document->rendered_html_snapshot) {
            return $document;
        }

        return DB::transaction(function () use ($document, $user) {
            $document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
            $data = $this->renderData->toArray($document);
            $html = $this->renderer->renderHtml($document);
            $template = $document->template;

            $document->forceFill([
                'issued_at' => now(),
                'issued_by' => $user?->id,
                'status' => $document->status === 'draft' ? 'issued' : $document->status,
                'template_snapshot' => $template ? $template->only([
                    'id', 'type', 'name', 'slug', 'paper_size', 'orientation',
                    'header_html', 'body_html', 'footer_html', 'css', 'settings', 'logo_path',
                ]) : null,
                'render_data_snapshot' => $data,
                'rendered_html_snapshot' => $html,
                'snapshot_hash' => hash('sha256', $html.'|'.json_encode($data)),
            ])->save();

            if ($user) {
                $this->activity->log($document, $user, 'finance.document.issued', [], [
                    'number' => $document->number,
                    'snapshot_hash' => $document->snapshot_hash,
                ]);
            }

            return $document->fresh(['client', 'dossier', 'items', 'payments', 'template']);
        });
    }
}
