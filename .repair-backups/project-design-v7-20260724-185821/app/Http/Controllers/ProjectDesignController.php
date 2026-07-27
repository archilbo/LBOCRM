<?php

namespace App\Http\Controllers;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignAnnotation;
use App\Models\ProjectDesign\ProjectDesignAsset;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignFolder;
use App\Models\ProjectDesign\ProjectDesignRemark;
use App\Models\ProjectDesign\ProjectDesignReview;
use App\Enums\ProjectDesign\ProjectDesignVersionStatus;
use App\Http\Requests\ProjectDesign\StoreProjectDesignAnnotationRequest;
use App\Http\Requests\ProjectDesign\UpdateProjectDesignAnnotationRequest;
use App\Http\Resources\ProjectDesign\ProjectDesignAnnotationResource;
use App\Http\Resources\ProjectDesign\ProjectDesignFileResource;
use App\Http\Resources\ProjectDesign\ProjectDesignFileVersionResource;
use App\Http\Resources\ProjectDesign\ProjectDesignReviewResource;
use App\Http\Resources\ProjectDesign\ProjectDesignRemarkResource;
use App\Services\CompanyContext;
use App\Services\ProjectDesign\ProjectDesignUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ProjectDesignController extends Controller
{
    private function dossier(Dossier $dossier): Dossier
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);
        return $dossier;
    }

    public function summary(Request $request, Dossier $dossier): JsonResponse
    {
        $dossier = $this->dossier($dossier);
        $user = $request->user();
        $designFilesQuery = $dossier->designFiles();
        $designFileIds = (clone $designFilesQuery)->select('id');
        $versionIds = ProjectDesignFileVersion::whereIn('file_id', $designFileIds)->select('id');
        $openRemarkStatuses = ['open', 'assigned', 'in_progress', 'reopened'];
        $activeApprovalFiles = (clone $designFilesQuery)
            ->where('requires_approval', true)
            ->whereNull('archived_at');
        $activeApprovalFilesCount = (clone $activeApprovalFiles)->count();
        $approvedFilesCount = (clone $activeApprovalFiles)
            ->whereNotNull('latest_approved_version_id')
            ->count();

        return response()->json([
            'folders' => $dossier->designFolders()->count(),
            'files' => $dossier->designFiles()->count(),
            'versions' => ProjectDesignFileVersion::whereIn('file_id', $designFileIds)->count(),
            'activities' => 0, // Activity logging is not fully implemented yet.
            'awaitingReview' => ProjectDesignFileVersion::whereIn('file_id', $designFileIds)
                ->whereIn('review_status', ['submitted', 'pending', 'in_review', 'changes_requested', 'ready_for_verification'])
                ->count(),
            'openRemarks' => ProjectDesignRemark::whereIn('version_id', $versionIds)
                ->whereIn('status', $openRemarkStatuses)
                ->count(),
            'overdueRemarks' => ProjectDesignRemark::whereIn('version_id', $versionIds)
                ->whereIn('status', $openRemarkStatuses)
                ->whereDate('due_date', '<', now())
                ->count(),
            'approvedFiles' => $approvedFilesCount,
            'approvalProgress' => $activeApprovalFilesCount > 0
                ? (int) round(($approvedFilesCount / $activeApprovalFilesCount) * 100)
                : 0,
            'canUpload' => $user->can('project-design.upload'),
        ]);
    }

    public function folders(Request $request, Dossier $dossier): JsonResponse
    {
        $this->dossier($dossier);
        return response()->json($dossier->designFolders()->orderBy('sort_order')->get());
    }

    public function storeFolder(Request $request, Dossier $dossier): JsonResponse
    {
        Gate::authorize('createFolder', [ProjectDesignFolder::class, $dossier]);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:project_design_folders,id',
        ]);

        if ($data['parent_id'] ?? null) {
            $parent = ProjectDesignFolder::findOrFail($data['parent_id']);
            abort_unless((int) $parent->dossier_id === (int) $dossier->id, 403);
        }

        $folder = $dossier->designFolders()->create([
            'company_id' => $request->user()->company_id,
            'name' => $data['name'],
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return response()->json($folder, 201);
    }

    public function updateFolder(Request $request, Dossier $dossier, ProjectDesignFolder $folder): JsonResponse
    {
        Gate::authorize('updateFolder', [$folder, $dossier]);
        abort_unless((int) $folder->dossier_id === (int) $dossier->id, 403);

        $data = $request->validate(['name' => 'required|string|max:255']);
        $folder->update($data);

        return response()->json($folder);
    }

    public function destroyFolder(Request $request, Dossier $dossier, ProjectDesignFolder $folder): JsonResponse
    {
        Gate::authorize('deleteFolder', [$folder, $dossier]);
        abort_unless((int) $folder->dossier_id === (int) $dossier->id, 403);

        $folder->delete();
        return response()->json(['message' => 'Folder deleted.']);
    }

    public function index(Request $request, Dossier $dossier): JsonResponse
    {
        $this->dossier($dossier);

        $query = $dossier->designFiles()->with('latestVersion', 'folder', 'responsibleUser', 'reviewer')->withCount('openRemarks');

        if ($folderId = $request->get('folder_id')) {
            $query->where('folder_id', $folderId);
        }
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%");
            });
        }
        if ($discipline = $request->get('discipline')) {
            $query->where('discipline', $discipline);
        }
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $sortWhitelist = ['name', 'discipline', 'status', 'created_at', 'updated_at'];
        $sort = in_array($request->get('sort', 'name'), $sortWhitelist) ? $request->get('sort') : 'name';
        $dir = strtolower($request->get('dir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sort, $dir);

        $files = $query->paginate(min(max((int) ($request->get('per_page') ?? 30), 10), 100));

        return response()->json($files);
    }

    public function store(Request $request, Dossier $dossier): JsonResponse
    {
        Gate::authorize('createFile', [ProjectDesignFile::class, $dossier]);

        $data = $request->validate([
            'folder_id' => 'nullable|exists:project_design_folders,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'discipline' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
        ]);

        if ($data['folder_id'] ?? null) {
            $folder = ProjectDesignFolder::findOrFail($data['folder_id']);
            abort_unless((int) $folder->dossier_id === (int) $dossier->id, 403);
        }

        $data['company_id'] = $request->user()->company_id;
        $data['created_by'] = $request->user()->id;

        $file = $dossier->designFiles()->create($data);

        return response()->json($file, 201);
    }

    public function update(Request $request, Dossier $dossier, ProjectDesignFile $file): JsonResponse
    {
        Gate::authorize('updateFile', [$file, $dossier]);
        abort_unless((int) $file->dossier_id === (int) $dossier->id, 403);

        $data = $request->validate([
            'name' => 'string|max:255',
            'code' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'discipline' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'record_version' => 'required|integer',
        ]);

        $affected = $file->where('id', $file->id)->where('record_version', $data['record_version'])->update([
            'name' => $data['name'] ?? $file->name,
            'code' => $data['code'] ?? $file->code,
            'description' => $data['description'] ?? $file->description,
            'discipline' => $data['discipline'] ?? $file->discipline,
            'category' => $data['category'] ?? $file->category,
            'record_version' => $data['record_version'] + 1,
        ]);

        if (! $affected) {
            return response()->json([
                'message' => 'This record was changed by another user. Reload the latest data before saving.',
            ], 409);
        }

        return response()->json($file->fresh());
    }

    public function destroy(Request $request, Dossier $dossier, ProjectDesignFile $file): JsonResponse
    {
        Gate::authorize('delete', [$file, $dossier]);
        abort_unless((int) $file->dossier_id === (int) $dossier->id, 403);

        $file->archiveFile();
        return response()->json(['message' => 'File archived.']);
    }

    public function restore(Request $request, Dossier $dossier, ProjectDesignFile $file): JsonResponse
    {
        Gate::authorize('restoreFile', [$file, $dossier]);
        abort_unless((int) $file->dossier_id === (int) $dossier->id, 403);

        $file->update(['status' => 'active', 'archived_at' => null]);
        return response()->json(['message' => 'File restored.']);
    }

    public function versions(Request $request, Dossier $dossier, ProjectDesignFile $file): JsonResponse
    {
        $this->dossier($dossier);
        abort_unless((int) $file->dossier_id === (int) $dossier->id, 403);

        $versions = $file->versions()->with('uploadedBy', 'assets')->orderByDesc('version_number')->get();
        return response()->json(['data' => ProjectDesignFileVersionResource::collection($versions)]);
    }

    public function uploadVersion(Request $request, Dossier $dossier, ProjectDesignFile $file, ProjectDesignUploadService $uploadService): JsonResponse
    {
        Gate::authorize('uploadVersion', [$file, $dossier]);
        abort_unless((int) $file->dossier_id === (int) $dossier->id, 403);

        $data = $request->validate([
            'note' => 'nullable|string',
            'change_summary' => 'nullable|string',
            'revision_code' => 'nullable|string|max:50',
            'idempotency_key' => 'nullable|string|max:64',
            'intent' => 'nullable|string|in:draft,submit',
            'asset_types' => 'nullable|array',
            'asset_types.*' => 'string|max:50',
            'file' => 'nullable|file|max:204800',
            'files' => 'nullable|array',
            'files.*' => 'file|max:204800',
        ]);

        $uploadedFiles = [];

        if ($request->hasFile('file')) {
            $uploadedFiles[] = $request->file('file');
        }

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $f) {
                $uploadedFiles[] = $f;
            }
        }

        if (empty($uploadedFiles)) {
            return response()->json(['message' => 'No file provided.'], 422);
        }

        $version = $uploadService->createVersion(
            $file,
            $dossier,
            $uploadedFiles,
            $data,
            $request->user()->id,
        );

        return response()->json(new ProjectDesignFileVersionResource($version), 201);
    }

    public function preview(Request $request, Dossier $dossier, ProjectDesignFileVersion $version): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);

        $previewAsset = $version->assets()->where('previewable', true)->orderBy('sort_order')->first();

        if (! $previewAsset || ! Storage::disk($previewAsset->disk)->exists($previewAsset->path)) {
            abort(404);
        }

        $disk = Storage::disk($previewAsset->disk);
        $mime = $previewAsset->mime_type ?? 'application/octet-stream';

        return response()->file($disk->path($previewAsset->path), [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $previewAsset->original_filename . '"',
        ]);
    }

    public function download(Request $request, Dossier $dossier, ProjectDesignFileVersion $version): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        Gate::authorize('downloadVersion', [$version, $dossier]);

        $asset = $version->assets()->orderBy('sort_order')->first();

        if (! $asset || ! Storage::disk($asset->disk)->exists($asset->path)) {
            abort(404);
        }

        $disk = Storage::disk($asset->disk);

        return response()->download($disk->path($asset->path), $asset->original_filename);
    }

    public function activity(Request $request, Dossier $dossier): JsonResponse
    {
        $this->dossier($dossier);

        return response()->json(['data' => []]);
    }

    public function show(Request $request, Dossier $dossier, ProjectDesignFile $file): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);
        abort_unless((int) $file->dossier_id === (int) $dossier->id, 403);

        $file->load('latestVersion.assets', 'folder', 'responsibleUser', 'reviewer');

        return response()->json(new ProjectDesignFileResource($file));
    }

    public function getAnnotations(Request $request, Dossier $dossier, ProjectDesignFileVersion $version): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);

        $annotations = $version->annotations()
            ->with(['authoredBy', 'createdBy', 'remarks.createdBy', 'asset'])
            ->orderBy('id')
            ->get();

        return response()->json(['data' => ProjectDesignAnnotationResource::collection($annotations)]);
    }

    public function storeAnnotation(StoreProjectDesignAnnotationRequest $request, Dossier $dossier, ProjectDesignFileVersion $version): JsonResponse
    {
        Gate::authorize('annotate', [$version, $dossier]);

        $data = $request->validated();
        $companyId = app(CompanyContext::class)->id($request->user());

        $annotation = ProjectDesignAnnotation::create([
            'company_id' => $companyId,
            'dossier_id' => $dossier->id,
            'file_id' => $version->file_id,
            'version_id' => $version->id,
            'asset_id' => $data['asset_id'],
            'page_number' => $data['page_number'] ?? null,
            'type' => $data['annotation_type'],
            'coordinate_space' => $data['coordinate_space'] ?? 'page-normalized-v1',
            'geometry' => $data['geometry'],
            'style_json' => $data['style'] ?? null,
            'viewport_json' => $data['viewport'] ?? null,
            'reference_width' => $data['reference_width'] ?? null,
            'reference_height' => $data['reference_height'] ?? null,
            'source_rotation' => $data['source_rotation'] ?? 0,
            'authored_by' => $request->user()->id,
            'created_by' => $request->user()->id,
        ]);

        return response()->json(new ProjectDesignAnnotationResource($annotation), 201);
    }

    public function updateAnnotation(UpdateProjectDesignAnnotationRequest $request, Dossier $dossier, ProjectDesignFileVersion $version, ProjectDesignAnnotation $annotation): JsonResponse
    {
        Gate::authorize('annotate', [$version, $dossier]);
        abort_unless((int) $annotation->version_id === (int) $version->id, 403);
        abort_unless((int) $annotation->dossier_id === (int) $dossier->id, 403);
        abort_unless((int) $annotation->file_id === (int) $version->file_id, 403);

        $data = $request->validated();
        $oldVersion = $data['record_version'];

        $affected = ProjectDesignAnnotation::where('id', $annotation->id)
            ->where('record_version', $oldVersion)
            ->update([
                'geometry' => $data['geometry'] ?? $annotation->geometry,
                'style_json' => $data['style'] ?? $annotation->style_json,
                'record_version' => $oldVersion + 1,
            ]);

        if (! $affected) {
            return response()->json(['message' => 'Cette annotation a été modifiée par un autre utilisateur. Rechargez les dernières données avant de sauvegarder.'], 409);
        }

        return response()->json(new ProjectDesignAnnotationResource($annotation->fresh()));
    }

    public function destroyAnnotation(Request $request, Dossier $dossier, ProjectDesignFileVersion $version, ProjectDesignAnnotation $annotation): JsonResponse
    {
        Gate::authorize('annotate', [$version, $dossier]);
        abort_unless((int) $annotation->version_id === (int) $version->id, 403);
        abort_unless((int) $annotation->dossier_id === (int) $dossier->id, 403);
        abort_unless((int) $annotation->file_id === (int) $version->file_id, 403);

        $annotation->delete();

        return response()->json(['message' => 'Annotation supprimée.']);
    }

    public function submitForReview(Request $request, Dossier $dossier, ProjectDesignFileVersion $version): JsonResponse
    {
        Gate::authorize('submitReview', [$version, $dossier]);

        $data = $request->validate([
            'reviewer_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
            'due_at' => 'nullable|date',
        ]);

        if ($version->status !== 'draft') {
            return response()->json(['message' => 'Only draft versions can be submitted.'], 422);
        }

        $review = ProjectDesignReview::create([
            'company_id' => $request->user()->company_id,
            'file_id' => $version->file_id,
            'version_id' => $version->id,
            'requested_by' => $request->user()->id,
            'reviewer_id' => $data['reviewer_id'],
            'status' => 'pending',
            'notes' => $data['notes'] ?? null,
            'requested_at' => now(),
            'due_at' => $data['due_at'] ?? now()->addDays(config('project_design.review.default_due_days', 14)),
        ]);

        $version->update(['status' => 'submitted', 'review_status' => 'pending', 'submitted_at' => now(), 'submitted_by' => $request->user()->id]);

        return response()->json(new ProjectDesignReviewResource($review->load('requestedBy', 'reviewer', 'file', 'version')), 201);
    }

    public function startReview(Request $request, Dossier $dossier, ProjectDesignFileVersion $version, ProjectDesignReview $review): JsonResponse
    {
        Gate::authorize('reviewVersion', [$version, $dossier]);
        abort_unless((int) $review->version_id === (int) $version->id, 403);

        if ($review->status !== 'pending') {
            return response()->json(['message' => 'Review is not pending.'], 422);
        }

        $review->update(['status' => 'in_progress', 'started_at' => now()]);
        $version->update(['review_status' => 'in_review']);

        return response()->json(new ProjectDesignReviewResource($review->fresh()->load('requestedBy', 'reviewer')));
    }

    public function decideReview(Request $request, Dossier $dossier, ProjectDesignFileVersion $version, ProjectDesignReview $review): JsonResponse
    {
        Gate::authorize('reviewVersion', [$version, $dossier]);
        abort_unless((int) $review->version_id === (int) $version->id, 403);

        $data = $request->validate([
            'decision' => 'required|string|in:approved,rejected,changes_requested',
            'general_note' => 'nullable|string',
        ]);

        $review->update([
            'decision' => $data['decision'],
            'general_note' => $data['general_note'] ?? null,
            'status' => $data['decision'],
            'completed_at' => now(),
        ]);

        $versionStatus = match ($data['decision']) {
            'approved' => 'approved',
            'rejected' => 'rejected',
            'changes_requested' => 'draft',
        };

        $version->update([
            'status' => $versionStatus,
            'review_status' => $data['decision'],
            'approved_at' => $data['decision'] === 'approved' ? now() : $version->approved_at,
            'approved_by' => $data['decision'] === 'approved' ? $request->user()->id : $version->approved_by,
            'rejected_at' => $data['decision'] === 'rejected' ? now() : $version->rejected_at,
            'rejected_by' => $data['decision'] === 'rejected' ? $request->user()->id : $version->rejected_by,
        ]);

        if ($data['decision'] === 'approved') {
            $version->file()->update(['latest_approved_version_id' => $version->id]);
        }

        return response()->json(new ProjectDesignReviewResource($review->fresh()->load('requestedBy', 'reviewer')));
    }

    public function reviewQueue(Request $request, Dossier $dossier): JsonResponse
    {
        $this->dossier($dossier);

        $reviews = ProjectDesignReview::whereHas('file', fn ($q) => $q->where('dossier_id', $dossier->id))
            ->with('requestedBy', 'reviewer', 'file', 'version.assets')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => ProjectDesignReviewResource::collection($reviews)]);
    }

    public function addReviewAsset(Request $request, Dossier $dossier, ProjectDesignFileVersion $version): JsonResponse
    {
        Gate::authorize('uploadVersion', [$version->file, $dossier]);

        $data = $request->validate([
            'file' => 'required|file|max:204800',
            'asset_type' => 'nullable|string|max:50',
        ]);

        $uploadedFile = $request->file('file');
        $assetType = $data['asset_type'] ?? app(\App\Services\ProjectDesign\ProjectDesignUploadService::class)->guessAssetType($uploadedFile);

        $disk = config('project_design.storage.disk', 'project_design');
        $companyId = $version->company_id;
        $directory = "companies/{$companyId}/dossiers/{$dossier->id}/files/{$version->file_id}/versions/{$version->id}/review";
        $storedFilename = \Illuminate\Support\Str::uuid() . '.' . $uploadedFile->getClientOriginalExtension();
        $path = $uploadedFile->storeAs($directory, $storedFilename, ['disk' => $disk]);

        if ($path === false) {
            return response()->json(['message' => 'Failed to store file.'], 500);
        }

        $reviewAsset = $version->file->assets()->create([
            'company_id' => $companyId,
            'version_id' => $version->id,
            'asset_type' => $assetType,
            'disk' => $disk,
            'path' => $path,
            'original_filename' => $uploadedFile->getClientOriginalName(),
            'stored_filename' => $storedFilename,
            'mime_type' => $uploadedFile->getMimeType(),
            'extension' => $uploadedFile->getClientOriginalExtension(),
            'size_bytes' => $uploadedFile->getSize(),
            'checksum_sha256' => hash_file('sha256', $uploadedFile->getRealPath()),
            'scan_status' => 'pending',
            'previewable' => in_array($uploadedFile->getMimeType(), [
                'application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
            ], true),
            'sort_order' => $version->assets()->count(),
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json(new ProjectDesignAssetResource($reviewAsset), 201);
    }

    public function retryConversion(Request $request, Dossier $dossier, ProjectDesignAsset $asset): JsonResponse
    {
        Gate::authorize('uploadVersion', [$asset->version->file, $dossier]);

        if ($asset->conversion_status !== 'failed') {
            return response()->json(['message' => 'Asset is not in failed state.'], 422);
        }

        $asset->update([
            'conversion_status' => 'uploaded',
            'scan_status' => 'pending',
        ]);

        \App\Jobs\ProjectDesign\ProcessProjectDesignPreview::dispatch($asset->version);

        return response()->json(['message' => 'Conversion retry initiated.']);
    }

    public function assetPreview(ProjectDesignAsset $asset): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $asset->loadMissing('version.file');

        $dossier = $asset->version?->file?->dossier;

        if (! $dossier) {
            abort(404);
        }

        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);

        if (! Storage::disk($asset->disk)->exists($asset->path)) {
            abort(404);
        }

        $disk = Storage::disk($asset->disk);
        $mime = $asset->mime_type ?? 'application/octet-stream';

        return response()->file($disk->path($asset->path), [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $asset->original_filename . '"',
        ]);
    }

    public function assetDownload(ProjectDesignAsset $asset): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $asset->loadMissing('version.file');

        $dossier = $asset->version?->file?->dossier;
        $version = $asset->version;

        if (! $dossier || ! $version) {
            abort(404);
        }

        Gate::authorize('downloadVersion', [$version, $dossier]);

        if (! Storage::disk($asset->disk)->exists($asset->path)) {
            abort(404);
        }

        $disk = Storage::disk($asset->disk);

        return response()->download($disk->path($asset->path), $asset->original_filename);
    }

    public function storeRemark(Request $request, Dossier $dossier, ProjectDesignFileVersion $version): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);

        $data = $request->validate([
            'annotation_id' => 'required|exists:project_design_annotations,id',
            'severity' => 'required|string|in:critical,major,minor,cosmetic,question',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $annotation = ProjectDesignAnnotation::findOrFail($data['annotation_id']);
        abort_unless((int) $annotation->version_id === (int) $version->id, 422);

        $remark = ProjectDesignRemark::create([
            'company_id' => $request->user()->company_id,
            'version_id' => $version->id,
            'annotation_id' => $data['annotation_id'],
            'severity' => $data['severity'],
            'status' => 'open',
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
            'due_date' => $data['due_date'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $remark->load('createdBy');
        return response()->json(new ProjectDesignRemarkResource($remark), 201);
    }

    public function updateRemark(Request $request, Dossier $dossier, ProjectDesignRemark $remark): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);
        abort_unless((int) $remark->version->file->dossier_id === (int) $dossier->id, 403);

        $data = $request->validate([
            'severity' => 'nullable|string|in:critical,major,minor,cosmetic,question',
            'status' => 'nullable|string|in:open,assigned,in_progress,resolved,closed,reopened',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $remark->update($data);
        $remark->load('createdBy', 'assignedTo', 'version.file');

        return response()->json(new ProjectDesignRemarkResource($remark));
    }

    public function destroyRemark(Request $request, Dossier $dossier, ProjectDesignRemark $remark): JsonResponse
    {
        Gate::authorize('viewProjectDesign', [ProjectDesignFile::class, $dossier]);
        abort_unless((int) $remark->version->file->dossier_id === (int) $dossier->id, 403);

        $remark->delete();
        return response()->json(['message' => 'Remark deleted.']);
    }

    public function listRemarks(Request $request, Dossier $dossier): JsonResponse
    {
        $this->dossier($dossier);

        $query = \App\Models\ProjectDesign\ProjectDesignRemark::whereHas('version.file', fn ($q) => $q->where('dossier_id', $dossier->id))
            ->with('createdBy', 'assignedTo', 'version.file')
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($severity = $request->query('severity')) {
            $query->where('severity', $severity);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $remarks = $query->paginate($request->query('per_page', 50));

        return response()->json([
            'data' => ProjectDesignRemarkResource::collection($remarks),
            'meta' => ['total' => $remarks->total(), 'page' => $remarks->currentPage(), 'lastPage' => $remarks->lastPage()],
        ]);
    }
}
