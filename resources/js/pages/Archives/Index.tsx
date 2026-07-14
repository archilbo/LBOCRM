import { Head, router } from '@inertiajs/react';
import {
    ChevronDown,
    List,
    Map,
    Plus,
    RefreshCw,
    ScanLine,
    Search,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppCompactTabs } from '@/components/ui/AppCompactTabs';
import { AppDropdownMenu } from '@/components/ui/AppDropdownMenu';
import { AppTooltip } from '@/components/ui/AppTooltip';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { AppPagination } from '@/components/ui/AppPagination';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppShell } from '@/components/layout/AppShell';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import { CheckoutDrawer } from '@/features/archives/drawers/CheckoutDrawer';
import { ReturnDrawer } from '@/features/archives/drawers/ReturnDrawer';
import { MoveDrawer } from '@/features/archives/drawers/MoveDrawer';
import { BulkActionBar } from '@/features/archives/components/BulkActionBar';
import { KpiStrip } from '@/features/archives/components/KpiStrip';
import { MapView } from '@/features/archives/components/MapView';
import { PreviewPanel } from '@/features/archives/components/PreviewPanel';
import { ScanModal } from '@/features/archives/components/ScanModal';
import { StorageTree } from '@/features/archives/components/StorageTree';
import { useArchiveFilters } from '@/features/archives/hooks/useArchiveFilters';
import { useHotkeys } from '@/features/archives/hooks/useHotkeys';
import type { ArchiveFormPayload, ArchiveRecordRow, ArchivesPageProps } from '@/features/archives/types';
import { ARCHIVE_STATUS, defaultDue } from '@/config/statuses';
import { cn } from '@/lib/cn';

const VIEW_TABS = [
    { id: 'all' as const, label: 'All' },
    { id: 'mine' as const, label: 'My requests' },
    { id: 'out' as const, label: 'Out' },
    { id: 'overdue' as const, label: 'Overdue' },
    { id: 'empty_boxes' as const, label: 'Empty boxes' },
    { id: 'lost' as const, label: 'Lost' },
];

export default function ArchivesIndex(props: ArchivesPageProps) {
    const { filters, patch, debouncedPatch, reset, activeCount, activeChips } = useArchiveFilters({
        initial: props.filters,
        route: '/archives',
    });

    const [query, setQuery] = useState(filters.q || '');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedArchive, setSelectedArchive] = useState<ArchiveRecordRow | null>(null);
    const [previewRecord, setPreviewRecord] = useState<ArchiveRecordRow | null>(props.archives[0] ?? null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [deleteTarget, setDeleteTarget] = useState<ArchiveRecordRow | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
    const [returnDrawerOpen, setReturnDrawerOpen] = useState(false);
    const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [showNewMenu, setShowNewMenu] = useState(false);
    const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
    const [treeDrawerOpen, setTreeDrawerOpen] = useState(false);
    const [previewSheetOpen, setPreviewSheetOpen] = useState(false);

    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            if (query !== (filters.q || '')) {
                debouncedPatch({ q: query || undefined });
            }
        }, 250);
        return () => clearTimeout(t);
    }, [query]);

    const allSelected = props.archives.length > 0 && props.archives.every((r) => selectedIds.has(r.id));
    const viewMode = (filters.viewMode as 'list' | 'map') || 'list';

    function handleKpiFilter(key: string | null) {
        if (!key) { patch({ view: undefined, status: undefined, overdueOnly: undefined }); return; }
        if (key === 'overdue') { patch({ view: undefined, status: undefined, overdueOnly: true }); return; }
        if (key === 'ready') { patch({ status: ['ready_to_archive'], view: undefined, overdueOnly: undefined }); return; }
        if (key === 'stored') { patch({ status: ['stored'], view: undefined, overdueOnly: undefined }); return; }
        if (key === 'checked_out') { patch({ status: ['checked_out'], view: undefined, overdueOnly: undefined }); return; }
        if (key === 'returned') { patch({ status: ['returned'], view: undefined, overdueOnly: undefined }); return; }
        if (key === 'lost') { patch({ status: ['lost'], view: undefined, overdueOnly: undefined }); return; }
    }

    function handleRowClick(record: ArchiveRecordRow) {
        setPreviewRecord(record);
    }

    function handleRowDoubleClick(record: ArchiveRecordRow) {
        setSelectedArchive(record);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openCreateDrawer() {
        setSelectedArchive(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(record: ArchiveRecordRow) {
        setSelectedArchive(record);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ArchiveFormPayload) {
        const backendPayload = {
            dossier_id: payload.dossierId,
            status: payload.status || 'ready_to_archive',
            room: payload.room || null,
            shelf: payload.shelf || null,
            box: payload.box || null,
            folder: payload.folder || null,
            in_date: payload.inDate || null,
            out_date: payload.outDate || null,
            returned_at: payload.returnedAt || null,
            requested_by: payload.requestedBy || null,
            due_at: payload.dueAt || null,
            notes: payload.notes || null,
        };
        if (drawerMode === 'edit' && selectedArchive) {
            router.put(`/archives/${selectedArchive.id}`, backendPayload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Updated.'); },
                onError: (err) => { setFormErrors(err as Record<string, string>); },
            });
            return;
        }
        router.post('/archives', backendPayload, {
            preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setFormErrors({}); toast.success('Created.'); },
            onError: (err) => { setFormErrors(err as Record<string, string>); },
        });
    }

    function handleCheckout(data: { archiveIds: number[]; requester: string; dueAt: string; purpose: string }) {
        router.post('/archives/checkout', { archive_ids: data.archiveIds, requested_by: data.requester, due_at: data.dueAt, purpose: data.purpose, notify: true }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedIds(new Set()); toast.success('Checked out.'); },
            onError: () => toast.error('Checkout failed.'),
        });
    }

    function handleReturn(data: { archiveIds: number[]; note: string }) {
        router.post('/archives/return', { archive_ids: data.archiveIds, note: data.note }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedIds(new Set()); toast.success('Returned.'); },
            onError: () => toast.error('Return failed.'),
        });
    }

    function handleMove(data: { archiveIds: number[]; roomCode: string; shelfCode: string; boxCode: string }) {
        router.post('/archives/move', { archive_ids: data.archiveIds, room: data.roomCode, shelf: data.shelfCode, box: data.boxCode }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedIds(new Set()); toast.success('Moved.'); },
            onError: () => toast.error('Move failed.'),
        });
    }

    function handleCheckoutSingle(record: ArchiveRecordRow) {
        router.post('/archives/checkout', { archive_ids: [record.id], requested_by: record.requestedBy || '', due_at: defaultDue(), purpose: '' }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Checked out.'),
            onError: () => toast.error('Checkout failed.'),
        });
    }

    function handleReturnSingle(record: ArchiveRecordRow) {
        router.post('/archives/return', { archive_ids: [record.id], note: '' }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Returned.'),
            onError: () => toast.error('Return failed.'),
        });
    }

    function deleteRecord(record: ArchiveRecordRow) {
        setDeleteTarget(record);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/archives/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { setDeleteTarget(null); toast.success('Deleted.'); },
            onError: () => toast.error('Delete failed.'),
        });
    }

    function handlePageChange(page: number) {
        patch({ page });
    }

    function handlePerPageChange(perPage: number) {
        patch({ perPage, page: 1 });
    }

    useHotkeys([
        { key: 'k', meta: true, handler: () => searchRef.current?.focus() },
        { key: 'n', handler: openCreateDrawer },
        { key: 'n', shift: true, handler: () => { setShowNewMenu(true); } },
        { key: 'c', handler: () => setCheckoutDrawerOpen(true) },
        { key: 'r', handler: () => setReturnDrawerOpen(true) },
        { key: 'm', handler: () => setMoveDrawerOpen(true) },
        { key: '?', handler: () => setCheatsheetOpen(true) },
        { key: 'Escape', handler: () => { setCheatsheetOpen(false); setShowNewMenu(false); } },
    ]);

    return (
        <>
            <Head title="Archives" />
            <AppShell>
                <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-4">
                    {/* PageHeader — Tier 1 */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-white">Archives</h1>
                        <div className="relative">
                            <AppButton variant="primary" size="sm" onPress={() => setShowNewMenu(!showNewMenu)}>
                                <Plus size={14} /> New archive <ChevronDown size={11} />
                            </AppButton>
                            {showNewMenu ? (
                                <div className="absolute right-0 top-full z-30 mt-1 min-w-36 rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-sm"
                                    onMouseLeave={() => setShowNewMenu(false)}>
                                    <button type="button" onClick={() => { setShowNewMenu(false); openCreateDrawer(); }}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5">Single</button>
                                    <button type="button" onClick={() => { setShowNewMenu(false); toast.info('Batch create coming soon.'); }}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5">Batch</button>
                                    <button type="button" onClick={() => { setShowNewMenu(false); toast.info('CSV import coming soon.'); }}
                                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5">Import CSV</button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* KPI strip */}
                    <KpiStrip kpis={props.kpis} activeFilter={filters.overdueOnly ? 'overdue' : (filters.status?.[0] ?? null)} onFilter={handleKpiFilter} />

                    {/* Toolbar — saved-view tabs inline + compact controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        <AppCompactTabs
                            tabs={VIEW_TABS.map((t) => ({ id: t.id, label: t.label }))}
                            selectedKey={filters.view || 'all'}
                            onSelectionChange={(id) => patch({ view: id === 'all' ? undefined : id as string, status: undefined, overdueOnly: undefined })}
                        />
                        <div className="ml-auto flex items-center gap-1.5">
                            <div className="relative w-64">
                                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="ARC, project, box…"
                                    className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.02] pl-8 pr-7 text-[13px] text-white outline-none placeholder:text-white/40 focus:border-amber-500/50"
                                />
                                {query ? (
                                    <button type="button" onClick={() => { setQuery(''); debouncedPatch({ q: undefined }); }}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded text-white/40 hover:text-white/80">
                                        <X size={12} />
                                    </button>
                                ) : null}
                            </div>

                            <AppTooltip label="Filters">
                                <button type="button" onClick={() => setFilterDrawerOpen(true)}
                                    className={cn('flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/5', activeCount > 0 && 'text-amber-400')}
                                    aria-label="Filters">
                                    <SlidersHorizontal size={14} />
                                </button>
                            </AppTooltip>

                            <div className="h-5 w-px bg-white/10" />

                            <AppTooltip label="List view">
                                <button type="button" onClick={() => patch({ viewMode: 'list' })}
                                    className={cn('flex h-8 w-8 items-center justify-center rounded-lg', viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5')}
                                    aria-label="List view"><List size={14} /></button>
                            </AppTooltip>
                            <AppTooltip label="Map view">
                                <button type="button" onClick={() => patch({ viewMode: 'map' })}
                                    className={cn('flex h-8 w-8 items-center justify-center rounded-lg', viewMode === 'map' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5')}
                                    aria-label="Map view"><Map size={14} /></button>
                            </AppTooltip>

                            <AppDropdownMenu
                                ariaLabel="Sort"
                                items={[
                                    { id: 'archive_number:asc', label: 'ARC ↑', onAction: () => patch({ sort: 'archive_number:asc' }) },
                                    { id: 'archive_number:desc', label: 'ARC ↓', onAction: () => patch({ sort: 'archive_number:desc' }) },
                                    { id: 'status:asc', label: 'Status ↑', onAction: () => patch({ sort: 'status:asc' }) },
                                    { id: 'status:desc', label: 'Status ↓', onAction: () => patch({ sort: 'status:desc' }) },
                                    { id: 'due_at:asc', label: 'Due ↑', onAction: () => patch({ sort: 'due_at:asc' }) },
                                    { id: 'due_at:desc', label: 'Due ↓', onAction: () => patch({ sort: 'due_at:desc' }) },
                                ]}
                            />

                            <AppTooltip label="Refresh">
                                <button type="button" onClick={() => router.reload({ only: ['archives', 'kpis', 'tree'] })}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5" aria-label="Refresh">
                                    <RefreshCw size={14} />
                                </button>
                            </AppTooltip>

                            <AppTooltip label="Scan QR code">
                                <button type="button" onClick={() => setScanModalOpen(true)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5" aria-label="Scan QR code">
                                    <ScanLine size={14} />
                                </button>
                            </AppTooltip>
                        </div>
                    </div>

                    {/* Filter chip bar */}
                    {activeChips.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {activeChips.map((chip) => (
                                <span key={chip.key} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-white/60">
                                    {chip.label}
                                    <button type="button" onClick={chip.onRemove} className="ml-0.5 text-white/40 hover:text-white/80"><X size={12} /></button>
                                </span>
                            ))}
                            <button type="button" onClick={reset} className="text-xs text-white/50 hover:text-white/80">Clear all</button>
                        </div>
                    ) : null}

                    {/* Layout grid — 3 columns */}
                    <div className="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)_320px] xl:grid-cols-[280px_minmax(0,1fr)_360px]">
                        {/* Storage tree */}
                        <StorageTree
                            tree={props.tree}
                            selectedRoom={filters.room || null}
                            selectedShelf={filters.shelf || null}
                            selectedBox={filters.box || null}
                            onSelectRoom={(code) => patch({ room: code || undefined, shelf: undefined, box: undefined })}
                            onSelectShelf={(code) => patch({ shelf: code || undefined, box: undefined })}
                            onSelectBox={(code) => patch({ box: code || undefined })}
                            className="hidden lg:block rounded-xl border border-white/5 bg-white/[0.02] p-3"
                        />

                        {/* Work surface */}
                        <div className="min-w-0 space-y-4">
                            {viewMode === 'list' ? (
                                <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                    <ArchiveTable
                                        archives={props.archives}
                                        selectedIds={selectedIds}
                                        allSelected={allSelected}
                                        sort={filters.sort}
                                        onToggleSelect={(id) => setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
                                        onToggleAll={() => setSelectedIds((prev) => prev.size === props.archives.length ? new Set() : new Set(props.archives.map((r) => r.id)))}
                                        onRowClick={(record) => { handleRowClick(record); if (window.innerWidth < 1280) setPreviewSheetOpen(true); }}
                                        onRowDoubleClick={handleRowDoubleClick}
                                        onCheckoutSingle={handleCheckoutSingle}
                                        onReturnSingle={handleReturnSingle}
                                        onEditSingle={openEditDrawer}
                                        onDeleteSingle={deleteRecord}
                                        onSortChange={(sort) => patch({ sort: sort || undefined })}
                                    />
                                </div>
                            ) : (
                                <MapView tree={props.tree} selectedBox={filters.box || null} onSelectBox={(code) => patch({ box: code || undefined })} />
                            )}

                            {props.paginator.lastPage > 1 ? (
                                <div className="flex items-center justify-between text-[13px] text-white/50">
                                    <div className="flex items-center gap-2">
                                        <AppSelect
                                            label=""
                                            selectedKey={String(props.paginator.perPage)}
                                            onSelectionChange={(v) => handlePerPageChange(Number(v))}
                                            options={[
                                                { id: '25', label: '25' },
                                                { id: '50', label: '50' },
                                                { id: '100', label: '100' },
                                                { id: '200', label: '200' },
                                            ]}
                                            className="h-8 w-16"
                                        />
                                        <span className="tabular-nums">
                                            {((props.paginator.currentPage - 1) * props.paginator.perPage) + 1}–{Math.min(props.paginator.currentPage * props.paginator.perPage, props.paginator.total)} of {props.paginator.total}
                                        </span>
                                    </div>
                                    <AppPagination
                                        page={props.paginator.currentPage}
                                        pageSize={props.paginator.perPage}
                                        total={props.paginator.total}
                                        onChange={handlePageChange}
                                    />
                                </div>
                            ) : null}

                            <BulkActionBar
                                count={selectedIds.size}
                                onCheckout={() => setCheckoutDrawerOpen(true)}
                                onReturn={() => setReturnDrawerOpen(true)}
                                onMove={() => setMoveDrawerOpen(true)}
                                onClear={() => setSelectedIds(new Set())}
                            />
                        </div>

                        {/* Preview panel — sticky on desktop */}
                        <div className="hidden xl:block">
                            <div className="sticky top-4 self-start rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                                <PreviewPanel record={previewRecord} />
                            </div>
                        </div>
                    </div>

                    {/* Mobile: tree drawer trigger */}
                    <button
                        type="button"
                        onClick={() => setTreeDrawerOpen(true)}
                        className="lg:hidden fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg"
                        aria-label="Open storage tree"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                    </button>
                </div>

                {/* Drawers & Modals */}
                <ArchiveDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    archiveRecord={selectedArchive}
                    dossiers={props.dossiers}
                    rooms={props.tree.map((r) => ({ id: r.id, name: r.name, code: r.code }))}
                    shelves={props.tree.flatMap((r) => (r.shelves || []).map((s) => ({ id: s.id, roomId: r.id, name: s.name, code: s.code })))}
                    boxes={props.tree.flatMap((r) => (r.shelves || []).flatMap((s) => (s.boxes || []).map((b) => ({ id: b.id, shelfId: s.id, name: b.name, code: b.code, capacity: b.capacity }))))}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    errors={formErrors}
                />

                <CheckoutDrawer
                    isOpen={checkoutDrawerOpen}
                    onOpenChange={setCheckoutDrawerOpen}
                    archives={props.archives.filter((a) => selectedIds.has(a.id))}
                    onConfirm={handleCheckout}
                />

                <ReturnDrawer
                    isOpen={returnDrawerOpen}
                    onOpenChange={setReturnDrawerOpen}
                    archives={props.archives.filter((a) => selectedIds.has(a.id))}
                    onConfirm={handleReturn}
                />

                <MoveDrawer
                    isOpen={moveDrawerOpen}
                    onOpenChange={setMoveDrawerOpen}
                    archives={props.archives.filter((a) => selectedIds.has(a.id))}
                    tree={props.tree}
                    onConfirm={handleMove}
                />

                <AppDrawer
                    isOpen={filterDrawerOpen}
                    onOpenChange={setFilterDrawerOpen}
                    title="Filters"
                    description={`${activeCount} active filter${activeCount !== 1 ? 's' : ''}`}
                    size="md"
                    footer={
                        <>
                            <AppButton variant="secondary" onPress={() => { reset(); setFilterDrawerOpen(false); }}>Reset</AppButton>
                            <AppButton variant="primary" type="submit" form="filter-form">Apply</AppButton>
                        </>
                    }
                >
                    <form id="filter-form" onSubmit={(e) => { e.preventDefault(); setFilterDrawerOpen(false); }} className="space-y-5">
                        <section>
                            <h4 className="mb-2 text-[11px] uppercase tracking-wide text-white/50 font-semibold">Status</h4>
                            <div className="space-y-1">
                                {Object.entries(ARCHIVE_STATUS).map(([key, s]) => (
                                    <label key={key} className="flex items-center gap-2 text-[13px] text-white/80">
                                        <input type="checkbox" checked={filters.status?.includes(key) ?? false}
                                            onChange={() => {
                                                const cur = filters.status || [];
                                                const next = cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key];
                                                patch({ status: next.length ? next : undefined });
                                            }}
                                            className="size-3.5 accent-amber-500" />
                                        <span className={s.listColor}>{s.dot}</span> {s.label}
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h4 className="mb-2 text-[11px] uppercase tracking-wide text-white/50 font-semibold">Requester</h4>
                            <select value={filters.requesterId || ''} onChange={(e) => patch({ requesterId: e.target.value || undefined })}
                                className="h-9 w-full rounded-lg border border-white/10 bg-zinc-900 px-2 text-[13px] text-white outline-none focus:border-amber-500/50">
                                <option value="">All</option>
                                {props.requesters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </section>

                        <section>
                            <h4 className="mb-2 text-[11px] uppercase tracking-wide text-white/50 font-semibold">Due date</h4>
                            <div className="flex gap-2">
                                <input type="date" value={filters.dueFrom || ''} onChange={(e) => patch({ dueFrom: e.target.value || undefined })}
                                    className="h-9 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-2 text-[13px] text-white outline-none focus:border-amber-500/50" placeholder="From" />
                                <input type="date" value={filters.dueTo || ''} onChange={(e) => patch({ dueTo: e.target.value || undefined })}
                                    className="h-9 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-2 text-[13px] text-white outline-none focus:border-amber-500/50" placeholder="To" />
                            </div>
                            <div className="mt-1 flex gap-1">
                                {[
                                    { label: 'Overdue', fn: () => patch({ dueTo: new Date().toISOString().split('T')[0], dueFrom: undefined }) },
                                    { label: 'This week', fn: () => { const d = new Date(); const day = d.getDay(); const mon = new Date(d); mon.setDate(mon.getDate() - (day === 0 ? 6 : day - 1)); const sun = new Date(mon); sun.setDate(sun.getDate() + 6); patch({ dueFrom: mon.toISOString().split('T')[0], dueTo: sun.toISOString().split('T')[0] }); } },
                                    { label: 'This month', fn: () => { const d = new Date(); patch({ dueFrom: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0], dueTo: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0] }); } },
                                ].map((preset) => (
                                    <button key={preset.label} type="button" onClick={preset.fn}
                                        className="rounded border border-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/5">{preset.label}</button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h4 className="mb-2 text-[11px] uppercase tracking-wide text-white/50 font-semibold">Dossier</h4>
                            <select value={filters.dossierId || ''} onChange={(e) => patch({ dossierId: e.target.value || undefined })}
                                className="h-9 w-full rounded-lg border border-white/10 bg-zinc-900 px-2 text-[13px] text-white outline-none focus:border-amber-500/50">
                                <option value="">All</option>
                                {props.dossiers.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                            </select>
                        </section>
                    </form>
                </AppDrawer>

                <AppDrawer
                    isOpen={treeDrawerOpen}
                    onOpenChange={setTreeDrawerOpen}
                    title="Storage"
                    size="sm"
                >
                    <StorageTree
                        tree={props.tree}
                        selectedRoom={filters.room || null}
                        selectedShelf={filters.shelf || null}
                        selectedBox={filters.box || null}
                        onSelectRoom={(code) => { patch({ room: code || undefined, shelf: undefined, box: undefined }); setTreeDrawerOpen(false); }}
                        onSelectShelf={(code) => { patch({ shelf: code || undefined, box: undefined }); setTreeDrawerOpen(false); }}
                        onSelectBox={(code) => { patch({ box: code || undefined }); setTreeDrawerOpen(false); }}
                    />
                </AppDrawer>

                <AppDrawer
                    isOpen={previewSheetOpen}
                    onOpenChange={setPreviewSheetOpen}
                    title=""
                    size="md"
                >
                    <PreviewPanel record={previewRecord} />
                </AppDrawer>

                <ScanModal isOpen={scanModalOpen} onOpenChange={setScanModalOpen} />

                <AppModal isOpen={cheatsheetOpen} onOpenChange={setCheatsheetOpen} title="Keyboard shortcuts" size="sm">
                    <div className="space-y-2 text-[13px]">
                        {[
                            { keys: '⌘K', action: 'Focus search' },
                            { keys: 'N', action: 'New archive' },
                            { keys: '⇧N', action: 'Batch menu' },
                            { keys: 'C', action: 'Check out selected' },
                            { keys: 'R', action: 'Return selected' },
                            { keys: 'M', action: 'Move selected' },
                            { keys: '?', action: 'Show this cheatsheet' },
                        ].map((item) => (
                            <div key={item.keys} className="flex items-center justify-between">
                                <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-xs text-white/80">{item.keys}</kbd>
                                <span className="text-white/60">{item.action}</span>
                            </div>
                        ))}
                    </div>
                </AppModal>

                <AppModal isOpen={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete archive?" size="sm">
                    <p className="mb-4 text-[13px] text-white/70">Delete <strong className="text-white">{deleteTarget?.archiveNumber}</strong>? This cannot be undone.</p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" size="sm" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton color="danger" variant="solid" size="sm" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}

import { ArchiveTable } from '@/features/archives/components/ArchiveTable';
