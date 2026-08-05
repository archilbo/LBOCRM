import { IconPlus, IconArrowRotaryFirstLeft } from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import { AppCompactTabs } from '@/components/ui/AppCompactTabs';
import type { FinanceDocumentType } from '@/features/finance/types';

const tabs = [
    { id: 'quote', label: 'Devis' },
    { id: 'invoice', label: 'Facture' },
    { id: 'receipt', label: 'Recu' },
];

export function TemplateToolbar({ selectedType, onTypeChange, onCreate, onResetDefault, children }: { selectedType: FinanceDocumentType; onTypeChange: (type: FinanceDocumentType) => void; onCreate: () => void; onResetDefault: () => void; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    <AppButton variant="primary" onPress={onCreate}><IconPlus size={16} /> Nouveau template</AppButton>
                    <AppButton variant="secondary" onPress={onResetDefault}><IconArrowRotaryFirstLeft size={16} /> Reset defaut</AppButton>
                </div>
            </div>
            <AppCompactTabs tabs={tabs} selectedKey={selectedType} onSelectionChange={(key) => onTypeChange(String(key) as FinanceDocumentType)}>
                {children}
            </AppCompactTabs>
        </div>
    );
}
