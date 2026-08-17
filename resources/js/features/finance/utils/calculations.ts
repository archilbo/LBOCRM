import type { FinanceDocumentItem } from '@/features/finance/types';
import {
    normalizeNumber,
    normalizeCurrency,
    formatMoney,
    formatCompactMoney,
    formatFullMoney,
} from '@/lib/currency';

export { normalizeNumber, normalizeCurrency, formatMoney, formatCompactMoney, formatFullMoney };

function roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeTvaRate(value: number | string | null | undefined): number {
    return Math.min(100, Math.max(0, normalizeNumber(value)));
}

export function calculateItem(
    item: Partial<FinanceDocumentItem>,
    tvaRate = 0,
): FinanceDocumentItem {
    const quantity = normalizeNumber(item.quantity || 1) || 1;
    const unitPrice = normalizeNumber(item.unitPrice);

    const totalHt = roundMoney(Math.max(0, quantity * unitPrice));
    const totalTva = roundMoney(totalHt * normalizeTvaRate(tvaRate) / 100);

    return {
        id: item.id,
        position: item.position || 1,
        title: item.title || '',
        description: item.description || '',
        quantity,
        unit: item.unit || '',
        unitPrice,
        totalHt,
        totalTva,
        totalTtc: roundMoney(totalHt + totalTva),
    };
}

export function calculateTotals(
    items: Partial<FinanceDocumentItem>[],
    discountTotal = 0,
    tvaRate = 0,
) {
    const calculatedItems = items.map((item, index) => calculateItem({ ...item, position: index + 1 }, tvaRate));
    const subtotalHt = roundMoney(calculatedItems.reduce((sum, item) => sum + item.totalHt, 0));
    const taxTotal = roundMoney(calculatedItems.reduce((sum, item) => sum + item.totalTva, 0));
    const safeDiscount = roundMoney(Math.max(0, normalizeNumber(discountTotal)));
    const totalTtc = roundMoney(Math.max(0, subtotalHt - safeDiscount + taxTotal));

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

export type MetricSemantic = 'revenue' | 'expense' | 'overdue';

export function getTrendColor(metricType: MetricSemantic, percentChange: number): 'green' | 'red' {
    const isIncrease = percentChange > 0;
    if (metricType === 'expense' || metricType === 'overdue') {
        return isIncrease ? 'red' : 'green';
    }
    return isIncrease ? 'green' : 'red';
}

export function getTrendHex(metricType: MetricSemantic, percentChange: number): string {
    return getTrendColor(metricType, percentChange) === 'green' ? '#10b981' : '#f43f5e';
}
