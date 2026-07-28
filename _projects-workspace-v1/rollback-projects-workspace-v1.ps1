[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupRoot,
    [string]$ProjectRoot = 'D:\ARCHI LBO\LBOSM\LBOCRM'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

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

if (-not (Test-Path -LiteralPath $BackupRoot -PathType Container)) {
    throw "Backup folder not found: $BackupRoot"
}

foreach ($relative in $ExistingTargetFiles) {
    $relativeWindows = $relative.Replace('/', '\')
    $source = Join-Path $BackupRoot $relativeWindows
    $destination = Join-Path $ProjectRoot $relativeWindows

    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
        throw "Backup file missing: $source"
    }

    Copy-Item -LiteralPath $source -Destination $destination -Force
    Write-Host "restored $relative"
}

foreach ($relative in $NewTargetFiles) {
    $destination = Join-Path $ProjectRoot $relative.Replace('/', '\')

    if (Test-Path -LiteralPath $destination -PathType Leaf) {
        Remove-Item -LiteralPath $destination -Force
        Write-Host "removed $relative"
    }
}

Write-Host ''
Write-Host 'Project workspace V1 files restored.' -ForegroundColor Green
