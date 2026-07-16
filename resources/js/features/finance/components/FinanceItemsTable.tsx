import { Copy, Plus, Trash2 } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import type { FinanceDocumentItem } from '@/features/finance/types';
import { calculateItem, formatCompactMoney, normalizeNumber } from '@/features/finance/utils/calculations';

type FinanceItemsTableProps = {
    items: FinanceDocumentItem[];
    currency: string;
    onChange: (items: FinanceDocumentItem[]) => void;
};

export function FinanceItemsTable({ items, currency, onChange }: FinanceItemsTableProps) {
    function updateItem(index: number, field: keyof FinanceDocumentItem, value: string) {
        const next = items.map((item, itemIndex) => {
            if (itemIndex !== index) {
                return item;
            }

            const nextValue = ['quantity', 'unitPrice'].includes(field)
                ? normalizeNumber(value)
                : value;

            return calculateItem({ ...item, [field]: nextValue });
        });

        onChange(next.map((item, position) => ({ ...item, position: position + 1 })));
    }

    function addItem() {
        onChange([
            ...items,
            calculateItem({ position: items.length + 1, quantity: 1, unitPrice: 0 }),
        ]);
    }

    function duplicateItem(index: number) {
        const item = items[index];
        const next = [...items];
        next.splice(index + 1, 0, calculateItem({ ...item, id: undefined, position: index + 2 }));
        onChange(next.map((row, position) => ({ ...row, position: position + 1 })));
    }

    function deleteItem(index: number) {
        if (items.length === 1) {
            return;
        }

        onChange(items.filter((_, itemIndex) => itemIndex !== index).map((item, position) => ({ ...item, position: position + 1 })));
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">Lignes du document</h3>
                    <p className="text-xs text-[var(--text-muted)]">Les totaux sont recalcules en direct.</p>
                </div>
                <AppButton variant="secondary" size="sm" onPress={addItem}>
                    <Plus size={14} />
                    Ajouter
                </AppButton>
            </div>

            <div className="app-scrollbar overflow-x-auto rounded-2xl border">
                <table className="min-w-[980px] w-full text-left text-sm">
                    <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
                        <tr>
                            <th className="px-3 py-2">Titre</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2">Qt</th>
                            <th className="px-3 py-2">Unite</th>
                            <th className="px-3 py-2">Prix HT</th>
                            <th className="px-3 py-2 text-right">Total TTC</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={`${item.id || 'new'}-${index}`} className="border-t align-top">
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 min-w-36" value={item.title} onChange={(event) => updateItem(index, 'title', event.target.value)} placeholder="Etude architecture" />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 min-w-56" value={item.description || ''} onChange={(event) => updateItem(index, 'description', event.target.value)} placeholder="Description" />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-20" type="number" min="0" step="0.001" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-20" value={item.unit || ''} onChange={(event) => updateItem(index, 'unit', event.target.value)} placeholder="m2" />
                                </td>
                                <td className="px-3 py-2">
                                    <input className="react-aria-Input h-9 w-28" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} />
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                                    {formatCompactMoney(item.totalTtc, currency)}
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex justify-end gap-1">
                                        <AppButton variant="ghost" size="sm" onPress={() => duplicateItem(index)} aria-label="Dupliquer">
                                            <Copy size={13} />
                                        </AppButton>
                                        <AppButton variant="ghost" size="sm" onPress={() => deleteItem(index)} isDisabled={items.length === 1} aria-label="Supprimer">
                                            <Trash2 size={13} />
                                        </AppButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
