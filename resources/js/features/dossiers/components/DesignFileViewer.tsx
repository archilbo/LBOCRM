import { useState, useRef, lazy, Suspense, useEffect, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize, Minimize, Download, Loader2, MessageSquare, AlignCenter, AlignStartVertical, FileWarning } from 'lucide-react';
import { Button } from '@heroui/react';
import { DesignAnnotationToolbar, type AnnotationTool } from './DesignAnnotationToolbar';
import type { ProjectDesignEditorToolbarState } from '@/features/project-design/components/ProjectDesignEditorToolbar';
import { DesignRemarkComposer } from './DesignRemarkComposer';
import { toast } from 'sonner';
import { projectDesignApi } from '@/features/project-design/api/projectDesignApi';
import { fitWidth, fitPage, zoomToPoint } from '../utils/viewport';
import type { ViewerState, ViewerAction } from '@/features/project-design/viewer/useProjectDesignViewerController';

const DesignAnnotationLayer = lazy(() => import('./DesignAnnotationLayer'));
const PdfDesignViewer = lazy(() => import('./PdfDesignViewer'));

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

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
    remark?: { id: number; severity: string; status: string; title: string; description: string | null; createdBy: { id: number; name: string } | null; createdAt: string | null } | null;
}

function isPdf(mime: string) { return mime === 'application/pdf'; }
function isImage(mime: string) { return SUPPORTED_IMAGE_TYPES.includes(mime); }
function isSupported(mime: string) { return isPdf(mime) || isImage(mime); }

function normalizePoints(points: number[], pw: number, ph: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
        out.push(points[i] / pw, points[i + 1] / ph);
    }
    return out;
}

function denormalizePoints(points: number[], rw: number, rh: number): number[] {
    const out: number[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
        out.push(points[i] * rw, points[i + 1] * rh);
    }
    return out;
}

function buildGeometry(shape: AnnotationShape, pw: number, ph: number): Record<string, unknown> {
    const geom: Record<string, unknown> = {
        x: shape.x / pw,
        y: shape.y / ph,
        color: shape.color,
    };
    if (shape.width != null) geom.width = shape.width / pw;
    if (shape.height != null) geom.height = shape.height / ph;
    if (shape.points?.length) geom.points = normalizePoints(shape.points, pw, ph);
    return geom;
}

// Standalone adapter - used only when controller is not provided
function useStandaloneViewerState() {
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
    const [currentPage, setCurrentPage] = useState(1);
    const [fullscreen, setFullscreen] = useState(false);
    const zoomIn = useCallback(() => setZoom((z) => Math.min(5, z + 0.1)), []);
    const zoomOut = useCallback(() => setZoom((z) => Math.max(0.1, z - 0.1)), []);
    return {
        zoom, setZoom, panX, setPanX, panY, setPanY, rotation, setRotation,
        activeTool, setActiveTool, currentPage, setCurrentPage,
        fullscreen, setFullscreen,
        zoomIn, zoomOut,
    };
}

function ImageViewer({ src, filename, zoom, panX, panY, rotation }: {
    src: string; filename: string;
    zoom: number; panX: number; panY: number; rotation: number;
}) {
    return (
        <div className="relative flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
            </div>
            <div className="relative flex-1 overflow-hidden bg-[var(--surface-2)]/50">
                <div className="h-full w-full transition-transform"
                    style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: '0 0' }}>
                    <img src={src} alt={filename} className="max-h-full max-w-full object-contain" draggable={false} />
                </div>
            </div>
        </div>
    );
}

function ViewerLoading() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-[var(--surface-2)]/50">
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            <p className="text-[12px] text-[var(--text-muted)]">Loading viewer...</p>
        </div>
    );
}

function UnsupportedViewer({ filename }: { filename: string }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <FileWarning size={32} className="text-amber-400" />
            <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Preview not available</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">"{filename}" cannot be previewed in the browser.</p>
            </div>
        </div>
    );
}

export function DesignFileViewer({ previewUrl, downloadUrl, mimeType, filename, assetId, isOpen, versionId, dossierId, suppressAnnotations, pageNumber: controlledPageNumber, onPageNumberChange, viewerToolbar, onControlsReady, onTotalPages, state, dispatch, interactionHandlers, spaceHeldRef }: {
    previewUrl: string; downloadUrl: string; mimeType: string; filename: string; assetId?: number; isOpen: boolean; versionId?: number; dossierId?: number; suppressAnnotations?: boolean; pageNumber?: number; onPageNumberChange?: (page: number) => void; viewerToolbar?: ProjectDesignEditorToolbarState; onControlsReady?: (controls: { fitWidth: () => void; fitPage: () => void }) => void; onTotalPages?: (n: number) => void;
    state?: ViewerState;
    dispatch?: React.Dispatch<ViewerAction>;
    interactionHandlers?: { onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void; onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void; onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void; onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void; onWheel: (e: React.WheelEvent<HTMLDivElement>) => void };
    spaceHeldRef?: React.MutableRefObject<boolean>;
}) {
    const [annotations, setAnnotations] = useState<AnnotationShape[]>([]);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [showComposer, setShowComposer] = useState(false);
    const [pageShellEl, setPageShellEl] = useState<HTMLDivElement | null>(null);

    const isControllerMode = !!state && !!dispatch;

    // Standalone mode state
    const local = useStandaloneViewerState();

    const resolvedZoom = isControllerMode ? state!.zoom : local.zoom;
    const resolvedPanX = isControllerMode ? state!.panX : local.panX;
    const resolvedPanY = isControllerMode ? state!.panY : local.panY;
    const resolvedRotation = isControllerMode ? state!.rotation : local.rotation;
    const resolvedActiveTool = isControllerMode ? state!.activeTool : local.activeTool;
    const resolvedFullscreen = isControllerMode ? state!.fullscreen : local.fullscreen;
    const resolvedPageNumber = controlledPageNumber ?? local.currentPage;
    const resolvedHasUnsaved = isControllerMode ? state!.hasUnsaved : annotations.some((a) => !a.serverId);

    const viewerAreaRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const composerAnnotationId = useRef<string | null>(null);
    const pendingShapeRef = useRef<AnnotationShape | null>(null);

    const isExt = !!viewerToolbar;

    const [panPointerEventsDisabled, setPanPointerEventsDisabled] = useState(() => isControllerMode
        ? state!.activeTool === 'pan'
        : false);
    useEffect(() => {
        if (isControllerMode && state) {
            setPanPointerEventsDisabled(state.activeTool === 'pan' || !!spaceHeldRef?.current);
        }
    }, [isControllerMode, state, spaceHeldRef]);

    useEffect(() => {
        if (!isOpen) {
            setAnnotations([]);
            setSelectedAnnotationId(null);
            setShowComposer(false);
            pendingShapeRef.current = null;
            if (!isControllerMode) {
                local.setZoom(1);
                local.setPanX(0);
                local.setPanY(0);
                local.setRotation(0);
                local.setActiveTool('select');
            }
        }
    }, [isOpen, isControllerMode]);

    async function loadAnnotations() {
        if (!versionId || !dossierId) return;
        try {
            const res = await projectDesignApi.getAnnotations(dossierId, versionId);
            const mapped: AnnotationShape[] = res.data.map((a) => {
                const rw = a.referenceWidth ?? 1;
                const rh = a.referenceHeight ?? 1;
                const geom = a.geometry as Record<string, unknown>;
                return {
                    id: `server-${a.id}`,
                    serverId: a.id,
                    type: a.annotationType,
                    x: ((geom.x as number) ?? 0) * rw,
                    y: ((geom.y as number) ?? 0) * rh,
                    width: (geom.width as number) != null ? (geom.width as number) * rw : undefined,
                    height: (geom.height as number) != null ? (geom.height as number) * rh : undefined,
                    points: (geom.points as number[])?.length
                        ? denormalizePoints(geom.points as number[], rw, rh)
                        : undefined,
                    color: geom.color as string | undefined,
                    style: a.style,
                    viewport: a.viewport,
                    referenceWidth: a.referenceWidth,
                    referenceHeight: a.referenceHeight,
                    sourceRotation: a.sourceRotation,
                    assetId: a.assetId ?? undefined,
                    pageNumber: a.pageNumber,
                    authoredBy: a.authoredBy,
                    createdBy: a.createdBy,
                    createdAt: a.createdAt,
                    recordVersion: a.recordVersion,
                    remark: a.remark ? {
                        id: a.remark.id,
                        severity: a.remark.severity,
                        status: a.remark.status,
                        title: a.remark.title,
                        description: a.remark.description,
                        createdBy: a.remark.createdBy,
                        createdAt: a.remark.createdAt,
                    } : null,
                };
            });
            setAnnotations(mapped);
        } catch { if (import.meta.env.DEV) console.warn('Failed to map annotations'); }
    }

    useEffect(() => {
        if (versionId && isOpen) {
            loadAnnotations();
        }
    }, [versionId, isOpen, loadAnnotations]);

    const filteredAnnotations = useMemo(() => {
        if (!versionId) return [];
        return annotations.filter((a) => {
            if (a.assetId != null && a.assetId !== assetId) return false;
            if (a.pageNumber != null && a.pageNumber !== resolvedPageNumber) return false;
            return true;
        });
    }, [annotations, versionId, assetId, resolvedPageNumber]);

    const toggleFullscreen = useCallback(async () => {
        if (isControllerMode) {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                const el = workspaceRef.current?.closest('[data-editor-host]') as HTMLElement | null;
                if (el) await el.requestFullscreen();
            }
            return;
        }
        const el = workspaceRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            await el.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    }, [isControllerMode]);

    useEffect(() => {
        function onFsChange() {
            if (isControllerMode) {
                dispatch?.({ type: 'FULLSCREEN_CHANGED', fullscreen: !!document.fullscreenElement });
            } else {
                local.fullscreen = !!document.fullscreenElement;
            }
        }
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, [isControllerMode]);

    const handleFitWidth = useCallback(() => {
        if (isControllerMode) {
            dispatch!({ type: 'FIT_WIDTH' });
            return;
        }
        const viewer = viewerAreaRef.current;
        if (!viewer) return;
        const vr = viewer.getBoundingClientRect();
        const vp = fitWidth(vr.width, vr.height, 1, 1);
        local.setZoom(vp.zoom);
        local.setPanX(vp.panX);
        local.setPanY(vp.panY);
    }, [isControllerMode]);

    const handleFitPage = useCallback(() => {
        if (isControllerMode) {
            dispatch!({ type: 'FIT_PAGE' });
            return;
        }
        const viewer = viewerAreaRef.current;
        if (!viewer) return;
        const vr = viewer.getBoundingClientRect();
        const vp = fitPage(vr.width, vr.height, 1, 1);
        local.setZoom(vp.zoom);
        local.setPanX(vp.panX);
        local.setPanY(vp.panY);
    }, [isControllerMode]);

    const handlePageChange = useCallback((p: number) => {
        if (isControllerMode) {
            dispatch!({ type: 'PAGE_CHANGED', pageNumber: p });
        } else {
            local.setCurrentPage(p);
        }
        onPageNumberChange?.(p);
    }, [isControllerMode, onPageNumberChange]);

    const controlsRef = useRef({ fitWidth: handleFitWidth, fitPage: handleFitPage });
    useEffect(() => {
        controlsRef.current = { fitWidth: handleFitWidth, fitPage: handleFitPage };
    }, [handleFitWidth, handleFitPage]);
    useEffect(() => {
        if (onControlsReady) {
            onControlsReady({ fitWidth: () => controlsRef.current.fitWidth(), fitPage: () => controlsRef.current.fitPage() });
        }
    }, [onControlsReady]);

    const _handleZoomAroundPoint = useCallback((delta: number, cx: number, cy: number) => {
        if (isControllerMode) {
            dispatch!({ type: 'ZOOM_AROUND_POINTER', delta, pointerX: cx, pointerY: cy });
            return;
        }
        const vp = zoomToPoint(resolvedZoom, delta > 0 ? 1.1 : 0.9, cx, cy, resolvedPanX, resolvedPanY);
        local.setZoom(vp.zoom);
        local.setPanX(vp.panX);
        local.setPanY(vp.panY);
    }, [isControllerMode, resolvedZoom, resolvedPanX, resolvedPanY]);

    async function handleAnnotationCreated(shape: AnnotationShape) {
        const enriched = {
            ...shape,
            assetId: shape.assetId ?? assetId,
            pageNumber: shape.pageNumber ?? resolvedPageNumber,
        };
        setAnnotations((prev) => [...prev, enriched]);
        setSelectedAnnotationId(enriched.id);
        setShowComposer(true);
        composerAnnotationId.current = enriched.id;
        pendingShapeRef.current = enriched;
        if (isControllerMode) {
            dispatch!({ type: 'UNSAVED_CHANGED', hasUnsaved: true });
            dispatch!({ type: 'TOOL_CHANGED', activeTool: 'select' });
        } else {
            local.setActiveTool('select');
        }
    }

    async function handleAnnotationSave(data: { severity: string; title: string; description: string }) {
        if (!versionId || !dossierId) return;
        const shape = pendingShapeRef.current ?? annotations.find((a) => a.id === composerAnnotationId.current);
        if (!shape) {
            const found = annotations.find((a) => a.id === composerAnnotationId.current);
            if (found) {
                await saveAnnotationAndRemark(found, data);
            } else {
                toast.error('No annotation selected.');
            }
            return;
        }
        await saveAnnotationAndRemark(shape, data);
    }

    async function saveAnnotationAndRemark(shape: AnnotationShape, data: { severity: string; title: string; description: string }) {
        try {
            let annotationId = shape.serverId;

            if (!annotationId) {
                if (isControllerMode) dispatch!({ type: 'SAVING_STATE_CHANGED', saving: true });
                const created = await projectDesignApi.storeAnnotation(dossierId!, versionId!, {
                    annotation_type: shape.type,
                    coordinate_space: 'page-normalized-v1',
                    asset_id: shape.assetId ?? assetId ?? 1,
                    page_number: shape.pageNumber ?? controlledPageNumber ?? resolvedPageNumber,
                    geometry: buildGeometry(shape, 1, 1),
                    style: shape.style ?? null,
                    viewport: shape.viewport ?? null,
                    reference_width: 1,
                    reference_height: 1,
                    source_rotation: shape.sourceRotation ?? 0,
                });
                annotationId = created.id;
                setAnnotations((prev) => prev.map((a) => a.id === shape.id ? { ...a, serverId: annotationId, recordVersion: created.recordVersion } : a));
            }

            await projectDesignApi.createRemark(dossierId!, versionId!, annotationId, {
                severity: data.severity,
                title: data.title,
                description: data.description,
            });

            toast.success('Remark saved.');
            setShowComposer(false);
            if (isControllerMode) {
                dispatch!({ type: 'SAVING_STATE_CHANGED', saving: false });
                dispatch!({ type: 'UNSAVED_CHANGED', hasUnsaved: false });
                dispatch!({ type: 'TOOL_CHANGED', activeTool: 'select' });
            }
            composerAnnotationId.current = null;
            pendingShapeRef.current = null;
        } catch (err) {
            if (isControllerMode) dispatch!({ type: 'SAVING_STATE_CHANGED', saving: false });
            toast.error((err as Error)?.message ?? 'Failed to save remark.');
        }
    }

    async function handleAnnotationToolbarSave() {
        if (annotations.length === 0 || !versionId || !dossierId) return;
        if (isControllerMode) dispatch!({ type: 'SAVING_STATE_CHANGED', saving: true });
        try {
            for (const shape of annotations) {
                if (shape.serverId) {
                    await projectDesignApi.updateAnnotation(dossierId, versionId, shape.serverId, {
                        geometry: buildGeometry(shape, 1, 1),
                        record_version: shape.recordVersion ?? 1,
                    });
                } else {
                    const created = await projectDesignApi.storeAnnotation(dossierId, versionId, {
                        annotation_type: shape.type,
                        coordinate_space: 'page-normalized-v1',
                        asset_id: shape.assetId ?? assetId ?? 1,
                        page_number: shape.pageNumber ?? controlledPageNumber ?? resolvedPageNumber,
                        geometry: buildGeometry(shape, 1, 1),
                        style: null,
                        reference_width: 0,
                        reference_height: 0,
                        source_rotation: 0,
                    });
                    setAnnotations((prev) => prev.map((a) => a.id === shape.id ? { ...a, serverId: created.id, recordVersion: created.recordVersion } : a));
                }
            }
            toast.success(`${annotations.length} annotation(s) saved.`);
            if (isControllerMode) {
                dispatch!({ type: 'UNSAVED_CHANGED', hasUnsaved: false });
            }
        } catch (err) {
            toast.error((err as Error)?.message ?? 'Failed to save annotations.');
        } finally {
            if (isControllerMode) dispatch!({ type: 'SAVING_STATE_CHANGED', saving: false });
        }
    }

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
                || e.target instanceof HTMLSelectElement || e.target instanceof HTMLButtonElement) return;
            if (isControllerMode) return;
            if (e.key === '+' || e.key === '=') {
                local.setZoom((z: number) => Math.min(5, z + 0.1));
            }
            if (e.key === '-') {
                local.setZoom((z: number) => Math.max(0.1, z - 0.1));
            }
            if (e.key === 'r') {
                local.setRotation((r: number) => (r + 90) % 360);
            }
            if (e.key === 'f') {
                toggleFullscreen();
            }
            if (e.key === 'Escape' && resolvedFullscreen) {
                document.exitFullscreen();
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isControllerMode, resolvedFullscreen, toggleFullscreen]);

    async function handleAnnotationDelete(annotationId: string) {
        const shape = annotations.find((a) => a.id === annotationId);
        if (!shape) return;
        if (shape.serverId && dossierId && versionId) {
            try {
                await projectDesignApi.destroyAnnotation(dossierId, versionId, shape.serverId);
            } catch { if (import.meta.env.DEV) console.warn('Failed to destroy annotation', shape.serverId); }
        }
        setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
        if (selectedAnnotationId === annotationId) {
            setSelectedAnnotationId(null);
            setShowComposer(false);
        }
    }

    if (!isSupported(mimeType)) {
        return <UnsupportedViewer filename={filename} />;
    }

    const readOnly = resolvedActiveTool === 'select';

    // Annotation layer component
    const annotationLayer = isSupported(mimeType) && !suppressAnnotations && (
        <Suspense fallback={null}>
            <DesignAnnotationLayer
                annotations={filteredAnnotations}
                activeTool={resolvedActiveTool}
                onAnnotationCreated={handleAnnotationCreated}
                onAnnotationSelect={setSelectedAnnotationId}
                onAnnotationDelete={handleAnnotationDelete}
                selectedId={selectedAnnotationId}
                readOnly={readOnly}
                renderedWidth={isControllerMode ? state?.renderedWidth ?? 0 : 0}
                renderedHeight={isControllerMode ? state?.renderedHeight ?? 0 : 0}
                rotation={isControllerMode ? state?.rotation ?? 0 : 0}
                zoom={isControllerMode ? state?.zoom ?? 1 : 1}
                pageShellRef={pageShellEl ? { current: pageShellEl } : undefined}
                panPointerEventsDisabled={panPointerEventsDisabled} />
        </Suspense>
    );

    const viewContent = isImage(mimeType)
        ? <ImageViewer src={previewUrl} filename={filename}
            zoom={resolvedZoom} panX={resolvedPanX} panY={resolvedPanY} rotation={resolvedRotation} />
        : (
            <Suspense fallback={<ViewerLoading />}>
                <PdfDesignViewer previewUrl={previewUrl} downloadUrl={downloadUrl} filename={filename}
                    state={isControllerMode ? state! : ({} as ViewerState)}
                    dispatch={isControllerMode ? dispatch! : (() => {}) as unknown as React.Dispatch<ViewerAction>}
                    interactionHandlers={interactionHandlers ?? {
                        onPointerDown: () => {}, onPointerMove: () => {}, onPointerUp: () => {},
                        onPointerCancel: () => {}, onWheel: () => {},
                    }}

                    onPageChange={handlePageChange}
                    pageNumber={controlledPageNumber}
                    hideToolbar={isExt}
                    onTotalPages={(n) => {
                        if (isControllerMode) dispatch!({ type: 'TOTAL_PAGES_CHANGED', totalPages: n });
                        onTotalPages?.(n);
                    }}
                    onPageShellRef={setPageShellEl}>
                    {annotationLayer}
                </PdfDesignViewer>
            </Suspense>
        );

    return (
        <div ref={workspaceRef} className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                {isExt ? (
                    <>
                        {suppressAnnotations ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                <FileWarning size={12} className="text-amber-400" />
                                <span>Source file — annotations disabled</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                {selectedAnnotationId && (
                                    <Button size="sm" variant="ghost"
                                        onPress={() => setShowComposer(!showComposer)}
                                        className="h-7 min-w-0 px-2 text-[11px]">
                                        <MessageSquare size={12} />
                                        Remark
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {suppressAnnotations ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                <FileWarning size={12} className="text-amber-400" />
                                <span>Source file — annotations disabled</span>
                            </div>
                        ) : (
                            <DesignAnnotationToolbar activeTool={local.activeTool} onToolChange={local.setActiveTool}
                                onSave={handleAnnotationToolbarSave} saving={false} hasUnsaved={resolvedHasUnsaved} />
                        )}
                        <div className="flex items-center gap-1">
                            <Button isIconOnly size="sm" variant="ghost" onPress={handleFitWidth} aria-label="Fit width"><AlignStartVertical size={13} /></Button>
                            <Button isIconOnly size="sm" variant="ghost" onPress={handleFitPage} aria-label="Fit page"><AlignCenter size={13} /></Button>
                            <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                            <Button isIconOnly size="sm" variant="ghost" onPress={local.zoomOut} aria-label="Zoom out"><ZoomOut size={13} /></Button>
                            <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)]">{Math.round(local.zoom * 100)}%</span>
                            <Button isIconOnly size="sm" variant="ghost" onPress={local.zoomIn} aria-label="Zoom in"><ZoomIn size={13} /></Button>
                            <Button isIconOnly size="sm" variant="ghost" onPress={() => local.setRotation((r: number) => (r + 90) % 360)} aria-label="Rotate"><RotateCw size={13} /></Button>
                            <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                            <Button isIconOnly size="sm" variant="ghost" onPress={toggleFullscreen} aria-label={resolvedFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                                {resolvedFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                            </Button>
                            <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                            {selectedAnnotationId && !suppressAnnotations && (
                                <Button size="sm" variant="ghost" onPress={() => setShowComposer(!showComposer)}>
                                    <MessageSquare size={13} />
                                    Remark
                                </Button>
                            )}
                            <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--accent)]/10"
                                aria-label="Download">
                                <Download size={13} />
                            </a>
                        </div>
                    </>
                )}
            </div>
            <div className="relative flex-1 overflow-hidden" ref={viewerAreaRef}>
                {viewContent}
                {/* Non-controller mode: annotation rendered as overlay */}
                {!isControllerMode && !isImage(mimeType) && annotationLayer}
                {/* Image annotation overlay */}
                {isImage(mimeType) && annotationLayer}
                {showComposer && (
                    <div className="absolute bottom-3 right-3 z-10">
                        <DesignRemarkComposer
                            onSave={handleAnnotationSave}
                            onCancel={() => { setShowComposer(false); composerAnnotationId.current = null; }} />
                    </div>
                )}
            </div>
        </div>
    );
}
