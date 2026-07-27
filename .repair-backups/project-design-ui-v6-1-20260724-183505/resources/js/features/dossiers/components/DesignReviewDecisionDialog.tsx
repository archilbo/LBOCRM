import { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';

const DECISIONS = [
    { id: 'approved', label: 'Approve', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-400 bg-emerald-400/10' },
    { id: 'changes_requested', label: 'Request changes', icon: RefreshCw, color: 'text-amber-400 border-amber-400 bg-amber-400/10' },
    { id: 'rejected', label: 'Reject', icon: XCircle, color: 'text-red-400 border-red-400 bg-red-400/10' },
];

export function DesignReviewDecisionDialog({ isOpen, onOpenChange, onSubmit }: {
    isOpen: boolean; onOpenChange: (o: boolean) => void; onSubmit: (decision: string, note: string) => void;
}) {
    const [decision, setDecision] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleSubmit() {
        if (!decision) return;
        setSaving(true);
        await onSubmit(decision, note);
        setSaving(false);
        setDecision('');
        setNote('');
    }

    return (
        <AppModal isOpen={isOpen} onOpenChange={onOpenChange} title="Review decision" size="sm">
            <div className="space-y-3">
                <div className="grid gap-2">
                    {DECISIONS.map((d) => (
                        <button key={d.id} type="button" onClick={() => setDecision(d.id)}
                            className={cn('flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition',
                                decision === d.id ? d.color : 'border-[var(--border)] hover:border-[var(--accent)]/50')}>
                            <d.icon size={16} />
                            <span className="text-[13px] font-medium">{d.label}</span>
                        </button>
                    ))}
                </div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Review note (optional)..." rows={2}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[12px] outline-none focus:border-[var(--accent)] resize-none" />
                <div className="flex justify-end gap-2">
                    <AppButton variant="bordered" size="sm" className="h-8 text-[11px]" onPress={() => onOpenChange(false)}>Cancel</AppButton>
                    <AppButton size="sm" className="h-8 text-[11px]" isDisabled={!decision || saving} onPress={handleSubmit}>Submit decision</AppButton>
                </div>
            </div>
        </AppModal>
    );
}
