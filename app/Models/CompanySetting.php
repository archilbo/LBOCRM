<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'label',
        'description',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public static function getValue(string $group, string $key, mixed $default = null): mixed
    {
        $setting = static::query()
            ->where('group', $group)
            ->where('key', $key)
            ->first();

        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'integer' => (int) $setting->value,
            'decimal', 'float', 'number' => (float) $setting->value,
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode((string) $setting->value, true) ?: $default,
            default => $setting->value,
        };
    }

    public static function setValue(
        string $group,
        string $key,
        mixed $value,
        string $type = 'string',
        ?string $label = null,
        ?string $description = null,
        bool $isPublic = false,
    ): self {
        return static::query()->updateOrCreate(
            [
                'group' => $group,
                'key' => $key,
            ],
            [
                'value' => is_array($value) ? json_encode($value) : (string) ($value ?? ''),
                'type' => $type,
                'label' => $label,
                'description' => $description,
                'is_public' => $isPublic,
            ],
        );
    }
}