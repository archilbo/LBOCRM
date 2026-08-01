import { Plus, Search, X, AlertTriangle, CalendarDays } from 'lucide-react';
import type { CalendarEventRow, CalendarEventType } from '@/features/calendar/types';
import { EVENT_TYPE_LABELS, EVENT_TYPE_CLASSES } from '@/features/calendar/types';
import { MiniCalendar } from '@/features/calendar/components/MiniCalendar';

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
    events: CalendarEventRow[];
    onEventClick: (e: CalendarEventRow) => void;
};

const TYPES: { id: string; label: string }[] = [
    { id: '', label: 'All types' },
    ...Object.entries(EVENT_TYPE_LABELS).map(([id, label]) => ({ id, label })),
];

export function CalendarSidebar({
    search, onSearchChange, filterType, onFilterTypeChange,
    filterUserId, onFilterUserIdChange, currentDate, onDateChange,
    onDayClick, users, onCreateClick, events, onEventClick,
}: Props) {
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
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--crm-gold)] px-3 py-2 text-xs font-semibold text-black transition hover:brightness-110">
                    <Plus size={14} /> New event
                </button>

                {/* Search */}
                <div className="relative mt-3">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search events..."
                        className="h-8 w-full rounded-lg border border-white/8 bg-white/5 pl-8 pr-8 text-xs text-white placeholder-[var(--crm-text-muted)] outline-none transition focus:border-[var(--crm-gold)]/40 focus:ring-2 focus:ring-[var(--crm-gold)]/20"
                    />
                    {search ? (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]">
                            <X size={12} />
                        </button>
                    ) : null}
                </div>

                {/* Divider */}
                <div className="my-3 border-t border-white/8" />

                {/* Mini calendar */}
                <MiniCalendar currentDate={currentDate} onDateChange={onDateChange} onDayClick={onDayClick} />

                {/* Overdue badge */}
                {overdueCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2">
                        <AlertTriangle size={13} className="text-red-400" />
                        <span className="text-xs font-semibold text-red-400">{overdueCount} overdue</span>
                    </div>
                )}

                {/* Today mini-list */}
                {todayEvents.length > 0 && (
                    <div className="mt-3">
                        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-gold)]">Today</p>
                        <div className="space-y-0.5">
                            {todayEvents.map((e) => (
                                <button
                                    key={e.id}
                                    type="button"
                                    onClick={() => onEventClick(e)}
                                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[10px] font-medium text-white/70 transition hover:bg-white/5">
                                    <span className={`size-1.5 shrink-0 rounded-full ${EVENT_TYPE_CLASSES[e.type]?.split(' ')[0] || 'bg-zinc-400'}`} />
                                    <span className="min-w-0 flex-1 truncate">{e.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="my-3 border-t border-white/8" />

                {/* Event type filter */}
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">Event type</p>
                <div className="space-y-0.5">
                    {TYPES.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onFilterTypeChange(t.id)}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                filterType === t.id
                                    ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                    : 'text-[var(--crm-text-muted)] hover:bg-white/5 hover:text-white'
                            }`}>
                            {t.id ? (
                                <span className={`size-2 rounded-full ${EVENT_TYPE_CLASSES[t.id as CalendarEventType]?.split(' ')[0] || 'bg-zinc-400'}`} />
                            ) : null}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-3 border-t border-white/8" />

                {/* User filter */}
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-text-muted)]">User</p>
                <div className="flex flex-wrap gap-1">
                    <button
                        type="button"
                        onClick={() => onFilterUserIdChange('')}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition ${
                            filterUserId === '' ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'text-[var(--crm-text-muted)] hover:text-white'
                        }`}>All</button>
                    {users.map((u) => (
                        <button
                            key={u.id}
                            type="button"
                            onClick={() => onFilterUserIdChange(String(u.id))}
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition ${
                                filterUserId === String(u.id) ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'text-[var(--crm-text-muted)] hover:text-white'
                            }`}>
                            {u.name.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
