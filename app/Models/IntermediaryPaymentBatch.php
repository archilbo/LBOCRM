<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IntermediaryPaymentBatch extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'branch_id', 'intermediary_id', 'amount', 'paid_at', 'method', 'reference', 'notes', 'created_by', 'cancelled_at', 'cancelled_by', 'cancellation_reason'];
    protected $casts = ['amount' => 'decimal:2', 'paid_at' => 'date', 'cancelled_at' => 'datetime'];

    public function intermediary(): BelongsTo { return $this->belongsTo(Intermediary::class); }
    public function allocations(): HasMany { return $this->hasMany(IntermediaryPaymentAllocation::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function canceller(): BelongsTo { return $this->belongsTo(User::class, 'cancelled_by'); }
}
