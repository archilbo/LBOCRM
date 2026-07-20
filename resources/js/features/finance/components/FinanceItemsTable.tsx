import { Copy, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@heroui/react';
import { AppInput } from '@/components/ui/AppInput';
import type { FinanceDocumentItem } from '@/features/finance/types';
import { calculateItem, formatCompactMoney, normalizeNumber } from '@/features/finance/utils/calculations';

const compactInput = 'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';

type FinanceItemsTableProps = {
    items: FinanceDocumentItem[];
    currency: string;
    onChange: (items: FinanceDocumentItem[]) => void;
    disabled?: boolean;
};

export function FinanceItemsTable({ items, currency, onChange, disabled = false }: FinanceItemsTableProps) {
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
                    <div className="flex items-center gap-1.5 mb-2"><FileText size={13} className="text-[var(--text-subtle)]" /><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">Lignes du document</p></div>
                    <p className="text-xs text-[var(--text-muted)]">Les totaux sont recalcules en direct.</p>
                </div>
                <Button variant="secondary" size="sm" onPress={addItem} isDisabled={disabled}>
                    <Plus size={14} />
                    Ajouter
                </Button>
            </div>

            <div className="finance-table-shell app-scrollbar rounded-[var(--radius-md)] border">
                <table className="finance-table min-w-[980px] text-left text-sm">
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
                                <td className="px-3 py-2 min-w-36">
                                    <AppInput isDisabled={disabled} className={compactInput} value={item.title || ''} onChange={(value) => updateItem(index, 'title', value)} placeholder="Etude architecture" />
                                </td>
                                <td className="px-3 py-2 min-w-48">
                                    <AppInput isDisabled={disabled} className={compactInput} value={item.description || ''} onChange={(value) => updateItem(index, 'description', value)} placeholder="Description" />
                                </td>
                                <td className="px-3 py-2 w-16">
                                    <AppInput isDisabled={disabled} className={compactInput} type="number" min={0} step={0.001} value={String(item.quantity)} onChange={(value) => updateItem(index, 'quantity', value)} />
                                </td>
                                <td className="px-3 py-2 w-16">
                                    <AppInput isDisabled={disabled} className={compactInput} value={item.unit || ''} onChange={(value) => updateItem(index, 'unit', value)} placeholder="m2" />
                                </td>
                                <td className="px-3 py-2 w-28">
                                    <AppInput isDisabled={disabled} className={compactInput} type="number" min={0} step={0.01} value={String(item.unitPrice)} onChange={(value) => updateItem(index, 'unitPrice', value)} />
                                </td>
                                <td className="px-3 py-2 w-28 text-right font-mono text-xs font-semibold">
                                    {formatCompactMoney(item.totalTtc, currency)}
                                </td>
                                <td className="px-3 py-2 w-16">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" onPress={() => duplicateItem(index)} isDisabled={disabled} aria-label="Dupliquer">
                                            <Copy size={13} />
                                        </Button>
                                        <Button variant="ghost" size="sm" onPress={() => deleteItem(index)} isDisabled={disabled || items.length === 1} aria-label="Supprimer">
                                            <Trash2 size={13} />
                                        </Button>
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
