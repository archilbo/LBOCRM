import { IconPlus } from '@tabler/icons-react';
import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { Card } from '@heroui/react';
import { useTranslation } from '@/lib/i18n';
import type { CalendarEventRow, CalendarEventType } from '@/features/calendar/types';
import { EVENT_TYPE_COLORS } from '@/features/calendar/types';
import { CalendarSidebar } from '@/features/calendar/components/CalendarSidebar';
import { CalendarToolbar } from '@/features/calendar/components/CalendarToolbar';
import { CalendarEventPill } from '@/features/calendar/components/CalendarEventPill';
import { CalendarEventDrawer } from '@/features/calendar/components/CalendarEventDrawer';
import { CalendarRightPanel } from '@/features/calendar/components/CalendarRightPanel';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';

type PageProps = {
    events: CalendarEventRow[];
    users: { id: number; name: string; email: string }[];
    range: { start: string; end: string };
    capabilities: { create: boolean; manageAdminVisibility: boolean };
};

type CalendarRealtimeEvent = {
    eventKey: string;
    action: 'created' | 'updated' | 'moved' | 'resized' | 'participants_updated' | 'deleted';
};

function toFC(event: CalendarEventRow) {
    const color = /^#[0-9A-Fa-f]{6}$/.test(event.color || '')
        ? event.color!
        : EVENT_TYPE_COLORS[event.type] || '#6b7280';
    return {
        id: String(event.id),
        title: event.title,
        start: event.startsAt,
        end: event.endsAt || undefined,
        allDay: event.allDay,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: color,
        editable: event.capabilities.update,
        startEditable: event.capabilities.update,
        durationEditable: event.capabilities.update,
        extendedProps: {
            type: event.type,
            color,
            description: event.description,
            status: event.status,
            priority: event.priority,
            eventNumber: event.eventNumber,
            participants: Array.isArray(event.participants) ? event.participants : [],
            capabilities: event.capabilities,
        },
    };
}

function localDate(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function isPastDay(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
}

export default function CalendarIndex({ events: _events, users, range, capabilities }: PageProps) {
    const { t, locale } = useTranslation();
    const initialEvents = _events;
    const calendarRef = useRef<FullCalendar>(null);
    const requestedRangeRef = useRef<string | null>(null);
    const openedDirectEventRef = useRef<number | null>(null);
    const [currentDate, setCurrentDate] = useState(() => new Date(`${range.start}T12:00:00`));
    const [viewMode, setViewMode] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterUserId, setFilterUserId] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editEvent, setEditEvent] = useState<CalendarEventRow | undefined>(undefined);
    const [defaultStart, setDefaultStart] = useState<string | undefined>(undefined);
    const [defaultType, setDefaultType] = useState<CalendarEventType>('task');
    const pageProps = usePage().props as unknown as { auth?: { user?: { id?: number } } };
    const currentUserId = Number(pageProps.auth?.user?.id || 0);

    useEffect(() => {
        const eventId = Number(new URLSearchParams(window.location.search).get('event'));

        if (!Number.isSafeInteger(eventId) || eventId < 1 || openedDirectEventRef.current === eventId) return;

        openedDirectEventRef.current = eventId;

        fetch(`/calendar/events/${eventId}`)
            .then((response) => response.ok ? response.json() : Promise.reject(new Error('Event unavailable')))
            .then((data) => {
                setEditEvent(data.data);
                setDefaultStart(undefined);
                setDrawerOpen(true);
            })
            .catch(() => {
                openedDirectEventRef.current = null;
            });
    }, []);

    const refreshCalendar = useCallback((_event: CalendarRealtimeEvent) => {
        router.reload({ only: ['events', 'users', 'range', 'capabilities'] });
    }, []);

    useEcho<CalendarRealtimeEvent>(
        `user.${currentUserId}.calendar`,
        '.calendar.changed',
        refreshCalendar,
        [refreshCalendar],
    );

    const fcEvents = useMemo(() => initialEvents.filter((e) => {
        if (search.trim()) {
            const q = search.toLowerCase();
            if (!e.title.toLowerCase().includes(q) && !(e.description || '').toLowerCase().includes(q)) return false;
        }
        if (filterType && e.type !== filterType) return false;
        if (filterUserId) {
            const uid = Number(filterUserId);
            const parts = e.participants || [];
            if (!parts.some((p) => p.userId === uid) && e.createdBy?.id !== uid) return false;
        }
        return true;
    }).map(toFC), [initialEvents, search, filterType, filterUserId]);

    function handleViewChange(v: typeof viewMode) {
        setViewMode(v);
        const api = calendarRef.current?.getApi();
        if (api) api.changeView(v);
    }

    function handlePrev() {
        const api = calendarRef.current?.getApi();
        if (api) api.prev();
    }

    function handleNext() {
        const api = calendarRef.current?.getApi();
        if (api) api.next();
    }

    function handleToday() {
        const api = calendarRef.current?.getApi();
        if (api) api.today();
    }

    const handleDatesSet = useCallback((arg: { start: Date; end: Date; view: { currentStart: Date } }) => {
        setCurrentDate((previous) => previous.getTime() === arg.view.currentStart.getTime()
            ? previous
            : arg.view.currentStart);

        const start = localDate(arg.start);
        const inclusiveEnd = new Date(arg.end);
        inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
        const end = localDate(inclusiveEnd);

        const requestedRange = `${start}:${end}`;

        if (range.start === start && range.end === end) {
            requestedRangeRef.current = null;
            return;
        }

        if (requestedRangeRef.current === requestedRange) return;

        requestedRangeRef.current = requestedRange;

        router.get('/calendar', { start, end }, {
            only: ['events', 'users', 'range', 'capabilities'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onError: () => { requestedRangeRef.current = null; },
        });
    }, [range]);

    const eventContent = useCallback((arg: EventContentArg) => <CalendarEventPill {...arg} />, []);

    function handleEventClick(arg: EventClickArg) {
        const id = Number(arg.event.id);
        const found = initialEvents.find((e) => e.id === id);
        if (found) {
            fetch(`/calendar/events/${id}`)
                .then((r) => r.ok ? r.json() : Promise.reject(new Error('Event unavailable')))
                .then((data) => {
                    setEditEvent(data.data || found);
                    setDefaultStart(undefined);
                    setDrawerOpen(true);
                })
                .catch(() => {
                    setEditEvent(found);
                    setDefaultStart(undefined);
                    setDrawerOpen(true);
                });
        }
    }

    function handleSidebarEventClick(event: CalendarEventRow) {
        fetch(`/calendar/events/${event.id}`)
            .then((r) => r.ok ? r.json() : Promise.reject(new Error('Event unavailable')))
            .then((data) => {
                setEditEvent(data.data || event);
                setDefaultStart(undefined);
                setDrawerOpen(true);
            })
            .catch(() => {
                setEditEvent(event);
                setDefaultStart(undefined);
                setDrawerOpen(true);
            });
    }

    function handleDateSelect(arg: DateSelectArg) {
        setCurrentDate(arg.start);
        if (!capabilities.create || isPastDay(arg.start)) return;
        setEditEvent(undefined);
        setDefaultType('task');
        setDefaultStart(arg.startStr);
        setDrawerOpen(true);
    }

    function handleDateClick(arg: DateClickArg) {
        setCurrentDate(arg.date);
    }

    function openCreateDrawer(type: CalendarEventType = 'task') {
        if (!capabilities.create) return;
        setEditEvent(undefined);
        setDefaultType(type);
        setDefaultStart(undefined);
        setDrawerOpen(true);
    }

    function closeEventDrawer() {
        setDrawerOpen(false);
        setEditEvent(undefined);

        const url = new URL(window.location.href);
        url.searchParams.delete('event');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }

    function handleEventDrop(arg: EventDropArg) {
        const id = Number(arg.event.id);
        const startStr = arg.event.start?.toISOString();
        const endStr = arg.event.end?.toISOString();

        if (!arg.event.extendedProps.capabilities?.update || !startStr) {
            arg.revert();
            return;
        }

        fetch(`/calendar/events/${id}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '' },
            body: JSON.stringify({ starts_at: startStr, ends_at: endStr }),
        })
            .then((r) => {
                if (!r.ok) throw new Error('Move failed');
                toast.success(t('calendar.toast.moved'));
                router.reload({ only: ['events', 'users'] });
            })
            .catch(() => {
                arg.revert();
                toast.error(t('calendar.toast.moveFailed'));
            });
    }

    function handleEventResize(arg: EventResizeDoneArg) {
        const id = Number(arg.event.id);
        const endStr = arg.event.end?.toISOString();

        if (!arg.event.extendedProps.capabilities?.update || !endStr) {
            arg.revert();
            return;
        }

        fetch(`/calendar/events/${id}/resize`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '' },
            body: JSON.stringify({ ends_at: endStr }),
        })
            .then((r) => {
                if (!r.ok) throw new Error('Resize failed');
                toast.success(t('calendar.toast.resized'));
                router.reload({ only: ['events', 'users'] });
            })
            .catch(() => {
                arg.revert();
                toast.error(t('calendar.toast.resizeFailed'));
            });
    }

    const headerAction = (
        <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('calendar.newEvent')} aria-label={t('calendar.newEvent')} onPress={() => openCreateDrawer()} isDisabled={!capabilities.create}>
            <IconPlus size={16} />
        </AppButton>
    );

    return (
        <>
            <Head title={t('calendar.title')} />
            <AppShell
                eyebrowKey="calendar.eyebrow"
                titleKey="calendar.title"
                subtitleKey="calendar.subtitle"
                action={headerAction}>
                <div className="calendar-workspace mx-auto max-w-[1720px] px-3 pb-8 pt-3 sm:px-5 sm:pt-5">
                    <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)_280px] 2xl:gap-5">
                        <div className="lg:sticky lg:top-4">
                            <CalendarSidebar
                                search={search}
                                onSearchChange={setSearch}
                                filterType={filterType}
                                onFilterTypeChange={setFilterType}
                                filterUserId={filterUserId}
                                onFilterUserIdChange={setFilterUserId}
                                currentDate={currentDate}
                                onSelectDate={(date) => {
                                    setCurrentDate(date);
                                    calendarRef.current?.getApi()?.changeView('timeGridDay', date);
                                    setViewMode('timeGridDay');
                                }}
                                users={users}
                                onCreateClick={openCreateDrawer}
                                canCreate={capabilities.create}
                                events={initialEvents}
                            />
                        </div>

                        <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <CalendarToolbar
                                currentDate={currentDate}
                                viewMode={viewMode}
                                onViewModeChange={handleViewChange}
                                onPrev={handlePrev}
                                onNext={handleNext}
                                onToday={handleToday}
                            />
                            <div className="p-0">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView={viewMode}
                                    locale={locale === 'fr' ? 'fr' : 'en'}
                                    locales={[frLocale]}
                                    events={fcEvents}
                                    eventContent={eventContent}
                                    eventClick={handleEventClick}
                                    dateClick={handleDateClick}
                                    selectable={capabilities.create}
                                    selectAllow={(selection) => !isPastDay(selection.start)}
                                    select={handleDateSelect}
                                    datesSet={handleDatesSet}
                                    dayMaxEvents={3}
                                    height="auto"
                                    headerToolbar={false}
                                    firstDay={1}
                                    slotMinTime="07:00:00"
                                    slotMaxTime="20:00:00"
                                    allDaySlot={true}
                                    nowIndicator={true}
                                    editable={true}
                                    eventDrop={handleEventDrop}
                                    eventResize={handleEventResize}
                                    eventDurationEditable={true}
                                    eventStartEditable={true}
                                />
                            </div>
                        </Card>

                        <div className="hidden 2xl:sticky 2xl:top-4 2xl:block">
                            <CalendarRightPanel
                                events={initialEvents}
                                onEventClick={handleSidebarEventClick}
                                onCreateEvent={openCreateDrawer}
                                canCreate={capabilities.create}
                            />
                        </div>
                    </div>

                    {/* Right panel for smaller screens - below the calendar */}
                    <div className="mt-4 2xl:hidden">
                        <CalendarRightPanel
                            events={initialEvents}
                            onEventClick={handleSidebarEventClick}
                            onCreateEvent={openCreateDrawer}
                            canCreate={capabilities.create}
                        />
                    </div>
                </div>
            </AppShell>

            <CalendarEventDrawer
                key={`${drawerOpen ? 'open' : 'closed'}-${editEvent?.id ?? 'new'}-${defaultStart ?? ''}-${defaultType}`}
                isOpen={drawerOpen}
                onOpenChange={(open) => { if (!open) closeEventDrawer(); }}
                users={users}
                editEvent={editEvent}
                defaultStart={defaultStart}
                defaultType={defaultType}
                canManageAdminVisibility={capabilities.manageAdminVisibility}
            />
        </>
    );
}
