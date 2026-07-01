<?php

namespace Database\Seeders;

use App\Models\CalendarEvent;
use App\Models\CalendarEventParticipant;
use App\Models\CalendarEventReminder;
use App\Models\User;
use App\Services\Calendar\CalendarNumberService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CalendarDemoSeeder extends Seeder
{
    public function run(CalendarNumberService $numberService): void
    {
        $admin = User::where('email', 'admin@archilbo.local')->first() ?? User::first();
        $manager = User::where('email', 'manager@archilbo.local')->first() ?? $admin;
        $staff = User::where('email', 'staff@archilbo.local')->first() ?? $admin;

        $events = [
            // Overdue tasks
            [
                'type' => 'deadline', 'title' => 'Submit authorization for Residence Al Amal',
                'starts_at' => Carbon::yesterday()->setTime(9, 0), 'priority' => 'urgent', 'status' => 'overdue',
                'assign' => $staff,
            ],
            [
                'type' => 'client_follow_up', 'title' => 'Follow up payment Extension maison',
                'starts_at' => Carbon::yesterday()->setTime(14, 0), 'priority' => 'high', 'status' => 'overdue',
                'assign' => $manager,
            ],
            // Today events
            [
                'type' => 'meeting', 'title' => 'Site visit — Villa Al Hanaa',
                'starts_at' => Carbon::today()->setTime(9, 0), 'ends_at' => Carbon::today()->setTime(11, 0),
                'priority' => 'high', 'status' => 'scheduled', 'assign' => $manager,
            ],
            [
                'type' => 'task', 'title' => 'Review pending documents',
                'starts_at' => Carbon::today()->setTime(11, 0), 'priority' => 'medium', 'status' => 'in_progress',
                'assign' => $staff,
            ],
            [
                'type' => 'reminder', 'title' => 'Call client about CIN update',
                'starts_at' => Carbon::today()->setTime(15, 0), 'priority' => 'medium', 'status' => 'scheduled',
                'assign' => null, 'reminder' => 15,
            ],
            [
                'type' => 'note', 'title' => 'Weekly progress notes',
                'starts_at' => Carbon::today()->setTime(17, 0), 'priority' => 'low', 'status' => 'scheduled',
                'assign' => null,
            ],
            // Tomorrow
            [
                'type' => 'meeting', 'title' => 'Team standup',
                'starts_at' => Carbon::tomorrow()->setTime(8, 0), 'ends_at' => Carbon::tomorrow()->setTime(8, 30),
                'priority' => 'medium', 'status' => 'scheduled', 'assign' => $manager,
            ],
            [
                'type' => 'deadline', 'title' => 'Generate contract Appartement R+3',
                'starts_at' => Carbon::tomorrow()->setTime(12, 0), 'priority' => 'urgent', 'status' => 'scheduled',
                'assign' => $staff,
            ],
            // This week
            [
                'type' => 'client_follow_up', 'title' => 'Send engagement letter — Lotissement Al Amal',
                'starts_at' => Carbon::today()->addDays(2)->setTime(10, 0), 'priority' => 'high', 'status' => 'scheduled',
                'assign' => $manager,
            ],
            [
                'type' => 'finance_follow_up', 'title' => 'Prepare invoice Villa avec piscine',
                'starts_at' => Carbon::today()->addDays(3)->setTime(9, 0), 'priority' => 'high', 'status' => 'scheduled',
                'assign' => $staff,
            ],
            [
                'type' => 'authorization_follow_up', 'title' => 'Check commune status Bureau commercial',
                'starts_at' => Carbon::today()->addDays(4)->setTime(14, 0), 'priority' => 'medium', 'status' => 'scheduled',
                'assign' => $manager,
            ],
            // Next week
            [
                'type' => 'contract_follow_up', 'title' => 'Review contract terms — Immeuble R+5',
                'starts_at' => Carbon::today()->addDays(7)->setTime(10, 0), 'priority' => 'medium', 'status' => 'scheduled',
                'assign' => $staff,
            ],
            [
                'type' => 'archive_follow_up', 'title' => 'Archive physical files Local commercial',
                'starts_at' => Carbon::today()->addDays(8)->setTime(9, 0), 'priority' => 'low', 'status' => 'scheduled',
                'assign' => $manager,
            ],
            // All-day events
            [
                'type' => 'deadline', 'title' => 'Monthly report due',
                'starts_at' => Carbon::today()->addDays(5)->startOfDay(), 'all_day' => true,
                'priority' => 'high', 'status' => 'scheduled', 'assign' => $staff,
            ],
            [
                'type' => 'reminder', 'title' => 'Renew office insurance',
                'starts_at' => Carbon::today()->addDays(10)->startOfDay(), 'all_day' => true,
                'priority' => 'medium', 'status' => 'scheduled', 'assign' => null, 'reminder' => 1440,
            ],
        ];

        foreach ($events as $i => $data) {
            $event = CalendarEvent::create([
                'event_number' => $numberService->generate(),
                'type' => $data['type'],
                'title' => $data['title'],
                'description' => null,
                'status' => $data['status'],
                'priority' => $data['priority'],
                'color' => $data['type'],
                'starts_at' => $data['starts_at'],
                'ends_at' => $data['ends_at'] ?? null,
                'all_day' => $data['all_day'] ?? false,
                'timezone' => 'Africa/Casablanca',
                'visibility' => 'team',
                'created_by' => $admin->id,
                'owner_id' => $admin->id,
            ]);

            if ($data['assign']) {
                CalendarEventParticipant::create([
                    'calendar_event_id' => $event->id,
                    'user_id' => $data['assign']->id,
                    'role' => 'assignee',
                    'response_status' => 'accepted',
                ]);
            }

            if (isset($data['reminder'])) {
                CalendarEventReminder::create([
                    'calendar_event_id' => $event->id,
                    'user_id' => $data['assign']?->id,
                    'offset_minutes' => $data['reminder'],
                    'remind_at' => (clone $data['starts_at'])->subMinutes($data['reminder']),
                    'channel' => 'database',
                    'status' => 'pending',
                ]);
            }
        }

        $this->command->info('CalendarDemoSeeder: ' . count($events) . ' events, ' . CalendarEventParticipant::count() . ' participants, ' . CalendarEventReminder::count() . ' reminders created.');
    }
}
