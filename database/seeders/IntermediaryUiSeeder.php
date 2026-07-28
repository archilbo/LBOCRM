<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Intermediary;
use Illuminate\Database\Seeder;
use RuntimeException;

class IntermediaryUiSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::query()->where('slug', 'archi-lbo')->first();
        $branch = $company
            ? Branch::query()->where('company_id', $company->id)->where('code', 'RAK')->first()
            : null;

        if (! $company || ! $branch) {
            throw new RuntimeException('La societe ARCHI LBO et sa branche RAK doivent etre initialisees avant ce seeder.');
        }

        $intermediaries = [
            ['code' => 'INT-UI-001', 'name' => 'Atlas Immobilier', 'type' => 'agency', 'phone' => '+212 5 24 43 12 10', 'email' => 'contact@atlas-immobilier.ma', 'is_active' => true],
            ['code' => 'INT-UI-002', 'name' => 'Cabinet Benali Conseil', 'type' => 'business_referral', 'phone' => '+212 6 12 54 78 90', 'email' => 'contact@benali-conseil.ma', 'is_active' => true],
            ['code' => 'INT-UI-003', 'name' => 'Yasmine Amrani', 'type' => 'person', 'phone' => '+212 6 45 23 11 08', 'email' => 'yasmine.amrani@partner.ma', 'is_active' => true],
            ['code' => 'INT-UI-004', 'name' => 'Studio Ocre Architecture', 'type' => 'architect_partner', 'phone' => '+212 5 24 31 20 20', 'email' => 'bonjour@studio-ocre.ma', 'is_active' => true],
            ['code' => 'INT-UI-005', 'name' => 'Marrakech Habitat', 'type' => 'agency', 'phone' => '+212 5 24 38 90 10', 'email' => 'reseau@marrakech-habitat.ma', 'is_active' => true],
            ['code' => 'INT-UI-006', 'name' => 'Omar Tazi', 'type' => 'person', 'phone' => '+212 6 61 14 22 30', 'email' => 'omar.tazi@partner.ma', 'is_active' => true],
            ['code' => 'INT-UI-007', 'name' => 'Riad Invest', 'type' => 'business_referral', 'phone' => '+212 5 24 45 70 80', 'email' => 'contact@riad-invest.ma', 'is_active' => true],
            ['code' => 'INT-UI-008', 'name' => 'Nour El Fassi', 'type' => 'person', 'phone' => '+212 6 77 35 62 14', 'email' => 'nour.elfassi@partner.ma', 'is_active' => true],
            ['code' => 'INT-UI-009', 'name' => 'Bureau Horizon', 'type' => 'architect_partner', 'phone' => '+212 5 24 29 18 50', 'email' => 'equipe@bureau-horizon.ma', 'is_active' => true],
            ['code' => 'INT-UI-010', 'name' => 'Koutoubia Foncier', 'type' => 'agency', 'phone' => '+212 5 24 40 61 01', 'email' => 'contact@koutoubia-foncier.ma', 'is_active' => true],
            ['code' => 'INT-UI-011', 'name' => 'Agence Palmier', 'type' => 'agency', 'phone' => '+212 5 24 36 44 12', 'email' => 'contact@agence-palmier.ma', 'is_active' => false],
            ['code' => 'INT-UI-012', 'name' => 'Karim Ouhaddou', 'type' => 'business_referral', 'phone' => '+212 6 20 48 72 19', 'email' => 'karim.ouhaddou@partner.ma', 'is_active' => false],
        ];

        foreach ($intermediaries as $intermediary) {
            Intermediary::query()->updateOrCreate(
                ['code' => $intermediary['code']],
                [
                    ...$intermediary,
                    'company_id' => $company->id,
                    'branch_id' => $branch->id,
                    'notes' => 'Jeu de donnees local pour verifier l interface des intermediaires.',
                ],
            );
        }
    }
}
