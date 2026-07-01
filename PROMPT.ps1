cd "D:\ARCHI LBO\LBOSM\LBOCRM"

$ErrorActionPreference = "Stop"

$out = ".\tasks_improve_audit.txt"
$sb = New-Object System.Text.StringBuilder

function Add-Line($Text = "") {
    [void]$script:sb.AppendLine([string]$Text)
}

function Add-Section($Title) {
    Add-Line ""
    Add-Line "===== $Title ====="
    Add-Line ""
}

function Add-CommandOutput($Title, $ScriptBlock) {
    Add-Section $Title
    try {
        $result = & $ScriptBlock 2>&1 | Out-String -Width 260
        Add-Line $result
    } catch {
        Add-Line "ERROR: $($_.Exception.Message)"
    }
}

function Add-File($Path, $MaxLines = 1600) {
    Add-Section $Path

    if (-not (Test-Path $Path)) {
        Add-Line "MISSING: $Path"
        return
    }

    try {
        $i = 1
        Get-Content $Path -TotalCount $MaxLines | ForEach-Object {
            Add-Line ("{0,4} | {1}" -f $i, $_)
            $i++
        }
    } catch {
        Add-Line "ERROR READING FILE: $($_.Exception.Message)"
    }
}

Add-Section "TASKS IMPROVEMENT AUDIT"
Add-Line "Generated: $(Get-Date)"
Add-Line "Project: D:\ARCHI LBO\LBOSM\LBOCRM"

Add-CommandOutput "GIT STATUS" { git status --short }

Add-CommandOutput "TASK ROUTES" {
    php artisan route:list | Select-String -Pattern "tasks|task-requests|workload|operations|inbox|notifications"
}

Add-CommandOutput "PACKAGE DND / UI LIBRARIES" {
    Get-Content .\package.json | Select-String -Pattern "dnd|drag|sortable|beautiful|fullcalendar|react-aria|lucide"
}

Add-CommandOutput "SEARCH TASK UI KEYWORDS" {
    Get-ChildItem -Recurse resources/js -Include *.tsx,*.ts |
        Select-String -Pattern "drag|drop|draggable|onDrop|onDrag|is_note|commentsCount|attachmentsCount|suggestion|Suggestion|bulk|selected|localStorage|TaskCard|TaskBoard|TaskDetailDrawer" |
        Select-Object Path, LineNumber, Line |
        Format-List
}

Add-CommandOutput "SEARCH TASK BACKEND KEYWORDS" {
    Get-ChildItem -Recurse app,routes,database -Include *.php |
        Select-String -Pattern "is_note|comments_count|attachments_count|TaskSuggestion|suggestions|bulk|TaskResource|TaskMutationService|TaskActivityService|TaskNotificationService" |
        Select-Object Path, LineNumber, Line |
        Format-List
}

Add-File "routes/web.php" 1600
Add-File "package.json" 600
Add-File "config/archilbo_operations.php" 1000

Add-File "app/Models/Task.php" 1400
Add-File "app/Models/TaskComment.php" 800
Add-File "app/Models/TaskAttachment.php" 800
Add-File "app/Models/TaskSuggestion.php" 800
Add-File "app/Http/Controllers/TaskController.php" 1800
Add-File "app/Http/Controllers/TaskCommentController.php" 1200
Add-File "app/Http/Controllers/TaskChecklistController.php" 1200
Add-File "app/Http/Controllers/TaskAttachmentController.php" 1200
Add-File "app/Http/Controllers/TaskSuggestionController.php" 1200
Add-File "app/Http/Resources/TaskResource.php" 1600
Add-File "app/Http/Resources/TaskCommentResource.php" 1000
Add-File "app/Http/Resources/TaskAttachmentResource.php" 1000
Add-File "app/Http/Resources/TaskSuggestionResource.php" 1000
Add-File "app/Http/Requests/Task/StoreTaskRequest.php" 1000
Add-File "app/Http/Requests/Task/UpdateTaskRequest.php" 1000
Add-File "app/Policies/TaskPolicy.php" 1200

Add-Section "TASK SERVICES"
Get-ChildItem -Recurse app/Services/Task -Include *.php |
    ForEach-Object {
        $relative = $_.FullName.Replace((Get-Location).Path + "\", "")
        Add-File $relative 1400
    }

Add-Section "TASK FRONTEND PAGES"
Add-File "resources/js/pages/Tasks/Index.tsx" 2200
Add-File "resources/js/pages/TaskRequests/Index.tsx" 1400
Add-File "resources/js/pages/Workload/Index.tsx" 1400
Add-File "resources/js/pages/Operations/Reports.tsx" 1400

Add-Section "TASK FRONTEND COMPONENTS"
Add-File "resources/js/features/tasks/types.ts" 1600
Add-File "resources/js/features/tasks/components/TaskBoard.tsx" 1800
Add-File "resources/js/features/tasks/components/TaskCard.tsx" 1800
Add-File "resources/js/features/tasks/components/TaskDetailDrawer.tsx" 2400
Add-File "resources/js/features/tasks/components/TaskCreateDrawer.tsx" 1800
Add-File "resources/js/features/tasks/components/TaskFilters.tsx" 1400
Add-File "resources/js/features/tasks/components/TaskList.tsx" 1800
Add-File "resources/js/features/tasks/components/TaskCalendar.tsx" 1600
Add-File "resources/js/features/tasks/components/TaskRequestCreateDrawer.tsx" 1600

Add-Section "LAYOUT / THEME"
Add-File "resources/js/lib/appRoutes.ts" 1200
Add-File "resources/js/components/layout/navigation.ts" 1000
Add-File "resources/js/components/layout/AppTopbar.tsx" 1000
Add-File "resources/js/locales/en.ts" 1400
Add-File "resources/css/app.css" 2000
Add-File "resources/css/archilbo-theme.css" 1400

Add-CommandOutput "BASELINE BUILD" { npm run build }
Add-CommandOutput "CACHE CLEAR" { php artisan optimize:clear }

Add-CommandOutput "TASK QA COMMAND" {
    php artisan app:qa-tasks-chat
}

Add-Section "DONE"
Add-Line "Send this file content: tasks_improve_audit.txt"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $out), $sb.ToString(), $utf8NoBom)

Write-Host "DONE. Report written to: tasks_improve_audit.txt" -ForegroundColor Green