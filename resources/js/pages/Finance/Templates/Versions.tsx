import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Clock, Eye, FileText, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';

type Template = {
    id: number;
    type: string;
    typeLabel: string;
    name: string;
    slug: string;
    isDefault: boolean;
};

type TemplateVersion = {
    id: number;
    versionNumber: number;
    name: string;
    type: string;
    paperSize: string;
    orientation: string;
    headerHtml: string;
    bodyHtml: string;
    footerHtml: string;
    css: string;
    logoPath: string;
    snapshotReason: string;
    createdBy?: string | null;
    createdAt: string;
    createdAtHuman: string;
    urls: {
        restore: string;
        delete: string;
    };
};

type PageProps = {
    template: Template;
    versions: TemplateVersion[];
    routes: {
        templates: string;
        snapshot: string;
    };
};

function reasonLabel(reason: string): string {
    if (reason === 'before_update') {
        return 'Before update';
    }

    if (reason === 'manual') {
        return 'Manual snapshot';
    }

    return reason;
}

function htmlPreview(version: TemplateVersion): string {
    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    html, body {
                        margin: 0;
                        padding: 0;
                        background: #ffffff;
                    }

                    body {
                        width: 794px;
                        min-width: 794px;
                        overflow: hidden;
                    }

                    .page {
                        margin: 0 !important;
                        box-shadow: none !important;
                    }

                    ${version.css || ''}
                </style>
            </head>
            <body>
                ${(version.headerHtml || '') + (version.bodyHtml || '') + (version.footerHtml || '')}
            </body>
        </html>
    `;
}

export default function FinanceTemplateVersions({ template, versions, routes }: PageProps) {
    const [selectedVersionId, setSelectedVersionId] = useState<number | null>(versions[0]?.id || null);

    const selectedVersion = useMemo(() => {
        return versions.find((version) => version.id === selectedVersionId) || versions[0] || null;
    }, [selectedVersionId, versions]);

    function createSnapshot() {
        router.post(
            routes.snapshot,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Snapshot created.'),
                onError: () => toast.error('Could not create snapshot.'),
            },
        );
    }

    function restoreVersion(version: TemplateVersion) {
        if (!window.confirm(`Restore version #${version.versionNumber}? Current template will be saved as a new version before restore.`)) {
            return;
        }

        router.put(
            version.urls.restore,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Version restored.'),
                onError: () => toast.error('Could not restore version.'),
            },
        );
    }

    function deleteVersion(version: TemplateVersion) {
        if (!window.confirm(`Delete version #${version.versionNumber}?`)) {
            return;
        }

        router.delete(version.urls.delete, {
            preserveScroll: true,
            onSuccess: () => toast.success('Version deleted.'),
            onError: () => toast.error('Could not delete version.'),
        });
    }

    return (
        <>
            <Head title={`${template.name} Versions`} />

            <AppShell
                eyebrowKey="financeWorkspace.eyebrow"
                titleKey="financeWorkspace.title"
                subtitleKey="financeWorkspace.subtitle"
            >
                <div className="space-y-4 px-3 py-3 lg:px-4">
                    <div className="rounded-2xl border bg-[var(--surface)] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                    <Clock size={14} />
                                    Template History
                                </div>

                                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                                    {template.name}
                                </h1>

                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    Review snapshots, restore older versions, and protect your Devis / Facture / ReÃ§u designs.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => router.visit(routes.templates)}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <ArrowLeft size={16} />
                                    Back to editor
                                </button>

                                <button
                                    type="button"
                                    onClick={createSnapshot}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                                >
                                    <Save size={16} />
                                    Save snapshot
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                        <section className="rounded-2xl border bg-[var(--surface)]">
                            <div className="border-b px-4 py-3">
                                <h2 className="text-sm font-semibold">Versions</h2>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">
                                    {versions.length} saved snapshot{versions.length === 1 ? '' : 's'}
                                </p>
                            </div>

                            <div className="max-h-[calc(100vh-260px)] space-y-2 overflow-auto p-3">
                                {versions.length ? (
                                    versions.map((version) => {
                                        const active = selectedVersion?.id === version.id;

                                        return (
                                            <button
                                                key={version.id}
                                                type="button"
                                                onClick={() => setSelectedVersionId(version.id)}
                                                className={[
                                                    'w-full rounded-2xl border p-3 text-left transition',
                                                    active
                                                        ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]'
                                                        : 'bg-[var(--surface-2)] hover:border-[var(--accent)]',
                                                ].join(' ')}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold">Version #{version.versionNumber}</p>
                                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                            {reasonLabel(version.snapshotReason)} Â· {version.createdAtHuman}
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                                        {version.paperSize}
                                                    </span>
                                                </div>

                                                <p className="mt-3 truncate text-xs text-[var(--text-muted)]">
                                                    {version.createdAt}
                                                    {version.createdBy ? ` Â· ${version.createdBy}` : ''}
                                                </p>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-2xl border border-dashed p-6 text-center">
                                        <FileText className="mx-auto text-[var(--text-muted)]" size={24} />
                                        <p className="mt-3 text-sm font-semibold">No versions yet</p>
                                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            Create a manual snapshot or edit the template to generate automatic history.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border bg-[var(--surface)]">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                                <div>
                                    <h2 className="text-sm font-semibold">
                                        {selectedVersion ? `Preview version #${selectedVersion.versionNumber}` : 'Preview'}
                                    </h2>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        HTML snapshot preview. Dynamic placeholders are not rendered here.
                                    </p>
                                </div>

                                {selectedVersion ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => restoreVersion(selectedVersion)}
                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-3 text-xs font-semibold text-white transition hover:opacity-90"
                                        >
                                            <RotateCcw size={14} />
                                            Restore
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deleteVersion(selectedVersion)}
                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold text-red-500 transition hover:border-red-500"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="p-4">
                                {selectedVersion ? (
                                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                                        <div className="h-[720px] overflow-auto rounded-2xl border bg-neutral-200 p-4">
                                            <div className="mx-auto w-[397px] overflow-hidden rounded-xl bg-white shadow-lg">
                                                <iframe
                                                    title="Version preview"
                                                    srcDoc={htmlPreview(selectedVersion)}
                                                    className="h-[562px] w-[397px] origin-top-left scale-50 border-0 bg-white"
                                                    scrolling="no"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                                    Snapshot
                                                </p>
                                                <p className="mt-2 text-sm font-semibold">Version #{selectedVersion.versionNumber}</p>
                                                <p className="mt-1 text-xs text-[var(--text-muted)]">{reasonLabel(selectedVersion.snapshotReason)}</p>
                                            </div>

                                            <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                                    Format
                                                </p>
                                                <p className="mt-2 text-sm">{selectedVersion.paperSize} / {selectedVersion.orientation}</p>
                                            </div>

                                            <div className="rounded-2xl bg-[var(--surface-2)] p-3">
                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                                    Content size
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    Header: {selectedVersion.headerHtml.length} chars<br />
                                                    Body: {selectedVersion.bodyHtml.length} chars<br />
                                                    CSS: {selectedVersion.css.length} chars
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const win = window.open('', '_blank');
                                                    if (!win) return;
                                                    win.document.open();
                                                    win.document.write(htmlPreview(selectedVersion));
                                                    win.document.close();
                                                }}
                                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl border bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                            >
                                                <Eye size={16} />
                                                Open preview
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[480px] items-center justify-center rounded-2xl border border-dashed">
                                        <p className="text-sm text-[var(--text-muted)]">Select a version to preview it.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </AppShell>
        </>
    );
}