<?php

namespace Database\Seeders;

use App\Models\ArchiveRecord;
use App\Models\Authorization;
use App\Models\Client;
use App\Models\Contract;
use App\Models\DocumentTemplate;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\Intermediary;
use Illuminate\Database\Seeder;

class ArchiLboDemoSeeder extends Seeder
{
    public function run(): void
    {
        $none = Intermediary::updateOrCreate(
            ['code' => 'none'],
            [
                'name' => 'None',
                'type' => 'none',
                'is_active' => true,
            ],
        );

        $agency = Intermediary::updateOrCreate(
            ['code' => 'agency'],
            [
                'name' => 'Agency',
                'type' => 'agency',
                'phone' => '+212 5 24 00 00 00',
                'is_active' => true,
            ],
        );

        $client1 = Client::updateOrCreate(
            ['client_number' => 'CL-2026-0001'],
            [
                'intermediary_id' => $none->id,
                'civility' => 'Mr',
                'first_name' => 'Mohamed',
                'last_name' => 'Ouknin',
                'full_name' => 'Mohamed Ouknin',
                'cin' => 'EE123456',
                'phone' => '+212 6 11 22 33 44',
                'email' => 'mohamed.ouknin@email.com',
                'address' => 'Marrakech, Morocco',
                'father_name' => 'Ahmed Ouknin',
                'mother_name' => 'Fatima Ouknin',
                'cni_expiration_date' => '2030-05-12',
                'status' => 'active',
                'notes' => 'Client interested in villa construction project.',
            ],
        );

        $client2 = Client::updateOrCreate(
            ['client_number' => 'CL-2026-0002'],
            [
                'intermediary_id' => $agency->id,
                'civility' => 'Mrs',
                'first_name' => 'Salma',
                'last_name' => 'El Mansouri',
                'full_name' => 'Salma El Mansouri',
                'cin' => 'BK884210',
                'phone' => '+212 6 55 20 10 88',
                'email' => 'salma@email.com',
                'address' => 'Gueliz, Marrakech',
                'father_name' => 'Mustapha El Mansouri',
                'mother_name' => 'Amina El Mansouri',
                'cni_expiration_date' => '2029-01-20',
                'status' => 'active',
                'notes' => 'Renovation project.',
            ],
        );

        $dossier1 = Dossier::updateOrCreate(
            ['dossier_number' => 'DOS-2026-0001'],
            [
                'client_id' => $client1->id,
                'project_object' => 'Villa construction study',
                'description' => 'Architecture study and authorization follow-up.',
                'project_address' => 'Marrakech, Morocco',
                'province' => 'Marrakech',
                'commune' => 'Marrakech',
                'land_title_number' => 'TF-10001',
                'land_surface' => 520,
                'floor_area' => 280,
                'status' => 'active',
                'workflow_step' => 'documents',
                'opened_at' => now()->toDateString(),
                'notes' => 'Demo dossier.',
            ],
        );

        $dossier2 = Dossier::updateOrCreate(
            ['dossier_number' => 'DOS-2026-0002'],
            [
                'client_id' => $client2->id,
                'project_object' => 'Apartment renovation',
                'description' => 'Apartment renovation authorization.',
                'project_address' => 'Gueliz, Marrakech',
                'province' => 'Marrakech',
                'commune' => 'Gueliz',
                'land_title_number' => 'TF-20002',
                'land_surface' => 180,
                'floor_area' => 140,
                'status' => 'active',
                'workflow_step' => 'contract',
                'opened_at' => now()->subDays(2)->toDateString(),
                'notes' => 'Demo dossier.',
            ],
        );

        $templates = [
            ['code' => 'cin', 'name' => 'CIN copy', 'sort_order' => 1],
            ['code' => 'ownership_certificate', 'name' => 'Ownership certificate', 'sort_order' => 2],
            ['code' => 'cadastral_plan', 'name' => 'Cadastral plan', 'sort_order' => 3],
            ['code' => 'surface_attestation', 'name' => 'Surface attestation', 'document_type' => 'generated_document', 'sort_order' => 4],
        ];

        foreach ($templates as $template) {
            DocumentTemplate::updateOrCreate(
                ['code' => $template['code']],
                [
                    'name' => $template['name'],
                    'document_type' => $template['document_type'] ?? 'required_document',
                    'is_required' => true,
                    'is_active' => true,
                    'sort_order' => $template['sort_order'],
                ],
            );
        }

        $cinTemplate = DocumentTemplate::where('code', 'cin')->first();
        $ownershipTemplate = DocumentTemplate::where('code', 'ownership_certificate')->first();

        DossierDocument::updateOrCreate(
            [
                'dossier_id' => $dossier1->id,
                'document_template_id' => $cinTemplate?->id,
            ],
            [
                'document_number' => 'DOC-2026-0001',
                'original_filename' => 'cin-mohamed-ouknin.pdf',
                'stored_path' => 'demo/documents/cin-mohamed-ouknin.pdf',
                'mime_type' => 'application/pdf',
                'size_bytes' => 250000,
                'status' => 'verified',
                'uploaded_at' => now(),
                'verified_at' => now(),
            ],
        );

        DossierDocument::updateOrCreate(
            [
                'dossier_id' => $dossier1->id,
                'document_template_id' => $ownershipTemplate?->id,
            ],
            [
                'document_number' => 'DOC-2026-0002',
                'original_filename' => 'ownership-certificate.pdf',
                'stored_path' => 'demo/documents/ownership-certificate.pdf',
                'mime_type' => 'application/pdf',
                'size_bytes' => 340000,
                'status' => 'uploaded',
                'uploaded_at' => now(),
            ],
        );

        Contract::updateOrCreate(
            ['contract_number' => 'CTR-2026-0001'],
            [
                'dossier_id' => $dossier1->id,
                'status' => 'draft',
                'surface' => 280,
                'price_per_square_meter' => 120,
                'ht' => 28000,
                'tva' => 5600,
                'ttc' => 33600,
                'notes' => 'Demo contract.',
            ],
        );

        Contract::updateOrCreate(
            ['contract_number' => 'CTR-2026-0002'],
            [
                'dossier_id' => $dossier2->id,
                'status' => 'generated',
                'surface' => 140,
                'price_per_square_meter' => 120,
                'ht' => 14000,
                'tva' => 2800,
                'ttc' => 16800,
                'generated_at' => now()->subDay(),
                'notes' => 'Demo contract.',
            ],
        );

        Authorization::updateOrCreate(
            ['submission_number' => 'SUB-2026-0142'],
            [
                'dossier_id' => $dossier1->id,
                'authorization_number' => null,
                'authority_name' => 'Commune de Marrakech',
                'authority_type' => 'commune',
                'status' => 'submitted',
                'submitted_at' => now()->toDateString(),
                'receipt_path' => 'demo/authorizations/receipt-dos-2026-0001.pdf',
            ],
        );

        ArchiveRecord::updateOrCreate(
            ['archive_number' => 'ARC-2026-0001'],
            [
                'dossier_id' => $dossier2->id,
                'status' => 'stored',
                'room' => 'Archive room A',
                'shelf' => 'Shelf 01',
                'box' => 'Box 2026-A',
                'folder' => 'Folder 002',
                'in_date' => now()->toDateString(),
                'notes' => 'Demo archive record.',
            ],
        );
    }
}
