<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierCahier extends Model
{
    use HasFactory;

    protected $fillable = ['dossier_id', 'cahier_number', 'received_at', 'delivered_at', 'created_by', 'updated_by'];

    protected $casts = ['received_at' => 'date', 'delivered_at' => 'date'];

    public static function normalizeNumber(?string $number): string
    {
        $withoutPrefix = preg_replace('/^(?:(?:n\s*(?:\x{00C2})?[\x{00B0}\x{00BA}]|no\.?)\s*)+/iu', '', trim($number ?? '')) ?? '';

        return preg_replace('/\s+/', '', $withoutPrefix) ?? '';
    }

    protected function cahierNumber(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): string => self::normalizeNumber($value),
            set: fn (?string $value): string => self::normalizeNumber($value),
        );
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
