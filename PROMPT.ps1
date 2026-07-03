cd "D:\ARCHI LBO\LBOSM\LBOCRM"

$OutDir = ".ai-context"
$OutFile = "$OutDir\FRONTEND_REBUILD_REVIEW_CONTEXT.md"

New-Item -ItemType Directory -Force $OutDir | Out-Null
Set-Content -Path $OutFile -Value "# FRONTEND REBUILD REVIEW CONTEXT`nGenerated: $(Get-Date)`n" -Encoding UTF8

function Add-Section($Title) {
    Add-Content -Path $OutFile -Value "`n`n# $Title`n" -Encoding UTF8
}

function Add-CodeBlock($Title, $Content) {
    Add-Content -Path $OutFile -Value "`n`n## $Title`n``````" -Encoding UTF8
    Add-Content -Path $OutFile -Value $Content -Encoding UTF8
    Add-Content -Path $OutFile -Value "``````" -Encoding UTF8
}

function Add-File($Path) {
    Add-Content -Path $OutFile -Value "`n`n## FILE: $Path`n``````" -Encoding UTF8
    if (Test-Path $Path) {
        Get-Content $Path -Raw | Add-Content -Path $OutFile -Encoding UTF8
    } else {
        Add-Content -Path $OutFile -Value "MISSING" -Encoding UTF8
    }
    Add-Content -Path $OutFile -Value "``````" -Encoding UTF8
}

Add-Section "GIT STATUS"
$gitStatus = git status --short 2>&1 | Out-String
Add-CodeBlock "git status --short" $gitStatus

Add-Section "PACKAGE / CONFIG"
Add-File "package.json"
Add-File "vite.config.ts"
Add-File "vite.config.js"
Add-File "tailwind.config.ts"
Add-File "tailwind.config.js"
Add-File "postcss.config.js"
Add-File "tsconfig.json"

Add-Section "APP ENTRY / GLOBAL STYLES"
Add-File "resources\js\app.tsx"
Add-File "resources\js\bootstrap.ts"
Add-File "resources\css\app.css"
Add-File "resources\css\archilbo-theme.css"
Add-File "resources\views\app.blade.php"

Add-Section "NEW FRONTEND FOUNDATION"
$FoundationFiles = @(
    "resources\js\providers\AppProviders.tsx",
    "resources\js\providers\HeroProvider.tsx",
    "resources\js\providers\ThemeProvider.tsx",
    "resources\js\layouts\AppShell.tsx",
    "resources\js\components\layout\AppShell.tsx",
    "resources\js\components\layout\AppSidebar.tsx",
    "resources\js\components\layout\AppTopbar.tsx",
    "resources\js\components\layout\BottomNav.tsx",
    "resources\js\components\layout\PageHeader.tsx",
    "resources\js\components\layout\PageToolbar.tsx",
    "resources\js\config\navigation.ts",
    "resources\js\config\theme.ts",
    "resources\js\config\statuses.ts",
    "resources\js\lib\cn.ts"
)

foreach ($file in $FoundationFiles) {
    Add-File $file
}

Add-Section "SHARED UI COMPONENTS"
$SharedDirs = @(
    "resources\js\components\ui",
    "resources\js\components\data",
    "resources\js\components\forms",
    "resources\js\components\crm"
)

foreach ($dir in $SharedDirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem $dir -Recurse -File -Include *.tsx,*.ts -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Add-File $file.FullName.Replace((Get-Location).Path + "\", "")
        }
    } else {
        Add-CodeBlock "DIR: $dir" "MISSING"
    }
}

Add-Section "KEY PAGES"
$PageFiles = @(
    "resources\js\pages\Projects\Index.tsx",
    "resources\js\pages\Tasks\Index.tsx",
    "resources\js\pages\Inbox\Index.tsx",
    "resources\js\pages\Clients\Index.tsx",
    "resources\js\pages\Documents\Index.tsx",
    "resources\js\pages\Contracts\Index.tsx",
    "resources\js\pages\Finance\Index.tsx",
    "resources\js\pages\Users\Index.tsx"
)

foreach ($file in $PageFiles) {
    Add-File $file
}

Add-Section "FEATURE COMPONENTS"
$FeatureDirs = @(
    "resources\js\features\projects",
    "resources\js\features\tasks",
    "resources\js\features\inbox",
    "resources\js\features\finance",
    "resources\js\features\documents",
    "resources\js\features\contracts"
)

foreach ($dir in $FeatureDirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem $dir -Recurse -File -Include *.tsx,*.ts -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            Add-File $file.FullName.Replace((Get-Location).Path + "\", "")
        }
    } else {
        Add-CodeBlock "DIR: $dir" "MISSING"
    }
}

Add-Section "SEARCH IMPORTANT PATTERNS"
$Patterns = @(
    "HeroUIProvider",
    "@heroui/react",
    "DataTable",
    "PageHeader",
    "PageToolbar",
    "StatusPill",
    "AppShell",
    "AppSidebar",
    "BottomNav",
    "router.post",
    "router.put",
    "router.delete",
    "fetch(",
    "route(",
    "console.debug",
    "TODO",
    "fake",
    "mock",
    "dummy",
    "Lorem"
)

$SearchRoots = @("resources\js", "resources\css")

foreach ($pattern in $Patterns) {
    Add-CodeBlock "Search: $pattern" (
        Get-ChildItem $SearchRoots -Recurse -File -Include *.tsx,*.ts,*.css -ErrorAction SilentlyContinue |
            Select-String -Pattern $pattern -SimpleMatch -ErrorAction SilentlyContinue |
            ForEach-Object { "$($_.Path.Replace((Get-Location).Path + '\', '')):$($_.LineNumber): $($_.Line.Trim())" } |
            Out-String
    )
}

Add-Section "BUILD CHECK"
Add-CodeBlock "npm run build note" "Run this separately and paste errors if it fails: npm run build"

Write-Host "DONE: $OutFile"
Write-Host "Now run:"
Write-Host "Get-Content `"$OutFile`" -Raw | Set-Clipboard"