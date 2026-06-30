<?php

function path_for(string $relativePath): string
{
    return __DIR__.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
}

function exists_file(string $relativePath): bool
{
    return is_file(path_for($relativePath));
}

function exists_dir(string $relativePath): bool
{
    return is_dir(path_for($relativePath));
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
        copy($path, $path.'.bak-step49c');
        echo "Backup: {$relativePath}.bak-step49c".PHP_EOL;
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

function add_helper_to_tsx(string $content): string
{
    if (str_contains($content, 'FinanceDocumentLockedInlineBadge')) {
        return $content;
    }

    $helper = <<<'TSX'

type UiLockAwareFinanceDocument = {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: {
        isLocked?: boolean;
        lockedAtFormatted?: string | null;
        message?: string;
        canEditNumberFields?: boolean;
        canRegenerateExports?: boolean;
        canGeneratePdf?: boolean;
        canGenerateExcel?: boolean;
    } | null;
};

function isFinanceDocumentLocked(document: UiLockAwareFinanceDocument | null | undefined) {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

function canEditFinanceDocumentNumberFields(document: UiLockAwareFinanceDocument | null | undefined) {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

function FinanceDocumentLockedInlineBadge({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
    );
}

function FinanceDocumentLockInlineNotice({ document }: { document: UiLockAwareFinanceDocument | null | undefined }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;
    const message = document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    return (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            <div className="font-semibold text-amber-200">Locked document</div>
            <div className="mt-1 text-amber-100/80">{message}</div>
            {lockedAt ? <div className="mt-1 text-xs text-amber-100/60">Locked at {lockedAt}</div> : null}
        </div>
    );
}

TSX;

    $lines = preg_split('/\R/', $content);
    $lastImportIndex = -1;

    foreach ($lines as $index => $line) {
        if (preg_match('/^\s*import\s+/', $line)) {
            $lastImportIndex = $index;
        }
    }

    if ($lastImportIndex >= 0) {
        array_splice($lines, $lastImportIndex + 1, 0, [$helper]);

        return implode(PHP_EOL, $lines);
    }

    return $helper.PHP_EOL.$content;
}

function patch_number_badges(string $path): bool
{
    if (! exists_file($path)) {
        return false;
    }

    backup_file($path);

    $content = read_file_text($path);
    $original = $content;

    $content = add_helper_to_tsx($content);

    foreach (['document', 'financeDocument', 'invoice', 'quote', 'receipt'] as $var) {
        $needle = '{'.$var.'.number}';

        if (str_contains($content, $needle) && ! str_contains($content, 'FinanceDocumentLockedInlineBadge document={'.$var.'}')) {
            $replacement = '<span className="inline-flex items-center gap-1"><span>{'.$var.'.number}</span><FinanceDocumentLockedInlineBadge document={'.$var.'} /></span>';
            $content = str_replace($needle, $replacement, $content);
        }
    }

    if ($content !== $original) {
        write_file_text($path, $content);
        return true;
    }

    echo "No badge patch needed: {$path}".PHP_EOL;
    return false;
}

function detect_document_variable(string $content): ?string
{
    $candidates = [
        'financeDocument',
        'selectedDocument',
        'editingDocument',
        'currentDocument',
        'initialDocument',
        'document',
        'invoice',
        'quote',
    ];

    foreach ($candidates as $candidate) {
        if (
            preg_match('/\b'.$candidate.'\s*[:=]/', $content)
            || preg_match('/\b'.$candidate.'\?\s*:/', $content)
            || preg_match('/\b'.$candidate.'\s*,/', $content)
        ) {
            return $candidate;
        }
    }

    return null;
}

function patch_locked_form_fields(string $path): bool
{
    if (! exists_file($path)) {
        return false;
    }

    backup_file($path);

    $content = read_file_text($path);
    $original = $content;

    $documentVariable = detect_document_variable($content);

    if (! $documentVariable) {
        echo "No document variable detected for form patch: {$path}".PHP_EOL;
        return false;
    }

    $content = add_helper_to_tsx($content);

    $content = preg_replace_callback(
        '/<(?P<tag>[A-Za-z][A-Za-z0-9_.]*)(?P<attrs>[^>]*\bname=(["\'])(number|type|issueDate|issue_date)\3[^>]*)(?P<close>\/?)>/',
        function (array $matches) use ($documentVariable): string {
            $full = $matches[0];

            if (
                str_contains($full, 'disabled=')
                || str_contains($full, 'isDisabled=')
                || str_contains($full, 'readOnly=')
            ) {
                return $full;
            }

            $tag = $matches['tag'];
            $attrs = $matches['attrs'];
            $close = $matches['close'];

            $lockExpression = 'isFinanceDocumentLocked('.$documentVariable.')';

            if (ctype_lower(substr($tag, 0, 1))) {
                return '<'.$tag.$attrs.' disabled={'.$lockExpression.'} readOnly={'.$lockExpression.'}'.$close.'>';
            }

            return '<'.$tag.$attrs.' isDisabled={'.$lockExpression.'}'.$close.'>';
        },
        $content
    );

    if (
        str_contains($content, 'isFinanceDocumentLocked('.$documentVariable.')')
        && ! str_contains($content, '<FinanceDocumentLockInlineNotice document={'.$documentVariable.'}')
    ) {
        $content = preg_replace(
            '/(\breturn\s*\(\s*(?:<[^>]+>\s*)?)/',
            "$1\n            <FinanceDocumentLockInlineNotice document={".$documentVariable."} />\n",
            $content,
            1
        );
    }

    if ($content !== $original) {
        write_file_text($path, $content);
        return true;
    }

    echo "No form patch needed: {$path}".PHP_EOL;
    return false;
}

function patch_types_file(string $path): bool
{
    if (! exists_file($path)) {
        return false;
    }

    backup_file($path);

    $content = read_file_text($path);
    $original = $content;

    if (! str_contains($content, 'FinanceDocumentLockState')) {
        $lockType = <<<'TS'

export type FinanceDocumentLockState = {
    isLocked: boolean;
    lockedAt: string | null;
    lockedAtFormatted: string | null;
    message: string;
    blockedFields: string[];
    canEditNumberFields: boolean;
    canRegenerateExports: boolean;
    canGeneratePdf: boolean;
    canGenerateExcel: boolean;
};

TS;

        $content = $lockType.$content;
    }

    if (! str_contains($content, 'numberLocked?: boolean')) {
        $content = preg_replace(
            '/(\bnumber\s*:\s*[^;\n]+[;\n])/',
            "$1    numberLocked?: boolean;\n    numberLockedAt?: string | null;\n    lock?: FinanceDocumentLockState;\n",
            $content,
            1,
            $count
        );

        if ($count !== 1) {
            echo "Could not inject lock fields automatically in {$path}; leaving type file otherwise unchanged.".PHP_EOL;
        }
    }

    if ($content !== $original) {
        write_file_text($path, $content);
        return true;
    }

    echo "Types already lock-aware: {$path}".PHP_EOL;
    return false;
}

echo "STEP 49-C runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Create/update reusable lock notice component.
# ---------------------------------------------------------------------

$noticeComponent = <<<'TSX'
import type { ReactNode } from 'react';
import type { FinanceDocument } from '../types';

type LockableFinanceDocument = Pick<FinanceDocument, 'numberLocked' | 'numberLockedAt' | 'lock'>;

type Props = {
    document?: LockableFinanceDocument | null;
    isLocked?: boolean;
    lockedAt?: string | null;
    lockedAtFormatted?: string | null;
    message?: ReactNode;
    compact?: boolean;
    className?: string;
};

export function isFinanceDocumentLocked(document?: LockableFinanceDocument | null): boolean {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

export function canEditFinanceDocumentNumberFields(document?: LockableFinanceDocument | null): boolean {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

export function FinanceDocumentLockBadge({ document }: { document?: LockableFinanceDocument | null }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? null;

    return (
        <span
            className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
    );
}

export default function FinanceDocumentLockNotice({
    document,
    isLocked,
    lockedAt,
    lockedAtFormatted,
    message,
    compact = false,
    className = '',
}: Props) {
    const locked = isLocked ?? isFinanceDocumentLocked(document);

    if (!locked) {
        return null;
    }

    const displayLockedAt = lockedAtFormatted ?? document?.lock?.lockedAtFormatted ?? lockedAt ?? document?.numberLockedAt ?? null;
    const displayMessage = message ?? document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200 ${className}`}>
                Locked
                {displayLockedAt ? <span className="font-normal text-amber-100/60">{displayLockedAt}</span> : null}
            </span>
        );
    }

    return (
        <div className={`rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                    Locked
                </span>
                {displayLockedAt ? <span className="text-xs text-amber-100/60">Locked at {displayLockedAt}</span> : null}
            </div>
            <p className="mt-2 text-amber-100/80">{displayMessage}</p>
        </div>
    );
}
TSX;

$componentDirs = [
    'resources/js/features/finance/components',
    'resources/js/Features/Finance/components',
];

foreach ($componentDirs as $dir) {
    if (exists_dir($dir)) {
        $componentPath = $dir.'/FinanceDocumentLockNotice.tsx';
        backup_file($componentPath);
        write_file_text($componentPath, $noticeComponent);
    }
}

# ---------------------------------------------------------------------
# 2) Patch TypeScript finance types.
# ---------------------------------------------------------------------

foreach ([
    'resources/js/features/finance/types.ts',
    'resources/js/Features/Finance/types.ts',
] as $typesPath) {
    patch_types_file($typesPath);
}

# ---------------------------------------------------------------------
# 3) Patch list/show/preview pages with Locked badge beside document numbers.
# ---------------------------------------------------------------------

foreach ([
    'resources/js/pages/Finance/Index.tsx',
    'resources/js/Pages/Finance/Index.tsx',
    'resources/js/pages/Finance/Documents/Index.tsx',
    'resources/js/Pages/Finance/Documents/Index.tsx',
    'resources/js/pages/Finance/Documents/Show.tsx',
    'resources/js/Pages/Finance/Documents/Show.tsx',
    'resources/js/features/finance/components/FinanceDocumentPreview.tsx',
    'resources/js/Features/Finance/components/FinanceDocumentPreview.tsx',
] as $path) {
    patch_number_badges($path);
}

# ---------------------------------------------------------------------
# 4) Patch document drawers/forms to disable number-critical fields.
# ---------------------------------------------------------------------

foreach ([
    'resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx',
    'resources/js/Features/Finance/drawers/FinanceDocumentBuilderDrawer.tsx',
    'resources/js/features/finance/drawers/FinanceDocumentDrawer.tsx',
    'resources/js/Features/Finance/drawers/FinanceDocumentDrawer.tsx',
    'resources/js/features/finance/components/FinanceDateFields.tsx',
    'resources/js/Features/Finance/components/FinanceDateFields.tsx',
] as $path) {
    patch_locked_form_fields($path);
}

# ---------------------------------------------------------------------
# 5) Write implementation report.
# ---------------------------------------------------------------------

write_file_text('docs/finance-ui-lock-awareness-implementation.md', <<<'MD'
# Finance UI Lock Awareness Implementation

Implemented UI support for locked finance documents.

## Added / updated

- FinanceDocumentLockNotice reusable component.
- FinanceDocumentLockBadge reusable component.
- FinanceDocument type lock payload fields.
- Locked badge beside finance document numbers where safely detected.
- Disabled number-critical form fields where safely detected.

## Backend payload used

- document.numberLocked
- document.numberLockedAt
- document.lock.isLocked
- document.lock.lockedAtFormatted
- document.lock.message
- document.lock.canEditNumberFields
- document.lock.canRegenerateExports
- document.lock.canGeneratePdf
- document.lock.canGenerateExcel

## Expected behavior

Locked documents show a Locked badge and warning.
Number-critical fields are disabled when locked.
PDF and Excel regeneration remain active.
MD);

# ---------------------------------------------------------------------
# 6) QA.
# ---------------------------------------------------------------------

run_cmd('php artisan optimize:clear');

run_cmd('php artisan archilbo:finance-ui-lock-payload-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');

if (is_file(path_for('package.json'))) {
    $package = json_decode(file_get_contents(path_for('package.json')), true);
    $scripts = is_array($package['scripts'] ?? null) ? $package['scripts'] : [];

    if (array_key_exists('build', $scripts)) {
        run_cmd('npm run build');
    } else {
        echo PHP_EOL.'No npm build script found.'.PHP_EOL;
    }
}

echo PHP_EOL.'STEP 49-C completed.'.PHP_EOL;