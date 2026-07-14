import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { TreeNode } from '@/features/archives/types';

type MapViewProps = {
    tree: TreeNode[];
    selectedBox: string | null;
    onSelectBox: (code: string | null) => void;
};

const STATUS_MAP: Record<string, string> = {
    ready_to_archive: 'border-slate-400/50 bg-slate-400/10',
    stored: 'bg-emerald-400/20 border-emerald-400/40',
    checked_out: 'bg-amber-400/20 border-amber-400/40',
    returned: 'bg-sky-400/20 border-sky-400/40',
    lost: 'bg-red-400/20 border-red-400/40',
};

const CELL_SIZE = 20;

export function MapView({ tree, selectedBox, onSelectBox }: MapViewProps) {
    return (
        <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {tree.map((room) =>
                    room.shelves?.map((shelf) => {
                        const maxFill = shelf.boxes?.reduce((max, b) => Math.max(max, b.fill), 0) ?? 0;

                        return (
                            <div key={shelf.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                                <div className="mb-2 flex items-center justify-between text-xs">
                                    <span className="font-semibold text-[var(--foreground)]">{room.code} / {shelf.code}</span>
                                    <span className={cn(
                                        'tabular-nums text-[var(--text-muted)]',
                                        maxFill >= 90 && 'text-red-400',
                                        maxFill >= 70 && maxFill < 90 && 'text-amber-400',
                                    )}>
                                        {maxFill}%
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {shelf.boxes?.map((box) => {
                                        const isSelected = selectedBox === box.code;
                                        const fillPct = box.fill;
                                        const empty = box.count === 0;

                                        return (
                                            <button
                                                key={box.id}
                                                type="button"
                                                onClick={() => onSelectBox(isSelected ? null : box.code)}
                                                className={cn(
                                                    'flex items-center justify-center rounded border text-[9px] font-mono tabular-nums transition hover:scale-[1.04]',
                                                    isSelected && 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)]',
                                                    empty ? 'border-dashed border-[var(--border)] text-[var(--text-subtle)]' : STATUS_MAP['stored'],
                                                )}
                                                style={{ width: CELL_SIZE * 2, height: CELL_SIZE }}
                                                title={`${box.code} (${box.count}/${box.capacity})`}
                                            >
                                                {empty ? '·' : `${box.count}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
