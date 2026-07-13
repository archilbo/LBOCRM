import type { ReactNode } from 'react';
import { AppCompactTabs } from '@/components/ui/AppCompactTabs';

export const financeTabs = [
    { id: 'overview', label: 'Vue generale' },
    { id: 'quotes', label: 'Devis' },
    { id: 'invoices', label: 'Factures' },
    { id: 'payments', label: 'Paiements' },
    { id: 'expenses', label: 'Depenses' },
    { id: 'monthly', label: 'Mensuel' },
    { id: 'templates', label: 'Templates' },
    { id: 'settings', label: 'Parametres' },
];

type FinanceTabsProps = {
    selectedKey: string;
    onSelectionChange: (key: string) => void;
    children: ReactNode;
};

export function FinanceTabs({ selectedKey, onSelectionChange, children }: FinanceTabsProps) {
    return (
        <AppCompactTabs
            tabs={financeTabs}
            selectedKey={selectedKey}
            onSelectionChange={(key) => onSelectionChange(String(key))}
        >
            {children}
        </AppCompactTabs>
    );
}

