import { IconPlus, IconAlertTriangle } from '@tabler/icons-react';
import { Button, Chip } from '@heroui/react';

import type { CalendarEventRow, CalendarEventType } from '@/features/calendar/types';
import { EVENT_TYPE_CLASSES } from '@/features/calendar/types';
import { MiniCalendar } from '@/features/calendar/components/MiniCalendar';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { useTranslation } from '@/lib/i18n';

type UserOption = { id: number; name: string; email: string };

type Props = {
    search: string;
    onSearchChange: (v: string) => void;
    filterType: string;
    onFilterTypeChange: (v: string) => void;
    filterUserId: string;
    onFilterUserIdChange: (v: string) => void;
    currentDate: Date;
    onDateChange: (d: Date) => void;
    onDayClick: (d: Date) => void;
    users: UserOption[];
    onCreateClick: () => void;
    canCreate: boolean;
    events: CalendarEventRow[];
    onEventClick: (e: CalendarEventRow) => void;
};

const TYPE_IDS: string[] = ['', ...Object.keys(EVENT_TYPE_CLASSES)];

export function CalendarSidebar({
    search, onSearchChange, filterType, onFilterTypeChange,
    filterUserId, onFilterUserIdChange, currentDate, onDateChange,
    onDayClick, users, onCreateClick, canCreate, events, onEventClick,
}: Props) {
    const { t } = useTranslation();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const overdueCount = events.filter(
        (e) => e.startsAt < todayStr && e.status !== 'completed' && e.status !== 'cancelled',
    ).length;

    const todayEvents = events.filter((e) => e.startsAt?.startsWith(todayStr)).slice(0, 5);

    return (
        <div className="flex flex-col gap-3 overflow-y-auto">
            <div className="rounded-xl border border-white/8 bg-[color-mix(in_srgb,var(--crm-elevated)_70%,#000)] p-[14px]">

                {/* New event button */}
                <Button
                    type="button"
                    variant="primary"
                    onPress={() => onCreateClick()}
                    isDisabled={!canCreate}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--crm-gold)] px-3 py-2 text-xs font-semibold text-black transition hover:brightness-110">
                    <IconPlus size={14} /> {t('calendar.newEvent')}
                </Button>

                {/* Search */}
                <AppSearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder={t('calendar.search')}
                    ariaLabel={t('calendar.search')}
                    maxWidth=""
                    className="mt-3"
                />

                {/* Divider */}
                <div className="my-3 border-t border-white/8" />

                {/* Mini calendar */}
                <MiniCalendar currentDate={currentDate} onDateChange={onDateChange} onDayClick={onDayClick} />

                {/* Overdue badge */}
                {overdueCount > 0 && (
                    <Chip
                        variant="soft"
                        color="danger"
                        className="mt-3 h-auto w-full justify-start gap-2 rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs font-semibold text-red-400">
                        <IconAlertTriangle size={13} className="text-red-400" /> {t('calendar.todayOverdue', { count: overdueCount })}
                    </Chip>
                )}

                {/* Today mini-list */}
                {todayEvents.length > 0 && (
                    <div className="mt-3">
                        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-gold)]">{t('calendar.today')}</p>
                        <div className="space-y-0.5">
                            {todayEvents.map((e) => (
                                <Button
                                    key={e.id}
                                    type="button"
                                    variant="ghost"
                                    onPress={() => onEventClick(e)}
                                    className="flex h-auto min-h-0 w-full items-center gap-2 rounded px-2 py-1 text-left text-[10px] font-medium text-white/70 transition hover:bg-white/5 hover:text-white">
                                    <span className={`size-1.5 shrink-0 rounded-full ${EVENT_TYPE_CLASSES[e.type]?.split(' ')[0] || 'bg-zinc-400'}`} />
                                    <span className="min-w-0 flex-1 truncate">{e.title}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="my-3 border-t border-white/8" />

                {/* Event type filter */}
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">{t('calendar.eventType')}</p>
                <div className="space-y-0.5">
                    {TYPE_IDS.map((id) => (
                        <Button
                            key={id}
                            type="button"
                            variant="ghost"
                            onPress={() => onFilterTypeChange(id)}
                            className={`flex h-auto min-h-0 w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                filterType === id
                                    ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                    : 'text-[var(--crm-text-muted)] hover:bg-white/5 hover:text-white'
                            }`}>
                            {id ? (
                                <span className={`size-2 rounded-full ${EVENT_TYPE_CLASSES[id as CalendarEventType]?.split(' ')[0] || 'bg-zinc-400'}`} />
                            ) : null}
                            {id ? t(`calendar.eventTypes.${id}`) : t('calendar.allTypes')}
                        </Button>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-3 border-t border-white/8" />

                {/* User filter */}
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">{t('calendar.user')}</p>
                <div className="flex flex-wrap gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        onPress={() => onFilterUserIdChange('')}
                        className={`h-auto min-h-0 rounded-lg px-2.5 py-1 text-[10px] font-medium transition ${
                            filterUserId === '' ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'text-[var(--crm-text-muted)] hover:text-white'
                        }`}>{t('calendar.allUsers')}</Button>
                    {users.map((u) => (
                        <Button
                            key={u.id}
                            type="button"
                            variant="ghost"
                            onPress={() => onFilterUserIdChange(String(u.id))}
                            className={`h-auto min-h-0 rounded-lg px-2.5 py-1 text-[10px] font-medium transition ${
                                filterUserId === String(u.id) ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'text-[var(--crm-text-muted)] hover:text-white'
                            }`}>
                            {u.name.split(' ')[0]}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
