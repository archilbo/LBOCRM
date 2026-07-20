<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use App\Models\FinanceDocumentItem;
use App\Models\FinanceTemplate;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FinanceDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        $client = Client::first();
        $dossier = Dossier::first();
        $template = FinanceTemplate::first();

        if (! $admin || ! $client || ! $dossier || ! $template) {
            $this->command?->error('Missing prerequisite records (user, client, dossier, template).');
            return;
        }

        $now = Carbon::now();

        // ──── Invoice ────
        $invoice = FinanceDocument::updateOrCreate(
            ['number' => 'FAC-DEMO-001'],
            [
                'company_id' => $admin->company_id,
                'branch_id' => $admin->branch_id,
                'type' => 'invoice',
                'status' => 'sent',
                'client_id' => $client->id,
                'dossier_id' => $dossier->id,
                'issue_date' => $now->copy()->subDays(10),
                'due_date' => $now->copy()->subDays(5)->addMonth(),
                'valid_until' => null,
                'currency' => 'MAD',
                'tva_rate' => 20,
                'notes' => 'Honoraires pour mission de suivi de chantier.',
                'terms' => 'Paiement à reception. Délai de paiement : 30 jours.',
                'template_id' => $template->id,
                'created_by' => $admin->id,
            ],
        );

        // Items for invoice
        $invoiceItems = [
            ['title' => 'Mission de suivi de chantier - Lot gros oeuvre', 'description' => 'Suivi hebdomadaire du chantier Residence Al Warda', 'quantity' => 1, 'unit' => 'forfait', 'unit_price' => 50000],
            ['title' => 'Etude de structure complémentaire', 'description' => 'Calculs structurels pour le R+2', 'quantity' => 1, 'unit' => 'forfait', 'unit_price' => 15000],
            ['title' => 'Frais de déplacement', 'description' => 'Deplacements sur site (30km x 10 visites)', 'quantity' => 300, 'unit' => 'km', 'unit_price' => 3.50],
        ];

        $this->createItems($invoice, $invoiceItems);
        $invoice->recalculateTotals()->save();

        // Payment for invoice
        Payment::updateOrCreate(
            ['payment_number' => 'PAY-DEMO-001'],
            [
                'company_id' => $admin->company_id,
                'branch_id' => $admin->branch_id,
                'finance_document_id' => $invoice->id,
                'client_id' => $client->id,
                'dossier_id' => $dossier->id,
                'amount' => 35000,
                'method' => 'bank_transfer',
                'reference' => 'VIREMENT-2026-001',
                'paid_at' => $now->copy()->subDays(5),
                'notes' => 'Premier versement',
            ],
        );

        $invoice->updatePaymentTotals()->save();

        // ──── Quote ────
        $quote = FinanceDocument::updateOrCreate(
            ['number' => 'DEV-DEMO-001'],
            [
                'company_id' => $admin->company_id,
                'branch_id' => $admin->branch_id,
                'type' => 'quote',
                'status' => 'draft',
                'client_id' => $client->id,
                'dossier_id' => $dossier->id,
                'issue_date' => $now->copy()->subDays(3),
                'due_date' => null,
                'valid_until' => $now->copy()->addDays(27),
                'currency' => 'MAD',
                'tva_rate' => 20,
                'notes' => 'Devis pour mission complete de maitrise d\'oeuvre.',
                'terms' => 'Valable 30 jours. Paiement echelonne selon planning.',
                'template_id' => $template->id,
                'created_by' => $admin->id,
            ],
        );

        $quoteItems = [
            ['title' => 'Etude de faisabilite', 'description' => 'Analyse du terrain et etude de faisabilite technique', 'quantity' => 1, 'unit' => 'forfait', 'unit_price' => 25000],
            ['title' => 'Plans architecte RDC', 'description' => 'Plans d\'architecture pour le rez-de-chaussee', 'quantity' => 1, 'unit' => 'forfait', 'unit_price' => 18000],
            ['title' => 'Plans architecte Etage', 'description' => 'Plans d\'architecture pour le 1er etage', 'quantity' => 1, 'unit' => 'forfait', 'unit_price' => 15000],
            ['title' => 'Dossier permis de construire', 'description' => 'Constitution et depot du dossier de permis de construire', 'quantity' => 1, 'unit' => 'forfait', 'unit_price' => 12000],
        ];

        $this->createItems($quote, $quoteItems);
        $quote->recalculateTotals()->save();

        $this->command?->info(sprintf(
            'Finance demo data: invoice #%s (id=%d, total=%.2f), quote #%s (id=%d, total=%.2f)',
            $invoice->number, $invoice->id, $invoice->total_ttc,
            $quote->number, $quote->id, $quote->total_ttc,
        ));
    }

    private function createItems(FinanceDocument $document, array $items): void
    {
        $document->items()->delete();
        foreach (array_values($items) as $pos => $data) {
            $item = new FinanceDocumentItem([
                'position' => $pos + 1,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'quantity' => $data['quantity'],
                'unit' => $data['unit'] ?? null,
                'unit_price' => $data['unit_price'],
            ]);
            $item->total_ht = $item->quantity * $item->unit_price;
            $item->total_tva = $item->total_ht * ($document->tva_rate / 100);
            $item->total_ttc = $item->total_ht + $item->total_tva;
            $document->items()->save($item);
        }
    }
}
