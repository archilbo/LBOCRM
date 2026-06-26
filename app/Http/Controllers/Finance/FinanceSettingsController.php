<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\UpdateFinanceSettingsRequest;
use App\Services\Finance\FinanceSettingsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FinanceSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Finance/Settings', [
            'settings' => [
                'company_name' => FinanceSettingsService::getCompanyName(),
                'company_address' => FinanceSettingsService::getCompanyAddress(),
                'company_phone' => FinanceSettingsService::getCompanyPhone(),
                'company_email' => FinanceSettingsService::getCompanyEmail(),
                'company_ice' => FinanceSettingsService::getCompanyIce(),
                'company_cin' => FinanceSettingsService::getCompanyCin(),
                'quote_prefix' => FinanceSettingsService::getQuotePrefix(),
                'invoice_prefix' => FinanceSettingsService::getInvoicePrefix(),
                'receipt_prefix' => FinanceSettingsService::getReceiptPrefix(),
                'payment_prefix' => FinanceSettingsService::getPaymentPrefix(),
                'tva_rate' => FinanceSettingsService::getTvaRate(),
                'currency' => FinanceSettingsService::getCurrency(),
                'payment_terms' => FinanceSettingsService::getDefaultPaymentTerms(),
                'payment_days' => FinanceSettingsService::getDefaultPaymentDays(),
                'bank_name' => FinanceSettingsService::getBankName(),
                'bank_rib' => FinanceSettingsService::getBankRib(),
                'bank_iban' => FinanceSettingsService::getBankIban(),
                'bank_bic' => FinanceSettingsService::getBankBic(),
            ],
        ]);
    }

    public function update(UpdateFinanceSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $mappings = [
            'company_name' => ['group' => 'company', 'key' => 'name', 'type' => 'string'],
            'company_address' => ['group' => 'company', 'key' => 'address', 'type' => 'string'],
            'company_phone' => ['group' => 'company', 'key' => 'phone', 'type' => 'string'],
            'company_email' => ['group' => 'company', 'key' => 'email', 'type' => 'string'],
            'company_ice' => ['group' => 'company', 'key' => 'ice', 'type' => 'string'],
            'company_cin' => ['group' => 'company', 'key' => 'cin', 'type' => 'string'],
            'quote_prefix' => ['group' => 'numbering', 'key' => 'quote_prefix', 'type' => 'string'],
            'invoice_prefix' => ['group' => 'numbering', 'key' => 'invoice_prefix', 'type' => 'string'],
            'receipt_prefix' => ['group' => 'numbering', 'key' => 'receipt_prefix', 'type' => 'string'],
            'payment_prefix' => ['group' => 'numbering', 'key' => 'payment_prefix', 'type' => 'string'],
            'tva_rate' => ['group' => 'tax', 'key' => 'tva_rate', 'type' => 'decimal'],
            'currency' => ['group' => 'finance', 'key' => 'currency', 'type' => 'string'],
            'payment_terms' => ['group' => 'finance', 'key' => 'payment_terms', 'type' => 'string'],
            'payment_days' => ['group' => 'finance', 'key' => 'payment_days', 'type' => 'integer'],
            'bank_name' => ['group' => 'bank', 'key' => 'bank_name', 'type' => 'string'],
            'bank_rib' => ['group' => 'bank', 'key' => 'rib', 'type' => 'string'],
            'bank_iban' => ['group' => 'bank', 'key' => 'iban', 'type' => 'string'],
            'bank_bic' => ['group' => 'bank', 'key' => 'bic', 'type' => 'string'],
        ];

        foreach ($mappings as $field => $mapping) {
            if (array_key_exists($field, $data)) {
                FinanceSettingsService::set(
                    $mapping['group'],
                    $mapping['key'],
                    $data[$field],
                    $mapping['type'],
                );
            }
        }

        return redirect()->back()->with('success', 'Paramètres financiers mis à jour avec succès.');
    }
}
