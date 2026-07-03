import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppMoneyInputProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    currency?: string;
    placeholder?: string;
};

export function AppMoneyInput({
    label,
    description,
    error,
    currency = 'MAD',
    placeholder,
    className,
    ...props
}: AppMoneyInputProps) {
    return (
        <TextField
            {...props}
            className={cn('group grid gap-1.5', className ?? '')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
                    {currency}
                </span>

                <Input
                    type="number"
                    step="0.01"
                    placeholder={placeholder}
                    className={cn(
                        'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 pl-14 text-sm outline-none transition',
                        'placeholder:text-[var(--text-muted)]',
                        'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                        'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]'
                    )}
                />
            </div>

            {description && !error ? (
                <Text slot="description" className="text-xs text-[var(--text-muted)]">
                    {description}
                </Text>
            ) : null}

            {error ? (
                <Text slot="errorMessage" className="text-xs font-medium text-[var(--danger)]">
                    {error}
                </Text>
            ) : null}
        </TextField>
    );
}
