<?php

namespace App\Enums;

enum DossierWorkflowStepStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Blocked = 'blocked';

    public function label(): string
    {
        return (string) config("archilbo_workflow.statuses.{$this->value}", $this->value);
    }
}
