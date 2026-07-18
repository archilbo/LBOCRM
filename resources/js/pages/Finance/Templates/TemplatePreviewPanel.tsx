import {
    ChevronLeft,
    ChevronRight,
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
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PaperSize = 'A4' | 'A5' | 'Letter';

const PAPER_DIMS: Record<PaperSize, { width: number; height: number }> = {
    A4: { width: 794, height: 1123 },
    A5: { width: 559, height: 794 },
    Letter: { width: 816, height: 1056 },
};

type TemplatePreviewPanelProps = {
    html: string;
    onRefresh?: () => void | Promise<void>;
    paperSize?: PaperSize;
    orientation?: 'portrait' | 'landscape';
    collapsed?: boolean;
    onToggleCollapse?: () => void;
};

function emptyPreviewHtml(width: number, height: number) {
    return `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    html, body { margin: 0; padding: 0; background: #ffffff; }
                    body { font-family: Arial, sans-serif; color: #111827; }
                    .empty {
                        width: ${width}px;
                        min-height: ${height}px;
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

function getAppCssLinks(): string {
    if (typeof document === 'undefined') return '';
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    return links
        .filter((link) => link.href && link.href.includes('/assets/app-'))
        .map((link) => `<link rel="stylesheet" href="${link.href}">`)
        .join('\n');
}

function injectPreviewReset(html: string, width: number) {
    const resetCss = `
        ${getAppCssLinks()}
        <style id="archi-lbo-preview-reset">
            html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #ffffff !important; }
            body { width: ${width}px !important; min-width: ${width}px !important; }
            .page { margin: 0 !important; box-shadow: none !important; }
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
    paperSize = 'A4',
    orientation = 'portrait',
    collapsed = false,
    onToggleCollapse,
}: TemplatePreviewPanelProps) {
    const sideContainerRef = useRef<HTMLDivElement>(null);
    const fullContainerRef = useRef<HTMLDivElement>(null);

    const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
    const [zoom, setZoom] = useState(0.85);
    const [sideScale, setSideScale] = useState(0.45);

    const dims = PAPER_DIMS[paperSize] ?? PAPER_DIMS.A4;
    const paperWidth = orientation === 'landscape' ? dims.height : dims.width;
    const paperHeight = orientation === 'landscape' ? dims.width : dims.height;

    const previewHtml = useMemo(() => {
        const content = html?.trim() ? html : emptyPreviewHtml(paperWidth, paperHeight);
        return injectPreviewReset(content, paperWidth);
    }, [html, paperWidth, paperHeight]);

    useEffect(() => {
        const node = sideContainerRef.current;
        if (!node) return;

        function updateScale() {
            const width = node.clientWidth;
            const maxHeight = node.clientHeight;
            if (width <= 0) return;

            const scaleByWidth = (width - 24) / paperWidth;
            const scaleByHeight = maxHeight / paperHeight;
            setSideScale(Math.min(1, Math.max(0.2, Math.min(scaleByWidth, scaleByHeight))));
        }

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(node);
        return () => observer.disconnect();
    }, [paperWidth, paperHeight]);

    useEffect(() => {
        if (!isFullPreviewOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsFullPreviewOpen(false);
            }
            if (event.key === 'f' && !event.ctrlKey && !event.metaKey) {
                setIsFullPreviewOpen(false);
            }
            if ((event.ctrlKey || event.metaKey) && event.key === '+') {
                event.preventDefault();
                setZoom((c) => clampZoom(c + 0.1));
            }
            if ((event.ctrlKey || event.metaKey) && event.key === '-') {
                event.preventDefault();
                setZoom((c) => clampZoom(c - 0.1));
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
        setTimeout(() => fitWidth(), 50);
    }

    function fitWidth() {
        const node = fullContainerRef.current;
        if (!node) { setZoom(0.85); return; }
        const availableWidth = Math.max(node.clientWidth - 80, 320);
        setZoom(clampZoom(availableWidth / paperWidth));
    }

    function openInNewTab() {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.open();
        w.document.write(previewHtml);
        w.document.close();
    }

    function printPreview() {
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.open();
        w.document.write(previewHtml);
        w.document.close();
        w.onload = () => { w.focus(); w.print(); };
    }

    const sideFrameWrapStyle: CSSProperties = {
        width: paperWidth * sideScale,
        height: paperHeight * sideScale,
    };

    const sideIframeStyle: CSSProperties = {
        width: paperWidth,
        height: paperHeight,
        transform: `scale(${sideScale})`,
        transformOrigin: 'top left',
    };

    const fullFrameWrapStyle: CSSProperties = {
        width: paperWidth * zoom,
        height: paperHeight * zoom,
    };

    const fullIframeStyle: CSSProperties = {
        width: paperWidth,
        height: paperHeight,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
    };

    if (collapsed) {
        return (
            <div className="flex w-3 shrink-0 flex-col items-center border-l border-[var(--border)] bg-[var(--surface)] pt-2">
                <button type="button" onClick={onToggleCollapse} className="flex size-5 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)]">
                    <ChevronLeft size={14} />
                </button>
            </div>
        );
    }

    const scaledHeight = paperHeight * sideScale;

    return (
        <>
            <aside className="flex w-[420px] 2xl:w-[480px] shrink-0 flex-col border-l border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <Monitor size={14} className="shrink-0 text-[var(--accent)]" />
                        <span className="truncate text-xs font-semibold text-[var(--text)]">Preview</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => void refreshPreview()} className="inline-flex size-6 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)]" title="Refresh">
                            <RefreshCcw size={12} />
                        </button>
                        <button type="button" onClick={openFullPreview} className="inline-flex h-6 items-center gap-1 rounded bg-[var(--accent)] px-2 text-[10px] font-semibold text-black" title="Fullscreen preview">
                            <Maximize2 size={10} />
                            Full
                        </button>
                        {onToggleCollapse ? (
                            <button type="button" onClick={onToggleCollapse} className="inline-flex size-6 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)]" title="Collapse preview">
                                <ChevronRight size={12} />
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 items-start overflow-y-auto bg-[var(--surface-2)] p-2">
                    <div
                        ref={sideContainerRef}
                        className="flex items-start justify-center overflow-hidden rounded-lg border bg-neutral-200 p-2 shadow-inner"
                        style={{ minHeight: scaledHeight, minWidth: paperWidth * sideScale }}
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
            </aside>

            {isFullPreviewOpen ? (
                <div className="fixed inset-0 z-[120] flex flex-col bg-black/85 backdrop-blur-sm">
                    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-[var(--surface)] px-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <Monitor size={16} className="text-[var(--accent)]" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--text)]">Full preview</p>
                                <p className="text-xs text-[var(--text-muted)]">Esc/f to close · Ctrl+± zoom · Ctrl+0 reset</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button type="button" onClick={() => void refreshPreview()} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white/70 hover:bg-white/10">
                                <RefreshCcw size={12} /> Refresh
                            </button>
                            <button type="button" onClick={fitWidth} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white/70 hover:bg-white/10">
                                <Maximize2 size={12} /> Fit
                            </button>
                            <button type="button" onClick={() => setZoom((c) => clampZoom(c - 0.1))} className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10">
                                <ZoomOut size={13} />
                            </button>
                            <span className="min-w-12 rounded-md border border-white/10 px-2 py-1 text-center text-xs font-semibold text-white/80">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button type="button" onClick={() => setZoom((c) => clampZoom(c + 0.1))} className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10">
                                <ZoomIn size={13} />
                            </button>
                            <button type="button" onClick={() => setZoom(0.85)} className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10">
                                <RotateCcw size={13} />
                            </button>
                            <button type="button" onClick={openInNewTab} className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10">
                                <ExternalLink size={13} />
                            </button>
                            <button type="button" onClick={printPreview} className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10">
                                <Printer size={13} />
                            </button>
                            <button type="button" onClick={() => setIsFullPreviewOpen(false)} className="inline-flex size-8 items-center justify-center rounded-lg bg-red-500/80 text-white hover:bg-red-500">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                    <div ref={fullContainerRef} className="min-h-0 flex-1 overflow-auto bg-neutral-950 p-6">
                        <div className="mx-auto flex min-h-full w-max items-start justify-center">
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
            ) : null}
        </>
    );
}

export default TemplatePreviewPanel;
