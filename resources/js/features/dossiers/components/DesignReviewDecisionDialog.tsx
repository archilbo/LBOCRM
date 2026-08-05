import { useEffect, useState } from 'react';
import { Button, Card, Modal, TextArea } from '@heroui/react';
import { IconCircleCheck, IconRefresh, IconCircleX } from '@tabler/icons-react';

import { cn } from '@/lib/cn';

const DECISIONS = [
    { id: 'approved', label: 'Approve', icon: IconCircleCheck, tone: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300' },
    { id: 'changes_requested', label: 'Request changes', icon: IconRefresh, tone: 'border-amber-500/35 bg-amber-500/10 text-amber-300' },
    { id: 'rejected', label: 'Reject', icon: IconCircleX, tone: 'border-red-500/35 bg-red-500/10 text-red-300' },
] as const;

export function DesignReviewDecisionDialog({
    isOpen,
    onOpenChange,
    onSubmit,
    portalContainer,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (decision: string, note: string) => void | Promise<void>;
    portalContainer?: HTMLElement | null;
}) {
    const [decision, setDecision] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) return;
        setDecision('');
        setNote('');
        setSaving(false);
    }, [isOpen]);

    async function handleSubmit() {
        if (!decision || saving) return;
        setSaving(true);
        try {
            await onSubmit(decision, note);
            setDecision('');
            setNote('');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal>
            <Modal.Backdrop
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (!saving) onOpenChange(open);
                }}
                variant="blur"
                isDismissable={!saving}
                UNSTABLE_portalContainer={portalContainer ?? undefined}
                className="z-[190] bg-black/65"
            >
                <Modal.Container size="md" placement="center" className="z-[191] p-3">
                    <Modal.Dialog aria-label="Review decision" className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-2xl">
                        <Modal.CloseTrigger aria-label="Close review decision" className="absolute right-3 top-3 z-10" />
                        <Modal.Header className="border-b border-[var(--border)] px-5 py-4 pr-12">
                            <Modal.Heading className="text-sm font-semibold">Review decision</Modal.Heading>
                            <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">Record the outcome for this design revision.</p>
                        </Modal.Header>
                        <Modal.Body className="space-y-3 px-5 py-4">
                            <div className="grid gap-2 sm:grid-cols-3">
                                {DECISIONS.map(({ id, label, icon: Icon, tone }) => (
                                    <Button
                                        key={id}
                                        variant="ghost"
                                        onPress={() => setDecision(id)}
                                        aria-pressed={decision === id}
                                        className={cn(
                                            'h-auto min-h-20 flex-col gap-2 rounded-xl border text-[9px]',
                                            decision === id
                                                ? tone
                                                : 'border-[var(--border)] bg-[var(--surface-2)]/30 text-[var(--text-muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]',
                                        )}
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </Button>
                                ))}
                            </div>
                            <TextArea
                                label="Review note"
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Optional decision note"
                                rows={3}
                                variant="secondary"
                                fullWidth
                            />
                        </Modal.Body>
                        <Modal.Footer className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
                            <Button size="sm" variant="ghost" onPress={() => onOpenChange(false)} isDisabled={saving}>Cancel</Button>
                            <Button size="sm" variant="primary" onPress={() => void handleSubmit()} isDisabled={!decision} isPending={saving}>
                                Submit decision
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
