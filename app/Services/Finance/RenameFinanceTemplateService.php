<?php

namespace App\Services\Finance;

use App\Models\FinanceTemplate;
use App\Models\User;

class RenameFinanceTemplateService
{
    public function __construct(private readonly FinanceActivityService $activity)
    {
    }

    public function rename(FinanceTemplate $template, User $user, string $name): FinanceTemplate
    {
        $oldName = $template->name;
        $template->update(['name' => trim($name)]);

        $this->activity->log(
            $template,
            $user,
            'finance.template.renamed',
            ['name' => $oldName],
            ['name' => $template->name],
        );

        return $template->refresh();
    }
}
