import { Input as HeroInput, type InputProps as HeroInputProps } from '@heroui/react';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

type AppInputProps = Omit<HeroInputProps, 'onChange'> & {
    label?: string;
    error?: string;
    description?: string;
    onChange?: (value: string) => void;
    labelExtra?: ReactNode;
};

export function AppInput({ className, label, error, description, onChange, labelExtra, ...props }: AppInputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label ? (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--foreground)]">
                        {label}
                    </label>
                    {labelExtra ? (
                        <span className="text-[11px] text-[var(--text-muted)]">{labelExtra}</span>
                    ) : null}
                </div>
            ) : null}
            <HeroInput
                {...props}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onChange?.(e.target.value);
                }}
                errorMessage={error}
                description={description}
                isInvalid={Boolean(error)}
                className={cn(className)}
            />
        </div>
    );
}
