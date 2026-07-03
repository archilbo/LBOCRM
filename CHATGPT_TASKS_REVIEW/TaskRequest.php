<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'request_number',
        'request_type',
        'title',
        'description',
        'requested_by',
        'target_user_id',
        'status',
        'client_id',
        'dossier_id',
        'dossier_document_id',
        'finance_document_id',
        'contract_id',
        'authorization_id',
        'archive_record_id',
        'converted_task_id',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function requester(): BelongsTo { return $this->belongsTo(User::class, 'requested_by'); }
    public function targetUser(): BelongsTo { return $this->belongsTo(User::class, 'target_user_id'); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function document(): BelongsTo { return $this->belongsTo(DossierDocument::class, 'dossier_document_id'); }
    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }
    public function contract(): BelongsTo { return $this->belongsTo(Contract::class); }
    public function authorization(): BelongsTo { return $this->belongsTo(Authorization::class); }
    public function archiveRecord(): BelongsTo { return $this->belongsTo(ArchiveRecord::class); }
    public function convertedTask(): BelongsTo { return $this->belongsTo(Task::class, 'converted_task_id'); }
}
