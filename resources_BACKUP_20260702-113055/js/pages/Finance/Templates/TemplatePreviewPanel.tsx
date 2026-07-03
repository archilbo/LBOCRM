import {
    ExternalLink,
    Maximize2,
    Minimize2,
    Monitor,
    Printer,
    RefreshCcw,
    RotateCcw,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

type TemplatePreviewPanelProps = {
    html: string;
    onRefresh?: () => void | Promise<void>;
    isFocused?: boolean;
    onToggleFocus?: () => void;
};

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

function emptyPreviewHtml() {
    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        background: #ffffff;
                    }

                    body {
                        font-family: Arial, sans-serif;
                        color: #111827;
                    }

                    .empty {
                        width: 794px;
                        min-height: 1123px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px dashed #d1d5db;
                        color: #6b7280;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="empty">
                    <div>
                        <strong>No preview yet</strong><br>
                        Edit or select a template to preview it.
                    </div>
                </div>
            </body>
        </html>
    `;
}

function clampZoom(value: number) {
    return Math.min(1.8, Math.max(0.35, value));
}

function injectPreviewReset(html: string) {
    const resetCss = `
        <style id="archi-lbo-preview-reset">
            html,
            body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                background: #ffffff !important;
            }

            body {
                width: 794px !important;
                min-width: 794px !important;
            }

            .page {
                margin: 0 !important;
                box-shadow: none !important;
            }
        </style>
    `;

    if (html.includes('</head>')) {
        return html.replace('</head>', `${resetCss}</head>`);
    }

    return html;
}

export function TemplatePreviewPanel({
    html,
    onRefresh,
    isFocused = false,
    onToggleFocus,
}: TemplatePreviewPanelProps) {
    const sideContainerRef = useRef<HTMLDivElement | null>(null);
    const fullContainerRef = useRef<HTMLDivElement | null>(null);

    const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
    const [zoom, setZoom] = useState(0.85);
    const [sideScale, setSideScale] = useState(0.45);

    const previewHtml = useMemo(() => {
        return injectPreviewReset(html?.trim() ? html : emptyPreviewHtml());
    }, [html]);

    useEffect(() => {
        const node = sideContainerRef.current;

        if (!node) {
            return;
        }

        function updateScale() {
            const width = node.clientWidth;
            const maxHeight = isFocused ? 740 : 520;

            const scaleByWidth = (width - 24) / A4_WIDTH;
            const scaleByHeight = maxHeight / A4_HEIGHT;

            const nextScale = Math.min(0.72, Math.max(0.28, Math.min(scaleByWidth, scaleByHeight)));

            setSideScale(nextScale);
        }

        updateScale();

        const observer = new ResizeObserver(updateScale);
        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [isFocused]);

    useEffect(() => {
        if (!isFullPreviewOpen) {
            return;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsFullPreviewOpen(false);
            }

            if ((event.ctrlKey || event.metaKey) && event.key === '+') {
                event.preventDefault();
                setZoom((current) => clampZoom(current + 0.1));
            }

            if ((event.ctrlKey || event.metaKey) && event.key === '-') {
                event.preventDefault();
                setZoom((current) => clampZoom(current - 0.1));
            }

            if ((event.ctrlKey || event.metaKey) && event.key === '0') {
                event.preventDefault();
                setZoom(0.85);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullPreviewOpen]);

    async function refreshPreview() {
        await onRefresh?.();
    }

    function openFullPreview() {
        setIsFullPreviewOpen(true);

        setTimeout(() => {
            fitWidth();
        }, 50);
    }

    function fitWidth() {
        const node = fullContainerRef.current;

        if (!node) {
            setZoom(0.85);
            return;
        }

        const availableWidth = Math.max(node.clientWidth - 80, 320);
        const nextZoom = clampZoom(availableWidth / A4_WIDTH);

        setZoom(nextZoom);
    }

    function openInNewTab() {
        const previewWindow = window.open('', '_blank');

        if (!previewWindow) {
            return;
        }

        previewWindow.document.open();
        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
    }

    function printPreview() {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            return;
        }

        printWindow.document.open();
        printWindow.document.write(previewHtml);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    }

    const sideFrameWrapStyle: CSSProperties = {
        width: A4_WIDTH * sideScale,
        height: A4_HEIGHT * sideScale,
    };

    const sideIframeStyle: CSSProperties = {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        transform: `scale(${sideScale})`,
        transformOrigin: 'top left',
    };

    const fullFrameWrapStyle: CSSProperties = {
        width: A4_WIDTH * zoom,
        height: A4_HEIGHT * zoom,
    };

    const fullIframeStyle: CSSProperties = {
        width: A4_WIDTH,
        height: A4_HEIGHT,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
    };

    return (
        <>
            <section className="overflow-hidden rounded-2xl border bg-[var(--surface)]">
                <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                            <Monitor size={15} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                Preview
                            </p>
                            <p className="truncate text-[11px] text-[var(--text-muted)]">
                                Full A4 thumbnail
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            onClick={() => void refreshPreview()}
                            className="inline-flex size-8 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            title="Refresh exact preview"
                        >
                            <RefreshCcw size={14} />
                        </button>

                        {onToggleFocus ? (
                            <button
                                type="button"
                                onClick={onToggleFocus}
                                className="inline-flex size-8 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                title={isFocused ? 'Normal preview width' : 'Wide preview panel'}
                            >
                                {isFocused ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={openFullPreview}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 text-xs font-semibold text-white transition hover:opacity-90"
                            title="Open full preview"
                        >
                            <Maximize2 size={14} />
                            Full
                        </button>
                    </div>
                </div>

                <div className="bg-[var(--surface-2)] p-3">
                    <div
                        ref={sideContainerRef}
                        className="flex max-h-[620px] justify-center overflow-hidden rounded-xl border bg-neutral-200 p-2 shadow-sm"
                    >
                        <div className="overflow-hidden rounded-lg bg-white shadow-md" style={sideFrameWrapStyle}>
                            <iframe
                                title="Template preview"
                                srcDoc={previewHtml}
                                scrolling="no"
                                className="block border-0 bg-white"
                                style={sideIframeStyle}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {isFullPreviewOpen ? (
                <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm">
                    <div className="flex h-full flex-col">
                        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-[var(--surface)] px-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <Monitor size={17} />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">Full document preview</p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Esc to close · Ctrl +/- to zoom · Ctrl 0 reset
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => void refreshPreview()}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <RefreshCcw size={14} />
                                    Refresh
                                </button>

                                <button
                                    type="button"
                                    onClick={fitWidth}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                >
                                    <Maximize2 size={14} />
                                    Fit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setZoom((current) => clampZoom(current - 0.1))}
                                    className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                    title="Zoom out"
                                >
                                    <ZoomOut size={15} />
                                </button>

                                <div className="min-w-16 rounded-xl border bg-[var(--surface-2)] px-2 py-2 text-center text-xs font-semibold">
                                    {Math.round(zoom * 100)}%
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setZoom((current) => clampZoom(current + 0.1))}
                                    className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                    title="Zoom in"
                                >
                                    <ZoomIn size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setZoom(0.85)}
                                    className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                    title="Reset zoom"
                                >
                                    <RotateCcw size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={openInNewTab}
                                    className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={printPreview}
                                    className="inline-flex size-9 items-center justify-center rounded-xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                    title="Print preview"
                                >
                                    <Printer size={15} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsFullPreviewOpen(false)}
                                    className="inline-flex size-9 items-center justify-center rounded-xl bg-red-500 text-white transition hover:opacity-90"
                                    title="Close full preview"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        <div ref={fullContainerRef} className="min-h-0 flex-1 overflow-auto bg-neutral-950 p-6">
                            <div className="mx-auto flex min-h-full w-max justify-center">
                                <div style={fullFrameWrapStyle}>
                                    <iframe
                                        title="Full template preview"
                                        srcDoc={previewHtml}
                                        scrolling="no"
                                        className="block border-0 bg-white shadow-2xl"
                                        style={fullIframeStyle}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default TemplatePreviewPanel;