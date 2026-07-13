<?php

namespace Database\Seeders;

use App\Models\Dossier;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExpensesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();

        $dossiers = Dossier::whereIn('dossier_number', [
            'DOS-0001', 'DOS-0002', 'DOS-0003', 'DOS-0005', 'DOS-0008', 'DOS-0011',
        ])->get()->keyBy('dossier_number');

        $today = now();

        $expenses = [
            // DOS-0001 — Villa residence Al Amal (various admin/supplies)
            ['dossier' => 'DOS-0001', 'vendor' => 'Bureau Vallée',          'amount' => 1200.00, 'category' => 'supplies',       'date' => $today->copy()->subMonths(5)],
            ['dossier' => 'DOS-0001', 'vendor' => 'Lydec',                  'amount' => 3400.00, 'category' => 'utilities',      'date' => $today->copy()->subMonths(5)],
            ['dossier' => 'DOS-0001', 'vendor' => 'SNTL',                   'amount' => 2800.00, 'category' => 'administrative',  'date' => $today->copy()->subMonths(4)],
            ['dossier' => 'DOS-0001', 'vendor' => 'Fuel station',           'amount' => 950.00,  'category' => 'travel',         'date' => $today->copy()->subMonths(4)],

            // DOS-0003 — Appartement R+3 (professional fees, travel)
            ['dossier' => 'DOS-0003', 'vendor' => 'BET Structure',          'amount' => 15000.00, 'category' => 'professional_fees', 'date' => $today->copy()->subMonths(4)],
            ['dossier' => 'DOS-0003', 'vendor' => 'ONCF',                   'amount' => 450.00,   'category' => 'travel',          'date' => $today->copy()->subMonths(3)],
            ['dossier' => 'DOS-0003', 'vendor' => 'Commune Rabat',          'amount' => 2000.00,  'category' => 'taxes',           'date' => $today->copy()->subMonths(3)],
            ['dossier' => 'DOS-0003', 'vendor' => 'Paperplus',              'amount' => 3200.00,  'category' => 'supplies',        'date' => $today->copy()->subMonths(2)],

            // DOS-0005 — Villa avec piscine (travel, equipment)
            ['dossier' => 'DOS-0005', 'vendor' => 'Location voiture',       'amount' => 2200.00,  'category' => 'travel',          'date' => $today->copy()->subMonths(5)],
            ['dossier' => 'DOS-0005', 'vendor' => 'Matériaux construction',  'amount' => 8500.00,  'category' => 'equipment',       'date' => $today->copy()->subMonths(4)],
            ['dossier' => 'DOS-0005', 'vendor' => 'Notaire Bennani',        'amount' => 6000.00,  'category' => 'professional_fees','date' => $today->copy()->subMonths(3)],
            ['dossier' => 'DOS-0005', 'vendor' => 'Hotel Marrakech',        'amount' => 1800.00,  'category' => 'travel',          'date' => $today->copy()->subMonths(2)],

            // DOS-0008 — Immeuble R+5 (large expenses)
            ['dossier' => 'DOS-0008', 'vendor' => 'BET Génie Civil',        'amount' => 35000.00, 'category' => 'professional_fees','date' => $today->copy()->subMonths(5)],
            ['dossier' => 'DOS-0008', 'vendor' => 'Lydec',                  'amount' => 5600.00,  'category' => 'utilities',       'date' => $today->copy()->subMonths(4)],
            ['dossier' => 'DOS-0008', 'vendor' => 'AMO Fes',                'amount' => 4200.00,  'category' => 'administrative',  'date' => $today->copy()->subMonths(3)],
            ['dossier' => 'DOS-0008', 'vendor' => 'Topographie Fes',        'amount' => 8800.00,  'category' => 'professional_fees','date' => $today->copy()->subMonths(3)],
            ['dossier' => 'DOS-0008', 'vendor' => 'Station essence',        'amount' => 1300.00,  'category' => 'travel',          'date' => $today->copy()->subMonths(2)],

            // DOS-0011 — Villa Al Hanaa (recent expenses)
            ['dossier' => 'DOS-0011', 'vendor' => 'Bureau Vallée Casa',     'amount' => 2800.00,  'category' => 'supplies',        'date' => $today->copy()->subMonths(3)],
            ['dossier' => 'DOS-0011', 'vendor' => 'Topographie',            'amount' => 5500.00,  'category' => 'professional_fees','date' => $today->copy()->subMonths(2)],
            ['dossier' => 'DOS-0011', 'vendor' => 'Redal',                  'amount' => 1900.00,  'category' => 'utilities',       'date' => $today->copy()->subMonths(2)],
            ['dossier' => 'DOS-0011', 'vendor' => 'Taxi Marrakech',         'amount' => 600.00,   'category' => 'travel',          'date' => $today->copy()->subMonth()],

            // General/Admin expenses (no dossier)
            ['dossier' => null, 'vendor' => 'Oracle Cloud',                 'amount' => 4500.00,  'category' => 'utilities',       'date' => $today->copy()->subMonths(5)],
            ['dossier' => null, 'vendor' => 'Microsoft 365',                'amount' => 3200.00,  'category' => 'utilities',       'date' => $today->copy()->subMonths(4)],
            ['dossier' => null, 'vendor' => 'Pharmacie',                    'amount' => 450.00,   'category' => 'other',           'date' => $today->copy()->subMonths(3)],
            ['dossier' => null, 'vendor' => 'Impots fonciers',              'amount' => 12000.00, 'category' => 'taxes',           'date' => $today->copy()->subMonths(3)],
            ['dossier' => null, 'vendor' => 'Fournitures bureau',           'amount' => 2100.00,  'category' => 'supplies',        'date' => $today->copy()->subMonths(2)],
            ['dossier' => null, 'vendor' => 'Maroc Telecom',                'amount' => 2800.00,  'category' => 'utilities',       'date' => $today->copy()->subMonths(2)],
            ['dossier' => null, 'vendor' => 'Maintenance imprimante',       'amount' => 1500.00,  'category' => 'equipment',       'date' => $today->copy()->subMonth()],
        ];

        $count = 0;
        foreach ($expenses as $data) {
            $dossierId = $data['dossier'] ? ($dossiers[$data['dossier']]?->id ?? null) : null;

            Expense::updateOrCreate(
                [
                    'vendor' => $data['vendor'],
                    'amount' => $data['amount'],
                    'expense_date' => $data['date']->toDateString(),
                ],
                [
                    'dossier_id' => $dossierId,
                    'category' => $data['category'],
                    'currency' => 'MAD',
                    'payment_method' => match ($data['amount'] > 5000) {
                        true => 'bank_transfer',
                        false => 'cash',
                    },
                    'notes' => 'Depense ' . $data['category'] . ' - ' . ($dossierId ? 'liee au dossier' : 'generale'),
                    'created_by' => $admin?->id,
                ],
            );
            $count++;
        }

        $this->command->info("Seeded {$count} demo expenses.");
    }
}
