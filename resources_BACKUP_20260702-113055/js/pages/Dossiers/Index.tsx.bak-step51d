import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Archive,
    Eye,
    FileText,
    FolderKanban,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormErrors } from '@/lib/formErrors';
import { countByValue, filterByValue } from '@/lib/filters';
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
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import type {
    ClientOption,
    DossierFormPayload,
    DossierRow,
} from '@/features/dossiers/types';
import { useTranslation } from '@/lib/i18n';

type PageProps = {
    dossiers: DossierRow[];
    clients: ClientOption[];
    metrics: {
        total: number;
        active: number;
        opened: number;
        closed: number;
    };
};

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

function getStatusTone(status: string): BadgeTone {
    switch (status) {
        case 'active':
            return 'green';
        case 'opened':
            return 'blue';
        case 'closed':
            return 'neutral';
        case 'archived':
            return 'violet';
        default:
            return 'amber';
    }
}

function toBackendPayload(payload: DossierFormPayload) {
    return {
        client_id: payload.clientId,
        project_object: payload.projectObject,
        description: payload.description || null,
        project_address: payload.projectAddress || null,
        province: payload.province || null,
        commune: payload.commune || null,
        land_title_number: payload.landTitleNumber || null,
        land_surface: payload.landSurface || null,
        floor_area: payload.floorArea || null,
        status: payload.status || 'opened',
        workflow_step: payload.workflowStep || 'client',
        notes: payload.notes || null,
    };
}

export default function DossiersIndex({
    dossiers,
    clients,
    metrics,
}: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [workflowFilter, setWorkflowFilter] = useState('all');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(null);

    function openCreateDrawer() {
        setSelectedDossier(null);
        setDrawerMode('create');
        setFormErrors({});
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(dossier: DossierRow) {
        setSelectedDossier(dossier);
        setDrawerMode('edit');
        setFormErrors({});
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: DossierFormPayload) {
        const backendPayload = toBackendPayload(payload);

        if (drawerMode === 'edit' && selectedDossier) {
            router.put(`/dossiers/${selectedDossier.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    setFormErrors({});
                    toast.success('Project updated successfully.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check project form errors.');
                },
            });

            return;
        }

        router.post('/dossiers', backendPayload, {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                    setFormErrors({});
                toast.success('Project created successfully.');
            },
            onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Please check project form errors.');
                },
        });
    }

    function deleteDossier(dossier: DossierRow) {
        const confirmed = window.confirm(`Delete ${dossier.dossierNumber}?`);

        if (!confirmed) {
            return;
        }

        router.delete(`/dossiers/${dossier.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Project deleted successfully.'),
            onError: () => toast.error('Project could not be deleted.'),
        });
    }

    const filteredDossiers = useMemo(() => filterByValue(dossiers, workflowFilter, (dossier) => dossier.workflowStep), [dossiers, workflowFilter]);

    const workflowOptions = useMemo(() => [
        { id: 'all', label: 'All', count: dossiers.length },
        { id: 'client', label: 'Client', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'client') },
        { id: 'documents', label: 'Documents', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'documents') },
        { id: 'contract', label: 'Contract', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'contract') },
        { id: 'authorization', label: 'Authorization', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'authorization') },
        { id: 'finance', label: 'Finance', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'finance') },
        { id: 'archive', label: 'Archive', count: countByValue(dossiers, (dossier) => dossier.workflowStep, 'archive') },
    ], [dossiers]);

    const columns = useMemo<ColumnDef<DossierRow, unknown>[]>(
        () => [
            {
                accessorKey: 'dossierNumber',
                header: 'Project',
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <FolderKanban size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[260px] truncate text-sm font-semibold">
                                    {row.original.projectObject}
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
                accessorKey: 'clientName',
                header: 'Client',
                cell: ({ row }) => (
                    <div>
                        <p className="max-w-[220px] truncate text-sm font-medium">
                            {row.original.clientName}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {row.original.clientNumber}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'commune',
                header: 'Commune',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.commune || '-'}
                    </span>
                ),
            },
            {
                accessorKey: 'floorArea',
                header: 'Surface',
                cell: ({ row }) => (
                    <AppBadge tone="blue">
                        {row.original.floorArea ? `${row.original.floorArea} mÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²` : '-'}
                    </AppBadge>
                ),
            },
            {
                accessorKey: 'workflowStep',
                header: 'Step',
                cell: ({ row }) => (
                    <AppBadge tone="violet">{row.original.workflowStep}</AppBadge>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <AppStatusBadge
                        label={row.original.status}
                        tone={getStatusTone(row.original.status)}
                        icon={row.original.status === 'active' ? 'check' : 'clock'}
                    />
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
                            label="View"
                            tone="view"
                            onPress={() => router.visit(`/dossiers/${row.original.id}`)}
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
                            label="Documents"
                            tone="documents"
                            onPress={() => router.visit('/documents')}
                        >
                            <FileText size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Archive"
                            tone="archive"
                            onPress={() => router.visit('/archives')}
                        >
                            <Archive size={15} />
                        </AppTableActionButton>

                        <AppTableActionButton
                            label="Delete"
                            tone="delete"
                            onPress={() => deleteDossier(row.original)}
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
            label: 'Total projects',
            value: metrics.total,
        },
        {
            label: 'Active',
            value: metrics.active,
        },
        {
            label: 'Opened',
            value: metrics.opened,
        },
        {
            label: 'Closed',
            value: metrics.closed,
        },
    ];

    return (
        <>
            <Head title={t('dossiers.title')} />

            <AppShell
                eyebrowKey="dossiers.eyebrow"
                titleKey="dossiers.title"
                subtitleKey="dossiers.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        New project
                    </AppButton>
                }
            >
                <AppFilterBar
                    label="Workflow filter"
                    value={workflowFilter}
                    options={workflowOptions}
                    onChange={setWorkflowFilter}
                />

                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <AppDataTable
                    data={filteredDossiers}
                    columns={columns}
                    searchPlaceholder="Search by project, client, dossier number, commune, or status..."
                    emptyTitle="No projects found"
                    emptyDescription="Create the first project from the New Project button."
                    pageSize={8}
                />

                <ProjectDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    dossier={selectedDossier}
                    clients={clients}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}