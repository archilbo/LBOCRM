import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFPageProxy } from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Download, FileWarning, Loader2 } from 'lucide-react';
import type { ViewerFrame } from './DesignAnnotationLayer';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const FRAME_EPSILON = 0.25;
const RENDER_SCALE_SETTLE_MS = 140;

type PageMetrics = { width: number; height: number };

function nearlyEqual(a: number, b: number): boolean {
    return Math.abs(a - b) <= FRAME_EPSILON;
}

function framesEqual(a: ViewerFrame | null, b: ViewerFrame): boolean {
    if (!a) return false;

    return (
        nearlyEqual(a.scale, b.scale)
        && a.rotation === b.rotation
        && nearlyEqual(a.pageX, b.pageX)
        && nearlyEqual(a.pageY, b.pageY)
        && nearlyEqual(a.pageWidth, b.pageWidth)
        && nearlyEqual(a.pageHeight, b.pageHeight)
    );
}

const PdfPageCanvas = memo(function PdfPageCanvas({
    pageNumber,
    renderScale,
    rotation,
    onRenderSuccess,
}: {
    pageNumber: number;
    renderScale: number;
    rotation: number;
    onRenderSuccess: (page: PDFPageProxy) => void;
}) {
    return (
        <Page
            pageNumber={pageNumber}
            scale={renderScale}
            rotate={rotation}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={onRenderSuccess}
            className="overflow-hidden rounded-[2px] bg-white shadow-[0_24px_70px_rgb(0_0_0_/_0.35)]"
        />
    );
});

export default function PdfDesignViewer({
    previewUrl,
    downloadUrl,
    filename,
    containerRef,
    stageParentRef,
    onFrameChange,
    onPageChange,
    onPageShellRef,
    zoom,
    panX,
    panY,
    rotation,
    pageNumber: controlledPageNumber,
    hideToolbar,
    activeTool,
    isPanning,
    spaceHeld,
    onTotalPages,
}: {
    previewUrl: string;
    downloadUrl: string;
    filename: string;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    stageParentRef?: React.RefObject<HTMLDivElement | null>;
    onFrameChange?: (frame: ViewerFrame) => void;
    onPageChange?: (page: number) => void;
    onPageShellRef?: (element: HTMLDivElement | null) => void;
    zoom: number;
    panX: number;
    panY: number;
    rotation: number;
    pageNumber?: number;
    hideToolbar?: boolean;
    activeTool?: string;
    isPanning?: boolean;
    spaceHeld?: boolean;
    /** Retained for caller compatibility. Continuous mode is intentionally not rendered. */
    continuous?: boolean;
    onTotalPages?: (total: number) => void;
}) {
    const [numPages, setNumPages] = useState(0);
    const [internalPageNumber, setInternalPageNumber] = useState(1);
    const [pageInput, setPageInput] = useState('');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [renderScale, setRenderScale] = useState(zoom);
    const [committedRenderScale, setCommittedRenderScale] = useState(zoom);

    const pageWrapperRef = useRef<HTMLDivElement>(null);
    const pageShellRef = useRef<HTMLDivElement>(null);
    const pageMetricsRef = useRef<PageMetrics>({ width: 0, height: 0 });
    const latestFrameInputsRef = useRef({
        zoom,
        rotation: ((rotation % 360) + 360) % 360,
        onFrameChange,
        stageParentRef,
    });
    const lastFrameRef = useRef<ViewerFrame | null>(null);
    const frameRafRef = useRef<number | null>(null);

    const pageNumber = controlledPageNumber ?? internalPageNumber;
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const displayScale = committedRenderScale > 0 ? zoom / committedRenderScale : 1;


    useEffect(() => {
        if (nearlyEqual(renderScale, zoom)) return;

        const timer = window.setTimeout(() => {
            setRenderScale(zoom);
        }, RENDER_SCALE_SETTLE_MS);

        return () => window.clearTimeout(timer);
    }, [renderScale, zoom]);

    const requestPageChange = useCallback((nextPage: number) => {
        const clamped = Math.max(1, Math.min(nextPage, numPages || 1));

        if (controlledPageNumber != null) {
            if (clamped !== controlledPageNumber) onPageChange?.(clamped);
            return;
        }

        setInternalPageNumber(clamped);
    }, [controlledPageNumber, numPages, onPageChange]);

    useLayoutEffect(() => {
        latestFrameInputsRef.current = {
            zoom,
            rotation: normalizedRotation,
            onFrameChange,
            stageParentRef,
        };
    }, [normalizedRotation, onFrameChange, stageParentRef, zoom]);

    const reportFrame = useCallback(() => {
        const wrapper = pageWrapperRef.current;
        const inputs = latestFrameInputsRef.current;
        const parent = inputs.stageParentRef?.current;
        const metrics = pageMetricsRef.current;
        if (!wrapper || !parent || metrics.width <= 0 || metrics.height <= 0) return;

        const wrapperRect = wrapper.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const frame: ViewerFrame = {
            scale: inputs.zoom,
            rotation: inputs.rotation,
            pageX: wrapperRect.left - parentRect.left,
            pageY: wrapperRect.top - parentRect.top,
            pageWidth: metrics.width,
            pageHeight: metrics.height,
        };

        if (framesEqual(lastFrameRef.current, frame)) return;
        lastFrameRef.current = frame;
        inputs.onFrameChange?.(frame);
    }, []);

    const scheduleFrameReport = useCallback(() => {
        if (frameRafRef.current != null) window.cancelAnimationFrame(frameRafRef.current);
        frameRafRef.current = window.requestAnimationFrame(() => {
            frameRafRef.current = null;
            reportFrame();
        });
    }, [reportFrame]);

    useLayoutEffect(() => {
        scheduleFrameReport();
    }, [panX, panY, zoom, normalizedRotation, pageNumber, scheduleFrameReport]);

    useLayoutEffect(() => {
        onPageShellRef?.(pageShellRef.current);
        return () => onPageShellRef?.(null);
    }, [onPageShellRef]);

    useEffect(() => () => {
        if (frameRafRef.current != null) window.cancelAnimationFrame(frameRafRef.current);
    }, []);

    const handleDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
        setNumPages(total);
        onTotalPages?.(total);

        if (controlledPageNumber != null) {
            const clamped = Math.max(1, Math.min(controlledPageNumber, total));
            if (clamped !== controlledPageNumber) onPageChange?.(clamped);
        } else {
            setInternalPageNumber(1);
        }
    }, [controlledPageNumber, onPageChange, onTotalPages]);

    const handlePageRenderSuccess = useCallback((page: PDFPageProxy) => {
        const viewport = page.getViewport({ scale: 1, rotation: 0 });
        const metrics = { width: viewport.width, height: viewport.height };
        pageMetricsRef.current = metrics;
        setCommittedRenderScale(renderScale);
        scheduleFrameReport();
    }, [renderScale, scheduleFrameReport]);

    const handleLoadProgress = useCallback((progress: { loaded: number; total: number }) => {
        if (progress.total <= 0) return;
        setLoadingProgress(Math.round((progress.loaded / progress.total) * 100));
    }, []);

    const goToPage = useCallback((input: string) => {
        const parsed = Number.parseInt(input, 10);
        if (!Number.isFinite(parsed)) return;

        requestPageChange(parsed);
        setPageInput('');
    }, [requestPageChange]);

    const cursor = isPanning
        ? 'grabbing'
        : spaceHeld || activeTool === 'pan'
            ? 'grab'
            : activeTool === 'select'
                ? 'default'
                : 'crosshair';

    return (
        <div className="relative flex h-full w-full flex-col outline-none">
            {!hideToolbar ? (
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                    <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
                    <div className="flex items-center gap-1">
                        <span className="min-w-[42px] text-center text-[11px] tabular-nums text-[var(--text-muted)]">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            type="button"
                            onClick={() => requestPageChange(pageNumber - 1)}
                            disabled={pageNumber <= 1}
                            className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30"
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={13} />
                        </button>
                        <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={pageInput}
                                onChange={(event) => setPageInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') goToPage(pageInput);
                                }}
                                onBlur={() => {
                                    if (pageInput) goToPage(pageInput);
                                }}
                                placeholder={String(pageNumber)}
                                className="w-8 rounded border border-[var(--border)] bg-[var(--surface-2)] px-1 py-0.5 text-center text-[11px] outline-none focus:border-[var(--accent)]"
                                aria-label="Page number"
                            />
                            <span>/ {Math.max(1, numPages)}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => requestPageChange(pageNumber + 1)}
                            disabled={pageNumber >= numPages}
                            className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30"
                            aria-label="Next page"
                        >
                            <ChevronRight size={13} />
                        </button>
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                            aria-label="Download PDF"
                        >
                            <Download size={13} />
                        </a>
                    </div>
                </div>
            ) : null}

            <div
                ref={containerRef}
                className="relative flex-1 overflow-hidden bg-[#101214]"
                style={{
                    cursor,
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            >
                <Document
                    file={previewUrl}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    onProgress={handleLoadProgress}
                    loading={(
                        <div className="flex h-full flex-col items-center justify-center gap-2 py-20">
                            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                            <p className="text-[12px] text-[var(--text-muted)]">
                                Loading PDF{loadingProgress > 0 ? ` · ${loadingProgress}%` : '…'}
                            </p>
                        </div>
                    )}
                    error={(
                        <div className="flex h-full flex-col items-center justify-center gap-2 py-20">
                            <FileWarning size={24} className="text-amber-400" />
                            <p className="text-[13px] text-[var(--text-muted)]">Could not load this PDF.</p>
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[12px] text-[var(--accent)] underline"
                            >
                                Open source file
                            </a>
                        </div>
                    )}
                >
                    <div className="flex min-h-full items-start justify-center p-6 sm:p-8">
                        <div ref={pageShellRef} className="pdf-page-shell relative inline-flex">
                            <div
                                ref={pageWrapperRef}
                                className="will-change-transform"
                                style={{
                                    transform: `translate3d(${panX}px, ${panY}px, 0) scale(${displayScale})`,
                                    transformOrigin: 'top left',
                                }}
                            >
                                <PdfPageCanvas
                                    pageNumber={pageNumber}
                                    renderScale={renderScale}
                                    rotation={normalizedRotation}
                                    onRenderSuccess={handlePageRenderSuccess}
                                />
                            </div>
                        </div>
                    </div>
                </Document>
            </div>
        </div>
    );
}
