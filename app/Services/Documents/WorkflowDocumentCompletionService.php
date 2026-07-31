<?php

namespace App\Services\Documents;

use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\DossierWorkflowRequirement;
use App\Models\User;

final class WorkflowDocumentCompletionService
{
    public function __construct(
        private readonly WorkflowDocumentTemplateResolver $resolver,
    ) {
    }

    public function completeWhenSatisfied(
        Dossier $dossier,
        DocumentTemplate $template,
        ?string $stepKey,
        ?string $requirementKey,
        User $user,
    ): bool {
        if (
            ! filled($stepKey)
            || ! filled($requirementKey)
            || ! $user->can(
                'updateWorkflow',
                $dossier
            )
        ) {
            return false;
        }

        if (
            ! $this->requirementExists(
                $stepKey,
                $requirementKey
            )
        ) {
            return false;
        }

        if (
            ! $this->resolver->matches(
                $template,
                $requirementKey
            )
        ) {
            return false;
        }

        if (
            ! $this->requiredFilesExist(
                $dossier,
                $template
            )
        ) {
            return false;
        }

        DossierWorkflowRequirement::query()
            ->updateOrCreate(
                [
                    'dossier_id' => $dossier->id,
                    'step_key' => $stepKey,
                    'requirement_key' =>
                        $requirementKey,
                ],
                [
                    'is_done' => true,
                    'checked_at' => now(),
                    'checked_by' => $user->id,
                ]
            );

        return true;
    }

    private function requiredFilesExist(
        Dossier $dossier,
        DocumentTemplate $template,
    ): bool {
        $documents = DossierDocument::query()
            ->where(
                'dossier_id',
                $dossier->id
            )
            ->where(
                'document_template_id',
                $template->id
            )
            ->whereNotNull('stored_path')
            ->get([
                'document_side',
                'stored_path',
            ]);

        if (
            $this->resolver
                ->isCinTemplate($template)
        ) {
            return $documents->contains(
                'document_side',
                DossierDocument::SIDE_FRONT
            ) && $documents->contains(
                'document_side',
                DossierDocument::SIDE_BACK
            );
        }

        return $documents->contains(
            'document_side',
            DossierDocument::SIDE_SINGLE
        );
    }

    private function requirementExists(
        string $stepKey,
        string $requirementKey,
    ): bool {
        foreach (
            config(
                'archilbo_workflow.client_project_steps',
                []
            ) as $step
        ) {
            if (
                (string) ($step['key'] ?? '')
                    !== $stepKey
            ) {
                continue;
            }

            foreach (
                $step['requirements'] ?? []
                as $requirement
            ) {
                if (
                    (string) (
                        $requirement['key'] ?? ''
                    ) === $requirementKey
                ) {
                    return true;
                }
            }
        }

        return false;
    }
}
