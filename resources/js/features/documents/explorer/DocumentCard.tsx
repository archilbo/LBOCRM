import { Chip } from '@heroui/react';
import { Download as DownloadIcon, Eye as EyeIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { documentStatusLabel, fileTypeLabelKey, formatDocumentDate, formatDocumentVersion, formatFileSize } from './documentExplorerFormatters';
import { DocumentActionsMenu } from './DocumentActionsMenu';
import { DocumentThumbnail } from './DocumentThumbnail';
import type { DocumentExplorerItem, ExplorerDocument } from './documentExplorerTypes';

export function DocumentStatusChip({ status, className }: { status: string; className?: string }) {
    const { t } = useTranslation();

    return (
        <Chip
            size="sm"
            variant="soft"
            className={cn(
                'h-5 min-h-0 shrink-0 px-2 text-[9px] font-medium',
                status === 'verified' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                className,
            )}
        >
            {documentStatusLabel(t, status)}
        </Chip>
    );
}

type DocumentCardProps = {
    item: DocumentExplorerItem;
    projectLabel: string;
    onOpen: (document: DocumentExplorerItem) => void;
    onPrint: (document: ExplorerDocument) => void;
    onDownload: (document: ExplorerDocument) => void;
    onReplace: (document: ExplorerDocument) => void;
    onDelete: (document: ExplorerDocument) => void;
};

function OverlayActionButton({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onPress}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]/95 text-[var(--text-muted)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]"
        >
            {icon}
        </button>
    );
}

/**
 * File card for the explorer grid. The outer container is non-interactive;
 * the main preview trigger is one button covering thumbnail + metadata, and
 * the overlay/More controls are siblings so nothing is nested. Hover and
 * keyboard focus-within reveal Open/Download; More stays visible on touch.
 */
export function DocumentCard({
    item,
    projectLabel,
    onOpen,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
}: DocumentCardProps) {
    const { t, locale } = useTranslation();

    const canOpen = item.capabilities.canView;
    const typeKey = fileTypeLabelKey(item.previewKind, item.extension);
    const sizeText = formatFileSize(null, item.sizeLabel) ?? t('documentsExplorer.metadata.unknownSize');
    const dateText = formatDocumentDate(item.uploadedAt, locale) ?? t('documentsExplorer.metadata.unknownDate');
    const versionText = formatDocumentVersion(item.version);
    const openLabel = t('documentsExplorer.actions.open');
    const cardProjectLabel = item.projectLabel ?? projectLabel;

    return (
        <div
            role="listitem"
            className="group relative flex min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-colors hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))]"
        >
            <DocumentThumbnail item={item} />

            {canOpen ? (
                <button
                    type="button"
                    onClick={() => onOpen(item)}
                    aria-label={`${item.name} — ${openLabel}`}
                    className="flex w-full flex-col items-start gap-1.5 px-3 pb-3 pt-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)]"
                >
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[9px] font-medium text-[var(--text-muted)]">{t(typeKey)}</span>
                            {versionText ? (
                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[9px] font-medium text-[var(--text-subtle)]">{versionText}</span>
                            ) : null}
                        </div>
                        <DocumentStatusChip status={item.status} />
                    </div>
                    <p className="line-clamp-2 w-full break-words text-[12px] font-medium leading-snug text-[var(--foreground)]" title={item.name}>
                        {item.name}
                    </p>
                    <p className="w-full truncate text-[10px] text-[var(--text-muted)]">
                        {t(typeKey)} · {sizeText}
                    </p>
                    <p className="w-full truncate text-[10px] text-[var(--text-subtle)]">
                        {cardProjectLabel} · {dateText}
                    </p>
                </button>
            ) : (
                <div className="flex w-full flex-col items-start gap-1.5 px-3 pb-3 pt-2.5">
                    <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[9px] font-medium text-[var(--text-muted)]">{t(typeKey)}</span>
                            {versionText ? (
                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[9px] font-medium text-[var(--text-subtle)]">{versionText}</span>
                            ) : null}
                        </div>
                        <DocumentStatusChip status={item.status} />
                    </div>
                    <p className="line-clamp-2 w-full break-words text-[12px] font-medium leading-snug text-[var(--foreground)]" title={item.name}>
                        {item.name}
                    </p>
                    <p className="w-full truncate text-[10px] text-[var(--text-muted)]">
                        {t(typeKey)} · {sizeText}
                    </p>
                    <p className="w-full truncate text-[10px] text-[var(--text-subtle)]">
                        {cardProjectLabel} · {dateText}
                    </p>
                </div>
            )}

            <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
                <div className="invisible flex items-center gap-1.5 group-hover:visible group-focus-within:visible">
                    {item.capabilities.canView ? (
                        <OverlayActionButton label={openLabel} icon={<EyeIcon size={14} />} onPress={() => onOpen(item)} />
                    ) : null}
                    {item.capabilities.canDownload ? (
                        <OverlayActionButton label={t('documentsExplorer.actions.download')} icon={<DownloadIcon size={14} />} onPress={() => onDownload(item)} />
                    ) : null}
                </div>
                <DocumentActionsMenu
                    item={item}
                    onOpen={onOpen}
                    onPrint={onPrint}
                    onDownload={onDownload}
                    onReplace={onReplace}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
}
