import { Circle, CheckCircle2, Clock3, AlertTriangle, Archive } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';

type StatusTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

type AppStatusBadgeProps = {
    label: string;
    tone?: StatusTone;
    icon?: 'dot' | 'check' | 'clock' | 'warning' | 'archive';
};

const icons = {
    dot: Circle,
    check: CheckCircle2,
    clock: Clock3,
    warning: AlertTriangle,
    archive: Archive,
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
