import { useState } from 'react';
import { CalendarDate } from '@internationalized/date';
import { Calendar, CalendarYearPicker, Button, Popover } from '@heroui/react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';
import { toCalendarDate, fromCalendarDate } from '@/lib/dateUtils';

type DateFieldProps = {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    error?: string;
    isDisabled?: boolean;
};

export function DateField({
    label,
    value,
    onChange,
    placeholder = 'Choisir une date',
    error,
    isDisabled = false,
}: DateFieldProps) {
    const calDate = toCalendarDate(value);
    const [isOpen, setIsOpen] = useState(false);

    if (isDisabled) {
        return (
            <div className="flex min-w-0 flex-col gap-1">
                {label ? (
                    <label className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">{label}</label>
                ) : null}
                <div className={cn(
                    'flex h-8 w-full items-center gap-2 rounded-[var(--radius-md)] border px-2.5 text-xs',
                    'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
                )}>
                    <CalendarIcon size={14} className="shrink-0 text-[var(--text-subtle)]" />
                    <span>{value ? format(value, 'dd MMM yyyy') : '—'}</span>
                </div>
                {error ? <p className="text-[9px] font-medium text-[var(--danger)]">{error}</p> : null}
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-1">
            {label ? (
                <label className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">{label}</label>
            ) : null}

            <Popover placement="bottom" isOpen={isOpen} onOpenChange={setIsOpen}>
                <Popover.Trigger>
                    <Button
                        variant="flat"
                        className={cn(
                            'h-8 w-full justify-start gap-2 rounded-[var(--radius-md)] border px-2.5 text-xs font-normal outline-none transition',
                            'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]',
                            'hover:border-[var(--accent)]',
                            'focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]',
                            !value && 'text-[var(--text-subtle)]',
                        )}
                    >
                        <CalendarIcon size={14} className="shrink-0 text-[var(--text-muted)]" />
                        <span className="flex-1 text-left">
                            {value ? format(value, 'dd MMM yyyy') : placeholder}
                        </span>
                        {value ? (
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(null);
                                }}
                                className="flex size-5 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                                aria-label="Effacer"
                            >
                                <X size={13} />
                            </button>
                        ) : null}
                    </Button>
                </Popover.Trigger>

                <Popover.Content className="w-auto min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0 shadow-lg">
                    <Calendar.Root
                        value={calDate ?? undefined}
                        onChange={(cd: CalendarDate) => { onChange(fromCalendarDate(cd)); setIsOpen(false); }}
                        className="[&_[data-slot=calendar-header]]:px-3 [&_[data-slot=calendar-header]]:pt-3"
                    >
                        <Calendar.Header>
                            <CalendarYearPicker.Trigger>
                                <CalendarYearPicker.TriggerHeading className="text-sm font-semibold" />
                                <CalendarYearPicker.TriggerIndicator />
                            </CalendarYearPicker.Trigger>
                            <Calendar.NavButton slot="previous" />
                            <Calendar.NavButton slot="next" />
                        </Calendar.Header>
                        <Calendar.Grid>
                            <Calendar.GridHeader>
                                {(day: string) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                            </Calendar.GridHeader>
                            <Calendar.GridBody>
                                {(date: CalendarDate) => <Calendar.Cell date={date}>{({ formattedDate }: { formattedDate: string }) => formattedDate}</Calendar.Cell>}
                            </Calendar.GridBody>
                        </Calendar.Grid>
                        <CalendarYearPicker.Grid>
                            <CalendarYearPicker.GridBody>
                                {(values) => (
                                    <CalendarYearPicker.Cell year={values.year}>
                                        {values.formattedYear}
                                    </CalendarYearPicker.Cell>
                                )}
                            </CalendarYearPicker.GridBody>
                        </CalendarYearPicker.Grid>
                    </Calendar.Root>
                    <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
                        <Button
                            size="sm"
                            variant="light"
                            onPress={() => { onChange(new Date()); setIsOpen(false); }}
                            className="h-8 px-3 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
                        >
                            Aujourd hui
                        </Button>
                        {value ? (
                            <Button
                                size="sm"
                                variant="light"
                                onPress={() => { onChange(null); setIsOpen(false); }}
                                className="h-8 px-3 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
                            >
                                Effacer
                            </Button>
                        ) : null}
                    </div>
                </Popover.Content>
            </Popover>

            {error ? (
                <p className="text-[9px] font-medium text-[var(--danger)]">{error}</p>
            ) : null}
        </div>
    );
}
