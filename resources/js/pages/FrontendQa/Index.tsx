import { Head, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Download,
    FileSearch,
    Play,
    Route,
    Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import {
    qaActions,
    qaProjectRecords,
    qaSearchQueries,
} from '@/features/frontend-qa/data/qaData';
import { appRoutes } from '@/lib/appRoutes';
import { prototypeDownload } from '@/lib/prototypeActions';
import { searchPrototypeItems } from '@/data/prototypeSearch';
import { useTranslation } from '@/lib/i18n';

function QaSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <AppCard className="min-w-0 p-5">
            <div className="mb-5">
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
            </div>

            {children}
        </AppCard>
    );
}

export default function FrontendQaIndex() {
    const { t } = useTranslation();
    const activeRoutes = appRoutes.filter((route) => route.enabled);

    function openRoute(href: string) {
        toast.info(t('frontendQa.toast.route'));
        router.visit(href);
    }

    function runAction(action: (typeof qaActions)[number]) {
        if (action.type === 'navigate' && action.href) {
            toast.info(t('frontendQa.toast.route'));
            router.visit(action.href);
            return;
        }

        if (action.type === 'download' && action.fileName) {
            prototypeDownload(
                action.fileName,
                `ARCHI LBO prototype generated file
Action: ${action.title}
This will be replaced by backend document generation.`,
            );
            return;
        }

        toast.success(t('frontendQa.toast.action'));
    }

    return (
        <>
            <Head title={t('frontendQa.title')} />

            <AppShell
                eyebrowKey="frontendQa.eyebrow"
                titleKey="frontendQa.title"
                subtitleKey="frontendQa.subtitle"
            >
                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Active routes</p>
                        <p className="mt-2 text-2xl font-semibold">{activeRoutes.length}</p>
                    </AppCard>

                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Search tests</p>
                        <p className="mt-2 text-2xl font-semibold">{qaSearchQueries.length}</p>
                    </AppCard>

                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Project records</p>
                        <p className="mt-2 text-2xl font-semibold">{qaProjectRecords.length}</p>
                    </AppCard>

                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Button actions</p>
                        <p className="mt-2 text-2xl font-semibold">{qaActions.length}</p>
                    </AppCard>
                </section>

                <QaSection
                    title={t('frontendQa.routesTitle')}
                    description={t('frontendQa.routesDescription')}
                >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {activeRoutes.map((route) => {
                            const Icon = route.icon;

                            return (
                                <div
                                    key={route.key}
                                    className="rounded-2xl border bg-[var(--surface)] p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                                            <Icon size={17} />
                                        </div>

                                        <AppBadge tone="green">
                                            {t('frontendQa.routeOk')}
                                        </AppBadge>
                                    </div>

                                    <p className="text-sm font-semibold">{t(route.labelKey)}</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">{route.href}</p>

                                    <AppButton
                                        size="sm"
                                        variant="secondary"
                                        className="mt-4 w-full"
                                        onPress={() => openRoute(route.href)}
                                    >
                                        <Route size={15} />
                                        {t('frontendQa.open')}
                                    </AppButton>
                                </div>
                            );
                        })}
                    </div>
                </QaSection>

                <QaSection
                    title={t('frontendQa.searchTitle')}
                    description={t('frontendQa.searchDescription')}
                >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {qaSearchQueries.map((query) => {
                            const results = searchPrototypeItems(query);
                            const first = results[0];

                            return (
                                <div key={query} className="rounded-2xl border bg-[var(--surface)] p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <Search size={17} className="text-[var(--accent)]" />
                                        <AppBadge tone={first ? 'green' : 'red'}>
                                            {first ? t('frontendQa.searchOk') : t('frontendQa.noResult')}
                                        </AppBadge>
                                    </div>

                                    <p className="text-sm font-semibold">{query}</p>
                                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                        {first ? `${first.title} Â· ${first.subtitle}` : 'No result'}
                                    </p>

                                    <AppButton
                                        size="sm"
                                        variant="secondary"
                                        className="mt-4 w-full"
                                        isDisabled={!first}
                                        onPress={() => {
                                            if (first) {
                                                toast.info(t('frontendQa.toast.search'));
                                                router.visit(first.href);
                                            }
                                        }}
                                    >
                                        <FileSearch size={15} />
                                        {t('frontendQa.test')}
                                    </AppButton>
                                </div>
                            );
                        })}
                    </div>
                </QaSection>

                <QaSection
                    title={t('frontendQa.projectsTitle')}
                    description={t('frontendQa.projectsDescription')}
                >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {qaProjectRecords.map((project) => (
                            <div key={project.id} className="rounded-2xl border bg-[var(--surface)] p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <AppBadge tone="violet">{project.dossierNumber}</AppBadge>
                                    <CheckCircle2 size={17} className="text-[var(--success)]" />
                                </div>

                                <p className="text-sm font-semibold">{project.title}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{project.client}</p>

                                <div className="mt-3 rounded-xl border bg-[var(--surface-2)] p-3">
                                    <p className="text-[11px] font-medium text-[var(--text-muted)]">
                                        {t('frontendQa.expected')}
                                    </p>
                                    <p className="mt-1 text-xs">{project.expected}</p>
                                </div>

                                <AppButton
                                    size="sm"
                                    variant="secondary"
                                    className="mt-4 w-full"
                                    onPress={() => openRoute(project.href)}
                                >
                                    <ArrowUpRight size={15} />
                                    {t('frontendQa.open')}
                                </AppButton>
                            </div>
                        ))}
                    </div>
                </QaSection>

                <QaSection
                    title={t('frontendQa.actionsTitle')}
                    description={t('frontendQa.actionsDescription')}
                >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {qaActions.map((action) => (
                            <div key={action.id} className="rounded-2xl border bg-[var(--surface)] p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <AppBadge tone={action.type === 'download' ? 'blue' : action.type === 'navigate' ? 'green' : 'amber'}>
                                        {action.type}
                                    </AppBadge>
                                    {action.type === 'download' ? (
                                        <Download size={17} className="text-[var(--accent)]" />
                                    ) : (
                                        <Play size={17} className="text-[var(--accent)]" />
                                    )}
                                </div>

                                <p className="text-sm font-semibold">{action.title}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{action.description}</p>

                                <AppButton
                                    size="sm"
                                    variant="primary"
                                    className="mt-4 w-full"
                                    onPress={() => runAction(action)}
                                >
                                    <Play size={15} />
                                    {t('frontendQa.runAction')}
                                </AppButton>
                            </div>
                        ))}
                    </div>
                </QaSection>
            </AppShell>
        </>
    );
}
