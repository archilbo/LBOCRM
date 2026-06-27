<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\UpdateFinanceSettingsRequest;
use App\Models\CompanySetting;
use App\Services\Finance\FinanceSettingsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FinanceSettingsController extends Controller
{
    public function index(FinanceSettingsService $settings): Response
    {
        return Inertia::render('Finance/Settings/Index', [
            'settings' => $settings->allGrouped(),
            'routes' => [
                'update' => route('finance.settings.update'),
                'reset' => route('finance.settings.reset'),
                'templates' => route('finance.templates.index'),
                'finance' => route('finance.index'),
                'uploadLogo' => route('finance.settings.logo.store'),
                'deleteLogo' => route('finance.settings.logo.destroy'),
            ],
        ]);
    }

    public function update(UpdateFinanceSettingsRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $finance = $data['finance'] ?? [];
        $company = $data['company'] ?? [];
        $bank = $data['bank'] ?? [];

        CompanySetting::setValue('finance', 'default_tva_rate', $finance['default_tva_rate'] ?? 20, 'decimal', 'Default TVA rate');
        CompanySetting::setValue('finance', 'default_currency', $finance['default_currency'] ?? 'MAD', 'string', 'Default currency');
        CompanySetting::setValue('finance', 'default_payment_terms_days', $finance['default_payment_terms_days'] ?? 30, 'integer', 'Payment terms days');
        CompanySetting::setValue('finance', 'default_quote_validity_days', $finance['default_quote_validity_days'] ?? 30, 'integer', 'Quote validity days');
        CompanySetting::setValue('finance', 'default_unit_price_m2', $finance['default_unit_price_m2'] ?? 900, 'decimal', 'Default unit price m2');
        CompanySetting::setValue('finance', 'default_architect_rate', $finance['default_architect_rate'] ?? 0.5, 'decimal', 'Default architect rate');

        CompanySetting::setValue('company', 'company_name', $company['company_name'] ?? '', 'string', 'Company name');
        CompanySetting::setValue('company', 'company_address', $company['company_address'] ?? '', 'string', 'Company address');
        CompanySetting::setValue('company', 'company_phone', $company['company_phone'] ?? '', 'string', 'Company phone');
        CompanySetting::setValue('company', 'company_email', $company['company_email'] ?? '', 'string', 'Company email');
        CompanySetting::setValue('company', 'company_ice', $company['company_ice'] ?? '', 'string', 'ICE');
        CompanySetting::setValue('company', 'company_tva', $company['company_tva'] ?? '', 'string', 'TVA');
        CompanySetting::setValue('company', 'company_patente', $company['company_patente'] ?? '', 'string', 'Patente');
        CompanySetting::setValue('company', 'company_cnss', $company['company_cnss'] ?? '', 'string', 'CNSS');
        CompanySetting::setValue('company', 'company_logo_path', $company['company_logo_path'] ?? '', 'string', 'Logo path');

        CompanySetting::setValue('bank', 'bank_name', $bank['bank_name'] ?? '', 'string', 'Bank name');
        CompanySetting::setValue('bank', 'bank_rib', $bank['bank_rib'] ?? '', 'string', 'Bank RIB');

        return redirect()
            ->route('finance.settings.index')
            ->with('success', 'Finance settings updated successfully.');
    }

    public function reset(): RedirectResponse
    {
        CompanySetting::setValue('finance', 'default_tva_rate', 20, 'decimal', 'Default TVA rate');
        CompanySetting::setValue('finance', 'default_currency', 'MAD', 'string', 'Default currency');
        CompanySetting::setValue('finance', 'default_payment_terms_days', 30, 'integer', 'Payment terms days');
        CompanySetting::setValue('finance', 'default_quote_validity_days', 30, 'integer', 'Quote validity days');
        CompanySetting::setValue('finance', 'default_unit_price_m2', 900, 'decimal', 'Default unit price m2');
        CompanySetting::setValue('finance', 'default_architect_rate', 0.5, 'decimal', 'Default architect rate');

        return redirect()
            ->route('finance.settings.index')
            ->with('success', 'Finance defaults reset successfully.');
    }
}