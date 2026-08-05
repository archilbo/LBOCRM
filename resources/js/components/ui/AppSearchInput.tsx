import { IconSearch } from '@tabler/icons-react';

import { Input } from '@heroui/react';

type AppSearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel?: string;
    className?: string;
    maxWidth?: string;
};

export function AppSearchInput({
    value,
    onChange,
    placeholder = 'Rechercher...',
    ariaLabel = 'Barre de recherche',
    className = '',
    maxWidth = 'sm:max-w-[240px]',
}: AppSearchInputProps) {
    return (
        <div className={`relative w-full ${maxWidth} ${className}`}>
            <IconSearch size={13} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
                aria-label={ariaLabel}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="h-8 min-h-8 w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)]/60 pl-9 text-[11px] shadow-none transition hover:border-[var(--border-strong)] focus-within:border-[var(--accent)] focus-within:bg-[var(--surface)]"
            />
        </div>
    );
}
