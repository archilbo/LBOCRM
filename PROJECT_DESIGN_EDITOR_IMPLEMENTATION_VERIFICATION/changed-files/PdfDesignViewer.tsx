import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, FileWarning, Loader2, GripHorizontal } from 'lucide-react';
import type { ViewerFrame } from './DesignAnnotationLayer';
import { fitPage } from '../utils/viewport';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfDesignViewer({ previewUrl, downloadUrl, filename, containerRef, stageParentRef, onFrameChange, onPageChange, onPageShellRef, zoom, panX, panY, rotation, pageNumber: controlledPageNumber, hideToolbar, activeTool }: {
    previewUrl: string; downloadUrl: string; filename: string;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    stageParentRef?: React.RefObject<HTMLDivElement | null>;
    onFrameChange?: (f: ViewerFrame) => void;
    onPageChange?: (page: number) => void;
    onPageShellRef?: (el: HTMLDivElement | null) => void;
    zoom: number; panX: number; panY: number; rotation: number;
    pageNumber?: number;
    hideToolbar?: boolean;
    activeTool?: string;
}) {
    const [numPages, setNumPages] = useState(0);
    const [internalPageNumber, setInternalPageNumber] = useState(1);
    const pageNumber = controlledPageNumber ?? internalPageNumber;
    const [pageInput, setPageInput] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const pageWrapperRef = useRef<HTMLDivElement>(null);
    const pageShellRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const containerInnerRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [spaceHeld, setSpaceHeld] = useState(false);
    const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
    const [hovering, setHovering] = useState(false);
    const observerRef = useRef<ResizeObserver | null>(null);
    const didAutoFit = useRef(false);

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

    useEffect(() => { onPageChange?.(pageNumber); }, [pageNumber, onPageChange]);

    useLayoutEffect(() => {
        onPageShellRef?.(pageShellRef.current);
    }, [onPageShellRef]);

    // Report total pages is dispatched via custom event in onDocumentLoadSuccess

    // Auto-fit page on first load
    useEffect(() => {
        if (numPages > 0 && !didAutoFit.current) {
            didAutoFit.current = true;
            const viewer = viewerRef.current;
            if (viewer) {
                const vr = viewer.getBoundingClientRect();
                // Estimate page dims at zoom=1 to trigger fit
                const estW = vr.width * 0.7;
                const estH = vr.height * 0.9;
                const vp = fitPage(vr.width, vr.height, estW, estH);
                if (vp.zoom > 0) {
                    const evt = new CustomEvent('pd-auto-fit', { detail: vp });
                    window.dispatchEvent(evt);
                }
            }
        }
    }, [numPages]);

    // ResizeObserver to re-fit on container resize
    useEffect(() => {
        const el = containerInnerRef.current;
        if (!el) return;
        observerRef.current = new ResizeObserver(() => {
            const viewer = viewerRef.current;
            if (!viewer || numPages === 0) return;
            const vr = viewer.getBoundingClientRect();
            const estW = vr.width * 0.7;
            const estH = vr.height * 0.9;
            const vp = fitPage(vr.width, vr.height, estW, estH);
            if (vp.zoom > 0) {
                const evt = new CustomEvent('pd-auto-fit', { detail: vp });
                window.dispatchEvent(evt);
            }
        });
        observerRef.current.observe(el);
        return () => observerRef.current?.disconnect();
    }, [numPages]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setInternalPageNumber(1);
        didAutoFit.current = false;
        window.dispatchEvent(new CustomEvent('pd-total-pages', { detail: { totalPages: numPages } }));
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
            if (controlledPageNumber != null) {
                onPageChange?.(p);
            } else {
                setInternalPageNumber(p);
            }
            setPageInput('');
        }
    }

    function handlePageInputKey(e: React.KeyboardEvent) {
        if (e.key === 'Enter') goToPage(pageInput);
    }

    // Keyboard handlers for pan mode, page nav
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === ' ' && !e.repeat) {
                e.preventDefault();
                setSpaceHeld(true);
            }
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                const next = Math.min(numPages, pageNumber + 1);
                if (controlledPageNumber != null) { onPageChange?.(next); } else { setInternalPageNumber(next); }
            }
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                const prev = Math.max(1, pageNumber - 1);
                if (controlledPageNumber != null) { onPageChange?.(prev); } else { setInternalPageNumber(prev); }
            }
        }
        function handleKeyUp(e: KeyboardEvent) {
            if (e.key === ' ') {
                setSpaceHeld(false);
                setIsPanning(false);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [numPages, pageNumber, controlledPageNumber, onPageChange]);

    const panRef = useRef({ panX, panY });
    panRef.current = { panX, panY };

    // Native wheel listener (non-passive so preventDefault works)
    useEffect(() => {
        const wheelEl: HTMLDivElement | null = containerRef?.current ?? null;
        if (!wheelEl) return;
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const rect = wheelEl.getBoundingClientRect();
                const cx = e.clientX - rect.left;
                const cy = e.clientY - rect.top;
                const delta = e.deltaY > 0 ? -1 : 1;
                window.dispatchEvent(new CustomEvent('pd-wheel-zoom', { detail: { delta, cx, cy } }));
            } else if (e.shiftKey) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('pd-pan', { detail: { x: panRef.current.panX - e.deltaY, y: panRef.current.panY } }));
            }
        };
        wheelEl.addEventListener('wheel', onWheel, { passive: false });
        return () => wheelEl.removeEventListener('wheel', onWheel);
    }, [containerRef]);

    // Mouse handlers for pan
    function handleMouseDown(e: React.MouseEvent) {
        const isPanAction = spaceHeld || e.button === 1;
        if (!isPanAction) return;
        e.preventDefault();
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
    }

    function handleMouseMove(e: React.MouseEvent) {
        if (!isPanning) return;
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        window.dispatchEvent(new CustomEvent('pd-pan', { detail: { x: panStart.current.panX + dx, y: panStart.current.panY + dy } }));
    }

    function handleMouseUp() {
        setIsPanning(false);
    }

    function handleMouseEnter() { setHovering(true); }
    function handleMouseLeave() { setHovering(false); setIsPanning(false); }

    const showGrabCursor = spaceHeld || activeTool === 'select';
    const cursorStyle = isPanning ? 'grabbing' : showGrabCursor ? 'grab' : 'default';

    return (
        <div ref={viewerRef} className="relative flex h-full w-full flex-col">
            {!hideToolbar && (
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shrink-0">
                    <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
                    <div className="flex items-center gap-1">
                        <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)]">{Math.round(zoom * 100)}%</span>
                        <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                        <button type="button" onClick={() => { const p = Math.max(1, pageNumber - 1); if (controlledPageNumber != null) { onPageChange?.(p); } else { setInternalPageNumber(p); } }} disabled={pageNumber <= 1} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={13} /></button>
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
                        <button type="button" onClick={() => { const p = Math.min(numPages, pageNumber + 1); if (controlledPageNumber != null) { onPageChange?.(p); } else { setInternalPageNumber(p); } }} disabled={pageNumber >= numPages} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label="Next page"><ChevronRight size={13} /></button>
                        <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent)]/10">
                            <Download size={13} /> Download
                        </a>
                    </div>
                </div>
            )}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-hidden bg-[var(--surface-2)]/50"
                style={{ cursor: cursorStyle }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
            >
                {hovering && spaceHeld && (
                    <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded bg-[var(--surface)] px-2 py-1 text-[10px] text-[var(--text-muted)] shadow-sm border border-[var(--border)] flex items-center gap-1 pointer-events-none">
                        <GripHorizontal size={10} /> Drag to pan
                    </div>
                )}
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
                    <div ref={containerInnerRef} className="flex justify-center py-4 min-h-full">
                        <div ref={pageShellRef} className="pdf-page-shell relative inline-flex">
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
                    </div>
                </Document>
            </div>
        </div>
    );
}
