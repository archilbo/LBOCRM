import { LogOut, MoveRight, Undo2, X } from 'lucide-react';

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
        <div className="flex items-center gap-2 border-t border-white/5 bg-amber-500/[0.04] px-3 py-2.5 shrink-0">
            <span className="text-sm font-semibold tabular-nums text-amber-400">{count}</span>
            <span className="text-xs text-white/40">selected</span>

            <div className="ml-3 flex items-center gap-1">
                <button type="button" onClick={onCheckout}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition">
                    <LogOut size={13} /> Check-out
                </button>
                <button type="button" onClick={onReturn}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition">
                    <Undo2 size={13} /> Return
                </button>
                <button type="button" onClick={onMove}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition">
                    <MoveRight size={13} /> Move
                </button>
            </div>

            <button type="button" onClick={onClear}
                className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-white/40 hover:text-white/70 transition">
                <X size={13} /> Clear
            </button>
        </div>
    );
}
