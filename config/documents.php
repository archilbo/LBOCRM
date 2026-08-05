<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Document content preview
    |--------------------------------------------------------------------------
    |
    | The authorized text/Markdown content endpoint reads at most
    | `content_preview_limit` bytes and reports truncation. A single
    | centralized limit keeps every preview bounded regardless of the stored
    | file size; large files are never loaded fully into memory.
    |
    | The MIME type and extension allow-lists are validated together: a file
    | is only readable as text when both the stored MIME type and the
    | normalized extension are present in their respective lists. HTML,
    | JavaScript, executables, archives and any other binary format are
    | rejected by construction (they are not listed).
    */

    'content_preview_limit' => (int) env('DOCUMENT_CONTENT_PREVIEW_LIMIT', 1024 * 1024),

    /*
    |--------------------------------------------------------------------------
    | Document upload size
    |--------------------------------------------------------------------------
    |
    | Centralized maximum upload size in kilobytes for every document upload
    | path (store and replace). Laravel `max` rules apply the same ceiling so
    | the limit is enforced consistently and remains configurable per
    | environment without touching validation code.
    |
    | The CIN image fields (`file_front` / `file_back`) additionally require a
    | content-based MIME allow-list (JPEG, PNG, WebP, PDF); the extension-only
    | `mimes` rule is never trusted alone for uploads.
    */

    'max_upload_kb' => (int) env('DOCUMENT_MAX_UPLOAD_KB', 20480),

    'content_mime_types' => [
        'text/plain',
        'text/markdown',
        'application/json',
        'application/xml',
        'text/xml',
        'text/csv',
        'application/yaml',
        'text/yaml',
    ],

    'content_extensions' => [
        'txt',
        'log',
        'md',
        'markdown',
        'json',
        'xml',
        'csv',
        'yaml',
        'yml',
        'ini',
    ],

];
