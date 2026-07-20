import { Check, X } from 'lucide-react';
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
};

export function AppFilterTabs({ label, value, options, onChange, allValue = 'all', className }: AppFilterTabsProps) {
    const hasFilter = value !== allValue;

    return (
        <div className={cn('min-w-0 space-y-1.5', className)}>
            <div className="flex h-5 items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
                {hasFilter ? (
                    <button
                        type="button"
                        onClick={() => onChange(allValue)}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)] transition hover:text-[var(--accent)]"
                    >
                        <X size={10} />
                        Effacer
                    </button>
                ) : null}
            </div>

            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-[var(--surface-2)] p-1" role="group" aria-label={label}>
                {options.map((option) => {
                    const isActive = option.id === value;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onChange(option.id)}
                            className={cn(
                                'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium outline-none transition',
                                'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-2)]',
                                isActive
                                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]',
                            )}
                        >
                            {isActive ? <Check size={11} strokeWidth={2.5} /> : null}
                            <span>{option.label}</span>
                            {typeof option.count === 'number' ? (
                                <span className={cn('text-[9px] tabular-nums', isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>
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
