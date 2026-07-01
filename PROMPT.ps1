$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectPath = "D:\ARCHI LBO\LBOSM\LBOCRM"
Set-Location $ProjectPath

$OutDir = ".ai-context"
$MainFile = "$OutDir\REALTIME_CHAT_CONTEXT.md"
$MaxPartChars = 18000

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$Builder = New-Object System.Text.StringBuilder

function Add-Text($Text) { [void]$Builder.AppendLine([string]$Text) }

function Add-CommandOutput($Title, $Command) {
    Add-Text "`n# $Title`n"
    Add-Text "``````text"
    try { Add-Text (Invoke-Expression $Command 2>&1 | Out-String) }
    catch { Add-Text "ERROR: $($_.Exception.Message)" }
    Add-Text "``````"
}

function Add-File($Path) {
    if (-not (Test-Path $Path)) { return }
    $item = Get-Item $Path
    if ($item.Length -gt 250KB) {
        Add-Text "`n# FILE SKIPPED: $Path - too large"
        return
    }

    Add-Text "`n# FILE: $Path`n"
    Add-Text "``````$($item.Extension.TrimStart('.'))"
    try {
        Add-Text ([System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8))
    } catch {
        Add-Text (Get-Content $Path -Raw)
    }
    Add-Text "``````"
}

Add-Text "# ARCHI LBO OS Realtime Chat Context"
Add-Text "Generated: $(Get-Date)"

Add-CommandOutput "Git Status" "git status --short"
Add-CommandOutput "Inbox/Broadcast Routes" "php artisan route:list | Select-String -Pattern 'inbox|message|conversation|broadcast|channel|reverb'"
Add-CommandOutput "Composer Realtime Packages" "composer show | Select-String -Pattern 'reverb|pusher|broadcast|queue'"
Add-CommandOutput "NPM Realtime Packages" "npm ls laravel-echo pusher-js socket.io-client --depth=0"
Add-CommandOutput "Broadcast Config Files Found" "Get-ChildItem config,routes,app,resources/js -Recurse -File | Where-Object { $_.Name -match 'broadcast|channel|echo|reverb|MessageSent|Typing|Conversation' } | Select-Object FullName"
Add-CommandOutput "Realtime Text Search" "Get-ChildItem app,routes,resources/js,config,bootstrap -Recurse -File | Where-Object { $_.FullName -notmatch '\\vendor\\|\\node_modules\\|\\storage\\|\\public\\build\\' } | Select-String -Pattern 'Echo|Reverb|Pusher|broadcast|ShouldBroadcast|PrivateChannel|PresenceChannel|whisper|typing|MessageSent|conversation\\.' | Select-Object Path,LineNumber,Line"

$files = @(
    "composer.json",
    "package.json",
    "vite.config.ts",
    "bootstrap/app.php",
    "config/broadcasting.php",
    "config/reverb.php",
    "routes/channels.php",
    "routes/web.php",
    "resources/js/app.tsx",
    "resources/js/bootstrap.ts",
    "resources/js/bootstrap.js",
    "resources/js/echo.ts",
    "resources/js/lib/echo.ts",
    "resources/js/components/layout/AppTopbar.tsx",
    "resources/js/pages/Inbox/Index.tsx",
    "resources/js/features/inbox/components/ConversationList.tsx",
    "resources/js/features/inbox/components/MessageThread.tsx",
    "resources/js/features/chat/types.ts",
    "app/Http/Controllers/ConversationController.php",
    "app/Http/Controllers/MessageController.php",
    "app/Http/Resources/ConversationResource.php",
    "app/Http/Resources/MessageResource.php",
    "app/Services/Chat/ChatService.php",
    "app/Models/Conversation.php",
    "app/Models/Message.php",
    "app/Models/MessageAttachment.php",
    "app/Notifications/ChatMessageNotification.php",
    "app/Events/MessageSent.php",
    "app/Events/MessageTyping.php"
)

foreach ($file in $files) { Add-File $file }

Add-Text "`n# Safe .env realtime keys only`n"
Add-Text "``````text"
$envKeys = @(
    "BROADCAST_CONNECTION",
    "BROADCAST_DRIVER",
    "QUEUE_CONNECTION",
    "REVERB_APP_ID",
    "REVERB_HOST",
    "REVERB_PORT",
    "REVERB_SCHEME",
    "VITE_REVERB_HOST",
    "VITE_REVERB_PORT",
    "VITE_REVERB_SCHEME",
    "VITE_REVERB_APP_KEY",
    "PUSHER_HOST",
    "PUSHER_PORT",
    "PUSHER_SCHEME",
    "VITE_PUSHER_HOST",
    "VITE_PUSHER_PORT",
    "VITE_PUSHER_SCHEME",
    "VITE_PUSHER_APP_KEY"
)
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    foreach ($key in $envKeys) {
        $line = $envContent | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
        if ($line) {
            if ($line -match "KEY|SECRET") {
                Add-Text "$key=***masked***"
            } else {
                Add-Text $line
            }
        }
    }
}
Add-Text "``````"

$fullPath = Join-Path (Get-Location) $MainFile
[System.IO.File]::WriteAllText($fullPath, $Builder.ToString(), [System.Text.Encoding]::UTF8)

$content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
$part = 1
for ($i = 0; $i -lt $content.Length; $i += $MaxPartChars) {
    $length = [Math]::Min($MaxPartChars, $content.Length - $i)
    $partFile = "$OutDir\REALTIME_CHAT_CONTEXT_PART_$part.md"
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $partFile), $content.Substring($i, $length), [System.Text.Encoding]::UTF8)
    $part++
}

Write-Host "`nDONE" -ForegroundColor Green
Get-ChildItem $OutDir -Filter "REALTIME_CHAT_CONTEXT_PART_*.md" | Select-Object Name,Length | Format-Table -AutoSize