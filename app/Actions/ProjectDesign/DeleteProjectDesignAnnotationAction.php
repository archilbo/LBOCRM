<?php

namespace App\Actions\ProjectDesign;

use App\Models\Dossier;
use App\Models\ProjectDesign\ProjectDesignAnnotation;
use App\Models\ProjectDesign\ProjectDesignRemarkComment;
use App\Services\ProjectDesign\ProjectDesignActivityService;
use Illuminate\Support\Facades\DB;

class DeleteProjectDesignAnnotationAction
{
    public function __construct(private readonly ProjectDesignActivityService $activity) {}

    /** @return array<int, int> */
    public function execute(Dossier $dossier, ProjectDesignAnnotation $annotation): array
    {
        $remarkIds = $annotation->remarks()->pluck('id')->all();

        DB::transaction(function () use ($annotation, $remarkIds): void {
            if ($remarkIds !== []) {
                ProjectDesignRemarkComment::query()->whereIn('remark_id', $remarkIds)->delete();
                $annotation->remarks()->delete();
            }

            $annotation->delete();
        });

        $this->activity->record($dossier->id, 'project_design.annotation_deleted', [
            'annotation_id' => $annotation->id,
            'file_id' => $annotation->file_id,
            'version_id' => $annotation->version_id,
            'remark_ids' => $remarkIds,
        ]);

        return $remarkIds;
    }
}
