<?php

namespace App\Enums\ProjectDesign;

enum ProjectDesignReviewStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
