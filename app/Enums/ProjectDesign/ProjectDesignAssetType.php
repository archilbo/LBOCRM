<?php

namespace App\Enums\ProjectDesign;

enum ProjectDesignAssetType: string
{
    case Source = 'source';
    case ReviewPdf = 'review_pdf';
    case Ifc = 'ifc';
    case Image = 'image';
    case Supporting = 'supporting';
    case Thumbnail = 'thumbnail';
    case ViewerDerivative = 'viewer_derivative';
    case Snapshot = 'snapshot';
}
