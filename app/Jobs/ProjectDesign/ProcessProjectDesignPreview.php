<?php

namespace App\Jobs\ProjectDesign;

use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Models\ProjectDesign\ProjectDesignAsset;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class ProcessProjectDesignPreview implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        public ProjectDesignFileVersion $version,
    ) {}

    public function handle(): void
    {
        $assets = $this->version->assets;

        foreach ($assets as $asset) {
            $previewable = $this->isPreviewable($asset);

            $asset->update([
                'previewable' => $previewable,
                'scan_status' => 'skipped',
            ]);
        }

        $hasPreviewable = $assets->contains(fn ($a) => $a->previewable);

        $this->version->update([
            'preview_status' => $hasPreviewable ? 'ready' : 'unsupported',
        ]);
    }

    private function isPreviewable(ProjectDesignAsset $asset): bool
    {
        $previewableMimes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp',
            'image/tiff',
        ];

        return in_array($asset->mime_type, $previewableMimes, true);
    }
}
