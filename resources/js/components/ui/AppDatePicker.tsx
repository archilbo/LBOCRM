import { useState, useCallback } from 'react';
import {
    CalendarDate,
    getLocalTimeZone,
    parseDate,
    today,
} from '@internationalized/date';
import type { DateValue } from '@internationalized/date';
import {
    Button,
    Calendar,
    DateField,
    DatePicker,
} from '@heroui/react';
import { I18nProvider } from 'react-aria-components';
import { IconX } from '@tabler/icons-react';

import { cn } from '@/lib/cn';

/* ──── Helpers (no Date / toISOString) ──── */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoCalendarDate(
    value: string | null | undefined,
): CalendarDate | null {
    if (!value || !ISO_DATE_PATTERN.test(value)) {
        return null;
    }

    try {
        return parseDate(value);
    } catch {
        return null;
    }
}

function calendarDateToIso(
    value: DateValue | null,
): string {
    if (!value) {
        return '';
    }

    return value.toString();
}

/* ──── Types ──── */

export type AppDatePickerProps = {
    value: string | null;
    onChange: (value: string) => void;

    label?: string;
    placeholder?: string;
    error?: string;

    isDisabled?: boolean;
    isRequired?: boolean;

    minValue?: string;
    maxValue?: string;

    ariaLabel?: string;
};

/* ──── Component ──── */

export function AppDatePicker({
    value,
    onChange,
    label,
    placeholder = 'JJ/MM/AAAA',
    error,
    isDisabled = false,
    isRequired = false,
    minValue,
    maxValue,
    ariaLabel = 'Date',
}: AppDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const calendarValue = parseIsoCalendarDate(value);
    const minCalendarValue = parseIsoCalendarDate(minValue);
    const maxCalendarValue = parseIsoCalendarDate(maxValue);

    const handleChange = useCallback(
        (nextValue: DateValue | null) => {
            onChange(calendarDateToIso(nextValue));
        },
        [onChange],
    );

    const handleToday = useCallback(() => {
        onChange(today(getLocalTimeZone()).toString());
        setIsOpen(false);
    }, [onChange]);

    const handleClear = useCallback(() => {
        onChange('');
        setIsOpen(false);
    }, [onChange]);

    const isInvalid = Boolean(error);

    return (
        <I18nProvider locale="fr-FR">
            <div className="flex min-w-0 flex-col gap-1">
                {label ? (
                    <label
                        className={cn(
                            'text-[9px] font-semibold uppercase tracking-[0.08em]',
                            isInvalid
                                ? 'text-[var(--danger)]'
                                : 'text-[var(--text-subtle)]',
                        )}
                    >
                        {label}
                        {isRequired ? ' *' : ''}
                    </label>
                ) : null}

                <DatePicker
                    value={calendarValue}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    isRequired={isRequired}
                    isInvalid={isInvalid}
                    minValue={minCalendarValue ?? undefined}
                    maxValue={maxCalendarValue ?? undefined}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    aria-label={ariaLabel}
                >
                    <DateField.Group
                        className={cn(
                            'flex h-8 w-full items-center gap-0 rounded-[var(--radius-md)] border px-2.5 text-xs transition',
                            'bg-[var(--surface)]',
                            isInvalid
                                ? 'border-[var(--danger)]'
                                : 'border-[var(--border)]',
                            !isDisabled &&
                                !isInvalid &&
                                'hover:border-[var(--accent)]',
                            isDisabled && 'cursor-not-allowed bg-[var(--surface-2)] opacity-60',
                        )}
                    >
                        <DateField.Input>
                            {(segment) => (
                                <DateField.Segment
                                    segment={segment}
                                    className={cn(
                                        'box-border rounded-sm py-0.5 text-xs text-[var(--foreground)] outline-none',
                                        'focus:bg-[var(--accent)]/10 focus:text-[var(--accent)]',
                                        segment.isPlaceholder && 'text-[var(--text-subtle)]',
                                        segment.type === 'literal' && 'px-0.5 text-[var(--text-muted)]',
                                    )}
                                />
                            )}
                        </DateField.Input>

                        <DateField.Suffix>
                            {value ? (
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear();
                                    }}
                                    className="flex size-5 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                                    aria-label="Effacer"
                                >
                                    <IconX size={13} />
                                </button>
                            ) : null}

                            <DatePicker.Trigger>
                                <DatePicker.TriggerIndicator
                                    className={cn(
                                        'ml-1 flex items-center text-[var(--text-muted)]',
                                        'group-data-[open=true]:rotate-180',
                                    )}
                                />
                            </DatePicker.Trigger>
                        </DateField.Suffix>
                    </DateField.Group>

                    <DatePicker.Popover
                        className="z-50 w-auto min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0 shadow-lg"
                    >
                        <Calendar
                            aria-label={ariaLabel}
                            value={calendarValue}
                            onChange={handleChange}
                            className="[&_[data-slot=calendar-header]]:px-3 [&_[data-slot=calendar-header]]:pt-3"
                        >
                            <Calendar.Header>
                                <Calendar.YearPickerTrigger>
                                    <Calendar.YearPickerTriggerHeading className="text-sm font-semibold" />
                                    <Calendar.YearPickerTriggerIndicator />
                                </Calendar.YearPickerTrigger>

                                <Calendar.NavButton slot="previous" />
                                <Calendar.NavButton slot="next" />
                            </Calendar.Header>

                            <Calendar.Grid>
                                <Calendar.GridHeader>
                                    {(day) => (
                                        <Calendar.HeaderCell>
                                            {day}
                                        </Calendar.HeaderCell>
                                    )}
                                </Calendar.GridHeader>

                                <Calendar.GridBody>
                                    {(date) => (
                                        <Calendar.Cell date={date}>
                                            {({ formattedDate }) => formattedDate}
                                        </Calendar.Cell>
                                    )}
                                </Calendar.GridBody>
                            </Calendar.Grid>

                            <Calendar.YearPickerGrid>
                                <Calendar.YearPickerGridBody>
                                    {(values) => (
                                        <Calendar.YearPickerCell
                                            year={values.year}
                                        >
                                            {values.formattedYear}
                                        </Calendar.YearPickerCell>
                                    )}
                                </Calendar.YearPickerGridBody>
                            </Calendar.YearPickerGrid>
                        </Calendar>

                        <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
                            <Button
                                size="sm"
                                variant="light"
                                onPress={handleToday}
                                className="h-8 px-3 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
                            >
                                Aujourd&rsquo;hui
                            </Button>

                            {value ? (
                                <Button
                                    size="sm"
                                    variant="light"
                                    onPress={handleClear}
                                    className="h-8 px-3 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
                                >
                                    Effacer
                                </Button>
                            ) : null}
                        </div>
                    </DatePicker.Popover>
                </DatePicker>

                {error ? (
                    <p className="text-[9px] font-medium text-[var(--danger)]">
                        {error}
                    </p>
                ) : null}
            </div>
        </I18nProvider>
    );
}
