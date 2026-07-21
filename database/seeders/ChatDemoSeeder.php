<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ChatDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure demo users exist
        $admin = User::where('email', 'admin@archilbo.local')->first() ?? User::first();

        $architect = User::firstOrCreate(
            ['email' => 'architect@archilbo.local'],
            [
                'name' => 'Architect',
                'password' => Hash::make('password'),
                'last_seen_at' => now(),
            ]
        );

        $manager = User::firstOrCreate(
            ['email' => 'manager@archilbo.local'],
            [
                'name' => 'Manager',
                'password' => Hash::make('password'),
                'last_seen_at' => now()->subMinutes(5),
            ]
        );

        $assistant = User::firstOrCreate(
            ['email' => 'assistant@archilbo.local'],
            [
                'name' => 'Assistant',
                'password' => Hash::make('password'),
                'last_seen_at' => now()->subHours(2),
            ]
        );

        // 2. Direct conversation: Admin ↔ Architect
        $direct1 = $this->findOrCreateConversation('direct', null, [$admin->id, $architect->id]);

        // 3. Direct conversation: Manager ↔ Assistant (with archived participant)
        $direct2 = $this->findOrCreateConversation('direct', null, [$manager->id, $assistant->id]);
        // Archive for manager
        $direct2->participants()->where('user_id', $manager->id)->update(['archived_at' => now()]);

        // 4. Group conversation: all 4 users
        $group = $this->findOrCreateConversation('group', 'General project discussion', [
            $admin->id, $architect->id, $manager->id, $assistant->id,
        ]);

        // 5. Messages for direct1 (Admin ↔ Architect)
        $msg1 = Message::create([
            'conversation_id' => $direct1->id,
            'user_id' => $admin->id,
            'body' => 'Bonjour Architect, we need the updated cadastral plan for the villa project.',
            'created_at' => now()->subHours(3),
            'updated_at' => now()->subHours(3),
        ]);
        $this->markRead($msg1, $architect->id);

        $msg2 = Message::create([
            'conversation_id' => $direct1->id,
            'user_id' => $architect->id,
            'body' => 'I will have it ready by tomorrow. The land survey is scheduled for this afternoon.',
            'created_at' => now()->subHours(2)->addMinutes(15),
            'updated_at' => now()->subHours(2)->addMinutes(15),
        ]);
        $this->markRead($msg2, $admin->id);

        $msg3 = Message::create([
            'conversation_id' => $direct1->id,
            'user_id' => $admin->id,
            'body' => 'Perfect. Also please check the ownership certificate while you\'re at it.',
            'is_edited' => true,
            'edited_at' => now()->subHours(1)->addMinutes(30),
            'created_at' => now()->subHours(1)->addMinutes(20),
            'updated_at' => now()->subHours(1)->addMinutes(30),
        ]);
        $this->markRead($msg3, $architect->id);

        // Reply to msg2
        Message::create([
            'conversation_id' => $direct1->id,
            'user_id' => $admin->id,
            'body' => 'Great, let me know when it\'s done.',
            'reply_to_message_id' => $msg2->id,
            'created_at' => now()->subMinutes(30),
            'updated_at' => now()->subMinutes(30),
        ]);

        // 6. Messages for group
        $gMsg1 = Message::create([
            'conversation_id' => $group->id,
            'user_id' => $manager->id,
            'body' => 'Team, we have a new project for riad restoration in the medina.',
            'created_at' => now()->subHours(5),
            'updated_at' => now()->subHours(5),
        ]);
        foreach ([$admin->id, $architect->id, $assistant->id] as $uid) {
            $this->markRead($gMsg1, $uid);
        }

        $gMsg2 = Message::create([
            'conversation_id' => $group->id,
            'user_id' => $architect->id,
            'body' => 'I can do the site visit this Friday. Any preference for morning or afternoon?',
            'created_at' => now()->subHours(4)->addMinutes(20),
            'updated_at' => now()->subHours(4)->addMinutes(20),
        ]);
        foreach ([$admin->id, $manager->id] as $uid) {
            $this->markRead($gMsg2, $uid);
        }

        $gMsg3 = Message::create([
            'conversation_id' => $group->id,
            'user_id' => $admin->id,
            'body' => 'Morning would be better. The client is available at 10 AM.',
            'reply_to_message_id' => $gMsg2->id,
            'created_at' => now()->subHours(3)->addMinutes(10),
            'updated_at' => now()->subHours(3)->addMinutes(10),
        ]);
        $this->markRead($gMsg3, $manager->id);
        $this->markRead($gMsg3, $architect->id);

        // Forwarded message in group
        Message::create([
            'conversation_id' => $group->id,
            'user_id' => $assistant->id,
            'body' => 'FYI - this was discussed earlier:',
            'is_forwarded' => true,
            'reply_to_message_id' => $gMsg1->id,
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);

        // 7. Update last_message_at for conversations
        $direct1->update(['last_message_at' => now()->subMinutes(30)]);
        $direct2->update(['last_message_at' => now()->subDays(1)]);
        $group->update(['last_message_at' => now()->subHours(2)]);

        // 8. Messages for direct2 — old, to show archived state
        Message::create([
            'conversation_id' => $direct2->id,
            'user_id' => $assistant->id,
            'body' => 'The contract calculation is ready for review.',
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        Message::create([
            'conversation_id' => $direct2->id,
            'user_id' => $manager->id,
            'body' => 'Thanks, I\'ll review it this week.',
            'created_at' => now()->subDays(2)->addHours(2),
            'updated_at' => now()->subDays(2)->addHours(2),
        ]);

        // Demo seeder should only talk to existing models, but also create a forwardable
        // message in the group so forward modal has something to forward
        $this->command->info('ChatDemoSeeder: ' . Conversation::count() . ' conversations, ' . Message::count() . ' messages created.');
    }

    private function findOrCreateConversation(string $type, ?string $subject, array $userIds): Conversation
    {
        // For direct conversations, try to find existing one between the two users
        if ($type === 'direct' && count($userIds) === 2) {
            $existing = Conversation::where('type', 'direct')
                ->whereHas('participants', fn ($q) => $q->where('user_id', $userIds[0]))
                ->whereHas('participants', fn ($q) => $q->where('user_id', $userIds[1]))
                ->first();
            if ($existing) return $existing;
        }

        $firstUser = User::find($userIds[0]);

        $conv = Conversation::create([
            'company_id' => $firstUser?->company_id,
            'type' => $type,
            'subject' => $subject,
            'last_message_at' => now(),
        ]);

        foreach ($userIds as $uid) {
            $conv->participants()->create(['user_id' => $uid]);
        }

        return $conv;
    }

    private function markRead(Message $message, int $userId): void
    {
        MessageRead::create([
            'message_id' => $message->id,
            'user_id' => $userId,
            'read_at' => $message->created_at?->addMinutes(rand(1, 10)) ?? now(),
        ]);
    }
}
