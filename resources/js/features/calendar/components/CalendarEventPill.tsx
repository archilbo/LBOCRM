import { IconCalendarEvent, IconClock, IconUsers } from '@tabler/icons-react';
import { Avatar, Card, Tooltip } from '@heroui/react';
import type { EventContentArg } from '@fullcalendar/core';

import type { CalendarEventType, CalendarParticipant } from '@/features/calendar/types';
import { EVENT_TYPE_COLORS } from '@/features/calendar/types';
import { useTranslation } from '@/lib/i18n';

function getColor(type: CalendarEventType | undefined, customColor: unknown): string {
    return typeof customColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(customColor)
        ? customColor
        : (type && EVENT_TYPE_COLORS[type]) || '#6b7280';
}

function participants(value: unknown): CalendarParticipant[] {
    return Array.isArray(value) ? value.filter((participant): participant is CalendarParticipant => (
        typeof participant === 'object' && participant !== null && 'id' in participant && 'user' in participant
    )) : [];
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

function EventDetailPreview({ arg, color, type }: { arg: EventContentArg; color: string; type?: CalendarEventType }) {
    const { t, locale } = useTranslation();
    const start = arg.event.start;
    const end = arg.event.end;
    const people = participants(arg.event.extendedProps.participants).filter((participant) => participant.user);
    const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
    const dateLabel = start?.toLocaleDateString(intlLocale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeLabel = arg.event.allDay
        ? t('calendar.allDay')
        : [start, end]
            .filter((date): date is Date => date !== null)
            .map((date) => date.toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' }))
            .join(' – ');

    return (
        <Card className="w-72 gap-0 overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <Card.Header className="flex items-center gap-2.5 border-b border-[var(--border)] px-3.5 py-3">
                <span className="flex size-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}20`, color }}><IconCalendarEvent size={14} /></span>
                <div className="min-w-0">
                    <Card.Title className="text-xs font-semibold text-[var(--foreground)]">{t('calendar.drawer.details')}</Card.Title>
                    {type ? <Card.Description className="mt-0.5 text-[9px]">{t(`calendar.eventTypes.${type}`)}</Card.Description> : null}
                </div>
            </Card.Header>
            <Card.Content className="space-y-3 p-3.5">
                <div className="border-l-2 pl-2.5" style={{ borderColor: color }}>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{arg.event.title}</p>
                    {arg.event.extendedProps.description ? <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">{String(arg.event.extendedProps.description)}</p> : null}
                </div>

                <div className="grid gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]"><IconClock size={13} className="shrink-0" /><span className="font-medium text-[var(--foreground)]">{timeLabel || '—'}</span></div>
                    {dateLabel ? <div className="flex items-center gap-2 text-[var(--text-muted)]"><IconCalendarEvent size={13} className="shrink-0" /><span className="font-medium text-[var(--foreground)] capitalize">{dateLabel}</span></div> : null}
                </div>

                {people.length > 0 ? (
                    <div className="border-t border-[var(--border)] pt-2.5">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"><IconUsers size={12} /> {t('calendar.drawer.assignees')}</div>
                        <div className="flex items-center -space-x-1.5">
                            {people.slice(0, 5).map((participant) => (
                                <Avatar key={participant.id} size="sm" className="size-6 border-2 border-[var(--surface)] text-[8px]">
                                    <Avatar.Fallback className="bg-[color-mix(in_srgb,var(--accent)_20%,var(--surface))] text-[8px] font-bold text-[var(--accent)]">{initials(participant.user?.name || '?')}</Avatar.Fallback>
                                </Avatar>
                            ))}
                            {people.length > 5 ? <span className="z-10 flex size-6 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--surface-2)] text-[8px] font-semibold text-[var(--text-muted)]">+{people.length - 5}</span> : null}
                        </div>
                    </div>
                ) : null}
            </Card.Content>
        </Card>
    );
}

export function CalendarEventPill(arg: EventContentArg) {
    const type = arg.event.extendedProps.type as CalendarEventType | undefined;
    const color = getColor(type, arg.event.extendedProps.color);
    const pillClass = arg.view.type === 'dayGridMonth'
        ? 'truncate rounded-md px-2 text-[10px] font-semibold leading-[22px] shadow-sm outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]'
        : 'flex h-full flex-col overflow-hidden rounded-lg px-2 py-1 shadow-sm outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]';

    return (
        <Tooltip delay={350} closeDelay={120}>
            <Tooltip.Trigger className="block min-w-0">
                <div
                    className={pillClass}
                    style={{
                        backgroundColor: `${color}16`,
                        color,
                        border: `1px solid ${color}48`,
                    }}>
                    {arg.view.type === 'dayGridMonth' ? arg.event.title : (
                        <span className="truncate text-[10px] font-semibold leading-[18px]">
                            {arg.timeText ? <span className="opacity-60">{arg.timeText} </span> : null}
                            {arg.event.title}
                        </span>
                    )}
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content offset={10} className="border-0 bg-transparent p-0 text-left shadow-none">
                <EventDetailPreview arg={arg} color={color} type={type} />
            </Tooltip.Content>
        </Tooltip>
    );
}
