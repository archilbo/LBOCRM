<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use App\Models\FinanceTemplate;
use App\Models\User;
use App\Services\Finance\DefaultFinanceTemplateFactory;
use Illuminate\Database\Seeder;

class FinanceFoundationSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedCompanySettings();
        $this->seedDefaultTemplate();
    }

    private function seedCompanySettings(): void
    {
        CompanySetting::updateOrCreate(
            ['group' => 'company', 'key' => 'name'],
            ['value' => 'ARCHI LBO', 'type' => 'string', 'label' => 'Raison sociale', 'description' => 'Nom officiel de la société', 'is_public' => true],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'company', 'key' => 'address'],
            ['value' => '', 'type' => 'string', 'label' => 'Adresse', 'description' => 'Adresse complète de la société'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'company', 'key' => 'phone'],
            ['value' => '', 'type' => 'string', 'label' => 'Téléphone', 'description' => 'Numéro de téléphone de la société'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'company', 'key' => 'email'],
            ['value' => '', 'type' => 'string', 'label' => 'Email', 'description' => 'Email de la société'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'company', 'key' => 'ice'],
            ['value' => '', 'type' => 'string', 'label' => 'ICE', 'description' => 'Identifiant Commun de l\'Entreprise'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'company', 'key' => 'cin'],
            ['value' => '', 'type' => 'string', 'label' => 'CIN', 'description' => 'Carte d\'Identité Nationale du gérant'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'numbering', 'key' => 'quote_prefix'],
            ['value' => 'DEV', 'type' => 'string', 'label' => 'Préfixe devis', 'description' => 'Préfixe pour la numérotation des devis'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'numbering', 'key' => 'invoice_prefix'],
            ['value' => 'INV', 'type' => 'string', 'label' => 'Préfixe facture', 'description' => 'Préfixe pour la numérotation des factures'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'numbering', 'key' => 'receipt_prefix'],
            ['value' => 'REC', 'type' => 'string', 'label' => 'Préfixe reçu', 'description' => 'Préfixe pour la numérotation des reçus'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'numbering', 'key' => 'payment_prefix'],
            ['value' => 'PAY', 'type' => 'string', 'label' => 'Préfixe paiement', 'description' => 'Préfixe pour la numérotation des paiements'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'tax', 'key' => 'tva_rate'],
            ['value' => '20', 'type' => 'decimal', 'label' => 'Taux TVA (%)', 'description' => 'Taux de TVA par défaut appliqué aux documents'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'finance', 'key' => 'currency'],
            ['value' => 'MAD', 'type' => 'string', 'label' => 'Devise', 'description' => 'Devise par défaut'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'finance', 'key' => 'payment_terms'],
            ['value' => 'Paiement à réception', 'type' => 'string', 'label' => 'Conditions de paiement', 'description' => 'Conditions de paiement par défaut'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'finance', 'key' => 'payment_days'],
            ['value' => '30', 'type' => 'integer', 'label' => 'Délai de paiement (jours)', 'description' => 'Nombre de jours pour le paiement'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'bank', 'key' => 'bank_name'],
            ['value' => '', 'type' => 'string', 'label' => 'Banque', 'description' => 'Nom de la banque'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'bank', 'key' => 'rib'],
            ['value' => '', 'type' => 'string', 'label' => 'RIB', 'description' => 'Relevé d\'Identité Bancaire'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'bank', 'key' => 'iban'],
            ['value' => '', 'type' => 'string', 'label' => 'IBAN', 'description' => 'International Bank Account Number'],
        );

        CompanySetting::updateOrCreate(
            ['group' => 'bank', 'key' => 'bic'],
            ['value' => '', 'type' => 'string', 'label' => 'BIC/SWIFT', 'description' => 'Code BIC de la banque'],
        );

        $this->command?->info('Company settings seeded: ' . CompanySetting::count() . ' settings');
    }

    private function seedDefaultTemplate(): void
    {
        $admin = User::first();
        $scope = ['company_id' => $admin?->company_id, 'branch_id' => $admin?->branch_id];
        $factory = app(DefaultFinanceTemplateFactory::class);

        $created = [];

        foreach (['quote', 'invoice', 'receipt'] as $type) {
            $definition = $factory->forType($type);
            $existing = FinanceTemplate::query()
                ->where($scope)
                ->where('slug', $definition['slug'])
                ->exists();

            if ($existing) {
                continue;
            }

            // Never steal the user's chosen default: only become default when
            // no default already exists for this document type.
            $hasDefault = FinanceTemplate::query()
                ->where($scope)
                ->where('type', $type)
                ->where('is_default', true)
                ->exists();

            FinanceTemplate::create([
                ...$scope,
                ...$definition,
                'is_default' => ! $hasDefault,
                'created_by' => $admin?->id,
            ]);

            $created[] = $type;
        }

        $this->command?->info('Default document templates seeded: ' . ($created === [] ? 'none (all already present)' : implode(', ', $created)));
    }
}
