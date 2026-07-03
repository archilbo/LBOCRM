export type QaProjectRecord = {
    id: number;
    dossierNumber: string;
    title: string;
    client: string;
    href: string;
    expected: string;
};

export type QaActionRecord = {
    id: string;
    title: string;
    description: string;
    type: 'navigate' | 'download' | 'toast';
    href?: string;
    fileName?: string;
};

export const qaProjectRecords: QaProjectRecord[] = [
    {
        id: 1,
        dossierNumber: 'DOS-2026-0001',
        title: 'Villa construction study',
        client: 'Mohamed Ouknin',
        href: '/dossiers/1',
        expected: 'Dossier workspace opens with project details.',
    },
    {
        id: 2,
        dossierNumber: 'DOS-2026-0002',
        title: 'Apartment renovation',
        client: 'Salma El Mansouri',
        href: '/dossiers/2',
        expected: 'Dossier workspace opens with project details.',
    },
    {
        id: 5,
        dossierNumber: 'DOS-2026-0005',
        title: 'Office extension',
        client: 'Youssef Ait Lahcen',
        href: '/dossiers/5',
        expected: 'Dossier workspace opens with project details.',
    },
];

export const qaSearchQueries = [
    'Mohamed',
    'EE123456',
    'DOS-2026-0001',
    'CTR-2026-0001',
    'INV-2026-0003',
    'ARC-2026-0001',
    'authorization',
    'finance',
];

export const qaActions: QaActionRecord[] = [
    {
        id: 'new-client',
        title: 'Open clients module',
        description: 'Navigate to Clients where Create Client drawer can be tested.',
        type: 'navigate',
        href: '/clients',
    },
    {
        id: 'new-project',
        title: 'Open projects module',
        description: 'Navigate to Projects where New Project drawer can be tested.',
        type: 'navigate',
        href: '/dossiers',
    },
    {
        id: 'upload-document',
        title: 'Open documents module',
        description: 'Navigate to Documents where upload cards can be tested.',
        type: 'navigate',
        href: '/documents',
    },
    {
        id: 'contract-download',
        title: 'Fake contract download',
        description: 'Download a fake contract file to prove button logic works before backend.',
        type: 'download',
        fileName: 'ARCHI-LBO-fake-contract.txt',
    },
    {
        id: 'invoice-download',
        title: 'Fake invoice download',
        description: 'Download a fake invoice file to prove finance button logic works before backend.',
        type: 'download',
        fileName: 'ARCHI-LBO-fake-invoice.txt',
    },
    {
        id: 'toast-test',
        title: 'Toast action test',
        description: 'Show a toast without navigation.',
        type: 'toast',
    },
];
