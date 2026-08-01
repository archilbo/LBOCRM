<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\UploadCompanyLogoRequest;
use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CompanyLogoController extends Controller
{
    public function store(UploadCompanyLogoRequest $request): RedirectResponse
    {
        abort_unless($request->user()->can('finance.settings.update') || $request->user()->can('manage finance'), 403);
        $file = $request->file('logo');
        $extension = strtolower($file->extension() ?: 'png');

        $path = $file->storeAs(
            'company/logos',
            'archi-lbo-logo-' . Str::uuid() . '.' . $extension,
            'public'
        );

        $oldPath = (string) CompanySetting::getValue('company', 'company_logo_path', '');

        try {
            CompanySetting::setValue('company', 'company_logo_path', $path, 'string', 'Company logo path');
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($path);

            throw $exception;
        }

        if ($this->isManagedLogo($oldPath) && $oldPath !== $path) {
            Storage::disk('public')->delete($oldPath);
        }

        return back()->with('success', 'Company logo uploaded successfully.');
    }

    public function destroy(): RedirectResponse
    {
        abort_unless(request()->user()->can('finance.settings.update') || request()->user()->can('manage finance'), 403);
        $oldPath = CompanySetting::getValue('company', 'company_logo_path', '');

        if ($this->isManagedLogo((string) $oldPath)) {
            Storage::disk('public')->delete((string) $oldPath);
        }

        CompanySetting::setValue('company', 'company_logo_path', '', 'string', 'Company logo path');

        return back()->with('success', 'Company logo removed successfully.');
    }

    private function isManagedLogo(string $path): bool
    {
        return str_starts_with($path, 'company/');
    }
}
