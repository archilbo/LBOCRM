import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';


type Props = {
    currentDate: Date;
    viewMode: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
    onViewModeChange: (v: Props['viewMode']) => void;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
};

const VIEWS = [
    { key: 'dayGridMonth' as const, label: 'Month' },
    { key: 'timeGridWeek' as const, label: 'Week' },
    { key: 'timeGridDay' as const, label: 'Day' },
];

export function CalendarToolbar({ currentDate, viewMode, onViewModeChange, onPrev, onNext, onToday }: Props) {
    const title = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        day: viewMode === 'timeGridDay' ? 'numeric' : undefined,
    }).format(currentDate);

    return (
        <div className="flex h-[54px] items-center justify-between border-b border-white/8 px-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToday}
                    className="h-7 rounded-lg border border-white/8 px-3 text-[10px] font-semibold text-white/70 transition hover:bg-white/5 hover:text-white">
                    Today
                </button>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={onPrev}
                        className="flex size-7 items-center justify-center rounded-l-lg border border-white/8 text-white/40 transition hover:bg-white/5 hover:text-white">
                        <IconChevronLeft size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        className="-ml-px flex size-7 items-center justify-center rounded-r-lg border border-white/8 text-white/40 transition hover:bg-white/5 hover:text-white">
                        <IconChevronRight size={14} />
                    </button>
                </div>
            </div>

            <h2 className="text-sm font-semibold">{title}</h2>

            <div className="flex rounded-lg border border-white/8 p-0.5">
                {VIEWS.map((v) => (
                    <button
                        key={v.key}
                        type="button"
                        onClick={() => onViewModeChange(v.key)}
                        className={`h-7 rounded-md px-3 text-[10px] font-semibold transition ${
                            viewMode === v.key
                                ? 'bg-[var(--crm-gold)] text-black'
                                : 'text-white/50 hover:text-white'
                        }`}>
                        {v.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
