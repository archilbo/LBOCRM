<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class FinancePdfGenerator
{
    public function __construct(
        private readonly FinanceTemplateRenderer $renderer,
        private readonly FinanceLockedDocumentNumberResolver $numberResolver,
    ) {
    }

    public function generate(FinanceDocument $document): string
    {
        try {
            $document->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);
            $this->numberResolver->forModel($document, $document->type, 'number', $document->issue_date);
            $document->refresh()->loadMissing(['client', 'dossier', 'items', 'payments', 'template']);

            $html = $this->renderer->renderHtml($document);
            $directory = $this->directory($document);
            Storage::disk('public')->makeDirectory($directory);

            $relativePath = $directory . '/' . $document->number . '.pdf';
            $absolutePath = Storage::disk('public')->path($relativePath);

            Pdf::loadHTML($html)
                ->setPaper('a4', 'portrait')
                ->save($absolutePath);

            if (!file_exists($absolutePath) || filesize($absolutePath) === 0) {
                throw new RuntimeException('PDF file was not created.');
            }

            $document->forceFill([
                'pdf_path' => $relativePath,
                'generated_at' => now(),
            ])->save();

            return $relativePath;
        } catch (Throwable $e) {
            throw new RuntimeException('Unable to generate finance PDF: ' . $e->getMessage(), previous: $e);
        }
    }

    private function directory(FinanceDocument $document): string
    {
        return 'finance/' . match ($document->type) {
            'quote' => 'quotes',
            'invoice' => 'invoices',
            'receipt' => 'receipts',
            default => 'documents',
        } . '/' . $document->number;
    }
}
