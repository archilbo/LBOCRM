import {
    IconFileText,
    IconLayoutGrid,
    IconLayoutList,
    IconSortAscending,
    IconSortDescending,
    IconUpload,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppFilterTabs, type AppFilterTabOption } from '@/components/ui/AppFilterTabs';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { AppSelect, type AppSelectOption } from '@/components/ui/AppSelect';
import { useTranslation } from '@/lib/i18n';
import type { ClientProjectDocument, ClientProjectSummary, ClientRow, ClientSelectedProjectWorkspace } from '@/features/clients/types';
import type { DocumentStatus } from '@/features/documents/types';
import { toDocumentExplorerItem } from '@/features/documents/explorer/documentExplorerItem';
import { DocumentGrid } from '@/features/documents/explorer/DocumentGrid';
import { DocumentList } from '@/features/documents/explorer/DocumentList';
import { DocumentViewerModal } from '@/features/documents/explorer/DocumentViewerModal';
import { useDocumentViewerState } from '@/features/documents/explorer/useDocumentViewerState';
import type {
    DocumentExplorerItem,
    DocumentExplorerLocation,
    DocumentExplorerView,
    DocumentPreviewKind,
    DocumentSortDirection,
    DocumentSortKey,
} from '@/features/documents/explorer/documentExplorerTypes';

type ClientDocumentsTabProps = {
    client: ClientRow;
    projects: ClientProjectSummary[];
    selectedProject: ClientSelectedProjectWorkspace | null;
    onUpload: () => void;
    onPreview: (document: ClientProjectDocument) => void;
    onPrint: (document: ClientProjectDocument) => void;
    onDownload: (document: ClientProjectDocument) => void;
    onReplace: (document: ClientProjectDocument) => void;
    onDelete: (document: ClientProjectDocument) => void;
};

const VIEW_STORAGE_KEY = 'archilbo-document-explorer-view';

function readStoredView(): DocumentExplorerView {
    if (typeof window === 'undefined') {
        return 'list';
    }

    try {
        const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);

        return stored === 'grid' ? 'grid' : 'list';
    } catch {
        return 'list';
    }
}

function dateValue(value: string | null): number {
    const time = Date.parse(value ?? '');

    return Number.isNaN(time) ? 0 : time;
}

function compareExplorerItems(
    a: DocumentExplorerItem,
    b: DocumentExplorerItem,
    key: DocumentSortKey,
    direction: DocumentSortDirection,
): number {
    const factor = direction === 'asc' ? 1 : -1;

    switch (key) {
        case 'name':
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) * factor;
        case 'uploadedAt':
            return (dateValue(a.uploadedAt) - dateValue(b.uploadedAt)) * factor;
        case 'type':
            return a.previewKind.localeCompare(b.previewKind) * factor;
        case 'status':
            return a.status.localeCompare(b.status) * factor;
        case 'updatedAt':
        case 'size':
            // Not exposed by the current backend contract; keep stable order.
            return 0;
    }
}

/**
 * Documents tab of the Client workspace: an explorer shell over the selected
 * project's documents, rendered by the grid/list explorer components with
 * type-aware thumbnails, capability-gated actions and hover/focus/touch
 * overlays. The same-page viewer is not implemented yet: Open keeps the
 * existing preview-window behavior.
 *
 * Presentation-only: the page owns the upload/replace drawers, the delete
 * confirmation dialog, and all mutations. Dialog/drawer state must stay in the
 * page so overlays remain mounted across tab switches (react-aria TabPanel
 * unmounts inactive panels).
 */
export function ClientDocumentsTab({
    client,
    projects,
    selectedProject,
    onUpload,
    onPreview: _onPreview,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
}: ClientDocumentsTabProps) {
    // _onPreview is still part of the page contract (Show.tsx keeps passing
    // it); the same-page viewer replaced the external preview for the Open
    // action, so it is intentionally unused here until the page is cleaned up.
    const { t } = useTranslation();

    const [location, setLocation] = useState<DocumentExplorerLocation>('all');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<DocumentPreviewKind | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
    const [sortKey, setSortKey] = useState<DocumentSortKey>('name');
    const [sortDirection, setSortDirection] = useState<DocumentSortDirection>('asc');
    const [view, setView] = useState<DocumentExplorerView>(readStoredView);

    useEffect(() => {
        try {
            window.localStorage.setItem(VIEW_STORAGE_KEY, view);
        } catch {
            // localStorage unavailable (private mode, sandboxed iframe): keep in-memory state.
        }
    }, [view]);

    const items = useMemo(
        () => (selectedProject?.documents ?? []).map(toDocumentExplorerItem),
        [selectedProject],
    );

    const visibleItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return items
            .filter((item) => {
                if (typeFilter !== 'all' && item.previewKind !== typeFilter) {
                    return false;
                }

                if (statusFilter !== 'all' && item.status !== statusFilter) {
                    return false;
                }

                if (normalizedQuery) {
                    const haystack = `${item.name} ${item.originalFilename ?? ''} ${item.extension ?? ''}`.toLowerCase();

                    if (!haystack.includes(normalizedQuery)) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => compareExplorerItems(a, b, sortKey, sortDirection));
    }, [items, query, typeFilter, statusFilter, sortKey, sortDirection]);

    function clearFilters() {
        setQuery('');
        setTypeFilter('all');
        setStatusFilter('all');
        setSortKey('name');
        setSortDirection('asc');
    }

    const locationOptions: AppFilterTabOption[] = [
        { id: 'all', label: t('documentsExplorer.locations.all') },
        { id: 'shared', label: t('documentsExplorer.locations.shared') },
        { id: 'projects', label: t('documentsExplorer.locations.projects') },
    ];

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
    // contract (ClientProjectDocument), so they are not offered as sort keys.
    const sortOptions: AppSelectOption[] = [
        { id: 'name', label: t('documentsExplorer.sort.name') },
        { id: 'uploadedAt', label: t('documentsExplorer.sort.uploadedAt') },
        { id: 'type', label: t('documentsExplorer.sort.type') },
        { id: 'status', label: t('documentsExplorer.sort.status') },
    ];

    const projectLabel = selectedProject?.projectObject || selectedProject?.dossierNumber || null;

    // Fallback focus target for the viewer when the originating card/row is gone.
    const explorerHeadingRef = useRef<HTMLParagraphElement>(null);

    const viewer = useDocumentViewerState({
        documents: items,
        visibleDocuments: visibleItems,
        fallbackFocusRef: explorerHeadingRef,
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p
                    ref={explorerHeadingRef}
                    tabIndex={-1}
                    className="text-[12px] font-semibold text-[var(--foreground)] outline-none"
                >
                    {t('documentsExplorer.title')}
                </p>
                {projects.length > 0 ? (
                    <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('clients.show.uploadDocument')} aria-label={t('clients.show.uploadDocument')} onPress={onUpload}>
                        <IconUpload size={15} />
                    </AppButton>
                ) : null}
            </div>

            {projects.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                    <AppEmptyState title={t('clients.show.noDocuments')} description={t('clients.show.noDocumentsDesc')} />
                </div>
            ) : (
                <>
                    <AppFilterTabs
                        label={t('documentsExplorer.title')}
                        hideLabel
                        value={location}
                        options={locationOptions}
                        onChange={(value) => setLocation(value as DocumentExplorerLocation)}
                    />

                    {location === 'shared' ? (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                            <h3 className="mb-3 text-[12px] font-semibold text-[var(--foreground)]">{t('documentsExplorer.sharedFiles.title')}</h3>
                            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-3">
                                <AppEmptyState title={t('documentsExplorer.empty.title')} />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{t(`documentsExplorer.locations.${location}`)}</h3>
                                    {projectLabel ? (
                                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{projectLabel}</p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
                                <AppSearchInput
                                    value={query}
                                    onChange={setQuery}
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
                                        onSelectionChange={(key) => setTypeFilter((key as DocumentPreviewKind | 'all') ?? 'all')}
                                    />
                                    <AppSelect
                                        size="sm"
                                        className="min-w-[150px]"
                                        aria-label={t('documentsExplorer.filters.status')}
                                        options={statusOptions}
                                        selectedKey={statusFilter}
                                        onSelectionChange={(key) => setStatusFilter((key as DocumentStatus | 'all') ?? 'all')}
                                    />
                                    <AppSelect
                                        size="sm"
                                        className="min-w-[150px]"
                                        aria-label={t('documentsExplorer.sort.label')}
                                        options={sortOptions}
                                        selectedKey={sortKey}
                                        onSelectionChange={(key) => setSortKey((key as DocumentSortKey) ?? 'name')}
                                    />
                                    <AppButton
                                        isIconOnly
                                        compact
                                        variant="quiet"
                                        tooltip={t(sortDirection === 'asc' ? 'documentsExplorer.sort.ascending' : 'documentsExplorer.sort.descending')}
                                        aria-label={t(sortDirection === 'asc' ? 'documentsExplorer.sort.ascending' : 'documentsExplorer.sort.descending')}
                                        onPress={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
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
                                            onPress={() => setView('grid')}
                                        >
                                            <IconLayoutGrid size={14} />
                                        </AppButton>
                                        <AppButton
                                            isIconOnly
                                            compact
                                            variant={view === 'list' ? 'accent' : 'quiet'}
                                            tooltip={t('documentsExplorer.view.list')}
                                            aria-label={t('documentsExplorer.view.list')}
                                            onPress={() => setView('list')}
                                        >
                                            <IconLayoutList size={14} />
                                        </AppButton>
                                    </div>
                                </div>
                            </div>

                            {visibleItems.length === 0 ? (
                                items.length === 0 ? (
                                    <AppEmptyState title={t('documentsExplorer.empty.title')} description={t('documentsExplorer.empty.description')} />
                                ) : (
                                    <AppEmptyState
                                        title={t('documentsExplorer.search.noResults')}
                                        action={
                                            <AppButton size="sm" variant="quiet" onPress={clearFilters}>
                                                {t('documentsExplorer.filters.clear')}
                                            </AppButton>
                                        }
                                    />
                                )
                            ) : view === 'list' ? (
                                <DocumentList
                                    documents={visibleItems}
                                    projectLabel={projectLabel ?? t('documentsExplorer.metadata.sharedFile')}
                                    onOpen={viewer.open}
                                    onPrint={onPrint}
                                    onDownload={onDownload}
                                    onReplace={onReplace}
                                    onDelete={onDelete}
                                />
                            ) : (
                                <DocumentGrid
                                    documents={visibleItems}
                                    projectLabel={projectLabel ?? t('documentsExplorer.metadata.sharedFile')}
                                    onOpen={viewer.open}
                                    onPrint={onPrint}
                                    onDownload={onDownload}
                                    onReplace={onReplace}
                                    onDelete={onDelete}
                                />
                            )}
                        </div>
                    )}

                    {location === 'all' || location === 'shared' ? (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                            <h3 className="mb-3 text-[12px] font-semibold text-[var(--foreground)]">{t('documentsExplorer.sharedInformation.title')}</h3>
                            <p className="mb-4 text-[10px] text-[var(--text-muted)]">{t('documentsExplorer.sharedInformation.description')}</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <IconFileText size={14} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] font-medium text-[var(--foreground)]">CIN</p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{client.cin || t('common.notAvailable')}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <IconFileText size={14} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] font-medium text-[var(--foreground)]">{t('clients.form.phone')}</p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{client.phone || t('common.notAvailable')}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                        <IconFileText size={14} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] font-medium text-[var(--foreground)]">{t('clients.form.email')}</p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{client.email || t('common.notAvailable')}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </>
            )}

            {viewer.openDocument !== null || viewer.isInvalid ? (
                <DocumentViewerModal
                    document={viewer.openDocument}
                    isInvalid={viewer.isInvalid}
                    projectLabel={projectLabel ?? t('documentsExplorer.metadata.sharedFile')}
                    position={viewer.position}
                    canGoPrevious={viewer.canGoPrevious}
                    canGoNext={viewer.canGoNext}
                    onPrevious={viewer.goToPrevious}
                    onNext={viewer.goToNext}
                    onClose={viewer.close}
                    onDownload={onDownload}
                    onPrint={onPrint}
                    onReplace={onReplace}
                    onDelete={onDelete}
                />
            ) : null}
        </div>
    );
}
