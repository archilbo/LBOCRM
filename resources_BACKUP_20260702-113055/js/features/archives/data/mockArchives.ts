export type ArchiveRecordStatus =
    | 'readyToArchive'
    | 'stored'
    | 'out'
    | 'pendingReturn'
    | 'returned'
    | 'lost';

export type ArchiveRecordRow = {
    id: number;
    archiveNumber: string;
    dossierNumber: string;
    projectObject: string;
    client: string;
    cin: string;
    status: ArchiveRecordStatus;
    room: string;
    shelf: string;
    box: string;
    folder: string;
    inDate: string;
    outDate: string;
    returnedAt: string;
    requestedBy: string;
    updatedAt: string;
    nextAction: string;
};

export const archiveRows: ArchiveRecordRow[] = [
    {
        id: 1,
        archiveNumber: 'ARC-2026-0001',
        dossierNumber: 'DOS-2026-0006',
        projectObject: 'Housing permit file',
        client: 'Khadija Bennani',
        cin: 'QW992341',
        status: 'stored',
        room: 'Archive room A',
        shelf: 'Shelf 01',
        box: 'Box 2026-A',
        folder: 'Folder 006',
        inDate: '2 days ago',
        outDate: '-',
        returnedAt: '-',
        requestedBy: '-',
        updatedAt: '2 days ago',
        nextAction: 'No action required. File is stored.',
    },
    {
        id: 2,
        archiveNumber: 'ARC-2026-0002',
        dossierNumber: 'DOS-2026-0003',
        projectObject: 'Commercial facade update',
        client: 'Anas Berrada',
        cin: 'HH458799',
        status: 'out',
        room: 'Archive room A',
        shelf: 'Shelf 02',
        box: 'Box 2026-B',
        folder: 'Folder 003',
        inDate: '1 week ago',
        outDate: 'Today',
        returnedAt: '-',
        requestedBy: 'Manager',
        updatedAt: 'Today',
        nextAction: 'Follow return date with Manager.',
    },
    {
        id: 3,
        archiveNumber: 'ARC-2026-0003',
        dossierNumber: 'DOS-2026-0007',
        projectObject: 'Small renovation file',
        client: 'Rachid El Fassi',
        cin: 'FJ881200',
        status: 'pendingReturn',
        room: 'Archive room B',
        shelf: 'Shelf 03',
        box: 'Box 2026-C',
        folder: 'Folder 007',
        inDate: '2 weeks ago',
        outDate: '3 days ago',
        returnedAt: '-',
        requestedBy: 'Assistant',
        updatedAt: 'Today',
        nextAction: 'Physical file must be returned to archive room B.',
    },
    {
        id: 4,
        archiveNumber: 'ARC-2026-0004',
        dossierNumber: 'DOS-2026-0008',
        projectObject: 'Office interior update',
        client: 'ARCHI Invest SARL',
        cin: 'ICE998812',
        status: 'readyToArchive',
        room: '-',
        shelf: '-',
        box: '-',
        folder: '-',
        inDate: '-',
        outDate: '-',
        returnedAt: '-',
        requestedBy: '-',
        updatedAt: 'Yesterday',
        nextAction: 'Assign archive number and physical location.',
    },
];

export function getArchiveMetrics() {
    return {
        total: archiveRows.length,
        stored: archiveRows.filter((record) => record.status === 'stored' || record.status === 'returned').length,
        out: archiveRows.filter((record) => record.status === 'out').length,
        pending: archiveRows.filter((record) => record.status === 'pendingReturn' || record.status === 'readyToArchive').length,
    };
}
