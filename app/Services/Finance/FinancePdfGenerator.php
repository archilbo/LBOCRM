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
                ->setPaper(...$this->paperSettings($document->template))
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

    /**
     * Strictly mapped Dompdf paper settings from template metadata.
     * Arbitrary strings never reach Dompdf.
     *
     * @return array{0: string, 1: string} [$paper, $orientation]
     */
    private function paperSettings(?\App\Models\FinanceTemplate $template): array
    {
        $paper = match (strtoupper((string) ($template?->paper_size ?? 'A4'))) {
            'A5' => 'a5',
            'LETTER' => 'letter',
            default => 'a4',
        };
        $orientation = in_array(strtolower((string) ($template?->orientation ?? 'portrait')), ['landscape'], true)
            ? 'landscape'
            : 'portrait';

        return [$paper, $orientation];
    }

}
