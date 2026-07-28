import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft, Building2, Calendar, CheckCircle2, FileText, FolderKanban,
    Mail, MapPin, Phone, Pencil, Plus, Trash2, UserRound, Users, XCircle, Archive,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { IntermediaryDrawer } from '@/features/intermediaries/drawers/IntermediaryDrawer';
import type {
    ClientBrief, IntermediaryFormPayload, IntermediaryRow,
    IntermediaryShowProps, MonthlyCount, ProjectBrief, StatusCount,
} from '@/features/intermediaries/types';
import type { FormErrors } from '@/lib/formErrors';
import { useTranslation } from '@/lib/i18n';

type TabId = 'overview' | 'clients' | 'projects' | 'analytics' | 'activity';

const TABS: { id: TabId; labelKey: string }[] = [
    { id: 'overview', labelKey: 'intermediaries.overview' },
    { id: 'clients', labelKey: 'intermediaries.clients' },
    { id: 'projects', labelKey: 'intermediaries.projects' },
    { id: 'analytics', labelKey: 'intermediaries.analytics' },
    { id: 'activity', labelKey: 'intermediaries.activity' },
];

function typeLabel(type: string) {
    switch (type) {
        case 'person': return 'Person';
        case 'agency': return 'Agency';
        case 'architect_partner': return 'Architect partner';
        case 'business_referral': return 'Business referral';
        default: return type || 'Other';
    }
}

import { MiniLineChart } from '@/components/charts/MiniLineChart';
import { DonutChart } from '@/components/charts/DonutChart';

function useIntermediaryDetail() {
    const { t } = useTranslation();

    function openIntermediaryEdit(intermediary: IntermediaryRow) {
        setDrawerMode('edit');
        setSelectedIntermediary(intermediary);
        setFormErrors({});
        setDrawerOpen(true);
    }

    function confirmIntermediaryDelete() {
        if (!deleteTarget) return;
        router.delete(`/intermediaries/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('intermediaries.deleteSuccess'));
                setDeleteTarget(null);
                router.visit('/intermediaries');
            },
            onError: () => toast.error('Cannot delete this intermediary.'),
        });
    }

    return { openIntermediaryEdit, confirmIntermediaryDelete };
}

export default function IntermediaryShow({
    intermediary, metrics, monthlyClients, monthlyProjects,
    clientStatusBreakdown, projectStatusBreakdown, clients, projects,
}: IntermediaryShowProps) {
    const { t } = useTranslation();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('edit');
    const [selectedIntermediary, setSelectedIntermediary] = useState<IntermediaryRow | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteTarget, setDeleteTarget] = useState<IntermediaryRow | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    function handleSubmit(payload: IntermediaryFormPayload) {
        if (!selectedIntermediary) return;
        router.put(`/intermediaries/${selectedIntermediary.id}`, {
            name: payload.name,
            type: payload.type || 'person',
            phone: payload.phone || null,
            email: payload.email || null,
            notes: payload.notes || null,
            is_active: payload.isActive,
        }, {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); toast.success(t('intermediaries.updateSuccess')); },
            onError: (errors) => { setFormErrors(errors as FormErrors); toast.error(t('intermediaries.formError')); },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/intermediaries/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success(t('intermediaries.deleteSuccess')); setDeleteTarget(null); router.visit('/intermediaries'); },
            onError: () => toast.error('Cannot delete this intermediary.'),
        });
    }

    const totalProjects = metrics.totalProjects;
    const totalClients = metrics.totalClients;

    const statsItems = [
        { label: t('intermediaries.totalClients'), value: totalClients, color: 'text-[var(--accent)]' },
        { label: t('intermediaries.activeClients'), value: metrics.activeClients, color: 'text-emerald-400' },
        { label: t('intermediaries.linkedProjects'), value: totalProjects, color: 'text-blue-400' },
        { label: t('intermediaries.inactiveClients'), value: metrics.inactiveClients, color: 'text-amber-400' },
        { label: t('intermediaries.archivedClients'), value: metrics.archivedClients, color: 'text-purple-400' },
        { label: t('intermediaries.latestClient'), value: metrics.latestClientName || '-', color: 'text-[var(--text-muted)]', small: true },
    ];

    const needAttention = [
        { label: t('intermediaries.inactiveClients'), value: metrics.inactiveClients, color: 'text-amber-400' },
        { label: 'Archived projects', value: metrics.archivedProjects, color: 'text-purple-400' },
        { label: 'Active projects', value: metrics.activeProjects, color: 'text-emerald-400' },
    ];

    return (
        <>
            <Head title={intermediary.name} />

            <AppShell>
                {/* Top bar */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <button type="button" onClick={() => router.visit('/intermediaries')}
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                            <ArrowLeft size={15} />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-xl font-bold text-[var(--foreground)]">{intermediary.name}</h1>
                                <StatusPill
                                    label={intermediary.isActive ? 'Active' : 'Inactive'}
                                    color={intermediary.isActive ? 'success' : 'warning'}
                                    size="sm"
                                />
                                <AppBadge tone="violet">{typeLabel(intermediary.type)}</AppBadge>
                            </div>
                            <p className="text-[12px] text-[var(--text-muted)]">{intermediary.code}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <AppButton variant="bordered" size="sm"
                            onPress={() => { setSelectedIntermediary(intermediary); setDrawerMode('edit'); setFormErrors({}); setDrawerOpen(true); }}>
                            <Pencil size={14} />
                            {t('intermediaries.editIntermediary')}
                        </AppButton>
                        <AppButton color="danger" variant="bordered" size="sm"
                            onPress={() => setDeleteTarget(intermediary)}>
                            <Trash2 size={14} />
                            {t('intermediaries.deleteIntermediary')}
                        </AppButton>
                    </div>
                </div>

                {/* Hero summary */}
                <div className="mb-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6">
                        <span className={cn(
                            'flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold',
                            'bg-[var(--accent)]/10 text-[var(--accent)]',
                        )}>
                            {intermediary.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('intermediaries.type')}</p>
                                <p className="mt-1 text-[14px] font-medium text-[var(--foreground)]">{typeLabel(intermediary.type)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('intermediaries.contact')}</p>
                                <div className="mt-1 space-y-1 text-[13px]">
                                    <p className="flex items-center gap-1.5 text-[var(--foreground)]">
                                        <Phone size={12} className="text-[var(--text-muted)]" /> {intermediary.phone || '-'}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-[var(--foreground)]">
                                        <Mail size={12} className="text-[var(--text-muted)]" /> {intermediary.email || '-'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('intermediaries.status')}</p>
                                <p className="mt-1 text-[14px] font-medium text-[var(--foreground)]">
                                    {intermediary.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-2 border-t border-[var(--border)] sm:grid-cols-6">
                        {statsItems.map((stat, i) => (
                            <div key={i} className={cn('border-r border-[var(--border)] p-4', i % 2 === 1 && 'sm:border-r-0', i < 4 && 'sm:border-r')}>
                                <p className="text-[11px] font-medium text-[var(--text-muted)]">{stat.label}</p>
                                <p className={cn('mt-1 truncate text-xl font-semibold', stat.color, stat.small && 'text-sm')}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-5 overflow-x-auto">
                    <div className="flex items-center gap-1 border-b border-[var(--border)] min-w-max">
                        {TABS.map((tab) => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'relative flex items-center justify-center px-4 py-2.5 text-[13px] font-medium outline-none transition whitespace-nowrap',
                                    activeTab === tab.id
                                        ? 'text-[var(--accent)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[var(--accent)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                                )}>
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                <div className="min-h-[200px]">
                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <div className="grid gap-4 lg:grid-cols-3">
                            {/* Relationship overview */}
                            <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('intermediaries.relationshipOverview')}</h3>
                                    <span className="text-[11px] text-[var(--text-muted)]">{intermediary.updatedAt}</span>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 p-4">
                                        <p className="text-[11px] font-medium text-[var(--text-muted)]">{t('intermediaries.linkedClients')}</p>
                                        <p className="text-2xl font-semibold text-[var(--foreground)] mt-1">{totalClients}</p>
                                        <div className="flex items-center gap-2 mt-2 text-[11px]">
                                            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={11} /> {metrics.activeClients} active</span>
                                            <span className="flex items-center gap-1 text-amber-400"><XCircle size={11} /> {metrics.inactiveClients} inactive</span>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 p-4">
                                        <p className="text-[11px] font-medium text-[var(--text-muted)]">{t('intermediaries.linkedProjects')}</p>
                                        <p className="text-2xl font-semibold text-[var(--foreground)] mt-1">{totalProjects}</p>
                                        <div className="flex items-center gap-2 mt-2 text-[11px]">
                                            <span className="flex items-center gap-1 text-emerald-400"><FolderKanban size={11} /> {metrics.activeProjects} active</span>
                                        </div>
                                    </div>
                                </div>
                                {monthlyClients.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-[12px] font-medium text-[var(--text-muted)] mb-2">{t('intermediaries.monthlyClients')}</p>
                                        <MiniLineChart data={monthlyClients} height={160} />
                                    </div>
                                )}
                            </div>

                            {/* Right sidebar */}
                            <div className="space-y-4">
                                {/* Need attention */}
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                    <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-3">{t('intermediaries.needAttention')}</h3>
                                    <div className="space-y-3">
                                        {needAttention.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between text-[12px]">
                                                <span className="text-[var(--text-muted)]">{item.label}</span>
                                                <span className={cn('font-semibold', item.color)}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact card */}
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                    <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-3">{t('intermediaries.contact')}</h3>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2.5 text-[12px]">
                                            <Phone size={13} className="shrink-0 text-[var(--text-muted)]" />
                                            <span className="text-[var(--foreground)]">{intermediary.phone || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[12px]">
                                            <Mail size={13} className="shrink-0 text-[var(--text-muted)]" />
                                            <span className="truncate text-[var(--foreground)]">{intermediary.email || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Latest clients */}
                                {clients.length > 0 && (
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                        <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-3">{t('intermediaries.linkedClients')}</h3>
                                        <div className="space-y-2">
                                            {clients.slice(0, 5).map((client) => (
                                                <button key={client.id} type="button"
                                                    onClick={() => router.visit(`/clients/${client.id}`)}
                                                    className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition hover:bg-[var(--surface-2)]">
                                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-3)] text-[10px] font-bold text-[var(--text-muted)]">
                                                        {client.fullName.charAt(0)}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{client.fullName}</p>
                                                        <p className="text-[10px] text-[var(--text-muted)]">{client.cin || client.clientNumber}</p>
                                                    </div>
                                                    <StatusPill label={client.status} size="sm"
                                                        color={client.status === 'active' ? 'success' : 'default'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Clients tab */}
                    {activeTab === 'clients' && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
                            {clients.length === 0 ? (
                                <div className="p-6">
                                    <AppEmptyState title={t('intermediaries.noClients')} />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[var(--border)]">
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.title')}</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">CIN</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.contact')}</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.linkedProjects')}</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.status')}</th>
                                                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map((client) => (
                                                <tr key={client.id}
                                                    className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--surface-2)]/50">
                                                    <td className="px-4 py-3">
                                                        <button type="button" onClick={() => router.visit(`/clients/${client.id}`)}
                                                            className="flex items-center gap-2.5 text-left">
                                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[11px] font-bold text-[var(--accent)]">
                                                                {client.fullName.charAt(0)}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{client.fullName}</p>
                                                                <p className="text-[11px] text-[var(--text-muted)]">{client.clientNumber}</p>
                                                            </div>
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">{client.cin || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-[12px] text-[var(--text-muted)]">
                                                            <p>{client.phone || '-'}</p>
                                                            <p className="truncate max-w-[180px]">{client.email || '-'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <AppBadge tone="blue">{client.projectsCount}</AppBadge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusPill label={client.status} size="sm"
                                                            color={client.status === 'active' ? 'success' : 'default'} />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <AppButton variant="bordered" size="sm"
                                                            onPress={() => router.visit(`/clients/${client.id}`)}>
                                                            {t('intermediaries.viewIntermediary')}
                                                        </AppButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Projects tab */}
                    {activeTab === 'projects' && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
                            {projects.length === 0 ? (
                                <div className="p-6">
                                    <AppEmptyState title={t('intermediaries.noProjects')} />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[var(--border)]">
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.linkedProjects')}</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.title')}</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">Location</th>
                                                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.status')}</th>
                                                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">{t('intermediaries.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects.map((project) => (
                                                <tr key={project.id}
                                                    className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--surface-2)]/50">
                                                    <td className="px-4 py-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-medium text-[var(--foreground)]">
                                                                {project.projectObject || project.dossierNumber}
                                                            </p>
                                                            <p className="text-[11px] text-[var(--text-muted)]">{project.dossierNumber}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">{project.clientName || '-'}</td>
                                                    <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">{project.commune || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <StatusPill label={project.status} size="sm"
                                                            color={project.status === 'active' || project.status === 'opened' ? 'success' : 'default'} />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <AppButton variant="bordered" size="sm"
                                                            onPress={() => router.visit(`/dossiers/${project.id}`)}>
                                                            {t('clients.show.openProject')}
                                                        </AppButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics tab */}
                    {activeTab === 'analytics' && (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Monthly clients chart */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('intermediaries.monthlyClients')}</h3>
                                        <p className="text-[11px] text-[var(--text-muted)]">{t('intermediaries.linkedClients')}</p>
                                    </div>
                                    <span className="text-lg font-semibold text-[var(--accent)]">{totalClients}</span>
                                </div>
                                {monthlyClients.length > 0 ? (
                                    <MiniLineChart data={monthlyClients} color="var(--accent)" height={220} />
                                ) : (
                                    <div className="flex items-center justify-center h-[220px]">
                                        <p className="text-[12px] text-[var(--text-subtle)]">No client data yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Monthly projects chart */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('intermediaries.monthlyProjects')}</h3>
                                        <p className="text-[11px] text-[var(--text-muted)]">{t('intermediaries.linkedProjects')}</p>
                                    </div>
                                    <span className="text-lg font-semibold text-blue-400">{totalProjects}</span>
                                </div>
                                {monthlyProjects.length > 0 ? (
                                    <MiniLineChart data={monthlyProjects} color="#60a5fa" height={220} />
                                ) : (
                                    <div className="flex items-center justify-center h-[220px]">
                                        <p className="text-[12px] text-[var(--text-subtle)]">No project data yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Client status distribution */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-3">{t('intermediaries.clientDistribution')}</h3>
                                <div className="flex items-center gap-6">
                                    <DonutChart data={clientStatusBreakdown} colorMap={{ active: '#34d399', inactive: '#fbbf24', archived: '#a78bfa' }} size={130} />
                                    <div className="space-y-2">
                                        {clientStatusBreakdown.map((item) => (
                                            <div key={item.status} className="flex items-center gap-2 text-[12px]">
                                                <span className={cn(
                                                    'size-2.5 rounded-full',
                                                    item.status === 'active' ? 'bg-emerald-400' : item.status === 'inactive' ? 'bg-amber-400' : 'bg-purple-400',
                                                )} />
                                                <span className="text-[var(--text-muted)] capitalize">{item.status}</span>
                                                <span className="font-medium text-[var(--foreground)]">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Project status distribution */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="text-[13px] font-semibold text-[var(--foreground)] mb-3">{t('intermediaries.projectDistribution')}</h3>
                                {projectStatusBreakdown.length > 0 ? (
                                    <div className="flex items-center gap-6">
                                        {projectStatusBreakdown.length > 1 && (
                                            <DonutChart data={projectStatusBreakdown}
                                                colorMap={{ active: '#34d399', opened: '#60a5fa', closed: '#94a3b8', archived: '#a78bfa', blocked: '#f87171' }}
                                                size={130} />
                                        )}
                                        <div className="space-y-2">
                                            {projectStatusBreakdown.map((item) => (
                                                <div key={item.status} className="flex items-center gap-2 text-[12px]">
                                                    <span className={cn(
                                                        'size-2.5 rounded-full',
                                                        item.status === 'active' ? 'bg-emerald-400' :
                                                        item.status === 'opened' ? 'bg-blue-400' :
                                                        item.status === 'closed' ? 'bg-slate-400' :
                                                        item.status === 'archived' ? 'bg-purple-400' :
                                                        item.status === 'blocked' ? 'bg-red-400' : 'bg-slate-300',
                                                    )} />
                                                    <span className="text-[var(--text-muted)] capitalize">{item.status}</span>
                                                    <span className="font-medium text-[var(--foreground)]">{item.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-[var(--text-subtle)]">No project data yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Activity tab */}
                    {activeTab === 'activity' && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                            <AppEmptyState title={t('intermediaries.noActivity')} description={t('intermediaries.noActivityDesc')} />
                        </div>
                    )}
                </div>

                {/* Drawer */}
                <IntermediaryDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    intermediary={selectedIntermediary}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                {/* Delete modal */}
                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title={t('intermediaries.deleteIntermediary')}
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        {t('intermediaries.deleteConfirm')} <strong>{deleteTarget?.name}</strong>? {t('intermediaries.deleteWarning')}
                    </p>
                    {deleteTarget && deleteTarget.clientsCount > 0 ? (
                        <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[12px] text-[var(--danger)]">
                            {t('intermediaries.deleteHasClients', 'This intermediary has {count} linked client(s). Deleting will unlink them.', { count: String(deleteTarget.clientsCount) })}
                        </div>
                    ) : null}
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton color="danger" variant="solid" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
