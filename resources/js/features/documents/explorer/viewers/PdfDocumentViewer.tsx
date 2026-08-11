import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page } from 'react-pdf';
import type { PDFPageProxy } from 'pdfjs-dist';
import {
    ArrowLeftRight as ArrowLeftRightIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Loader2 as Loader2Icon,
    Maximize as MaximizeIcon,
    RotateCcw as RotateCcwIcon,
    RotateCw as RotateCwIcon,
    Scan as ScanIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
} from 'lucide-react';
import { Input } from '@heroui/react';

import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';
import '../pdfWorker';
import { DocumentViewerFallback } from '../DocumentViewerFallback';
import {
    PDF_SCALE_MAX,
    PDF_SCALE_MIN,
    PDF_SCALE_STEP,
    ROTATION_STEP,
    normalizeRotation,
    snapZoom,
} from '../documentViewerConstants';
import { DOCUMENT_VIEWER_TOOLBAR_HOST_ID, type DocumentViewerProps } from './viewerTypes';

type PdfFitMode = 'width' | 'page' | null;
type PdfPhase = 'loading' | 'ready' | 'failed';
type PdfPanState = { pointerId: number; x: number; y: number; scrollLeft: number; scrollTop: number } | null;

/**
 * Dedicated PDF preview built on react-pdf + the locally bundled pdfjs
 * worker (see pdfWorker.ts). Fit width / fit page, explicit 50–300% scale in
 * 25% steps, rotation normalized to 0–359°, one active page at a time with a
 * clamped integer page input (Enter/blur commit). PageUp / PageDown /
 * Shift+Arrows change the PDF page; plain Left/Right stay reserved for the
 * modal's document navigation. The file is the authorized private viewUrl —
 * never a public URL, never parsed outside pdf.js.
 */
export function PdfDocumentViewer({ document, onDownload }: DocumentViewerProps) {
    const { t } = useTranslation();

    const [phase, setPhase] = useState<PdfPhase>('loading');
    const [retryKey, setRetryKey] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageInput, setPageInput] = useState('');
    /** null = manual scale; 'width' / 'page' = fit modes. */
    const [fit, setFit] = useState<PdfFitMode>('width');
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    /** Rotated page viewport at scale 1, captured after each render. */
    const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
    const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const [toolbarHost, setToolbarHost] = useState<HTMLElement | null>(null);

    const stageRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef(new Map<number, HTMLDivElement>());
    const effectiveScaleRef = useRef(1);
    const panRef = useRef<PdfPanState>(null);

    const canDownload = document.capabilities.canDownload;
    const normalizedRotation = normalizeRotation(rotation);

    const fitScale =
        fit && pageSize && containerSize && pageSize.width > 0 && containerSize.width > 0 && containerSize.height > 0
            ? fit === 'width'
                ? containerSize.width / pageSize.width
                : Math.min(containerSize.width / pageSize.width, containerSize.height / pageSize.height)
            : 1;

    const effectiveScale = fit ? fitScale : scale;
    const canPan = fit === null && effectiveScale > 1;

    // Keep the latest effective scale available to the stable wheel handler.
    useEffect(() => {
        effectiveScaleRef.current = effectiveScale;
    });

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setToolbarHost(window.document.getElementById(DOCUMENT_VIEWER_TOOLBAR_HOST_ID));
        });

        return () => window.cancelAnimationFrame(frame);
    }, []);

    const isPasswordError = loadError instanceof Error && loadError.name === 'PasswordException';

    const applyScaleDelta = (delta: number) => {
        const next = snapZoom(effectiveScale + delta * PDF_SCALE_STEP, PDF_SCALE_STEP, PDF_SCALE_MIN, PDF_SCALE_MAX);
        setFit(null);
        setScale(next);
    };

    const setActualSize = () => {
        setFit(null);
        setScale(1);
    };

    const setFitWidth = () => {
        setFit('width');
    };

    const setFitPage = () => {
        setFit('page');
    };

    const rotateLeft = () => {
        setRotation((current) => normalizeRotation(current - ROTATION_STEP));
    };

    const rotateRight = () => {
        setRotation((current) => normalizeRotation(current + ROTATION_STEP));
    };

    const scrollToPage = useCallback((targetPage: number) => {
        requestAnimationFrame(() => {
            const stage = stageRef.current;
            const target = pageRefs.current.get(targetPage);

            if (!stage || !target) {
                return;
            }

            stage.scrollTo({
                top: Math.max(0, target.offsetTop - 16),
                behavior: 'smooth',
            });
        });
    }, []);

    /** Clamps any number into the valid page range and scrolls it into view. */
    const goToPage = (next: number) => {
        if (!Number.isFinite(next) || numPages <= 0) {
            return;
        }

        const clamped = Math.min(Math.max(1, Math.floor(next)), numPages);
        setPageNumber(clamped);
        scrollToPage(clamped);
    };

    const commitPageInput = () => {
        if (!pageInput) {
            return;
        }

        const parsed = Number.parseInt(pageInput, 10);
        goToPage(parsed);
        setPageInput('');
    };

    const handleDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
        setNumPages(total);
        setPageNumber((current) => Math.min(current, total));
        setPhase('ready');
    }, []);

    const handleDocumentLoadError = useCallback((error: Error) => {
        setLoadError(error);
        setPhase('failed');
    }, []);

    const handlePageRenderSuccess = useCallback(
        (page: PDFPageProxy) => {
            const viewport = page.getViewport({ scale: 1, rotation: normalizedRotation });
            if (page.pageNumber === 1 && viewport.width > 0 && viewport.height > 0) {
                setPageSize({ width: viewport.width, height: viewport.height });
            }
        },
        [normalizedRotation],
    );

    const handleRetry = useCallback(() => {
        setLoadError(null);
        setPhase('loading');
        setRetryKey((key) => key + 1);
    }, []);

    // One ResizeObserver per stage; disconnected on cleanup; zero-sized
    // containers are ignored so an empty layout never produces a fit of 0.
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) {
                return;
            }

            const { width, height } = entry.contentRect;
            if (width <= 0 || height <= 0) {
                return;
            }

            setContainerSize({ width, height });
        });

        observer.observe(stage);

        return () => observer.disconnect();
    }, []);

    // Ctrl/Cmd + wheel scales (25% steps); compounding events update the ref
    // so rapid wheel input never reads a stale base.
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) {
            return;
        }

        const handleWheel = (event: WheelEvent) => {
            if (!event.ctrlKey && !event.metaKey) {
                return;
            }

            event.preventDefault();
            const next = snapZoom(
                effectiveScaleRef.current + (event.deltaY > 0 ? -1 : 1) * PDF_SCALE_STEP,
                PDF_SCALE_STEP,
                PDF_SCALE_MIN,
                PDF_SCALE_MAX,
            );
            effectiveScaleRef.current = next;
            setFit(null);
            setScale(next);
        };

        stage.addEventListener('wheel', handleWheel, { passive: false });

        return () => stage.removeEventListener('wheel', handleWheel);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement | null;
        if (target?.matches('input, textarea, select, [contenteditable="true"]')) {
            return;
        }

        if (event.key === 'PageUp') {
            event.preventDefault();
            goToPage(pageNumber - 1);
            return;
        }

        if (event.key === 'PageDown') {
            event.preventDefault();
            goToPage(pageNumber + 1);
            return;
        }

        // Shift+Arrows are PDF page navigation; stop propagation so the
        // modal's window listener does not also move between documents.
        if (event.shiftKey && event.key === 'ArrowLeft') {
            event.preventDefault();
            event.stopPropagation();
            goToPage(pageNumber - 1);
            return;
        }

        if (event.shiftKey && event.key === 'ArrowRight') {
            event.preventDefault();
            event.stopPropagation();
            goToPage(pageNumber + 1);
        }

        // Plain Left/Right intentionally fall through: document navigation
        // stays owned by the modal.
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!canPan || event.button !== 0 || (event.target as HTMLElement).closest('button, input')) {
            return;
        }

        const stage = event.currentTarget;
        panRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            scrollLeft: stage.scrollLeft,
            scrollTop: stage.scrollTop,
        };
        stage.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const pan = panRef.current;
        if (!pan || pan.pointerId !== event.pointerId) {
            return;
        }

        const stage = event.currentTarget;
        stage.scrollLeft = pan.scrollLeft - (event.clientX - pan.x);
        stage.scrollTop = pan.scrollTop - (event.clientY - pan.y);
    };

    const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
        if (panRef.current?.pointerId !== event.pointerId) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        panRef.current = null;
    };

    const handleStageScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const stage = event.currentTarget;
        const viewportMiddle = stage.scrollTop + stage.clientHeight / 2;
        let nearestPage = pageNumber;
        let nearestDistance = Number.POSITIVE_INFINITY;

        pageRefs.current.forEach((page, number) => {
            if (page.offsetHeight <= 0) {
                return;
            }

            const pageMiddle = page.offsetTop + page.offsetHeight / 2;
            const distance = Math.abs(pageMiddle - viewportMiddle);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPage = number;
            }
        });

        setPageNumber((current) => (current === nearestPage ? current : nearestPage));
    };

    const fitWidthLabel = t('documentsExplorer.viewer.fitWidth');
    const fitPageLabel = t('documentsExplorer.viewer.fitPage');
    const zoomOutLabel = t('documentsExplorer.viewer.zoomOut');
    const zoomInLabel = t('documentsExplorer.viewer.zoomIn');
    const actualSizeLabel = t('documentsExplorer.viewer.actualSize');
    const rotateLeftLabel = t('documentsExplorer.viewer.rotateLeft');
    const rotateRightLabel = t('documentsExplorer.viewer.rotateRight');
    const previousPageLabel = t('documentsExplorer.viewer.previousPage');
    const nextPageLabel = t('documentsExplorer.viewer.nextPage');

    const toolbar = phase !== 'failed' ? (
                <div className="grid min-w-max grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                    <div className="flex min-w-max items-center gap-1">
                        <AppButton isIconOnly compact size="sm" variant="quiet" isDisabled={fit === 'width'} tooltip={fitWidthLabel} aria-label={fitWidthLabel} onPress={setFitWidth}>
                            <ArrowLeftRightIcon size={14} />
                        </AppButton>
                        <AppButton isIconOnly compact size="sm" variant="quiet" isDisabled={fit === 'page'} tooltip={fitPageLabel} aria-label={fitPageLabel} onPress={setFitPage}>
                            <MaximizeIcon size={14} />
                        </AppButton>
                    </div>

                    <div className="flex min-w-max items-center gap-1 justify-self-center">
                        <AppButton isIconOnly compact size="sm" variant="quiet" isDisabled={fit === null && effectiveScale <= PDF_SCALE_MIN} tooltip={zoomOutLabel} aria-label={zoomOutLabel} onPress={() => applyScaleDelta(-1)}>
                            <ZoomOutIcon size={14} />
                        </AppButton>
                        <AppButton isIconOnly compact size="sm" variant="quiet" isDisabled={fit === null && scale === 1} tooltip={`${actualSizeLabel} (${Math.round(effectiveScale * 100)}%)`} aria-label={actualSizeLabel} onPress={setActualSize}>
                            <ScanIcon size={14} />
                        </AppButton>
                        <AppButton isIconOnly compact size="sm" variant="quiet" isDisabled={fit === null && effectiveScale >= PDF_SCALE_MAX} tooltip={zoomInLabel} aria-label={zoomInLabel} onPress={() => applyScaleDelta(1)}>
                            <ZoomInIcon size={14} />
                        </AppButton>
                        <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden="true" />
                        <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={rotateLeftLabel} aria-label={rotateLeftLabel} onPress={rotateLeft}>
                            <RotateCcwIcon size={14} />
                        </AppButton>
                        <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={rotateRightLabel} aria-label={rotateRightLabel} onPress={rotateRight}>
                            <RotateCwIcon size={14} />
                        </AppButton>
                        <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden="true" />
                        <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        isDisabled={pageNumber <= 1 || numPages <= 0}
                        tooltip={previousPageLabel}
                        aria-label={previousPageLabel}
                        onPress={() => goToPage(pageNumber - 1)}
                    >
                        <ChevronLeftIcon size={14} />
                    </AppButton>

                    <span className="flex items-center gap-1 text-[10px] tabular-nums text-[var(--text-muted)]">
                        <Input
                            inputMode="numeric"
                            value={pageInput}
                            onChange={(event) => setPageInput(event.target.value.replace(/\D/g, ''))}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    commitPageInput();
                                }
                            }}
                            onBlur={commitPageInput}
                            placeholder={String(pageNumber)}
                            variant="secondary"
                            className="h-7 w-12 text-center text-[10px]"
                            aria-label={t('documentsExplorer.viewer.pageNumber')}
                        />
                        <span>
                            {t('documentsExplorer.viewer.position')
                                .replace('{current}', String(pageNumber))
                                .replace('{total}', String(numPages))}
                        </span>
                    </span>

                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        isDisabled={pageNumber >= numPages || numPages <= 0}
                        tooltip={nextPageLabel}
                        aria-label={nextPageLabel}
                        onPress={() => goToPage(pageNumber + 1)}
                    >
                        <ChevronRightIcon size={14} />
                    </AppButton>
                    </div>

                    <div aria-hidden="true" />
                </div>
            ) : null;
    return (
        <>
            {toolbarHost && toolbar ? createPortal(toolbar, toolbarHost) : null}
            <div className="flex min-h-0 flex-1 flex-col">
                {!toolbarHost ? toolbar : null}

            {phase === 'failed' ? (
                <DocumentViewerFallback
                    document={document}
                    isInvalid={false}
                    title={isPasswordError ? t('documentsExplorer.viewer.pdfPasswordRequired') : undefined}
                    description={t('documentsExplorer.viewer.pdfLoadFailed')}
                    onDownload={canDownload ? () => onDownload(document) : null}
                    onRetry={handleRetry}
                />
            ) : (
                <div
                    ref={stageRef}
                    tabIndex={0}
                    aria-label={t('documentsExplorer.viewer.title')}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endPan}
                    onPointerCancel={endPan}
                    onScroll={handleStageScroll}
                    className={`relative min-h-0 flex-1 overflow-auto bg-[var(--surface-2)]/40 outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] focus-visible:ring-inset ${canPan ? 'cursor-grab select-none active:cursor-grabbing' : ''}`}
                >
                    <Document
                        key={retryKey}
                        file={document.viewUrl}
                        onLoadSuccess={handleDocumentLoadSuccess}
                        onLoadError={handleDocumentLoadError}
                        onPassword={(callback) => callback(null)}
                        loading={(
                            <div className="flex min-h-full flex-col items-center justify-center gap-2 py-20">
                                <Loader2Icon size={18} className="animate-spin text-[var(--text-muted)]" />
                                <p className="text-[10px] text-[var(--text-muted)]">
                                    {t('documentsExplorer.viewer.loadingPdf')}
                                </p>
                            </div>
                        )}
                    >
                        <div className="flex min-h-full flex-col items-center gap-4 p-6">
                            {Array.from({ length: numPages }, (_, index) => {
                                const currentPage = index + 1;

                                return (
                                    <div
                                        key={currentPage}
                                        ref={(element) => {
                                            if (element) {
                                                pageRefs.current.set(currentPage, element);
                                            } else {
                                                pageRefs.current.delete(currentPage);
                                            }
                                        }}
                                        className="overflow-hidden rounded-sm bg-white shadow-[0_8px_30px_rgb(0_0_0_/_0.18)]"
                                    >
                                        <Page
                                            pageNumber={currentPage}
                                            scale={effectiveScale}
                                            rotate={normalizedRotation}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            onRenderSuccess={handlePageRenderSuccess}
                                            onLoadError={handleDocumentLoadError}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </Document>
                </div>
            )}
            </div>
        </>
    );
}
