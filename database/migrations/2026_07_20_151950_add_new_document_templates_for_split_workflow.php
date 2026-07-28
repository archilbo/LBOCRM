<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Retained for installations that already recorded this historical migration.
        // Document templates are now created explicitly through the application.
    }

    public function down(): void
    {
        // No schema or application data is changed by this historical migration.
    }
};
