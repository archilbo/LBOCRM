<?php

namespace App\Services\Recovery;

use App\Models\CalendarEvent;
use App\Models\ArchiveRecord;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\Intermediary;
use App\Models\Task;
use App\Models\User;
use App\Services\CompanyContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RecoveryEntityRegistry
{
    public function __construct(private readonly CompanyContext $companyContext)
    {
    }

    /** @return array<string, array{label: string, category: string, purgeable: bool}> */
    public function types(): array
    {
        return [
            'client' => ['label' => 'Client', 'category' => 'clients', 'purgeable' => true],
            'intermediary' => ['label' => 'Intermediaire', 'category' => 'intermediaries', 'purgeable' => true],
            'dossier' => ['label' => 'Projet', 'category' => 'projects', 'purgeable' => true],
            'archive_record' => ['label' => 'Archive', 'category' => 'archives', 'purgeable' => true],
            'task' => ['label' => 'Tâche', 'category' => 'tasks', 'purgeable' => true],
            'calendar_event' => ['label' => 'Événement calendrier', 'category' => 'calendar', 'purgeable' => true],
        ];
    }

    public function has(string $type): bool
    {
        return array_key_exists($type, $this->types());
    }

    public function label(string $type): string
    {
        return $this->types()[$type]['label'];
    }

    public function isPurgeable(string $type): bool
    {
        return $this->types()[$type]['purgeable'] ?? false;
    }

    public function typeFor(Model $entity): string
    {
        return match ($entity::class) {
            Client::class => 'client',
            Intermediary::class => 'intermediary',
            Dossier::class => 'dossier',
            ArchiveRecord::class => 'archive_record',
            Task::class => 'task',
            CalendarEvent::class => 'calendar_event',
            default => throw new \LogicException('Unsupported recovery entity.'),
        };
    }

    public function displayLabel(Model $entity): string
    {
        return match ($entity::class) {
            Client::class => trim(($entity->client_number ? $entity->client_number.' - ' : '').$entity->full_name),
            Intermediary::class => trim(($entity->code ? $entity->code.' - ' : '').$entity->name),
            Dossier::class => trim(($entity->dossier_number ? $entity->dossier_number.' - ' : '').$entity->project_object),
            ArchiveRecord::class => trim(($entity->archive_number ? $entity->archive_number.' - ' : '').'Archive'),
            Task::class => trim(($entity->task_number ? $entity->task_number.' · ' : '').$entity->title),
            CalendarEvent::class => trim(($entity->event_number ? $entity->event_number.' · ' : '').$entity->title),
            default => throw new \LogicException('Unsupported recovery entity.'),
        };
    }

    public function findDeleted(string $type, int $id, User $user): ?Model
    {
        return match ($type) {
            'client' => Client::onlyTrashed()->whereKey($id)->where('company_id', $user->company_id)->when($user->branch_id, fn ($query) => $query->where('branch_id', $user->branch_id))->first(),
            'intermediary' => Intermediary::onlyTrashed()->whereKey($id)->where('company_id', $user->company_id)->when($user->branch_id, fn ($query) => $query->where('branch_id', $user->branch_id))->first(),
            'dossier' => Dossier::onlyTrashed()->whereKey($id)->where('company_id', $user->company_id)->when($user->branch_id, fn ($query) => $query->where('branch_id', $user->branch_id))->first(),
            'archive_record' => ArchiveRecord::onlyTrashed()->whereKey($id)
                ->where('company_id', $user->company_id)->first(),
            'task' => Task::onlyTrashed()->whereKey($id)
                ->whereHas('creator', fn ($query) => $this->companyContext->applyTo($query, $user))->first(),
            'calendar_event' => CalendarEvent::onlyTrashed()->whereKey($id)
                ->whereHas('creator', fn ($query) => $this->companyContext->applyTo($query, $user))->first(),
            default => null,
        };
    }

    /** @return array<string, mixed> */
    public function context(Model $entity): array
    {
        return match ($entity::class) {
            Client::class => ['subtitle' => $entity->client_number, 'category' => 'client'],
            Intermediary::class => ['subtitle' => $entity->code, 'category' => 'intermediary'],
            Dossier::class => ['subtitle' => $entity->dossier_number, 'category' => 'project'],
            ArchiveRecord::class => [
                'subtitle' => $entity->archive_number,
                'status' => $entity->status,
            ],
            Task::class => [
                'subtitle' => $entity->task_number,
                'category' => $entity->category,
            ],
            CalendarEvent::class => [
                'subtitle' => $entity->event_number,
                'startsAt' => $entity->starts_at?->toIso8601String(),
            ],
            default => [],
        };
    }
}
