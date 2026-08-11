<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntermediaryPaymentAllocation extends Model
{
    use HasFactory;

    protected $fillable = ['intermediary_payment_batch_id', 'dossier_id', 'finance_document_id', 'payment_id', 'amount'];
    protected $casts = ['amount' => 'decimal:2'];

    public function batch(): BelongsTo { return $this->belongsTo(IntermediaryPaymentBatch::class, 'intermediary_payment_batch_id'); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function document(): BelongsTo { return $this->belongsTo(FinanceDocument::class, 'finance_document_id'); }
    public function payment(): BelongsTo { return $this->belongsTo(Payment::class); }
}
