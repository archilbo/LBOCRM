import type { Key } from 'react';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AppSelectOption = {
    id: Key;
    label: string;
    description?: string | null;
    isDisabled?: boolean;
};

type AppSelectProps = {
    label?: string;
    description?: string;
    error?: string;
    placeholder?: string;
    options: AppSelectOption[];
    selectedKey?: Key | null;
    defaultSelectedKey?: Key;
    onSelectionChange?: (key: Key | null) => void;
    isDisabled?: boolean;
    isRequired?: boolean;
    className?: string;
};

export function AppSelect({
    label,
    description,
    error,
    placeholder = 'Select...',
    options,
    selectedKey,
    defaultSelectedKey,
    onSelectionChange,
    isDisabled = false,
    isRequired = false,
    className,
}: AppSelectProps) {
    const keyMap = useMemo(() => {
        return new Map(options.map((option) => [String(option.id), option.id]));
    }, [options]);

    const selectProps =
        selectedKey !== undefined
            ? { value: selectedKey === null ? '' : String(selectedKey) }
            : { defaultValue: defaultSelectedKey !== undefined ? String(defaultSelectedKey) : '' };

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value;
        onSelectionChange?.(value ? (keyMap.get(value) ?? value) : null);
    }

    return (
        <div className={cn('flex min-w-0 flex-col gap-1.5', isDisabled && 'opacity-60', className)}>
            {label ? (
                <label className="text-xs font-semibold text-[var(--foreground)]">
                    {label}
                    {isRequired ? <span className="ml-1 text-[var(--danger)]">*</span> : null}
                </label>
            ) : null}

            <div className="relative min-w-0">
                <select
                    {...selectProps}
                    disabled={isDisabled}
                    required={isRequired}
                    onChange={handleChange}
                    className={cn(
                        'h-10 w-full min-w-0 appearance-none rounded-[var(--radius-md)] border bg-[var(--surface)] px-3 pr-10 text-sm text-[var(--foreground)] outline-none transition',
                        'border-[var(--border)] hover:border-[var(--accent)]',
                        'focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        error && 'border-[var(--danger)]',
                    )}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>

                    {options.map((option) => (
                        <option key={String(option.id)} value={String(option.id)} disabled={option.isDisabled}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
            </div>

            {description && !error ? (
                <p className="text-xs text-[var(--text-muted)]">{description}</p>
            ) : null}

            {error ? (
                <p className="text-xs font-medium text-[var(--danger)]">{error}</p>
            ) : null}
        </div>
    );
}
