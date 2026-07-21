import { CalendarDate } from '@internationalized/date';

export function toCalendarDate(date: Date | null): CalendarDate | null {
    if (!date) return null;
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function fromCalendarDate(cd: CalendarDate | null): Date | null {
    if (!cd) return null;
    return new Date(cd.year, cd.month - 1, cd.day);
}

export function dateToStr(date: Date | null): string {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function strToDate(str: string | null): Date | null {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
}
