<?php

namespace App\Services;

use Symfony\Component\Process\Process;

class OfficeDocumentConverter
{
    private ?string $libreOfficePath = null;

    public function __construct()
    {
        $envPath = config('services.libreoffice.path');

        if ($envPath && file_exists($envPath)) {
            $this->libreOfficePath = $envPath;

            return;
        }

        $candidates = [
            'C:\Program Files\LibreOffice\program\soffice.exe',
            'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                $this->libreOfficePath = $candidate;

                break;
            }
        }
    }

    public function isAvailable(): bool
    {
        return $this->libreOfficePath !== null;
    }

    public function getPath(): ?string
    {
        return $this->libreOfficePath;
    }

    public function convertDocxToPdf(string $absoluteDocxPath, string $absolutePdfPath): void
    {
        if (!$this->isAvailable()) {
            throw new \RuntimeException(
                'LibreOffice is not installed. Set LIBREOFFICE_PATH in .env or install LibreOffice.'
            );
        }

        if (!file_exists($absoluteDocxPath)) {
            throw new \RuntimeException("DOCX file not found: $absoluteDocxPath");
        }

        $outputDir = dirname($absolutePdfPath);

        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $process = new Process([
            $this->libreOfficePath,
            '--headless',
            '--convert-to',
            'pdf',
            '--outdir',
            $outputDir,
            $absoluteDocxPath,
        ]);

        $process->setTimeout(120);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException(
                'LibreOffice PDF conversion failed: ' . $process->getErrorOutput()
            );
        }

        $expectedPdf = $outputDir . '/' . pathinfo($absoluteDocxPath, PATHINFO_FILENAME) . '.pdf';

        if (file_exists($expectedPdf) && $expectedPdf !== $absolutePdfPath) {
            rename($expectedPdf, $absolutePdfPath);
        }

        if (!file_exists($absolutePdfPath)) {
            throw new \RuntimeException('PDF was not created by LibreOffice.');
        }
    }
}
