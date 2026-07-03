export type RequiredDocumentType =
    | 'cni'
    | 'ownership'
    | 'cadastral'
    | 'surface'
    | 'contract'
    | 'authorization';

export type RequiredDocumentStatus =
    | 'missing'
    | 'uploaded'
    | 'verified'
    | 'rejected'
    | 'expired';

export type RequiredDocumentRow = {
    id: number;
    title: string;
    type: RequiredDocumentType;
    status: RequiredDocumentStatus;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    fileName: string;
    fileSize: string;
    uploadedBy: string;
    uploadedAt: string;
    updatedAt: string;
};

export const requiredDocumentRows: RequiredDocumentRow[] = [
    {
        id: 1,
        title: 'CNI copy',
        type: 'cni',
        status: 'verified',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: 'cni-mohamed-ouknin.pdf',
        fileSize: '1.2 MB',
        uploadedBy: 'Assistant',
        uploadedAt: 'Today',
        updatedAt: 'Today',
    },
    {
        id: 2,
        title: 'Ownership certificate',
        type: 'ownership',
        status: 'uploaded',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: 'ownership-certificate.pdf',
        fileSize: '2.4 MB',
        uploadedBy: 'Assistant',
        uploadedAt: 'Today',
        updatedAt: 'Today',
    },
    {
        id: 3,
        title: 'Cadastral plan',
        type: 'cadastral',
        status: 'missing',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: '-',
        fileSize: '-',
        uploadedBy: '-',
        uploadedAt: '-',
        updatedAt: 'Today',
    },
    {
        id: 4,
        title: 'Surface calculation',
        type: 'surface',
        status: 'missing',
        dossierNumber: 'DOS-2026-0001',
        projectObject: 'Villa construction study',
        client: 'Mohamed Ouknin',
        cin: 'EE123456',
        fileName: '-',
        fileSize: '-',
        uploadedBy: '-',
        uploadedAt: '-',
        updatedAt: 'Today',
    },
    {
        id: 5,
        title: 'CNI copy',
        type: 'cni',
        status: 'verified',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        fileName: 'cni-salma.pdf',
        fileSize: '1.1 MB',
        uploadedBy: 'Manager',
        uploadedAt: 'Yesterday',
        updatedAt: 'Yesterday',
    },
    {
        id: 6,
        title: 'Cadastral plan',
        type: 'cadastral',
        status: 'rejected',
        dossierNumber: 'DOS-2026-0002',
        projectObject: 'Apartment renovation',
        client: 'Salma El Mansouri',
        cin: 'BK884210',
        fileName: 'old-cadastral-plan.pdf',
        fileSize: '3.6 MB',
        uploadedBy: 'Assistant',
        uploadedAt: '2 days ago',
        updatedAt: 'Yesterday',
    },
];

export function getDocumentMetrics() {
    return {
        total: requiredDocumentRows.length,
        verified: requiredDocumentRows.filter((document) => document.status === 'verified').length,
        missing: requiredDocumentRows.filter((document) => document.status === 'missing').length,
        rejected: requiredDocumentRows.filter((document) => document.status === 'rejected').length,
    };
}
