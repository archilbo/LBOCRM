import { Head, router } from '@inertiajs/react';
import { IconAlertCircle, IconArchive, IconArrowLeft, IconArrowRight, IconCoin, IconBuilding, IconCalculator, IconCalendar, IconCheck, IconCircleCheck, IconCircle, IconCircleDot, IconClipboardCheck, IconContract, IconDownload, IconExternalLink, IconFileCheck, IconFileDownload, IconFileText, IconFileUpload, IconFiles, IconFolder, IconHistory, IconBuildingBank, IconLayoutDashboard, IconListCheck, IconMap, IconMapPin, IconNotes, IconDots, IconPencil, IconPercentage, IconPrinter, IconReceipt2, IconRuler, IconTrash, IconUserCircle } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';


import { Button, Dropdown } from '@heroui/react';
import { AppModal } from '@/components/ui/AppModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { EntityTabs } from '@/components/navigation/entity-tabs';
import { archiveVisualStatus } from '@/config/statuses';
import { formatDate } from '@/lib/formatters';
import { ProjectWorkflowStepper } from '@/features/dossiers/components/ProjectWorkflowStepper';
import { WorkflowTab } from '@/features/dossiers/components/WorkflowTab';
const DesignTab = React.lazy(() => import('@/features/dossiers/components/DesignTab'));
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { EfficiencySheetDrawer } from '@/features/dossiers/drawers/EfficiencySheetDrawer';
import { DocumentDrawer } from '@/components/drawers';
import { ContractDrawer } from '@/components/drawers';
import { FinanceDrawer } from '@/components/drawers';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import type { DossierRow, ClientOption, City } from '@/features/dossiers/types';
import type { DossierOption, DocumentTemplateOption, DocumentUploadPayload } from '@/features/documents/types';
import type { ArchitectFeeOption, ContractClientOption, ContractFormPayload, ContractRow } from '@/features/contracts/types';
import type { FinanceDossierOption, FinanceFormPayload } from '@/features/finance/types';
import type { FormErrors } from '@/lib/formErrors';
import type { WorkflowData } from '@/types/workflow';
import { ProjectDocumentsTab } from '@/features/documents/project/ProjectDocumentsTab';
import type { ExplorerDocumentPayload } from '@/features/documents/explorer/documentExplorerTypes';
import { useTranslation } from '@/lib/i18n';

type DocSummary = {
    id: number; name: string; status: string; fileName: string | null; uploadedAt: string | null;
};
type ContractSummary = {
    id: number; dossierId: string; contractNumber: string; status: string;
    surface: number; pricePerSquareMeter: number; feeRatePercent: number;
    calculationMode: string; forfaitTtc: number;
    ht: number; tva: number; ttc: number;
    notes: string | null;
    generatedAt: string | null; signedAt: string | null; createdAt: string | null;
    hasGeneratedDoc: boolean; hasPdf: boolean;
} | null;
type FinanceSummary = {
    id: number; recordNumber: string; type: string; status: string; totalTtc: number; paid: number; remaining: number;
};
type ArchiveSummary = {
    id: number; archiveNumber: string; displaySequence: string; status: string; room: string | null; shelf: string | null; box: string | null; folder: string | null;
    city: { id: number; name: string; color: string } | null;
    dossierId?: string; clientId?: string; dossierNumber?: string; projectObject?: string;
    clientName?: string; clientCin?: string; inDate?: string; outDate?: string; returnedAt?: string;
    requestedBy?: string; notes?: string; isOverdue?: boolean; isLost?: boolean;
    lostReason?: string; locationLabel?: string;
} | null;

type ArchiveLocationOption = { id: number; code: string; name: string; roomId?: number; shelfId?: number; };

type PageProps = {
    dossier: DossierRow;
    workflow: WorkflowData;
    documents: DocSummary[];
    explorerDocuments: ExplorerDocumentPayload[];
    contract: ContractSummary;
    financeRecords: FinanceSummary[];
    archiveRecord: ArchiveSummary;
    clients: ClientOption[];
    cities: City[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    workflowTemplateMap: Record<string, string>;
    contractClients: ContractClientOption[];
    architectFeeOptions: ArchitectFeeOption[];
    financeDossiers: FinanceDossierOption[];
    archiveRooms: ArchiveLocationOption[];
    archiveShelves: ArchiveLocationOption[];
    archiveBoxes: ArchiveLocationOption[];
    canDesign?: boolean;
    capabilities?: {
        canViewEfficiencySheet?: boolean;
        canCreateEfficiencySheet?: boolean;
        canUpdateEfficiencySheet?: boolean;
        canCreateDocuments?: boolean;
        canViewArchive?: boolean;
    };
};

export type ProjectDesignQuery = { tab: string; mode?: string; file?: string; version?: string; asset?: string; page?: string; remark?: string; inspector?: string };

type TabId = 'overview' | 'workflow' | 'project-design' | 'documents' | 'contract' | 'finance' | 'notes' | 'activity';

const TAB_DEFS: { id: TabId; icon: Icon }[] = [
    { id: 'overview', icon: IconLayoutDashboard },
    { id: 'workflow', icon: IconListCheck },
    { id: 'project-design', icon: IconRuler },
    { id: 'documents', icon: IconFiles },
    { id: 'contract', icon: IconContract },
    { id: 'finance', icon: IconReceipt2 },
    { id: 'notes', icon: IconNotes },
    { id: 'activity', icon: IconHistory },
];

function money(value: number) {
    return `${Number(value || 0).toLocaleString('fr-MA')} MAD`;
}

function surface(value: number | null) {
    return value ? `${value} m²` : '-';
}

function dossierStatusColor(status: string) {
    if (status === 'active') return 'success';
    if (status === 'opened') return 'primary';
    if (status === 'closed') return 'default';
    if (status === 'archived' || status === 'paused') return 'warning';
    return 'default';
}

const WORKFLOW_STEP_KEYS = new Set(['client', 'documents', 'contract', 'cahier_chantier', 'rokhas', 'bureau_etude', 'permis_habiter', 'archive']);

function workflowLabel(value: string, t: (key: string) => string) {
    if (!WORKFLOW_STEP_KEYS.has(value)) return value;
    return t(`dossiers.show.workflowSteps.${value}`);
}

const DOSSIER_STATUS_KEYS = new Set(['opened', 'active', 'paused', 'closed', 'archived']);

function dossierStatusLabel(status: string, t: (key: string) => string) {
    if (!DOSSIER_STATUS_KEYS.has(status)) return status;
    return t(`dossiers.show.statuses.${status}`);
}

export default function DossierShow({
    dossier, workflow, explorerDocuments, contract, financeRecords, archiveRecord,
    clients,
    cities,
    dossiers: dossiersOptions,
    templates,
    workflowTemplateMap,
    contractClients, architectFeeOptions,
    financeDossiers,
    archiveRooms, archiveShelves, archiveBoxes, canDesign, capabilities,
}: PageProps) {
    const { t } = useTranslation();
    const tabs = useMemo(
        () => TAB_DEFS.map(({ id, icon }) => ({ id, icon, label: t(`dossiers.show.tabs.${id}`) })),
        [t],
    );
    const canViewEfficiencySheet = capabilities?.canViewEfficiencySheet ?? false;
    const canCreateEfficiencySheet = capabilities?.canCreateEfficiencySheet ?? false;
    const canUpdateEfficiencySheet = capabilities?.canUpdateEfficiencySheet ?? false;
    const parseQuery = useCallback((): { tab: TabId; pdMode: string; pdFile: string; pdVersion: string; pdAsset: string; pdPage: string; pdRemark: string; pdInspector: string } => {
        const p = new URLSearchParams(window.location.search);
        const tab = (tabs.find((tabDef) => tabDef.id === p.get('tab'))?.id as TabId) || 'overview';
        return { tab, pdMode: p.get('mode') || '', pdFile: p.get('file') || '', pdVersion: p.get('version') || '', pdAsset: p.get('asset') || '', pdPage: p.get('page') || '', pdRemark: p.get('remark') || '', pdInspector: p.get('inspector') || '' };
    }, [tabs]);
    const [query, setQuery] = useState(() => parseQuery());
    const [activeTab, setActiveTab] = useState<TabId>(query.tab);
    const [pdState, setPdState] = useState({ mode: query.pdMode, file: query.pdFile, version: query.pdVersion, asset: query.pdAsset, page: query.pdPage, remark: query.pdRemark, inspector: query.pdInspector });

    useEffect(() => {
        const handler = () => {
            const q = parseQuery();
            setActiveTab(q.tab);
            setPdState({ mode: q.pdMode, file: q.pdFile, version: q.pdVersion, asset: q.pdAsset, page: q.pdPage, remark: q.pdRemark, inspector: q.pdInspector });
        };
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, [parseQuery]);

    useEffect(() => {
        const root = document.documentElement;
        const isEditorOpen = activeTab === 'project-design' && pdState.mode === 'files' && pdState.file !== '';
        if (isEditorOpen) {
            root.classList.add('pd-editor-workspace-open');
        } else {
            root.classList.remove('pd-editor-workspace-open');
        }
        return () => root.classList.remove('pd-editor-workspace-open');
    }, [activeTab, pdState.mode, pdState.file]);

    function pushQuery(overrides: Record<string, string>) {
        const p = new URLSearchParams(window.location.search);
        for (const [k, v] of Object.entries(overrides)) { if (v) p.set(k, v); else p.delete(k); }
        const qs = p.toString();
        const url = window.location.pathname + (qs ? '?' + qs : '');
        window.history.pushState(null, '', url);
        const q = parseQuery();
        setActiveTab(q.tab);
        setPdState({ mode: q.pdMode, file: q.pdFile, version: q.pdVersion, asset: q.pdAsset, page: q.pdPage, remark: q.pdRemark, inspector: q.pdInspector });
    }

    function handleTabChange(tab: TabId) {
        pushQuery({ tab, mode: '', file: '', version: '', asset: '', page: '', remark: '', inspector: '' });
    }

    function handlePdNavigate(updates: { mode?: string; file?: string; version?: string; asset?: string; page?: string; remark?: string; inspector?: string }) {
        pushQuery({ tab: 'project-design', ...updates });
    }

    const [selectedStepKey, setSelectedStepKey] = useState(workflow.currentStep ?? workflow.steps[0]?.key ?? null);

    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
    const [initialTemplateId, setInitialTemplateId] = useState('');
    const [pendingStepKey, setPendingStepKey] = useState('');
    const [pendingReqKey, setPendingReqKey] = useState('');
    const [archiveDrawerOpen, setArchiveDrawerOpen] = useState(false);
    const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
    const [editContract, setEditContract] = useState<ContractSummary>(null);
    const [financeDrawerOpen, setFinanceDrawerOpen] = useState(false);
    const [contractSigned, setContractSigned] = useState(false);
    const [efficiencySheetDrawerOpen, setEfficiencySheetDrawerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const handleOpenUpload = useCallback(
        (
            stepKey?: string,
            reqKey?: string,
        ) => {
            const resolvedTemplateId =
                reqKey
                    ? workflowTemplateMap[
                        reqKey
                    ] ?? ''
                    : '';

            setPendingStepKey(
                stepKey ?? ''
            );

            setPendingReqKey(
                reqKey ?? ''
            );

            setInitialTemplateId(
                resolvedTemplateId
            );

            if (
                reqKey
                && ! resolvedTemplateId
            ) {
                toast.warning(
                    t('dossiers.show.toasts.noTemplateForRequirement')
                );
            }

            setDocumentDrawerOpen(true);
        },
        [workflowTemplateMap, t],
    );

    function handleArchiveSubmit(payload: { clientId: string; dossierId: string; status: string; room: string | null; shelf: string | null; box: string | null; folder: string | null; inDate: string | null; outDate: string | null; returnedAt: string | null; requestedBy: string | null; notes: string | null; }) {
        router.post('/archives', { ...payload, dossier_id: payload.dossierId, return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setArchiveDrawerOpen(false); toast.success(t('dossiers.show.toasts.archiveCreated')); },
            onError: () => { toast.error(t('dossiers.show.toasts.archiveCreateFailed')); },
        });
    }

    const contractStatusLabels: Record<string, string> = { draft: t('dossiers.show.contractStatus.draft'), generated: t('dossiers.show.contractStatus.generated'), signed: t('dossiers.show.contractStatus.signed') };
    const contractStatusColors: Record<string, string> = { draft: 'text-amber-500', generated: 'text-blue-500', signed: 'text-emerald-500' };
    const resolvedContractStatus = contractSigned ? 'signed' : (contract?.status ?? 'none');
    const totalFinance = financeRecords.reduce((s, r) => s + r.totalTtc, 0);
    const paidFinance = financeRecords.reduce((s, r) => s + r.paid, 0);
    const remainingFinance = financeRecords.reduce((s, r) => s + r.remaining, 0);

    const selectedStep = useMemo(
        () => workflow.steps.find((s) => s.key === selectedStepKey) ?? null,
        [workflow.steps, selectedStepKey],
    );

    const contractDossiers = useMemo(
        () => contractClients.flatMap((c) => c.dossiers),
        [contractClients],
    );

    function handleProjectSubmit(payload: Record<string, unknown>) {
        router.put(`/dossiers/${dossier.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => { setEditDrawerOpen(false); setFormErrors({}); toast.success(t('dossiers.show.toasts.projectUpdated')); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error(t('dossiers.show.toasts.projectUpdateFailed')); },
        });
    }

    function handleDocumentSubmit(
        payload: DocumentUploadPayload,
    ) {
        const formData = new FormData();

        const selectedTemplate =
            templates.find(
                (template) =>
                    template.id ===
                    payload.documentTemplateId
            ) ?? null;

        formData.append(
            'dossier_id',
            payload.dossierId
        );

        formData.append(
            'document_template_id',
            payload.documentTemplateId
        );

        formData.append(
            'status',
            payload.status
        );

        formData.append(
            'notes',
            payload.notes
        );

        if (
            selectedTemplate?.uploadMode
                === 'cin_pair'
        ) {
            if (payload.cinFrontFile) {
                formData.append(
                    'file_front',
                    payload.cinFrontFile
                );
            }

            if (payload.cinBackFile) {
                formData.append(
                    'file_back',
                    payload.cinBackFile
                );
            }
        } else if (payload.file) {
            formData.append(
                'file',
                payload.file
            );
        }

        const expectedTemplateId =
            pendingReqKey
                ? workflowTemplateMap[
                    pendingReqKey
                ] ?? ''
                : '';

        const matchesWorkflowType =
            pendingReqKey === ''
            || expectedTemplateId
                === payload.documentTemplateId;

        if (
            pendingStepKey
            && pendingReqKey
            && matchesWorkflowType
        ) {
            formData.append(
                'workflow_step_key',
                pendingStepKey
            );

            formData.append(
                'workflow_req_key',
                pendingReqKey
            );
        }

        router.post(
            '/documents',
            formData,
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    setDocumentDrawerOpen(
                        false
                    );

                    setInitialTemplateId('');
                    setPendingStepKey('');
                    setPendingReqKey('');
                    setFormErrors({});

                    toast.success(
                        t('dossiers.show.toasts.documentUploaded')
                    );
                },

                onError: (errorBag) => {
                    setFormErrors(
                        errorBag as FormErrors
                    );

                    toast.error(
                        t('dossiers.show.toasts.documentUploadFailed')
                    );
                },
            }
        );
    }

    function handleContractSubmit(payload: ContractFormPayload) {
        router.post('/contracts', { ...payload, return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setContractDrawerOpen(false); setEditContract(null); setFormErrors({}); toast.success(t('dossiers.show.toasts.contractCreated')); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error(t('dossiers.show.toasts.contractCreateFailed')); },
        });
    }

    function handleContractUpdate(payload: ContractFormPayload) {
        if (!editContract) return;
        router.put(`/contracts/${editContract.id}`, { ...payload, return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setContractDrawerOpen(false); setEditContract(null); setFormErrors({}); toast.success(t('dossiers.show.toasts.contractUpdated')); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error(t('dossiers.show.toasts.contractUpdateFailed')); },
        });
    }

    function toFinanceBackend(payload: FinanceFormPayload) {
        return {
            dossier_id: payload.dossierId,
            type: payload.type || 'devis',
            status: payload.status || 'draft',
            ht: payload.ht || null,
            tva: payload.tva || null,
            total_ttc: payload.totalTtc || 0,
            paid: payload.paid || 0,
            issued_at: payload.issuedAt || null,
            due_date: payload.dueDate || null,
            paid_at: payload.paidAt || null,
            notes: payload.notes || null,
        };
    }

    function handleFinanceSubmit(payload: FinanceFormPayload) {
        router.post('/finance', toFinanceBackend(payload), {
            preserveScroll: true,
            onSuccess: () => { setFinanceDrawerOpen(false); setFormErrors({}); toast.success(t('dossiers.show.toasts.financeCreated')); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error(t('dossiers.show.toasts.financeCreateFailed')); },
        });
    }

    const quickActions = [
        { label: t('dossiers.show.quickActions.openClient'), icon: <IconUserCircle size={14} />, action: () => router.visit(`/clients/${dossier.clientId}`) },
        { label: t('dossiers.show.quickActions.edit'), icon: <IconPencil size={14} />, action: () => setEditDrawerOpen(true) },
        { label: t('dossiers.show.quickActions.documents'), icon: <IconFileCheck size={14} />, action: () => setDocumentDrawerOpen(true) },
        { label: t('dossiers.show.quickActions.contract'), icon: <IconFileText size={14} />, action: () => { setEditContract(null); setContractDrawerOpen(true); } },
        { label: t('dossiers.show.quickActions.finance'), icon: <IconCoin size={14} />, action: () => setFinanceDrawerOpen(true) },
    ];
    return (
        <>
            <Head title={dossier.dossierNumber} />

            <AppShell>
                <div className="app-shell-content dossier-show-root h-full min-h-0 flex flex-col">
                <div className="pd-page-chrome">
                    {/* ── Page header ── */}
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <button type="button" onClick={() => router.visit('/dossiers')}
                                className="mb-2 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
                                <IconArrowLeft size={13} />
                                {t('dossiers.show.backToProjects')}
                            </button>
                            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                                {dossier.projectObject || dossier.dossierNumber}
                            </h1>
                            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                                {dossier.dossierNumber} / {dossier.clientName}
                            </p>
                        </div>

                    </div>

                    {/* ── Hero summary card ── */}
                    <div className="mb-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3.5">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]">
                                    <IconFolder size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <StatusPill label={dossierStatusLabel(dossier.status, t)} color={dossierStatusColor(dossier.status)} size="sm" />
                                        <StatusPill label={workflowLabel(selectedStep?.key ?? dossier.workflowStep, t)} color="primary" size="sm" />
                                    </div>
                                    <p className="mt-1.5 text-[12px] text-[var(--foreground)]">
                                        {dossier.clientName} · {dossier.dossierNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-x-6 gap-y-1 text-[11px] text-[var(--text-muted)] sm:grid-cols-2 sm:text-right">
                                <span>{dossier.clientNumber} / {dossier.clientCin}</span>
                                <span>{[dossier.province, dossier.commune].filter(Boolean).join(', ') || '-'}</span>
                                <span>{t('dossiers.show.opened')}: {dossier.openedAt || '-'}</span>
                                <span>{t('dossiers.show.updated')}: {dossier.updatedAt || '-'}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] px-4 py-2.5">
                            <AppButton variant="bordered" size="sm" className="h-7 text-[10px]" onPress={() => router.visit(`/clients/${dossier.clientId}`)}>
                                <IconUserCircle size={13} /> {t('dossiers.show.openClient')}
                            </AppButton>
                            <AppButton variant="bordered" size="sm" className="h-7 text-[10px]" onPress={() => setEditDrawerOpen(true)}>
                                <IconPencil size={13} /> {t('dossiers.show.edit')}
                            </AppButton>
                            <AppButton variant="bordered" size="sm" className="h-7 text-[10px]" onPress={() => { setEditContract(null); setContractDrawerOpen(true); }}>
                                <IconFileText size={13} /> {t('dossiers.show.contractButton')}
                            </AppButton>
                            {canViewEfficiencySheet ? (
                                <AppButton variant="bordered" size="sm" className="h-7 text-[10px]" onPress={() => setEfficiencySheetDrawerOpen(true)}>
                                    <IconClipboardCheck size={13} /> {t('dossiers.show.ficheEfficacite')}
                                </AppButton>
                            ) : null}
                            <AppButton variant="bordered" size="sm" className="h-7 text-[10px]" onPress={() => setDocumentDrawerOpen(true)}>
                                <IconFileCheck size={13} /> {t('dossiers.show.documents')}
                            </AppButton>
                        </div>
                    </div>

                    {/* ── Workflow stepper ── */}
                    <div className="mb-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                        <div className="px-4 sm:px-5">
                            <ProjectWorkflowStepper
                                steps={workflow.steps}
                                currentStep={workflow.currentStep}
                                completed={workflow.completed}
                                total={workflow.total}
                                onStepClick={(key) => { setSelectedStepKey(key); handleTabChange('workflow'); }}
                            />
                        </div>
                    </div>

                    {/* ── Metrics row ── */}
                    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                        <MetricCard label={t('dossiers.show.metrics.documents')} value={explorerDocuments.length} hint={t('dossiers.show.metrics.documentsHint')} icon={IconFileCheck} />
                        <MetricCard label={t('dossiers.show.metrics.financeTotal')} value={money(totalFinance)} hint={t('dossiers.show.metrics.financeTotalHint')} icon={IconCoin} color="text-[var(--foreground)]" />
                        <MetricCard label={t('dossiers.show.metrics.paid')} value={money(paidFinance)} hint={t('dossiers.show.metrics.paidHint')} icon={IconReceipt2} color="text-emerald-500" />
                        <MetricCard label={t('dossiers.show.metrics.remaining')} value={money(remainingFinance)} hint={t('dossiers.show.metrics.remainingHint')} icon={IconBuildingBank} color="text-amber-500" />
                        <MetricCard label={t('dossiers.show.metrics.contract')} value={contract ? contractStatusLabels[resolvedContractStatus] || contract.status : t('dossiers.show.contractStatus.none')} hint={contract ? `${money(contract.ttc)}` : '-'} icon={IconFileText} color={contract ? (contractStatusColors[resolvedContractStatus] || '') : ''} />
                    </div>
                </div>

                {/* ── Tabs (shared EntityTabs) ── */}
                <div className={activeTab === 'project-design' ? 'flex min-h-0 flex-1 flex-col' : ''}>
                    <EntityTabs
                        tabs={tabs}
                        selectedKey={activeTab}
                        onSelectionChange={(key) => handleTabChange(key as TabId)}
                        className={activeTab === 'project-design' ? 'flex min-h-0 flex-1 flex-col' : ''}
                    >
                    {activeTab === 'project-design' ? (
                        <DesignTab dossierId={dossier.id} canDesign={canDesign} urlState={pdState} onNavigate={handlePdNavigate} />
                    ) : (
                        <div className="p-4 sm:p-5">
                            {activeTab === 'overview' && (
                                <OverviewTab dossier={dossier} workflow={workflow} contract={contract}
                                    archiveRecord={archiveRecord} canViewArchive={capabilities?.canViewArchive ?? false} />
                            )}
                            {activeTab === 'workflow' && (
                                <WorkflowTab workflow={workflow} selectedStepKey={selectedStepKey} onSelectStep={setSelectedStepKey} dossierId={dossier.id} onOpenUpload={handleOpenUpload} onOpenArchive={() => setArchiveDrawerOpen(true)} />
                            )}
                            {activeTab === 'documents' && (
                                <ProjectDocumentsTab
                                    explorerDocuments={explorerDocuments}
                                    dossierNumber={dossier.dossierNumber}
                                    projectLabel={dossier.projectObject || dossier.dossierNumber}
                                    canCreateDocuments={capabilities?.canCreateDocuments ?? false}
                                    onUpload={() => setDocumentDrawerOpen(true)}
                                />
                            )}
                            {activeTab === 'contract' && <ContractTab contract={contract} dossierId={dossier.id} contractSigned={contractSigned} onSignedChange={setContractSigned} onEdit={(c) => { setEditContract(c); setContractDrawerOpen(true); }} onShowDocuments={() => handleTabChange('documents')} />}
                            {activeTab === 'finance' && <FinanceTab records={financeRecords} total={totalFinance} paid={paidFinance} remaining={remainingFinance} />}
                            {activeTab === 'notes' && <NotesTab dossier={dossier} />}
                            {activeTab === 'activity' && <ActivityTab />}
                        </div>
                    )}
                    </EntityTabs>
                </div>

                {/* ── Drawers ── */}
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
                    dossiers={dossiersOptions}
                    templates={templates}
                    initialClientId={String(dossier.clientId)}
                    initialDossierId={String(dossier.id)}
                    initialTemplateId={initialTemplateId}
                    lockProject
                    onOpenChange={(open) => { if (!open) { setInitialTemplateId(''); setPendingStepKey(''); setPendingReqKey(''); } setDocumentDrawerOpen(open); }}
                    onSubmit={handleDocumentSubmit}
                    errors={formErrors}
                />
                <ContractDrawer
                    isOpen={contractDrawerOpen}
                    mode={editContract ? 'edit' : 'create'}
                    contract={editContract}
                    clients={contractClients}
                    dossiers={contractDossiers}
                    architectFeeOptions={architectFeeOptions}
                    initialDossierId={String(dossier.id)}
                    initialFloorArea={dossier.floorArea}
                    lockProject={!editContract}
                    onOpenChange={(open) => { setContractDrawerOpen(open); if (!open) setEditContract(null); }}
                    onSubmit={editContract ? handleContractUpdate : handleContractSubmit}
                    errors={formErrors}
                />
                <EfficiencySheetDrawer
                    isOpen={efficiencySheetDrawerOpen}
                    onOpenChange={setEfficiencySheetDrawerOpen}
                    dossierId={dossier.id}
                    canCreate={canCreateEfficiencySheet}
                    canUpdate={canUpdateEfficiencySheet}
                    canGenerate={capabilities?.canGenerateEfficiencySheet ?? false}
                />
                <FinanceDrawer
                    isOpen={financeDrawerOpen}
                    mode="create"
                    record={null}
                    dossiers={financeDossiers}
                    clients={clients}
                    onOpenChange={setFinanceDrawerOpen}
                    onSubmit={handleFinanceSubmit}
                    errors={formErrors}
                />
                <ArchiveDrawer
                    isOpen={archiveDrawerOpen}
                    mode="create"
                    archiveRecord={null}
                    rooms={archiveRooms}
                    shelves={archiveShelves}
                    boxes={archiveBoxes}
                    initialClientId={String(dossier.clientId)}
                    initialDossierId={String(dossier.id)}
                    initialClientName={dossier.clientName}
                    initialDossierLabel={`${dossier.projectObject} · ${dossier.dossierNumber}`}
                    lockProject
                    onOpenChange={setArchiveDrawerOpen}
                    onSubmit={handleArchiveSubmit}
                />
                </div>
            </AppShell>
        </>
    );
}

function MetricCard({ label, value, hint, icon: Icon, color = 'text-[var(--foreground)]' }: {
    label: string; value: string | number; hint: string; icon: Icon; color?: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[10px] font-medium text-[var(--text-muted)]">{label}</p>
                    <p className={cn('mt-0.5 text-base font-semibold truncate', color)}>{value}</p>
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                    <Icon size={14} />
                </div>
            </div>
            <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">{hint}</p>
        </div>
    );
}

function InfoField({ icon: Icon, label, value }: { icon: Icon; label: string; value: string | number | null | undefined }) {
    return (
        <div className="flex min-w-0 items-start gap-2.5 px-3.5 py-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text-muted)]">
                <Icon size={14} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-medium text-[var(--text-muted)]">{label}</p>
                <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--foreground)]">{value || '-'}</p>
            </div>
        </div>
    );
}

function SideCard({ icon: Icon, title, children, color = 'text-[var(--accent)]', className }: {
    icon: Icon; title: string; children: React.ReactNode; color?: string; className?: string;
}) {
    return (
        <div className={cn('flex flex-1 flex-col p-3.5', className)}>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                    <Icon size={14} className={color} />
                    <p className="text-[11px] font-semibold text-[var(--foreground)]">{title}</p>
                </div>
                {children}
            </div>
        </div>
    );
}

function CompactEmpty({ icon: Icon, title, description }: { icon: Icon; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5 py-6 text-center">
            <Icon size={20} className="text-[var(--text-muted)]/40" />
            <p className="text-[11px] font-medium text-[var(--foreground)]">{title}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{description}</p>
        </div>
    );
}

/* ── Overview tab ── */
function OverviewTab({ dossier, workflow, contract, archiveRecord, canViewArchive }: {
    dossier: DossierRow; workflow: WorkflowData; contract: ContractSummary;
    archiveRecord: ArchiveSummary; canViewArchive: boolean;
}) {
    const { t, locale } = useTranslation();
    const contractStatusLabels: Record<string, string> = { draft: t('dossiers.show.contractStatus.draft'), generated: t('dossiers.show.contractStatus.generated'), signed: t('dossiers.show.contractStatus.signed') };
    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] xl:grid xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
                <h3 className="border-b border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">{t('dossiers.show.overview.title')}</h3>
                <div className="grid gap-x-2 p-1 sm:grid-cols-2 xl:grid-cols-3">
                        <InfoField icon={IconUserCircle} label={t('dossiers.show.overview.client')} value={dossier.clientName} />
                        <InfoField icon={IconFolder} label={t('dossiers.show.overview.dossierNumber')} value={dossier.dossierNumber} />
                        <InfoField icon={IconListCheck} label={t('dossiers.show.overview.workflowStep')} value={workflowLabel(dossier.workflowStep, t)} />
                        <InfoField icon={IconMap} label={t('dossiers.show.overview.province')} value={dossier.province} />
                        <InfoField icon={IconBuilding} label={t('dossiers.show.overview.commune')} value={dossier.commune} />
                        <InfoField icon={IconFileText} label={t('dossiers.show.overview.landTitle')} value={dossier.landTitleNumber} />
                        <InfoField icon={IconRuler} label={t('dossiers.show.overview.landSurface')} value={surface(dossier.landSurface)} />
                        <InfoField icon={IconCalculator} label={t('dossiers.show.overview.floorArea')} value={surface(dossier.floorArea)} />
                        <InfoField icon={IconCalendar} label={t('dossiers.show.overview.openedAt')} value={formatDate(dossier.openedAt, locale)} />
                        <InfoField icon={IconCircleCheck} label={t('dossiers.show.overview.status')} value={dossierStatusLabel(dossier.status, t)} />
                        <InfoField icon={IconMapPin} label={t('dossiers.show.overview.address')} value={dossier.projectAddress} />
                        <InfoField icon={IconNotes} label={t('dossiers.show.overview.description')} value={dossier.description} />
                    </div>
            </div>
            <div className="flex flex-col border-t border-[var(--border)] xl:border-l xl:border-t-0">
                <SideCard icon={IconFileText} title={t('dossiers.show.overview.contract')}>
                    {contract ? (
                        <div>
                            <p className="truncate text-[12px] font-semibold text-[var(--foreground)]">{contract.contractNumber}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">{contractStatusLabels[contract.status] || contract.status} · {money(contract.ttc)}</p>
                        </div>
                    ) : <p className="text-[11px] text-[var(--text-muted)]">{t('dossiers.show.overview.noContract')}</p>}
                </SideCard>
                <SideCard className="border-t border-[var(--border)]" icon={IconArchive} title={t('dossiers.show.overview.archive')} color="text-violet-500">
                    {archiveRecord ? (
                        <div className="min-w-0">
                            <ArchiveChip archive={archiveRecord} canView={canViewArchive} t={t} />
                            <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">{archiveStatusLabel(archiveRecord, t)}</p>
                        </div>
                    ) : <p className="text-[11px] text-[var(--text-muted)]">{t('dossiers.show.overview.notArchived')}</p>}
                </SideCard>
            </div>
        </div>
    );
}

/* ── Archive chip (city-colored, clickable when permitted) ── */
function archiveStatusLabel(archive: NonNullable<ArchiveSummary>, t: (key: string) => string) {
    const key = archiveVisualStatus(archive.status, archive.isOverdue ?? false).key;
    return t(`archives.status.${key}`);
}

function ArchiveChip({ archive, canView, t }: {
    archive: NonNullable<ArchiveSummary>;
    canView: boolean;
    t: (key: string, values?: Record<string, string | number>) => string;
}) {
    const cityName = archive.city?.name ?? t('dossiers.show.overview.archive');
    const dotColor = archive.city?.color ?? '#64748B';
    const chipClass = 'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--foreground)]';
    const inner = (
        <>
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
            <span className="truncate">{cityName} · {archive.displaySequence}</span>
        </>
    );
    if (!canView) {
        return (
            <span className={chipClass} title={archive.archiveNumber}>
                {inner}
            </span>
        );
    }
    return (
        <button
            type="button"
            onClick={() => router.visit(`/archives/${archive.id}`)}
            aria-label={t('dossiers.show.overview.openArchive', { label: cityName, sequence: archive.displaySequence })}
            title={archive.archiveNumber}
            className={`${chipClass} cursor-pointer transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40`}
        >
            {inner}
        </button>
    );
}

/* ── Workflow tab ── */
/* ── Contract tab ── */
function ContractTab({ contract, dossierId, contractSigned, onSignedChange, onEdit, onShowDocuments }: { contract: ContractSummary; dossierId: number; contractSigned: boolean; onSignedChange: (v: boolean) => void; onEdit: (c: ContractSummary) => void; onShowDocuments: () => void; }) {
    const { t } = useTranslation();
    const [deleteTarget, setDeleteTarget] = useState<ContractSummary>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [generatingId, setGeneratingId] = useState<number | null>(null);

    const resolvedStatus = contractSigned ? 'signed' : contract?.status ?? 'draft';
    const statusStyles: Record<string, string> = {
        draft: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
        generated: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
        signed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    };
    const statusLabels: Record<string, string> = {
        draft: t('dossiers.show.contractStatus.draft'),
        generated: t('dossiers.show.contractStatus.generated'),
        signed: t('dossiers.show.contractStatus.signed'),
    };

    function generateDocument(contractId: number, type: 'pdf' | 'docx') {
        setGeneratingId(contractId);
        const label = type === 'pdf' ? 'PDF' : 'DOCX';
        toast.loading(t('dossiers.show.contract.generationLoading', { label }));
        const url = type === 'pdf' ? `/contracts/${contractId}/export-pdf` : `/contracts/${contractId}/generate`;
        router.put(url, { return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setGeneratingId(null);
                toast.dismiss();
                toast.success(t('dossiers.show.contract.generationSuccess', { label }));
            },
            onError: () => {
                setGeneratingId(null);
                toast.dismiss();
                toast.error(t('dossiers.show.contract.generationFailed', { label }));
            },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setActionLoading(true);
        router.post(`/contracts/${deleteTarget.id}`, {
            _method: 'DELETE',
            return_to: window.location.pathname,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(t('dossiers.show.contract.deletedSuccess'));
                setDeleteTarget(null);
                setActionLoading(false);
            },
            onError: () => {
                toast.error(t('dossiers.show.contract.deleteFailed'));
                setActionLoading(false);
            },
        });
    }

    function handleAction(contract: ContractSummary, action: string) {
        const returnTo = window.location.pathname;
        switch (action) {
            case 'edit':
                onEdit(contract);
                break;
            case 'generate-docx':
                generateDocument(contract.id, 'docx');
                break;
            case 'generate-pdf':
                generateDocument(contract.id, 'pdf');
                break;
            case 'download-docx':
                window.open(`/contracts/${contract.id}/download/generated`, '_blank');
                break;
            case 'download-pdf':
                window.open(`/contracts/${contract.id}/download/pdf`, '_blank');
                break;
            case 'print':
                window.open(`/contracts/${contract.id}/print`, '_blank');
                break;
            case 'mark-signed':
                onSignedChange(true);
                router.put(`/contracts/${contract.id}/signed`, { return_to: returnTo }, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => toast.success(t('dossiers.show.contract.markedSignedSuccess')),
                    onError: () => { onSignedChange(false); toast.error(t('dossiers.show.contract.markSignedFailed')); },
                });
                break;
            case 'documents':
                onShowDocuments();
                break;
            case 'delete':
                setDeleteTarget(contract);
                break;
        }
    }

    if (!contract) {
        return (
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">{t('dossiers.show.contract.title')}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{t('dossiers.show.contract.subtitle')}</p>
                    </div>
                </div>
                <CompactEmpty icon={IconFileText} title={t('dossiers.show.contract.emptyTitle')} description={t('dossiers.show.contract.emptyDescription')} />
            </div>
        );
    }

    const isForfait = contract.calculationMode === 'forfait';
    const detailRows: { icon: Icon; label: string; value: string }[] = [];
    if (isForfait) {
        detailRows.push(
            { icon: IconCalculator, label: t('dossiers.show.contract.mode'), value: t('dossiers.show.contract.forfait') },
            { icon: IconCoin, label: t('dossiers.show.contract.forfaitTtc'), value: money(contract.forfaitTtc) },
        );
    } else {
        detailRows.push(
            { icon: IconCalculator, label: t('dossiers.show.contract.mode'), value: t('dossiers.show.contract.percentage') },
            { icon: IconPercentage, label: t('dossiers.show.contract.rate'), value: `${contract.feeRatePercent}%` },
            { icon: IconRuler, label: t('dossiers.show.contract.surface'), value: contract.surface ? `${contract.surface} m²` : '-' },
            { icon: IconCoin, label: t('dossiers.show.contract.pricePerSquareMeter'), value: contract.pricePerSquareMeter ? money(contract.pricePerSquareMeter) : '-' },
        );
    }

    const finRows = [
        { label: t('dossiers.show.contract.ht'), value: money(contract.ht) },
        { label: t('dossiers.show.contract.tva'), value: money(contract.tva) },
        { label: t('dossiers.show.contract.ttc'), value: money(contract.ttc), highlight: true },
    ];

    const timelineRows: { icon: Icon; label: string; value: string }[] = [];
    if (contract.createdAt) timelineRows.push({ icon: IconCalendar, label: t('dossiers.show.contract.createdOn'), value: contract.createdAt });
    if (contract.generatedAt) timelineRows.push({ icon: IconFileText, label: t('dossiers.show.contract.generatedOn'), value: contract.generatedAt });
    if (contract.signedAt) timelineRows.push({ icon: IconCheck, label: t('dossiers.show.contract.signedOn'), value: contract.signedAt });

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">{t('dossiers.show.contract.title')}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{t('dossiers.show.contract.manageSubtitle')}</p>
                </div>
                <div className="flex items-center gap-1.5">
                    {resolvedStatus !== 'signed' && (
                        <Button variant="light" size="sm" isIconOnly className="size-6 min-w-0 text-[var(--text-muted)]" onPress={() => onEdit(contract)}>
                            <IconPencil size={10} />
                        </Button>
                    )}
                    <Dropdown>
                        <Dropdown.Trigger className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]">
                            <IconDots size={12} />
                        </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end" className="min-w-40 z-[80] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
                        <Dropdown.Menu
                            aria-label={t('dossiers.show.contract.actions')}
                            disabledKeys={generatingId === contract.id ? ['generate-docx', 'generate-pdf'] : []}
                            onAction={(key) => handleAction(contract, key as string)}
                            itemClasses={{
                                base: 'rounded-lg px-2 py-1 text-[10px] font-medium',
                            }}
                        >
                            <Dropdown.Section title={t('dossiers.show.contract.documentSection')}>
                                {contract.hasGeneratedDoc ? (
                                    <Dropdown.Item key="download-docx" id="download-docx">
                                        <IconFileDownload size={13} className="text-emerald-400" />
                                        <span>{t('dossiers.show.contract.downloadDocx')}</span>
                                    </Dropdown.Item>
                                ) : (
                                    <Dropdown.Item key="generate-docx" id="generate-docx">
                                        <IconFileUpload size={13} className="text-blue-400" />
                                        <span>{generatingId === contract.id ? t('dossiers.show.contract.generating') : t('dossiers.show.contract.generateDocx')}</span>
                                    </Dropdown.Item>
                                )}
                                {contract.hasPdf ? (
                                    <Dropdown.Item key="download-pdf" id="download-pdf">
                                        <IconDownload size={13} className="text-emerald-400" />
                                        <span>{t('dossiers.show.contract.downloadPdf')}</span>
                                    </Dropdown.Item>
                                ) : contract.hasGeneratedDoc ? (
                                    <Dropdown.Item key="generate-pdf" id="generate-pdf">
                                        <IconFileText size={13} className="text-violet-400" />
                                        <span>{generatingId === contract.id ? t('dossiers.show.contract.generating') : t('dossiers.show.contract.generatePdf')}</span>
                                    </Dropdown.Item>
                                ) : null}
                            </Dropdown.Section>

                            <Dropdown.Item key="print" id="print">
                                <IconPrinter size={13} className="text-amber-400" />
                                <span>{t('dossiers.show.contract.print')}</span>
                            </Dropdown.Item>

                            <Dropdown.Item key="documents" id="documents">
                                <IconFileText size={13} className="text-sky-400" />
                                <span>{t('dossiers.show.contract.documents')}</span>
                            </Dropdown.Item>

                            {resolvedStatus !== 'signed' && (
                                <Dropdown.Item key="mark-signed" id="mark-signed">
                                    <IconCircleCheck size={13} className="text-emerald-400" />
                                    <span>{t('dossiers.show.contract.markSigned')}</span>
                                </Dropdown.Item>
                            )}

                            <Dropdown.Section title={t('dossiers.show.contract.danger')}>
                                <Dropdown.Item key="delete" id="delete" className="text-red-400 data-[hover]:bg-red-400/10">
                                    <IconTrash size={13} className="shrink-0 text-red-400" />
                                    <span>{t('dossiers.show.contract.delete')}</span>
                                </Dropdown.Item>
                            </Dropdown.Section>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
                </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <IconFileText size={18} className="text-[var(--accent)]" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{contract.contractNumber}</p>
                            {contract.notes ? (
                                <p className="mt-0.5 text-[10px] text-[var(--text-muted)] leading-tight line-clamp-1">{contract.notes}</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {generatingId === contract.id ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[9px] font-semibold text-blue-400">
                                <span className="inline-block size-1.5 animate-ping rounded-full bg-blue-400" />
                                {t('dossiers.show.contract.generating')}
                            </span>
                        ) : null}
                        {[
                            { key: 'draft', label: statusLabels.draft, show: resolvedStatus === 'draft', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
                            { key: 'generated', label: statusLabels.generated, show: !!(contract.generatedAt || contract.hasGeneratedDoc || resolvedStatus === 'signed'), color: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
                            { key: 'signed', label: statusLabels.signed, show: resolvedStatus === 'signed', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
                        ].filter((b) => b.show).map((b, i) => (
                            <span key={b.key} className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                b.color,
                                i > 0 && 'ml-0.5',
                            )}>
                                {b.key === 'draft' ? <IconCircle size={8} /> : <IconCheck size={10} />} {b.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-2 gap-px bg-[var(--border)]">
                    {detailRows.map((r) => (
                        <div key={r.label} className="flex items-center gap-2 bg-[var(--surface)] px-4 py-2.5">
                            <r.icon size={13} className="text-[var(--text-muted)] shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[9px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{r.label}</p>
                                <p className="text-xs font-semibold text-[var(--foreground)]">{r.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Financial summary */}
                <div className="border-t border-[var(--border)] px-4 py-3">
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('dossiers.show.contract.amounts')}</p>
                    <div className="space-y-1.5">
                        {finRows.map((r) => (
                            <div key={r.label} className="flex items-center justify-between">
                                <span className="text-[10px] text-[var(--text-muted)]">{r.label}</span>
                                <span className={cn('text-xs font-semibold', r.highlight ? 'text-[var(--accent)]' : 'text-[var(--foreground)]')}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-[var(--border)] px-4 py-3">
                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('dossiers.show.contract.timeline')}</p>
                    <div className="flex items-center gap-0">
                        {[
                            { key: 'created', icon: IconCalendar, label: t('dossiers.show.contract.created'), date: contract.createdAt, done: true },
                            { key: 'generated', icon: IconFileText, label: t('dossiers.show.contract.generated'), date: contract.generatedAt, done: !!contract.generatedAt },
                            { key: 'signed', icon: IconCircleCheck, label: t('dossiers.show.contract.signed'), date: contract.signedAt, done: resolvedStatus === 'signed' },
                        ].map((step, idx) => (
                            <div key={step.key} className="flex-1 flex flex-col items-center relative min-w-0">
                                <div className={cn(
                                    'flex size-7 items-center justify-center rounded-full border-2 shrink-0',
                                    step.done ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
                                )}>
                                    {step.key === 'created' ? <IconCalendar size={12} /> : step.key === 'generated' && step.done ? <IconCheck size={12} /> : step.key === 'generated' ? <IconFileText size={12} /> : step.done ? <IconCheck size={12} /> : <IconCircle size={12} />}
                                </div>
                                <p className={cn('mt-1 text-[9px] font-medium text-center leading-tight', step.done ? 'text-emerald-400' : 'text-[var(--text-muted)]')}>{step.label}</p>
                                {step.date ? <p className="text-[9px] text-[var(--text-muted)] text-center leading-tight">{step.date}</p> : null}
                                {idx < 2 ? (
                                    <div className={cn(
                                        'absolute top-3 h-px w-full z-0',
                                        step.done ? 'bg-emerald-400/40' : 'bg-[var(--border)]',
                                    )} style={{ left: 'calc(50% + 14px)', width: 'calc(100% - 28px)' }} />
                                ) : null}
                            </div>
                        ))}
                    </div>
                    {generatingId === contract.id ? (
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                            <span className="inline-block size-2 animate-ping rounded-full bg-blue-400" />
                            <span className="text-[9px] text-blue-400 font-medium">{t('dossiers.show.contract.generating')}</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Delete confirmation modal */}
            <AppModal
                isOpen={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title={t('dossiers.show.contract.deleteModalTitle')}
                size="sm"
            >
                <p className="mb-5 flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <IconTrash size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <span>
                        {t('dossiers.show.contract.deleteModalBody', { name: deleteTarget?.contractNumber ?? '' })}
                        {' '}
                        <span className="font-semibold text-red-400">{t('dossiers.show.contract.deleteModalIrreversible')}</span>.
                    </span>
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="bordered" color="default" onPress={() => setDeleteTarget(null)} isDisabled={actionLoading}>
                        {t('dossiers.show.contract.cancel')}
                    </Button>
                    <Button variant="solid" onPress={confirmDelete} isLoading={actionLoading} className="bg-red-500 text-white hover:bg-red-600">
                        {t('dossiers.show.contract.delete')}
                    </Button>
                </div>
            </AppModal>
        </div>
    );
}

/* ── Finance tab ── */
function FinanceTab({ records, total, paid, remaining }: {
    records: FinanceSummary[]; total: number; paid: number; remaining: number;
}) {
    const { t } = useTranslation();
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">{t('dossiers.show.finance.title')}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{t('dossiers.show.finance.recordCount', { count: records.length })}</p>
                </div>
                <AppButton isIconOnly compact variant="bordered" tooltip={t('dossiers.show.finance.openFinance')} aria-label={t('dossiers.show.finance.openFinance')} onPress={() => router.visit('/finance')}>
                    <IconCoin size={14} />
                </AppButton>
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <InfoField icon={IconReceipt2} label={t('dossiers.show.finance.totalTtc')} value={money(total)} />
                <InfoField icon={IconCircleCheck} label={t('dossiers.show.finance.paid')} value={money(paid)} />
                <InfoField icon={IconArrowRight} label={t('dossiers.show.finance.remaining')} value={money(remaining)} />
            </div>
            {records.length > 0 ? (
                <div className="grid gap-2">
                    {records.map((record) => (
                        <div key={record.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5">
                            <div className="min-w-0">
                                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{record.recordNumber}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">{record.type} · {record.status}</p>
                            </div>
                            <span className="text-sm font-semibold text-[var(--accent)]">{money(record.totalTtc)}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <CompactEmpty icon={IconCoin} title={t('dossiers.show.finance.emptyTitle')} description={t('dossiers.show.finance.emptyDescription')} />
            )}
        </div>
    );
}

/* ── Notes tab ── */
function NotesTab({ dossier }: { dossier: DossierRow }) {
    const { t } = useTranslation();
    return (
        <div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--foreground)]">{t('dossiers.show.notes.title')}</h3>
            <p className="mb-4 text-xs text-[var(--text-muted)]">{t('dossiers.show.notes.description')}</p>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <p className="text-[12px] leading-6 text-[var(--text-muted)]">{dossier.notes || t('dossiers.show.notes.empty')}</p>
            </div>
        </div>
    );
}

/* ── Activity tab ── */
function ActivityTab() {
    const { t } = useTranslation();
    return (
        <CompactEmpty icon={IconCircleDot} title={t('dossiers.show.activity.emptyTitle')} description={t('dossiers.show.activity.emptyDescription')} />
    );
}
