<?php

namespace App\Enums\ProjectDesign;

enum ProjectDesignRemarkSeverity: string
{
    case Cosmetic = 'cosmetic';
    case Minor = 'minor';
    case Major = 'major';
    case Critical = 'critical';
}
