import { IconPlus } from '@tabler/icons-react';
import { Head, router } from '@inertiajs/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';
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
import frLocale from '@fullcalendar/core/locales/fr';
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { memo } from 'react';

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
    const { t, locale } = useTranslation();
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
        // Only update if the date actually changed to prevent infinite loops
        const newDate = arg.view.currentStart;
        if (newDate.getTime() !== currentDate.getTime()) {
            setCurrentDate(newDate);
        }
    }, [currentDate]);

    const eventContent = useCallback((arg: any) => <CalendarEventPill {...arg} />, []);

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

        fetch(`/calendar/events/${id}/resize`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
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
        <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('calendar.newEvent')} aria-label={t('calendar.newEvent')} onPress={openCreateDrawer}>
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
                            onDateChange={(d) => { calendarRef.current?.getApi()?.gotoDate(d); }}
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
                                    locale={locale === 'fr' ? 'fr' : 'en'}
                                    locales={[frLocale]}
                                    events={fcEvents}
                                    eventContent={eventContent}
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
