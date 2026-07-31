/**
 * Strip non-numeric characters (except comma, period, minus) from a
 * raw input string and normalize comma → period.
 *
 * Returns a clean string suitable for controlled input state.
 * The backend will handle the final parse via DecimalMoney::parse().
 */
export function normalizeDecimalInput(raw: string): string {
    if (!raw) return '';
    // Preserve digits, comma, period, minus, and spaces (thousands separator)
    const cleaned = raw.replace(/[^0-9,.\-\s]/g, '');
    if (!cleaned) return '';
    // Normalize comma → period for internal numeric compatibility
    return cleaned.replace(',', '.');
}

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

export function normalizeCurrency(currency: unknown): string {
    if (typeof currency !== 'string') return 'MAD';
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

export function formatCompactMoney(value: unknown, currency = 'MAD'): string {
    const num = normalizeNumber(value);
    const abs = Math.abs(num);
    const safeCurrency = normalizeCurrency(currency);

    let amount: string;
    let suffix: string;

    if (abs >= 1_000_000_000_000) {
        amount = (num / 1_000_000_000_000).toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        suffix = ' T';
    } else if (abs >= 1_000_000_000) {
        amount = (num / 1_000_000_000).toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        suffix = ' Mrd';
    } else if (abs >= 1_000_000) {
        amount = (num / 1_000_000).toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        suffix = ' M';
    } else if (abs >= 1_000) {
        amount = (num / 1_000).toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        suffix = ' K';
    } else {
        amount = num.toLocaleString('fr-MA', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
        suffix = '';
    }

    return `${amount}${suffix} ${safeCurrency}`.trim();
}

export function formatFullMoney(value: unknown, currency = 'MAD'): string {
    const num = normalizeNumber(value);
    const safeCurrency = normalizeCurrency(currency);
    try {
        return new Intl.NumberFormat('fr-MA', {
            style: 'currency',
            currency: safeCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    } catch {
        return `${num.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
    }
}
