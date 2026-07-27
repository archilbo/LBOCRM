import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { DrawerError, drawerStyles } from './shared';

type DrawerFieldProps = {
    label: string;
    children: ReactNode;
    error?: string;
    className?: string;
};

export function DrawerField({
    label,
    children,
    error,
    className,
}: DrawerFieldProps) {
    return (
        <div className={cn(drawerStyles.fieldGroup, className)}>
            <label className={drawerStyles.label}>
                {label}
            </label>

            <div className="min-w-0">
                {children}
            </div>

            <DrawerError error={error} />
        </div>
    );
}
