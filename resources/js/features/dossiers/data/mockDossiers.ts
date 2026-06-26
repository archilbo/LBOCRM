export type DossierStatus =
    | 'new'
    | 'documentsRequired'
    | 'readyForContract'
    | 'contractGenerated'
    | 'authorizationProgress'
    | 'closed'
    | 'archived'
    | 'blocked';

export type ContractStatus =
    | 'missing'
    | 'calculation'
    | 'generated'
    | 'signed'
    | 'completed';

export type AuthorizationStatus =
    | 'notStarted'
    | 'preparing'
    | 'submitted'
    | 'observations'
    | 'approved'
    | 'received';

export type RequiredDocumentStatus = 'missing' | 'uploaded' | 'verified' | 'rejected';

export type RequiredDocument = {
    key: 'cni' | 'ownership' | 'cadastral' | 'surface';
    status: RequiredDocumentStatus;
};

export type PlanningStep = {
    key: string;
    titleKey: string;
    status: 'completed' | 'active' | 'pending' | 'blocked';
};

export type DossierRow = {
    id: number;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    phone: string;
    address: string;
    intermediary: string;
    commune: string;
    province: string;
    projectAddress: string;
    landTitleNumber: string;
    landSurface: string;
    floorArea: string;
    status: DossierStatus;
    contract: ContractStatus;
    authorization: AuthorizationStatus;
    progress: number;
    updatedAt: string;
    contractAmount: string;
    tva: string;
    totalTtc: string;
    paid: string;
    remaining: string;
    requiredDocuments: RequiredDocument[];
    planning: PlanningStep[];
};

export const dossierRows: DossierRow[] = [
    {
        id: 1,
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        phone: '+212 6 11 22 33 44',
        address: 'Marrakech, Morocco',
        intermediary: 'None',
        commune: 'Marrakech',
        province: 'Marrakech',
        projectAddress: 'Route de Targa, Marrakech',
        landTitleNumber: 'TF-88421/M',
        landSurface: '420 mÂ²',
        floorArea: '280 mÂ²',
        status: 'readyForContract',
        contract: 'calculation',
        authorization: 'notStarted',
        progress: 32,
        updatedAt: 'Today',
        contractAmount: '28,000 MAD',
        tva: '5,600 MAD',
        totalTtc: '33,600 MAD',
        paid: '0 MAD',
        remaining: '33,600 MAD',
        requiredDocuments: [
            { key: 'cni', status: 'verified' },
            { key: 'ownership', status: 'uploaded' },
            { key: 'cadastral', status: 'missing' },
            { key: 'surface', status: 'missing' },
        ],
        planning: [
            { key: 'collectDocs', titleKey: 'dossierWorkspace.planning.collectDocs', status: 'active' },
            { key: 'verifyProperty', titleKey: 'dossierWorkspace.planning.verifyProperty', status: 'pending' },
            { key: 'prepareContract', titleKey: 'dossierWorkspace.planning.prepareContract', status: 'pending' },
            { key: 'submitFile', titleKey: 'dossierWorkspace.planning.submitFile', status: 'pending' },
            { key: 'followObservations', titleKey: 'dossierWorkspace.planning.followObservations', status: 'pending' },
        ],
    },
    {
        id: 2,
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        phone: '+212 6 55 20 10 88',
        address: 'Gueliz, Marrakech',
        intermediary: 'Yassine Agency',
        commune: 'Gueliz',
        province: 'Marrakech',
        projectAddress: 'Avenue Mohammed V, Gueliz',
        landTitleNumber: 'TF-12590/M',
        landSurface: '96 mÂ²',
        floorArea: '140 mÂ²',
        status: 'authorizationProgress',
        contract: 'signed',
        authorization: 'submitted',
        progress: 68,
        updatedAt: 'Yesterday',
        contractAmount: '14,000 MAD',
        tva: '2,800 MAD',
        totalTtc: '16,800 MAD',
        paid: '8,000 MAD',
        remaining: '8,800 MAD',
        requiredDocuments: [
            { key: 'cni', status: 'verified' },
            { key: 'ownership', status: 'verified' },
            { key: 'cadastral', status: 'verified' },
            { key: 'surface', status: 'uploaded' },
        ],
        planning: [
            { key: 'collectDocs', titleKey: 'dossierWorkspace.planning.collectDocs', status: 'completed' },
            { key: 'verifyProperty', titleKey: 'dossierWorkspace.planning.verifyProperty', status: 'completed' },
            { key: 'prepareContract', titleKey: 'dossierWorkspace.planning.prepareContract', status: 'completed' },
            { key: 'submitFile', titleKey: 'dossierWorkspace.planning.submitFile', status: 'active' },
            { key: 'followObservations', titleKey: 'dossierWorkspace.planning.followObservations', status: 'pending' },
        ],
    },
    {
        id: 3,
        dossierNumber: 'DOS-2026-0003',
        projectObject: 'Commercial facade update',
        client: 'Anas Berrada',
        cin: 'HH458799',
        phone: '+212 6 70 88 44 12',
        address: 'Sidi Youssef Ben Ali',
        intermediary: 'None',
        commune: 'Sidi Youssef Ben Ali',
        province: 'Marrakech',
        projectAddress: 'Sidi Youssef Ben Ali, Marrakech',
        landTitleNumber: 'TF-77810/M',
        landSurface: '180 mÂ²',
        floorArea: '220 mÂ²',
        status: 'documentsRequired',
        contract: 'missing',
        authorization: 'notStarted',
        progress: 18,
        updatedAt: '2 days ago',
        contractAmount: '0 MAD',
        tva: '0 MAD',
        totalTtc: '0 MAD',
        paid: '0 MAD',
        remaining: '0 MAD',
        requiredDocuments: [
            { key: 'cni', status: 'uploaded' },
            { key: 'ownership', status: 'missing' },
            { key: 'cadastral', status: 'missing' },
            { key: 'surface', status: 'missing' },
        ],
        planning: [
            { key: 'collectDocs', titleKey: 'dossierWorkspace.planning.collectDocs', status: 'active' },
            { key: 'verifyProperty', titleKey: 'dossierWorkspace.planning.verifyProperty', status: 'pending' },
            { key: 'prepareContract', titleKey: 'dossierWorkspace.planning.prepareContract', status: 'pending' },
            { key: 'submitFile', titleKey: 'dossierWorkspace.planning.submitFile', status: 'pending' },
            { key: 'followObservations', titleKey: 'dossierWorkspace.planning.followObservations', status: 'pending' },
        ],
    },
];

export function findDossierById(id: number) {
    return dossierRows.find((dossier) => dossier.id === id) ?? dossierRows[0];
}
