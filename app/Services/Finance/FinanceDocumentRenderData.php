<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\Payment;
use Illuminate\Support\Carbon;

class FinanceDocumentRenderData
{
    public function toArray(FinanceDocument $document): array
    {
        $document->loadMissing(['client', 'dossier', 'dossier.city', 'template', 'items', 'payments', 'sourceDocument']);
        $currency = $document->currency ?: FinanceSettingsService::getCurrency();
        $taxRate = $document->tva_rate !== null && (float) $document->tva_rate > 0
            ? (float) $document->tva_rate
            : FinanceSettingsService::getTvaRate();
        $linkedReceiptPayment = $document->isReceipt()
            ? Payment::query()->where('receipt_document_id', $document->id)->with('document')->first()
            : null;
        $payments = $linkedReceiptPayment
            ? collect([$linkedReceiptPayment])
            : $document->payments->sortByDesc('paid_at')->values();
        $primaryPayment = $payments->first();

        return [
            'company' => [
                'name' => FinanceSettingsService::getCompanyName(),
                'representative' => FinanceSettingsService::getCompanyLegalRepresentative(),
                'address' => FinanceSettingsService::getCompanyAddress(),
                'phone' => FinanceSettingsService::getCompanyPhone(),
                'fax' => FinanceSettingsService::getCompanyFax(),
                'email' => FinanceSettingsService::getCompanyEmail(),
                'ice' => FinanceSettingsService::getCompanyIce(),
                'tva' => (string) FinanceSettingsService::getCompanyTva(),
                'patente' => FinanceSettingsService::getCompanyPatente(),
                'cnss' => FinanceSettingsService::getCompanyCnss(),
                'logo_url' => FinanceSettingsService::getCompanyLogoUrl(),
                'logo_html' => FinanceSettingsService::getCompanyLogoHtml(),
                'legal_line' => FinanceSettingsService::getCompanyLegalLine(),
                'contact_line' => FinanceSettingsService::getCompanyContactLine(),
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
                'tax_rate' => (string) $taxRate,
                'notes' => $document->notes ?? '',
                'terms' => $document->terms ?? '',
            ],
            'client' => [
                'name' => $document->client?->full_name ?? '',
                'identifier' => trim((string) ($document->client?->cin ?: $document->client?->ice ?? '')),
                'cin' => $document->client?->cin ?? '',
                'ice' => $document->client?->ice ?? '',
                'address' => $document->client?->address ?? '',
                'phone' => $document->client?->phone ?? '',
                'email' => $document->client?->email ?? '',
            ],
            'dossier' => [
                'number' => $document->dossier?->dossier_number ?? '',
                'project_object' => $document->dossier?->project_object ?? '',
                'address' => $document->dossier?->project_address ?? '',
                'city' => $document->dossier?->city?->name ?? '',
                'commune' => $document->dossier?->commune ?? '',
                'province' => $document->dossier?->province ?? '',
                'land_title_number' => $document->dossier?->land_title_number ?? '',
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
                'discount_line' => (float) $document->discount_total > 0
                    ? 'Remise : ' . $this->money((float) $document->discount_total, $currency)
                    : '',
                'tax_rate' => (string) $taxRate,
                'tax_total' => $this->money((float) $document->tax_total, $currency),
                'tax_total_raw' => (float) $document->tax_total,
                'total_ttc' => $this->money((float) $document->total_ttc, $currency),
                'total_ttc_raw' => (float) $document->total_ttc,
                'paid_total' => $this->money((float) $document->paid_total, $currency),
                'paid_total_raw' => (float) $document->paid_total,
                'remaining_total' => $this->money((float) $document->remaining_total, $currency),
                'remaining_total_raw' => (float) $document->remaining_total,
                'amount_in_words' => app(FinanceAmountInWords::class)->format((float) $document->total_ttc, $currency),
            ],
            'payments' => $payments
                ->map(fn (Payment $payment) => $this->paymentPayload($payment, $document, $currency))
                ->values()
                ->all(),
            'receipt' => [
                'method' => $primaryPayment?->method ?? '',
                'reference' => $primaryPayment?->reference ?? '',
                'amount_display' => $this->money((float) ($primaryPayment?->amount ?? 0), $currency),
                'date' => $this->date($primaryPayment?->paid_at),
            ],
            'payment' => [
                'method' => $primaryPayment?->method ?? '',
                'reference' => $primaryPayment?->reference ?? '',
                'amount' => $this->money((float) ($primaryPayment?->amount ?? 0), $currency),
                'date' => $this->date($primaryPayment?->paid_at),
            ],
        ];
    }

    private function paymentPayload(Payment $payment, FinanceDocument $document, string $currency): array
    {
        $source = $payment->document ?? $document->sourceDocument;
        $negotiated = $source ? (float) $source->total_ttc : (float) $payment->amount;
        $remaining = $source ? (float) $source->remaining_total : 0.0;
        $object = $payment->notes ?: ($source
            ? 'Règlement ' . $this->typeLabel($source->type) . ' ' . $source->number
            : 'Avance dossier');

        return [
            'payment_number' => $payment->payment_number,
            'amount' => (float) $payment->amount,
            'amount_display' => $this->money((float) $payment->amount, $currency),
            'method' => $payment->method ?? '',
            'reference' => $payment->reference ?? '',
            'paid_at' => $this->date($payment->paid_at),
            'notes' => $payment->notes ?? '',
            'object' => $object,
            'negotiated' => $negotiated,
            'advance' => (float) $payment->amount,
            'remaining' => $remaining,
            'negotiated_display' => $this->money($negotiated, $currency),
            'advance_display' => $this->money((float) $payment->amount, $currency),
            'remaining_display' => $this->money($remaining, $currency),
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
