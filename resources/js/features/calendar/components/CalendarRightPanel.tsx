import { IconAlertTriangle, IconBellRinging, IconCalendarMonth, IconChevronDown, IconChevronRight, IconClock, IconPlus } from '@tabler/icons-react';
import { Avatar, Card, Chip } from '@heroui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import type { CalendarEventRow } from '@/features/calendar/types';
import { EVENT_TYPE_COLORS } from '@/features/calendar/types';
import { useTranslation } from '@/lib/i18n';

type Props = {
    events: CalendarEventRow[];
    onEventClick: (event: CalendarEventRow) => void;
    onCreateEvent: (type?: 'task' | 'note') => void;
    canCreate: boolean;
};

function eventTime(event: CalendarEventRow): string {
    if (event.allDay) return '';

    return new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function eventParticipants(event: CalendarEventRow) {
    return Array.isArray(event.participants) ? event.participants : [];
}

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function AttentionCard({
    event,
    label,
    onOpen,
    tone,
    layoutId,
    entranceDelay = 0,
    reduceMotion = false,
}: {
    event: CalendarEventRow;
    label: string;
    onOpen: () => void;
    tone: 'today' | 'reminder' | 'overdue';
    layoutId?: string;
    entranceDelay?: number;
    reduceMotion?: boolean | null;
}) {
    const participants = eventParticipants(event).filter((participant) => participant.user);
    const isReminder = tone === 'reminder';
    const isToday = tone === 'today';
    const cardClass = isReminder
        ? 'border-teal-300/20 bg-teal-600 text-white hover:bg-teal-500'
        : isToday
            ? 'border-cyan-300/20 bg-cyan-700 text-white hover:bg-cyan-600'
            : 'border-red-400/15 bg-red-950/50 text-red-50 hover:bg-red-950/70';
    const mutedClass = isReminder ? 'text-teal-100/80' : isToday ? 'text-cyan-100/80' : 'text-red-100/70';
    const avatarBorderClass = isReminder ? 'border-teal-600' : isToday ? 'border-cyan-700' : 'border-red-950';
    const actionClass = isReminder ? 'bg-white/15 text-white hover:bg-white/25' : isToday ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-red-400/12 text-red-100 hover:bg-red-400/20';
    const iconClass = isReminder ? 'bg-white/14 text-white' : isToday ? 'bg-white/14 text-white' : 'bg-red-400/12 text-red-100';

    return (
        <motion.div
            layout
            layoutId={layoutId}
            initial={layoutId ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={layoutId ? undefined : { opacity: 0, y: -8, scale: 0.96 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 24, delay: layoutId ? 0 : entranceDelay }}>
            <AppButton
            type="button"
            variant="ghost"
            onPress={onOpen}
            className={`h-auto min-h-0 w-full rounded-xl border p-0 text-left transition ${cardClass}`}>
            <span className="flex min-h-[88px] w-full flex-col p-2.5">
                <span className="flex items-center justify-between gap-2">
                    <span className={`flex min-w-0 items-center gap-1.5 truncate text-[9px] font-semibold ${mutedClass}`}>
                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-md ${iconClass}`}>
                            {isReminder ? <IconBellRinging size={11} /> : isToday ? <IconCalendarMonth size={11} /> : <IconAlertTriangle size={11} />}
                        </span>
                        <span className="truncate">{label}</span>
                    </span>
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${actionClass}`}><IconChevronRight size={12} /></span>
                </span>
                <span className="mt-1 block truncate text-[12px] font-semibold">{event.title}</span>
                <span className={`mt-0.5 flex items-center gap-1.5 text-[10px] font-medium ${mutedClass}`}>
                    <IconClock size={13} />
                    {event.allDay ? '—' : eventTime(event)}
                    {event.endsAt && !event.allDay ? ` – ${new Date(event.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                </span>
                <span className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <span className="flex min-w-0 -space-x-2">
                        {participants.slice(0, 4).map((participant) => (
                            <Avatar
                                key={participant.id}
                                size="sm"
                                className={`size-5 border-2 ${avatarBorderClass} text-[7px] font-bold`}>
                                <Avatar.Fallback className="bg-black/15 text-[8px] font-bold text-current">
                                    {initials(participant.user?.name || '?')}
                                </Avatar.Fallback>
                            </Avatar>
                        ))}
                        {participants.length > 4 ? <span className={`z-10 flex size-5 items-center justify-center rounded-full border-2 ${avatarBorderClass} bg-black/15 text-[7px] font-bold`}>+{participants.length - 4}</span> : null}
                    </span>
                </span>
            </span>
            </AppButton>
        </motion.div>
    );
}

function AttentionSection({
    events,
    title,
    tone,
    onEventClick,
    eventLabel,
}: {
    events: CalendarEventRow[];
    title: string;
    tone: 'today' | 'reminder' | 'overdue';
    onEventClick: (event: CalendarEventRow) => void;
    eventLabel: (event: CalendarEventRow) => string;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isReminder = tone === 'reminder';
    const isToday = tone === 'today';
    const icon = isReminder ? <IconBellRinging size={13} /> : isToday ? <IconCalendarMonth size={13} /> : <IconAlertTriangle size={13} />;
    const accentClass = isReminder ? 'text-violet-400' : isToday ? 'text-cyan-400' : 'text-red-400';
    const stackClass = isReminder ? 'border-teal-300/20 bg-teal-600' : isToday ? 'border-cyan-300/20 bg-cyan-700' : 'border-red-400/15 bg-red-950/60';
    const stackLayerClass = isReminder ? 'bg-teal-500/35' : isToday ? 'bg-cyan-500/35' : 'bg-red-900/35';
    const summary = events.length === 1 ? events[0].title : `${events[0].title} · +${events.length - 1}`;
    const reduceMotion = useReducedMotion();

    return (
        <section className={`border-t pt-3 ${tone === 'overdue' ? 'border-red-500/15' : 'border-[var(--border)]'}`}>
            {isExpanded ? (
                <div className={`mb-2 flex items-center gap-2 ${accentClass}`}>
                    {icon}
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">{title}</span>
                    <Chip size="sm" variant="soft" className={`ml-auto text-[9px] ${isReminder ? 'bg-violet-500/10 text-violet-400' : isToday ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-500/10 text-red-400'}`}>{events.length}</Chip>
                    <AppButton type="button" variant="quiet" isIconOnly compact onPress={() => setIsExpanded(false)} tooltip={title} aria-label={title} className={`size-6 min-w-6 rounded-md ${accentClass}`}><IconChevronDown size={14} /></AppButton>
                </div>
            ) : null}
            {isExpanded ? (
                <motion.div
                    key="expanded"
                    initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 30 }}
                    className="overflow-hidden">
                    <div className="max-h-[318px] space-y-1.5 overflow-y-auto overscroll-contain pr-0.5 scrollbar-none">
                        {events.map((event, index) => (
                            <AttentionCard
                                key={event.id}
                                event={event}
                                label={eventLabel(event)}
                                onOpen={() => onEventClick(event)}
                                tone={tone}
                                entranceDelay={0.07 + ((index - 1) * 0.06)}
                                reduceMotion={reduceMotion}
                            />
                        ))}
                    </div>
                </motion.div>
            ) : (
                <motion.div key="collapsed" initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 24 }}>
                    <AppButton
                    type="button"
                    variant="ghost"
                    onPress={() => setIsExpanded(true)}
                    aria-expanded={false}
                    aria-label={`${title} (${events.length})`}
                    className="relative h-[68px] min-h-0 w-full overflow-visible rounded-xl p-0 text-left">
                    {events.length > 2 ? <motion.span aria-hidden animate={{ rotate: isReminder ? -4 : 3, x: -2, y: 8 }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 20 }} className={`absolute inset-x-3 top-2 h-[58px] rounded-xl ${stackLayerClass}`} /> : null}
                    {events.length > 1 ? <motion.span aria-hidden animate={{ rotate: isReminder ? 3 : -3, x: 2, y: 4 }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 20 }} className={`absolute inset-x-1.5 top-1 h-[62px] rounded-xl ${stackLayerClass}`} /> : null}
                    <motion.span animate={{ rotate: isReminder ? -1 : 1 }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 20 }} className={`relative flex h-[62px] w-full items-center gap-2.5 rounded-xl border px-3 ${stackClass}`}>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-black/15 text-white">{icon}</span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-white/70">{title} · {events.length}</span>
                            <span className="mt-0.5 block truncate text-[11px] font-semibold text-white">{summary}</span>
                        </span>
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/15 text-white"><IconChevronRight size={13} /></span>
                    </motion.span>
                    </AppButton>
                </motion.div>
            )}
        </section>
    );
}

export function CalendarRightPanel({ events, onEventClick, onCreateEvent, canCreate }: Props) {
    const { t, locale } = useTranslation();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
    const activeEvents = events.filter((event) => event.status !== 'completed' && event.status !== 'cancelled');
    const todayEvents = activeEvents.filter((event) => event.startsAt.startsWith(todayStr));
    const dueToday = todayEvents.slice(0, 5);
    const upcoming = activeEvents.filter((event) => event.startsAt.slice(0, 10) > todayStr).slice(0, 4);
    const overdue = activeEvents.filter((event) => event.startsAt < todayStr).slice(0, 20);
    const reminders = activeEvents.filter((event) => event.type === 'reminder').slice(0, 12);
    const month = now.toLocaleDateString(intlLocale, { month: 'short' }).replace('.', '').toUpperCase();
    const weekday = now.toLocaleDateString(intlLocale, { weekday: 'long' });

    return (
        <Card className="border-0 bg-transparent shadow-none">
            <Card.Header className="relative isolate overflow-hidden rounded-2xl border border-orange-300/20 bg-[linear-gradient(118deg,#ad4b18_0%,#e98629_58%,#c34d12_100%)] px-4 py-3.5 text-white shadow-none">
                <span aria-hidden className="absolute -right-10 -top-16 size-44 rounded-full bg-white/10" />
                <span aria-hidden className="absolute -bottom-20 left-1/3 size-40 rounded-full bg-black/10" />
                <div className="relative flex min-w-0 items-center gap-3">
                    <span className="flex size-[74px] shrink-0 flex-col items-center justify-center rounded-[1.6rem] bg-black text-white shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-[0.13em]">{month}</span>
                        <span className="mt-0.5 text-[2rem] font-bold leading-none">{now.getDate()}</span>
                    </span>
                    <div className="min-w-0 flex-1 py-0.5">
                        <Card.Title className="text-[19px] font-bold uppercase leading-[1.02] tracking-[-0.03em] text-white">{t('calendar.today')}</Card.Title>
                        <Card.Description className="mt-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-white/90">{weekday}</Card.Description>
                        <span className="mt-3 flex items-center gap-2.5">
                            <span className="h-px min-w-0 flex-1 bg-white/80" />
                            <span className="text-[26px] font-bold leading-none">{todayEvents.length}</span>
                        </span>
                    </div>
                </div>
            </Card.Header>

            <Card.Content className="space-y-5 overflow-visible px-1 pb-1">
                {dueToday.length > 0 ? (
                    <AttentionSection
                        events={dueToday}
                        title={t('calendar.dueToday')}
                        tone="today"
                        onEventClick={onEventClick}
                        eventLabel={(event) => t(`calendar.eventTypes.${event.type}`)}
                    />
                ) : (
                    <section className="border-t border-[var(--border)] pt-4">
                        <div className="border-l-2 border-[var(--border)] py-1 pl-3">
                            <p className="text-[11px] font-medium text-[var(--foreground)]">{t('calendar.allCaughtUp')}</p>
                            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{t('calendar.nothingScheduled')}</p>
                        </div>
                    </section>
                )}

                {upcoming.length > 0 ? (
                    <section className="border-t border-[var(--border)] pt-4">
                        <div className="mb-2.5 flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('calendar.upcoming')}</span>
                            <Chip size="sm" variant="soft" className="ml-auto bg-[var(--surface-2)] text-[9px] text-[var(--text-muted)]">{upcoming.length}</Chip>
                        </div>
                        <div className="space-y-1">
                            {upcoming.map((event) => (
                                <AppButton
                                    key={event.id}
                                    type="button"
                                    variant="ghost"
                                    onPress={() => onEventClick(event)}
                                    className="flex h-auto min-h-0 w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-[var(--surface-2)]">
                                    <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: event.color || EVENT_TYPE_COLORS[event.type] }} />
                                    <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[var(--foreground)]">{event.title}</span>
                                    <span className="shrink-0 text-[9px] text-[var(--text-muted)]">{new Date(event.startsAt).toLocaleDateString(intlLocale, { month: 'short', day: 'numeric' })}</span>
                                </AppButton>
                            ))}
                        </div>
                    </section>
                ) : null}

                {reminders.length > 0 ? <AttentionSection events={reminders} title={t('calendar.reminders')} tone="reminder" onEventClick={onEventClick} eventLabel={() => t('calendar.reminders')} /> : null}

                {overdue.length > 0 ? <AttentionSection events={overdue} title={t('calendar.overdue')} tone="overdue" onEventClick={onEventClick} eventLabel={(event) => `${t('calendar.overdue')} · ${t('calendar.daysAgo', { count: Math.ceil((now.getTime() - new Date(event.startsAt).getTime()) / 86400000) })}`} /> : null}
            </Card.Content>

            <Card.Footer className="mt-4 flex justify-end gap-2 border-t border-[var(--border)] px-1 pt-4">
                <AppButton type="button" variant="accent" isIconOnly compact tooltip={t('calendar.newEvent')} aria-label={t('calendar.newEvent')} onPress={() => onCreateEvent()} isDisabled={!canCreate}><IconCalendarMonth size={14} /></AppButton>
                <AppButton type="button" variant="toolbar" isIconOnly compact tooltip={t('calendar.newNote')} aria-label={t('calendar.newNote')} onPress={() => onCreateEvent('note')} isDisabled={!canCreate}><IconPlus size={14} /></AppButton>
            </Card.Footer>
        </Card>
    );
}
