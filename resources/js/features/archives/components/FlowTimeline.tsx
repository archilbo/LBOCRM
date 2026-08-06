import { IconAlertTriangle, IconArchive, IconCircleCheck, IconFolderOpen, IconPlus, IconArrowRotaryFirstLeft, IconArrowBackUp } from '@tabler/icons-react';

import type { ArchiveEventRow } from '@/features/archives/types';
import { useTranslation } from '@/lib/i18n';
import { formatNotificationTime } from '@/features/notifications/helpers';
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

const EVENT_TONES: Record<string, string> = {
    ready_to_archive: 'text-[var(--crm-text-muted)] border-[var(--crm-border)] bg-[var(--crm-surface-2)]',
    stored: 'text-[var(--crm-success)] border-[var(--crm-success)]/30 bg-[var(--crm-success)]/10',
    checked_out: 'text-[var(--crm-gold)] border-[var(--crm-gold)]/30 bg-[var(--crm-gold)]/10',
    returned: 'text-[var(--crm-info)] border-[var(--crm-info)]/30 bg-[var(--crm-info)]/10',
    lost: 'text-[var(--crm-danger)] border-[var(--crm-danger)]/30 bg-[var(--crm-danger)]/10',
    moved: 'text-[var(--crm-info)] border-[var(--crm-info)]/30 bg-[var(--crm-info)]/10',
    restored: 'text-[var(--crm-success)] border-[var(--crm-success)]/30 bg-[var(--crm-success)]/10',
    note: 'text-[var(--crm-text-muted)] border-[var(--crm-border)] bg-[var(--crm-surface-2)]',
};

function eventColor(type: string): string {
    return EVENT_TONES[type] || 'text-[var(--crm-text-muted)] border-[var(--crm-border)] bg-[var(--crm-surface-2)]';
}

const EVENT_NOTE_KEYS: Record<string, string> = {
    'Archive record created': 'eventNotes.created',
    'Bulk status update': 'eventNotes.bulkStatus',
    'Marked as lost': 'eventNotes.markedLost',
};

export function FlowTimeline({ events }: FlowTimelineProps) {
    const { t, locale } = useTranslation();

    function eventLabel(type: string): string {
        const label = t(`archiveShow.eventTypes.${type}`);
        return label.startsWith('archiveShow.eventTypes.') ? type.replace(/_/g, ' ') : label;
    }

    function noteLabel(note: string): string {
        const key = EVENT_NOTE_KEYS[note];
        return key ? t(`archiveShow.${key}`) : note;
    }

    if (events.length === 0) {
        return <p className="text-xs text-[var(--crm-text-muted)]">{t('archiveShow.noEvents')}</p>;
    }

    return (
        <div className="space-y-0">
            {events.map((event, idx) => {
                const Icon = EVENT_ICONS[event.type] || IconPlus;
                const color = eventColor(event.type);

                return (
                    <div key={event.id} className="relative flex gap-3 pb-3 last:pb-0">
                        {idx < events.length - 1 ? (
                            <div className="absolute left-[11px] top-5 bottom-0 w-px bg-[var(--crm-border)]" />
                        ) : null}

                        <span className={cn('relative z-10 flex size-[22px] shrink-0 items-center justify-center rounded-full border', color)}>
                            <Icon size={11} />
                        </span>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-xs font-medium capitalize text-[var(--crm-text)] leading-tight">
                                {eventLabel(event.type)}
                            </p>
                            <p className="text-[10px] text-[var(--crm-text-muted)] leading-tight">
                                {event.actorName} · {event.createdAtRaw ? formatNotificationTime(event.createdAtRaw, locale) : event.createdAt}
                            </p>
                            {event.payload && Object.keys(event.payload).length > 0 ? (
                                <p className="mt-0.5 text-[10px] text-[var(--crm-text-soft)] leading-tight">
                                    {Object.values(event.payload).filter(v => typeof v === 'string').map(noteLabel).join(' · ')}
                                </p>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
