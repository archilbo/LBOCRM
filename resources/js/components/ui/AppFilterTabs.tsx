import { IconCheck, IconX } from '@tabler/icons-react';

import { cn } from '@/lib/cn';

export type AppFilterTabOption = {
    id: string;
    label: string;
    count?: number;
};

type AppFilterTabsProps = {
    label: string;
    value: string;
    options: AppFilterTabOption[];
    onChange: (value: string) => void;
    allValue?: string;
    className?: string;
    /** Hide the header row (label + clear button) when the tabs sit inside a compact container. */
    hideLabel?: boolean;
    /** Lightweight variant: transparent track, natural-width pills. Used inside command-palette surfaces. */
    variant?: 'default' | 'light';
};

export function AppFilterTabs({
    label,
    value,
    options,
    onChange,
    allValue = 'all',
    className,
    hideLabel = false,
    variant = 'default',
}: AppFilterTabsProps) {
    const hasFilter = value !== allValue;

    return (
        <div className={cn('min-w-0 space-y-1.5', className)}>
            {!hideLabel ? (
                <div className="flex h-5 items-center justify-between gap-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
                    {hasFilter ? (
                        <button
                            type="button"
                            onClick={() => onChange(allValue)}
                            className="inline-flex items-center gap-1 text-[9px] font-medium text-[var(--text-muted)] transition hover:text-[var(--accent)]"
                        >
                            <IconX size={10} />
                            Effacer
                        </button>
                    ) : null}
                </div>
            ) : null}

            <div
                className={cn(
                    'flex max-w-full items-center overflow-x-auto',
                    variant === 'light' ? 'gap-0.5 py-1' : 'gap-1 rounded-lg bg-[var(--surface-2)] p-1',
                )}
                role="group"
                aria-label={label}
            >
                {options.map((option) => {
                    const isActive = option.id === value;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onChange(option.id)}
                            className={cn(
                                'inline-flex shrink-0 items-center gap-1.5 rounded-[8px] outline-none transition',
                                'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
                                variant === 'light'
                                    ? 'h-6 px-1.5 text-[9.5px] font-normal'
                                    : 'h-7 px-2 text-[10px] font-medium',
                                variant === 'light' ? 'focus-visible:ring-offset-[var(--surface)]' : 'focus-visible:ring-offset-[var(--surface-2)]',
                                isActive
                                    ? variant === 'light'
                                        ? 'bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                        : 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]',
                            )}
                        >
                            {isActive ? <IconCheck size={11} strokeWidth={2.5} /> : null}
                            <span>{option.label}</span>
                            {typeof option.count === 'number' ? (
                                <span
                                    className={cn(
                                        'inline-flex min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-normal leading-[14px] tabular-nums',
                                        isActive
                                            ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                                            : 'bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-[var(--text-muted)]',
                                    )}
                                >
                                    {option.count}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
