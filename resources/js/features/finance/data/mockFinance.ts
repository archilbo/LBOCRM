export type FinanceRecordType = 'devis' | 'invoice' | 'payment' | 'creditNote';
export type FinanceRecordStatus = 'draft' | 'sent' | 'partiallyPaid' | 'paid' | 'overdue' | 'cancelled';

export type FinanceRecordRow = {
    id: number;
    recordNumber: string;
    type: FinanceRecordType;
    status: FinanceRecordStatus;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    ht: number;
    tva: number;
    totalTtc: number;
    paid: number;
    remaining: number;
    dueDate: string;
    updatedAt: string;
    nextAction: string;
};

export const financeRows: FinanceRecordRow[] = [
    {
        id: 1,
        recordNumber: 'DEV-2026-0001',
        type: 'devis',
        status: 'sent',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        ht: 28000,
        tva: 5600,
        totalTtc: 33600,
        paid: 0,
        remaining: 33600,
        dueDate: 'This week',
        updatedAt: 'Today',
        nextAction: 'Convert devis to invoice after client validation.',
    },
    {
        id: 2,
        recordNumber: 'INV-2026-0002',
        type: 'invoice',
        status: 'partiallyPaid',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        ht: 14000,
        tva: 2800,
        totalTtc: 16800,
        paid: 8000,
        remaining: 8800,
        dueDate: 'Next week',
        updatedAt: 'Yesterday',
        nextAction: 'Follow remaining balance before final file closure.',
    },
    {
        id: 3,
        recordNumber: 'INV-2026-0003',
        type: 'invoice',
        status: 'overdue',
        dossierNumber: 'DOS-2026-0005',
        projectObject: 'Office extension',
        client: 'Youssef Ait Lahcen',
        cin: 'JB120045',
        ht: 22000,
        tva: 4400,
        totalTtc: 26400,
        paid: 10000,
        remaining: 16400,
        dueDate: 'Yesterday',
        updatedAt: 'Today',
        nextAction: 'Call client and schedule payment follow-up.',
    },
    {
        id: 4,
        recordNumber: 'INV-2026-0004',
        type: 'invoice',
        status: 'paid',
        dossierNumber: 'DOS-2026-0006',
        projectObject: 'Housing permit file',
        client: 'Khadija Bennani',
        cin: 'QW992341',
        ht: 18000,
        tva: 3600,
        totalTtc: 21600,
        paid: 21600,
        remaining: 0,
        dueDate: 'Closed',
        updatedAt: '2 days ago',
        nextAction: 'Ready for archive.',
    },
];

export function getFinanceMetrics() {
    return {
        totalTtc: financeRows.reduce((sum, row) => sum + row.totalTtc, 0),
        paid: financeRows.reduce((sum, row) => sum + row.paid, 0),
        remaining: financeRows.reduce((sum, row) => sum + row.remaining, 0),
        overdue: financeRows
            .filter((row) => row.status === 'overdue')
            .reduce((sum, row) => sum + row.remaining, 0),
    };
}

export function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}
