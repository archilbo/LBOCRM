import { FormEvent, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppTextField } from '@/components/ui/AppTextField';
import type { ArchiveRecordRow } from '@/features/archives/types';

type CheckoutDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    archives: ArchiveRecordRow[];
    onConfirm: (data: { archiveIds: number[]; requester: string; dueAt: string; purpose: string }) => void;
};

function defaultDue(days = 7): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export function CheckoutDrawer({ isOpen, onOpenChange, archives, onConfirm }: CheckoutDrawerProps) {
    const [requester, setRequester] = useState('');
    const [dueAt, setDueAt] = useState(defaultDue());
    const [purpose, setPurpose] = useState('');

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onConfirm({
            archiveIds: archives.map((a) => a.id),
            requester,
            dueAt,
            purpose,
        });
        onOpenChange(false);
    }

    function presetDays(days: number) {
        setDueAt(defaultDue(days));
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={`Check out ${archives.length} archive${archives.length > 1 ? 's' : ''}`}
            description="Fill requester details and due date."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton>
                    <AppButton variant="primary" type="submit" form="checkout-form">Confirm</AppButton>
                </>
            }
        >
            <form id="checkout-form" className="space-y-4" onSubmit={handleSubmit}>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-[var(--surface-2)] p-2">
                    {archives.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                            <span className="font-mono tabular-nums text-[var(--foreground)]">{a.archiveNumber}</span>
                            <span className="truncate text-[var(--text-muted)] ml-2">{a.projectObject}</span>
                        </div>
                    ))}
                </div>

                <AppTextField
                    label="Requester (optional)"
                    value={requester}
                    onChange={setRequester}
                    placeholder="Name of requester"
                />

                <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">Due date</label>
                    <input
                        type="date"
                        value={dueAt}
                        onChange={(e) => setDueAt(e.target.value)}
                        className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                        required
                    />
                    <div className="mt-1 flex gap-1">
                        {[7, 14, 30].map((days) => (
                            <button
                                key={days}
                                type="button"
                                onClick={() => presetDays(days)}
                                className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                            >
                                +{days}d
                            </button>
                        ))}
                    </div>
                </div>

                <AppTextField
                    label="Purpose (optional)"
                    value={purpose}
                    onChange={setPurpose}
                    placeholder="Why is this being checked out?"
                />
            </form>
        </AppDrawer>
    );
}
