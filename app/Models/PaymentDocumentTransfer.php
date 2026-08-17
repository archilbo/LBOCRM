<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentDocumentTransfer extends Model
{
    protected $fillable = [
        'company_id',
        'branch_id',
        'payment_id',
        'from_finance_document_id',
        'to_finance_document_id',
        'amount',
        'reason',
        'created_by',
    ];

    protected $casts = ['amount' => 'decimal:2'];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function fromDocument(): BelongsTo
    {
        return $this->belongsTo(FinanceDocument::class, 'from_finance_document_id');
    }

    public function toDocument(): BelongsTo
    {
        return $this->belongsTo(FinanceDocument::class, 'to_finance_document_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
