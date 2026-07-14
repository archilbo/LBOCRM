import { cn } from '@/lib/cn';

const tone: Record<string, string> = {
    ready_to_archive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    stored: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    checked_out: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    returned: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    lost: 'bg-zinc-500/15 text-zinc-500',
};

const toneOverdue: Record<string, string> = {
    checked_out: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const labels: Record<string, string> = {
    ready_to_archive: 'Ready',
    stored: 'Stored',
    checked_out: 'Out',
    returned: 'Returned',
    lost: 'Lost',
};

const colorMap: Record<string, string> = {
    default: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
    primary: 'bg-[var(--accent)]/10 text-[var(--accent)]',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

type StatusPillProps = {
    label?: string;
    status?: string;
    isOverdue?: boolean;
    color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    size?: 'sm' | 'md';
    className?: string;
};

export function StatusPill({ label, status, isOverdue, color = 'default', size = 'sm', className }: StatusPillProps) {
    const h = size === 'sm' ? 'h-5' : 'h-6';
    const px = size === 'sm' ? 'px-2' : 'px-2.5';

    // New API: status key + optional isOverdue
    if (status) {
        const colorClass = isOverdue
            ? toneOverdue[status] || 'bg-red-500/10 text-red-600 dark:text-red-400'
            : tone[status] || 'bg-zinc-500/10 text-zinc-500';
        const displayLabel = isOverdue ? 'Overdue' : (labels[status] || status);
        return (
            <span className={cn('inline-flex items-center gap-1.5 rounded-full font-medium', h, px, 'text-xs', colorClass, className)}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {displayLabel}
            </span>
        );
    }

    // Legacy API: label + color
    const colorClass = colorMap[color] || colorMap.default;
    return (
        <span className={cn('inline-flex items-center gap-1.5 rounded-full font-medium', h, px, 'text-xs', colorClass, className)}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label || '-'}
        </span>
    );
}
