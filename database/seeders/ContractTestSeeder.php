<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Dossier;
use Illuminate\Database\Seeder;

class ContractTestSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::all();
        if ($clients->isEmpty()) {
            $this->command->warn('No clients found. Run DemoDataSeeder first.');
            return;
        }

        $perClient = [
            ['cin' => 'AB123456', 'dossiers' => [
                ['num' => 'DOS-DEMO-004', 'object' => 'Extension villa Californie',          'province' => 'Casablanca', 'commune' => 'Californie',  'status' => 'active',  'step' => 'contract'],
                ['num' => 'DOS-DEMO-005', 'object' => 'Local commercial Gauthier',            'province' => 'Casablanca', 'commune' => 'Gauthier',   'status' => 'opened',  'step' => 'documents'],
            ]],
            ['cin' => 'CD789012', 'dossiers' => [
                ['num' => 'DOS-DEMO-006', 'object' => 'Appartement Hay Riad',                'province' => 'Rabat',      'commune' => 'Hay Riad',   'status' => 'active',  'step' => 'contract'],
                ['num' => 'DOS-DEMO-007', 'object' => 'Bureau centre-ville Rabat',           'province' => 'Rabat',      'commune' => 'Centre',     'status' => 'opened',  'step' => 'rokhas'],
            ]],
            ['cin' => 'XX999999', 'dossiers' => [
                ['num' => 'DOS-DEMO-008', 'object' => 'Riad a restaurer Medina',             'province' => 'Marrakech',  'commune' => 'Medina',     'status' => 'active',  'step' => 'contract'],
            ]],
        ];

        $count = 0;
        foreach ($perClient as $entry) {
            $client = $clients->firstWhere('cin', $entry['cin']);
            if (!$client) { continue; }
            foreach ($entry['dossiers'] as $d) {
                Dossier::firstOrCreate(
                    ['dossier_number' => $d['num']],
                    [
                        'client_id' => $client->id,
                        'project_object' => $d['object'],
                        'province' => $d['province'],
                        'commune' => $d['commune'],
                        'status' => $d['status'],
                        'workflow_step' => $d['step'],
                        'opened_at' => now()->subDays(rand(5, 30)),
                    ],
                );
                $count++;
            }
        }

        $this->command->info("Contract test seeder done: {$count} dossiers created.");
    }
}