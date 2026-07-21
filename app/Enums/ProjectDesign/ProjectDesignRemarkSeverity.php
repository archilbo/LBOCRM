<?php

namespace App\Enums\ProjectDesign;

enum ProjectDesignRemarkSeverity: string
{
    case Information = 'information';
    case Minor = 'minor';
    case Normal = 'normal';
    case Major = 'major';
    case Critical = 'critical';
}
