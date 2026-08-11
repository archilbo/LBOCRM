<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:task-overdue-notify')->dailyAt('08:00')->withoutOverlapping()->onOneServer();
Schedule::command('app:archive-overdue-notify')->dailyAt('08:30')->withoutOverlapping()->onOneServer();
Schedule::command('calendar:process-reminders')->everyMinute()->withoutOverlapping()->onOneServer();
Schedule::command('finance:process-payment-reminders')->everyFiveMinutes()->withoutOverlapping()->onOneServer();
