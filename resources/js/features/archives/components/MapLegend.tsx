export function MapLegend() {
    const items = [
        { label: 'Empty', className: 'border-dashed border-white/10' },
        { label: '1–30%', className: 'border-emerald-500/40 bg-emerald-500/[0.06]' },
        { label: '31–60%', className: 'border-amber-500/40 bg-amber-500/[0.06]' },
        { label: '61–90%', className: 'border-orange-500/40 bg-orange-500/[0.06]' },
        { label: '91–100%', className: 'border-red-500/40 bg-red-500/[0.06]' },
    ];

    const badges = [
        { label: 'OUT', className: 'bg-amber-400/20 text-amber-300' },
        { label: 'OVR', className: 'bg-red-400/20 text-red-300' },
        { label: 'LST', className: 'bg-red-500/30 text-red-300' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2">
            <span className="text-[9px] font-medium uppercase tracking-wider text-white/40">Fill</span>
            {items.map((item) => (
                <span key={item.label} className={`inline-block rounded border px-2 py-[1px] text-[9px] text-white/50 ${item.className}`}>
                    {item.label}
                </span>
            ))}
            <span className="ml-2 text-[9px] font-medium uppercase tracking-wider text-white/40">Status</span>
            {badges.map((badge) => (
                <span key={badge.label} className={`inline-block rounded px-1.5 py-[1px] text-[9px] font-semibold uppercase leading-none ${badge.className}`}>
                    {badge.label}
                </span>
            ))}
        </div>
    );
}
