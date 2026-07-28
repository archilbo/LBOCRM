[CmdletBinding()]
param(
    [string]$ProjectRoot = 'D:\ARCHI LBO\LBOSM\LBOCRM'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$ExpectedBranch = 'finance-template-editor'
$ExpectedCommit = '4284dbf343e10fda511a81e565ba0d8fac03dfe1'
$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PayloadRoot = Join-Path $PackageRoot 'payload'
$PayloadManifestPath = Join-Path $PackageRoot 'PAYLOAD_MANIFEST.json'

$ExistingTargetFiles = @(
    'app/Http/Controllers/DossierController.php'
    'app/Http/Requests/UpdateDossierRequest.php'
    'app/Http/Resources/DossierResource.php'
    'resources/js/features/dossiers/types.ts'
    'resources/js/lib/i18n.ts'
    'resources/js/pages/Dossiers/Index.tsx'
    'resources/js/pages/Dossiers/Show.tsx'
)

$NewTargetFiles = @(
    'resources/js/components/ui/AppWorkspaceTabs.tsx'
    'resources/js/features/dossiers/projectPayload.ts'
    'resources/js/locales/en/projects.ts'
    'resources/js/locales/fr/projects.ts'
    'tests/Feature/ProjectWorkspaceTest.php'
)

$TargetFiles = @($ExistingTargetFiles + $NewTargetFiles)

$TypeScriptTargetFiles = @(
    'resources/js/components/ui/AppWorkspaceTabs.tsx'
    'resources/js/features/dossiers/projectPayload.ts'
    'resources/js/features/dossiers/types.ts'
    'resources/js/lib/i18n.ts'
    'resources/js/locales/en/projects.ts'
    'resources/js/locales/fr/projects.ts'
    'resources/js/pages/Dossiers/Index.tsx'
    'resources/js/pages/Dossiers/Show.tsx'
)

function Write-Step {
    param([string]$Message)

    Write-Host ''
    Write-Host ('==> ' + $Message) -ForegroundColor Cyan
}

function Stop-Installer {
    param([string]$Message)

    Write-Host ''
    Write-Host ('ERROR: ' + $Message) -ForegroundColor Red
    exit 1
}

function Invoke-CmdCapture {
    param([string]$Command)

    $previousPreference = $ErrorActionPreference

    try {
        $ErrorActionPreference = 'Continue'
        $lines = @(& cmd.exe /d /s /c $Command 2>&1 | ForEach-Object { $_.ToString() })
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    return [pscustomobject]@{
        ExitCode = $exitCode
        Lines = $lines
        Text = ($lines -join [Environment]::NewLine)
    }
}

function Invoke-CmdLogged {
    param(
        [string]$Command,
        [string]$LogPath,
        [ref]$ExitCode
    )

    $previousPreference = $ErrorActionPreference

    try {
        $ErrorActionPreference = 'Continue'
        & cmd.exe /d /s /c $Command 2>&1 |
            ForEach-Object { $_.ToString() } |
            Tee-Object -FilePath $LogPath |
            Out-Host
        $ExitCode.Value = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
}

function Get-TypeScriptDiagnosticSignatures {
    param([string]$Text)

    $signatures = @()

    foreach ($line in ($Text -split "`r?`n")) {
        if ($line -match '^(?<file>.+?)\(\d+,\d+\): error (?<code>TS\d+): (?<message>.+)$') {
            $normalizedFile = $Matches['file'].Replace('\', '/').Trim()
            $signatures += ($normalizedFile + '|' + $Matches['code'] + '|' + $Matches['message'].Trim())
        }
    }

    return @($signatures | Sort-Object -Unique)
}

function Get-TypeScriptTargetDiagnostics {
    param(
        [string]$Text,
        [string[]]$TargetPaths
    )

    $targetDiagnostics = @()

    foreach ($line in ($Text -split "`r?`n")) {
        if ($line -match '^(?<file>.+?)\(\d+,\d+\): error (?<code>TS\d+): (?<message>.+)$') {
            $normalizedFile = $Matches['file'].Replace('\', '/').Trim()

            if ($TargetPaths -contains $normalizedFile) {
                $targetDiagnostics += $line
            }
        }
    }

    return @($targetDiagnostics)
}

function Verify-PayloadManifest {
    if (-not (Test-Path -LiteralPath $PayloadManifestPath -PathType Leaf)) {
        throw 'PAYLOAD_MANIFEST.json is missing.'
    }

    $manifest = Get-Content -LiteralPath $PayloadManifestPath -Raw | ConvertFrom-Json
    $manifestPaths = @($manifest.files | ForEach-Object { [string]$_.path })

    foreach ($relative in $TargetFiles) {
        if ($manifestPaths -notcontains $relative) {
            throw "Payload manifest entry is missing: $relative"
        }
    }

    foreach ($entry in $manifest.files) {
        $relative = [string]$entry.path
        $source = Join-Path $PayloadRoot $relative.Replace('/', '\')

        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
            throw "Payload file is missing: $relative"
        }

        $actualHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()
        $expectedHash = ([string]$entry.sha256).ToLowerInvariant()

        if ($actualHash -ne $expectedHash) {
            throw "Payload hash mismatch: $relative"
        }
    }
}

function Copy-PayloadFile {
    param([string]$RelativePath)

    $relativeWindows = $RelativePath.Replace('/', '\')
    $source = Join-Path $PayloadRoot $relativeWindows
    $destination = Join-Path $ProjectRoot $relativeWindows
    $destinationDirectory = Split-Path -Parent $destination

    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
}

function Restore-Backup {
    param([string]$BackupRoot)

    Write-Step 'Restoring Project workspace files from backup'

    foreach ($relative in $ExistingTargetFiles) {
        $relativeWindows = $relative.Replace('/', '\')
        $source = Join-Path $BackupRoot $relativeWindows
        $destination = Join-Path $ProjectRoot $relativeWindows

        if (Test-Path -LiteralPath $source -PathType Leaf) {
            Copy-Item -LiteralPath $source -Destination $destination -Force
        }
    }

    foreach ($relative in $NewTargetFiles) {
        $destination = Join-Path $ProjectRoot $relative.Replace('/', '\')

        if (Test-Path -LiteralPath $destination -PathType Leaf) {
            Remove-Item -LiteralPath $destination -Force
        }
    }
}

function Fail-And-Restore {
    param(
        [string]$Message,
        [string]$BackupRoot
    )

    Restore-Backup -BackupRoot $BackupRoot
    Stop-Installer ($Message + ' Original files were restored.')
}

function Assert-Contains {
    param(
        [string]$Path,
        [string]$Literal,
        [string]$BackupRoot
    )

    $content = [System.IO.File]::ReadAllText($Path)

    if (-not $content.Contains($Literal)) {
        Fail-And-Restore `
            -Message ('Required repair marker is missing: ' + $Literal) `
            -BackupRoot $BackupRoot
    }
}

function Assert-NotContains {
    param(
        [string]$Path,
        [string]$Literal,
        [string]$BackupRoot
    )

    $content = [System.IO.File]::ReadAllText($Path)

    if ($content.Contains($Literal)) {
        Fail-And-Restore `
            -Message ('Obsolete implementation remains: ' + $Literal) `
            -BackupRoot $BackupRoot
    }
}

function Assert-TextIntegrity {
    param(
        [string]$Path,
        [string]$BackupRoot
    )

    $content = [System.IO.File]::ReadAllText($Path)

    if ($content.Contains([char]0)) {
        Fail-And-Restore -Message "NUL byte found in: $Path" -BackupRoot $BackupRoot
    }

    $lineNumber = 0
    foreach ($line in ($content -split "`r?`n")) {
        $lineNumber++
        if ($line -match '[ \t]+$') {
            Fail-And-Restore `
                -Message "Trailing whitespace found in $Path at line $lineNumber" `
                -BackupRoot $BackupRoot
        }
    }
}

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    Stop-Installer "Project root not found: $ProjectRoot"
}

if (-not (Test-Path -LiteralPath $PayloadRoot -PathType Container)) {
    Stop-Installer "Payload folder not found: $PayloadRoot"
}

Write-Step 'Verifying package payload hashes'
try {
    Verify-PayloadManifest
}
catch {
    Stop-Installer $_.Exception.Message
}

Set-Location -LiteralPath $ProjectRoot

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot '.git') -PathType Container)) {
    Stop-Installer 'The selected project root is not a Git repository.'
}

Write-Step 'Checking branch and exact inspected GitHub commit'

$branchResult = Invoke-CmdCapture -Command 'git branch --show-current'
if ($branchResult.ExitCode -ne 0) {
    Stop-Installer 'Unable to read the current Git branch.'
}

$currentBranch = $branchResult.Text.Trim()
if ($currentBranch -ne $ExpectedBranch) {
    Stop-Installer "Wrong branch. Expected '$ExpectedBranch', found '$currentBranch'."
}

$headResult = Invoke-CmdCapture -Command 'git rev-parse HEAD'
if ($headResult.ExitCode -ne 0) {
    Stop-Installer 'Unable to read the current Git commit.'
}

$currentCommit = $headResult.Text.Trim()
if ($currentCommit -ne $ExpectedCommit) {
    Write-Host "Expected commit: $ExpectedCommit" -ForegroundColor Yellow
    Write-Host "Current commit : $currentCommit" -ForegroundColor Yellow
    Stop-Installer 'This package is locked to the inspected source snapshot. No files were changed.'
}

Write-Step 'Checking target files and local changes'

foreach ($relative in $ExistingTargetFiles) {
    $path = Join-Path $ProjectRoot $relative.Replace('/', '\')
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        Stop-Installer "Required project file is missing: $relative"
    }
}

foreach ($relative in $NewTargetFiles) {
    $path = Join-Path $ProjectRoot $relative.Replace('/', '\')
    if (Test-Path -LiteralPath $path) {
        Stop-Installer "New target path already exists: $relative"
    }
}

$quotedTargets = ($TargetFiles | ForEach-Object { '"' + $_ + '"' }) -join ' '
$statusResult = Invoke-CmdCapture -Command ('git status --porcelain -- ' + $quotedTargets)

if ($statusResult.ExitCode -ne 0) {
    Stop-Installer 'Unable to inspect target-file Git status.'
}

if ($statusResult.Text.Trim()) {
    Write-Host $statusResult.Text -ForegroundColor Yellow
    Stop-Installer 'One or more target files already have local changes. Commit or stash only those target files, then retry.'
}

Write-Host "  branch : $ExpectedBranch" -ForegroundColor DarkGray
Write-Host "  commit : $ExpectedCommit" -ForegroundColor DarkGray
Write-Host '  targets: clean' -ForegroundColor DarkGray
Write-Host '  unrelated local and untracked files will be preserved' -ForegroundColor DarkGray

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupRoot = Join-Path $ProjectRoot ('.repair-backups\projects-workspace-v1-' + $timestamp)
$DiagnosticsRoot = Join-Path $BackupRoot '_diagnostics'
New-Item -ItemType Directory -Path $DiagnosticsRoot -Force | Out-Null

Write-Step "Creating backup: $BackupRoot"

foreach ($relative in $ExistingTargetFiles) {
    $relativeWindows = $relative.Replace('/', '\')
    $source = Join-Path $ProjectRoot $relativeWindows
    $destination = Join-Path $BackupRoot $relativeWindows
    $destinationDirectory = Split-Path -Parent $destination

    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
}

Write-Step 'Recording baseline TypeScript diagnostics'

$baselineTypecheckLog = Join-Path $DiagnosticsRoot 'baseline-typecheck.txt'
$baselineTypecheckExit = 0
Invoke-CmdLogged `
    -Command 'npm.cmd run typecheck 2>&1' `
    -LogPath $baselineTypecheckLog `
    -ExitCode ([ref]$baselineTypecheckExit)

if ($baselineTypecheckExit -ne 0) {
    Write-Host ''
    Write-Host 'The repository already contains TypeScript diagnostics.' -ForegroundColor Yellow
    Write-Host 'The installer will reject all new diagnostics and every diagnostic in a Project target file.' -ForegroundColor Yellow
    Write-Host "Baseline log: $baselineTypecheckLog" -ForegroundColor DarkGray
}

Write-Step 'Running baseline production build'

$baselineBuildLog = Join-Path $DiagnosticsRoot 'baseline-build.txt'
$baselineBuildExit = 0
Invoke-CmdLogged `
    -Command 'npm.cmd run build 2>&1' `
    -LogPath $baselineBuildLog `
    -ExitCode ([ref]$baselineBuildExit)

if ($baselineBuildExit -ne 0) {
    Stop-Installer "The project already fails to build before this repair. No source files were changed. See: $baselineBuildLog"
}

Write-Step 'Installing Project workspace V1 using full-file copies'

try {
    foreach ($relative in $TargetFiles) {
        Copy-PayloadFile -RelativePath $relative
    }
}
catch {
    Fail-And-Restore -Message $_.Exception.Message -BackupRoot $BackupRoot
}

Write-Step 'Verifying installed payload hashes'

try {
    $manifest = Get-Content -LiteralPath $PayloadManifestPath -Raw | ConvertFrom-Json
    foreach ($entry in $manifest.files) {
        $relative = [string]$entry.path
        $installed = Join-Path $ProjectRoot $relative.Replace('/', '\')
        $actualHash = (Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash.ToLowerInvariant()
        $expectedHash = ([string]$entry.sha256).ToLowerInvariant()

        if ($actualHash -ne $expectedHash) {
            throw "Installed file hash mismatch: $relative"
        }
    }
}
catch {
    Fail-And-Restore -Message $_.Exception.Message -BackupRoot $BackupRoot
}

Write-Step 'Running static Project workspace assertions'

$controllerPath = Join-Path $ProjectRoot 'app\Http\Controllers\DossierController.php'
$requestPath = Join-Path $ProjectRoot 'app\Http\Requests\UpdateDossierRequest.php'
$resourcePath = Join-Path $ProjectRoot 'app\Http\Resources\DossierResource.php'
$indexPath = Join-Path $ProjectRoot 'resources\js\pages\Dossiers\Index.tsx'
$showPath = Join-Path $ProjectRoot 'resources\js\pages\Dossiers\Show.tsx'
$tabsPath = Join-Path $ProjectRoot 'resources\js\components\ui\AppWorkspaceTabs.tsx'
$i18nPath = Join-Path $ProjectRoot 'resources\js\lib\i18n.ts'
$testPath = Join-Path $ProjectRoot 'tests\Feature\ProjectWorkspaceTest.php'

Assert-Contains -Path $controllerPath -Literal "->withCount(['documents', 'financeDocuments'])" -BackupRoot $BackupRoot
Assert-Contains -Path $controllerPath -Literal "'activity' => `$this->activityPayload(`$dossier)" -BackupRoot $BackupRoot
Assert-Contains -Path $controllerPath -Literal "'financeDocuments.payments'" -BackupRoot $BackupRoot
Assert-Contains -Path $controllerPath -Literal 'private function safeLocalPath(' -BackupRoot $BackupRoot
Assert-NotContains -Path $controllerPath -Literal 'financeRecords' -BackupRoot $BackupRoot
Assert-NotContains -Path $controllerPath -Literal 'authorization' -BackupRoot $BackupRoot
Assert-Contains -Path $requestPath -Literal "'city_id' => ['required', 'exists:cities,id']" -BackupRoot $BackupRoot
Assert-Contains -Path $requestPath -Literal "'return_to' =>" -BackupRoot $BackupRoot
Assert-Contains -Path $resourcePath -Literal "'financeDocumentsCount'" -BackupRoot $BackupRoot
Assert-NotContains -Path $resourcePath -Literal 'financeRecordsCount' -BackupRoot $BackupRoot
Assert-Contains -Path $indexPath -Literal 'AppWorkspaceTableColumn<DossierRow>' -BackupRoot $BackupRoot
Assert-Contains -Path $indexPath -Literal "const PAGE_SIZE = 10;" -BackupRoot $BackupRoot
Assert-Contains -Path $indexPath -Literal "const COLUMN_ORDER_KEY = 'archilbo.projects.table.columns.v1';" -BackupRoot $BackupRoot
Assert-Contains -Path $indexPath -Literal 'MenuTrigger' -BackupRoot $BackupRoot
Assert-Contains -Path $indexPath -Literal 'z-[100]' -BackupRoot $BackupRoot
Assert-NotContains -Path $indexPath -Literal '<table' -BackupRoot $BackupRoot
Assert-NotContains -Path $indexPath -Literal 'financeRecordsCount' -BackupRoot $BackupRoot
Assert-NotContains -Path $indexPath -Literal 'let comparison = 0;' -BackupRoot $BackupRoot
Assert-Contains -Path $showPath -Literal 'AppWorkspaceTabs' -BackupRoot $BackupRoot
Assert-Contains -Path $showPath -Literal "'project-design'" -BackupRoot $BackupRoot
Assert-Contains -Path $showPath -Literal "'activity'" -BackupRoot $BackupRoot
Assert-Contains -Path $showPath -Literal "'pd-editor-workspace-open'" -BackupRoot $BackupRoot
Assert-Contains -Path $showPath -Literal 'ActivityPanel' -BackupRoot $BackupRoot
Assert-Contains -Path $showPath -Literal 'invoiceDocuments.reduce((total, document) => total + document.paidTotal, 0)' -BackupRoot $BackupRoot
Assert-NotContains -Path $showPath -Literal 'financeRecords' -BackupRoot $BackupRoot
Assert-NotContains -Path $showPath -Literal '.replaceAll(' -BackupRoot $BackupRoot
Assert-Contains -Path $tabsPath -Literal "from 'react-aria-components'" -BackupRoot $BackupRoot
Assert-Contains -Path $tabsPath -Literal 'TabPanel' -BackupRoot $BackupRoot
Assert-Contains -Path $i18nPath -Literal "import { enProjects } from '@/locales/en/projects';" -BackupRoot $BackupRoot
Assert-Contains -Path $i18nPath -Literal "import { frProjects } from '@/locales/fr/projects';" -BackupRoot $BackupRoot
Assert-Contains -Path $testPath -Literal 'class ProjectWorkspaceTest' -BackupRoot $BackupRoot
Assert-Contains -Path $testPath -Literal 'test_project_show_tabs_receive_real_backend_data' -BackupRoot $BackupRoot
Assert-Contains -Path $testPath -Literal 'test_foreign_company_cannot_open_project_workspace' -BackupRoot $BackupRoot

foreach ($relative in $TargetFiles) {
    Assert-TextIntegrity `
        -Path (Join-Path $ProjectRoot $relative.Replace('/', '\')) `
        -BackupRoot $BackupRoot
}

Write-Step 'Checking PHP syntax'

$phpSyntaxLog = Join-Path $DiagnosticsRoot 'php-syntax.txt'
$phpSyntaxExit = 0
$phpSyntaxCommand = 'php -l app\Http\Controllers\DossierController.php && php -l app\Http\Requests\UpdateDossierRequest.php && php -l app\Http\Resources\DossierResource.php && php -l tests\Feature\ProjectWorkspaceTest.php 2>&1'
Invoke-CmdLogged `
    -Command $phpSyntaxCommand `
    -LogPath $phpSyntaxLog `
    -ExitCode ([ref]$phpSyntaxExit)

if ($phpSyntaxExit -ne 0) {
    Fail-And-Restore -Message "PHP syntax validation failed. See: $phpSyntaxLog" -BackupRoot $BackupRoot
}

Write-Step 'Clearing Laravel caches'

$cacheLog = Join-Path $DiagnosticsRoot 'optimize-clear.txt'
$cacheExit = 0
Invoke-CmdLogged `
    -Command 'php artisan optimize:clear 2>&1' `
    -LogPath $cacheLog `
    -ExitCode ([ref]$cacheExit)

if ($cacheExit -ne 0) {
    Fail-And-Restore -Message "Laravel cache clearing failed. See: $cacheLog" -BackupRoot $BackupRoot
}

Write-Step 'Running Project workspace backend regression tests'

$testLog = Join-Path $DiagnosticsRoot 'project-workspace-tests.txt'
$testExit = 0
Invoke-CmdLogged `
    -Command 'php artisan test --filter=ProjectWorkspaceTest 2>&1' `
    -LogPath $testLog `
    -ExitCode ([ref]$testExit)

if ($testExit -ne 0) {
    Fail-And-Restore -Message "Project workspace regression tests failed. See: $testLog" -BackupRoot $BackupRoot
}

Write-Step 'Running focused ESLint with zero warnings allowed'

$eslintPath = Join-Path $ProjectRoot 'node_modules\.bin\eslint.cmd'
$eslintLog = Join-Path $DiagnosticsRoot 'focused-eslint.txt'
$eslintExit = 0

if (-not (Test-Path -LiteralPath $eslintPath -PathType Leaf)) {
    Fail-And-Restore -Message 'node_modules\\.bin\\eslint.cmd was not found.' -BackupRoot $BackupRoot
}

$quotedTypeScriptTargets = ($TypeScriptTargetFiles | ForEach-Object { '"' + $_ + '"' }) -join ' '
$eslintCommand = 'call "node_modules\.bin\eslint.cmd" --max-warnings=0 ' + $quotedTypeScriptTargets + ' 2>&1'
Invoke-CmdLogged `
    -Command $eslintCommand `
    -LogPath $eslintLog `
    -ExitCode ([ref]$eslintExit)

if ($eslintExit -ne 0) {
    Fail-And-Restore -Message "Focused ESLint failed. See: $eslintLog" -BackupRoot $BackupRoot
}

Write-Step 'Running TypeScript regression validation'

$postTypecheckLog = Join-Path $DiagnosticsRoot 'post-typecheck.txt'
$postTypecheckExit = 0
$typecheckStatus = 'PASSED'
Invoke-CmdLogged `
    -Command 'npm.cmd run typecheck 2>&1' `
    -LogPath $postTypecheckLog `
    -ExitCode ([ref]$postTypecheckExit)

if ($baselineTypecheckExit -eq 0 -and $postTypecheckExit -ne 0) {
    Fail-And-Restore `
        -Message "TypeScript was clean before this repair but fails afterward. See: $postTypecheckLog" `
        -BackupRoot $BackupRoot
}

if ($baselineTypecheckExit -ne 0) {
    $baselineText = [System.IO.File]::ReadAllText($baselineTypecheckLog)
    $postText = [System.IO.File]::ReadAllText($postTypecheckLog)
    $baselineSignatures = @(Get-TypeScriptDiagnosticSignatures -Text $baselineText)
    $postSignatures = @(Get-TypeScriptDiagnosticSignatures -Text $postText)
    $newSignatures = @($postSignatures | Where-Object { $baselineSignatures -notcontains $_ })
    $targetDiagnostics = @(Get-TypeScriptTargetDiagnostics -Text $postText -TargetPaths $TypeScriptTargetFiles)
    $newDiagnosticsPath = Join-Path $DiagnosticsRoot 'new-typescript-diagnostics.txt'
    $targetDiagnosticsPath = Join-Path $DiagnosticsRoot 'target-typescript-diagnostics.txt'

    $newSignatures | Set-Content -LiteralPath $newDiagnosticsPath -Encoding UTF8
    $targetDiagnostics | Set-Content -LiteralPath $targetDiagnosticsPath -Encoding UTF8

    if ($targetDiagnostics.Count -gt 0) {
        Fail-And-Restore `
            -Message "TypeScript diagnostics remain in Project target files. See: $targetDiagnosticsPath" `
            -BackupRoot $BackupRoot
    }

    if ($newSignatures.Count -gt 0) {
        Fail-And-Restore `
            -Message "The repair introduced new TypeScript diagnostics. See: $newDiagnosticsPath" `
            -BackupRoot $BackupRoot
    }

    $typecheckStatus = 'KNOWN BASELINE DEBT - NO NEW ERRORS'
}

Write-Step 'Running production build'

$postBuildLog = Join-Path $DiagnosticsRoot 'post-build.txt'
$postBuildExit = 0
Invoke-CmdLogged `
    -Command 'npm.cmd run build 2>&1' `
    -LogPath $postBuildLog `
    -ExitCode ([ref]$postBuildExit)

if ($postBuildExit -ne 0) {
    Fail-And-Restore -Message "Production build failed. See: $postBuildLog" -BackupRoot $BackupRoot
}

Write-Step 'Checking Git diff integrity'

$diffCheckLog = Join-Path $DiagnosticsRoot 'git-diff-check.txt'
$diffCheckExit = 0
Invoke-CmdLogged `
    -Command ('git diff --check -- ' + $quotedTargets + ' 2>&1') `
    -LogPath $diffCheckLog `
    -ExitCode ([ref]$diffCheckExit)

if ($diffCheckExit -ne 0) {
    Fail-And-Restore -Message "git diff --check failed. See: $diffCheckLog" -BackupRoot $BackupRoot
}

$changedResult = Invoke-CmdCapture -Command ('git status --short -- ' + $quotedTargets)
$changedResult.Text | Set-Content -LiteralPath (Join-Path $DiagnosticsRoot 'changed-files.txt') -Encoding UTF8

$diffStatResult = Invoke-CmdCapture -Command ('git diff --stat -- ' + $quotedTargets)
$diffStatResult.Text | Set-Content -LiteralPath (Join-Path $DiagnosticsRoot 'diff-stat.txt') -Encoding UTF8

Write-Host ''
Write-Host 'PROJECTS WORKSPACE V1 APPLIED' -ForegroundColor Green
Write-Host "Backup     : $BackupRoot"
Write-Host "Diagnostics: $DiagnosticsRoot"
Write-Host ''
Write-Host 'Changed files:' -ForegroundColor Cyan
$changedResult.Lines | ForEach-Object { Write-Host ('  ' + $_) }
Write-Host ''
Write-Host 'Payload hashes    : PASSED' -ForegroundColor Green
Write-Host 'PHP syntax        : PASSED' -ForegroundColor Green
Write-Host 'Feature tests      : PASSED' -ForegroundColor Green
Write-Host 'Focused ESLint     : PASSED (0 warnings)' -ForegroundColor Green
Write-Host ('TypeScript         : ' + $typecheckStatus) -ForegroundColor Green
Write-Host 'Production build   : PASSED' -ForegroundColor Green
Write-Host 'Diff integrity     : PASSED' -ForegroundColor Green
Write-Host ''
Write-Host 'Manual QA: open /dossiers and one /dossiers/{id} workspace, then follow MANUAL_QA.md.'
Write-Host "Source commit: $ExpectedCommit"
Write-Host 'After manual QA, stage only the twelve listed target files.'
