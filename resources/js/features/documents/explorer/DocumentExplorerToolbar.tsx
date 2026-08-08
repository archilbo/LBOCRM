import {
    IconLayoutGrid,
    IconLayoutList,
    IconSortAscending,
    IconSortDescending,
} from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { AppSelect, type AppSelectOption } from '@/components/ui/AppSelect';
import { useTranslation } from '@/lib/i18n';
import type { DocumentStatus } from '@/features/documents/types';
import type {
    DocumentPreviewKind,
    DocumentSortDirection,
    DocumentSortKey,
    DocumentExplorerView,
} from './documentExplorerTypes';

type DocumentExplorerToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    typeFilter: DocumentPreviewKind | 'all';
    onTypeFilterChange: (value: DocumentPreviewKind | 'all') => void;
    statusFilter: DocumentStatus | 'all';
    onStatusFilterChange: (value: DocumentStatus | 'all') => void;
    sortKey: DocumentSortKey;
    onSortKeyChange: (value: DocumentSortKey) => void;
    sortDirection: DocumentSortDirection;
    onToggleSortDirection: () => void;
    view: DocumentExplorerView;
    onViewChange: (value: DocumentExplorerView) => void;
};

/**
 * Toolbar of the shared explorer: search, type / status filters, sort key +
 * direction and the grid / list view toggle. Fully controlled — the shell
 * owns all state. Options are built from the shared locale dictionaries, so
 * both Client and Project scopes get identical controls.
 */
export function DocumentExplorerToolbar({
    query,
    onQueryChange,
    typeFilter,
    onTypeFilterChange,
    statusFilter,
    onStatusFilterChange,
    sortKey,
    onSortKeyChange,
    sortDirection,
    onToggleSortDirection,
    view,
    onViewChange,
}: DocumentExplorerToolbarProps) {
    const { t } = useTranslation();

    const typeOptions: AppSelectOption[] = [
        { id: 'all', label: t('documentsExplorer.filters.allTypes') },
        ...(['image', 'pdf', 'docx', 'markdown', 'text', 'unsupported'] as const).map((kind) => ({
            id: kind,
            label: t(`documentsExplorer.fileTypes.${kind}`),
        })),
    ];

    const statusOptions: AppSelectOption[] = [
        { id: 'all', label: t('documentsExplorer.filters.allStatuses') },
        ...(['uploaded', 'verified', 'missing', 'rejected'] as const).map((status) => ({
            id: status,
            label: t(`documents.status.${status}`),
        })),
    ];

    // updatedAt and size are absent from the current backend document
    // contract, so they are not offered as sort keys.
    const sortOptions: AppSelectOption[] = [
        { id: 'name', label: t('documentsExplorer.sort.name') },
        { id: 'uploadedAt', label: t('documentsExplorer.sort.uploadedAt') },
        { id: 'type', label: t('documentsExplorer.sort.type') },
        { id: 'status', label: t('documentsExplorer.sort.status') },
    ];

    return (
        <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
            <AppSearchInput
                value={query}
                onChange={onQueryChange}
                placeholder={t('documentsExplorer.search.placeholder')}
                ariaLabel={t('documentsExplorer.search.placeholder')}
                maxWidth=""
                className="flex-1"
            />
            <div className="flex flex-wrap items-center gap-2">
                <AppSelect
                    size="sm"
                    className="min-w-[150px]"
                    aria-label={t('documentsExplorer.filters.type')}
                    options={typeOptions}
                    selectedKey={typeFilter}
                    onSelectionChange={(key) => onTypeFilterChange((key as DocumentPreviewKind | 'all') ?? 'all')}
                />
                <AppSelect
                    size="sm"
                    className="min-w-[150px]"
                    aria-label={t('documentsExplorer.filters.status')}
                    options={statusOptions}
                    selectedKey={statusFilter}
                    onSelectionChange={(key) => onStatusFilterChange((key as DocumentStatus | 'all') ?? 'all')}
                />
                <AppSelect
                    size="sm"
                    className="min-w-[150px]"
                    aria-label={t('documentsExplorer.sort.label')}
                    options={sortOptions}
                    selectedKey={sortKey}
                    onSelectionChange={(key) => onSortKeyChange((key as DocumentSortKey) ?? 'name')}
                />
                <AppButton
                    isIconOnly
                    compact
                    variant="quiet"
                    tooltip={t(sortDirection === 'asc' ? 'documentsExplorer.sort.ascending' : 'documentsExplorer.sort.descending')}
                    aria-label={t(sortDirection === 'asc' ? 'documentsExplorer.sort.ascending' : 'documentsExplorer.sort.descending')}
                    onPress={onToggleSortDirection}
                >
                    {sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />}
                </AppButton>
                <div className="flex items-center gap-1">
                    <AppButton
                        isIconOnly
                        compact
                        variant={view === 'grid' ? 'accent' : 'quiet'}
                        tooltip={t('documentsExplorer.view.grid')}
                        aria-label={t('documentsExplorer.view.grid')}
                        onPress={() => onViewChange('grid')}
                    >
                        <IconLayoutGrid size={14} />
                    </AppButton>
                    <AppButton
                        isIconOnly
                        compact
                        variant={view === 'list' ? 'accent' : 'quiet'}
                        tooltip={t('documentsExplorer.view.list')}
                        aria-label={t('documentsExplorer.view.list')}
                        onPress={() => onViewChange('list')}
                    >
                        <IconLayoutList size={14} />
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
