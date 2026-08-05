import { IconX } from '@tabler/icons-react';


export type AppFilterOption = {
    id: string;
    label: string;
    count?: number;
};

type AppFilterBarProps = {
    label?: string;
    value: string;
    options: AppFilterOption[];
    onChange: (value: string) => void;
};

export function AppFilterBar({
    label = 'Filter',
    value,
    options,
    onChange,
}: AppFilterBarProps) {
    return (
        <div className="rounded-3xl border bg-[var(--surface)] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{label}</p>

                {value !== 'all' ? (
                    <button
                        type="button"
                        onClick={() => onChange('all')}
                        className="inline-flex h-8 items-center gap-1 rounded-xl px-2 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    >
                        <IconX size={13} />
                        Clear
                    </button>
                ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isActive = option.id === value;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onChange(option.id)}
                            className={[
                                'inline-flex h-9 items-center gap-2 rounded-2xl border px-3 text-sm font-medium transition',
                                isActive
                                    ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
                                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            <span>{option.label}</span>

                            {typeof option.count === 'number' ? (
                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs">
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