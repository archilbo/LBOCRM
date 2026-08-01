import { Archive, FileText, Handshake, Landmark, ReceiptText } from 'lucide-react';
import { type DossierTimelineEvent } from '@/features/clients/types';
import { useTranslation } from '@/lib/i18n';

const typeConfig: Record<string, { icon: typeof FileText; color: string }> = {
    document: { icon: FileText, color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
    contract: { icon: Handshake, color: 'border-violet-500/30 bg-violet-500/10 text-violet-300' },
    finance: { icon: ReceiptText, color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
    payment: { icon: Landmark, color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
    archive: { icon: Archive, color: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
};

function formatDate(date: string | null) {
    if (!date) {
        return '-';
    }
    const d = new Date(date);
    return d.toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function EventDot({ type }: { type: string }) {
    return (
        <div className="relative flex items-center justify-center">
            <div className="h-3 w-3 rounded-full border-2 border-[var(--crm-border)] bg-[var(--crm-bg)]" />
        </div>
    );
}

function EventRow({ event, isLast }: { event: DossierTimelineEvent; isLast: boolean }) {
    const { t } = useTranslation();
    const cfg = typeConfig[event.type] ?? typeConfig.document;
    const Icon = cfg.icon;

    return (
        <div className="relative flex gap-4">
            <div className="flex flex-col items-center">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-[var(--crm-elevated)] shadow-sm">
                    <Icon size={14} className={cfg.color.split(' ').pop()} />
                </div>
                {!isLast ? <div className="mt-1 w-px flex-1 bg-[var(--crm-border)]" /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[var(--crm-text)]">{t(`clients.activity.actions.${event.action}`)}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>
                        {t(`clients.activity.types.${event.type}`)}
                    </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--crm-muted)]">{event.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-[var(--crm-muted)]">
                    <span>{formatDate(event.date)}</span>
                    {event.actorName ? <span>{t('clients.activity.createdBy', { name: event.actorName })}</span> : null}
                </div>
            </div>
        </div>
    );
}

export function DossierTimeline({ events }: { events: DossierTimelineEvent[] }) {
    const { t } = useTranslation();

    if (events.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-[var(--crm-border)] bg-black/10 px-4 py-8 text-center">
                <p className="text-sm font-bold text-[var(--crm-text)]">{t('clients.activity.emptyTitle')}</p>
                <p className="mt-1 text-xs text-[var(--crm-muted)]">{t('clients.activity.emptyDescription')}</p>
            </div>
        );
    }

    return (
        <div className="py-2">
            {events.map((event, index) => (
                <EventRow key={`${event.type}-${event.date}-${index}`} event={event} isLast={index === events.length - 1} />
            ))}
        </div>
    );
}
