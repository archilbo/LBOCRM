<?php

namespace Database\Seeders;

use App\Enums\DossierWorkflowStepStatus;
use App\Models\ArchiveRecord;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\DossierWorkflowRequirement;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\Intermediary;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ArchiLboMasterSeeder extends Seeder
{
    public function run(): void
    {
        $admin = \App\Models\User::query()->firstOrCreate(
            ['email' => 'admin@archilbo.local'],
            ['name' => 'ARCHI LBO Admin', 'password' => Hash::make('password')],
        );
        $scope = ['company_id' => $admin->company_id, 'branch_id' => $admin->branch_id];

        \App\Models\User::query()->firstOrCreate(
            ['email' => 'manager@archilbo.local'],
            ['name' => 'Manager User', 'password' => Hash::make('password')],
        );
        \App\Models\User::query()->firstOrCreate(
            ['email' => 'staff@archilbo.local'],
            ['name' => 'Staff User', 'password' => Hash::make('password')],
        );

        $intermediary1 = Intermediary::query()->updateOrCreate(['code' => 'AG-ATLAS'], [
            'name' => 'Agence Immobiliere Atlas', 'type' => 'agency', 'phone' => '0522123456', 'email' => 'atlas@agency.ma',
        ]);
        $intermediary2 = Intermediary::query()->updateOrCreate(['code' => 'CT-BENNANI'], [
            'name' => 'Cabinet M. Bennani', 'type' => 'notaire', 'phone' => '0522987654', 'email' => 'bennani@notaire.ma',
        ]);
        $intermediary3 = Intermediary::query()->updateOrCreate(['code' => 'NONE'], [
            'name' => 'Aucun', 'type' => 'none', 'phone' => null, 'email' => null,
        ]);

        $clientsData = [
            ['fullName' => 'Mohamed Ouknin', 'cin' => 'AB123456', 'phone' => '0612345678', 'email' => 'mohamed@email.ma', 'status' => 'active'],
            ['fullName' => 'Salma El Mansouri', 'cin' => 'CD789012', 'phone' => '0698765432', 'email' => 'salma@email.ma', 'status' => 'active'],
            ['fullName' => 'Hicham Benali', 'cin' => 'EF345678', 'phone' => '0655555555', 'email' => 'hicham@email.ma', 'status' => 'active'],
            ['fullName' => 'Fatima Zahra Alami', 'cin' => 'GH901234', 'phone' => '0644444444', 'email' => 'fatima@email.ma', 'status' => 'inactive'],
            ['fullName' => 'Youssef El Idrissi', 'cin' => 'IJ567890', 'phone' => '0633333333', 'email' => 'youssef@email.ma', 'status' => 'active'],
            ['fullName' => 'Nadia Berrada', 'cin' => 'KL123890', 'phone' => '0622222222', 'email' => 'nadia@email.ma', 'status' => 'archived'],
            ['fullName' => 'Karim Tazi', 'cin' => 'MN456789', 'phone' => '0611111111', 'email' => 'karim@email.ma', 'status' => 'active'],
        ];
        $clients = [];
        foreach ($clientsData as $i => $data) {
            $clients[] = Client::query()->updateOrCreate(
                ['cin' => $data['cin']],
                [
                    'client_number' => 'CL-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                    'civility' => 'Mr',
                    'first_name' => explode(' ', $data['fullName'])[0],
                    'last_name' => explode(' ', $data['fullName'])[1] ?? '',
                    'full_name' => $data['fullName'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'address' => $data['cin'] . ' Rue, Casablanca',
                    'status' => $data['status'],
                    'intermediary_id' => match ($i) {
                        0 => $intermediary1->id,
                        2 => $intermediary2->id,
                        4 => $intermediary1->id,
                        default => $intermediary3->id,
                    },
                ],
            );
        }

        $projectsData = [
            ['client' => 0, 'object' => 'Villa residence Al Amal', 'province' => 'Casablanca', 'commune' => 'Ain Sebaa', 'step' => 'contract', 'status' => 'active'],
            ['client' => 0, 'object' => 'Extension maison familiale', 'province' => 'Casablanca', 'commune' => 'Moulay Rachid', 'step' => 'documents', 'status' => 'opened'],
            ['client' => 1, 'object' => 'Appartement R+3', 'province' => 'Rabat', 'commune' => 'Agdal', 'step' => 'rokhas', 'status' => 'active'],
            ['client' => 1, 'object' => 'Bureau commercial', 'province' => 'Rabat', 'commune' => 'Hay Riad', 'step' => 'bureau_etude', 'status' => 'active'],
            ['client' => 2, 'object' => 'Villa avec piscine', 'province' => 'Marrakech', 'commune' => 'Gueliz', 'step' => 'permis_habiter', 'status' => 'active'],
            ['client' => 2, 'object' => 'Riad traditionnel', 'province' => 'Marrakech', 'commune' => 'Medina', 'step' => 'archive', 'status' => 'active'],
            ['client' => 3, 'object' => 'Terrain constructible', 'province' => 'Tanger', 'commune' => 'Ancien Medina', 'step' => 'contract', 'status' => 'opened'],
            ['client' => 4, 'object' => 'Immeuble R+5', 'province' => 'Fes', 'commune' => 'Atlas', 'step' => 'cahier_chantier', 'status' => 'active'],
            ['client' => 4, 'object' => 'Residence El Firdaous', 'province' => 'Fes', 'commune' => 'Saiss', 'step' => 'bureau_etude', 'status' => 'active'],
            ['client' => 5, 'object' => 'Local commercial', 'province' => 'Casablanca', 'commune' => 'Maarif', 'step' => 'archive', 'status' => 'closed'],
            ['client' => 6, 'object' => 'Villa Al Hanaa', 'province' => 'Casablanca', 'commune' => 'California', 'step' => 'rokhas', 'status' => 'active'],
        ];
        $dossiers = [];
        foreach ($projectsData as $i => $data) {
            $dossier = Dossier::query()->updateOrCreate(
                ['dossier_number' => 'DOS-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT)],
                [
                    'client_id' => $clients[$data['client']]->id,
                    'project_object' => $data['object'],
                    'province' => $data['province'],
                    'commune' => $data['commune'],
                    'status' => $data['status'],
                    'workflow_step' => $data['step'],
                ],
            );
            $dossiers[] = $dossier;
        }

        $templates = [];
        $templateNames = ['CIN', 'Certificat de propriete', 'Plan cadastral', 'Calcul de contenance', 'Plan parcellaire', 'Cahier de chantier', 'Contrat BE', 'Plan beton arme', 'Attestation implantation', 'Contrat topographie', 'Contrat laboratoire', 'Bureau de controle', 'Fiche energetique'];
        foreach ($templateNames as $name) {
            $templates[] = \App\Models\DocumentTemplate::query()->updateOrCreate(
                ['code' => 'TMPL-' . str_replace(' ', '-', $name)],
                ['name' => $name, 'document_type' => 'document', 'is_active' => true],
            );
        }

        $docsData = [
            ['dossier' => 0, 'template' => 0, 'filename' => 'cin_oukmin.pdf', 'status' => 'verified'],
            ['dossier' => 0, 'template' => 1, 'filename' => 'certificat_villa.pdf', 'status' => 'verified'],
            ['dossier' => 0, 'template' => 2, 'filename' => 'plan_cadastral_villa.pdf', 'status' => 'verified'],
            ['dossier' => 1, 'template' => 0, 'filename' => 'cin_oukmin_2.pdf', 'status' => 'uploaded'],
            ['dossier' => 2, 'template' => 0, 'filename' => 'cin_mansouri.pdf', 'status' => 'verified'],
            ['dossier' => 2, 'template' => 1, 'filename' => 'certificat_appart.pdf', 'status' => 'uploaded'],
            ['dossier' => 2, 'template' => 3, 'filename' => 'fiche_energetique_r3.pdf', 'status' => 'verified'],
            ['dossier' => 3, 'template' => 4, 'filename' => 'cahier_chantier_bureau.pdf', 'status' => 'verified'],
            ['dossier' => 4, 'template' => 0, 'filename' => 'cin_benali.pdf', 'status' => 'verified'],
            ['dossier' => 4, 'template' => 1, 'filename' => 'certificat_piscine.pdf', 'status' => 'verified'],
            ['dossier' => 4, 'template' => 2, 'filename' => 'plan_cadastral_piscine.pdf', 'status' => 'uploaded'],
            ['dossier' => 6, 'template' => 0, 'filename' => 'cin_alami.pdf', 'status' => 'missing'],
            ['dossier' => 7, 'template' => 5, 'filename' => 'contrat_be_r5.pdf', 'status' => 'uploaded'],
            ['dossier' => 7, 'template' => 6, 'filename' => 'plan_beton_r5.pdf', 'status' => 'missing'],
            ['dossier' => 10, 'template' => 0, 'filename' => 'cin_tazi.pdf', 'status' => 'verified'],
            ['dossier' => 10, 'template' => 7, 'filename' => 'fiche_energetique_hanaa.pdf', 'status' => 'uploaded'],
        ];
        foreach ($docsData as $data) {
            DossierDocument::query()->updateOrCreate(
                ['dossier_id' => $dossiers[$data['dossier']]->id, 'original_filename' => $data['filename']],
                [
                    'document_template_id' => $templates[$data['template']]->id,
                    'document_number' => 'DOC-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
                    'status' => $data['status'],
                    'stored_path' => $data['status'] !== 'missing' ? 'seed-data/' . $data['filename'] : null,
                ],
            );
        }

        $contractsData = [
            ['dossier' => 0, 'status' => 'signed', 'surface' => 250, 'rate' => 8.5, 'ttc' => 212500],
            ['dossier' => 6, 'status' => 'draft', 'surface' => 500, 'rate' => 7.0, 'ttc' => 350000],
            ['dossier' => 7, 'status' => 'generated', 'surface' => 1200, 'rate' => 6.5, 'ttc' => 780000],
        ];
        foreach ($contractsData as $data) {
            $contractNumber = 'CT-' . str_pad((string) ($data['dossier'] + 1), 4, '0', STR_PAD_LEFT);
            Contract::query()->updateOrCreate(
                ['contract_number' => $contractNumber],
                [
                    'dossier_id' => $dossiers[$data['dossier']]->id,
                    'status' => $data['status'],
                    'surface' => $data['surface'],
                    'fee_rate_percent' => $data['rate'],
                    'ttc' => $data['ttc'],
                ],
            );
        }

        $financeDocsData = [
            ['dossier' => 0, 'client' => 0, 'type' => 'quote', 'status' => 'sent', 'items' => [['label' => 'Honoraires architecture', 'qty' => 1, 'price' => 50000], ['label' => 'Etude de sol', 'qty' => 1, 'price' => 8500]]],
            ['dossier' => 0, 'client' => 0, 'type' => 'invoice', 'status' => 'paid', 'items' => [['label' => 'Acompte 30%', 'qty' => 1, 'price' => 63750]]],
            ['dossier' => 1, 'client' => 0, 'type' => 'quote', 'status' => 'draft', 'items' => [['label' => 'Extension maison', 'qty' => 1, 'price' => 35000]]],
            ['dossier' => 2, 'client' => 1, 'type' => 'invoice', 'status' => 'partially_paid', 'items' => [['label' => 'Honoraires R+3', 'qty' => 1, 'price' => 120000]]],
            ['dossier' => 4, 'client' => 2, 'type' => 'quote', 'status' => 'sent', 'items' => [['label' => 'Villa piscine honoraires', 'qty' => 1, 'price' => 95000], ['label' => 'Piscine etude', 'qty' => 1, 'price' => 15000]]],
            ['dossier' => 4, 'client' => 2, 'type' => 'invoice', 'status' => 'overdue', 'items' => [['label' => 'Acompte villa', 'qty' => 1, 'price' => 44000]]],
            ['dossier' => 5, 'client' => 2, 'type' => 'receipt', 'status' => 'paid', 'items' => [['label' => 'Paiement riad', 'qty' => 1, 'price' => 18000]]],
            ['dossier' => 7, 'client' => 4, 'type' => 'invoice', 'status' => 'sent', 'items' => [['label' => 'Honoraires R+5', 'qty' => 1, 'price' => 200000]]],
            ['dossier' => 10, 'client' => 6, 'type' => 'quote', 'status' => 'draft', 'items' => [['label' => 'Villa Al Hanaa', 'qty' => 1, 'price' => 65000]]],
        ];
        $seedFinanceDocuments = [];
        foreach ($financeDocsData as $financeIndex => $data) {
            $total = collect($data['items'])->sum(fn ($item) => $item['qty'] * $item['price']);
            $number = 'SEED-' . strtoupper($data['type']) . '-' . str_pad((string) ($financeIndex + 1), 3, '0', STR_PAD_LEFT);
            $fin = FinanceDocument::query()->updateOrCreate(
                ['number' => $number],
                [
                    ...$scope,
                    'dossier_id' => $dossiers[$data['dossier']]->id,
                    'type' => $data['type'],
                    'client_id' => $clients[$data['client']]->id,
                    'status' => $data['status'],
                    'subtotal_ht' => $total,
                    'total_ttc' => $total * 1.2,
                    'remaining_total' => $data['status'] === 'paid' ? 0 : ($data['status'] === 'partially_paid' ? $total * 0.3 : $total * 1.2),
                    'paid_total' => $data['status'] === 'paid' ? $total * 1.2 : ($data['status'] === 'partially_paid' ? $total * 1.2 * 0.7 : 0),
                ],
            );
            foreach ($data['items'] as $pos => $itemData) {
                FinanceDocumentItem::query()->updateOrCreate(
                    ['finance_document_id' => $fin->id, 'title' => $itemData['label']],
                    ['position' => $pos + 1, 'quantity' => $itemData['qty'], 'unit_price' => $itemData['price'], 'total_ht' => $itemData['qty'] * $itemData['price']],
                );
            }
            $seedFinanceDocuments[] = $fin;
        }

        $paymentsData = [
            ['dossier' => 0, 'finDocIdx' => 1, 'amount' => 63750, 'method' => 'bank_transfer'],
            ['dossier' => 2, 'finDocIdx' => 3, 'amount' => 84000, 'method' => 'check'],
            ['dossier' => 5, 'finDocIdx' => 6, 'amount' => 18000, 'method' => 'cash'],
        ];
        foreach ($paymentsData as $paymentIndex => $data) {
            $finDoc = $seedFinanceDocuments[$data['finDocIdx']] ?? null;
            if (! $finDoc) {
                continue;
            }
            $client = $clients[$data['dossier']];
            $dossier = $dossiers[$data['dossier']];
            Payment::query()->updateOrCreate(
                ['payment_number' => 'PAY-SEED-' . str_pad((string) ($paymentIndex + 1), 3, '0', STR_PAD_LEFT)],
                [...$scope, 'finance_document_id' => $finDoc->id, 'dossier_id' => $dossier->id, 'client_id' => $client->id, 'amount' => $data['amount'], 'method' => $data['method'], 'paid_at' => now()->subDays(random_int(1, 30))],
            );
        }

        $archivesData = [
            ['dossier' => 5, 'status' => 'stored', 'room' => 'A1', 'shelf' => 'S03', 'box' => 'B012'],
            ['dossier' => 9, 'status' => 'stored', 'room' => 'A2', 'shelf' => 'S01', 'box' => 'B005'],
            ['dossier' => 6, 'status' => 'ready_to_archive', 'room' => null, 'shelf' => null, 'box' => null],
        ];
        foreach ($archivesData as $data) {
            $dossier = $dossiers[$data['dossier']];
            ArchiveRecord::query()->updateOrCreate(
                ['dossier_id' => $dossier->id],
                [
                    'archive_number' => 'ARC-' . date('Y') . '-' . str_pad((string) $dossier->id, 4, '0', STR_PAD_LEFT),
                    'status' => $data['status'],
                    'room' => $data['room'],
                    'shelf' => $data['shelf'],
                    'box' => $data['box'],
                ],
            );
        }

        $workflowRequirementsData = [
            ['dossier' => 0, 'step' => 'documents', 'req' => 'cin', 'done' => true],
            ['dossier' => 0, 'step' => 'documents', 'req' => 'certificat_propriete', 'done' => true],
            ['dossier' => 0, 'step' => 'documents', 'req' => 'terrain_documents', 'done' => true],
            ['dossier' => 0, 'step' => 'contract', 'req' => 'contract_created', 'done' => true],
            ['dossier' => 0, 'step' => 'contract', 'req' => 'contract_generated', 'done' => true],
            ['dossier' => 0, 'step' => 'contract', 'req' => 'contract_signed', 'done' => true],
            ['dossier' => 1, 'step' => 'documents', 'req' => 'cin', 'done' => true],
            ['dossier' => 1, 'step' => 'documents', 'req' => 'certificat_propriete', 'done' => false],
            ['dossier' => 1, 'step' => 'documents', 'req' => 'terrain_documents', 'done' => false],
            ['dossier' => 2, 'step' => 'documents', 'req' => 'cin', 'done' => true],
            ['dossier' => 2, 'step' => 'documents', 'req' => 'certificat_propriete', 'done' => true],
            ['dossier' => 2, 'step' => 'documents', 'req' => 'terrain_documents', 'done' => false],
            ['dossier' => 2, 'step' => 'rokhas', 'req' => 'rokhas_upload', 'done' => true],
            ['dossier' => 2, 'step' => 'rokhas', 'req' => 'fiche_energetique', 'done' => true],
            ['dossier' => 5, 'step' => 'archive', 'req' => 'archive_created', 'done' => true],
            ['dossier' => 5, 'step' => 'archive', 'req' => 'file_stored', 'done' => true],
        ];
        foreach ($workflowRequirementsData as $data) {
            DossierWorkflowRequirement::query()->updateOrCreate(
                ['dossier_id' => $dossiers[$data['dossier']]->id, 'step_key' => $data['step'], 'requirement_key' => $data['req']],
                ['is_done' => $data['done'], 'checked_by' => $admin->id, 'checked_at' => now()],
            );
        }

        $this->command->info('ArchiLboMasterSeeder: ' . count($clients) . ' clients, ' . count($dossiers) . ' dossiers, and related data created.');
    }
}
