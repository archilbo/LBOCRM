import { AppButton } from '@/components/ui/AppButton';
import { drawerStyles } from '@/components/drawers';
import { useTranslation } from '@/lib/i18n';

type Props = {
    value: number | null;
    onChange: (v: number | null) => void;
};

type ReminderOption = { value: number | null; tKey: string; count?: number };

const OPTIONS: ReminderOption[] = [
    { value: null, tKey: 'calendar.reminderOptions.none' },
    { value: 0, tKey: 'calendar.reminderOptions.atTime' },
    { value: 5, tKey: 'calendar.reminderOptions.minutes', count: 5 },
    { value: 15, tKey: 'calendar.reminderOptions.minutes', count: 15 },
    { value: 60, tKey: 'calendar.reminderOptions.hour' },
    { value: 180, tKey: 'calendar.reminderOptions.hours', count: 3 },
    { value: 1440, tKey: 'calendar.reminderOptions.day' },
];

export function CalendarReminderForm({ value, onChange }: Props) {
    const { t } = useTranslation();
    return (
        <div className={drawerStyles.sectionGrid}>
            <div className="flex flex-wrap gap-1.5">
                {OPTIONS.map((opt) => (
                    <AppButton key={String(opt.value)} type="button" variant="toolbar" compact onPress={() => onChange(opt.value)}
                        className={`h-auto min-h-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition ${value === opt.value ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}>
                        {opt.count !== undefined ? t(opt.tKey, { count: opt.count }) : t(opt.tKey)}
                    </AppButton>
                ))}
            </div>
        </div>
    );
}
