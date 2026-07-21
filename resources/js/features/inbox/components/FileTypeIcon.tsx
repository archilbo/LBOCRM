import { FileText, FileImage, File as FileIcon, Archive } from 'lucide-react';
import type { FileAppearance } from '@/features/inbox/utils/fileFormatters';
import { cn } from '@/lib/cn';

type Props = {
    appearance: FileAppearance;
    size?: number;
    className?: string;
};

export function FileTypeIcon({ appearance, size = 20, className }: Props) {
    const iconClass = cn(appearance.color, className);

    switch (appearance.icon) {
        case 'pdf':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                    <FileText size={size} className={cn('text-red-400', className)} />
                </div>
            );
        case 'image':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                    <FileImage size={size} className={cn('text-blue-400', className)} />
                </div>
            );
        case 'doc':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
                    <FileText size={size} className={cn('text-blue-500', className)} />
                </div>
            );
        case 'spreadsheet':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                    <FileText size={size} className={cn('text-emerald-400', className)} />
                </div>
            );
        case 'archive':
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                    <Archive size={size} className={cn('text-amber-400', className)} />
                </div>
            );
        default:
            return (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)]">
                    <FileIcon size={size} className={cn('text-[var(--text-muted)]', className)} />
                </div>
            );
    }
}
