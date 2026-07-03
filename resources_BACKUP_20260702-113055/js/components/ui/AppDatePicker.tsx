import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppDatePickerProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
};

export function AppDatePicker({
    label,
    description,
    error,
    placeholder,
    className,
    ...props
}: AppDatePickerProps) {
    return (
        <TextField
            {...props}
            className={cn('group grid gap-1.5', className ?? '')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <Input
                type="date"
                placeholder={placeholder}
                className={cn(
                    'h-10 w-full rounded-2xl border bg-[var(--surface)] px-3 text-sm outline-none transition',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                    'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]'
                )}
            />

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
