<?php

namespace App\Models;

use App\Enums\PaymentKind;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'finance_document_id',
        'payment_kind',
        'client_id',
        'dossier_id',
        'payment_number',
        'amount',
        'method',
        'reference',
        'paid_at',
        'notes',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'receipt_document_id',
        'created_by',
    ];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function branch(): BelongsTo { return $this->belongsTo(Branch::class); }

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'date',
        'cancelled_at' => 'datetime',
        'payment_kind' => PaymentKind::class,
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(FinanceDocument::class, 'finance_document_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function receiptDocument(): BelongsTo
    {
        return $this->belongsTo(FinanceDocument::class, 'receipt_document_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
