<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
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
            '/usr/bin/soffice',
            '/usr/bin/libreoffice',
            '/usr/local/bin/soffice',
            '/usr/local/bin/libreoffice',
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
        $workspace = storage_path('app/.office-conversion/' . Str::uuid()->toString());
        $sourceDocx = $workspace . DIRECTORY_SEPARATOR . 'source.docx';
        $expectedPdf = $workspace . DIRECTORY_SEPARATOR . 'source.pdf';
        $profileDir = $workspace . DIRECTORY_SEPARATOR . 'profile';

        File::ensureDirectoryExists($workspace);
        File::ensureDirectoryExists($profileDir);

        try {
            File::copy($absoluteDocxPath, $sourceDocx);

            // A separate profile and workspace prevent LibreOffice locks and
            // output collisions when multiple contracts are generated at once.
            $process = new Process([
                $this->libreOfficePath,
                '--headless',
                '--nologo',
                '--nodefault',
                '--nofirststartwizard',
                '-env:UserInstallation=' . $this->fileUri($profileDir),
                '--convert-to',
                'pdf:writer_pdf_Export',
                '--outdir',
                $workspace,
                $sourceDocx,
            ]);

            $process->setTimeout(120);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new \RuntimeException(
                    trim($process->getErrorOutput()) ?: trim($process->getOutput()) ?: 'LibreOffice returned an unknown error.'
                );
            }

            if (!is_file($expectedPdf) || filesize($expectedPdf) < 5 || file_get_contents($expectedPdf, false, null, 0, 5) !== '%PDF-') {
                throw new \RuntimeException('LibreOffice did not create a valid PDF.');
            }

            File::ensureDirectoryExists($outputDir);
            File::copy($expectedPdf, $absolutePdfPath);
        } catch (\Throwable $e) {
            throw new \RuntimeException('LibreOffice PDF conversion failed: ' . $e->getMessage(), previous: $e);
        } finally {
            File::deleteDirectory($workspace);
        }
    }

    private function fileUri(string $path): string
    {
        $normalizedPath = str_replace('\\', '/', $path);

        return 'file:///' . ltrim($normalizedPath, '/');
    }
}
