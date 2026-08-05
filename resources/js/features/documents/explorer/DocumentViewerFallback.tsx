import { CircleAlert as CircleAlertIcon, Download as DownloadIcon, FileText as FileTextIcon } from 'lucide-react';

import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';
import { fileTypeLabelKey } from './documentExplorerFormatters';
import type { DocumentExplorerItem } from './documentExplorerTypes';

type DocumentViewerFallbackProps = {
    /** Resolved document (null for the invalid-id state). */
    document: DocumentExplorerItem | null;
    isInvalid: boolean;
    /** Download handler; null hides the button (no capability / no document). */
    onDownload: (() => void) | null;
    /** Retry handler; null hides the button. */
    onRetry?: (() => void) | null;
    /** Optional localized title overriding the default (e.g. password-protected PDF). */
    title?: string;
    /** Optional localized description overriding the default (e.g. PDF-specific failure). */
    description?: string;
};

/**
 * Safe fallback for the viewer: invalid document ids, preview failures and
 * formats that are not rendered yet (DOCX, Markdown, text, unsupported).
 * Content is never parsed or fetched here — only safe metadata is shown and
 * Download stays available when authorized.
 */
export function DocumentViewerFallback({ document, isInvalid, onDownload, onRetry, title, description }: DocumentViewerFallbackProps) {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-auto p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                {isInvalid ? <CircleAlertIcon size={20} /> : <FileTextIcon size={20} />}
            </span>

            <div className="text-center">
                <p className="text-[12px] font-semibold text-[var(--foreground)]">
                    {title ?? (isInvalid ? t('documentsExplorer.viewer.invalid') : t('documentsExplorer.viewer.previewUnavailable'))}
                </p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                    {description ?? t('documentsExplorer.viewer.previewFailed')}
                </p>
            </div>

            {document ? (
                <p className="max-w-full truncate text-[10px] text-[var(--text-subtle)]">
                    {document.name}
                    {document.originalFilename ? ` · ${document.originalFilename}` : ''}
                    {` · ${t(fileTypeLabelKey(document.previewKind, document.extension))}`}
                </p>
            ) : null}

            <div className="flex items-center gap-2">
                {onRetry ? (
                    <AppButton size="sm" variant="secondary" onPress={onRetry}>
                        {t('documentsExplorer.viewer.retry')}
                    </AppButton>
                ) : null}
                {onDownload ? (
                    <AppButton size="sm" variant="primary" onPress={onDownload}>
                        <DownloadIcon size={14} />
                        {t('documentsExplorer.viewer.downloadOriginal')}
                    </AppButton>
                ) : null}
            </div>
        </div>
    );
}
