export type ContractStatus =
    | 'draft'
    | 'calculated'
    | 'generated'
    | 'givenToClient'
    | 'signed'
    | 'submitted'
    | 'returned'
    | 'completed'
    | 'cancelled';

export type ContractRow = {
    id: number;
    contractNumber: string;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    status: ContractStatus;
    surface: number;
    pricePerMeter: number;
    estimation: number;
    honorairesRate: number;
    ht: number;
    tvaRate: number;
    tvaAmount: number;
    ttc: number;
    template: string;
    version: string;
    fileName: string;
    lastGenerated: string;
    updatedAt: string;
};

export const contractRows: ContractRow[] = [
    {
        id: 1,
        contractNumber: 'CTR-2026-0001',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        status: 'calculated',
        surface: 280,
        pricePerMeter: 120,
        estimation: 33600,
        honorairesRate: 2,
        ht: 28000,
        tvaRate: 20,
        tvaAmount: 5600,
        ttc: 33600,
        template: "CONTRAT D'ARCHITECTE",
        version: 'v1',
        fileName: 'contract-dos-2026-0001.docx',
        lastGenerated: 'Not generated',
        updatedAt: 'Today',
    },
    {
        id: 2,
        contractNumber: 'CTR-2026-0002',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        status: 'signed',
        surface: 140,
        pricePerMeter: 120,
        estimation: 16800,
        honorairesRate: 2,
        ht: 14000,
        tvaRate: 20,
        tvaAmount: 2800,
        ttc: 16800,
        template: "CONTRAT D'ARCHITECTE",
        version: 'v2',
        fileName: 'contract-dos-2026-0002.pdf',
        lastGenerated: 'Yesterday',
        updatedAt: 'Yesterday',
    },
    {
        id: 3,
        contractNumber: 'CTR-2026-0003',
        dossierNumber: 'DOS-2026-0004',
        projectObject: 'Riad restoration',
        client: 'Nadia Amrani',
        cin: 'MA778845',
        status: 'generated',
        surface: 360,
        pricePerMeter: 110,
        estimation: 39600,
        honorairesRate: 2,
        ht: 33000,
        tvaRate: 20,
        tvaAmount: 6600,
        ttc: 39600,
        template: "CONTRAT D'ARCHITECTE",
        version: 'v1',
        fileName: 'contract-dos-2026-0004.docx',
        lastGenerated: '4 days ago',
        updatedAt: '4 days ago',
    },
];

export function getContractMetrics() {
    return {
        total: contractRows.length,
        generated: contractRows.filter((contract) => ['generated', 'signed', 'submitted', 'returned', 'completed'].includes(contract.status)).length,
        signed: contractRows.filter((contract) => ['signed', 'submitted', 'returned', 'completed'].includes(contract.status)).length,
        pending: contractRows.filter((contract) => ['draft', 'calculated', 'givenToClient'].includes(contract.status)).length,
    };
}

export function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}
