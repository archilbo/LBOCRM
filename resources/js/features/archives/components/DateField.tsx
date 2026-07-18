import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Button, Popover } from '@heroui/react';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';

type DateFieldProps = {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    fromYear?: number;
    toYear?: number;
    error?: string;
};

export function DateField({
    label,
    value,
    onChange,
    placeholder = 'Pick a date',
    fromYear = 2015,
    toYear = 2035,
    error,
}: DateFieldProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex min-w-0 flex-col gap-1">
            {label ? (
                <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">{label}</label>
            ) : null}

            <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
                <Popover.Trigger>
                    <Button
                        variant="flat"
                        className={cn(
                            'h-8 w-full justify-start gap-2 rounded-[var(--radius-md)] border px-2.5 text-xs font-normal outline-none transition',
                            'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]',
                            'hover:border-[var(--accent)]',
                            !value && 'text-[var(--text-subtle)]',
                        )}
                    >
                        <Calendar size={14} className="shrink-0 text-[var(--text-muted)]" />
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
                                aria-label="Clear date"
                            >
                                <X size={13} />
                            </button>
                        ) : null}
                    </Button>
                </Popover.Trigger>

                <Popover.Content className="w-auto min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0 shadow-lg">
                    <DayPicker
                        mode="single"
                        selected={value ?? undefined}
                        onSelect={(d) => { onChange(d ?? null); setIsOpen(false); }}
                        showOutsideDays
                        captionLayout="dropdown"
                        fromYear={fromYear}
                        toYear={toYear}
                        classNames={{
                            root: 'm-0',
                            month: 'p-3',
                            month_caption: 'text-xs font-semibold text-[var(--foreground)] px-2 py-1',
                            caption_label: 'text-xs font-semibold text-[var(--foreground)]',
                            chevron: 'fill-[var(--text-muted)] hover:fill-[var(--foreground)] size-4',
                            day: 'text-xs text-[var(--text-muted)] rounded-md h-8 w-8 transition hover:bg-[var(--surface-2)] focus:outline-none',
                            day_button: 'h-8 w-8',
                            day_selected: 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold rounded-md',
                            day_today: 'ring-1 ring-[var(--accent)]/30 rounded-md',
                            day_disabled: 'text-[var(--text-subtle)]/40',
                            outside: 'text-[var(--text-subtle)]/40',
                            weekday: 'text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide',
                            weekdays: 'px-3 pt-1 pb-2',
                            months_dropdown: 'text-xs text-[var(--foreground)] bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2 py-1',
                            years_dropdown: 'text-xs text-[var(--foreground)] bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2 py-1',
                        }}
                    />
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
                <p className="text-[10px] font-medium text-[var(--danger)]">{error}</p>
            ) : null}
        </div>
    );
}
