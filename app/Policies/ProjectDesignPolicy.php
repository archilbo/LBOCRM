<?php

namespace App\Policies;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignFolder;
use App\Models\ProjectDesign\ProjectDesignRemark;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectDesignPolicy
{
    use HandlesAuthorization;

    public function before(User $user): ?bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        return null;
    }

    private function fileBelongsToDossier(ProjectDesignFile $file, Dossier $dossier): bool
    {
        return (int) $file->dossier_id === (int) $dossier->id;
    }

    private function versionBelongsToFile(ProjectDesignFileVersion $version, ProjectDesignFile $file): bool
    {
        return (int) $version->file_id === (int) $file->id;
    }

    private function folderBelongsToDossier(ProjectDesignFolder $folder, Dossier $dossier): bool
    {
        return (int) $folder->dossier_id === (int) $dossier->id;
    }

    public function viewProjectDesign(User $user, Dossier $dossier): bool
    {
        return $user->can('project-design.view');
    }

    public function createFolder(User $user, Dossier $dossier): bool
    {
        return $user->can('project-design.create-folder');
    }

    public function updateFolder(User $user, ProjectDesignFolder $folder, Dossier $dossier): bool
    {
        return $user->can('project-design.update-folder')
            && $this->folderBelongsToDossier($folder, $dossier);
    }

    public function deleteFolder(User $user, ProjectDesignFolder $folder, Dossier $dossier): bool
    {
        return $user->can('project-design.delete-folder')
            && $this->folderBelongsToDossier($folder, $dossier);
    }

    public function createFile(User $user, Dossier $dossier): bool
    {
        return $user->can('project-design.create-file');
    }

    public function updateFile(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $user->can('project-design.update-file')
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function archiveFile(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $user->can('project-design.archive')
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function restoreFile(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $user->can('project-design.restore')
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function uploadVersion(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $user->can('project-design.upload')
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function previewVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.view');
    }

    public function downloadVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.download-source');
    }

    public function submitReview(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.submit-review');
    }

    public function reviewVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.review');
    }

    public function createRemark(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.create-remark');
    }

    public function assignRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $user->can('project-design.assign-remark');
    }

    public function addressRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $user->can('project-design.address-remark');
    }

    public function verifyRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $user->can('project-design.verify-remark');
    }

    public function reopenRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $user->can('project-design.reopen-remark');
    }

    public function approveVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.approve');
    }

    public function requestChanges(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.request-changes');
    }

    public function annotate(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $user->can('project-design.annotate');
    }

    public function delete(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $user->can('project-design.delete')
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function manage(User $user, Dossier $dossier): bool
    {
        return $user->can('project-design.manage');
    }
}
