import { useState, useRef, lazy, Suspense, useEffect, useLayoutEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize, Minimize, Download, Loader2, MessageSquare, AlignCenter, AlignStartVertical, FileWarning } from 'lucide-react';
import { Button } from '@heroui/react';
import { DesignAnnotationToolbar, type AnnotationTool } from './DesignAnnotationToolbar';
import type { ProjectDesignEditorToolbarState } from '@/features/project-design/components/ProjectDesignEditorToolbar';
import { DesignRemarkComposer } from './DesignRemarkComposer';
import { toast } from 'sonner';
import { projectDesignApi } from '@/features/project-design/api/projectDesignApi';
import { fitWidth, fitPage } from '../utils/viewport';
import type { ViewerFrame } from './DesignAnnotationLayer';

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

const defaultFrame: ViewerFrame = { scale: 1, rotation: 0, pageX: 0, pageY: 0, pageWidth: 0, pageHeight: 0 };

function ImageViewer({ src, filename, containerRef, stageParentRef, onFrameChange, zoom, panX, panY, rotation }: {
    src: string; filename: string;
    containerRef: React.RefObject<HTMLDivElement | null>;
    stageParentRef: React.RefObject<HTMLDivElement | null>;
    onFrameChange?: (f: ViewerFrame) => void;
    zoom: number; panX: number; panY: number; rotation: number;
}) {
    const imgRef = useRef<HTMLImageElement>(null);

    const reportFrame = useCallback(() => {
        const img = imgRef.current;
        const parent = stageParentRef?.current;
        if (!img || !parent) return;
        const ir = img.getBoundingClientRect();
        const pr = parent.getBoundingClientRect();
        onFrameChange?.({
            scale: zoom,
            rotation,
            pageX: ir.left - pr.left,
            pageY: ir.top - pr.top,
            pageWidth: ir.width / zoom,
            pageHeight: ir.height / zoom,
        });
    }, [zoom, rotation, stageParentRef, onFrameChange]);

    useLayoutEffect(() => { reportFrame(); }, [zoom, rotation, panX, panY, reportFrame]);

    return (
        <div className="relative flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
            </div>
            <div ref={containerRef} className="relative flex-1 overflow-hidden bg-[var(--surface-2)]/50">
                <div className="h-full w-full transition-transform"
                    style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`, transformOrigin: '0 0' }}>
                    <img ref={imgRef} src={src} alt={filename} className="max-h-full max-w-full object-contain" draggable={false} onLoad={reportFrame} />
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

export function DesignFileViewer({ previewUrl, downloadUrl, mimeType, filename, assetId, isOpen, onClose, versionId, dossierId, containerRef: externalContainerRef, suppressAnnotations, pageNumber: controlledPageNumber, onPageNumberChange, viewerToolbar, onControlsReady }: {
    previewUrl: string; downloadUrl: string; mimeType: string; filename: string; assetId?: number; isOpen: boolean; onClose: () => void; versionId?: number; dossierId?: number; containerRef?: React.RefObject<HTMLDivElement | null>; suppressAnnotations?: boolean; pageNumber?: number; onPageNumberChange?: (page: number) => void; viewerToolbar?: ProjectDesignEditorToolbarState; onControlsReady?: (controls: { fitWidth: () => void; fitPage: () => void }) => void;
}) {
    const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
    const [annotations, setAnnotations] = useState<AnnotationShape[]>([]);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [showComposer, setShowComposer] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewerFrame, setViewerFrame] = useState<ViewerFrame>(defaultFrame);
    const [viewerZoom, setViewerZoom] = useState(1);
    const [viewerPan, setViewerPan] = useState({ x: 0, y: 0 });
    const [viewerRotation, setViewerRotation] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [fullscreen, setFullscreen] = useState(false);
    const [pageShellEl, setPageShellEl] = useState<HTMLDivElement | null>(null);

    const isExternalToolbar = !!viewerToolbar;

    // Resolve state: use external values when toolbar is provided
    const resolvedActiveTool = viewerToolbar?.activeTool ?? activeTool;
    const resolvedZoom = viewerToolbar?.zoom ?? viewerZoom;
    const resolvedRotation = viewerToolbar?.rotation ?? viewerRotation;
    const resolvedFullscreen = viewerToolbar?.fullscreen ?? fullscreen;

    const controlsRef = useRef({ fitWidth: () => {}, fitPage: () => {} });
    const toolbarRef = useRef(viewerToolbar);
    toolbarRef.current = viewerToolbar;
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = externalContainerRef ?? internalContainerRef;
    const viewerAreaRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const composerAnnotationId = useRef<string | null>(null);
    const pendingShapeRef = useRef<AnnotationShape | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setActiveTool('select');
            setAnnotations([]);
            setSelectedAnnotationId(null);
            setShowComposer(false);
            pendingShapeRef.current = null;
            setViewerFrame(defaultFrame);
            setViewerZoom(1);
            setViewerPan({ x: 0, y: 0 });
            setViewerRotation(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (versionId && isOpen) {
            loadAnnotations();
        }
    }, [versionId, isOpen]);

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
        } catch {}
    }

    const toggleFullscreen = useCallback(async () => {
        const el = workspaceRef.current;
        if (!el) return;
        if (!resolvedFullscreen) {
            if (el.requestFullscreen) {
                await el.requestFullscreen();
            }
        } else {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        }
    }, [resolvedFullscreen]);

    useEffect(() => {
        function onFsChange() {
            setFullscreen(!!document.fullscreenElement);
            toolbarRef.current?.onFullscreenToggle();
        }
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const handleFitWidth = useCallback(() => {
        const viewer = viewerAreaRef.current;
        if (!viewer || !viewerFrame.pageWidth) return;
        const vr = viewer.getBoundingClientRect();
        const vp = fitWidth(vr.width, vr.height, viewerFrame.pageWidth, viewerFrame.pageHeight);
        toolbarRef.current?.onZoomChange(vp.zoom);
        setViewerZoom(vp.zoom);
        setViewerPan({ x: vp.panX, y: vp.panY });
    }, [viewerFrame]);

    const handleFitPage = useCallback(() => {
        const viewer = viewerAreaRef.current;
        if (!viewer || !viewerFrame.pageWidth) return;
        const vr = viewer.getBoundingClientRect();
        const vp = fitPage(vr.width, vr.height, viewerFrame.pageWidth, viewerFrame.pageHeight);
        toolbarRef.current?.onZoomChange(vp.zoom);
        setViewerZoom(vp.zoom);
        setViewerPan({ x: vp.panX, y: vp.panY });
    }, [viewerFrame]);

    useEffect(() => {
        controlsRef.current = { fitWidth: handleFitWidth, fitPage: handleFitPage };
    }, [handleFitWidth, handleFitPage]);
    useEffect(() => {
        if (onControlsReady) {
            onControlsReady({ fitWidth: () => controlsRef.current.fitWidth(), fitPage: () => controlsRef.current.fitPage() });
        }
    }, [onControlsReady]);

    const handleViewerZoom = useCallback((delta: number, cx: number, cy: number) => {
        const factor = delta > 0 ? 1.1 : 0.9;
        const newZoom = Math.max(0.1, Math.min(10, resolvedZoom * factor));
        toolbarRef.current?.onZoomChange(newZoom);
        setViewerZoom(newZoom);
        setViewerPan((prev) => {
            const el = viewerAreaRef.current;
            const vw = el?.clientWidth ?? 800;
            const xCorr = isPdf(mimeType) ? vw * (factor - 1) / 2 : 0;
            return {
                x: prev.x * factor + cx * (1 - factor) + xCorr,
                y: prev.y * factor + cy * (1 - factor),
            };
        });
    }, [mimeType, resolvedZoom]);

    const handleViewerPan = useCallback((dx: number, dy: number) => {
        setViewerPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }, []);

    async function handleAnnotationCreated(shape: AnnotationShape) {
        setAnnotations((prev) => [...prev, shape]);
        setSelectedAnnotationId(shape.id);
        setShowComposer(true);
        composerAnnotationId.current = shape.id;
        pendingShapeRef.current = shape;
        toolbarRef.current?.onToolChange('select');
        setActiveTool('select');
    }

    async function handleAnnotationSave(data: { severity: string; title: string; description: string }) {
        if (!versionId || !dossierId) return;
        const shape = pendingShapeRef.current ?? annotations.find((a) => a.id === composerAnnotationId.current);
        if (!shape) {
            setAnnotations((prev) => {
                const found = prev.find((a) => a.id === composerAnnotationId.current);
                if (found) {
                    saveAnnotationAndRemark(found, data);
                } else {
                    toast.error('No annotation selected.');
                }
                return prev;
            });
            return;
        }
        await saveAnnotationAndRemark(shape, data);
    }

    async function saveAnnotationAndRemark(shape: AnnotationShape, data: { severity: string; title: string; description: string }) {
        try {
            let annotationId = shape.serverId;

            if (!annotationId) {
                const pw = viewerFrame.pageWidth || 1;
                const ph = viewerFrame.pageHeight || 1;
                const created = await projectDesignApi.storeAnnotation(dossierId!, versionId!, {
                    annotation_type: shape.type,
                    coordinate_space: 'page-normalized-v1',
                    asset_id: shape.assetId ?? assetId ?? 1,
                    page_number: shape.pageNumber ?? controlledPageNumber ?? currentPage,
                    geometry: buildGeometry(shape, pw, ph),
                    style: shape.style ?? null,
                    viewport: shape.viewport ?? null,
                    reference_width: Math.round(pw),
                    reference_height: Math.round(ph),
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
            toolbarRef.current?.onToolChange('select');
            setActiveTool('select');
            composerAnnotationId.current = null;
            pendingShapeRef.current = null;
        } catch (err) {
            toast.error((err as Error)?.message ?? 'Failed to save remark.');
        }
    }

    async function handleAnnotationToolbarSave() {
        if (annotations.length === 0 || !versionId || !dossierId) return;
        const pw = viewerFrame.pageWidth || 1;
        const ph = viewerFrame.pageHeight || 1;
        setSaving(true);
        try {
            for (const shape of annotations) {
                if (shape.serverId) {
                    const updated = await projectDesignApi.updateAnnotation(dossierId, versionId, shape.serverId, {
                        geometry: buildGeometry(shape, pw, ph),
                        record_version: shape.recordVersion ?? 1,
                    });
                    setAnnotations((prev) => prev.map((a) => a.id === shape.id ? { ...a, recordVersion: updated.recordVersion } : a));
                } else {
                    const created = await projectDesignApi.storeAnnotation(dossierId, versionId, {
                        annotation_type: shape.type,
                        coordinate_space: 'page-normalized-v1',
                        asset_id: shape.assetId ?? assetId ?? 1,
                        page_number: shape.pageNumber ?? controlledPageNumber ?? currentPage,
                        geometry: buildGeometry(shape, pw, ph),
                        style: null,
                        reference_width: Math.round(pw),
                        reference_height: Math.round(ph),
                        source_rotation: 0,
                    });
                    setAnnotations((prev) => prev.map((a) => a.id === shape.id ? { ...a, serverId: created.id, recordVersion: created.recordVersion } : a));
                }
            }
            toast.success(`${annotations.length} annotation(s) saved.`);
        } catch (err) {
            toast.error((err as Error)?.message ?? 'Failed to save annotations.');
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === '+' || e.key === '=') {
                const next = Math.min(5, resolvedZoom + 0.1);
                toolbarRef.current?.onZoomChange(next);
                setViewerZoom(next);
            }
            if (e.key === '-') {
                const next = Math.max(0.1, resolvedZoom - 0.1);
                toolbarRef.current?.onZoomChange(next);
                setViewerZoom(next);
            }
            if (e.key === 'r') {
                const next = (resolvedRotation + 90) % 360;
                toolbarRef.current?.onRotate();
                setViewerRotation(next);
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
    }, [resolvedFullscreen, toggleFullscreen, resolvedZoom, resolvedRotation]);

    // Listen for custom events from PdfDesignViewer (pan, zoom, auto-fit)
    useEffect(() => {
        function handleAutoFit(e: Event) {
            const { zoom: z, panX: px, panY: py } = (e as CustomEvent).detail;
            toolbarRef.current?.onZoomChange(z);
            setViewerZoom(z);
            setViewerPan({ x: px ?? 0, y: py ?? 0 });
        }
        function handlePan(e: Event) {
            const { x, y } = (e as CustomEvent).detail;
            setViewerPan({ x, y });
        }
        function handleWheelZoom(e: Event) {
            const { delta, cx, cy } = (e as CustomEvent).detail;
            const factor = delta > 0 ? 1.1 : 0.9;
            const newZoom = Math.max(0.1, Math.min(10, resolvedZoom * factor));
            toolbarRef.current?.onZoomChange(newZoom);
            setViewerZoom(newZoom);
            setViewerPan((prev) => {
                const el = viewerAreaRef.current;
                const vw = el?.clientWidth ?? 800;
                const xCorr = isPdf(mimeType) ? vw * (factor - 1) / 2 : 0;
                return { x: prev.x * factor + cx * (1 - factor) + xCorr, y: prev.y * factor + cy * (1 - factor) };
            });
        }
        function handleTotalPages(e: Event) {
            const { totalPages } = (e as CustomEvent).detail;
            // Update the external toolbar's totalPages via custom event to parent
            window.dispatchEvent(new CustomEvent('pd-editor-total-pages', { detail: { totalPages } }));
        }
        window.addEventListener('pd-auto-fit', handleAutoFit);
        window.addEventListener('pd-pan', handlePan);
        window.addEventListener('pd-wheel-zoom', handleWheelZoom);
        window.addEventListener('pd-total-pages', handleTotalPages);
        return () => {
            window.removeEventListener('pd-auto-fit', handleAutoFit);
            window.removeEventListener('pd-pan', handlePan);
            window.removeEventListener('pd-wheel-zoom', handleWheelZoom);
            window.removeEventListener('pd-total-pages', handleTotalPages);
        };
    }, [resolvedZoom, mimeType]);

    async function handleAnnotationDelete(annotationId: string) {
        const shape = annotations.find((a) => a.id === annotationId);
        if (!shape) return;
        if (shape.serverId && dossierId && versionId) {
            try {
                await projectDesignApi.destroyAnnotation(dossierId, versionId, shape.serverId);
            } catch {}
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

    const readOnly = activeTool === 'select';

    const viewContent = isImage(mimeType)
        ? <ImageViewer src={previewUrl} filename={filename} containerRef={containerRef}
            stageParentRef={viewerAreaRef} onFrameChange={setViewerFrame}
            zoom={viewerZoom} panX={viewerPan.x} panY={viewerPan.y} rotation={viewerRotation} />
        : (
            <Suspense fallback={<ViewerLoading />}>
                <PdfDesignViewer previewUrl={previewUrl} downloadUrl={downloadUrl} filename={filename}
                    containerRef={containerRef} stageParentRef={viewerAreaRef} onFrameChange={setViewerFrame}
                    onPageChange={(p) => { setCurrentPage(p); onPageNumberChange?.(p); }}
                    onPageShellRef={setPageShellEl}
                    pageNumber={controlledPageNumber}
                    zoom={viewerZoom} panX={viewerPan.x} panY={viewerPan.y} rotation={viewerRotation}
                    hideToolbar={isExternalToolbar}
                    activeTool={resolvedActiveTool} />
            </Suspense>
        );

    return (
        <div ref={workspaceRef} className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                {isExternalToolbar ? (
                    <>
                        {suppressAnnotations ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                <FileWarning size={12} className="text-amber-400" />
                                <span>Source file — annotations disabled</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                {saving && <span className="text-[11px] text-[var(--text-muted)]">Saving...</span>}
                                {annotations.some((a) => !a.serverId) && (
                                    <Button size="sm" variant="light" isDisabled={saving}
                                        onPress={handleAnnotationToolbarSave}
                                        className="h-7 min-w-0 px-2 text-[11px] text-emerald-400">
                                        Save
                                    </Button>
                                )}
                                {selectedAnnotationId && (
                                    <Button size="sm" variant="light" isDisabled={saving}
                                        onPress={() => setShowComposer(!showComposer)}
                                        className="h-7 min-w-0 px-2 text-[11px]"
                                        startContent={<MessageSquare size={12} />}>
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
                            <DesignAnnotationToolbar activeTool={activeTool} onToolChange={setActiveTool}
                                onSave={handleAnnotationToolbarSave} saving={saving} hasUnsaved={annotations.some((a) => !a.serverId)} />
                        )}
                        <div className="flex items-center gap-1">
                            <Button isIconOnly size="sm" variant="light" onPress={handleFitWidth} aria-label="Fit width"><AlignStartVertical size={13} /></Button>
                            <Button isIconOnly size="sm" variant="light" onPress={handleFitPage} aria-label="Fit page"><AlignCenter size={13} /></Button>
                            <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                            <Button isIconOnly size="sm" variant="light" onPress={() => { const next = Math.max(0.1, resolvedZoom - 0.1); toolbarRef.current?.onZoomChange(next); setViewerZoom(next); }} aria-label="Zoom out"><ZoomOut size={13} /></Button>
                            <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)]">{Math.round(resolvedZoom * 100)}%</span>
                            <Button isIconOnly size="sm" variant="light" onPress={() => { const next = Math.min(5, resolvedZoom + 0.1); toolbarRef.current?.onZoomChange(next); setViewerZoom(next); }} aria-label="Zoom in"><ZoomIn size={13} /></Button>
                            <Button isIconOnly size="sm" variant="light" onPress={() => { toolbarRef.current?.onRotate(); setViewerRotation((r) => (r + 90) % 360); }} aria-label="Rotate"><RotateCw size={13} /></Button>
                            <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                            <Button isIconOnly size="sm" variant="light" onPress={toggleFullscreen} aria-label={resolvedFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                                {resolvedFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                            </Button>
                            <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                            {selectedAnnotationId && !suppressAnnotations && (
                                <Button size="sm" variant="light" onPress={() => setShowComposer(!showComposer)}
                                    startContent={<MessageSquare size={13} />}>
                                    Remark
                                </Button>
                            )}
                            <Button isIconOnly size="sm" variant="light" as="a" href={downloadUrl} target="_blank" rel="noopener noreferrer" aria-label="Download">
                                <Download size={13} />
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div className="relative flex-1 overflow-hidden" ref={viewerAreaRef}>
                {viewContent}
                {isSupported(mimeType) && (
                    <Suspense fallback={null}>
                        <DesignAnnotationLayer containerRef={containerRef}
                            annotations={annotations} activeTool={activeTool}
                            onAnnotationCreated={handleAnnotationCreated}
                            onAnnotationSelect={setSelectedAnnotationId}
                            onAnnotationDelete={handleAnnotationDelete}
                            selectedId={selectedAnnotationId}
                            readOnly={readOnly}
                            viewerFrame={viewerFrame}
                            onViewerZoom={handleViewerZoom}
                            onViewerPan={handleViewerPan}
                            pageShellRef={pageShellEl ? { current: pageShellEl } : undefined} />
                    </Suspense>
                )}
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
