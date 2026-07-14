import { useState } from 'react';
import { ChevronDown, ChevronRight, MapPin, Package, Rows3 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { TreeNode } from '@/features/archives/types';

type StorageTreeProps = {
    tree: TreeNode[];
    selectedRoom: string | null;
    selectedShelf: string | null;
    selectedBox: string | null;
    onSelectRoom: (code: string | null) => void;
    onSelectShelf: (code: string | null) => void;
    onSelectBox: (code: string | null) => void;
    className?: string;
};

function CapacityBar({ fill }: { fill: number }) {
    return (
        <div className="h-1 w-full rounded-full bg-[var(--border)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${fill}%` }} />
        </div>
    );
}

export function StorageTree({
    tree,
    selectedRoom,
    selectedShelf,
    selectedBox,
    onSelectRoom,
    onSelectShelf,
    onSelectBox,
    className,
}: StorageTreeProps) {
    const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set(tree.map((r) => r.id)));
    const [expandedShelves, setExpandedShelves] = useState<Set<number>>(new Set());

    function toggleRoom(id: number) {
        setExpandedRooms((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function toggleShelf(id: number) {
        setExpandedShelves((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    return (
        <div className={cn('space-y-1', className)}>
            <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-[var(--text-muted)]">Storage</div>
            {tree.map((room) => {
                const isRoomSelected = selectedRoom === room.code;
                const isRoomOpen = expandedRooms.has(room.id);

                return (
                    <div key={room.id}>
                        <button
                            type="button"
                            onClick={() => { toggleRoom(room.id); onSelectRoom(isRoomSelected ? null : room.code); }}
                            className={cn(
                                'flex w-full items-center gap-1.5 rounded-md px-2 h-9 text-left text-xs transition',
                                isRoomSelected ? 'bg-[var(--surface-2)] text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                            )}
                        >
                            {isRoomOpen ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{room.code}</span>
                            <span className="text-[var(--text-muted)] ml-auto tabular-nums">{room.name}</span>
                        </button>

                        {isRoomOpen ? (
                            <div className="ml-3 space-y-0.5">
                                {room.shelves?.map((shelf) => {
                                    const isShelfSelected = selectedShelf === shelf.code;
                                    const isShelfOpen = expandedShelves.has(shelf.id);
                                    const maxFill = shelf.boxes?.reduce((max, b) => Math.max(max, b.fill), 0) ?? 0;

                                    return (
                                        <div key={shelf.id}>
                                            <button
                                                type="button"
                                                onClick={() => { toggleShelf(shelf.id); onSelectShelf(isShelfSelected ? null : shelf.code); }}
                                                className={cn(
                                                    'flex w-full items-center gap-1.5 rounded-md px-2 h-9 text-left text-xs transition',
                                                    isShelfSelected ? 'bg-[var(--surface-2)] text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                                )}
                                            >
                                                {shelf.boxes?.length ? (
                                                    isShelfOpen ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />
                                                ) : <span className="w-3 shrink-0" />}
                                                <Rows3 size={12} className="shrink-0" />
                                                <span className="truncate">{shelf.code}</span>
                                                <div className="ml-auto w-12">
                                                    <CapacityBar fill={maxFill} />
                                                </div>
                                            </button>

                                            {isShelfOpen ? (
                                                <div className="ml-3 space-y-0.5">
                                                    {shelf.boxes?.map((box) => {
                                                        const isBoxSelected = selectedBox === box.code;
                                                        return (
                                                            <button
                                                                key={box.id}
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); onSelectBox(isBoxSelected ? null : box.code); }}
                                                                className={cn(
                                                                    'flex w-full items-center gap-1.5 rounded-md px-2 h-9 text-left text-xs transition',
                                                                    isBoxSelected ? 'bg-[var(--surface-2)] text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                                                )}
                                                            >
                                                                <Package size={12} className="shrink-0" />
                                                                <span className="truncate">{box.code}</span>
                                                                <span className="ml-auto tabular-nums text-xs">{box.count}/{box.capacity}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
