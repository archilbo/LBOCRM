# ============================================================
# ARCHI LBO — PROJECT DESIGN EDITOR VERIFICATION PACKAGE
# PowerShell 5.1 compatible
#
# Run from the Laravel project root:
# D:\ARCHI LBO\LBOSM\LBOCRM
#
# Output:
# PROJECT_DESIGN_EDITOR_VERIFICATION.zip
# ============================================================

$ErrorActionPreference = 'Continue'

$Root = (Get-Location).Path.TrimEnd('\')
$Dest = Join-Path $Root 'PROJECT_DESIGN_EDITOR_VERIFICATION'
$Zip = Join-Path $Root 'PROJECT_DESIGN_EDITOR_VERIFICATION.zip'
$Diagnostics = Join-Path $Dest '_diagnostics'
$ManualEvidenceSource = Join-Path $Root 'PROJECT_DESIGN_MANUAL_EVIDENCE'
$ManualEvidenceDest = Join-Path $Dest '_manual_evidence'

if (-not (Test-Path -Path (Join-Path $Root 'artisan') -PathType Leaf)) {
    throw 'Run this script from the Laravel project root containing artisan.'
}

if (-not (Test-Path -Path (Join-Path $Root 'package.json') -PathType Leaf)) {
    throw 'package.json was not found in the current directory.'
}

Remove-Item -Path $Dest -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path $Zip -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Path $Dest -Force | Out-Null
New-Item -ItemType Directory -Path $Diagnostics -Force | Out-Null
New-Item -ItemType Directory -Path $ManualEvidenceDest -Force | Out-Null

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $false)]
        [AllowEmptyString()]
        [string]$Content = ''
    )

    $Parent = Split-Path -Path $Path -Parent

    if ($Parent -and -not (Test-Path -Path $Parent)) {
        New-Item -ItemType Directory -Path $Parent -Force | Out-Null
    }

    $Utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Test-SafeProjectPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $Normalized = $Path.Replace('/', '\')

    if ($Normalized -match '(^|\\)\.env($|\.|\\)') { return $false }
    if ($Normalized -match '\\node_modules\\') { return $false }
    if ($Normalized -match '\\vendor\\') { return $false }
    if ($Normalized -match '\\storage\\app\\') { return $false }
    if ($Normalized -match '\\public\\storage\\') { return $false }
    if ($Normalized -match '\\PROJECT_DESIGN_EDITOR_VERIFICATION(\\|\.zip$)') { return $false }
    if ($Normalized -match '\\PROJECT_DESIGN_FRONTEND_VERIFICATION(\\|\.zip$)') { return $false }
    if ($Normalized -match '\\PROJECT_DESIGN_VERIFICATION(\\|\.zip$)') { return $false }
    if ($Normalized -match '\.(dwg|dxf|pln|pla|rvt|rfa|skp|ifc|pdf|zip|sql|sqlite|db|bak)$') { return $false }

    return $true
}

function Copy-OneProjectFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )

    if (-not (Test-Path -Path $FilePath -PathType Leaf)) {
        return
    }

    try {
        $FullPath = (Resolve-Path -Path $FilePath).Path
    }
    catch {
        return
    }

    if (-not $FullPath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
        return
    }

    if (-not (Test-SafeProjectPath -Path $FullPath)) {
        return
    }

    $RelativePath = $FullPath.Substring($Root.Length).TrimStart('\')
    $TargetPath = Join-Path $Dest $RelativePath
    $TargetDirectory = Split-Path -Path $TargetPath -Parent

    if (-not (Test-Path -Path $TargetDirectory)) {
        New-Item -ItemType Directory -Path $TargetDirectory -Force | Out-Null
    }

    Copy-Item -Path $FullPath -Destination $TargetPath -Force
}

function Copy-ProjectPatterns {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Patterns
    )

    foreach ($Pattern in $Patterns) {
        $Items = Get-ChildItem -Path $Pattern -Force -ErrorAction SilentlyContinue

        foreach ($Item in $Items) {
            if ($Item.PSIsContainer) {
                $Files = Get-ChildItem -Path $Item.FullName -File -Recurse -Force -ErrorAction SilentlyContinue

                foreach ($File in $Files) {
                    if (Test-SafeProjectPath -Path $File.FullName) {
                        Copy-OneProjectFile -FilePath $File.FullName
                    }
                }
            }
            else {
                Copy-OneProjectFile -FilePath $Item.FullName
            }
        }
    }
}

function Save-CommandOutput {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    $OutputPath = Join-Path $Diagnostics $Name

    try {
        $global:LASTEXITCODE = 0
        $CommandOutput = & $Command 2>&1 | Out-String -Width 800
        $ExitCode = $LASTEXITCODE

        if ($null -eq $ExitCode) {
            $ExitCode = 0
        }

        $Lines = @(
            'COMMAND OUTPUT'
            ('Generated: {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
            ('Exit code: {0}' -f $ExitCode)
            ''
            $CommandOutput
        )

        Write-Utf8File -Path $OutputPath -Content ($Lines -join [Environment]::NewLine)
    }
    catch {
        $Lines = @(
            'COMMAND FAILED'
            ('Generated: {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
            ''
            ($_ | Out-String)
        )

        Write-Utf8File -Path $OutputPath -Content ($Lines -join [Environment]::NewLine)
    }
}

function Get-ProjectSourceFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$SearchRoots
    )

    $Results = @()

    foreach ($SearchRoot in $SearchRoots) {
        if (-not (Test-Path -Path $SearchRoot)) {
            continue
        }

        $Files = Get-ChildItem -Path $SearchRoot -File -Recurse -ErrorAction SilentlyContinue

        foreach ($File in $Files) {
            if (
                $File.Extension -in @('.php', '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md') -and
                (Test-SafeProjectPath -Path $File.FullName)
            ) {
                $Results += $File
            }
        }
    }

    return $Results
}

function Save-SearchReport {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string[]]$SearchRoots,

        [Parameter(Mandatory = $true)]
        [string[]]$Patterns
    )

    $OutputPath = Join-Path $Diagnostics $Name
    $Files = Get-ProjectSourceFiles -SearchRoots $SearchRoots

    if (-not $Files -or $Files.Count -eq 0) {
        Write-Utf8File -Path $OutputPath -Content 'No matching source files were found.'
        return
    }

    try {
        $Matches = $Files | Select-String -Pattern $Patterns -CaseSensitive:$false -ErrorAction SilentlyContinue | Select-Object Path, LineNumber, Line

        if (-not $Matches) {
            Write-Utf8File -Path $OutputPath -Content 'No matches were found.'
            return
        }

        $Formatted = $Matches | Format-Table -AutoSize -Wrap | Out-String -Width 800
        Write-Utf8File -Path $OutputPath -Content $Formatted
    }
    catch {
        Write-Utf8File -Path $OutputPath -Content ($_ | Out-String)
    }
}

function Get-PackageJson {
    if (-not (Test-Path -Path '.\package.json')) {
        return $null
    }

    try {
        return Get-Content -Path '.\package.json' -Raw | ConvertFrom-Json
    }
    catch {
        return $null
    }
}

function Sanitize-LogText {
    param(
        [Parameter(Mandatory = $false)]
        [AllowEmptyString()]
        [string]$Text = ''
    )

    $Value = $Text
    $Value = [regex]::Replace($Value, '(?i)(authorization\s*[:=]\s*bearer\s+)[^\s,;]+', '$1[REDACTED]')
    $Value = [regex]::Replace($Value, '(?i)(password|secret|token|app_key)(\s*[:=]\s*)[^\s,;]+', '$1$2[REDACTED]')
    $Value = [regex]::Replace($Value, '(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', '[REDACTED_EMAIL]')
    return $Value
}

$FrontendRoots = @(
    '.\resources\js\features\project-design',
    '.\resources\js\features\projectDesign',
    '.\resources\js\features\ProjectDesign',
    '.\resources\js\features\uploads',
    '.\resources\js\query',
    '.\resources\js\realtime',
    '.\resources\js\pages\Dossiers',
    '.\resources\js\pages\Projects',
    '.\resources\js\components\ui',
    '.\resources\js\components\shared',
    '.\resources\js\components\layout',
    '.\resources\js\lib',
    '.\resources\js\hooks',
    '.\resources\js\types'
)

$BackendRoots = @(
    '.\app\Models',
    '.\app\Http\Controllers',
    '.\app\Http\Requests',
    '.\app\Http\Resources',
    '.\app\Services',
    '.\app\Actions',
    '.\app\Policies',
    '.\app\Events',
    '.\app\Jobs',
    '.\app\Notifications',
    '.\database\migrations',
    '.\database\factories',
    '.\database\seeders',
    '.\tests'
)

Write-Host 'Collecting specification...' -ForegroundColor Cyan
Copy-ProjectPatterns -Patterns @(
    '.\BUIL_PROJECT_DESIGN_FEATURE.md',
    '.\BUILD_PROJECT_DESIGN_FEATURE.md',
    '.\docs\BUIL_PROJECT_DESIGN_FEATURE.md',
    '.\docs\BUILD_PROJECT_DESIGN_FEATURE.md',
    '.\docs\*PROJECT*DESIGN*.md',
    '.\docs\*project*design*.md'
)

Write-Host 'Collecting Project Show and Project Design frontend...' -ForegroundColor Cyan
Copy-ProjectPatterns -Patterns @(
    '.\resources\js\pages\Dossiers\Show.tsx',
    '.\resources\js\pages\Projects\Show.tsx',
    '.\resources\js\features\project-design',
    '.\resources\js\features\projectDesign',
    '.\resources\js\features\ProjectDesign',
    '.\resources\js\features\uploads',
    '.\resources\js\query',
    '.\resources\js\realtime',
    '.\resources\js\components\ui',
    '.\resources\js\components\shared',
    '.\resources\js\components\layout',
    '.\resources\js\lib',
    '.\resources\js\hooks',
    '.\resources\js\types',
    '.\resources\js\schemas',
    '.\resources\js\app.ts',
    '.\resources\js\app.tsx',
    '.\resources\js\bootstrap.ts',
    '.\resources\js\bootstrap.tsx',
    '.\resources\js\echo.ts',
    '.\resources\css\app.css'
)

Write-Host 'Collecting Project Design backend...' -ForegroundColor Cyan
Copy-ProjectPatterns -Patterns @(
    '.\app\Models\*ProjectDesign*',
    '.\app\Models\*DesignFile*',
    '.\app\Models\*DesignVersion*',
    '.\app\Models\*DesignAsset*',
    '.\app\Models\*DesignAnnotation*',
    '.\app\Models\*DesignRemark*',
    '.\app\Models\*DesignReview*',
    '.\app\Models\*UploadSession*',
    '.\app\Http\Controllers\*ProjectDesign*',
    '.\app\Http\Controllers\ProjectDesign',
    '.\app\Http\Requests\*ProjectDesign*',
    '.\app\Http\Requests\ProjectDesign',
    '.\app\Http\Resources\*ProjectDesign*',
    '.\app\Http\Resources\ProjectDesign',
    '.\app\Services\*ProjectDesign*',
    '.\app\Services\ProjectDesign',
    '.\app\Actions\*ProjectDesign*',
    '.\app\Actions\ProjectDesign',
    '.\app\Policies\*ProjectDesign*',
    '.\app\Events\*ProjectDesign*',
    '.\app\Events\ProjectDesign',
    '.\app\Jobs\*ProjectDesign*',
    '.\app\Jobs\ProjectDesign',
    '.\app\Notifications\*ProjectDesign*',
    '.\app\Notifications\ProjectDesign'
)

Write-Host 'Collecting migrations, routes, configuration, and tests...' -ForegroundColor Cyan
Copy-ProjectPatterns -Patterns @(
    '.\database\migrations\*project_design*',
    '.\database\migrations\*design_file*',
    '.\database\migrations\*design_version*',
    '.\database\migrations\*design_asset*',
    '.\database\migrations\*design_annotation*',
    '.\database\migrations\*design_remark*',
    '.\database\migrations\*design_review*',
    '.\database\migrations\*upload_session*',
    '.\database\factories\*ProjectDesign*',
    '.\database\seeders\*ProjectDesign*',
    '.\database\seeders\*Permission*',
    '.\database\seeders\*Role*',
    '.\routes\web.php',
    '.\routes\api.php',
    '.\routes\channels.php',
    '.\bootstrap\app.php',
    '.\app\Providers\AppServiceProvider.php',
    '.\app\Providers\AuthServiceProvider.php',
    '.\config\project_design.php',
    '.\config\filesystems.php',
    '.\config\queue.php',
    '.\config\broadcasting.php',
    '.\config\reverb.php',
    '.\config\permission.php',
    '.\tests\Feature\ProjectDesign',
    '.\tests\Unit\ProjectDesign',
    '.\tests\*ProjectDesign*',
    '.\tests\Feature\*ProjectDesign*',
    '.\tests\Unit\*ProjectDesign*',
    '.\resources\js\features\project-design\*.test.*',
    '.\resources\js\features\project-design\*.spec.*'
)

Write-Host 'Collecting package and build configuration...' -ForegroundColor Cyan
Copy-ProjectPatterns -Patterns @(
    '.\package.json',
    '.\package-lock.json',
    '.\composer.json',
    '.\composer.lock',
    '.\tsconfig.json',
    '.\tsconfig.*.json',
    '.\vite.config.*',
    '.\eslint.config.*',
    '.\.eslintrc*',
    '.\.prettierrc*',
    '.\tailwind.config.*',
    '.\postcss.config.*',
    '.\phpunit.xml'
)

Write-Host 'Collecting changed and untracked files...' -ForegroundColor Cyan
$ChangedFiles = @()

try {
    $ChangedFiles += @(git diff --name-only 2>$null)
    $ChangedFiles += @(git diff --cached --name-only 2>$null)
    $ChangedFiles += @(git ls-files --others --exclude-standard 2>$null)
}
catch {
    Write-Warning 'Unable to read Git changed files.'
}

$UniqueChangedFiles = $ChangedFiles | Where-Object {
    $_ -and
    $_ -notmatch '^node_modules/' -and
    $_ -notmatch '^vendor/' -and
    $_ -notmatch '^storage/app/' -and
    $_ -notmatch '^public/storage/' -and
    $_ -notmatch '^\.env' -and
    $_ -notmatch '^PROJECT_DESIGN_.*VERIFICATION'
} | Sort-Object -Unique

foreach ($RelativeFile in $UniqueChangedFiles) {
    $Candidate = Join-Path $Root $RelativeFile

    if (Test-Path -Path $Candidate -PathType Leaf) {
        Copy-OneProjectFile -FilePath $Candidate
    }
}

if (Test-Path -Path $ManualEvidenceSource -PathType Container) {
    Write-Host 'Collecting optional manual evidence...' -ForegroundColor Cyan
    $EvidenceFiles = Get-ChildItem -Path $ManualEvidenceSource -File -Recurse -ErrorAction SilentlyContinue

    foreach ($EvidenceFile in $EvidenceFiles) {
        $RelativeEvidence = $EvidenceFile.FullName.Substring($ManualEvidenceSource.Length).TrimStart('\')
        $EvidenceTarget = Join-Path $ManualEvidenceDest $RelativeEvidence
        $EvidenceTargetDirectory = Split-Path -Path $EvidenceTarget -Parent

        if (-not (Test-Path -Path $EvidenceTargetDirectory)) {
            New-Item -ItemType Directory -Path $EvidenceTargetDirectory -Force | Out-Null
        }

        Copy-Item -Path $EvidenceFile.FullName -Destination $EvidenceTarget -Force
    }
}

Write-Host 'Generating Git diagnostics...' -ForegroundColor Cyan
Save-CommandOutput -Name 'git-status.txt' -Command { git status --short }
Save-CommandOutput -Name 'changed-files.txt' -Command {
    $Files = @()
    $Files += @(git diff --name-only)
    $Files += @(git diff --cached --name-only)
    $Files += @(git ls-files --others --exclude-standard)
    $Files | Sort-Object -Unique
}
Save-CommandOutput -Name 'git-diff-stat.txt' -Command { git diff --stat }
Save-CommandOutput -Name 'git-diff.txt' -Command { git diff --no-color }
Save-CommandOutput -Name 'git-cached-diff.txt' -Command { git diff --cached --no-color }

Write-Host 'Generating Laravel diagnostics...' -ForegroundColor Cyan
Save-CommandOutput -Name 'artisan-about.txt' -Command { php artisan about }
Save-CommandOutput -Name 'optimize-clear.txt' -Command { php artisan optimize:clear }
Save-CommandOutput -Name 'migration-status.txt' -Command { php artisan migrate:status }
Save-CommandOutput -Name 'project-design-routes.txt' -Command { php artisan route:list | Select-String -Pattern 'project-design|project_design|ProjectDesign|upload-session|design-remark|design-review' }
Save-CommandOutput -Name 'project-routes.txt' -Command { php artisan route:list | Select-String -Pattern 'dossiers|projects' }
Save-CommandOutput -Name 'broadcast-channels-search.txt' -Command { Get-ChildItem -Path '.\routes', '.\app' -File -Recurse -ErrorAction SilentlyContinue | Select-String -Pattern 'project-design|project_design|ProjectDesign|Broadcast::channel|PrivateChannel|PresenceChannel' -CaseSensitive:$false | Select-Object Path, LineNumber, Line | Format-Table -AutoSize -Wrap }
Save-CommandOutput -Name 'php-upload-limits.txt' -Command { php -r '$keys=["upload_max_filesize","post_max_size","max_file_uploads","memory_limit","max_execution_time","max_input_time"];foreach($keys as $key){echo $key."=".ini_get($key).PHP_EOL;}' }

Write-Host 'Generating database schema diagnostics...' -ForegroundColor Cyan
$SchemaProbePath = Join-Path $Root '_project_design_schema_probe.php'
$SchemaProbeLines = @(
    '<?php'
    'use Illuminate\Contracts\Console\Kernel;'
    'use Illuminate\Support\Facades\DB;'
    'use Illuminate\Support\Facades\Schema;'
    'require __DIR__."/vendor/autoload.php";'
    '$app = require __DIR__."/bootstrap/app.php";'
    '$kernel = $app->make(Kernel::class);'
    '$kernel->bootstrap();'
    '$tables = ['
    '    "project_design_folders",'
    '    "project_design_files",'
    '    "project_design_versions",'
    '    "project_design_assets",'
    '    "project_design_annotations",'
    '    "project_design_reviews",'
    '    "project_design_remarks",'
    '    "project_design_remark_comments",'
    '    "project_design_remark_attachments",'
    '    "project_design_activities",'
    '    "project_design_upload_sessions",'
    '    "project_design_upload_session_files"'
    '];'
    'try {'
    '    $result = [];'
    '    foreach ($tables as $table) {'
    '        $entry = ["table" => $table, "exists" => Schema::hasTable($table)];'
    '        if ($entry["exists"]) {'
    '            $entry["rowCount"] = DB::table($table)->count();'
    '            $entry["columns"] = DB::select("SHOW COLUMNS FROM `".$table."`");'
    '            $entry["indexes"] = DB::select("SHOW INDEX FROM `".$table."`");'
    '            $entry["foreignKeys"] = DB::select("SELECT COLUMN_NAME AS column_name, REFERENCED_TABLE_NAME AS referenced_table, REFERENCED_COLUMN_NAME AS referenced_column, CONSTRAINT_NAME AS constraint_name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL", [$table]);'
    '        }'
    '        $result[] = $entry;'
    '    }'
    '    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL;'
    '    exit(0);'
    '} catch (Throwable $e) {'
    '    fwrite(STDERR, get_class($e).": ".$e->getMessage().PHP_EOL);'
    '    exit(1);'
    '}'
)
Write-Utf8File -Path $SchemaProbePath -Content ($SchemaProbeLines -join [Environment]::NewLine)
Save-CommandOutput -Name 'database-schema-indexes-foreign-keys.txt' -Command { php $SchemaProbePath }
Remove-Item -Path $SchemaProbePath -Force -ErrorAction SilentlyContinue

Write-Host 'Generating frontend static audits...' -ForegroundColor Cyan
Save-SearchReport -Name 'annotation-coordinate-audit.txt' -SearchRoots $FrontendRoots -Patterns @(
    'getBoundingClientRect',
    'pageNumber',
    'page_number',
    'normalized',
    'geometry',
    'viewport',
    'rotation',
    'scale',
    'zoom',
    'pan',
    'translate',
    'transform',
    'onDragEnd',
    'onTransformEnd',
    'Konva',
    'Stage',
    'Layer'
)
Save-SearchReport -Name 'viewer-navigation-audit.txt' -SearchRoots $FrontendRoots -Patterns @(
    'react-pdf',
    'pdfjs-dist',
    'Document',
    'Page',
    'requestFullscreen',
    'exitFullscreen',
    'fullscreenchange',
    'fitWidth',
    'fitPage',
    'rotate',
    'wheel',
    'pointer',
    'drag',
    'scrollLeft',
    'scrollTop',
    'translateX',
    'translateY'
)
Save-SearchReport -Name 'project-design-api-audit.txt' -SearchRoots $FrontendRoots -Patterns @(
    'fetch\(',
    'axios\.',
    'XMLHttpRequest',
    'useQuery',
    'useMutation',
    'queryKey',
    'invalidateQueries',
    'setQueryData',
    'X-CSRF-TOKEN',
    'X-Socket-ID',
    'Accept.*application/json',
    'AbortSignal'
)
Save-SearchReport -Name 'realtime-audit.txt' -SearchRoots $FrontendRoots -Patterns @(
    'Echo\.',
    'Reverb',
    'private\(',
    'listen\(',
    'recordVersion',
    'eventId',
    'toOthers',
    'setQueriesData',
    'invalidateQueries'
)
Save-SearchReport -Name 'large-upload-audit.txt' -SearchRoots $FrontendRoots -Patterns @(
    '@uppy/core',
    '@uppy/tus',
    '@uppy/golden-retriever',
    'GlobalUploadProvider',
    'GlobalUploadDock',
    'UploadCenter',
    'pause',
    'resume',
    'retry',
    'cancel',
    'progress',
    'clientUploadId',
    'uploadSession'
)
Save-SearchReport -Name 'heroui-compliance-audit.txt' -SearchRoots $FrontendRoots -Patterns @(
    '<button',
    '<input',
    '<select',
    '<textarea',
    '@heroui',
    'AppButton',
    'AppInput',
    'AppSelect',
    'AppDrawer',
    'AppModal',
    'AppDataTable',
    'AppTooltip',
    'AppPopover',
    'AppDropdown'
)
Save-SearchReport -Name 'fake-or-incomplete-actions.txt' -SearchRoots $FrontendRoots -Patterns @(
    'TODO',
    'coming soon',
    'not implemented',
    'placeholder',
    'console\.log',
    'onSave=\{\(\) => \{\}\}',
    'catch\s*\{\s*\}',
    '\.catch\(\(\)\s*=>\s*\{\s*\}\)',
    'undefined',
    'Invalid Date',
    'JSON\.stringify'
)
Save-SearchReport -Name 'url-deep-link-audit.txt' -SearchRoots $FrontendRoots -Patterns @(
    'URLSearchParams',
    'pushState',
    'replaceState',
    'popstate',
    'tab=project-design',
    'fileId',
    'versionId',
    'remarkId',
    'file=',
    'version=',
    'remark='
)

Write-Host 'Checking frontend libraries and scripts...' -ForegroundColor Cyan
Save-CommandOutput -Name 'package-scripts.txt' -Command {
    $Package = Get-PackageJson

    if ($null -eq $Package) {
        Write-Output 'package.json is missing or invalid.'
    }
    elseif ($Package.scripts) {
        $Package.scripts | Format-List
    }
    else {
        Write-Output 'No package scripts found.'
    }
}
Save-CommandOutput -Name 'project-design-libraries.txt' -Command {
    npm ls '@tanstack/react-query' 'react-hook-form' 'zod' '@hookform/resolvers' '@uppy/core' '@uppy/react' '@uppy/tus' '@uppy/golden-retriever' 'react-pdf' 'pdfjs-dist' 'konva' 'react-konva' 'react-resizable-panels' '@tanstack/react-virtual' --depth=0
}

Write-Host 'Running PHP syntax checks...' -ForegroundColor Cyan
Save-CommandOutput -Name 'php-syntax.txt' -Command {
    $PhpFiles = @()

    foreach ($BackendRoot in $BackendRoots) {
        if (-not (Test-Path -Path $BackendRoot)) {
            continue
        }

        $Candidates = Get-ChildItem -Path $BackendRoot -File -Recurse -Filter '*.php' -ErrorAction SilentlyContinue

        foreach ($Candidate in $Candidates) {
            if ($Candidate.FullName -match 'ProjectDesign|project_design|DesignFile|DesignVersion|DesignAsset|DesignAnnotation|DesignRemark|DesignReview|UploadSession') {
                $PhpFiles += $Candidate.FullName
            }
        }
    }

    foreach ($ChangedFile in $UniqueChangedFiles) {
        if ($ChangedFile -match '\.php$') {
            $CandidatePath = Join-Path $Root $ChangedFile
            if (Test-Path -Path $CandidatePath -PathType Leaf) {
                $PhpFiles += $CandidatePath
            }
        }
    }

    $PhpFiles = $PhpFiles | Sort-Object -Unique

    if (-not $PhpFiles -or $PhpFiles.Count -eq 0) {
        Write-Output 'No relevant PHP files found.'
    }
    else {
        foreach ($PhpFile in $PhpFiles) {
            php -l $PhpFile
        }
    }
}

Write-Host 'Running Project Design tests...' -ForegroundColor Cyan
Save-CommandOutput -Name 'project-design-tests.txt' -Command { php artisan test --filter=ProjectDesign }

Write-Host 'Running frontend typecheck, lint, and build...' -ForegroundColor Cyan
$PackageJson = Get-PackageJson
$ScriptNames = @()

if ($PackageJson -and $PackageJson.scripts) {
    $ScriptNames = @($PackageJson.scripts.PSObject.Properties.Name)
}

if ($ScriptNames -contains 'typecheck') {
    Save-CommandOutput -Name 'npm-typecheck.txt' -Command { npm run typecheck }
}
elseif (Test-Path -Path '.\node_modules\.bin\tsc.cmd') {
    Save-CommandOutput -Name 'npm-typecheck.txt' -Command { & '.\node_modules\.bin\tsc.cmd' --noEmit }
}
else {
    Write-Utf8File -Path (Join-Path $Diagnostics 'npm-typecheck.txt') -Content 'TYPECHECK NOT RUN: no typecheck script or local tsc executable was found.'
}

if ($ScriptNames -contains 'lint') {
    Save-CommandOutput -Name 'npm-lint.txt' -Command { npm run lint }
}
elseif (Test-Path -Path '.\node_modules\.bin\eslint.cmd') {
    Save-CommandOutput -Name 'npm-lint.txt' -Command { & '.\node_modules\.bin\eslint.cmd' 'resources/js/features/project-design' 'resources/js/features/uploads' 'resources/js/pages/Dossiers/Show.tsx' }
}
else {
    Write-Utf8File -Path (Join-Path $Diagnostics 'npm-lint.txt') -Content 'LINT NOT RUN: no lint script or local eslint executable was found.'
}

Save-CommandOutput -Name 'npm-build.txt' -Command { npm run build }

Write-Host 'Creating Vite chunk report...' -ForegroundColor Cyan
Save-CommandOutput -Name 'vite-chunks.txt' -Command {
    $BuildRoots = @('.\public\build\assets', '.\public\build', '.\dist\assets', '.\dist')
    $BuildRoot = $null

    foreach ($CandidateRoot in $BuildRoots) {
        if (Test-Path -Path $CandidateRoot) {
            $BuildRoot = $CandidateRoot
            break
        }
    }

    if (-not $BuildRoot) {
        Write-Output 'No Vite build output directory found.'
    }
    else {
        $Rows = @()
        $BuildFiles = Get-ChildItem -Path $BuildRoot -File -Recurse -ErrorAction SilentlyContinue

        foreach ($BuildFile in $BuildFiles) {
            if ($BuildFile.Extension -notin @('.js', '.css', '.wasm')) {
                continue
            }

            $Rows += [PSCustomObject]@{
                File = $BuildFile.FullName.Substring($Root.Length).TrimStart('\')
                SizeKB = [math]::Round($BuildFile.Length / 1KB, 2)
                SizeMB = [math]::Round($BuildFile.Length / 1MB, 3)
            }
        }

        $Rows | Sort-Object SizeKB -Descending | Format-Table -AutoSize
    }
}
Copy-ProjectPatterns -Patterns @('.\public\build\manifest.json', '.\public\build\.vite\manifest.json', '.\dist\manifest.json')

Write-Host 'Collecting filtered Laravel log evidence...' -ForegroundColor Cyan
$LatestLog = Get-ChildItem -Path '.\storage\logs\*.log' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($LatestLog) {
    $LogLines = Get-Content -Path $LatestLog.FullName -Tail 5000 -ErrorAction SilentlyContinue
    $RelevantLogLines = $LogLines | Select-String -Pattern 'ProjectDesign|project-design|project_design|DesignAnnotation|DesignRemark|DesignReview|UploadSession|ERROR|Exception|SQLSTATE' -CaseSensitive:$false | Select-Object -ExpandProperty Line
    $SanitizedLog = Sanitize-LogText -Text ($RelevantLogLines -join [Environment]::NewLine)
    Write-Utf8File -Path (Join-Path $Diagnostics 'project-design-laravel-log.txt') -Content $SanitizedLog
}
else {
    Write-Utf8File -Path (Join-Path $Diagnostics 'project-design-laravel-log.txt') -Content 'No Laravel log file was found.'
}

$ManualEvidenceLines = @(
    'OPTIONAL MANUAL EVIDENCE'
    ''
    'Before rerunning this script, place safe screenshots, screen recordings, and redacted JSON responses in:'
    'PROJECT_DESIGN_MANUAL_EVIDENCE'
    ''
    'Recommended files:'
    'repository.png'
    'editor-100-percent.png'
    'editor-200-percent.png'
    'annotation-after-pan.png'
    'annotation-after-rotation.png'
    'annotation-fullscreen.png'
    'mobile-390.png'
    'console.png'
    'network.png'
    'file-response.json'
    'version-response.json'
    'assets-response.json'
    'annotations-response.json'
    'remarks-response.json'
    ''
    'Remove private client information before including evidence.'
)
Write-Utf8File -Path (Join-Path $ManualEvidenceDest 'README.txt') -Content ($ManualEvidenceLines -join [Environment]::NewLine)

$ChecklistLines = @(
    'PROJECT DESIGN EDITOR MANUAL QA CHECKLIST'
    ''
    '[ ] Open repository mode'
    '[ ] Open editor without a modal'
    '[ ] Create annotation at 100 percent zoom'
    '[ ] Zoom to 200 percent; annotation remains attached'
    '[ ] Pan left and right; annotation remains attached'
    '[ ] Pan top and bottom; annotation remains attached'
    '[ ] Scroll PDF; annotation remains attached to exact page'
    '[ ] Rotate PDF; annotation remains attached'
    '[ ] Resize browser; annotation remains attached'
    '[ ] Enter fullscreen; annotation remains attached'
    '[ ] Exit fullscreen; annotation remains attached'
    '[ ] Refresh deep link; same file, version, page, and remark restore'
    '[ ] Navigate PDF using drag/pan in all directions'
    '[ ] Mouse wheel zoom behavior works as designed'
    '[ ] Keyboard navigation works'
    '[ ] Remarks save to backend'
    '[ ] Realtime update appears in second browser'
    '[ ] No full-page refresh occurs'
    '[ ] Large upload continues after navigation'
    '[ ] Sticky upload dock remains visible'
    '[ ] Browser Console is clean'
    '[ ] Network has no unexpected 404, 419, 422, or 500 responses'
)
Write-Utf8File -Path (Join-Path $Dest 'MANUAL_QA_CHECKLIST.txt') -Content ($ChecklistLines -join [Environment]::NewLine)

$ReadmeLines = @(
    'ARCHI LBO PROJECT DESIGN EDITOR VERIFICATION PACKAGE'
    ''
    ('Generated: {0}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
    ('Project root: {0}' -f $Root)
    ''
    'Contains:'
    '- authoritative Project Design specification'
    '- Project/Dossier Show integration'
    '- complete Project Design frontend'
    '- global upload, query, and realtime frontend'
    '- shared HeroUI components and layout'
    '- Project Design backend code'
    '- migrations, routes, channels, and configuration'
    '- Project Design tests'
    '- Git diff and status'
    '- route and migration diagnostics'
    '- database columns, indexes, foreign keys, and row counts'
    '- PHP upload limits'
    '- annotation/viewer/upload/realtime static audits'
    '- PHP syntax, tests, typecheck, lint, and build outputs'
    '- Vite chunk sizes'
    '- filtered and redacted relevant Laravel log lines'
    ''
    'Excluded:'
    '- .env and credentials'
    '- vendor and node_modules'
    '- private storage and public storage'
    '- real CAD, BIM, PDF, ZIP, SQL, database, and backup files'
    ''
    'Upload the generated ZIP plus any additional screenshots or recording.'
)
Write-Utf8File -Path (Join-Path $Dest 'PACKAGE_README.txt') -Content ($ReadmeLines -join [Environment]::NewLine)

$CollectedFiles = Get-ChildItem -Path $Dest -File -Recurse -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName.Substring($Dest.Length).TrimStart('\') } | Sort-Object
Write-Utf8File -Path (Join-Path $Diagnostics 'collected-files.txt') -Content ($CollectedFiles -join [Environment]::NewLine)

Write-Host 'Creating ZIP...' -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $Dest '*') -DestinationPath $Zip -Force

Write-Host ''
Write-Host '==================================================' -ForegroundColor Green
Write-Host 'PROJECT DESIGN EDITOR VERIFICATION PACKAGE CREATED' -ForegroundColor Green
Write-Host $Zip -ForegroundColor Yellow
Write-Host ''
Write-Host 'Upload this ZIP for verification.' -ForegroundColor Cyan
Write-Host 'No .env, secrets, private storage, or real design files were included.' -ForegroundColor Green
Write-Host '==================================================' -ForegroundColor Green
