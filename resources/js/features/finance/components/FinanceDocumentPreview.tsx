import type { FinanceDocumentItem, FinanceDocumentType } from '@/features/finance/types';
import { formatCompactMoney } from '@/features/finance/utils/calculations';

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}


const typeLabels: Record<FinanceDocumentType, string> = {
    quote: 'DEVIS',
    invoice: 'FACTURE',
    receipt: 'RECU',
};

type FinanceDocumentPreviewProps = {
    type: FinanceDocumentType;
    number?: string;
    clientLabel?: string;
    dossierLabel?: string;
    templateLabel?: string;
    issueDate: string;
    dueDate?: string;
    validUntil?: string;
    currency: string;
    items: FinanceDocumentItem[];
    subtotalHt: number;
    discountTotal: number;
    taxTotal: number;
    totalTtc: number;
    notes?: string;
    terms?: string;
};

export function FinanceDocumentPreview({
    type,
    number,
    clientLabel,
    dossierLabel,
    templateLabel,
    issueDate,
    dueDate,
    validUntil,
    currency,
    items,
    subtotalHt,
    discountTotal,
    taxTotal,
    totalTtc,
    notes,
    terms,
}: FinanceDocumentPreviewProps) {
    return (
        <div className="finance-builder-preview rounded-[var(--radius-md)] border bg-[var(--surface-2)] p-3">
            <div className="mx-auto min-h-[520px] max-w-[440px] rounded-xl bg-white p-5 text-slate-950 shadow-xl sm:min-h-[640px] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-slate-500">ARCHI LBO</p>
                        <h3 className="mt-2 text-2xl font-bold">{typeLabels[type]}</h3>
                        <p className="mt-1 text-xs text-slate-500">{number || 'Nouveau document'}</p>
                        {templateLabel ? <span className="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-500">{templateLabel}</span> : null}
                    </div>
                    <div className="text-right text-xs text-slate-500">
                        <p>Date: {issueDate || '-'}</p>
                        {type === 'invoice' ? <p>Echeance: {dueDate || '-'}</p> : null}
                        {type === 'quote' ? <p>Validite: {validUntil || '-'}</p> : null}
                    </div>
                </div>

                <div className="grid gap-3 border-b border-slate-200 py-5 text-sm">
                    <div>
                        <p className="text-xs uppercase text-slate-500">Client</p>
                        <p className="font-semibold">{clientLabel || 'Client non selectionne'}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase text-slate-500">Dossier</p>
                        <p>{dossierLabel || 'Dossier non selectionne'}</p>
                    </div>
                </div>

                <table className="mt-5 w-full text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                            <th className="py-2">Designation</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={`${item.title}-${index}`} className="border-b border-slate-100">
                                <td className="py-2 pr-3">
                                    <p className="font-medium">{item.title || `Ligne ${index + 1}`}</p>
                                    <p className="text-slate-500">{item.quantity} {item.unit || ''} x {formatCompactMoney(item.unitPrice, currency)}</p>
                                </td>
                                <td className="py-2 text-right font-semibold">{formatCompactMoney(item.totalTtc, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="ml-auto mt-5 w-56 space-y-1 text-xs">
                    <PreviewRow label="HT" value={formatCompactMoney(subtotalHt, currency)} />
                    <PreviewRow label="Remise" value={`-${formatCompactMoney(discountTotal, currency)}`} />
                    <PreviewRow label="TVA" value={formatCompactMoney(taxTotal, currency)} />
                    <div className="border-t border-slate-200 pt-2">
                        <PreviewRow label="Total TTC" value={formatCompactMoney(totalTtc, currency)} strong />
                    </div>
                </div>

                {notes ? <p className="mt-6 whitespace-pre-line text-xs text-slate-600">{notes}</p> : null}
                {terms ? <p className="mt-3 whitespace-pre-line text-xs text-slate-500">{terms}</p> : null}
            </div>
        </div>
    );
}

function PreviewRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={`flex justify-between gap-3 ${strong ? 'text-sm font-bold' : ''}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
