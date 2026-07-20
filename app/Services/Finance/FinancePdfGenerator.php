<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use RuntimeException;
use Throwable;

class FinancePdfGenerator
{
    public function __construct(
        private readonly FinanceTemplateRenderer $renderer,
        private readonly FinanceLockedDocumentNumberResolver $numberResolver,
        private readonly FinanceDocumentIssuanceService $issuance,
        private readonly FinanceFileStorageService $storage,
    ) {
    }

    public function generate(FinanceDocument $document, ?User $user = null): string
    {
        try {
            $document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
            $this->numberResolver->forModel($document, $document->type, 'number', $document->issue_date);
            $document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
            $document = $this->issuance->issue($document, $user);

            $html = $document->rendered_html_snapshot ?: $this->renderer->renderHtml($document);
            $directory = $this->storage->directory($document);
            $this->storage->disk()->makeDirectory($directory);

            $relativePath = $directory . '/' . $document->number . '.pdf';
            $absolutePath = $this->storage->disk()->path($relativePath);

            Pdf::loadHTML($html)
                ->setPaper('a4', 'portrait')
                ->save($absolutePath);

            if (!file_exists($absolutePath) || filesize($absolutePath) === 0) {
                throw new RuntimeException('PDF file was not created.');
            }

            $document->forceFill([
                'pdf_path' => $relativePath,
                'pdf_checksum' => hash_file('sha256', $absolutePath),
                'generated_at' => now(),
            ])->save();

            return $relativePath;
        } catch (Throwable $e) {
            throw new RuntimeException('Unable to generate finance PDF: ' . $e->getMessage(), previous: $e);
        }
    }

}
