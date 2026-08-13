import { Head, router } from '@inertiajs/react';

import { IconContract, IconFileTypeDoc, IconFileTypePdf, IconFiles, IconHistory, IconLayoutDashboard, IconLayoutKanban, IconListCheck, IconNotes, IconReceipt2, IconArrowLeft, IconExternalLink, IconEye, IconFileText, IconFolder, IconMail, IconMapPin, IconPhone, IconPencil, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { TabPanel } from 'react-aria-components';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { EntityTabs } from '@/components/navigation/entity-tabs';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppModal } from '@/components/ui/AppModal';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { usePermissions } from '@/hooks/usePermissions';
import type { ClientFormPayload, ClientProjectPayment, ClientRow, ClientStatus, ClientWorkspace } from '@/features/clients/types';
import type { ExplorerDocument } from '@/features/documents/explorer/documentExplorerTypes';
import type { DossierFormPayload } from '@/features/dossiers/types';
import type { FinanceDocument, FinanceDocumentType, FinanceSettings, TemplateOption } from '@/features/finance/types';
import { ClientDrawer } from '@/components/drawers';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { FinanceDocumentBuilderDrawer, PaymentDrawer } from '@/components/drawers';
import type { FinanceDocumentActionHandlers } from '@/features/finance/components/FinanceDocumentActions';
import { WorkflowTab } from '@/features/dossiers/components/WorkflowTab';
import { DocumentDrawer } from '@/components/drawers';
import type { DocumentTemplateOption, DocumentUploadPayload } from '@/features/documents/types';
import { ContractDrawer } from '@/components/drawers';
import type { ArchitectFeeOption, ContractFormPayload, ContractClientOption, ContractDossierOption } from '@/features/contracts/types';
import { formatDate } from '@/lib/formatters';
import { formatMoney } from '@/lib/currency';
import { ClientArchivesCard } from '@/features/clients/components/ClientArchivesCard';
import { ClientDocumentsTab } from '@/features/documents/client/ClientDocumentsTab';
import { ClientFinanceTab } from '@/features/clients/components/ClientFinanceTab';
import { ConfirmActionModal } from '@/features/clients/components/ConfirmActionModal';
import { DossierTimeline } from '@/features/clients/components/DossierTimeline';
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
    floorArea?: number | string | null;
};

type PageProps = {
    client: ClientRow;
    dossiers: DossierSummary[];
    workspace: ClientWorkspace;
    intermediaries: { id: string; label: string }[];
    documentTemplates: DocumentTemplateOption[];
    workflowTemplateMap: Record<string, string>;
    financeTemplates: TemplateOption[];
    financeSettings: FinanceSettings;
    architectFeeOptions: ArchitectFeeOption[];
    cities: { id: number; name: string; code?: string; color?: string }[];
    tab?: string;
};

function initials(client: ClientRow) {
    const first = client.firstName?.charAt(0) ?? '';
    const last = client.lastName?.charAt(0) ?? '';
    return (first + last).trim() || client.fullName.slice(0, 2).toUpperCase();
}

function toBackendPayload(payload: ClientFormPayload, status: ClientStatus = 'active') {
    return {
        client_type: payload.clientType,
        civility: payload.civility || null,
        first_name: payload.firstName || null,
        last_name: payload.lastName || null,
        company_name: payload.companyName || null,
        cin: payload.cin || null,
        ice: payload.ice || null,
        managers: payload.managers.filter(Boolean),
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

type TabId = 'overview' | 'projects' | 'contracts' | 'workflow' | 'documents' | 'finance' | 'notes' | 'activity';

function isClientTab(value: string | undefined): value is TabId {
    const validTabs: TabId[] = ['overview', 'projects', 'contracts', 'workflow', 'documents', 'finance', 'notes', 'activity'];
    return validTabs.includes(value as TabId);
}

export default function ClientShow({ client, dossiers, workspace, cities, intermediaries, documentTemplates, workflowTemplateMap, financeTemplates, financeSettings, architectFeeOptions, tab }: PageProps) {
    const { t } = useTranslation();
    const { can } = usePermissions();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('edit');
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>(isClientTab(tab) ? tab : 'overview');

    const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
    const [uploadRequirementKey, setUploadRequirementKey] = useState<string | null>(null);
    const [uploadStepKey, setUploadStepKey] = useState<string | null>(null);
    const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
    const [editContract, setEditContract] = useState<any>(null);
    const [contractTabCreateMode, setContractTabCreateMode] = useState(false);
    const [contractFormErrors, setContractFormErrors] = useState<FormErrors>({});
    const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
    const [projectFormErrors, setProjectFormErrors] = useState<FormErrors>({});
    const [financeDrawerOpen, setFinanceDrawerOpen] = useState(false);
    const [financeDrawerType, setFinanceDrawerType] = useState<FinanceDocumentType>('quote');
    const [financeDrawerMode, setFinanceDrawerMode] = useState<'create' | 'edit'>('create');
    const [financeEditDocument, setFinanceEditDocument] = useState<FinanceDocument | null>(null);
    const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState<FinanceDocument | null>(null);
    const [paymentDeleteTarget, setPaymentDeleteTarget] = useState<ClientProjectPayment | null>(null);
    const [financeDeleteTarget, setFinanceDeleteTarget] = useState<FinanceDocument | null>(null);
    const [standaloneUploadOpen, setStandaloneUploadOpen] = useState(false);
    const [replaceTarget, setReplaceTarget] = useState<ExplorerDocument | null>(null);
    const [documentDeleteTarget, setDocumentDeleteTarget] = useState<ExplorerDocument | null>(null);
    const [isDocumentDeleting, setIsDocumentDeleting] = useState(false);

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
    const canViewFinance = can('finance.view');

    const tabs = useMemo(() => [
        { id: 'overview', label: t('clients.show.overview'), icon: IconLayoutDashboard },
        { id: 'projects', label: t('clients.show.projects'), icon: IconLayoutKanban },
        { id: 'contracts', label: t('clients.show.contracts'), icon: IconContract },
        { id: 'workflow', label: t('clients.show.workflow'), icon: IconListCheck },
        { id: 'documents', label: t('clients.show.documents'), icon: IconFiles },
        ...(canViewFinance ? [{ id: 'finance', label: t('clients.show.finance'), icon: IconReceipt2 }] : []),
        { id: 'notes', label: t('clients.show.notes'), icon: IconNotes },
        { id: 'activity', label: t('clients.show.activity'), icon: IconHistory },
    ], [canViewFinance, t]);

    useEffect(() => {
        setActiveTab(isClientTab(tab) && (tab !== 'finance' || canViewFinance) ? tab : 'overview');
    }, [canViewFinance, tab]);

    // The active tab is URL-sourced (`?tab=`) and tab switches are written
    // with replaceState. History navigation never re-runs the server-prop
    // effect above, so reconcile the tab with the URL on popstate instead —
    // this covers Back/Forward and the document preview's history-driven
    // close (history.back() restores the URL carrying `tab=documents`),
    // keeping the same workspace tab active after closing the preview.
    useEffect(() => {
        const onPopState = () => {
            const tabParam = new URLSearchParams(window.location.search).get('tab') ?? undefined;
            setActiveTab(isClientTab(tabParam) && (tabParam !== 'finance' || canViewFinance) ? tabParam : 'overview');
        };

        window.addEventListener('popstate', onPopState);

        return () => window.removeEventListener('popstate', onPopState);
    }, [canViewFinance]);

    function clientWorkspacePath(targetTab: TabId = activeTab, dossierId: number | null = selectedProject?.id ?? null) {
        const parameters = new URLSearchParams({ tab: targetTab });

        if (dossierId) {
            parameters.set('dossier_id', String(dossierId));
        }

        return `/clients/${client.id}?${parameters.toString()}`;
    }

    function selectTab(targetTab: string) {
        const safe = targetTab as TabId;
        if (safe === 'finance' && !canViewFinance) return;
        setActiveTab(safe);
        window.history.replaceState(window.history.state, '', clientWorkspacePath(safe));
    }

    const financeReturnTo = clientWorkspacePath('finance');
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
    const totalDocuments = workspace?.explorer?.documents?.length ?? selectedProject?.documents?.length ?? dossiers.length;

    function openDocumentWindow(url: string | null | undefined, unavailableMessage: string) {
        if (!url) {
            toast.error(unavailableMessage);
            return;
        }

        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function openEditDrawer() {
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ClientFormPayload) {
        if (drawerMode === 'edit' && client) {
            router.put(`/clients/${client.id}`, { ...toBackendPayload(payload, client.status as ClientStatus), return_to: clientWorkspacePath() }, {
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
        floorArea: d.floorArea ?? null,
        landSurface: null,
    })), [client.id, dossiers]);

    function toDossierBackendPayload(payload: DossierFormPayload, clientId: number) {
    return {
        client_id: payload.clientId || String(clientId),
        intermediary_id: payload.intermediaryId || null,
        city_id: payload.cityId || null,
        project_object: payload.projectObject || null,
        description: payload.description || null,
        project_address: payload.projectAddress || null,
        province: payload.province || null,
        commune: payload.commune || null,
        land_title_number: payload.landTitleNumber || null,
        land_surface: payload.landSurface || null,
        floor_area: payload.floorArea || null,
        status: payload.status || null,
        workflow_step: payload.workflowStep || null,
        notes: payload.notes || null,
    };
    }

    function handleProjectSubmit(payload: DossierFormPayload) {
        router.post('/dossiers', {
            ...toDossierBackendPayload(payload, client.id),
            return_to: clientWorkspacePath(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setProjectDrawerOpen(false);
                setProjectFormErrors({});
                toast.success(t('clients.show.projectCreated'));
                router.reload({ only: ['dossiers', 'workspace'] });
            },
            onError: (errors) => {
                setProjectFormErrors(errors as FormErrors);
                toast.error(t('clients.show.projectFormError'));
            },
        });
    }


    function afterCreateReload() {
        router.reload({ only: ['dossiers', 'workspace'] });
    }

    function openFinanceCreate(type: FinanceDocumentType) {
        setFinanceEditDocument(null);
        setFinanceDrawerMode('create');
        setFinanceDrawerType(type);
        setFinanceDrawerOpen(true);
    }

    function openFinanceEdit(document: FinanceDocument) {
        setFinanceEditDocument(document);
        setFinanceDrawerMode('edit');
        setFinanceDrawerType(document.type);
        setFinanceDrawerOpen(true);
    }

    function runFinancePut(document: FinanceDocument, url: string | null | undefined, success: string, error: string) {
        if (!url) {
            toast.error(t('clients.finance.actionUnavailable'));
            return;
        }

        router.put(url, { return_to: financeReturnTo }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(success);
                afterCreateReload();
            },
            onError: () => toast.error(error),
        });
    }

    function runFinanceConvert(document: FinanceDocument) {
        if (!document.convertToInvoiceUrl) {
            toast.error(t('clients.finance.quoteConversionUnavailable'));
            return;
        }

        router.post(document.convertToInvoiceUrl, { return_to: financeReturnTo }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Facture créée à partir du devis.');
                afterCreateReload();
            },
            onError: () => toast.error('Impossible de convertir le devis.'),
        });
    }

    function confirmFinanceDelete() {
        if (!financeDeleteTarget?.deleteUrl) return;

        router.delete(financeDeleteTarget.deleteUrl, {
            data: { return_to: financeReturnTo },
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Document supprimé.');
                setFinanceDeleteTarget(null);
                afterCreateReload();
            },
            onError: () => toast.error('Impossible de supprimer le document.'),
        });
    }

    function confirmPaymentDelete() {
        if (!paymentDeleteTarget?.deleteUrl) return;

        router.delete(paymentDeleteTarget.deleteUrl, {
            data: { return_to: financeReturnTo },
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(t('clients.finance.paymentDeleted'));
                setPaymentDeleteTarget(null);
                afterCreateReload();
            },
            onError: () => toast.error(t('clients.finance.paymentDeleteError')),
        });
    }

    const financeDocumentActions: FinanceDocumentActionHandlers = {
        onOpen: (document) => {
            if (!document.showUrl) {
                toast.error('Impossible d’ouvrir la fiche du document.');
                return;
            }

            router.visit(document.showUrl, { preserveScroll: true });
        },
        onEdit: openFinanceEdit,
        onPreview: (document) => openDocumentWindow(document.viewUrl, 'Impossible d’ouvrir l’aperçu du document.'),
        onPrint: (document) => openDocumentWindow(document.printUrl, 'Impossible d’imprimer le document.'),
        onDownloadPdf: (document) => openDocumentWindow(document.pdfDownloadUrl, 'Aucun PDF généré pour ce document.'),
        onDownloadExcel: (document) => openDocumentWindow(document.excelDownloadUrl || document.downloadUrl, 'Aucun fichier Excel généré pour ce document.'),
        onGeneratePdf: (document) => runFinancePut(document, document.generatePdfUrl, 'PDF généré.', 'Génération PDF impossible.'),
        onGenerateExcel: (document) => runFinancePut(document, document.generateExcelUrl, 'Excel généré.', 'Génération Excel impossible.'),
        onAccept: (document) => runFinancePut(document, document.acceptUrl, 'Devis accepté.', 'Impossible d’accepter le devis.'),
        onReject: (document) => runFinancePut(document, document.rejectUrl, 'Devis refusé.', 'Impossible de refuser le devis.'),
        onConvert: runFinanceConvert,
        onPayment: (document) => {
            setPaymentInvoice(document);
            setPaymentDrawerOpen(true);
        },
        onCancel: (document) => runFinancePut(document, document.cancelUrl, 'Document annulé.', 'Annulation impossible.'),
        onDelete: setFinanceDeleteTarget,
    };

    const [isDocUploading, setIsDocUploading] = useState(false);
    const [documentFormErrors, setDocumentFormErrors] = useState<FormErrors>({});
    const contractClients: ContractClientOption[] = useMemo(() => [{
        id: String(client.id),
        fullName: client.fullName,
        cin: client.cin ?? '',
        dossiers: dossiers.map((d) => ({
            id: String(d.id),
            label: d.dossierNumber,
            floorArea: d.floorArea ?? undefined,
            hasContract: !!workspace.selectedProject?.contract && String(workspace.selectedProject.id) === String(d.id),
        })),
    }], [client, dossiers, workspace.selectedProject]);

    const contractDossiers: ContractDossierOption[] = useMemo(() =>
        dossiers.map((d) => ({
            id: String(d.id),
            label: d.dossierNumber,
            floorArea: d.floorArea ?? undefined,
            hasContract: !!workspace.selectedProject?.contract && String(workspace.selectedProject.id) === String(d.id),
        })),
    [dossiers, workspace.selectedProject]);

    function openContractDrawer() {
        setEditContract(selectedProject?.contract ? {
            ...selectedProject.contract,
            dossierId: String(selectedProject.id),
        } : null);
        setContractFormErrors({});
        setContractDrawerOpen(true);
    }

    function openContractTabCreateDrawer() {
        setEditContract(null);
        setContractTabCreateMode(true);
        setContractFormErrors({});
        setContractDrawerOpen(true);
    }

    function handleContractSubmit(payload: ContractFormPayload) {
        router.post('/contracts', { ...payload, return_to: clientWorkspacePath() }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setContractDrawerOpen(false); setEditContract(null); setContractFormErrors({}); toast.success(t('clients.finance.contractCreated')); },
            onError: (err) => { setContractFormErrors(err as FormErrors); toast.error(t('clients.finance.contractCreateError')); },
        });
    }

    function handleContractUpdate(payload: ContractFormPayload) {
        if (!editContract) return;
        router.put(`/contracts/${editContract.id}`, { ...payload, return_to: clientWorkspacePath() }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setContractDrawerOpen(false); setEditContract(null); setContractFormErrors({}); toast.success(t('clients.finance.contractUpdated')); },
            onError: (err) => { setContractFormErrors(err as FormErrors); toast.error(t('clients.finance.contractUpdateError')); },
        });
    }

    function handleDocumentUpload(payload: DocumentUploadPayload) {
        setIsDocUploading(true);
        setDocumentFormErrors({});
        const formData = new FormData();
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');
        formData.append('return_to', clientWorkspacePath());
        const isReplacement = replaceTarget !== null;

        // Multipart field names must match Laravel's StoreDossierDocumentRequest:
        // CIN sides are `file_front` / `file_back`, single files are `file`.
        if (payload.cinFrontFile) {
            formData.append('file_front', payload.cinFrontFile);
        }

        if (payload.cinBackFile) {
            formData.append('file_back', payload.cinBackFile);
        }

        if (!payload.cinFrontFile && !payload.cinBackFile && payload.file) {
            formData.append('file', payload.file);
        }

        if (!isReplacement) {
            formData.append('dossier_id', payload.dossierId);
            formData.append('document_template_id', payload.documentTemplateId || '');
            // Client ownership guard: backend verifies the chosen Project
            // belongs to this Client before storing.
            formData.append('client_id', String(client.id));
            if (uploadStepKey) formData.append('workflow_step_key', uploadStepKey);
            if (uploadRequirementKey) formData.append('workflow_req_key', uploadRequirementKey);
        }

        router.post(isReplacement ? `/documents/${replaceTarget.id}/replace` : '/documents', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setUploadDrawerOpen(false);
                setStandaloneUploadOpen(false);
                setReplaceTarget(null);
                setDocumentFormErrors({});
                toast.success(isReplacement ? t('clients.show.documentReplaced') : t('clients.show.documentUploaded'));
            },
            onError: (errors) => {
                setDocumentFormErrors(errors as FormErrors);
                toast.error(isReplacement ? t('clients.show.documentActionFailed') : t('clients.show.documentFormError'));
            },
            onFinish: () => setIsDocUploading(false),
        });
    }

    function confirmDocumentDelete() {
        if (!documentDeleteTarget) return;

        setIsDocumentDeleting(true);
        router.delete(`/documents/${documentDeleteTarget.id}`, {
            data: { return_to: clientWorkspacePath('documents') },
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setDocumentDeleteTarget(null);
                toast.success(t('clients.show.documentDeleted'));
            },
            onError: () => toast.error(t('clients.show.documentActionFailed')),
            onFinish: () => setIsDocumentDeleting(false),
        });
    }

    return (
        <>
            <Head title={client.fullName} />

            <AppShell>
                {/* ── Top bar ── */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.show.backToClients')} aria-label={t('clients.show.backToClients')} onPress={() => router.visit('/clients')}>
                            <IconArrowLeft size={15} />
                        </AppButton>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-xl font-bold text-[var(--foreground)]">{client.fullName}</h1>
                                <StatusPill
                                    label={client.status}
                                    color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'}
                                    size="sm"
                                />
                            </div>
                            <p className="truncate text-[11px] text-[var(--text-muted)]">{client.clientNumber} {client.cin ? `/ ${client.cin}` : ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                        <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.edit')} aria-label={t('clients.edit')} onPress={openEditDrawer}>
                            <IconPencil size={14} />
                        </AppButton>
                        <AppButton isIconOnly compact color="danger" variant="light" tooltip={t('clients.delete')} aria-label={t('clients.delete')} onPress={() => setDeleteTarget(client)}>
                            <IconTrash size={14} />
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
                                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.cin')}</p>
                                <p className="mt-1 text-[13px] font-medium text-[var(--foreground)]">{client.cin || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.phone')}</p>
                                <p className="mt-1 text-[13px] font-medium text-[var(--foreground)]">{client.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.email')}</p>
                                <p className="mt-1 truncate text-[13px] font-medium text-[var(--foreground)]">{client.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.address')}</p>
                                <p className="mt-1 text-[13px] font-medium text-[var(--foreground)]">{client.address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.form.intermediaryName')}</p>
                                <p className="mt-1 text-[13px] font-medium text-[var(--foreground)]">
                                    {client.intermediaryName && client.intermediaryName !== 'None' ? client.intermediaryName : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{t('clients.show.updated')}</p>
                                <p className="mt-1 text-[13px] font-medium text-[var(--foreground)]">{client.updatedAt || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-2 border-t border-[var(--border)] sm:grid-cols-4">
                        <div className="border-r border-[var(--border)] p-4">
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">{t('clients.show.projects')}</p>
                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{projects.length}</p>
                        </div>
                        <div className="border-r border-[var(--border)] p-4">
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">{t('clients.show.activeProjects')}</p>
                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{activeProjects}</p>
                        </div>
                        <div className="border-r border-[var(--border)] p-4">
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">{t('clients.show.documents')}</p>
                            <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{totalDocuments}</p>
                        </div>
                        <div className="p-4">
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">{t('clients.show.status')}</p>
                            <p className="mt-1 text-xl font-semibold capitalize text-[var(--foreground)]">{client.status}</p>
                        </div>
                    </div>
                </div>

                <EntityTabs
                    tabs={tabs}
                    selectedKey={activeTab}
                    onSelectionChange={selectTab}
                    counts={{
                        projects: projects.length,
                    }}
                >
                    <TabPanel id="overview" className="outline-none">
                        <div className="space-y-4">
                            <div className="flex flex-wrap justify-end gap-1.5">
                        <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.show.newProject')} aria-label={t('clients.show.newProject')} onPress={() => { setProjectDrawerOpen(true); }}>
                                    <IconFolder size={15} />
                                </AppButton>
                                {projects.length > 0 ? (
                        <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.show.newContract')} aria-label={t('clients.show.newContract')} onPress={() => { openContractDrawer(); }}>
                                        <IconFileText size={15} />
                                    </AppButton>
                                ) : null}
                                {can('finance.documents.create') ? <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.show.newQuote')} aria-label={t('clients.show.newQuote')} onPress={() => openFinanceCreate('quote')}>
                                    <IconReceipt2 size={15} />
                                </AppButton> : null}
                                {projects.length > 0 ? (
                        <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.show.uploadDocument')} aria-label={t('clients.show.uploadDocument')} onPress={() => { setDocumentFormErrors({}); setStandaloneUploadOpen(true); }}>
                                        <IconUpload size={15} />
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
                                            <h3 className="text-[13px] font-semibold text-[var(--foreground)]">{client.fullName}</h3>
                                            <StatusPill label={client.status} size="sm"
                                                color={client.status === 'active' ? 'success' : client.status === 'inactive' ? 'warning' : 'default'} />
                                        </div>
                                        <p className="text-[10px] text-[var(--text-muted)]">{client.clientNumber}</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2.5">
                                    <div className="flex items-center gap-3 text-[11px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]"><IconFileText size={12} /></span>
                                        <span className="text-[var(--text-muted)]">CIN:</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.cin || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><IconPhone size={12} /></span>
                                        <span className="text-[var(--text-muted)]">{t('clients.form.phone')}:</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.phone || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><IconMail size={12} /></span>
                                        <span className="text-[var(--text-muted)]">{t('clients.form.email')}:</span>
                                        <span className="truncate font-medium text-[var(--foreground)]">{client.email || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px]">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><IconMapPin size={12} /></span>
                                        <span className="text-[var(--text-muted)]">{t('clients.form.address')}:</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.address || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Relationship */}
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="mb-4 text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.relationship')}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-[var(--text-muted)]">{t('clients.form.intermediaryName')}</span>
                                        <span className="font-medium text-[var(--foreground)]">
                                            {client.intermediaryName && client.intermediaryName !== 'None' ? client.intermediaryName : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-[var(--text-muted)]">{t('clients.show.created')}</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.createdAt || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-[var(--text-muted)]">{t('clients.show.updated')}</span>
                                        <span className="font-medium text-[var(--foreground)]">{client.updatedAt || '-'}</span>
                                    </div>
                                    <div className="border-t border-[var(--border)] pt-3 mt-3">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-[var(--text-muted)]">{t('clients.show.projects')}</span>
                                            <span className="font-semibold text-[var(--foreground)]">{projects.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] mt-1.5">
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
                                        <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.workflow')}</h3>
                                        <StatusPill label={latestProject.status} size="sm"
                                            color={latestProject.status === 'opened' || latestProject.status === 'active' ? 'success' : 'default'} />
                                    </div>
                                    <p className="text-[12px] font-medium text-[var(--foreground)]">
                                        {latestProject.projectObject || latestProject.dossierNumber}
                                    </p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{latestProject.dossierNumber}</p>
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-[var(--text-muted)]">{t('clients.show.currentStep')}</span>
                                            <span className="font-medium text-[var(--foreground)]">{latestProject.workflowStep || t('clients.show.noWorkflow')}</span>
                                        </div>
                                        {workflowPercent !== null && (
                                            <>
                                                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
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
                                        <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.pipelineSummary')}</h3>
                                        <p className="text-[10px] text-[var(--text-muted)]">{projects.length} {t('clients.show.projects').toLowerCase()}</p>
                                    </div>
                                    {projects.length > 5 && (
                                        <button type="button" onClick={() => selectTab('projects')}
                                            className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                            {t('actions.view')}
                                        </button>
                                    )}
                                </div>
                                {projects.length === 0 ? (
                                    <p className="text-[11px] text-[var(--text-muted)]">{t('clients.show.noProjects')}</p>
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
                                                        <IconFolder size={14} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-[11px] font-medium text-[var(--foreground)]">
                                                                {project.projectObject || project.dossierNumber}
                                                            </p>
                                                            <StatusPill label={project.status} size="sm"
                                                                color={project.status === 'opened' || project.status === 'active' ? 'success' : 'default'} />
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[9px] text-[var(--text-muted)]">{project.dossierNumber}</span>
                                                            <span className="text-[9px] text-[var(--text-subtle)]">&middot;</span>
                                                            <span className="text-[9px] text-[var(--text-subtle)]">{project.workflowStep || t('clients.show.noWorkflow')}</span>
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
                                <h3 className="mb-1 text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.sharedDocuments')}</h3>
                                <p className="mb-4 text-[10px] text-[var(--text-muted)]">{t('clients.show.sharedDocumentsDesc')}</p>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5 min-w-0">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)]"><IconFileText size={12} /></span>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-medium text-[var(--foreground)]">CIN</p>
                                            <p className="text-[9px] text-[var(--text-muted)]">{client.cin || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-1.5 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5 min-w-0">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><IconPhone size={12} /></span>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-medium text-[var(--foreground)]">{t('clients.form.phone')}</p>
                                            <p className="text-[9px] text-[var(--text-muted)]">{client.phone || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-subtle)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5 min-w-0">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]"><IconMail size={12} /></span>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-medium text-[var(--foreground)]">{t('clients.form.email')}</p>
                                            <p className="truncate text-[9px] text-[var(--text-muted)]">{client.email || t('common.notAvailable')}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[var(--surface-3)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-subtle)]">{t('clients.show.reusedFromClient')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                                <h3 className="mb-2 text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.notes')}</h3>
                                <p className="text-[11px] leading-6 text-[var(--text-muted)]">
                                    {client.notes || t('clients.show.noNotes')}
                                </p>
                            </div>
                        </div>
                        </div>
                    </TabPanel>

                    <TabPanel id="projects" className="outline-none">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">
                                    {projects.length} {t('clients.show.projects').toLowerCase()}
                                </p>
                            <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.show.newProject')} aria-label={t('clients.show.newProject')} onPress={() => { setProjectDrawerOpen(true); }}>
                                    <IconFolder size={15} />
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
                                                    <p className="truncate text-[12px] font-semibold text-[var(--foreground)]">
                                                        {project.projectObject || project.dossierNumber}
                                                    </p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{project.dossierNumber}</p>
                                                </div>
                                                <StatusPill
                                                    label={project.status}
                                                    color={project.status === 'opened' || project.status === 'active' ? 'success' : 'default'}
                                                    size="sm"
                                                />
                                            </div>
                                            {project.projectAddress && (
                                                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--text-subtle)]">
                                                    <IconMapPin size={11} /> {project.projectAddress}
                                                </p>
                                            )}
                                            <div className="mt-2.5 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1">
                                                    <IconFileText size={12} /> {project.documentsCount} {t('clients.show.documents').toLowerCase()}
                                                </span>
                                                <span>{project.workflowStep}</span>
                                            </div>
                                            {showProgress ? (
                                                <div className="mt-2">
                                                    <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                                                        <span className="truncate">{t('clients.show.workflowProgress')}</span>
                                                        <span>{selectedProject.workflow?.percent ?? 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                                                        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${selectedProject.workflow?.percent ?? 0}%` }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-2.5 flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[9px] font-medium text-[var(--text-subtle)]">
                                                        {project.workflowStep}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="mt-3 flex justify-end gap-1.5">
                                                <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.show.openProject')} aria-label={t('clients.show.openProject')} onPress={() => router.visit(`/dossiers/${project.id}`)}>
                                                    <IconExternalLink size={14} />
                                                </AppButton>
                                                <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.show.openWorkflow')} aria-label={t('clients.show.openWorkflow')} onPress={() => openProjectWorkflow(project.id)}>
                                                    <IconListCheck size={14} />
                                                </AppButton>
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
                    </TabPanel>

                    <TabPanel id="contracts" className="outline-none">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">
                                    {workspace.contracts.length} {t('clients.show.contracts').toLowerCase()}
                                </p>
                                {projects.length > 0 ? (
                                    <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.show.newContract')} aria-label={t('clients.show.newContract')} onPress={() => { openContractTabCreateDrawer(); }}>
                                        <IconFileText size={15} />
                                    </AppButton>
                                ) : null}
                            </div>

                            {workspace.contracts.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {workspace.contracts.map((contract) => (
                                        <div key={contract.id}
                                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-[12px] font-semibold text-[var(--foreground)]">
                                                        {contract.contractNumber}
                                                    </p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">
                                                        {contract.dossierNumber}
                                                    </p>
                                                </div>
                                                <StatusPill
                                                    label={contract.status}
                                                    color={contract.status === 'signed' ? 'success' : contract.status === 'generated' ? 'warning' : 'default'}
                                                    size="sm"
                                                />
                                            </div>

                                            {contract.projectObject ? (
                                                <p className="mt-2 text-[11px] text-[var(--text-subtle)]">
                                                    {contract.projectObject}
                                                </p>
                                            ) : null}

                                            <div className="mt-3 space-y-1.5 text-[10px] text-[var(--text-muted)]">
                                                {contract.surface !== null ? (
                                                    <div className="flex justify-between">
                                                        <span>Surface</span>
                                                        <span className="font-medium text-[var(--foreground)]">{contract.surface} m²</span>
                                                    </div>
                                                ) : null}
                                                {contract.ttc > 0 ? (
                                                    <div className="flex justify-between">
                                                        <span>TTC</span>
                                                        <span className="font-medium text-[var(--foreground)]">{formatMoney(contract.ttc)}</span>
                                                    </div>
                                                ) : null}
                                                {contract.generatedAt ? (
                                                    <div className="flex justify-between">
                                                        <span>Généré le</span>
                                                        <span className="font-medium text-[var(--foreground)]">{formatDate(contract.generatedAt)}</span>
                                                    </div>
                                                ) : null}
                                                {contract.signedAt ? (
                                                    <div className="flex justify-between">
                                                        <span>Signé le</span>
                                                        <span className="font-medium text-[var(--foreground)]">{formatDate(contract.signedAt)}</span>
                                                    </div>
                                                ) : null}
                                                <div className="flex justify-between">
                                                    <span>Créé le</span>
                                                    <span className="font-medium text-[var(--foreground)]">{formatDate(contract.createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border)] pt-3">
                                                {contract.status === 'draft' || contract.status === 'pending' ? (
                                                    <AppTableActionButton
                                                        label={t('workflow.generateContract')}
                                                        tone="edit"
                                                        onPress={() => {
                                                            setConfirmActionConfig({
                                                                title: t('workflow.generateContract'),
                                                                description: t('workflow.generateContractDesc'),
                                                                confirmLabel: t('workflow.confirmGenerate'),
                                                                method: 'put',
                                                                url: `/contracts/${contract.id}/generate`,
                                                                extraPayload: { return_to: clientWorkspacePath('contracts') },
                                                            });
                                                            setConfirmActionOpen(true);
                                                        }}
                                                    >
                                                        <IconFileText size={14} />
                                                    </AppTableActionButton>
                                                ) : null}
                                                {contract.hasGeneratedDocument ? (
                                                    <AppTableActionButton
                                                        label="Télécharger le document"
                                                        tone="documents"
                                                        onPress={() => openDocumentWindow(contract.generatedDocumentDownloadUrl, 'Document non disponible')}
                                                    >
                                                        <IconFileTypeDoc size={14} />
                                                    </AppTableActionButton>
                                                ) : null}
                                                {contract.hasPdf ? (
                                                    <>
                                                        <AppTableActionButton
                                                            label="Télécharger le PDF"
                                                            tone="documents"
                                                            onPress={() => openDocumentWindow(contract.pdfDownloadUrl, 'PDF non disponible')}
                                                        >
                                                            <IconFileTypePdf size={14} />
                                                        </AppTableActionButton>
                                                        <AppTableActionButton
                                                            label="Aperçu PDF"
                                                            tone="view"
                                                            onPress={() => openDocumentWindow(contract.pdfPublicUrl, 'Aperçu non disponible')}
                                                        >
                                                            <IconEye size={14} />
                                                        </AppTableActionButton>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <AppEmptyState
                                        title={t('clients.show.noContracts')}
                                        description={t('clients.show.noContractsDesc')}
                                    />
                                </div>
                            )}
                        </div>
                    </TabPanel>

                    <TabPanel id="workflow" className="outline-none">
                        <div className="space-y-5">
                            {projects.length > 1 && (
                                <div>
                                    <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.projectWorkflows')}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] mb-3">{t('clients.show.selectProject')}</p>
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
                                                        <p className="truncate text-[11px] font-medium text-[var(--foreground)] flex-1">
                                                            {project.projectObject || project.dossierNumber}
                                                        </p>
                                                        <StatusPill label={project.status} size="sm"
                                                            color={project.status === 'opened' || project.status === 'active' ? 'success' : 'default'} />
                                                    </div>
                                                    <p className="text-[9px] text-[var(--text-muted)]">{project.dossierNumber}</p>
                                                    {isSelected && selectedProject?.workflow && (
                                                        <div className="mt-1 w-full">
                                                            <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)]">
                                                                <span>{project.workflowStep}</span>
                                                                <span>{selectedProject.workflow.percent}%</span>
                                                            </div>
                                                            <div className="mt-0.5 h-1 rounded-full bg-[var(--surface-3)] overflow-hidden">
                                                                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${selectedProject.workflow.percent}%` }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {isSelected && <span className="mt-1 text-[9px] font-medium text-[var(--accent)]">{t('common.active')}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedProject && selectedProject.workflow ? (
                                <WorkflowTab
                                    key={selectedProject.id}
                                    dossierId={selectedProject.id}
                                    workflow={selectedProject.workflow}
                                    cahier={selectedProject.cahier}
                                    canUpdateWorkflow={can('dossiers.workflow.update')}
                                    onOpenUpload={(stepKey, requirementKey) => {
                                        setDocumentFormErrors({});
                                        setUploadStepKey(stepKey);
                                        setUploadRequirementKey(requirementKey);
                                        setUploadDrawerOpen(true);
                                    }}
                                    onOpenDocuments={() => router.visit(`/dossiers/${selectedProject.id}?tab=documents`, { preserveScroll: true })}
                                    onOpenArchive={() => router.visit(`/archives?dossier_id=${selectedProject.id}`, { preserveScroll: true })}
                                />
                            ) : projects.length === 0 ? (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <AppEmptyState title={t('clients.show.noProjectWorkflow')} description={t('clients.show.noProjectWorkflowDesc')} />
                                    <div className="mt-4 flex justify-center">
                                <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.show.createProject')} aria-label={t('clients.show.createProject')} onPress={() => { setProjectDrawerOpen(true); }}>
                                            <IconFolder size={15} />
                                        </AppButton>
                                    </div>
                                </div>
                            ) : selectedProject && !selectedProject.workflow ? (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                                    <AppEmptyState title={t('clients.show.noWorkflow')} description={t('clients.show.noWorkflowDesc')} />
                                </div>
                            ) : null}
                        </div>
                    </TabPanel>

                    <TabPanel id="documents" className="outline-none">
                        <ClientDocumentsTab
                            client={client}
                            projects={projects}
                            explorerContext={workspace?.explorer?.context ?? null}
                            explorerDocuments={workspace?.explorer?.documents ?? []}
                            onUpload={() => { setDocumentFormErrors({}); setStandaloneUploadOpen(true); }}
                            onPreview={(document) => openDocumentWindow(document.viewUrl, t('clients.show.previewUnavailable'))}
                            onPrint={(document) => openDocumentWindow(document.printUrl, t('clients.show.previewUnavailable'))}
                            onDownload={(document) => openDocumentWindow(document.downloadUrl, t('clients.show.fileUnavailable'))}
                            onReplace={(document) => { setDocumentFormErrors({}); setReplaceTarget(document); }}
                            onDelete={setDocumentDeleteTarget}
                        />
                    </TabPanel>

                    {canViewFinance ? <TabPanel id="finance" className="outline-none">
                        <ClientFinanceTab
                            project={selectedProject}
                            onCreateDocument={openFinanceCreate}
                            onCreatePayment={() => {
                                setPaymentInvoice(null);
                                setPaymentDrawerOpen(true);
                            }}
                            documentActions={financeDocumentActions}
                            onDeletePayment={setPaymentDeleteTarget}
                            onOpenFinance={() => {
                                if (!selectedProject) return;
                                router.visit(`/finance/documents?dossier_id=${selectedProject.id}`);
                            }}
                        />
                    </TabPanel> : null}

                    <TabPanel id="notes" className="outline-none">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.notes')}</h3>
                                <AppButton isIconOnly compact variant="quiet" tooltip={t('clients.edit')} aria-label={t('clients.edit')} onPress={openEditDrawer}>
                                    <IconPencil size={14} />
                                </AppButton>
                            </div>
                            <p className="text-[12px] leading-6 text-[var(--text-muted)]">
                                {client.notes || t('clients.show.noNotes')}
                            </p>
                        </div>
                    </TabPanel>

                    <TabPanel id="activity" className="outline-none">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                            {selectedProject ? (
                                <>
                                    <div className="mb-4 border-b border-[var(--border)] pb-3">
                                        <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t('clients.show.activity')}</h3>
                                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                                            {selectedProject.projectObject || selectedProject.dossierNumber}
                                        </p>
                                    </div>
                                    <DossierTimeline events={selectedProject.timeline} />
                                </>
                            ) : (
                                <AppEmptyState title={t('clients.show.noActivity')} description={t('clients.show.noActivityDesc')} />
                            )}
                        </div>
                    </TabPanel>
                </EntityTabs>

                {/* ── Edit drawer ── */}
                <ClientDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    client={drawerMode === 'edit' ? client : null}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                {/* ── IconUpload document drawer ── */}
                <DocumentDrawer
                    isOpen={uploadDrawerOpen}
                    clients={[{ id: String(client.id), label: client.fullName }]}
                    dossiers={dossierOptions}
                    templates={documentTemplates}
                    initialClientId={String(client.id)}
                    initialDossierId={selectedProject ? String(selectedProject.id) : ''}
                    initialTemplateId={uploadRequirementKey ? workflowTemplateMap[uploadRequirementKey] ?? '' : ''}
                    lockProject
                    onOpenChange={(open) => { setDocumentFormErrors({}); if (!open) { setUploadRequirementKey(null); setUploadStepKey(null); } setUploadDrawerOpen(open); }}
                    onSubmit={handleDocumentUpload}
                    errors={documentFormErrors}
                    isSubmitting={isDocUploading}
                />

                {/* ── Contract drawer ── */}
                <ContractDrawer
                    isOpen={contractDrawerOpen}
                    mode={editContract ? 'edit' : 'create'}
                    contract={editContract}
                    clients={contractClients}
                    dossiers={contractDossiers}
                    architectFeeOptions={architectFeeOptions}
                    initialDossierId={editContract ? (editContract.dossierId ?? '') : (contractTabCreateMode ? '' : (selectedProject ? String(selectedProject.id) : ''))}
                    initialFloorArea={contractTabCreateMode ? null : (selectedProject?.floorArea ?? null)}
                    lockProject={!editContract && !contractTabCreateMode}
                    onOpenChange={(open) => { setContractDrawerOpen(open); if (!open) { setEditContract(null); setContractTabCreateMode(false); } }}
                    onSubmit={editContract ? handleContractUpdate : handleContractSubmit}
                    errors={contractFormErrors}
                />

                {/* ── Archives card ── */}
                {selectedProject ? <ClientArchivesCard project={selectedProject} /> : null}

                {/* ── Project drawer (create) ── */}
                <ProjectDrawer
                    isOpen={projectDrawerOpen}
                    mode="create"
                    dossier={null}
                    clients={[{ id: String(client.id), label: client.fullName }]}
                    intermediaries={intermediaries}
                    cities={cities.map((city) => ({ ...city, code: city.code ?? '', color: city.color ?? '' }))}
                    initialClientId={String(client.id)}
                    onOpenChange={setProjectDrawerOpen}
                    onSubmit={handleProjectSubmit}
                    errors={projectFormErrors}
                />

                {/* ── Finance document builder drawer ── */}
                <FinanceDocumentBuilderDrawer
                    isOpen={financeDrawerOpen}
                    onOpenChange={(open) => {
                        setFinanceDrawerOpen(open);
                        if (!open) setFinanceEditDocument(null);
                    }}
                    mode={financeDrawerMode}
                    type={financeDrawerType}
                    document={financeEditDocument}
                    clients={[{ id: String(client.id), label: client.fullName, cin: client.cin, address: client.address }]}
                    dossiers={dossierOptions}
                    templates={financeTemplates}
                    settings={financeSettings}
                    defaultClientId={String(client.id)}
                    defaultDossierId={selectedProject ? String(selectedProject.id) : undefined}
                    defaultFinanceTtc={financeDrawerMode === 'create' ? selectedProject?.contract?.financeTtc : undefined}
                    returnTo={financeReturnTo}
                    onSaved={afterCreateReload}
                />

                <PaymentDrawer
                    isOpen={paymentDrawerOpen}
                    onOpenChange={(open) => {
                        setPaymentDrawerOpen(open);
                        if (!open) setPaymentInvoice(null);
                    }}
                    invoices={selectedProject?.financeDocuments.filter((document) => document.type === 'invoice') ?? []}
                    invoice={paymentInvoice}
                    clients={[{ id: String(client.id), label: client.fullName, cin: client.cin, address: client.address }]}
                    dossiers={dossierOptions}
                    defaultClientId={String(client.id)}
                    defaultDossierId={selectedProject ? String(selectedProject.id) : undefined}
                    lockClientContext
                    lockDossierContext
                    allowAdvancePayment={selectedProject?.financeEligibility.canRecordAdvance ?? false}
                    returnTo={financeReturnTo}
                />

                {/* ── Standalone upload document drawer ── */}
                <DocumentDrawer
                    isOpen={standaloneUploadOpen}
                    clients={[{ id: String(client.id), label: client.fullName }]}
                    dossiers={dossierOptions}
                    templates={documentTemplates}
                    initialClientId={String(client.id)}
                    initialDossierId={selectedProject ? String(selectedProject.id) : dossiers[0] ? String(dossiers[0].id) : ''}
                    onOpenChange={(open) => { setDocumentFormErrors({}); setStandaloneUploadOpen(open); }}
                    onSubmit={handleDocumentUpload}
                    errors={documentFormErrors}
                    isSubmitting={isDocUploading}
                />

                <DocumentDrawer
                    isOpen={!!replaceTarget}
                    clients={[{ id: String(client.id), label: client.fullName }]}
                    dossiers={dossierOptions}
                    templates={[]}
                    initialClientId={String(client.id)}
                    initialDossierId={selectedProject ? String(selectedProject.id) : ''}
                    initialStatus={replaceTarget?.status ?? 'uploaded'}
                    lockProject
                    mode="replace"
                    onOpenChange={(open) => { setDocumentFormErrors({}); if (!open) setReplaceTarget(null); }}
                    onSubmit={handleDocumentUpload}
                    errors={documentFormErrors}
                    isSubmitting={isDocUploading}
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
                        <div className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-3 py-2 text-[11px] text-[var(--danger)]">
                            {t('clients.deleteHasProjects', { count: String(deleteTarget.projectsCount) })}
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

                <AppModal
                    isOpen={!!documentDeleteTarget}
                    onOpenChange={(open) => { if (!open && !isDocumentDeleting) setDocumentDeleteTarget(null); }}
                    title={t('clients.show.deleteDocumentTitle')}
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        {t('clients.show.deleteDocumentDescription')} <strong>{documentDeleteTarget?.name}</strong>
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" onPress={() => setDocumentDeleteTarget(null)} isDisabled={isDocumentDeleting}>
                            {t('clients.cancel')}
                        </AppButton>
                        <AppButton color="danger" variant="solid" onPress={confirmDocumentDelete} isLoading={isDocumentDeleting}>
                            {t('actions.delete')}
                        </AppButton>
                    </div>
                </AppModal>

                <AppConfirmDialog
                    isOpen={Boolean(financeDeleteTarget)}
                    title={t('clients.finance.deleteDocumentTitle')}
                    description={t('clients.finance.deleteDocumentDescription', { document: financeDeleteTarget?.number || t('common.notAvailable') })}
                    confirmLabel={t('actions.delete')}
                    onConfirm={confirmFinanceDelete}
                    onCancel={() => setFinanceDeleteTarget(null)}
                    variant="danger"
                />

                <AppConfirmDialog
                    isOpen={Boolean(paymentDeleteTarget)}
                    title={t('clients.finance.deletePaymentTitle')}
                    description={t('clients.finance.deletePaymentDescription', { payment: paymentDeleteTarget?.paymentNumber || t('common.notAvailable') })}
                    confirmLabel={t('clients.finance.deletePaymentConfirm')}
                    onConfirm={confirmPaymentDelete}
                    onCancel={() => setPaymentDeleteTarget(null)}
                    variant="danger"
                />
            </AppShell>
        </>
    );
}
