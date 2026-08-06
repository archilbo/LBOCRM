import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import type { TreeBox, RecordsSummary } from '@/features/archives/types';

type BoxCellProps = {
    box: TreeBox & { recordsSummary?: RecordsSummary };
    isSelected: boolean;
    isDrawerOpen: boolean;
    onSelect: () => void;
};

function getFillColor(fill: number): string {
    if (fill === 0) return 'bg-[var(--crm-elevated)]';
    if (fill <= 30) return 'bg-[var(--crm-success)]';
    if (fill <= 60) return 'bg-[var(--crm-gold)]';
    if (fill <= 90) return 'bg-[var(--crm-gold-2)]';
    return 'bg-[var(--crm-danger)]';
}

const STATUS_BADGE: Record<string, string> = {
    checked_out: 'bg-[var(--crm-gold)]/15 text-[var(--crm-gold)] border-[var(--crm-gold)]/30',
    overdue: 'bg-[var(--crm-danger)]/15 text-[var(--crm-danger)] border-[var(--crm-danger)]/30',
    lost: 'bg-[var(--crm-danger)]/25 text-[var(--crm-danger)] border-[var(--crm-danger)]/40',
};

type TooltipPos = { top: number; left: number; width: number } | null;

export function BoxCell({ box, isSelected, isDrawerOpen, onSelect }: BoxCellProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const [pos, setPos] = useState<TooltipPos>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout>>();

    const recalc = useCallback(() => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        setPos({ top: rect.top, left: rect.left, width: rect.width });
    }, []);

    const handleMouseEnter = useCallback(() => {
        clearTimeout(hideTimer.current);
        recalc();
        setShowTooltip(true);
    }, [recalc]);

    const handleMouseLeave = useCallback(() => {
        hideTimer.current = setTimeout(() => {
            setShowTooltip(false);
            setPos(null);
        }, 250);
    }, []);

    useEffect(() => {
        if (!showTooltip) return;
        const onScroll = () => recalc();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onScroll);
        };
    }, [showTooltip, recalc]);

    const rs = box.recordsSummary ?? {};
    const hasCheckedOut = (rs['checked_out'] ?? 0) > 0;
    const hasOverdue = (rs['overdue'] ?? 0) > 0;
    const hasLost = (rs['lost'] ?? 0) > 0;
    const empty = box.count === 0;

    const statusBadgeType = hasLost ? 'lost' : hasOverdue ? 'overdue' : hasCheckedOut ? 'checked_out' : null;

    const statusSummary: { color: string; label: string; count: number }[] = [];
    if (rs['stored']) statusSummary.push({ color: 'var(--crm-success)', label: 'Stored', count: rs['stored'] });
    if (rs['checked_out']) statusSummary.push({ color: 'var(--crm-gold)', label: 'Checked out', count: rs['checked_out'] });
    if (rs['overdue']) statusSummary.push({ color: 'var(--crm-danger)', label: 'Overdue', count: rs['overdue'] });
    if (rs['lost']) statusSummary.push({ color: 'var(--crm-danger)', label: 'Lost', count: rs['lost'] });
    if (rs['returned']) statusSummary.push({ color: 'var(--crm-info)', label: 'Returned', count: rs['returned'] });
    if (rs['ready_to_archive']) statusSummary.push({ color: 'var(--crm-text-muted)', label: 'Ready', count: rs['ready_to_archive'] });

    const statusDotMini: { color: string; count: number }[] = [];
    if (rs['stored'] ?? 0 > 0) statusDotMini.push({ color: 'var(--crm-success)', count: rs['stored'] ?? 0 });
    if (rs['checked_out'] ?? 0 > 0) statusDotMini.push({ color: 'var(--crm-gold)', count: rs['checked_out'] ?? 0 });
    if (rs['overdue'] ?? 0 > 0) statusDotMini.push({ color: 'var(--crm-danger)', count: rs['overdue'] ?? 0 });
    if (rs['lost'] ?? 0 > 0) statusDotMini.push({ color: 'var(--crm-danger)', count: rs['lost'] ?? 0 });
    if (rs['returned'] ?? 0 > 0) statusDotMini.push({ color: 'var(--crm-info)', count: rs['returned'] ?? 0 });

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={onSelect}
                onMouseEnter={!empty ? handleMouseEnter : undefined}
                onMouseLeave={!empty ? handleMouseLeave : undefined}
                className={cn(
                    'group/box relative flex flex-col rounded-lg border transition-all duration-200 select-none w-full',
                    'hover:shadow-xl hover:shadow-black/30 hover:-translate-y-[2px]',
                    isDrawerOpen
                        ? 'ring-2 ring-[var(--crm-gold)]/60 shadow-lg shadow-[var(--crm-gold)]/10 -translate-y-[1px]'
                        : '',
                    isSelected && !isDrawerOpen
                        ? 'ring-1 ring-[var(--crm-border)]'
                        : '',
                    empty
                        ? 'border-dashed border-[var(--crm-border)] bg-[var(--crm-elevated)]/40'
                        : [
                            'border-t-white/[0.10] border-r-white/[0.06]',
                            'border-b-black/[0.15] border-l-white/[0.06]',
                            'bg-gradient-to-b from-white/[0.06] via-white/[0.03] to-white/[0.01]',
                            'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
                        ].join(' '),
                )}
                style={{ aspectRatio: '3 / 4' }}
            >
                {empty ? (
                    <div className="flex flex-col items-center justify-center h-full gap-0.5 text-[var(--crm-text-soft)]/60">
                        <svg viewBox="0 0 24 24" className="size-5 mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7h18" />
                            <line x1="12" y1="3" x2="12" y2="5" />
                        </svg>
                        <span className="text-[8px] opacity-60">{box.code}</span>
                        <span className="text-[8px] mt-0.5 opacity-40">Empty</span>
                    </div>
                ) : (
                    <>
                        <div className="absolute left-1/2 top-[9%] -translate-x-1/2 flex items-center gap-2">
                            <div className="size-[5px] rounded-full border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
                            <div className="size-[5px] rounded-full border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
                        </div>

                        {box.count > 0 && (
                            <div className="absolute left-[20%] right-[20%] top-[14%] flex items-end gap-[1px]">
                                {Array.from({ length: Math.min(box.count, 5) }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'h-1.5 flex-1 rounded-t-[1px]',
                                            i === 0 ? 'bg-white/15' : i === 1 ? 'bg-white/10' : 'bg-white/[0.07]',
                                        )}
                                        style={{
                                            marginTop: i > 0 ? -1 : 0,
                                            height: `${4 + (box.count > 3 ? 3 : box.count) - i * 0.5}px`,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <div className={cn(
                            'absolute inset-x-[10%] top-[20%] bottom-[22%]',
                            'rounded border border-white/[0.08] bg-white/[0.07]',
                            'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.08)]',
                        )}>
                            <div className="flex flex-col items-center justify-center h-full px-1">
                                <span className="text-[10px] font-bold text-[var(--crm-text)]/85 leading-tight tracking-wide">{box.code}</span>
                                <div className="my-1 w-[60%] h-px bg-[var(--crm-border)]" />
                                <div className="flex w-[70%] items-center gap-[2px]">
                                    {[25, 50, 75, 100].map((threshold) => (
                                        <div
                                            key={threshold}
                                            className={cn(
                                                'h-1 flex-1 rounded-sm transition-colors duration-300',
                                                box.fill >= threshold ? getFillColor(box.fill) : 'bg-[var(--crm-elevated)]',
                                            )}
                                        />
                                    ))}
                                </div>
                                <div className="mt-1 flex items-baseline gap-0.5">
                                    <span className="text-[9px] font-semibold tabular-nums text-[var(--crm-text)]/75">{box.count}</span>
                                    <span className="text-[7px] text-[var(--crm-text-soft)]">/ {box.capacity}</span>
                                </div>
                            </div>
                        </div>

                        {statusDotMini.length > 0 && (
                            <div className="absolute inset-x-[15%] bottom-[10%] flex items-center justify-center gap-1">
                                {statusDotMini.map((dot, i) => (
                                    <span
                                        key={i}
                                        className="size-1.5 rounded-full ring-1 ring-[var(--crm-border)]"
                                        style={{ backgroundColor: dot.color }}
                                    />
                                ))}
                            </div>
                        )}

                        {statusBadgeType && (
                            <span className={cn(
                                'absolute right-1.5 top-1.5 rounded-sm border px-1 py-[1px] text-[7px] font-bold uppercase leading-none tracking-wider',
                                STATUS_BADGE[statusBadgeType],
                            )}>
                                {statusBadgeType === 'checked_out' ? 'OUT' : statusBadgeType === 'overdue' ? 'OVR' : 'LST'}
                            </span>
                        )}

                        {box.fill >= 85 && (
                            <span className={cn(
                                'absolute left-1.5 bottom-1.5 rounded-sm border px-1 py-[1px] text-[7px] font-semibold leading-none',
                                box.fill >= 90 ? 'bg-[var(--crm-danger)]/15 text-[var(--crm-danger)] border-[var(--crm-danger)]/25' : 'bg-[var(--crm-gold-2)]/15 text-[var(--crm-gold-2)] border-[var(--crm-gold-2)]/25',
                            )}>
                                {box.fill}%
                            </span>
                        )}

                        <div className="absolute inset-0 rounded-lg bg-white/[0.03] opacity-0 group-hover/box:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </>
                )}
            </button>

            {/* Portal tooltip */}
            {!empty && showTooltip && pos && createPortal(
                <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="fixed z-[9999]"
                    style={{
                        top: pos.top - 12,
                        left: pos.left + pos.width / 2,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className={cn(
                        'w-44 rounded-lg border bg-[var(--crm-elevated)] border-[var(--crm-border)]',
                        'shadow-xl shadow-black/40 px-3 py-2.5',
                    )}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-bold text-[var(--crm-text)]">{box.code}</span>
                            <span className={cn(
                                'text-[9px] font-medium tabular-nums',
                                box.fill >= 90 ? 'text-[var(--crm-danger)]' : box.fill >= 70 ? 'text-[var(--crm-gold)]' : box.fill >= 30 ? 'text-[var(--crm-success)]' : 'text-[var(--crm-text-soft)]',
                            )}>
                                {box.fill}%
                            </span>
                        </div>

                        <div className="mb-2">
                            <div className="flex h-1.5 rounded-full bg-[var(--crm-surface)] overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all',
                                        box.fill >= 90 ? 'bg-[var(--crm-danger)]' : box.fill >= 70 ? 'bg-[var(--crm-gold)]' : 'bg-[var(--crm-success)]',
                                    )}
                                    style={{ width: `${box.fill}%` }}
                                />
                            </div>
                            <div className="mt-0.5 flex justify-between text-[9px] text-[var(--crm-text-soft)]">
                                <span>{box.count} used</span>
                                <span>{box.capacity - box.count} free</span>
                            </div>
                        </div>

                        {statusSummary.length > 0 && (
                            <div className="space-y-1 pt-1.5 border-t border-[var(--crm-border)]">
                                {statusSummary.map((s) => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                            <span className="text-[9px] text-[var(--crm-text-muted)]">{s.label}</span>
                                        </div>
                                        <span className="text-[9px] font-medium tabular-nums text-[var(--crm-text)]">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-1.5 pt-1.5 border-t border-[var(--crm-border)]">
                            <div className="text-[9px] text-[var(--crm-text-soft)]">Click to open</div>
                        </div>
                    </div>

                    <div
                        className="absolute size-2 rotate-45 bg-[var(--crm-elevated)] border-r border-b border-[var(--crm-border)]"
                        style={{ bottom: -5, left: '50%', marginLeft: -4 }}
                    />
                </div>,
                document.body,
            )}
        </div>
    );
}
