import { ReactNode, useState } from 'react';
import { Button, Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { UNSAFE_PortalProvider } from 'react-aria/PortalProvider';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type AppDrawerProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    panelClassName?: string;
    isDismissable?: boolean;
    headerIcon?: ReactNode;
    contentClassName?: string;
    hideHeader?: boolean;
};

export function AppDrawer({
    isOpen,
    onOpenChange,
    title,
    description,
    children,
    footer,
    panelClassName,
    isDismissable: dismissable = true,
    headerIcon,
    contentClassName,
    hideHeader = false,
}: AppDrawerProps) {
    const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="app-modal-overlay app-drawer-overlay"
            isDismissable={dismissable}
        >
            <Modal className={cn('app-drawer-panel', panelClassName)}>
                <Dialog className="flex h-full flex-col outline-none">
                    {({ close }) => (
                        <>
                            {!hideHeader ? (
                                <header className="flex items-start gap-4 border-b px-5 py-4">
                                    {headerIcon ? (
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                                            {headerIcon}
                                        </span>
                                    ) : null}

                                    <div className="min-w-0 flex-1">
                                        {title ? (
                                            <Heading slot="title" className="text-base font-semibold">
                                                {title}
                                            </Heading>
                                        ) : null}

                                        {description ? (
                                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                {description}
                                            </p>
                                        ) : null}
                                    </div>

                                    <Button
                                        aria-label="Close"
                                        onPress={close}
                                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 outline-none transition hover:bg-red-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-red-400 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                                    >
                                        <X size={17} />
                                    </Button>
                                </header>
                            ) : null}

                            <div className={cn('app-scrollbar flex-1 overflow-y-auto px-5 py-5', contentClassName)}>
                                <div ref={setPortalContainer} className="relative min-h-0">
                                    {portalContainer ? (
                                        <UNSAFE_PortalProvider getContainer={() => portalContainer}>
                                            {children}
                                        </UNSAFE_PortalProvider>
                                    ) : null}
                                </div>
                            </div>

                            {footer ? (
                                <footer className="flex items-center justify-end gap-2 border-t px-5 py-4">
                                    {footer}
                                </footer>
                            ) : null}
                        </>
                    )}
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
