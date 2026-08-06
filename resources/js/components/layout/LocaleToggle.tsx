import { useTranslation, type AppLocale } from '@/lib/i18n';
import { cn } from '@/lib/cn';

const OPTIONS: { code: AppLocale; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
];

export function LocaleToggle() {
    const { locale, setLocale } = useTranslation();

    return (
        <div
            role="group"
            aria-label="Language"
            className="flex h-8 items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 p-0.5"
        >
            {OPTIONS.map((option) => {
                const active = locale === option.code;
                return (
                    <button
                        key={option.code}
                        type="button"
                        onClick={() => setLocale(option.code)}
                        aria-label={option.code === 'fr' ? 'Français' : 'English'}
                        aria-pressed={active}
                        className={cn(
                            'flex h-6 min-w-8 items-center justify-center rounded-md px-1.5 text-[10px] font-bold tracking-wide transition',
                            active
                                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
