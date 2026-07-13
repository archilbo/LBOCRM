import type { FinanceDocumentItem } from '@/features/finance/types';

export function normalizeNumber(value: unknown): number {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
        const normalized = value.replace(',', '.').trim();
        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

export function calculateItem(
    item: Partial<FinanceDocumentItem>,
): FinanceDocumentItem {
    const quantity = normalizeNumber(item.quantity || 1) || 1;
    const unitPrice = normalizeNumber(item.unitPrice);

    const totalHt = Math.max(0, quantity * unitPrice);

    return {
        id: item.id,
        position: item.position || 1,
        title: item.title || '',
        description: item.description || '',
        quantity,
        unit: item.unit || '',
        unitPrice,
        totalHt,
        totalTva: 0,
        totalTtc: totalHt,
    };
}

export function calculateTotals(
    items: Partial<FinanceDocumentItem>[],
    discountTotal = 0,
) {
    const calculatedItems = items.map((item, index) => calculateItem({ ...item, position: index + 1 }));
    const subtotalHt = calculatedItems.reduce((sum, item) => sum + item.totalHt, 0);
    const taxTotal = calculatedItems.reduce((sum, item) => sum + item.totalTva, 0);
    const safeDiscount = Math.max(0, normalizeNumber(discountTotal));
    const totalTtc = Math.max(0, subtotalHt - safeDiscount + taxTotal);

    return {
        subtotalHt,
        discountTotal: safeDiscount,
        taxTotal,
        totalTtc,
        items: calculatedItems,
    };
}

export function createEmptyItem(): FinanceDocumentItem {
    return calculateItem({
        position: 1,
        title: '',
        description: '',
        quantity: 1,
        unit: 'm2',
        unitPrice: 0,
    });
}

export type AgingBucket = {
    label: string;
    minDays: number;
    maxDays: number;
    total: number;
    count: number;
};

export function calculateAgingBuckets(documents: { dueDate: string | null; remainingTotal: number }[]): AgingBucket[] {
    const now = new Date();
    const buckets: AgingBucket[] = [
        { label: '0-30 jours', minDays: 0, maxDays: 30, total: 0, count: 0 },
        { label: '30-60 jours', minDays: 30, maxDays: 60, total: 0, count: 0 },
        { label: '60-90 jours', minDays: 60, maxDays: 90, total: 0, count: 0 },
        { label: '90+ jours', minDays: 90, maxDays: Infinity, total: 0, count: 0 },
    ];

    for (const doc of documents) {
        if (!doc.dueDate || doc.remainingTotal <= 0) continue;
        const due = new Date(doc.dueDate);
        if (Number.isNaN(due.getTime())) continue;
        const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOverdue <= 0) continue;

        const bucket = buckets.find((b) => daysOverdue >= b.minDays && daysOverdue < b.maxDays)
            ?? buckets[buckets.length - 1];
        bucket.total += doc.remainingTotal;
        bucket.count += 1;
    }

    return buckets;
}

export function normalizeCurrency(currency: unknown): string {
    if (typeof currency !== 'string') {
        return 'MAD';
    }

    const normalized = currency.trim().toUpperCase();

    return /^[A-Z]{3}$/.test(normalized) ? normalized : 'MAD';
}

export function formatMoney(value: unknown, currency = 'MAD'): string {
    const safeCurrency = normalizeCurrency(currency);

    try {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: safeCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(normalizeNumber(value));
    } catch {
        return `${normalizeNumber(value).toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} MAD`;
    }
}

