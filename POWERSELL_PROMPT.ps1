Set-Location 'D:\ARCHI LBO\LBOSM\LBOCRM'

@'
[CmdletBinding()]
param(
    [string]$ProjectRoot = 'D:\ARCHI LBO\LBOSM\LBOCRM'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

function Write-Step {
    param([string]$Message)

    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Add-ProjectFile {
    param([string]$RelativePath)

    if ([string]::IsNullOrWhiteSpace($RelativePath)) {
        return
    }

    $normalized = $RelativePath.Replace('/', '\').TrimStart('\')
    $fullPath = Join-Path $ProjectRoot $normalized

    if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
        $script:CollectedFiles[$normalized] = $true
    }
}

function Copy-ProjectFile {
    param(
        [string]$RelativePath,
        [string]$DestinationRoot
    )

    $sourcePath = Join-Path $ProjectRoot $RelativePath
    $destinationPath = Join-Path $DestinationRoot $RelativePath
    $destinationDirectory = Split-Path -Parent $destinationPath

    New-Item `
        -ItemType Directory `
        -Path $destinationDirectory `
        -Force | Out-Null

    Copy-Item `
        -LiteralPath $sourcePath `
        -Destination $destinationPath `
        -Force
}

function Invoke-Captured {
    param(
        [string]$Title,
        [scriptblock]$Command,
        [string]$OutputPath
    )

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'

    try {
        $result = @(& $Command 2>&1)
        $exitCode = $LASTEXITCODE

        @(
            "COMMAND: $Title"
            "DATE: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            "EXIT CODE: $exitCode"
            ''
            $result
        ) | Set-Content -LiteralPath $OutputPath -Encoding UTF8

        return $exitCode
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
}

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    throw "Project directory not found: $ProjectRoot"
}

Set-Location -LiteralPath $ProjectRoot

if (-not (Test-Path -LiteralPath '.git' -PathType Container)) {
    throw "Git repository not found: $ProjectRoot"
}

if (-not (Test-Path -LiteralPath 'artisan' -PathType Leaf)) {
    throw "Laravel artisan file not found: $ProjectRoot\artisan"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$auditRoot = Join-Path $ProjectRoot (
    '_projects-v2-security-baseline-audit-' + $timestamp
)

$sourceRoot = Join-Path $auditRoot 'source'
$diagnosticsRoot = Join-Path $auditRoot 'diagnostics'

$zipPath = Join-Path $ProjectRoot (
    'PROJECTS_V2_SECURITY_BASELINE_AUDIT_' + $timestamp + '.zip'
)

New-Item -ItemType Directory -Path $sourceRoot -Force | Out-Null
New-Item -ItemType Directory -Path $diagnosticsRoot -Force | Out-Null

$CollectedFiles = @{}

Write-Step 'Collecting known security and routing files'

$knownFiles = @(
    'tests\Feature\ClientSecurityHardeningTest.php'
    'tests\TestCase.php'
    'routes\web.php'
    'routes\api.php'
    'bootstrap\app.php'
    'app\Http\Middleware\EnsureRoutePermission.php'
    'app\Http\Controllers\GlobalSearchController.php'
    'app\Services\CompanyContext.php'
    'app\Models\User.php'
    'composer.json'
    'phpunit.xml'
)

foreach ($file in $knownFiles) {
    Add-ProjectFile -RelativePath $file
}

Write-Step 'Finding global-search and permission references'

$searchPatterns = @(
    'global-search|global_search|GlobalSearch|EnsureRoutePermission'
    'global\.search|search\.view|clients\.view|client\.view|view_clients'
)

$searchRoots = @(
    'app'
    'routes'
    'tests'
    'config'
    'database'
    'bootstrap'
)

$searchReport = New-Object 'System.Collections.Generic.List[string]'

foreach ($pattern in $searchPatterns) {
    $matches = @(
        & git grep `
            -n `
            -I `
            -E `
            $pattern `
            -- `
            $searchRoots 2>$null
    )

    $searchReport.Add("PATTERN: $pattern")

    if ($matches.Count -eq 0) {
        $searchReport.Add('  No matches')
    }
    else {
        foreach ($match in $matches) {
            $searchReport.Add([string]$match)

            if ([string]$match -match '^(.+?):\d+:') {
                Add-ProjectFile -RelativePath $Matches[1]
            }
        }
    }

    $searchReport.Add('')
}

$searchReport | Set-Content `
    -LiteralPath (Join-Path $diagnosticsRoot 'code-search.txt') `
    -Encoding UTF8

Write-Step 'Copying relevant source files'

$relativeFiles = @(
    $CollectedFiles.Keys |
    Sort-Object
)

foreach ($relativeFile in $relativeFiles) {
    Copy-ProjectFile `
        -RelativePath $relativeFile `
        -DestinationRoot $sourceRoot

    Write-Host "    $relativeFile"
}

Write-Step 'Recording Git state'

@(
    '=== CURRENT BRANCH ==='
    (& git branch --show-current)
    ''
    '=== CURRENT COMMIT ==='
    (& git rev-parse HEAD)
    ''
    '=== REMOTES ==='
    (& git remote -v)
    ''
    '=== STATUS ==='
    (& git status --short)
    ''
    '=== LAST FIVE COMMITS ==='
    (& git log -5 --oneline --decorate)
) | Set-Content `
    -LiteralPath (Join-Path $diagnosticsRoot 'git-state.txt') `
    -Encoding UTF8

if ($relativeFiles.Count -gt 0) {
    @(
        '=== UNSTAGED DIFF FOR COLLECTED FILES ==='
        (& git diff -- $relativeFiles)
        ''
        '=== STAGED DIFF FOR COLLECTED FILES ==='
        (& git diff --cached -- $relativeFiles)
    ) | Set-Content `
        -LiteralPath (Join-Path $diagnosticsRoot 'relevant-git-diff.patch') `
        -Encoding UTF8
}

Write-Step 'Recording global-search routes'

Invoke-Captured `
    -Title 'php artisan route:list --name=global-search' `
    -Command {
        & php artisan route:list --name=global-search
    } `
    -OutputPath (
        Join-Path $diagnosticsRoot 'route-list-global-search.txt'
    ) | Out-Null

Invoke-Captured `
    -Title 'php artisan route:list --path=global-search' `
    -Command {
        & php artisan route:list --path=global-search
    } `
    -OutputPath (
        Join-Path $diagnosticsRoot 'route-list-global-search-path.txt'
    ) | Out-Null

Write-Step 'Reproducing ClientSecurityHardeningTest'

$testExitCode = Invoke-Captured `
    -Title (
        'php artisan test ' +
        'tests/Feature/ClientSecurityHardeningTest.php ' +
        '--stop-on-failure'
    ) `
    -Command {
        & php artisan test `
            tests/Feature/ClientSecurityHardeningTest.php `
            --stop-on-failure
    } `
    -OutputPath (
        Join-Path $diagnosticsRoot 'client-security-test.txt'
    )

Write-Host "    Test exit code: $testExitCode"

Write-Step 'Creating copied-file integrity manifest'

$manifestEntries = @()

foreach ($relativeFile in $relativeFiles) {
    $fullPath = Join-Path $ProjectRoot $relativeFile
    $item = Get-Item -LiteralPath $fullPath
    $hash = Get-FileHash -LiteralPath $fullPath -Algorithm SHA256

    $manifestEntries += [PSCustomObject]@{
        path   = $relativeFile.Replace('\', '/')
        bytes  = [Int64]$item.Length
        sha256 = $hash.Hash.ToLowerInvariant()
    }
}

$manifest = [PSCustomObject]@{
    generated_at = (Get-Date).ToString('o')
    project_root = $ProjectRoot
    branch = (& git branch --show-current).Trim()
    commit = (& git rev-parse HEAD).Trim()
    failing_test_exit_code = $testExitCode
    files = $manifestEntries
}

$manifest |
    ConvertTo-Json -Depth 8 |
    Set-Content `
        -LiteralPath (Join-Path $auditRoot 'MANIFEST.json') `
        -Encoding UTF8

Write-Step 'Creating audit ZIP'

if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive `
    -Path (Join-Path $auditRoot '*') `
    -DestinationPath $zipPath `
    -CompressionLevel Optimal

$zipHash = Get-FileHash `
    -LiteralPath $zipPath `
    -Algorithm SHA256

Write-Host ''
Write-Host 'PROJECTS V2 SECURITY BASELINE AUDIT CREATED' `
    -ForegroundColor Green

Write-Host "ZIP   : $zipPath"
Write-Host "SHA256: $($zipHash.Hash)"
Write-Host "Files : $($relativeFiles.Count)"
Write-Host "Test exit code: $testExitCode"

Write-Host ''
Write-Host (
    'No Laravel application source files were modified.'
) -ForegroundColor DarkGray
'@ | Set-Content `
    -LiteralPath '.\collect-projects-v2-security-baseline.ps1' `
    -Encoding UTF8

PowerShell.exe `
    -NoProfile `
    -ExecutionPolicy Bypass `
    -File '.\collect-projects-v2-security-baseline.ps1'