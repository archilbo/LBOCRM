<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use App\Services\Documents\WorkflowDocumentTemplateResolver;
use Illuminate\Database\Seeder;

class DocumentWorkflowTemplateSeeder extends Seeder
{
    public function run(
        WorkflowDocumentTemplateResolver $resolver,
    ): void {
        $seenCodes = [];

        foreach ($resolver->definitions() as $requirementKey => $definition) {
            $canonicalCode = (string) ($definition['canonical_code'] ?? '');

            if (
                $canonicalCode === ''
                || isset($seenCodes[$canonicalCode])
            ) {
                continue;
            }

            $seenCodes[$canonicalCode] = true;

            $existing = $resolver->resolve($requirementKey);

            if ($existing) {
                $existing->forceFill([
                    'is_active' => true,
                    'is_required' => (bool) (
                        $definition['is_required'] ?? true
                    ),
                    'sort_order' => (int) (
                        $definition['sort_order'] ?? 0
                    ),
                ])->save();

                continue;
            }

            DocumentTemplate::query()->create([
                'code' => $canonicalCode,
                'name' => (string) $definition['name'],
                'document_type' => (string) (
                    $definition['document_type']
                    ?? 'required_document'
                ),
                'is_required' => (bool) (
                    $definition['is_required'] ?? true
                ),
                'is_active' => true,
                'sort_order' => (int) (
                    $definition['sort_order'] ?? 0
                ),
            ]);
        }
    }
}
