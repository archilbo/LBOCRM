<?php

namespace App\Services;

class WordDocumentConverter
{
    private ?\COM $word = null;

    public function __construct()
    {
        if (!class_exists('\\COM', false)) {
            throw new \RuntimeException(
                'PHP COM extension is not enabled. '
                . 'Add "extension=com_dotnet" to php.ini and restart the web server.'
            );
        }
    }

    public function isAvailable(): bool
    {
        try {
            $word = new \COM('Word.Application');
            $word->Quit(false);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function convertDocxToPdf(string $absoluteDocxPath, string $absolutePdfPath): void
    {
        if (!file_exists($absoluteDocxPath)) {
            throw new \RuntimeException("DOCX file not found: $absoluteDocxPath");
        }

        $pdfDir = dirname($absolutePdfPath);

        if (!is_dir($pdfDir)) {
            mkdir($pdfDir, 0755, true);
        }

        $word = null;

        try {
            $word = new \COM('Word.Application');
            $word->Visible = false;
            $word->DisplayAlerts = false;
            $word->ScreenUpdating = false;

            $doc = $word->Documents->Open($absoluteDocxPath);

            $doc->ExportAsFixedFormat($absolutePdfPath, 17);

            $doc->Close(false);
            $word->Quit(false);

            unset($doc, $word);

            if (!file_exists($absolutePdfPath)) {
                throw new \RuntimeException("Word did not create PDF at: $absolutePdfPath");
            }
        } catch (\Throwable $e) {
            if (isset($word)) {
                try {
                    $word->Quit(false);
                } catch (\Throwable) {
                }

                unset($word);
            }

            throw new \RuntimeException('Word PDF conversion failed: ' . $e->getMessage());
        }
    }
}
