import { LogOut, MoveRight, Undo2, X } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';

type BulkActionBarProps = {
    count: number;
    onCheckout: () => void;
    onReturn: () => void;
    onMove: () => void;
    onClear: () => void;
};

export function BulkActionBar({ count, onCheckout, onReturn, onMove, onClear }: BulkActionBarProps) {
    if (count === 0) return null;

    return (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] px-4 py-3">
            <span className="text-sm font-semibold tabular-nums text-[var(--foreground)]">{count} selected</span>

            <div className="ml-2 flex items-center gap-1">
                <AppButton variant="secondary" size="sm" className="h-8 text-xs" onPress={onCheckout}>
                    <LogOut size={14} /> Check-out
                </AppButton>
                <AppButton variant="secondary" size="sm" className="h-8 text-xs" onPress={onReturn}>
                    <Undo2 size={14} /> Return
                </AppButton>
                <AppButton variant="secondary" size="sm" className="h-8 text-xs" onPress={onMove}>
                    <MoveRight size={14} /> Move
                </AppButton>
            </div>

            <button
                type="button"
                onClick={onClear}
                className="ml-auto flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
                <X size={14} /> Clear
            </button>
        </div>
    );
}
