import type { CalendarEventType, CalendarEventPriority } from '@/features/calendar/types';
import { EVENT_TYPE_COLORS } from '@/features/calendar/types';
import type { EventContentArg } from '@fullcalendar/core';

function getColor(type: CalendarEventType | undefined, fallback: string): string {
    return (type && EVENT_TYPE_COLORS[type]) || fallback;
}

export function CalendarEventPill(arg: EventContentArg) {
    const type = arg.event.extendedProps.type as CalendarEventType | undefined;
    const priority = arg.event.extendedProps.priority as CalendarEventPriority | undefined;
    const color = getColor(type, '#6b7280');

    if (arg.view.type === 'dayGridMonth') {
        return (
            <div
                className="truncate rounded-md px-2 text-[10px] font-medium leading-[22px]"
                style={{
                    backgroundColor: color + '18',
                    color: color,
                    borderLeft: `2px solid ${color}`,
                }}>
                {arg.event.title}
            </div>
        );
    }

    return (
        <div
            className="flex h-full flex-col overflow-hidden rounded-md px-2 py-1"
            style={{
                backgroundColor: color + '18',
                color: color,
                borderLeft: `2px solid ${color}`,
            }}>
            <span className="truncate text-[10px] font-semibold leading-[18px]">
                {arg.timeText ? <span className="opacity-60">{arg.timeText} </span> : null}
                {arg.event.title}
            </span>
        </div>
    );
}
