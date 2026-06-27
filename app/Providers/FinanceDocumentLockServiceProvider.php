<?php

namespace App\Providers;

use App\Models\FinanceDocument;
use App\Services\Finance\FinanceDocumentLockGuard;
use Illuminate\Support\ServiceProvider;

class FinanceDocumentLockServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        FinanceDocument::updating(function (FinanceDocument $document): void {
            app(FinanceDocumentLockGuard::class)->assertCanUpdate($document);
        });
    }
}