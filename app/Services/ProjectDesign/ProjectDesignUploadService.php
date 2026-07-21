<?php

namespace App\Services\ProjectDesign;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignAsset;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Enums\ProjectDesign\ProjectDesignVersionStatus;
use App\Jobs\ProjectDesign\ProcessProjectDesignPreview;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectDesignUploadService
{
    private string $disk;

    public function __construct()
    {
        $this->disk = config('project_design.storage.disk', 'project_design');
    }

    public function createVersion(
        ProjectDesignFile $file,
        Dossier $dossier,
        array $uploadedFiles,
        array $metadata,
        int $userId,
    ): ProjectDesignFileVersion {
        return DB::transaction(function () use ($file, $dossier, $uploadedFiles, $metadata, $userId) {
            $latestVersionNumber = (int) $file->versions()->max('version_number');

            $status = ($metadata['intent'] ?? 'draft') === 'submit'
                ? ProjectDesignVersionStatus::Submitted->value
                : ProjectDesignVersionStatus::Draft->value;

            $version = $file->versions()->create([
                'company_id' => $file->company_id,
                'dossier_id' => $dossier->id,
                'version_number' => $latestVersionNumber + 1,
                'status' => $status,
                'upload_status' => 'uploading',
                'preview_status' => 'pending',
                'review_status' => 'none',
                'uploaded_by' => $userId,
                'change_summary' => $metadata['change_summary'] ?? null,
                'revision_code' => $metadata['revision_code'] ?? null,
                'upload_note' => $metadata['note'] ?? null,
                'idempotency_key' => $metadata['idempotency_key'] ?? null,
            ]);

            $sortOrder = 0;

            foreach ($uploadedFiles as $index => $uploadedFile) {
                $assetType = $metadata['asset_types'][$index] ?? $this->guessAssetType($uploadedFile);
                $storedFilename = $this->storeFile($uploadedFile, $file, $version, $userId);

                $file->assets()->create([
                    'company_id' => $file->company_id,
                    'version_id' => $version->id,
                    'asset_type' => $assetType,
                    'disk' => $this->disk,
                    'path' => $storedFilename,
                    'original_filename' => $uploadedFile->getClientOriginalName(),
                    'stored_filename' => $storedFilename,
                    'mime_type' => $uploadedFile->getMimeType(),
                    'extension' => $uploadedFile->getClientOriginalExtension(),
                    'size_bytes' => $uploadedFile->getSize(),
                    'checksum_sha256' => hash_file('sha256', $uploadedFile->getRealPath()),
                    'scan_status' => 'pending',
                    'previewable' => $this->isImmediatelyPreviewable($uploadedFile->getMimeType()),
                    'sort_order' => $sortOrder,
                    'uploaded_by' => $userId,
                ]);

                $sortOrder++;
            }

            $version->update(['upload_status' => 'completed']);

            $file->update(['current_version_id' => $version->id]);

            DB::afterCommit(function () use ($version) {
                ProcessProjectDesignPreview::dispatch($version);
            });

            return $version->fresh(['assets']);
        });
    }

    private function storeFile(UploadedFile $file, ProjectDesignFile $designFile, ProjectDesignFileVersion $version, int $userId): string
    {
        $companyId = $designFile->company_id;
        $dossierId = $designFile->dossier_id;
        $fileId = $designFile->id;
        $versionId = $version->id;

        $directory = "companies/{$companyId}/dossiers/{$dossierId}/files/{$fileId}/versions/{$versionId}";

        $storedFilename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs($directory, $storedFilename, ['disk' => $this->disk]);

        if ($path === false) {
            throw new \RuntimeException('Failed to store file.');
        }

        return $path;
    }

    private function isImmediatelyPreviewable(string $mimeType): bool
    {
        return in_array($mimeType, [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp',
            'image/tiff',
        ], true);
    }

    private function guessAssetType(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        $sourceExtensions = ['dwg', 'dxf', 'pln', 'pla', 'rvt', 'skp', 'ifc', 'rfa'];
        $reviewExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'tiff', 'tif'];

        if (in_array($extension, $sourceExtensions, true)) {
            return 'source';
        }

        if (in_array($extension, $reviewExtensions, true)) {
            return 'review_pdf';
        }

        return 'supporting';
    }
}
