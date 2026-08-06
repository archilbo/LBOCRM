import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button } from '@heroui/react';

import { useTranslation } from '@/lib/i18n';

type Props = {
    currentDate: Date;
    viewMode: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
    onViewModeChange: (v: Props['viewMode']) => void;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
};

const VIEWS = [
    { key: 'dayGridMonth' as const, tKey: 'calendar.month' },
    { key: 'timeGridWeek' as const, tKey: 'calendar.week' },
    { key: 'timeGridDay' as const, tKey: 'calendar.day' },
];

export function CalendarToolbar({ currentDate, viewMode, onViewModeChange, onPrev, onNext, onToday }: Props) {
    const { t, locale } = useTranslation();
    const intlLocale = locale === 'fr' ? 'fr-FR' : 'en-US';
    const title = new Intl.DateTimeFormat(intlLocale, {
        month: 'long',
        year: 'numeric',
        day: viewMode === 'timeGridDay' ? 'numeric' : undefined,
    }).format(currentDate);

    return (
        <div className="flex h-[54px] items-center justify-between border-b border-white/8 px-4">
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onPress={onToday}
                    className="h-7 min-h-7 rounded-lg border-white/8 px-3 text-[10px] font-semibold text-white/70 transition hover:bg-white/5 hover:text-white">
                    {t('calendar.today')}
                </Button>
                <div className="flex items-center">
                    <Button
                        type="button"
                        isIconOnly
                        size="sm"
                        variant="outline"
                        onPress={onPrev}
                        aria-label={t('calendar.previous')}
                        className="size-7 min-w-7 rounded-l-lg rounded-r-none border-white/8 p-0 text-white/40 transition hover:bg-white/5 hover:text-white">
                        <IconChevronLeft size={14} />
                    </Button>
                    <Button
                        type="button"
                        isIconOnly
                        size="sm"
                        variant="outline"
                        onPress={onNext}
                        aria-label={t('calendar.next')}
                        className="-ml-px size-7 min-w-7 rounded-l-none rounded-r-lg border-white/8 p-0 text-white/40 transition hover:bg-white/5 hover:text-white">
                        <IconChevronRight size={14} />
                    </Button>
                </div>
            </div>

            <h2 className="text-sm font-semibold">{title}</h2>

            <div className="flex rounded-lg border border-white/8 p-0.5">
                {VIEWS.map((v) => (
                    <Button
                        key={v.key}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onPress={() => onViewModeChange(v.key)}
                        className={`h-7 min-h-7 rounded-md px-3 text-[10px] font-semibold transition ${
                            viewMode === v.key
                                ? 'bg-[var(--crm-gold)] text-black hover:brightness-110'
                                : 'text-white/50 hover:text-white'
                        }`}>
                        {t(v.tKey)}
                    </Button>
                ))}
            </div>
        </div>
    );
}
