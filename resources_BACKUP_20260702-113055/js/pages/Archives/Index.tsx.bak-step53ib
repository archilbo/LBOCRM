import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Archive,
    CheckCircle2,
    Eye,
    FolderOpen,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppFilterBar } from '@/components/ui/AppFilterBar';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import { countByValue, filterByValue } from '@/lib/filters';
import type {
    ArchiveDossierOption,
    ArchiveFormPayload,
    ArchiveRecordRow,
    ArchiveStatus,
} from '@/features/archives/types';

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

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function getStatusTone(status: ArchiveStatus): BadgeTone {
    switch (status) {
        case 'ready_to_archive':
            return 'amber';
        case 'stored':
            return 'green';
        case 'checked_out':
            return 'blue';
        case 'returned':
            return 'violet';
        case 'lost':
            return 'red';
        default:
            return 'neutral';
    }
}

function getStatusIcon(status: ArchiveStatus): 'dot' | 'check' | 'clock' | 'warning' {
    switch (status) {
        case 'stored':
        case 'returned':
            return 'check';
        case 'checked_out':
            return 'clock';
        case 'ready_to_archive':
        case 'lost':
            return 'warning';
        default:
            return 'dot';
    }
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

export default function ArchivesIndex({
    archiveRecords,
    dossiers,
    metrics,
}: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedArchive, setSelectedArchive] = useState<ArchiveRecordRow | null>(
        archiveRecords[0] ?? null,
    );

    const filteredArchiveRecords = useMemo(
        () => filterByValue(archiveRecords, statusFilter, (record) => record.status),
        [archiveRecords, statusFilter],
    );

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
                    toast.success('Archive record updated successfully.');
                },
                onError: () => toast.error('Please check archive form errors.'),
            });

            return;
        }

        router.post('/archives', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
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
            {
                status,
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Archive status updated.'),
                onError: () => toast.error('Archive status could not be updated.'),
            },
        );
    }

    function deleteRecord(record: ArchiveRecordRow) {
        const confirmed = window.confirm(`Delete ${record.archiveNumber}?`);

        if (!confirmed) {
            return;
        }

        router.delete(`/archives/${record.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Archive record deleted successfully.'),
            onError: () => toast.error('Archive record could not be deleted.'),
        });
    }

    const columns = useMemo<ColumnDef<ArchiveRecordRow, unknown>[]>(
        () => [
            {
                accessorKey: 'archiveNumber',
                header: 'Archive',
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <Archive size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold">
                                    {row.original.archiveNumber}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {row.original.dossierNumber}
                                </p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'projectObject',
                header: 'Project',
                cell: ({ row }) => (
                    <div>
                        <p className="max-w-[240px] truncate text-sm font-medium">
                            {row.original.projectObject}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {row.original.clientName}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'locationLabel',
                header: 'Location',
                cell: ({ row }) => (
                    <span className="max-w-[220px] truncate text-sm text-[var(--text-muted)]">
                        {row.original.locationLabel}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <AppStatusBadge
                        label={row.original.status}
                        tone={getStatusTone(row.original.status)}
                        icon={getStatusIcon(row.original.status)}
                    />
                ),
            },
            {
                accessorKey: 'inDate',
                header: 'In date',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.inDate || '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'outDate',
                header: 'Out date',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.outDate || '-'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <AppTableActions>
                        <AppTableActionButton
                            label="Preview"
                            tone="view"
                            onPress={() => setSelectedArchive(row.original)}
                        >
                            <Eye size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Edit"
                            tone="edit"
                            onPress={() => openEditDrawer(row.original)}
                        >
                            <Pencil size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Stored"
                            tone="create"
                            onPress={() => updateStatus(row.original, 'stored')}
                        >
                            <CheckCircle2 size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Checked out"
                            tone="documents"
                            onPress={() => updateStatus(row.original, 'checked_out')}
                        >
                            <FolderOpen size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Returned"
                            tone="archive"
                            onPress={() => updateStatus(row.original, 'returned')}
                        >
                            <RotateCcw size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Delete"
                            tone="delete"
                            onPress={() => deleteRecord(row.original)}
                        >
                            <Trash2 size={15} />
                        </AppTableActionButton>
                    </AppTableActions>
                ),
            },
        ],
        [],
    );

    const metricCards = [
        {
            label: 'Archives',
            value: metrics.total,
        },
        {
            label: 'Ready',
            value: metrics.ready,
        },
        {
            label: 'Stored',
            value: metrics.stored,
        },
        {
            label: 'Checked out',
            value: metrics.checkedOut,
        },
    ];

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
                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-w-0">
                        <AppDataTable
                            data={filteredArchiveRecords}
                            columns={columns}
                            searchPlaceholder="Search by archive number, project, client, location, or status..."
                            emptyTitle="No archive records found"
                            emptyDescription="Create the first archive record from a completed project."
                            pageSize={8}
                        />
                    </div>

                    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
                        <AppCard className="p-5">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                    <Archive size={18} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">Archive preview</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Selected archive record information.
                                    </p>
                                </div>
                            </div>

                            {selectedArchive ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Archive</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedArchive.archiveNumber}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {selectedArchive.dossierNumber} Ãƒâ€šÃ‚Â· {selectedArchive.clientName}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Project</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedArchive.projectObject}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Location</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {selectedArchive.locationLabel}
                                            </p>
                                        </div>

                                        <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-1">
                                            <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                                <p className="text-xs text-[var(--text-muted)]">In date</p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {selectedArchive.inDate || '-'}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                                <p className="text-xs text-[var(--text-muted)]">Out date</p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {selectedArchive.outDate || '-'}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                                <p className="text-xs text-[var(--text-muted)]">Returned</p>
                                                <p className="mt-1 text-sm font-semibold">
                                                    {selectedArchive.returnedAt || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AppStatusBadge
                                            label={selectedArchive.status}
                                            tone={getStatusTone(selectedArchive.status)}
                                            icon={getStatusIcon(selectedArchive.status)}
                                        />
                                        <AppBadge tone="blue">
                                            {selectedArchive.requestedBy || 'No requester'}
                                        </AppBadge>
                                    </div>

                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Notes</p>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">
                                            {selectedArchive.notes || 'No notes.'}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <AppButton
                                            variant="primary"
                                            onPress={() => updateStatus(selectedArchive, 'stored')}
                                        >
                                            <CheckCircle2 size={16} />
                                            Mark stored
                                        </AppButton>

                                        <AppButton
                                            variant="secondary"
                                            onPress={() => updateStatus(selectedArchive, 'checked_out')}
                                        >
                                            <FolderOpen size={16} />
                                            Check out
                                        </AppButton>

                                        <AppButton
                                            variant="secondary"
                                            onPress={() => updateStatus(selectedArchive, 'returned')}
                                        >
                                            <RotateCcw size={16} />
                                            Mark returned
                                        </AppButton>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">
                                    Select an archive record from the table.
                                </p>
                            )}
                        </AppCard>
                    </aside>
                </section>

                <ArchiveDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    archiveRecord={selectedArchive}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                errors={formErrors}
                />
            </AppShell>
        </>
    );
}