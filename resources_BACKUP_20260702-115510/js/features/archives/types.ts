export type ArchiveStatus =
    | 'ready_to_archive'
    | 'stored'
    | 'checked_out'
    | 'returned'
    | 'lost'
    | string;

export type ArchiveRecordRow = {
    id: number;
    dossierId: string;

    dossierNumber: string;
    projectObject: string;
    clientName: string;
    clientCin: string;

    archiveNumber: string;
    status: ArchiveStatus;

    room: string | null;
    shelf: string | null;
    box: string | null;
    folder: string | null;
    locationLabel: string;

    inDate: string | null;
    outDate: string | null;
    returnedAt: string | null;
    requestedBy: string | null;

    notes: string | null;
    updatedAt: string | null;
    createdAt: string | null;
};

export type ArchiveDossierOption = {
    id: string;
    label: string;
    hasArchiveRecord: boolean;
};

export type ArchiveFormPayload = {
    dossierId: string;
    status: string;
    room: string;
    shelf: string;
    box: string;
    folder: string;
    inDate: string;
    outDate: string;
    returnedAt: string;
    requestedBy: string;
    notes: string;
};