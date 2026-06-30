<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Task;
use App\Models\User;
use App\Notifications\ChatMessageNotification;
use App\Notifications\TaskNotification;
use Illuminate\Database\Seeder;

class NotificationsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@archilbo.local')->first() ?? User::first();
        $manager = User::where('email', 'manager@archilbo.local')->first() ?? $admin;

        $tasks = Task::where('created_by', $admin->id)->get();

        $task1 = $tasks->first();
        if ($task1) {
            $manager->notify(new TaskNotification($task1, 'assigned', 'You have been assigned: ' . $task1->title));
        }

        $task2 = $tasks->skip(1)->first() ?? $task1;
        $manager->notify(new TaskNotification($task2, 'due_soon', 'Task "' . $task2->title . '" is due soon'));

        $conv = Conversation::with('messages', 'participants')->first();
        $msg = $conv?->messages()->first();
        if ($conv && $msg) {
            $manager->notify(new ChatMessageNotification($conv, $msg, $admin));
        }

        $this->command->info('NotificationsDemoSeeder: 3 notifications created.');
    }
}
