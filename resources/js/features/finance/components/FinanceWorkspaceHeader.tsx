import { IconCoin, IconPlus, IconReceipt2, IconShoppingCart, IconWallet } from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import type { FinanceMetrics } from '@/features/finance/components/FinanceMetricCards';
import { formatCompactMoney } from '@/lib/currency';

type Props = {
    metrics: FinanceMetrics;
    currency: string;
    documentsCount: number;
    onCreateQuote: () => void;
    onCreateInvoice: () => void;
    onCreatePayment: () => void;
    onCreateExpense: () => void;
    canCreateDocument: boolean;
    canCreatePayment: boolean;
    canCreateExpense: boolean;
};

export function FinanceWorkspaceHeader({
    metrics,
    currency,
    documentsCount,
    onCreateQuote,
    onCreateInvoice,
    onCreatePayment,
    onCreateExpense,
    canCreateDocument,
    canCreatePayment,
    canCreateExpense,
}: Props) {
    return (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex flex-col gap-4 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                        <IconCoin size={20} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Pilotage financier</p>
                        <h1 className="mt-0.5 text-xl font-bold text-[var(--text)]">Finance</h1>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)]">
                            <span><strong className="text-[var(--text)]">{documentsCount}</strong> documents</span>
                            <span>Prévu <strong className="text-[var(--accent)]">{formatCompactMoney(metrics.expectedTotal, currency)}</strong></span>
                            <span>Reste <strong className="text-amber-300">{formatCompactMoney(metrics.remainingTotal, currency)}</strong></span>
                            <span>En retard <strong className="text-rose-300">{formatCompactMoney(metrics.overdueTotal, currency)}</strong></span>
                            <span className="uppercase tracking-wide">{currency}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
                    {canCreatePayment ? <AppButton isIconOnly compact variant="quiet" tooltip="Paiement" aria-label="Paiement" onPress={onCreatePayment}><IconWallet size={14} /></AppButton> : null}
                    {canCreateExpense ? <AppButton isIconOnly compact variant="quiet" tooltip="Depense" aria-label="Depense" onPress={onCreateExpense}><IconShoppingCart size={14} /></AppButton> : null}
                    {canCreateDocument ? <AppButton isIconOnly compact variant="quiet" tooltip="Facture" aria-label="Facture" onPress={onCreateInvoice}><IconReceipt2 size={14} /></AppButton> : null}
                    {canCreateDocument ? <AppButton isIconOnly compact variant="solid" color="primary" tooltip="Nouveau devis" aria-label="Nouveau devis" onPress={onCreateQuote}><IconPlus size={14} /></AppButton> : null}
                </div>
            </div>
        </section>
    );
}
