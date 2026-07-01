import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

type Props = {
    currentDate: Date;
    onDateChange: (d: Date) => void;
    onDayClick: (d: Date) => void;
};

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function MiniCalendar({ currentDate, onDateChange, onDayClick }: Props) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const today = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    const cells = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const daysInMonth = lastDay.getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const result: { day: number; isOutside: boolean }[] = [];
        for (let i = startOffset - 1; i >= 0; i--) result.push({ day: daysInPrevMonth - i, isOutside: true });
        for (let d = 1; d <= daysInMonth; d++) result.push({ day: d, isOutside: false });
        let nextDay = 1;
        while (result.length % 7 !== 0) result.push({ day: nextDay++, isOutside: true });
        return result;
    }, [year, month]);

    function prev() { onDateChange(new Date(year, month - 1, 1)); }
    function next() { onDateChange(new Date(year, month + 1, 1)); }

    return (
        <div className="select-none">
            <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={prev} className="flex size-6 items-center justify-center rounded text-[var(--crm-muted)] hover:bg-white/5 hover:text-white">
                    <ChevronLeft size={13} />
                </button>
                <span className="text-xs font-semibold">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
                </span>
                <button type="button" onClick={next} className="flex size-6 items-center justify-center rounded text-[var(--crm-muted)] hover:bg-white/5 hover:text-white">
                    <ChevronRight size={13} />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-0 text-center">
                {DAYS.map((d) => (
                    <div key={d} className="py-1 text-[10px] font-semibold text-[var(--crm-text-muted)]">{d}</div>
                ))}
                {cells.map((cell, i) => {
                    const m = cell.isOutside ? (cell.day > 15 ? month - 1 : month + 1) : month;
                    const y = cell.isOutside
                        ? (cell.day > 15 ? (month === 0 ? year - 1 : year) : (month === 11 ? year + 1 : year))
                        : year;
                    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                    const isToday = dateStr === today;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onDayClick(new Date(y, m, cell.day))}
                            className={`mx-auto flex size-6 items-center justify-center rounded-full text-[11px] font-medium transition hover:bg-white/10 ${
                                isToday
                                    ? 'bg-[var(--crm-gold)] text-black hover:brightness-110'
                                    : cell.isOutside
                                        ? 'text-white/20'
                                        : 'text-white/70 hover:text-white'
                            }`}>
                            {cell.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
