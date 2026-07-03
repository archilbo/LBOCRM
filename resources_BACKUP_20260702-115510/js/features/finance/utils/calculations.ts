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
    defaultTvaRate: number,
): FinanceDocumentItem {
    const quantity = normalizeNumber(item.quantity || 1) || 1;
    const unitPrice = normalizeNumber(item.unitPrice);
    const discountRate = normalizeNumber(item.discountRate);
    const tvaRate = item.tvaRate === undefined || item.tvaRate === null
        ? defaultTvaRate
        : normalizeNumber(item.tvaRate);

    const grossHt = quantity * unitPrice;
    const discountAmount = (grossHt * discountRate) / 100;
    const totalHt = Math.max(0, grossHt - discountAmount);
    const totalTva = (totalHt * tvaRate) / 100;
    const totalTtc = totalHt + totalTva;

    return {
        id: item.id,
        position: item.position || 1,
        title: item.title || '',
        description: item.description || '',
        quantity,
        unit: item.unit || '',
        unitPrice,
        discountRate,
        tvaRate,
        totalHt,
        totalTva,
        totalTtc,
    };
}

export function calculateTotals(
    items: Partial<FinanceDocumentItem>[],
    discountTotal = 0,
    defaultTvaRate = 20,
) {
    const calculatedItems = items.map((item, index) => calculateItem({ ...item, position: index + 1 }, defaultTvaRate));
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

export function createEmptyItem(defaultTvaRate: number): FinanceDocumentItem {
    return calculateItem(
        {
            position: 1,
            title: '',
            description: '',
            quantity: 1,
            unit: 'm2',
            unitPrice: 0,
            discountRate: 0,
            tvaRate: defaultTvaRate,
        },
        defaultTvaRate,
    );
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

