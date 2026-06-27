import type { Key } from 'react';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

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
    buttonClassName?: string;
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
    className = '',
    buttonClassName = '',
}: AppSelectProps) {
    const keyMap = useMemo(() => {
        return new Map(options.map((option) => [String(option.id), option.id]));
    }, [options]);

    const selectProps =
        selectedKey !== undefined
            ? {
                  value: selectedKey === null ? '' : String(selectedKey),
              }
            : {
                  defaultValue: defaultSelectedKey !== undefined ? String(defaultSelectedKey) : '',
              };

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value;

        if (!value) {
            onSelectionChange?.(null);
            return;
        }

        onSelectionChange?.(keyMap.get(value) ?? value);
    }

    return (
        <div
            className={[
                'flex min-w-0 flex-col gap-1.5',
                isDisabled ? 'opacity-60' : '',
                className,
            ].join(' ')}
        >
            {label ? (
                <label className="text-xs font-semibold text-[var(--text)]">
                    {label}
                    {isRequired ? <span className="ml-1 text-red-500">*</span> : null}
                </label>
            ) : null}

            <div className="relative min-w-0">
                <select
                    {...selectProps}
                    disabled={isDisabled}
                    required={isRequired}
                    onChange={handleChange}
                    className={[
                        'h-10 w-full min-w-0 appearance-none rounded-2xl border bg-[var(--surface)] px-3 pr-10 text-sm text-[var(--text)] outline-none transition',
                        'border-[var(--border)] hover:border-[var(--accent)]',
                        'focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_20%,transparent)]',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        error ? 'border-red-500/70' : '',
                        buttonClassName,
                    ].join(' ')}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>

                    {options.map((option) => (
                        <option
                            key={String(option.id)}
                            value={String(option.id)}
                            disabled={option.isDisabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
            </div>

            {description ? (
                <p className="text-xs text-[var(--text-muted)]">{description}</p>
            ) : null}

            {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
        </div>
    );
}

export default AppSelect;