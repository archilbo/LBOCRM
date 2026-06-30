<?php

function path_for(string $relativePath): string
{
    return __DIR__.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
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

function read_if_exists(string $relativePath): ?string
{
    $path = path_for($relativePath);

    if (! is_file($path)) {
        return null;
    }

    return file_get_contents($path);
}

function find_files(array $roots, array $needles): array
{
    $found = [];

    foreach ($roots as $root) {
        $dir = path_for($root);

        if (! is_dir($dir)) {
            continue;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $ext = strtolower($file->getExtension());

            if (! in_array($ext, ['ts', 'tsx', 'js', 'jsx', 'php'], true)) {
                continue;
            }

            $relative = str_replace(__DIR__.DIRECTORY_SEPARATOR, '', $file->getPathname());
            $relative = str_replace('\\', '/', $relative);

            $haystack = strtolower($relative.' '.file_get_contents($file->getPathname()));

            foreach ($needles as $needle) {
                if (str_contains($haystack, strtolower($needle))) {
                    $found[$relative] = true;
                    break;
                }
            }
        }
    }

    return array_keys($found);
}

function snippet(string $content, array $needles, int $radius = 8): array
{
    $lines = preg_split('/\R/', $content);
    $out = [];

    foreach ($lines as $i => $line) {
        foreach ($needles as $needle) {
            if ($needle !== '' && stripos($line, $needle) !== false) {
                $start = max(0, $i - $radius);
                $end = min(count($lines) - 1, $i + $radius);

                for ($j = $start; $j <= $end; $j++) {
                    $out[$j] = str_pad((string) ($j + 1), 4, ' ', STR_PAD_LEFT).' | '.$lines[$j];
                }

                break;
            }
        }
    }

    ksort($out);

    return array_values($out);
}

echo "Sidebar route audit started".PHP_EOL;

$routeText = shell_exec('php artisan route:list --columns=Method,URI,Name,Action 2>&1');
write_file_text('docs/sidebar-route-list.txt', (string) $routeText);

$sidebarFiles = find_files(
    [
        'resources/js',
        'routes',
    ],
    [
        'sidebar',
        'navigation',
        'navItems',
        'AppShell',
        'BottomNav',
        'Dashboard',
        'Clients',
        'Projects',
        'Documents',
        'Contracts',
        'Authorizations',
        'Finance',
        'Archives',
        'Users',
        'Branches',
        'Settings',
        'route(',
        'href',
    ]
);

$expectedSections = [
    'dashboard' => ['dashboard', '/dashboard'],
    'clients' => ['clients', '/clients'],
    'projects' => ['projects', '/projects'],
    'documents' => ['documents', '/documents'],
    'contracts' => ['contracts', '/contracts'],
    'authorizations' => ['authorizations', 'authorization', '/authorizations'],
    'finance' => ['finance', '/finance'],
    'archives' => ['archives', '/archives'],
    'users' => ['users', '/users'],
    'branches' => ['branches', '/branches'],
    'settings' => ['settings', '/settings'],
];

$routeLower = strtolower((string) $routeText);

$report = [];
$report[] = '# Sidebar Navigation + Route Audit';
$report[] = '';
$report[] = 'Generated at: '.date('Y-m-d H:i:s');
$report[] = '';
$report[] = '## Route existence check';
$report[] = '';

foreach ($expectedSections as $label => $needles) {
    $exists = false;

    foreach ($needles as $needle) {
        if (str_contains($routeLower, strtolower($needle))) {
            $exists = true;
            break;
        }
    }

    $report[] = '- '.$label.': '.($exists ? 'FOUND' : 'MISSING_OR_NOT_OBVIOUS');
}

$report[] = '';
$report[] = '## Sidebar/navigation candidate files';
$report[] = '';

foreach ($sidebarFiles as $file) {
    $report[] = '- '.$file;
}

$report[] = '';
$report[] = '## Focused snippets';
$report[] = '';

$snippetNeedles = [
    'sidebar',
    'navigation',
    'navItems',
    'items',
    'Dashboard',
    'Clients',
    'Projects',
    'Documents',
    'Contracts',
    'Authorizations',
    'Finance',
    'Archives',
    'Users',
    'Branches',
    'Settings',
    'route(',
    'href',
    'active',
    'isActive',
    'Soon',
];

foreach ($sidebarFiles as $file) {
    $content = read_if_exists($file);

    if ($content === null) {
        continue;
    }

    $snip = snippet($content, $snippetNeedles, 7);

    if ($snip === []) {
        continue;
    }

    $report[] = '### '.$file;
    $report[] = '';
    $report[] = '```tsx';

    foreach ($snip as $line) {
        $report[] = $line;
    }

    $report[] = '```';
    $report[] = '';
}

$report[] = '## Full route list saved separately';
$report[] = '';
$report[] = 'See: docs/sidebar-route-list.txt';
$report[] = '';

write_file_text('docs/sidebar-navigation-route-audit.md', implode(PHP_EOL, $report).PHP_EOL);

echo PHP_EOL."Candidate files:".PHP_EOL;

foreach ($sidebarFiles as $file) {
    echo "- {$file}".PHP_EOL;
}

echo PHP_EOL."Reports written:".PHP_EOL;
echo "- docs/sidebar-navigation-route-audit.md".PHP_EOL;
echo "- docs/sidebar-route-list.txt".PHP_EOL;
echo PHP_EOL."STEP 50-A completed.".PHP_EOL;