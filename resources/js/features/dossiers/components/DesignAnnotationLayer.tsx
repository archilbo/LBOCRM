import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, Circle, Ellipse, Group, Layer, Line, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { AlertTriangle, Clock, MessageSquarePlus, Pencil, Trash2, User, X } from 'lucide-react';
import { Button, Card, Chip, Tooltip } from '@heroui/react';
import type { AnnotationTool } from '@/features/project-design/components/ProjectDesignEditorToolbar';
import { DesignRemarkComposer } from './DesignRemarkComposer';
import type { DesignRemarkDraft } from './DesignRemarkComposer';

interface AnnotationShape {
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

export interface ViewerFrame {
    scale: number;
    rotation: number;
    /** Rendered page top-left relative to the viewer/annotation container. */
    pageX: number;
    pageY: number;
    /** Original unrotated page dimensions. */
    pageWidth: number;
    pageHeight: number;
}

const SEVERITY_STYLES: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    major: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    minor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cosmetic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    question: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const STATUS_STYLES: Record<string, string> = {
    open: 'bg-slate-500/20 text-slate-400',
    assigned: 'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    resolved: 'bg-emerald-500/20 text-emerald-400',
    closed: 'bg-zinc-500/20 text-zinc-400',
    reopened: 'bg-rose-500/20 text-rose-400',
};

function normalizeRotation(rotation: number): number {
    return ((rotation % 360) + 360) % 360;
}

function docToScreen(docX: number, docY: number, frame: ViewerFrame): { x: number; y: number } {
    const rotation = normalizeRotation(frame.rotation);
    let x = docX;
    let y = docY;

    if (rotation === 90) {
        x = frame.pageHeight - docY;
        y = docX;
    } else if (rotation === 180) {
        x = frame.pageWidth - docX;
        y = frame.pageHeight - docY;
    } else if (rotation === 270) {
        x = docY;
        y = frame.pageWidth - docX;
    }

    return {
        x: frame.pageX + x * frame.scale,
        y: frame.pageY + y * frame.scale,
    };
}

function screenToDoc(screenX: number, screenY: number, frame: ViewerFrame): { x: number; y: number } {
    const rotation = normalizeRotation(frame.rotation);
    const x = (screenX - frame.pageX) / frame.scale;
    const y = (screenY - frame.pageY) / frame.scale;

    if (rotation === 90) return { x: y, y: frame.pageHeight - x };
    if (rotation === 180) return { x: frame.pageWidth - x, y: frame.pageHeight - y };
    if (rotation === 270) return { x: frame.pageWidth - y, y: x };
    return { x, y };
}

function rectangleBounds(shape: AnnotationShape, frame: ViewerFrame) {
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + (shape.width ?? 0);
    const y2 = shape.y + (shape.height ?? 0);
    const points = [
        docToScreen(x1, y1, frame),
        docToScreen(x2, y1, frame),
        docToScreen(x2, y2, frame),
        docToScreen(x1, y2, frame),
    ];
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const left = Math.min(...xs);
    const top = Math.min(...ys);

    return {
        x: left,
        y: top,
        width: Math.max(...xs) - left,
        height: Math.max(...ys) - top,
    };
}

function pageBounds(frame: ViewerFrame) {
    const points = [
        docToScreen(0, 0, frame),
        docToScreen(frame.pageWidth, 0, frame),
        docToScreen(frame.pageWidth, frame.pageHeight, frame),
        docToScreen(0, frame.pageHeight, frame),
    ];
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);

    return {
        x,
        y,
        width: Math.max(...xs) - x,
        height: Math.max(...ys) - y,
    };
}

const POPUP_WIDTH = 304;
const POPUP_MARGIN = 8;
const POPUP_GAP = 10;

function annotationAnchor(shape: AnnotationShape, frame: ViewerFrame): { x: number; y: number } {
    if (shape.type === 'rectangle' || shape.type === 'highlight' || shape.type === 'ellipse') {
        const bounds = rectangleBounds(shape, frame);
        return {
            x: bounds.x + bounds.width,
            y: bounds.y + Math.min(Math.max(bounds.height / 2, 12), 28),
        };
    }

    if (shape.points && shape.points.length >= 2) {
        const screenPoints: { x: number; y: number }[] = [];
        for (let index = 0; index < shape.points.length - 1; index += 2) {
            screenPoints.push(docToScreen(shape.points[index], shape.points[index + 1], frame));
        }
        if (screenPoints.length) {
            return {
                x: Math.max(...screenPoints.map((point) => point.x)),
                y: Math.min(...screenPoints.map((point) => point.y)),
            };
        }
    }

    return docToScreen(shape.x, shape.y, frame);
}

function popupPosition(
    annotation: AnnotationShape,
    frame: ViewerFrame,
    stageSize: { width: number; height: number },
    editorOpen: boolean,
): { left: number; top: number; width: number; maxHeight: number } {
    const anchor = annotationAnchor(annotation, frame);
    const width = Math.min(POPUP_WIDTH, Math.max(1, stageSize.width - POPUP_MARGIN * 2));
    const estimatedHeight = editorOpen ? 330 : annotation.remark ? 240 : 155;
    const rightSide = anchor.x + POPUP_GAP + width <= stageSize.width - POPUP_MARGIN;
    const left = rightSide
        ? anchor.x + POPUP_GAP
        : anchor.x - width - POPUP_GAP;
    const availableBottom = stageSize.height - POPUP_MARGIN;
    const top = Math.min(
        Math.max(POPUP_MARGIN, anchor.y - 20),
        Math.max(POPUP_MARGIN, availableBottom - estimatedHeight),
    );

    return {
        left: Math.min(Math.max(POPUP_MARGIN, left), Math.max(POPUP_MARGIN, stageSize.width - width - POPUP_MARGIN)),
        top,
        width,
        maxHeight: Math.max(1, stageSize.height - POPUP_MARGIN * 2),
    };
}

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

function AnnotationInfoPopup({
    annotation,
    position,
    editorOpen,
    saving,
    onClose,
    onCreate,
    onEdit,
    onSave,
    onCancel,
    onDelete,
}: {
    annotation: AnnotationShape;
    position: { left: number; top: number; width: number; maxHeight: number };
    editorOpen: boolean;
    saving: boolean;
    onClose: () => void;
    onCreate: () => void;
    onEdit: () => void;
    onSave: (draft: DesignRemarkDraft) => void;
    onCancel: () => void;
    onDelete?: () => void;
}) {
    const remark = annotation.remark;
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    return (
        <Card
            data-project-design-annotation-popup
            variant="secondary"
            className="pointer-events-auto absolute z-30 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]/98 shadow-2xl backdrop-blur-xl"
            style={position}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
        >
            <Card.Content className="p-3">
                {editorOpen ? (
                    <DesignRemarkComposer
                        mode={remark ? 'edit' : 'create'}
                        initialValue={remark ? {
                            title: remark.title,
                            description: remark.description ?? '',
                            severity: remark.severity,
                        } : undefined}
                        saving={saving}
                        onSave={onSave}
                        onCancel={onCancel}
                    />
                ) : (
                    <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                                        Annotation
                                    </span>
                                    {remark ? (
                                        <>
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                className={`h-5 border px-1.5 text-[8px] font-semibold uppercase ${SEVERITY_STYLES[remark.severity] ?? 'border-slate-500/30 bg-slate-500/20 text-slate-400'}`}
                                            >
                                                {remark.severity}
                                            </Chip>
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                className={`h-5 px-1.5 text-[8px] font-medium capitalize ${STATUS_STYLES[remark.status] ?? 'bg-slate-500/20 text-slate-400'}`}
                                            >
                                                {remark.status.replace('_', ' ')}
                                            </Chip>
                                        </>
                                    ) : null}
                                </div>
                                {remark ? (
                                    <p className="mt-1.5 break-words text-[12px] font-semibold leading-snug text-[var(--foreground)]">
                                        {remark.title}
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-[12px] font-semibold text-[var(--foreground)]">No remark yet</p>
                                )}
                            </div>
                            <Tooltip delay={350}>
                                <Tooltip.Trigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        onPress={onClose}
                                        className="h-7 w-7 min-w-0 shrink-0 text-[var(--text-muted)]"
                                        aria-label="Close annotation popup"
                                    >
                                        <X size={12} />
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Close</Tooltip.Content>
                            </Tooltip>
                        </div>

                        {remark?.description ? (
                            <p className="max-h-24 overflow-y-auto whitespace-pre-wrap break-words text-[10px] leading-relaxed text-[var(--text-muted)]">
                                {remark.description}
                            </p>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--border)] pt-2 text-[9px] text-[var(--text-subtle)]">
                            <span className="flex items-center gap-1">
                                <User size={9} />
                                {remark?.createdBy?.name ?? annotation.authoredBy?.name ?? annotation.createdBy?.name ?? 'Unknown'}
                            </span>
                            {remark?.createdAt ?? annotation.createdAt ? (
                                <span className="flex items-center gap-1">
                                    <Clock size={9} />
                                    {formatDate(remark?.createdAt ?? annotation.createdAt)}
                                </span>
                            ) : null}
                            {remark?.createdBy ? (
                                <span className="flex items-center gap-1">
                                    <AlertTriangle size={9} />
                                    linked remark
                                </span>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            {confirmingDelete ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-red-300">Remove this markup?</span>
                                    <Button size="sm" variant="ghost" onPress={() => setConfirmingDelete(false)} className="h-7 px-2 text-[10px]">
                                        Keep
                                    </Button>
                                    <Button size="sm" variant="danger" onPress={onDelete} className="h-7 px-2 text-[10px]">
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    aria-label="Remove annotation"
                                    onPress={() => setConfirmingDelete(true)}
                                    className="h-7 w-7 min-w-0 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-300"
                                >
                                    <Trash2 size={12} />
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                onPress={remark ? onEdit : onCreate}
                                className="ml-auto h-7 min-w-0 gap-1.5 bg-[var(--accent)]/12 px-2.5 text-[10px] font-semibold text-[var(--accent)]"
                            >
                                {remark ? <Pencil size={11} /> : <MessageSquarePlus size={11} />}
                                {remark ? 'Edit' : 'Add remark'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card.Content>
        </Card>
    );
}

export function DesignAnnotationLayer({
    containerRef,
    annotations,
    activeTool,
    onAnnotationCreated,
    onAnnotationSelect,
    onAnnotationDelete,
    selectedId,
    readOnly,
    viewerFrame,
    isPanning,
    spaceHeld,
    remarkEditorOpen,
    remarkSaving,
    onRemarkCreate,
    onRemarkEdit,
    onRemarkSave,
    onRemarkCancel,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    annotations: AnnotationShape[];
    activeTool: AnnotationTool;
    onAnnotationCreated: (shape: AnnotationShape) => void;
    onAnnotationSelect: (id: string | null) => void;
    onAnnotationDelete?: (id: string) => void;
    selectedId: string | null;
    readOnly?: boolean;
    viewerFrame: ViewerFrame;
    isPanning?: boolean;
    spaceHeld?: boolean;
    remarkEditorOpen?: boolean;
    remarkSaving?: boolean;
    onRemarkCreate?: () => void;
    onRemarkEdit?: () => void;
    onRemarkSave?: (draft: DesignRemarkDraft) => void;
    onRemarkCancel?: () => void;
    pageShellRef?: React.RefObject<HTMLDivElement | null>;
}) {
    const [stageSize, setStageSize] = useState({ width: 1, height: 1 });
    const [drawing, setDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState<AnnotationShape | null>(null);
    const stageRef = useRef<Konva.Stage>(null);

    const selectedAnnotation = selectedId
        ? annotations.find((annotation) => annotation.id === selectedId) ?? null
        : null;

    const selectedPopupPosition = useMemo(() => (
        selectedAnnotation
            ? popupPosition(selectedAnnotation, viewerFrame, stageSize, Boolean(remarkEditorOpen))
            : null
    ), [remarkEditorOpen, selectedAnnotation, stageSize, viewerFrame]);

    const updateSize = useCallback(() => {
        const element = containerRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        setStageSize((current) => (
            current.width === width && current.height === height
                ? current
                : { width, height }
        ));
    }, [containerRef]);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new ResizeObserver(updateSize);
        observer.observe(element);
        updateSize();
        return () => observer.disconnect();
    }, [containerRef, updateSize]);

    const toDoc = useCallback(() => {
        const position = stageRef.current?.getPointerPosition();
        if (!position) return { x: 0, y: 0 };
        return screenToDoc(position.x, position.y, viewerFrame);
    }, [viewerFrame]);

    const handleMouseDown = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
        if (event.evt.button !== 0) return;

        if (activeTool === 'pan') return;

        if (readOnly || activeTool === 'select') {
            if (event.target === event.target.getStage()) onAnnotationSelect(null);
            return;
        }

        const position = toDoc();
        setDrawing(true);
        setCurrentShape({
            id: 'drawing',
            type: activeTool,
            x: position.x,
            y: position.y,
            color: '#eab308',
        });
    }, [activeTool, onAnnotationSelect, readOnly, toDoc]);

    const handleMouseMove = useCallback(() => {
        if (!drawing || !currentShape) return;

        const position = toDoc();
        if (activeTool === 'pin' || activeTool === 'text') return;

        if (activeTool === 'rectangle' || activeTool === 'highlight' || activeTool === 'ellipse') {
            setCurrentShape((current) => current ? {
                ...current,
                width: position.x - current.x,
                height: position.y - current.y,
            } : current);
        } else if (activeTool === 'arrow' || activeTool === 'line') {
            setCurrentShape((current) => current ? {
                ...current,
                points: [current.x, current.y, position.x, position.y],
            } : current);
        } else if (activeTool === 'freehand' || activeTool === 'cloud') {
            setCurrentShape((current) => current ? {
                ...current,
                points: [...(current.points ?? [current.x, current.y]), position.x, position.y],
            } : current);
        }
    }, [activeTool, currentShape, drawing, toDoc]);

    const handleMouseUp = useCallback(() => {
        if (!drawing || !currentShape) return;

        setDrawing(false);
        const hasArea = Math.abs(currentShape.width ?? 0) >= 2 && Math.abs(currentShape.height ?? 0) >= 2;
        const hasLine = (currentShape.points?.length ?? 0) >= 4;
        const isPoint = currentShape.type === 'pin' || currentShape.type === 'text';

        if (isPoint || hasArea || hasLine) {
            onAnnotationCreated({ ...currentShape, id: crypto.randomUUID() });
        }

        setCurrentShape(null);
    }, [currentShape, drawing, onAnnotationCreated]);

    const renderShape = useCallback((shape: AnnotationShape) => {
        const frame = viewerFrame;
        if (frame.pageWidth <= 0 || frame.pageHeight <= 0) return null;

        const selected = shape.id === selectedId;
        const stroke = selected ? '#facc15' : shape.color || '#3b82f6';
        const strokeWidth = selected ? 2.25 : 1.5;

        if (shape.type === 'pin') {
            const point = docToScreen(shape.x, shape.y, frame);
            return <Circle x={point.x} y={point.y} radius={7} fill={stroke} stroke="#fff" strokeWidth={1.5} shadowBlur={8} shadowOpacity={0.3} />;
        }

        if (shape.type === 'rectangle' || shape.type === 'highlight') {
            const bounds = rectangleBounds(shape, frame);
            return (
                <Rect
                    x={bounds.x}
                    y={bounds.y}
                    width={bounds.width}
                    height={bounds.height}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    fill={shape.type === 'highlight' ? stroke : undefined}
                    opacity={shape.type === 'highlight' ? 0.22 : 1}
                />
            );
        }

        if (shape.type === 'ellipse') {
            const bounds = rectangleBounds(shape, frame);
            return (
                <Ellipse
                    x={bounds.x + bounds.width / 2}
                    y={bounds.y + bounds.height / 2}
                    radiusX={bounds.width / 2}
                    radiusY={bounds.height / 2}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                />
            );
        }

        if (shape.type === 'line' || shape.type === 'arrow') {
            if (!shape.points || shape.points.length < 4) return null;
            const start = docToScreen(shape.points[0], shape.points[1], frame);
            const end = docToScreen(shape.points[2], shape.points[3], frame);
            const points = [start.x, start.y, end.x, end.y];

            return shape.type === 'arrow'
                ? <Arrow points={points} stroke={stroke} fill={stroke} strokeWidth={strokeWidth} pointerLength={7} pointerWidth={7} />
                : <Line points={points} stroke={stroke} strokeWidth={strokeWidth} lineCap="round" />;
        }

        if (shape.type === 'freehand' || shape.type === 'cloud') {
            if (!shape.points || shape.points.length < 4) return null;
            const points: number[] = [];
            for (let index = 0; index < shape.points.length - 1; index += 2) {
                const point = docToScreen(shape.points[index], shape.points[index + 1], frame);
                points.push(point.x, point.y);
            }

            return (
                <Line
                    points={points}
                    stroke={stroke}
                    strokeWidth={shape.type === 'freehand' ? 2 : strokeWidth}
                    tension={shape.type === 'cloud' ? 0.35 : 0.45}
                    lineCap="round"
                    lineJoin="round"
                    closed={shape.type === 'cloud'}
                />
            );
        }

        if (shape.type === 'text') {
            const point = docToScreen(shape.x, shape.y, frame);
            return <Text x={point.x} y={point.y} text="Text" fontSize={14} fill={stroke} rotation={normalizeRotation(frame.rotation)} />;
        }

        return null;
    }, [selectedId, viewerFrame]);

    const clip = useMemo(() => pageBounds(viewerFrame), [viewerFrame]);
    const cursor = isPanning
        ? 'grabbing'
        : spaceHeld || activeTool === 'pan'
            ? 'grab'
            : activeTool === 'select'
                ? 'default'
                : activeTool === 'text'
                    ? 'text'
                    : 'crosshair';

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ position: 'absolute', inset: 0, cursor, pointerEvents: 'auto' }}
            >
                <Layer clipX={clip.x} clipY={clip.y} clipWidth={clip.width} clipHeight={clip.height}>
                    {annotations.map((shape) => (
                        <Group
                            key={shape.id}
                            onClick={() => onAnnotationSelect(shape.id)}
                            onTap={() => onAnnotationSelect(shape.id)}
                        >
                            {renderShape(shape)}
                        </Group>
                    ))}
                    {currentShape ? renderShape(currentShape) : null}
                </Layer>
            </Stage>
            {selectedAnnotation && selectedPopupPosition ? (
                <AnnotationInfoPopup
                    annotation={selectedAnnotation}
                    position={selectedPopupPosition}
                    editorOpen={Boolean(remarkEditorOpen)}
                    saving={Boolean(remarkSaving)}
                    onClose={() => {
                        onRemarkCancel?.();
                        onAnnotationSelect(null);
                    }}
                    onCreate={() => onRemarkCreate?.()}
                    onEdit={() => onRemarkEdit?.()}
                    onSave={(draft) => onRemarkSave?.(draft)}
                    onCancel={() => onRemarkCancel?.()}
                    onDelete={() => onAnnotationDelete?.(selectedAnnotation.id)}
                />
            ) : null}
        </div>
    );
}

export default DesignAnnotationLayer;
