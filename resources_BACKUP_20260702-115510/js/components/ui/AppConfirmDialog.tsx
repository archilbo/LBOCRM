import { ReactNode } from 'react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { AlertTriangle } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';

type AppConfirmDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    icon?: ReactNode;
};

export function AppConfirmDialog({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    icon,
}: AppConfirmDialogProps) {
    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="app-modal-overlay app-dialog-overlay"
            isDismissable
        >
            <Modal className="app-dialog-panel">
                <Dialog className="outline-none">
                    {({ close }) => (
                        <div className="p-5">
                            <div className="flex gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                                    {icon ?? <AlertTriangle size={20} />}
                                </div>

                                <div className="min-w-0">
                                    <Heading slot="title" className="text-base font-semibold">
                                        {title}
                                    </Heading>

                                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <AppButton
                                    variant="secondary"
                                    onPress={close}
                                >
                                    {cancelLabel}
                                </AppButton>

                                <AppButton
                                    variant="danger"
                                    onPress={() => {
                                        onConfirm();
                                        close();
                                    }}
                                >
                                    {confirmLabel}
                                </AppButton>
                            </div>
                        </div>
                    )}
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
