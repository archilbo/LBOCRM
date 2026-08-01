<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class City extends Model
{
    protected $fillable = ['name', 'code', 'color', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function dossiers(): HasMany
    {
        return $this->hasMany(Dossier::class);
    }

    public function setNameAttribute(string $value): void
    {
        $name = preg_replace('/\s+/u', ' ', trim($value)) ?? '';

        $this->attributes['name'] = $name;

        if (Schema::hasColumn($this->getTable(), 'name_normalized')) {
            $this->attributes['name_normalized'] = Str::lower($name);
        }
    }
}
