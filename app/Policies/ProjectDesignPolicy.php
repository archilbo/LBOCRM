<?php

namespace App\Policies;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignFolder;
use App\Models\ProjectDesign\ProjectDesignRemark;
use App\Models\User;
use App\Policies\Concerns\HandlesTenantAuthorization;

class ProjectDesignPolicy
{
    use HandlesTenantAuthorization;

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
        return $this->canAccessDossier($user, 'project-design.view', $dossier);
    }

    public function createFolder(User $user, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.create-folder', $dossier);
    }

    public function updateFolder(User $user, ProjectDesignFolder $folder, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.update-folder', $dossier)
            && $this->folderBelongsToDossier($folder, $dossier);
    }

    public function deleteFolder(User $user, ProjectDesignFolder $folder, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.delete-folder', $dossier)
            && $this->folderBelongsToDossier($folder, $dossier);
    }

    public function createFile(User $user, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.create-file', $dossier);
    }

    public function updateFile(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.update-file', $dossier)
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function archiveFile(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.archive', $dossier)
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function restoreFile(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.restore', $dossier)
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function uploadVersion(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.upload', $dossier)
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function previewVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.view', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function downloadVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.download-source', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function submitReview(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.submit-review', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function reviewVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.review', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function createRemark(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.create-remark', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function assignRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.assign-remark', $dossier)
            && $this->remarkBelongsToDossier($remark, $dossier);
    }

    public function addressRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.address-remark', $dossier)
            && $this->remarkBelongsToDossier($remark, $dossier);
    }

    public function verifyRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.verify-remark', $dossier)
            && $this->remarkBelongsToDossier($remark, $dossier);
    }

    public function reopenRemark(User $user, ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.reopen-remark', $dossier)
            && $this->remarkBelongsToDossier($remark, $dossier);
    }

    public function approveVersion(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.approve', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function requestChanges(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.request-changes', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function annotate(User $user, ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.annotate', $dossier)
            && $this->versionBelongsToDossier($version, $dossier);
    }

    public function delete(User $user, ProjectDesignFile $file, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.delete', $dossier)
            && $this->fileBelongsToDossier($file, $dossier);
    }

    public function manage(User $user, Dossier $dossier): bool
    {
        return $this->canAccessDossier($user, 'project-design.manage', $dossier);
    }

    private function canAccessDossier(User $user, string $permission, Dossier $dossier): bool
    {
        return $this->allowed($user, $permission) && $this->sameScope($user, $dossier);
    }

    private function versionBelongsToDossier(ProjectDesignFileVersion $version, Dossier $dossier): bool
    {
        return $version->file !== null && $this->fileBelongsToDossier($version->file, $dossier);
    }

    private function remarkBelongsToDossier(ProjectDesignRemark $remark, Dossier $dossier): bool
    {
        return $remark->version !== null && $this->versionBelongsToDossier($remark->version, $dossier);
    }
}
