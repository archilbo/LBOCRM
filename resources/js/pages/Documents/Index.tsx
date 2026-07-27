import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle, CheckCircle2, Download, Eye, FileText, FolderKanban,
    MoreHorizontal, Search, Trash2, UploadCloud, X, XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, Chip, Dropdown } from '@heroui/react';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { DocumentDrawer } from '@/components/drawers';
import { DocumentGroupedExplorer } from '@/features/documents/components/DocumentGroupedExplorer';
import type {
    ClientOption, DocumentStatus, DocumentTemplateOption, DocumentUploadPayload,
    DocumentLocationGroup, DossierDocumentRow, DossierOption,
} from '@/features/documents/types';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

type PageProps = {
    documents: DossierDocumentRow[];
    documentGroups: DocumentLocationGroup[];
    clients: ClientOption[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    metrics: { total: number; uploaded: number; verified: number; missing: number; templates: number };
};

type ViewMode = 'workspace' | 'grouped';

const STATUS_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'danger' | 'default'> = {
    verified: 'success',
    uploaded: 'primary',
    missing: 'warning',
    rejected: 'danger',
};

function fileTypeBadge(mimeType: string | null | undefined): { label: string; color: string } {
    if (!mimeType) return { label: 'File', color: 'bg-[var(--surface-3)] text-[var(--text-muted)]' };
    if (mimeType === 'application/pdf') return { label: 'PDF', color: 'bg-rose-500/10 text-rose-400' };
    if (mimeType.includes('wordprocessingml')) return { label: 'DOCX', color: 'bg-sky-500/10 text-sky-400' };
    if (mimeType.includes('spreadsheetml')) return { label: 'XLSX', color: 'bg-emerald-500/10 text-emerald-400' };
    if (mimeType.startsWith('image/')) return { label: 'IMG', color: 'bg-violet-500/10 text-violet-400' };
    return { label: 'File', color: 'bg-[var(--surface-3)] text-[var(--text-muted)]' };
}

function hasSearchMatch(document: DossierDocumentRow, query: string) {
    if (!query.trim()) return true;
    return [document.templateName, document.documentType, document.documentNumber,
        document.originalFilename, document.dossierNumber, document.projectObject,
        document.clientName, document.status, document.notes]
        .filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

export default function DocumentsIndex({ documents, documentGroups, clients, dossiers, templates, metrics }: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [query, setQuery] = useState('');
    const [previewDoc, setPreviewDoc] = useState<DossierDocumentRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DossierDocumentRow | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('command') !== 'upload') return;
        setDrawerOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
    }, []);

    const statusOptions = useMemo(() => {
        const counts: Record<string, number> = {};
        documents.forEach((d) => { counts[d.status] = (counts[d.status] || 0) + 1; });
        return [
            { id: 'all', label: t('documents.status.all'), count: documents.length },
            { id: 'uploaded', label: t('documents.status.uploaded'), count: counts.uploaded || 0 },
            { id: 'verified', label: t('documents.status.verified'), count: counts.verified || 0 },
            { id: 'missing', label: t('documents.status.missing'), count: counts.missing || 0 },
            { id: 'rejected', label: t('documents.status.rejected'), count: counts.rejected || 0 },
        ];
    }, [documents, t]);

    const filteredDocuments = useMemo(
        () => documents.filter((d) => {
            if (statusFilter !== 'all' && d.status !== statusFilter) return false;
            return hasSearchMatch(d, query);
        }),
        [documents, query, statusFilter],
    );

    const verifiedPct = metrics.total > 0 ? Math.round((metrics.verified / metrics.total) * 100) : 0;
    const missingDocs = useMemo(() => documents.filter((d) => d.status === 'missing'), [documents]);
    const topMissing = useMemo(() => {
        const seen = new Set<string>();
        return missingDocs.filter((d) => {
            const key = d.dossierNumber || '';
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, 3);
    }, [missingDocs]);

    function handleSubmit(payload: DocumentUploadPayload) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId || '');
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');
        if (payload.file) formData.append('file', payload.file);
        router.post('/documents', formData, {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setIsUploading(false); toast.success('Document saved successfully.'); },
            onError: () => { setIsUploading(false); toast.error('Please check document form errors.'); },
        });
    }

    function updateStatus(document: DossierDocumentRow, status: string) {
        router.put(`/documents/${document.id}/status`, { status, notes: document.notes || '' }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Document status updated.'),
            onError: () => toast.error('Document status could not be updated.'),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/documents/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Document deleted successfully.'); setDeleteTarget(null); },
            onError: () => toast.error('Document could not be deleted.'),
        });
    }

    function DocumentRowMenu({ doc }: { doc: DossierDocumentRow }) {
        return (
            <Dropdown>
                <Dropdown.Trigger className="flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]">
                    <MoreHorizontal size={15} />
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end" className="min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-xl">
                    <Dropdown.Menu
                        onAction={(key) => {
                            if (key === 'preview') setPreviewDoc(doc);
                            else if (key === 'verify') updateStatus(doc, 'verified');
                            else if (key === 'download') window.location.href = doc.downloadUrl!;
                            else if (key === 'project') router.visit(`/dossiers/${doc.dossierId}`);
                            else if (key === 'missing') updateStatus(doc, 'missing');
                            else if (key === 'delete') setDeleteTarget(doc);
                        }}
                        itemClasses={{
                            base: 'rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)]',
                        }}
                    >
                        <Dropdown.Item key="preview" id="preview">
                            <div className="flex items-center gap-2">
                                <Eye size={14} className="shrink-0 text-sky-400" />
                                <span>Preview</span>
                            </div>
                        </Dropdown.Item>
                        {doc.status !== 'verified' && (
                            <Dropdown.Item key="verify" id="verify">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                                    <span>Mark verified</span>
                                </div>
                            </Dropdown.Item>
                        )}
                        {doc.hasFile && doc.downloadUrl && (
                            <Dropdown.Item key="download" id="download">
                                <div className="flex items-center gap-2">
                                    <Download size={14} className="shrink-0 text-blue-400" />
                                    <span>Download</span>
                                </div>
                            </Dropdown.Item>
                        )}
                        <Dropdown.Item key="project" id="project">
                            <div className="flex items-center gap-2">
                                <FolderKanban size={14} className="shrink-0 text-violet-400" />
                                <span>Open project</span>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Item key="missing" id="missing">
                            <div className="flex items-center gap-2">
                                <XCircle size={14} className="shrink-0 text-amber-400" />
                                <span>Mark missing</span>
                            </div>
                        </Dropdown.Item>
                        <Dropdown.Section title="Danger" classNames={{ heading: 'mb-0.5 px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]' }}>
                            <Dropdown.Item key="delete" id="delete" className="text-red-400 data-[hover]:bg-red-400/10">
                                <div className="flex items-center gap-2">
                                    <Trash2 size={14} className="shrink-0 text-red-400" />
                                    <span>Delete</span>
                                </div>
                            </Dropdown.Item>
                        </Dropdown.Section>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        );
    }

    function StatusLifecycle({ status }: { status: DocumentStatus }) {
        const steps = [
            { key: 'missing', label: 'Missing' },
            { key: 'uploaded', label: 'Uploaded' },
            { key: 'verified', label: 'Verified' },
        ];
        const currentIdx = steps.findIndex((s) => s.key === status);
        return (
            <div className="flex items-center gap-2">
                {steps.map((step, idx) => {
                    const isDone = idx <= currentIdx;
                    const isCurrent = step.key === status;
                    return (
                        <div key={step.key} className="flex items-center gap-2">
                            <span className={cn(
                                'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                                isDone && step.key === 'verified' && 'bg-emerald-500/15 text-emerald-400',
                                isDone && step.key === 'uploaded' && 'bg-sky-500/15 text-sky-400',
                                isDone && step.key === 'missing' && 'bg-amber-500/15 text-amber-400',
                                !isDone && 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                                isCurrent && 'ring-2 ring-offset-1 ring-offset-[var(--surface)]',
                                isCurrent && step.key === 'verified' && 'ring-emerald-500/40',
                                isCurrent && step.key === 'uploaded' && 'ring-sky-500/40',
                                isCurrent && step.key === 'missing' && 'ring-amber-500/40',
                            )}>
                                {isDone ? <CheckCircle2 size={12} /> : idx + 1}
                            </span>
                            <span className={cn(
                                'text-[11px]',
                                isCurrent && 'font-semibold text-[var(--foreground)]',
                                isDone && !isCurrent && 'text-[var(--text-muted)]',
                                !isDone && 'text-[var(--text-subtle)]',
                            )}>{step.label}</span>
                            {idx < 2 && <span className="text-[var(--text-subtle)]">/</span>}
                        </div>
                    );
                })}
            </div>
        );
    }

    const columns = useMemo<ColumnDef<DossierDocumentRow, unknown>[]>(() => [
        {
            accessorKey: 'templateName',
            header: 'Document',
            cell: ({ row }) => {
                const badge = fileTypeBadge(row.original.mimeType);
                return (
                    <div className="flex items-center gap-2">
                        <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', badge.color)}>
                            <FileText size={13} />
                        </span>
                        <div className="min-w-0">
                            <p className="max-w-[200px] truncate text-xs font-medium text-[var(--foreground)]">
                                {row.original.templateName || row.original.originalFilename || 'Document'}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                                {row.original.documentNumber || row.original.documentType}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'dossierNumber',
            header: 'Project',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <FolderKanban size={12} className="shrink-0 text-[var(--text-subtle)]" />
                    <div className="min-w-0">
                        <p className="max-w-[160px] truncate text-xs font-medium text-[var(--foreground)]">{row.original.dossierNumber || '-'}</p>
                        <p className="max-w-[160px] truncate text-[10px] text-[var(--text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            cell: ({ row }) => (
                <p className="max-w-[140px] truncate text-xs text-[var(--text-muted)]">{row.original.clientName || '-'}</p>
            ),
        },
        {
            accessorKey: 'originalFilename',
            header: 'File',
            cell: ({ row }) => {
                const badge = fileTypeBadge(row.original.mimeType);
                return (
                    <div className="flex items-center gap-1.5">
                        <span className={cn('inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold', badge.color)}>
                            {badge.label}
                        </span>
                        <div className="min-w-0">
                            <p className="max-w-[140px] truncate text-[11px] text-[var(--foreground)]">{row.original.originalFilename || '-'}</p>
                            <p className="text-[9px] text-[var(--text-subtle)]">{row.original.sizeLabel || ''}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Chip variant="flat" size="sm" color={STATUS_COLORS[row.original.status] || 'default'}>{row.original.status}</Chip>
            ),
        },
        {
            accessorKey: 'uploadedAt',
            header: 'Uploaded',
            cell: ({ row }) => (
                <div>
                    <p className="text-[11px] text-[var(--text-muted)]">{row.original.uploadedAt || '-'}</p>
                    {row.original.verifiedAt && (
                        <p className="text-[9px] text-[var(--text-subtle)]">V: {row.original.verifiedAt}</p>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => <DocumentRowMenu doc={row.original} />,
        },
    ], []);

    return (
        <>
            <Head title="Documents" />

            <AppShell>
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('documents.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('documents.title')}
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                            {t('documents.subtitle')}
                        </p>
                    </div>
                    <AppButton variant="solid" color="primary" size="sm" className="h-9 shrink-0" onPress={() => setDrawerOpen(true)}>
                        <UploadCloud size={15} /> Upload document
                    </AppButton>
                </header>

                <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                    {([
                        { label: t('documents.metrics.total'), value: metrics.total, icon: <FileText size={13} />, bg: 'bg-[var(--surface-2)]' },
                        { label: t('documents.metrics.uploaded'), value: metrics.uploaded, icon: <UploadCloud size={13} />, bg: 'bg-sky-500/10 text-sky-400' },
                        { label: t('documents.metrics.verified'), value: metrics.verified, icon: <CheckCircle2 size={13} />, bg: 'bg-emerald-500/10 text-emerald-400' },
                        { label: t('documents.metrics.missing'), value: metrics.missing, icon: <AlertTriangle size={13} />, bg: metrics.missing > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]' },
                        { label: t('documents.metrics.templates'), value: metrics.templates, icon: <FileText size={13} />, bg: 'bg-[var(--surface-2)]' },
                    ] as const).map((card) => (
                        <Card key={card.label} className="flex-row items-center gap-0 border border-[var(--border)] p-2 shadow-sm">
                            <span className={cn('flex size-7 items-center justify-center rounded-md shrink-0', card.bg)}>
                                {card.icon}
                            </span>
                            <div className="ml-2 min-w-0">
                                <p className="text-[10px] font-medium text-[var(--text-muted)]">{card.label}</p>
                                <p className={cn('text-[15px] font-semibold text-[var(--foreground)] leading-4')}>{card.value}</p>
                            </div>
                        </Card>
                    ))}
                </section>

                {metrics.total > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">Verification progress</p>
                                <span className="text-[13px] font-bold text-[var(--accent)]">{verifiedPct}%</span>
                            </div>
                            <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${verifiedPct}%` }} />
                            </div>
                            <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                                <span className="font-semibold text-emerald-400">{metrics.verified}</span> verified / <span className="font-semibold text-[var(--foreground)]">{metrics.total}</span> total
                            </p>
                        </div>
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[12px] font-semibold text-[var(--foreground)]">Missing documents</p>
                                <span className={cn('text-[13px] font-bold', metrics.missing > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                                    {metrics.missing > 0 ? metrics.missing : 'None'}
                                </span>
                            </div>
                            {topMissing.length > 0 ? (
                                <div className="space-y-1.5">
                                    {topMissing.map((doc) => (
                                        <button key={doc.id} type="button" onClick={() => router.visit(`/dossiers/${doc.dossierId}`)}
                                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                            <AlertTriangle size={12} className="shrink-0 text-amber-400" />
                                            <span className="truncate">{doc.dossierNumber} — {doc.templateName || doc.originalFilename}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/8 px-3 py-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <p className="text-[12px] text-emerald-400">All documents accounted for</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Tab bar ── */}
                <div className="flex items-center gap-6 border-b border-[var(--border)]">
                    {(['workspace', 'grouped'] as const).map((mode) => (
                        <button key={mode} type="button" onClick={() => setViewMode(mode)}
                            className={cn(
                                'relative pb-2.5 text-[12px] font-semibold transition',
                                viewMode === mode ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                            )}>
                            {mode === 'workspace' ? 'Workspace' : 'Grouped'}
                            {viewMode === mode ? (
                                <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[var(--accent)]" />
                            ) : null}
                        </button>
                    ))}
                </div>

                {viewMode === 'grouped' ? (
                    <DocumentGroupedExplorer groups={documentGroups} onPreview={(doc) => setPreviewDoc(doc)} />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <AppDataTable
                                data={filteredDocuments}
                                columns={columns}
                                emptyTitle="No documents found"
                                emptyDescription="Change filters or upload a project document."
                                pageSize={15}
                                onRowClick={(doc) => setPreviewDoc(doc)}
                                compact
                                toolbarActions={
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-44">
                                            <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <input value={query} onChange={(e) => setQuery(e.target.value)}
                                                placeholder="Search..."
                                                className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-2 text-[11px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                                            />
                                            {query ? (
                                                <button type="button" onClick={() => setQuery('')}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                                                    <X size={12} />
                                                </button>
                                            ) : null}
                                        </div>
                                        <Dropdown>
                                            <Dropdown.Trigger className={cn('inline-flex h-7 items-center gap-1.5 rounded-lg border px-2 text-[11px] font-medium transition', statusFilter !== 'all' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>
                                                <span className="flex items-center gap-1">
                                                    {statusOptions.find((o) => o.id === statusFilter)?.label || 'Status'}
                                                    <span className="rounded bg-[var(--surface-2)] px-1 py-px text-[9px] font-semibold text-[var(--text-muted)]">
                                                        {statusOptions.find((o) => o.id === statusFilter)?.count ?? documents.length}
                                                    </span>
                                                </span>
                                            </Dropdown.Trigger>
                                            <Dropdown.Popover placement="bottom start" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                                <Dropdown.Menu
                                                    selectionMode="single"
                                                    selectedKeys={[statusFilter]}
                                                    disabledKeys={statusOptions.filter((o) => o.count === 0).map((o) => o.id)}
                                                    onAction={(key) => setStatusFilter(key as string)}
                                                    itemClasses={{ base: 'rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40' }}
                                                >
                                                    {statusOptions.map((opt) => (
                                                        <Dropdown.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                                            <div className="flex w-full items-center gap-2">
                                                                <Dropdown.ItemIndicator>
                                                                    <CheckCircle2 size={13} className="text-[var(--accent)]" />
                                                                </Dropdown.ItemIndicator>
                                                                <span className="flex-1">{opt.label}</span>
                                                                <span className="rounded bg-[var(--surface-2)] px-1.5 py-px text-[9px] font-semibold text-[var(--text-muted)]">{opt.count}</span>
                                                            </div>
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown.Popover>
                                        </Dropdown>
                                        <span className="text-[10px] text-[var(--text-muted)]">{filteredDocuments.length} document(s)</span>
                                    </div>
                                }
                            />
                        </div>
                        <div className="block md:hidden">
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                                {filteredDocuments.length > 0 ? (
                                    <div className="divide-y divide-[var(--border)]">
                                        {filteredDocuments.map((doc) => {
                                            const badge = fileTypeBadge(doc.mimeType);
                                            return (
                                                <div key={doc.id} className="flex items-center gap-3 p-3 transition hover:bg-[var(--surface-2)]">
                                                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', badge.color)}>
                                                        <FileText size={13} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-medium text-[var(--foreground)]">
                                                            {doc.templateName || doc.originalFilename || 'Document'}
                                                        </p>
                                                        <p className="text-[10px] text-[var(--text-muted)]">{doc.dossierNumber || ''}</p>
                                                        <div className="mt-0.5 flex items-center gap-1.5">
                                                            <Chip variant="flat" size="sm" color={STATUS_COLORS[doc.status] || 'default'}>{doc.status}</Chip>
                                                            <span className={cn('inline-flex items-center rounded px-1 py-0.5 text-[8px] font-bold', badge.color)}>
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Dropdown>
                                                        <Dropdown.Trigger className="flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)]">
                                                            <MoreHorizontal size={14} />
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-xl">
                                                            <Dropdown.Menu
                                                                onAction={(key) => {
                                                                    if (key === 'preview') setPreviewDoc(doc);
                                                                    else if (key === 'verify') updateStatus(doc, 'verified');
                                                                    else if (key === 'download') window.location.href = doc.downloadUrl!;
                                                                    else if (key === 'delete') setDeleteTarget(doc);
                                                                }}
                                                                itemClasses={{
                                                                    base: 'rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)]',
                                                                }}
                                                            >
                                                                <Dropdown.Item key="preview"><div className="flex items-center gap-2"><Eye size={14} className="shrink-0 text-sky-400" /><span>Preview</span></div></Dropdown.Item>
                                                                {doc.status !== 'verified' && (
                                                                    <Dropdown.Item key="verify"><div className="flex items-center gap-2"><CheckCircle2 size={14} className="shrink-0 text-emerald-400" /><span>Verify</span></div></Dropdown.Item>
                                                                )}
                                                                {doc.hasFile && doc.downloadUrl && (
                                                                    <Dropdown.Item key="download"><div className="flex items-center gap-2"><Download size={14} className="shrink-0 text-blue-400" /><span>Download</span></div></Dropdown.Item>
                                                                )}
                                                                <Dropdown.Section title="Danger" classNames={{ heading: 'mb-0.5 px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]' }}>
                                                                    <Dropdown.Item key="delete" className="text-red-400 data-[hover]:bg-red-400/10"><div className="flex items-center gap-2"><Trash2 size={14} className="shrink-0 text-red-400" /><span>Delete</span></div></Dropdown.Item>
                                                                </Dropdown.Section>
                                                            </Dropdown.Menu>
                                                        </Dropdown.Popover>
                                                    </Dropdown>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm font-medium text-[var(--foreground)]">No documents found</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">Change filters or upload a document.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <DocumentDrawer
                    isOpen={drawerOpen}
                    clients={clients}
                    dossiers={dossiers}
                    templates={templates}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    isSubmitting={isUploading}
                />

                <AppDrawer
                    isOpen={!!previewDoc}
                    onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}
                    title={previewDoc?.templateName || previewDoc?.originalFilename || 'Document'}
                >
                    {previewDoc ? (
                        <div className="space-y-5 pb-8">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] ring-1 ring-[var(--border)]">
                                    <FileText size={18} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                                        {previewDoc.templateName || previewDoc.originalFilename}
                                        <Chip variant="flat" size="sm" color={STATUS_COLORS[previewDoc.status] || 'default'}>{previewDoc.status}</Chip>
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">{previewDoc.documentNumber || previewDoc.documentType}</p>
                                </div>
                            </div>

                            {previewDoc.hasFile && previewDoc.downloadUrl && (
                                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                    {previewDoc.mimeType?.startsWith('image/') ? (
                                        <img src={previewDoc.downloadUrl} alt={previewDoc.originalFilename || ''}
                                            className="max-h-[240px] w-full object-contain bg-[var(--surface-2)]" />
                                    ) : previewDoc.mimeType === 'application/pdf' ? (
                                        <iframe src={previewDoc.downloadUrl} title="PDF preview"
                                            className="h-[240px] w-full bg-[var(--surface-2)]" />
                                    ) : (
                                        <div className="flex h-32 items-center justify-center bg-[var(--surface-2)]">
                                            <div className="text-center">
                                                <FileText size={32} className="mx-auto text-[var(--text-muted)]" />
                                                <p className="mt-1.5 text-[11px] font-medium text-[var(--text-muted)]">{previewDoc.originalFilename || 'No preview'}</p>
                                                <p className="text-[9px] text-[var(--text-subtle)]">{previewDoc.sizeLabel || ''}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Status</p>
                                <StatusLifecycle status={previewDoc.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Project</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewDoc.dossierNumber || '-'}</p>
                                    <p className="truncate text-xs text-[var(--text-muted)]">{previewDoc.projectObject || '-'}</p>
                                </Card>
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Client</p>
                                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{previewDoc.clientName || '-'}</p>
                                </Card>
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">File</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewDoc.originalFilename || '-'}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{previewDoc.sizeLabel || ''}</p>
                                </Card>
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Uploaded</p>
                                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{previewDoc.uploadedAt || '-'}</p>
                                    {previewDoc.verifiedAt && (
                                        <p className="text-xs text-emerald-400">V: {previewDoc.verifiedAt}</p>
                                    )}
                                </Card>
                            </div>

                            {previewDoc.notes ? (
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Notes</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">{previewDoc.notes}</p>
                                </Card>
                            ) : null}

                            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2 shadow-sm">
                                {previewDoc.status !== 'verified' && (
                                    <AppButton size="sm" variant="solid" color="primary" className="min-w-0 h-8 text-[11px]" onPress={() => { updateStatus(previewDoc, 'verified'); }}>
                                        <CheckCircle2 size={13} /> Verify
                                    </AppButton>
                                )}
                                {previewDoc.hasFile && previewDoc.downloadUrl && (
                                    <>
                                        {previewDoc.status !== 'verified' && <span className="h-5 w-px bg-[var(--border)]" />}
                                        <AppButton size="sm" variant="bordered" className="min-w-0 h-8 text-[11px]" onPress={() => { window.location.href = previewDoc.downloadUrl!; }}>
                                            <Download size={13} /> Download
                                        </AppButton>
                                    </>
                                )}
                                <span className="h-5 w-px bg-[var(--border)]" />
                                <AppButton size="sm" variant="bordered" className="min-w-0 h-8 text-[11px]" onPress={() => { router.visit(`/dossiers/${previewDoc.dossierId}`); }}>
                                    <FolderKanban size={13} /> Project
                                </AppButton>
                                <span className="h-5 w-px bg-[var(--border)]" />
                                <AppButton size="sm" variant="bordered" className="min-w-0 h-8 text-[11px]" onPress={() => { updateStatus(previewDoc, 'missing'); }}>
                                    <XCircle size={13} /> Missing
                                </AppButton>
                                <span className="h-5 w-px bg-[var(--border)]" />
                                <AppButton size="sm" variant="light" className="min-w-0 h-8 px-2 text-[11px] text-red-400" onPress={() => { setDeleteTarget(previewDoc); setPreviewDoc(null); }}>
                                    <Trash2 size={13} /> Delete
                                </AppButton>
                            </div>
                        </div>
                    ) : null}
                </AppDrawer>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Supprimer le document ?"
                    size="sm"
                >
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 mb-4">
                        <AlertTriangle size={18} className="shrink-0 text-red-400" />
                        <p className="text-xs text-[var(--text-muted)]">
                            Cette action est <span className="font-semibold text-red-400">irreversible</span>.
                        </p>
                    </div>
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Confirmez la suppression de <strong>{deleteTarget?.templateName || deleteTarget?.originalFilename || 'ce document'}</strong>.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="light" onPress={() => setDeleteTarget(null)}>Annuler</AppButton>
                        <AppButton variant="solid" color="danger" onPress={confirmDelete} isLoading={actionLoading}>Supprimer</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
