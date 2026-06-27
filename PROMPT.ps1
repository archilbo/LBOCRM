cd "D:\ARCHI LBO\LBOSM\LBOCRM"

Write-Host "=== STEP 50 PRE-CONTINUE FULL QA ===" -ForegroundColor Cyan

Write-Host "`n=== 1) PHP SYNTAX CHECK IMPORTANT FILES ===" -ForegroundColor Cyan
php -l app/Services/Finance/FinanceDocumentNumberingService.php
php -l app/Services/Finance/FinanceDocumentLockGuard.php
php -l app/Services/Finance/FinanceLockedDocumentNumberResolver.php
php -l app/Services/Finance/FinanceExportNumberPayloadBuilder.php
php -l app/Http/Controllers/Finance/FinanceDocumentController.php
php -l app/Http/Resources/FinanceDocumentResource.php
php -l app/Models/Contract.php
php -l app/Models/CompanySetting.php

Write-Host "`n=== 2) CLEAR CACHE + AUTOLOAD ===" -ForegroundColor Cyan
php artisan optimize:clear
composer dump-autoload

Write-Host "`n=== 3) RUN ALL ARCHILBO QA COMMANDS ===" -ForegroundColor Cyan
php artisan archilbo:contract-forfait-calculation-qa
php artisan archilbo:finance-numbering-qa
php artisan archilbo:finance-export-numbering-qa
php artisan archilbo:finance-numbering-lock-qa
php artisan archilbo:finance-document-lock-guard-qa
php artisan archilbo:finance-real-export-numbering-integration-qa
php artisan archilbo:finance-ui-lock-payload-qa
php artisan archilbo:finance-export-qa
php artisan archilbo:test-finance-builder
php artisan archilbo:test-finance-generation
php artisan archilbo:test-finance-export
php artisan archilbo:test-contract-generation

Write-Host "`n=== 4) FRONTEND TYPES / BUILD ===" -ForegroundColor Cyan
npm run build

Write-Host "`n=== 5) FINAL GIT STATUS ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== STEP 50 FULL QA DONE ===" -ForegroundColor Green