import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    FolderKanban,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { ClientProjectsPanel } from '@/features/clients/components/ClientProjectsPanel';
import { ClientSelectedProjectWorkspace, type ClientWorkflowActionContext } from '@/features/clients/components/ClientSelectedProjectWorkspace';
import type { ClientRow, ClientWorkspace, DossierWorkflowRequirement } from '@/features/clients/types';
import { ContractDrawer } from '@/features/contracts/drawers/ContractDrawer';
import type { ContractFormPayload } from '@/features/contracts/types';
import { DocumentUploadDrawer } from '@/features/documents/drawers/DocumentUploadDrawer';
import type { DocumentTemplateOption, DocumentUploadPayload } from '@/features/documents/types';
import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';
import type { DossierFormPayload } from '@/features/dossiers/types';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import type { ArchiveFormPayload } from '@/features/archives/types';
import { FinanceDocumentDrawer } from '@/features/finance/drawers/FinanceDocumentDrawer';
import type { FinanceDocFormPayload } from '@/features/finance/drawers/FinanceDocumentDrawer';

const FORCE_CLIENT_SHOW_LAYOUT_53JC = true;

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
    documentTemplates: DocumentTemplateOption[];
};

function initials(client: ClientRow) {
    const first = client.firstName?.charAt(0) ?? '';
    const last = client.lastName?.charAt(0) ?? '';

    return `${first}${last}`.trim() || client.fullName.slice(0, 2).toUpperCase();
}

function dossierPayload(payload: DossierFormPayload) {
    const current = payload as DossierFormPayload & { address?: string; projectAddress?: string };

    return {
        client_id: payload.clientId,
        project_object: payload.projectObject,
        description: payload.description || null,
        project_address: current.projectAddress || current.address || null,
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

function contractPayload(payload: ContractFormPayload) {
    return {
        dossier_id: payload.dossierId,
        status: payload.status || 'draft',
        surface: payload.surface || null,
        price_per_square_meter: payload.pricePerSquareMeter || null,
        calculation_mode: payload.calculationMode || 'percentage',
        fee_rate_percent: payload.feeRatePercent || null,
        forfait_ttc: payload.calculationMode === 'forfait' ? payload.forfaitTtc || null : null,
        notes: payload.notes || null,
    };
}

function normalizeMatchValue(value: string | null | undefined) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

const workflowTemplateAliases: Record<string, string[]> = {
    cin: ['cin', 'cni', 'carte nationale'],
    certificat_propriete: ['certificat propriete', 'titre foncier'],
    terrain_documents: ['plan parcellaire', 'plan cadastral', 'calcul contenance'],
    engineer_request: ['demande ingenieur', 'centre ingenieur'],
    cahier_received: ['cahier chantier', 'cahier de chantier'],
    fiche_energetique: ['fiche energetique', 'efficacite energetique'],
    contract_bureau_etude: ['contrat bureau etude'],
    plan_beton: ['plan beton', 'beton arme'],
    implantation_topographie: ['implantation', 'topographie'],
    laboratoire_controle: ['laboratoire', 'bureau de controle'],
    demande_permis_habiter: ['permis habiter', 'demande permis'],
    site_images: ['image site', 'photo site'],
    recent_certificat_propriete: ['certificat propriete'],
};

export default function ClientShow({ client, dossiers, workspace, documentTemplates }: PageProps) {
    const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
    const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
    const [documentTemplateId, setDocumentTemplateId] = useState('');
    const [contractDrawerOpen, setContractDrawerOpen] = useState(false);
    const [financeDrawerOpen, setFinanceDrawerOpen] = useState(false);
    const [financeDocType, setFinanceDocType] = useState('quote');
    const [archiveDrawerOpen, setArchiveDrawerOpen] = useState(false);
    const selectedProject = workspace?.selectedProject ?? null;
    const projects = workspace?.projects ?? dossiers.map((dossier) => ({
        id: dossier.id,
        clientId: client.id,
        clientName: client.fullName,
        dossierNumber: dossier.dossierNumber,
        projectObject: dossier.projectObject,
        projectAddress: null,
        province: null,
        commune: null,
        status: dossier.status,
        workflowStep: dossier.workflowStep,
        documentsCount: 0,
        financeDocumentsCount: 0,
        paymentsCount: 0,
        quotesTotal: 0,
        invoicesTotal: 0,
        paidTotal: 0,
        remainingTotal: 0,
        updatedAt: dossier.updatedAt,
    }));
    const returnTo = selectedProject ? `/clients/${client.id}?dossier_id=${selectedProject.id}` : `/clients/${client.id}`;
    const clientOptions = useMemo(() => [{ id: String(client.id), label: client.fullName }], [client.fullName, client.id]);
    const dossierOptions = useMemo(
        () => projects.map((project) => ({
            id: String(project.id),
            label: `${project.dossierNumber} - ${project.projectObject || 'Projet'}`,
        })),
        [projects],
    );
    const archiveDossierOptions = useMemo(
        () => selectedProject ? [{
            id: String(selectedProject.id),
            label: `${selectedProject.dossierNumber} - ${selectedProject.projectObject || 'Projet'}`,
            hasArchiveRecord: Boolean(selectedProject.archiveRecord),
        }] : [],
        [selectedProject],
    );
    const contractDossierOptions = useMemo(
        () => selectedProject ? [{
            id: String(selectedProject.id),
            label: `${selectedProject.dossierNumber} - ${selectedProject.projectObject || 'Projet'}`,
            floorArea: selectedProject.documentsCount ? null : null,
            hasContract: Boolean(selectedProject.contract),
        }] : [],
        [selectedProject],
    );

    function findTemplateIdForRequirement(requirement?: DossierWorkflowRequirement | null) {
        if (!requirement) {
            return '';
        }

        const aliases = [
            requirement.key,
            requirement.label,
            ...(workflowTemplateAliases[requirement.key] ?? []),
        ].map(normalizeMatchValue).filter(Boolean);

        const template = documentTemplates.find((option) => {
            const haystack = normalizeMatchValue(`${option.label} ${option.type ?? ''}`);

            return aliases.some((alias) => haystack.includes(alias) || alias.includes(haystack));
        });

        return template ? String(template.id) : '';
    }

    function openDocumentQuickCreate(context?: ClientWorkflowActionContext) {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant d ajouter un document.');
            return;
        }

        setDocumentTemplateId(findTemplateIdForRequirement(context?.requirement));
        setDocumentDrawerOpen(true);
    }

    function openContractQuickCreate() {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant de creer un contrat.');
            return;
        }

        setContractDrawerOpen(true);
    }

    function submitProject(payload: DossierFormPayload) {
        router.post('/dossiers', { ...dossierPayload(payload), return_to: `/clients/${client.id}` }, {
            preserveScroll: true,
            onSuccess: () => {
                setProjectDrawerOpen(false);
                toast.success('Projet cree depuis le client.');
            },
            onError: () => toast.error('Impossible de creer le projet.'),
        });
    }

    function submitDocument(payload: DocumentUploadPayload) {
        const formData = new FormData();

        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId || '');
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');
        formData.append('return_to', returnTo);

        if (payload.file) {
            formData.append('file', payload.file);
        }

        router.post('/documents', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setDocumentDrawerOpen(false);
                setDocumentTemplateId('');
                toast.success('Document ajoute au projet.');
            },
            onError: () => toast.error('Impossible d ajouter le document.'),
        });
    }

    function openFinanceQuickCreate(type: string) {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant de creer un document financier.');
            return;
        }

        setFinanceDocType(type);
        setFinanceDrawerOpen(true);
    }

    function submitFinance(payload: FinanceDocFormPayload) {
        if (!selectedProject) {
            return;
        }

        router.post('/finance/documents', {
            ...payload,
            client_id: String(selectedProject.clientId),
            dossier_id: String(selectedProject.id),
            return_to: `/clients/${client.id}?dossier_id=${selectedProject.id}`,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setFinanceDrawerOpen(false);
                toast.success('Document financier cree.');
            },
            onError: () => toast.error('Impossible de creer le document financier.'),
        });
    }

    function openArchiveQuickCreate() {
        if (!selectedProject) {
            toast.error('Selectionnez un projet avant de creer une archive.');
            return;
        }

        setArchiveDrawerOpen(true);
    }

    function submitArchive(payload: ArchiveFormPayload) {
        if (!selectedProject) {
            return;
        }

        router.post('/archives', {
            ...payload,
            return_to: `/clients/${client.id}?dossier_id=${selectedProject.id}`,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setArchiveDrawerOpen(false);
                toast.success('Fiche d archive creee.');
            },
            onError: () => toast.error('Impossible de creer la fiche d archive.'),
        });
    }

    function submitContract(payload: ContractFormPayload) {
        router.post('/contracts', { ...contractPayload(payload), return_to: returnTo }, {
            preserveScroll: true,
            onSuccess: () => {
                setContractDrawerOpen(false);
                toast.success('Contrat cree depuis le client.');
            },
            onError: () => toast.error('Impossible de creer le contrat.'),
        });
    }

    return (
        <>
            <Head title={client.fullName} />

            <AppShell
                eyebrowKey="clients.eyebrow"
                titleKey="clients.title"
                subtitleKey="clients.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit('/clients')}>
                            <ArrowLeft size={16} />
                            Clients
                        </AppButton>
                        <AppButton variant="primary" onPress={() => setProjectDrawerOpen(true)}>
                            <FolderKanban size={16} />
                            New project
                        </AppButton>
                    </div>
                }
            >
                <div className="crm-page" data-ui-marker={FORCE_CLIENT_SHOW_LAYOUT_53JC ? 'FORCE_CLIENT_SHOW_LAYOUT_53JC' : undefined}>
                    <section className="crm-panel overflow-hidden">
                        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-base font-black text-[var(--crm-accent)]">
                                    {initials(client)}
                                </div>
                                <div className="min-w-0">
                                    <p className="crm-eyebrow">Client workspace</p>
                                    <h1 className="mt-2 truncate text-2xl font-black text-[var(--crm-text)]">{client.fullName}</h1>
                                    <p className="mt-1 text-sm text-[var(--crm-muted)]">{client.clientNumber} / {client.cin || 'No CIN'}</p>
                                </div>
                            </div>

                            <div className="grid gap-2 text-sm text-[var(--crm-muted)]">
                                <span className="flex items-center gap-2"><Phone size={15} />{client.phone || '-'}</span>
                                <span className="flex items-center gap-2"><Mail size={15} />{client.email || '-'}</span>
                                <span className="flex items-center gap-2"><MapPin size={15} />{client.address || '-'}</span>
                            </div>
                        </div>

                        <div className="grid border-t border-[var(--crm-border)] md:grid-cols-4">
                            <div className="border-b border-[var(--crm-border)] p-5 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Status</p>
                                <p className="mt-2 text-lg font-black capitalize text-emerald-300">{client.status}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-5 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Projects</p>
                                <p className="mt-2 text-lg font-black text-[var(--crm-accent)]">{projects.length}</p>
                            </div>
                            <div className="border-b border-[var(--crm-border)] p-5 md:border-b-0 md:border-r">
                                <p className="crm-kpi-label">Intermediary</p>
                                <p className="mt-2 truncate text-sm font-bold">{client.intermediaryName || '-'}</p>
                            </div>
                            <div className="p-5">
                                <p className="crm-kpi-label">Updated</p>
                                <p className="mt-2 text-sm font-bold">{client.updatedAt || '-'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 items-start gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="grid min-w-0 gap-5">
                            <section className="crm-panel p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-sm font-black text-[var(--crm-accent)]">
                                        {initials(client)}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-black">{client.fullName}</h2>
                                        <p className="truncate text-xs text-[var(--crm-muted)]">{client.clientNumber} / {client.cin || 'No CIN'}</p>
                                    </div>
                                </div>

                                <dl className="mt-4 grid gap-2 text-xs">
                                    {[
                                        ['First name', client.firstName],
                                        ['Last name', client.lastName],
                                        ['Father', client.fatherName],
                                        ['Mother', client.motherName],
                                        ['CNI expiration', client.cniExpirationDate],
                                        ['Created', client.createdAt],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--crm-border)] bg-black/10 px-3 py-2">
                                            <dt className="shrink-0 text-[var(--crm-muted)]">{label}</dt>
                                            <dd className="truncate font-bold text-[var(--crm-text)]">{value || '-'}</dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="mt-4 rounded-xl border border-[var(--crm-border)] bg-black/10 p-3">
                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--crm-muted)]">Notes</p>
                                    <p className="mt-2 line-clamp-4 text-xs leading-5 text-[var(--crm-text-muted)]">{client.notes || 'No notes saved.'}</p>
                                </div>
                            </section>

                            <section className="crm-panel p-5">
                                <div className="mb-4 flex items-center justify-between gap-2">
                                    <h2 className="text-sm font-bold">Client projects</h2>
                                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-300">{projects.length}</span>
                                </div>
                                <ClientProjectsPanel
                                    clientId={client.id}
                                    projects={projects}
                                    selectedProjectId={selectedProject?.id ?? null}
                                />
                            </section>
                        </aside>

                        <main className="min-w-0">
                            <ClientSelectedProjectWorkspace
                                project={selectedProject}
                                onCreateProject={() => setProjectDrawerOpen(true)}
                                onUploadDocument={openDocumentQuickCreate}
                                onCreateContract={openContractQuickCreate}
                                onCreateFinanceDocument={openFinanceQuickCreate}
                                onCreateArchive={openArchiveQuickCreate}
                            />
                        </main>
                    </section>
                </div>
            </AppShell>

            <ProjectDrawer
                isOpen={projectDrawerOpen}
                mode="create"
                dossier={null}
                clients={clientOptions}
                initialClientId={String(client.id)}
                onOpenChange={setProjectDrawerOpen}
                onSubmit={submitProject}
            />

            <DocumentUploadDrawer
                isOpen={documentDrawerOpen}
                dossiers={dossierOptions}
                templates={documentTemplates}
                initialDossierId={selectedProject ? String(selectedProject.id) : ''}
                initialTemplateId={documentTemplateId}
                onOpenChange={setDocumentDrawerOpen}
                onSubmit={submitDocument}
            />

            <ContractDrawer
                isOpen={contractDrawerOpen}
                mode="create"
                contract={null}
                dossiers={contractDossierOptions}
                initialDossierId={selectedProject ? String(selectedProject.id) : ''}
                onOpenChange={setContractDrawerOpen}
                onSubmit={submitContract}
            />

            <FinanceDocumentDrawer
                isOpen={financeDrawerOpen}
                mode="create"
                clients={clientOptions}
                dossiers={dossierOptions}
                onOpenChange={setFinanceDrawerOpen}
                onSubmit={submitFinance}
                initialType={financeDocType}
            />

            <ArchiveDrawer
                isOpen={archiveDrawerOpen}
                mode="create"
                archiveRecord={null}
                dossiers={archiveDossierOptions}
                onOpenChange={setArchiveDrawerOpen}
                onSubmit={submitArchive}
            />
        </>
    );
}
