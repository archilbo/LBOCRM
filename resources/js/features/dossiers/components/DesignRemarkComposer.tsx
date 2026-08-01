import { useEffect, useRef, useState } from 'react';
import { Button, Input, TextArea, Tooltip } from '@heroui/react';
import { Check, MessageSquarePlus, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type DesignRemarkDraft = {
    title: string;
    description: string;
    severity: string;
};

type DesignRemarkComposerProps = {
    mode?: 'create' | 'edit';
    initialValue?: Partial<DesignRemarkDraft>;
    saving?: boolean;
    onSave: (data: DesignRemarkDraft) => void;
    onCancel: () => void;
};

const SEVERITIES = [
    { id: 'critical', label: 'Critical', active: 'border-red-400/50 bg-red-400/12 text-red-300' },
    { id: 'major', label: 'Major', active: 'border-orange-400/50 bg-orange-400/12 text-orange-300' },
    { id: 'minor', label: 'Minor', active: 'border-amber-400/50 bg-amber-400/12 text-amber-300' },
    { id: 'cosmetic', label: 'Cosmetic', active: 'border-blue-400/50 bg-blue-400/12 text-blue-300' },
    { id: 'question', label: 'Question', active: 'border-purple-400/50 bg-purple-400/12 text-purple-300' },
] as const;

export function DesignRemarkComposer({
    mode = 'create',
    initialValue,
    saving = false,
    onSave,
    onCancel,
}: DesignRemarkComposerProps) {
    const [title, setTitle] = useState(initialValue?.title ?? '');
    const [description, setDescription] = useState(initialValue?.description ?? '');
    const [severity, setSeverity] = useState(initialValue?.severity ?? 'minor');
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => titleRef.current?.focus());
        return () => window.cancelAnimationFrame(frame);
    }, []);

    const submit = () => {
        const cleanTitle = title.trim();
        if (!cleanTitle || saving) return;
        onSave({
            title: cleanTitle,
            description: description.trim(),
            severity,
        });
    };

    return (
        <div className="space-y-2.5" data-project-design-remark-editor>
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/12 text-[var(--accent)]">
                        {mode === 'edit' ? <Pencil size={12} /> : <MessageSquarePlus size={12} />}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold text-[var(--foreground)]">
                            {mode === 'edit' ? 'Edit remark' : 'Add remark'}
                        </p>
                        <p className="text-[9px] text-[var(--text-subtle)]">Saved on this annotation</p>
                    </div>
                </div>
                <Tooltip delay={350}>
                    <Tooltip.Trigger>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            onPress={onCancel}
                            isDisabled={saving}
                            className="h-7 w-7 min-w-0 text-[var(--text-muted)]"
                            aria-label="Close remark editor"
                        >
                            <X size={12} />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>Close</Tooltip.Content>
                </Tooltip>
            </div>

            <Input
                ref={titleRef}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        submit();
                    }
                }}
                placeholder="Remark title"
                aria-label="Remark title"
                maxLength={160}
                isDisabled={saving}
                variant="secondary"
                fullWidth
                className="h-8 text-[10px]"
            />

            <TextArea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description (optional)"
                aria-label="Remark description"
                rows={3}
                maxLength={2000}
                isDisabled={saving}
                variant="secondary"
                fullWidth
                className="min-h-20 resize-none text-[10px] leading-relaxed"
            />

            <div className="flex flex-wrap gap-1" role="group" aria-label="Remark severity">
                {SEVERITIES.map((item) => (
                    <Button
                        key={item.id}
                        size="sm"
                        variant="ghost"
                        onPress={() => setSeverity(item.id)}
                        isDisabled={saving}
                        aria-pressed={severity === item.id}
                        className={cn(
                            'h-6 min-w-0 rounded-md border px-2 text-[9px] font-semibold',
                            severity === item.id
                                ? item.active
                                : 'border-transparent bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]',
                        )}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            <div className="flex items-center justify-end gap-1.5 border-t border-[var(--border)] pt-2.5">
                <Button
                    size="sm"
                    variant="ghost"
                    onPress={onCancel}
                    isDisabled={saving}
                    className="h-7 min-w-0 px-2.5 text-[9px]"
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    variant="primary"
                    onPress={submit}
                    isDisabled={!title.trim() || saving}
                    isPending={saving}
                    className="h-7 min-w-0 gap-1.5 px-2.5 text-[9px]"
                >
                    {!saving ? <Check size={11} /> : null}
                    {mode === 'edit' ? 'Save changes' : 'Add remark'}
                </Button>
            </div>
        </div>
    );
}
