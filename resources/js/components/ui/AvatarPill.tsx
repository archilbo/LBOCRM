import { Avatar } from '@heroui/react';
import { cn } from '@/lib/cn';

type AvatarPillProps = {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export function AvatarPill({ name, src, size = 'md', className }: AvatarPillProps) {
    const initial = (name || '?').charAt(0).toUpperCase();

    return (
        <Avatar
            src={src}
            fallback={initial}
            size={size}
            className={cn('shrink-0', className)}
        />
    );
}
