<?php

namespace App\Services\Tus;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class TusServer
{
    private string $tusDir;

    public function __construct()
    {
        $this->tusDir = storage_path('tus');
        if (!is_dir($this->tusDir)) {
            @mkdir($this->tusDir, 0755, true);
        }
    }

    public function capabilities(): Response
    {
        return response('', 204, [
            'Tus-Resumable' => '1.0.0',
            'Tus-Version' => '1.0.0',
            'Tus-Extension' => 'creation,termination,expiration',
            'Tus-Max-Size' => (string) config('project_design.validation.max_upload_size', 1073741824),
        ]);
    }

    public function create(Request $request): Response
    {
        $uploadLength = $request->header('Upload-Length');
        $uploadDeferLength = $request->header('Upload-Defer-Length');
        $metadata = $this->parseMetadata($request->header('Upload-Metadata', ''));

        if (!$uploadLength && !$uploadDeferLength) {
            return response()->json(['error' => 'Upload-Length or Upload-Defer-Length required'], 400);
        }

        $uploadId = (string) Str::uuid();
        $uploadDir = "{$this->tusDir}/{$uploadId}";
        @mkdir($uploadDir, 0755, true);

        $filePath = "{$uploadDir}/file";
        $metaPath = "{$uploadDir}/meta.json";

        $maxSize = config('project_design.validation.max_file_size', 209715200);
        $size = $uploadLength ? (int) $uploadLength : 0;

        if ($size > $maxSize) {
            $this->cleanupDir($uploadDir);
            return response()->json(['error' => 'File too large'], 413);
        }

        file_put_contents($metaPath, json_encode([
            'upload_id' => $uploadId,
            'size' => $size,
            'offset' => 0,
            'metadata' => $metadata,
            'created_at' => time(),
            'expires_at' => time() + 86400,
        ]));

        $location = url("/tus/{$uploadId}");

        return response('', 201, [
            'Location' => $location,
            'Tus-Resumable' => '1.0.0',
        ]);
    }

    public function head(string $uploadId): Response
    {
        $meta = $this->loadMeta($uploadId);
        if (!$meta) {
            return response()->json(['error' => 'Upload not found'], 404);
        }

        return response('', 200, [
            'Upload-Offset' => (string) $meta['offset'],
            'Upload-Length' => (string) $meta['size'],
            'Tus-Resumable' => '1.0.0',
        ]);
    }

    public function patch(Request $request, string $uploadId): Response
    {
        $meta = $this->loadMeta($uploadId);
        if (!$meta) {
            return response()->json(['error' => 'Upload not found'], 404);
        }

        $offset = (int) $request->header('Upload-Offset', '0');
        if ($offset !== (int) $meta['offset']) {
            return response('', 409, ['Tus-Resumable' => '1.0.0']);
        }

        $content = $request->getContent(true);
        $contentLength = strlen($content);

        if ($contentLength === 0) {
            return response('', 204, ['Tus-Resumable' => '1.0.0']);
        }

        $filePath = "{$this->tusDir}/{$uploadId}/file";
        $fh = fopen($filePath, 'a');
        if (!$fh) {
            return response()->json(['error' => 'Cannot open file'], 500);
        }
        fwrite($fh, $content);
        fclose($fh);

        $meta['offset'] += $contentLength;
        $this->saveMeta($uploadId, $meta);

        return response('', 204, [
            'Upload-Offset' => (string) $meta['offset'],
            'Tus-Resumable' => '1.0.0',
        ]);
    }

    public function delete(string $uploadId): Response
    {
        $this->cleanupDir("{$this->tusDir}/{$uploadId}");
        return response('', 204, ['Tus-Resumable' => '1.0.0']);
    }

    public function getFilePath(string $uploadId): ?string
    {
        $path = "{$this->tusDir}/{$uploadId}/file";
        return file_exists($path) ? $path : null;
    }

    public function getFileSize(string $uploadId): ?int
    {
        $meta = $this->loadMeta($uploadId);
        return $meta ? (int) $meta['size'] : null;
    }

    public function getUploadOffset(string $uploadId): ?int
    {
        $meta = $this->loadMeta($uploadId);
        return $meta ? (int) $meta['offset'] : null;
    }

    public function getMetadata(string $uploadId): ?array
    {
        $meta = $this->loadMeta($uploadId);
        return $meta ? ($meta['metadata'] ?? []) : null;
    }

    public function isComplete(string $uploadId): bool
    {
        $meta = $this->loadMeta($uploadId);
        if (!$meta) return false;
        return $meta['size'] > 0 && $meta['offset'] >= $meta['size'];
    }

    public function isExpired(string $uploadId): bool
    {
        $meta = $this->loadMeta($uploadId);
        if (!$meta) return true;
        return time() > ($meta['expires_at'] ?? 0);
    }

    private function loadMeta(string $uploadId): ?array
    {
        $path = "{$this->tusDir}/{$uploadId}/meta.json";
        if (!file_exists($path)) return null;
        return json_decode(file_get_contents($path), true);
    }

    private function saveMeta(string $uploadId, array $meta): void
    {
        $path = "{$this->tusDir}/{$uploadId}/meta.json";
        file_put_contents($path, json_encode($meta));
    }

    private function parseMetadata(string $header): array
    {
        $result = [];
        if (empty($header)) return $result;
        foreach (explode(',', $header) as $pair) {
            $parts = explode(' ', trim($pair), 2);
            if (count($parts) === 2) {
                $result[$parts[0]] = base64_decode($parts[1]);
            } elseif (count($parts) === 1 && $parts[0] !== '') {
                $result[$parts[0]] = '';
            }
        }
        return $result;
    }

    private function cleanupDir(string $dir): void
    {
        if (!is_dir($dir)) return;
        array_map('unlink', glob("{$dir}/*"));
        @rmdir($dir);
    }
}
