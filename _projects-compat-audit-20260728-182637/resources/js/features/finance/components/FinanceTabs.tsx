import { AppWorkspaceTabs, type AppWorkspaceTab } from '@/components/ui/AppWorkspaceTabs';
import { BarChart3, CalendarRange, FileText, LayoutDashboard, ReceiptText, Settings2, ShoppingCart, WalletCards } from 'lucide-react';
import type { ReactNode } from 'react';

export const financeTabs: AppWorkspaceTab[] = [
    { id: 'overview', label: 'Vue generale', icon: LayoutDashboard },
    { id: 'quotes', label: 'Devis', icon: FileText },
    { id: 'invoices', label: 'Factures', icon: ReceiptText },
    { id: 'payments', label: 'Paiements', icon: WalletCards },
    { id: 'expenses', label: 'Depenses', icon: ShoppingCart },
    { id: 'monthly', label: 'Mensuel', icon: CalendarRange },
    { id: 'templates', label: 'Templates', icon: BarChart3 },
    { id: 'settings', label: 'Parametres', icon: Settings2 },
];

type FinanceTabsProps = {
    selectedKey: string;
    onSelectionChange: (key: string) => void;
    counts?: Partial<Record<string, number>>;
    children: ReactNode;
};

export function FinanceTabs(props: FinanceTabsProps) {
    return <AppWorkspaceTabs tabs={financeTabs} {...props} />;
}

