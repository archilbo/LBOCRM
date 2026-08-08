import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useTranslation } from '@/lib/i18n';
import type { DocumentStatus } from '@/features/documents/types';
import { toDocumentExplorerItem } from './documentExplorerItem';
import { DocumentExplorerTabs } from './DocumentExplorerTabs';
import { DocumentExplorerToolbar } from './DocumentExplorerToolbar';
import { DocumentGrid } from './DocumentGrid';
import { DocumentList } from './DocumentList';
import { DocumentViewerModal } from './DocumentViewerModal';
import { useDocumentViewerState } from './useDocumentViewerState';
import type {
    DocumentExplorerItem,
    DocumentExplorerScope,
    DocumentExplorerTab,
    DocumentExplorerView,
    DocumentPreviewKind,
    DocumentSortDirection,
    DocumentSortKey,
    ExplorerDocument,
} from './documentExplorerTypes';

type DocumentExplorerProps = {
    /** Product surface rendering the explorer (drives the default storage key). */
    scope: DocumentExplorerScope;
    /** Config-driven tabs; each tab filters the normalized documents. */
    tabs: DocumentExplorerTab[];
    /** Normalized explorer documents (already source-stamped by the adapter). */
    documents: ExplorerDocument[];
    projectLabel: string | null;
    title: string;
    storageKey?: string;
    /** Optional header actions (upload button, "open in documents", …). */
    headerActions?: ReactNode;
    onPrint: (document: ExplorerDocument) => void;
    onDownload: (document: ExplorerDocument) => void;
    onReplace: (document: ExplorerDocument) => void;
    onDelete: (document: ExplorerDocument) => void;
    /** Custom panel per tab (e.g. the Client "shared files" placeholder). */
    renderTabPanel?: (tab: DocumentExplorerTab) => ReactNode | null;
    /** Content rendered below the active panel (e.g. Client "reused information"). */
    renderFooter?: (activeTabId: string) => ReactNode | null;
};

function readStoredView(storageKey: string): DocumentExplorerView {
    if (typeof window === 'undefined') {
        return 'list';
    }

    try {
        const stored = window.localStorage.getItem(storageKey);

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
 * Shared document explorer shell: tabs + toolbar + grid/list + same-page
 * viewer, driven entirely by configuration.
 *
 * The shell is presentation-and-state only: it never fetches, mutates or
 * deletes anything. Pages own the upload/replace drawers, the delete
 * confirmation dialog and all mutations, and pass the callbacks down.
 * Dialog/drawer state must stay in the page so overlays remain mounted
 * across tab switches (react-aria TabPanel unmounts inactive panels).
 *
 * Tabs filter the normalized ExplorerDocument[] — they never swap
 * components. Custom tab panels (renderTabPanel) and footers
 * (renderFooter) let scopes keep their page-specific sections without
 * forking the explorer itself.
 */
export function DocumentExplorer({
    scope,
    tabs,
    documents,
    projectLabel,
    title,
    storageKey,
    headerActions,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
    renderTabPanel,
    renderFooter,
}: DocumentExplorerProps) {
    const { t } = useTranslation();

    const viewStorageKey = storageKey ?? `archilbo-document-explorer-view-${scope}`;

    const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id ?? 'all');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<DocumentPreviewKind | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
    const [sortKey, setSortKey] = useState<DocumentSortKey>('name');
    const [sortDirection, setSortDirection] = useState<DocumentSortDirection>('asc');
    const [view, setView] = useState<DocumentExplorerView>(() => readStoredView(viewStorageKey));

    useEffect(() => {
        try {
            window.localStorage.setItem(viewStorageKey, view);
        } catch {
            // localStorage unavailable (private mode, sandboxed iframe): keep in-memory state.
        }
    }, [view, viewStorageKey]);

    const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

    const items = useMemo(
        () => documents.map(toDocumentExplorerItem),
        [documents],
    );

    const tabFilteredItems = useMemo(
        () => (activeTab?.filter ? items.filter(activeTab.filter) : items),
        [items, activeTab],
    );

    const visibleItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return tabFilteredItems
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
    }, [tabFilteredItems, query, typeFilter, statusFilter, sortKey, sortDirection]);

    function clearFilters() {
        setQuery('');
        setTypeFilter('all');
        setStatusFilter('all');
        setSortKey('name');
        setSortDirection('asc');
    }

    // Fallback focus target for the viewer when the originating card/row is gone.
    const explorerHeadingRef = useRef<HTMLParagraphElement>(null);

    const viewer = useDocumentViewerState({
        documents: items,
        visibleDocuments: visibleItems,
        fallbackFocusRef: explorerHeadingRef,
    });

    if (!activeTab) {
        return null;
    }

    const customPanel = renderTabPanel?.(activeTab) ?? null;
    const fallbackProjectLabel = projectLabel ?? t('documentsExplorer.metadata.sharedFile');

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p
                    ref={explorerHeadingRef}
                    tabIndex={-1}
                    className="text-[12px] font-semibold text-[var(--foreground)] outline-none"
                >
                    {title}
                </p>
                {headerActions}
            </div>

            <DocumentExplorerTabs tabs={tabs} activeId={activeTab.id} onChange={setActiveTabId} />

            {customPanel !== null ? (
                customPanel
            ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 className="text-[12px] font-semibold text-[var(--foreground)]">{activeTab.label}</h3>
                            {projectLabel ? (
                                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{projectLabel}</p>
                            ) : null}
                        </div>
                    </div>

                    <DocumentExplorerToolbar
                        query={query}
                        onQueryChange={setQuery}
                        typeFilter={typeFilter}
                        onTypeFilterChange={setTypeFilter}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        sortKey={sortKey}
                        onSortKeyChange={setSortKey}
                        sortDirection={sortDirection}
                        onToggleSortDirection={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                        view={view}
                        onViewChange={setView}
                    />

                    {visibleItems.length === 0 ? (
                        tabFilteredItems.length === 0 ? (
                            <AppEmptyState
                                title={activeTab.emptyTitle ?? t('documentsExplorer.empty.title')}
                                description={activeTab.emptyDescription ?? (documents.length === 0 ? t('documentsExplorer.empty.description') : undefined)}
                            />
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
                            projectLabel={fallbackProjectLabel}
                            onOpen={viewer.open}
                            onPrint={onPrint}
                            onDownload={onDownload}
                            onReplace={onReplace}
                            onDelete={onDelete}
                        />
                    ) : (
                        <DocumentGrid
                            documents={visibleItems}
                            projectLabel={fallbackProjectLabel}
                            onOpen={viewer.open}
                            onPrint={onPrint}
                            onDownload={onDownload}
                            onReplace={onReplace}
                            onDelete={onDelete}
                        />
                    )}
                </div>
            )}

            {renderFooter?.(activeTab.id) ?? null}

            {viewer.openDocument !== null || viewer.isInvalid ? (
                <DocumentViewerModal
                    document={viewer.openDocument}
                    isInvalid={viewer.isInvalid}
                    projectLabel={fallbackProjectLabel}
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
