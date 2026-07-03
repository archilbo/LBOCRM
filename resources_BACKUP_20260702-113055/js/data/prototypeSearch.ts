export type SearchItemType =
    | 'module'
    | 'client'
    | 'dossier'
    | 'document'
    | 'contract'
    | 'authorization'
    | 'finance'
    | 'archive';

export type PrototypeSearchItem = {
    id: string;
    type: SearchItemType;
    title: string;
    subtitle: string;
    href: string;
    keywords: string[];
};

export const prototypeSearchItems: PrototypeSearchItem[] = [
    {
        id: 'module-dashboard',
        type: 'module',
        title: 'Dashboard',
        subtitle: 'Operating command center',
        href: '/',
        keywords: ['home', 'dashboard', 'command', 'overview'],
    },
    {
        id: 'module-clients',
        type: 'module',
        title: 'Clients',
        subtitle: 'Client CRM and identity data',
        href: '/clients',
        keywords: ['client', 'clients', 'customer', 'cin', 'phone'],
    },
    {
        id: 'module-dossiers',
        type: 'module',
        title: 'Dossiers',
        subtitle: 'Projects and project files',
        href: '/dossiers',
        keywords: ['project', 'projects', 'dossier', 'dossiers', 'file'],
    },
    {
        id: 'module-documents',
        type: 'module',
        title: 'Documents',
        subtitle: 'Required documents and uploads',
        href: '/documents',
        keywords: ['documents', 'upload', 'files', 'required'],
    },
    {
        id: 'module-contracts',
        type: 'module',
        title: 'Contracts',
        subtitle: 'Contract calculation and generation',
        href: '/contracts',
        keywords: ['contract', 'contracts', 'docx', 'pdf', 'calculation'],
    },
    {
        id: 'module-authorizations',
        type: 'module',
        title: 'Authorizations',
        subtitle: 'Administrative authorization tracking',
        href: '/authorizations',
        keywords: ['authorization', 'permit', 'commune', 'province', 'observations'],
    },
    {
        id: 'module-finance',
        type: 'module',
        title: 'Finance',
        subtitle: 'Devis, invoices, payments, balances',
        href: '/finance',
        keywords: ['finance', 'invoice', 'devis', 'payment', 'money', 'balance'],
    },
    {
        id: 'module-archives',
        type: 'module',
        title: 'Archives',
        subtitle: 'Archive number and physical file tracking',
        href: '/archives',
        keywords: ['archive', 'archives', 'box', 'shelf', 'room'],
    },

    {
        id: 'client-1',
        type: 'client',
        title: 'Mohamed Ouknin',
        subtitle: 'CL-2026-0001 Â· EE123456',
        href: '/clients/1',
        keywords: ['mohamed', 'ouknin', 'ee123456', 'cl-2026-0001'],
    },
    {
        id: 'client-2',
        type: 'client',
        title: 'Salma El Mansouri',
        subtitle: 'CL-2026-0002 Â· BK884210',
        href: '/clients/2',
        keywords: ['salma', 'mansouri', 'bk884210', 'cl-2026-0002'],
    },
    {
        id: 'client-3',
        type: 'client',
        title: 'Anas Berrada',
        subtitle: 'CL-2026-0003 Â· HH458799',
        href: '/clients/3',
        keywords: ['anas', 'berrada', 'hh458799', 'cl-2026-0003'],
    },

    {
        id: 'dossier-1',
        type: 'dossier',
        title: 'Villa construction study',
        subtitle: 'DOS-2026-0001 Â· Mohamed Ouknin',
        href: '/dossiers/1',
        keywords: ['villa', 'construction', 'dos-2026-0001', 'mohamed', 'ouknin'],
    },
    {
        id: 'dossier-2',
        type: 'dossier',
        title: 'Apartment renovation',
        subtitle: 'DOS-2026-0002 Â· Salma El Mansouri',
        href: '/dossiers/2',
        keywords: ['apartment', 'renovation', 'dos-2026-0002', 'salma'],
    },
    {
        id: 'dossier-5',
        type: 'dossier',
        title: 'Office extension',
        subtitle: 'DOS-2026-0005 Â· Youssef Ait Lahcen',
        href: '/dossiers/5',
        keywords: ['office', 'extension', 'dos-2026-0005', 'youssef'],
    },

    {
        id: 'document-1',
        type: 'document',
        title: 'Ownership certificate',
        subtitle: 'Required document Â· DOS-2026-0001',
        href: '/documents',
        keywords: ['ownership', 'certificate', 'document', 'dos-2026-0001'],
    },
    {
        id: 'contract-1',
        type: 'contract',
        title: 'CTR-2026-0001',
        subtitle: 'Contract Â· Villa construction study',
        href: '/contracts',
        keywords: ['contract', 'ctr-2026-0001', 'villa'],
    },
    {
        id: 'authorization-1',
        type: 'authorization',
        title: 'SUB-2026-0142',
        subtitle: 'Authorization submission Â· Commune de Gueliz',
        href: '/authorizations',
        keywords: ['authorization', 'submission', 'sub-2026-0142', 'gueliz'],
    },
    {
        id: 'finance-1',
        type: 'finance',
        title: 'INV-2026-0003',
        subtitle: 'Overdue invoice Â· 16,400 MAD remaining',
        href: '/finance',
        keywords: ['invoice', 'finance', 'inv-2026-0003', 'overdue'],
    },
    {
        id: 'archive-1',
        type: 'archive',
        title: 'ARC-2026-0001',
        subtitle: 'Archive room A Â· Box 2026-A',
        href: '/archives',
        keywords: ['archive', 'arc-2026-0001', 'room a', 'box 2026-a'],
    },
];

export function searchPrototypeItems(query: string) {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return [];
    }

    return prototypeSearchItems
        .map((item) => {
            const haystack = [
                item.title,
                item.subtitle,
                item.type,
                ...item.keywords,
            ]
                .join(' ')
                .toLowerCase();

            const exactTitle = item.title.toLowerCase().includes(normalizedQuery) ? 30 : 0;
            const exactSubtitle = item.subtitle.toLowerCase().includes(normalizedQuery) ? 20 : 0;
            const keyword = item.keywords.some((value) => value.toLowerCase().includes(normalizedQuery)) ? 15 : 0;
            const generic = haystack.includes(normalizedQuery) ? 5 : 0;

            return {
                item,
                score: exactTitle + exactSubtitle + keyword + generic,
            };
        })
        .filter((result) => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((result) => result.item);
}
