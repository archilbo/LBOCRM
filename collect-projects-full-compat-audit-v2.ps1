[CmdletBinding()]
param(
    [string]$ProjectRoot = 'D:\ARCHI LBO\LBOSM\LBOCRM'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

Set-Location -LiteralPath $ProjectRoot

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$auditName = "_projects-full-compat-audit-$stamp"
$auditRoot = Join-Path $ProjectRoot $auditName
$auditZip = "$auditRoot.zip"

New-Item -ItemType Directory -Path $auditRoot -Force | Out-Null

$targetFiles = @(
    'app/Http/Controllers/DossierController.php'
    'app/Http/Requests/UpdateDossierRequest.php'
    'app/Http/Resources/DossierResource.php'
    'resources/js/components/ui/AppWorkspaceTabs.tsx'
    'resources/js/features/dossiers/projectPayload.ts'
    'resources/js/features/dossiers/types.ts'
    'resources/js/lib/i18n.ts'
    'resources/js/locales/en/projects.ts'
    'resources/js/locales/fr/projects.ts'
    'resources/js/pages/Dossiers/Index.tsx'
    'resources/js/pages/Dossiers/Show.tsx'
    'tests/Feature/ProjectWorkspaceTest.php'
)

$supportFiles = @(
    'resources/js/features/finance/components/FinanceTabs.tsx'
    'resources/js/pages/Intermediaries/Show.tsx'
    'resources/js/components/ui/AppWorkspaceTable.tsx'
    'routes/web.php'
    'package.json'
    'tsconfig.json'
)

$allFiles = @($targetFiles + $supportFiles | Sort-Object -Unique)

function Copy-RelativeFile {
    param([string]$RelativePath)

    $source = Join-Path $ProjectRoot $RelativePath

    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        return
    }

    $destination = Join-Path $auditRoot ('local\' + $RelativePath)
    $destinationDirectory = Split-Path -Parent $destination

    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
}

foreach ($relative in $allFiles) {
    Copy-RelativeFile -RelativePath $relative
}

# Include all current models and focused factories so backend relationships and tests
# can be validated without requiring another collector pass.
foreach ($directory in @('app\Models', 'database\factories')) {
    $sourceDirectory = Join-Path $ProjectRoot $directory

    if (Test-Path -LiteralPath $sourceDirectory -PathType Container) {
        $destinationDirectory = Join-Path $auditRoot ('local\' + $directory)
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null

        Get-ChildItem -LiteralPath $sourceDirectory -File -Recurse |
            ForEach-Object {
                $relativeChild = $_.FullName.Substring($sourceDirectory.Length).TrimStart('\')
                $destination = Join-Path $destinationDirectory $relativeChild
                New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
                Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
            }
    }
}

@(
    "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    "ProjectRoot: $ProjectRoot"
    "Branch: $(git branch --show-current)"
    "Commit: $(git rev-parse HEAD)"
) | Set-Content -LiteralPath (Join-Path $auditRoot 'GIT_INFO.txt') -Encoding UTF8

git status --short |
    Set-Content -LiteralPath (Join-Path $auditRoot 'GIT_STATUS.txt') -Encoding UTF8

git status --short -- @targetFiles |
    Set-Content -LiteralPath (Join-Path $auditRoot 'TARGET_STATUS.txt') -Encoding UTF8

git diff --no-ext-diff -- @targetFiles |
    Set-Content -LiteralPath (Join-Path $auditRoot 'TARGET_DIFF.txt') -Encoding UTF8

git diff --cached --no-ext-diff -- @targetFiles |
    Set-Content -LiteralPath (Join-Path $auditRoot 'TARGET_STAGED_DIFF.txt') -Encoding UTF8

git diff --stat -- @targetFiles |
    Set-Content -LiteralPath (Join-Path $auditRoot 'TARGET_DIFF_STAT.txt') -Encoding UTF8

git log -5 --oneline --decorate |
    Set-Content -LiteralPath (Join-Path $auditRoot 'RECENT_COMMITS.txt') -Encoding UTF8

$hashRows = foreach ($relative in $allFiles) {
    $source = Join-Path $ProjectRoot $relative

    if (Test-Path -LiteralPath $source -PathType Leaf) {
        $hash = Get-FileHash -LiteralPath $source -Algorithm SHA256

        [PSCustomObject]@{
            Path = $relative
            State = if ((git ls-files --error-unmatch -- $relative 2>$null)) { 'tracked' } else { 'untracked' }
            Bytes = (Get-Item -LiteralPath $source).Length
            SHA256 = $hash.Hash.ToLowerInvariant()
        }
    }
    else {
        [PSCustomObject]@{
            Path = $relative
            State = 'missing'
            Bytes = 0
            SHA256 = ''
        }
    }
}

$hashRows |
    Export-Csv -LiteralPath (Join-Path $auditRoot 'FILE_INVENTORY.csv') -NoTypeInformation -Encoding UTF8

# Record the committed HEAD versions of tracked target files separately.
foreach ($relative in $targetFiles) {
    git cat-file -e "HEAD:$relative" 2>$null

    if ($LASTEXITCODE -ne 0) {
        continue
    }

    $destination = Join-Path $auditRoot ('head\' + $relative)
    New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null

    $gitPath = $relative.Replace('\', '/')
    $content = git show "HEAD:$gitPath"
    $content | Set-Content -LiteralPath $destination -Encoding UTF8
}

Compress-Archive `
    -Path (Join-Path $auditRoot '*') `
    -DestinationPath $auditZip `
    -CompressionLevel Optimal `
    -Force

Write-Host ''
Write-Host 'Full Projects compatibility audit created:' -ForegroundColor Green
Write-Host $auditZip -ForegroundColor Cyan
Write-Host ''
Write-Host 'This collector is read-only. It did not modify project source files.' -ForegroundColor DarkGray
