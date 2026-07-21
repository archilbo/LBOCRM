<?php

namespace App\Enums\ProjectDesign;

enum ProjectDesignFileType: string
{
    case Source = 'source';
    case Review = 'review';
    case Supporting = 'supporting';
}
