import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize, Minimize, RotateCw, FileWarning, Loader2, AlignCenter, AlignStartVertical } from 'lucide-react';
import type { ViewerFrame } from './DesignAnnotationLayer';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type FitMode = 'width' | 'page' | 'free';

export default function PdfDesignViewer({ previewUrl, downloadUrl, filename, containerRef, stageParentRef, onFrameChange, zoom, panX, panY, rotation }: {
    previewUrl: string; downloadUrl: string; filename: string;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    stageParentRef?: React.RefObject<HTMLDivElement | null>;
    onFrameChange?: (f: ViewerFrame) => void;
    zoom: number; panX: number; panY: number; rotation: number;
}) {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [fitMode, setFitMode] = useState<FitMode>('free');
    const [fullscreen, setFullscreen] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const pageWrapperRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);

    const reportFrame = useCallback(() => {
        const wrapper = pageWrapperRef.current;
        const parent = stageParentRef?.current;
        if (!wrapper || !parent) return;
        const wr = wrapper.getBoundingClientRect();
        const pr = parent.getBoundingClientRect();
        onFrameChange?.({
            scale: zoom,
            rotation,
            pageX: wr.left - pr.left,
            pageY: wr.top - pr.top,
            pageWidth: wr.width / zoom,
            pageHeight: wr.height / zoom,
        });
    }, [zoom, rotation, stageParentRef, onFrameChange]);

    useLayoutEffect(() => { reportFrame(); }, [zoom, rotation, panX, panY, reportFrame]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function onLoadProgress(progress: { loaded: number; total: number }) {
        if (progress.total > 0) {
            setLoadingProgress(Math.round((progress.loaded / progress.total) * 100));
        }
    }

    function onPageRenderSuccess() {
        requestAnimationFrame(() => reportFrame());
    }

    function goToPage(input: string) {
        const p = parseInt(input, 10);
        if (p >= 1 && p <= numPages) {
            setPageNumber(p);
            setPageInput('');
        }
    }

    function handlePageInputKey(e: React.KeyboardEvent) {
        if (e.key === 'Enter') goToPage(pageInput);
    }

    function fitWidth() { setFitMode('width'); }
    function fitPage() { setFitMode('page'); }

    const toggleFullscreen = useCallback(async () => {
        if (!fullscreen) {
            const el = containerRef?.current ?? viewerRef.current;
            if (el?.requestFullscreen) {
                await el.requestFullscreen();
                setFullscreen(true);
            }
        } else {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                setFullscreen(false);
            }
        }
    }, [fullscreen, containerRef]);

    useEffect(() => {
        function onFsChange() {
            setFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowRight' || e.key === 'PageDown') setPageNumber((p) => Math.min(numPages, p + 1));
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') setPageNumber((p) => Math.max(1, p - 1));
            if (e.key === 'f') toggleFullscreen();
            if (e.key === 'Escape' && fullscreen) {
                document.exitFullscreen();
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [numPages, fullscreen, toggleFullscreen]);

    return (
        <div ref={viewerRef} className="relative flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={fitWidth} title="Fit width" aria-label="Fit width"
                        className={cn('flex size-7 items-center justify-center rounded-md transition', fitMode === 'width' ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]')}>
                        <AlignStartVertical size={13} />
                    </button>
                    <button type="button" onClick={fitPage} title="Fit page" aria-label="Fit page"
                        className={cn('flex size-7 items-center justify-center rounded-md transition', fitMode === 'page' ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]')}>
                        <AlignCenter size={13} />
                    </button>
                    <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                    <span className="min-w-[4ch] text-center text-[11px] text-[var(--text-muted)]">{Math.round(zoom * 100)}%</span>
                    <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                    <button type="button" onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={13} /></button>
                    <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                        {numPages > 0 ? (
                            <span className="flex items-center gap-1">
                                <input type="text" value={pageInput} onChange={(e) => setPageInput(e.target.value)} onKeyDown={handlePageInputKey}
                                    onBlur={() => { if (pageInput) goToPage(pageInput); }}
                                    className="w-7 rounded border border-[var(--border)] bg-[var(--surface-2)] px-1 py-0.5 text-center text-[11px] outline-none focus:border-[var(--accent)]"
                                    aria-label="Page number" /> / {numPages}
                            </span>
                        ) : '-'}
                    </span>
                    <button type="button" onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label="Next page"><ChevronRight size={13} /></button>
                    <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                    <button type="button" onClick={toggleFullscreen} title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'} aria-label="Toggle fullscreen"
                        className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]">
                        {fullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                    </button>
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent)]/10">
                        <Download size={13} /> Download
                    </a>
                </div>
            </div>
            <div className="relative flex-1 overflow-hidden bg-[var(--surface-2)]/50" ref={containerRef}>
                <Document
                    file={previewUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onProgress={onLoadProgress}
                    loading={
                        <div className="flex h-full flex-col items-center justify-center gap-2 py-20">
                            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                            <p className="text-[12px] text-[var(--text-muted)]">Loading PDF... {loadingProgress > 0 && `${loadingProgress}%`}</p>
                        </div>
                    }
                    error={
                        <div className="flex h-full flex-col items-center justify-center gap-2 py-20">
                            <FileWarning size={24} className="text-amber-400" />
                            <p className="text-[13px] text-[var(--text-muted)]">Could not load PDF.</p>
                            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[var(--accent)] underline">Open in new tab</a>
                        </div>
                    }
                >
                    <div className="flex justify-center py-4">
                        <div ref={pageWrapperRef} style={{ transform: `translate(${panX}px, ${panY}px)` }}>
                            <Page
                                pageNumber={pageNumber}
                                scale={zoom}
                                rotate={rotation}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                onRenderSuccess={onPageRenderSuccess}
                                className="shadow-lg"
                            />
                        </div>
                    </div>
                </Document>
            </div>
        </div>
    );
}

function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
