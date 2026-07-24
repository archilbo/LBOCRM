import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    AlignCenter,
    AlignStartVertical,
    Download,
    FileWarning,
    Loader2,
    Maximize,
    MessageSquare,
    Minimize,
    RotateCw,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Button, Tooltip } from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DesignAnnotationToolbar } from './DesignAnnotationToolbar';
import type {
    AnnotationTool,
    ProjectDesignAnnotationToolbarState,
    ProjectDesignEditorToolbarState,
} from '@/features/project-design/components/ProjectDesignEditorToolbar';
import type { DesignRemarkDraft } from './DesignRemarkComposer';
import { projectDesignApi } from '@/features/project-design/api/projectDesignApi';
import { projectDesignKeys } from '@/features/project-design/api/projectDesignKeys';
import type { ProjectDesignRemark } from '@/features/project-design/types/projectDesign';
import { fitPage, fitWidth, zoomToPoint } from '../utils/viewport';
import type { ViewerFrame } from './DesignAnnotationLayer';

const DesignAnnotationLayer = lazy(() => import('./DesignAnnotationLayer'));
const PdfDesignViewer = lazy(() => import('./PdfDesignViewer'));

const SUPPORTED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
];

export interface AnnotationShape {
    id: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: number[];
    color?: string;
    style?: Record<string, unknown> | null;
    viewport?: Record<string, unknown> | null;
    referenceWidth?: number | null;
    referenceHeight?: number | null;
    sourceRotation?: number;
    serverId?: number;
    assetId?: number;
    pageNumber?: number | null;
    authoredBy?: { id: number; name: string } | null;
    createdBy?: { id: number; name: string } | null;
    createdAt?: string | null;
    recordVersion?: number;
    remark?: {
        id: number;
        severity: string;
        status: string;
        title: string;
        description: string | null;
        createdBy: { id: number; name: string } | null;
        createdAt: string | null;
    } | null;
}

type Viewport = { zoom: number; panX: number; panY: number };
type PointerPan = { active: boolean; pointerId: number; x: number; y: number };
type StandaloneAnnotationTool = AnnotationTool;

type DesignFileViewerProps = {
    previewUrl: string;
    downloadUrl: string;
    mimeType: string;
    filename: string;
    assetId?: number;
    isOpen: boolean;
    onClose: () => void;
    versionId?: number;
    dossierId?: number;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    suppressAnnotations?: boolean;
    pageNumber?: number;
    onPageNumberChange?: (page: number) => void;
    viewerToolbar?: ProjectDesignEditorToolbarState;
    onControlsReady?: (controls: { fitWidth: () => void; fitPage: () => void }) => void;
    onTotalPages?: (total: number) => void;
    onToolbarStateChange?: (state: ProjectDesignAnnotationToolbarState) => void;
    focusAnnotationId?: number | null;
    focusRequestKey?: number;
};

const defaultFrame: ViewerFrame = {
    scale: 1,
    rotation: 0,
    pageX: 0,
    pageY: 0,
    pageWidth: 0,
    pageHeight: 0,
};

function normalizedRotation(rotation: number): number {
    return ((rotation % 360) + 360) % 360;
}

function annotationDocumentCenter(shape: AnnotationShape): { x: number; y: number } {
    if (shape.points && shape.points.length >= 2) {
        const xs: number[] = [];
        const ys: number[] = [];
        for (let index = 0; index < shape.points.length - 1; index += 2) {
            xs.push(shape.points[index]);
            ys.push(shape.points[index + 1]);
        }
        if (xs.length && ys.length) {
            return {
                x: (Math.min(...xs) + Math.max(...xs)) / 2,
                y: (Math.min(...ys) + Math.max(...ys)) / 2,
            };
        }
    }

    return {
        x: shape.x + (shape.width ?? 0) / 2,
        y: shape.y + (shape.height ?? 0) / 2,
    };
}

function annotationScreenPoint(shape: AnnotationShape, frame: ViewerFrame): { x: number; y: number } {
    const point = annotationDocumentCenter(shape);
    const rotation = normalizedRotation(frame.rotation);
    let x = point.x;
    let y = point.y;

    if (rotation === 90) {
        x = frame.pageHeight - point.y;
        y = point.x;
    } else if (rotation === 180) {
        x = frame.pageWidth - point.x;
        y = frame.pageHeight - point.y;
    } else if (rotation === 270) {
        x = point.y;
        y = frame.pageWidth - point.x;
    }

    return {
        x: frame.pageX + x * frame.scale,
        y: frame.pageY + y * frame.scale,
    };
}

function isPdf(mimeType: string): boolean {
    return mimeType === 'application/pdf';
}

function isImage(mimeType: string): boolean {
    return SUPPORTED_IMAGE_TYPES.includes(mimeType);
}

function isSupported(mimeType: string): boolean {
    return isPdf(mimeType) || isImage(mimeType);
}

function normalizePoints(points: number[], pageWidth: number, pageHeight: number): number[] {
    const normalized: number[] = [];
    for (let index = 0; index < points.length - 1; index += 2) {
        normalized.push(points[index] / pageWidth, points[index + 1] / pageHeight);
    }
    return normalized;
}

function denormalizePoints(points: number[], referenceWidth: number, referenceHeight: number): number[] {
    const denormalized: number[] = [];
    for (let index = 0; index < points.length - 1; index += 2) {
        denormalized.push(
            points[index] * referenceWidth,
            points[index + 1] * referenceHeight,
        );
    }
    return denormalized;
}

function buildGeometry(
    shape: AnnotationShape,
    pageWidth: number,
    pageHeight: number,
): Record<string, unknown> {
    const geometry: Record<string, unknown> = {
        x: shape.x / pageWidth,
        y: shape.y / pageHeight,
        color: shape.color,
    };

    if (shape.width != null) geometry.width = shape.width / pageWidth;
    if (shape.height != null) geometry.height = shape.height / pageHeight;
    if (shape.points?.length) geometry.points = normalizePoints(shape.points, pageWidth, pageHeight);
    return geometry;
}

function mapProjectDesignRemark(remark: ProjectDesignRemark): NonNullable<AnnotationShape['remark']> {
    return {
        id: remark.id,
        severity: remark.severity,
        status: remark.status,
        title: remark.title,
        description: remark.description,
        createdBy: remark.createdBy,
        createdAt: remark.createdAt,
    };
}

function ViewerLoading() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#101214]">
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            <p className="text-[12px] text-[var(--text-muted)]">Loading design viewer…</p>
        </div>
    );
}

function UnsupportedViewer({ filename }: { filename: string }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-[var(--surface-2)]/35 p-8 text-center">
            <FileWarning size={34} className="text-amber-400" />
            <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Preview not available</p>
                <p className="mt-1 max-w-md text-[12px] text-[var(--text-muted)]">
                    “{filename}” cannot be previewed directly in the browser.
                </p>
            </div>
        </div>
    );
}

function ImageViewer({
    src,
    filename,
    containerRef,
    stageParentRef,
    onFrameChange,
    zoom,
    panX,
    panY,
    rotation,
}: {
    src: string;
    filename: string;
    containerRef: React.RefObject<HTMLDivElement | null>;
    stageParentRef: React.RefObject<HTMLDivElement | null>;
    onFrameChange?: (frame: ViewerFrame) => void;
    zoom: number;
    panX: number;
    panY: number;
    rotation: number;
}) {
    const imageRef = useRef<HTMLImageElement>(null);
    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

    const reportFrame = useCallback(() => {
        const wrapper = imageWrapperRef.current;
        const parent = stageParentRef.current;
        if (!wrapper || !parent || naturalSize.width <= 0 || naturalSize.height <= 0) return;

        const wrapperRect = wrapper.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        onFrameChange?.({
            scale: zoom,
            rotation,
            pageX: wrapperRect.left - parentRect.left,
            pageY: wrapperRect.top - parentRect.top,
            pageWidth: naturalSize.width,
            pageHeight: naturalSize.height,
        });
    }, [naturalSize.height, naturalSize.width, onFrameChange, rotation, stageParentRef, zoom]);

    useLayoutEffect(() => {
        const frame = window.requestAnimationFrame(reportFrame);
        return () => window.cancelAnimationFrame(frame);
    }, [panX, panY, reportFrame, rotation, zoom]);

    return (
        <div
            ref={containerRef}
            className="relative flex h-full w-full items-start justify-center overflow-hidden bg-[#101214] p-6 sm:p-8"
            style={{
                backgroundImage:
                    'linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }}
        >
            <div
                ref={imageWrapperRef}
                className="inline-flex origin-top-left will-change-transform"
                style={{
                    transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom}) rotate(${rotation}deg)`,
                }}
            >
                <img
                    ref={imageRef}
                    src={src}
                    alt={filename}
                    draggable={false}
                    className="block max-h-[calc(100dvh-180px)] max-w-[calc(100vw-96px)] select-none rounded-[2px] bg-white object-contain shadow-[0_24px_70px_rgb(0_0_0_/_0.35)]"
                    onLoad={(event) => {
                        const image = event.currentTarget;
                        setNaturalSize({
                            width: image.naturalWidth || image.clientWidth,
                            height: image.naturalHeight || image.clientHeight,
                        });
                    }}
                />
            </div>
        </div>
    );
}

export function DesignFileViewer({
    previewUrl,
    downloadUrl,
    mimeType,
    filename,
    assetId,
    isOpen,
    onClose: _onClose,
    versionId,
    dossierId,
    containerRef: externalContainerRef,
    suppressAnnotations,
    pageNumber: controlledPageNumber,
    onPageNumberChange,
    viewerToolbar,
    onControlsReady,
    onTotalPages,
    onToolbarStateChange,
    focusAnnotationId,
    focusRequestKey = 0,
}: DesignFileViewerProps) {
    const queryClient = useQueryClient();
    const [annotations, setAnnotations] = useState<AnnotationShape[]>([]);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [showComposer, setShowComposer] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewerFrame, setViewerFrame] = useState<ViewerFrame>(defaultFrame);

    const [localZoom, setLocalZoom] = useState(1);
    const [localPanX, setLocalPanX] = useState(0);
    const [localPanY, setLocalPanY] = useState(0);
    const [localRotation, setLocalRotation] = useState(0);
    const [localActiveTool, setLocalActiveTool] = useState<StandaloneAnnotationTool>('select');
    const [localFullscreen, setLocalFullscreen] = useState(false);
    const [localCurrentPage, setLocalCurrentPage] = useState(1);
    const [spaceHeld, setSpaceHeld] = useState(false);
    const [isPanning, setIsPanning] = useState(false);

    const internalContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = externalContainerRef ?? internalContainerRef;
    const viewerAreaRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const composerAnnotationId = useRef<string | null>(null);
    const pendingShapeRef = useRef<AnnotationShape | null>(null);
    const pointerPanRef = useRef<PointerPan>({ active: false, pointerId: -1, x: 0, y: 0 });
    const handledFocusRequestRef = useRef<string | null>(null);

    const isExternal = viewerToolbar != null;
    const resolvedZoom = isExternal ? viewerToolbar.zoom : localZoom;
    const resolvedPanX = isExternal ? viewerToolbar.panX ?? 0 : localPanX;
    const resolvedPanY = isExternal ? viewerToolbar.panY ?? 0 : localPanY;
    const resolvedRotation = isExternal ? viewerToolbar.rotation : localRotation;
    const resolvedActiveTool = isExternal ? viewerToolbar.activeTool : localActiveTool;
    const resolvedFullscreen = isExternal ? viewerToolbar.fullscreen : localFullscreen;
    const resolvedPageNumber = controlledPageNumber ?? localCurrentPage;
    const viewportRef = useRef<Viewport>({
        zoom: resolvedZoom,
        panX: resolvedPanX,
        panY: resolvedPanY,
    });

    useLayoutEffect(() => {
        viewportRef.current = {
            zoom: resolvedZoom,
            panX: resolvedPanX,
            panY: resolvedPanY,
        };
    }, [resolvedPanX, resolvedPanY, resolvedZoom]);

    const exactAnnotationContext = Boolean(
        dossierId
        && versionId
        && assetId
        && viewerFrame.pageWidth > 0
        && viewerFrame.pageHeight > 0,
    );

    const annotationsForCurrentPage = useMemo(() => annotations.filter((annotation) => (
        annotation.assetId === assetId
        && (annotation.pageNumber ?? 1) === resolvedPageNumber
    )), [annotations, assetId, resolvedPageNumber]);

    const unsavedForCurrentContext = useMemo(() => annotations.filter((annotation) => (
        !annotation.serverId
        && annotation.assetId === assetId
        && (annotation.pageNumber ?? 1) === resolvedPageNumber
    )), [annotations, assetId, resolvedPageNumber]);
    const hasUnsaved = unsavedForCurrentContext.length > 0;
    const canRemark = Boolean(selectedAnnotationId && !suppressAnnotations && exactAnnotationContext);

    const applyTool = useCallback((tool: AnnotationTool) => {
        if (viewerToolbar) {
            viewerToolbar.onToolChange(tool);
            return;
        }

        if (tool !== 'pan') setLocalActiveTool(tool);
    }, [viewerToolbar]);

    const applyViewport = useCallback((viewport: Viewport) => {
        viewportRef.current = viewport;

        if (viewerToolbar?.onViewportChange) {
            viewerToolbar.onViewportChange(viewport);
            return;
        }

        if (viewerToolbar) {
            viewerToolbar.onZoomChange(viewport.zoom);
            viewerToolbar.onPanChange?.(viewport.panX, viewport.panY);
            return;
        }

        setLocalZoom(viewport.zoom);
        setLocalPanX(viewport.panX);
        setLocalPanY(viewport.panY);
    }, [viewerToolbar]);

    const handlePanBy = useCallback((dx: number, dy: number) => {
        const current = viewportRef.current;
        applyViewport({
            zoom: current.zoom,
            panX: current.panX + dx,
            panY: current.panY + dy,
        });
    }, [applyViewport]);

    const handleZoomAroundPoint = useCallback((delta: number, cx: number, cy: number) => {
        const current = viewportRef.current;
        const factor = delta > 0 ? 1.1 : 0.9;
        applyViewport(zoomToPoint(
            current.zoom,
            factor,
            cx,
            cy,
            current.panX,
            current.panY,
        ));
    }, [applyViewport]);


    const shouldStartPan = useCallback((event: React.PointerEvent<HTMLDivElement>) => (
        event.button === 1
        || (event.button === 0 && (spaceHeld || resolvedActiveTool === 'pan'))
    ), [resolvedActiveTool, spaceHeld]);

    const handleViewerPointerDownCapture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('[data-project-design-annotation-popup]')) return;

        workspaceRef.current?.focus({ preventScroll: true });
        if (!shouldStartPan(event)) return;

        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerPanRef.current = {
            active: true,
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
        };
        setIsPanning(true);
    }, [shouldStartPan]);

    const handleViewerPointerMoveCapture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const pan = pointerPanRef.current;
        if (!pan.active || pan.pointerId !== event.pointerId) return;

        event.preventDefault();
        event.stopPropagation();

        const dx = event.clientX - pan.x;
        const dy = event.clientY - pan.y;
        pointerPanRef.current = { ...pan, x: event.clientX, y: event.clientY };
        handlePanBy(dx, dy);
    }, [handlePanBy]);

    const stopViewerPointerPan = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const pan = pointerPanRef.current;
        if (!pan.active || pan.pointerId !== event.pointerId) return;

        event.preventDefault();
        event.stopPropagation();
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        pointerPanRef.current = { active: false, pointerId: -1, x: 0, y: 0 };
        setIsPanning(false);
    }, []);

    useEffect(() => {
        const viewer = viewerAreaRef.current;
        if (!viewer) return;

        const handleWheel = (event: WheelEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('[data-project-design-annotation-popup]')) return;

            event.preventDefault();

            if (event.shiftKey && !event.ctrlKey && !event.metaKey) {
                const horizontalDelta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
                handlePanBy(-horizontalDelta, 0);
                return;
            }

            const rect = viewer.getBoundingClientRect();
            handleZoomAroundPoint(
                event.deltaY > 0 ? -1 : 1,
                event.clientX - rect.left,
                event.clientY - rect.top,
            );
        };

        viewer.addEventListener('wheel', handleWheel, { passive: false });
        return () => viewer.removeEventListener('wheel', handleWheel);
    }, [handlePanBy, handleZoomAroundPoint]);

    useEffect(() => {
        const resetInteractionState = () => {
            pointerPanRef.current = { active: false, pointerId: -1, x: 0, y: 0 };
            setIsPanning(false);
            setSpaceHeld(false);
        };

        window.addEventListener('blur', resetInteractionState);
        return () => window.removeEventListener('blur', resetInteractionState);
    }, []);

    const handleFitWidth = useCallback(() => {
        const viewer = viewerAreaRef.current;
        if (!viewer || viewerFrame.pageWidth <= 0 || viewerFrame.pageHeight <= 0) return;

        const rect = viewer.getBoundingClientRect();
        const padding = 48;
        applyViewport(fitWidth(
            Math.max(1, rect.width - padding),
            Math.max(1, rect.height - padding),
            viewerFrame.pageWidth,
            viewerFrame.pageHeight,
        ));
    }, [applyViewport, viewerFrame.pageHeight, viewerFrame.pageWidth]);

    const handleFitPage = useCallback(() => {
        const viewer = viewerAreaRef.current;
        if (!viewer || viewerFrame.pageWidth <= 0 || viewerFrame.pageHeight <= 0) return;

        const rect = viewer.getBoundingClientRect();
        const padding = 48;
        applyViewport(fitPage(
            Math.max(1, rect.width - padding),
            Math.max(1, rect.height - padding),
            viewerFrame.pageWidth,
            viewerFrame.pageHeight,
        ));
    }, [applyViewport, viewerFrame.pageHeight, viewerFrame.pageWidth]);

    useEffect(() => {
        onControlsReady?.({
            fitWidth: handleFitWidth,
            fitPage: handleFitPage,
        });
    }, [handleFitPage, handleFitWidth, onControlsReady]);

    useEffect(() => {
        if (!isPdf(mimeType)) onTotalPages?.(1);
    }, [mimeType, onTotalPages]);

    useEffect(() => {
        if (!isOpen || !versionId || !dossierId || !assetId) return;

        const controller = new AbortController();
        projectDesignApi.getAnnotations(dossierId, versionId, controller.signal)
            .then((response) => {
                const mapped: AnnotationShape[] = response.data
                    .filter((annotation) => annotation.assetId === assetId)
                    .map((annotation) => {
                        const referenceWidth = annotation.referenceWidth ?? 1;
                        const referenceHeight = annotation.referenceHeight ?? 1;
                        const geometry = annotation.geometry as Record<string, unknown>;

                        return {
                            id: `server-${annotation.id}`,
                            serverId: annotation.id,
                            type: annotation.annotationType,
                            x: ((geometry.x as number) ?? 0) * referenceWidth,
                            y: ((geometry.y as number) ?? 0) * referenceHeight,
                            width: geometry.width != null
                                ? (geometry.width as number) * referenceWidth
                                : undefined,
                            height: geometry.height != null
                                ? (geometry.height as number) * referenceHeight
                                : undefined,
                            points: Array.isArray(geometry.points)
                                ? denormalizePoints(geometry.points as number[], referenceWidth, referenceHeight)
                                : undefined,
                            color: geometry.color as string | undefined,
                            style: annotation.style,
                            viewport: annotation.viewport,
                            referenceWidth: annotation.referenceWidth,
                            referenceHeight: annotation.referenceHeight,
                            sourceRotation: annotation.sourceRotation,
                            assetId: annotation.assetId ?? undefined,
                            pageNumber: annotation.pageNumber,
                            authoredBy: annotation.authoredBy,
                            createdBy: annotation.createdBy,
                            createdAt: annotation.createdAt,
                            recordVersion: annotation.recordVersion,
                            remark: annotation.remark ? {
                                id: annotation.remark.id,
                                severity: annotation.remark.severity,
                                status: annotation.remark.status,
                                title: annotation.remark.title,
                                description: annotation.remark.description,
                                createdBy: annotation.remark.createdBy,
                                createdAt: annotation.remark.createdAt,
                            } : null,
                        };
                    });

                setAnnotations(mapped);
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                if (import.meta.env.DEV) console.warn('Failed to load design annotations', error);
                toast.error('Could not load annotations for this asset.');
            });

        return () => controller.abort();
    }, [assetId, dossierId, isOpen, versionId]);

    const handlePageChange = useCallback((page: number) => {
        if (!isExternal) setLocalCurrentPage(page);
        setSelectedAnnotationId(null);
        setShowComposer(false);
        setViewerFrame(defaultFrame);
        onPageNumberChange?.(page);
    }, [isExternal, onPageNumberChange]);


    useEffect(() => {
        if (!focusAnnotationId) return;

        const requestId = `${focusAnnotationId}:${focusRequestKey}`;
        if (handledFocusRequestRef.current === requestId) return;

        const annotation = annotations.find((item) => item.serverId === focusAnnotationId);
        if (!annotation || annotation.assetId !== assetId) return;

        const targetPage = annotation.pageNumber ?? 1;
        if (targetPage !== resolvedPageNumber) {
            handlePageChange(targetPage);
            return;
        }

        const viewer = viewerAreaRef.current;
        if (!viewer || viewerFrame.pageWidth <= 0 || viewerFrame.pageHeight <= 0) return;

        setSelectedAnnotationId(annotation.id);
        setShowComposer(false);
        composerAnnotationId.current = null;
        pendingShapeRef.current = null;
        applyTool('select');

        const screenPoint = annotationScreenPoint(annotation, viewerFrame);
        const rect = viewer.getBoundingClientRect();
        handlePanBy(
            rect.width / 2 - screenPoint.x,
            rect.height / 2 - screenPoint.y,
        );

        handledFocusRequestRef.current = requestId;
    }, [
        annotations,
        applyTool,
        assetId,
        focusAnnotationId,
        focusRequestKey,
        handlePageChange,
        handlePanBy,
        resolvedPageNumber,
        viewerFrame,
    ]);

    const requireExactContext = useCallback(() => {
        if (!dossierId || !versionId || !assetId) {
            throw new Error('Select an exact design asset before saving annotations.');
        }
        if (viewerFrame.pageWidth <= 0 || viewerFrame.pageHeight <= 0) {
            throw new Error('Wait until the current page has finished rendering.');
        }

        return {
            dossierId,
            versionId,
            assetId,
            pageWidth: viewerFrame.pageWidth,
            pageHeight: viewerFrame.pageHeight,
        };
    }, [assetId, dossierId, versionId, viewerFrame.pageHeight, viewerFrame.pageWidth]);

    const saveSingleAnnotation = useCallback(async (shape: AnnotationShape) => {
        const context = requireExactContext();
        const pageNumber = shape.pageNumber ?? resolvedPageNumber;
        const referenceWidth = shape.referenceWidth && shape.referenceWidth > 0
            ? shape.referenceWidth
            : context.pageWidth;
        const referenceHeight = shape.referenceHeight && shape.referenceHeight > 0
            ? shape.referenceHeight
            : context.pageHeight;

        if (shape.assetId != null && shape.assetId !== context.assetId) {
            throw new Error('The annotation belongs to a different design asset.');
        }

        if (shape.serverId) {
            const updated = await projectDesignApi.updateAnnotation(
                context.dossierId,
                context.versionId,
                shape.serverId,
                {
                    geometry: buildGeometry(shape, referenceWidth, referenceHeight),
                    style: shape.style ?? null,
                    record_version: shape.recordVersion ?? 1,
                },
            );
            setAnnotations((current) => current.map((annotation) => (
                annotation.id === shape.id
                    ? { ...annotation, recordVersion: updated.recordVersion }
                    : annotation
            )));
            return updated.id;
        }

        const created = await projectDesignApi.storeAnnotation(
            context.dossierId,
            context.versionId,
            {
                annotation_type: shape.type,
                coordinate_space: 'page-normalized-v1',
                asset_id: context.assetId,
                page_number: pageNumber,
                geometry: buildGeometry(shape, referenceWidth, referenceHeight),
                style: shape.style ?? null,
                viewport: shape.viewport ?? null,
                reference_width: Math.round(referenceWidth),
                reference_height: Math.round(referenceHeight),
                source_rotation: shape.sourceRotation ?? 0,
            },
        );

        setAnnotations((current) => current.map((annotation) => (
            annotation.id === shape.id
                ? {
                    ...annotation,
                    serverId: created.id,
                    recordVersion: created.recordVersion,
                    assetId: context.assetId,
                    pageNumber,
                }
                : annotation
        )));

        return created.id;
    }, [requireExactContext, resolvedPageNumber]);

    const handleAnnotationToolbarSave = useCallback(async () => {
        if (!unsavedForCurrentContext.length) return;

        setSaving(true);
        try {
            for (const shape of unsavedForCurrentContext) await saveSingleAnnotation(shape);
            toast.success(`${unsavedForCurrentContext.length} annotation${unsavedForCurrentContext.length === 1 ? '' : 's'} saved.`);
        } catch (error) {
            toast.error((error as Error)?.message ?? 'Failed to save annotations.');
        } finally {
            setSaving(false);
        }
    }, [saveSingleAnnotation, unsavedForCurrentContext]);

    const handleAnnotationCreated = useCallback((shape: AnnotationShape) => {
        if (!assetId || !exactAnnotationContext) {
            toast.error('The current asset is not ready for annotation.');
            return;
        }

        const scopedShape: AnnotationShape = {
            ...shape,
            assetId,
            pageNumber: resolvedPageNumber,
            referenceWidth: viewerFrame.pageWidth,
            referenceHeight: viewerFrame.pageHeight,
            sourceRotation: 0,
        };

        setAnnotations((current) => [...current, scopedShape]);
        setSelectedAnnotationId(scopedShape.id);
        setShowComposer(true);
        composerAnnotationId.current = scopedShape.id;
        pendingShapeRef.current = scopedShape;
        applyTool('select');
    }, [
        applyTool,
        assetId,
        exactAnnotationContext,
        resolvedPageNumber,
        viewerFrame.pageHeight,
        viewerFrame.pageWidth,
    ]);

    const handleAnnotationSave = useCallback(async (data: DesignRemarkDraft) => {
        const shapeId = composerAnnotationId.current;
        const shape = pendingShapeRef.current
            ?? annotations.find((annotation) => annotation.id === shapeId);

        if (!shape) {
            toast.error('No annotation selected.');
            return;
        }

        setSaving(true);
        try {
            const context = requireExactContext();
            const annotationId = await saveSingleAnnotation(shape);
            const savedRemark = shape.remark?.id
                ? await projectDesignApi.updateRemark(
                    context.dossierId,
                    shape.remark.id,
                    data,
                )
                : await projectDesignApi.createRemark(
                    context.dossierId,
                    context.versionId,
                    annotationId,
                    data,
                );
            const localRemark = mapProjectDesignRemark(savedRemark);

            setAnnotations((current) => current.map((annotation) => (
                annotation.id === shape.id
                    ? {
                        ...annotation,
                        serverId: annotation.serverId ?? annotationId,
                        remark: localRemark,
                    }
                    : annotation
            )));

            toast.success(shape.remark?.id ? 'Remark updated.' : 'Annotation and remark saved.');
            setShowComposer(false);
            setSelectedAnnotationId(shape.id);
            composerAnnotationId.current = null;
            pendingShapeRef.current = null;
            applyTool('select');

            void queryClient.invalidateQueries({
                queryKey: projectDesignKeys.all(context.dossierId),
            });
        } catch (error) {
            toast.error((error as Error)?.message ?? 'Failed to save remark.');
        } finally {
            setSaving(false);
        }
    }, [annotations, applyTool, queryClient, requireExactContext, saveSingleAnnotation]);

    const handleAnnotationDelete = useCallback(async (annotationId: string) => {
        const shape = annotations.find((annotation) => annotation.id === annotationId);
        if (!shape) return;

        if (shape.serverId && dossierId && versionId) {
            try {
                await projectDesignApi.destroyAnnotation(dossierId, versionId, shape.serverId);
            } catch (error) {
                if (import.meta.env.DEV) console.warn('Failed to delete annotation', error);
                toast.error('Could not delete this annotation.');
                return;
            }
        }

        setAnnotations((current) => current.filter((annotation) => annotation.id !== annotationId));
        if (selectedAnnotationId === annotationId) {
            setSelectedAnnotationId(null);
            setShowComposer(false);
        }
    }, [annotations, dossierId, selectedAnnotationId, versionId]);

    const openRemarkComposer = useCallback(() => {
        if (!selectedAnnotationId) return;
        composerAnnotationId.current = selectedAnnotationId;
        pendingShapeRef.current = annotations.find((annotation) => annotation.id === selectedAnnotationId) ?? null;
        setShowComposer(true);
    }, [annotations, selectedAnnotationId]);

    const closeRemarkComposer = useCallback(() => {
        setShowComposer(false);
        composerAnnotationId.current = null;
        pendingShapeRef.current = null;
    }, []);

    const handleAnnotationSelect = useCallback((annotationId: string | null) => {
        setSelectedAnnotationId(annotationId);
        setShowComposer(false);
        composerAnnotationId.current = null;
        pendingShapeRef.current = null;
    }, []);

    const saveFromToolbar = useCallback(() => {
        void handleAnnotationToolbarSave();
    }, [handleAnnotationToolbarSave]);

    const remarkFromToolbar = useCallback(() => {
        openRemarkComposer();
    }, [openRemarkComposer]);

    useEffect(() => {
        onToolbarStateChange?.({
            onSave: saveFromToolbar,
            onRemark: remarkFromToolbar,
            saving,
            hasUnsaved,
            canRemark,
        });
    }, [
        canRemark,
        hasUnsaved,
        onToolbarStateChange,
        remarkFromToolbar,
        saveFromToolbar,
        saving,
    ]);

    useEffect(() => () => {
        onToolbarStateChange?.({
            onSave: undefined,
            onRemark: undefined,
            saving: false,
            hasUnsaved: false,
            canRemark: false,
        });
    }, [onToolbarStateChange]);

    const toggleStandaloneFullscreen = useCallback(async () => {
        const element = workspaceRef.current;
        if (!element) return;

        if (!document.fullscreenElement) await element.requestFullscreen();
        else await document.exitFullscreen();
    }, []);

    useEffect(() => {
        if (isExternal) return;

        const handleFullscreenChange = () => {
            setLocalFullscreen(document.fullscreenElement === workspaceRef.current);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isExternal]);

    const handleWorkspaceKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement | null;
        if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;

        if (event.key === ' ') {
            event.preventDefault();
            setSpaceHeld(true);
            return;
        }

        if (event.key === 'PageDown') {
            event.preventDefault();
            handlePageChange(resolvedPageNumber + 1);
            return;
        }

        if (event.key === 'PageUp') {
            event.preventDefault();
            handlePageChange(Math.max(1, resolvedPageNumber - 1));
            return;
        }

        const panStep = event.shiftKey ? 96 : 32;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            handlePanBy(panStep, 0);
            return;
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            handlePanBy(-panStep, 0);
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            handlePanBy(0, panStep);
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            handlePanBy(0, -panStep);
            return;
        }

        if ((event.key === 'Delete' || event.key === 'Backspace') && selectedAnnotationId) {
            event.preventDefault();
            void handleAnnotationDelete(selectedAnnotationId);
            return;
        }

        if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            applyViewport({
                zoom: Math.min(10, resolvedZoom + 0.1),
                panX: resolvedPanX,
                panY: resolvedPanY,
            });
            return;
        }

        if (event.key === '-') {
            event.preventDefault();
            applyViewport({
                zoom: Math.max(0.1, resolvedZoom - 0.1),
                panX: resolvedPanX,
                panY: resolvedPanY,
            });
            return;
        }

        if (event.key.toLowerCase() === 'r') {
            event.preventDefault();
            if (viewerToolbar) viewerToolbar.onRotate();
            else setLocalRotation((current) => (current + 90) % 360);
            return;
        }

        if (event.key.toLowerCase() === 'f') {
            event.preventDefault();
            if (viewerToolbar) viewerToolbar.onFullscreenToggle();
            else void toggleStandaloneFullscreen();
        }
    }, [
        applyViewport,
        handleAnnotationDelete,
        handlePageChange,
        handlePanBy,
        resolvedPageNumber,
        resolvedPanX,
        resolvedPanY,
        resolvedZoom,
        selectedAnnotationId,
        toggleStandaloneFullscreen,
        viewerToolbar,
    ]);

    const handleWorkspaceKeyUp = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === ' ') setSpaceHeld(false);
    }, []);

    if (!isSupported(mimeType)) return <UnsupportedViewer filename={filename} />;

    const viewContent = isImage(mimeType) ? (
        <ImageViewer
            src={previewUrl}
            filename={filename}
            containerRef={containerRef}
            stageParentRef={viewerAreaRef}
            onFrameChange={setViewerFrame}
            zoom={resolvedZoom}
            panX={resolvedPanX}
            panY={resolvedPanY}
            rotation={resolvedRotation}
        />
    ) : (
        <Suspense fallback={<ViewerLoading />}>
            <PdfDesignViewer
                previewUrl={previewUrl}
                downloadUrl={downloadUrl}
                filename={filename}
                containerRef={containerRef}
                stageParentRef={viewerAreaRef}
                onFrameChange={setViewerFrame}
                onPageChange={handlePageChange}
                pageNumber={resolvedPageNumber}
                zoom={resolvedZoom}
                panX={resolvedPanX}
                panY={resolvedPanY}
                rotation={resolvedRotation}
                hideToolbar={isExternal}
                activeTool={resolvedActiveTool}
                isPanning={isPanning}
                spaceHeld={spaceHeld}
                continuous={false}
                onTotalPages={onTotalPages}
            />
        </Suspense>
    );

    return (
        <div
            ref={workspaceRef}
            className="flex h-full w-full flex-col overflow-hidden outline-none"
            tabIndex={-1}
            onPointerDown={() => workspaceRef.current?.focus({ preventScroll: true })}
            onKeyDown={handleWorkspaceKeyDown}
            onKeyUp={handleWorkspaceKeyUp}
        >
            {!isExternal ? (
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                    {suppressAnnotations ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                            <FileWarning size={12} className="text-amber-400" />
                            <span>Source file · annotations disabled</span>
                        </div>
                    ) : (
                        <DesignAnnotationToolbar
                            activeTool={localActiveTool}
                            onToolChange={setLocalActiveTool}
                            onSave={handleAnnotationToolbarSave}
                            saving={saving}
                            hasUnsaved={hasUnsaved}
                        />
                    )}

                    <div className="flex items-center gap-1">
                        <Button isIconOnly size="sm" variant="ghost" onPress={handleFitWidth} aria-label="Fit width">
                            <AlignStartVertical size={13} />
                        </Button>
                        <Button isIconOnly size="sm" variant="ghost" onPress={handleFitPage} aria-label="Fit page">
                            <AlignCenter size={13} />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={() => applyViewport({ zoom: Math.max(0.1, localZoom - 0.1), panX: localPanX, panY: localPanY })}
                            aria-label="Zoom out"
                        >
                            <ZoomOut size={13} />
                        </Button>
                        <span className="min-w-[42px] text-center text-[11px] tabular-nums text-[var(--text-muted)]">
                            {Math.round(localZoom * 100)}%
                        </span>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={() => applyViewport({ zoom: Math.min(10, localZoom + 0.1), panX: localPanX, panY: localPanY })}
                            aria-label="Zoom in"
                        >
                            <ZoomIn size={13} />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={() => setLocalRotation((current) => (current + 90) % 360)}
                            aria-label="Rotate"
                        >
                            <RotateCw size={13} />
                        </Button>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={() => void toggleStandaloneFullscreen()}
                            aria-label={resolvedFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {resolvedFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                        </Button>
                        {canRemark ? (
                            <Tooltip delay={350}>
                                <Tooltip.Trigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        onPress={openRemarkComposer}
                                        className="h-7 w-7 min-w-0"
                                        aria-label="Add or edit remark"
                                    >
                                        <MessageSquare size={13} />
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Add or edit remark</Tooltip.Content>
                            </Tooltip>
                        ) : null}
                        <Tooltip delay={350}>
                            <Tooltip.Trigger>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
                                    className="h-7 w-7 min-w-0"
                                    aria-label="Download current asset"
                                >
                                    <Download size={13} />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Download current asset</Tooltip.Content>
                        </Tooltip>
                    </div>
                </div>
            ) : null}

            <div
                ref={viewerAreaRef}
                className="relative min-h-0 flex-1 overflow-hidden"
                data-project-design-interaction-surface
                onPointerDownCapture={handleViewerPointerDownCapture}
                onPointerMoveCapture={handleViewerPointerMoveCapture}
                onPointerUpCapture={stopViewerPointerPan}
                onPointerCancelCapture={stopViewerPointerPan}
                style={{ touchAction: 'none' }}
            >
                {viewContent}

                {suppressAnnotations ? (
                    <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-[var(--surface)]/92 px-2.5 py-1.5 text-[10px] text-[var(--text-muted)] shadow-lg backdrop-blur">
                        <FileWarning size={11} className="text-amber-400" />
                        Source asset · open a review derivative to annotate
                    </div>
                ) : null}

                {!suppressAnnotations && exactAnnotationContext ? (
                    <Suspense fallback={null}>
                        <DesignAnnotationLayer
                            containerRef={containerRef}
                            annotations={annotationsForCurrentPage}
                            activeTool={resolvedActiveTool}
                            onAnnotationCreated={handleAnnotationCreated}
                            onAnnotationSelect={handleAnnotationSelect}
                            onAnnotationDelete={handleAnnotationDelete}
                            selectedId={selectedAnnotationId}
                            readOnly={resolvedActiveTool === 'select'}
                            viewerFrame={viewerFrame}
                            isPanning={isPanning}
                            spaceHeld={spaceHeld}
                            remarkEditorOpen={showComposer}
                            remarkSaving={saving}
                            onRemarkCreate={openRemarkComposer}
                            onRemarkEdit={openRemarkComposer}
                            onRemarkSave={handleAnnotationSave}
                            onRemarkCancel={closeRemarkComposer}
                        />
                    </Suspense>
                ) : null}

                {!suppressAnnotations && !exactAnnotationContext ? (
                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-amber-400/20 bg-[var(--surface)]/94 px-3 py-1.5 text-[10px] text-amber-300 shadow-lg backdrop-blur">
                        Annotation tools will activate when the exact page and asset are ready.
                    </div>
                ) : null}

            </div>
        </div>
    );
}
