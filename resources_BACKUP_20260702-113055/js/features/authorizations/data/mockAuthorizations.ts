export type AuthorizationStatus =
    | 'notStarted'
    | 'preparing'
    | 'submitted'
    | 'observations'
    | 'approved'
    | 'received'
    | 'rejected';

export type AuthorityType = 'commune' | 'province' | 'agency';

export type ObservationStatus = 'open' | 'resolved' | 'blocked';

export type AuthorizationObservation = {
    id: number;
    title: string;
    description: string;
    status: ObservationStatus;
    dueDate: string;
};

export type AuthorizationRow = {
    id: number;
    authorizationNumber: string;
    submissionNumber: string;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    authorityName: string;
    authorityType: AuthorityType;
    status: AuthorizationStatus;
    submittedAt: string;
    authorizationDate: string;
    receiptFileName: string;
    finalFileName: string;
    uploadedBy: string;
    uploadedAt: string;
    observationsCount: number;
    updatedAt: string;
    observations: AuthorizationObservation[];
};

export const authorizationRows: AuthorizationRow[] = [
    {
        id: 1,
        authorizationNumber: '-',
        submissionNumber: 'SUB-2026-0142',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        authorityName: 'Commune de Gueliz',
        authorityType: 'commune',
        status: 'submitted',
        submittedAt: 'Yesterday',
        authorizationDate: '-',
        receiptFileName: 'receipt-dos-2026-0002.pdf',
        finalFileName: '-',
        uploadedBy: 'Assistant',
        uploadedAt: 'Yesterday',
        observationsCount: 0,
        updatedAt: 'Yesterday',
        observations: [],
    },
    {
        id: 2,
        authorizationNumber: '-',
        submissionNumber: 'SUB-2026-0118',
        dossierNumber: 'DOS-2026-0005',
        projectObject: 'Office extension',
        client: 'Youssef Ait Lahcen',
        cin: 'JB120045',
        authorityName: 'Province de Marrakech',
        authorityType: 'province',
        status: 'observations',
        submittedAt: '1 week ago',
        authorizationDate: '-',
        receiptFileName: 'receipt-dos-2026-0005.pdf',
        finalFileName: '-',
        uploadedBy: 'Manager',
        uploadedAt: '1 week ago',
        observationsCount: 2,
        updatedAt: 'Today',
        observations: [
            {
                id: 1,
                title: 'Missing facade update note',
                description: 'Authority requested a clearer facade update note.',
                status: 'open',
                dueDate: 'This week',
            },
            {
                id: 2,
                title: 'Plan correction',
                description: 'Small correction required on floor area annotation.',
                status: 'blocked',
                dueDate: '3 days',
            },
        ],
    },
    {
        id: 3,
        authorizationNumber: 'AUT-2026-0041',
        submissionNumber: 'SUB-2026-0097',
        dossierNumber: 'DOS-2026-0006',
        projectObject: 'Housing permit file',
        client: 'Khadija Bennani',
        cin: 'QW992341',
        authorityName: 'Agence Urbaine de Marrakech',
        authorityType: 'agency',
        status: 'received',
        submittedAt: '2 weeks ago',
        authorizationDate: '2 days ago',
        receiptFileName: 'receipt-dos-2026-0006.pdf',
        finalFileName: 'authorization-dos-2026-0006.pdf',
        uploadedBy: 'Manager',
        uploadedAt: '2 days ago',
        observationsCount: 0,
        updatedAt: '2 days ago',
        observations: [],
    },
];

export function getAuthorizationMetrics() {
    return {
        total: authorizationRows.length,
        submitted: authorizationRows.filter((item) => ['submitted', 'observations', 'approved'].includes(item.status)).length,
        observations: authorizationRows.filter((item) => item.status === 'observations').length,
        received: authorizationRows.filter((item) => item.status === 'received').length,
    };
}
