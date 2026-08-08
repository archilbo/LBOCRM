import { useTranslation } from '@/lib/i18n';
import { DocumentListRow } from './DocumentListRow';
import type { DocumentExplorerItem, ExplorerDocument } from './documentExplorerTypes';

type DocumentListProps = {
    documents: DocumentExplorerItem[];
    projectLabel: string;
    onOpen: (document: DocumentExplorerItem) => void;
    onPrint: (document: ExplorerDocument) => void;
    onDownload: (document: ExplorerDocument) => void;
    onReplace: (document: ExplorerDocument) => void;
    onDelete: (document: ExplorerDocument) => void;
};

/**
 * Compact file list. Columns adapt by breakpoint inside DocumentListRow
 * (desktop: thumbnail/name, project, type, size, status, date, actions;
 * mobile: thumbnail, name + type·size, status, More). The collection is
 * already filtered and sorted by the explorer shell.
 */
export function DocumentList({
    documents,
    projectLabel,
    onOpen,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
}: DocumentListProps) {
    const { t } = useTranslation();

    return (
        <div role="list" aria-label={t('documentsExplorer.list.ariaLabel')} className="min-w-0 max-w-full space-y-1.5">
            {documents.map((item) => (
                <DocumentListRow
                    key={item.key}
                    item={item}
                    projectLabel={projectLabel}
                    onOpen={onOpen}
                    onPrint={onPrint}
                    onDownload={onDownload}
                    onReplace={onReplace}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
