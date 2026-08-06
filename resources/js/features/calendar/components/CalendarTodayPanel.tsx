import { Button } from '@heroui/react';

import type { CalendarEventRow } from '@/features/calendar/types';
import { EVENT_TYPE_CLASSES } from '@/features/calendar/types';
import { useTranslation } from '@/lib/i18n';

type Props = {
    events: CalendarEventRow[];
    onEventClick: (event: CalendarEventRow) => void;
};

export function CalendarTodayPanel({ events, onEventClick }: Props) {
    const { t } = useTranslation();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const overdue = events.filter(
        (e) => e.startsAt < todayStr && e.status !== 'completed' && e.status !== 'cancelled',
    );
    const dueToday = events.filter((e) => e.startsAt?.startsWith(todayStr));
    const upcoming = events.filter(
        (e) => e.startsAt > todayStr && e.status !== 'completed' && e.status !== 'cancelled',
    ).slice(0, 5);

    return (
        <div className="space-y-3">
            <Section id="overdue" title={t('calendar.overdue')} count={overdue.length} events={overdue} onEventClick={onEventClick} accent="text-red-400" todayStr={todayStr} />
            <Section id="today" title={t('calendar.today')} count={dueToday.length} events={dueToday} onEventClick={onEventClick} accent="text-[var(--crm-gold)]" todayStr={todayStr} />
            <Section id="upcoming" title={t('calendar.upcoming')} count={upcoming.length} events={upcoming} onEventClick={onEventClick} accent="text-[var(--crm-text-muted)]" todayStr={todayStr} />
        </div>
    );
}

function Section({ id, title, count, events, onEventClick, accent, todayStr }: {
    id: string;
    title: string;
    count: number;
    events: CalendarEventRow[];
    onEventClick: (e: CalendarEventRow) => void;
    accent: string;
    todayStr: string;
}) {
    const { t } = useTranslation();
    if (events.length === 0 && id !== 'overdue') return null;

    return (
        <div>
            <div className="mb-1.5 flex items-center gap-2">
                <span className={`text-[9px] font-semibold uppercase tracking-wider ${accent}`}>{title}</span>
                <span className="text-[9px] text-[var(--crm-text-muted)]">{count}</span>
            </div>
            {events.length === 0 ? (
                <p className="py-2 text-[10px] text-[var(--crm-text-soft)]">{t('calendar.none')}</p>
            ) : (
                <div className="space-y-1">
                    {events.map((e) => (
                        <Button key={e.id} type="button" variant="ghost" onPress={() => onEventClick(e)}
                            className="flex h-auto min-h-0 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-[var(--crm-surface-2)]">
                            <span className={`size-2 shrink-0 rounded-full ${EVENT_TYPE_CLASSES[e.type]?.split(' ')[0] || 'bg-zinc-400'}`} />
                            <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{e.title}</span>
                            {e.startsAt?.startsWith(todayStr) ? (
                                <span className="shrink-0 text-[9px] text-[var(--crm-text-soft)]">
                                    {new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : null}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
