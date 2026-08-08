<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\RenameDocumentTemplateRequest;
use App\Http\Requests\Finance\StoreDocumentTemplateRequest;
use App\Http\Requests\Finance\UpdateDocumentTemplateRequest;
use App\Http\Resources\DocumentTemplateResource;
use App\Models\FinanceTemplate;
use App\Services\Finance\DefaultFinanceTemplateFactory;
use App\Services\Finance\FinanceActivityService;
use App\Services\Finance\FinanceContextService;
use App\Services\Finance\FinanceTemplatePlaceholderRegistry;
use App\Services\Finance\FinanceTemplateRenderer;
use App\Services\Finance\RenameFinanceTemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class DocumentTemplateController extends Controller
{
    public function __construct(
        private readonly FinanceTemplatePlaceholderRegistry $placeholders,
        private readonly DefaultFinanceTemplateFactory $factory,
        private readonly FinanceTemplateRenderer $renderer,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', FinanceTemplate::class);
        $templates = app(FinanceContextService::class)->apply(FinanceTemplate::query(), $request->user())
            ->orderBy('type')
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();

        return Inertia::render('Finance/Templates/Index', [
            'templates' => DocumentTemplateResource::collection($templates)->resolve($request),
            'templatesByType' => DocumentTemplateResource::collection($templates)->resolve($request),
            'placeholders' => $this->placeholders->all(),
            'placeholdersByType' => [
                'quote' => $this->placeholders->all('quote'),
                'invoice' => $this->placeholders->all('invoice'),
                'receipt' => $this->placeholders->all('receipt'),
            ],
            'knownByType' => [
                'quote' => $this->placeholders->knownForType('quote'),
                'invoice' => $this->placeholders->knownForType('invoice'),
                'receipt' => $this->placeholders->knownForType('receipt'),
            ],
            'sampleData' => $this->sampleData(),
            'routes' => [
                'store' => route('finance.templates.store'),
                'close' => route('finance.documents.index', ['tab' => 'templates']),
                'previewDraft' => route('finance.templates.preview-draft'),
            ],
        ]);
    }

    public function store(StoreDocumentTemplateRequest $request): RedirectResponse
    {
        $this->authorize('create', FinanceTemplate::class);
        $data = $request->validated();
        $scope = app(FinanceContextService::class)->payload($request->user());
        $source = !empty($data['copy_from_id'])
            ? app(FinanceContextService::class)->apply(FinanceTemplate::query(), $request->user())->findOrFail($data['copy_from_id'])
            : null;
        $payload = $source ? $source->only(['header_html', 'body_html', 'footer_html', 'css', 'settings', 'logo_path', 'paper_size', 'orientation']) : [];
        $payload = array_merge($payload, $data);
        unset($payload['copy_from_id']);

        $template = DB::transaction(function () use ($payload, $scope) {
            $payload = [...$scope, ...$payload];
            $payload['slug'] = $this->uniqueSlug($payload['slug'] ?? $payload['name']);
            $payload['created_by'] = Auth::id();
            $payload['is_default'] = (bool) ($payload['is_default'] ?? false);

            if ($payload['is_default']) {
                FinanceTemplate::where($scope)->where('type', $payload['type'])->update(['is_default' => false]);
            }

            return FinanceTemplate::create($payload);
        });
        app(FinanceActivityService::class)->log($template, $request->user(), 'finance.template.created', [], $template->only(['type', 'name', 'slug', 'is_default']));

        return redirect()->route('finance.templates.index', ['type' => $template->type, 'template' => $template->id])
            ->with('success', 'Template cree avec succes.');
    }

    public function show(FinanceTemplate $documentTemplate): JsonResponse
    {
        $this->authorize('view', $documentTemplate);
        return response()->json(['template' => new DocumentTemplateResource($documentTemplate)]);
    }

    public function update(UpdateDocumentTemplateRequest $request, FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('update', $documentTemplate);
        $data = $request->validated();
        $old = $documentTemplate->only(['type', 'name', 'slug', 'is_default']);

        DB::transaction(function () use ($data, $documentTemplate) {
            $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $documentTemplate->id);
            $data['is_default'] = (bool) ($data['is_default'] ?? false);

            if ($data['is_default']) {
                FinanceTemplate::where('company_id', $documentTemplate->company_id)
                    ->where('branch_id', $documentTemplate->branch_id)
                    ->where('type', $documentTemplate->type)
                    ->whereKeyNot($documentTemplate->id)
                    ->update(['is_default' => false]);
            }

            $documentTemplate->update($data);
        });
        app(FinanceActivityService::class)->log($documentTemplate, $request->user(), 'finance.template.updated', $old, $documentTemplate->only(array_keys($old)));

        return redirect()->back()->with('success', 'Template mis a jour.');
    }

    public function rename(
        RenameDocumentTemplateRequest $request,
        FinanceTemplate $documentTemplate,
        RenameFinanceTemplateService $service,
    ): RedirectResponse {
        $this->authorize('update', $documentTemplate);
        $service->rename($documentTemplate, $request->user(), $request->validated('name'));

        return redirect()->back()->with('success', 'Template renomme avec succes.');
    }

    public function destroy(FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('delete', $documentTemplate);
        if ($documentTemplate->is_default && FinanceTemplate::where('company_id', $documentTemplate->company_id)->where('branch_id', $documentTemplate->branch_id)->where('type', $documentTemplate->type)->where('is_default', true)->count() <= 1) {
            return redirect()->back()->with('error', 'Impossible de supprimer le dernier template par defaut.');
        }

        app(FinanceActivityService::class)->log($documentTemplate, request()->user(), 'finance.template.deleted', $documentTemplate->toArray());
        $documentTemplate->delete();

        return redirect()->back()->with('success', 'Template supprime.');
    }

    public function duplicate(FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('update', $documentTemplate);
        $copy = $documentTemplate->replicate();
        $copy->name = $documentTemplate->name . ' - Copie';
        $copy->slug = $this->uniqueSlug($documentTemplate->slug . '-copie');
        $copy->is_default = false;
        $copy->created_by = Auth::id();
        $copy->save();
        app(FinanceActivityService::class)->log($copy, request()->user(), 'finance.template.duplicated', [], ['source_template_id' => $documentTemplate->id]);

        return redirect()->route('finance.templates.index', ['type' => $copy->type, 'template' => $copy->id])
            ->with('success', 'Template duplique.');
    }

    public function setDefault(FinanceTemplate $documentTemplate): RedirectResponse
    {
        $this->authorize('update', $documentTemplate);
        DB::transaction(function () use ($documentTemplate) {
            FinanceTemplate::where('company_id', $documentTemplate->company_id)
                ->where('branch_id', $documentTemplate->branch_id)
                ->where('type', $documentTemplate->type)->update(['is_default' => false]);
            $documentTemplate->update(['is_default' => true]);
        });

        return redirect()->back()->with('success', 'Template defini par defaut.');
    }

    public function resetDefault(string $type): RedirectResponse
    {
        $this->authorize('create', FinanceTemplate::class);
        if (!in_array($type, ['quote', 'invoice', 'receipt'], true)) {
            return redirect()->back()->with('error', 'Type de template invalide.');
        }

        $scope = app(FinanceContextService::class)->payload(request()->user());
        DB::transaction(function () use ($type, $scope) {
            FinanceTemplate::where($scope)->where('type', $type)->update(['is_default' => false]);
            $defaults = $this->factory->forType($type);
            $defaults = [...$scope, ...$defaults];
            $defaults['slug'] = $this->uniqueSlug('default-' . $type . '-' . now()->format('YmdHis'));
            $defaults['created_by'] = Auth::id();
            FinanceTemplate::create($defaults);
        });

        return redirect()->back()->with('success', 'Template par defaut recree.');
    }

    public function preview(FinanceTemplate $documentTemplate): JsonResponse
    {
        $this->authorize('view', $documentTemplate);

        try {
            $html = $this->renderer->renderTemplatePreview($documentTemplate, $this->sampleData($documentTemplate->type));

            return response()->json(['html' => $html]);
        } catch (RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function previewDraft(Request $request): JsonResponse
    {
        $this->authorize('viewAny', FinanceTemplate::class);

        $data = $request->validate([
            'type' => ['required', 'string', 'in:quote,invoice,receipt'],
            'header_html' => ['nullable', 'string'],
            'body_html' => ['nullable', 'string'],
            'footer_html' => ['nullable', 'string'],
            'css' => ['nullable', 'string'],
        ]);

        $unknown = [];

        foreach (['header_html', 'body_html', 'footer_html'] as $field) {
            foreach ($this->placeholders->unknownPlaceholdersIn((string) ($data[$field] ?? '')) as $token) {
                $unknown[$token] = true;
            }
        }

        if ($unknown !== []) {
            return response()->json([
                'error' => 'Variable inconnue : ' . implode(', ', array_keys($unknown)),
            ], 422);
        }

        try {
            $html = $this->renderer->renderTemplatePreview(new FinanceTemplate($data), $this->sampleData($data['type'] ?? null));

            return response()->json(['html' => $html]);
        } catch (RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'template';
        $slug = $base;
        $i = 2;

        while (FinanceTemplate::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }

    private function sampleData(?string $type = null): array
    {
        return $this->placeholders->sampleData($type);
    }
}
