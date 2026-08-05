import { IconBuilding, IconCalendarClock, IconBuildingBank, IconPercentage, IconSettings2 } from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import type { FinanceSettings } from '@/features/finance/types';

type Props = {
    settings: FinanceSettings;
    settingsUrl: string;
    onOpen: (url: string) => void;
    canManage?: boolean;
};

export function FinanceSettingsSummary({ settings, settingsUrl, onOpen, canManage = false }: Props) {
    const items = [
        { label: 'Devise', value: settings.defaultCurrency, icon: IconBuildingBank },
        { label: 'TVA par defaut', value: `${settings.defaultTvaRate}%`, icon: IconPercentage },
        { label: 'Delai de paiement', value: `${settings.defaultPaymentTermsDays} jours`, icon: IconCalendarClock },
        { label: 'Validite des devis', value: `${settings.defaultQuoteValidityDays} jours`, icon: IconBuilding },
    ];

    return (
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <header className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-[var(--text)]">Configuration finance</h2>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">Regles utilisees lors de la creation et du calcul des documents.</p>
                </div>
                {canManage ? (
                    <AppButton size="sm" variant="ghost" className="bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)]" onPress={() => onOpen(settingsUrl)}>
                        <IconSettings2 size={14} />
                        Configurer
                    </AppButton>
                ) : null}
            </header>
            <div className="grid divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="flex items-center gap-3 px-4 py-4">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]"><Icon size={16} /></div>
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{item.label}</p>
                                <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">{item.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
