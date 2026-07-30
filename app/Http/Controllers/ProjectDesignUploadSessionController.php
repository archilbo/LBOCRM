<?php

namespace App\Http\Controllers;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignUploadSession;
use App\Services\Dossiers\DossierPathBuilder;
use App\Services\Tus\TusServer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectDesignUploadSessionController extends Controller
{
    public function __construct(
        private readonly TusServer $tus,
        private readonly DossierPathBuilder $pathBuilder,
    ) {}

    public function create(Request $request, Dossier $dossier): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);

        $data = $request->validate([
            'client_upload_id' => 'required|string|max:64',
            'operation' => 'required|string|in:new_file,new_version,add_review_asset,add_supporting_asset',
            'submission_intent' => 'nullable|string|in:draft,submit',
            'design_file_id' => 'nullable|integer|exists:project_design_files,id',
            'files' => 'required|array|min:1|max:50',
            'files.*.client_file_upload_id' => 'required|string|max:64',
            'files.*.asset_type' => 'required|string|in:source,review_pdf,image,ifc,supporting',
            'files.*.original_filename' => 'required|string|max:255',
            'files.*.size_bytes' => 'required|integer|min:1|max:' . config('project_design.validation.max_upload_size', 1048576) * 1024,
        ]);

        $user = $request->user();
        $companyId = $user->company_id;

        $maxFileSizeKb = (int) config('project_design.validation.max_file_size', 204800);
        $maxFileSizeBytes = $maxFileSizeKb * 1024;
        foreach ($data['files'] as $file) {
            if ($file['size_bytes'] > $maxFileSizeBytes) {
                return response()->json(['message' => "File {$file['original_filename']} exceeds maximum size."], 422);
            }
        }

        $totalBytes = array_sum(array_column($data['files'], 'size_bytes'));

        $metadata = [
            'name' => $request->input('name'),
            'discipline' => $request->input('discipline'),
            'code' => $request->input('code'),
            'description' => $request->input('description'),
            'change_summary' => $request->input('change_summary'),
            'revision_code' => $request->input('revision_code'),
            'note' => $request->input('note'),
        ];

        $session = DB::transaction(function () use ($data, $dossier, $user, $companyId, $totalBytes, $metadata) {
            $session = ProjectDesignUploadSession::create([
                'uuid' => (string) Str::uuid(),
                'client_upload_id' => $data['client_upload_id'],
                'company_id' => $companyId,
                'dossier_id' => $dossier->id,
                'design_file_id' => $data['design_file_id'] ?? null,
                'user_id' => $user->id,
                'operation' => $data['operation'],
                'submission_intent' => $data['submission_intent'] ?? 'draft',
                'status' => 'pending',
                'total_files' => count($data['files']),
                'total_bytes' => $totalBytes,
                'expires_at' => now()->addDay(),
                'metadata_json' => json_encode($metadata),
            ]);

            foreach ($data['files'] as $file) {
                $session->files()->create([
                    'client_file_upload_id' => $file['client_file_upload_id'],
                    'asset_type' => $file['asset_type'],
                    'original_filename' => $file['original_filename'],
                    'size_bytes' => $file['size_bytes'],
                    'status' => 'queued',
                ]);
            }

            return $session;
        });

        return response()->json([
            'uploadSessionId' => $session->id,
            'uuid' => $session->uuid,
            'clientUploadId' => $session->client_upload_id,
            'tusEndpoint' => url('/tus'),
            'expiresAt' => $session->expires_at->toIso8601String(),
            'maximumSize' => $maxFileSizeBytes,
            'allowedAssetTypes' => ['source', 'review_pdf', 'image', 'ifc', 'supporting'],
            'files' => $session->files->map(fn ($f) => [
                'clientFileUploadId' => $f->client_file_upload_id,
                'assetType' => $f->asset_type,
                'originalFilename' => $f->original_filename,
                'sizeBytes' => $f->size_bytes,
            ]),
        ], 201);
    }

    public function finalize(Request $request, Dossier $dossier, ProjectDesignUploadSession $session): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);

        abort_unless((int) $session->dossier_id === (int) $dossier->id, 403);
        abort_unless((int) $session->user_id === (int) $request->user()->id, 403);
        abort_if($session->status !== 'pending' && $session->status !== 'transferred', 422);

        $session->update(['status' => 'finalizing']);

        DB::beginTransaction();
        try {
            foreach ($session->files as $sessionFile) {
                $tusUploadId = $sessionFile->tus_upload_id;
                if (!$tusUploadId) {
                    continue;
                }

                if (!$this->tus->isComplete($tusUploadId)) {
                    throw new \RuntimeException("Tus upload {$tusUploadId} is not complete for {$sessionFile->original_filename}");
                }

                $filePath = $this->tus->getFilePath($tusUploadId);
                if (!$filePath || !file_exists($filePath)) {
                    throw new \RuntimeException("Tus file not found for {$sessionFile->original_filename}");
                }

                $disk = Storage::disk(config('project_design.storage.disk', 'project_design'));

                $baseDir = $this->pathBuilder->designPath($dossier);
                $storedPath = $disk->putFileAs(
                    "{$baseDir}/companies/{$session->company_id}/files/{$session->design_file_id}/versions/{$session->version_id}",
                    $filePath,
                    $sessionFile->original_filename,
                );

                if ($storedPath === false) {
                    throw new \RuntimeException("Failed to store file: {$sessionFile->original_filename}");
                }

                $sessionFile->update([
                    'temporary_path' => $storedPath,
                    'status' => 'completed',
                ]);
            }

            $session->update([
                'status' => 'completed',
                'finalized_at' => now(),
                'completed_at' => now(),
            ]);

            DB::commit();

            foreach ($session->files as $sessionFile) {
                if ($sessionFile->tus_upload_id) {
                    $this->tus->delete($sessionFile->tus_upload_id);
                }
            }

            return response()->json(['message' => 'Upload finalized successfully.']);
        } catch (\Throwable $e) {
            DB::rollBack();
            $session->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function status(Request $request, Dossier $dossier, ProjectDesignUploadSession $session): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);
        abort_unless((int) $session->dossier_id === (int) $dossier->id, 403);

        return response()->json([
            'id' => $session->id,
            'clientUploadId' => $session->client_upload_id,
            'status' => $session->status,
            'totalFiles' => $session->total_files,
            'completedFiles' => $session->completed_files,
            'totalBytes' => $session->total_bytes,
            'uploadedBytes' => $session->uploaded_bytes,
            'processingProgress' => $session->processing_progress,
            'errorCode' => $session->error_code,
            'errorMessage' => $session->error_message,
            'files' => $session->files->map(fn ($f) => [
                'clientFileUploadId' => $f->client_file_upload_id,
                'status' => $f->status,
                'originalFilename' => $f->original_filename,
                'sizeBytes' => $f->size_bytes,
                'uploadedBytes' => $f->uploaded_bytes,
                'errorCode' => $f->error_code,
                'errorMessage' => $f->error_message,
            ]),
        ]);
    }

    public function cancel(Request $request, Dossier $dossier, ProjectDesignUploadSession $session): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);
        abort_unless((int) $session->dossier_id === (int) $dossier->id, 403);

        $session->update(['status' => 'canceled', 'canceled_at' => now()]);

        foreach ($session->files as $sessionFile) {
            if ($sessionFile->tus_upload_id) {
                $this->tus->delete($sessionFile->tus_upload_id);
            }
        }

        return response()->json(['message' => 'Upload canceled.']);
    }
}
