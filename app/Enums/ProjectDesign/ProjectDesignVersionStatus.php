<?php

namespace App\Enums\ProjectDesign;

enum ProjectDesignVersionStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
