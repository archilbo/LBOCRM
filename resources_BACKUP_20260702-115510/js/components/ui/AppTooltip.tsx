import type { ReactNode } from 'react';

type AppTooltipProps = {
    children: ReactNode;
    label: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
};

export function AppTooltip({ children, label, position = 'top' }: AppTooltipProps) {
    const positionClasses = {
        top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
        right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
        bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
        left: 'right-full top-1/2 mr-1.5 -translate-y-1/2'
    };

    return (
        <div className="group/tooltip relative inline-flex">
            {children}
            <div className={[
                'pointer-events-none absolute z-50 opacity-0 transition-opacity group-hover/tooltip:opacity-100',
                positionClasses[position]
            ].join(' ')}>
                <div className="whitespace-nowrap rounded-md border bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text)] shadow-lg border-[var(--border)]">
                    {label}
                </div>
            </div>
        </div>
    );
}