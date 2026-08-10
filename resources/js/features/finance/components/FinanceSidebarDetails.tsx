import { IconReceipt2 } from '@tabler/icons-react';

import type { FinanceDocument } from '@/features/finance/types';
import { financeDocumentTypeLabel, financeStatusLabel } from '@/features/finance/components/FinanceStatusBadge';
import { useTranslation } from '@/lib/i18n';

type FinanceSidebarDetailsProps = {
    document: FinanceDocument;
};

function statusClass(status: string | undefined | null) {
    if (!status) return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
    if (['paid', 'accepted', 'generated', 'sent', 'issued'].includes(status)) {
        return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300';
    }
    if (['partially_paid', 'draft'].includes(status)) {
        return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
    }
    if (['rejected', 'cancelled', 'overdue'].includes(status)) {
        return 'border-red-500/25 bg-red-500/10 text-red-300';
    }
    return 'border-blue-500/25 bg-blue-500/10 text-blue-300';
}

function dateLabel(value: string | null | undefined) {
    if (!value) return '-';
    return value.slice(0, 10);
}

export function FinanceSidebarDetails({ document }: FinanceSidebarDetailsProps) {
    const { t } = useTranslation();
    const rows: { label: string; value: React.ReactNode }[] = [
        {
            label: t('finance.documentShow.type'),
            value: <span className="font-semibold text-[var(--foreground)]">{financeDocumentTypeLabel(document.type, t)}</span>,
        },
        {
            label: t('finance.documentShow.status'),
            value: (
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold ${statusClass(document.status)}`}>
                    {financeStatusLabel(document.status || '', t)}
                </span>
            ),
        },
        {
            label: 'PDF',
            value: (
                <span className={`font-semibold ${document.hasPdf ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    {document.hasPdf ? t('finance.documentShow.ready') : t('finance.documentShow.missing')}
                </span>
            ),
        },
        {
            label: 'Excel',
            value: (
                <span className={`font-semibold ${document.hasExcel ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    {document.hasExcel ? t('finance.documentShow.ready') : t('finance.documentShow.missing')}
                </span>
            ),
        },
        {
            label: t('finance.documentShow.generatedAt'),
            value: <span className="font-semibold text-[var(--foreground)]">{dateLabel(document.generatedAt)}</span>,
        },
        {
            label: t('finance.documentShow.createdAt'),
            value: <span className="font-semibold text-[var(--foreground)]">{dateLabel(document.createdAt)}</span>,
        },
    ];

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <IconReceipt2 size={14} className="text-[var(--text-muted)]" />
                <h2 className="text-xs font-semibold text-[var(--foreground)]">{t('finance.documentShow.details')}</h2>
            </div>
            <div className="divide-y divide-[var(--border)] text-xs">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-[var(--text-muted)]">{row.label}</span>
                        {row.value}
                    </div>
                ))}
            </div>
        </div>
    );
}
