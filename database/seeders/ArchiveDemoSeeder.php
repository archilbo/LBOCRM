<?php

namespace Database\Seeders;

use App\Models\ArchiveRecord;
use App\Models\Box;
use App\Models\Room;
use App\Models\Shelf;
use App\Models\Dossier;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ArchiveDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Rooms
        $roomA = Room::create(['name' => 'Room A1 - Main', 'code' => 'A1', 'description' => 'Main archive room ground floor']);
        $roomB = Room::create(['name' => 'Room A2 - Storage', 'code' => 'A2', 'description' => 'Secondary storage room basement']);

        // Shelves
        $shelves = [];
        $shelfData = [
            ['room' => $roomA, 'code' => 'S01', 'name' => 'Shelf 01'],
            ['room' => $roomA, 'code' => 'S02', 'name' => 'Shelf 02'],
            ['room' => $roomA, 'code' => 'S03', 'name' => 'Shelf 03'],
            ['room' => $roomA, 'code' => 'S04', 'name' => 'Shelf 04'],
            ['room' => $roomB, 'code' => 'S01', 'name' => 'Shelf 01'],
            ['room' => $roomB, 'code' => 'S02', 'name' => 'Shelf 02'],
            ['room' => $roomB, 'code' => 'S03', 'name' => 'Shelf 03'],
            ['room' => $roomB, 'code' => 'S04', 'name' => 'Shelf 04'],
        ];

        foreach ($shelfData as $data) {
            $shelves[] = Shelf::create([
                'room_id' => $data['room']->id,
                'name' => $data['name'],
                'code' => $data['code'],
            ]);
        }

        // Boxes — 3 boxes per shelf, capacity 12
        $boxes = [];
        $boxLetters = ['A', 'B', 'C'];
        foreach ($shelves as $shelf) {
            foreach ($boxLetters as $letter) {
                $boxes[] = Box::create([
                    'shelf_id' => $shelf->id,
                    'name' => "Box {$shelf->code}-{$letter}",
                    'code' => "{$shelf->code}-{$letter}",
                    'capacity' => 12,
                ]);
            }
        }

        // Dossiers for archives
        $dossiers = Dossier::limit(15)->get();
        if ($dossiers->isEmpty()) {
            $this->command?->warn('No dossiers found. Create dossiers first or skip archive seeding.');
            return;
        }

        $statuses = ['ready_to_archive', 'stored', 'checked_out', 'returned'];
        $now = Carbon::now();

        // Create 30 sample archives
        for ($i = 0; $i < 30; $i++) {
            $dossier = $dossiers->random();
            $status = $statuses[array_rand($statuses)];
            $box = $boxes[array_rand($boxes)];

            $record = ArchiveRecord::create([
                'dossier_id' => $dossier->id,
                'archive_number' => sprintf('ARC-%s-%04d', $now->format('Y'), 1001 + $i),
                'status' => $status,
                'room' => $box->shelf->room->code,
                'shelf' => $box->shelf->code,
                'box' => $box->code,
                'folder' => null,
                'in_date' => in_array($status, ['stored', 'checked_out', 'returned']) ? $now->subDays(rand(10, 60))->format('Y-m-d') : null,
                'out_date' => in_array($status, ['checked_out', 'returned']) ? $now->subDays(rand(1, 20))->format('Y-m-d') : null,
                'returned_at' => $status === 'returned' ? $now->subDays(rand(1, 5))->format('Y-m-d') : null,
                'requested_by' => in_array($status, ['checked_out', 'returned']) ? 'N. Alaoui' : null,
                'due_at' => $status === 'checked_out' ? $now->addDays(rand(1, 14)) : null,
                'checked_out_at' => $status === 'checked_out' ? $now->subDays(rand(1, 20)) : null,
                'notes' => $i % 5 === 0 ? 'Sample notes for archive ' . ($i + 1) : null,
            ]);

            // Create audit events
            $record->events()->create(['type' => 'ready', 'payload' => ['note' => 'Archive created']]);
            if (in_array($status, ['stored', 'checked_out', 'returned'])) {
                $record->events()->create(['type' => 'stored', 'payload' => ['location' => "{$box->shelf->room->code}/{$box->shelf->code}/{$box->code}"]]);
            }
            if (in_array($status, ['checked_out', 'returned'])) {
                $record->events()->create(['type' => 'checked_out', 'payload' => ['requested_by' => 'N. Alaoui']]);
            }
            if ($status === 'returned') {
                $record->events()->create(['type' => 'returned', 'payload' => ['note' => 'Returned in good condition']]);
            }
        }

        // Create 2 overdue archives
        for ($i = 0; $i < 2; $i++) {
            $dossier = $dossiers->random();
            $box = $boxes[array_rand($boxes)];
            $dueDate = $now->subDays(rand(3, 10));

            $record = ArchiveRecord::create([
                'dossier_id' => $dossier->id,
                'archive_number' => sprintf('ARC-%s-%04d', $now->format('Y'), 1031 + $i),
                'status' => 'checked_out',
                'room' => $box->shelf->room->code,
                'shelf' => $box->shelf->code,
                'box' => $box->code,
                'in_date' => $now->subDays(rand(30, 60))->format('Y-m-d'),
                'out_date' => $now->subDays(rand(5, 15))->format('Y-m-d'),
                'requested_by' => 'K. Tazi',
                'due_at' => $dueDate,
                'checked_out_at' => $now->subDays(rand(5, 15)),
                'notes' => 'OVERDUE - needs follow-up',
            ]);

            $record->events()->create(['type' => 'ready', 'payload' => ['note' => 'Archive created']]);
            $record->events()->create(['type' => 'stored', 'payload' => ['location' => "{$box->shelf->room->code}/{$box->shelf->code}/{$box->code}"]]);
            $record->events()->create(['type' => 'checked_out', 'payload' => ['requested_by' => 'K. Tazi', 'due_at' => $dueDate->format('Y-m-d')]]);
        }

        // Create 1 lost archive
        $dossier = $dossiers->random();
        $record = ArchiveRecord::create([
            'dossier_id' => $dossier->id,
            'archive_number' => sprintf('ARC-%s-%04d', $now->format('Y'), 1033),
            'status' => 'checked_out',
            'room' => null,
            'shelf' => null,
            'box' => null,
            'in_date' => $now->subDays(90)->format('Y-m-d'),
            'out_date' => $now->subDays(60)->format('Y-m-d'),
            'requested_by' => 'Unknown',
            'is_lost' => true,
            'lost_reason' => 'Reported missing during inventory check on ' . $now->subDays(30)->format('Y-m-d'),
            'notes' => 'LOST - last seen with former employee',
        ]);

        $record->events()->create(['type' => 'ready', 'payload' => ['note' => 'Archive created']]);
        $record->events()->create(['type' => 'stored', 'payload' => ['location' => 'A1/S02/B']]);
        $record->events()->create(['type' => 'checked_out', 'payload' => ['requested_by' => 'Unknown']]);
        $record->events()->create(['type' => 'lost', 'payload' => ['reason' => 'Reported missing during inventory check']]);
    }
}
