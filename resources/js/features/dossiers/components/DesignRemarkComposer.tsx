import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, MessageSquarePlus, Pencil, X } from 'lucide-react';
import { Button } from '@heroui/react';
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
    const initialTitle = initialValue?.title ?? '';
    const initialDescription = initialValue?.description ?? '';
    const initialSeverity = initialValue?.severity ?? 'minor';
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [severity, setSeverity] = useState(initialSeverity);
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
                        <p className="truncate text-[11px] font-semibold text-[var(--foreground)]">
                            {mode === 'edit' ? 'Edit remark' : 'Add remark'}
                        </p>
                        <p className="text-[9px] text-[var(--text-subtle)]">Saved directly on this annotation</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-md p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-50"
                    aria-label="Close remark editor"
                >
                    <X size={12} />
                </button>
            </div>

            <input
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
                maxLength={160}
                disabled={saving}
                className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-[11px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/10 disabled:opacity-60"
            />

            <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description (optional)"
                rows={3}
                maxLength={2000}
                disabled={saving}
                className="w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--foreground)] outline-none transition placeholder:text-[var(--text-subtle)] focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/10 disabled:opacity-60"
            />

            <div className="flex flex-wrap gap-1">
                {SEVERITIES.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setSeverity(item.id)}
                        disabled={saving}
                        className={cn(
                            'h-6 rounded-md border px-2 text-[9px] font-semibold transition disabled:opacity-50',
                            severity === item.id
                                ? item.active
                                : 'border-transparent bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]',
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-end gap-1.5 border-t border-[var(--border)] pt-2.5">
                <Button
                    size="sm"
                    variant="ghost"
                    onPress={onCancel}
                    isDisabled={saving}
                    className="h-7 min-w-0 px-2.5 text-[10px]"
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    color="primary"
                    onPress={submit}
                    isDisabled={!title.trim() || saving}
                    className="h-7 min-w-0 gap-1.5 px-2.5 text-[10px]"
                >
                    {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                    {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add remark'}
                </Button>
            </div>
        </div>
    );
}
