export type ArchiveStatus =
    | 'ready_to_archive'
    | 'stored'
    | 'checked_out'
    | 'returned'
    | 'lost'
    | string;

export type ArchiveEventRow = {
    id: number;
    archiveRecordId: number;
    actorId: string | null;
    actorName: string;
    type: string;
    payload: Record<string, unknown>;
    createdAt: string | null;
    createdAtRaw: string | null;
};

export type ArchiveRecordRow = {
    id: number;
    dossierId: string;
    clientId: string | null;
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
    requesterId: string | null;
    dueAt: string | null;
    checkedOutAt: string | null;
    isLost: boolean;
    lostReason: string | null;
    isOverdue: boolean;
    notes: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    events?: ArchiveEventRow[];
};

export type ArchiveDossierOption = {
    id: string;
    label: string;
    hasArchiveRecord: boolean;
};

export type ArchiveFormPayload = {
    clientId: string;
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
    dueAt?: string;
};

export type RoomOption = {
    id: number;
    name: string;
    code: string;
};

export type ShelfOption = {
    id: number;
    roomId: number;
    name: string;
    code: string;
};

export type BoxOption = {
    id: number;
    shelfId: number;
    name: string;
    code: string;
    capacity: number;
    archiveCount?: number;
};

export type TreeNode = {
    id: number;
    name: string;
    code: string;
    shelves?: TreeShelf[];
};

export type TreeShelf = {
    id: number;
    name: string;
    code: string;
    boxes?: TreeBox[];
};

export type TreeBox = {
    id: number;
    name: string;
    code: string;
    capacity: number;
    fill: number;
    count: number;
};

export type ArchivesPageProps = {
    archives: ArchiveRecordRow[];
    paginator: {
        currentPage: number;
        lastPage: number;
        perPage: number;
        total: number;
    };
    tree: TreeNode[];
    dossiers: ArchiveDossierOption[];
    requesters: { id: string; name: string }[];
    kpis: {
        total: number;
        ready: number;
        stored: number;
        checkedOut: number;
        returned: number;
        overdue: number;
        lost: number;
    };
    filters: {
        q?: string;
        status?: string[];
        view?: string;
        room?: string;
        shelf?: string;
        box?: string;
        requesterId?: string;
        dossierId?: string;
        dueFrom?: string;
        dueTo?: string;
        overdueOnly?: boolean;
        sort?: string;
        page?: number;
        perPage?: number;
        density?: string;
        columns?: string;
        viewMode?: string;
    };
};

export type Paginator = ArchivesPageProps['paginator'];
