<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancePaymentReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'branch_id',
        'finance_document_id',
        'client_id',
        'dossier_id',
        'type',
        'remind_at',
        'status',
        'snoozed_until',
        'triggered_at',
        'completed_at',
        'cancelled_at',
        'note',
        'created_by',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'snoozed_until' => 'datetime',
        'triggered_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function branch(): BelongsTo { return $this->belongsTo(Branch::class); }
    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
