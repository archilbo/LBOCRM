import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Archive,
    BadgeDollarSign,
    FileCheck2,
    FileText,
    MapPin,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import type { DossierRow } from '@/features/dossiers/types';

type DocumentSummary = {
    id: number;
    name: string;
    status: string;
    fileName: string | null;
    uploadedAt: string | null;
};

type ContractSummary = {
    id: number;
    contractNumber: string;
    status: string;
    ttc: number;
} | null;

type AuthorizationSummary = {
    id: number;
    submissionNumber: string | null;
    authorizationNumber: string | null;
    authorityName: string | null;
    status: string;
} | null;

type FinanceSummary = {
    id: number;
    recordNumber: string;
    type: string;
    status: string;
    totalTtc: number;
    paid: number;
    remaining: number;
};

type ArchiveSummary = {
    id: number;
    archiveNumber: string;
    status: string;
    room: string | null;
    shelf: string | null;
    box: string | null;
    folder: string | null;
} | null;

type PageProps = {
    dossier: DossierRow;
    documents: DocumentSummary[];
    contract: ContractSummary;
    authorization: AuthorizationSummary;
    financeRecords: FinanceSummary[];
    archiveRecord: ArchiveSummary;
};

function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}

function InfoCard({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="rounded-2xl border bg-[var(--surface)] p-4">
            <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value || '-'}</p>
        </div>
    );
}

function ModuleCard({
    icon,
    title,
    description,
    actionLabel,
    href,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    href: string;
    children: React.ReactNode;
}) {
    return (
        <AppCard className="min-w-0 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                        {icon}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold">{title}</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
                    </div>
                </div>

                <AppButton size="sm" variant="secondary" onPress={() => router.visit(href)}>
                    {actionLabel}
                </AppButton>
            </div>

            {children}
        </AppCard>
    );
}

export default function DossierShow({
    dossier,
    documents,
    contract,
    authorization,
    financeRecords,
    archiveRecord,
}: PageProps) {
    const totalFinance = financeRecords.reduce((sum, record) => sum + record.totalTtc, 0);
    const paidFinance = financeRecords.reduce((sum, record) => sum + record.paid, 0);
    const remainingFinance = financeRecords.reduce((sum, record) => sum + record.remaining, 0);

    return (
        <>
            <Head title={dossier.dossierNumber} />

            <AppShell
                eyebrowKey="dossiers.eyebrow"
                titleKey="dossiers.title"
                subtitleKey="dossiers.subtitle"
                action={
                    <div className="flex flex-wrap gap-2">
                        <AppButton variant="secondary" onPress={() => router.visit('/dossiers')}>
                            <ArrowLeft size={16} />
                            Back
                        </AppButton>

                        <AppButton variant="primary" onPress={() => router.visit('/contracts')}>
                            <FileText size={16} />
                            Contract
                        </AppButton>
                    </div>
                }
            >
                <AppCard className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <FileText size={24} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-xl font-semibold">{dossier.projectObject}</h1>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {dossier.dossierNumber} Â· {dossier.clientName}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <AppStatusBadge
                                        label={dossier.status}
                                        tone={dossier.status === 'active' ? 'green' : dossier.status === 'opened' ? 'blue' : 'neutral'}
                                        icon={dossier.status === 'active' ? 'check' : 'clock'}
                                    />
                                    <AppBadge tone="violet">{dossier.workflowStep}</AppBadge>
                                    <AppBadge tone="blue">{dossier.floorArea ? `${dossier.floorArea} mÂ²` : 'No surface'}</AppBadge>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <UserRound size={15} />
                                {dossier.clientNumber} Â· {dossier.clientCin}
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <MapPin size={15} />
                                {dossier.projectAddress || '-'}
                            </div>
                        </div>
                    </div>
                </AppCard>

                <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-5">
                        <AppCard className="p-5">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold">Project information</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Project data loaded from the database.
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <InfoCard label="Client" value={dossier.clientName} />
                                <InfoCard label="Dossier number" value={dossier.dossierNumber} />
                                <InfoCard label="Workflow step" value={dossier.workflowStep} />
                                <InfoCard label="Province" value={dossier.province} />
                                <InfoCard label="Commune" value={dossier.commune} />
                                <InfoCard label="Land title" value={dossier.landTitleNumber} />
                                <InfoCard label="Land surface" value={dossier.landSurface ? `${dossier.landSurface} mÂ²` : '-'} />
                                <InfoCard label="Floor area" value={dossier.floorArea ? `${dossier.floorArea} mÂ²` : '-'} />
                                <InfoCard label="Opened at" value={dossier.openedAt} />
                            </div>
                        </AppCard>

                        <ModuleCard
                            icon={<FileCheck2 size={18} />}
                            title="Documents"
                            description="Required documents linked to this project."
                            actionLabel="Open"
                            href="/documents"
                        >
                            <div className="space-y-2">
                                {documents.length > 0 ? (
                                    documents.map((document) => (
                                        <div key={document.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-[var(--surface)] p-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">{document.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{document.fileName || 'No file'} Â· {document.uploadedAt || '-'}</p>
                                            </div>
                                            <AppBadge tone={document.status === 'verified' ? 'green' : 'amber'}>{document.status}</AppBadge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)]">No documents yet.</p>
                                )}
                            </div>
                        </ModuleCard>

                        <ModuleCard
                            icon={<BadgeDollarSign size={18} />}
                            title="Finance"
                            description="Finance records linked to this project."
                            actionLabel="Open"
                            href="/finance"
                        >
                            <div className="grid gap-3 md:grid-cols-3">
                                <InfoCard label="Total TTC" value={formatMoney(totalFinance)} />
                                <InfoCard label="Paid" value={formatMoney(paidFinance)} />
                                <InfoCard label="Remaining" value={formatMoney(remainingFinance)} />
                            </div>

                            <div className="mt-3 space-y-2">
                                {financeRecords.map((record) => (
                                    <div key={record.id} className="rounded-2xl border bg-[var(--surface)] p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold">{record.recordNumber}</p>
                                            <AppBadge tone="blue">{record.status}</AppBadge>
                                        </div>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {record.type} Â· {formatMoney(record.totalTtc)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ModuleCard>
                    </div>

                    <aside className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
                        <ModuleCard
                            icon={<FileText size={18} />}
                            title="Contract"
                            description="Contract state for this project."
                            actionLabel="Open"
                            href="/contracts"
                        >
                            {contract ? (
                                <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                    <p className="text-sm font-semibold">{contract.contractNumber}</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        {contract.status} Â· {formatMoney(contract.ttc)}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">No contract yet.</p>
                            )}
                        </ModuleCard>

                        <ModuleCard
                            icon={<ShieldCheck size={18} />}
                            title="Authorization"
                            description="Authorization follow-up."
                            actionLabel="Open"
                            href="/authorizations"
                        >
                            {authorization ? (
                                <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                    <p className="text-sm font-semibold">{authorization.submissionNumber || '-'}</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        {authorization.authorityName || '-'} Â· {authorization.status}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">No authorization yet.</p>
                            )}
                        </ModuleCard>

                        <ModuleCard
                            icon={<Archive size={18} />}
                            title="Archive"
                            description="Physical archive position."
                            actionLabel="Open"
                            href="/archives"
                        >
                            {archiveRecord ? (
                                <div className="rounded-2xl border bg-[var(--surface)] p-4">
                                    <p className="text-sm font-semibold">{archiveRecord.archiveNumber}</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        {archiveRecord.room || '-'} Â· {archiveRecord.box || '-'}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">Not archived yet.</p>
                            )}
                        </ModuleCard>

                        <AppCard className="p-5">
                            <h2 className="text-sm font-semibold">Notes</h2>
                            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                                {dossier.notes || 'No notes saved.'}
                            </p>
                        </AppCard>
                    </aside>
                </section>
            </AppShell>
        </>
    );
}