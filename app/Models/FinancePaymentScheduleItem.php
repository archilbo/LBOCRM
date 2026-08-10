<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancePaymentScheduleItem extends Model
{
    use HasFactory;

    protected $fillable = ['company_id', 'branch_id', 'finance_document_id', 'label', 'amount', 'due_date', 'position', 'created_by'];

    protected $casts = ['amount' => 'decimal:2', 'due_date' => 'date'];

    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function branch(): BelongsTo { return $this->belongsTo(Branch::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
