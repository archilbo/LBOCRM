import { useTranslation } from '@/lib/i18n';
import { DocumentStatusChip } from './DocumentCard';
import { fileTypeLabelKey, formatDocumentDate, formatFileSize, documentStatusLabel } from './documentExplorerFormatters';
import type { DocumentExplorerItem } from './documentExplorerTypes';

type DocumentDetailsPanelProps = {
    document: DocumentExplorerItem;
    projectLabel: string;
    className?: string;
};

/**
 * Details shell. Only fields that exist on the authorized item are rendered;
 * a physical storage path is never displayed (storageLocation is excluded
 * on purpose). Rendered once as a desktop right column and once as a mobile
 * section by DocumentViewerModal — the component is presentation-only.
 */
export function DocumentDetailsPanel({ document, projectLabel, className }: DocumentDetailsPanelProps) {
    const { t, locale } = useTranslation();

    const rows: { label: string; value: string }[] = [
        { label: t('documentsExplorer.viewer.metadata.name'), value: document.name },
    ];

    if (document.originalFilename && document.originalFilename !== document.name) {
        rows.push({
            label: t('documentsExplorer.viewer.metadata.originalFilename'),
            value: document.originalFilename,
        });
    }

    rows.push({
        label: t('documentsExplorer.viewer.metadata.type'),
        value: t(fileTypeLabelKey(document.previewKind, document.extension)),
    });

    rows.push({
        label: t('documentsExplorer.viewer.metadata.size'),
        value: formatFileSize(null, document.sizeLabel) ?? t('documentsExplorer.metadata.unknownSize'),
    });

    if (document.documentNumber) {
        rows.push({ label: t('documentsExplorer.viewer.metadata.documentNumber'), value: document.documentNumber });
    }

    rows.push({ label: t('documentsExplorer.viewer.metadata.status'), value: documentStatusLabel(t, document.status) });

    if (projectLabel) {
        rows.push({ label: t('documentsExplorer.viewer.metadata.project'), value: projectLabel });
    }

    if (document.uploadedAt) {
        rows.push({
            label: t('documentsExplorer.viewer.metadata.uploadedAt'),
            value: formatDocumentDate(document.uploadedAt, locale) ?? t('documentsExplorer.metadata.unknownDate'),
        });
    }

    return (
        <aside aria-label={t('documentsExplorer.viewer.details')} className={className}>
            <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {t('documentsExplorer.viewer.details')}
                </h3>
                <DocumentStatusChip status={document.status} className="max-sm:hidden" />
            </div>
            <dl className="space-y-2.5 px-3 py-3">
                {rows.map((row) => (
                    <div key={row.label} className="flex flex-col gap-0.5">
                        <dt className="text-[9px] uppercase tracking-wide text-[var(--text-subtle)]">{row.label}</dt>
                        <dd className="break-words text-[11px] text-[var(--foreground)]">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    );
}
