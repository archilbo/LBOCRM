import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { IconBell, IconCalendar, IconNotes } from '@tabler/icons-react';
import { Button, TextArea } from '@heroui/react';
import { toast } from 'sonner';

import { AppDrawer } from '@/components/ui/AppDrawer';
import { DateField } from '@/features/archives/components/DateField';
import type { FinanceDocument } from '@/features/finance/types';
import { dateToStr, strToDate } from '@/lib/dateUtils';
import { formatCompactMoney } from '@/lib/currency';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: FinanceDocument | null;
};

export function PaymentReminderDrawer({ isOpen, onOpenChange, invoice }: Props) {
    const [remindAt, setRemindAt] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setRemindAt(new Date().toISOString().slice(0, 10));
        setNote('');
    }, [isOpen, invoice?.id]);

    function quickDate(days: number) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setRemindAt(date.toISOString().slice(0, 10));
    }

    function submit() {
        if (!invoice || !remindAt) return;
        setSubmitting(true);
        router.post(`/finance/documents/${invoice.id}/payment-reminders`, {
            type: 'custom',
            remind_at: `${remindAt} 09:00:00`,
            note: note.trim() || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Rappel de paiement programmé.');
                onOpenChange(false);
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] || 'Impossible de programmer le rappel.')),
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Rappel de paiement"
            description="Programmez un suivi interne pour cette facture."
            footer={<div className="flex items-center justify-end gap-2"><Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>Annuler</Button><Button color="warning" size="sm" isDisabled={!invoice || !remindAt || submitting} onPress={submit}><IconBell size={14} /> Enregistrer</Button></div>}
        >
            {invoice ? <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-[var(--text)]"><IconBell size={14} /> {invoice.number}</div>
                    <p className="mt-1 text-[var(--text-muted)]">{invoice.client?.name || 'Client non renseigné'} · reste {formatCompactMoney(invoice.remainingTotal, invoice.currency)}</p>
                </div>
                <div className="space-y-2">
                    <DateField label="Date du rappel" value={strToDate(remindAt)} onChange={(date) => setRemindAt(dateToStr(date))} />
                    <div className="flex flex-wrap gap-1.5">
                        <Button variant="secondary" size="sm" onPress={() => quickDate(1)}><IconCalendar size={13} /> Demain</Button>
                        <Button variant="secondary" size="sm" onPress={() => quickDate(3)}>Dans 3 jours</Button>
                        <Button variant="secondary" size="sm" onPress={() => quickDate(7)}>Dans 7 jours</Button>
                    </div>
                </div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"><span className="mb-1 flex items-center gap-1"><IconNotes size={12} /> Note facultative</span><TextArea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs text-[var(--text)]" /></label>
            </div> : null}
        </AppDrawer>
    );
}
