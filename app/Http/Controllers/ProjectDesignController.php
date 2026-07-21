<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectDesign\StoreProjectDesignFileRequest;
use App\Http\Requests\ProjectDesign\UpdateProjectDesignFileRequest;
use App\Http\Requests\ProjectDesign\UploadDesignFileVersionRequest;
use App\Http\Resources\ProjectDesign\ProjectDesignFileResource;
use App\Http\Resources\ProjectDesign\ProjectDesignFileVersionResource;
use App\Http\Resources\ProjectDesign\ProjectDesignFolderResource;
use App\Http\Resources\ProjectDesign\ProjectDesignSummaryResource;
use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignFolder;
use Illuminate\Support\Facades\Storage;
use App\Services\ProjectDesign\ProjectDesignActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectDesignController extends Controller
{
    public function __construct(
        private ProjectDesignActivityService $activityService,
    ) {}

    public function summary(Request $request, Dossier $dossier): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $folders = $dossier->designFolders()->count();
        $files = $dossier->designFiles()->count();
        $versions = $dossier->designFiles()->withCount('versions')->get()->sum('versions_count');
        $activities = $this->activityService->countForProject($dossier);

        return response()->json(
            ProjectDesignSummaryResource::make([
                'folders' => $folders,
                'files' => $files,
                'versions' => $versions,
                'activities' => $activities,
            ])->resolve($request)
        );
    }

    public function folders(Request $request, Dossier $dossier): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $folders = $dossier->designFolders()
            ->withCount('files')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => ProjectDesignFolderResource::collection($folders)->resolve($request),
        ]);
    }

    public function storeFolder(Request $request): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $validated = $request->validate([
            'dossier_id' => ['required', 'exists:dossiers,id'],
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:project_design_folders,id'],
        ]);

        $folder = ProjectDesignFolder::create($validated);

        return response()->json(
            ProjectDesignFolderResource::make($folder)->resolve($request),
            201
        );
    }

    public function updateFolder(Request $request, ProjectDesignFolder $folder): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $folder->update($validated);

        return response()->json(
            ProjectDesignFolderResource::make($folder->fresh())->resolve($request)
        );
    }

    public function destroyFolder(Request $request, ProjectDesignFolder $folder): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $folder->delete();

        return response()->json(null, 204);
    }

    public function index(Request $request, Dossier $dossier): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $files = $dossier->designFiles()
            ->with(['latestVersion', 'folder'])
            ->withCount('versions')
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->folder_id, fn ($q, $id) => $q->where('folder_id', $id))
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy($request->sort ?? 'sort_order')
            ->paginate(min($request->integer('per_page', 50), 100));

        return response()->json([
            'data' => ProjectDesignFileResource::collection($files)->resolve($request),
            'meta' => [
                'currentPage' => $files->currentPage(),
                'lastPage' => $files->lastPage(),
                'total' => $files->total(),
            ],
        ]);
    }

    public function store(StoreProjectDesignFileRequest $request): JsonResponse
    {
        $file = ProjectDesignFile::create($request->validated());

        $this->activityService->record(
            dossierId: $file->dossier_id,
            action: 'file.created',
            metadata: ['file_id' => $file->id, 'name' => $file->name],
        );

        return response()->json(
            ProjectDesignFileResource::make($file)->resolve($request),
            201
        );
    }

    public function update(UpdateProjectDesignFileRequest $request, ProjectDesignFile $file): JsonResponse
    {
        if ((int) $request->input('record_version') !== $file->record_version) {
            return response()->json([
                'message' => 'This record was changed by another user. Reload the latest data before saving.',
            ], 409);
        }

        $file->update($request->validated());
        $file->increment('record_version');

        $this->activityService->record(
            dossierId: $file->dossier_id,
            action: 'file.updated',
            metadata: ['file_id' => $file->id, 'name' => $file->name],
        );

        return response()->json(
            ProjectDesignFileResource::make($file->fresh())->resolve($request)
        );
    }

    public function destroy(Request $request, ProjectDesignFile $file): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $file->delete();

        $this->activityService->record(
            dossierId: $file->dossier_id,
            action: 'file.deleted',
            metadata: ['file_id' => $file->id, 'name' => $file->name],
        );

        return response()->json(null, 204);
    }

    public function restore(Request $request, int $file): JsonResponse
    {
        $file = ProjectDesignFile::withTrashed()->findOrFail($file);

        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $file->restore();

        $this->activityService->record(
            dossierId: $file->dossier_id,
            action: 'file.restored',
            metadata: ['file_id' => $file->id, 'name' => $file->name],
        );

        return response()->json(
            ProjectDesignFileResource::make($file)->resolve($request)
        );
    }

    public function versions(Request $request, ProjectDesignFile $file): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $versions = $file->versions()
            ->with('uploadedBy')
            ->orderByDesc('version_number')
            ->paginate(min($request->integer('per_page', 20), 100));

        return response()->json([
            'data' => ProjectDesignFileVersionResource::collection($versions)->resolve($request),
            'meta' => [
                'currentPage' => $versions->currentPage(),
                'lastPage' => $versions->lastPage(),
                'total' => $versions->total(),
            ],
        ]);
    }

    public function uploadVersion(UploadDesignFileVersionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        /** @var \App\Models\ProjectDesign\ProjectDesignFile $file */
        $file = ProjectDesignFile::findOrFail($validated['file_id']);

        $idempotencyKey = $validated['idempotency_key'] ?? null;
        if ($idempotencyKey) {
            $existing = $file->versions()->where('checksum', $validated['checksum'] ?? '')->first();
            if ($existing) {
                return response()->json(
                    ProjectDesignFileVersionResource::make($existing)->resolve($request)
                );
            }
        }

        $uploadedFile = $request->file('file');
        $checksum = $validated['checksum'] ?? hash_file('sha256', $uploadedFile->getRealPath());
        $diskPath = $uploadedFile->store('project-design', 'project_design');

        if (!$diskPath) {
            return response()->json(['message' => 'File storage failed.'], 500);
        }

        $latestVersion = $file->versions()->max('version_number') ?? 0;

        $version = $file->versions()->create([
            'version_number' => $latestVersion + 1,
            'status' => 'draft',
            'checksum' => $checksum,
            'file_size' => $uploadedFile->getSize(),
            'mime_type' => $uploadedFile->getMimeType(),
            'original_filename' => $uploadedFile->getClientOriginalName(),
            'disk_path' => $diskPath,
            'disk' => 'project_design',
            'uploaded_by' => $request->user()?->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        $this->activityService->record(
            dossierId: $file->dossier_id,
            action: 'version.uploaded',
            metadata: ['file_id' => $file->id, 'version_id' => $version->id, 'version_number' => $version->version_number],
        );

        return response()->json(
            ProjectDesignFileVersionResource::make($version)->resolve($request),
            201
        );
    }

    public function preview(Request $request, ProjectDesignFileVersion $version)
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $disk = Storage::disk($version->disk);

        if (! $disk->exists($version->disk_path)) {
            abort(404);
        }

        $mime = $version->mime_type ?? 'application/octet-stream';

        if (in_array($mime, ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/tiff'])) {
            return response()->file($disk->path($version->disk_path), [
                'Content-Type' => $mime,
                'Content-Disposition' => 'inline; filename="' . $version->original_filename . '"',
            ]);
        }

        abort(415, 'Unsupported file type for preview.');
    }

    public function download(Request $request, ProjectDesignFileVersion $version)
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $disk = Storage::disk($version->disk);

        if (! $disk->exists($version->disk_path)) {
            abort(404);
        }

        return response()->download($disk->path($version->disk_path), $version->original_filename);
    }

    public function activity(Request $request, Dossier $dossier): JsonResponse
    {
        if (! $request->user()?->can('project_design')) {
            abort(403);
        }

        $activities = $this->activityService->getForProject($dossier);

        return response()->json([
            'data' => $activities->through(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'description' => $log->description,
                'metadata' => $log->metadata,
                'user' => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name] : null,
                'createdAt' => $log->created_at?->diffForHumans(),
            ])->values(),
            'meta' => [
                'nextCursor' => $activities->nextCursor()?->encode(),
                'hasMore' => $activities->hasMorePages(),
            ],
        ]);
    }
}
