import { useState, useRef, lazy, Suspense, useEffect, useLayoutEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize, FileWarning, Download, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@heroui/react';
import { DesignAnnotationToolbar, type AnnotationTool } from './DesignAnnotationToolbar';
import { DesignRemarkComposer } from './DesignRemarkComposer';
import { toast } from 'sonner';
import { projectDesignApi } from '@/features/project-design/api/projectDesignApi';
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
    serverId?: number;
}

function isPdf(mime: string) { return mime === 'application/pdf'; }
function isImage(mime: string) { return SUPPORTED_IMAGE_TYPES.includes(mime); }
function isSupported(mime: string) { return isPdf(mime) || isImage(mime); }

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
                <div className="flex h-full w-full items-center justify-center transition-transform"
                    style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)` }}>
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

export function DesignFileViewer({ previewUrl, downloadUrl, mimeType, filename, isOpen, onClose, versionId, dossierId, containerRef: externalContainerRef }: {
    previewUrl: string; downloadUrl: string; mimeType: string; filename: string; isOpen: boolean; onClose: () => void; versionId?: number; dossierId?: number; containerRef?: React.RefObject<HTMLDivElement | null>;
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
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = externalContainerRef ?? internalContainerRef;
    const viewerAreaRef = useRef<HTMLDivElement>(null);
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
            const mapped: AnnotationShape[] = res.data.map((a: any) => ({
                id: `server-${a.id}`,
                serverId: a.id,
                type: a.type,
                x: a.geometry.x ?? 0,
                y: a.geometry.y ?? 0,
                width: a.geometry.width,
                height: a.geometry.height,
                points: a.geometry.points,
                color: a.geometry.color,
            }));
            setAnnotations(mapped);
        } catch {}
    }

    const handleViewerZoom = useCallback((delta: number, cx: number, cy: number) => {
        const factor = delta > 0 ? 1.1 : 0.9;
        setViewerZoom((prev) => Math.max(0.1, Math.min(5, prev * factor)));
        setViewerPan((prev) => ({
            x: prev.x * factor + cx * (1 - factor),
            y: prev.y * factor + cy * (1 - factor),
        }));
    }, []);

    const handleViewerPan = useCallback((dx: number, dy: number) => {
        setViewerPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }, []);

    async function handleAnnotationCreated(shape: AnnotationShape) {
        setAnnotations((prev) => [...prev, shape]);
        setSelectedAnnotationId(shape.id);
        setShowComposer(true);
        composerAnnotationId.current = shape.id;
        pendingShapeRef.current = shape;
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
                const created = await projectDesignApi.storeAnnotation(dossierId!, versionId!, {
                    type: shape.type,
                    geometry: { x: shape.x, y: shape.y, width: shape.width, height: shape.height, points: shape.points, color: shape.color },
                });
                annotationId = created.id;
                setAnnotations((prev) => prev.map((a) => a.id === shape.id ? { ...a, serverId: annotationId } : a));
            }

            await projectDesignApi.createRemark(dossierId!, versionId!, annotationId, {
                severity: data.severity,
                title: data.title,
                description: data.description,
            });

            toast.success('Remark saved.');
            setShowComposer(false);
            setActiveTool('select');
            composerAnnotationId.current = null;
            pendingShapeRef.current = null;
        } catch (err) {
            toast.error((err as Error)?.message ?? 'Failed to save remark.');
        }
    }

    async function handleAnnotationToolbarSave() {
        if (annotations.length === 0 || !versionId || !dossierId) return;
        setSaving(true);
        try {
            for (const shape of annotations) {
                if (shape.serverId) {
                    await projectDesignApi.updateAnnotation(dossierId, versionId, shape.serverId, {
                        type: shape.type,
                        geometry: { x: shape.x, y: shape.y, width: shape.width, height: shape.height, points: shape.points, color: shape.color },
                    });
                } else {
                    const created = await projectDesignApi.storeAnnotation(dossierId, versionId, {
                        type: shape.type,
                        geometry: { x: shape.x, y: shape.y, width: shape.width, height: shape.height, points: shape.points, color: shape.color },
                    });
                    setAnnotations((prev) => prev.map((a) => a.id === shape.id ? { ...a, serverId: created.id } : a));
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
            if (e.key === '+' || e.key === '=') setViewerZoom((z) => Math.min(5, z + 0.1));
            if (e.key === '-') setViewerZoom((z) => Math.max(0.1, z - 0.1));
            if (e.key === 'r') setViewerRotation((r) => (r + 90) % 360);
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

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
                    zoom={viewerZoom} panX={viewerPan.x} panY={viewerPan.y} rotation={viewerRotation} />
            </Suspense>
        );

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                <DesignAnnotationToolbar activeTool={activeTool} onToolChange={setActiveTool}
                    onSave={handleAnnotationToolbarSave} saving={saving} hasUnsaved={annotations.some((a) => !a.serverId)} />
                <div className="flex items-center gap-1">
                    <Button isIconOnly size="sm" variant="light" onPress={() => setViewerZoom((z) => Math.max(0.1, z - 0.1))} aria-label="Zoom out"><ZoomOut size={13} /></Button>
                    <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)]">{Math.round(viewerZoom * 100)}%</span>
                    <Button isIconOnly size="sm" variant="light" onPress={() => setViewerZoom((z) => Math.min(5, z + 0.1))} aria-label="Zoom in"><ZoomIn size={13} /></Button>
                    <Button isIconOnly size="sm" variant="light" onPress={() => setViewerRotation((r) => (r + 90) % 360)} aria-label="Rotate"><RotateCw size={13} /></Button>
                    <Button isIconOnly size="sm" variant="light" onPress={() => { setViewerZoom(1); setViewerPan({ x: 0, y: 0 }); setViewerRotation(0); }} aria-label="Fit to screen"><Maximize size={13} /></Button>
                    <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                    {selectedAnnotationId && (
                        <Button size="sm" variant="light" onPress={() => setShowComposer(!showComposer)}
                            startContent={<MessageSquare size={13} />}>
                            Remark
                        </Button>
                    )}
                    <Button isIconOnly size="sm" variant="light" as="a" href={downloadUrl} target="_blank" rel="noopener noreferrer" aria-label="Download">
                        <Download size={13} />
                    </Button>
                </div>
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
                            onViewerPan={handleViewerPan} />
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
