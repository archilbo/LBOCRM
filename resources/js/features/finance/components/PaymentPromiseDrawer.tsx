import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { IconCalendar, IconCurrencyDollar, IconMessage } from '@tabler/icons-react';
import { Button, Input, TextArea } from '@heroui/react';
import { toast } from 'sonner';

import { AppDrawer } from '@/components/ui/AppDrawer';
import { DateField } from '@/features/archives/components/DateField';
import type { FinanceDocument } from '@/features/finance/types';
import { dateToStr, strToDate } from '@/lib/dateUtils';
import { formatCompactMoney } from '@/lib/currency';

type Props = { isOpen: boolean; onOpenChange: (open: boolean) => void; invoice: FinanceDocument | null };

export function PaymentPromiseDrawer({ isOpen, onOpenChange, invoice }: Props) {
    const [amount, setAmount] = useState('');
    const [promisedFor, setPromisedFor] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setAmount(invoice ? String(invoice.remainingTotal) : '');
        const date = new Date(); date.setDate(date.getDate() + 3);
        setPromisedFor(date.toISOString().slice(0, 10));
        setNote('');
    }, [isOpen, invoice?.id]);

    function submit() {
        if (!invoice || !amount || !promisedFor) return;
        setSubmitting(true);
        router.post(`/finance/documents/${invoice.id}/payment-promises`, { amount: Number(amount), promised_for: promisedFor, note: note.trim() || null }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Promesse de paiement enregistrée.'); onOpenChange(false); },
            onError: (errors) => toast.error(String(Object.values(errors)[0] || 'Impossible d’enregistrer la promesse.')),
            onFinish: () => setSubmitting(false),
        });
    }

    return <AppDrawer isOpen={isOpen} onOpenChange={onOpenChange} title="Promesse de paiement" description="Consignez l’engagement du client sans modifier la facture." footer={<div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>Annuler</Button><Button color="warning" size="sm" isDisabled={!invoice || !amount || !promisedFor || submitting} onPress={submit}>Enregistrer</Button></div>}>
        {invoice ? <div className="space-y-4"><div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3 text-xs"><p className="font-semibold text-[var(--text)]">{invoice.number}</p><p className="mt-1 text-[var(--text-muted)]">Reste à encaisser {formatCompactMoney(invoice.remainingTotal, invoice.currency)}</p></div><label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"><span className="mb-1 flex items-center gap-1"><IconCurrencyDollar size={12} /> Montant</span><Input type="number" min="0.01" max={invoice.remainingTotal} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)]" /></label><div><DateField label="Date promise" value={strToDate(promisedFor)} onChange={(date) => setPromisedFor(dateToStr(date))} /><div className="mt-2 flex gap-1.5"><Button variant="secondary" size="sm" onPress={() => { const date = new Date(); date.setDate(date.getDate() + 3); setPromisedFor(date.toISOString().slice(0, 10)); }}><IconCalendar size={13} /> Dans 3 jours</Button><Button variant="secondary" size="sm" onPress={() => { const date = new Date(); date.setDate(date.getDate() + 7); setPromisedFor(date.toISOString().slice(0, 10)); }}>Dans 7 jours</Button></div></div><label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"><span className="mb-1 flex items-center gap-1"><IconMessage size={12} /> Note</span><TextArea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs text-[var(--text)]" /></label></div> : null}
    </AppDrawer>;
}
