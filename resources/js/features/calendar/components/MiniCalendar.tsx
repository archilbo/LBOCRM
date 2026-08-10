import { Calendar } from '@heroui/react';
import { CalendarDate, type DateValue } from '@internationalized/date';

import { useTranslation } from '@/lib/i18n';

type Props = {
    currentDate: Date;
    onSelectDate: (date: Date) => void;
};

function toCalendarDate(date: Date): CalendarDate {
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function toLocalDate(value: DateValue): Date {
    return new Date(value.year, value.month - 1, value.day, 12);
}

/**
 * The compact navigator deliberately uses HeroUI's calendar primitive so month
 * navigation, year selection, keyboard control, and locale-aware cells share
 * the same reliable behavior as date fields elsewhere in the application.
 */
export function MiniCalendar({ currentDate, onSelectDate }: Props) {
    const { t } = useTranslation();

    return (
        <Calendar
            aria-label={t('calendar.title')}
            value={toCalendarDate(currentDate)}
            className="calendar-rail-picker"
            onChange={(value) => onSelectDate(toLocalDate(value))}>
            <Calendar.Header>
                <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                </Calendar.YearPickerTrigger>
                <Calendar.NavButton slot="previous" aria-label={t('calendar.previous')} />
                <Calendar.NavButton slot="next" aria-label={t('calendar.next')} />
            </Calendar.Header>
            <Calendar.Grid>
                <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                </Calendar.GridHeader>
                <Calendar.GridBody>
                    {(date) => (
                        <Calendar.Cell date={date}>
                            {({ formattedDate }) => <span className="calendar-rail-picker__day">{formattedDate}</span>}
                        </Calendar.Cell>
                    )}
                </Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                    {({ year }) => <Calendar.YearPickerCell year={year} />}
                </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
        </Calendar>
    );
}
