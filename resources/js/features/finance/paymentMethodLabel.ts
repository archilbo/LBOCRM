export function paymentMethodLabel(method: string | null | undefined, translate: (key: string) => string): string {
    if (!method) return '—';

    const keys: Record<string, string> = {
        cash: 'finance.paymentMethods.cash',
        bank_transfer: 'finance.paymentMethods.bankTransfer',
        check: 'finance.paymentMethods.check',
        card: 'finance.paymentMethods.card',
        other: 'finance.paymentMethods.other',
    };

    return keys[method] ? translate(keys[method]) : method;
}
