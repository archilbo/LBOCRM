import { Head, router } from '@inertiajs/react';
import {
    Activity,
    Archive,
    ArrowLeft,
    BadgeDollarSign,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    FileCheck2,
    FileText,
    FolderKanban,
    Landmark,
    Layers3,
    ListChecks,
    MapPin,
    MessageSquareText,
    Pencil,
    ReceiptText,
    Ruler,
    ScrollText,
    Trash2,
    UploadCloud,
    UserRound,
    WalletCards,
} from 'lucide-react';
import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppModal } from '@/components/ui/AppModal';
import { DocumentDrawer } from '@/components/drawers';
import { ProjectWorkflowStepper } from '@/features/dossiers/components/ProjectWorkflowStepper';
import {
    AppWorkspaceTabs,
    type AppWorkspaceTab,
} from '@/components/ui/AppWorkspaceTabs';
import { WorkflowTab } from '@/features/dossiers/components/WorkflowTab';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { toDossierRequestPayload } from '@/features/dossiers/projectPayload';
import type {
    City,
    ClientOption,
    DossierFormPayload,
    DossierRow,
    ProjectActivityItem,
    ProjectArchiveSummary,
    ProjectContractSummary,
    ProjectDocumentSummary,
    ProjectFinanceDocumentSummary,
    ProjectPaymentSummary,
} from '@/features/dossiers/types';
import type {
    DocumentTemplateOption,
    DocumentUploadPayload,
    DossierOption,
} from '@/features/documents/types';
import type { FormErrors } from '@/lib/formErrors';
import { useTranslation } from '@/lib/i18n';
import type { WorkflowData } from '@/types/workflow';
import { cn } from '@/lib/cn';

const DesignTab = lazy(() => import('@/features/dossiers/components/DesignTab'));

type TabId =
    | 'overview'
    | 'workflow'
    | 'project-design'
    | 'documents'
    | 'contract'
    | 'finance'
    | 'notes'
    | 'activity';

type ProjectDesignState = {
    mode: string;
    file: string;
    version: string;
    asset: string;
    page: string;
    remark: string;
    inspector: string;
};

type PageProps = {
    dossier: DossierRow;
    workflow: WorkflowData;
    documents: ProjectDocumentSummary[];
    contract: ProjectContractSummary;
    financeDocuments: ProjectFinanceDocumentSummary[];
    payments: ProjectPaymentSummary[];
    archiveRecord: ProjectArchiveSummary;
    activity: ProjectActivityItem[];
    clients: ClientOption[];
    cities: City[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    canDesign?: boolean;
};

const TAB_IDS: TabId[] = [
    'overview',
    'workflow',
    'project-design',
    'documents',
    'contract',
    'finance',
    'notes',
    'activity',
];

const ACTIVITY_PAGE_SIZE = 10;

function readWorkspaceQuery(): { tab: TabId; design: ProjectDesignState } {
    if (typeof window === 'undefined') {
        return {
            tab: 'overview',
            design: {
                mode: '',
                file: '',
                version: '',
                asset: '',
                page: '',
                remark: '',
                inspector: '',
            },
        };
    }

    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get('tab');
    const tab = TAB_IDS.includes(requestedTab as TabId)
        ? requestedTab as TabId
        : 'overview';

    return {
        tab,
        design: {
            mode: params.get('mode') ?? '',
            file: params.get('file') ?? '',
            version: params.get('version') ?? '',
            asset: params.get('asset') ?? '',
            page: params.get('page') ?? '',
            remark: params.get('remark') ?? '',
            inspector: params.get('inspector') ?? '',
        },
    };
}

function money(value: number, locale: string, currency = 'MAD'): string {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function surface(value: number | null): string {
    return value === null ? '—' : `${value.toLocaleString('fr-FR')} m²`;
}

function statusTone(status: string): 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' {
    if (['active', 'completed', 'verified', 'signed', 'paid', 'stored', 'accepted'].includes(status)) return 'green';
    if (['opened', 'in_progress', 'uploaded', 'generated', 'issued', 'sent'].includes(status)) return 'blue';
    if (['blocked', 'rejected', 'cancelled', 'lost'].includes(status)) return 'red';
    if (['archived', 'returned'].includes(status)) return 'violet';
    if (['pending', 'draft', 'missing', 'partially_paid', 'checked_out'].includes(status)) return 'amber';
    return 'neutral';
}

function statusLabel(t: (key: string) => string, status: string): string {
    const key = `projects.statuses.${status}`;
    const translated = t(key);
    return translated === key ? status.replace(/_/g, ' ') : translated;
}

function MetricCard({
    label,
    value,
    icon,
    tone = 'text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]',
}: {
    label: string;
    value: string | number;
    icon: typeof FolderKanban;
    tone?: string;
}) {
    const Icon = icon;

    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone)}>
                <Icon size={16} />
            </span>
            <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-[var(--text-muted)]">{label}</p>
                <p className="truncate text-base font-semibold tabular-nums text-[var(--foreground)]">
                    {value}
                </p>
            </div>
        </div>
    );
}

function InfoField({
    label,
    value,
    icon,
}: {
    label: string;
    value: ReactNode;
    icon?: typeof MapPin;
}) {
    const Icon = icon;

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                {Icon ? <Icon size={12} className="text-[var(--accent)]" /> : null}
                {label}
            </div>
            <div className="mt-1 min-w-0 text-sm font-semibold text-[var(--foreground)]">
                {value || '—'}
            </div>
        </div>
    );
}

function PanelHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
                {description ? (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
                ) : null}
            </div>
            {action}
        </div>
    );
}

export default function DossierShow({
    dossier,
    workflow,
    documents,
    contract,
    financeDocuments,
    payments,
    archiveRecord,
    activity,
    clients,
    cities,
    dossiers,
    templates,
    canDesign,
}: PageProps) {
    const { t, locale } = useTranslation();
    const initialQuery = readWorkspaceQuery();

    const [activeTab, setActiveTab] = useState<TabId>(initialQuery.tab);
    const [designState, setDesignState] = useState<ProjectDesignState>(initialQuery.design);
    const [selectedStepKey, setSelectedStepKey] = useState(
        workflow.currentStep ?? workflow.steps[0]?.key ?? null,
    );
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
    const [documentSubmitting, setDocumentSubmitting] = useState(false);
    const [initialTemplateId, setInitialTemplateId] = useState('');
    const [pendingStepKey, setPendingStepKey] = useState('');
    const [pendingRequirementKey, setPendingRequirementKey] = useState('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const invoiceDocuments = useMemo(
        () => financeDocuments.filter((document) => document.type === 'invoice'),
        [financeDocuments],
    );
    const totalFinance = useMemo(
        () => invoiceDocuments.reduce((total, document) => total + document.totalTtc, 0),
        [invoiceDocuments],
    );
    const totalPaid = useMemo(
        () => invoiceDocuments.reduce((total, document) => total + document.paidTotal, 0),
        [invoiceDocuments],
    );
    const totalRemaining = useMemo(
        () => invoiceDocuments.reduce((total, document) => total + document.remainingTotal, 0),
        [invoiceDocuments],
    );

    useEffect(() => {
        function handlePopState() {
            const next = readWorkspaceQuery();
            setActiveTab(next.tab);
            setDesignState(next.design);
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const editorOpen = activeTab === 'project-design'
            && designState.mode === 'files'
            && designState.file !== '';

        root.classList.toggle('pd-editor-workspace-open', editorOpen);
        return () => root.classList.remove('pd-editor-workspace-open');
    }, [activeTab, designState.file, designState.mode]);

    function pushQuery(updates: Record<string, string>) {
        const params = new URLSearchParams(window.location.search);

        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });

        const query = params.toString();
        window.history.pushState(
            null,
            '',
            `${window.location.pathname}${query ? `?${query}` : ''}`,
        );

        const next = readWorkspaceQuery();
        setActiveTab(next.tab);
        setDesignState(next.design);
    }

    function handleTabChange(tab: TabId) {
        pushQuery({
            tab,
            mode: '',
            file: '',
            version: '',
            asset: '',
            page: '',
            remark: '',
            inspector: '',
        });
    }

    function handleDesignNavigate(updates: Partial<ProjectDesignState>) {
        pushQuery({
            tab: 'project-design',
            ...Object.fromEntries(
                Object.entries(updates).map(([key, value]) => [key, value ?? '']),
            ),
        });
    }

    function handleProjectSubmit(payload: DossierFormPayload) {
        router.put(
            `/dossiers/${dossier.id}`,
            toDossierRequestPayload(payload, window.location.pathname + window.location.search),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditDrawerOpen(false);
                    setFormErrors({});
                    toast.success(t('projects.updated'));
                },
                onError: (errors) => {
                    setFormErrors(errors as FormErrors);
                    toast.error(t('projects.formError'));
                },
            },
        );
    }

    const openDocumentDrawer = useCallback((stepKey = '', requirementKey = '') => {
        const templateNames: Record<string, string[]> = {
            cin: ['CIN'],
            certificat_propriete: ['Certificat de propriete', 'Certificat de propriété'],
            plan_cadastral: ['Plan cadastral'],
            calcul_contenance: ['Calcul de contenance'],
            plan_parcellaire: ['Plan parcellaire'],
            cahier_received: ['Cahier de chantier'],
            contract_bureau_etude: ['Contrat BE'],
            plan_beton: ['Plan beton arme', 'Plan béton armé'],
            attestation_implantation: ['Attestation implantation'],
            contrat_topographie: ['Contrat topographie'],
            contrat_laboratoire: ['Contrat laboratoire'],
            bureau_controle: ['Bureau de controle', 'Bureau de contrôle'],
            fiche_energetique: ['Fiche energetique', 'Fiche énergétique'],
        };

        const names = templateNames[requirementKey] ?? [];
        const template = templates.find((item) => names.includes(item.label));

        setPendingStepKey(stepKey);
        setPendingRequirementKey(requirementKey);
        setInitialTemplateId(template?.id ?? '');
        setFormErrors({});
        setDocumentDrawerOpen(true);
    }, [templates]);

    function handleDocumentSubmit(payload: DocumentUploadPayload) {
        const formData = new FormData();
        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId);
        formData.append('status', payload.status);
        formData.append('notes', payload.notes);

        if (pendingStepKey) formData.append('workflow_step_key', pendingStepKey);
        if (pendingRequirementKey) formData.append('workflow_req_key', pendingRequirementKey);
        if (payload.file) formData.append('file', payload.file);

        setDocumentSubmitting(true);
        router.post('/documents', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setDocumentSubmitting(false);
                setDocumentDrawerOpen(false);
                setPendingStepKey('');
                setPendingRequirementKey('');
                setInitialTemplateId('');
                setFormErrors({});
                toast.success(t('clients.show.documentUploaded'));
            },
            onError: (errors) => {
                setDocumentSubmitting(false);
                setFormErrors(errors as FormErrors);
                toast.error(t('clients.show.documentFormError'));
            },
        });
    }

    function confirmDelete() {
        setDeleting(true);
        router.delete(`/dossiers/${dossier.id}`, {
            onSuccess: () => {
                setDeleting(false);
                toast.success(t('projects.deleted'));
            },
            onError: () => {
                setDeleting(false);
                toast.error(t('projects.deleteError'));
            },
        });
    }

    const tabs: AppWorkspaceTab<TabId>[] = [
        { id: 'overview', label: t('projects.tabs.overview'), icon: Building2 },
        { id: 'workflow', label: t('projects.tabs.workflow'), icon: ListChecks, count: workflow.total },
        { id: 'project-design', label: t('projects.tabs.design'), icon: Layers3 },
        { id: 'documents', label: t('projects.tabs.documents'), icon: FileCheck2, count: documents.length },
        { id: 'contract', label: t('projects.tabs.contract'), icon: ScrollText, count: contract ? 1 : 0 },
        { id: 'finance', label: t('projects.tabs.finance'), icon: BadgeDollarSign, count: financeDocuments.length },
        { id: 'notes', label: t('projects.tabs.notes'), icon: MessageSquareText },
        { id: 'activity', label: t('projects.tabs.activity'), icon: Activity, count: activity.length },
    ];

    const projectPanelClass = activeTab === 'project-design'
        ? 'flex min-h-0 flex-1 flex-col'
        : '';

    return (
        <>
            <Head title={`${dossier.dossierNumber} · ${dossier.projectObject}`} />
            <AppShell>
                <div className="dossier-show-root flex h-full min-h-0 flex-col">
                    <div className="pd-page-chrome">
                        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <button
                                    type="button"
                                    onClick={() => router.visit('/dossiers')}
                                    className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] transition hover:text-[var(--foreground)]"
                                >
                                    <ArrowLeft size={13} />
                                    {t('projects.backToProjects')}
                                </button>
                                <h1 className="truncate text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                                    {dossier.projectObject}
                                </h1>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {dossier.dossierNumber} · {dossier.clientName}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <AppButton
                                    isIconOnly
                                    compact
                                    variant="quiet"
                                    tooltip={t('projects.editProject')}
                                    aria-label={t('projects.editProject')}
                                    onPress={() => setEditDrawerOpen(true)}
                                >
                                    <Pencil size={15} />
                                </AppButton>
                                <AppButton
                                    isIconOnly
                                    compact
                                    variant="quiet"
                                    tooltip={t('projects.uploadDocument')}
                                    aria-label={t('projects.uploadDocument')}
                                    onPress={() => openDocumentDrawer()}
                                >
                                    <UploadCloud size={15} />
                                </AppButton>
                                <AppButton
                                    isIconOnly
                                    compact
                                    variant="quiet"
                                    tooltip={t('actions.delete')}
                                    aria-label={t('actions.delete')}
                                    onPress={() => setDeleteOpen(true)}
                                    className="text-red-400 hover:bg-red-400/10 hover:text-red-400"
                                >
                                    <Trash2 size={15} />
                                </AppButton>
                            </div>
                        </header>

                        <section className="mb-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                        <FolderKanban size={20} />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <AppBadge tone={statusTone(dossier.status)}>
                                                {statusLabel(t, dossier.status)}
                                            </AppBadge>
                                            <AppBadge tone="blue">
                                                {workflow.steps.find((step) => step.key === workflow.currentStep)?.label
                                                    ?? dossier.workflowStep}
                                            </AppBadge>
                                        </div>
                                        <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]">
                                            {dossier.clientName}
                                        </p>
                                        <p className="truncate text-xs text-[var(--text-muted)]">
                                            {dossier.clientNumber} · {dossier.clientCin}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-x-8 gap-y-1 text-xs text-[var(--text-muted)] sm:grid-cols-2">
                                    <span>{dossier.city?.name ?? '—'}</span>
                                    <span>{[dossier.province, dossier.commune].filter(Boolean).join(' · ') || '—'}</span>
                                    <span>{t('projects.show.openedAt')}: {dossier.openedAt ?? '—'}</span>
                                    <span>{t('common.updatedAt')}: {dossier.updatedAt ?? '—'}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] px-4 py-2.5">
                                <AppButton
                                    compact
                                    variant="quiet"
                                    onPress={() => router.visit(`/clients/${dossier.clientId}`)}
                                >
                                    <UserRound size={13} />
                                    {t('projects.show.client')}
                                </AppButton>
                                <AppButton
                                    compact
                                    variant="quiet"
                                    onPress={() => handleTabChange('documents')}
                                >
                                    <FileCheck2 size={13} />
                                    {t('projects.tabs.documents')}
                                </AppButton>
                                <AppButton
                                    compact
                                    variant="quiet"
                                    onPress={() => handleTabChange('finance')}
                                >
                                    <BadgeDollarSign size={13} />
                                    {t('projects.tabs.finance')}
                                </AppButton>
                                <AppButton
                                    compact
                                    variant="quiet"
                                    onPress={() => router.visit(`/archives?dossier_id=${dossier.id}`)}
                                >
                                    <Archive size={13} />
                                    {t('projects.show.archive')}
                                </AppButton>
                            </div>
                        </section>

                        <section className="mb-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                            <div className="px-4 sm:px-5">
                                <ProjectWorkflowStepper
                                    steps={workflow.steps}
                                    currentStep={workflow.currentStep}
                                    completed={workflow.completed}
                                    total={workflow.total}
                                    onStepClick={(key) => {
                                        setSelectedStepKey(key);
                                        handleTabChange('workflow');
                                    }}
                                />
                            </div>
                        </section>

                        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                            <MetricCard
                                label={t('projects.metrics.documents')}
                                value={documents.length}
                                icon={FileCheck2}
                            />
                            <MetricCard
                                label={t('projects.show.totalTtc')}
                                value={money(totalFinance, locale)}
                                icon={BadgeDollarSign}
                            />
                            <MetricCard
                                label={t('projects.show.paid')}
                                value={money(totalPaid, locale)}
                                icon={WalletCards}
                                tone="bg-emerald-400/10 text-emerald-400"
                            />
                            <MetricCard
                                label={t('projects.show.remaining')}
                                value={money(totalRemaining, locale)}
                                icon={Landmark}
                                tone="bg-amber-400/10 text-amber-400"
                            />
                            <MetricCard
                                label={t('projects.tabs.contract')}
                                value={contract ? statusLabel(t, contract.status) : '—'}
                                icon={ScrollText}
                                tone="bg-sky-400/10 text-sky-400"
                            />
                            <MetricCard
                                label={t('projects.show.archive')}
                                value={archiveRecord ? statusLabel(t, archiveRecord.status) : '—'}
                                icon={Archive}
                                tone="bg-violet-400/10 text-violet-400"
                            />
                        </div>
                    </div>

                    <AppWorkspaceTabs
                        tabs={tabs}
                        selectedKey={activeTab}
                        onSelectionChange={handleTabChange}
                        ariaLabel={t('projects.title')}
                        className={cn(
                            'pd-tabs-container overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm',
                            projectPanelClass,
                        )}
                        panelClassName={activeTab === 'project-design'
                            ? 'flex min-h-0 flex-1'
                            : 'p-4 sm:p-5'}
                    >
                        {activeTab === 'project-design' ? (
                            <Suspense
                                fallback={(
                                    <div className="flex flex-1 items-center justify-center p-8 text-sm text-[var(--text-muted)]">
                                        {t('projects.show.loadingDesign')}
                                    </div>
                                )}
                            >
                                <DesignTab
                                    dossierId={dossier.id}
                                    canDesign={canDesign}
                                    urlState={designState}
                                    onNavigate={handleDesignNavigate}
                                />
                            </Suspense>
                        ) : (
                            <>
                                {activeTab === 'overview' ? (
                                    <OverviewPanel
                                        dossier={dossier}
                                        workflow={workflow}
                                        contract={contract}
                                        archiveRecord={archiveRecord}
                                        t={t}
                                    />
                                ) : null}

                                {activeTab === 'workflow' ? (
                                    <WorkflowTab
                                        workflow={workflow}
                                        selectedStepKey={selectedStepKey}
                                        onSelectStep={setSelectedStepKey}
                                        dossierId={dossier.id}
                                        onOpenUpload={openDocumentDrawer}
                                        onOpenArchive={() => router.visit(`/archives?dossier_id=${dossier.id}`)}
                                    />
                                ) : null}

                                {activeTab === 'documents' ? (
                                    <DocumentsPanel
                                        documents={documents}
                                        contract={contract}
                                        onUpload={() => openDocumentDrawer()}
                                        t={t}
                                    />
                                ) : null}

                                {activeTab === 'contract' ? (
                                    <ContractPanel
                                        contract={contract}
                                        dossierId={dossier.id}
                                        locale={locale}
                                        t={t}
                                    />
                                ) : null}

                                {activeTab === 'finance' ? (
                                    <FinancePanel
                                        dossier={dossier}
                                        documents={financeDocuments}
                                        payments={payments}
                                        total={totalFinance}
                                        paid={totalPaid}
                                        remaining={totalRemaining}
                                        locale={locale}
                                        t={t}
                                    />
                                ) : null}

                                {activeTab === 'notes' ? (
                                    <NotesPanel dossier={dossier} onEdit={() => setEditDrawerOpen(true)} t={t} />
                                ) : null}

                                {activeTab === 'activity' ? (
                                    <ActivityPanel activity={activity} locale={locale} t={t} />
                                ) : null}
                            </>
                        )}
                    </AppWorkspaceTabs>

                    <ProjectDrawer
                        isOpen={editDrawerOpen}
                        mode="edit"
                        dossier={dossier}
                        clients={clients}
                        cities={cities}
                        onOpenChange={setEditDrawerOpen}
                        onSubmit={handleProjectSubmit}
                        errors={formErrors}
                    />

                    <DocumentDrawer
                        isOpen={documentDrawerOpen}
                        clients={clients}
                        dossiers={dossiers}
                        templates={templates}
                        initialClientId={dossier.clientId}
                        initialDossierId={String(dossier.id)}
                        initialTemplateId={initialTemplateId}
                        lockProject
                        onOpenChange={(open) => {
                            setDocumentDrawerOpen(open);
                            if (!open) {
                                setInitialTemplateId('');
                                setPendingStepKey('');
                                setPendingRequirementKey('');
                                setFormErrors({});
                            }
                        }}
                        onSubmit={handleDocumentSubmit}
                        errors={formErrors}
                        isSubmitting={documentSubmitting}
                    />

                    <AppModal
                        isOpen={deleteOpen}
                        onOpenChange={(open) => {
                            if (!deleting) setDeleteOpen(open);
                        }}
                        title={t('projects.deleteTitle')}
                        size="sm"
                    >
                        <p className="text-sm leading-6 text-[var(--text-muted)]">
                            {t('projects.deleteDescription')}
                        </p>
                        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                            <p className="font-semibold text-[var(--foreground)]">{dossier.projectObject}</p>
                            <p className="text-xs text-[var(--text-muted)]">{dossier.dossierNumber}</p>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <AppButton
                                variant="light"
                                isDisabled={deleting}
                                onPress={() => setDeleteOpen(false)}
                            >
                                {t('actions.cancel')}
                            </AppButton>
                            <AppButton color="danger" isDisabled={deleting} onPress={confirmDelete}>
                                {deleting ? '…' : t('actions.delete')}
                            </AppButton>
                        </div>
                    </AppModal>
                </div>
            </AppShell>
        </>
    );
}

function OverviewPanel({
    dossier,
    workflow,
    contract,
    archiveRecord,
    t,
}: {
    dossier: DossierRow;
    workflow: WorkflowData;
    contract: ProjectContractSummary;
    archiveRecord: ProjectArchiveSummary;
    t: (key: string, values?: Record<string, string | number>) => string;
}) {
    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
                <div>
                    <PanelHeader
                        title={t('projects.show.projectDetails')}
                        description={dossier.description ?? undefined}
                    />
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        <InfoField label={t('projects.show.client')} value={dossier.clientName} icon={UserRound} />
                        <InfoField label={t('projects.show.dossierNumber')} value={dossier.dossierNumber} icon={FolderKanban} />
                        <InfoField label={t('projects.show.city')} value={dossier.city?.name} icon={Building2} />
                        <InfoField label={t('projects.show.address')} value={dossier.projectAddress} icon={MapPin} />
                        <InfoField label={t('projects.show.province')} value={dossier.province} icon={MapPin} />
                        <InfoField label={t('projects.show.commune')} value={dossier.commune} icon={MapPin} />
                    </div>
                </div>

                <div>
                    <PanelHeader title={t('projects.show.property')} />
                    <div className="grid gap-2 sm:grid-cols-3">
                        <InfoField label={t('projects.show.landTitle')} value={dossier.landTitleNumber} icon={FileText} />
                        <InfoField label={t('projects.show.landSurface')} value={surface(dossier.landSurface)} icon={Ruler} />
                        <InfoField label={t('projects.show.floorArea')} value={surface(dossier.floorArea)} icon={Ruler} />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ListChecks size={15} className="text-[var(--accent)]" />
                            <h3 className="text-sm font-semibold text-[var(--foreground)]">
                                {t('projects.show.workflowProgress')}
                            </h3>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-[var(--accent)]">
                            {workflow.percent}%
                        </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                        <div
                            className="h-full rounded-full bg-[var(--accent)]"
                            style={{ width: `${workflow.percent}%` }}
                        />
                    </div>
                    <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                        {workflow.completed}/{workflow.total}
                    </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-2">
                        <ScrollText size={15} className="text-sky-400" />
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">
                            {t('projects.tabs.contract')}
                        </h3>
                    </div>
                    {contract ? (
                        <div className="mt-3 space-y-1.5 text-xs">
                            <div className="flex justify-between gap-3">
                                <span className="text-[var(--text-muted)]">{contract.contractNumber}</span>
                                <AppBadge tone={statusTone(contract.status)}>{statusLabel(t, contract.status)}</AppBadge>
                            </div>
                            <p className="font-semibold text-[var(--foreground)]">{contract.ttc.toLocaleString('fr-FR')} MAD</p>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-[var(--text-muted)]">{t('projects.show.noContract')}</p>
                    )}
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="flex items-center gap-2">
                        <Archive size={15} className="text-violet-400" />
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">
                            {t('projects.show.archive')}
                        </h3>
                    </div>
                    {archiveRecord ? (
                        <div className="mt-3 space-y-1 text-xs">
                            <p className="font-semibold text-[var(--foreground)]">{archiveRecord.archiveNumber}</p>
                            <p className="text-[var(--text-muted)]">{archiveRecord.locationLabel || '—'}</p>
                            <AppBadge tone={archiveRecord.isLost ? 'red' : statusTone(archiveRecord.status)}>
                                {statusLabel(t, archiveRecord.status)}
                            </AppBadge>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-[var(--text-muted)]">{t('projects.noData')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function DocumentsPanel({
    documents,
    contract,
    onUpload,
    t,
}: {
    documents: ProjectDocumentSummary[];
    contract: ProjectContractSummary;
    onUpload: () => void;
    t: (key: string, values?: Record<string, string | number>) => string;
}) {
    const contractFiles = contract ? [
        contract.hasGeneratedDoc ? {
            id: 'contract-docx',
            label: t('projects.show.generatedDocument'),
            href: `/contracts/${contract.id}/download/generated`,
        } : null,
        contract.hasPdf ? {
            id: 'contract-pdf',
            label: 'PDF',
            href: `/contracts/${contract.id}/download/pdf`,
        } : null,
    ].filter((item): item is { id: string; label: string; href: string } => item !== null) : [];

    return (
        <div>
            <PanelHeader
                title={t('projects.tabs.documents')}
                description={t('projects.show.documentsSummary', { count: documents.length + contractFiles.length })}
                action={(
                    <AppButton compact variant="accent" onPress={onUpload}>
                        <UploadCloud size={14} />
                        {t('projects.uploadDocument')}
                    </AppButton>
                )}
            />

            {documents.length === 0 && contractFiles.length === 0 ? (
                <AppEmptyState
                    icon={<FileCheck2 size={20} />}
                    title={t('projects.show.noDocuments')}
                    description={t('projects.show.noDocumentsDescription')}
                    action={(
                        <AppButton compact variant="accent" onPress={onUpload}>
                            <UploadCloud size={14} />
                            {t('projects.uploadDocument')}
                        </AppButton>
                    )}
                />
            ) : (
                <div className="space-y-2">
                    {documents.map((document) => (
                        <div
                            key={document.id}
                            className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 sm:flex-row sm:items-center"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-400">
                                <FileText size={16} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                    {document.name}
                                </p>
                                <p className="truncate text-[11px] text-[var(--text-muted)]">
                                    {[document.documentNumber, document.fileName, document.uploadedAt]
                                        .filter(Boolean)
                                        .join(' · ') || '—'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <AppBadge tone={statusTone(document.status)}>
                                    {statusLabel(t, document.status)}
                                </AppBadge>
                                {document.downloadUrl ? (
                                    <a
                                        href={document.downloadUrl}
                                        className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                                        title={t('actions.download')}
                                    >
                                        <Download size={14} />
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    ))}

                    {contractFiles.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
                        >
                            <span className="flex size-9 items-center justify-center rounded-lg bg-violet-400/10 text-violet-400">
                                <ScrollText size={16} />
                            </span>
                            <p className="flex-1 text-sm font-semibold text-[var(--foreground)]">{file.label}</p>
                            <a
                                href={file.href}
                                className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
                                title={t('actions.download')}
                            >
                                <Download size={14} />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ContractPanel({
    contract,
    dossierId,
    locale,
    t,
}: {
    contract: ProjectContractSummary;
    dossierId: number;
    locale: string;
    t: (key: string, values?: Record<string, string | number>) => string;
}) {
    const [working, setWorking] = useState(false);

    function generate(type: 'docx' | 'pdf') {
        if (!contract) return;

        setWorking(true);
        router.put(
            type === 'pdf'
                ? `/contracts/${contract.id}/export-pdf`
                : `/contracts/${contract.id}/generate`,
            { return_to: `${window.location.pathname}?tab=contract` },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setWorking(false);
                    toast.success(type === 'pdf'
                        ? t('projects.show.generatePdfSuccess')
                        : t('projects.show.generateDocxSuccess'));
                },
                onError: () => {
                    setWorking(false);
                    toast.error(t('projects.show.generateError'));
                },
            },
        );
    }

    function markSigned() {
        if (!contract) return;

        setWorking(true);
        router.put(
            `/contracts/${contract.id}/signed`,
            { return_to: `${window.location.pathname}?tab=contract` },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setWorking(false);
                    toast.success(t('projects.show.signedContract'));
                },
                onError: () => {
                    setWorking(false);
                    toast.error(t('projects.show.updateError'));
                },
            },
        );
    }

    if (!contract) {
        return (
            <AppEmptyState
                icon={<ScrollText size={20} />}
                title={t('projects.show.noContract')}
                description={t('projects.show.noContractDescription')}
                action={(
                    <AppButton
                        compact
                        variant="accent"
                        onPress={() => router.visit(`/contracts?dossier_id=${dossierId}`)}
                    >
                        <ExternalLink size={14} />
                        {t('projects.tabs.contract')}
                    </AppButton>
                )}
            />
        );
    }

    return (
        <div>
            <PanelHeader
                title={`${t('projects.tabs.contract')} · ${contract.contractNumber}`}
                description={contract.notes ?? undefined}
                action={(
                    <AppButton
                        compact
                        variant="quiet"
                        onPress={() => router.visit(`/contracts?dossier_id=${dossierId}`)}
                    >
                        <ExternalLink size={14} />
                        {t('actions.open')}
                    </AppButton>
                )}
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoField label={t('common.status')} value={<AppBadge tone={statusTone(contract.status)}>{statusLabel(t, contract.status)}</AppBadge>} />
                <InfoField label={t('projects.show.contractAmount')} value={money(contract.ttc, locale)} />
                <InfoField label={t('projects.show.floorArea')} value={surface(contract.surface)} />
                <InfoField label="TVA" value={money(contract.tva, locale)} />
                <InfoField label="HT" value={money(contract.ht, locale)} />
                <InfoField label="Prix / m²" value={money(contract.pricePerSquareMeter, locale)} />
                <InfoField label="Taux honoraires" value={`${contract.feeRatePercent}%`} />
                <InfoField label={t('common.updatedAt')} value={contract.signedAt ?? contract.generatedAt ?? contract.createdAt} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <AppButton compact variant="quiet" isDisabled={working} onPress={() => generate('docx')}>
                    <FileText size={14} />
                    DOCX
                </AppButton>
                <AppButton compact variant="quiet" isDisabled={working} onPress={() => generate('pdf')}>
                    <FileCheck2 size={14} />
                    PDF
                </AppButton>
                {contract.status !== 'signed' ? (
                    <AppButton compact variant="accent" isDisabled={working} onPress={markSigned}>
                        <CheckCircle2 size={14} />
                        {t('projects.show.signedContract')}
                    </AppButton>
                ) : null}
                {contract.hasGeneratedDoc ? (
                    <a
                        href={`/contracts/${contract.id}/download/generated`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                    >
                        <Download size={14} />
                        DOCX
                    </a>
                ) : null}
                {contract.hasPdf ? (
                    <a
                        href={`/contracts/${contract.id}/download/pdf`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                    >
                        <Download size={14} />
                        PDF
                    </a>
                ) : null}
            </div>
        </div>
    );
}

function FinancePanel({
    dossier,
    documents,
    payments,
    total,
    paid,
    remaining,
    locale,
    t,
}: {
    dossier: DossierRow;
    documents: ProjectFinanceDocumentSummary[];
    payments: ProjectPaymentSummary[];
    total: number;
    paid: number;
    remaining: number;
    locale: string;
    t: (key: string, values?: Record<string, string | number>) => string;
}) {
    return (
        <div>
            <PanelHeader
                title={t('projects.tabs.finance')}
                description={t('projects.show.financeSummary', { count: documents.length })}
                action={(
                    <AppButton
                        compact
                        variant="accent"
                        onPress={() => router.visit(`/finance/documents?dossier_id=${dossier.id}`)}
                    >
                        <ExternalLink size={14} />
                        {t('projects.openFinance')}
                    </AppButton>
                )}
            />

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <MetricCard label={t('projects.show.totalTtc')} value={money(total, locale)} icon={ReceiptText} />
                <MetricCard label={t('projects.show.paid')} value={money(paid, locale)} icon={WalletCards} tone="bg-emerald-400/10 text-emerald-400" />
                <MetricCard label={t('projects.show.remaining')} value={money(remaining, locale)} icon={Landmark} tone="bg-amber-400/10 text-amber-400" />
            </div>

            {documents.length === 0 ? (
                <AppEmptyState
                    icon={<BadgeDollarSign size={20} />}
                    title={t('projects.show.noFinance')}
                    description={t('projects.show.noFinanceDescription')}
                />
            ) : (
                <div className="space-y-2">
                    {documents.map((document) => (
                        <button
                            key={document.id}
                            type="button"
                            onClick={() => router.visit(`/finance/documents/${document.id}`)}
                            className="flex w-full flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-left transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] sm:flex-row sm:items-center"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                                <ReceiptText size={16} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                    {document.number}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)]">
                                    {document.type} · {document.issueDate ?? '—'}
                                </p>
                            </div>
                            <AppBadge tone={statusTone(document.status)}>
                                {statusLabel(t, document.status)}
                            </AppBadge>
                            <div className="sm:text-right">
                                <p className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
                                    {money(document.totalTtc, locale, document.currency)}
                                </p>
                                <p className="text-[10px] tabular-nums text-[var(--text-muted)]">
                                    {t('projects.show.remaining')}: {money(document.remainingTotal, locale, document.currency)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <PanelHeader
                    title={t('projects.show.recentPayments')}
                    description={t('projects.show.paymentSummary', { count: payments.length })}
                />

                {payments.length === 0 ? (
                    <AppEmptyState
                        className="py-8"
                        icon={<WalletCards size={20} />}
                        title={t('projects.show.noPayments')}
                        description={t('projects.show.noPaymentsDescription')}
                    />
                ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                            {payment.paymentNumber}
                                        </p>
                                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                                            {[payment.documentNumber, payment.method, payment.paidAt]
                                                .filter(Boolean)
                                                .join(' · ') || '—'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-400">
                                        {money(payment.amount, locale)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function NotesPanel({
    dossier,
    onEdit,
    t,
}: {
    dossier: DossierRow;
    onEdit: () => void;
    t: (key: string) => string;
}) {
    return (
        <div>
            <PanelHeader
                title={t('projects.tabs.notes')}
                action={(
                    <AppButton compact variant="quiet" onPress={onEdit}>
                        <Pencil size={14} />
                        {t('projects.editProject')}
                    </AppButton>
                )}
            />
            <div className="min-h-40 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-6 text-[var(--foreground)]">
                {dossier.notes || t('projects.show.noNotes')}
            </div>
        </div>
    );
}

function ActivityPanel({
    activity,
    locale,
    t,
}: {
    activity: ProjectActivityItem[];
    locale: string;
    t: (key: string, values?: Record<string, string | number>) => string;
}) {
    const [page, setPage] = useState(0);
    const pageCount = Math.max(1, Math.ceil(activity.length / ACTIVITY_PAGE_SIZE));
    const resolvedPage = Math.min(page, pageCount - 1);
    const pageItems = activity.slice(
        resolvedPage * ACTIVITY_PAGE_SIZE,
        (resolvedPage + 1) * ACTIVITY_PAGE_SIZE,
    );

    if (activity.length === 0) {
        return (
            <AppEmptyState
                icon={<Activity size={20} />}
                title={t('projects.show.noActivity')}
                description={t('projects.show.noActivityDescription')}
            />
        );
    }

    return (
        <div>
            <PanelHeader
                title={t('projects.tabs.activity')}
                description={t('projects.resultCount', { count: activity.length })}
            />

            <div className="space-y-2">
                {pageItems.map((item) => {
                    const labelKey = `projects.activity.${item.type}`;
                    const translated = t(labelKey);
                    const label = translated === labelKey
                        ? item.type.replace(/_/g, ' ')
                        : translated;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                if (item.href) router.visit(item.href);
                            }}
                            disabled={!item.href}
                            className="flex w-full items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-left transition enabled:hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]"
                        >
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <Activity size={14} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
                                    {item.status ? (
                                        <AppBadge tone={statusTone(item.status)}>
                                            {statusLabel(t, item.status)}
                                        </AppBadge>
                                    ) : null}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                                    {item.subject}
                                </p>
                                {item.amount !== null ? (
                                    <p className="mt-1 text-xs font-semibold tabular-nums text-[var(--foreground)]">
                                        {money(item.amount, locale)}
                                    </p>
                                ) : null}
                            </div>
                            <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                                {item.occurredAtLabel}
                            </span>
                        </button>
                    );
                })}
            </div>

            {pageCount > 1 ? (
                <div className="mt-4 flex items-center justify-end gap-1">
                    <AppButton
                        isIconOnly
                        compact
                        variant="quiet"
                        tooltip={t('projects.previous')}
                        aria-label={t('projects.previous')}
                        isDisabled={resolvedPage === 0}
                        onPress={() => setPage(Math.max(0, resolvedPage - 1))}
                    >
                        <ChevronLeft size={14} />
                    </AppButton>
                    <span className="min-w-20 text-center text-[10px] text-[var(--text-muted)]">
                        {t('projects.pageStatus', { current: resolvedPage + 1, total: pageCount })}
                    </span>
                    <AppButton
                        isIconOnly
                        compact
                        variant="quiet"
                        tooltip={t('projects.next')}
                        aria-label={t('projects.next')}
                        isDisabled={resolvedPage >= pageCount - 1}
                        onPress={() => setPage(Math.min(pageCount - 1, resolvedPage + 1))}
                    >
                        <ChevronRight size={14} />
                    </AppButton>
                </div>
            ) : null}
        </div>
    );
}
