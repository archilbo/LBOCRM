import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { fileTypeLabelKey, formatDocumentDate, formatDocumentVersion, formatFileSize } from './documentExplorerFormatters';
import { DocumentActionsMenu } from './DocumentActionsMenu';
import { DocumentStatusChip } from './DocumentCard';
import { DocumentThumbnail } from './DocumentThumbnail';
import type { DocumentExplorerItem, ExplorerDocument } from './documentExplorerTypes';

type DocumentListRowProps = {
    item: DocumentExplorerItem;
    projectLabel: string;
    onOpen: (document: DocumentExplorerItem) => void;
    onPrint: (document: ExplorerDocument) => void;
    onDownload: (document: ExplorerDocument) => void;
    onReplace: (document: ExplorerDocument) => void;
    onDelete: (document: ExplorerDocument) => void;
};

/**
 * Compact list row. Desktop columns: thumbnail + name | project | type | size
 * | status | date | actions; tablet hides project; mobile keeps only
 * thumbnail + name (+type·size) + status + More. The primary trigger covers
 * thumbnail and name only; all other controls are siblings (no nested
 * buttons, no duplicate preview controls in the Tab sequence).
 */
export function DocumentListRow({
    item,
    projectLabel,
    onOpen,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
}: DocumentListRowProps) {
    const { t, locale } = useTranslation();

    const canOpen = item.capabilities.canView;
    const typeKey = fileTypeLabelKey(item.previewKind, item.extension);
    const sizeText = formatFileSize(null, item.sizeLabel) ?? t('documentsExplorer.metadata.unknownSize');
    const dateText = formatDocumentDate(item.uploadedAt, locale) ?? t('documentsExplorer.metadata.unknownDate');
    const versionText = formatDocumentVersion(item.version);
    const openLabel = t('documentsExplorer.actions.open');
    const rowProjectLabel = item.projectLabel ?? projectLabel;

    const secondary = item.originalFilename && item.originalFilename !== item.name
        ? item.originalFilename
        : `${t(typeKey)}${versionText ? ` · ${versionText}` : ''} · ${sizeText}`;

    const primary = canOpen ? (
        <button
            type="button"
            onClick={() => onOpen(item)}
            aria-label={`${item.name} — ${openLabel}`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
            <DocumentThumbnail item={item} compact />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-[var(--foreground)]">{item.name}</span>
                <span className="block truncate text-[10px] text-[var(--text-muted)]">{secondary}</span>
            </span>
        </button>
    ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">
            <DocumentThumbnail item={item} compact />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-[var(--foreground)]">{item.name}</span>
                <span className="block truncate text-[10px] text-[var(--text-muted)]">{secondary}</span>
            </span>
        </div>
    );

    return (
        <div
            role="listitem"
            className={cn(
                'group flex min-w-0 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 transition-colors',
                'hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:bg-[var(--surface-2)]/60',
            )}
        >
            {primary}

            <span className="hidden w-40 max-w-40 min-w-0 truncate text-[10px] text-[var(--text-muted)] md:block" title={rowProjectLabel}>
                {rowProjectLabel}
            </span>
            <span className="hidden w-20 shrink-0 truncate text-[10px] text-[var(--text-muted)] sm:block">{t(typeKey)}{versionText ? ` · ${versionText}` : ''}</span>
            <span className="hidden w-16 shrink-0 truncate text-[10px] text-[var(--text-muted)] lg:block">{sizeText}</span>
            <DocumentStatusChip status={item.status} className="max-sm:hidden" />
            <span className="hidden w-24 shrink-0 whitespace-nowrap text-[10px] text-[var(--text-muted)] sm:block">{dateText}</span>
            <DocumentActionsMenu
                item={item}
                onOpen={onOpen}
                onPrint={onPrint}
                onDownload={onDownload}
                onReplace={onReplace}
                onDelete={onDelete}
            />
        </div>
    );
}
