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
        $factory = app(DefaultFinanceTemplateFactory::class);

        $defaultQuote = FinanceTemplate::updateOrCreate(
            ['slug' => 'default-quote'],
            array_merge($factory->quote(), ['slug' => 'default-quote', 'created_by' => $admin?->id]),
        );

        $defaultInvoice = FinanceTemplate::updateOrCreate(
            ['slug' => 'default-invoice'],
            array_merge($factory->invoice(), ['slug' => 'default-invoice', 'created_by' => $admin?->id]),
        );

        $defaultReceipt = FinanceTemplate::updateOrCreate(
            ['slug' => 'default-receipt'],
            array_merge($factory->receipt(), ['slug' => 'default-receipt', 'created_by' => $admin?->id]),
        );

        $this->command?->info('Default document templates seeded.');
        $this->command?->info("  - Quote: {$defaultQuote->slug}");
        $this->command?->info("  - Invoice: {$defaultInvoice->slug}");
        $this->command?->info("  - Receipt: {$defaultReceipt->slug}");
    }

    private function getDefaultQuoteHtml(): string
    {
        return <<<'HTML'
<div class="document">
  <div class="header">
    <div class="company-info">
      <h1>{{company_name}}</h1>
      <p>{{company_address}}</p>
      <p>Tél: {{company_phone}}</p>
      <p>Email: {{company_email}}</p>
      <p>ICE: {{company_ice}}</p>
    </div>
    <div class="document-title">
      <h2>DEVIS</h2>
      <p>N° {{document_number}}</p>
      <p>Date: {{issue_date}}</p>
      <p>Valable jusqu'au: {{valid_until}}</p>
    </div>
  </div>

  <div class="client-info">
    <h3>Client</h3>
    <p><strong>{{client_civility}}</strong> {{client_name}}</p>
    <p>{{client_address}}</p>
    <p>Tél: {{client_phone}} | Email: {{client_email}}</p>
    <p>CIN: {{client_cin}} | ICE: {{client_ice}}</p>
    <p>Dossier: {{dossier_number}}</p>
  </div>

  <div class="project-info">
    <p><strong>Objet:</strong> {{project_object}}</p>
    <p><strong>Adresse projet:</strong> {{project_address}}</p>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Désignation</th>
        <th>Qté</th>
        <th>PU HT</th>
        <th>Total HT</th>
      </tr>
    </thead>
    <tbody>
      {{items_rows}}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="text-right">Total HT</td>
        <td class="text-right">{{total_ht}}</td>
      </tr>
      <tr>
        <td colspan="3" class="text-right">TVA ({{tva_rate}}%)</td>
        <td class="text-right">{{tax_total}}</td>
      </tr>
      <tr class="total">
        <td colspan="3" class="text-right">Total TTC</td>
        <td class="text-right">{{total_ttc}}</td>
      </tr>
    </tfoot>
  </table>

  <div class="terms">
    <h4>Conditions</h4>
    <p>{{payment_terms}}</p>
  </div>

  <div class="bank-info">
    <h4>Coordonnées bancaires</h4>
    <p>{{bank_name}} - RIB: {{bank_rib}}</p>
    <p>IBAN: {{bank_iban}} - BIC: {{bank_bic}}</p>
  </div>
</div>
HTML;
    }

    private function getDefaultInvoiceHtml(): string
    {
        return <<<'HTML'
<div class="document">
  <div class="header">
    <div class="company-info">
      <h1>{{company_name}}</h1>
      <p>{{company_address}}</p>
      <p>Tél: {{company_phone}}</p>
      <p>Email: {{company_email}}</p>
      <p>ICE: {{company_ice}}</p>
    </div>
    <div class="document-title">
      <h2>FACTURE</h2>
      <p>N° {{document_number}}</p>
      <p>Date d'émission: {{issue_date}}</p>
      <p>Échéance: {{due_date}}</p>
    </div>
  </div>

  <div class="client-info">
    <h3>Client</h3>
    <p><strong>{{client_civility}}</strong> {{client_name}}</p>
    <p>{{client_address}}</p>
    <p>Tél: {{client_phone}} | Email: {{client_email}}</p>
    <p>CIN: {{client_cin}} | ICE: {{client_ice}}</p>
    <p>Dossier: {{dossier_number}}</p>
  </div>

  <div class="project-info">
    <p><strong>Objet:</strong> {{project_object}}</p>
    <p><strong>Adresse projet:</strong> {{project_address}}</p>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Désignation</th>
        <th>Qté</th>
        <th>PU HT</th>
        <th>Total HT</th>
      </tr>
    </thead>
    <tbody>
      {{items_rows}}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="text-right">Total HT</td>
        <td class="text-right">{{total_ht}}</td>
      </tr>
      <tr>
        <td colspan="3" class="text-right">TVA ({{tva_rate}}%)</td>
        <td class="text-right">{{tax_total}}</td>
      </tr>
      <tr class="total">
        <td colspan="3" class="text-right">Total TTC</td>
        <td class="text-right">{{total_ttc}}</td>
      </tr>
      <tr>
        <td colspan="3" class="text-right">Montant payé</td>
        <td class="text-right">{{paid_total}}</td>
      </tr>
      <tr>
        <td colspan="3" class="text-right">Reste à payer</td>
        <td class="text-right">{{remaining_total}}</td>
      </tr>
    </tfoot>
  </table>

  <div class="terms">
    <h4>Conditions de paiement</h4>
    <p>{{payment_terms}} — Délai: {{payment_days}} jours</p>
  </div>

  <div class="bank-info">
    <h4>Coordonnées bancaires</h4>
    <p>{{bank_name}} - RIB: {{bank_rib}}</p>
    <p>IBAN: {{bank_iban}} - BIC: {{bank_bic}}</p>
  </div>
</div>
HTML;
    }

    private function getDefaultReceiptHtml(): string
    {
        return <<<'HTML'
<div class="document">
  <div class="header">
    <div class="company-info">
      <h1>{{company_name}}</h1>
      <p>{{company_address}}</p>
      <p>Tél: {{company_phone}}</p>
      <p>Email: {{company_email}}</p>
      <p>ICE: {{company_ice}}</p>
    </div>
    <div class="document-title">
      <h2>REÇU</h2>
      <p>N° {{document_number}}</p>
      <p>Date: {{issue_date}}</p>
    </div>
  </div>

  <div class="client-info">
    <h3>Reçu de la part de</h3>
    <p><strong>{{client_civility}}</strong> {{client_name}}</p>
    <p>{{client_address}}</p>
    <p>Tél: {{client_phone}} | Email: {{client_email}}</p>
    <p>Dossier: {{dossier_number}}</p>
  </div>

  <div class="payment-detail">
    <p><strong>Montant reçu:</strong> {{amount}} {{currency}}</p>
    <p><strong>Mode de paiement:</strong> {{payment_method}}</p>
    <p><strong>Référence:</strong> {{payment_reference}}</p>
    <p><strong>Objet:</strong> {{payment_description}}</p>
  </div>

  <div class="project-info">
    <p><strong>Projet:</strong> {{project_object}}</p>
    <p><strong>Adresse:</strong> {{project_address}}</p>
  </div>

  <div class="bank-info">
    <h4>Coordonnées bancaires</h4>
    <p>{{bank_name}} - RIB: {{bank_rib}}</p>
    <p>IBAN: {{bank_iban}} - BIC: {{bank_bic}}</p>
  </div>
</div>
HTML;
    }

    private function getDefaultDocumentCss(): string
    {
        return <<<'CSS'
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; line-height: 1.5; padding: 20px; }
.document { max-width: 210mm; margin: 0 auto; }
.header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #1a365d; padding-bottom: 15px; }
.company-info h1 { font-size: 18pt; color: #1a365d; margin-bottom: 5px; }
.company-info p { font-size: 9pt; color: #555; margin: 1px 0; }
.document-title { text-align: right; }
.document-title h2 { font-size: 16pt; color: #1a365d; margin-bottom: 5px; }
.client-info, .project-info { margin: 15px 0; }
.client-info h3 { font-size: 11pt; color: #1a365d; margin-bottom: 5px; }
table.items { width: 100%; border-collapse: collapse; margin: 20px 0; }
table.items th { background: #1a365d; color: #fff; padding: 8px 10px; text-align: left; font-size: 9pt; }
table.items td { padding: 6px 10px; border-bottom: 1px solid #ddd; font-size: 9pt; }
table.items tbody tr:nth-child(even) { background: #f7fafc; }
.text-right { text-align: right; }
tfoot td { font-weight: bold; padding: 6px 10px; font-size: 9pt; }
tfoot .total td { font-size: 11pt; color: #1a365d; border-top: 2px solid #1a365d; }
.terms, .bank-info, .payment-detail { margin: 15px 0; padding: 10px; background: #f7fafc; border-radius: 4px; }
.terms h4, .bank-info h4, .payment-detail h4 { font-size: 10pt; color: #1a365d; margin-bottom: 5px; }
CSS;
    }
}
