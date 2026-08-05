import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Maximize as MaximizeIcon,
    RefreshCw as RefreshCwIcon,
    RotateCcw as RotateCcwIcon,
    RotateCw as RotateCwIcon,
    Scan as ScanIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
} from 'lucide-react';
import { Skeleton } from '@heroui/react';

import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';
import { DocumentViewerFallback } from '../DocumentViewerFallback';
import {
    IMAGE_ZOOM_MAX,
    IMAGE_ZOOM_MIN,
    IMAGE_ZOOM_STEP,
    ROTATION_STEP,
    snapZoom,
} from '../documentViewerConstants';
import type { DocumentViewerProps } from './viewerTypes';

type ImagePhase = 'loading' | 'ready' | 'failed';
type PointerPan = { pointerId: number; x: number; y: number } | null;

/**
 * Dedicated image preview: fit-to-viewport / actual size / 25–400% zoom in
 * 25% steps / 90° rotation. Drag-panning is available once the image is
 * zoomed above fit and resets whenever the transform changes. The image is
 * the authorized private viewUrl — nothing else is fetched or parsed here.
 */
export function ImageDocumentViewer({ document, onDownload }: DocumentViewerProps) {
    const { t } = useTranslation();

    const [phase, setPhase] = useState<ImagePhase>('loading');
    const [previewKey, setPreviewKey] = useState(0);
    /** null = fit to viewport; a number = explicit zoom (25–400%). */
    const [zoom, setZoom] = useState<number | null>(null);
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
    const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
    const [dragging, setDragging] = useState(false);

    const stageRef = useRef<HTMLDivElement>(null);
    const panPointerRef = useRef<PointerPan>(null);
    const fitScaleRef = useRef(1);

    const canDownload = document.capabilities.canDownload;

    const fitScale =
        containerSize && naturalSize
            ? Math.min(containerSize.width / naturalSize.width, containerSize.height / naturalSize.height)
            : 1;

    // Keep the latest fit scale available to the stable wheel handler.
    useEffect(() => {
        fitScaleRef.current = fitScale;
    });

    const effectiveScale = zoom ?? fitScale;
    const zoomedIn = effectiveScale - fitScale > 0.001;

    const applyZoomDelta = useCallback((delta: number) => {
        setPan({ x: 0, y: 0 });
        setZoom((current) =>
            snapZoom(
                (current ?? fitScaleRef.current) + delta * IMAGE_ZOOM_STEP,
                IMAGE_ZOOM_STEP,
                IMAGE_ZOOM_MIN,
                IMAGE_ZOOM_MAX,
            ),
        );
    }, []);

    const setActualSize = useCallback(() => {
        setPan({ x: 0, y: 0 });
        setZoom(1);
    }, []);

    const setFitViewport = useCallback(() => {
        setPan({ x: 0, y: 0 });
        setZoom(null);
    }, []);

    const rotateLeft = useCallback(() => {
        setPan({ x: 0, y: 0 });
        setRotation((current) => (current - ROTATION_STEP + 360) % 360);
    }, []);

    const rotateRight = useCallback(() => {
        setPan({ x: 0, y: 0 });
        setRotation((current) => (current + ROTATION_STEP) % 360);
    }, []);

    const handleReset = useCallback(() => {
        setPan({ x: 0, y: 0 });
        setZoom(null);
        setRotation(0);
    }, []);

    const handleRetry = useCallback(() => {
        setPan({ x: 0, y: 0 });
        setPhase('loading');
        setPreviewKey((key) => key + 1);
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

    // Ctrl/Cmd + wheel zooms (step 25%). Plain wheel is intentionally left
    // untouched: panning is done by dragging.
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
            applyZoomDelta(event.deltaY > 0 ? -1 : 1);
        };

        stage.addEventListener('wheel', handleWheel, { passive: false });

        return () => stage.removeEventListener('wheel', handleWheel);
    }, [applyZoomDelta]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement | null;
        if (target?.matches('input, textarea, select, [contenteditable="true"]')) {
            return;
        }

        if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            applyZoomDelta(1);
        } else if (event.key === '-') {
            event.preventDefault();
            applyZoomDelta(-1);
        } else if (event.key === '0') {
            event.preventDefault();
            setFitViewport();
        } else if (event.key === 'r' || event.key === 'R') {
            event.preventDefault();
            rotateRight();
        }
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || !zoomedIn) {
            return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        panPointerRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        setDragging(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const panPointer = panPointerRef.current;
        if (!panPointer || panPointer.pointerId !== event.pointerId) {
            return;
        }

        event.preventDefault();
        const dx = event.clientX - panPointer.x;
        const dy = event.clientY - panPointer.y;
        panPointerRef.current = { ...panPointer, x: event.clientX, y: event.clientY };
        setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
    };

    const stopPointerPan = (event: React.PointerEvent<HTMLDivElement>) => {
        const panPointer = panPointerRef.current;
        if (!panPointer || panPointer.pointerId !== event.pointerId) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        panPointerRef.current = null;
        setDragging(false);
    };

    const zoomOutLabel = t('documentsExplorer.viewer.zoomOut');
    const zoomInLabel = t('documentsExplorer.viewer.zoomIn');
    const actualSizeLabel = t('documentsExplorer.viewer.actualSize');
    const fitViewportLabel = t('documentsExplorer.viewer.fitViewport');
    const rotateLeftLabel = t('documentsExplorer.viewer.rotateLeft');
    const rotateRightLabel = t('documentsExplorer.viewer.rotateRight');
    const resetLabel = t('documentsExplorer.viewer.reset');

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            {phase !== 'failed' ? (
                <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-1.5">
                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        isDisabled={zoom !== null && zoom <= IMAGE_ZOOM_MIN}
                        tooltip={zoomOutLabel}
                        aria-label={zoomOutLabel}
                        onPress={() => applyZoomDelta(-1)}
                    >
                        <ZoomOutIcon size={14} />
                    </AppButton>

                    <span
                        aria-live="polite"
                        className="min-w-[44px] px-1 text-center text-[10px] font-medium tabular-nums text-[var(--text-muted)]"
                    >
                        {Math.round(effectiveScale * 100)}%
                    </span>

                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        isDisabled={zoom !== null && zoom >= IMAGE_ZOOM_MAX}
                        tooltip={zoomInLabel}
                        aria-label={zoomInLabel}
                        onPress={() => applyZoomDelta(1)}
                    >
                        <ZoomInIcon size={14} />
                    </AppButton>

                    <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden="true" />

                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        isDisabled={zoom === null}
                        tooltip={fitViewportLabel}
                        aria-label={fitViewportLabel}
                        onPress={setFitViewport}
                    >
                        <MaximizeIcon size={14} />
                    </AppButton>

                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        isDisabled={zoom === 1}
                        tooltip={actualSizeLabel}
                        aria-label={actualSizeLabel}
                        onPress={setActualSize}
                    >
                        <ScanIcon size={14} />
                    </AppButton>

                    <span className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden="true" />

                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        tooltip={rotateLeftLabel}
                        aria-label={rotateLeftLabel}
                        onPress={rotateLeft}
                    >
                        <RotateCcwIcon size={14} />
                    </AppButton>

                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        tooltip={rotateRightLabel}
                        aria-label={rotateRightLabel}
                        onPress={rotateRight}
                    >
                        <RotateCwIcon size={14} />
                    </AppButton>

                    <AppButton
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        isDisabled={zoom === null && rotation === 0}
                        tooltip={resetLabel}
                        aria-label={resetLabel}
                        onPress={handleReset}
                    >
                        <RefreshCwIcon size={14} />
                    </AppButton>
                </div>
            ) : null}

            {phase === 'failed' ? (
                <DocumentViewerFallback
                    document={document}
                    isInvalid={false}
                    description={t('documentsExplorer.viewer.imageLoadFailed')}
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
                    onPointerUp={stopPointerPan}
                    onPointerCancel={stopPointerPan}
                    className="relative h-full w-full min-h-0 min-w-0 flex-1 overflow-hidden bg-[var(--surface-2)]/30 outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] focus-visible:ring-inset"
                    style={{ cursor: dragging ? 'grabbing' : zoomedIn ? 'grab' : 'default' }}
                >
                    {phase === 'loading' ? <Skeleton className="absolute inset-0 rounded-none" /> : null}

                    {phase === 'ready' ? (
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <div
                                className="will-change-transform"
                                style={{
                                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${effectiveScale}) rotate(${rotation}deg)`,
                                }}
                            >
                                <img
                                    key={previewKey}
                                    src={document.viewUrl ?? undefined}
                                    alt={document.name}
                                    draggable={false}
                                    className="max-h-full max-w-full select-none object-contain"
                                    onLoad={(event) => {
                                        const { naturalWidth, naturalHeight } = event.currentTarget;
                                        if (naturalWidth > 0 && naturalHeight > 0) {
                                            setNaturalSize({ width: naturalWidth, height: naturalHeight });
                                        }
                                        setPhase('ready');
                                    }}
                                    onError={() => setPhase('failed')}
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
