import { useState, useRef } from 'react';
import { cn } from '@/lib/cn';
import { BoxCell } from '@/features/archives/components/BoxCell';
import { BoxContentsDrawer } from '@/features/archives/components/BoxContentsDrawer';
import { MapLegend } from '@/features/archives/components/MapLegend';
import type { TreeNode, BoxContents } from '@/features/archives/types';
import { useTranslation } from '@/lib/i18n';

type MapViewProps = {
    tree: TreeNode[];
    selectedBox: string | null;
    onSelectBox: (code: string | null) => void;
};

function RoomUtilization(room: TreeNode) {
    const boxes = room.shelves?.flatMap((s) => s.boxes ?? []) ?? [];
    const total = boxes.length;
    const filled = boxes.filter((b) => b.count > 0).length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    return { filled, total, pct };
}

export function MapView({ tree, selectedBox, onSelectBox }: MapViewProps) {
    const { t } = useTranslation();
    const [expandedRooms, setExpandedRooms] = useState<Set<number>>(() => new Set(tree.map((r) => r.id)));
    const [drawerBoxCode, setDrawerBoxCode] = useState<string | null>(null);
    const [drawerData, setDrawerData] = useState<BoxContents | null>(null);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRoomTab, setActiveRoomTab] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    async function handleBoxClick(boxCode: string) {
        onSelectBox(selectedBox === boxCode ? null : boxCode);
        setDrawerBoxCode(boxCode);
        setDrawerLoading(true);
        setDrawerData(null);
        try {
            const res = await fetch(`/archives/boxes/${boxCode}/contents`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Failed to load');
            const json: BoxContents = await res.json();
            setDrawerData(json);
        } catch {
            setDrawerData(null);
        } finally {
            setDrawerLoading(false);
        }
    }

    function toggleRoom(id: number) {
        setExpandedRooms((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function scrollToRoom(code: string) {
        setActiveRoomTab(code);
        const el = document.getElementById(`room-${code}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const totalRecords = tree.reduce(
        (sum, r) => sum + (r.shelves?.reduce((s, sh) => s + (sh.boxes?.reduce((b, bx) => b + bx.count, 0) ?? 0), 0) ?? 0),
        0,
    );
    const totalBoxes = tree.reduce(
        (sum, r) => sum + (r.shelves?.reduce((s, sh) => s + (sh.boxes?.length ?? 0), 0) ?? 0),
        0,
    );

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Navigation bar */}
                <div className="shrink-0 border-b border-[var(--crm-border-soft)] bg-[var(--crm-elevated)]/50 px-4 py-2">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--crm-text-soft)] mr-1">
                                {t('map.rooms')}
                            </span>
                            {tree.map((room) => (
                                <button
                                    key={room.id}
                                    type="button"
                                    onClick={() => scrollToRoom(room.code)}
                                    className={cn(
                                        'rounded-md border px-2.5 py-1 text-[10px] font-medium transition',
                                        activeRoomTab === room.code
                                            ? 'border-[var(--crm-gold)]/40 bg-[var(--crm-gold)]/10 text-[var(--crm-gold)]'
                                            : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]/85 hover:bg-[var(--crm-elevated)]',
                                    )}
                                >
                                    {room.code}
                                    <span className="ml-1 text-[9px] opacity-50">
                                        {RoomUtilization(room).pct}%
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('map.searchBoxes')}
                                    className="h-7 w-36 rounded-md border border-[var(--crm-border)] bg-[var(--crm-elevated)]/60 pl-2 pr-6 text-[10px] text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-text-soft)] focus:border-[var(--crm-border-strong)] focus:ring-2 focus:ring-[var(--crm-gold)]/15 transition"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)]"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <span className="text-[9px] text-[var(--crm-text-soft)] tabular-nums">
                                {totalRecords} {t('map.rec')} · {totalBoxes} {t('map.boxes')}
                            </span>
                        </div>
                    </div>
                    <MapLegend />
                </div>

                {/* Rooms */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none">
                    <div className="p-4 space-y-5">
                        {tree.map((room) => {
                            const isExpanded = expandedRooms.has(room.id);
                            const util = RoomUtilization(room);
                            const roomRecs = room.shelves?.reduce(
                                (sum, s) => sum + (s.boxes?.reduce((bs, b) => bs + b.count, 0) ?? 0), 0,
                            ) ?? 0;

                            return (
                                <div
                                    key={room.id}
                                    id={`room-${room.code}`}
                                    className={cn(
                                        'rounded-xl border overflow-hidden transition-all duration-300',
                                        'border-[var(--crm-border-soft)] bg-[var(--crm-elevated)]/60',
                                        activeRoomTab === room.code && 'ring-1 ring-[var(--crm-gold)]/20 border-[var(--crm-gold)]/20',
                                    )}
                                >
                                    {/* Room header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleRoom(room.id)}
                                        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-[var(--crm-elevated)]/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'flex items-center justify-center size-6 rounded border border-[var(--crm-border)] text-[var(--crm-text-soft)] transition-transform duration-200',
                                                isExpanded && 'rotate-90',
                                            )}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-sm font-semibold text-[var(--crm-text)]/90">{room.name}</span>
                                                            <span className="rounded bg-[var(--crm-elevated)] px-1.5 py-[1px] text-[9px] text-[var(--crm-text-soft)] border border-[var(--crm-border)]">
                                                        {room.code}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] text-[var(--crm-text-soft)]">{roomRecs} {t('map.rec')}{roomRecs !== 1 ? 's' : ''}</span>
                                                    <span className="text-[var(--crm-text-soft)]/50">·</span>
                                                    <span className="text-[9px] text-[var(--crm-text-soft)]">{util.filled}/{util.total} {t('map.boxesUsed')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Utilization bar */}
                                            <div className="hidden sm:flex items-center gap-2">
                                                <div className="flex h-1.5 w-16 rounded-full bg-[var(--crm-elevated)] overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full transition-all duration-500',
                                                            util.pct >= 90 ? 'bg-[var(--crm-danger)]' : util.pct >= 70 ? 'bg-[var(--crm-gold)]' : 'bg-[var(--crm-success)]',
                                                        )}
                                                        style={{ width: `${util.pct}%` }}
                                                    />
                                                </div>
                                                <span className={cn(
                                                    'text-[9px] font-medium tabular-nums',
                                                    util.pct >= 90 ? 'text-[var(--crm-danger)]' : util.pct >= 70 ? 'text-[var(--crm-gold)]' : 'text-[var(--crm-success)]',
                                                )}>
                                                    {util.pct}%
                                                </span>
                                            </div>

                                            {/* Expand icon */}
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className={cn(
                                                    'text-[var(--crm-text-soft)] transition-transform duration-200',
                                                    isExpanded && 'rotate-180',
                                                )}
                                            >
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Shelves */}
                                    <div className={cn(
                                        'overflow-hidden transition-all duration-300',
                                        isExpanded ? 'opacity-100' : 'max-h-0 opacity-0',
                                    )}>
                                        {room.shelves?.map((shelf) => {
                                            const filteredBoxes = searchQuery
                                                ? shelf.boxes?.filter((b) =>
                                                    b.code.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                : shelf.boxes;

                                            if (filteredBoxes && filteredBoxes.length === 0 && searchQuery) return null;

                                            const shelfCount = shelf.boxes?.reduce((sum, b) => sum + b.count, 0) ?? 0;
                                            const shelfCap = shelf.boxes?.reduce((sum, b) => sum + b.capacity, 0) ?? 1;
                                            const shelfPct = Math.round((shelfCount / shelfCap) * 100);

                                            return (
                                                <div key={shelf.id} className="border-t border-[var(--crm-border-soft)]/60">
                                                    {/* Shelf header */}
                                                    <div className="flex items-center px-5 pt-3 pb-1">
                                                        {/* Left bracket */}
                                                        <svg width="12" height="20" viewBox="0 0 12 20" className="shrink-0 text-[var(--crm-text-soft)]/50">
                                                            <path d="M11 0H8a6 6 0 00-6 6v8a6 6 0 006 6h3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                                        </svg>

                                                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mx-1.5" />

                                                        <span className="text-[9px] font-medium text-[var(--crm-text-soft)]">{t('map.shelf')} {shelf.code}</span>

                                                        <div className="flex-1 h-px bg-gradient-to-l from-white/10 via-white/5 to-transparent mx-1.5" />

                                                        {/* Right bracket */}
                                                        <svg width="12" height="20" viewBox="0 0 12 20" className="shrink-0 text-[var(--crm-text-soft)]/50 rotate-180">
                                                            <path d="M11 0H8a6 6 0 00-6 6v8a6 6 0 006 6h3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                                        </svg>

                                                        {shelfCount > 0 && (
                                                            <span className={cn(
                                                                'ml-2 text-[9px] tabular-nums font-medium',
                                                                shelfPct >= 90 ? 'text-[var(--crm-danger)]' : shelfPct >= 70 ? 'text-[var(--crm-gold)]' : 'text-[var(--crm-text-soft)]',
                                                            )}>
                                                                {shelfPct}%
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Shelf surface line */}
                                                    <div className="relative mx-5">
                                                        <div className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                                                    </div>

                                                    {/* Boxes grid */}
                                                    <div className="px-5 pb-4 pt-3">
                                                        {filteredBoxes && filteredBoxes.length > 0 ? (
                                                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                                                {filteredBoxes.map((box) => (
                                                                    <BoxCell
                                                                        key={box.id}
                                                                        box={box}
                                                                        isSelected={selectedBox === box.code}
                                                                        isDrawerOpen={drawerBoxCode === box.code}
                                                                        onSelect={() => handleBoxClick(box.code)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-6 text-center text-xs text-[var(--crm-text-soft)]/50">
                                                                {searchQuery ? t('map.noBoxesMatch') : t('map.noBoxesConfigured')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {(!room.shelves || room.shelves.length === 0) && (
                                            <div className="border-t border-[var(--crm-border-soft)]/60 px-5 py-8 text-center text-xs text-[var(--crm-text-soft)]/60">
                                                {t('map.noShelvesConfigured')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {tree.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-[var(--crm-text-soft)]/60">
                                <svg viewBox="0 0 24 24" className="size-10 mb-3" fill="none" stroke="currentColor" strokeWidth="1">
                                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7h18" />
                                </svg>
                                <span className="text-sm">No storage structure found</span>
                                <span className="text-xs mt-1">Set up rooms, shelves and boxes first</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BoxContentsDrawer
                isOpen={drawerBoxCode !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDrawerBoxCode(null);
                        setDrawerData(null);
                    }
                }}
                data={drawerData}
                loading={drawerLoading}
            />
        </>
    );
}
