<?php

namespace App\Http\Requests\ProjectDesign;

use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFileVersion;
use App\Services\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectDesignAnnotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'company_id' => app(CompanyContext::class)->id($this->user()),
        ]);
    }

    public function rules(): array
    {
        return [
            'company_id' => ['required', 'integer', 'exists:companies,id'],
            'asset_id' => ['required', 'integer', 'exists:project_design_assets,id'],
            'page_number' => ['nullable', 'integer', 'min:1'],
            'annotation_type' => ['required', 'string', Rule::in(['pin', 'arrow', 'rectangle', 'revision_cloud', 'freehand', 'text', 'highlight', 'ellipse', 'line'])],
            'coordinate_space' => ['required', 'string', Rule::in(['page-normalized-v1'])],
            'geometry' => ['required', 'array'],
            'geometry.x' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.y' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.width' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'geometry.height' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'geometry.start.x' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.start.y' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.end.x' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.end.y' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'geometry.points' => ['nullable', 'array', 'max:10000'],
            'geometry.points.*.x' => ['numeric', 'min:0', 'max:1'],
            'geometry.points.*.y' => ['numeric', 'min:0', 'max:1'],
            'style' => ['nullable', 'array'],
            'style.color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'style.stroke_width' => ['nullable', 'numeric', 'min:0.5', 'max:20'],
            'style.fill_opacity' => ['nullable', 'numeric', 'min:0', 'max:1'],
            'viewport' => ['nullable', 'array'],
            'reference_width' => ['nullable', 'integer', 'min:1'],
            'reference_height' => ['nullable', 'integer', 'min:1'],
            'source_rotation' => ['nullable', 'integer', Rule::in([0, 90, 180, 270])],
        ];
    }

    public function messages(): array
    {
        return [
            'geometry.x.min' => 'Les coordonnées normalisées doivent être comprises entre 0 et 1.',
            'geometry.x.max' => 'Les coordonnées normalisées doivent être comprises entre 0 et 1.',
            'geometry.y.min' => 'Les coordonnées normalisées doivent être comprises entre 0 et 1.',
            'geometry.y.max' => 'Les coordonnées normalisées doivent être comprises entre 0 et 1.',
            'geometry.points.*.x.min' => 'Les points normalisés doivent être compris entre 0 et 1.',
            'geometry.points.*.x.max' => 'Les points normalisés doivent être compris entre 0 et 1.',
            'geometry.points.*.y.min' => 'Les points normalisés doivent être compris entre 0 et 1.',
            'geometry.points.*.y.max' => 'Les points normalisés doivent être compris entre 0 et 1.',
            'geometry.points.max' => 'Le nombre de points libres ne peut pas dépasser 10 000.',
        ];
    }
}
