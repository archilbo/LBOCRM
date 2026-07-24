import type { ReactNode } from 'react';
import { Drawer, DrawerCloseTrigger } from '@heroui/react';
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
    placement?: 'left' | 'right';
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
    placement = 'right',
}: AppDrawerProps) {
    return (
        <Drawer.Backdrop
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable={dismissable}
        >
            <Drawer.Content
                placement={placement}
                className={cn(
                    placement === 'left' ? 'app-drawer-panel-left' : 'app-drawer-panel',
                    panelClassName
                )}
            >
                {!hideHeader && (
                    <Drawer.Header className="flex items-start gap-4 border-b px-5 py-4">
                        {headerIcon ? (
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                                {headerIcon}
                            </span>
                        ) : null}
                        <div className="min-w-0 flex-1">
                            {title ? (
                                <Drawer.Heading className="text-base font-semibold">
                                    {title}
                                </Drawer.Heading>
                            ) : null}
                            {description ? (
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                        <DrawerCloseTrigger>
                            <X size={17} />
                        </DrawerCloseTrigger>
                    </Drawer.Header>
                )}
                <Drawer.Body className={cn('app-scrollbar', contentClassName)}>
                    {children}
                </Drawer.Body>
                {footer ? (
                    <Drawer.Footer className="flex items-center justify-end gap-2 border-t px-5 py-4">
                        {footer}
                    </Drawer.Footer>
                ) : null}
            </Drawer.Content>
        </Drawer.Backdrop>
    );
}
