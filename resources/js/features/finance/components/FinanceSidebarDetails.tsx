import { ReceiptText } from 'lucide-react';
import type { FinanceDocument } from '@/features/finance/types';

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
    const rows: { label: string; value: React.ReactNode }[] = [
        {
            label: 'Type',
            value:                     <span className="font-semibold text-[var(--foreground)]">{document.typeLabel}</span>,
        },
        {
            label: 'Status',
            value: (
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusClass(document.status)}`}>
                    {document.status?.replace(/_/g, ' ') || document.status}
                </span>
            ),
        },
        {
            label: 'PDF',
            value: (
                <span className={`font-semibold ${document.hasPdf ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    {document.hasPdf ? 'Ready' : 'Missing'}
                </span>
            ),
        },
        {
            label: 'Excel',
            value: (
                <span className={`font-semibold ${document.hasExcel ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    {document.hasExcel ? 'Ready' : 'Missing'}
                </span>
            ),
        },
        {
            label: 'Generated',
            value:                             <span className="font-semibold text-[var(--foreground)]">{dateLabel(document.generatedAt)}</span>,
        },
        {
            label: 'Created',
            value:                             <span className="font-semibold text-[var(--foreground)]">{dateLabel(document.createdAt)}</span>,
        },
    ];

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <ReceiptText size={14} className="text-[var(--text-muted)]" />
                <h2 className="text-xs font-semibold text-[var(--foreground)]">Details</h2>
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
