import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Mail, Pencil, Phone, Plus, Trash2, UserRound, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { IntermediaryDrawer } from '@/features/intermediaries/drawers/IntermediaryDrawer';
import type { IntermediaryFormPayload, IntermediaryRow } from '@/features/intermediaries/types';
import type { FormErrors } from '@/lib/formErrors';

type PageProps = {
    intermediaries: IntermediaryRow[];
    metrics: {
        total: number;
        active: number;
        inactive: number;
        linkedClients: number;
    };
};

function toBackendPayload(payload: IntermediaryFormPayload) {
    return {
        name: payload.name,
        type: payload.type || 'person',
        phone: payload.phone || null,
        email: payload.email || null,
        notes: payload.notes || null,
        is_active: payload.isActive,
    };
}

function typeLabel(type: string) {
    switch (type) {
        case 'person':
            return 'Personne';
        case 'agency':
            return 'Agence';
        case 'architect_partner':
            return 'Partenaire';
        case 'business_referral':
            return 'Apporteur';
        default:
            return type || 'Autre';
    }
}

export default function IntermediariesIndex({ intermediaries, metrics }: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedIntermediary, setSelectedIntermediary] = useState<IntermediaryRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    function openCreateDrawer() {
        setSelectedIntermediary(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(intermediary: IntermediaryRow) {
        setSelectedIntermediary(intermediary);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: IntermediaryFormPayload) {
        if (drawerMode === 'edit' && selectedIntermediary) {
            router.put(`/intermediaries/${selectedIntermediary.id}`, toBackendPayload(payload), {
                preserveScroll: true,
                onSuccess: () => {
                    setDrawerOpen(false);
                    toast.success('Intermediaire modifie avec succes.');
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error('Veuillez verifier le formulaire.');
                },
            });
            return;
        }

        router.post('/intermediaries', toBackendPayload(payload), {
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                toast.success('Intermediaire cree avec succes.');
            },
            onError: (errors) => {
                setFormErrors(errors as FormErrors);
                toast.error('Veuillez verifier le formulaire.');
            },
        });
    }

    function deleteIntermediary(intermediary: IntermediaryRow) {
        if (!window.confirm(`Supprimer ${intermediary.name} ?`)) {
            return;
        }

        router.delete(`/intermediaries/${intermediary.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Intermediaire supprime avec succes.'),
            onError: () => toast.error('Impossible de supprimer cet intermediaire.'),
        });
    }

    const columns = useMemo<ColumnDef<IntermediaryRow, unknown>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Intermediaire',
            cell: ({ row }) => (
                <div className="app-table-primary-cell">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                            <UserRound size={15} />
                        </div>
                        <div className="min-w-0">
                            <p className="max-w-[260px] truncate text-sm font-semibold">{row.original.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{row.original.code}</p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <AppBadge tone="violet">{typeLabel(row.original.type)}</AppBadge>,
        },
        {
            accessorKey: 'phone',
            header: 'Contact',
            cell: ({ row }) => (
                <div className="space-y-1 text-sm text-[var(--text-muted)]">
                    <p className="inline-flex items-center gap-1">
                        <Phone size={13} />
                        {row.original.phone || '-'}
                    </p>
                    <p className="inline-flex items-center gap-1">
                        <Mail size={13} />
                        {row.original.email || '-'}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'clientsCount',
            header: 'Clients',
            cell: ({ row }) => (
                <AppBadge tone="blue">
                    <Users size={12} />
                    {row.original.clientsCount}
                </AppBadge>
            ),
        },
        {
            accessorKey: 'isActive',
            header: 'Statut',
            cell: ({ row }) => (
                <AppStatusBadge
                    label={row.original.isActive ? 'Actif' : 'Inactif'}
                    tone={row.original.isActive ? 'green' : 'neutral'}
                    icon={row.original.isActive ? 'check' : 'clock'}
                />
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Maj',
            cell: ({ row }) => (
                <span className="text-sm text-[var(--text-muted)]">{row.original.updatedAt || '-'}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <AppTableActions>
                    <AppTableActionButton
                        label="Modifier"
                        tone="edit"
                        onPress={() => openEditDrawer(row.original)}
                    >
                        <Pencil size={15} />
                    </AppTableActionButton>
                    <AppTableActionButton
                        label="Supprimer"
                        tone="delete"
                        onPress={() => deleteIntermediary(row.original)}
                    >
                        <Trash2 size={15} />
                    </AppTableActionButton>
                </AppTableActions>
            ),
        },
    ], []);

    const metricCards = [
        { label: 'Total', value: metrics.total },
        { label: 'Actifs', value: metrics.active },
        { label: 'Inactifs', value: metrics.inactive },
        { label: 'Clients lies', value: metrics.linkedClients },
    ];

    return (
        <>
            <Head title="Intermediaires" />

            <AppShell
                eyebrowKey="intermediaries.eyebrow"
                titleKey="intermediaries.title"
                subtitleKey="intermediaries.subtitle"
                action={
                    <AppButton variant="primary" onPress={openCreateDrawer}>
                        <Plus size={16} />
                        Nouvel intermediaire
                    </AppButton>
                }
            >
                <section className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <AppDataTable
                    data={intermediaries}
                    columns={columns}
                    searchPlaceholder="Rechercher par nom, code, telephone, email ou type..."
                    emptyTitle="Aucun intermediaire"
                    emptyDescription="Creez le premier intermediaire pour le selectionner dans les clients."
                    pageSize={10}
                />

                <IntermediaryDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    intermediary={selectedIntermediary}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />
            </AppShell>
        </>
    );
}
