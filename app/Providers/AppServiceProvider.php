<?php

namespace App\Providers;

use App\Models\DocumentTemplate;
use App\Observers\DocumentTemplateObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        DocumentTemplate::observe(DocumentTemplateObserver::class);
        //
    }
}
