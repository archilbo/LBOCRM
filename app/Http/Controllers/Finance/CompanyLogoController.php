<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\UploadCompanyLogoRequest;
use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class CompanyLogoController extends Controller
{
    public function store(UploadCompanyLogoRequest $request): RedirectResponse
    {
        $oldPath = CompanySetting::getValue('company', 'company_logo_path', '');

        if ($oldPath && str_starts_with((string) $oldPath, 'company/')) {
            Storage::disk('public')->delete((string) $oldPath);
        }

        $file = $request->file('logo');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'png');

        $path = $file->storeAs(
            'company',
            'archi-lbo-logo.' . $extension,
            'public'
        );

        CompanySetting::setValue('company', 'company_logo_path', $path, 'string', 'Company logo path');

        return back()->with('success', 'Company logo uploaded successfully.');
    }

    public function destroy(): RedirectResponse
    {
        $oldPath = CompanySetting::getValue('company', 'company_logo_path', '');

        if ($oldPath && str_starts_with((string) $oldPath, 'company/')) {
            Storage::disk('public')->delete((string) $oldPath);
        }

        CompanySetting::setValue('company', 'company_logo_path', '', 'string', 'Company logo path');

        return back()->with('success', 'Company logo removed successfully.');
    }
}