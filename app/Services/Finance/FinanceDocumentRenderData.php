<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use Illuminate\Support\Carbon;

class FinanceDocumentRenderData
{
    public function toArray(FinanceDocument $document): array
    {
        $document->loadMissing(['client', 'dossier', 'template', 'items', 'payments']);
        $currency = $document->currency ?: FinanceSettingsService::getCurrency();

        return [
            'company' => [
                'name' => FinanceSettingsService::getCompanyName(),
                'address' => FinanceSettingsService::getCompanyAddress(),
                'phone' => FinanceSettingsService::getCompanyPhone(),
                'email' => FinanceSettingsService::getCompanyEmail(),
                'ice' => FinanceSettingsService::getCompanyIce(),
                'tva' => (string) FinanceSettingsService::getTvaRate(),
                'patente' => (string) FinanceSettingsService::get('company', 'patente', ''),
                'cnss' => (string) FinanceSettingsService::get('company', 'cnss', ''),
                'logo_path' => (string) FinanceSettingsService::get('company', 'logo_path', ''),
            ],
            'bank' => [
                'name' => FinanceSettingsService::getBankName(),
                'rib' => FinanceSettingsService::getBankRib(),
            ],
            'document' => [
                'id' => $document->id,
                'type' => $document->type,
                'type_label' => $this->typeLabel($document->type),
                'number' => $document->number,
                'status' => $document->status,
                'issue_date' => $this->date($document->issue_date),
                'due_date' => $this->date($document->due_date),
                'valid_until' => $this->date($document->valid_until),
                'currency' => $currency,
                'notes' => $document->notes ?? '',
                'terms' => $document->terms ?? '',
            ],
            'client' => [
                'name' => $document->client?->full_name ?? '',
                'cin' => $document->client?->cin ?? '',
                'address' => $document->client?->address ?? '',
                'phone' => $document->client?->phone ?? '',
                'email' => $document->client?->email ?? '',
            ],
            'dossier' => [
                'number' => $document->dossier?->dossier_number ?? '',
                'project_object' => $document->dossier?->project_object ?? '',
                'address' => $document->dossier?->project_address ?? '',
                'commune' => $document->dossier?->commune ?? '',
                'province' => $document->dossier?->province ?? '',
            ],
            'items' => $document->items
                ->sortBy('position')
                ->values()
                ->map(fn ($item) => [
                    'position' => $item->position,
                    'title' => $item->title ?? '',
                    'description' => $item->description ?? '',
                    'quantity' => (float) $item->quantity,
                    'unit' => $item->unit ?? '',
                    'unit_price' => (float) $item->unit_price,
                    'unit_price_display' => $this->money((float) $item->unit_price, $currency),
                    'total_ht' => (float) $item->total_ht,
                    'total_ht_display' => $this->money((float) $item->total_ht, $currency),
                    'total_tva' => (float) $item->total_tva,
                    'total_tva_display' => $this->money((float) $item->total_tva, $currency),
                    'total_ttc' => (float) $item->total_ttc,
                    'total_ttc_display' => $this->money((float) $item->total_ttc, $currency),
                ])->all(),
            'totals' => [
                'subtotal_ht' => $this->money((float) $document->subtotal_ht, $currency),
                'subtotal_ht_raw' => (float) $document->subtotal_ht,
                'discount_total' => $this->money((float) $document->discount_total, $currency),
                'discount_total_raw' => (float) $document->discount_total,
                'tax_total' => $this->money((float) $document->tax_total, $currency),
                'tax_total_raw' => (float) $document->tax_total,
                'total_ttc' => $this->money((float) $document->total_ttc, $currency),
                'total_ttc_raw' => (float) $document->total_ttc,
                'paid_total' => $this->money((float) $document->paid_total, $currency),
                'paid_total_raw' => (float) $document->paid_total,
                'remaining_total' => $this->money((float) $document->remaining_total, $currency),
                'remaining_total_raw' => (float) $document->remaining_total,
            ],
            'payments' => $document->payments
                ->sortByDesc('paid_at')
                ->values()
                ->map(fn ($payment) => [
                    'payment_number' => $payment->payment_number,
                    'amount' => (float) $payment->amount,
                    'amount_display' => $this->money((float) $payment->amount, $currency),
                    'method' => $payment->method ?? '',
                    'reference' => $payment->reference ?? '',
                    'paid_at' => $this->date($payment->paid_at),
                    'notes' => $payment->notes ?? '',
                ])->all(),
        ];
    }

    public function money(float $amount, string $currency): string
    {
        return number_format($amount, 2, '.', ' ') . ' ' . $currency;
    }

    private function date(mixed $date): string
    {
        if (!$date) {
            return '';
        }

        return Carbon::parse($date)->format('d/m/Y');
    }

    private function typeLabel(string $type): string
    {
        return match ($type) {
            'quote' => 'Devis',
            'invoice' => 'Facture',
            'receipt' => 'Recu',
            default => ucfirst($type),
        };
    }
}
