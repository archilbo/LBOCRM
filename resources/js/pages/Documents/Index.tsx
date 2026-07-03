import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    AlertTriangle, CheckCircle2, Download, Eye, FileText, FolderKanban,
    MoreHorizontal, Trash2, UploadCloud, XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { DocumentUploadDrawer } from '@/features/documents/drawers/DocumentUploadDrawer';
import { DocumentGroupedExplorer } from '@/features/documents/components/DocumentGroupedExplorer';
import type {
    DocumentStatus, DocumentTemplateOption, DocumentUploadPayload,
    DocumentLocationGroup, DossierDocumentRow, DossierOption,
} from '@/features/documents/types';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

type PageProps = {
    documents: DossierDocumentRow[];
    documentGroups: DocumentLocationGroup[];
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

export default function DocumentsIndex({ documents, documentGroups, dossiers, templates, metrics }: PageProps) {
    const { t } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [query, setQuery] = useState('');
    const [previewDoc, setPreviewDoc] = useState<DossierDocumentRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DossierDocumentRow | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        if (!openMenuId) return;
        function close(e: MouseEvent | KeyboardEvent) {
            if (e instanceof KeyboardEvent && e.key === 'Escape') { setOpenMenuId(null); return; }
            setOpenMenuId(null);
        }
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', close);
        return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
    }, [openMenuId]);

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
        const isOpen = openMenuId === doc.id;
        return (
            <div className="relative flex justify-end">
                <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : doc.id); }}
                    className={cn(
                        'flex size-8 items-center justify-center rounded-lg border transition',
                        isOpen
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                            : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                    )}>
                    <MoreHorizontal size={15} />
                </button>
                {isOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[170px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => { setPreviewDoc(doc); setOpenMenuId(null); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                            <Eye size={14} /> Preview
                        </button>
                        {doc.status !== 'verified' && (
                            <button type="button" onClick={() => { updateStatus(doc, 'verified'); setOpenMenuId(null); }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                <CheckCircle2 size={14} /> Mark verified
                            </button>
                        )}
                        {doc.hasFile && doc.downloadUrl && (
                            <button type="button" onClick={() => { window.location.href = doc.downloadUrl!; setOpenMenuId(null); }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                                <Download size={14} /> Download
                            </button>
                        )}
                        <button type="button" onClick={() => { router.visit(`/dossiers/${doc.dossierId}`); setOpenMenuId(null); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                            <FolderKanban size={14} /> Open project
                        </button>
                        <button type="button" onClick={() => { updateStatus(doc, 'missing'); setOpenMenuId(null); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-amber-400 transition hover:bg-amber-400/10">
                            <XCircle size={14} /> Mark missing
                        </button>
                        <div className="my-1 border-t border-[var(--border)]" />
                        <button type="button" onClick={() => { setDeleteTarget(doc); setOpenMenuId(null); }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--danger)] transition hover:bg-[var(--danger)]/10">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                )}
            </div>
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
                    <div className="flex items-center gap-3">
                        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', badge.color)}>
                            <FileText size={16} />
                        </span>
                        <div className="min-w-0">
                            <p className="max-w-[240px] truncate text-[13px] font-medium text-[var(--foreground)]">
                                {row.original.templateName || row.original.originalFilename || 'Document'}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">
                                {row.original.documentNumber || row.original.documentType || 'No number'}
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
                <div className="flex items-start gap-2">
                    <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--text-subtle)]" />
                    <div className="min-w-0">
                        <p className="max-w-[180px] truncate text-[13px] font-medium text-[var(--foreground)]">{row.original.dossierNumber || '-'}</p>
                        <p className="max-w-[180px] truncate text-[11px] text-[var(--text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            cell: ({ row }) => (
                <p className="max-w-[160px] truncate text-[13px] text-[var(--text-muted)]">{row.original.clientName || '-'}</p>
            ),
        },
        {
            accessorKey: 'originalFilename',
            header: 'File',
            cell: ({ row }) => {
                const badge = fileTypeBadge(row.original.mimeType);
                return (
                    <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold', badge.color)}>
                            {badge.label}
                        </span>
                        <div className="min-w-0">
                            <p className="max-w-[160px] truncate text-[12px] text-[var(--foreground)]">{row.original.originalFilename || '-'}</p>
                            <p className="text-[10px] text-[var(--text-subtle)]">{row.original.sizeLabel || ''}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <StatusPill label={row.original.status} color={STATUS_COLORS[row.original.status] || 'default'} size="sm" />
            ),
        },
        {
            accessorKey: 'uploadedAt',
            header: 'Uploaded',
            cell: ({ row }) => (
                <div>
                    <p className="text-[12px] text-[var(--text-muted)]">{row.original.uploadedAt || '-'}</p>
                    {row.original.verifiedAt && (
                        <p className="text-[10px] text-[var(--text-subtle)]">Verified: {row.original.verifiedAt}</p>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => <DocumentRowMenu doc={row.original} />,
        },
    ], [openMenuId]);

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

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {([
                        { label: t('documents.metrics.total'), value: metrics.total, detail: 'All document rows', icon: <FileText size={16} /> },
                        { label: t('documents.metrics.uploaded'), value: metrics.uploaded, detail: 'Files uploaded', icon: <UploadCloud size={16} /> },
                        { label: t('documents.metrics.verified'), value: metrics.verified, detail: 'Ready for workflow', icon: <CheckCircle2 size={16} />, accent: 'text-emerald-500' },
                        { label: t('documents.metrics.missing'), value: metrics.missing, detail: 'Blocking documents', icon: <AlertTriangle size={16} />, accent: metrics.missing > 0 ? 'text-amber-500' : 'text-[var(--text-muted)]' },
                        { label: t('documents.metrics.templates'), value: metrics.templates, detail: 'Active required types', icon: <FileText size={16} /> },
                    ] as const).map((card) => (
                        <div key={card.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                            <div className={cn('mb-2 flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)]', card.accent || 'text-[var(--text-muted)]')}>
                                {card.icon}
                            </div>
                            <p className="text-[12px] font-medium text-[var(--text-muted)]">{card.label}</p>
                            <p className={cn('mt-0.5 text-2xl font-semibold text-[var(--foreground)]', card.accent)}>{card.value}</p>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{card.detail}</p>
                        </div>
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

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => {
                            const active = option.id === statusFilter;
                            return (
                                <button key={option.id} type="button" onClick={() => setStatusFilter(option.id)}
                                    className={cn(
                                        'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition',
                                        active
                                            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'
                                            : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--foreground)]',
                                    )}>
                                    {option.label}
                                    <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px]">{option.count}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
                        <button type="button" onClick={() => setViewMode('workspace')}
                            className={cn(
                                'h-8 rounded-md px-3 text-[12px] font-medium transition',
                                viewMode === 'workspace'
                                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                            )}>Workspace</button>
                        <button type="button" onClick={() => setViewMode('grouped')}
                            className={cn(
                                'h-8 rounded-md px-3 text-[12px] font-medium transition',
                                viewMode === 'grouped'
                                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                            )}>Grouped</button>
                    </div>
                </div>

                {viewMode === 'grouped' ? (
                    <DocumentGroupedExplorer groups={documentGroups} onPreview={(doc) => setPreviewDoc(doc)} />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <AppDataTable
                                data={filteredDocuments}
                                columns={columns}
                                searchPlaceholder="Search documents, projects, clients, files..."
                                emptyTitle="No documents found"
                                emptyDescription="Change filters or upload a project document."
                                pageSize={15}
                                onRowClick={(doc) => setPreviewDoc(doc)}
                                toolbarActions={
                                    <AppButton size="sm" variant="bordered" className="h-8 text-[11px]" onPress={() => setStatusFilter('all')}>
                                        Reset
                                    </AppButton>
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
                                                <div key={doc.id} className="flex items-start gap-3 p-3 transition hover:bg-[var(--surface-2)]">
                                                    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', badge.color)}>
                                                        <FileText size={15} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                                                            {doc.templateName || doc.originalFilename || 'Document'}
                                                        </p>
                                                        <p className="text-[11px] text-[var(--text-muted)]">{doc.dossierNumber || ''}</p>
                                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                                            <StatusPill label={doc.status} color={STATUS_COLORS[doc.status] || 'default'} size="sm" />
                                                            <span className={cn('inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold', badge.color)}>
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="relative shrink-0">
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === doc.id ? null : doc.id); }}
                                                            className={cn(
                                                                'flex size-8 items-center justify-center rounded-lg border transition',
                                                                openMenuId === doc.id
                                                                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                                                                    : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface-2)]',
                                                            )}>
                                                            <MoreHorizontal size={15} />
                                                        </button>
                                                        {openMenuId === doc.id && (
                                                            <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl"
                                                                onClick={(e) => e.stopPropagation()}>
                                                                <button type="button" onClick={() => { setPreviewDoc(doc); setOpenMenuId(null); }}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-2)]">
                                                                    <Eye size={14} /> Preview
                                                                </button>
                                                                {doc.status !== 'verified' && (
                                                                    <button type="button" onClick={() => { updateStatus(doc, 'verified'); setOpenMenuId(null); }}
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-2)]">
                                                                        <CheckCircle2 size={14} /> Verify
                                                                    </button>
                                                                )}
                                                                <button type="button" onClick={() => { window.location.href = doc.downloadUrl!; setOpenMenuId(null); }}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--foreground)] hover:bg-[var(--surface-2)]">
                                                                    <Download size={14} /> Download
                                                                </button>
                                                                <button type="button" onClick={() => { setDeleteTarget(doc); setOpenMenuId(null); }}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] text-[var(--danger)] hover:bg-[var(--danger)]/10">
                                                                    <Trash2 size={14} /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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

                <DocumentUploadDrawer
                    isOpen={drawerOpen}
                    dossiers={dossiers}
                    templates={templates}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                    isSubmitting={isUploading}
                />

                <AppDrawer
                    isOpen={!!previewDoc}
                    onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}
                    title={previewDoc?.templateName || previewDoc?.originalFilename || 'Document Preview'}
                >
                    {previewDoc ? (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                                    <FileText size={18} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[15px] font-semibold text-[var(--foreground)] truncate">
                                        {previewDoc.templateName || previewDoc.originalFilename}
                                    </p>
                                    <p className="text-[12px] text-[var(--text-muted)]">{previewDoc.documentNumber || previewDoc.documentType}</p>
                                </div>
                                <StatusPill label={previewDoc.status} color={STATUS_COLORS[previewDoc.status] || 'default'} size="sm" className="shrink-0" />
                            </div>

                            {previewDoc.hasFile && previewDoc.downloadUrl && (
                                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                    {previewDoc.mimeType?.startsWith('image/') ? (
                                        <img src={previewDoc.downloadUrl} alt={previewDoc.originalFilename || ''}
                                            className="max-h-[300px] w-full object-contain bg-[var(--surface-2)]" />
                                    ) : previewDoc.mimeType === 'application/pdf' ? (
                                        <iframe src={previewDoc.downloadUrl} title="PDF preview"
                                            className="h-[300px] w-full bg-[var(--surface-2)]" />
                                    ) : (
                                        <div className="flex h-40 items-center justify-center bg-[var(--surface-2)]">
                                            <div className="text-center">
                                                <FileText size={36} className="mx-auto text-[var(--text-muted)]" />
                                                <p className="mt-2 text-[12px] font-medium text-[var(--text-muted)]">{previewDoc.originalFilename || 'No preview'}</p>
                                                <p className="text-[10px] text-[var(--text-subtle)]">{previewDoc.sizeLabel || ''}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/50 p-3">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Status lifecycle</p>
                                <StatusLifecycle status={previewDoc.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Project</p>
                                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--foreground)]">{previewDoc.dossierNumber || '-'}</p>
                                    <p className="truncate text-[11px] text-[var(--text-muted)]">{previewDoc.projectObject || '-'}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Client</p>
                                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--foreground)]">{previewDoc.clientName || '-'}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">File</p>
                                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--foreground)]">{previewDoc.originalFilename || 'No file'}</p>
                                    <p className="text-[11px] text-[var(--text-muted)]">{previewDoc.sizeLabel || '-'}</p>
                                    {previewDoc.mimeType && (
                                        <p className="text-[10px] text-[var(--text-subtle)]">{previewDoc.mimeType}</p>
                                    )}
                                </div>
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Uploaded</p>
                                    <p className="mt-1 truncate text-[13px] font-semibold text-[var(--foreground)]">{previewDoc.uploadedAt || '-'}</p>
                                    {previewDoc.verifiedAt && (
                                        <p className="text-[11px] text-emerald-400">Verified: {previewDoc.verifiedAt}</p>
                                    )}
                                </div>
                            </div>

                            {previewDoc.notes ? (
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Notes</p>
                                    <p className="mt-1 text-[12px] text-[var(--text-muted)]">{previewDoc.notes}</p>
                                </div>
                            ) : null}

                            <div className="border-t border-[var(--border)] pt-4">
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Actions</p>
                                <div className="flex flex-wrap gap-2">
                                    {previewDoc.status !== 'verified' && (
                                        <AppButton size="sm" variant="solid" color="primary" onPress={() => { updateStatus(previewDoc, 'verified'); }}>
                                            <CheckCircle2 size={14} /> Mark verified
                                        </AppButton>
                                    )}
                                    {previewDoc.hasFile && previewDoc.downloadUrl && (
                                        <AppButton size="sm" variant="bordered" onPress={() => { window.location.href = previewDoc.downloadUrl!; }}>
                                            <Download size={14} /> Download
                                        </AppButton>
                                    )}
                                    <AppButton size="sm" variant="bordered" onPress={() => { router.visit(`/dossiers/${previewDoc.dossierId}`); }}>
                                        <FolderKanban size={14} /> Open project
                                    </AppButton>
                                    <AppButton size="sm" variant="bordered" onPress={() => { updateStatus(previewDoc, 'missing'); }}>
                                        <XCircle size={14} /> Mark missing
                                    </AppButton>
                                    <AppButton size="sm" variant="solid" color="danger" onPress={() => { setDeleteTarget(previewDoc); setPreviewDoc(null); }}>
                                        <Trash2 size={14} /> Delete
                                    </AppButton>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </AppDrawer>

                <AppModal
                    isOpen={!!deleteTarget}
                    onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                    title="Delete document?"
                    size="sm"
                >
                    <p className="mb-5 text-sm text-[var(--text-muted)]">
                        Are you sure you want to delete <strong>{deleteTarget?.templateName || deleteTarget?.originalFilename || 'this document'}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <AppButton variant="secondary" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                        <AppButton variant="danger" onPress={confirmDelete}>Delete</AppButton>
                    </div>
                </AppModal>
            </AppShell>
        </>
    );
}
