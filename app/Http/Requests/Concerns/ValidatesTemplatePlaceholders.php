<?php

namespace App\Http\Requests\Concerns;

use App\Services\Finance\FinanceTemplatePlaceholderRegistry;

trait ValidatesTemplatePlaceholders
{
    protected function validateTemplatePlaceholders(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator): void {
            $registry = app(FinanceTemplatePlaceholderRegistry::class);
            $unknown = [];

            foreach (['header_html', 'body_html', 'footer_html'] as $field) {
                $value = $this->input($field);

                if (!is_string($value) || trim($value) === '') {
                    continue;
                }

                foreach ($registry->unknownPlaceholdersIn($value) as $token) {
                    $unknown[$token] = true;
                }
            }

            if ($unknown !== []) {
                $keys = implode(', ', array_keys($unknown));
                $validator->errors()->add(
                    'body_html',
                    "Variables inconnues : {$keys}. Utilisez uniquement les variables du panneau."
                );
            }
        });
    }
}
