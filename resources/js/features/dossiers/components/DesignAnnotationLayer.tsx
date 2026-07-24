import { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Arrow, Text, Group, Line, Ellipse } from 'react-konva';
import type Konva from 'konva';
import { X, User, Clock, AlertTriangle } from 'lucide-react';
import type { AnnotationTool } from './DesignAnnotationToolbar';

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
    remark?: { id: number; severity: string; status: string; title: string; description: string | null; createdBy: { id: number; name: string } | null; createdAt: string | null } | null;
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

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
}

function AnnotationInfoPopup({ annotation, onClose }: { annotation: AnnotationShape; onClose: () => void }) {
    const r = annotation.remark;
    return (
        <div className="absolute left-3 top-3 z-20 w-72 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Annotation Info</span>
                <button onClick={onClose} className="rounded p-0.5 text-[var(--text-muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--foreground)]"><X size={12} /></button>
            </div>
            <div className="space-y-2 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <User size={11} />
                    <span>{annotation.authoredBy?.name ?? 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <Clock size={11} />
                    <span>{formatDate(annotation.createdAt)}</span>
                </div>
                {r && (
                    <>
                        <div className="flex items-center gap-1.5 pt-1">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${SEVERITY_STYLES[r.severity] ?? 'bg-slate-500/20 text-slate-400'}`}>
                                {r.severity}
                            </span>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[r.status] ?? 'bg-slate-500/20 text-slate-400'}`}>
                                {r.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div>
                            <p className="text-[12px] font-medium text-[var(--foreground)]">{r.title}</p>
                            {r.description && <p className="mt-0.5 text-[11px] text-[var(--text-muted)] leading-relaxed">{r.description}</p>}
                        </div>
                        {r.createdBy && (
                            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-subtle)]">
                                <AlertTriangle size={10} />
                                <span>by {r.createdBy.name}</span>
                            </div>
                        )}
                    </>
                )}
                {!r && (
                    <p className="text-[11px] italic text-[var(--text-subtle)]">No remark yet.</p>
                )}
            </div>
        </div>
    );
}

function applyRotation(x: number, y: number, rotation: number, rw: number, rh: number): { x: number; y: number } {
    const m = new DOMMatrix(`rotate(${rotation}deg)`);
    const cx = rw / 2;
    const cy = rh / 2;
    const tx = x - cx;
    const ty = y - cy;
    const p = m.transformPoint({ x: tx, y: ty });
    return { x: p.x + cx, y: p.y + cy };
}

function unapplyRotation(x: number, y: number, rotation: number, rw: number, rh: number): { x: number; y: number } {
    const m = new DOMMatrix(`rotate(${-rotation}deg)`);
    const cx = rw / 2;
    const cy = rh / 2;
    const tx = x - cx;
    const ty = y - cy;
    const p = m.transformPoint({ x: tx, y: ty });
    return { x: p.x + cx, y: p.y + cy };
}

export function DesignAnnotationLayer({ annotations, activeTool, onAnnotationCreated, onAnnotationSelect, onAnnotationDelete, selectedId, readOnly, renderedWidth, renderedHeight, rotation, zoom, pageShellRef, panPointerEventsDisabled }: {
    annotations: AnnotationShape[];
    activeTool: AnnotationTool;
    onAnnotationCreated: (shape: AnnotationShape) => void;
    onAnnotationSelect: (id: string | null) => void;
    onAnnotationDelete?: (id: string) => void;
    selectedId: string | null;
    readOnly?: boolean;
    renderedWidth: number;
    renderedHeight: number;
    rotation: number;
    zoom: number;
    pageShellRef?: React.RefObject<HTMLDivElement | null>;
    panPointerEventsDisabled: boolean;
}) {
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const [drawing, setDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState<AnnotationShape | null>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const selectedAnnotation = selectedId ? annotations.find((a) => a.id === selectedId) ?? null : null;

    const rotRef = useRef(rotation);
    const zoomRef = useRef(zoom);
    const rwRef = useRef(renderedWidth);
    const rhRef = useRef(renderedHeight);
    useEffect(() => { rotRef.current = rotation; }, [rotation]);
    useEffect(() => { zoomRef.current = zoom; }, [zoom]);
    useEffect(() => { rwRef.current = renderedWidth; }, [renderedWidth]);
    useEffect(() => { rhRef.current = renderedHeight; }, [renderedHeight]);

    const updateSize = useCallback(() => {
        const shell = pageShellRef?.current;
        if (shell) {
            const rect = shell.getBoundingClientRect();
            setStageSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
        }
    }, [pageShellRef]);

    useEffect(() => {
        const el = pageShellRef?.current;
        if (!el) return;
        const obs = new ResizeObserver(() => { updateSize(); });
        obs.observe(el);
        updateSize();
        return () => obs.disconnect();
    }, [pageShellRef, updateSize]);

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

    function fromNormalized(nx: number, ny: number, z: number, r: number): { x: number; y: number } {
        let x = nx * z;
        let y = ny * z;
        if (r !== 0) {
            const rot = applyRotation(x, y, r, renderedWidth, renderedHeight);
            x = rot.x;
            y = rot.y;
        }
        return { x, y };
    }

    const toNormalized = useCallback(function toNormalized(stageX: number, stageY: number, z: number, r: number, rw: number, rh: number): { x: number; y: number } {
        let x = stageX / z;
        let y = stageY / z;
        if (r !== 0) {
            const unrot = unapplyRotation(x * z, y * z, r, rw, rh);
            x = unrot.x / z;
            y = unrot.y / z;
        }
        if (rw > 0 && rh > 0) {
            return { x: x / rw * rw, y: y / rh * rh };
        }
        return { x, y };
    }, []);

    const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.button === 1) return;
        if (activeTool === 'pan' || panPointerEventsDisabled) return;
        if (readOnly) {
            if (e.target === e.target.getStage()) onAnnotationSelect(null);
            return;
        }
        if (activeTool === 'select') {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) onAnnotationSelect(null);
            return;
        }
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const np = toNormalized(pos.x, pos.y, zoomRef.current, rotRef.current, rwRef.current, rhRef.current);
        setDrawing(true);
        setCurrentShape({ id: 'drawing', type: activeTool, x: np.x, y: np.y, color: '#eab308' });
    }, [activeTool, readOnly, onAnnotationSelect, panPointerEventsDisabled, toNormalized]);

    const handleMouseMove = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!drawing || !currentShape) return;
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const np = toNormalized(pos.x, pos.y, zoomRef.current, rotRef.current, rwRef.current, rhRef.current);
        if (activeTool === 'pin' || activeTool === 'text') return;
        if (activeTool === 'rectangle' || activeTool === 'highlight' || activeTool === 'ellipse') {
            setCurrentShape((prev) => prev ? { ...prev, width: np.x - prev.x, height: np.y - prev.y } : prev);
        } else if (activeTool === 'arrow' || activeTool === 'line') {
            setCurrentShape((prev) => prev ? { ...prev, points: [prev.x, prev.y, np.x, np.y] } : prev);
        } else if (activeTool === 'freehand' || activeTool === 'cloud') {
            setCurrentShape((prev) => prev ? { ...prev, points: [...(prev.points ?? []), np.x, np.y] } : prev);
        }
    }, [drawing, currentShape, activeTool, toNormalized]);

    const handleMouseUp = useCallback(() => {
        if (!drawing || !currentShape) return;
        setDrawing(false);
        if (currentShape.type === 'pin' || currentShape.type === 'text') {
            onAnnotationCreated({ ...currentShape, id: crypto.randomUUID() });
        } else if (currentShape.width || (currentShape.points && currentShape.points.length > 2)) {
            onAnnotationCreated({ ...currentShape, id: crypto.randomUUID() });
        }
        setCurrentShape(null);
    }, [drawing, currentShape, onAnnotationCreated]);

    function renderShape(s: AnnotationShape, _i: number, z: number, r: number) {
        const isSelected = s.id === selectedId;
        const stroke = isSelected ? '#eab308' : (s.color || '#3b82f6');
        const strokeWidth = isSelected ? 2 : 1.5;
        const key = s.id;

        const stagePt = (dx: number, dy: number) => {
            const p = fromNormalized(dx, dy, z, r);
            return { x: p.x, y: p.y };
        };

        if (renderedWidth === 0 || renderedHeight === 0) return null;

        switch (s.type) {
            case 'pin': {
                const p = stagePt(s.x, s.y);
                return <Circle key={key} x={p.x} y={p.y} radius={6} fill={stroke} stroke="#fff" strokeWidth={1.5} />;
            }
            case 'rectangle':
            case 'highlight': {
                const p = stagePt(s.x, s.y);
                const w = (s.width ?? 0) * z;
                const h = (s.height ?? 0) * z;
                const { x: rx, y: ry } = r !== 0 ? applyRotation(p.x, p.y, r, renderedWidth, renderedHeight) : p;
                return <Rect key={key} x={rx} y={ry} width={w} height={h} stroke={stroke} strokeWidth={strokeWidth} fill={s.type === 'highlight' ? `${stroke}20` : undefined} />;
            }
            case 'ellipse': {
                const cx = fromNormalized(s.x + (s.width ?? 0) / 2, s.y + (s.height ?? 0) / 2, z, r);
                const rx = Math.abs((s.width ?? 0) * z) / 2;
                const ry = Math.abs((s.height ?? 0) * z) / 2;
                return <Ellipse key={key} x={cx.x} y={cx.y} radiusX={rx} radiusY={ry} stroke={stroke} strokeWidth={strokeWidth} />;
            }
            case 'line': {
                if (!s.points || s.points.length < 4) return null;
                const a = fromNormalized(s.points[0], s.points[1], z, r);
                const b = fromNormalized(s.points[2], s.points[3], z, r);
                return <Line key={key} points={[a.x, a.y, b.x, b.y]} stroke={stroke} strokeWidth={strokeWidth} lineCap="round" />;
            }
            case 'arrow': {
                if (!s.points || s.points.length < 4) return null;
                const a = fromNormalized(s.points[0], s.points[1], z, r);
                const b = fromNormalized(s.points[2], s.points[3], z, r);
                return <Arrow key={key} points={[a.x, a.y, b.x, b.y]} stroke={stroke} strokeWidth={strokeWidth} fill={stroke} pointerLength={6} pointerWidth={6} />;
            }
            case 'freehand':
            case 'cloud': {
                if (!s.points || s.points.length < 4) return null;
                const pts: number[] = [];
                for (let j = 0; j < s.points.length - 1; j += 2) {
                    const p = fromNormalized(s.points[j], s.points[j + 1], z, r);
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
                const p = fromNormalized(s.x, s.y, z, r);
                return <Text key={key} x={p.x} y={p.y} text="Text" fontSize={14} fill={stroke} />;
            }
            default:
                return null;
        }
    }

    function getCursor() {
        if (activeTool === 'pan' || panPointerEventsDisabled) return 'grab';
        if (activeTool === 'select') return 'default';
        if (activeTool === 'text') return 'text';
        return 'crosshair';
    }

    const stageStyle: React.CSSProperties = {
        position: 'absolute',
        inset: '0px',
        pointerEvents: panPointerEventsDisabled ? 'none' as const : 'auto' as const,
        cursor: getCursor(),
    };

    return (
        <>
            <Stage ref={stageRef} width={stageSize.width} height={stageSize.height}
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
                style={stageStyle}>
                <Layer>
                    {annotations.map((s, i) => (
                        <Group key={s.id} onClick={() => onAnnotationSelect(s.id)} onTap={() => onAnnotationSelect(s.id)}>
                            {renderShape(s, i, zoom, rotation)}
                        </Group>
                    ))}
                    {currentShape && renderShape(currentShape, -1, zoom, rotation)}
                </Layer>
            </Stage>
            {selectedAnnotation && <AnnotationInfoPopup annotation={selectedAnnotation} onClose={() => onAnnotationSelect(null)} />}
        </>
    );
}

export default DesignAnnotationLayer;
