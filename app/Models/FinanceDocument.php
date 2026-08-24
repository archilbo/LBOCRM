<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinanceDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'type',
        'number',
        'status',
        'client_id',
        'dossier_id',
        'active_invoice_dossier_key',
        'source_document_id',
        'converted_to_document_id',
        'issue_date',
        'due_date',
        'valid_until',
        'currency',
        'tva_rate',
        'subtotal_ht',
        'discount_total',
        'tax_total',
        'total_ttc',
        'paid_total',
        'remaining_total',
        'notes',
        'terms',
        'template_id',
        'pdf_path',
        'excel_path',
        'generated_at',
        'issued_at',
        'issued_by',
        'template_snapshot',
        'render_data_snapshot',
        'rendered_html_snapshot',
        'snapshot_hash',
        'pdf_checksum',
        'excel_checksum',
        'sent_at',
        'accepted_at',
        'rejected_at',
        'paid_at',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'valid_until' => 'date',
        'generated_at' => 'datetime',
        'issued_at' => 'datetime',
        'template_snapshot' => 'array',
        'render_data_snapshot' => 'array',
        'sent_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'paid_at' => 'datetime',
        'tva_rate' => 'decimal:2',
        'subtotal_ht' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'total_ttc' => 'decimal:2',
        'paid_total' => 'decimal:2',
        'remaining_total' => 'decimal:2',
    ];

    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function branch(): BelongsTo { return $this->belongsTo(Branch::class); }
    public function issuer(): BelongsTo { return $this->belongsTo(User::class, 'issued_by'); }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function sourceDocument(): BelongsTo
    {
        return $this->belongsTo(__CLASS__, 'source_document_id');
    }

    public function childDocuments(): HasMany
    {
        return $this->hasMany(__CLASS__, 'source_document_id');
    }

    public function convertedToDocument(): BelongsTo
    {
        return $this->belongsTo(__CLASS__, 'converted_to_document_id');
    }

    public function convertedFromDocument(): HasOne
    {
        return $this->hasOne(__CLASS__, 'converted_to_document_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(FinanceTemplate::class, 'template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(FinanceDocumentItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentScheduleItems(): HasMany
    {
        return $this->hasMany(FinancePaymentScheduleItem::class)->orderBy('position');
    }

    public function paymentPromises(): HasMany
    {
        return $this->hasMany(FinancePaymentPromise::class)->orderByDesc('promised_for');
    }

    public function isQuote(): bool
    {
        return $this->type === 'quote';
    }

    public function isInvoice(): bool
    {
        return $this->type === 'invoice';
    }

    public function isReceipt(): bool
    {
        return $this->type === 'receipt';
    }

    public function recalculateTotals(): static
    {
        $items = $this->items()->get();

        $this->subtotal_ht = $items->sum('total_ht');
        $this->tax_total = $items->sum('total_tva');
        $this->total_ttc = ($this->subtotal_ht - $this->discount_total) + $this->tax_total;
        $this->remaining_total = $this->total_ttc - $this->paid_total;

        return $this;
    }

    public function updatePaymentTotals(): static
    {
        $this->paid_total = $this->payments()->sum('amount');
        $this->remaining_total = $this->total_ttc - $this->paid_total;

        if ($this->remaining_total <= 0 && $this->total_ttc > 0) {
            $this->status = 'paid';
            $this->paid_at = $this->paid_at ?? now();
        } elseif ($this->paid_total > 0 && $this->remaining_total > 0) {
            $this->status = 'partially_paid';
        }

        return $this;
    }

    public function nextStatusAfterPayment(): string
    {
        if ($this->remaining_total <= 0) {
            return 'paid';
        }

        if ($this->paid_total > 0) {
            return 'partially_paid';
        }

        return $this->status;
    }

    public function canConvertToInvoice(): bool
    {
        return $this->isQuote() && ! $this->childDocuments()->where('type', 'invoice')->exists();
    }

    public function canRecordPayment(): bool
    {
        return $this->isInvoice()
            && ! in_array($this->status, ['cancelled', 'converted'], true);
    }
}
