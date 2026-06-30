<?php

function path_for(string $relativePath): string
{
    return __DIR__.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
}

function read_file_text(string $relativePath): string
{
    $path = path_for($relativePath);

    if (! is_file($path)) {
        throw new RuntimeException("Missing file: {$relativePath}");
    }

    return file_get_contents($path);
}

function write_file_text(string $relativePath, string $content): void
{
    $path = path_for($relativePath);
    $dir = dirname($path);

    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    file_put_contents($path, ltrim($content, "\xEF\xBB\xBF"));
    echo "Written: {$relativePath}".PHP_EOL;
}

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step51d');
        echo "Backup: {$relativePath}.bak-step51d".PHP_EOL;
    }
}

function run_cmd(string $command): void
{
    echo PHP_EOL."> {$command}".PHP_EOL;
    passthru($command, $exitCode);

    if ($exitCode !== 0) {
        exit($exitCode);
    }
}

echo "STEP 51-D-B runner started".PHP_EOL;

backup_file('resources/js/features/dossiers/components/DossierLocationStats.tsx');
write_file_text('resources/js/features/dossiers/components/DossierLocationStats.tsx', <<<'TSX'
import { AppCard } from '@/components/ui/AppCard';
import type { DossierLocationStats as DossierLocationStatsType } from '@/features/dossiers/types';

type Props = {
    stats: DossierLocationStatsType;
    compact?: boolean;
};

function money(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

export function DossierLocationStats({ stats, compact = false }: Props) {
    const items = [
        { label: 'Projects', value: stats.projectsCount },
        { label: 'Open', value: stats.openCount },
        { label: 'Closed', value: stats.closedCount },
        { label: 'Documents', value: stats.documentsCount },
        { label: 'Finance docs', value: stats.financeDocumentsCount },
        { label: 'Invoices', value: money(stats.invoicesTotal) },
        { label: 'Paid', value: money(stats.paidTotal) },
        { label: 'Remaining', value: money(stats.remainingTotal) },
    ];

    if (compact) {
        return (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {items.slice(0, 4).map((item) => (
                    <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{item.label}</p>
                        <p className="mt-1 truncate text-sm font-semibold">{item.value}</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <AppCard key={item.label} className="p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-semibold">{item.value}</p>
                </AppCard>
            ))}
        </div>
    );
}
TSX);

backup_file('resources/js/features/dossiers/components/DossierCommuneGroup.tsx');
write_file_text('resources/js/features/dossiers/components/DossierCommuneGroup.tsx', <<<'TSX'
import { router } from '@inertiajs/react';
import { ChevronDown, Eye, FileText, FolderKanban, MapPin } from 'lucide-react';
import { useState } from 'react';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import type { DossierCommuneGroup as DossierCommuneGroupType } from '@/features/dossiers/types';
import { DossierLocationStats } from './DossierLocationStats';

type Props = {
    group: DossierCommuneGroupType;
};

function money(value: number) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(value || 0);
}

function statusTone(status: string) {
    if (status === 'active') return 'green';
    if (status === 'opened') return 'blue';
    if (status === 'closed') return 'neutral';
    if (status === 'archived') return 'violet';
    return 'amber';
}

export function DossierCommuneGroup({ group }: Props) {
    const [open, setOpen] = useState(true);

    return (
        <AppCard className="overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--surface-2)]"
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <MapPin size={16} />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{group.commune}</span>
                        <span className="text-xs text-[var(--text-muted)]">{group.stats.projectsCount} project(s)</span>
                    </span>
                </span>
                <ChevronDown size={16} className={open ? 'shrink-0 transition' : 'shrink-0 -rotate-90 transition'} />
            </button>

            {open ? (
                <div className="space-y-4 p-4">
                    <DossierLocationStats stats={group.stats} compact />

                    <div className="space-y-2">
                        {group.dossiers.map((dossier) => (
                            <div
                                key={dossier.id}
                                className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.7fr)_minmax(220px,0.8fr)_auto]"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <FolderKanban size={15} className="shrink-0 text-[var(--accent)]" />
                                        <p className="truncate text-sm font-semibold">{dossier.projectObject || dossier.dossierNumber}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">{dossier.dossierNumber}</p>
                                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">{dossier.projectAddress || '-'}</p>
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{dossier.ownerName || '-'}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{dossier.clientNumber || '-'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <AppBadge tone="blue">{dossier.documentsCount} docs</AppBadge>
                                    <AppBadge tone="violet">{dossier.financeDocumentsCount} finance</AppBadge>
                                    <span className="truncate text-[var(--text-muted)]">Invoices: {money(dossier.invoicesTotal)}</span>
                                    <span className="truncate text-[var(--text-muted)]">Remaining: {money(dossier.remainingTotal)}</span>
                                </div>

                                <div className="flex items-center gap-2 lg:justify-end">
                                    <AppStatusBadge label={dossier.status} tone={statusTone(dossier.status)} icon={dossier.status === 'active' ? 'check' : 'clock'} />
                                    <AppButton variant="secondary" onPress={() => router.visit(`/dossiers/${dossier.id}`)}>
                                        <Eye size={15} />
                                        Open
                                    </AppButton>
                                    <AppButton variant="ghost" onPress={() => router.visit('/documents')}>
                                        <FileText size={15} />
                                    </AppButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </AppCard>
    );
}
TSX);

backup_file('resources/js/features/dossiers/components/DossierProvinceGroup.tsx');
write_file_text('resources/js/features/dossiers/components/DossierProvinceGroup.tsx', <<<'TSX'
import { ChevronDown, Map } from 'lucide-react';
import { useState } from 'react';
import { AppCard } from '@/components/ui/AppCard';
import type { DossierLocationGroup } from '@/features/dossiers/types';
import { DossierCommuneGroup } from './DossierCommuneGroup';
import { DossierLocationStats } from './DossierLocationStats';

type Props = {
    group: DossierLocationGroup;
};

export function DossierProvinceGroup({ group }: Props) {
    const [open, setOpen] = useState(true);

    return (
        <AppCard className="overflow-hidden p-0">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-[var(--surface-2)]"
            >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                        <Map size={17} />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-base font-semibold">{group.province}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                            {group.communes.length} commune(s) · {group.stats.projectsCount} project(s)
                        </span>
                    </span>
                </span>
                <ChevronDown size={18} className={open ? 'shrink-0 transition' : 'shrink-0 -rotate-90 transition'} />
            </button>

            {open ? (
                <div className="space-y-4 border-t border-[var(--border)] p-4">
                    <DossierLocationStats stats={group.stats} />
                    <div className="space-y-3">
                        {group.communes.map((commune) => (
                            <DossierCommuneGroup key={`${group.province}-${commune.commune}`} group={commune} />
                        ))}
                    </div>
                </div>
            ) : null}
        </AppCard>
    );
}
TSX);

backup_file('resources/js/features/dossiers/components/DossierLocationExplorer.tsx');
write_file_text('resources/js/features/dossiers/components/DossierLocationExplorer.tsx', <<<'TSX'
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import type { DossierLocationGroup } from '@/features/dossiers/types';
import { DossierProvinceGroup } from './DossierProvinceGroup';

type Props = {
    groups: DossierLocationGroup[];
};

export function DossierLocationExplorer({ groups }: Props) {
    if (!groups.length) {
        return (
            <AppEmptyState
                title="No location groups found"
                description="Create projects with province and commune to see the location explorer."
            />
        );
    }

    return (
        <section className="space-y-4">
            {groups.map((group) => (
                <DossierProvinceGroup key={group.province} group={group} />
            ))}
        </section>
    );
}
TSX);

$indexPath = 'resources/js/pages/Dossiers/Index.tsx';
backup_file($indexPath);

$index = read_file_text($indexPath);

if (! str_contains($index, "DossierLocationExplorer")) {
    $index = str_replace(
        "import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';",
        "import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';\nimport { DossierLocationExplorer } from '@/features/dossiers/components/DossierLocationExplorer';",
        $index
    );
}

$index = str_replace(
    "    DossierFormPayload,\n    DossierRow,",
    "    DossierFormPayload,\n    DossierLocationGroup,\n    DossierRow,",
    $index
);

$index = str_replace(
    "    dossiers: DossierRow[];\n    clients: ClientOption[];",
    "    dossiers: DossierRow[];\n    locationGroups: DossierLocationGroup[];\n    clients: ClientOption[];",
    $index
);

$index = str_replace(
    "    dossiers,\n    clients,\n    metrics,",
    "    dossiers,\n    locationGroups,\n    clients,\n    metrics,",
    $index
);

$index = str_replace(
    "    const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(null);",
    "    const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(null);\n    const [viewMode, setViewMode] = useState<'table' | 'location'>('table');",
    $index
);

$old = <<<'TSX'
                <AppDataTable
                    data={filteredDossiers}
                    columns={columns}
                    searchPlaceholder="Search by project, client, dossier number, commune, or status..."
                    emptyTitle="No projects found"
                    emptyDescription="Create the first project from the New Project button."
                    pageSize={8}
                />
TSX;

$new = <<<'TSX'
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold">Project view</p>
                        <p className="text-xs text-[var(--text-muted)]">Switch between the operational table and location grouping.</p>
                    </div>

                    <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={[
                                'rounded-lg px-3 py-2 text-xs font-semibold transition',
                                viewMode === 'table'
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            Table
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('location')}
                            className={[
                                'rounded-lg px-3 py-2 text-xs font-semibold transition',
                                viewMode === 'location'
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            Location
                        </button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <AppDataTable
                        data={filteredDossiers}
                        columns={columns}
                        searchPlaceholder="Search by project, client, dossier number, commune, or status..."
                        emptyTitle="No projects found"
                        emptyDescription="Create the first project from the New Project button."
                        pageSize={8}
                    />
                ) : (
                    <DossierLocationExplorer groups={locationGroups} />
                )}
TSX;

if (! str_contains($index, "setViewMode('location')")) {
    $index = str_replace($old, $new, $index);
}

write_file_text($indexPath, $index);

write_file_text('docs/step-51-d-dossier-location-explorer.md', <<<'MD'
# Step 51-D - Dossier Location Explorer

## Added

- Location grouped view on `/dossiers`.
- Toggle between existing table view and grouped location view.
- Province -> commune -> project rows.
- Group statistics for projects, documents, finance documents, invoices, paid, and remaining totals.
- Quick open action from grouped project rows.

## Backend

Backend read model already existed and passed QA:

- `DossierLocationGroupingService`
- `DossierController@index` passes `locationGroups`
- `archilbo:workflow-grouping-qa`

## Browser Checks

1. Open `/dossiers`.
2. Click `Location`.
3. Expand province and commune groups.
4. Open a dossier from the grouped row.
5. Return to `Table` and confirm existing filters/table still work.
MD);

run_cmd('npm run build');
run_cmd('php artisan optimize:clear');
run_cmd('php artisan archilbo:workflow-grouping-qa');
run_cmd('php artisan archilbo:finance-ui-lock-payload-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');

echo PHP_EOL.'STEP 51-D-B completed.'.PHP_EOL;