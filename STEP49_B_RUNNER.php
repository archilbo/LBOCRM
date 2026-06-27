<?php

$root = __DIR__;

function write_file(string $relative, string $content): void
{
    global $root;
    file_put_contents($root.DIRECTORY_SEPARATOR.$relative, $content);
}

function read_file(string $relative): string
{
    global $root;
    return file_get_contents($root.DIRECTORY_SEPARATOR.$relative);
}

function replace_once(string $content, string $search, string $replace, string $label): string
{
    $pos = strpos($content, $search);
    if ($pos === false) {
        throw new RuntimeException("Missing patch target: {$label}");
    }

    return substr($content, 0, $pos).$replace.substr($content, $pos + strlen($search));
}

// 1. TypeScript lock payload.
$typesPath = 'resources/js/features/finance/types.ts';
$types = read_file($typesPath);
if (! str_contains($types, 'export type FinanceDocumentLock')) {
    $types = replace_once($types, "export type FinanceDocumentItem = {", "export type FinanceDocumentLock = {\n    isLocked: boolean;\n    lockedAt: string | null;\n    lockedAtFormatted: string | null;\n    message: string;\n    blockedFields: string[];\n    canEditNumberFields: boolean;\n    canRegenerateExports: boolean;\n    canGeneratePdf: boolean;\n    canGenerateExcel: boolean;\n};\n\nexport type FinanceDocumentItem = {", 'insert FinanceDocumentLock type');
}
if (! str_contains($types, 'numberLocked?: boolean;')) {
    $types = replace_once($types, "    number: string;\n    status: FinanceDocumentStatus;", "    number: string;\n    numberLocked?: boolean;\n    numberLockedAt?: string | null;\n    lock?: FinanceDocumentLock | null;\n    status: FinanceDocumentStatus;", 'insert FinanceDocument lock fields');
}
if (! str_contains($types, 'revealFilesUrl?: string | null;')) {
    $types = replace_once($types, "    pdfDownloadUrl?: string | null;\n    paymentUrl?: string | null;", "    pdfDownloadUrl?: string | null;\n    revealFilesUrl?: string | null;\n    paymentUrl?: string | null;", 'insert revealFilesUrl type');
}
write_file($typesPath, $types);

// 2. Reusable lock UI.
write_file('resources/js/features/finance/components/FinanceDocumentLockNotice.tsx', <<<'TSX'
import { Lock } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';
import type { FinanceDocument } from '@/features/finance/types';

const defaultLockMessage = 'Document locked after export. Number, type, and issue date cannot be changed.';

type LockableDocument = Pick<FinanceDocument, 'numberLocked' | 'numberLockedAt' | 'lock'>;

export function isFinanceDocumentLocked(document?: LockableDocument | null): boolean {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked ?? false);
}

export function getFinanceDocumentLockMessage(document?: LockableDocument | null): string {
    return document?.lock?.message || defaultLockMessage;
}

export function getFinanceDocumentLockedAt(document?: LockableDocument | null): string | null {
    return document?.lock?.lockedAtFormatted || document?.numberLockedAt || null;
}

export function FinanceDocumentLockBadge({ document, compact = false }: { document?: LockableDocument | null; compact?: boolean }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    return (
        <AppBadge tone="amber" className={compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}>
            <Lock size={compact ? 11 : 13} />
            Locked
        </AppBadge>
    );
}

export function FinanceDocumentLockNotice({ document, compact = false }: { document?: LockableDocument | null; compact?: boolean }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <div className={`rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}>
            <div className="flex items-start gap-2">
                <Lock size={compact ? 14 : 16} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold">Document locked after export</p>
                    <p className="mt-1">{getFinanceDocumentLockMessage(document)}</p>
                    {lockedAt ? <p className="mt-1 text-xs opacity-80">Locked at: {lockedAt}</p> : null}
                </div>
            </div>
        </div>
    );
}
TSX);

// 3. Date fields can disable issue date only.
write_file('resources/js/features/finance/components/FinanceDateFields.tsx', <<<'TSX'
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import type { FinanceDocumentType } from '@/features/finance/types';

type FinanceDateFieldsProps = {
    type: FinanceDocumentType;
    issueDate: string;
    dueDate: string;
    validUntil: string;
    onChange: (field: 'issueDate' | 'dueDate' | 'validUntil', value: string) => void;
    isIssueDateDisabled?: boolean;
    issueDateDescription?: string;
};

export function FinanceDateFields({ type, issueDate, dueDate, validUntil, onChange, isIssueDateDisabled = false, issueDateDescription }: FinanceDateFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <AppDatePicker
                label="Date emission"
                value={issueDate}
                isDisabled={isIssueDateDisabled}
                description={issueDateDescription}
                onChange={(value) => onChange('issueDate', value)}
            />
            {type === 'invoice' ? (
                <AppDatePicker
                    label="Date echeance"
                    value={dueDate}
                    onChange={(value) => onChange('dueDate', value)}
                />
            ) : null}
            {type === 'quote' ? (
                <AppDatePicker
                    label="Validite devis"
                    value={validUntil}
                    onChange={(value) => onChange('validUntil', value)}
                />
            ) : null}
        </div>
    );
}
TSX);

// 4. Builder drawer lock awareness.
$builderPath = 'resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx';
$builder = read_file($builderPath);
if (! str_contains($builder, 'FinanceDocumentLockNotice')) {
    $builder = replace_once($builder, "import { FinanceDocumentPreview } from '@/features/finance/components/FinanceDocumentPreview';", "import { FinanceDocumentLockNotice, getFinanceDocumentLockMessage, isFinanceDocumentLocked } from '@/features/finance/components/FinanceDocumentLockNotice';\nimport { FinanceDocumentPreview } from '@/features/finance/components/FinanceDocumentPreview';", 'builder import lock notice');
}
if (! str_contains($builder, 'const isLocked = isFinanceDocumentLocked(document);')) {
    $builder = replace_once($builder, "    const [form, setForm] = useState<BuilderForm>(() => createForm(type, settings, document));", "    const [form, setForm] = useState<BuilderForm>(() => createForm(type, settings, document));\n    const isLocked = isFinanceDocumentLocked(document);\n    const canEditNumberFields = !isLocked && (document?.lock?.canEditNumberFields ?? true);\n    const lockMessage = isLocked ? getFinanceDocumentLockMessage(document) : undefined;", 'builder lock constants');
}
$builder = replace_once($builder, "        const payload = {", "        const payload: Record<string, unknown> = {", 'builder payload type');
if (! str_contains($builder, 'delete payload.issue_date;')) {
    $builder = replace_once($builder, "        const options = {", "        if (mode === 'edit' && isLocked) {\n            delete payload.type;\n            delete payload.issue_date;\n        }\n\n        const options = {", 'builder omit locked critical fields');
}
if (! str_contains($builder, '<FinanceDocumentLockNotice document={document} compact />')) {
    $builder = replace_once($builder, "                <div className=\"min-w-0 space-y-5\">", "                <div className=\"min-w-0 space-y-5\">\n                    <FinanceDocumentLockNotice document={document} compact />", 'builder lock notice render');
}
$builder = replace_once($builder, "                            selectedKey={form.type}\n                            onSelectionChange={(key) => update('type', String(key || 'quote') as FinanceDocumentType)}", "                            selectedKey={form.type}\n                            isDisabled={!canEditNumberFields}\n                            description={!canEditNumberFields ? lockMessage : undefined}\n                            onSelectionChange={(key) => update('type', String(key || 'quote') as FinanceDocumentType)}", 'builder disable type select');
$builder = replace_once($builder, "                        onChange={(field, value) => update(field, value)}\n                    />", "                        isIssueDateDisabled={!canEditNumberFields}\n                        issueDateDescription={!canEditNumberFields ? lockMessage : undefined}\n                        onChange={(field, value) => update(field, value)}\n                    />", 'builder disable issue date');
write_file($builderPath, $builder);

// 5. Actions keep regenerate buttons active.
$actionsPath = 'resources/js/features/finance/components/FinanceDocumentActions.tsx';
$actions = read_file($actionsPath);
$oldActions = <<<'TSX'
            {document.hasPdf || document.pdfDownloadUrl ? (
                <AppTableActionButton label="Telecharger PDF" tone="documents" onPress={() => downloadFile(document.pdfDownloadUrl)}>
                    <FileDown size={15} />
                </AppTableActionButton>
            ) : (
                <AppTableActionButton label="Generer PDF" tone="documents" onPress={() => generateFile(document.generatePdfUrl, 'Generation PDF')}>
                    <FileText size={15} />
                </AppTableActionButton>
            )}
            {document.hasExcel || document.excelDownloadUrl || document.downloadUrl ? (
                <AppTableActionButton label="Telecharger Excel" tone="archive" onPress={() => downloadFile(document.excelDownloadUrl || document.downloadUrl)}>
                    <FileSpreadsheet size={15} />
                </AppTableActionButton>
            ) : (
                <AppTableActionButton label="Generer Excel" tone="archive" onPress={() => generateFile(document.generateExcelUrl, 'Generation Excel')}>
                    <FileSpreadsheet size={15} />
                </AppTableActionButton>
            )}
TSX;
$newActions = <<<'TSX'
            {document.pdfDownloadUrl ? (
                <AppTableActionButton label="Telecharger PDF" tone="documents" onPress={() => downloadFile(document.pdfDownloadUrl)}>
                    <FileDown size={15} />
                </AppTableActionButton>
            ) : null}
            <AppTableActionButton label={document.hasPdf ? 'Regenerer PDF' : 'Generer PDF'} tone="documents" onPress={() => generateFile(document.generatePdfUrl, 'Generation PDF')}>
                <FileText size={15} />
            </AppTableActionButton>
            {document.excelDownloadUrl || document.downloadUrl ? (
                <AppTableActionButton label="Telecharger Excel" tone="archive" onPress={() => downloadFile(document.excelDownloadUrl || document.downloadUrl)}>
                    <FileSpreadsheet size={15} />
                </AppTableActionButton>
            ) : null}
            <AppTableActionButton label={document.hasExcel ? 'Regenerer Excel' : 'Generer Excel'} tone="archive" onPress={() => generateFile(document.generateExcelUrl, 'Generation Excel')}>
                <FileSpreadsheet size={15} />
            </AppTableActionButton>
TSX;
$actions = replace_once($actions, $oldActions, $newActions, 'actions pdf/excel block');
write_file($actionsPath, $actions);

// 6. Documents index badges.
$indexPath = 'resources/js/pages/Finance/Documents/Index.tsx';
$index = read_file($indexPath);
if (! str_contains($index, 'FinanceDocumentLockBadge')) {
    $index = replace_once($index, "import { FinanceMoneyCell } from '@/features/finance/components/FinanceMoneyCell';", "import { FinanceDocumentLockBadge, getFinanceDocumentLockedAt } from '@/features/finance/components/FinanceDocumentLockNotice';\nimport { FinanceMoneyCell } from '@/features/finance/components/FinanceMoneyCell';", 'index import lock badge');
}
$oldDocumentColumn = <<<'TSX'
        cell: ({ row }) => (
            <div>
                <p className="font-semibold">{row.original.number}</p>
                <p className="text-xs text-[var(--text-muted)]">{row.original.typeLabel}</p>
            </div>
        ),
TSX;
$newDocumentColumn = <<<'TSX'
        cell: ({ row }) => {
            const lockedAt = getFinanceDocumentLockedAt(row.original);

            return (
                <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-semibold">{row.original.number}</p>
                        <FinanceDocumentLockBadge document={row.original} compact />
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{row.original.typeLabel}</p>
                    {lockedAt ? <p className="text-[10px] text-[var(--text-muted)]">Locked: {lockedAt}</p> : null}
                </div>
            );
        },
TSX;
$index = replace_once($index, $oldDocumentColumn, $newDocumentColumn, 'index document column lock badge');
$oldRecent = <<<'TSX'
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{document.number}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{document.client?.name || '-'}</p>
                        </div>
TSX;
$newRecent = <<<'TSX'
                        <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                <p className="truncate text-sm font-semibold">{document.number}</p>
                                <FinanceDocumentLockBadge document={document} compact />
                            </div>
                            <p className="truncate text-xs text-[var(--text-muted)]">{document.client?.name || '-'}</p>
                        </div>
TSX;
$index = replace_once($index, $oldRecent, $newRecent, 'index recent document lock badge');
write_file($indexPath, $index);

// 7. Show page lock notice and regenerate buttons.
$showPath = 'resources/js/pages/Finance/Documents/Show.tsx';
$show = read_file($showPath);
if (! str_contains($show, 'FinanceDocumentLockNotice')) {
    $show = replace_once($show, "import { FinanceMoneyCell } from '@/features/finance/components/FinanceMoneyCell';", "import { FinanceDocumentLockBadge, FinanceDocumentLockNotice } from '@/features/finance/components/FinanceDocumentLockNotice';\nimport { FinanceMoneyCell } from '@/features/finance/components/FinanceMoneyCell';", 'show import lock components');
}
$oldShowButtons = <<<'TSX'
                        {document.pdfDownloadUrl ? (
                            <AppButton variant="secondary" onPress={() => downloadFile(document.pdfDownloadUrl)}>
                                <Download size={16} />
                                PDF
                            </AppButton>
                        ) : (
                            <AppButton variant="secondary" onPress={() => generateFile(document.generatePdfUrl, 'Generation PDF')}>
                                <FileText size={16} />
                                Generer PDF
                            </AppButton>
                        )}
                        {document.excelDownloadUrl || document.downloadUrl ? (
                            <AppButton variant="secondary" onPress={() => downloadFile(document.excelDownloadUrl || document.downloadUrl)}>
                                <FileSpreadsheet size={16} />
                                Excel
                            </AppButton>
                        ) : (
                            <AppButton variant="secondary" onPress={() => generateFile(document.generateExcelUrl, 'Generation Excel')}>
                                <FileSpreadsheet size={16} />
                                Generer Excel
                            </AppButton>
                        )}
TSX;
$newShowButtons = <<<'TSX'
                        {document.pdfDownloadUrl ? (
                            <AppButton variant="secondary" onPress={() => downloadFile(document.pdfDownloadUrl)}>
                                <Download size={16} />
                                PDF
                            </AppButton>
                        ) : null}
                        <AppButton variant="secondary" onPress={() => generateFile(document.generatePdfUrl, 'Generation PDF')}>
                            <FileText size={16} />
                            {document.hasPdf ? 'Regenerer PDF' : 'Generer PDF'}
                        </AppButton>
                        {document.excelDownloadUrl || document.downloadUrl ? (
                            <AppButton variant="secondary" onPress={() => downloadFile(document.excelDownloadUrl || document.downloadUrl)}>
                                <FileSpreadsheet size={16} />
                                Excel
                            </AppButton>
                        ) : null}
                        <AppButton variant="secondary" onPress={() => generateFile(document.generateExcelUrl, 'Generation Excel')}>
                            <FileSpreadsheet size={16} />
                            {document.hasExcel ? 'Regenerer Excel' : 'Generer Excel'}
                        </AppButton>
TSX;
$show = replace_once($show, $oldShowButtons, $newShowButtons, 'show pdf/excel buttons');
$oldShowHeader = <<<'TSX'
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{document.typeLabel}</p>
                                <h2 className="mt-2 text-2xl font-semibold">{document.number}</h2>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">Date: {document.issueDate || '-'}</p>
                            </div>
                            <FinanceStatusBadge status={document.status} />
TSX;
$newShowHeader = <<<'TSX'
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{document.typeLabel}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <h2 className="text-2xl font-semibold">{document.number}</h2>
                                    <FinanceDocumentLockBadge document={document} />
                                </div>
                                <p className="mt-1 text-sm text-[var(--text-muted)]">Date: {document.issueDate || '-'}</p>
                            </div>
                            <FinanceStatusBadge status={document.status} />
TSX;
$show = replace_once($show, $oldShowHeader, $newShowHeader, 'show header lock badge');
if (! str_contains($show, '<FinanceDocumentLockNotice document={document}')) {
    $show = replace_once($show, "\n\n                        <div className=\"mt-6 grid gap-4 sm:grid-cols-2\">", "\n\n                        <div className=\"mt-4\">\n                            <FinanceDocumentLockNotice document={document} />\n                        </div>\n\n                        <div className=\"mt-6 grid gap-4 sm:grid-cols-2\">", 'show lock notice');
}
write_file($showPath, $show);

// 8. AI report.
$reportPath = 'docs/AI_WORK_REPORT.md';
$report = read_file($reportPath);
$report .= <<<'MD'
---

# AI Work Report

## Date

2026-06-27

## Step Completed

Step 49-B - Finance document UI lock awareness

## What Was Built

Updated the finance document UI so locked exported documents clearly show lock state and prevent number-critical edit attempts.

## Files Created

- `resources/js/features/finance/components/FinanceDocumentLockNotice.tsx`

## Files Modified

- `resources/js/features/finance/types.ts`
- `resources/js/features/finance/components/FinanceDateFields.tsx`
- `resources/js/features/finance/components/FinanceDocumentActions.tsx`
- `resources/js/features/finance/drawers/FinanceDocumentBuilderDrawer.tsx`
- `resources/js/pages/Finance/Documents/Index.tsx`
- `resources/js/pages/Finance/Documents/Show.tsx`
- `docs/AI_WORK_REPORT.md`

## UI Behavior Added

- Locked documents show a Locked badge in lists, recent cards, show page, and edit drawer.
- Locked documents show the backend lock message and locked timestamp where available.
- The edit drawer disables Type and Date emission for locked documents.
- The edit drawer omits `type` and `issue_date` from locked edit submissions.
- PDF/Excel generate and regenerate actions remain active.
- PDF/Excel download actions remain active.
- Notes, terms, payments, and other safe fields remain editable where the existing UI allows them.

## Commands Run

```powershell
php artisan optimize:clear
php artisan archilbo:finance-numbering-qa
php artisan archilbo:finance-export-numbering-qa
php artisan archilbo:finance-real-export-numbering-integration-qa
php artisan archilbo:finance-export-qa
php artisan archilbo:finance-document-lock-guard-qa
```

## Build/Test Result

Initial backend QA passed before UI patch. Final frontend/backend QA is listed in the current assistant response.

## Next Recommended Step

Open `/finance`, edit a locked invoice, confirm Type and Date emission are disabled, then regenerate/download PDF and Excel.
MD;
write_file($reportPath, $report);

echo "STEP49_B_RUNNER completed.\n";