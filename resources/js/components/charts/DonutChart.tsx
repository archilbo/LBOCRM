import type { StatusCount } from '@/features/intermediaries/types';

export function DonutChart({ data, colorMap, size = 120 }: { data: StatusCount[]; colorMap: Record<string, string>; size?: number }) {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <p className="text-[10px] text-[var(--text-subtle)]">No data</p>
            </div>
        );
    }
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;
    const strokeWidth = size * 0.12;

    const segments = data.reduce<Array<StatusCount & { startAngle: number; endAngle: number; pct: number }>>((items, d) => {
        const pct = d.count / total;
        const startAngle = (items.at(-1)?.endAngle ?? 0);
        return [...items, { ...d, startAngle, endAngle: startAngle + (pct * 360), pct }];
    }, []);

    function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
        const angleRad = ((angleDeg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((seg, i) => {
                const start = polarToCartesian(cx, cy, r, seg.startAngle);
                const end = polarToCartesian(cx, cy, r, seg.endAngle);
                const largeArc = seg.pct > 0.5 ? 1 : 0;
                const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
                return (
                    <path key={i} d={d} fill="none" stroke={colorMap[seg.status] || 'var(--border)'}
                        strokeWidth={strokeWidth} strokeLinecap="round" />
                );
            })}
            <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--foreground)"
                fontSize="14" fontWeight="600">{total}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-subtle)"
                fontSize="8">Total</text>
        </svg>
    );
}
