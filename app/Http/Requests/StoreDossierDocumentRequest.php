<?php

namespace App\Http\Requests;

use App\Models\DocumentTemplate;
use App\Services\Documents\WorkflowDocumentTemplateResolver;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreDossierDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'dossier_id' => [
                'required',
                'integer',
                'exists:dossiers,id',
            ],

            'document_template_id' => [
                'required',
                'integer',
                Rule::exists(
                    'document_templates',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'is_active',
                            true
                        )
                ),
            ],

            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'uploaded',
                    'verified',
                    'missing',
                    'rejected',
                ]),
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'file' => [
                'nullable',
                'file',
                'max:'.config('documents.max_upload_kb'),
                'mimes:pdf,jpg,jpeg,png,webp,doc,docx',
            ],

            'file_front' => [
                'nullable',
                'file',
                'max:'.config('documents.max_upload_kb'),
                'mimes:pdf,jpg,jpeg,png,webp',
                // Content-based check: the real file MIME must be a supported
                // image or PDF. Extension-only `mimes` is never trusted alone
                // (a renamed executable or an SVG would otherwise pass).
                'mimetypes:application/pdf,image/jpeg,image/png,image/webp',
            ],

            'file_back' => [
                'nullable',
                'file',
                'max:'.config('documents.max_upload_kb'),
                'mimes:pdf,jpg,jpeg,png,webp',
                'mimetypes:application/pdf,image/jpeg,image/png,image/webp',
            ],

            'workflow_step_key' => [
                'nullable',
                'string',
                'max:100',
            ],

            'workflow_req_key' => [
                'nullable',
                'string',
                'max:100',
            ],

            'return_to' => [
                'nullable',
                'string',
                'max:2048',
                'starts_with:/',
            ],
        ];
    }

    public function withValidator(
        Validator $validator
    ): void {
        $validator->after(function (
            Validator $validator
        ): void {
            if (
                $validator->errors()->has(
                    'document_template_id'
                )
            ) {
                return;
            }

            $template = DocumentTemplate::query()
                ->where('is_active', true)
                ->find(
                    $this->integer(
                        'document_template_id'
                    )
                );

            if (! $template) {
                return;
            }

            $resolver = app(
                WorkflowDocumentTemplateResolver::class
            );

            if ($resolver->isCinTemplate($template)) {
                if (! $this->hasFile('file_front')) {
                    $validator->errors()->add(
                        'file_front',
                        'Le recto de la CIN est obligatoire.'
                    );
                }

                if (! $this->hasFile('file_back')) {
                    $validator->errors()->add(
                        'file_back',
                        'Le verso de la CIN est obligatoire.'
                    );
                }

                if ($this->hasFile('file')) {
                    $validator->errors()->add(
                        'file',
                        'Utilisez les champs Recto et Verso pour la CIN.'
                    );
                }

                return;
            }

            if (! $this->hasFile('file')) {
                $validator->errors()->add(
                    'file',
                    'Le fichier est obligatoire.'
                );
            }

            if (
                $this->hasFile('file_front')
                || $this->hasFile('file_back')
            ) {
                $validator->errors()->add(
                    'file',
                    'Ce type de document accepte un seul fichier.'
                );
            }
        });
    }
}
