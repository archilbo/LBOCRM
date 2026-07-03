import {
    Label,
    Text,
    TextArea,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';

type AppTextareaProps = Omit<TextFieldProps, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
    rows?: number;
};

export function AppTextarea({
    label,
    description,
    error,
    placeholder,
    rows = 4,
    className,
    ...props
}: AppTextareaProps) {
    return (
        <TextField
            {...props}
            className={[
                'group grid gap-1.5',
                className ?? '',
            ].join(' ')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <TextArea
                rows={rows}
                placeholder={placeholder}
                className={[
                    'min-h-28 w-full resize-y rounded-2xl border bg-[var(--surface)] px-3 py-2 text-sm outline-none transition',
                    'placeholder:text-[var(--text-muted)]',
                    'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                    'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',
                ].join(' ')}
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