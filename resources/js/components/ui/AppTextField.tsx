import type { ReactNode } from 'react';
import {
    Input,
    Label,
    Text,
    TextField,
    type TextFieldProps,
} from 'react-aria-components';

type AppTextFieldProps = Omit<TextFieldProps, 'children'> & {
    label?: string;
    description?: string;
    error?: string;
    icon?: ReactNode;
    endContent?: ReactNode;
    placeholder?: string;
    size?: 'sm' | 'md';
};

export function AppTextField({
    label,
    description,
    error,
    icon,
    endContent,
    placeholder,
    className,
    size = 'md',
    ...props
}: AppTextFieldProps) {
    return (
        <TextField
            {...props}
            className={[
                'group grid gap-1.5',
                className ?? '',
            ].join(' ')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            {label ? (
                <Label className="text-sm font-medium text-[var(--text)]">
                    {label}
                </Label>
            ) : null}

            <div className="relative">
                {icon ? (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {icon}
                    </div>
                ) : null}

                {endContent ? (
                    <div className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2">
                        {endContent}
                    </div>
                ) : null}

                <Input
                    placeholder={placeholder}
                    className={[
                        size === 'sm' ? 'h-8 text-xs' : 'h-10 text-sm',
                        'w-full rounded-2xl border bg-[var(--surface)] px-3 outline-none transition',
                        'placeholder:text-[var(--text-muted)]',
                        'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                        'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',
                        icon ? 'pl-9' : '',
                        endContent ? 'pr-10' : '',
                    ].join(' ')}
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
