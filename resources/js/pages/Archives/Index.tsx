import { Head, router } from '@inertiajs/react';
import { IconArchive, IconChevronLeft, IconChevronRight, IconChartBar, IconBuilding, IconFileText, IconLayersLinked, IconList, IconMap, IconRefresh, IconSearch, IconAdjustmentsHorizontal, IconX } from '@tabler/icons-react';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Input, TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppTooltip } from '@/components/ui/AppTooltip';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { AppSelect } from '@/components/ui/AppSelect';
import { DrawerSection, DrawerField, drawerStyles } from '@/components/drawers';
import { AppShell } from '@/components/layout/AppShell';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import { CheckoutDrawer } from '@/features/archives/drawers/CheckoutDrawer';
import { ReturnDrawer } from '@/features/archives/drawers/ReturnDrawer';
import { MoveDrawer } from '@/features/archives/drawers/MoveDrawer';
import { BulkActionBar } from '@/features/archives/components/BulkActionBar';
import { KpiStrip } from '@/features/archives/components/KpiStrip';
import { MapView } from '@/features/archives/components/MapView';
import { PreviewPanel } from '@/features/archives/components/PreviewPanel';
import { CitySidebar } from '@/features/archives/components/CitySidebar';
import { ArchiveTable } from '@/features/archives/components/ArchiveTable';
import { useArchiveFilters } from '@/features/archives/hooks/useArchiveFilters';
import { useHotkeys } from '@/features/archives/hooks/useHotkeys';
import type { ArchiveFormPayload, ArchiveRecordRow, ArchivesPageProps } from '@/features/archives/types';
import { ARCHIVE_STATUS, defaultDue } from '@/config/statuses';
import { cn } from '@/lib/cn';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslation } from '@/lib/i18n';

export default function ArchivesIndex(props: ArchivesPageProps) {
    const { can } = usePermissions();
    const { t } = useTranslation();
    const { filters, patch, debouncedPatch, reset, activeCount, activeChips } = useArchiveFilters({
        initial: {
            ...props.filters,
            viewMode: (props.filters.viewMode === 'map' || props.filters.viewMode === 'list') ? props.filters.viewMode : undefined,
        } as ArchiveFilters,
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
    const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
    const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);
    const [roomModalOpen, setRoomModalOpen] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomDescription, setRoomDescription] = useState('');
    const [shelvesCount, setShelvesCount] = useState(0);
    const [boxesPerShelf, setBoxesPerShelf] = useState(0);
    const [roomSubmitting, setRoomSubmitting] = useState(false);
    const [roomErrors, setRoomErrors] = useState<Record<string, string>>({});

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
        if (!key) { patch({ status: undefined, overdueOnly: undefined }); return; }
        if (key === 'overdue') { patch({ status: undefined, overdueOnly: true }); return; }
        if (key === 'ready') { patch({ status: ['ready_to_archive'], overdueOnly: undefined }); return; }
        if (key === 'stored') { patch({ status: ['stored'], overdueOnly: undefined }); return; }
        if (key === 'checked_out') { patch({ status: ['checked_out'], overdueOnly: undefined }); return; }
        if (key === 'returned') { patch({ status: ['returned'], overdueOnly: undefined }); return; }
        if (key === 'lost') { patch({ status: ['lost'], overdueOnly: undefined }); return; }
    }

    function handleRowClick(record: ArchiveRecordRow) {
        setPreviewRecord(record);
    }

    function openCreateDrawer() {
        if (!can('archive.create')) return;
        setSelectedArchive(null);
        setDrawerMode('create');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function openEditDrawer(record: ArchiveRecordRow) {
        if (!can('archive.update')) return;
        setSelectedArchive(record);
        setDrawerMode('edit');
        setFormErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(payload: ArchiveFormPayload) {
        if (drawerMode === 'edit' ? !can('archive.update') : !can('archive.create')) return;
        const backendPayload = {
            dossier_id: payload.dossierId,
            status: payload.status || 'ready_to_archive',
            room: payload.room || null,
            shelf: payload.shelf || null,
            box: payload.box || null,
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
        if (!can('archive.checkout')) return;
        router.post('/archives/checkout', { archive_ids: data.archiveIds, requested_by: data.requester, due_at: data.dueAt, purpose: data.purpose, notify: true }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedIds(new Set()); toast.success('Checked out.'); },
            onError: () => toast.error('Checkout failed.'),
        });
    }

    function handleReturn(data: { archiveIds: number[]; note: string }) {
        if (!can('archive.checkin')) return;
        router.post('/archives/return', { archive_ids: data.archiveIds, note: data.note }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedIds(new Set()); toast.success('Returned.'); },
            onError: () => toast.error('Return failed.'),
        });
    }

    function handleMove(data: { archiveIds: number[]; roomCode: string; shelfCode: string; boxCode: string }) {
        if (!can('archive.update')) return;
        router.post('/archives/move', { archive_ids: data.archiveIds, room: data.roomCode, shelf: data.shelfCode, box: data.boxCode }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedIds(new Set()); toast.success('Moved.'); },
            onError: () => toast.error('Move failed.'),
        });
    }

    function handleCheckoutSingle(record: ArchiveRecordRow) {
        if (!can('archive.checkout')) return;
        router.post('/archives/checkout', { archive_ids: [record.id], requested_by: record.requestedBy || '', due_at: defaultDue(), purpose: '' }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Checked out.'),
            onError: () => toast.error('Checkout failed.'),
        });
    }

    function handleReturnSingle(record: ArchiveRecordRow) {
        if (!can('archive.checkin')) return;
        router.post('/archives/return', { archive_ids: [record.id], note: '' }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Returned.'),
            onError: () => toast.error('Return failed.'),
        });
    }

    function deleteRecord(record: ArchiveRecordRow) {
        if (!can('archive.delete')) return;
        setDeleteTarget(record);
    }

    function confirmDelete() {
        if (!deleteTarget || !can('archive.delete')) return;
        router.delete(`/archives/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { setDeleteTarget(null); toast.success('Deleted.'); },
            onError: () => toast.error('Delete failed.'),
        });
    }

    function submitRoom() {
        setRoomSubmitting(true);
        setRoomErrors({});
        router.post('/archives/rooms', {
            name: roomName,
            description: roomDescription || undefined,
            shelves_count: shelvesCount || undefined,
            boxes_per_shelf: boxesPerShelf || undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRoomModalOpen(false);
                setRoomName('');
                setRoomDescription('');
                setShelvesCount(0);
                setBoxesPerShelf(0);
                setRoomSubmitting(false);
                toast.success('Salle créée avec succès.');
            },
            onError: (err) => {
                setRoomErrors(err as Record<string, string>);
                setRoomSubmitting(false);
            },
        });
    }

    function handlePageChange(page: number) {
        const url = new URL(window.location.href);
        if (page > 1) {
            url.searchParams.set('page', String(page));
        } else {
            url.searchParams.delete('page');
        }
        router.visit(url.pathname + url.search, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function handlePerPageChange(perPage: number) {
        patch({ perPage, page: 1 });
    }

    function handleSelectCity(code: string | null) {
        patch({ city: code || undefined, page: 1 });
    }

    function handleSelectBox(room: string, box: string) {
        patch({ room, box, page: 1 });
    }

    useHotkeys([
        { key: 'k', meta: true, handler: () => searchRef.current?.focus() },
        { key: 'n', handler: openCreateDrawer },
        { key: 'c', handler: () => setCheckoutDrawerOpen(true) },
        { key: 'r', handler: () => setReturnDrawerOpen(true) },
        { key: 'm', handler: () => setMoveDrawerOpen(true) },
        { key: '?', handler: () => setCheatsheetOpen(true) },
        { key: 'Escape', handler: () => { setCheatsheetOpen(false); } },
    ]);

    return (
        <>
            <Head title={t('archivesWorkspace.title')} />
            <AppShell>
                <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-0 space-y-4">
                    <div className="flex items-center justify-between shrink-0">
                        <h1 className="text-2xl font-semibold text-[var(--crm-text)]">{t('archivesWorkspace.title')}</h1>
                        {can('archive.create') ? (
                            <div className="flex items-center gap-2">
                                <AppButton variant="ghost" compact isIconOnly onPress={() => setRoomModalOpen(true)} tooltip={t('actions.createRoom')}>
                                    <IconBuilding size={16} />
                                </AppButton>
                                <AppButton variant="primary" compact isIconOnly onPress={openCreateDrawer} tooltip={t('archivesWorkspace.newArchive')}>
                                    <IconArchive size={16} />
                                </AppButton>
                            </div>
                        ) : null}
                    </div>

                    <KpiStrip kpis={props.kpis} activeFilter={filters.overdueOnly ? 'overdue' : (filters.status?.[0] ?? null)} onFilter={handleKpiFilter} />

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="relative w-64">
                            <IconSearch size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--crm-text-muted)]" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('searchPlaceholder')}
                                className="h-8 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] pl-8 pr-7 text-[12px] text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-text-muted)] focus:border-[var(--crm-gold)]/50 focus:ring-2 focus:ring-[var(--crm-gold)]/20"
                            />
                            {query ? (
                                <button type="button" onClick={() => { setQuery(''); debouncedPatch({ q: undefined }); }}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]">
                                    <IconX size={12} />
                                </button>
                            ) : null}
                        </div>

                        <AppTooltip label={t('actions.filters')}>
                            <button type="button" onClick={() => setFilterDrawerOpen(true)}
                                className={cn('flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)]', activeCount > 0 && 'text-[var(--crm-gold)]')}
                                aria-label={t('actions.filters')}>
                                <IconAdjustmentsHorizontal size={14} />
                            </button>
                        </AppTooltip>

                        <div className="h-5 w-px bg-[var(--crm-border)]" />

                        <AppTooltip label={t('actions.listView')}>
                            <button type="button" onClick={() => patch({ viewMode: 'list' })}
                                className={cn('flex h-8 w-8 items-center justify-center rounded-lg', viewMode === 'list' ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)]')}
                                aria-label={t('actions.listView')}><IconList size={14} /></button>
                        </AppTooltip>
                        <AppTooltip label={t('actions.mapView')}>
                            <button type="button" onClick={() => patch({ viewMode: 'map' })}
                                className={cn('flex h-8 w-8 items-center justify-center rounded-lg', viewMode === 'map' ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)]')}
                                aria-label={t('actions.mapView')}><IconMap size={14} /></button>
                        </AppTooltip>

                        <AppTooltip label={t('actions.refresh')}>
                            <button type="button" onClick={() => router.reload({ only: ['archives', 'kpis', 'tree', 'cells'] })}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)]" aria-label={t('actions.refresh')}>
                                <IconRefresh size={14} />
                            </button>
                        </AppTooltip>

                        <div className="h-5 w-px bg-[var(--crm-border)]" />

                        <AppTooltip label={t('actions.reports')}>
                            <button type="button" onClick={() => router.visit('/archives/reports')}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)]" aria-label={t('actions.reports')}>
                                <IconChartBar size={14} />
                            </button>
                        </AppTooltip>

                        {activeChips.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap shrink-0 ml-auto">
                                {activeChips.map((chip) => (
                                    <span key={chip.key} className="inline-flex items-center gap-1 rounded-md border border-[var(--crm-border)] px-2 py-1 text-xs text-[var(--crm-text-muted)]">
                                        {chip.label}
                                        <button type="button" onClick={chip.onRemove} className="ml-0.5 text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><IconX size={12} /></button>
                                    </span>
                                ))}
                                <button type="button" onClick={reset} className="text-xs text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]">{t('actions.clearAll')}</button>
                            </div>
                        ) : null}
                    </div>

                    {/* Preview card — full width */}
                    <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] shrink-0">
                        <PreviewPanel record={previewRecord} />
                    </div>

                    {/* Sidebar + table — fills remaining height */}
                    <div className="flex min-h-0 flex-1 gap-3">
                        <div className="hidden lg:flex flex-col w-[220px] shrink-0">
                            <div className="flex-1 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] overflow-hidden">
                                <CitySidebar
                                    cells={props.cells}
                                    selectedCity={filters.city || null}
                                    selectedRoom={filters.room || null}
                                    selectedBox={filters.box || null}
                                    onSelectCity={handleSelectCity}
                                    onSelectBox={handleSelectBox}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col min-h-0 flex-1 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)]">
                            {viewMode === 'list' ? (
                                <ArchiveTable
                                    archives={props.archives}
                                    selectedIds={selectedIds}
                                    allSelected={allSelected}
                                    sort={filters.sort}
                                    onToggleSelect={(id) => setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
                                    onToggleAll={() => setSelectedIds((prev) => prev.size === props.archives.length ? new Set() : new Set(props.archives.map((r) => r.id)))}
                                    onRowClick={handleRowClick}
                                    onCheckoutSingle={can('archive.checkout') ? handleCheckoutSingle : undefined}
                                    onReturnSingle={can('archive.checkin') ? handleReturnSingle : undefined}
                                    onEditSingle={can('archive.update') ? openEditDrawer : undefined}
                                    onDeleteSingle={can('archive.delete') ? deleteRecord : undefined}
                                    onSortChange={(sort) => patch({ sort: sort || undefined })}
                                />
                            ) : (
                                <MapView tree={props.tree} selectedBox={filters.box || null} onSelectBox={(code) => patch({ box: code || undefined })} />
                            )}

                            {/* Pagination inside table card */}
                            {props.paginator.lastPage > 1 ? (() => {
                                const { currentPage, lastPage, perPage, total } = props.paginator;
                                const from = (currentPage - 1) * perPage + 1;
                                const to = Math.min(currentPage * perPage, total);
                                const pages: (number | 'ellipsis')[] = [];
                                const start = Math.max(1, currentPage - 2);
                                const end = Math.min(lastPage, currentPage + 2);
                                if (start > 1) pages.push(1);
                                if (start > 2) pages.push('ellipsis');
                                for (let i = start; i <= end; i++) pages.push(i);
                                if (end < lastPage - 1) pages.push('ellipsis');
                                if (end < lastPage) pages.push(lastPage);
                                return (
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--crm-border)] px-3 py-2.5 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <AppSelect
                                                label=""
                                                selectedKey={String(perPage)}
                                                onSelectionChange={(v) => handlePerPageChange(Number(v))}
                                                options={[
                                                    { id: '15', label: `15 ${t('page')}` },
                                                    { id: '30', label: `30 ${t('page')}` },
                                                    { id: '50', label: `50 ${t('page')}` },
                                                    { id: '100', label: `100 ${t('page')}` },
                                                ]}
                                                className="h-7 w-24"
                                            />
                                            <span className="text-[11px] text-[var(--crm-text-muted)] tabular-nums">
                                                {from}–{to} {t('of')} {total}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button"
                                                disabled={currentPage <= 1}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                className="flex h-7 w-7 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)] disabled:opacity-20 disabled:pointer-events-none transition">
                                                <IconChevronLeft size={14} />
                                            </button>
                                            {pages.map((p, i) =>
                                                p === 'ellipsis' ? (
                                                    <span key={`e${i}`} className="px-1 text-[var(--crm-text-muted)]/20 select-none text-[10px]">…</span>
                                                ) : (
                                                    <button key={p} type="button"
                                                        onClick={() => handlePageChange(p)}
                                                        className={`flex h-7 min-w-7 items-center justify-center rounded text-xs transition ${
                                                            p === currentPage
                                                                ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)] font-semibold'
                                                                : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'
                                                        }`}>
                                                        {p}
                                                    </button>
                                                ),
                                            )}
                                            <button type="button"
                                                disabled={currentPage >= lastPage}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                className="flex h-7 w-7 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-surface)] disabled:opacity-20 disabled:pointer-events-none transition">
                                                <IconChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })() : null}

                            <BulkActionBar
                                count={selectedIds.size}
                                onCheckout={() => setCheckoutDrawerOpen(true)}
                                onReturn={() => setReturnDrawerOpen(true)}
                                onMove={() => setMoveDrawerOpen(true)}
                                onClear={() => setSelectedIds(new Set())}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarDrawerOpen(true)}
                        className="lg:hidden fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--crm-gold)] text-black shadow-lg"
                        aria-label={t('actions.openCitySidebar')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                    </button>
                </div>

                <ArchiveDrawer
                    isOpen={drawerOpen}
                    mode={drawerMode}
                    archiveRecord={selectedArchive}
                    clients={props.clients}
                    dossiers={props.dossiers}
                    rooms={props.tree.map((r) => ({ id: r.id, name: r.name, code: r.code }))}
                    shelves={props.tree.flatMap((r) => (r.shelves || []).map((s) => ({ id: s.id, roomId: r.id, name: s.name, code: s.code })))}
                    boxes={props.tree.flatMap((r) => (r.shelves || []).flatMap((s) => (s.boxes || []).map((b) => ({ id: b.id, shelfId: s.id, name: b.name, code: b.code, capacity: b.capacity }))))}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
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
                    title={t('filters.title')}
                    description={`${activeCount} ${activeCount === 1 ? t('filters.activeFilter') : t('filters.activeFilters')}`}
                    size="md"
                    footer={
                        <>
                            <AppButton variant="secondary" onPress={() => { reset(); setFilterDrawerOpen(false); }}>{t('filters.reset')}</AppButton>
                            <AppButton variant="primary" type="submit" form="filter-form">{t('filters.apply')}</AppButton>
                        </>
                    }
                >
                    <form id="filter-form" onSubmit={(e) => { e.preventDefault(); setFilterDrawerOpen(false); }} className="space-y-5">
                        <section>
                            <h4 className="mb-2 text-[10px] uppercase tracking-wide text-[var(--crm-text-soft)] font-semibold">{t('filters.city')}</h4>
                            <select value={filters.city || ''} onChange={(e) => patch({ city: e.target.value || undefined })}
                                className="h-9 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 text-[12px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]/50 focus:ring-2 focus:ring-[var(--crm-gold)]/20">
                                <option value="">{t('filters.all')}</option>
                                {props.cities.map((c) => (
                                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </section>

                        <section>
                            <h4 className="mb-2 text-[10px] uppercase tracking-wide text-[var(--crm-text-soft)] font-semibold">{t('filters.status')}</h4>
                            <div className="space-y-1">
                                {Object.entries(ARCHIVE_STATUS).map(([key, s]) => (
                                    <label key={key} className="flex items-center gap-2 text-[12px] text-[var(--crm-text)]/80">
                                        <input type="checkbox" checked={filters.status?.includes(key) ?? false}
                                            onChange={() => {
                                                const cur = filters.status || [];
                                                const next = cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key];
                                                patch({ status: next.length ? next : undefined });
                                            }}
                                            className="size-3.5 accent-[var(--crm-gold)]" />
                                        <span className={s.listColor}>{s.dot}</span> {s.label}
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h4 className="mb-2 text-[10px] uppercase tracking-wide text-[var(--crm-text-soft)] font-semibold">{t('filters.requester')}</h4>
                            <select value={filters.requesterId || ''} onChange={(e) => patch({ requesterId: e.target.value || undefined })}
                                className="h-9 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 text-[12px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]/50 focus:ring-2 focus:ring-[var(--crm-gold)]/20">
                                <option value="">{t('filters.all')}</option>
                                {props.requesters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </section>

                        <section>
                            <h4 className="mb-2 text-[10px] uppercase tracking-wide text-[var(--crm-text-soft)] font-semibold">{t('filters.dueDate')}</h4>
                            <div className="flex gap-2">
                                <input type="date" value={filters.dueFrom || ''} onChange={(e) => patch({ dueFrom: e.target.value || undefined })}
                                    className="h-9 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 text-[12px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]/50 focus:ring-2 focus:ring-[var(--crm-gold)]/20" placeholder={t('filters.from')} />
                                <input type="date" value={filters.dueTo || ''} onChange={(e) => patch({ dueTo: e.target.value || undefined })}
                                    className="h-9 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 text-[12px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]/50 focus:ring-2 focus:ring-[var(--crm-gold)]/20" placeholder={t('filters.to')} />
                            </div>
                            <div className="mt-1 flex gap-1">
                                {[
                                    { label: t('filters.overdue'), fn: () => patch({ dueTo: new Date().toISOString().split('T')[0], dueFrom: undefined }) },
                                    { label: t('filters.thisWeek'), fn: () => { const d = new Date(); const day = d.getDay(); const mon = new Date(d); mon.setDate(mon.getDate() - (day === 0 ? 6 : day - 1)); const sun = new Date(mon); sun.setDate(sun.getDate() + 6); patch({ dueFrom: mon.toISOString().split('T')[0], dueTo: sun.toISOString().split('T')[0] }); } },
                                    { label: t('filters.thisMonth'), fn: () => { const d = new Date(); patch({ dueFrom: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0], dueTo: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0] }); } },
                                ].map((preset) => (
                                    <button key={preset.label} type="button" onClick={preset.fn}
                                        className="rounded border border-[var(--crm-border)] px-2 py-1 text-xs text-[var(--crm-text-muted)] hover:bg-[var(--crm-elevated)]">{preset.label}</button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h4 className="mb-2 text-[10px] uppercase tracking-wide text-[var(--crm-text-soft)] font-semibold">{t('filters.dossier')}</h4>
                            <select value={filters.dossierId || ''} onChange={(e) => patch({ dossierId: e.target.value || undefined })}
                                className="h-9 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-2 text-[12px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]/50 focus:ring-2 focus:ring-[var(--crm-gold)]/20">
                                <option value="">{t('filters.all')}</option>
                                {props.dossiers.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                            </select>
                        </section>
                    </form>
                </AppDrawer>

                <AppDrawer
                    isOpen={sidebarDrawerOpen}
                    onOpenChange={setSidebarDrawerOpen}
                    title={t('cities')}
                    size="sm"
                >
                    <CitySidebar
                        cells={props.cells}
                        selectedCity={filters.city || null}
                        selectedRoom={filters.room || null}
                        selectedBox={filters.box || null}
                        onSelectCity={(code) => { handleSelectCity(code); setSidebarDrawerOpen(false); }}
                        onSelectBox={(room, box) => { handleSelectBox(room, box); setSidebarDrawerOpen(false); }}
                    />
                </AppDrawer>

                <AppModal isOpen={cheatsheetOpen} onOpenChange={setCheatsheetOpen} title={t('modals.keyboardShortcuts')} size="sm">
                    <div className="space-y-2 text-[12px]">
                        {[
                            { keys: '⌘K', action: t('modals.focusSearch') },
                            { keys: 'N', action: t('modals.newArchive') },
                            { keys: '⇧N', action: t('modals.batchMenu') },
                            { keys: 'C', action: t('modals.checkoutSelected') },
                            { keys: 'R', action: t('modals.returnSelected') },
                            { keys: 'M', action: t('modals.moveSelected') },
                            { keys: '?', action: t('modals.showCheatsheet') },
                        ].map((item) => (
                            <div key={item.keys} className="flex items-center justify-between">
                                <kbd className="rounded border border-[var(--crm-border)] px-1.5 py-0.5 text-xs text-[var(--crm-text)]/80">{item.keys || ''}</kbd>
                                <span className="text-[var(--crm-text-muted)]">{item.action}</span>
                            </div>
                        ))}
                    </div>
                </AppModal>

                <AppModal isOpen={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title={t('modals.deleteTitle')} size="sm">
                    <p className="mb-4 text-[12px] text-[var(--crm-text-muted)]">{t('modals.deleteConfirm', { archiveNumber: deleteTarget?.archiveNumber })}</p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="bordered" size="sm" onPress={() => setDeleteTarget(null)}>{t('modals.cancel')}</AppButton>
                        <AppButton color="danger" variant="solid" size="sm" onPress={confirmDelete}>{t('modals.delete')}</AppButton>
                    </div>
                </AppModal>

                <AppModal isOpen={roomModalOpen} onOpenChange={setRoomModalOpen} title={t('modals.createRoom')} size="sm">
                    <div className="flex flex-col gap-3">
                        <DrawerSection icon={<IconBuilding size={12} />} title={t('modals.room')}>
                            <DrawerField label={t('modals.name')} error={roomErrors.name}>
                                <Input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="ex: SALLE A"
                                    className={drawerStyles.input}
                                />
                            </DrawerField>
                        </DrawerSection>

                        <DrawerSection icon={<IconLayersLinked size={12} />} title={t('modals.shelves')}>
                            <div className="grid grid-cols-2 gap-2">
                                <DrawerField label={t('modals.number')} error={roomErrors.shelves_count}>
                                    <Input
                                        type="number"
                                        value={String(shelvesCount)}
                                        onChange={(e) => setShelvesCount(Number(e.target.value) || 0)}
                                        min={0}
                                        max={30}
                                        step={1}
                                        placeholder="0"
                                        className={drawerStyles.input}
                                    />
                                </DrawerField>
                                <DrawerField label={t('modals.boxesPerShelf')} error={roomErrors.boxes_per_shelf}>
                                    <Input
                                        type="number"
                                        value={String(boxesPerShelf)}
                                        onChange={(e) => setBoxesPerShelf(Number(e.target.value) || 0)}
                                        min={0}
                                        max={30}
                                        step={1}
                                        placeholder="0"
                                        className={drawerStyles.input}
                                    />
                                </DrawerField>
                            </div>
                        </DrawerSection>

                        <DrawerSection icon={<IconFileText size={12} />} title={t('modals.description')}>
                            <DrawerField label={t('modals.optionalDescription')} error={roomErrors.description}>
                                <TextArea
                                    value={roomDescription}
                                    onChange={(e) => setRoomDescription(e.target.value)}
                                    placeholder="ex: Étage 2, aile nord"
                                    className={drawerStyles.textarea}
                                />
                            </DrawerField>
                        </DrawerSection>

                        <div className="flex justify-end gap-2">
                            <AppButton variant="bordered" size="sm" onPress={() => { setRoomModalOpen(false); setRoomErrors({}); }}>{t('modals.cancel')}</AppButton>
                            <AppButton variant="primary" size="sm" isDisabled={roomSubmitting} onPress={submitRoom}>{roomSubmitting ? t('modals.creating') : t('modals.create')}</AppButton>
                        </div>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
