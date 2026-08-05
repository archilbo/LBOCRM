import { IconArrowUpRight, IconCircle, IconCloud, IconHandStop, IconHighlight, IconMinus, IconPointer, IconPencil, IconPinned, IconDeviceFloppy, IconSquare } from '@tabler/icons-react';

import { Button, Tooltip } from '@heroui/react';
import { cn } from '@/lib/cn';
import type { AnnotationTool } from '@/features/project-design/components/ProjectDesignEditorToolbar';

const TOOLS: { id: AnnotationTool; icon: typeof IconPinned; label: string }[] = [
    { id: 'select', icon: IconPointer, label: 'Select annotation' },
    { id: 'pan', icon: IconHandStop, label: 'Pan drawing' },
    { id: 'pin', icon: IconPinned, label: 'Place pin' },
    { id: 'rectangle', icon: IconSquare, label: 'Rectangle' },
    { id: 'ellipse', icon: IconCircle, label: 'Ellipse' },
    { id: 'arrow', icon: IconArrowUpRight, label: 'Arrow' },
    { id: 'line', icon: IconMinus, label: 'Line' },
    { id: 'cloud', icon: IconCloud, label: 'Revision cloud' },
    { id: 'freehand', icon: IconPencil, label: 'Freehand' },
    { id: 'highlight', icon: IconHighlight, label: 'Highlight' },
];

function ToolbarButton({
    label,
    active,
    onPress,
    children,
    isDisabled,
    isPending,
    statusDot,
}: {
    label: string;
    active?: boolean;
    onPress: () => void;
    children: React.ReactNode;
    isDisabled?: boolean;
    isPending?: boolean;
    statusDot?: boolean;
}) {
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
                        'relative h-7 w-7 min-w-0 rounded-md border border-transparent',
                        active
                            ? 'border-[var(--accent)]/35 bg-[var(--accent)]/12 text-[var(--accent)]'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                    )}
                >
                    {!isPending ? children : null}
                    {statusDot ? <span className="absolute right-1 top-1 size-1.5 rounded-full bg-amber-400" /> : null}
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip>
    );
}

export function DesignAnnotationToolbar({
    activeTool,
    onToolChange,
    onSave,
    saving,
    hasUnsaved,
}: {
    activeTool: AnnotationTool;
    onToolChange: (tool: AnnotationTool) => void;
    onSave: () => void;
    saving?: boolean;
    hasUnsaved: boolean;
}) {
    return (
        <div className="flex min-w-0 items-center gap-1">
            <div className="app-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/35 p-0.5">
                {TOOLS.map(({ id, icon: Icon, label }) => (
                    <ToolbarButton
                        key={id}
                        label={label}
                        active={activeTool === id}
                        onPress={() => onToolChange(id)}
                    >
                        <Icon size={13} />
                    </ToolbarButton>
                ))}
            </div>
            <ToolbarButton
                label={saving ? 'Saving annotations' : 'IconDeviceFloppy annotations'}
                onPress={onSave}
                isDisabled={!hasUnsaved || saving}
                isPending={saving}
                statusDot={hasUnsaved && !saving}
            >
                <IconDeviceFloppy size={13} />
            </ToolbarButton>
        </div>
    );
}
