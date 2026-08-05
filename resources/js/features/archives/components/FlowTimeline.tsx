import { IconAlertTriangle, IconArchive, IconCircleCheck, IconFolderOpen, IconPlus, IconArrowRotaryFirstLeft, IconArrowBackUp } from '@tabler/icons-react';

import type { ArchiveEventRow } from '@/features/archives/types';
import { ARCHIVE_STATUS } from '@/config/statuses';
import { cn } from '@/lib/cn';

type FlowTimelineProps = {
    events: ArchiveEventRow[];
};

const EVENT_ICONS: Record<string, typeof IconPlus> = {
    ready: IconPlus,
    stored: IconArchive,
    checked_out: IconFolderOpen,
    returned: IconArrowBackUp,
    moved: IconArrowRotaryFirstLeft,
    lost: IconAlertTriangle,
    restored: IconCircleCheck,
    note: IconPlus,
};

function eventColor(type: string): string {
    const entry = ARCHIVE_STATUS[type];
    if (entry) {
        const base = entry.listColor.replace('text-', '');
        return `${entry.listColor} border-${base}/30 bg-${base}/10`;
    }
    const custom: Record<string, string> = {
        moved: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
        restored: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
        note: 'text-[var(--text-muted)] border-[var(--border)] bg-[var(--surface-2)]',
    };
    return custom[type] || 'text-slate-400 border-slate-400/30 bg-slate-400/10';
}

export function FlowTimeline({ events }: FlowTimelineProps) {
    if (events.length === 0) {
        return <p className="text-xs text-[var(--text-muted)]">No events yet.</p>;
    }

    return (
        <div className="space-y-0">
            {events.map((event, idx) => {
                const Icon = EVENT_ICONS[event.type] || IconPlus;
                const color = eventColor(event.type);

                return (
                    <div key={event.id} className="relative flex gap-3 pb-3 last:pb-0">
                        {idx < events.length - 1 ? (
                            <div className="absolute left-[11px] top-5 bottom-0 w-px bg-[var(--border)]" />
                        ) : null}

                        <span className={cn('relative z-10 flex size-[22px] shrink-0 items-center justify-center rounded-full border', color)}>
                            <Icon size={11} />
                        </span>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-xs font-medium capitalize text-[var(--foreground)] leading-tight">
                                {event.type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                                {event.actorName} · {event.createdAt}
                            </p>
                            {event.payload && Object.keys(event.payload).length > 0 ? (
                                <p className="mt-0.5 text-[10px] text-[var(--text-subtle)] leading-tight">
                                    {Object.values(event.payload).filter(v => typeof v === 'string').join(' · ')}
                                </p>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
