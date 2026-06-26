import {
    Button,
    Label,
    ListBox,
    ListBoxItem,
    Popover,
    Select,
    SelectValue,
    Text,
    type Key,
    type SelectProps,
} from 'react-aria-components';
import { Check, ChevronDown } from 'lucide-react';

type AppSelectOption = {
    id?: string;
    value?: string;
    label: string;
    description?: string;
    disabled?: boolean;
};

type AppSelectProps = Omit<SelectProps<object>, 'children'> & {
    label: string;
    description?: string;
    error?: string;
    placeholder?: string;
    options: AppSelectOption[];
    selectedKey?: Key | null;
    onSelectionChange?: (key: Key | null) => void;
};

export function AppSelect({
    label,
    description,
    error,
    placeholder = 'Select option',
    options,
    selectedKey,
    onSelectionChange,
    className,
    ...props
}: AppSelectProps) {
    return (
        <Select
            {...props}
            selectedKey={selectedKey}
            onSelectionChange={onSelectionChange}
            className={[
                'group grid gap-1.5',
                className ?? '',
            ].join(' ')}
            isInvalid={Boolean(error) || props.isInvalid}
        >
            <Label className="text-sm font-medium text-[var(--text)]">
                {label}
            </Label>

            <Button
                className={[
                    'flex h-10 w-full items-center justify-between gap-3 rounded-2xl border bg-[var(--surface)] px-3 text-left text-sm outline-none transition',
                    'focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]',
                    'group-data-[invalid]:border-[var(--danger)] group-data-[invalid]:ring-4 group-data-[invalid]:ring-[color-mix(in_srgb,var(--danger)_12%,transparent)]',
                ].join(' ')}
            >
                <SelectValue className="truncate text-left">
                    {({ selectedText }) => selectedText || placeholder}
                </SelectValue>
                <ChevronDown size={16} className="shrink-0 text-[var(--text-muted)]" />
            </Button>

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

            <Popover className="z-[100] w-[--trigger-width] overflow-hidden rounded-2xl border bg-[var(--surface)] shadow-2xl">
                <ListBox className="max-h-72 overflow-auto p-1 outline-none">
                    {options.map((option) => {
                        const key = option.id ?? option.value ?? option.label;

                        return (
                            <ListBoxItem
                                key={key}
                                id={key}
                                textValue={option.label}
                                isDisabled={option.disabled}
                                className={[
                                    'group/item flex cursor-default items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm outline-none transition',
                                    'data-[focused]:bg-[var(--surface-2)]',
                                    'data-[selected]:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]',
                                    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                                ].join(' ')}
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{option.label}</p>
                                    {option.description ? (
                                        <p className="truncate text-xs text-[var(--text-muted)]">
                                            {option.description}
                                        </p>
                                    ) : null}
                                </div>

                                <Check
                                    size={15}
                                    className="hidden shrink-0 text-[var(--accent)] group-data-[selected]/item:block"
                                />
                            </ListBoxItem>
                        );
                    })}
                </ListBox>
            </Popover>
        </Select>
    );
}