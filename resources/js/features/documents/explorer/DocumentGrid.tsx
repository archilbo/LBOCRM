import { useTranslation } from '@/lib/i18n';
import type { ClientProjectDocument } from '@/features/clients/types';
import { DocumentCard } from './DocumentCard';
import type { DocumentExplorerItem } from './documentExplorerTypes';

type DocumentGridProps = {
    documents: DocumentExplorerItem[];
    projectLabel: string;
    onOpen: (document: DocumentExplorerItem) => void;
    onPrint: (document: ClientProjectDocument) => void;
    onDownload: (document: ClientProjectDocument) => void;
    onReplace: (document: ClientProjectDocument) => void;
    onDelete: (document: ClientProjectDocument) => void;
};

/**
 * Responsive file grid: 1 column under 480px, 2 at 480px+, 3 at 768px+,
 * 4 at 1024px+, 5 at 1280px+ and 6 at 1600px+. The collection is already
 * filtered and sorted by the explorer shell; this component only renders it
 * in order with stable document IDs as keys.
 */
export function DocumentGrid({
    documents,
    projectLabel,
    onOpen,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
}: DocumentGridProps) {
    const { t } = useTranslation();

    return (
        <div
            role="list"
            aria-label={t('documentsExplorer.grid.ariaLabel')}
            className="grid min-w-0 max-w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 min-[1600px]:grid-cols-6"
        >
            {documents.map((item) => (
                <DocumentCard
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
