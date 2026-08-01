import { drawerStyles } from '@/components/drawers';

type Props = {
    value: number | null;
    onChange: (v: number | null) => void;
};

const OPTIONS = [
    { value: null, label: 'No reminder' },
    { value: 0, label: 'At event time' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 180, label: '3 hours before' },
    { value: 1440, label: '1 day before' },
];

export function CalendarReminderForm({ value, onChange }: Props) {
    return (
        <div className={drawerStyles.sectionGrid}>
            <div className="flex flex-wrap gap-1.5">
                {OPTIONS.map((opt) => (
                    <button key={String(opt.value)} type="button" onClick={() => onChange(opt.value)}
                        className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition ${value === opt.value ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
