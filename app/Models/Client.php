<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'intermediary_id',
        'client_number',
        'client_type',
        'civility',
        'first_name',
        'last_name',
        'full_name',
        'company_name',
        'cin',
        'ice',
        'managers',
        'phone',
        'email',
        'address',
        'father_name',
        'mother_name',
        'cni_expiration_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'cni_expiration_date' => 'date',
        'managers' => 'array',
    ];

    public function intermediary(): BelongsTo
    {
        return $this->belongsTo(Intermediary::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function dossiers(): BelongsToMany
    {
        return $this->belongsToMany(Dossier::class, 'client_dossier')
            ->withPivot(['is_primary', 'role'])
            ->withTimestamps()
            ->using(ClientDossier::class);
    }

    public function financeRecords(): HasMany
    {
        return $this->hasMany(FinanceRecord::class);
    }

    public function financeDocuments(): HasMany
    {
        return $this->hasMany(FinanceDocument::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
