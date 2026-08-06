export function MapLegend() {
    const items = [
        { label: 'Empty', className: 'border-dashed border-[var(--crm-border)]' },
        { label: '1–30%', className: 'border-[var(--crm-success)]/40 bg-[var(--crm-success-soft)]' },
        { label: '31–60%', className: 'border-[var(--crm-gold)]/40 bg-[var(--crm-gold-soft)]' },
        { label: '61–90%', className: 'border-[var(--crm-gold-2)]/40 bg-[var(--crm-gold-2)]/10' },
        { label: '91–100%', className: 'border-[var(--crm-danger)]/40 bg-[var(--crm-danger-soft)]' },
    ];

    const badges = [
        { label: 'OUT', className: 'bg-[var(--crm-gold)]/20 text-[var(--crm-gold)]' },
        { label: 'OVR', className: 'bg-[var(--crm-danger)]/20 text-[var(--crm-danger)]' },
        { label: 'LST', className: 'bg-[var(--crm-danger)]/30 text-[var(--crm-danger)]' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2">
            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--crm-text-soft)]">Fill</span>
            {items.map((item) => (
                <span key={item.label} className={`inline-block rounded border px-2 py-[1px] text-[9px] text-[var(--crm-text-muted)] ${item.className}`}>
                    {item.label}
                </span>
            ))}
            <span className="ml-2 text-[9px] font-medium uppercase tracking-wider text-[var(--crm-text-soft)]">Status</span>
            {badges.map((badge) => (
                <span key={badge.label} className={`inline-block rounded px-1.5 py-[1px] text-[9px] font-semibold uppercase leading-none ${badge.className}`}>
                    {badge.label}
                </span>
            ))}
        </div>
    );
}
