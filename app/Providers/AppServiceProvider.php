<?php

namespace App\Providers;

use App\Models\DocumentTemplate;
use App\Models\DossierDocument;
use App\Models\ArchiveRecord;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\Expense;
use App\Models\FinanceDocument;
use App\Models\FinanceTemplate;
use App\Models\Payment;
use App\Models\Task;
use App\Models\CalendarEvent;
use App\Models\CalendarEventReminder;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\ProjectDesign\ProjectDesignFile;
use App\Models\ProjectDesign\ProjectDesignFolder;
use App\Policies\ExpensePolicy;
use App\Policies\ArchiveRecordPolicy;
use App\Policies\ClientPolicy;
use App\Policies\ContractPolicy;
use App\Policies\DossierPolicy;
use App\Policies\DossierDocumentPolicy;
use App\Policies\FinanceDocumentPolicy;
use App\Policies\FinanceTemplatePolicy;
use App\Policies\NotificationPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\ProjectDesignPolicy;
use App\Policies\TaskPolicy;
use App\Policies\CalendarEventPolicy;
use App\Policies\CalendarReminderPolicy;
use App\Policies\ConversationPolicy;
use App\Policies\MessagePolicy;
use App\Observers\DocumentTemplateObserver;
use Illuminate\Notifications\DatabaseNotification;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(DatabaseNotification::class, NotificationPolicy::class);
        Gate::policy(ArchiveRecord::class, ArchiveRecordPolicy::class);
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(Dossier::class, DossierPolicy::class);
        Gate::policy(FinanceDocument::class, FinanceDocumentPolicy::class);
        Gate::policy(DossierDocument::class, DossierDocumentPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(Expense::class, ExpensePolicy::class);
        Gate::policy(FinanceTemplate::class, FinanceTemplatePolicy::class);
        Gate::policy(ProjectDesignFile::class, ProjectDesignPolicy::class);
        Gate::policy(ProjectDesignFolder::class, ProjectDesignPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(CalendarEvent::class, CalendarEventPolicy::class);
        Gate::policy(CalendarEventReminder::class, CalendarReminderPolicy::class);
        Gate::policy(Conversation::class, ConversationPolicy::class);
        Gate::policy(Message::class, MessagePolicy::class);
        DocumentTemplate::observe(DocumentTemplateObserver::class);

        Gate::before(function (User $user) {
            return $user->hasRole('super_admin') ? true : null;
        });
    }
}
