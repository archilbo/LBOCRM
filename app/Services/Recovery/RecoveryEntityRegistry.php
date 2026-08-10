<?php

namespace App\Services\Recovery;

use App\Models\CalendarEvent;
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
            Task::class => 'task',
            CalendarEvent::class => 'calendar_event',
            default => throw new \LogicException('Unsupported recovery entity.'),
        };
    }

    public function displayLabel(Model $entity): string
    {
        return match ($entity::class) {
            Task::class => trim(($entity->task_number ? $entity->task_number.' · ' : '').$entity->title),
            CalendarEvent::class => trim(($entity->event_number ? $entity->event_number.' · ' : '').$entity->title),
            default => throw new \LogicException('Unsupported recovery entity.'),
        };
    }

    public function findDeleted(string $type, int $id, User $user): ?Model
    {
        return match ($type) {
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
