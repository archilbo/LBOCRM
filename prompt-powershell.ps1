# ============================================================
# ARCHI LBO — PROJECT DESIGN IMPLEMENTATION VERIFICATION PACKAGE
# Run from the Laravel project root.
# ============================================================

$ErrorActionPreference = "Continue"

$Root = (Get-Location).Path.TrimEnd('\')
$Dest = Join-Path $Root "PROJECT_DESIGN_VERIFICATION"
$Zip  = Join-Path $Root "PROJECT_DESIGN_VERIFICATION.zip"

Remove-Item $Dest -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $Zip -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Path $Dest -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $Dest "_diagnostics") -Force | Out-Null

function Copy-OneFile {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath -PathType Leaf)) {
        return
    }

    try {
        $FullPath = (Resolve-Path $FilePath).Path
    }
    catch {
        return
    }

    if (-not $FullPath.StartsWith(
        $Root,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        return
    }

    $Relative = $FullPath.Substring($Root.Length).TrimStart('\')
    $Target = Join-Path $Dest $Relative
    $TargetDirectory = Split-Path $Target -Parent

    New-Item -ItemType Directory -Path $TargetDirectory -Force | Out-Null
    Copy-Item $FullPath $Target -Force
}

function Copy-ProjectMatches {
    param([string[]]$Patterns)

    foreach ($Pattern in $Patterns) {
        $Items = Get-ChildItem -Path $Pattern -Force -ErrorAction SilentlyContinue

        foreach ($Item in $Items) {
            if ($Item.PSIsContainer) {
                Get-ChildItem `
                    -Path $Item.FullName `
                    -File `
                    -Recurse `
                    -Force `
                    -ErrorAction SilentlyContinue |
                    Where-Object {
                        $_.FullName -notmatch '\\node_modules\\' -and
                        $_.FullName -notmatch '\\vendor\\' -and
                        $_.FullName -notmatch '\\storage\\app\\'
                    } |
                    ForEach-Object {
                        Copy-OneFile $_.FullName
                    }
            }
            else {
                Copy-OneFile $Item.FullName
            }
        }
    }
}

function Save-CommandOutput {
    param(
        [string]$Name,
        [scriptblock]$Command
    )

    $OutputFile = Join-Path $Dest "_diagnostics\$Name"

    try {
        & $Command *>&1 |
            Out-String -Width 600 |
            Set-Content -Path $OutputFile -Encoding UTF8
    }
    catch {
        $_ |
            Out-String |
            Set-Content -Path $OutputFile -Encoding UTF8
    }
}

Write-Host "Collecting specification..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\BUIL_PROJECT_DESIGN_FEATURE.md",
    ".\BUILD_PROJECT_DESIGN_FEATURE.md",
    ".\docs\*PROJECT*DESIGN*",
    ".\docs\*project*design*"
)

Write-Host "Collecting Project Show integration..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\resources\js\pages\Projects",
    ".\resources\js\features\projects",
    ".\resources\js\components\projects",
    ".\resources\js\components\project",

    ".\app\Http\Controllers\ProjectController.php",
    ".\app\Http\Resources\ProjectResource.php",
    ".\app\Models\Project.php"
)

Write-Host "Collecting Project Design frontend..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\resources\js\features\project-design",
    ".\resources\js\features\projectDesign",
    ".\resources\js\features\ProjectDesign",

    ".\resources\js\pages\ProjectDesign",
    ".\resources\js\pages\Projects\*Design*",

    ".\resources\js\components\*ProjectDesign*",
    ".\resources\js\components\*DesignFile*",
    ".\resources\js\components\*DesignRemark*",
    ".\resources\js\components\*DesignReview*",

    ".\resources\js\hooks\*ProjectDesign*",
    ".\resources\js\stores\*ProjectDesign*",
    ".\resources\js\services\*ProjectDesign*",
    ".\resources\js\types\*ProjectDesign*",
    ".\resources\js\schemas\*ProjectDesign*",
    ".\resources\js\lib\*ProjectDesign*"
)

Write-Host "Collecting backend domain files..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\app\Domain\ProjectDesign",

    ".\app\Models\*ProjectDesign*",
    ".\app\Models\*DesignFile*",
    ".\app\Models\*DesignVersion*",
    ".\app\Models\*DesignRemark*",
    ".\app\Models\*DesignReview*",

    ".\app\Http\Controllers\*ProjectDesign*",
    ".\app\Http\Controllers\ProjectDesign",

    ".\app\Http\Requests\*ProjectDesign*",
    ".\app\Http\Requests\ProjectDesign",

    ".\app\Http\Resources\*ProjectDesign*",
    ".\app\Http\Resources\ProjectDesign",

    ".\app\Services\*ProjectDesign*",
    ".\app\Services\ProjectDesign",

    ".\app\Actions\*ProjectDesign*",
    ".\app\Actions\ProjectDesign",

    ".\app\Repositories\*ProjectDesign*",
    ".\app\Repositories\ProjectDesign"
)

Write-Host "Collecting policies, events, jobs and notifications..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\app\Policies\*ProjectDesign*",
    ".\app\Policies\*DesignFile*",
    ".\app\Policies\*DesignVersion*",
    ".\app\Policies\*DesignRemark*",

    ".\app\Events\*ProjectDesign*",
    ".\app\Events\*DesignFile*",
    ".\app\Events\*DesignVersion*",
    ".\app\Events\*DesignRemark*",

    ".\app\Jobs\*ProjectDesign*",
    ".\app\Jobs\*DesignPreview*",
    ".\app\Jobs\*DesignThumbnail*",
    ".\app\Jobs\*Ifc*",

    ".\app\Notifications\*ProjectDesign*",
    ".\app\Notifications\*DesignRemark*",
    ".\app\Notifications\*DesignReview*",

    ".\app\Broadcasting"
)

Write-Host "Collecting migrations, factories and seeders..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\database\migrations\*project_design*",
    ".\database\migrations\*design_file*",
    ".\database\migrations\*design_version*",
    ".\database\migrations\*design_asset*",
    ".\database\migrations\*design_review*",
    ".\database\migrations\*design_remark*",

    ".\database\factories\*ProjectDesign*",
    ".\database\factories\*DesignFile*",
    ".\database\factories\*DesignVersion*",
    ".\database\factories\*DesignRemark*",

    ".\database\seeders\*ProjectDesign*",
    ".\database\seeders\*Permission*",
    ".\database\seeders\*Role*",
    ".\database\seeders\DatabaseSeeder.php"
)

Write-Host "Collecting routes and configuration..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\routes\web.php",
    ".\routes\api.php",
    ".\routes\channels.php",

    ".\config\project_design.php",
    ".\config\filesystems.php",
    ".\config\queue.php",
    ".\config\broadcasting.php",
    ".\config\reverb.php",
    ".\config\permission.php",

    ".\bootstrap\app.php",

    ".\app\Providers\AppServiceProvider.php",
    ".\app\Providers\AuthServiceProvider.php"
)

Write-Host "Collecting shared components used by the feature..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\resources\js\components\ui",
    ".\resources\js\components\layout",
    ".\resources\js\components\shared",

    ".\resources\js\lib\formErrors*",
    ".\resources\js\lib\http*",
    ".\resources\js\lib\api*",
    ".\resources\js\lib\echo*",

    ".\resources\js\bootstrap.ts",
    ".\resources\js\bootstrap.tsx",
    ".\resources\js\app.ts",
    ".\resources\js\app.tsx"
)

Write-Host "Collecting tests..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\tests\Feature\ProjectDesign",
    ".\tests\Unit\ProjectDesign",
    ".\tests\*ProjectDesign*",
    ".\tests\Feature\*ProjectDesign*",
    ".\tests\Unit\*ProjectDesign*",
    ".\tests\Feature\*DesignFile*",
    ".\tests\Feature\*DesignRemark*",
    ".\tests\Feature\*DesignReview*"
)

Write-Host "Collecting package files..." -ForegroundColor Cyan

Copy-ProjectMatches @(
    ".\package.json",
    ".\package-lock.json",
    ".\composer.json",
    ".\composer.lock",
    ".\vite.config.*",
    ".\tsconfig.json",
    ".\phpunit.xml",
    ".\eslint.config.*"
)

# ------------------------------------------------------------
# Automatically include every changed/untracked code file.
# This is important when the AI used unexpected filenames.
# ------------------------------------------------------------

Write-Host "Collecting all changed and untracked project files..." -ForegroundColor Cyan

$ChangedFiles = @()

try {
    $ChangedFiles += git diff --name-only
    $ChangedFiles += git diff --cached --name-only
    $ChangedFiles += git ls-files --others --exclude-standard
}
catch {
    Write-Warning "Unable to obtain Git changed files."
}

$ChangedFiles |
    Where-Object {
        $_ -and
        $_ -notmatch '^\.env' -and
        $_ -notmatch '^vendor/' -and
        $_ -notmatch '^node_modules/' -and
        $_ -notmatch '^storage/app/' -and
        $_ -notmatch '\.(dwg|dxf|pln|pla|rvt|skp|ifc)$'
    } |
    Sort-Object -Unique |
    ForEach-Object {
        $Candidate = Join-Path $Root $_

        if (Test-Path $Candidate -PathType Leaf) {
            Copy-OneFile $Candidate
        }
    }

# ------------------------------------------------------------
# Diagnostics
# ------------------------------------------------------------

Write-Host "Creating diagnostics..." -ForegroundColor Cyan

Save-CommandOutput "git-status.txt" {
    git status --short
}

Save-CommandOutput "git-diff-stat.txt" {
    git diff --stat
}

Save-CommandOutput "git-diff.txt" {
    git diff --no-color
}

Save-CommandOutput "git-cached-diff.txt" {
    git diff --cached --no-color
}

Save-CommandOutput "changed-files.txt" {
    @(
        git diff --name-only
        git diff --cached --name-only
        git ls-files --others --exclude-standard
    ) | Sort-Object -Unique
}

Save-CommandOutput "artisan-about.txt" {
    php artisan about
}

Save-CommandOutput "migration-status.txt" {
    php artisan migrate:status
}

Save-CommandOutput "project-design-routes.txt" {
    php artisan route:list |
        Select-String -Pattern "project-design|project_design|ProjectDesign|design-file|design-version|design-remark"
}

Save-CommandOutput "project-routes.txt" {
    php artisan route:list --path=projects
}

Save-CommandOutput "permissions-search.txt" {
    Get-ChildItem `
        ".\app", ".\database", ".\routes" `
        -File `
        -Recurse `
        -ErrorAction SilentlyContinue |
        Select-String `
            -Pattern "project-design|project_design|ProjectDesign" `
            -CaseSensitive:$false |
        Select-Object Path, LineNumber, Line |
        Format-Table -AutoSize -Wrap
}

Save-CommandOutput "frontend-project-design-search.txt" {
    Get-ChildItem `
        ".\resources\js" `
        -File `
        -Recurse `
        -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Extension -in @(".ts", ".tsx", ".js", ".jsx")
        } |
        Select-String `
            -Pattern "Project Design|project-design|projectDesign|ProjectDesign" `
            -CaseSensitive:$false |
        Select-Object Path, LineNumber, Line |
        Format-Table -AutoSize -Wrap
}

Save-CommandOutput "database-schema.txt" {
    php artisan tinker --execute=@'
$tables = [
    "project_design_folders",
    "project_design_files",
    "project_design_versions",
    "project_design_assets",
    "project_design_reviews",
    "project_design_remarks",
    "project_design_remark_comments",
    "project_design_remark_attachments",
    "project_design_activities",
];

foreach ($tables as $table) {
    echo PHP_EOL . "=== {$table} ===" . PHP_EOL;

    if (!\Illuminate\Support\Facades\Schema::hasTable($table)) {
        echo "TABLE MISSING" . PHP_EOL;
        continue;
    }

    dump(\Illuminate\Support\Facades\Schema::getColumnListing($table));
}
'@
}
php -r @'
Save-CommandOutput "php-upload-limits.txt" {
    
$keys = [
    "upload_max_filesize",
    "post_max_size",
    "max_file_uploads",
    "memory_limit",
    "max_execution_time",
    "max_input_time",
];

foreach ($keys as $key) {
    echo $key . "=" . ini_get($key) . PHP_EOL;
}

}

Save-CommandOutput "npm-build.txt" {
    npm run build
}

if (
    Test-Path ".\package.json" -and
    (Get-Content ".\package.json" -Raw) -match '"typecheck"\s*:'
) {
    Save-CommandOutput "npm-typecheck.txt" {
        npm run typecheck
    }
}

if (
    Test-Path ".\package.json" -and
    (Get-Content ".\package.json" -Raw) -match '"lint"\s*:'
) {
    Save-CommandOutput "npm-lint.txt" {
        npm run lint
    }
}

Save-CommandOutput "project-design-tests.txt" {
    php artisan test --filter=ProjectDesign
}

# Use a bounded tail instead of copying complete logs.
$LatestLog = Get-ChildItem `
    ".\storage\logs\*.log" `
    -File `
    -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($LatestLog) {
    Get-Content $LatestLog.FullName -Tail 1000 |
        Set-Content `
            (Join-Path $Dest "_diagnostics\latest-laravel-log.txt") `
            -Encoding UTF8
}
'@
# ------------------------------------------------------------
# Package manifest
# ------------------------------------------------------------

$Manifest = @"
PROJECT DESIGN VERIFICATION PACKAGE

Project root:
$Root

Generated:
$(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

This package intentionally excludes:
- .env
- credentials and secrets
- vendor
- node_modules
- private storage files
- real CAD/BIM project files

Main specification expected:
BUIL_PROJECT_DESIGN_FEATURE.md

Important diagnostics:
_diagnostics/git-status.txt
_diagnostics/git-diff.txt
_diagnostics/migration-status.txt
_diagnostics/project-design-routes.txt
_diagnostics/database-schema.txt
_diagnostics/npm-build.txt
_diagnostics/project-design-tests.txt
_diagnostics/latest-laravel-log.txt
"@

$Manifest |
    Set-Content `
        (Join-Path $Dest "PACKAGE_README.txt") `
        -Encoding UTF8

Write-Host "Creating ZIP..." -ForegroundColor Cyan

Compress-Archive `
    -Path "$Dest\*" `
    -DestinationPath $Zip `
    -Force

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Created:" -ForegroundColor Green
Write-Host $Zip -ForegroundColor Yellow
Write-Host ""
Write-Host "Upload PROJECT_DESIGN_VERIFICATION.zip" -ForegroundColor Cyan
Write-Host "No .env or private design files were included." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green