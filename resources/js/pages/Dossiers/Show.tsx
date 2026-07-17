import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Archive,
    ArrowLeft,
    ArrowRight,
    BadgeDollarSign,
    Building2,
    Calculator,
    Calendar,
    Check,
    CheckCircle2,
    Circle,
    CircleDot,
    Download,
    ExternalLink,
    FileCheck2,
    FileDown,
    FileText,
    FileUp,
    FolderKanban,
    Landmark,
    MapPin,
    MoreHorizontal,
    Pencil,
    Percent,
    Printer,
    ReceiptText,
    Ruler,
    ScrollText,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Dropdown } from '@heroui/react';
import { AppModal } from '@/components/ui/AppModal';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/cn';
import { ProjectWorkflowStepper } from '@/features/dossiers/components/ProjectWorkflowStepper';
import { WorkflowTab } from '@/features/dossiers/components/WorkflowTab';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import { DocumentUploadDrawer } from '@/features/documents/drawers/DocumentUploadDrawer';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import { FinanceDrawer } from '@/features/finance/drawers/FinanceDrawer';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import type { DossierRow, ClientOption, City } from '@/features/dossiers/types';
import type { DossierOption, DocumentTemplateOption, DocumentUploadPayload } from '@/features/documents/types';
import type { ContractClientOption, ContractFormPayload, ContractRow } from '@/features/contracts/types';
import type { FinanceDossierOption, FinanceFormPayload } from '@/features/finance/types';
import type { FormErrors } from '@/lib/formErrors';
import type { WorkflowData } from '@/types/workflow';

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
type AuthorizationSummary = {
    id: number; submissionNumber: string | null; authorizationNumber: string | null; authorityName: string | null; status: string;
} | null;
type FinanceSummary = {
    id: number; recordNumber: string; type: string; status: string; totalTtc: number; paid: number; remaining: number;
};
type ArchiveSummary = {
    id: number; archiveNumber: string; status: string; room: string | null; shelf: string | null; box: string | null; folder: string | null;
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
    contract: ContractSummary;
    authorization: AuthorizationSummary;
    financeRecords: FinanceSummary[];
    archiveRecord: ArchiveSummary;
    clients: ClientOption[];
    cities: City[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    contractClients: ContractClientOption[];
    financeDossiers: FinanceDossierOption[];
    archiveRooms: ArchiveLocationOption[];
    archiveShelves: ArchiveLocationOption[];
    archiveBoxes: ArchiveLocationOption[];
};

type TabId = 'overview' | 'workflow' | 'documents' | 'contract' | 'finance' | 'authorizations' | 'notes' | 'activity';

const TABS: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'documents', label: 'Documents' },
    { id: 'contract', label: 'Contract' },
    { id: 'finance', label: 'Finance' },
    { id: 'authorizations', label: 'Authorizations' },
    { id: 'notes', label: 'Notes' },
    { id: 'activity', label: 'Activity' },
];

function money(value: number) {
    return `${Number(value || 0).toLocaleString('fr-MA')} MAD`;
}

function surface(value: number | null) {
    return value ? `${value} m2` : '-';
}

function stepStatusColor(status: string) {
    if (['completed', 'signed', 'approved', 'paid', 'stored', 'done'].includes(status)) return 'success';
    if (['in_progress', 'active', 'uploaded', 'generated', 'issued', 'submitted'].includes(status)) return 'primary';
    if (['draft', 'pending', 'missing', 'blocked'].includes(status)) return 'warning';
    return 'default';
}

function dossierStatusColor(status: string) {
    if (status === 'active') return 'success';
    if (status === 'opened') return 'primary';
    if (status === 'closed') return 'default';
    if (status === 'archived' || status === 'paused') return 'warning';
    return 'default';
}

function workflowLabel(value: string) {
    const labels: Record<string, string> = {
        documents: 'Documents',
        contract: 'Contract',
        cahier_chantier: 'Cahier de chantier',
        rokhas: 'Rokhas',
        bureau_etude: "Bureau d'etude",
        permis_habiter: "Permis d'habiter",
        archive: 'Archive',
    };
    return labels[value] ?? value;
}

export default function DossierShow({
    dossier, workflow, documents, contract, authorization, financeRecords, archiveRecord,
    clients, cities, dossiers: dossiersOptions, templates, contractClients, financeDossiers,
    archiveRooms, archiveShelves, archiveBoxes,
}: PageProps) {
    const initialTab = (new URLSearchParams(window.location.search).get('tab') as TabId) || 'overview';
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    function handleTabChange(tab: TabId) {
        setActiveTab(tab);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        const qs = params.toString();
        const url = window.location.pathname + (qs ? '?' + qs : '');
        window.history.replaceState(null, '', url);
    }
    const [selectedStepKey, setSelectedStepKey] = useState(workflow.currentStep ?? workflow.steps[0]?.key ?? null);
    const tabsRef = useRef<HTMLDivElement>(null);

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
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const handleOpenUpload = useCallback((stepKey?: string, reqKey?: string) => {
        setPendingStepKey(stepKey ?? '');
        setPendingReqKey(reqKey ?? '');
        if (reqKey) {
            const match: Record<string, string> = {
                cin: 'CIN',
                certificat_propriete: 'Certificat de propriete',
                terrain_documents: 'Plan cadastral',
                cahier_received: 'Cahier de chantier',
                contract_bureau_etude: 'Contrat BE',
                plan_beton: 'Plan beton arme',
                fiche_energetique: 'Fiche energetique',
                site_images: 'Plan cadastral',
                demande_permis_habiter: 'Certificat de propriete',
                recent_certificat_propriete: 'Certificat de propriete',
                engineer_request: 'Cahier de chantier',
                implantation_topographie: 'Plan cadastral',
                laboratoire_controle: 'Contrat BE',
            };
            const templateName = match[reqKey];
            const tmpl = templateName ? templates.find((t) => t.label === templateName) : undefined;
            setInitialTemplateId(tmpl?.id ?? '');
        } else {
            setInitialTemplateId('');
        }
        setDocumentDrawerOpen(true);
    }, [templates]);

    function handleArchiveSubmit(payload: { clientId: string; dossierId: string; status: string; room: string | null; shelf: string | null; box: string | null; folder: string | null; inDate: string | null; outDate: string | null; returnedAt: string | null; requestedBy: string | null; notes: string | null; }) {
        router.post('/archives', { ...payload, dossier_id: payload.dossierId, return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setArchiveDrawerOpen(false); toast.success('Archive record created.'); },
            onError: () => { toast.error('Could not create archive record.'); },
        });
    }

    const contractStatusLabels: Record<string, string> = { draft: 'Brouillon', generated: 'Genere', signed: 'Signe' };
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
            onSuccess: () => { setEditDrawerOpen(false); setFormErrors({}); toast.success('Project updated.'); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error('Could not update project.'); },
        });
    }

    function handleDocumentSubmit(payload: DocumentUploadPayload) {
        const formData = new FormData();
        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId);
        formData.append('status', payload.status);
        formData.append('notes', payload.notes);
        if (pendingStepKey) formData.append('workflow_step_key', pendingStepKey);
        if (pendingReqKey) formData.append('workflow_req_key', pendingReqKey);
        if (payload.file) formData.append('file', payload.file);
        router.post('/documents', formData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setDocumentDrawerOpen(false); setPendingStepKey(''); setPendingReqKey(''); setFormErrors({}); toast.success('Document uploaded.'); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error('Could not upload document.'); },
        });
    }

    function handleContractSubmit(payload: ContractFormPayload) {
        router.post('/contracts', { ...payload, return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setContractDrawerOpen(false); setEditContract(null); setFormErrors({}); toast.success('Contract created.'); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error('Could not create contract.'); },
        });
    }

    function handleContractUpdate(payload: ContractFormPayload) {
        if (!editContract) return;
        router.put(`/contracts/${editContract.id}`, { ...payload, return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => { setContractDrawerOpen(false); setEditContract(null); setFormErrors({}); toast.success('Contract updated.'); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error('Could not update contract.'); },
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
            onSuccess: () => { setFinanceDrawerOpen(false); setFormErrors({}); toast.success('Finance record created.'); },
            onError: (err) => { setFormErrors(err as FormErrors); toast.error('Could not create finance record.'); },
        });
    }

    const quickActions = [
        { label: 'Open client', icon: <UserRound size={14} />, action: () => router.visit(`/clients/${dossier.clientId}`) },
        { label: 'Edit', icon: <Pencil size={14} />, action: () => setEditDrawerOpen(true) },
        { label: 'Documents', icon: <FileCheck2 size={14} />, action: () => setDocumentDrawerOpen(true) },
        { label: 'Contract', icon: <FileText size={14} />, action: () => { setEditContract(null); setContractDrawerOpen(true); } },
        { label: 'Finance', icon: <BadgeDollarSign size={14} />, action: () => setFinanceDrawerOpen(true) },
    ];

    return (
        <>
            <Head title={dossier.dossierNumber} />

            <AppShell>
                {/* ── Page header ── */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <button type="button" onClick={() => router.visit('/dossiers')}
                            className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <ArrowLeft size={13} />
                            Back to Projects
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
                                <FolderKanban size={20} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <StatusPill label={dossier.status} color={dossierStatusColor(dossier.status)} size="sm" />
                                    <StatusPill label={workflowLabel(selectedStep?.key ?? dossier.workflowStep)} color="primary" size="sm" />
                                </div>
                                <p className="mt-1.5 text-[13px] text-[var(--foreground)]">
                                    {dossier.clientName} · {dossier.dossierNumber}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-x-6 gap-y-1 text-[12px] text-[var(--text-muted)] sm:grid-cols-2 sm:text-right">
                            <span>{dossier.clientNumber} / {dossier.clientCin}</span>
                            <span>{[dossier.province, dossier.commune].filter(Boolean).join(', ') || '-'}</span>
                            <span>Opened: {dossier.openedAt || '-'}</span>
                            <span>Updated: {dossier.updatedAt || '-'}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] px-4 py-2.5">
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => router.visit(`/clients/${dossier.clientId}`)}>
                            <UserRound size={13} /> Open client
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => setEditDrawerOpen(true)}>
                            <Pencil size={13} /> Edit
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => { setEditContract(null); setContractDrawerOpen(true); }}>
                            <FileText size={13} /> Contract
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="h-7 text-[11px]" onPress={() => setDocumentDrawerOpen(true)}>
                            <FileCheck2 size={13} /> Documents
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
                    <MetricCard label="Documents" value={documents.length} hint="Linked files" icon={FileCheck2} />
                    <MetricCard label="Finance total" value={money(totalFinance)} hint="All records" icon={BadgeDollarSign} color="text-[var(--foreground)]" />
                    <MetricCard label="Paid" value={money(paidFinance)} hint="Collected" icon={ReceiptText} color="text-emerald-500" />
                    <MetricCard label="Remaining" value={money(remainingFinance)} hint="Still due" icon={Landmark} color="text-amber-500" />
                    <MetricCard label="Contract" value={contract ? contractStatusLabels[resolvedContractStatus] || contract.status : 'Aucun'} hint={contract ? `${money(contract.ttc)}` : '-'} icon={FileText} color={contract ? (contractStatusColors[resolvedContractStatus] || '') : ''} />
                    <MetricCard label="Authorization" value={authorization ? authorization.status : 'None'} hint={authorization?.authorityName || '-'} icon={ShieldCheck} />
                </div>

                {/* ── Tabs ── */}
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div ref={tabsRef} className="flex overflow-x-auto border-b border-[var(--border)]">
                        {TABS.map((tab) => (
                            <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                    'relative flex items-center justify-center px-4 py-2.5 text-[13px] font-medium outline-none transition whitespace-nowrap',
                                    activeTab === tab.id
                                        ? 'text-[var(--accent)] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[var(--accent)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                                )}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 sm:p-5">
                        {activeTab === 'overview' && (
                            <OverviewTab dossier={dossier} workflow={workflow} contract={contract}
                                authorization={authorization} archiveRecord={archiveRecord} />
                        )}
                        {activeTab === 'workflow' && (
                            <WorkflowTab workflow={workflow} selectedStepKey={selectedStepKey} onSelectStep={setSelectedStepKey} dossierId={dossier.id} onOpenUpload={handleOpenUpload} onOpenArchive={() => setArchiveDrawerOpen(true)} />
                        )}
                        {activeTab === 'documents' && <DocumentsTab documents={documents} dossierNumber={dossier.dossierNumber} contract={contract} />}
                        {activeTab === 'contract' && <ContractTab contract={contract} dossierId={dossier.id} contractSigned={contractSigned} onSignedChange={setContractSigned} onEdit={(c) => { setEditContract(c); setContractDrawerOpen(true); }} onShowDocuments={() => handleTabChange('documents')} />}
                        {activeTab === 'finance' && <FinanceTab records={financeRecords} total={totalFinance} paid={paidFinance} remaining={remainingFinance} />}
                        {activeTab === 'authorizations' && <AuthorizationsTab authorization={authorization} dossierId={dossier.id} dossierNumber={dossier.dossierNumber} />}
                        {activeTab === 'notes' && <NotesTab dossier={dossier} />}
                        {activeTab === 'activity' && <ActivityTab />}
                    </div>
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
                <DocumentUploadDrawer
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
                    initialDossierId={String(dossier.id)}
                    lockProject={!editContract}
                    onOpenChange={(open) => { setContractDrawerOpen(open); if (!open) setEditContract(null); }}
                    onSubmit={editContract ? handleContractUpdate : handleContractSubmit}
                    errors={formErrors}
                />
                <FinanceDrawer
                    isOpen={financeDrawerOpen}
                    mode="create"
                    record={null}
                    dossiers={financeDossiers}
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
                    onOpenChange={setArchiveDrawerOpen}
                    onSubmit={handleArchiveSubmit}
                />
            </AppShell>
        </>
    );
}

function MetricCard({ label, value, hint, icon: Icon, color = 'text-[var(--foreground)]' }: {
    label: string; value: string | number; hint: string; icon: LucideIcon; color?: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[var(--text-muted)]">{label}</p>
                    <p className={cn('mt-0.5 text-base font-semibold truncate', color)}>{value}</p>
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                    <Icon size={14} />
                </div>
            </div>
            <p className="mt-0.5 text-[10px] text-[var(--text-subtle)]">{hint}</p>
        </div>
    );
}

function InfoField({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
            <p className="text-[10px] font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-0.5 truncate text-[13px] font-semibold text-[var(--foreground)]">{value || '-'}</p>
        </div>
    );
}

function SideCard({ icon: Icon, title, children, color = 'text-[var(--accent)]' }: {
    icon: LucideIcon; title: string; children: React.ReactNode; color?: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <p className="text-[12px] font-semibold text-[var(--foreground)]">{title}</p>
            </div>
            {children}
        </div>
    );
}

function CompactEmpty({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5 py-6 text-center">
            <Icon size={20} className="text-[var(--text-muted)]/40" />
            <p className="text-[12px] font-medium text-[var(--foreground)]">{title}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{description}</p>
        </div>
    );
}

/* ── Overview tab ── */
function OverviewTab({ dossier, workflow, contract, authorization, archiveRecord }: {
    dossier: DossierRow; workflow: WorkflowData; contract: ContractSummary;
    authorization: AuthorizationSummary; archiveRecord: ArchiveSummary;
}) {
    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div>
                <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Project information</h3>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoField label="Client" value={dossier.clientName} />
                    <InfoField label="Dossier number" value={dossier.dossierNumber} />
                    <InfoField label="Workflow step" value={workflowLabel(dossier.workflowStep)} />
                    <InfoField label="Province" value={dossier.province} />
                    <InfoField label="Commune" value={dossier.commune} />
                    <InfoField label="Land title" value={dossier.landTitleNumber} />
                    <InfoField label="Land surface" value={surface(dossier.landSurface)} />
                    <InfoField label="Floor area" value={surface(dossier.floorArea)} />
                    <InfoField label="Opened at" value={dossier.openedAt} />
                    <InfoField label="Status" value={dossier.status} />
                    <InfoField label="Address" value={dossier.projectAddress} />
                    <InfoField label="Description" value={dossier.description} />
                </div>
            </div>
            <div className="grid gap-3 content-start">
                <SideCard icon={FileText} title="Contract">
                    {contract ? (
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{contract.contractNumber}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{contract.status} · {money(contract.ttc)}</p>
                        </div>
                    ) : <p className="text-[12px] text-[var(--text-muted)]">No contract yet.</p>}
                </SideCard>
                <SideCard icon={ShieldCheck} title="Authorization" color="text-sky-500">
                    {authorization ? (
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{authorization.submissionNumber || authorization.authorizationNumber || '-'}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{authorization.status}</p>
                        </div>
                    ) : <p className="text-[12px] text-[var(--text-muted)]">No authorization yet.</p>}
                </SideCard>
                <SideCard icon={Archive} title="Archive" color="text-violet-500">
                    {archiveRecord ? (
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{archiveRecord.archiveNumber}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{archiveRecord.status}</p>
                        </div>
                    ) : <p className="text-[12px] text-[var(--text-muted)]">Not archived yet.</p>}
                </SideCard>
                <SideCard icon={ArrowLeft} title="Quick navigation">
                    <div className="grid gap-1.5">
                        <AppButton variant="bordered" size="sm" className="justify-start h-8 text-[11px]" onPress={() => router.visit('/documents')}>
                            <FileCheck2 size={13} /> Documents
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="justify-start h-8 text-[11px]" onPress={() => router.visit('/finance')}>
                            <BadgeDollarSign size={13} /> Finance
                        </AppButton>
                        <AppButton variant="bordered" size="sm" className="justify-start h-8 text-[11px]" onPress={() => router.visit('/dossiers')}>
                            <ArrowLeft size={13} /> Back to projects
                        </AppButton>
                    </div>
                </SideCard>
            </div>
        </div>
    );
}

/* ── Workflow tab ── */
/* ── Documents tab ── */
function DocumentsTab({ documents, dossierNumber, contract }: { documents: DocSummary[]; dossierNumber: string; contract: ContractSummary }) {
    const [deleteTarget, setDeleteTarget] = useState<DocSummary | null>(null);

    const contractDocs: { id: string; label: string; icon: LucideIcon; downloadUrl: string; date: string | null }[] = [];
    if (contract) {
        if (contract.hasGeneratedDoc) {
            contractDocs.push({
                id: 'contract-docx', label: `${contract.contractNumber} - Contrat DOCX`, icon: FileText,
                downloadUrl: `/contracts/${contract.id}/download/generated`, date: contract.generatedAt,
            });
        }
        if (contract.hasPdf) {
            contractDocs.push({
                id: 'contract-pdf', label: `${contract.contractNumber} - Contrat PDF`, icon: FileText,
                downloadUrl: `/contracts/${contract.id}/download/pdf`, date: contract.generatedAt,
            });
        }
    }
    const totalDocs = documents.length + contractDocs.length;

    function DocCard({ icon: Icon, name, fileName, date, status, downloadUrl, onDelete }: {
        icon: LucideIcon; name: string; fileName?: string | null; date?: string | null; status: string;
        downloadUrl?: string | null; onDelete?: () => void;
    }) {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 transition hover:border-[var(--accent)]/30">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10">
                    <Icon size={15} className="text-[var(--accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{name}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{fileName || date || '-'}</p>
                </div>
                <StatusPill label={status} color={stepStatusColor(status)} size="sm" />
                <div className="flex items-center gap-0.5 shrink-0">
                    {downloadUrl ? (
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--accent)]" title="Telecharger">
                            <Download size={13} />
                        </a>
                    ) : null}
                    {onDelete ? (
                        <button type="button" onClick={onDelete} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-red-400/10 hover:text-red-400" title="Supprimer">
                            <Trash2 size={13} />
                        </button>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Project documents</h3>
                    <p className="text-xs text-[var(--text-muted)]">{totalDocs} document(s)</p>
                </div>
                <AppButton variant="bordered" size="sm" onPress={() => router.visit(`/documents?search=${encodeURIComponent(dossierNumber)}`)}>
                    <FileCheck2 size={14} /> Open documents
                </AppButton>
            </div>
            {documents.length > 0 ? (
                <div className="grid gap-2">
                    {documents.map((doc) => (
                        <DocCard
                            key={doc.id} icon={FileCheck2} name={doc.name} fileName={doc.fileName}
                            date={doc.uploadedAt} status={doc.status}
                            downloadUrl={`/documents/${doc.id}/download`}
                            onDelete={() => setDeleteTarget(doc)}
                        />
                    ))}
                </div>
            ) : contractDocs.length === 0 ? (
                <CompactEmpty icon={FileCheck2} title="No documents yet" description="Upload documents to track project requirements." />
            ) : null}
            {contractDocs.length > 0 ? (
                <div className={documents.length > 0 ? 'mt-4' : ''}>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Documents du contrat</p>
                    <div className="grid gap-2">
                        {contractDocs.map((cd) => (
                            <DocCard
                                key={cd.id} icon={cd.icon} name={cd.label} date={cd.date} status="approuve"
                                downloadUrl={cd.downloadUrl}
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            <AppModal
                isOpen={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Supprimer le document ?"
                size="sm"
            >
                <p className="mb-5 flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <Trash2 size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <span>
                        Confirmez la suppression de <strong>{deleteTarget?.name}</strong> ?
                    </span>
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="bordered" color="default" onPress={() => setDeleteTarget(null)}>
                        Annuler
                    </Button>
                    <Button variant="solid" onPress={() => {
                        if (!deleteTarget) return;
                        router.delete(`/documents/${deleteTarget.id}`, { preserveScroll: true, preserveState: true, onSuccess: () => { setDeleteTarget(null); toast.success('Document supprime.'); } });
                    }} className="bg-red-500 text-white hover:bg-red-600">
                        Supprimer
                    </Button>
                </div>
            </AppModal>
        </div>
    );
}

/* ── Contract tab ── */
function ContractTab({ contract, dossierId, contractSigned, onSignedChange, onEdit, onShowDocuments }: { contract: ContractSummary; dossierId: number; contractSigned: boolean; onSignedChange: (v: boolean) => void; onEdit: (c: ContractSummary) => void; onShowDocuments: () => void; }) {
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
        draft: 'Brouillon',
        generated: 'Genere',
        signed: 'Signe',
    };

    function generateDocument(contractId: number, type: 'pdf' | 'docx') {
        setGeneratingId(contractId);
        const label = type === 'pdf' ? 'PDF' : 'DOCX';
        toast.loading(`Generation du ${label}...`);
        const url = type === 'pdf' ? `/contracts/${contractId}/export-pdf` : `/contracts/${contractId}/generate`;
        router.put(url, { return_to: window.location.pathname }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setGeneratingId(null);
                toast.dismiss();
                toast.success(`${label} genere avec succes.`);
            },
            onError: () => {
                setGeneratingId(null);
                toast.dismiss();
                toast.error(`Echec de la generation du ${label}.`);
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
                toast.success('Contrat supprime avec succes.');
                setDeleteTarget(null);
                setActionLoading(false);
            },
            onError: () => {
                toast.error('Impossible de supprimer le contrat.');
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
                    onSuccess: () => toast.success('Contrat marque comme signe.'),
                    onError: () => { onSignedChange(false); toast.error('Erreur lors de la mise a jour.'); },
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
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Contract</h3>
                        <p className="text-xs text-[var(--text-muted)]">Contract status and actions</p>
                    </div>
                </div>
                <CompactEmpty icon={FileText} title="No contract yet" description="Create a contract to start tracking." />
            </div>
        );
    }

    const isForfait = contract.calculationMode === 'forfait';
    const detailRows: { icon: LucideIcon; label: string; value: string }[] = [];
    if (isForfait) {
        detailRows.push(
            { icon: Calculator, label: 'Mode', value: 'Forfait' },
            { icon: BadgeDollarSign, label: 'Forfait TTC', value: money(contract.forfaitTtc) },
        );
    } else {
        detailRows.push(
            { icon: Calculator, label: 'Mode', value: 'Pourcentage' },
            { icon: Percent, label: 'Taux', value: `${contract.feeRatePercent}%` },
            { icon: Ruler, label: 'Surface', value: contract.surface ? `${contract.surface} m²` : '-' },
            { icon: BadgeDollarSign, label: 'Prix / m2', value: contract.pricePerSquareMeter ? money(contract.pricePerSquareMeter) : '-' },
        );
    }

    const finRows = [
        { label: 'HT', value: money(contract.ht) },
        { label: 'TVA', value: money(contract.tva) },
        { label: 'TTC', value: money(contract.ttc), highlight: true },
    ];

    const timelineRows: { icon: LucideIcon; label: string; value: string }[] = [];
    if (contract.createdAt) timelineRows.push({ icon: Calendar, label: 'Cree le', value: contract.createdAt });
    if (contract.generatedAt) timelineRows.push({ icon: ScrollText, label: 'Genere le', value: contract.generatedAt });
    if (contract.signedAt) timelineRows.push({ icon: Check, label: 'Signe le', value: contract.signedAt });

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Contract</h3>
                    <p className="text-xs text-[var(--text-muted)]">Gerez le contrat du projet</p>
                </div>
                <div className="flex items-center gap-1.5">
                    {resolvedStatus !== 'signed' && (
                        <Button variant="light" size="sm" isIconOnly className="size-6 min-w-0 text-[var(--text-muted)]" onPress={() => onEdit(contract)}>
                            <Pencil size={10} />
                        </Button>
                    )}
                    <Dropdown>
                        <Dropdown.Trigger className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]">
                            <MoreHorizontal size={12} />
                        </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end" className="min-w-40 z-[80] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
                        <Dropdown.Menu
                            aria-label="Actions"
                            disabledKeys={generatingId === contract.id ? ['generate-docx', 'generate-pdf'] : []}
                            onAction={(key) => handleAction(contract, key as string)}
                            itemClasses={{
                                base: 'rounded-lg px-2 py-1 text-[11px] font-medium',
                            }}
                        >
                            <Dropdown.Section title="Document">
                                {contract.hasGeneratedDoc ? (
                                    <Dropdown.Item key="download-docx" id="download-docx">
                                        <FileDown size={13} className="text-emerald-400" />
                                        <span>Telecharger DOCX</span>
                                    </Dropdown.Item>
                                ) : (
                                    <Dropdown.Item key="generate-docx" id="generate-docx">
                                        <FileUp size={13} className="text-blue-400" />
                                        <span>{generatingId === contract.id ? 'Generation...' : 'Generer DOCX'}</span>
                                    </Dropdown.Item>
                                )}
                                {contract.hasPdf ? (
                                    <Dropdown.Item key="download-pdf" id="download-pdf">
                                        <Download size={13} className="text-emerald-400" />
                                        <span>Telecharger PDF</span>
                                    </Dropdown.Item>
                                ) : contract.hasGeneratedDoc ? (
                                    <Dropdown.Item key="generate-pdf" id="generate-pdf">
                                        <FileText size={13} className="text-violet-400" />
                                        <span>{generatingId === contract.id ? 'Generation...' : 'Generer PDF'}</span>
                                    </Dropdown.Item>
                                ) : null}
                            </Dropdown.Section>

                            <Dropdown.Item key="print" id="print">
                                <Printer size={13} className="text-amber-400" />
                                <span>Imprimer</span>
                            </Dropdown.Item>

                            <Dropdown.Item key="documents" id="documents">
                                <FileText size={13} className="text-sky-400" />
                                <span>Documents</span>
                            </Dropdown.Item>

                            {resolvedStatus !== 'signed' && (
                                <Dropdown.Item key="mark-signed" id="mark-signed">
                                    <CheckCircle2 size={13} className="text-emerald-400" />
                                    <span>Marquer signe</span>
                                </Dropdown.Item>
                            )}

                            <Dropdown.Section title="Danger">
                                <Dropdown.Item key="delete" id="delete" className="text-red-400 data-[hover]:bg-red-400/10">
                                    <Trash2 size={13} className="shrink-0 text-red-400" />
                                    <span>Supprimer</span>
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
                        <FileText size={18} className="text-[var(--accent)]" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{contract.contractNumber}</p>
                            {contract.notes ? (
                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)] leading-tight line-clamp-1">{contract.notes}</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {generatingId === contract.id ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                                <span className="inline-block size-1.5 animate-ping rounded-full bg-blue-400" />
                                Generation...
                            </span>
                        ) : null}
                        {[
                            { key: 'draft', label: 'Brouillon', show: resolvedStatus === 'draft', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
                            { key: 'generated', label: 'Genere', show: !!(contract.generatedAt || contract.hasGeneratedDoc || resolvedStatus === 'signed'), color: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
                            { key: 'signed', label: 'Signe', show: resolvedStatus === 'signed', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
                        ].filter((b) => b.show).map((b, i) => (
                            <span key={b.key} className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                                b.color,
                                i > 0 && 'ml-0.5',
                            )}>
                                {b.key === 'draft' ? <Circle size={8} /> : <Check size={10} />} {b.label}
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
                                <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{r.label}</p>
                                <p className="text-xs font-semibold text-[var(--foreground)]">{r.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Financial summary */}
                <div className="border-t border-[var(--border)] px-4 py-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Montants</p>
                    <div className="space-y-1.5">
                        {finRows.map((r) => (
                            <div key={r.label} className="flex items-center justify-between">
                                <span className="text-[11px] text-[var(--text-muted)]">{r.label}</span>
                                <span className={cn('text-xs font-semibold', r.highlight ? 'text-[var(--accent)]' : 'text-[var(--foreground)]')}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-[var(--border)] px-4 py-3">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Chronologie</p>
                    <div className="flex items-center gap-0">
                        {[
                            { key: 'created', icon: Calendar, label: 'Cree', date: contract.createdAt, done: true },
                            { key: 'generated', icon: ScrollText, label: 'Genere', date: contract.generatedAt, done: !!contract.generatedAt },
                            { key: 'signed', icon: CheckCircle2, label: 'Signe', date: contract.signedAt, done: resolvedStatus === 'signed' },
                        ].map((step, idx) => (
                            <div key={step.key} className="flex-1 flex flex-col items-center relative min-w-0">
                                <div className={cn(
                                    'flex size-7 items-center justify-center rounded-full border-2 shrink-0',
                                    step.done ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
                                )}>
                                    {step.key === 'created' ? <Calendar size={12} /> : step.key === 'generated' && step.done ? <Check size={12} /> : step.key === 'generated' ? <ScrollText size={12} /> : step.done ? <Check size={12} /> : <Circle size={12} />}
                                </div>
                                <p className={cn('mt-1 text-[10px] font-medium text-center leading-tight', step.done ? 'text-emerald-400' : 'text-[var(--text-muted)]')}>{step.label}</p>
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
                            <span className="text-[10px] text-blue-400 font-medium">Generation en cours...</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Delete confirmation modal */}
            <AppModal
                isOpen={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Supprimer le contrat ?"
                size="sm"
            >
                <p className="mb-5 flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <Trash2 size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <span>
                        Confirmez la suppression de <strong>{deleteTarget?.contractNumber}</strong>.
                        Cette action est <span className="font-semibold text-red-400">irreversible</span>.
                    </span>
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="bordered" color="default" onPress={() => setDeleteTarget(null)} isDisabled={actionLoading}>
                        Annuler
                    </Button>
                    <Button variant="solid" onPress={confirmDelete} isLoading={actionLoading} className="bg-red-500 text-white hover:bg-red-600">
                        Supprimer
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
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Finance</h3>
                    <p className="text-xs text-[var(--text-muted)]">{records.length} record(s)</p>
                </div>
                <AppButton variant="bordered" size="sm" onPress={() => router.visit('/finance')}>
                    <BadgeDollarSign size={14} /> Open finance
                </AppButton>
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <InfoField label="Total TTC" value={money(total)} />
                <InfoField label="Paid" value={money(paid)} />
                <InfoField label="Remaining" value={money(remaining)} />
            </div>
            {records.length > 0 ? (
                <div className="grid gap-2">
                    {records.map((record) => (
                        <div key={record.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5">
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{record.recordNumber}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">{record.type} · {record.status}</p>
                            </div>
                            <span className="text-sm font-semibold text-[var(--accent)]">{money(record.totalTtc)}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <CompactEmpty icon={BadgeDollarSign} title="No finance records" description="Create finance records to track payments." />
            )}
        </div>
    );
}

/* ── Authorizations tab ── */
function AuthorizationsTab({ authorization, dossierId, dossierNumber }: {
    authorization: AuthorizationSummary; dossierId: number; dossierNumber: string;
}) {
    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">Authorizations</h3>
                    <p className="text-xs text-[var(--text-muted)]">Rokhas and authorization tracking</p>
                </div>
                <AppButton variant="bordered" size="sm" onPress={() => router.visit(`/authorizations?dossier_id=${dossierId}`)}>
                    <ShieldCheck size={14} /> Open authorizations
                </AppButton>
            </div>
            {authorization ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-base font-semibold text-[var(--foreground)]">
                        {authorization.submissionNumber || authorization.authorizationNumber || '-'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-[var(--text-muted)]">
                        <span>Authority: <strong className="text-[var(--foreground)]">{authorization.authorityName || '-'}</strong></span>
                        <span>Status: <strong className="text-[var(--foreground)]">{authorization.status}</strong></span>
                    </div>
                </div>
            ) : (
                <CompactEmpty icon={ShieldCheck} title="No authorization" description="Submit authorization files through Rokhas to start tracking." />
            )}
        </div>
    );
}

/* ── Notes tab ── */
function NotesTab({ dossier }: { dossier: DossierRow }) {
    return (
        <div>
            <h3 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Notes</h3>
            <p className="mb-4 text-xs text-[var(--text-muted)]">Internal comments related to this project.</p>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <p className="text-[13px] leading-6 text-[var(--text-muted)]">{dossier.notes || 'No notes saved.'}</p>
            </div>
        </div>
    );
}

/* ── Activity tab ── */
function ActivityTab() {
    return (
        <CompactEmpty icon={CircleDot} title="No recent activity" description="Activity will appear as the project progresses." />
    );
}
