<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Models\Payment;
use App\Models\Task;
use Database\Seeders\DashboardDemoSeeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardDemoSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_demo_data_is_opt_in_and_idempotent(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DashboardDemoSeeder::class);
        $this->seed(DashboardDemoSeeder::class);

        $this->assertSame(6, Client::query()->where('client_number', 'like', 'DASH-CL-%')->count());
        $this->assertSame(6, Dossier::query()->where('dossier_number', 'like', 'DASH-%')->count());
        $this->assertSame(6, DossierDocument::query()->where('document_number', 'like', 'DASH-DOC-%')->count());
        $this->assertSame(5, FinanceDocument::query()->where('number', 'like', 'DASH-FAC-%')->count());
        $this->assertSame(3, Payment::query()->where('payment_number', 'like', 'DASH-PAY-%')->count());
        $this->assertSame(4, Task::query()->where('task_number', 'like', 'DASH-TASK-%')->count());
    }
}
