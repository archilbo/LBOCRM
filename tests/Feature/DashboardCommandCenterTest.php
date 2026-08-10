<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\CalendarEvent;
use App\Models\Client;
use App\Models\Company;
use App\Models\Conversation;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\Message;
use App\Models\Task;
use App\Models\User;
use App\Services\Dashboard\DashboardCommandCenterService;
use App\Services\PermissionRegistry;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardCommandCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_center_is_scoped_to_the_authenticated_users_company_and_branch(): void
    {
        [$company, $branch, $user] = $this->tenant('alpha');
        [$otherCompany, $otherBranch] = $this->tenant('beta');

        $client = Client::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $dossier = Dossier::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'client_id' => $client->id,
            'status' => 'active',
        ]);
        FinanceDocument::create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'type' => 'invoice',
            'number' => 'FAC-ALPHA-001',
            'status' => 'sent',
            'client_id' => $client->id,
            'dossier_id' => $dossier->id,
            'issue_date' => now()->toDateString(),
            'total_ttc' => 1500,
            'remaining_total' => 1500,
        ]);

        $otherClient = Client::factory()->create(['company_id' => $otherCompany->id, 'branch_id' => $otherBranch->id]);
        $otherDossier = Dossier::factory()->create([
            'company_id' => $otherCompany->id,
            'branch_id' => $otherBranch->id,
            'client_id' => $otherClient->id,
            'status' => 'active',
        ]);
        FinanceDocument::create([
            'company_id' => $otherCompany->id,
            'branch_id' => $otherBranch->id,
            'type' => 'invoice',
            'number' => 'FAC-BETA-001',
            'status' => 'sent',
            'client_id' => $otherClient->id,
            'dossier_id' => $otherDossier->id,
            'issue_date' => now()->toDateString(),
            'total_ttc' => 9200,
            'remaining_total' => 9200,
        ]);

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);
        $kpis = collect($data['kpis'])->keyBy('key');

        $this->assertSame('1', $kpis['activeProjects']['value']);
        $this->assertSame('1', $kpis['unpaidInvoices']['value']);
        $this->assertSame(1500.0, collect($data['financeTrend'])->sum('invoiced'));
        $this->assertSame('1', collect($data['systemHealth'])->firstWhere('label', 'Clients')['value']);
    }

    public function test_quick_links_are_hidden_without_the_underlying_permission(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        [$company, $branch, $user] = $this->tenant('alpha');
        $user->assignRole('viewer');

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);

        // Viewer has read-only access: no quick action should be offered.
        $this->assertSame([], $data['quickLinks']);
    }

    public function test_quick_links_are_filtered_per_action_permission(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        [$company, $branch, $user] = $this->tenant('alpha');
        $role = Role::findOrCreate('dossier_creator', 'web');
        $role->syncPermissions([Permission::findOrCreate('dossiers.create', 'web')]);
        $user->assignRole($role);

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);

        $this->assertSame(['newProject'], array_column($data['quickLinks'], 'key'));
    }

    public function test_staff_receives_all_quick_actions_through_legacy_aliases(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        [$company, $branch, $user] = $this->tenant('alpha');
        $user->assignRole('staff');

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);

        $this->assertSame(
            ['newProject', 'uploadDocument', 'createInvoice', 'newClient', 'newTask', 'newConversation'],
            array_column($data['quickLinks'], 'key'),
        );
    }

    public function test_custom_matrix_controls_quick_actions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        [$company, $branch] = $this->tenant('alpha');
        $registry = app(PermissionRegistry::class);
        $configuration = $registry->normalizeModuleConfiguration([
            'Clients' => ['access' => 'edit', 'scope' => 'all'],
        ]);

        $user = User::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $user->assignRole('custom');
        $user->syncPermissions($registry->permissionsForModuleLevels($configuration));
        $user->module_permissions = [
            'base_role' => 'manager',
            'is_custom' => true,
            'modules' => $configuration,
        ];
        $user->save();

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);

        $this->assertSame(['newClient'], array_column($data['quickLinks'], 'key'));
    }

    public function test_assigned_tasks_from_another_company_are_excluded_from_dashboard_data(): void
    {
        [, , $user] = $this->tenant('alpha');
        [, , $otherUser] = $this->tenant('beta');

        $task = Task::query()->create([
            'task_number' => 'TASK-BETA-001',
            'title' => 'External urgent task',
            'status' => 'not_started',
            'priority' => 'urgent',
            'due_date' => now()->subDay()->toDateString(),
            'created_by' => $otherUser->id,
        ]);
        $task->assignees()->attach($user->id);

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);
        $kpis = collect($data['kpis'])->keyBy('key');

        $this->assertSame('0', $kpis['myTasks']['value']);
        $this->assertSame([], $data['urgentTaskList']);
    }

    public function test_recent_messages_load_only_the_current_users_read_state(): void
    {
        [$company, $branch, $user] = $this->tenant('alpha');
        $sender = User::factory()->create(['company_id' => $company->id, 'branch_id' => $branch->id]);
        $conversation = Conversation::query()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'type' => 'group',
            'subject' => 'Dashboard messages',
        ]);
        $conversation->participants()->create(['user_id' => $user->id]);
        $conversation->participants()->create(['user_id' => $sender->id]);
        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $sender->id,
            'body' => 'Unread dashboard message',
        ]);

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);

        $this->assertSame([$message->id], array_column($data['recentMessageList'], 'id'));
        $this->assertTrue($data['recentMessageList'][0]['unread']);
    }

    public function test_attention_items_include_only_visible_near_term_tasks_and_calendar_events(): void
    {
        [$company, $branch, $user] = $this->tenant('alpha');
        [, , $otherUser] = $this->tenant('beta');
        $user->givePermissionTo([
            Permission::findOrCreate('tasks.view', 'web'),
            Permission::findOrCreate('calendar.view', 'web'),
        ]);

        $task = Task::query()->create([
            'task_number' => 'TASK-ALPHA-ATTENTION',
            'title' => 'Prepare the client package',
            'status' => 'not_started',
            'priority' => 'urgent',
            'due_date' => now()->addDay()->toDateString(),
            'created_by' => $user->id,
        ]);
        $task->assignees()->attach($user->id);

        $event = CalendarEvent::query()->create([
            'event_number' => 'CAL-ALPHA-ATTENTION',
            'type' => 'meeting',
            'title' => 'Client review',
            'starts_at' => now()->addHours(2),
            'visibility' => 'team',
            'created_by' => $user->id,
        ]);
        $hiddenEvent = CalendarEvent::query()->create([
            'event_number' => 'CAL-BETA-ATTENTION',
            'type' => 'meeting',
            'title' => 'Other company review',
            'starts_at' => now()->addHours(2),
            'visibility' => 'team',
            'created_by' => $otherUser->id,
        ]);

        $data = $this->app->make(DashboardCommandCenterService::class)->data($user);
        $ids = array_column($data['attentionItems'], 'id');
        $itemsById = collect($data['attentionItems'])->keyBy('id');

        $this->assertContains('task-'.$task->id, $ids);
        $this->assertContains('calendar-'.$event->id, $ids);
        $this->assertNotContains('calendar-'.$hiddenEvent->id, $ids);
        $this->assertSame('/tasks?task='.$task->id, $itemsById['task-'.$task->id]['href']);
        $this->assertStringContainsString('event='.$event->id, $itemsById['calendar-'.$event->id]['href']);
    }

    /** @return array{Company, Branch, User} */
    private function tenant(string $suffix): array
    {
        $company = Company::factory()->create(['slug' => "company-{$suffix}"]);
        $branch = Branch::create([
            'company_id' => $company->id,
            'name' => "Branch {$suffix}",
            'code' => strtoupper($suffix),
            'is_active' => true,
        ]);
        $user = User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        return [$company, $branch, $user];
    }
}
