<?php

namespace App\Enums\ProjectDesign;

enum ProjectDesignRemarkStatus: string
{
    case Open = 'open';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Addressed = 'addressed';
    case Verified = 'verified';
    case Reopened = 'reopened';
    case Rejected = 'rejected';
    case Resolved = 'resolved';
}
