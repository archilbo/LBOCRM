<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'company_id', 'branch_id', 'type', 'direct_key', 'subject', 'category', 'custom_category',
        'task_id', 'dossier_id', 'client_id', 'finance_document_id',
        'last_message_at',
    ];

    protected $casts = ['last_message_at' => 'datetime'];

    public function participants(): HasMany { return $this->hasMany(ConversationParticipant::class); }
    public function messages(): HasMany { return $this->hasMany(Message::class); }
    public function task(): BelongsTo { return $this->belongsTo(Task::class); }
    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function financeDocument(): BelongsTo { return $this->belongsTo(FinanceDocument::class); }

    public function belongsToScope(User $user): bool
    {
        return (int) $this->company_id === (int) $user->company_id
            && ($this->branch_id === null || $user->branch_id === null || (int) $this->branch_id === (int) $user->branch_id);
    }
}
