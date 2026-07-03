import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    Eye,
    FileCheck2,
    FileText,
    FolderKanban,
    Plus,
    Search,
    Trash2,
    UploadCloud,
    X,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppPagination } from '@/components/ui/AppPagination';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { DocumentUploadDrawer } from '@/features/documents/drawers/DocumentUploadDrawer';
import { DocumentGroupedExplorer } from '@/features/documents/components/DocumentGroupedExplorer';
import type {
    DocumentStatus,
    DocumentTemplateOption,
    DocumentUploadPayload,
    DocumentLocationGroup,
    DossierDocumentRow,
    DossierOption,
} from '@/features/documents/types';
import { countByValue, filterByValue } from '@/lib/filters';

/* FORCE_DOCUMENTS_REDESIGN_53E */

type PageProps = {
    documents: DossierDocumentRow[];
    documentGroups: DocumentLocationGroup[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    metrics: {
        total: number;
        uploaded: number;
        verified: number;
        missing: number;
        templates: number;
    };
};

type ViewMode = 'workspace' | 'grouped';

function statusClass(status: DocumentStatus) {
    if (status === 'verified') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
    if (status === 'uploaded') return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
    if (status === 'missing') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
    if (status === 'rejected') return 'border-red-400/25 bg-red-400/10 text-red-300';

    return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300';
}

function statusLabel(status: DocumentStatus) {
    return status || 'unknown';
}

function hasSearchMatch(document: DossierDocumentRow, query: string) {
    if (!query.trim()) {
        return true;
    }

    return [
        document.templateName,
        document.documentType,
        document.documentNumber,
        document.originalFilename,
        document.dossierNumber,
        document.projectObject,
        document.clientName,
        document.status,
        document.notes,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase());
}

function downloadDocument(document: DossierDocumentRow) {
    if (!document.downloadUrl) {
        toast.error('No file to download.');
        return;
    }

    window.location.href = document.downloadUrl;
}

function KpiCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string | number;
    detail: string;
}) {
    return (
        <div className="crm-kpi-card">
            <p className="crm-kpi-label">{label}</p>
            <p className="crm-kpi-value">{value}</p>
            <p className="mt-2 truncate text-xs text-[var(--crm-text-soft)]">{detail}</p>
        </div>
    );
}

function DocumentDetailPanel({
    document,
    onVerify,
    onMissing,
    onDelete,
}: {
    document: DossierDocumentRow | null;
    onVerify: (document: DossierDocumentRow) => void;
    onMissing: (document: DossierDocumentRow) => void;
    onDelete: (document: DossierDocumentRow) => void;
}) {
    if (!document) {
        return (
            <aside className="crm-panel p-4">
                <p className="text-sm font-semibold">Document details</p>
                <p className="mt-2 text-sm text-[var(--crm-text-muted)]">
                    Select a document to review its project, status, and file actions.
                </p>
            </aside>
        );
    }

    return (
        <aside className="crm-panel overflow-hidden">
            <div className="border-b border-[var(--crm-border)] p-4">
                <p className="crm-eyebrow">Selected document</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">
                            {document.templateName || document.originalFilename || 'Document'}
                        </h2>
                        <p className="text-sm text-[var(--crm-text-muted)]">
                            {document.documentNumber || 'No document number'}
                        </p>
                    </div>

                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(document.status)}`}>
                        {statusLabel(document.status)}
                    </span>
                </div>
            </div>

            <div className="space-y-5 p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Project</p>
                        <p className="mt-1 truncate text-sm font-semibold">{document.dossierNumber || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{document.projectObject || '-'}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Client</p>
                        <p className="mt-1 truncate text-sm font-semibold">{document.clientName || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">Owner</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">File</p>
                        <p className="mt-1 truncate text-sm font-semibold">{document.originalFilename || 'No file'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{document.sizeLabel || '-'}</p>
                    </div>

                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Uploaded</p>
                        <p className="mt-1 truncate text-sm font-semibold">{document.uploadedAt || '-'}</p>
                        <p className="truncate text-xs text-[var(--crm-text-muted)]">{document.documentType || 'manual'}</p>
                    </div>
                </div>

                {document.notes ? (
                    <div className="crm-panel-soft p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--crm-text-soft)]">Notes</p>
                        <p className="mt-2 text-sm text-[var(--crm-text-muted)]">{document.notes}</p>
                    </div>
                ) : null}

                <div className="grid gap-2">
                    <AppButton variant="primary" onPress={() => onVerify(document)}>
                        <CheckCircle2 size={15} />
                        Mark verified
                    </AppButton>

                    <AppButton variant="secondary" onPress={() => downloadDocument(document)}>
                        <Download size={15} />
                        Download file
                    </AppButton>

                    <div className="grid grid-cols-3 gap-2">
                        <AppButton variant="secondary" size="sm" onPress={() => router.visit(`/dossiers/${document.dossierId}`)}>
                            <Eye size={14} />
                            Project
                        </AppButton>

                        <AppButton variant="secondary" size="sm" onPress={() => onMissing(document)}>
                            <XCircle size={14} />
                            Missing
                        </AppButton>

                        <AppButton variant="danger" size="sm" onPress={() => onDelete(document)}>
                            <Trash2 size={14} />
                            Delete
                        </AppButton>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default function DocumentsIndex({
    documents,
    documentGroups,
    dossiers,
    templates,
    metrics,
}: PageProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>('workspace');
    const [query, setQuery] = useState('');
    const [selectedDocument, setSelectedDocument] = useState<DossierDocumentRow | null>(
        documents[0] ?? null,
    );

    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;

    const statusOptions = useMemo(
        () => [
            { id: 'all', label: 'All', count: documents.length },
            { id: 'uploaded', label: 'Uploaded', count: countByValue(documents, (document) => document.status, 'uploaded') },
            { id: 'verified', label: 'Verified', count: countByValue(documents, (document) => document.status, 'verified') },
            { id: 'missing', label: 'Missing', count: countByValue(documents, (document) => document.status, 'missing') },
            { id: 'rejected', label: 'Rejected', count: countByValue(documents, (document) => document.status, 'rejected') },
        ],
        [documents],
    );

    const filteredDocuments = useMemo(() => {
        return filterByValue(documents, statusFilter, (document) => document.status)
            .filter((document) => hasSearchMatch(document, query));
    }, [documents, query, statusFilter]);

    useEffect(() => {
        setTablePage(1);
    }, [query, statusFilter, viewMode]);

    const pagedDocuments = useMemo(
        () => filteredDocuments.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE),
        [filteredDocuments, tablePage],
    );

    const selectedVisible = selectedDocument && filteredDocuments.some((document) => document.id === selectedDocument.id)
        ? selectedDocument
        : filteredDocuments[0] ?? null;

    function handleSubmit(payload: DocumentUploadPayload) {
        const formData = new FormData();

        formData.append('dossier_id', payload.dossierId);
        formData.append('document_template_id', payload.documentTemplateId || '');
        formData.append('status', payload.status || 'uploaded');
        formData.append('notes', payload.notes || '');

        if (payload.file) {
            formData.append('file', payload.file);
        }

        router.post('/documents', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setDrawerOpen(false);
                toast.success('Document saved successfully.');
            },
            onError: () => toast.error('Please check document form errors.'),
        });
    }

    function updateStatus(document: DossierDocumentRow, status: string) {
        router.put(
            `/documents/${document.id}/status`,
            {
                status,
                notes: document.notes || '',
            },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Document status updated.'),
                onError: () => toast.error('Document status could not be updated.'),
            },
        );
    }

    function deleteDocument(document: DossierDocumentRow) {
        if (!window.confirm(`Delete ${document.templateName || document.originalFilename || 'document'}?`)) {
            return;
        }

        router.delete(`/documents/${document.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Document deleted successfully.'),
            onError: () => toast.error('Document could not be deleted.'),
        });
    }

    return (
        <>
            <Head title="Documents" />

            <AppShell
                eyebrowKey="documents.eyebrow"
                titleKey="documents.title"
                subtitleKey="documents.subtitle"
                action={
                    <AppButton variant="primary" onPress={() => setDrawerOpen(true)}>
                        <UploadCloud size={16} />
                        Upload document
                    </AppButton>
                }
            >
                <section className="crm-kpi-grid max-xl:grid-cols-3 max-md:grid-cols-1">
                    <KpiCard label="Total documents" value={metrics.total} detail="All project document rows" />
                    <KpiCard label="Uploaded" value={metrics.uploaded} detail="Files present or verified" />
                    <KpiCard label="Verified" value={metrics.verified} detail="Ready for workflow" />
                    <KpiCard label="Missing" value={metrics.missing} detail="Blocking documents" />
                    <KpiCard label="Templates" value={metrics.templates} detail="Active required models" />
                </section>

                <section className="crm-panel p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((option) => {
                                const active = option.id === statusFilter;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setStatusFilter(option.id)}
                                        className={[
                                            'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
                                            active
                                                ? 'border-[var(--crm-gold)] bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                        ].join(' ')}
                                    >
                                        {option.label}
                                        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="crm-command-input relative w-full sm:w-[390px]">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search documents, projects, clients, files..."
                                    className="h-full w-full bg-transparent pl-9 pr-9 text-sm outline-none placeholder:text-[var(--crm-text-soft)]"
                                />
                                {query ? (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:bg-[var(--crm-surface-2)]"
                                    >
                                        <X size={14} />
                                    </button>
                                ) : null}
                            </div>

                            <div className="inline-flex rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('workspace')}
                                    className={[
                                        'h-8 rounded-md px-3 text-xs font-semibold transition',
                                        viewMode === 'workspace'
                                            ? 'bg-[var(--crm-gold)] text-black'
                                            : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                    ].join(' ')}
                                >
                                    Workspace
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setViewMode('grouped')}
                                    className={[
                                        'h-8 rounded-md px-3 text-xs font-semibold transition',
                                        viewMode === 'grouped'
                                            ? 'bg-[var(--crm-gold)] text-black'
                                            : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                    ].join(' ')}
                                >
                                    Grouped
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {viewMode === 'grouped' ? (
                    <DocumentGroupedExplorer groups={documentGroups} />
                ) : (
                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="crm-panel overflow-hidden">
                            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-5 py-4">
                                <div>
                                    <p className="text-sm font-semibold">Document workspace</p>
                                    <p className="text-xs text-[var(--crm-text-muted)]">{filteredDocuments.length} visible document(s)</p>
                                </div>

                                <AppButton variant="secondary" size="sm" onPress={() => setStatusFilter('all')}>
                                    Reset
                                </AppButton>
                            </div>

                            <div className="app-scrollbar overflow-x-auto">
                                <table className="crm-table min-w-[1040px]">
                                    <thead>
                                        <tr>
                                            <th>Document</th>
                                            <th>Project</th>
                                            <th>Client</th>
                                            <th>File</th>
                                            <th>Status</th>
                                            <th>Uploaded</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {pagedDocuments.length > 0 ? (
                                            pagedDocuments.map((document) => {
                                                const selected = selectedVisible?.id === document.id;

                                                return (
                                                    <tr
                                                        key={document.id}
                                                        className={selected ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}
                                                        onClick={() => setSelectedDocument(document)}
                                                    >
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]">
                                                                    <FileText size={16} />
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <p className="max-w-[260px] truncate font-semibold text-[var(--crm-text)]">
                                                                        {document.templateName || document.originalFilename || 'Document'}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--crm-text-muted)]">
                                                                        {document.documentNumber || document.documentType || 'No number'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="flex items-start gap-2">
                                                                <FolderKanban size={14} className="mt-0.5 shrink-0 text-[var(--crm-text-soft)]" />
                                                                <div className="min-w-0">
                                                                    <p className="max-w-[190px] truncate font-medium text-[var(--crm-text)]">{document.dossierNumber || '-'}</p>
                                                                    <p className="max-w-[190px] truncate text-xs text-[var(--crm-text-muted)]">{document.projectObject || '-'}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <p className="max-w-[170px] truncate text-[var(--crm-text-muted)]">{document.clientName || '-'}</p>
                                                        </td>

                                                        <td>
                                                            <p className="max-w-[190px] truncate text-[var(--crm-text)]">{document.originalFilename || '-'}</p>
                                                            <p className="text-xs text-[var(--crm-text-muted)]">{document.sizeLabel || '-'}</p>
                                                        </td>

                                                        <td>
                                                            <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(document.status)}`}>
                                                                {statusLabel(document.status)}
                                                            </span>
                                                        </td>

                                                        <td className="text-[var(--crm-text-muted)]">{document.uploadedAt || '-'}</td>

                                                        <td>
                                                            <div className="flex justify-end gap-1">
                                                                <button type="button" className="crm-action-button" title="Preview" onClick={(event) => { event.stopPropagation(); setSelectedDocument(document); }}>
                                                                    <Eye size={14} />
                                                                </button>
                                                                <button type="button" className="crm-action-button" title="Verify" onClick={(event) => { event.stopPropagation(); updateStatus(document, 'verified'); }}>
                                                                    <CheckCircle2 size={14} />
                                                                </button>
                                                                <button type="button" className="crm-action-button" title="Missing" onClick={(event) => { event.stopPropagation(); updateStatus(document, 'missing'); }}>
                                                                    <XCircle size={14} />
                                                                </button>
                                                                <button type="button" className="crm-action-button" title="Download" onClick={(event) => { event.stopPropagation(); downloadDocument(document); }}>
                                                                    <Download size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7}>
                                                    <div className="py-10 text-center">
                                                        <p className="text-sm font-semibold">No documents found</p>
                                                        <p className="mt-1 text-sm text-[var(--crm-text-muted)]">Change filters or upload a project document.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <DocumentDetailPanel
                            document={selectedVisible}
                            onVerify={(document) => updateStatus(document, 'verified')}
                            onMissing={(document) => updateStatus(document, 'missing')}
                            onDelete={deleteDocument}
                        />

                        <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filteredDocuments.length} onChange={setTablePage} />
                    </section>
                )}

                <DocumentUploadDrawer
                    isOpen={drawerOpen}
                    dossiers={dossiers}
                    templates={templates}
                    onOpenChange={setDrawerOpen}
                    onSubmit={handleSubmit}
                />
            </AppShell>
        </>
    );
}