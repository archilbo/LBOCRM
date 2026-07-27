<?php

namespace App\Actions\ProjectDesign;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFolder;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class UpdateProjectDesignExplorerItemAction
{
    public function updateFile(Dossier $dossier, ProjectDesignFile $file, array $changes): ProjectDesignFile
    {
        $folderId = Arr::get($changes, 'folder_id');

        if (array_key_exists('folder_id', $changes) && $folderId !== null) {
            $this->folderInDossier($dossier, (int) $folderId);
        }

        $recordVersion = (int) $changes['record_version'];
        $payload = Arr::only($changes, ['name', 'code', 'description', 'discipline', 'category', 'folder_id']);

        $affected = ProjectDesignFile::query()
            ->whereKey($file->id)
            ->where('record_version', $recordVersion)
            ->update([
                ...$payload,
                'record_version' => $recordVersion + 1,
            ]);

        if (! $affected) {
            throw new ConflictHttpException('This record was changed by another user. Reload the latest data before saving.');
        }

        return $file->fresh(['folder', 'latestVersion', 'responsibleUser', 'reviewer'])->loadCount('openRemarks');
    }

    public function updateFolder(Dossier $dossier, ProjectDesignFolder $folder, array $changes): ProjectDesignFolder
    {
        $payload = Arr::only($changes, ['name', 'parent_id']);

        if (array_key_exists('parent_id', $payload) && $payload['parent_id'] !== null) {
            $parent = $this->folderInDossier($dossier, (int) $payload['parent_id']);
            $this->ensureValidParent($folder, $parent);
        }

        $folder->update($payload);

        return $folder->fresh()->loadCount('files');
    }

    private function folderInDossier(Dossier $dossier, int $folderId): ProjectDesignFolder
    {
        $folder = $dossier->designFolders()->find($folderId);

        if (! $folder) {
            throw ValidationException::withMessages([
                'folder_id' => 'The selected folder does not belong to this project.',
            ]);
        }

        return $folder;
    }

    private function ensureValidParent(ProjectDesignFolder $folder, ProjectDesignFolder $candidate): void
    {
        if ($candidate->id === $folder->id) {
            throw ValidationException::withMessages(['parent_id' => 'A folder cannot contain itself.']);
        }

        $ancestor = $candidate;
        while ($ancestor->parent_id !== null) {
            if ($ancestor->parent_id === $folder->id) {
                throw ValidationException::withMessages(['parent_id' => 'A folder cannot be moved into one of its children.']);
            }

            $ancestor = $ancestor->parent;
            if (! $ancestor) break;
        }
    }
}
