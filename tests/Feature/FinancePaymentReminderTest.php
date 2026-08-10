<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinancePaymentReminder;
use App\Models\User;
use App\Services\Finance\FinancePaymentReminderService;
use App\Services\Finance\FinancePaymentPromiseService;
use App\Services\Finance\FinancePaymentScheduleService;
use App\Services\Finance\FinanceDocumentQueryService;
use App\Services\Finance\PaymentLedgerService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinancePaymentReminderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private FinanceDocument $invoice;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $company = Company::query()->firstOrFail();
        $branch = Branch::query()->where('company_id', $company->id)->firstOrFail();
        $this->user = User::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $this->user->assignRole('finance_admin');

        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $dossier = Dossier::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id, 'client_id' => $client->id]);
        $this->invoice = FinanceDocument::create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'type' => 'invoice',
            'number' => 'FAC-REM-001',
            'status' => 'issued',
            'client_id' => $client->id,
            'dossier_id' => $dossier->id,
            'issue_date' => now()->subDays(2)->toDateString(),
            'due_date' => now()->addDay()->toDateString(),
            'currency' => 'MAD',
            'total_ttc' => 10000,
            'paid_total' => 0,
            'remaining_total' => 10000,
            'created_by' => $this->user->id,
        ]);
    }

    public function test_authorized_user_can_create_multiple_and_snooze_payment_reminders(): void
    {
        $this->actingAs($this->user)
            ->post(route('finance.payment-reminders.store', $this->invoice), [
                'type' => 'on_due',
                'remind_at' => now()->addDay()->toDateTimeString(),
                'note' => 'Premier rappel',
            ])
            ->assertRedirect();

        $reminder = FinancePaymentReminder::query()->firstOrFail();
        $this->actingAs($this->user)
            ->put(route('finance.payment-reminders.snooze', $reminder), [
                'remind_at' => now()->addDays(3)->toDateTimeString(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('finance_payment_reminders', [
            'id' => $reminder->id,
            'status' => 'snoozed',
            'type' => 'on_due',
        ]);
    }

    public function test_due_reminder_notifies_only_once_when_the_scheduler_retries(): void
    {
        $reminder = FinancePaymentReminder::create([
            'company_id' => $this->invoice->company_id,
            'branch_id' => $this->invoice->branch_id,
            'finance_document_id' => $this->invoice->id,
            'client_id' => $this->invoice->client_id,
            'dossier_id' => $this->invoice->dossier_id,
            'type' => 'custom',
            'remind_at' => now()->subMinute(),
            'created_by' => $this->user->id,
        ]);

        $service = app(FinancePaymentReminderService::class);
        $this->assertSame(1, $service->processDue());
        $this->assertSame(0, $service->processDue());

        $this->assertSame('triggered', $reminder->fresh()->status);
        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_collection_metrics_supports_the_joined_priority_clients_aggregate(): void
    {
        $this->invoice->update(['due_date' => now()->subDay()->toDateString()]);

        $metrics = app(FinanceDocumentQueryService::class)->collectionMetrics($this->user, 'MAD');

        $this->assertSame($this->invoice->client->full_name, $metrics['clientsToRemind'][0]['clientName']);
        $this->assertSame(10000.0, $metrics['clientsToRemind'][0]['outstanding']);
    }

    public function test_pending_reminders_are_completed_when_the_invoice_becomes_fully_paid(): void
    {
        $reminder = FinancePaymentReminder::create([
            'company_id' => $this->invoice->company_id,
            'branch_id' => $this->invoice->branch_id,
            'finance_document_id' => $this->invoice->id,
            'client_id' => $this->invoice->client_id,
            'dossier_id' => $this->invoice->dossier_id,
            'type' => 'custom',
            'remind_at' => now()->addDay(),
            'created_by' => $this->user->id,
        ]);

        app(PaymentLedgerService::class)->recordPayment($this->invoice, [
            'amount' => 10000,
            'paid_at' => now()->toDateString(),
            'created_by' => $this->user->id,
        ]);

        $this->assertSame('completed', $reminder->fresh()->status);
    }

    public function test_user_cannot_create_a_reminder_for_another_company_invoice(): void
    {
        $otherCompany = Company::factory()->create();
        $otherUser = User::factory()->create(['company_id' => $otherCompany->id]);
        $otherUser->assignRole('finance_admin');

        $this->actingAs($otherUser)
            ->post(route('finance.payment-reminders.store', $this->invoice), [
                'type' => 'custom',
                'remind_at' => now()->addDay()->toDateTimeString(),
            ])
            ->assertForbidden();
    }

    public function test_schedule_total_is_validated_and_payment_state_is_derived_from_the_ledger(): void
    {
        $schedules = app(FinancePaymentScheduleService::class);
        $items = $schedules->replace($this->invoice, $this->user, [
            ['label' => 'Avance initiale', 'amount' => 3000, 'due_date' => now()->addDay()->toDateString()],
            ['label' => 'Solde', 'amount' => 7000, 'due_date' => now()->addDays(10)->toDateString()],
        ]);

        $this->assertSame(2, $items->count());
        $this->assertSame('upcoming', $items->first()['status']);

        app(PaymentLedgerService::class)->recordPayment($this->invoice, [
            'amount' => 3000,
            'paid_at' => now()->toDateString(),
            'created_by' => $this->user->id,
        ]);

        $items = $schedules->itemsForInvoice($this->invoice->fresh());
        $this->assertSame('paid', $items->first()['status']);
        $this->assertSame(7000.0, $items->last()['outstanding']);
    }

    public function test_payment_fulfills_an_active_promise_from_the_same_invoice_ledger(): void
    {
        $promise = app(FinancePaymentPromiseService::class)->create($this->invoice, $this->user, [
            'amount' => 3000,
            'promised_for' => now()->addDays(3)->toDateString(),
            'note' => 'Le client passera vendredi.',
        ]);

        app(PaymentLedgerService::class)->recordPayment($this->invoice, [
            'amount' => 3000,
            'paid_at' => now()->toDateString(),
            'created_by' => $this->user->id,
        ]);

        $this->assertSame('fulfilled', $promise->fresh()->status);
        $this->assertNotNull($promise->fresh()->fulfilled_at);
    }

    public function test_payment_cancellation_keeps_a_soft_deleted_audit_record_and_restores_the_balance(): void
    {
        $payment = app(PaymentLedgerService::class)->recordPayment($this->invoice, [
            'amount' => 3000,
            'paid_at' => now()->toDateString(),
            'created_by' => $this->user->id,
        ]);

        app(PaymentLedgerService::class)->deletePayment($payment, $this->user, 'Saisie à corriger');

        $this->assertSoftDeleted('payments', ['id' => $payment->id]);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'cancelled_by' => $this->user->id,
            'cancellation_reason' => 'Saisie à corriger',
        ]);
        $this->assertSame(10000.0, (float) $this->invoice->fresh()->remaining_total);
    }
}
