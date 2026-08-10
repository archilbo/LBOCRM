<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancePaymentPromise extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'branch_id', 'finance_document_id', 'client_id', 'dossier_id', 'amount', 'baseline_paid_total', 'promised_for', 'status', 'note', 'fulfilled_at', 'broken_at', 'cancelled_at', 'created_by'];

    protected $casts = [
        'amount' => 'decimal:2',
        'baseline_paid_total' => 'decimal:2',
        'promised_for' => 'date',
        'fulfilled_at' => 'datetime',
        'broken_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
