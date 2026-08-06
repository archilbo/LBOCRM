import { cn } from '@/lib/cn';

const tone: Record<string, string> = {
    ready_to_archive: 'bg-[var(--crm-success-soft)] text-[var(--crm-success)]',
    stored: 'bg-[var(--crm-info-soft)] text-[var(--crm-info)]',
    checked_out: 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]',
    returned: 'bg-[var(--crm-violet-soft)] text-[var(--crm-violet)]',
    lost: 'bg-[var(--crm-text-muted)]/12 text-[var(--crm-text-muted)]',
};

const toneOverdue: Record<string, string> = {
    checked_out: 'bg-[var(--crm-danger-soft)] text-[var(--crm-danger)]',
};

const labels: Record<string, string> = {
    ready_to_archive: 'Ready',
    stored: 'Stored',
    checked_out: 'Out',
    returned: 'Returned',
    lost: 'Lost',
};

const colorMap: Record<string, string> = {
    default: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
    primary: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
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
            ? toneOverdue[status] || 'bg-[var(--crm-danger-soft)] text-[var(--crm-danger)]'
            : tone[status] || 'bg-[var(--crm-text-muted)]/12 text-[var(--crm-text-muted)]';
        const displayLabel = label || (isOverdue ? 'Overdue' : (labels[status] || status));
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
