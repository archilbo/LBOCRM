<?php

namespace Tests\Feature;

use App\Models\CalendarEvent;
use App\Models\Company;
use App\Models\User;
use App\Events\Calendar\CalendarChanged;
use Illuminate\Support\Facades\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CalendarIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_is_limited_to_the_requested_range_and_keeps_spanning_events(): void
    {
        $user = $this->calendarUser('calendar.view');

        $this->event($user, 'CAL-RANGE-001', 'Spanning event', '2026-08-30 09:00:00', '2026-09-03 17:00:00');
        $this->event($user, 'CAL-RANGE-002', 'September event', '2026-09-18 09:00:00', '2026-09-18 10:00:00');
        $this->event($user, 'CAL-RANGE-003', 'Outside event', '2026-10-01 09:00:00', '2026-10-01 10:00:00');

        $this->actingAs($user)
            ->get(route('calendar.index', ['start' => '2026-09-01', 'end' => '2026-09-30']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Calendar/Index')
                ->where('range.start', '2026-09-01')
                ->where('range.end', '2026-09-30')
                ->has('events', 2)
                ->where('events.0.title', 'Spanning event')
                ->where('events.0.startsAt', fn (string $value) => str_contains($value, 'T'))
                ->where('events.0.key', 'calendar_event:1'));
    }

    public function test_calendar_rejects_ranges_over_ninety_three_days(): void
    {
        $user = $this->calendarUser('calendar.view');

        $this->actingAs($user)
            ->from(route('calendar.index'))
            ->get(route('calendar.index', ['start' => '2026-01-01', 'end' => '2026-05-01']))
            ->assertRedirect(route('calendar.index'))
            ->assertSessionHasErrors('end');
    }

    public function test_calendar_rejects_invalid_custom_colours(): void
    {
        $user = $this->calendarUser('calendar.create');

        $this->actingAs($user)
            ->from(route('calendar.index'))
            ->post(route('calendar.events.store'), [
                'type' => 'meeting',
                'title' => 'Colour validation',
                'starts_at' => '2026-09-10T10:00',
                'color' => 'meeting',
            ])
            ->assertRedirect(route('calendar.index'))
            ->assertSessionHasErrors('color');
    }

    public function test_creating_an_event_broadcasts_a_private_calendar_refresh_without_event_data(): void
    {
        $user = $this->calendarUser('calendar.view', 'calendar.create');
        Event::fake([CalendarChanged::class]);

        $this->actingAs($user)
            ->post(route('calendar.events.store'), [
                'type' => 'meeting',
                'title' => 'Realtime event',
                'starts_at' => '2026-09-10T10:00',
                'color' => '#06b6d4',
            ])
            ->assertRedirect(route('calendar.index'));

        Event::assertDispatched(CalendarChanged::class, fn (CalendarChanged $event) => $event->recipientId === $user->id
            && $event->action === 'created'
            && str_starts_with($event->eventKey, 'calendar_event:'));
    }

    private function calendarUser(string ...$permissions): User
    {
        $company = Company::query()->firstOrFail();
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo(collect($permissions)
            ->map(fn (string $permission) => Permission::findOrCreate($permission, 'web'))
            ->all());

        return $user;
    }

    private function event(User $user, string $number, string $title, string $startsAt, string $endsAt): CalendarEvent
    {
        return CalendarEvent::query()->create([
            'event_number' => $number,
            'type' => 'meeting',
            'title' => $title,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'visibility' => 'team',
            'created_by' => $user->id,
        ]);
    }
}
