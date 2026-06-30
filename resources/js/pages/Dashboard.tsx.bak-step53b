import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    Archive,
    BadgeDollarSign,
    CheckCircle2,
    ClipboardCheck,
    Database,
    FileCheck2,
    FileText,
    FolderKanban,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';

type DashboardMetrics = {
    clients: number;
    intermediaries: number;
    dossiers: number;
    activeDossiers: number;
    documents: number;
    verifiedDocuments: number;
    contracts: number;
    generatedContracts: number;
    authorizations: number;
    submittedAuthorizations: number;
    financeRecords: number;
    financeTotal: number;
    financePaid: number;
    financeRemaining: number;
    archives: number;
    storedArchives: number;
};

type WorkflowItem = {
    key: string;
    label: string;
    count: number;
    href: string;
    description: string;
};

type LatestDossier = {
    id: number;
    dossierNumber: string;
    projectObject: string;
    clientName: string;
    status: string;
    workflowStep: string;
    updatedAt: string | null;
};

type LatestFinance = {
    id: number;
    recordNumber: string;
    type: string;
    status: string;
    totalTtc: number;
    remaining: number;
    clientName: string;
    dossierNumber: string;
};

type UrgentItem = {
    label: string;
    count: number;
    href: string;
    tone: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';
};

type PageProps = {
    metrics: DashboardMetrics;
    workflow: WorkflowItem[];
    latestDossiers: LatestDossier[];
    latestFinance: LatestFinance[];
    urgentItems: UrgentItem[];
};

function formatMoney(value: number) {
    return new Intl.NumberFormat('en-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value);
}

function ModuleIcon({ moduleKey }: { moduleKey: string }) {
    const className = 'h-5 w-5';

    switch (moduleKey) {
        case 'clients':
            return <UserRound className={className} />;
        case 'dossiers':
            return <FolderKanban className={className} />;
        case 'documents':
            return <FileCheck2 className={className} />;
        case 'contracts':
            return <FileText className={className} />;
        case 'authorizations':
            return <ShieldCheck className={className} />;
        case 'finance':
            return <BadgeDollarSign className={className} />;
        case 'archives':
            return <Archive className={className} />;
        default:
            return <ClipboardCheck className={className} />;
    }
}

function KpiCard({
    label,
    value,
    description,
    icon,
}: {
    label: string;
    value: string | number;
    description: string;
    icon: ReactNode;
}) {
    return (
        <AppCard className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm text-[var(--text-muted)]">{label}</p>
                    <p className="mt-3 truncate text-2xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
                </div>

                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                    {icon}
                </div>
            </div>
        </AppCard>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
            />
        </div>
    );
}

export default function Dashboard({
    metrics,
    workflow,
    latestDossiers,
    latestFinance,
    urgentItems,
}: PageProps) {
    const documentRate = metrics.documents > 0
        ? Math.round((metrics.verifiedDocuments / metrics.documents) * 100)
        : 0;

    const financeRate = metrics.financeTotal > 0
        ? Math.round((metrics.financePaid / metrics.financeTotal) * 100)
        : 0;

    return (
        <>
            <Head title="Dashboard" />

            <AppShell
                eyebrowKey="dashboard.eyebrow"
                titleKey="dashboard.title"
                subtitleKey="dashboard.subtitle"
                action={
                    <AppButton variant="secondary" onPress={() => router.visit('/backend-qa')}>
                        <Database size={16} />
                        Backend QA
                    </AppButton>
                }
            >
                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        label="Clients"
                        value={metrics.clients}
                        description={`${metrics.intermediaries} intermediaries`}
                        icon={<UserRound size={20} />}
                    />

                    <KpiCard
                        label="Projects"
                        value={metrics.dossiers}
                        description={`${metrics.activeDossiers} active/opened`}
                        icon={<FolderKanban size={20} />}
                    />

                    <KpiCard
                        label="Documents"
                        value={metrics.documents}
                        description={`${documentRate}% verified`}
                        icon={<FileCheck2 size={20} />}
                    />

                    <KpiCard
                        label="Finance"
                        value={formatMoney(metrics.financeTotal)}
                        description={`${formatMoney(metrics.financeRemaining)} remaining`}
                        icon={<BadgeDollarSign size={20} />}
                    />
                </section>

                <section className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-5">
                        <AppCard className="p-5">
                            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold">Workflow modules</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        All v1 modules connected to backend database.
                                    </p>
                                </div>

                                <AppBadge tone="green">Database backed</AppBadge>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {workflow.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => router.visit(item.href)}
                                        className="rounded-2xl border bg-[var(--surface)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                                <ModuleIcon moduleKey={item.key} />
                                            </div>

                                            <AppBadge tone="blue">{item.count}</AppBadge>
                                        </div>

                                        <p className="text-sm font-semibold">{item.label}</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {item.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </AppCard>

                        <section className="grid gap-5 xl:grid-cols-2">
                            <AppCard className="p-5">
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold">Latest projects</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Recently updated dossiers from database.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {latestDossiers.map((dossier) => (
                                        <button
                                            key={dossier.id}
                                            type="button"
                                            onClick={() => router.visit(`/dossiers/${dossier.id}`)}
                                            className="block w-full rounded-2xl border bg-[var(--surface)] p-4 text-left transition hover:border-[var(--accent)]"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {dossier.projectObject}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                        {dossier.dossierNumber} Ã‚Â· {dossier.clientName}
                                                    </p>
                                                </div>

                                                <AppBadge tone="violet">{dossier.workflowStep}</AppBadge>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </AppCard>

                            <AppCard className="p-5">
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold">Latest finance</h2>
                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        Recent financial records from database.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {latestFinance.map((record) => (
                                        <button
                                            key={record.id}
                                            type="button"
                                            onClick={() => router.visit('/finance')}
                                            className="block w-full rounded-2xl border bg-[var(--surface)] p-4 text-left transition hover:border-[var(--accent)]"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {record.recordNumber}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                        {record.clientName} Ã‚Â· {record.dossierNumber}
                                                    </p>
                                                </div>

                                                <AppBadge tone={record.remaining > 0 ? 'amber' : 'green'}>
                                                    {formatMoney(record.remaining)}
                                                </AppBadge>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </AppCard>
                        </section>
                    </div>

                    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
                        <AppCard className="p-5">
                            <h2 className="text-sm font-semibold">Backend health</h2>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Main v1 modules are connected.
                            </p>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span>Documents verified</span>
                                        <span>{documentRate}%</span>
                                    </div>
                                    <ProgressBar value={documentRate} />
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between text-sm">
                                        <span>Finance collected</span>
                                        <span>{financeRate}%</span>
                                    </div>
                                    <ProgressBar value={financeRate} />
                                </div>
                            </div>

                            <div className="mt-5 grid gap-2">
                                <AppStatusBadge label="Clients connected" tone="green" icon="check" />
                                <AppStatusBadge label="Projects connected" tone="green" icon="check" />
                                <AppStatusBadge label="Documents connected" tone="green" icon="check" />
                                <AppStatusBadge label="Contracts connected" tone="green" icon="check" />
                                <AppStatusBadge label="Authorizations connected" tone="green" icon="check" />
                                <AppStatusBadge label="Finance connected" tone="green" icon="check" />
                                <AppStatusBadge label="Archives connected" tone="green" icon="check" />
                            </div>
                        </AppCard>

                        <AppCard className="p-5">
                            <h2 className="text-sm font-semibold">Needs attention</h2>

                            <div className="mt-4 space-y-3">
                                {urgentItems.map((item) => (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => router.visit(item.href)}
                                        className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-[var(--surface)] p-3 text-left transition hover:border-[var(--accent)]"
                                    >
                                        <span className="text-sm font-medium">{item.label}</span>
                                        <AppBadge tone={item.tone}>{item.count}</AppBadge>
                                    </button>
                                ))}
                            </div>
                        </AppCard>
                    </aside>
                </section>
            </AppShell>
        </>
    );
}