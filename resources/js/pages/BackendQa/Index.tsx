import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Database,
    ExternalLink,
    Route,
    Table2,
    TriangleAlert,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

type TableCheck = {
    name: string;
    count: number;
    expected: string;
};

type RouteCheck = {
    label: string;
    name: string;
    href: string;
    exists: boolean;
};

type RelationCheck = {
    label: string;
    count: number;
    status: 'ok' | 'warning';
};

type PageProps = {
    database: {
        connection: string;
        database: string;
    };
    tables: TableCheck[];
    routes: RouteCheck[];
    relations: RelationCheck[];
    latest: {
        client: string | null;
        dossier: string | null;
        contract: string | null;
        finance: string | null;
        archive: string | null;
    };
};

export default function BackendQaIndex({
    database,
    tables,
    routes,
    relations,
    latest,
}: PageProps) {
    const routeOkCount = routes.filter((route) => route.exists).length;
    const tableTotal = tables.reduce((sum, table) => sum + table.count, 0);

    return (
        <>
            <Head title="Backend QA" />

            <AppShell
                eyebrowKey="frontendQa.eyebrow"
                titleKey="frontendQa.title"
                subtitleKey="frontendQa.subtitle"
                action={
                    <AppButton variant="secondary" onPress={() => router.visit('/')}>
                        <ExternalLink size={16} />
                        Dashboard
                    </AppButton>
                }
            >
                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Database</p>
                        <p className="mt-3 truncate text-2xl font-semibold">{database.database}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{database.connection}</p>
                    </AppCard>

                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Rows</p>
                        <p className="mt-3 text-2xl font-semibold">{tableTotal}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Across v1 tables</p>
                    </AppCard>

                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Routes</p>
                        <p className="mt-3 text-2xl font-semibold">
                            {routeOkCount}/{routes.length}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Named routes valid</p>
                    </AppCard>

                    <AppCard className="p-4">
                        <p className="text-sm text-[var(--text-muted)]">Modules</p>
                        <p className="mt-3 text-2xl font-semibold">7</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Backend connected</p>
                    </AppCard>
                </section>

                <section className="grid min-w-0 gap-5 xl:grid-cols-2">
                    <AppCard className="p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <Table2 size={18} className="text-[var(--accent)]" />
                            <div>
                                <h2 className="text-sm font-semibold">Database tables</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Core MERISE backend tables.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {tables.map((table) => (
                                <div
                                    key={table.name}
                                    className="flex items-center justify-between gap-3 rounded-2xl border bg-[var(--surface)] p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{table.name}</p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            Expected {table.expected}
                                        </p>
                                    </div>

                                    <AppBadge tone={table.count > 0 ? 'green' : 'amber'}>
                                        {table.count}
                                    </AppBadge>
                                </div>
                            ))}
                        </div>
                    </AppCard>

                    <AppCard className="p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <Route size={18} className="text-[var(--accent)]" />
                            <div>
                                <h2 className="text-sm font-semibold">Route checks</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Active app routes registered in Laravel.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {routes.map((route) => (
                                <button
                                    key={route.name}
                                    type="button"
                                    onClick={() => route.exists && router.visit(route.href)}
                                    className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-[var(--surface)] p-3 text-left transition hover:border-[var(--accent)]"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{route.label}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{route.name}</p>
                                    </div>

                                    {route.exists ? (
                                        <CheckCircle2 size={17} className="text-[var(--success)]" />
                                    ) : (
                                        <TriangleAlert size={17} className="text-[var(--warning)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </AppCard>
                </section>

                <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <AppCard className="p-5">
                        <div className="mb-4 flex items-center gap-3">
                            <Database size={18} className="text-[var(--accent)]" />
                            <div>
                                <h2 className="text-sm font-semibold">Relation checks</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Basic relation integrity checks.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {relations.map((relation) => (
                                <div
                                    key={relation.label}
                                    className="rounded-2xl border bg-[var(--surface)] p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-semibold">{relation.label}</p>
                                        {relation.status === 'ok' ? (
                                            <CheckCircle2 size={17} className="text-[var(--success)]" />
                                        ) : (
                                            <TriangleAlert size={17} className="text-[var(--warning)]" />
                                        )}
                                    </div>

                                    <p className="text-2xl font-semibold">{relation.count}</p>
                                </div>
                            ))}
                        </div>
                    </AppCard>

                    <AppCard className="p-5">
                        <h2 className="text-sm font-semibold">Latest records</h2>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Last inserted data by module.
                        </p>

                        <div className="mt-4 space-y-2">
                            {Object.entries(latest).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="rounded-2xl border bg-[var(--surface)] p-3"
                                >
                                    <p className="text-xs capitalize text-[var(--text-muted)]">{key}</p>
                                    <p className="mt-1 truncate text-sm font-semibold">
                                        {value || '-'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </AppCard>
                </section>
            </AppShell>
        </>
    );
}