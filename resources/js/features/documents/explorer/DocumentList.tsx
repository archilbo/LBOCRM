import { useTranslation } from '@/lib/i18n';
import type { ClientProjectDocument } from '@/features/clients/types';
import { DocumentListRow } from './DocumentListRow';
import type { DocumentExplorerItem } from './documentExplorerTypes';

type DocumentListProps = {
    documents: DocumentExplorerItem[];
    projectLabel: string;
    onOpen: (document: DocumentExplorerItem) => void;
    onPrint: (document: ClientProjectDocument) => void;
    onDownload: (document: ClientProjectDocument) => void;
    onReplace: (document: ClientProjectDocument) => void;
    onDelete: (document: ClientProjectDocument) => void;
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
                    key={item.id}
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
