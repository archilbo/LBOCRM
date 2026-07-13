import { Head, router } from '@inertiajs/react';
import {
    Archive,
    CheckCircle2,
    Eye,
    FolderKanban,
    FolderOpen,
    Pencil,
    Plus,
    RefreshCw,
    RotateCcw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import { countByValue, filterByValue } from '@/lib/filters';
import type {
    ArchiveDossierOption,
    ArchiveFormPayload,
    ArchiveRecordRow,
    ArchiveStatus,
} from '@/features/archives/types';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

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

function statusConfig(status: ArchiveStatus) {
    if (status === 'stored') return { color: 'success' as const, label: 'Stored' };
    if (status === 'checked_out') return { color: 'primary' as const, label: 'Checked out' };
    if (status === 'returned') return { color: 'warning' as const, label: 'Returned' };
    if (status === 'lost') return { color: 'danger' as const, label: 'Lost' };
    return { color: 'default' as const, label: 'Ready' };
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

function ArchiveTimeline({ record }: { record: ArchiveRecordRow }) {
    return (
        <div className="space-y-2">
            {archiveFlow(record).map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                    <span className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full border',
                        item.done
                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                            : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-subtle)]',
                    )}>
                        {item.done ? <CheckCircle2 size={14} /> : <Archive size={14} />}
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{item.date || '-'}</p>
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
            <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <p className="text-sm font-semibold text-[var(--foreground)]">Archive details</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Select an archive record to see location, status, and checkout history.
                </p>
            </aside>
        );
    }

    const cfg = statusConfig(record.status);

    return (
        <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
            <div className="border-b border-[var(--border)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Selected archive</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-[var(--foreground)]">{record.archiveNumber}</h2>
                        <p className="text-sm text-[var(--text-muted)]">{record.dossierNumber}</p>
                    </div>

                    <StatusPill label={cfg.label} color={cfg.color} size="sm" />
                </div>
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Project</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.projectObject}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{record.clientName}</p>
                    </div>

                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Location</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.locationLabel || '-'}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">Room / shelf / box / folder</p>
                    </div>

                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Checked out</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.outDate || '-'}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{record.requestedBy || 'No requester'}</p>
                    </div>

                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Returned</p>
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.returnedAt || '-'}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">Return tracking</p>
                    </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[var(--foreground)]">Archive flow</p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {archiveFlow(record).filter((item) => item.done).length}/4 done
                        </p>
                    </div>
                    <ArchiveTimeline record={record} />
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Notes</p>
                    <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">
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
                className={cn(
                    'flex w-full items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-3 text-left transition',
                    active
                        ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                )}
            >
                <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{title}</span>
                    <span className="block truncate text-xs opacity-75">{subtitle}</span>
                </span>
            </button>
        );
    }

    return (
        <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="grid min-h-[620px] grid-cols-1 xl:grid-cols-[220px_220px_minmax(0,1fr)]">
                <aside className="border-b border-[var(--border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Rooms</p>
                        <p className="text-xs text-[var(--text-muted)]">{roomNames.length} room(s)</p>
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

                <aside className="border-b border-[var(--border)] xl:border-b-0 xl:border-r">
                    <div className="border-b border-[var(--border)] p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-subtle)]">Shelves</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{selectedRoom}</p>
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
                    <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Storage browser</p>
                            <h2 className="mt-1 truncate text-lg font-semibold text-[var(--foreground)]">{selectedRoom} / {selectedShelf}</h2>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">{recordsInShelf.length} visible archive(s)</p>
                        </div>

                        <div className="relative w-full xl:w-[340px]">
                            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search archives in shelf..."
                                className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-9 text-[13px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                            />
                        </div>
                    </div>

                    <div className="app-scrollbar max-h-[560px] space-y-3 overflow-y-auto p-4">
                        {recordsInShelf.length > 0 ? recordsInShelf.map((record) => {
                            const cfg = statusConfig(record.status);
                            return (
                                <button
                                    key={record.id}
                                    type="button"
                                    onClick={() => onSelect(record)}
                                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-left transition hover:border-[var(--accent)]/40"
                                >
                                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                                    <Archive size={16} />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-[var(--foreground)]">{record.archiveNumber}</p>
                                                    <p className="truncate text-xs text-[var(--text-muted)]">{record.projectObject}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusPill label={cfg.label} color={cfg.color} size="sm" />
                                            <span className="text-xs text-[var(--text-muted)]">{record.locationLabel}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        }) : (
                            <div className="py-16 text-center">
                                <p className="text-sm font-semibold text-[var(--foreground)]">No archives found</p>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">Choose another shelf or clear search.</p>
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
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedArchive, setSelectedArchive] = useState<ArchiveRecordRow | null>(
        archiveRecords[0] ?? null,
    );
    const [previewArchive, setPreviewArchive] = useState<ArchiveRecordRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
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

    const selectedVisible = selectedArchive && filteredArchiveRecords.some((record) => record.id === selectedArchive.id)
        ? selectedArchive
        : filteredArchiveRecords[0] ?? null;

    const metricCards = useMemo(() => [
        { label: 'Total archives', value: metrics.total, detail: 'All physical archive records', icon: <Archive size={16} /> },
        { label: 'Ready', value: metrics.ready, detail: 'Waiting storage' },
        { label: 'Stored', value: metrics.stored, detail: 'Inside archive room' },
        { label: 'Checked out', value: metrics.checkedOut, detail: 'Currently outside' },
        { label: 'Returned', value: metrics.returned, detail: 'Back from checkout' },
    ], [metrics]);

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

            <AppShell>
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('archivesWorkspace.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('archivesWorkspace.title')}
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                            {t('archivesWorkspace.subtitle')}
                        </p>
                    </div>
                    <AppButton variant="solid" color="primary" size="sm" className="h-9 shrink-0" onPress={openCreateDrawer}>
                        <Plus size={15} /> {t('archivesWorkspace.newArchive')}
                    </AppButton>
                </header>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {metricCards.map((card) => (
                        <div key={card.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md">
                            <div className={cn(
                                'mb-2 flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]',
                                card.label === 'Ready' && metrics.ready > 0 ? 'text-amber-500' : '',
                                card.label === 'Stored' && metrics.stored > 0 ? 'text-emerald-500' : '',
                                card.label === 'Checked out' && metrics.checkedOut > 0 ? 'text-sky-500' : '',
                                card.label === 'Returned' && metrics.returned > 0 ? 'text-violet-500' : '',
                            )}>
                                {card.icon || <Archive size={16} />}
                            </div>
                            <p className="text-[12px] font-medium text-[var(--text-muted)]">{card.label}</p>
                            <p className={cn('mt-0.5 text-2xl font-semibold text-[var(--foreground)]')}>{card.value}</p>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
                        </div>
                    ))}
                </section>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('archivesWorkspace.searchPlaceholder')}
                            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-[13px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                        />
                        {query ? (
                            <button type="button" onClick={() => setQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--foreground)]">
                                <X size={13} />
                            </button>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => (
                            <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)}
                                className={cn(
                                    'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition',
                                    statusFilter === option.id
                                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
                                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--foreground)]',
                                )}>
                                {option.label}
                                <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">{option.count}</span>
                            </button>
                        ))}
                    </div>

                    <button type="button" onClick={() => { setViewMode(viewMode === 'workspace' ? 'storage' : 'workspace'); }}
                        className={cn(
                            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition',
                            viewMode === 'storage'
                                ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
                                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--foreground)]',
                        )}>
                        {viewMode === 'storage' ? 'Workspace' : 'Storage'}
                    </button>

                    <button type="button" onClick={() => router.reload({ preserveScroll: true })}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 text-[12px] font-medium text-[var(--text-muted)] transition hover:text-[var(--foreground)]">
                        <RefreshCw size={13} />
                    </button>
                </div>

                {viewMode === 'storage' ? (
                    <StorageBrowser records={filteredArchiveRecords} onSelect={setSelectedArchive} />
                ) : (
                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-[var(--foreground)]">Archive workspace</p>
                                    <p className="text-xs text-[var(--text-muted)]">{filteredArchiveRecords.length} visible archive(s)</p>
                                </div>

                                <AppButton variant="secondary" size="sm" onPress={() => setStatusFilter('all')}>
                                    Reset
                                </AppButton>
                            </div>

                            <div className="app-scrollbar overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--border)]">
                                            {[
                                                { key: 'archive', label: t('archivesWorkspace.table.archive') },
                                                { key: 'project', label: t('archivesWorkspace.table.project') },
                                                { key: 'location', label: t('archivesWorkspace.table.location') },
                                                { key: 'status', label: t('archivesWorkspace.table.status') },
                                                { key: 'dates', label: 'Dates' },
                                                { key: 'requester', label: 'Requester' },
                                                { key: null, label: '' },
                                            ].map((col) => (
                                                <th key={col.label || 'actions'}
                                                    className="h-10 px-3 text-[12px] font-semibold text-[var(--text-muted)] text-left whitespace-nowrap">
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredArchiveRecords.length > 0 ? (
                                            filteredArchiveRecords.map((record) => {
                                                const selected = selectedVisible?.id === record.id;
                                                const cfg = statusConfig(record.status);

                                                return (
                                                    <tr
                                                        key={record.id}
                                                        className={cn(
                                                            'border-b border-[var(--border)] transition last:border-0 cursor-pointer',
                                                            selected
                                                                ? 'bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
                                                                : 'hover:bg-[var(--surface-2)]',
                                                        )}
                                                        onClick={() => { setSelectedArchive(record); setPreviewArchive(record); }}
                                                    >
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                                                    <Archive size={16} />
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <p className="max-w-[220px] truncate font-semibold text-[var(--foreground)]">{record.archiveNumber}</p>
                                                                    <p className="text-xs text-[var(--text-muted)]">{record.dossierNumber}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-start gap-2">
                                                                <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--text-subtle)]" />
                                                                <div className="min-w-0">
                                                                    <p className="max-w-[230px] truncate font-medium text-[var(--foreground)]">{record.projectObject}</p>
                                                                    <p className="max-w-[230px] truncate text-xs text-[var(--text-muted)]">{record.clientName}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <p className="max-w-[220px] truncate font-medium text-[var(--foreground)]">{record.locationLabel || '-'}</p>
                                                            <p className="max-w-[220px] truncate text-xs text-[var(--text-muted)]">
                                                                Room {record.room || '-'} / Shelf {record.shelf || '-'}
                                                            </p>
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <StatusPill label={cfg.label} color={cfg.color} size="sm" />
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <p className="text-xs text-[var(--text-muted)]">In: {record.inDate || '-'}</p>
                                                            <p className="text-xs text-[var(--text-muted)]">Out: {record.outDate || '-'}</p>
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <p className="max-w-[150px] truncate text-[var(--text-muted)]">{record.requestedBy || '-'}</p>
                                                        </td>

                                                        <td className="px-3 py-2.5">
                                                            <div className="flex justify-end gap-1">
                                                                <button type="button" className={cn(
                                                                    'flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                                                )} title="Preview" onClick={(event) => { event.stopPropagation(); setPreviewArchive(record); }}>
                                                                    <Eye size={14} />
                                                                </button>
                                                                <button type="button" className={cn(
                                                                    'flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                                                )} title="Edit" onClick={(event) => { event.stopPropagation(); openEditDrawer(record); }}>
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button type="button" className={cn(
                                                                    'flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                                                )} title="Stored" onClick={(event) => { event.stopPropagation(); updateStatus(record, 'stored'); }}>
                                                                    <CheckCircle2 size={14} />
                                                                </button>
                                                                <button type="button" className={cn(
                                                                    'flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                                                )} title="Checked out" onClick={(event) => { event.stopPropagation(); updateStatus(record, 'checked_out'); }}>
                                                                    <FolderOpen size={14} />
                                                                </button>
                                                                <button type="button" className={cn(
                                                                    'flex size-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                                                                )} title="Returned" onClick={(event) => { event.stopPropagation(); updateStatus(record, 'returned'); }}>
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
                                                        <p className="text-sm font-semibold text-[var(--foreground)]">{t('archivesWorkspace.emptyTitle')}</p>
                                                        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('archivesWorkspace.emptyDescription')}</p>
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
                    </section>
                )}

                <AppDrawer
                    isOpen={!!previewArchive}
                    onOpenChange={(open) => { if (!open) setPreviewArchive(null); }}
                    title={previewArchive?.archiveNumber || ''}
                    classNames={{ base: 'max-w-[480px]' }}
                >
                    {previewArchive ? (
                        <ArchivePreviewContent record={previewArchive} onEdit={openEditDrawer}
                            onDelete={() => { setDeleteTarget(previewArchive); setPreviewArchive(null); }}
                            onUpdateStatus={updateStatus} />
                    ) : null}
                </AppDrawer>

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
                        <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton color="danger" variant="solid" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}

function ArchivePreviewContent({ record, onEdit, onDelete, onUpdateStatus }: {
    record: ArchiveRecordRow;
    onEdit: (record: ArchiveRecordRow) => void;
    onDelete: (record: ArchiveRecordRow) => void;
    onUpdateStatus: (record: ArchiveRecordRow, status: string) => void;
}) {
    const cfg = statusConfig(record.status);

    return (
        <div className="space-y-5 pb-8">
            <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                    <Archive size={18} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                        {record.archiveNumber}
                        <StatusPill label={cfg.label} color={cfg.color} size="sm" />
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{record.projectObject || '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Project</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.projectObject || '-'}</p>
                    <p className="truncate text-xs text-[var(--text-muted)]">{record.clientName || ''}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Dossier</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.dossierNumber || '-'}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Location</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.locationLabel || '-'}</p>
                    <p className="truncate text-xs text-[var(--text-muted)]">Room {record.room || '-'} / Shelf {record.shelf || '-'}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Requester</p>
                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{record.requestedBy || '-'}</p>
                </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Dates</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[var(--surface-2)] p-2">
                        <p className="text-[10px] text-[var(--text-muted)]">In</p>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{record.inDate || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--surface-2)] p-2">
                        <p className="text-[10px] text-[var(--text-muted)]">Out</p>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{record.outDate || '-'}</p>
                    </div>
                    <div className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface-2))] p-2">
                        <p className="text-[10px] text-[var(--accent)]">Returned</p>
                        <p className="text-sm font-semibold text-[var(--accent)]">{record.returnedAt || '-'}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Archive flow</p>
                <ArchiveTimeline record={record} />
            </div>

            {record.notes ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Notes</p>
                    <p className="text-sm text-[var(--text-muted)]">{record.notes}</p>
                </div>
            ) : null}

            <div className="flex flex-col gap-2">
                <AppButton variant="solid" color="primary" size="sm" onPress={() => { onEdit(record); }}>
                    <Pencil size={14} /> Edit archive
                </AppButton>
                <AppButton variant="solid" color="primary" size="sm" onPress={() => onUpdateStatus(record, 'stored')}>
                    <CheckCircle2 size={14} /> Mark stored
                </AppButton>
                <div className="grid grid-cols-2 gap-2">
                    <AppButton variant="bordered" size="sm" onPress={() => onUpdateStatus(record, 'checked_out')}>
                        <FolderOpen size={14} /> Check out
                    </AppButton>
                    <AppButton variant="bordered" size="sm" onPress={() => onUpdateStatus(record, 'returned')}>
                        <RotateCcw size={14} /> Returned
                    </AppButton>
                </div>
                <AppButton variant="solid" color="danger" size="sm" onPress={() => onDelete(record)}>
                    <Trash2 size={14} /> Delete archive
                </AppButton>
            </div>
        </div>
    );
}
