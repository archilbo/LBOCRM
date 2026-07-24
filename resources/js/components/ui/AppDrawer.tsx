import type { ReactNode } from 'react';
import { Drawer } from '@heroui/react';
import { X } from 'lucide-react';

import { cn } from '@/lib/cn';

export type AppDrawerPlacement = 'left' | 'right';
export type AppDrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type AppDrawerProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: AppDrawerSize;
    placement?: AppDrawerPlacement;
    panelClassName?: string;
    contentClassName?: string;
    headerClassName?: string;
    footerClassName?: string;
    isDismissable?: boolean;
    isKeyboardDismissDisabled?: boolean;
    headerIcon?: ReactNode;
    hideHeader?: boolean;
    hideCloseButton?: boolean;
};

const sizeClasses: Record<AppDrawerSize, string> = {
    sm: 'w-[min(100vw,360px)]',
    md: 'w-[min(100vw,480px)]',
    lg: 'w-[min(100vw,560px)]',
    xl: 'w-[min(100vw,720px)]',
    full: 'w-screen',
};

export function AppDrawer({
    isOpen,
    onOpenChange,
    title,
    description,
    children,
    footer,
    size = 'md',
    placement = 'right',
    panelClassName,
    contentClassName,
    headerClassName,
    footerClassName,
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    headerIcon,
    hideHeader = false,
    hideCloseButton = false,
}: AppDrawerProps) {
    const hasHeaderContent = Boolean(title || description || headerIcon);

    return (
        <Drawer>
            <Drawer.Backdrop
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable={isDismissable}
                isKeyboardDismissDisabled={isKeyboardDismissDisabled}
                variant="blur"
                className="z-[90] bg-black/60"
            >
                <Drawer.Content
                    placement={placement}
                    className="z-[91] p-0"
                >
                    <Drawer.Dialog
                        aria-label={title ?? 'Drawer'}
                        className={cn(
                            'relative flex h-dvh max-h-dvh min-h-0 max-w-full flex-col',
                            'overflow-hidden rounded-none bg-[var(--surface)] text-[var(--foreground)]',
                            placement === 'left'
                                ? 'border-r border-[var(--border)] shadow-[24px_0_60px_rgb(0_0_0_/_0.28)]'
                                : 'border-l border-[var(--border)] shadow-[-24px_0_60px_rgb(0_0_0_/_0.28)]',
                            sizeClasses[size],
                            panelClassName,
                        )}
                    >
                        {!hideCloseButton ? (
                            <Drawer.CloseTrigger
                                aria-label="Close drawer"
                                className={cn(
                                    'absolute right-3 top-3 z-20',
                                    'flex size-8 items-center justify-center rounded-lg',
                                    'text-[var(--text-muted)] outline-none transition',
                                    'hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                    'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                                )}
                            >
                                <X size={17} aria-hidden="true" />
                            </Drawer.CloseTrigger>
                        ) : null}

                        {!hideHeader && hasHeaderContent ? (
                            <Drawer.Header
                                className={cn(
                                    'shrink-0 border-b border-[var(--border)] px-5 py-4 pr-14',
                                    headerClassName,
                                )}
                            >
                                <div className="flex min-w-0 items-start gap-3">
                                    {headerIcon ? (
                                        <span
                                            className={cn(
                                                'flex size-9 shrink-0 items-center justify-center rounded-xl',
                                                'bg-[var(--accent-soft)] text-[var(--accent)]',
                                            )}
                                        >
                                            {headerIcon}
                                        </span>
                                    ) : null}

                                    <div className="min-w-0 flex-1">
                                        {title ? (
                                            <Drawer.Heading className="truncate text-base font-semibold text-[var(--foreground)]">
                                                {title}
                                            </Drawer.Heading>
                                        ) : null}

                                        {description ? (
                                            <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                                                {description}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </Drawer.Header>
                        ) : null}

                        <Drawer.Body
                            className={cn(
                                'app-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto',
                                'px-5 py-4',
                                contentClassName,
                            )}
                        >
                            <div className="min-w-0">
                                {children}
                            </div>
                        </Drawer.Body>

                        {footer ? (
                            <Drawer.Footer
                                className={cn(
                                    'shrink-0 border-t border-[var(--border)] bg-[var(--surface)]',
                                    'px-5 py-3',
                                    footerClassName,
                                )}
                            >
                                {footer}
                            </Drawer.Footer>
                        ) : null}
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </Drawer>
    );
}
