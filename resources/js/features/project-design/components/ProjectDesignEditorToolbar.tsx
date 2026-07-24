import {
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Circle,
    Cloud,
    Download,
    Hand,
    Highlighter,
    Maximize,
    Minimize,
    Minus,
    MousePointer2,
    Pencil,
    Pin,
    RotateCw,
    Save,
    Square,
    Type,
    ZoomIn,
    ZoomOut,
    Scan,
    Columns3,
} from 'lucide-react';
import { Button, Tooltip } from '@heroui/react';
import { cn } from '@/lib/cn';
import type { ViewerViewport } from '@/features/project-design/viewer/useProjectDesignViewerController';

export type AnnotationTool =
    | 'select'
    | 'pan'
    | 'pin'
    | 'rectangle'
    | 'arrow'
    | 'cloud'
    | 'freehand'
    | 'text'
    | 'highlight'
    | 'ellipse'
    | 'line';

export interface ProjectDesignAnnotationToolbarState {
    onSave?: () => void;
    onRemark?: () => void;
    saving: boolean;
    hasUnsaved: boolean;
    canRemark: boolean;
}

export interface ProjectDesignEditorToolbarState {
    activeTool: AnnotationTool;
    onToolChange: (tool: AnnotationTool) => void;
    zoom: number;
    panX?: number;
    panY?: number;
    onZoomChange: (zoom: number) => void;
    onPanChange?: (x: number, y: number) => void;
    onViewportChange?: (viewport: ViewerViewport) => void;
    rotation: number;
    onRotate: () => void;
    fullscreen: boolean;
    onFullscreenToggle: () => void;
    onFullscreenChange?: (fullscreen: boolean) => void;
    onFitWidth: () => void;
    onFitPage: () => void;
    pageNumber: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSave?: () => void;
    onRemark?: () => void;
    saving?: boolean;
    hasUnsaved?: boolean;
    canRemark?: boolean;
    downloadUrl?: string;
    suppressAnnotations?: boolean;
    continuous?: boolean;
    onContinuousToggle?: () => void;
}

const NAVIGATION_TOOLS: { id: AnnotationTool; icon: typeof Pin; label: string; hint: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select annotation', hint: 'V' },
    { id: 'pan', icon: Hand, label: 'Pan drawing', hint: 'H / Space' },
];

const MARKUP_TOOLS: { id: AnnotationTool; icon: typeof Pin; label: string; hint?: string }[] = [
    { id: 'pin', icon: Pin, label: 'Place pin' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse' },
    { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'cloud', icon: Cloud, label: 'Revision cloud' },
    { id: 'freehand', icon: Pencil, label: 'Freehand' },
    { id: 'text', icon: Type, label: 'Text note' },
    { id: 'highlight', icon: Highlighter, label: 'Highlight' },
];

function ToolButton({
    active,
    icon: Icon,
    label,
    hint,
    onPress,
}: {
    active?: boolean;
    icon: typeof Pin;
    label: string;
    hint?: string;
    onPress: () => void;
}) {
    return (
        <Tooltip>
            <Button
                isIconOnly
                size="sm"
                variant="ghost"
                onPress={onPress}
                aria-label={label}
                aria-pressed={active}
                className={cn(
                    'h-7 w-7 min-w-0 rounded-md border border-transparent transition-colors',
                    active
                        ? 'border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent)]/12 text-[var(--accent)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                )}
            >
                <Icon size={13} />
            </Button>
            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl">
                <span>{label}</span>
                {hint ? <span className="ml-2 text-[10px] text-[var(--text-muted)]">{hint}</span> : null}
            </Tooltip.Content>
        </Tooltip>
    );
}

function ToolbarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            'flex h-8 shrink-0 items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-0.5 shadow-sm',
            className,
        )}>
            {children}
        </div>
    );
}

export function ProjectDesignEditorToolbar(state: ProjectDesignEditorToolbarState) {
    const {
        activeTool,
        onToolChange,
        zoom,
        onZoomChange,
        onFitWidth,
        onFitPage,
        pageNumber,
        totalPages,
        onPageChange,
        onRotate,
        fullscreen,
        onFullscreenToggle,
        downloadUrl,
        suppressAnnotations,
        onSave,
        onRemark,
        saving,
        hasUnsaved,
        canRemark,
    } = state;

    const safeTotal = Math.max(1, totalPages);
    const safePage = Math.max(1, Math.min(pageNumber, safeTotal));

    return (
        <div className="app-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1">
            {!suppressAnnotations ? (
                <>
                    <ToolbarGroup>
                        {NAVIGATION_TOOLS.map((tool) => (
                            <ToolButton
                                key={tool.id}
                                active={activeTool === tool.id}
                                icon={tool.icon}
                                label={tool.label}
                                hint={tool.hint}
                                onPress={() => onToolChange(tool.id)}
                            />
                        ))}
                    </ToolbarGroup>

                    <ToolbarGroup>
                        {MARKUP_TOOLS.map((tool) => (
                            <ToolButton
                                key={tool.id}
                                active={activeTool === tool.id}
                                icon={tool.icon}
                                label={tool.label}
                                hint={tool.hint}
                                onPress={() => onToolChange(tool.id)}
                            />
                        ))}
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <Tooltip>
                            <Button
                                size="sm"
                                variant="ghost"
                                isDisabled={!hasUnsaved || saving || !onSave}
                                onPress={onSave}
                                className={cn(
                                    'h-7 min-w-0 gap-1.5 px-2 text-[11px] font-medium',
                                    hasUnsaved ? 'text-emerald-400' : 'text-[var(--text-subtle)]',
                                )}
                            >
                                {saving ? <Scan size={13} className="animate-pulse" /> : <Save size={13} />}
                                <span>{saving ? 'Saving' : 'Save'}</span>
                                {hasUnsaved ? <span className="size-1.5 rounded-full bg-amber-400" /> : null}
                            </Button>
                            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]">
                                Save unsaved annotations
                            </Tooltip.Content>
                        </Tooltip>

                        <Button
                            size="sm"
                            variant="ghost"
                            isDisabled={!canRemark || !onRemark}
                            onPress={onRemark}
                            className="h-7 min-w-0 gap-1.5 px-2 text-[11px] text-[var(--text-muted)]"
                        >
                            <Columns3 size={13} />
                            Remark
                        </Button>
                    </ToolbarGroup>
                </>
            ) : null}

            <div className="ml-auto flex items-center gap-1.5">
                <ToolbarGroup>
                    <ToolButton
                        icon={ChevronLeft}
                        label="Previous page"
                        hint="Page Up"
                        onPress={() => onPageChange(Math.max(1, safePage - 1))}
                    />
                    <span className="min-w-[54px] px-1 text-center text-[11px] tabular-nums text-[var(--text-muted)]">
                        <strong className="font-semibold text-[var(--foreground)]">{safePage}</strong>
                        <span className="mx-1 text-[var(--text-subtle)]">/</span>
                        {safeTotal}
                    </span>
                    <ToolButton
                        icon={ChevronRight}
                        label="Next page"
                        hint="Page Down"
                        onPress={() => onPageChange(Math.min(safeTotal, safePage + 1))}
                    />
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolButton icon={Scan} label="Fit page" hint="0" onPress={onFitPage} />
                    <ToolButton icon={Columns3} label="Fit width" hint="W" onPress={onFitWidth} />
                    <ToolButton
                        icon={ZoomOut}
                        label="Zoom out"
                        hint="-"
                        onPress={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
                    />
                    <span className="min-w-[46px] text-center text-[11px] tabular-nums text-[var(--text-muted)]">
                        {Math.round(zoom * 100)}%
                    </span>
                    <ToolButton
                        icon={ZoomIn}
                        label="Zoom in"
                        hint="+"
                        onPress={() => onZoomChange(Math.min(10, zoom + 0.1))}
                    />
                    <ToolButton icon={RotateCw} label="Rotate clockwise" hint="R" onPress={onRotate} />
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolButton
                        icon={fullscreen ? Minimize : Maximize}
                        label={fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
                        hint="F"
                        onPress={onFullscreenToggle}
                    />
                    {downloadUrl ? (
                        <Tooltip>
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                                aria-label="Download current asset"
                            >
                                <Download size={13} />
                            </a>
                            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]">
                                Download current asset
                            </Tooltip.Content>
                        </Tooltip>
                    ) : null}
                </ToolbarGroup>
            </div>
        </div>
    );
}
