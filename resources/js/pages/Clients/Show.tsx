import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    FolderKanban,
    Mail,
    MapPin,
    Phone,
    UserRound,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import type { ClientRow } from '@/features/clients/types';
import { useTranslation } from '@/lib/i18n';

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
};

function InfoCard({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="rounded-2xl border bg-[var(--surface)] p-4">
            <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold">{value || '-'}</p>
        </div>
    );
}

export default function ClientShow({ client, dossiers }: PageProps) {
    const { t } = useTranslation();

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
                            Back
                        </AppButton>

                        <AppButton variant="primary" onPress={() => router.visit('/dossiers')}>
                            <FolderKanban size={16} />
                            Create project
                        </AppButton>
                    </div>
                }
            >
                <AppCard className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <UserRound size={24} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-xl font-semibold">{client.fullName}</h1>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {client.clientNumber} Â· {client.cin || '-'}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <AppStatusBadge
                                        label={client.status}
                                        tone={client.status === 'active' ? 'green' : client.status === 'inactive' ? 'amber' : 'neutral'}
                                        icon={client.status === 'active' ? 'check' : 'clock'}
                                    />
                                    <AppBadge tone="violet">{client.intermediaryName}</AppBadge>
                                    <AppBadge tone="blue">{client.projectsCount} projects</AppBadge>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <Phone size={15} />
                                {client.phone || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <Mail size={15} />
                                {client.email || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                <MapPin size={15} />
                                {client.address || '-'}
                            </div>
                        </div>
                    </div>
                </AppCard>

                <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="min-w-0 space-y-5">
                        <AppCard className="p-5">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold">Identity information</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Client identity data saved in the database.
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <InfoCard label="First name" value={client.firstName} />
                                <InfoCard label="Last name" value={client.lastName} />
                                <InfoCard label="CIN" value={client.cin} />
                                <InfoCard label="Father name" value={client.fatherName} />
                                <InfoCard label={t('clientFormExtra.motherName')} value={client.motherName} />
                                <InfoCard label="CNI expiration" value={client.cniExpirationDate} />
                                <InfoCard label={t('clientFormExtra.intermediary')} value={client.intermediaryName} />
                                <InfoCard label="Created at" value={client.createdAt} />
                                <InfoCard label="Updated" value={client.updatedAt} />
                            </div>
                        </AppCard>

                        <AppCard className="p-5">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold">Linked projects</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Projects connected to this client from database relations.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {dossiers.length > 0 ? (
                                    dossiers.map((dossier) => (
                                        <Link key={dossier.id} href={`/dossiers/${dossier.id}`} className="block">
                                            <div className="rounded-2xl border bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold">{dossier.projectObject}</p>
                                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                            {dossier.dossierNumber} Â· {dossier.workflowStep}
                                                        </p>
                                                    </div>

                                                    <AppBadge tone="blue">{dossier.status}</AppBadge>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed bg-[var(--surface)] p-8 text-center">
                                        <p className="text-sm font-semibold">No linked projects</p>
                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            Create a project from this client when needed.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </AppCard>
                    </div>

                    <aside className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
                        <AppCard className="p-5">
                            <h2 className="text-sm font-semibold">Notes</h2>
                            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                                {client.notes || 'No notes saved.'}
                            </p>
                        </AppCard>

                        <AppCard className="p-5">
                            <h2 className="text-sm font-semibold">Quick actions</h2>

                            <div className="mt-4 grid gap-2">
                                <AppButton variant="primary" onPress={() => router.visit('/dossiers')}>
                                    <FolderKanban size={16} />
                                    Create project
                                </AppButton>

                                <AppButton variant="secondary" onPress={() => router.visit('/clients')}>
                                    <ArrowLeft size={16} />
                                    Back to clients
                                </AppButton>
                            </div>
                        </AppCard>
                    </aside>
                </section>
            </AppShell>
        </>
    );
}