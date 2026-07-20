<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceFileStorageService
{
    public function disk(): Filesystem
    {
        return Storage::disk('local');
    }

    public function directory(FinanceDocument $document): string
    {
        return implode('/', [
            'finance',
            'company-'.$document->company_id,
            'branch-'.($document->branch_id ?: 'shared'),
            match ($document->type) {
                'quote' => 'quotes',
                'invoice' => 'invoices',
                'receipt' => 'receipts',
                default => 'documents',
            },
            $document->number,
        ]);
    }

    public function ensurePrivate(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if ($this->disk()->exists($path)) {
            return $path;
        }

        $public = Storage::disk('public');
        if (! $public->exists($path)) {
            return null;
        }

        $stream = $public->readStream($path);
        if (! is_resource($stream) || ! $this->disk()->writeStream($path, $stream)) {
            throw new RuntimeException('Impossible de securiser le fichier finance.');
        }

        fclose($stream);
        $public->delete($path);

        return $path;
    }

    public function response(string $path, string $filename, bool $inline = false): StreamedResponse
    {
        $path = $this->ensurePrivate($path) ?: throw new RuntimeException('Le fichier finance est introuvable.');
        $disposition = $inline ? 'inline' : 'attachment';

        return $this->disk()->response($path, $filename, [
            'Content-Disposition' => $disposition.'; filename="'.$filename.'"',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
