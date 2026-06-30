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
    file_put_contents($path, ltrim($content, "\xEF\xBB\xBF"));
    echo "Written: {$relativePath}".PHP_EOL;
}

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step51dc');
        echo "Backup: {$relativePath}.bak-step51dc".PHP_EOL;
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

$path = 'resources/js/pages/Dossiers/Index.tsx';
backup_file($path);

$index = read_file_text($path);

if (! str_contains($index, "DossierLocationExplorer")) {
    $index = str_replace(
        "import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';",
        "import { ProjectDrawer } from '@/features/dossiers/drawers/ProjectDrawer';\nimport { DossierLocationExplorer } from '@/features/dossiers/components/DossierLocationExplorer';",
        $index
    );
}

if (! str_contains($index, 'DossierLocationGroup')) {
    $index = str_replace(
        "DossierFormPayload,\n    DossierRow,",
        "DossierFormPayload,\n    DossierLocationGroup,\n    DossierRow,",
        $index
    );
}

if (! str_contains($index, 'locationGroups: DossierLocationGroup[]')) {
    $index = str_replace(
        "dossiers: DossierRow[];\n    clients: ClientOption[];",
        "dossiers: DossierRow[];\n    locationGroups: DossierLocationGroup[];\n    clients: ClientOption[];",
        $index
    );
}

if (! preg_match('/export default function DossiersIndex\(\{\s*dossiers,\s*locationGroups,/s', $index)) {
    $index = preg_replace(
        '/export default function DossiersIndex\(\{\s*dossiers,\s*clients,/s',
        "export default function DossiersIndex({\n    dossiers,\n    locationGroups,\n    clients,",
        $index,
        1
    );
}

if (! str_contains($index, "const [viewMode, setViewMode]")) {
    $index = str_replace(
        "const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(null);",
        "const [selectedDossier, setSelectedDossier] = useState<DossierRow | null>(null);\n    const [viewMode, setViewMode] = useState<'table' | 'location'>('table');",
        $index
    );
}

$index = preg_replace(
    "/\\{row\\.original\\.floorArea \\? `\\$\\{row\\.original\\.floorArea\\} m.*?` : '-'\\}/",
    "{row.original.floorArea ? `${row.original.floorArea} m2` : '-'}",
    $index,
    1
);

if (! str_contains($index, "setViewMode('location')")) {
    $tablePattern = '/\s*<AppDataTable\s+data=\{filteredDossiers\}\s+columns=\{columns\}\s+searchPlaceholder="Search by project, client, dossier number, commune, or status\.\.\."\s+emptyTitle="No projects found"\s+emptyDescription="Create the first project from the New Project button\."\s+pageSize=\{8\}\s+\/>/s';

    $replacement = <<<'TSX'

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold">Project view</p>
                        <p className="text-xs text-[var(--text-muted)]">Switch between table and location grouping.</p>
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

    $newIndex = preg_replace($tablePattern, $replacement, $index, 1, $count);

    if ($count !== 1) {
        throw new RuntimeException('Could not find AppDataTable block to replace.');
    }

    $index = $newIndex;
}

write_file_text($path, $index);

run_cmd('npm run build');
run_cmd('php artisan optimize:clear');
run_cmd('php artisan archilbo:workflow-grouping-qa');

echo PHP_EOL.'STEP 51-D-C completed.'.PHP_EOL;