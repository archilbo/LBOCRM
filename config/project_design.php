<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Storage
    |--------------------------------------------------------------------------
    */
    'storage' => [
        'disk' => env('PROJECT_DESIGN_STORAGE_DISK', 'project_design'),
        'path_prefix' => 'project-design',
    ],

    /*
    |--------------------------------------------------------------------------
    | File validation
    |--------------------------------------------------------------------------
    */
    'validation' => [
        'max_file_size' => 204800, // 200 MB in KB
        'max_upload_size' => 1048576, // 1 GB in KB
        'max_files_per_upload' => 50,
        'allowed_extensions' => [
            'source' => ['dwg', 'dxf', 'pln', 'pla', 'rvt', 'skp', 'ifc', 'rfa'],
            'review' => ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'tiff', 'tif'],
            'supporting' => ['doc', 'docx', 'xls', 'xlsx', 'csv', 'zip', 'rar', '7z', 'txt', 'rtf'],
        ],
        'blocked_extensions' => ['exe', 'msi', 'bat', 'cmd', 'com', 'php', 'phar', 'js', 'html', 'htm', 'svg'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Preview
    |--------------------------------------------------------------------------
    */
    'preview' => [
        'pdf_max_pages' => 200,
        'thumbnail_width' => 300,
        'preview_image_quality' => 80,
    ],

    /*
    |--------------------------------------------------------------------------
    | Review defaults
    |--------------------------------------------------------------------------
    */
    'review' => [
        'default_due_days' => 14,
        'overdue_after_days' => 7,
        'require_approval_by_default' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Annotations
    |--------------------------------------------------------------------------
    */
    'annotations' => [
        'max_freehand_points' => 5000,
        'max_annotations_per_version' => 500,
    ],
];
