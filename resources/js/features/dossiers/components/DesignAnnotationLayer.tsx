import { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Arrow, Text, Group, Line, Ellipse } from 'react-konva';
import type Konva from 'konva';
import { type AnnotationTool } from './DesignAnnotationToolbar';

interface AnnotationShape {
    id: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: number[];
    color?: string;
}

export interface ViewerFrame {
    scale: number;
    rotation: number;
    pageX: number;
    pageY: number;
    pageWidth: number;
    pageHeight: number;
}

function docToScreen(docX: number, docY: number, f: ViewerFrame): { x: number; y: number } {
    let x = docX * f.scale;
    let y = docY * f.scale;
    if (f.rotation === 90) { const t = x; x = y; y = -t; }
    else if (f.rotation === 180) { x = -x; y = -y; }
    else if (f.rotation === 270) { const t = x; x = -y; y = t; }
    return { x: x + f.pageX, y: y + f.pageY };
}

function screenToDoc(screenX: number, screenY: number, f: ViewerFrame): { x: number; y: number } {
    let x = screenX - f.pageX;
    let y = screenY - f.pageY;
    if (f.rotation === 90) { const t = x; x = -y; y = t; }
    else if (f.rotation === 180) { x = -x; y = -y; }
    else if (f.rotation === 270) { const t = x; x = y; y = -t; }
    return { x: x / f.scale, y: y / f.scale };
}

export function DesignAnnotationLayer({ containerRef, annotations, activeTool, onAnnotationCreated, onAnnotationSelect, onAnnotationDelete, selectedId, readOnly, viewerFrame, onViewerZoom, onViewerPan }: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    annotations: AnnotationShape[];
    activeTool: AnnotationTool;
    onAnnotationCreated: (shape: AnnotationShape) => void;
    onAnnotationSelect: (id: string | null) => void;
    onAnnotationDelete?: (id: string) => void;
    selectedId: string | null;
    readOnly?: boolean;
    viewerFrame: ViewerFrame;
    onViewerZoom?: (delta: number, cx: number, cy: number) => void;
    onViewerPan?: (dx: number, dy: number) => void;
}) {
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const [drawing, setDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [currentShape, setCurrentShape] = useState<AnnotationShape | null>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const frameRef = useRef(viewerFrame);
    const panStartRef = useRef({ x: 0, y: 0 });
    frameRef.current = viewerFrame;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, [containerRef]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && onAnnotationDelete) {
                const tag = (e.target as HTMLElement)?.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
                onAnnotationDelete(selectedId);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, onAnnotationDelete]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        function onWheel(e: WheelEvent) {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            onViewerZoom?.(e.deltaY > 0 ? -1 : 1, e.clientX - rect.left, e.clientY - rect.top);
        }
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [containerRef, onViewerZoom]);

    function toDoc(clientX: number, clientY: number): { x: number; y: number } {
        const stage = stageRef.current;
        if (!stage) return { x: 0, y: 0 };
        const pos = stage.getPointerPosition();
        if (!pos) return { x: 0, y: 0 };
        return screenToDoc(pos.x, pos.y, frameRef.current);
    }

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly || activeTool === 'select') {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
                onAnnotationSelect(null);
                setIsPanning(true);
                panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY };
            }
            return;
        }
        const pos = toDoc(e.evt.clientX, e.evt.clientY);
        setDrawing(true);
        setCurrentShape({ id: 'drawing', type: activeTool, x: pos.x, y: pos.y, color: '#eab308' });
    }, [activeTool, readOnly, onAnnotationSelect]);

    const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (isPanning) {
            const dx = e.evt.clientX - panStartRef.current.x;
            const dy = e.evt.clientY - panStartRef.current.y;
            panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY };
            onViewerPan?.(dx, dy);
            return;
        }
        if (!drawing || !currentShape) return;
        const pos = toDoc(e.evt.clientX, e.evt.clientY);
        if (activeTool === 'pin' || activeTool === 'text') return;
        if (activeTool === 'rectangle' || activeTool === 'highlight') {
            setCurrentShape((prev) => prev ? { ...prev, width: pos.x - prev.x, height: pos.y - prev.y } : prev);
        } else if (activeTool === 'arrow') {
            setCurrentShape((prev) => prev ? { ...prev, points: [prev.x, prev.y, pos.x, pos.y] } : prev);
        } else if (activeTool === 'freehand' || activeTool === 'cloud') {
            setCurrentShape((prev) => prev ? { ...prev, points: [...(prev.points ?? []), pos.x, pos.y] } : prev);
        }
    }, [isPanning, drawing, currentShape, activeTool, onViewerPan]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
        if (!drawing || !currentShape) return;
        setDrawing(false);
        if (currentShape.type === 'pin' || currentShape.type === 'text') {
            onAnnotationCreated({ ...currentShape, id: crypto.randomUUID() });
        } else if (currentShape.width || (currentShape.points && currentShape.points.length > 2)) {
            onAnnotationCreated({ ...currentShape, id: crypto.randomUUID() });
        }
        setCurrentShape(null);
    }, [drawing, currentShape, onAnnotationCreated]);

    function renderShape(s: AnnotationShape, i: number) {
        const isSelected = s.id === selectedId;
        const stroke = isSelected ? '#eab308' : (s.color || '#3b82f6');
        const strokeWidth = isSelected ? 2 : 1.5;
        const key = s.id;
        const f = frameRef.current;
        const sp = (dx: number, dy: number) => docToScreen(dx, dy, f);

        if (f.pageWidth === 0 || f.pageHeight === 0) return null;

        switch (s.type) {
            case 'pin': {
                const p = sp(s.x, s.y);
                return <Circle key={key} x={p.x} y={p.y} radius={6} fill={stroke} stroke="#fff" strokeWidth={1.5} />;
            }
            case 'rectangle':
            case 'highlight': {
                const p = sp(s.x, s.y);
                return <Rect key={key} x={p.x} y={p.y} width={(s.width ?? 0) * f.scale} height={(s.height ?? 0) * f.scale} stroke={stroke} strokeWidth={strokeWidth} fill={s.type === 'highlight' ? `${stroke}20` : undefined} />;
            }
            case 'arrow': {
                if (!s.points || s.points.length < 4) return null;
                const a = sp(s.points[0], s.points[1]);
                const b = sp(s.points[2], s.points[3]);
                return <Arrow key={key} points={[a.x, a.y, b.x, b.y]} stroke={stroke} strokeWidth={strokeWidth} fill={stroke} pointerLength={6} pointerWidth={6} />;
            }
            case 'freehand':
            case 'cloud': {
                if (!s.points || s.points.length < 4) return null;
                const pts: number[] = [];
                for (let j = 0; j < s.points.length - 1; j += 2) {
                    const p = sp(s.points[j], s.points[j + 1]);
                    pts.push(p.x, p.y);
                }
                if (s.type === 'cloud') {
                    return (
                        <Group key={key}>
                            <Line points={pts} stroke={stroke} strokeWidth={strokeWidth} tension={0.4} lineCap="round" lineJoin="round" closed />
                            {pts.length >= 6 && pts.slice(0, 6).map((_, j) => (
                                <Ellipse key={j} x={pts[j * 2] + (j % 2 === 0 ? 4 : -4)} y={pts[j * 2 + 1] + (j % 2 === 0 ? -4 : 4)} radiusX={8} radiusY={6} fill={stroke} opacity={0.3} />
                            ))}
                        </Group>
                    );
                }
                return <Line key={key} points={pts} stroke={stroke} strokeWidth={2} tension={0.5} lineCap="round" lineJoin="round" />;
            }
            case 'text': {
                const p = sp(s.x, s.y);
                return <Text key={key} x={p.x} y={p.y} text="Text" fontSize={14} fill={stroke} />;
            }
            default:
                return null;
        }
    }

    return (
        <Stage ref={stageRef} width={stageSize.width} height={stageSize.height}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
            style={{ position: 'absolute', top: 0, left: 0, cursor: isPanning ? 'grabbing' : ((readOnly || activeTool === 'select') ? 'grab' : 'crosshair') }}>
            <Layer>
                {annotations.map((s, i) => (
                    <Group key={s.id} onClick={() => onAnnotationSelect(s.id)} onTap={() => onAnnotationSelect(s.id)}>
                        {renderShape(s, i)}
                    </Group>
                ))}
                {currentShape && renderShape(currentShape, -1)}
            </Layer>
        </Stage>
    );
}

export default DesignAnnotationLayer;
