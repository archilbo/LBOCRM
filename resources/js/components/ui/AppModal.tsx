import { Modal, ModalBody, ModalHeader, ModalHeading, ModalCloseTrigger } from '@heroui/react';
import { cn } from '@/lib/cn';

type AppModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
};

const sizeMap: Record<string, string> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
    full: 'full',
};

export function AppModal({ isOpen, onOpenChange, title, children, size = 'md' }: AppModalProps) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
            <Modal.Container size={sizeMap[size] as any}>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.Heading>{title}</Modal.Heading>
                        <ModalCloseTrigger />
                    </Modal.Header>
                    <Modal.Body>
                        {children}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
