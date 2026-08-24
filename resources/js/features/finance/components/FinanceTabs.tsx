import { AppWorkspaceTabs, type AppWorkspaceTab } from '@/components/ui/AppWorkspaceTabs';
import { IconChartBar, IconCalendarDue, IconCash, IconFileText, IconLayoutDashboard, IconReceipt2, IconSettings2, IconShoppingCart, IconWallet } from '@tabler/icons-react';

import type { ReactNode } from 'react';

export const financeTabs: AppWorkspaceTab[] = [
    { id: 'overview', label: 'Vue generale', icon: IconLayoutDashboard },
    { id: 'quotes', label: 'Devis', icon: IconFileText },
    { id: 'invoices', label: 'Factures', icon: IconReceipt2 },
    { id: 'collections', label: 'À encaisser', icon: IconCash },
    { id: 'payments', label: 'Paiements', icon: IconWallet },
    { id: 'expenses', label: 'Depenses', icon: IconShoppingCart },
    { id: 'monthly', label: 'Mensuel', icon: IconCalendarDue },
    { id: 'templates', label: 'Templates', icon: IconChartBar },
    { id: 'settings', label: 'Parametres', icon: IconSettings2 },
];

type FinanceTabsProps = {
    selectedKey: string;
    onSelectionChange: (key: string) => void;
    counts?: Partial<Record<string, number>>;
    visibleTabIds?: string[];
    children: ReactNode;
};

export function FinanceTabs({ visibleTabIds, ...props }: FinanceTabsProps) {
    const tabs = visibleTabIds
        ? financeTabs.filter((tab) => visibleTabIds.includes(tab.id))
        : financeTabs;

    return <AppWorkspaceTabs tabs={tabs} {...props} />;
}
