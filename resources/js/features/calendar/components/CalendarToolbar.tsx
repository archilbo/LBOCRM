import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { ButtonGroup } from '@heroui/react';

import { AppButton } from '@/components/ui/AppButton';
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
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2 sm:px-4">
            <div className="flex items-center gap-1.5">
                <AppButton
                    type="button"
                    variant="toolbar"
                    compact
                    onPress={onToday}
                    className="px-3 text-[11px]">
                    {t('calendar.today')}
                </AppButton>
                <ButtonGroup variant="outline" className="gap-0">
                    <AppButton
                        type="button"
                        isIconOnly
                        compact
                        variant="toolbar"
                        onPress={onPrev}
                        aria-label={t('calendar.previous')}
                        className="rounded-l-lg rounded-r-none">
                        <IconChevronLeft size={14} />
                    </AppButton>
                    <AppButton
                        type="button"
                        isIconOnly
                        compact
                        variant="toolbar"
                        onPress={onNext}
                        aria-label={t('calendar.next')}
                        className="-ml-px rounded-l-none rounded-r-lg">
                        <IconChevronRight size={14} />
                    </AppButton>
                </ButtonGroup>
            </div>

            <h2 className="order-3 w-full truncate px-1 text-center text-sm font-semibold text-[var(--foreground)] sm:order-none sm:w-auto sm:px-0">{title}</h2>

            <ButtonGroup variant="ghost" className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5">
                {VIEWS.map((v) => (
                    <AppButton
                        key={v.key}
                        type="button"
                        variant={viewMode === v.key ? 'accent' : 'quiet'}
                        compact
                        onPress={() => onViewModeChange(v.key)}
                        className={`rounded-md px-2.5 text-[11px] transition sm:px-3 ${
                            viewMode === v.key
                                ? 'text-[var(--accent-foreground)]'
                                : ''
                        }`}>
                        {t(v.tKey)}
                    </AppButton>
                ))}
            </ButtonGroup>
        </div>
    );
}
