import { Head, router } from '@inertiajs/react';
import {
    Archive,
    CheckCircle2,
    Circle,
    Eye,
    FolderKanban,
    FolderOpen,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppPagination } from '@/components/ui/AppPagination';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import { countByValue, filterByValue } from '@/lib/filters';
import type {
    ArchiveDossierOption,
    ArchiveFormPayload,
    ArchiveRecordRow,
    ArchiveStatus,
} from '@/features/archives/types';

/* FORCE_ARCHIVES_REDESIGN_53I */

type PageProps = {
    archiveRecords: ArchiveRecordRow[];
    dossiers: ArchiveDossierOption[];
    metrics: {
        total: number;
        ready: number;
        stored: number;
        checkedOut: number;
        returned: number;
    };
};

type ViewMode = 'workspace' | 'storage';

function statusClass(status: ArchiveStatus) {
    if (status === 'stored') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'checked_out') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'returned') return 'border-violet-400/25 bg-violet-400/10 text-violet-300';
    if (status === 'lost') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
}

function statusLabel(status: ArchiveStatus) {
    const labels: Record<string, string> = {
        ready_to_archive: 'Ready',
        stored: 'Stored',
        checked_out: 'Checked out',
        returned: 'Returned',
        lost: 'Lost',
    };

    return labels[status] ?? status;
}

function toBackendPayload(payload: ArchiveFormPayload) {
    return {
        dossier_id: payload.dossierId,
        status: payload.status || 'ready_to_archive',
        room: payload.room || null,
        shelf: payload.shelf || null,
        box: payload.box || null,
        folder: payload.folder || null,
        in_date: payload.inDate || null,
        out_date: payload.outDate || null,
        returned_at: payload.returnedAt || null,
        requested_by: payload.requestedBy || null,
        notes: payload.notes || null,
    };
}

function matchesSearch(record: ArchiveRecordRow, query: string) {
    if (!query.trim()) {
        return true;
    }

    return [
        record.archiveNumber,
        record.dossierNumber,
        record.projectObject,
        record.clientName,
        record.clientCin,
        record.locationLabel,
        record.room,
        record.shelf,
        record.box,
        record.folder,
        record.status,
        record.requestedBy,
        record.notes,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function archiveFlow(record: ArchiveRecordRow) {
    return [
        { key: 'ready', label: 'Ready', done: true, date: record.createdAt },
        {
            key: 'stored',
            label: 'Stored',
            done: Boolean(record.inDate) || ['stored', 'checked_out', 'returned'].includes(record.status),
            date: record.inDate,
        },
        {
            key: 'checked_out',
            label: 'Checked out',
            done: Boolean(record.outDate) || ['checked_out', 'returned'].includes(record.status),
            date: record.outDate,
        },
        {
            key: 'returned',
            label: 'Returned',
            done: Boolean(record.returnedAt) || record.status === 'returned',
            date: record.returnedAt,
        },
    ];
}

function KpiCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string | number;
    detail: string;
}) {
    return (
        <div className="crm-kpi-card">
            <p className="crm-kpi-label">{label}</p>
            <p className="crm-kpi-value">{value}</p>
            <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">{detail}</p>
        </div>
    );
}

function ColumnButton({
    active,
    title,
    subtitle,
    onClick,
}: {
    active: boolean;
    title: string;
    subtitle: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex w-full items-center justify-between gap-3 border-b border-[var(--crm-border)] px-3 py-3 text-left transition',
                active
                    ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                    : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-hover)] hover:text-[var(--crm-text)]',
            ].join(' ')}
        >
            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{title}</span>
                <span className="block truncate text-xs opacity-75">{subtitle}</span>
            </span>
        </button>
    );
}

function ArchiveTimeline({ record }: { record: ArchiveRecordRow }) {
    return (
        <div className="space-y-2">
            {archiveFlow(record).map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                    <span className={[
                        'flex size-7 shrink-0 items-center justify-center rounded-full border',
                        item.done
                            ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                            : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-soft)]',
                    ].join(' ')}>
                        {item.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.label}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{item.date || '-'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ArchiveDetailPanel({
    record,
    onEdit,
    onDelete,
    onUpdateStatus,
}: {
    record: ArchiveRecordRow | null;
    onEdit: (record: ArchiveRecordRow) => void;
    onDelete: (record: ArchiveRecordRow) => void;
    onUpdateStatus: (record: ArchiveRecordRow, status: string) => void;
}) {
    if (!record) {
        return (
            <aside className="crm-panel p-4">
                <p className="text-sm font-semibold">Archive details</p>
                <p className="mt-2 text-sm text-[var(--crm-text-muted)]">
                    Select an archive record to see location, status, and checkout history.
                </p>
            </aside>
        );
    }

    return (
        <aside className="crm-panel overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-4">
                <p className="crm-eyebrow">Selected archive</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">{record.archiveNumber}</h2>
                        <p className="text-sm text-[var(--crm-text-muted)]">{record.dossierNumber}</p>
                    </div>

                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(record.status)}`}>
                        {statusLabel(record.status)}
                    </span>
                </div>
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                        <p className="mt-1 truncate text-sm font-semibold">{record.projectObject}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{record.clientName}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Location</p>
                        <p className="mt-1 truncate text-sm font-semibold">{record.locationLabel || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Room / shelf / box / folder</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Checked out</p>
                        <p className="mt-1 truncate text-sm font-semibold">{record.outDate || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{record.requestedBy || 'No requester'}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Returned</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--crm-gold)]">{record.returnedAt || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Return tracking</p>
                    </div>
                </div>

                <div className="crm-panel-soft p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Archive flow</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">
                            {archiveFlow(record).filter((item) => item.done).length}/4 done
                        </p>
                    </div>
                    <ArchiveTimeline record={record} />
                </div>

                <div className="crm-panel-soft p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Notes</p>
                    <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-line text-sm leading-6 text-[var(--crm-text-muted)]">
                        {record.notes || 'No notes.'}
                    </p>
                </div>

                <div className="grid gap-2">
                    <AppButton variant="primary" onPress={() => onUpdateStatus(record, 'stored')}>
                        <CheckCircle2 size={15} />
                        Mark stored
                    </AppButton>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => onUpdateStatus(record, 'checked_out')}>
                            <FolderOpen size={14} />
                            Check out
                        </AppButton>

                        <AppButton variant="secondary" size="sm" onPress={() => onUpdateStatus(record, 'returned')}>
                            <RotateCcw size={14} />
                            Returned
                        </AppButton>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => onEdit(record)}>
                            <Pencil size={14} />
                            Edit
                        </AppButton>

                        <AppButton variant="danger" size="sm" onPress={() => onDelete(record)}>
                            <Trash2 size={14} />
                            Delete
                        </AppButton>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function StorageBrowser({
    records,
    onSelect,
}: {
    records: ArchiveRecordRow[];
    onSelect: (record: ArchiveRecordRow) => void;
}) {
    const roomNames = useMemo(() => {
        const rooms = Array.from(new Set(records.map((record) => record.room || 'No room')));
        return rooms.length ? rooms : ['No room'];
    }, [records]);

    const [selectedRoom, setSelectedRoom] = useState(roomNames[0] ?? 'No room');

    const recordsInRoom = useMemo(
        () => records.filter((record) => (record.room || 'No room') === selectedRoom),
        [records, selectedRoom],
    );

    const shelfNames = useMemo(() => {
        const shelves = Array.from(new Set(recordsInRoom.map((record) => record.shelf || 'No shelf')));
        return shelves.length ? shelves : ['No shelf'];
    }, [recordsInRoom]);

    const [selectedShelf, setSelectedShelf] = useState(shelfNames[0] ?? 'No shelf');
    const [query, setQuery] = useState('');

    const recordsInShelf = useMemo(() => {
        const normalizedShelf = selectedShelf || shelfNames[0] || 'No shelf';

        return recordsInRoom
            .filter((record) => (record.shelf || 'No shelf') === normalizedShelf)
            .filter((record) => matchesSearch(record, query));
    }, [query, recordsInRoom, selectedShelf, shelfNames]);

    function chooseRoom(room: string) {
        const nextRecords = records.filter((record) => (record.room || 'No room') === room);
        const nextShelf = nextRecords[0]?.shelf || 'No shelf';

        setSelectedRoom(room);
        setSelectedShelf(nextShelf);
        setQuery('');
    }

    return (
        <section className="crm-panel overflow-hidden">
            <div className="grid min-h-[620px] grid-cols-1 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Rooms</p>
                        <p className="text-xs text-[var(--crm-text-muted)]">{roomNames.length} room(s)</p>
                    </div>

                    <div className="app-scrollbar max-h-[560px] overflow-y-auto">
                        {roomNames.map((room) => {
                            const count = records.filter((record) => (record.room || 'No room') === room).length;

                            return (
                                <ColumnButton
                                    key={room}
                                    active={selectedRoom === room}
                                    title={room}
                                    subtitle={`${count} archive(s)`}
                                    onClick={() => chooseRoom(room)}
                                />
                            );
                        })}
                    </div>
                </aside>

                <aside className="border-b border-[var(--crm-border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--crm-border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Shelves</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{selectedRoom}</p>
                    </div>

                    <div className="app-scrollbar max-h-[560px] overflow-y-auto">
                        {shelfNames.map((shelf) => {
                            const count = recordsInRoom.filter((record) => (record.shelf || 'No shelf') === shelf).length;

                            return (
                                <ColumnButton
                                    key={`${selectedRoom}-${shelf}`}
                                    active={selectedShelf === shelf}
                                    title={shelf}
                                    subtitle={`${count} archive(s)`}
                                    onClick={() => {
                                        setSelectedShelf(shelf);
                                        setQuery('');
                                    }}
                                />
                            );
                        })}
                    </div>
                </aside>

                <main className="min-w-0">
                    <div className="flex flex-col gap-3 border-b border-[var(--crm-border)] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="crm-eyebrow">Storage browser</p>
                            <h2 className="mt-1 truncate text-lg font-semibold">{selectedRoom} / {selectedShelf}</h2>
                            <p className="mt-1 text-sm text-[var(--crm-text-muted)]">{recordsInShelf.length} visible archive(s)</p>
                        </div>

                        <div className="crm-command-input relative w-full xl:w-[340px]">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search archives in shelf..."
                                className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                            />
                        </div>
                    </div>

                    <div className="app-scrollbar max-h-[560px] space-y-3 overflow-y-auto p-4">
                        {recordsInShelf.length > 0 ? recordsInShelf.map((record) => (
                            <button
                                key={record.id}
                                type="button"
                                onClick={() => onSelect(record)}
                                className="crm-panel-soft w-full p-3 text-left transition hover:border-[var(--crm-gold)]"
                            >
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                <Archive size={16} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{record.archiveNumber}</p>
                                                <p className="truncate text-xs text-[var(--crm-text-muted)]">{record.projectObject}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(record.status)}`}>
                                            {statusLabel(record.status)}
                                        </span>
                                        <span className="text-xs text-[var(--crm-text-muted)]">{record.locationLabel}</span>
                                    </div>
                                </div>
                            </button>
                        )) : (
                            <div className="py-16 text-center">
                                <p className="text-sm font-semibold">No archives found</p>
                                <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Choose another shelf or clear search.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </section>
    );
}

export default function ArchivesIndex({
    archiveRecords,
    dossiers,
    metrics,
}: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedArchive, setSelectedArchive] = useState<ArchiveRecordRow | null>(
        archiveRecords[0] ?? null,
    );
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;
    const [deleteTarget, setDeleteTarget] = useState<ArchiveRecordRow | null>(null);

    const statusOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: archiveRecords.length },
            { id: 'ready_to_archive', label: 'Ready', count: countByValue(archiveRecords, (record) => record.status, 'ready_to_archive') },
            { id: 'stored', label: 'Stored', count: countByValue(archiveRecords, (record) => record.status, 'stored') },
            { id: 'checked_out', label: 'Checked out', count: countByValue(archiveRecords, (record) => record.status, 'checked_out') },
            { id: 'returned', label: 'Returned', count: countByValue(archiveRecords, (record) => record.status, 'returned') },
            { id: 'lost', label: 'Lost', count: countByValue(archiveRecords, (record) => record.status, 'lost') },
        ],
        [archiveRecords],
    );

    const filteredArchiveRecords = useMemo(() => {
        return filterByValue(archiveRecords, statusFilter, (record) => record.status)
            .filter((record) => matchesSearch(record, query));
    }, [archiveRecords, query, statusFilter]);

    useEffect(() => {
        setTablePage(1);
    }, [query, statusFilter, viewMode]);

    const pagedArchiveRecords = useMemo(
        () => filteredArchiveRecords.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE),
        [filteredArchiveRecords, tablePage],
    );

    const selectedVisible = selectedArchive && filteredArchiveRecords.some((record) => record.id === selectedArchive.id)
        ? selectedArchive
        : filteredArchiveRecords[0] ?? null;

    function openCreateDrawer() {
        setSelectedArchive(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(record: ArchiveRecordRow) {
        setSelectedArchive(record);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ArchiveFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedArchive) {
            router.put(`/archives/${selectedArchive.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    setFormErrors({});
                    toast.success('Archive record updated successfully.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check archive form errors.');
                },
            });

            return;
        }

        router.post('/archives', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                setFormErrors({});
                toast.success('Archive record created successfully.');
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error('Please check archive form errors. Maybe this dossier already has an archive record.');
            },
        });
    }

    function updateStatus(record: ArchiveRecordRow, status: string) {
        router.put(
            `/archives/${record.id}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Archive status updated.'),
                onError: () => toast.error('Archive status could not be updated.'),
            },
        );
    }

    function deleteRecord(record: ArchiveRecordRow) {
        setDeleteTarget(record);
        return;
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/archives/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                toast.success('Archive record deleted successfully.');
            },
            onError: () => toast.error('Archive record could not be deleted.'),
        });
    }

    return (
        <>
            <Head title="Archives" />

            <AppShell
                eyebrowKey="archives.eyebrow"
                titleKey="archives.title"
                subtitleKey="archives.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New archive
                    </AppButton>
                }
            >
                <section className="crm-kpi-grid max-xl:grid-cols-3 max-md:grid-cols-1">
                    <KpiCard label="Archives" value={metrics.total} detail="Total physical archive records" />
                    <KpiCard label="Ready" value={metrics.ready} detail="Waiting storage" />
                    <KpiCard label="Stored" value={metrics.stored} detail="Inside archive room" />
                    <KpiCard label="Checked out" value={metrics.checkedOut} detail="Currently outside" />
                    <KpiCard label="Returned" value={metrics.returned} detail="Back from checkout" />
                </section>

                <section className="crm-panel p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => {
                                const active = option.id === statusFilter;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setStatusFilter(option.id)}
                                        className={[
                                            'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
                                            active
                                                ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="crm-command-input relative w-full sm:w-[390px]">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search archives, projects, locations..."
                                    className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                                />
                                {query ? (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                                    >
                                        <X size={14} />
                                    </button>
                                ) : null}
                            </div>

                            <div className="inline-flex rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('workspace')}
                                    className={[
                                        'h-8 rounded-md px-3 text-xs font-semibold transition',
                                        viewMode === 'workspace'
                                            ? 'bg-[var(--crm-gold)] text-black'
                                            : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                    ].join(' ')}
                                >
                                    Workspace
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('storage')}
                                    className={[
                                        'h-8 rounded-md px-3 text-xs font-semibold transition',
                                        viewMode === 'storage'
                                            ? 'bg-[var(--crm-gold)] text-black'
                                            : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                    ].join(' ')}
                                >
                                    Storage
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {viewMode === 'storage' ? (
                    <StorageBrowser records={filteredArchiveRecords} onSelect={setSelectedArchive} />
                ) : (
                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="crm-panel overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-5 py-4">
                                <div>
                                    <p className="text-sm font-semibold">Archive workspace</p>
                                    <p className="text-xs text-[var(--crm-text-muted)]">{filteredArchiveRecords.length} visible archive(s)</p>
                                </div>

                                <AppButton variant="secondary" size="sm" onPress={() => setStatusFilter('all')}>
                                    Reset
                                </AppButton>
                            </div>

                            <div className="app-scrollbar overflow-x-auto">
                                <table className="crm-table min-w-[1080px]">
                                    <thead>
                                        <tr>
                                            <th>Archive</th>
                                            <th>Project</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Dates</th>
                                            <th>Requester</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {pagedArchiveRecords.length > 0 ? (
                                            pagedArchiveRecords.map((record) => {
                                                const selected = selectedVisible?.id === record.id;

                                                return (
                                                    <tr
                                                        key={record.id}
                                                        className={selected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}
                                                        onClick={() => setSelectedArchive(record)}
                                                    >
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                                    <Archive size={16} />
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <p className="max-w-[220px] truncate font-semibold text-[var(--crm-text)]">{record.archiveNumber}</p>
                                                                    <p className="text-xs text-[var(--crm-text-muted)]">{record.dossierNumber}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="flex items-start gap-2">
                                                                <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--crm-text-soft)]" />
                                                                <div className="min-w-0">
                                                                    <p className="max-w-[230px] truncate font-medium text-[var(--crm-text)]">{record.projectObject}</p>
                                                                    <p className="max-w-[230px] truncate text-xs text-[var(--crm-text-muted)]">{record.clientName}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <p className="max-w-[220px] truncate font-medium text-[var(--crm-text)]">{record.locationLabel || '-'}</p>
                                                            <p className="max-w-[220px] truncate text-xs text-[var(--crm-text-muted)]">
                                                                Room {record.room || '-'} / Shelf {record.shelf || '-'}
                                                            </p>
                                                        </td>

                                                        <td>
                                                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(record.status)}`}>
                                                                {statusLabel(record.status)}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <p className="text-xs text-[var(--crm-text-muted)]">In: {record.inDate || '-'}</p>
                                                            <p className="text-xs text-[var(--crm-text-muted)]">Out: {record.outDate || '-'}</p>
                                                        </td>

                                                        <td>
                                                            <p className="max-w-[150px] truncate text-[var(--crm-text-muted)]">{record.requestedBy || '-'}</p>
                                                        </td>

                                                        <td>
                                                            <div className="flex justify-end gap-1">
                                                                <button type="button" className="crm-action-button" title="Preview" onClick={(event) => { event.stopPropagation(); setSelectedArchive(record); }}>
                                                                    <Eye size={14} />
                                                                </button>
                                                                <button type="button" className="crm-action-button" title="Edit" onClick={(event) => { event.stopPropagation(); openEditDrawer(record); }}>
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button type="button" className="crm-action-button" title="Stored" onClick={(event) => { event.stopPropagation(); updateStatus(record, 'stored'); }}>
                                                                    <CheckCircle2 size={14} />
                                                                </button>
                                                                <button type="button" className="crm-action-button" title="Checked out" onClick={(event) => { event.stopPropagation(); updateStatus(record, 'checked_out'); }}>
                                                                    <FolderOpen size={14} />
                                                                </button>
                                                                <button type="button" className="crm-action-button" title="Returned" onClick={(event) => { event.stopPropagation(); updateStatus(record, 'returned'); }}>
                                                                    <RotateCcw size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7}>
                                                    <div className="py-10 text-center">
                                                        <p className="text-sm font-semibold">No archive records found</p>
                                                        <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Change filters or create a new archive record.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <ArchiveDetailPanel
                            record={selectedVisible}
                            onEdit={openEditDrawer}
                            onDelete={deleteRecord}
                            onUpdateStatus={updateStatus}
                        />

                        <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filteredArchiveRecords.length} onChange={setTablePage} />
                    </section>
                )}

                <ArchiveDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    archiveRecord={selectedArchive}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete archive record?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Delete <strong>{deleteTarget?.archiveNumber}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}