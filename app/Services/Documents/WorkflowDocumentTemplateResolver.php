<?php

namespace App\Services\Documents;

use App\Models\DocumentTemplate;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

final class WorkflowDocumentTemplateResolver
{
    public const MODE_SINGLE = 'single';

    public const MODE_CIN_PAIR = 'cin_pair';

    public function definitions(): array
    {
        return config('workflow_document_templates', []);
    }

    public function resolve(
        string $requirementKey,
        ?Collection $templates = null,
    ): ?DocumentTemplate {
        $definition = $this->definitions()[$requirementKey] ?? null;

        if (! is_array($definition)) {
            return null;
        }

        $templates ??= DocumentTemplate::query()
            ->where('is_active', true)
            ->get();

        return $templates->first(
            fn (DocumentTemplate $template): bool =>
                $this->matchesDefinition(
                    $template,
                    $definition
                )
        );
    }

    public function requirementTemplateMap(): array
    {
        $templates = DocumentTemplate::query()
            ->where('is_active', true)
            ->get();

        return collect(array_keys($this->definitions()))
            ->mapWithKeys(function (string $requirementKey) use ($templates): array {
                $template = $this->resolve($requirementKey, $templates);

                return [
                    $requirementKey => $template
                        ? (string) $template->id
                        : '',
                ];
            })
            ->all();
    }

    public function matches(
        DocumentTemplate $template,
        string $requirementKey,
    ): bool {
        $expected = $this->resolve($requirementKey);

        return $expected !== null
            && (int) $expected->id === (int) $template->id;
    }

    public function uploadModeForTemplate(
        DocumentTemplate $template,
    ): string {
        foreach ($this->definitions() as $definition) {
            if (
                is_array($definition)
                && $this->matchesDefinition(
                    $template,
                    $definition
                )
            ) {
                return (string) (
                    $definition['upload_mode']
                    ?? self::MODE_SINGLE
                );
            }
        }

        return self::MODE_SINGLE;
    }

    public function isCinTemplate(
        DocumentTemplate $template,
    ): bool {
        return $this->uploadModeForTemplate($template)
            === self::MODE_CIN_PAIR;
    }

    public function option(
        DocumentTemplate $template,
    ): array {
        return [
            'id' => (string) $template->id,
            'label' => $template->name,
            'code' => $template->code,
            'documentType' => $template->document_type,
            'isRequired' => (bool) $template->is_required,
            'uploadMode' => $this->uploadModeForTemplate($template),
        ];
    }

    private function matchesDefinition(
        DocumentTemplate $template,
        array $definition,
    ): bool {
        $templateCode = mb_strtoupper(
            trim((string) $template->code),
            'UTF-8'
        );

        $codes = collect([
            $definition['canonical_code'] ?? null,
            ...($definition['code_aliases'] ?? []),
        ])
            ->filter()
            ->map(
                fn (string $code): string =>
                    mb_strtoupper(
                        trim($code),
                        'UTF-8'
                    )
            );

        if (
            $templateCode !== ''
            && $codes->contains($templateCode)
        ) {
            return true;
        }

        $templateName = $this->normalize(
            (string) $template->name
        );

        return collect([
            $definition['name'] ?? null,
            ...($definition['name_aliases'] ?? []),
        ])
            ->filter()
            ->map(
                fn (string $name): string =>
                    $this->normalize($name)
            )
            ->contains($templateName);
    }

    private function normalize(string $value): string
    {
        return Str::of($value)
            ->ascii()
            ->lower()
            ->replace(['_', '-', '\'', ''], ' ')
            ->squish()
            ->toString();
    }
}
