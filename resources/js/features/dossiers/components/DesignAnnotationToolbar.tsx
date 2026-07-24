import { MousePointer2, Pin, Square, ArrowUpRight, Cloud, Pencil, Type, Highlighter, Loader2, Circle, Minus, Hand } from 'lucide-react';
import { Button } from '@heroui/react';
import { cn } from '@/lib/cn';

export type AnnotationTool = 'select' | 'pan' | 'pin' | 'rectangle' | 'arrow' | 'cloud' | 'freehand' | 'text' | 'highlight' | 'ellipse' | 'line';

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

export function DesignAnnotationToolbar({ activeTool, onToolChange, onSave, saving, hasUnsaved }: {
    activeTool: AnnotationTool; onToolChange: (t: AnnotationTool) => void; onSave: () => void; saving?: boolean; hasUnsaved: boolean;
}) {
    return (
        <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-sm">
            {TOOLS.map((t) => (
                <Button key={t.id} isIconOnly size="sm" variant="ghost"
                    onPress={() => onToolChange(t.id)}
                    className={cn(activeTool === t.id ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)]')}
                    aria-label={t.label}>
                    <t.icon size={13} />
                </Button>
            ))}
            <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />
            <Button size="sm" variant="ghost" isDisabled={!hasUnsaved || saving}
                onPress={onSave}
                className={cn(hasUnsaved ? 'text-emerald-400' : 'text-[var(--text-subtle)]')}
                startContent={saving ? <Loader2 size={11} className="animate-spin" /> : undefined}>
                {saving ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
}
