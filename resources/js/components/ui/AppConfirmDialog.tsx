import { Modal, ModalCloseTrigger } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppButton } from '@/components/ui/AppButton';

type AppConfirmDialogProps = {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    icon?: ReactNode;
    variant?: 'danger' | 'default';
};

export function AppConfirmDialog({ isOpen, title, description, confirmLabel, cancelLabel = 'Annuler', onConfirm, onCancel, icon, variant = 'danger' }: AppConfirmDialogProps) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }} isDismissable>
            <Modal.Container size="sm">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Heading>{title}</Modal.Heading>
                        <ModalCloseTrigger />
                    </Modal.Header>
                    <Modal.Body>
                        <div className="flex gap-3">
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${variant === 'danger' ? 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]' : 'bg-[var(--surface-2)] text-[var(--accent)]'}`}>
                                {icon ?? <AlertTriangle size={18} />}
                            </div>
                            <p className="pt-1 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <AppButton variant="secondary" onPress={onCancel}>{cancelLabel}</AppButton>
                            <AppButton variant={variant === 'danger' ? 'danger' : 'primary'} onPress={onConfirm}>{confirmLabel}</AppButton>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
