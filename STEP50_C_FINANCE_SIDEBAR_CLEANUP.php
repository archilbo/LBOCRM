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
        copy($path, $path.'.bak-step50c');
        echo "Backup: {$relativePath}.bak-step50c".PHP_EOL;
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

echo "STEP 50-C runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) AppSidebar: do not highlight expandable parent as active.
# ---------------------------------------------------------------------

$sidebarPath = 'resources/js/components/layout/AppSidebar.tsx';

backup_file($sidebarPath);

$sidebar = read_file_text($sidebarPath);

$sidebar = str_replace(
    "        const active = isItemActive;",
    "        const active = hasChildren ? false : isItemActive;",
    $sidebar
);

write_file_text($sidebarPath, $sidebar);

# ---------------------------------------------------------------------
# 2) navigation.ts: keep parent label Finance, child label Overview.
# ---------------------------------------------------------------------

$navigationPath = 'resources/js/components/layout/navigation.ts';

backup_file($navigationPath);

$navigation = read_file_text($navigationPath);

$navigation = str_replace(
    "        routeByKey('finance'),",
    "        { ...routeByKey('finance'), labelKey: 'nav.financeOverview' },",
    $navigation
);

write_file_text($navigationPath, $navigation);

# ---------------------------------------------------------------------
# 3) Add financeOverview translation key if missing.
# ---------------------------------------------------------------------

foreach (['resources/js/locales/en.ts', 'resources/js/locales/fr.ts'] as $localePath) {
    if (! is_file(path_for($localePath))) {
        continue;
    }

    backup_file($localePath);

    $locale = read_file_text($localePath);

    if (str_contains($locale, 'financeOverview')) {
        echo "Locale already has financeOverview: {$localePath}".PHP_EOL;
        continue;
    }

    $isFrench = str_contains($localePath, '/fr.ts');
    $label = $isFrench ? 'Vue generale' : 'Overview';

    $locale = preg_replace(
        '/(\s*finance\s*:\s*[\'"][^\'"]+[\'"],\s*)/',
        "$1\n        financeOverview: '{$label}',\n",
        $locale,
        1,
        $count
    );

    if ($count === 1) {
        write_file_text($localePath, $locale);
    } else {
        echo "Could not auto-add financeOverview in {$localePath}; skipping.".PHP_EOL;
    }
}

# ---------------------------------------------------------------------
# 4) Finance overview: remove injected local inline badge when existing badge already exists.
#    This fixes double LOCKED badges in Dernieres factures.
# ---------------------------------------------------------------------

$financeIndexPath = 'resources/js/pages/Finance/Index.tsx';

if (is_file(path_for($financeIndexPath))) {
    backup_file($financeIndexPath);

    $financeIndex = read_file_text($financeIndexPath);

    foreach (['invoice', 'quote', 'receipt', 'document', 'financeDocument'] as $var) {
        $financeIndex = str_replace(
            '<span className="inline-flex items-center gap-1"><span>{'.$var.'.number}</span><FinanceDocumentLockedInlineBadge document={'.$var.'} /></span>',
            '{'.$var.'.number}',
            $financeIndex
        );

        $financeIndex = str_replace(
            '<FinanceDocumentLockedInlineBadge document={'.$var.'} />',
            '',
            $financeIndex
        );
    }

    write_file_text($financeIndexPath, $financeIndex);
}

# ---------------------------------------------------------------------
# 5) Report.
# ---------------------------------------------------------------------

write_file_text('docs/sidebar-finance-navigation-step50c.md', <<<'MD'
# Step 50-C Sidebar Finance Navigation Cleanup

## Fixed

- Expandable Finance parent is no longer highlighted as the active page.
- Finance submenu first child now uses the label "Overview" / "Vue generale".
- Removed duplicate inline Locked badge from finance overview where another lock badge already exists.

## Expected sidebar

Management:
- Finance
  - Overview
  - Finance docs
  - Payments
  - Templates
  - Finance settings
- Archives

Only the selected child should be highlighted.
MD);

# ---------------------------------------------------------------------
# 6) Build + QA.
# ---------------------------------------------------------------------

run_cmd('npm run build');

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-ui-lock-payload-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');

echo PHP_EOL.'STEP 50-C completed.'.PHP_EOL;