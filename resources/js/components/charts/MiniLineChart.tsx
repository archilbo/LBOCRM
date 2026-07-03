import type { MonthlyCount } from '@/features/intermediaries/types';

function fillMonthlyData(data: MonthlyCount[], monthsBack = 12): MonthlyCount[] {
    const result: MonthlyCount[] = [];
    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const existing = data.find((m) => m.month === month);
        result.push({ month, count: existing?.count ?? 0 });
    }
    return result;
}

export function MiniLineChart({ data, color = 'var(--accent)', height = 200 }: { data: MonthlyCount[]; color?: string; height?: number }) {
    const filled = fillMonthlyData(data, 12);
    const max = Math.max(1, ...filled.map((d) => d.count));
    const width = 600;
    const padding = { top: 20, right: 10, bottom: 30, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = filled.map((d, i) => {
        const x = padding.left + (i / Math.max(filled.length - 1, 1)) * chartW;
        const y = padding.top + chartH - (d.count / max) * chartH;
        return `${x},${y}`;
    });

    const areaPoints = `${points.join(' ')} ${padding.left + chartW},${padding.top + chartH} ${padding.left},${padding.top + chartH}`;
    const monthLabels = filled.filter((_, i) => i % 2 === 0 || i === filled.length - 1);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
            <defs>
                <linearGradient id={`grad-${color.replace(/\W/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const y = padding.top + chartH - f * chartH;
                return (
                    <g key={f}>
                        <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y}
                            stroke="var(--border)" strokeWidth="0.5" />
                        <text x={padding.left - 6} y={y + 3} textAnchor="end"
                            fill="var(--text-subtle)" fontSize="9">{Math.round(max * (1 - f))}</text>
                    </g>
                );
            })}
            {filled.some((d) => d.count > 0) && (
                <polygon points={areaPoints} fill={`url(#grad-${color.replace(/\W/g, '')})`} />
            )}
            {filled.some((d) => d.count > 0) && (
                <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
            )}
            {filled.map((d, i) => {
                if (d.count === 0) return null;
                const x = padding.left + (i / Math.max(filled.length - 1, 1)) * chartW;
                const y = padding.top + chartH - (d.count / max) * chartH;
                return <circle key={i} cx={x} cy={y} r="2.5" fill={color} stroke="var(--surface)" strokeWidth="1" />;
            })}
            {monthLabels.map((d) => {
                const i = filled.findIndex((f) => f.month === d.month);
                const x = padding.left + (i / Math.max(filled.length - 1, 1)) * chartW;
                const label = d.month.slice(5);
                return <text key={d.month} x={x} y={height - 5} textAnchor="middle"
                    fill="var(--text-subtle)" fontSize="8">{label}</text>;
            })}
        </svg>
    );
}
