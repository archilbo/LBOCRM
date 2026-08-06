import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { IconAlertTriangle, IconCircleCheck, IconCopy, IconDownload, IconEye, IconFileText, IconFolder, IconDots, IconSearch, IconTrash, IconCloudUpload, IconX, IconCircleX } from '@tabler/icons-react';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, Chip, Dropdown } from '@heroui/react';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppModal } from '@/components/ui/AppModal';
import { DocumentDrawer } from '@/components/drawers';
import { DocumentGroupedExplorer } from '@/features/documents/components/DocumentGroupedExplorer';
import type {
    ClientOption, DocumentStatus, DocumentTemplateOption, DocumentUploadPayload,
    DocumentLocationGroup, DossierDocumentRow, DossierOption,
} from '@/features/documents/types';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { usePermissions } from '@/hooks/usePermissions';

type PageProps = {
    documents: DossierDocumentRow[];
    documentGroups: DocumentLocationGroup[];
    clients: ClientOption[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    metrics: { total: number; uploaded: number; verified: number; missing: number; templates: number };
};

const DOCUMENT_KPI_TONES = {
    total: { icon: <IconFileText size={16} className="text-zinc-600" />, accentColor: '#52525b', valueClassName: 'text-zinc-600' },
    uploaded: { icon: <IconCloudUpload size={16} className="text-sky-600" />, accentColor: '#0284c7', valueClassName: 'text-sky-600' },
    verified: { icon: <IconCircleCheck size={16} className="text-emerald-600" />, accentColor: '#059669', valueClassName: 'text-emerald-600' },
    missing: { icon: <IconAlertTriangle size={16} className="text-amber-600" />, accentColor: '#d97706', valueClassName: 'text-amber-600' },
    templates: { icon: <IconCopy size={16} className="text-violet-600" />, accentColor: '#7c3aed', valueClassName: 'text-violet-600' },
} as const;

type ViewMode = 'workspace' | 'grouped';

const STATUS_COLORS: Record<string, 'success' | 'primary' | 'warning' | 'danger' | 'default'> = {
    verified: 'success',
    uploaded: 'primary',
    missing: 'warning',
    rejected: 'danger',
};

function fileTypeBadge(mimeType: string | null | undefined): { label: string; color: string } {
    if (!mimeType) return { label: 'Fichier', color: 'bg-[var(--surface-3)] text-[var(--text-muted)]' };
    if (mimeType === 'application/pdf') return { label: 'PDF', color: 'bg-rose-500/10 text-rose-600' };
    if (mimeType.includes('wordprocessingml')) return { label: 'DOCX', color: 'bg-sky-500/10 text-sky-600' };
    if (mimeType.includes('spreadsheetml')) return { label: 'XLSX', color: 'bg-emerald-500/10 text-emerald-600' };
    if (mimeType.startsWith('image/')) return { label: 'IMG', color: 'bg-violet-500/10 text-violet-600' };
    return { label: 'Fichier', color: 'bg-[var(--surface-3)] text-[var(--text-muted)]' };
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
    const { can } = usePermissions();
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
        if (can('documents.create')) setDrawerOpen(true);
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
        if (!can('documents.create')) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId || '');
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');
        if (payload.cinFrontFile && payload.cinBackFile) {
            formData.append('cin_front_file', payload.cinFrontFile);
            formData.append('cin_back_file', payload.cinBackFile);
        } else if (payload.file) {
            formData.append('file', payload.file);
        }
        router.post('/documents', formData, {
            forceFormData: true, preserveScroll: true,
            onSuccess: () => { setDrawerOpen(false); setIsUploading(false); toast.success(t('documents.toasts.saved')); },
            onError: () => { setIsUploading(false); toast.error(t('documents.toasts.formError')); },
        });
    }

    function updateStatus(document: DossierDocumentRow, status: string) {
        if (!can('documents.update')) return;
        router.put(`/documents/${document.id}/status`, { status, notes: document.notes || '' }, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('documents.toasts.statusUpdated')),
            onError: () => toast.error(t('documents.toasts.statusError')),
        });
    }

    function confirmDelete() {
        if (!deleteTarget || !can('documents.delete')) return;
        router.delete(`/documents/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { toast.success(t('documents.toasts.deleted')); setDeleteTarget(null); },
            onError: () => toast.error(t('documents.toasts.deleteError')),
        });
    }

    function DocumentRowMenu({ doc }: { doc: DossierDocumentRow }) {
        return (
            <Dropdown>
                <Dropdown.Trigger className="flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]">
                    <IconDots size={15} />
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
                            base: 'rounded-lg px-2 py-1 text-[10px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)]',
                        }}
                    >
                        <Dropdown.Item key="preview" id="preview">
                            <div className="flex items-center gap-2">
                                <IconEye size={14} className="shrink-0 text-sky-600" />
                                <span>{t('documents.menu.preview')}</span>
                            </div>
                        </Dropdown.Item>
                        {can('documents.update') && doc.status !== 'verified' && (
                            <Dropdown.Item key="verify" id="verify">
                                <div className="flex items-center gap-2">
                                    <IconCircleCheck size={14} className="shrink-0 text-emerald-600" />
                                    <span>{t('documents.menu.markVerified')}</span>
                                </div>
                            </Dropdown.Item>
                        )}
                        {can('documents.download') && doc.hasFile && doc.downloadUrl && (
                            <Dropdown.Item key="download" id="download">
                                <div className="flex items-center gap-2">
                                    <IconDownload size={14} className="shrink-0 text-blue-600" />
                                    <span>{t('documents.menu.download')}</span>
                                </div>
                            </Dropdown.Item>
                        )}
                        <Dropdown.Item key="project" id="project">
                            <div className="flex items-center gap-2">
                                <IconFolder size={14} className="shrink-0 text-violet-600" />
                                <span>{t('documents.menu.openProject')}</span>
                            </div>
                        </Dropdown.Item>
                        {can('documents.update') ? <Dropdown.Item key="missing" id="missing">
                            <div className="flex items-center gap-2">
                                <IconCircleX size={14} className="shrink-0 text-amber-600" />
                                <span>{t('documents.menu.markMissing')}</span>
                            </div>
                        </Dropdown.Item> : null}
                        {can('documents.delete') ? <Dropdown.Section title={t('documents.menu.danger')} classNames={{ heading: 'mb-0.5 px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]' }}>
                            <Dropdown.Item key="delete" id="delete" className="text-red-600 data-[hover]:bg-red-500/10">
                                <div className="flex items-center gap-2">
                                    <IconTrash size={14} className="shrink-0 text-red-600" />
                                    <span>{t('documents.menu.delete')}</span>
                                </div>
                            </Dropdown.Item>
                        </Dropdown.Section> : null}
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        );
    }

    function StatusLifecycle({ status }: { status: DocumentStatus }) {
        const steps = [
            { key: 'missing', label: t('documents.status.missing') },
            { key: 'uploaded', label: t('documents.status.uploaded') },
            { key: 'verified', label: t('documents.status.verified') },
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
                                'flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold',
                                isDone && step.key === 'verified' && 'bg-emerald-500/15 text-emerald-600',
                                isDone && step.key === 'uploaded' && 'bg-sky-500/15 text-sky-600',
                                isDone && step.key === 'missing' && 'bg-amber-500/15 text-amber-600',
                                !isDone && 'bg-[var(--surface-3)] text-[var(--text-subtle)]',
                                isCurrent && 'ring-2 ring-offset-1 ring-offset-[var(--surface)]',
                                isCurrent && step.key === 'verified' && 'ring-emerald-500/40',
                                isCurrent && step.key === 'uploaded' && 'ring-sky-500/40',
                                isCurrent && step.key === 'missing' && 'ring-amber-500/40',
                            )}>
                                {isDone ? <IconCircleCheck size={12} /> : idx + 1}
                            </span>
                            <span className={cn(
                                'text-[10px]',
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
            header: t('documents.headers.document'),
            cell: ({ row }) => {
                const badge = fileTypeBadge(row.original.mimeType);
                return (
                    <div className="flex items-center gap-2">
                        <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', badge.color)}>
                            <IconFileText size={13} />
                        </span>
                        <div className="min-w-0">
                            <p className="max-w-[200px] truncate text-xs font-medium text-[var(--foreground)]">
                                {row.original.templateName || row.original.originalFilename || t('documents.headers.document')}
                            </p>
                            <p className="text-[9px] text-[var(--text-muted)]">
                                {row.original.documentNumber || row.original.documentType}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'dossierNumber',
            header: t('documents.headers.project'),
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <IconFolder size={12} className="shrink-0 text-[var(--text-subtle)]" />
                    <div className="min-w-0">
                        <p className="max-w-[160px] truncate text-xs font-medium text-[var(--foreground)]">{row.original.dossierNumber || '-'}</p>
                        <p className="max-w-[160px] truncate text-[9px] text-[var(--text-muted)]">{row.original.projectObject || '-'}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: t('documents.headers.client'),
            cell: ({ row }) => (
                <p className="max-w-[140px] truncate text-xs text-[var(--text-muted)]">{row.original.clientName || '-'}</p>
            ),
        },
        {
            accessorKey: 'originalFilename',
            header: t('documents.headers.file'),
            cell: ({ row }) => {
                const badge = fileTypeBadge(row.original.mimeType);
                return (
                    <div className="flex items-center gap-1.5">
                        <span className={cn('inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold', badge.color)}>
                            {badge.label}
                        </span>
                        <div className="min-w-0">
                            <p className="max-w-[140px] truncate text-[10px] text-[var(--foreground)]">{row.original.originalFilename || '-'}</p>
                            <p className="text-[9px] text-[var(--text-subtle)]">{row.original.sizeLabel || ''}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: t('documents.headers.status'),
            cell: ({ row }) => (
                <Chip variant="flat" size="sm" color={STATUS_COLORS[row.original.status] || 'default'}>{t(`documents.status.${row.original.status}`)}</Chip>
            ),
        },
        {
            accessorKey: 'uploadedAt',
            header: t('documents.headers.uploaded'),
            cell: ({ row }) => (
                <div>
                    <p className="text-[10px] text-[var(--text-muted)]">{row.original.uploadedAt || '-'}</p>
                    {row.original.verifiedAt && (
                        <p className="text-[9px] text-[var(--text-subtle)]">{t('documents.preview.verifiedAt', { date: row.original.verifiedAt })}</p>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => <DocumentRowMenu doc={row.original} />,
        },
    ], [t]);

    return (
        <>
            <Head title="Documents" />

            <AppShell>
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                            {t('documents.eyebrow')}
                        </p>
                        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            {t('documents.title')}
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm text-[var(--text-muted)]">
                            {t('documents.subtitle')}
                        </p>
                    </div>
                    {can('documents.create') ? <AppButton isIconOnly compact variant="solid" color="primary" tooltip={t('documents.upload')} aria-label={t('documents.upload')} onPress={() => setDrawerOpen(true)}>
                        <IconCloudUpload size={16} />
                    </AppButton> : null}
                </header>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    {([
                        { label: t('documents.metrics.total'), value: metrics.total, key: 'total' as const },
                        { label: t('documents.metrics.uploaded'), value: metrics.uploaded, key: 'uploaded' as const },
                        { label: t('documents.metrics.verified'), value: metrics.verified, key: 'verified' as const },
                        { label: t('documents.metrics.missing'), value: metrics.missing, key: 'missing' as const },
                        { label: t('documents.metrics.templates'), value: metrics.templates, key: 'templates' as const },
                    ]).map((card) => (
                        <AppKpiCard key={card.key} label={card.label} value={card.value} icon={DOCUMENT_KPI_TONES[card.key].icon} accentColor={DOCUMENT_KPI_TONES[card.key].accentColor} valueClassName={DOCUMENT_KPI_TONES[card.key].valueClassName} />
                    ))}
                </div>

                {metrics.total > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] font-semibold text-[var(--foreground)]">{t('documents.stats.verificationProgress')}</p>
                                <span className="text-[12px] font-bold text-[var(--accent)]">{verifiedPct}%</span>
                            </div>
                            <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${verifiedPct}%` }} />
                            </div>
                            <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                                {t('documents.stats.verifiedOf', { verified: metrics.verified, total: metrics.total })}
                            </p>
                        </div>
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] font-semibold text-[var(--foreground)]">{t('documents.stats.missingDocuments')}</p>
                                <span className={cn('text-[12px] font-bold', metrics.missing > 0 ? 'text-amber-600' : 'text-emerald-600')}>
                                    {metrics.missing > 0 ? metrics.missing : t('documents.stats.none')}
                                </span>
                            </div>
                            {topMissing.length > 0 ? (
                                <div className="space-y-1.5">
                                    {topMissing.map((doc) => (
                                        <button key={doc.id} type="button" onClick={() => router.visit(`/dossiers/${doc.dossierId}`)}
                                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                                            <IconAlertTriangle size={12} className="shrink-0 text-amber-600" />
                                            <span className="truncate">{doc.dossierNumber} â€” {doc.templateName || doc.originalFilename}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/8 px-3 py-2">
                                    <IconCircleCheck size={14} className="text-emerald-600" />
                                    <p className="text-[11px] text-emerald-600">{t('documents.stats.allAccountedFor')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* â”€â”€ Tab bar â”€â”€ */}
                <div className="flex items-center gap-6 border-b border-[var(--border)]">
                    {(['workspace', 'grouped'] as const).map((mode) => (
                        <button key={mode} type="button" onClick={() => setViewMode(mode)}
                            className={cn(
                                'relative pb-2.5 text-[11px] font-semibold transition',
                                viewMode === mode ? 'text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]',
                            )}>
                            {mode === 'workspace' ? t('documents.tabs.workspace') : t('documents.tabs.grouped')}
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
                                emptyTitle={t('documents.empty.title')}
                                emptyDescription={t('documents.empty.description')}
                                pageSize={15}
                                onRowClick={(doc) => setPreviewDoc(doc)}
                                compact
                                toolbarActions={
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-44">
                                            <IconSearch size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <input value={query} onChange={(e) => setQuery(e.target.value)}
                                                placeholder={t('documents.search.placeholder')}
                                                className="h-7 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-7 pr-2 text-[10px] text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                                            />
                                            {query ? (
                                                <button type="button" onClick={() => setQuery('')}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                                                    <IconX size={12} />
                                                </button>
                                            ) : null}
                                        </div>
                                        <Dropdown>
                                            <Dropdown.Trigger className={cn('inline-flex h-7 items-center gap-1.5 rounded-lg border px-2 text-[10px] font-medium transition', statusFilter !== 'all' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]')}>
                                                <span className="flex items-center gap-1">
                                                    {statusOptions.find((o) => o.id === statusFilter)?.label || t('documents.search.status')}
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
                                                    itemClasses={{ base: 'rounded-lg px-2 py-1.5 text-[10px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40' }}
                                                >
                                                    {statusOptions.map((opt) => (
                                                        <Dropdown.Item key={opt.id} id={opt.id} textValue={opt.label}>
                                                            <div className="flex w-full items-center gap-2">
                                                                <Dropdown.ItemIndicator>
                                                                    <IconCircleCheck size={13} className="text-[var(--accent)]" />
                                                                </Dropdown.ItemIndicator>
                                                                <span className="flex-1">{opt.label}</span>
                                                                <span className="rounded bg-[var(--surface-2)] px-1.5 py-px text-[9px] font-semibold text-[var(--text-muted)]">{opt.count}</span>
                                                            </div>
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown.Popover>
                                        </Dropdown>
                                        <span className="text-[9px] text-[var(--text-muted)]">{t('documents.search.resultCount', { count: filteredDocuments.length })}</span>
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
                                                        <IconFileText size={13} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-medium text-[var(--foreground)]">
                                                            {doc.templateName || doc.originalFilename || t('documents.headers.document')}
                                                        </p>
                                                        <p className="text-[9px] text-[var(--text-muted)]">{doc.dossierNumber || ''}</p>
                                                        <div className="mt-0.5 flex items-center gap-1.5">
                                                            <Chip variant="flat" size="sm" color={STATUS_COLORS[doc.status] || 'default'}>{t(`documents.status.${doc.status}`)}</Chip>
                                                            <span className={cn('inline-flex items-center rounded px-1 py-0.5 text-[8px] font-bold', badge.color)}>
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Dropdown>
                                                        <Dropdown.Trigger className="flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)]">
                                                            <IconDots size={14} />
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
                                                                    base: 'rounded-lg px-2 py-1 text-[10px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)]',
                                                                }}
                                                            >
                                                                <Dropdown.Item key="preview"><div className="flex items-center gap-2"><IconEye size={14} className="shrink-0 text-sky-600" /><span>{t('documents.menu.preview')}</span></div></Dropdown.Item>
                                                                {doc.status !== 'verified' && (
                                                                    <Dropdown.Item key="verify"><div className="flex items-center gap-2"><IconCircleCheck size={14} className="shrink-0 text-emerald-600" /><span>{t('documents.menu.markVerified')}</span></div></Dropdown.Item>
                                                                )}
                                                                {doc.hasFile && doc.downloadUrl && (
                                                                    <Dropdown.Item key="download"><div className="flex items-center gap-2"><IconDownload size={14} className="shrink-0 text-blue-600" /><span>{t('documents.menu.download')}</span></div></Dropdown.Item>
                                                                )}
                                                                <Dropdown.Section title={t('documents.menu.danger')} classNames={{ heading: 'mb-0.5 px-2 pb-0.5 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]' }}>
                                                                    <Dropdown.Item key="delete" className="text-red-600 data-[hover]:bg-red-500/10"><div className="flex items-center gap-2"><IconTrash size={14} className="shrink-0 text-red-600" /><span>{t('documents.menu.delete')}</span></div></Dropdown.Item>
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
                                        <p className="text-sm font-medium text-[var(--foreground)]">{t('documents.empty.title')}</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">{t('documents.empty.mobileDescription')}</p>
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
                    title={previewDoc?.templateName || previewDoc?.originalFilename || t('documents.headers.document')}
                >
                    {previewDoc ? (
                        <div className="space-y-5 pb-8">
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)] ring-1 ring-[var(--border)]">
                                    <IconFileText size={18} />
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
                                        <iframe src={previewDoc.downloadUrl} title="AperÃ§u PDF"
                                            className="h-[240px] w-full bg-[var(--surface-2)]" />
                                    ) : (
                                        <div className="flex h-32 items-center justify-center bg-[var(--surface-2)]">
                                            <div className="text-center">
                                                <IconFileText size={32} className="mx-auto text-[var(--text-muted)]" />
                                                <p className="mt-1.5 text-[10px] font-medium text-[var(--text-muted)]">{previewDoc.originalFilename || t('documents.preview.noPreview')}</p>
                                                <p className="text-[9px] text-[var(--text-subtle)]">{previewDoc.sizeLabel || ''}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                                <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('documents.preview.status')}</p>
                                <StatusLifecycle status={previewDoc.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('documents.preview.project')}</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewDoc.dossierNumber || '-'}</p>
                                    <p className="truncate text-xs text-[var(--text-muted)]">{previewDoc.projectObject || '-'}</p>
                                </Card>
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('documents.preview.client')}</p>
                                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{previewDoc.clientName || '-'}</p>
                                </Card>
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('documents.preview.file')}</p>
                                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">{previewDoc.originalFilename || '-'}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{previewDoc.sizeLabel || ''}</p>
                                </Card>
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('documents.preview.uploaded')}</p>
                                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{previewDoc.uploadedAt || '-'}</p>
                                    {previewDoc.verifiedAt && (
                                        <p className="text-xs text-emerald-600">{t('documents.preview.verifiedAt', { date: previewDoc.verifiedAt })}</p>
                                    )}
                                </Card>
                            </div>

                            {previewDoc.notes ? (
                                <Card className="border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-sm">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('documents.preview.notes')}</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">{previewDoc.notes}</p>
                                </Card>
                            ) : null}

                            <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2 shadow-sm">
                                {previewDoc.status !== 'verified' && (
                                        <AppButton size="sm" variant="solid" color="primary" className="min-w-0 h-8 text-[10px]" onPress={() => { updateStatus(previewDoc, 'verified'); }}>
                                            <IconCircleCheck size={13} /> {t('documents.preview.verify')}
                                        </AppButton>
                                )}
                                {previewDoc.hasFile && previewDoc.downloadUrl && (
                                    <>
                                        {previewDoc.status !== 'verified' && <span className="h-5 w-px bg-[var(--border)]" />}
                                        <AppButton size="sm" variant="bordered" className="min-w-0 h-8 text-[10px]" onPress={() => { window.location.href = previewDoc.downloadUrl!; }}>
                                            <IconDownload size={13} /> {t('documents.preview.download')}
                                        </AppButton>
                                    </>
                                )}
                                <span className="h-5 w-px bg-[var(--border)]" />
                                        <AppButton size="sm" variant="bordered" className="min-w-0 h-8 text-[10px]" onPress={() => { router.visit(`/dossiers/${previewDoc.dossierId}`); }}>
                                            <IconFolder size={13} /> {t('documents.preview.project')}
                                        </AppButton>
                                <span className="h-5 w-px bg-[var(--border)]" />
                                        <AppButton size="sm" variant="bordered" className="min-w-0 h-8 text-[10px]" onPress={() => { updateStatus(previewDoc, 'missing'); }}>
                                            <IconCircleX size={13} /> {t('documents.preview.missing')}
                                        </AppButton>
                                <span className="h-5 w-px bg-[var(--border)]" />
                                        <AppButton size="sm" variant="light" className="min-w-0 h-8 px-2 text-[10px] text-red-600" onPress={() => { setDeleteTarget(previewDoc); setPreviewDoc(null); }}>
                                            <IconTrash size={13} /> {t('documents.preview.delete')}
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
                        <IconAlertTriangle size={18} className="shrink-0 text-red-600" />
                        <p className="text-xs text-[var(--text-muted)]">
                            Cette action est <span className="font-semibold text-red-600">irrÃ©versible</span>.
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
