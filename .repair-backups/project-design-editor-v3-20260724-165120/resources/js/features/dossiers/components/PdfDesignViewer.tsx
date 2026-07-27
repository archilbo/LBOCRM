import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, FileWarning, Loader2, GripHorizontal } from 'lucide-react';
import type { ViewerState, ViewerAction, ViewerInteractionHandlers } from '@/features/project-design/viewer/useProjectDesignViewerController';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfDesignViewer({ previewUrl, downloadUrl, filename, state, dispatch, interactionHandlers, onPageChange, onTotalPages, hideToolbar, pageNumber: controlledPageNumber, onPageShellRef, children }: {
    previewUrl: string; downloadUrl: string; filename: string;
    state: ViewerState;
    dispatch: React.Dispatch<ViewerAction>;
    interactionHandlers: ViewerInteractionHandlers;
    onPageChange?: (page: number) => void;
    onTotalPages?: (n: number) => void;
    hideToolbar?: boolean;
    pageNumber?: number;
    onPageShellRef?: (el: HTMLDivElement | null) => void;
    children?: React.ReactNode;
}) {
    const [numPages, setNumPages] = useState(0);
    const [internalPageNumber, setInternalPageNumber] = useState(1);
    const pageNumber = controlledPageNumber ?? internalPageNumber;
    const [pageInput, setPageInput] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const pageShellRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLDivElement>(null);
    const [hovering, setHovering] = useState(false);

    const stableFile = useMemo(() => previewUrl, [previewUrl]);

    const requestPageChange = useCallback((nextPage: number) => {
        const clamped = Math.max(1, Math.min(nextPage, numPages || 1));
        if (controlledPageNumber != null) {
            onPageChange?.(clamped);
        } else {
            setInternalPageNumber(clamped);
        }
    }, [numPages, controlledPageNumber, onPageChange]);

    function onDocumentLoadSuccess({ numPages: total }: { numPages: number }) {
        setNumPages(total);
        onTotalPages?.(total);
    }

    const onPageLoadSuccessRef = useRef((page: { getViewport: (opts: { scale: number; rotation: number }) => { width: number; height: number } }) => {
        const vp = page.getViewport({ scale: 1, rotation: 0 });
        dispatch({ type: 'DOCUMENT_READY', totalPages: numPages || 1, sourceWidth: vp.width, sourceHeight: vp.height });
    });

    const onPageRenderSuccessRef = useRef(() => {
        const shell = pageShellRef.current;
        if (shell) {
            const rect = shell.getBoundingClientRect();
            dispatch({ type: 'RENDERED_DIMENSIONS', width: rect.width, height: rect.height });
        }
    });

    function onLoadProgress(progress: { loaded: number; total: number }) {
        if (progress.total > 0) {
            setLoadingProgress(Math.round((progress.loaded / progress.total) * 100));
        }
    }

    function goToPage(input: string) {
        const p = parseInt(input, 10);
        if (p >= 1 && p <= numPages) {
            requestPageChange(p);
            setPageInput('');
        }
    }

    function handlePageInputKey(e: React.KeyboardEvent) {
        if (e.key === 'Enter') goToPage(pageInput);
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
                || e.target instanceof HTMLSelectElement || e.target instanceof HTMLButtonElement) return;
            const isViewer = viewerRef.current?.contains(e.target as Node);
            if (!isViewer) return;
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                requestPageChange(pageNumber + 1);
            }
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                requestPageChange(pageNumber - 1);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageNumber, numPages, requestPageChange]);

    useEffect(() => {
        onPageShellRef?.(pageShellRef.current);
    }, [onPageShellRef]);

    const setViewerRef = useCallback((el: HTMLDivElement | null) => {
        viewerRef.current = el;
    }, []);

    function handlePointerEnter() { setHovering(true); }
    function handlePointerLeave() { setHovering(false); }

    const showGrabCursor = state.activeTool === 'pan' || state.activeTool === 'select';
    const cursorStyle = state.isPanning ? 'grabbing' : showGrabCursor ? 'grab' : 'default';

    return (
        <div ref={setViewerRef} className="relative flex h-full w-full flex-col" data-viewer-viewport>
            {!hideToolbar && (
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shrink-0">
                    <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
                    <div className="flex items-center gap-1">
                        <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)]">{Math.round(state.zoom * 100)}%</span>
                        <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                        <button type="button" onClick={() => requestPageChange(pageNumber - 1)} disabled={pageNumber <= 1} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={13} /></button>
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
                        <button type="button" onClick={() => requestPageChange(pageNumber + 1)} disabled={pageNumber >= numPages} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30" aria-label="Next page"><ChevronRight size={13} /></button>
                        <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent)]/10">
                            <Download size={13} /> Download
                        </a>
                    </div>
                </div>
            )}
            <div
                className="relative flex-1 overflow-hidden bg-[var(--surface-2)]/50"
                style={{ cursor: cursorStyle, touchAction: 'none' }}
                {...interactionHandlers}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
            >
                {hovering && (
                    <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded bg-[var(--surface)] px-2 py-1 text-[10px] text-[var(--text-muted)] shadow-sm border border-[var(--border)] flex items-center gap-1 pointer-events-none">
                        <GripHorizontal size={10} /> Drag to pan
                    </div>
                )}
                <Document
                    file={stableFile}
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
                    <div className="flex justify-center min-h-full">
                        <div ref={pageShellRef} className="pdf-page-shell relative inline-flex">
                            <div style={{ transform: `translate(${state.panX}px, ${state.panY}px)` }}>
                                <Page
                                    pageNumber={pageNumber}
                                    scale={state.zoom}
                                    rotate={state.rotation}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    onLoadSuccess={(page) => onPageLoadSuccessRef.current(page)}
                                    onRenderSuccess={() => onPageRenderSuccessRef.current()}
                                    className="shadow-lg"
                                />
                            </div>
                            {children}
                        </div>
                    </div>
                </Document>
            </div>
        </div>
    );
}
