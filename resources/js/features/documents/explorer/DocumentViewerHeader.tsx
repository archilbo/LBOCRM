import {
    Download as DownloadIcon,
    PanelRight as PanelRightIcon,
    Pencil as PencilIcon,
    Printer as PrinterIcon,
    Trash as TrashIcon,
    X as XIcon,
} from 'lucide-react';

import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';
import { DocumentStatusChip } from './DocumentCard';
import { DocumentFileIcon } from './DocumentFileIcon';
import { fileTypeLabelKey } from './documentExplorerFormatters';
import type { DocumentExplorerItem, ExplorerDocument } from './documentExplorerTypes';
import { DOCUMENT_VIEWER_TOOLBAR_HOST_ID } from './viewers/viewerTypes';

type DocumentViewerHeaderProps = {
    /** Resolved document; null renders the invalid-state header. */
    document: DocumentExplorerItem | null;
    projectLabel: string;
    detailsOpen: boolean;
    onToggleDetails: () => void;
    onClose: () => void;
    onDownload: (document: ExplorerDocument) => void;
    onPrint: (document: ExplorerDocument) => void;
    onReplace: (document: ExplorerDocument) => void;
    onDelete: (document: ExplorerDocument) => void;
};

/**
 * Viewer header: name + type/number/project line, status chip and
 * capability-gated actions (Download, Print, Replace, Details, Delete,
 * Close). Actions are hidden when the corresponding capability is false;
 * access is never inferred from role names, URLs or callback existence.
 * The print button stays visible but disabled for images (they preview
 * fine but are not printable); printing is not offered from the actions
 * menu either (canPrint is false for images).
 * Update-status stays hidden (backend capability not exposed yet).
 */
export function DocumentViewerHeader({
    document,
    projectLabel,
    detailsOpen,
    onToggleDetails,
    onClose,
    onDownload,
    onPrint,
    onReplace,
    onDelete,
}: DocumentViewerHeaderProps) {
    const { t } = useTranslation();

    const detailsLabel = detailsOpen
        ? t('documentsExplorer.viewer.hideDetails')
        : t('documentsExplorer.viewer.details');

    return (
        <div className="grid shrink-0 grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center gap-2 overflow-x-auto border-b border-[var(--border)] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
                {document ? (
                    <>
                    <DocumentFileIcon
                        kind={document.previewKind}
                        extension={document.extension}
                        size={16}
                        className="shrink-0 text-[var(--text-muted)]"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-[var(--foreground)]" title={document.name}>
                            {document.name}
                        </p>
                        <p className="max-sm:hidden truncate text-[10px] text-[var(--text-muted)]">
                            {t(fileTypeLabelKey(document.previewKind, document.extension))}
                            {document.documentNumber ? ` · ${document.documentNumber}` : ''}
                            {projectLabel ? ` · ${projectLabel}` : ''}
                        </p>
                    </div>
                    <DocumentStatusChip status={document.status} />
                    </>
                ) : (
                    <p className="min-w-0 truncate text-[12px] font-semibold text-[var(--foreground)]">
                        {t('documentsExplorer.viewer.title')}
                    </p>
                )}
            </div>

            <div id={DOCUMENT_VIEWER_TOOLBAR_HOST_ID} className="flex min-w-max items-center justify-self-center" />

            <div className="flex min-w-max items-center justify-self-end gap-1">
                {document ? (
                    <>
                        {document.capabilities.canDownload ? (
                            <AppButton
                                isIconOnly
                                compact
                                variant="quiet"
                                tooltip={t('documentsExplorer.actions.download')}
                                aria-label={t('documentsExplorer.actions.download')}
                                onPress={() => onDownload(document)}
                            >
                                <DownloadIcon size={15} />
                            </AppButton>
                        ) : null}
                        {document.previewKind === 'image' ? (
                            <AppButton
                                isIconOnly
                                compact
                                variant="quiet"
                                isDisabled
                                tooltip={t('documentsExplorer.actions.printUnavailable')}
                                aria-label={t('documentsExplorer.actions.printUnavailable')}
                            >
                                <PrinterIcon size={15} />
                            </AppButton>
                        ) : document.capabilities.canPrint ? (
                            <AppButton
                                isIconOnly
                                compact
                                variant="quiet"
                                tooltip={t('documentsExplorer.actions.print')}
                                aria-label={t('documentsExplorer.actions.print')}
                                onPress={() => onPrint(document)}
                            >
                                <PrinterIcon size={15} />
                            </AppButton>
                        ) : null}
                        {document.capabilities.canReplace ? (
                            <AppButton
                                isIconOnly
                                compact
                                variant="quiet"
                                tooltip={t('documentsExplorer.actions.replace')}
                                aria-label={t('documentsExplorer.actions.replace')}
                                onPress={() => onReplace(document)}
                            >
                                <PencilIcon size={15} />
                            </AppButton>
                        ) : null}
                        {document.capabilities.canDelete ? (
                            <AppButton
                                isIconOnly
                                compact
                                variant="danger"
                                tooltip={t('documentsExplorer.actions.delete')}
                                aria-label={t('documentsExplorer.actions.delete')}
                                onPress={() => onDelete(document)}
                            >
                                <TrashIcon size={15} />
                            </AppButton>
                        ) : null}
                        <AppButton
                            isIconOnly
                            compact
                            variant={detailsOpen ? 'accent' : 'quiet'}
                            tooltip={detailsLabel}
                            aria-label={detailsLabel}
                            onPress={onToggleDetails}
                        >
                            <PanelRightIcon size={15} />
                        </AppButton>
                    </>
                ) : null}
                <AppButton
                    isIconOnly
                    compact
                    variant="quiet"
                    tooltip={t('documentsExplorer.viewer.close')}
                    aria-label={t('documentsExplorer.viewer.close')}
                    onPress={onClose}
                >
                    <XIcon size={15} />
                </AppButton>
            </div>
        </div>
    );
}
