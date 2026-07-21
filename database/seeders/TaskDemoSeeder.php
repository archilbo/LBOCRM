<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Task;
use App\Models\TaskChecklistItem;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@archilbo.local')->first() ?? User::first();
        $users = User::whereIn('email', ['manager@archilbo.local', 'staff@archilbo.local'])->get();
        $manager = $users->firstWhere('email', 'manager@archilbo.local') ?? $admin;
        $staff = $users->firstWhere('email', 'staff@archilbo.local') ?? $admin;

        $tasksData = [
            ['title' => 'Review pending documents for Villa Al Amal', 'priority' => 'high', 'category' => 'documents', 'due' => now()->addDays(2), 'checklist' => ['Check CIN copy', 'Verify land title', 'Confirm site photos received'], 'comments' => ['I have uploaded the initial documents, please review.', 'Checking the CIN copy now...']],
            ['title' => 'Generate contract for Appartement R+3', 'priority' => 'urgent', 'category' => 'contract', 'due' => now()->addDay(), 'checklist' => ['Finalize contract template', 'Insert client details', 'Review fee structure', 'Send for client signature'], 'comments' => ['Client fee structure has been updated for this project.', 'Need the signed engagement letter first.']],
            ['title' => 'Follow authorization status for Bureau commercial', 'priority' => 'medium', 'category' => 'authorization', 'status' => 'in_progress', 'due' => now()->addDays(5), 'checklist' => ['Check commune status', 'Verify submitted documents', 'Follow up with authorities']],
            ['title' => 'Prepare invoice for Villa avec piscine', 'priority' => 'high', 'category' => 'finance', 'status' => 'in_progress', 'due' => now()->addDays(3), 'checklist' => ['Calculate total fees', 'Add TVA', 'Generate PDF', 'Send to client']],
            ['title' => 'Archive physical files for Local commercial', 'priority' => 'low', 'category' => 'archive', 'status' => 'not_started', 'due' => now()->addDays(14)],
            ['title' => 'Update client CIN for Fatima Zahra Alami', 'priority' => 'medium', 'category' => 'client_follow_up', 'status' => 'not_started', 'due' => now()->addDays(7)],
            ['title' => 'Verify site measurements for Villa Al Hanaa', 'priority' => 'high', 'category' => 'general_admin', 'status' => 'in_review', 'due' => now()->addDays(4), 'checklist' => ['Confirm dimensions match plan', 'Check boundary alignment', 'Photograph site conditions']],
            ['title' => 'Submit authorization file for Residence Al Amal', 'priority' => 'urgent', 'category' => 'authorization', 'due' => now(), 'checklist' => ['Print all forms', 'Get stamps', 'Deliver to commune office']],
            ['title' => 'Review Cahier de chantier for Immeuble R+5', 'priority' => 'medium', 'category' => 'documents', 'status' => 'completed', 'due' => now()->subDay(), 'checklist' => ['Check daily entries', 'Verify signatures', 'Approve for archive']],
            ['title' => 'Follow up payment for Extension maison', 'priority' => 'high', 'category' => 'finance', 'status' => 'in_progress', 'due' => now()->addDays(6), 'checklist' => ['Send payment reminder', 'Confirm receipt', 'Update invoice status']],
        ];

        foreach ($tasksData as $i => $data) {
            $status = $data['status'] ?? 'not_started';
            $progress = match ($status) {
                'completed' => 100,
                'in_progress' => 40,
                'in_review' => 70,
                default => 0,
            };

            $taskNum = 'TASK-' . date('Y') . '-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT);
            $task = Task::updateOrCreate(
                ['task_number' => $taskNum],
                [
                    'title' => $data['title'],
                    'status' => $status,
                    'priority' => $data['priority'],
                    'category' => $data['category'],
                    'progress' => $progress,
                    'due_date' => $data['due'],
                    'created_by' => $admin->id,
                    'assigned_by' => $admin->id,
                    'completed_at' => $status === 'completed' ? now() : null,
                ]);

            $assignee = $i % 2 === 0 ? $manager : $staff;
            $task->assignees()->syncWithoutDetaching([$assignee->id]);
            $task->watchers()->syncWithoutDetaching([$admin->id]);

            if (isset($data['checklist'])) {
                foreach ($data['checklist'] as $j => $itemTitle) {
                    $done = $status === 'completed' || ($status === 'in_progress' && $j === 0);
                    TaskChecklistItem::create([
                        'task_id' => $task->id,
                        'label' => $itemTitle,
                        'is_done' => $done,
                        'position' => $j,
                    ]);
                }
            }

            if (isset($data['comments'])) {
                foreach ($data['comments'] as $cBody) {
                    TaskComment::create([
                        'task_id' => $task->id,
                        'user_id' => $assignee->id,
                        'body' => $cBody,
                    ]);
                }
            }
        }

        $conv1 = $this->findOrCreateDirect($admin->id, $manager->id);
        if ($conv1->messages()->count() === 0) {
            Message::create(['conversation_id' => $conv1->id, 'user_id' => $admin->id, 'body' => 'Hi, please review the pending documents for Villa Al Amal.']);
            Message::create(['conversation_id' => $conv1->id, 'user_id' => $manager->id, 'body' => 'Sure, I will review them today and get back to you.']);
            $conv1->update(['last_message_at' => now()]);
        }

        $conv2 = $this->findOrCreateDirect($admin->id, $staff->id);
        if ($conv2->messages()->count() === 0) {
            Message::create(['conversation_id' => $conv2->id, 'user_id' => $staff->id, 'body' => 'I have completed the site measurements for Villa Al Hanaa.']);
            Message::create(['conversation_id' => $conv2->id, 'user_id' => $admin->id, 'body' => 'Great work! Please upload the report to the dossier documents.']);
            $conv2->update(['last_message_at' => now()]);
        }

        $this->command->info('TaskDemoSeeder: 10 tasks, ' . TaskChecklistItem::count() . ' checklist items, ' . TaskComment::count() . ' comments, 2 conversations, 4 messages created.');
    }

    private function findOrCreateDirect(int $uid1, int $uid2): Conversation
    {
        $existing = Conversation::where('type', 'direct')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $uid1))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $uid2))
            ->first();
        if ($existing) return $existing;

        $firstUser = \App\Models\User::find($uid1);
        $conv = Conversation::create(['company_id' => $firstUser?->company_id, 'type' => 'direct', 'last_message_at' => now()]);
        $conv->participants()->createMany([
            ['user_id' => $uid1],
            ['user_id' => $uid2],
        ]);
        return $conv;
    }
}
