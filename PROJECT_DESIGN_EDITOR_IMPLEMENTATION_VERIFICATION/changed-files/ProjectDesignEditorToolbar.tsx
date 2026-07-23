import { MousePointer2, Pin, Square, ArrowUpRight, Cloud, Pencil, Type, Highlighter, Circle, Minus, ZoomIn, ZoomOut, RotateCw, Maximize, Minimize, AlignCenter, AlignStartVertical, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Tooltip } from '@heroui/react';
import { cn } from '@/lib/cn';

export type AnnotationTool = 'select' | 'pin' | 'rectangle' | 'arrow' | 'cloud' | 'freehand' | 'text' | 'highlight' | 'ellipse' | 'line';

export interface ProjectDesignEditorToolbarState {
    activeTool: AnnotationTool;
    onToolChange: (t: AnnotationTool) => void;
    zoom: number;
    onZoomChange: (z: number) => void;
    rotation: number;
    onRotate: () => void;
    fullscreen: boolean;
    onFullscreenToggle: () => void;
    onFitWidth: () => void;
    onFitPage: () => void;
    pageNumber: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    onSave?: () => void;
    saving?: boolean;
    hasUnsaved?: boolean;
    downloadUrl?: string;
    suppressAnnotations?: boolean;
}

const TOOLS: { id: AnnotationTool; icon: typeof Pin; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select / Pan' },
    { id: 'pin', icon: Pin, label: 'Pin' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse' },
    { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'cloud', icon: Cloud, label: 'Cloud' },
    { id: 'freehand', icon: Pencil, label: 'Freehand' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'highlight', icon: Highlighter, label: 'Highlight' },
];

export function ProjectDesignEditorToolbar(state: ProjectDesignEditorToolbarState) {
    const { activeTool, onToolChange, zoom, onZoomChange, onFitWidth, onFitPage, pageNumber, totalPages, onPageChange, rotation, onRotate, fullscreen, onFullscreenToggle, downloadUrl, suppressAnnotations, onSave, saving, hasUnsaved } = state;
    return (
        <div className="flex items-center justify-between gap-2 shrink-0">
            {/* Left: annotation tools */}
            <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-sm">
                {!suppressAnnotations && TOOLS.map((t) => (
                    <Button key={t.id} isIconOnly size="sm" variant="light"
                        onPress={() => onToolChange(t.id)}
                        className={cn('h-7 w-7 min-w-0', activeTool === t.id ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)]')}
                        aria-label={t.label}>
                        <t.icon size={13} />
                    </Button>
                ))}
                {!suppressAnnotations && (
                    <>
                        <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />
                        <Button size="sm" variant="light" isDisabled={!hasUnsaved || saving} className={cn('h-7 min-w-0 px-2 text-[11px]', hasUnsaved ? 'text-emerald-400' : 'text-[var(--text-subtle)]')}
                            onPress={onSave}>
                            Save
                        </Button>
                    </>
                )}
            </div>

            {/* Right: view controls */}
            <div className="flex items-center gap-1">
                {/* Page nav */}
                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" isDisabled={pageNumber <= 1} onPress={() => onPageChange(pageNumber - 1)} aria-label="Previous page">
                    <ChevronLeft size={13} />
                </Button>
                <span className="min-w-[4ch] text-center text-[11px] text-[var(--text-muted)] tabular-nums">{pageNumber}/{totalPages}</span>
                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" isDisabled={pageNumber >= totalPages} onPress={() => onPageChange(pageNumber + 1)} aria-label="Next page">
                    <ChevronRight size={13} />
                </Button>

                <div className="mx-1 h-4 w-px bg-[var(--border)]" />

                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={onFitWidth} aria-label="Fit width">
                    <AlignStartVertical size={13} />
                </Button>
                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={onFitPage} aria-label="Fit page">
                    <AlignCenter size={13} />
                </Button>

                <div className="mx-1 h-4 w-px bg-[var(--border)]" />

                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={() => onZoomChange(Math.max(0.1, zoom - 0.1))} aria-label="Zoom out">
                    <ZoomOut size={13} />
                </Button>
                <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)] tabular-nums">{Math.round(zoom * 100)}%</span>
                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={() => onZoomChange(Math.min(5, zoom + 0.1))} aria-label="Zoom in">
                    <ZoomIn size={13} />
                </Button>

                <div className="mx-1 h-4 w-px bg-[var(--border)]" />

                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={onRotate} aria-label="Rotate">
                    <RotateCw size={13} />
                </Button>
                <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" onPress={onFullscreenToggle} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                    {fullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                </Button>

                {downloadUrl && (
                    <>
                        <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                        <Button isIconOnly size="sm" variant="light" className="h-7 w-7 min-w-0" as="a" href={downloadUrl} target="_blank" rel="noopener noreferrer" aria-label="Download">
                            <Download size={13} />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
