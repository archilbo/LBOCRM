import { IconCopy, IconFileText, IconPlus, IconTrash } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { Button, ScrollShadow } from '@heroui/react';
import { AppInput } from '@/components/ui/AppInput';
import type { FinanceDocumentItem } from '@/features/finance/types';
import { calculateItem, formatCompactMoney, normalizeNumber } from '@/features/finance/utils/calculations';
import { FinanceRowActions } from '@/features/finance/components/FinanceRowActions';
import { AppPagination } from '@/components/ui/AppPagination';
import { useFinanceTablePagination } from '@/features/finance/components/useFinanceTablePagination';

const compactInput = 'h-8 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]';

const lineColumns = [
    { id: 'title', label: 'Titre', width: 170 },
    { id: 'description', label: 'Description', width: 210 },
    { id: 'quantity', label: 'Qt', width: 85 },
    { id: 'unit', label: 'Unite', width: 95 },
    { id: 'unitPrice', label: 'Prix HT', width: 130 },
    { id: 'totalTtc', label: 'Total TTC', width: 130 },
    { id: 'actions', label: 'Actions', width: 70 },
] as const;

type FinanceItemsTableProps = {
    items: FinanceDocumentItem[];
    currency: string;
    onChange: (items: FinanceDocumentItem[]) => void;
    disabled?: boolean;
};

export function FinanceItemsTable({ items, currency, onChange, disabled = false }: FinanceItemsTableProps) {
    const pagination = useFinanceTablePagination(items);
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
        const nextItems = [
            ...items,
            calculateItem({ position: items.length + 1, quantity: 1, unitPrice: 0 }),
        ];
        onChange(nextItems);
        pagination.goToLastPage(nextItems.length);
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
                    <div className="flex items-center gap-1.5 mb-2"><IconFileText size={13} className="text-[var(--text-subtle)]" /><p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">Lignes du document</p></div>
                    <p className="text-xs text-[var(--text-muted)]">Les totaux sont recalcules en direct.</p>
                </div>
                <Button variant="secondary" size="sm" onPress={addItem} isDisabled={disabled}>
                    <IconPlus size={14} />
                    Ajouter
                </Button>
            </div>

            <div className="hidden rounded-[var(--radius-md)] border md:block">
                <ScrollShadow orientation="horizontal" className="finance-table-shell app-scrollbar w-full" size={16}>
                    <table className="finance-table min-w-[890px] table-fixed text-left text-sm">
                        <colgroup>
                            {lineColumns.map((column) => <col key={column.id} style={{ width: `${column.width}px` }} />)}
                        </colgroup>
                        <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
                            <tr>
                                {lineColumns.map((column) => <th key={column.id} className={column.id === 'totalTtc' ? 'px-3 py-2 text-right' : column.id === 'actions' ? 'px-3 py-2 text-center' : 'px-3 py-2'}>{column.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                        {pagination.paginatedRows.map((item, pageIndex) => {
                            const index = pagination.startIndex + pageIndex;
                            return (
                            <tr key={`${item.id || 'new'}-${index}`} className="border-t align-top">
                                <td className="px-3 py-2">
                                    <AppInput isDisabled={disabled} className={compactInput} value={item.title || ''} onChange={(value) => updateItem(index, 'title', value)} placeholder="Etude architecture" />
                                </td>
                                <td className="px-3 py-2">
                                    <AppInput isDisabled={disabled} className={compactInput} value={item.description || ''} onChange={(value) => updateItem(index, 'description', value)} placeholder="Description" />
                                </td>
                                <td className="px-3 py-2">
                                    <AppInput isDisabled={disabled} className={compactInput} type="number" min={0} step={0.001} value={String(item.quantity)} onChange={(value) => updateItem(index, 'quantity', value)} />
                                </td>
                                <td className="px-3 py-2">
                                    <AppInput isDisabled={disabled} className={compactInput} value={item.unit || ''} onChange={(value) => updateItem(index, 'unit', value)} placeholder="m2" />
                                </td>
                                <td className="px-3 py-2">
                                    <AppInput isDisabled={disabled} className={compactInput} type="number" min={0} step={0.01} value={String(item.unitPrice)} onChange={(value) => updateItem(index, 'unitPrice', value)} />
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-xs font-semibold whitespace-nowrap">
                                    {formatCompactMoney(item.totalTtc, currency)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <FinanceRowActions className="inline-flex" actions={[
                                        { id: `duplicate-${index}`, label: 'Dupliquer la ligne', icon: <IconCopy size={13} />, onPress: () => duplicateItem(index), isDisabled: disabled },
                                        { id: `delete-${index}`, label: 'Supprimer la ligne', icon: <IconTrash size={13} />, onPress: () => deleteItem(index), isDisabled: disabled || items.length === 1, tone: 'danger' },
                                    ]} />
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </ScrollShadow>
                <AppPagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={pagination.setPage} variant="reference" />
            </div>

            <div className="space-y-2 md:hidden">
                {pagination.paginatedRows.map((item, pageIndex) => {
                    const index = pagination.startIndex + pageIndex;
                    return (
                        <div key={`${item.id || 'new'}-${index}`} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Ligne {index + 1}</p>
                            <div className="space-y-2">
                                <MobileField label="Titre"><AppInput isDisabled={disabled} className={compactInput} value={item.title || ''} onChange={(value) => updateItem(index, 'title', value)} placeholder="Etude architecture" /></MobileField>
                                <MobileField label="Description"><AppInput isDisabled={disabled} className={compactInput} value={item.description || ''} onChange={(value) => updateItem(index, 'description', value)} placeholder="Description" /></MobileField>
                                <div className="grid grid-cols-2 gap-2"><MobileField label="Qt"><AppInput isDisabled={disabled} className={compactInput} type="number" min={0} step={0.001} value={String(item.quantity)} onChange={(value) => updateItem(index, 'quantity', value)} /></MobileField><MobileField label="Unite"><AppInput isDisabled={disabled} className={compactInput} value={item.unit || ''} onChange={(value) => updateItem(index, 'unit', value)} placeholder="m2" /></MobileField></div>
                                <div className="grid grid-cols-2 gap-2"><MobileField label="Prix HT"><AppInput isDisabled={disabled} className={compactInput} type="number" min={0} step={0.01} value={String(item.unitPrice)} onChange={(value) => updateItem(index, 'unitPrice', value)} /></MobileField><MobileField label="Total TTC"><p className="flex h-8 items-center justify-end rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 font-mono text-xs font-semibold text-[var(--foreground)]">{formatCompactMoney(item.totalTtc, currency)}</p></MobileField></div>
                                <div className="flex justify-end pt-1"><FinanceRowActions actions={[{ id: `duplicate-${index}`, label: 'Dupliquer la ligne', icon: <IconCopy size={13} />, onPress: () => duplicateItem(index), isDisabled: disabled }, { id: `delete-${index}`, label: 'Supprimer la ligne', icon: <IconTrash size={13} />, onPress: () => deleteItem(index), isDisabled: disabled || items.length === 1, tone: 'danger' }]} /></div>
                            </div>
                        </div>
                    );
                })}
                <AppPagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onChange={pagination.setPage} variant="reference" />
            </div>
        </div>
    );
}

function MobileField({ label, children }: { label: string; children: ReactNode }) {
    return <label className="flex min-w-0 flex-col gap-1 text-[10px] font-medium text-[var(--text-muted)]"><span>{label}</span>{children}</label>;
}
