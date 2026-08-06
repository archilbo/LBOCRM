import { IconCalendarMonth, IconListCheck, IconBell, IconAlertTriangle, IconPlus } from '@tabler/icons-react';
import { Button } from '@heroui/react';

import type { CalendarEventRow } from '@/features/calendar/types';
import { EVENT_TYPE_CLASSES } from '@/features/calendar/types';
import { useTranslation } from '@/lib/i18n';

type Props = {
    events: CalendarEventRow[];
    onEventClick: (e: CalendarEventRow) => void;
    onCreateEvent: () => void;
};

export function CalendarRightPanel({ events, onEventClick, onCreateEvent }: Props) {
    const { t, locale } = useTranslation();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

    const dueToday = events.filter((e) => e.startsAt?.startsWith(todayStr)).slice(0, 8);
    const overdue = events.filter(
        (e) => e.startsAt < todayStr && e.status !== 'completed' && e.status !== 'cancelled',
    );
    const reminders = events.filter((e) => e.type === 'reminder').slice(0, 5);

    const dateLabel = now.toLocaleDateString(intlLocale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="flex flex-col gap-3 overflow-y-auto">
            {/* Today focus */}
            <div className="rounded-xl border border-white/8 bg-[color-mix(in_srgb,var(--crm-elevated)_70%,#000)] p-[14px]">
                <div className="mb-3 flex items-center gap-2">
                    <IconCalendarMonth size={14} className="text-[var(--crm-gold)]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--crm-gold)]">{t('calendar.today')}</span>
                    <span className="ml-auto text-[9px] text-[var(--crm-text-muted)]">{dateLabel}</span>
                </div>
                {dueToday.length === 0 ? (
                    <p className="py-5 text-center text-[10px] text-[var(--crm-text-muted)]">{t('calendar.nothingScheduled')}</p>
                ) : (
                    <div className="space-y-1">
                        {dueToday.map((e) => (
                            <Button
                                key={e.id}
                                type="button"
                                variant="ghost"
                                onPress={() => onEventClick(e)}
                                className="flex h-auto min-h-0 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5">
                                <span className={`size-2 shrink-0 rounded-full ${EVENT_TYPE_CLASSES[e.type]?.split(' ')[0] || 'bg-zinc-400'}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[10px] font-medium">{e.title}</p>
                                    <p className="text-[9px] text-[var(--crm-text-muted)]">
                                        {e.allDay ? t('calendar.allDay') : new Date(e.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming reminders */}
            <div className="rounded-xl border border-white/8 bg-[color-mix(in_srgb,var(--crm-elevated)_70%,#000)] p-[14px]">
                <div className="mb-3 flex items-center gap-2">
                    <IconBell size={14} className="text-purple-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">{t('calendar.reminders')}</span>
                    <span className="ml-auto text-[9px] text-[var(--crm-text-muted)]">{reminders.length}</span>
                </div>
                {reminders.length === 0 ? (
                    <p className="py-5 text-center text-[10px] text-[var(--crm-text-muted)]">{t('calendar.noReminders')}</p>
                ) : (
                    <div className="space-y-1">
                        {reminders.map((e) => (
                            <Button
                                key={e.id}
                                type="button"
                                variant="ghost"
                                onPress={() => onEventClick(e)}
                                className="flex h-auto min-h-0 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5">
                                <IconBell size={12} className="shrink-0 text-purple-400/60" />
                                <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{e.title}</span>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Overdue */}
            <div className="rounded-xl border border-white/8 bg-[color-mix(in_srgb,var(--crm-elevated)_70%,#000)] p-[14px]">
                <div className="mb-3 flex items-center gap-2">
                    <IconAlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-400">{t('calendar.overdue')}</span>
                    <span className="ml-auto text-[9px] text-[var(--crm-text-muted)]">{overdue.length}</span>
                </div>
                {overdue.length === 0 ? (
                    <p className="py-5 text-center text-[10px] text-[var(--crm-text-muted)]">{t('calendar.allCaughtUp')}</p>
                ) : (
                    <div className="space-y-1">
                        {overdue.map((e) => (
                            <Button
                                key={e.id}
                                type="button"
                                variant="ghost"
                                onPress={() => onEventClick(e)}
                                className="flex h-auto min-h-0 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5">
                                <span className={`size-2 shrink-0 rounded-full ${EVENT_TYPE_CLASSES[e.type]?.split(' ')[0] || 'bg-zinc-400'}`} />
                                <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{e.title}</span>
                                <span className="text-[9px] text-red-400/60">
                                    {t('calendar.daysAgo', { count: Math.ceil((Date.now() - new Date(e.startsAt).getTime()) / 86400000) })}
                                </span>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border border-white/8 bg-[color-mix(in_srgb,var(--crm-elevated)_70%,#000)] p-[14px]">
                <div className="mb-3 flex items-center gap-2">
                    <IconListCheck size={14} className="text-[var(--crm-text-muted)]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">{t('calendar.quickActions')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onPress={onCreateEvent}
                        className="flex h-auto min-h-0 items-center gap-2 rounded-lg border-white/8 px-3 py-2.5 text-[10px] font-medium transition hover:bg-white/5">
                        <IconCalendarMonth size={13} className="text-[var(--crm-gold)]" /> {t('calendar.newEvent')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onPress={onCreateEvent}
                        className="flex h-auto min-h-0 items-center gap-2 rounded-lg border-white/8 px-3 py-2.5 text-[10px] font-medium transition hover:bg-white/5">
                        <IconPlus size={13} className="text-blue-400" /> {t('calendar.newNote')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
