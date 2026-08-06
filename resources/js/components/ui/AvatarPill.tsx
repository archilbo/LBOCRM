import { cn } from '@/lib/cn';

type AvatarPillProps = {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const SIZE_CLASSES: Record<NonNullable<AvatarPillProps['size']>, string> = {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-10',
};

function initials(name: string) {
    return name.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';
}

/** Initials circle matching the Admin/Users page pattern (soft gold, gold text). */
export function AvatarPill({ name, size = 'md', className }: AvatarPillProps) {
    return (
        <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] font-bold text-[var(--crm-gold)]', SIZE_CLASSES[size], className)}>
            {initials(name)}
        </span>
    );
}
