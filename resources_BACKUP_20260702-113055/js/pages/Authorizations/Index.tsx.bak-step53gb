import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CheckCircle2,
    Eye,
    Pencil,
    Plus,
    Send,
    ShieldCheck,
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
import { AuthorizationDrawer } from '@/features/authorizations/drawers/AuthorizationDrawer';
import { countByValue, filterByValue } from '@/lib/filters';
import type {
    AuthorizationDossierOption,
    AuthorizationFormPayload,
    AuthorizationRow,
    AuthorizationStatus,
} from '@/features/authorizations/types';

type PageProps = {
    authorizations: AuthorizationRow[];
    dossiers: AuthorizationDossierOption[];
    metrics: {
        total: number;
        notStarted: number;
        submitted: number;
        approved: number;
        received: number;
        observations: number;
    };
};

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function getStatusTone(status: AuthorizationStatus): BadgeTone {
    switch (status) {
        case 'not_started':
            return 'neutral';
        case 'submitted':
            return 'blue';
        case 'observations':
            return 'amber';
        case 'approved':
            return 'green';
        case 'received':
            return 'violet';
        case 'rejected':
            return 'red';
        default:
            return 'neutral';
    }
}

function getStatusIcon(status: AuthorizationStatus): 'dot' | 'check' | 'clock' | 'warning' {
    switch (status) {
        case 'approved':
        case 'received':
            return 'check';
        case 'observations':
        case 'rejected':
            return 'warning';
        case 'submitted':
            return 'clock';
        default:
            return 'dot';
    }
}

function toBackendPayload(payload: AuthorizationFormPayload) {
    return {
        dossier_id: payload.dossierId,
        authorization_number: payload.authorizationNumber || null,
        submission_number: payload.submissionNumber || null,
        authority_name: payload.authorityName || null,
        authority_type: payload.authorityType || null,
        status: payload.status || 'not_started',
        submitted_at: payload.submittedAt || null,
        approved_at: payload.approvedAt || null,
        received_at: payload.receivedAt || null,
        observations_text: payload.observationsText || null,
        notes: payload.notes || null,
    };
}

export default function AuthorizationsIndex({
    authorizations,
    dossiers,
    metrics,
}: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedAuthorization, setSelectedAuthorization] = useState<AuthorizationRow | null>(
        authorizations[0] ?? null,
    );
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const filteredAuthorizations = useMemo(
        () => filterByValue(authorizations, statusFilter, (authorization) => authorization.status),
        [authorizations, statusFilter],
    );

    const statusOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: authorizations.length },
            { id: 'not_started', label: 'Not started', count: countByValue(authorizations, (authorization) => authorization.status, 'not_started') },
            { id: 'submitted', label: 'Submitted', count: countByValue(authorizations, (authorization) => authorization.status, 'submitted') },
            { id: 'observations', label: 'Observations', count: countByValue(authorizations, (authorization) => authorization.status, 'observations') },
            { id: 'approved', label: 'Approved', count: countByValue(authorizations, (authorization) => authorization.status, 'approved') },
            { id: 'received', label: 'Received', count: countByValue(authorizations, (authorization) => authorization.status, 'received') },
        ],
        [authorizations],
    );
    function openCreateDrawer() {
        setSelectedAuthorization(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(authorization: AuthorizationRow) {
        setSelectedAuthorization(authorization);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: AuthorizationFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedAuthorization) {
            router.put(`/authorizations/${selectedAuthorization.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    toast.success('Authorization updated successfully.');
                },
                onError: () => toast.error('Please check authorization form errors.'),
            });

            return;
        }

        router.post('/authorizations', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                toast.success('Authorization created successfully.');
            },
            onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check authorization form errors. Maybe this dossier already has an authorization.');
                },
        });
    }

    function updateStatus(authorization: AuthorizationRow, status: string) {
        router.put(
            `/authorizations/${authorization.id}/status`,
            {
                status,
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Authorization status updated.'),
                onError: () => toast.error('Authorization status could not be updated.'),
            },
        );
    }

    function deleteAuthorization(authorization: AuthorizationRow) {
        const confirmed = window.confirm(
            `Delete authorization for ${authorization.dossierNumber}?`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(`/authorizations/${authorization.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Authorization deleted successfully.'),
            onError: () => toast.error('Authorization could not be deleted.'),
        });
    }

    const columns = useMemo<ColumnDef<AuthorizationRow, unknown>[]>(
        () => [
            {
                accessorKey: 'submissionNumber',
                header: 'Authorization',
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <ShieldCheck size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold">
                                    {row.original.submissionNumber || row.original.authorizationNumber || 'No number'}
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
                accessorKey: 'authorityName',
                header: 'Authority',
                cell: ({ row }) => (
                    <div>
                        <p className="max-w-[180px] truncate text-sm">
                            {row.original.authorityName || '-'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {row.original.authorityType || '-'}
                        </p>
                    </div>
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
                accessorKey: 'submittedAt',
                header: 'Submitted',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.submittedAt || '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'updatedAt',
                header: 'Updated',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.updatedAt || '-'}
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
                            onPress={() => setSelectedAuthorization(row.original)}
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
                            label="Submitted"
                            tone="documents"
                            onPress={() => updateStatus(row.original, 'submitted')}
                        >
                            <Send size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Approved"
                            tone="create"
                            onPress={() => updateStatus(row.original, 'approved')}
                        >
                            <CheckCircle2 size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Received"
                            tone="archive"
                            onPress={() => updateStatus(row.original, 'received')}
                        >
                            <ShieldCheck size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Delete"
                            tone="delete"
                            onPress={() => deleteAuthorization(row.original)}
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
            label: 'Authorizations',
            value: metrics.total,
        },
        {
            label: 'Submitted',
            value: metrics.submitted,
        },
        {
            label: 'Observations',
            value: metrics.observations,
        },
        {
            label: 'Received',
            value: metrics.received,
        },
    ];

    return (
        <>
            <Head title="Authorizations" />

            <AppShell
                eyebrowKey="authorizations.eyebrow"
                titleKey="authorizations.title"
                subtitleKey="authorizations.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New authorization
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
                            data={filteredAuthorizations}
                            columns={columns}
                            searchPlaceholder="Search by authorization, project, client, authority, or status..."
                            emptyTitle="No authorizations found"
                            emptyDescription="Create the first authorization follow-up from an existing project."
                            pageSize={8}
                        />
                    </div>

                    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
                        <AppCard className="p-5">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                    <ShieldCheck size={18} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold">Authorization preview</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Selected authorization information.
                                    </p>
                                </div>
                            </div>

                            {selectedAuthorization ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Project</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedAuthorization.projectObject}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {selectedAuthorization.dossierNumber} Ãƒâ€šÃ‚Â· {selectedAuthorization.clientName}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Authority</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {selectedAuthorization.authorityName || '-'}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {selectedAuthorization.authorityType || '-'}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Submitted</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {selectedAuthorization.submittedAt || '-'}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Approved</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {selectedAuthorization.approvedAt || '-'}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                            <p className="text-xs text-[var(--text-muted)]">Received</p>
                                            <p className="mt-1 text-sm font-semibold">
                                                {selectedAuthorization.receivedAt || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AppStatusBadge
                                            label={selectedAuthorization.status}
                                            tone={getStatusTone(selectedAuthorization.status)}
                                            icon={getStatusIcon(selectedAuthorization.status)}
                                        />
                                        <AppBadge tone="blue">
                                            {selectedAuthorization.observations.length} observations
                                        </AppBadge>
                                    </div>

                                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                        <p className="text-xs text-[var(--text-muted)]">Observations</p>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-muted)]">
                                            {selectedAuthorization.observationsText || 'No observations.'}
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <AppButton
                                            variant="primary"
                                            onPress={() => updateStatus(selectedAuthorization, 'submitted')}
                                        >
                                            <Send size={16} />
                                            Mark submitted
                                        </AppButton>

                                        <AppButton
                                            variant="secondary"
                                            onPress={() => updateStatus(selectedAuthorization, 'approved')}
                                        >
                                            <CheckCircle2 size={16} />
                                            Mark approved
                                        </AppButton>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">
                                    Select an authorization from the table.
                                </p>
                            )}
                        </AppCard>
                    </aside>
                </section>

                <AuthorizationDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    authorization={selectedAuthorization}
                    dossiers={dossiers}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                errors={formErrors}
                />
            </AppShell>
        </>
    );
}