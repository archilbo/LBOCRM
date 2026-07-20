import { Input as HeroInput, type InputProps as HeroInputProps } from '@heroui/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type AppInputProps = Omit<HeroInputProps, 'onChange'> & {
    label?: string;
    error?: string;
    description?: string;
    onChange?: (value: string) => void;
    labelExtra?: ReactNode;
    isDisabled?: boolean;
};

export function AppInput({ className, label, error, description, onChange, labelExtra, isDisabled = false, ...props }: AppInputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label ? (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--foreground)]">{label}</label>
                    {labelExtra ? <span className="text-[11px] text-[var(--text-muted)]">{labelExtra}</span> : null}
                </div>
            ) : null}
            <HeroInput
                {...props}
                disabled={isDisabled || props.disabled}
                variant={props.variant ?? 'secondary'}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
                className={cn(
                    'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]',
                    error && 'border-[var(--danger)]',
                    className,
                )}
            />
            {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
            {!error && description ? <p className="text-xs text-[var(--text-muted)]">{description}</p> : null}
        </div>
    );
}
