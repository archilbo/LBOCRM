import { MousePointer2, Pin, Square, ArrowUpRight, Cloud, Pencil, Type, Highlighter, Circle, Minus, Hand, ZoomIn, ZoomOut, RotateCw, Maximize, Minimize, AlignCenter, AlignStartVertical, Download, ChevronLeft, ChevronRight, AlignJustify } from 'lucide-react';
import { Button, Tooltip } from '@heroui/react';
import { cn } from '@/lib/cn';

export type AnnotationTool = 'select' | 'pan' | 'pin' | 'rectangle' | 'arrow' | 'cloud' | 'freehand' | 'text' | 'highlight' | 'ellipse' | 'line';

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
    continuous?: boolean;
    onContinuousToggle?: () => void;
}

const TOOLS: { id: AnnotationTool; icon: typeof Pin; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'pan', icon: Hand, label: 'Pan' },
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
    const { activeTool, onToolChange, zoom, onZoomChange, onFitWidth, onFitPage, pageNumber, totalPages, onPageChange, onRotate, fullscreen, onFullscreenToggle, downloadUrl, suppressAnnotations, onSave, saving, hasUnsaved, onContinuousToggle } = state;
    return (
        <div className="flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-sm">
                {!suppressAnnotations && TOOLS.map((t) => (
                    <Tooltip key={t.id}>
                        <Button isIconOnly size="sm" variant="ghost"
                            onPress={() => onToolChange(t.id)}
                            className={cn('h-7 w-7 min-w-0', activeTool === t.id ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)]')}
                            aria-label={t.label}>
                            <t.icon size={13} />
                        </Button>
                        <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">{t.label}</Tooltip.Content>
                    </Tooltip>
                ))}
                {!suppressAnnotations && (
                    <>
                        <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />
                        <Tooltip>
                            <Button size="sm" variant="ghost" isDisabled={!hasUnsaved || saving} className={cn('h-7 min-w-0 px-2 text-[11px]', hasUnsaved ? 'text-emerald-400' : 'text-[var(--text-subtle)]')}
                                onPress={onSave}>
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">
                                {!hasUnsaved ? 'No unsaved changes' : saving ? 'Saving...' : 'Save annotations'}
                            </Tooltip.Content>
                        </Tooltip>
                    </>
                )}
            </div>

            <div className="flex items-center gap-1">
                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" isDisabled={pageNumber <= 1} onPress={() => onPageChange(pageNumber - 1)} aria-label="Previous page">
                        <ChevronLeft size={13} />
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Previous page</Tooltip.Content>
                </Tooltip>
                <span className="min-w-[4ch] text-center text-[11px] text-[var(--text-muted)] tabular-nums">{pageNumber}/{totalPages}</span>
                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" isDisabled={pageNumber >= totalPages} onPress={() => onPageChange(pageNumber + 1)} aria-label="Next page">
                        <ChevronRight size={13} />
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Next page</Tooltip.Content>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-[var(--border)]" />

                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" onPress={onFitWidth} aria-label="Fit width">
                        <AlignStartVertical size={13} />
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Fit width</Tooltip.Content>
                </Tooltip>
                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" onPress={onFitPage} aria-label="Fit page">
                        <AlignCenter size={13} />
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Fit page</Tooltip.Content>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-[var(--border)]" />

                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" onPress={() => onZoomChange(Math.max(0.1, zoom - 0.1))} aria-label="Zoom out">
                        <ZoomOut size={13} />
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Zoom out</Tooltip.Content>
                </Tooltip>
                <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)] tabular-nums">{Math.round(zoom * 100)}%</span>
                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" onPress={() => onZoomChange(Math.min(5, zoom + 0.1))} aria-label="Zoom in">
                        <ZoomIn size={13} />
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Zoom in</Tooltip.Content>
                </Tooltip>

                <div className="mx-1 h-4 w-px bg-[var(--border)]" />

                {onContinuousToggle && (
                    <>
                        <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                        <Tooltip>
                            <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0"
                                onPress={() => {}} aria-label="Continuous scroll" isDisabled>
                                <AlignJustify size={13} />
                            </Button>
                            <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Continuous page review is being prepared.</Tooltip.Content>
                        </Tooltip>
                    </>
                )}

                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" onPress={onRotate} aria-label="Rotate">
                        <RotateCw size={13} />
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">Rotate 90°</Tooltip.Content>
                </Tooltip>
                <Tooltip>
                    <Button isIconOnly size="sm" variant="ghost" className="h-7 w-7 min-w-0" onPress={onFullscreenToggle} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                        {fullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                    </Button>
                    <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-[11px]">{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</Tooltip.Content>
                </Tooltip>

                {downloadUrl && (
                    <>
                        <div className="mx-1 h-4 w-px bg-[var(--border)]" />
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                            className="flex h-7 w-7 min-w-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--accent)]/10"
                            aria-label="Download">
                            <Download size={13} />
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
