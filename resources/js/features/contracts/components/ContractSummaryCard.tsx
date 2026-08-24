import { IconCalculator, IconCalendar, IconCheck, IconCircle, IconCoin, IconFileCheck, IconFilePlus, IconFileText, IconPercentage, IconRuler, IconSignature } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/formatters';
import { useTranslation } from '@/lib/i18n';

export type ContractSummaryCardData = {
    id: number;
    contractNumber: string;
    status: string;
    surface: number | null;
    pricePerSquareMeter?: number | null;
    calculationMode: string | null;
    feeRatePercent: number | null;
    forfaitTtc: number | null;
    ht?: number | null;
    tva?: number | null;
    ttc: number;
    notes: string | null;
    createdAt: string | null;
    generatedAt: string | null;
    signedAt: string | null;
    hasGeneratedDocument?: boolean;
    hasGeneratedDoc?: boolean;
    hasPdf?: boolean;
};

type Props = {
    contract: ContractSummaryCardData;
    statusOverride?: string | null;
    context?: ReactNode;
    headerActions?: ReactNode;
    footer?: ReactNode;
};

function money(value: number | null | undefined) {
    return `${Number(value ?? 0).toLocaleString('fr-MA')} MAD`;
}

export function ContractSummaryCard({ contract, statusOverride, context, headerActions, footer }: Props) {
    const { t, locale } = useTranslation();
    const status = statusOverride ?? contract.status ?? 'draft';
    const hasGeneratedDocument = contract.hasGeneratedDocument ?? contract.hasGeneratedDoc ?? false;
    const isForfait = contract.calculationMode === 'forfait';
    const statusLabels: Record<string, string> = {
        draft: t('dossiers.show.contractStatus.draft'),
        generated: t('dossiers.show.contractStatus.generated'),
        signed: t('dossiers.show.contractStatus.signed'),
    };
    const statusStyles: Record<string, string> = {
        draft: 'border-amber-400/20 bg-amber-400/10 text-amber-500',
        generated: 'border-blue-400/20 bg-blue-400/10 text-blue-500',
        signed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-500',
    };
    const detailRows = isForfait
        ? [
            { icon: IconCalculator, label: t('dossiers.show.contract.mode'), value: t('dossiers.show.contract.forfait') },
            { icon: IconCoin, label: t('dossiers.show.contract.forfaitTtc'), value: money(contract.forfaitTtc) },
        ]
        : [
            { icon: IconCalculator, label: t('dossiers.show.contract.mode'), value: t('dossiers.show.contract.percentage') },
            { icon: IconPercentage, label: t('dossiers.show.contract.rate'), value: contract.feeRatePercent === null ? '-' : `${contract.feeRatePercent}%` },
            { icon: IconRuler, label: t('dossiers.show.contract.surface'), value: contract.surface === null ? '-' : `${contract.surface} m²` },
            ...(contract.pricePerSquareMeter === undefined ? [] : [{ icon: IconCoin, label: t('dossiers.show.contract.pricePerSquareMeter'), value: contract.pricePerSquareMeter === null ? '-' : money(contract.pricePerSquareMeter) }]),
        ];
    const amountRows = [
        ...(contract.ht === undefined ? [] : [{ label: t('dossiers.show.contract.ht'), value: money(contract.ht) }]),
        ...(contract.tva === undefined ? [] : [{ label: t('dossiers.show.contract.tva'), value: money(contract.tva) }]),
        { label: t('dossiers.show.contract.ttc'), value: money(contract.ttc), highlight: true },
    ];
    const steps = [
        { key: 'created', label: t('dossiers.show.contract.created'), date: contract.createdAt, done: true, icon: IconFilePlus },
        { key: 'generated', label: t('dossiers.show.contract.generated'), date: contract.generatedAt, done: status === 'generated' || status === 'signed' || Boolean(contract.generatedAt || hasGeneratedDocument), icon: IconFileCheck },
        { key: 'signed', label: t('dossiers.show.contract.signed'), date: contract.signedAt, done: status === 'signed', icon: IconSignature },
    ];
    const completedSteps = steps.filter((step) => step.done).length;

    return (
        <article className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                <div className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <IconFileText size={16} />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{contract.contractNumber}</p>
                        {context ? <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">{context}</div> : null}
                        {contract.notes ? <p className="mt-1 line-clamp-1 text-[10px] leading-tight text-[var(--text-muted)]">{contract.notes}</p> : null}
                    </div>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <span className={cn('inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide', statusStyles[status] ?? 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]')}>
                        {status === 'draft' ? <IconCircle size={7} /> : <IconCheck size={8} />} {statusLabels[status] ?? status}
                    </span>
                    {headerActions}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-[var(--border)]">
                {detailRows.map((row) => (
                    <div key={row.label} className="flex min-w-0 items-center gap-2 bg-[var(--surface)] px-4 py-2.5">
                        <row.icon size={13} className="shrink-0 text-[var(--text-muted)]" />
                        <div className="min-w-0">
                            <p className="text-[9px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{row.label}</p>
                            <p className="truncate text-xs font-semibold text-[var(--foreground)]">{row.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-[var(--border)] px-4 py-3">
                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('dossiers.show.contract.amounts')}</p>
                <div className="space-y-1.5">
                    {amountRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3">
                            <span className="text-[10px] text-[var(--text-muted)]">{row.label}</span>
                            <span className={cn('text-xs font-semibold', row.highlight ? 'text-[var(--accent)]' : 'text-[var(--foreground)]')}>{row.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_45%,transparent)] px-4 py-3.5">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('dossiers.show.contract.timeline')}</p>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[9px] font-semibold tabular-nums text-[var(--text-muted)]">{completedSteps}/{steps.length}</span>
                </div>
                <ol className="grid grid-cols-3 gap-2" aria-label={t('dossiers.show.contract.timeline')}>
                    {steps.map((step, index) => (
                        <li key={step.key} className="relative min-w-0">
                            {index < steps.length - 1 ? (
                                <span className={cn('pointer-events-none absolute left-1/2 top-4 h-px w-full', step.done && steps[index + 1].done ? 'bg-emerald-400/50' : 'bg-[var(--border)]')} />
                            ) : null}
                            <div className="relative z-10 flex justify-center">
                                <span className={cn('relative flex size-8 items-center justify-center rounded-xl border shadow-sm', step.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]')}>
                                    <step.icon size={15} stroke={1.9} />
                                    {step.done ? <IconCheck className="absolute -right-1 -top-1 rounded-full bg-[var(--surface)] p-px text-emerald-500" size={12} stroke={3} /> : null}
                                </span>
                            </div>
                            <div className="mt-2 px-1 text-center">
                                <p className={cn('truncate text-[10px] font-semibold leading-tight', step.done ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)]')}>{step.label}</p>
                                <p className="mt-0.5 truncate text-[9px] leading-tight text-[var(--text-muted)]">{step.date ? formatDate(step.date, locale) : '—'}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            {footer ? <div className="border-t border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">{footer}</div> : null}
        </article>
    );
}
