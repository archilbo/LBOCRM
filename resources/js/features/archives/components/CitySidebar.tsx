import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

import { useState } from 'react';
import type { CellRoom } from '@/features/archives/types';
import { cn } from '@/lib/cn';

type CitySidebarProps = {
    cells: CellRoom[];
    selectedCity: string | null;
    selectedRoom: string | null;
    selectedBox: string | null;
    onSelectCity: (code: string | null) => void;
    onSelectBox: (room: string, box: string) => void;
};

export function CitySidebar({ cells, selectedCity, selectedRoom, selectedBox, onSelectCity, onSelectBox }: CitySidebarProps) {
    const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(cells.map((r) => r.code)));
    const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set());

    function toggleRoom(code: string) {
        setExpandedRooms((prev) => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code); else next.add(code);
            return next;
        });
    }

    function toggleBox(code: string) {
        setExpandedBoxes((prev) => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code); else next.add(code);
            return next;
        });
    }

    if (cells.length === 0) {
        return (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="mb-2 text-[10px] uppercase tracking-wide text-white/50 font-semibold">Archives</h3>
                <p className="text-xs text-white/40">No archives stored yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <h3 className="mb-2 px-1 text-[10px] uppercase tracking-wide text-white/50 font-semibold">Archives</h3>
            <div className="space-y-0.5">
                {cells.map((room) => {
                    const isRoomExpanded = expandedRooms.has(room.code);
                    const isRoomActive = selectedRoom === room.code;
                    return (
                        <div key={room.code}>
                            <button type="button" onClick={() => toggleRoom(room.code)}
                                className={cn(
                                    'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition hover:bg-white/5',
                                    isRoomActive ? 'text-white' : 'text-white/60',
                                )}>
                                {isRoomExpanded ? <IconChevronDown size={11} className="shrink-0" /> : <IconChevronRight size={11} className="shrink-0" />}
                                <span className="font-medium truncate">{room.name}</span>
                            </button>
                            {isRoomExpanded ? (
                                <div className="ml-2 space-y-0.5">
                                    {room.boxes.map((box) => {
                                        const isBoxExpanded = expandedBoxes.has(room.code + box.code);
                                        const isBoxActive = selectedRoom === room.code && selectedBox === box.code;
                                        return (
                                            <div key={box.code}>
                                                <button type="button"
                                                    onClick={() => { toggleBox(room.code + box.code); onSelectBox(room.code, box.code); }}
                                                    className={cn(
                                                        'flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] transition hover:bg-white/5',
                                                        isBoxActive ? 'text-white/80' : 'text-white/50',
                                                    )}>
                                                    {isBoxExpanded ? <IconChevronDown size={10} className="shrink-0" /> : <IconChevronRight size={10} className="shrink-0" />}
                                                    <span className="font-mono">{box.code}</span>
                                                </button>
                                                {isBoxExpanded ? (
                                                    <div className="ml-3 space-y-0.5">
                                                        {box.cities.map((city) => {
                                                            const isCityActive = selectedCity === city.code;
                                                            return (
                                                                <button key={city.code} type="button"
                                                                    onClick={() => onSelectCity(isCityActive ? null : city.code)}
                                                                    className={cn(
                                                                        'flex w-full items-center gap-2 rounded-lg px-2 py-1 text-[10px] transition hover:bg-white/5',
                                                                        isCityActive ? 'text-amber-400' : 'text-white/50',
                                                                    )}>
                                                                    <span
                                                                        className={cn('h-2 w-2 rounded-full shrink-0', isCityActive ? 'ring-2 ring-white/40' : 'ring-1 ring-black/10')}
                                                                        style={{ backgroundColor: city.color }}
                                                                    />
                                                                    <span className="truncate">{city.name}</span>
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
        </div>
    );
}
