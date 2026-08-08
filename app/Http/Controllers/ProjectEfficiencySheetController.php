<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEfficiencySheetRequest;
use App\Http\Requests\UpdateEfficiencySheetRequest;
use App\Models\AuditLog;
use App\Models\Dossier;
use App\Models\ProjectEfficiencySheet;
use App\Services\CompanyContext;
use App\Services\Finance\FinanceSettingsService;
use App\Services\Projects\ProjectEfficiencySheetDocxMissingException;
use App\Services\Projects\ProjectEfficiencySheetFileException;
use App\Services\Projects\ProjectEfficiencySheetGenerationException;
use App\Services\Projects\ProjectEfficiencySheetGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Fiche efficacité drawer data + draft CRUD (Step 3 backend for the drawer).
 *
 * Route-level authorization is enforced by the permission.route middleware
 * (dossiers.efficiency-sheet.* => projects.efficiency_sheet.*). The controller
 * enforces the tenant boundary on the scoped Dossier and returns the exact
 * drawer payload shape: fiche / prefill.project / prefill.client /
 * prefill.enterprise / missingFields.
 */
class ProjectEfficiencySheetController extends Controller
{
    public function show(Request $request, Dossier $dossier): JsonResponse
    {
        $this->assertTenantScope($request, $dossier);

        return response()->json($this->drawerPayload($dossier, $dossier->efficiencySheet));
    }

    public function store(StoreEfficiencySheetRequest $request, Dossier $dossier): JsonResponse
    {
        $this->assertTenantScope($request, $dossier);

        if ($dossier->efficiencySheet()->exists()) {
            return response()->json([
                'message' => 'Une fiche efficacité existe déjà pour ce projet.',
            ], 409);
        }

        $fiche = $dossier->efficiencySheet()->create([
            'usage_du_batiment' => $request->string('usage_du_batiment')->toString(),
            'owner_name' => $request->string('owner_name')->toString(),
            'status' => 'draft',
            'version' => 1,
            'template_key' => 'fiche_efficacite',
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
        ]);

        return response()->json($this->drawerPayload($dossier, $fiche), 201);
    }

    public function update(
        UpdateEfficiencySheetRequest $request,
        Dossier $dossier,
        ProjectEfficiencySheet $efficiencySheet,
    ): JsonResponse {
        $this->assertTenantScope($request, $dossier);
        abort_unless((int) $efficiencySheet->dossier_id === (int) $dossier->id, 404);

        $efficiencySheet->update([
            'usage_du_batiment' => $request->string('usage_du_batiment')->toString(),
            'owner_name' => $request->string('owner_name')->toString(),
            'updated_by' => $request->user()?->id,
        ]);

        return response()->json($this->drawerPayload($dossier, $efficiencySheet->fresh()));
    }

    /**
     * Generate the DOCX (Step 5). No business payload is accepted: all values
     * are loaded server-side from trusted sources at generation time. The
     * response is the same drawer payload, with the fiche now carrying its
     * generated status/version so the drawer can display "DOCX généré".
     */
    public function generateDocx(Request $request, Dossier $dossier, ProjectEfficiencySheet $efficiencySheet): JsonResponse
    {
        $this->assertTenantScope($request, $dossier);
        abort_unless((int) $efficiencySheet->dossier_id === (int) $dossier->id, 404);

        try {
            $result = app(ProjectEfficiencySheetGenerator::class)->generate($efficiencySheet);
        } catch (ProjectEfficiencySheetGenerationException $exception) {
            return response()->json([
                'message' => 'Des informations sont manquantes pour générer la fiche.',
                'missingFields' => $exception->missingCodes(),
            ], 422);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'La génération de la fiche a échoué. Réessayez plus tard.',
            ], 500);
        }

        $efficiencySheet->update([
            'status' => 'generated',
            'version' => $result['version'],
            'docx_path' => $result['docx_path'],
            'generated_by' => $request->user()?->id,
            'generated_at' => now(),
        ]);

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'efficiency_sheet.generated',
            'description' => 'Generated fiche efficacité v'.$result['version'].' for dossier '.$dossier->dossier_number,
            'metadata' => [
                'efficiency_sheet_id' => $efficiencySheet->id,
                'version' => $result['version'],
                'docx_path' => $result['docx_path'],
            ],
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
            'created_at' => now(),
        ]);

        return response()->json($this->drawerPayload($dossier, $efficiencySheet->fresh()));
    }

    /**
     * Generate the PDF from the generated DOCX (Step 6). The converter is
     * invoked by the service only; the controller stays thin. The version is
     * NOT bumped: DOCX vN and PDF vN belong to the same version.
     */
    public function generatePdf(Request $request, Dossier $dossier, ProjectEfficiencySheet $efficiencySheet): JsonResponse
    {
        $this->assertTenantScope($request, $dossier);
        abort_unless((int) $efficiencySheet->dossier_id === (int) $dossier->id, 404);

        try {
            $result = app(ProjectEfficiencySheetGenerator::class)->generatePdf($efficiencySheet);
        } catch (ProjectEfficiencySheetDocxMissingException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        } catch (ProjectEfficiencySheetFileException $exception) {
            return response()->json(['message' => $exception->getMessage()], 404);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'La génération du PDF a échoué.',
            ], 500);
        }

        $efficiencySheet->update([
            'pdf_path' => $result['pdf_path'],
        ]);

        AuditLog::query()->create([
            'user_id' => $request->user()?->id,
            'action' => 'efficiency_sheet.pdf_generated',
            'description' => 'Generated fiche efficacité PDF v'.$efficiencySheet->version.' for dossier '.$dossier->dossier_number,
            'metadata' => [
                'efficiency_sheet_id' => $efficiencySheet->id,
                'version' => $efficiencySheet->version,
                'pdf_path' => $result['pdf_path'],
            ],
            'auditable_type' => Dossier::class,
            'auditable_id' => $dossier->id,
            'created_at' => now(),
        ]);

        return response()->json($this->drawerPayload($dossier, $efficiencySheet->fresh()));
    }

    /**
     * Authenticated DOCX download (attachment). The stored relative path is
     * resolved through the project-storage guard; never a request-supplied
     * path, never the master template.
     */
    public function downloadDocx(Request $request, Dossier $dossier, ProjectEfficiencySheet $efficiencySheet): BinaryFileResponse|JsonResponse
    {
        return $this->serveGeneratedFile($request, $dossier, $efficiencySheet, 'docx', 'attachment');
    }

    /**
     * Authenticated PDF download (attachment).
     */
    public function downloadPdf(Request $request, Dossier $dossier, ProjectEfficiencySheet $efficiencySheet): BinaryFileResponse|JsonResponse
    {
        return $this->serveGeneratedFile($request, $dossier, $efficiencySheet, 'pdf', 'attachment');
    }

    /**
     * Authenticated inline PDF preview (browser viewer). Same response shape
     * as Contract previewPdf: application/pdf + inline Content-Disposition.
     */
    public function previewPdf(Request $request, Dossier $dossier, ProjectEfficiencySheet $efficiencySheet): BinaryFileResponse|JsonResponse
    {
        return $this->serveGeneratedFile($request, $dossier, $efficiencySheet, 'pdf', 'inline');
    }

    /**
     * Print: dedicated route returning the authenticated inline PDF — the
     * browser PDF viewer provides the print action, exactly like Contracts.
     */
    public function print(Request $request, Dossier $dossier, ProjectEfficiencySheet $efficiencySheet): BinaryFileResponse|JsonResponse
    {
        return $this->serveGeneratedFile($request, $dossier, $efficiencySheet, 'pdf', 'inline');
    }

    private function serveGeneratedFile(
        Request $request,
        Dossier $dossier,
        ProjectEfficiencySheet $efficiencySheet,
        string $type,
        string $disposition,
    ): BinaryFileResponse|JsonResponse {
        $this->assertTenantScope($request, $dossier);
        abort_unless((int) $efficiencySheet->dossier_id === (int) $dossier->id, 404);

        try {
            $absolute = app(ProjectEfficiencySheetGenerator::class)->resolveGeneratedFile($efficiencySheet, $type);
        } catch (ProjectEfficiencySheetFileException $exception) {
            return response()->json(['message' => $exception->getMessage()], 404);
        }

        // Friendly user-visible name: only the file basename, never the
        // internal folder structure.
        $relative = $type === 'docx' ? $efficiencySheet->docx_path : $efficiencySheet->pdf_path;
        $filename = basename((string) $relative);

        $headers = [
            'Content-Type' => $type === 'docx'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/pdf',
            'Content-Disposition' => sprintf('%s; filename="%s"', $disposition, $filename),
            'Cache-Control' => 'private, no-store, max-age=0',
        ];

        return response()->file($absolute, $headers);
    }

    private function assertTenantScope(Request $request, Dossier $dossier): void
    {
        $scoped = app(CompanyContext::class)
            ->applyTo(Dossier::query(), $request->user())
            ->whereKey($dossier->id)
            ->exists();

        abort_unless($scoped, 404);
    }

    /**
     * The drawer payload contract. Automatic values are read from trusted
     * sources only (Dossier, Client, CompanySettings) — the row stores just
     * the two manual fields.
     */
    private function drawerPayload(Dossier $dossier, ?ProjectEfficiencySheet $fiche): array
    {
        $company = app(FinanceSettingsService::class)->companyInfo();

        $projectAddress = (string) ($dossier->project_address ?? '');
        $clientAddress = (string) ($dossier->client?->address ?? '');
        $representative = (string) ($company['companyLegalRepresentative'] ?? '');
        $enterpriseAddress = (string) ($company['companyAddress'] ?? '');
        $phone = (string) ($company['companyPhone'] ?? '');
        $fax = (string) ($company['companyFax'] ?? '');
        $email = (string) ($company['companyEmail'] ?? '');

        $missingFields = [];
        foreach ([
            'PROJET_ADDRESS' => $projectAddress,
            'CLIENT_ADDRESS' => $clientAddress,
            'ENTREPRISE_CEO' => $representative,
            'ENTREPRISE_ADDRESS' => $enterpriseAddress,
            'ENTREPRISE_PHONE' => $phone,
            'ENTREPRISE_FAX' => $fax,
            'ENTREPRISE_MAIL' => $email,
        ] as $code => $value) {
            if (trim((string) $value) === '') {
                $missingFields[] = $code;
            }
        }

        return [
            'fiche' => $fiche !== null ? [
                'id' => $fiche->id,
                'status' => $fiche->status,
                'version' => $fiche->version,
                'manual' => [
                    'usageDuBatiment' => (string) $fiche->usage_du_batiment,
                    'ownerName' => (string) $fiche->owner_name,
                ],
                /*
                 * Generated-file visibility for the drawer. Booleans/dates
                 * only — raw storage paths are never exposed to the client.
                 */
                'docxGeneratedAt' => $fiche->generated_at?->toIso8601String(),
                'hasDocx' => filled($fiche->docx_path)
                    && \Illuminate\Support\Facades\Storage::disk('local')->exists($fiche->docx_path),
                'hasPdf' => filled($fiche->pdf_path)
                    && \Illuminate\Support\Facades\Storage::disk('local')->exists($fiche->pdf_path),
            ] : null,
            'prefill' => [
                'project' => [
                    'name' => $dossier->project_object !== null && trim((string) $dossier->project_object) !== ''
                        ? (string) $dossier->project_object
                        : null,
                    'address' => $projectAddress !== '' ? $projectAddress : null,
                ],
                'client' => [
                    'address' => $clientAddress !== '' ? $clientAddress : null,
                ],
                'enterprise' => [
                    'representative' => $representative !== '' ? $representative : null,
                    'address' => $enterpriseAddress !== '' ? $enterpriseAddress : null,
                    'phone' => $phone !== '' ? $phone : null,
                    'fax' => $fax !== '' ? $fax : null,
                    'email' => $email !== '' ? $email : null,
                ],
            ],
            'missingFields' => $missingFields,
        ];
    }
}
