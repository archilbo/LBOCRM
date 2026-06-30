cd "D:\ARCHI LBO\LBOSM\LBOCRM"

$ErrorActionPreference = "Stop"

Write-Host "STEP 53-Q-A: Finance monthly summary UI audit..." -ForegroundColor Cyan

function Show-FileWithLines($Path, $MaxLines = 900) {
    Write-Host ""
    Write-Host "===== $Path =====" -ForegroundColor Yellow

    if (-not (Test-Path $Path)) {
        Write-Host "MISSING: $Path" -ForegroundColor Red
        return
    }

    $i = 1
    Get-Content $Path -TotalCount $MaxLines | ForEach-Object {
        "{0,4} | {1}" -f $i, $_
        $i++
    }
}

Write-Host ""
Write-Host "===== FINANCE MONTHLY ROUTES =====" -ForegroundColor Yellow
php artisan route:list | Select-String -Pattern "finance|monthly|summary|payments|documents"

Write-Host ""
Write-Host "===== GIT STATUS =====" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "===== FINANCE MONTHLY BACKEND =====" -ForegroundColor Yellow
Show-FileWithLines "app/Services/Finance/FinanceMonthlySummaryService.php" 1000
Show-FileWithLines "app/Http/Controllers/Finance/FinanceDocumentController.php" 900
Show-FileWithLines "app/Http/Controllers/Finance/PaymentController.php" 700

Write-Host ""
Write-Host "===== FINANCE MONTHLY FRONTEND =====" -ForegroundColor Yellow
Show-FileWithLines "resources/js/features/finance/components/FinanceMonthlySummary.tsx" 1000
Show-FileWithLines "resources/js/pages/Finance/Documents/Index.tsx" 1000
Show-FileWithLines "resources/js/features/finance/FinanceTabs.tsx" 500
Show-FileWithLines "resources/js/features/finance/components/FinanceTabs.tsx" 500
Show-FileWithLines "resources/js/features/finance/types.ts" 900

Write-Host ""
Write-Host "===== SEARCH MONTHLY UI USAGE =====" -ForegroundColor Yellow
Get-ChildItem -Recurse resources/js -Include *.tsx,*.ts |
    Select-String -Pattern "FinanceMonthlySummary|monthlySummary|monthly|summary|paymentsByMonth|revenueByMonth" |
    Select-Object Path, LineNumber, Line |
    Format-List

Write-Host ""
Write-Host "===== BASELINE BUILD =====" -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "STEP 53-Q-A audit completed. Send final.txt." -ForegroundColor Green