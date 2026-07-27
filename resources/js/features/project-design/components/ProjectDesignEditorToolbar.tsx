import { useEffect, useState } from 'react';
import {
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Circle,
    CircleHelp,
    Cloud,
    Columns3,
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
    Scan,
    Square,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Button, Input, Tooltip } from '@heroui/react';
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
    onSave?: () => Promise<boolean>;
    onDiscard?: () => void;
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
    onSave?: () => Promise<boolean>;
    onRemark?: () => void;
    saving?: boolean;
    hasUnsaved?: boolean;
    canRemark?: boolean;
    downloadUrl?: string;
    suppressAnnotations?: boolean;
    continuous?: boolean;
    onContinuousToggle?: () => void;
    onShortcutHelp?: () => void;
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
    { id: 'highlight', icon: Highlighter, label: 'Highlight' },
];

type ToolButtonProps = {
    active?: boolean;
    icon: typeof Pin;
    label: string;
    hint?: string;
    onPress: () => void;
    isDisabled?: boolean;
    isPending?: boolean;
    statusDot?: boolean;
};

function ToolButton({
    active,
    icon: Icon,
    label,
    hint,
    onPress,
    isDisabled,
    isPending,
    statusDot,
}: ToolButtonProps) {
    return (
        <Tooltip delay={350}>
            <Tooltip.Trigger>
                <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    onPress={onPress}
                    isDisabled={isDisabled}
                    isPending={isPending}
                    aria-label={label}
                    aria-pressed={active}
                    className={cn(
                        'relative h-7 w-7 min-w-0 rounded-md border border-transparent transition-colors',
                        active
                            ? 'border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--accent)]/12 text-[var(--accent)]'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                    )}
                >
                    {!isPending ? <Icon size={13} /> : null}
                    {statusDot ? <span className="absolute right-1 top-1 size-1.5 rounded-full bg-amber-400 ring-1 ring-[var(--surface)]" /> : null}
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-xl">
                <span>{label}</span>
                {hint ? <span className="ml-2 text-[10px] text-[var(--text-muted)]">{hint}</span> : null}
            </Tooltip.Content>
        </Tooltip>
    );
}

function ToolbarGroup({
    children,
    className,
    label,
}: {
    children: React.ReactNode;
    className?: string;
    label: string;
}) {
    return (
        <div
            aria-label={label}
            className={cn(
                'flex h-8 shrink-0 items-center gap-0.5 rounded-md bg-[color-mix(in_srgb,var(--surface-2)_78%,transparent)] p-0.5',
                className,
            )}
        >
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
        onShortcutHelp,
        suppressAnnotations,
        onSave,
        onRemark,
        saving,
        hasUnsaved,
        canRemark,
    } = state;

    const safeTotal = Math.max(1, totalPages);
    const safePage = Math.max(1, Math.min(pageNumber, safeTotal));
    const [pageInput, setPageInput] = useState(String(safePage));

    useEffect(() => {
        setPageInput(String(safePage));
    }, [safePage]);

    const commitPageInput = () => {
        const requestedPage = Number.parseInt(pageInput, 10);
        if (!Number.isFinite(requestedPage)) {
            setPageInput(String(safePage));
            return;
        }

        onPageChange(Math.max(1, Math.min(safeTotal, requestedPage)));
    };

    return (
        <div className="app-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1" aria-label="Design editor toolbar">
            {!suppressAnnotations ? (
                <>
                    <ToolbarGroup label="Navigation tools">
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

                    <ToolbarGroup label="Annotation tools" className="border-l border-[var(--border)]/75 pl-1.5">
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

                    <ToolbarGroup label="Annotation actions" className="border-l border-[var(--border)]/75 pl-1.5">
                        <ToolButton
                            icon={Save}
                            label={saving ? 'Saving annotations' : 'Save annotations'}
                            hint="Ctrl+S"
                            onPress={() => onSave?.()}
                            isDisabled={!hasUnsaved || saving || !onSave}
                            isPending={saving}
                            statusDot={Boolean(hasUnsaved && !saving)}
                        />
                        <ToolButton
                            icon={Columns3}
                            label="Add or edit remark"
                            onPress={() => onRemark?.()}
                            isDisabled={!canRemark || !onRemark}
                        />
                    </ToolbarGroup>
                </>
            ) : null}

            <div className="ml-auto flex items-center gap-1.5">
                <ToolbarGroup label="Page navigation">
                    <ToolButton
                        icon={ChevronLeft}
                        label="Previous page"
                        hint="Page Up"
                        onPress={() => onPageChange(Math.max(1, safePage - 1))}
                        isDisabled={safePage <= 1}
                    />
                    <span className="flex items-center gap-1 text-[11px] tabular-nums text-[var(--text-muted)]">
                        <Input
                            inputMode="numeric"
                            value={pageInput}
                            onChange={(event) => setPageInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') commitPageInput();
                            }}
                            onBlur={commitPageInput}
                            variant="secondary"
                            aria-label="Go to page"
                            className="h-7 w-10 text-center text-[11px]"
                        />
                        <span className="text-[var(--text-subtle)]">/</span>
                        <strong className="font-semibold text-[var(--foreground)]">{safeTotal}</strong>
                    </span>
                    <ToolButton
                        icon={ChevronRight}
                        label="Next page"
                        hint="Page Down"
                        onPress={() => onPageChange(Math.min(safeTotal, safePage + 1))}
                        isDisabled={safePage >= safeTotal}
                    />
                </ToolbarGroup>

                <ToolbarGroup label="View controls" className="border-l border-[var(--border)]/75 pl-1.5">
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

                <ToolbarGroup label="Editor actions" className="border-l border-[var(--border)]/75 pl-1.5">
                    <ToolButton
                        icon={fullscreen ? Minimize : Maximize}
                        label={fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
                        hint="F"
                        onPress={onFullscreenToggle}
                    />
                    {downloadUrl ? (
                        <ToolButton
                            icon={Download}
                            label="Download current asset"
                            onPress={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
                        />
                    ) : null}
                    {onShortcutHelp ? (
                        <ToolButton
                            icon={CircleHelp}
                            label="Editor shortcuts"
                            hint="?"
                            onPress={onShortcutHelp}
                        />
                    ) : null}
                </ToolbarGroup>
            </div>
        </div>
    );
}
