import { IconCircle, IconCircleCheck, IconClockHour3, IconAlertTriangle, IconArchive } from '@tabler/icons-react';

import { AppBadge } from '@/components/ui/AppBadge';

type StatusTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

type AppStatusBadgeProps = {
    label: string;
    tone?: StatusTone;
    icon?: 'dot' | 'check' | 'clock' | 'warning' | 'archive';
};

const icons = {
    dot: IconCircle,
    check: IconCircleCheck,
    clock: IconClockHour3,
    warning: IconAlertTriangle,
    archive: IconArchive,
};

export function AppStatusBadge({
    label,
    tone = 'neutral',
    icon = 'dot',
}: AppStatusBadgeProps) {
    const Icon = icons[icon];

    return (
        <AppBadge tone={tone} className="max-w-[150px]">
            <Icon
                size={10}
                className={icon === 'dot' ? 'shrink-0 fill-current' : 'shrink-0'}
            />
            <span className="truncate">{label}</span>
        </AppBadge>
    );
}
