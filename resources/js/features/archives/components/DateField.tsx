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
        <div className="flex min-w-0 flex-col gap-1.5">
            {label ? (
                <label className="text-xs font-medium text-white/50">{label}</label>
            ) : null}

            <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
                <Popover.Trigger>
                    <Button
                        variant="flat"
                        className={cn(
                            'h-10 w-full justify-start gap-2 rounded-lg border px-3 text-[13px] font-normal outline-none transition',
                            'border-white/10 bg-white/[0.04] text-white',
                            'hover:border-white/20',
                            !value && 'text-white/40',
                        )}
                    >
                        <Calendar size={15} className="shrink-0 text-white/40" />
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
                                className="flex size-5 items-center justify-center rounded-full hover:bg-white/10"
                                aria-label="Clear date"
                            >
                                <X size={13} className="text-white/50" />
                            </button>
                        ) : null}
                    </Button>
                </Popover.Trigger>

                <Popover.Content className="w-auto min-w-0 rounded-lg border border-white/10 bg-[#1c1c1c] p-0 shadow-xl">
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
                            month_caption: 'text-sm font-semibold text-white px-2 py-1',
                            caption_label: 'text-sm font-semibold text-white',
                            chevron: 'fill-white/40 hover:fill-white size-4',
                            day: 'text-[13px] text-white/70 rounded-md h-9 w-9 transition hover:bg-white/[0.06] focus:outline-none',
                            day_button: 'h-9 w-9',
                            day_selected: 'bg-amber-500 text-white font-semibold rounded-md',
                            day_today: 'ring-1 ring-white/20 rounded-md',
                            day_disabled: 'text-white/20',
                            outside: 'text-white/20',
                            weekday: 'text-[11px] font-medium text-white/40 uppercase tracking-wide',
                            weekdays: 'px-3 pt-1 pb-2',
                            months_dropdown: 'text-xs text-white bg-white/[0.06] border border-white/10 rounded-md px-2 py-1',
                            years_dropdown: 'text-xs text-white bg-white/[0.06] border border-white/10 rounded-md px-2 py-1',
                        }}
                    />
                    <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                        <Button
                            size="sm"
                            variant="light"
                            onPress={() => { onChange(new Date()); setIsOpen(false); }}
                            className="h-8 px-3 text-[12px] text-white/70 hover:text-white"
                        >
                            Today
                        </Button>
                        {value ? (
                            <Button
                                size="sm"
                                variant="light"
                                onPress={() => { onChange(null); setIsOpen(false); }}
                                className="h-8 px-3 text-[12px] text-white/50 hover:text-white"
                            >
                                Clear
                            </Button>
                        ) : null}
                    </div>
                </Popover.Content>
            </Popover>

            {error ? (
                <p className="text-xs font-medium text-red-400">{error}</p>
            ) : null}
        </div>
    );
}
