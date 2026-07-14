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
    city: { id: number; name: string; code: string; color: string } | null;
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
    cells: CellRoom[];
    dossiers: ArchiveDossierOption[];
    requesters: { id: string; name: string }[];
    cities: { id: number; name: string; code: string; color: string }[];
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
        city?: string;
        room?: string;
        box?: string;
        requesterId?: string;
        dossierId?: string;
        dueFrom?: string;
        dueTo?: string;
        overdueOnly?: boolean;
        sort?: string;
        page?: number;
        perPage?: number;
        viewMode?: string;
    };
};

export type CellCity = {
    code: string;
    name: string;
    color: string;
    count: number;
};

export type CellBox = {
    code: string;
    total: number;
    cities: CellCity[];
};

export type CellRoom = {
    name: string;
    code: string;
    boxes: CellBox[];
};

export type Paginator = ArchivesPageProps['paginator'];

export type RecordsSummary = Record<string, number>;

export type BoxContentsRecord = {
    id: number;
    dossierId: number | null;
    dossierNumber: string;
    archiveNumber: string;
    status: ArchiveStatus;
    projectObject: string;
    clientName: string;
    inDate: string | null;
    dueAt: string | null;
    isOverdue: boolean;
    isLost: boolean;
};

export type BoxGroup = {
    city: { code: string; name: string; color: string };
    records: BoxContentsRecord[];
};

export type BoxContents = {
    box: {
        code: string;
        name: string;
        capacity: number;
        count: number;
        roomName: string | null;
        roomCode: string | null;
        shelfCode: string | null;
    };
    groups: BoxGroup[];
};
