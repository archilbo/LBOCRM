import { Head, router } from '@inertiajs/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import type { CalendarEventRow } from '@/features/calendar/types';
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
import type { EventClickArg, DateSelectArg, EventDropArg, EventResizeDoneArg } from '@fullcalendar/core';

type PageProps = {
    events: CalendarEventRow[];
    users: { id: number; name: string; email: string }[];
};

function toFC(event: CalendarEventRow) {
    const color = event.color || EVENT_TYPE_COLORS[event.type] || '#6b7280';
    return {
        id: String(event.id),
        title: event.title,
        start: event.startsAt,
        end: event.endsAt || undefined,
        allDay: event.allDay,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: color,
        extendedProps: {
            type: event.type,
            description: event.description,
            status: event.status,
            priority: event.priority,
            eventNumber: event.eventNumber,
        },
    };
}

export default function CalendarIndex({ events: _events, users }: PageProps) {
    const initialEvents = Array.isArray(_events) ? _events : [];
    const calendarRef = useRef<FullCalendar>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterUserId, setFilterUserId] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editEvent, setEditEvent] = useState<CalendarEventRow | undefined>(undefined);
    const [defaultStart, setDefaultStart] = useState<string | undefined>(undefined);

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
        setCurrentDate(arg.view.currentStart);
    }, []);

    function handleEventClick(arg: EventClickArg) {
        const id = Number(arg.event.id);
        const found = initialEvents.find((e) => e.id === id);
        if (found) {
            fetch(`/calendar/events/${id}`)
                .then((r) => r.json())
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
            .then((r) => r.json())
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
        setEditEvent(undefined);
        setDefaultStart(arg.startStr);
        setDrawerOpen(true);
    }

    function openCreateDrawer() {
        setEditEvent(undefined);
        setDefaultStart(undefined);
        setDrawerOpen(true);
    }

    function handleEventDrop(arg: EventDropArg) {
        const id = Number(arg.event.id);
        const startStr = arg.event.start?.toISOString();
        const endStr = arg.event.end?.toISOString();

        fetch(`/calendar/events/${id}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
            body: JSON.stringify({ starts_at: startStr, ends_at: endStr }),
        })
            .then((r) => {
                if (!r.ok) throw new Error('Move failed');
                toast.success('Event moved.');
                router.reload({ only: ['events', 'users'] });
            })
            .catch(() => {
                arg.revert();
                toast.error('Failed to move event.');
            });
    }

    function handleEventResize(arg: EventResizeDoneArg) {
        const id = Number(arg.event.id);
        const endStr = arg.event.end?.toISOString();

        fetch(`/calendar/events/${id}/resize`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
            body: JSON.stringify({ ends_at: endStr }),
        })
            .then((r) => {
                if (!r.ok) throw new Error('Resize failed');
                toast.success('Event resized.');
                router.reload({ only: ['events', 'users'] });
            })
            .catch(() => {
                arg.revert();
                toast.error('Failed to resize event.');
            });
    }

    const headerAction = (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={openCreateDrawer}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--crm-gold)] px-3 text-xs font-semibold text-black transition hover:brightness-110">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New event
            </button>
        </div>
    );

    return (
        <>
            <Head title="Calendar" />
            <AppShell
                eyebrowKey="nav.calendar"
                titleKey="nav.calendar"
                subtitleKey="Schedule tasks, notes, reminders, and follow-ups."
                action={headerAction}>
                <div className="calendar-workspace FORCE_CALENDAR_UI_POLISH_55UI mx-auto max-w-[1600px] px-4 pt-4">
                    <div className="grid grid-cols-[280px_minmax(0,1fr)_320px] gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px] max-lg:grid-cols-[280px_minmax(0,1fr)] max-md:grid-cols-1">
                        <CalendarSidebar
                            search={search}
                            onSearchChange={setSearch}
                            filterType={filterType}
                            onFilterTypeChange={setFilterType}
                            filterUserId={filterUserId}
                            onFilterUserIdChange={setFilterUserId}
                            currentDate={currentDate}
                            onDateChange={(d) => { setCurrentDate(d); calendarRef.current?.getApi()?.gotoDate(d); }}
                            onDayClick={(d) => { calendarRef.current?.getApi()?.gotoDate(d); setViewMode('timeGridDay'); }}
                            users={users}
                            onCreateClick={openCreateDrawer}
                            events={initialEvents}
                            onEventClick={handleSidebarEventClick}
                        />

                        <div className="min-w-0 overflow-hidden rounded-xl border border-white/8 bg-[#070707]">
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
                                    events={fcEvents}
                                    eventContent={CalendarEventPill}
                                    eventClick={handleEventClick}
                                    selectable={true}
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
                        </div>

                        <div className="max-xl:hidden">
                            <CalendarRightPanel
                                events={initialEvents}
                                onEventClick={handleSidebarEventClick}
                                onCreateEvent={openCreateDrawer}
                            />
                        </div>
                    </div>

                    {/* Right panel for smaller screens - below the calendar */}
                    <div className="mt-4 xl:hidden">
                        <CalendarRightPanel
                            events={initialEvents}
                            onEventClick={handleSidebarEventClick}
                            onCreateEvent={openCreateDrawer}
                        />
                    </div>
                </div>
            </AppShell>

            <CalendarEventDrawer
                isOpen={drawerOpen}
                onOpenChange={(o) => { if (!o) { setDrawerOpen(false); setEditEvent(undefined); } }}
                users={users}
                editEvent={editEvent}
                defaultStart={defaultStart}
            />
        </>
    );
}
