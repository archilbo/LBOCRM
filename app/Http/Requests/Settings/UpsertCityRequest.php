<?php

namespace App\Http\Requests\Settings;

use App\Models\City;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class UpsertCityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $name = preg_replace('/\s+/u', ' ', trim((string) $this->input('name'))) ?? '';

        $this->merge([
            'name' => $name,
            'normalized_name' => Str::lower($name),
            'code' => strtoupper(trim((string) $this->input('code'))),
            'color' => strtoupper(trim((string) $this->input('color'))),
        ]);
    }

    public function rules(): array
    {
        $city = $this->route('city');
        $cityId = $city instanceof City ? $city->id : $city;

        return [
            'name' => [
                'bail',
                'required',
                'string',
                'max:255',
                function (string $attribute, mixed $value, \Closure $fail) use ($cityId): void {
                    $query = City::query()->when($cityId, fn ($query) => $query->where('id', '!=', $cityId));
                    $exists = Schema::hasColumn('cities', 'name_normalized')
                        ? $query->where('name_normalized', $this->input('normalized_name'))->exists()
                        : $query->get(['name'])->contains(fn (City $city): bool => Str::lower(
                            preg_replace('/\s+/u', ' ', trim($city->name)) ?? '',
                        ) === $this->input('normalized_name'));

                    if ($exists) {
                        $fail('Cette ville existe déjà.');
                    }
                },
            ],
            'code' => [
                'bail',
                'required',
                'string',
                'min:2',
                'max:8',
                'regex:/^[A-Z]+$/',
                function (string $attribute, mixed $value, \Closure $fail) use ($cityId): void {
                    $exists = City::query()
                        ->whereRaw('UPPER(code) = ?', [$value])
                        ->when($cityId, fn ($query) => $query->where('id', '!=', $cityId))
                        ->exists();

                    if ($exists) {
                        $fail('Ce code de ville existe déjà.');
                    }
                },
            ],
            'color' => ['required', 'string', 'size:7', 'regex:/^#[0-9A-F]{6}$/', Rule::unique('cities', 'color')->ignore($cityId)],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
