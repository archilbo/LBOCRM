import type { FinanceDocumentItem, FinanceDocumentType } from '@/features/finance/types';
import { formatMoney } from '@/features/finance/utils/calculations';

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
        <div className="finance-builder-preview rounded-2xl border bg-[var(--surface-2)] p-3">
            <div className="mx-auto min-h-[520px] max-w-[440px] rounded-xl bg-white p-5 text-slate-950 shadow-xl sm:min-h-[640px] sm:p-7">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-slate-500">ARCHI LBO</p>
                        <h3 className="mt-2 text-2xl font-bold">{typeLabels[type]}</h3>
                        <p className="mt-1 text-xs text-slate-500">{number || 'Nouveau document'}</p>
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
                                    <p className="text-slate-500">{item.quantity} {item.unit || ''} x {formatMoney(item.unitPrice, currency)}</p>
                                </td>
                                <td className="py-2 text-right font-semibold">{formatMoney(item.totalTtc, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="ml-auto mt-5 w-56 space-y-1 text-xs">
                    <PreviewRow label="HT" value={formatMoney(subtotalHt, currency)} />
                    <PreviewRow label="Remise" value={`-${formatMoney(discountTotal, currency)}`} />
                    <PreviewRow label="TVA" value={formatMoney(taxTotal, currency)} />
                    <div className="border-t border-slate-200 pt-2">
                        <PreviewRow label="Total TTC" value={formatMoney(totalTtc, currency)} strong />
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

