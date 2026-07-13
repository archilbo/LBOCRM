import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft, CheckCircle2, FileText, FolderKanban, Mail, MapPin, Phone, Pencil, Plus, Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import type { ClientFormPayload, ClientRow, ClientStatus, ClientWorkspace } from '@/features/clients/types';
import type { DossierWorkflowRequirement, DossierWorkflowStep } from '@/features/clients/types';
import type { DossierFormPayload } from '@/features/dossiers/types';
import type { FinanceDocumentType } from '@/features/finance/types';
import { ClientDrawer } from '@/features/clients/drawers/ClientDrawer';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { FinanceDocumentBuilderDrawer } from '@/features/finance/drawers/FinanceDocumentBuilderDrawer';
import { AppWorkflowStepper, type WorkflowRequirementActionContext } from '@/components/ui/AppWorkflowStepper';
import { DocumentUploadDrawer } from '@/features/documents/drawers/DocumentUploadDrawer';
import type { DocumentUploadPayload } from '@/features/documents/types';
import { UploadDocumentDrawer } from '@/features/clients/components/UploadDocumentDrawer';
import { ContractDrawer } from '@/features/clients/components/ContractDrawer';
import { AuthorizationDrawer } from '@/features/clients/components/AuthorizationDrawer';
import { ArchiveDrawer } from '@/features/clients/components/ArchiveDrawer';
import { ConfirmActionModal } from '@/features/clients/components/ConfirmActionModal';
import { getRequirementActionType, getStepActionType, getModuleRoute } from '@/features/clients/components/workflowActionTypes';
import type { FormErrors } from '@/lib/formErrors';

const AVATAR_COLORS = [
    'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
];

function avatarColor(id: number) {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

type DossierSummary = {
    id: number;
    dossierNumber: string;
    projectObject: string;
    status: string;
    workflowStep: string;
    updatedAt: string | null;
};

type PageProps = {
    client: ClientRow;
    dossiers: DossierSummary[];
    workspace: ClientWorkspace;
    intermediaries: { id: string; label: string }[];
    documentTemplates: { id: string; label: string; type?: string | null }[];
    tab?: string;
};

function initials(client: ClientRow) {
    const first = client.firstName?.charAt(0) ?? '';
    const last = client.lastName?.charAt(0) ?? '';
    return (first + last).trim() || client.fullName.slice(0, 2).toUpperCase();
}

function toBackendPayload(payload: ClientFormPayload, status: ClientStatus = 'active') {
    return {
        intermediary_id: payload.intermediaryId || null,
        civility: payload.civility || null,
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        cin: payload.cin || null,
        phone: payload.phone || null,
        email: payload.email || null,
        address: payload.address || null,
        father_name: payload.fatherName || null,
        mother_name: payload.motherName || null,
        cni_expiration_date: payload.cniExpirationDate || null,
        status,
        notes: payload.notes || null,
    };
}

type TabId = 'overview' | 'projects' | 'workflow' | 'documents' | 'finance' | 'notes' | 'activity';

const TABS: { id: TabId; labelKey: string }[] = [
    { id: 'overview', labelKey: 'clients.show.overview' },
    { id: 'projects', labelKey: 'clients.show.projects' },
    { id: 'workflow', labelKey: 'clients.show.workflow' },
    { id: 'documents', labelKey: 'clients.show.documents' },
    { id: 'finance', labelKey: 'clients.show.finance' },
    { id: 'notes', labelKey: 'clients.show.notes' },
    { id: 'activity', labelKey: 'clients.show.activity' },
];

export default function ClientShow({ client, dossiers, workspace, intermediaries, documentTemplates, tab }: PageProps) {
    const { t } = useTranslation();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('edit');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>((tab as TabId) || 'overview');

    const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
    const [uploadRequirementKey, setUploadRequirementKey] = useState<string | null>(null);
    const [uploadStepKey, setUploadStepKey] = useState<string | null>(null);
    const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
    const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
    const [archiveDrawerOpen, setArchiveDrawerOpen] = useState(false);

    const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
    const [projectFormErrors, setProjectFormErrors] = useState<FormErrors>({});
    const [financeDrawerOpen, setFinanceDrawerOpen] = useState(false);
    const [financeDrawerType, setFinanceDrawerType] = useState<FinanceDocumentType>('quote');
    const [standaloneContractOpen, setStandaloneContractOpen] = useState(false);
    const [standaloneUploadOpen, setStandaloneUploadOpen] = useState(false);

    const [confirmActionOpen, setConfirmActionOpen] = useState(false);
    const [confirmActionConfig, setConfirmActionConfig] = useState<{
        title: string;
        description: string;
        confirmLabel: string;
        method: 'post' | 'put';
        url: string;
        extraPayload?: Record<string, unknown>;
    } | null>(null);

    const selectedProject = workspace?.selectedProject ?? null;
    const projects = workspace?.projects ?? dossiers.map((d) => ({
        id: d.id,
        clientId: client.id,
        clientName: client.fullName,
        dossierNumber: d.dossierNumber,
        projectObject: d.projectObject,
        projectAddress: null,
        province: null,
        commune: null,
        status: d.status,
        workflowStep: d.workflowStep,
        documentsCount: 0,
        financeDocumentsCount: 0,
        paymentsCount: 0,
        quotesTotal: 0,
        invoicesTotal: 0,
        paidTotal: 0,
        remainingTotal: 0,
        updatedAt: d.updatedAt,
    }));

    const activeProjects = projects.filter((p) => p.status === 'opened' || p.status === 'active').length;
    const totalDocuments = selectedProject?.documents?.length ?? dossiers.length;

    function openEditDrawer() {
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ClientFormPayload) {
        if (drawerMode === 'edit' && client) {
            router.put(`/clients/${client.id}`, toBackendPayload(payload, client.status as ClientStatus), {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success(t('clients.updated')); },
                onError: (errors) => { setFormErrors(errors as FormErrors); toast.error(t('clients.formError')); },
            });
            return;
        }
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/clients/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success(t('clients.deleted')); setDeleteTarget(null); },
            onError: () => toast.error(t('clients.deleteError')),
        });
    }

    function handleWorkflowRequirementAction(context: WorkflowRequirementActionContext) {
        const { step, requirement } = context;
        const actionType = getRequirementActionType(step.key, requirement.key);

        switch (actionType) {
            case 'upload_document':
                setUploadRequirementKey(requirement.key);
                setUploadStepKey(step.key);
                setUploadDrawerOpen(true);
                break;
            case 'create_contract':
                setContractDrawerOpen(true);
                break;
            case 'generate_contract':
                if (!selectedProject?.contract) {
                    toast.error(t('workflow.createContractFirst'));
                    return;
                }
                setConfirmActionConfig({
                    title: t('workflow.generateContract'),
                    description: t('workflow.generateContractDesc'),
                    confirmLabel: t('workflow.confirmGenerate'),
                    method: 'put',
                    url: `/contracts/${selectedProject.contract.id}/generate`,
                });
                setConfirmActionOpen(true);
                break;
            case 'mark_signed':
                if (!selectedProject?.contract) {
                    toast.error(t('workflow.createContractFirst'));
                    return;
                }
                setConfirmActionConfig({
                    title: t('workflow.markSigned'),
                    description: t('workflow.markSignedDesc'),
                    confirmLabel: t('workflow.confirmSigned'),
                    method: 'put',
                    url: `/contracts/${selectedProject.contract.id}/signed`,
                });
                setConfirmActionOpen(true);
                break;
            case 'mark_done':
                setConfirmActionConfig({
                    title: requirement.actionLabel || t('workflow.confirmDone'),
                    description: requirement.label,
                    confirmLabel: t('workflow.confirmDone'),
                    method: 'put',
                    url: `/dossiers/${selectedProject?.id}/workflow-requirements`,
                    extraPayload: {
                        step_key: step.key,
                        requirement_key: requirement.key,
                        is_done: true,
                    },
                });
                setConfirmActionOpen(true);
                break;
            case 'open_module':
                if (selectedProject) {
                    router.visit(getModuleRoute(step.key, selectedProject.id), { preserveScroll: true });
                }
                break;
            case 'no_action':
                toast.info(t('workflow.actionNotAvailable'));
                break;
        }
    }

    function handleWorkflowStepAction(step: DossierWorkflowStep | undefined) {
        if (!step?.primaryActionUrl) return;
        router.visit(step.primaryActionUrl, { preserveScroll: true });
    }

    function openProjectWorkflow(projectId: number) {
        router.visit(`/clients/${client.id}?dossier_id=${projectId}&tab=workflow`, { preserveScroll: true });
    }

    const latestProject = selectedProject || projects[0] || null;
    const workflowPercent = selectedProject?.workflow?.percent ?? null;

    const dossierOptions = useMemo(() => dossiers.map((d) => ({
        id: String(d.id),
        label: d.dossierNumber,
        clientId: String(client.id),
        projectObject: d.projectObject || null,
        address: null,
        floorArea: null,
        landSurface: null,
    })), [client.id, dossiers]);

    function handleProjectSubmit(payload: DossierFormPayload) {
        router.post('/dossiers', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setProjectDrawerOpen(false);
                setProjectFormErrors({});
                toast.success('Project created successfully.');
                router.reload({ only: ['dossiers', 'workspace'], preserveScroll: true });
            },
            onError: (errors) => {
                setProjectFormErrors(errors as FormErrors);
                toast.error('Please check project form errors.');
            },
        });
    }

    function afterCreateReload() {
        router.reload({ only: ['dossiers', 'workspace'], preserveScroll: true });
    }

    const [isDocUploading, setIsDocUploading] = useState(false);
    function handleDocumentUpload(payload: DocumentUploadPayload) {
        setIsDocUploading(true);
        const formData = new FormData();
        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId || '');
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');
        if (payload.file) formData.append('file', payload.file);
        router.post('/documents', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setStandaloneUploadOpen(false); setIsDocUploading(false); toast.success('Document uploaded.'); afterCreateReload(); },
            onError: () => { setIsDocUploading(false); toast.error('Please check document form errors.'); },
        });
    }

    return (
        <>
            <Head title={client.fullName} />

            <AppShell>
                {/* ── Top bar ── */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <button type="button" onClick={() => router.visit('/clients')}
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                            <ArrowLeft size={15} />
                        </button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-xl font-bold text-[var(--foreground)]">{client.fullName}</h1>
                                <StatusPill
                                    label={client.status}
                                    color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'}
                                    size="sm"
                                />
                            </div>
                            <p className="truncate text-[12px] text-[var(--text-muted)]">{client.clientNumber} {client.cin ? `/ ${client.cin}` : ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <AppButton variant="bordered" size="sm" onPress={openEditDrawer}>
                            <Pencil size={14} />
                            {t('clients.edit')}
                        </AppButton>
                        <AppButton color="danger" variant="bordered" size="sm" onPress={() => setDeleteTarget(client)}>
                            <Trash2 size={14} />
                            {t('clients.delete')}
                        </AppButton>
                    </div>
                </div>

                {/* ── Hero / Summary panel ── */}
                <div className="mb-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6">
                        <span className={cn(
                            'flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold',
                            avatarColor(client.id),
                        )}>
                            {initials(client)}
                        </span>
                        <div className="min-w-0 flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.cin')}</p>
                                <p className="mt-1 text-[14px] font-medium text-[var(--foreground)]">{client.cin || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.phone')}</p>
                                <p className="mt-1 text-[14px] font-medium text-[var(--foreground)]">{client.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.email')}</p>
                                <p className="mt-1 truncate text-[14px] font-medium text-[var(--foreground)]">{client.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.address')}</p>
                                <p className="mt-1 text-[14px] font-medium text-[var(--foreground)]">{client.address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.intermediaryName')}</p>
                                <p className="mt-1 text-[14px] font-medium text-[var(--foreground)]">
                                    {client.intermediaryName && client.intermediaryName !== 'None' ? client.intermediaryName : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.show.updated')}</p>
                                <p className="mt-1 text-[14px] font-medium text-[var(--foreground)]">{client.updatedAt || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-2 border-t border-[var(--border)] sm:grid-cols-4">
                        <div className="border-r border-[var(--border)] p-4">
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">{t('clients.show.projects')}</p>
                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{projects.length}</p>
                        </div>
                        <div className="border-r border-[var(--border)] p-4">
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">{t('clients.show.activeProjects')}</p>
                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{activeProjects}</p>
                        </div>
                        <div className="border-r border-[var(--border)] p-4">
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">{t('clients.show.documents')}</p>
                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{totalDocuments}</p>
                        </div>
                        <div className="p-4">
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">{t('clients.show.status')}</p>
                            <p className="mt-1 text-xl font-semibold capitalize text-[var(--foreground)]">{client.status}</p>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
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

                {/* ── Tab content ── */}
                <div className="min-h-[200px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <AppButton variant="solid" color="primary" size="sm" onPress={() => { setProjectDrawerOpen(true); }}>
                                    <Plus size={14} /> New project
                                </AppButton>
                                {projects.length > 0 ? (
                                    <AppButton variant="bordered" size="sm" onPress={() => { setStandaloneContractOpen(true); }}>
                                        <Plus size={14} /> New contract
                                    </AppButton>
                                ) : null}
                                <AppButton variant="bordered" size="sm" onPress={() => { setFinanceDrawerType('quote'); setFinanceDrawerOpen(true); }}>
                                    <Plus size={14} /> New finance
                                </AppButton>
                                {projects.length > 0 ? (
                                    <AppButton variant="bordered" size="sm" onPress={() => { setStandaloneUploadOpen(true); }}>
                                        <Plus size={14} /> Upload document
                                    </AppButton>
                                ) : null}
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                            {/* Client Snapshot */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold', avatarColor(client.id))}>
                                        {initials(client)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[14px] font-semibold text-[var(--foreground)]">{client.fullName}</h3>
                                            <StatusPill label={client.status} size="sm"
                                                color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'} />
                                        </div>
                                        <p className="text-[11px] text-[var(--text-muted)]">{client.clientNumber}</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2.5">
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]"><FileText size={12} /></span>
                                        <span className="text-[var(--text-muted)]">CIN:</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.cin || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><Phone size={12} /></span>
                                        <span className="text-[var(--text-muted)]">{t('clients.form.phone')}:</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.phone || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><Mail size={12} /></span>
                                        <span className="text-[var(--text-muted)]">{t('clients.form.email')}:</span>
                                        <span className="truncate font-medium text-[var(--foreground)]">{client.email || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><MapPin size={12} /></span>
                                        <span className="text-[var(--text-muted)]">{t('clients.form.address')}:</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.address || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Relationship */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="mb-4 text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.relationship')}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span className="text-[var(--text-muted)]">{t('clients.form.intermediaryName')}</span>
                                        <span className="font-medium text-[var(--foreground)]">
                                            {client.intermediaryName && client.intermediaryName !== 'None' ? client.intermediaryName : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span className="text-[var(--text-muted)]">{t('clients.show.created')}</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.createdAt || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[12px]">
                                        <span className="text-[var(--text-muted)]">{t('clients.show.updated')}</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.updatedAt || '-'}</span>
                                    </div>
                                    <div className="border-t border-[var(--border)] pt-3 mt-3">
                                        <div className="flex items-center justify-between text-[12px]">
                                            <span className="text-[var(--text-muted)]">{t('clients.show.projects')}</span>
                                            <span className="font-semibold text-[var(--foreground)]">{projects.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[12px] mt-1.5">
                                            <span className="text-[var(--text-muted)]">{t('clients.show.activeProjects')}</span>
                                            <span className="font-semibold text-[var(--foreground)]">{activeProjects}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Workflow Snapshot */}
                            {latestProject && (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.workflow')}</h3>
                                        <StatusPill label={latestProject.status} size="sm"
                                            color={latestProject.status === 'opened' || latestProject.status === 'active' ? 'success' : 'default'} />
                                    </div>
                                    <p className="text-[13px] font-medium text-[var(--foreground)]">
                                        {latestProject.projectObject || latestProject.dossierNumber}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-muted)]">{latestProject.dossierNumber}</p>
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-[12px]">
                                            <span className="text-[var(--text-muted)]">{t('clients.show.currentStep')}</span>
                                            <span className="font-medium text-[var(--foreground)]">{latestProject.workflowStep || t('clients.show.noWorkflow')}</span>
                                        </div>
                                        {workflowPercent !== null && (
                                            <>
                                                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                                                    <span>{t('clients.show.workflowProgress')}</span>
                                                    <span>{workflowPercent}%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                                                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${workflowPercent}%` }} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <AppButton variant="bordered" size="sm" className="mt-4" onPress={() => openProjectWorkflow(latestProject.id)}>
                                        {t('clients.show.openWorkflow')}
                                    </AppButton>
                                </div>
                            )}

                            {/* Project Pipeline */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.pipelineSummary')}</h3>
                                        <p className="text-[11px] text-[var(--text-muted)]">{projects.length} {t('clients.show.projects').toLowerCase()}</p>
                                    </div>
                                    {projects.length > 5 && (
                                        <button type="button" onClick={() => setActiveTab('projects')}
                                            className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                            {t('actions.view')}
                                        </button>
                                    )}
                                </div>
                                {projects.length === 0 ? (
                                    <p className="text-[12px] text-[var(--text-muted)]">{t('clients.show.noProjects')}</p>
                                ) : (
                                    <div className="space-y-1">
                                        {projects.slice(0, 5).map((project) => {
                                            const isSelected = selectedProject?.id === project.id;
                                            const showProgress = isSelected && selectedProject?.workflow;
                                            return (
                                                <button key={project.id} type="button" onClick={() => openProjectWorkflow(project.id)}
                                                    className={cn(
                                                        'flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition',
                                                        isSelected
                                                            ? 'bg-[var(--accent)]/5 ring-1 ring-inset ring-[var(--accent)]/20'
                                                            : 'hover:bg-[var(--surface-2)]',
                                                    )}>
                                                    <span className={cn(
                                                        'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs',
                                                        isSelected ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--surface-3)] text-[var(--text-muted)]',
                                                    )}>
                                                        <FolderKanban size={14} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-[12px] font-medium text-[var(--foreground)]">
                                                                {project.projectObject || project.dossierNumber}
                                                            </p>
                                                            <StatusPill label={project.status} size="sm"
                                                                color={project.status === 'opened' || project.status === 'active' ? 'success' : 'default'} />
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-[var(--text-muted)]">{project.dossierNumber}</span>
                                                            <span className="text-[10px] text-[var(--text-subtle)]">&middot;</span>
                                                            <span className="text-[10px] text-[var(--text-subtle)]">{project.workflowStep || t('clients.show.noWorkflow')}</span>
                                                        </div>
                                                        {showProgress && selectedProject?.workflow && (
                                                            <div className="mt-1 h-1 rounded-full bg-[var(--surface-3)] overflow-hidden">
                                                                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${selectedProject.workflow.percent}%` }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Shared client documents */}
                            <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="mb-1 text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.sharedDocuments')}</h3>
                                <p className="mb-4 text-[11px] text-[var(--text-muted)]">{t('clients.show.sharedDocumentsDesc')}</p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5 min-w-0">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]"><FileText size={12} /></span>
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-medium text-[var(--foreground)]">CIN</p>
                                            <p className="text-[10px] text-[var(--text-muted)]">{client.cin || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-1.5 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5 min-w-0">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><Phone size={12} /></span>
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-medium text-[var(--foreground)]">{t('clients.form.phone')}</p>
                                            <p className="text-[10px] text-[var(--text-muted)]">{client.phone || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-subtle)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5 min-w-0">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><Mail size={12} /></span>
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-medium text-[var(--foreground)]">{t('clients.form.email')}</p>
                                            <p className="truncate text-[10px] text-[var(--text-muted)]">{client.email || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-subtle)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="mb-2 text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.notes')}</h3>
                                <p className="text-[12px] leading-6 text-[var(--text-muted)]">
                                    {client.notes || t('clients.show.noNotes')}
                                </p>
                            </div>
                        </div>
                        </div>
                    )}

                    {activeTab === 'workflow' && (
                        <div className="space-y-5">
                            {projects.length > 1 && (
                                <div>
                                    <h3 className="text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.projectWorkflows')}</h3>
                                    <p className="text-[11px] text-[var(--text-muted)] mb-3">{t('clients.show.selectProject')}</p>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {projects.map((project) => {
                                            const isSelected = selectedProject?.id === project.id;
                                            return (
                                                <button key={project.id} type="button" onClick={() => {
                                                    if (selectedProject?.id !== project.id) openProjectWorkflow(project.id);
                                                }} className={cn(
                                                    'flex shrink-0 flex-col items-start gap-1 rounded-xl border p-3 min-w-[200px] text-left transition',
                                                    isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
                                                )}>
                                                    <div className="flex items-center gap-2 w-full">
                                                        <p className="truncate text-[12px] font-medium text-[var(--foreground)] flex-1">
                                                            {project.projectObject || project.dossierNumber}
                                                        </p>
                                                        <StatusPill label={project.status} size="sm"
                                                            color={project.status === 'opened' || project.status === 'active' ? 'success' : 'default'} />
                                                    </div>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{project.dossierNumber}</p>
                                                    {isSelected && selectedProject?.workflow && (
                                                        <div className="mt-1 w-full">
                                                            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                                                                <span>{project.workflowStep}</span>
                                                                <span>{selectedProject.workflow.percent}%</span>
                                                            </div>
                                                            <div className="mt-0.5 h-1 rounded-full bg-[var(--surface-3)] overflow-hidden">
                                                                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${selectedProject.workflow.percent}%` }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {isSelected && <span className="mt-1 text-[10px] font-medium text-[var(--accent)]">{t('common.active')}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedProject && selectedProject.workflow ? (
                                <AppWorkflowStepper
                                    dossierId={selectedProject.id}
                                    workflow={selectedProject.workflow}
                                    onRequirementAction={handleWorkflowRequirementAction}
                                    onStepAction={handleWorkflowStepAction}
                                />
                            ) : projects.length === 0 ? (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <AppEmptyState title={t('clients.show.noProjectWorkflow')} description={t('clients.show.noProjectWorkflowDesc')} />
                                    <div className="mt-4 flex justify-center">
                                        <AppButton variant="solid" color="primary" size="sm" onPress={() => { setProjectDrawerOpen(true); }}>
                                            <Plus size={14} /> Create a project
                                        </AppButton>
                                    </div>
                                </div>
                            ) : selectedProject && !selectedProject.workflow ? (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <AppEmptyState title={t('clients.show.noWorkflow')} description={t('clients.show.noWorkflowDesc')} />
                                </div>
                            ) : null}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-[var(--foreground)]">
                                    {projects.length} {t('clients.show.projects').toLowerCase()}
                                </p>
                                <AppButton variant="solid" color="primary" size="sm" onPress={() => { setProjectDrawerOpen(true); }}>
                                    <Plus size={14} /> New project
                                </AppButton>
                            </div>
                            {projects.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {projects.map((project) => {
                                    const isSelected = selectedProject?.id === project.id;
                                    const showProgress = isSelected && selectedProject?.workflow;
                                    return (
                                        <div key={project.id}
                                            className={cn(
                                                'rounded-xl border p-4 shadow-sm transition hover:shadow-md',
                                                isSelected ? 'border-[var(--accent)]/30 bg-[var(--accent)]/5' : 'border-[var(--border)] bg-[var(--surface)]',
                                            )}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                                                        {project.projectObject || project.dossierNumber}
                                                    </p>
                                                    <p className="text-[11px] text-[var(--text-muted)]">{project.dossierNumber}</p>
                                                </div>
                                                <StatusPill
                                                    label={project.status}
                                                    color={project.status === 'opened' || project.status === 'active' ? 'success' : 'default'}
                                                    size="sm"
                                                />
                                            </div>
                                            {project.projectAddress && (
                                                <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--text-subtle)]">
                                                    <MapPin size={11} /> {project.projectAddress}
                                                </p>
                                            )}
                                            <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1">
                                                    <FileText size={12} /> {project.documentsCount} {t('clients.show.documents').toLowerCase()}
                                                </span>
                                                <span>{project.workflowStep}</span>
                                            </div>
                                            {showProgress ? (
                                                <div className="mt-2">
                                                    <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                                                        <span className="truncate">{t('clients.show.workflowProgress')}</span>
                                                        <span>{selectedProject.workflow.percent}%</span>
                                                    </div>
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                                                        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${selectedProject.workflow.percent}%` }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-2.5 flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-subtle)]">
                                                        {project.workflowStep}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="mt-3 flex items-center gap-2">
                                                <button type="button" onClick={() => router.visit(`/dossiers/${project.id}`)}
                                                    className="flex-1 rounded-lg border border-[var(--border)] py-1.5 text-[12px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                                    {t('clients.show.openProject')}
                                                </button>
                                                <button type="button" onClick={() => openProjectWorkflow(project.id)}
                                                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[12px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/8">
                                                    {t('clients.show.openWorkflow')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                <AppEmptyState title={t('clients.show.noProjects')} description={t('clients.show.noProjectsDesc')} />
                            </div>
                        )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.documents')}</p>
                                {projects.length > 0 ? (
                                    <AppButton variant="solid" color="primary" size="sm" onPress={() => { setStandaloneUploadOpen(true); }}>
                                        <Plus size={14} /> Upload document
                                    </AppButton>
                                ) : null}
                            </div>
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="mb-3 text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.sharedDocuments')}</h3>
                                <p className="mb-4 text-[11px] text-[var(--text-muted)]">{t('clients.show.sharedDocumentsDesc')}</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                            <FileText size={14} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-medium text-[var(--foreground)]">CIN</p>
                                            <p className="text-[11px] text-[var(--text-muted)]">{client.cin || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                            <FileText size={14} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-medium text-[var(--foreground)]">{t('clients.form.phone')}</p>
                                            <p className="text-[11px] text-[var(--text-muted)]">{client.phone || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                            <FileText size={14} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-medium text-[var(--foreground)]">{t('clients.form.email')}</p>
                                            <p className="text-[11px] text-[var(--text-muted)]">{client.email || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedProject && selectedProject.documents.length > 0 ? (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                    <h3 className="mb-3 text-[13px] font-semibold text-[var(--foreground)]">
                                        {t('clients.show.projectDocuments')} &mdash; {selectedProject.projectObject || selectedProject.dossierNumber}
                                    </h3>
                                    <p className="mb-4 text-[11px] text-[var(--text-muted)]">{t('clients.show.projectDocumentsDesc')}</p>
                                    <div className="space-y-2">
                                        {selectedProject.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                                <span className={cn(
                                                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                                    doc.status === 'verified' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                                                )}>
                                                    {doc.status === 'verified' ? <CheckCircle2 size={14} /> : <FileText size={14} />}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[13px] font-medium text-[var(--foreground)]">{doc.name}</p>
                                                    {doc.uploadedAt && <p className="text-[11px] text-[var(--text-muted)]">{doc.uploadedAt}</p>}
                                                </div>
                                                <span className={cn(
                                                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    doc.status === 'verified' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                                                )}>
                                                    {doc.status}
                                                </span>
                                                <span className="shrink-0 rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-subtle)]">{t('clients.show.projectDocumentLabel')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {projects.length === 0 && (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <AppEmptyState title={t('clients.show.noDocuments')} description={t('clients.show.noDocumentsDesc')} />
                                </div>
                            )}

                            {projects.length > 0 && !selectedProject?.documents?.length && (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <AppEmptyState title={t('clients.show.noDocuments')} description={t('clients.show.noDocumentsDesc')} />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-[var(--foreground)]">Finance</p>
                                <AppButton variant="solid" color="primary" size="sm" onPress={() => { setFinanceDrawerType('quote'); setFinanceDrawerOpen(true); }}>
                                    <Plus size={14} /> New finance item
                                </AppButton>
                            </div>
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                <AppEmptyState title={t('clients.show.noFinance')} description={t('clients.show.noFinanceDesc')} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                            <h3 className="mb-3 text-[13px] font-semibold text-[var(--foreground)]">{t('clients.show.notes')}</h3>
                            <p className="text-[13px] leading-6 text-[var(--text-muted)]">
                                {client.notes || t('clients.show.noNotes')}
                            </p>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                            <AppEmptyState title={t('clients.show.noActivity')} description={t('clients.show.noActivityDesc')} />
                        </div>
                    )}
                </div>

                {/* ── Edit drawer ── */}
                <ClientDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    client={drawerMode === 'edit' ? client : null}
                    intermediaries={intermediaries}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                {/* ── Upload document drawer ── */}
                {selectedProject && (
                    <UploadDocumentDrawer
                        isOpen={uploadDrawerOpen}
                        onOpenChange={setUploadDrawerOpen}
                        dossierId={selectedProject.id}
                        dossierNumber={selectedProject.dossierNumber}
                        requirementKey={uploadRequirementKey}
                        stepKey={uploadStepKey}
                        clientId={client.id}
                    />
                )}

                {/* ── Contract drawer ── */}
                <ContractDrawer
                    isOpen={contractDrawerOpen}
                    onOpenChange={setContractDrawerOpen}
                    project={selectedProject}
                    clientId={client.id}
                />

                {/* ── Authorization drawer ── */}
                <AuthorizationDrawer
                    isOpen={authDrawerOpen}
                    onOpenChange={setAuthDrawerOpen}
                    project={selectedProject}
                    clientId={client.id}
                />

                {/* ── Archive drawer ── */}
                <ArchiveDrawer
                    isOpen={archiveDrawerOpen}
                    onOpenChange={setArchiveDrawerOpen}
                    project={selectedProject}
                    clientId={client.id}
                />

                {/* ── Project drawer (create) ── */}
                <ProjectDrawer
                    isOpen={projectDrawerOpen}
                    mode="create"
                    dossier={null}
                    clients={[{ id: String(client.id), label: client.fullName }]}
                    initialClientId={String(client.id)}
                    onOpenChange={setProjectDrawerOpen}
                    onSubmit={handleProjectSubmit}
                    errors={projectFormErrors}
                />

                {/* ── Finance document builder drawer ── */}
                <FinanceDocumentBuilderDrawer
                    isOpen={financeDrawerOpen}
                    onOpenChange={setFinanceDrawerOpen}
                    mode="create"
                    type={financeDrawerType}
                    clients={[{ id: String(client.id), label: client.fullName, cin: client.cin, address: client.address }]}
                    dossiers={dossierOptions}
                    templates={[]}
                    settings={{
                        defaultTvaRate: 20,
                        defaultCurrency: 'MAD',
                        defaultPaymentTermsDays: 30,
                        defaultQuoteValidityDays: 30,
                        defaultUnitPriceM2: 900,
                        defaultArchitectRate: 0.5,
                        companyInfo: {},
                        bankInfo: {},
                    }}
                    defaultClientId={String(client.id)}
                    onSaved={afterCreateReload}
                />

                {/* ── Standalone upload document drawer ── */}
                <DocumentUploadDrawer
                    isOpen={standaloneUploadOpen}
                    clients={[{ id: String(client.id), label: client.fullName }]}
                    dossiers={dossierOptions}
                    templates={documentTemplates}
                    initialClientId={String(client.id)}
                    initialDossierId={selectedProject ? String(selectedProject.id) : dossiers[0] ? String(dossiers[0].id) : ''}
                    onOpenChange={setStandaloneUploadOpen}
                    onSubmit={handleDocumentUpload}
                    isSubmitting={isDocUploading}
                />

                {/* ── Standalone contract drawer ── */}
                <ContractDrawer
                    isOpen={standaloneContractOpen}
                    onOpenChange={setStandaloneContractOpen}
                    project={selectedProject}
                    clientId={client.id}
                />

                {/* ── Confirm action modal ── */}
                {confirmActionConfig && (
                    <ConfirmActionModal
                        isOpen={confirmActionOpen}
                        onOpenChange={(open) => { if (!open) setConfirmActionConfig(null); setConfirmActionOpen(open); }}
                        title={confirmActionConfig.title}
                        description={confirmActionConfig.description}
                        confirmLabel={confirmActionConfig.confirmLabel}
                        method={confirmActionConfig.method}
                        url={confirmActionConfig.url}
                        extraPayload={confirmActionConfig.extraPayload}
                    />
                )}

                {/* ── Delete modal ── */}
                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title={t('clients.deleteTitle')}
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        {t('clients.deleteConfirm')} <strong>{deleteTarget?.fullName}</strong>?
                        {t('clients.deleteWarning')}
                    </p>
                    {deleteTarget && deleteTarget.projectsCount > 0 ? (
                        <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[12px] text-[var(--danger)]">
                            {t('clients.deleteHasProjects', 'This client has {count} linked project(s). Deleting will remove them all.', { count: String(deleteTarget.projectsCount) })}
                        </div>
                    ) : null}
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>
                            {t('clients.cancel')}
                        </AppButton>
                        <AppButton color="danger" variant="solid" onPress={confirmDelete}>
                            {t('clients.delete')}
                        </AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
