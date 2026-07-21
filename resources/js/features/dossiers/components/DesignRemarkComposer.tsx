import { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@heroui/react';
import { cn } from '@/lib/cn';

const SEVERITIES = [
    { id: 'critical', label: 'Critical', color: 'text-red-400 bg-red-400/10' },
    { id: 'major', label: 'Major', color: 'text-amber-400 bg-amber-400/10' },
    { id: 'minor', label: 'Minor', color: 'text-blue-400 bg-blue-400/10' },
    { id: 'cosmetic', label: 'Cosmetic', color: 'text-emerald-400 bg-emerald-400/10' },
    { id: 'question', label: 'Question', color: 'text-[var(--text-muted)] bg-[var(--surface-2)]' },
];

export function DesignRemarkComposer({ onSave, onCancel }: {
    onSave: (data: { title: string; description: string; severity: string }) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('minor');
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => { titleRef.current?.focus(); }, []);

    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-lg min-w-[280px]">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={13} className="text-[var(--accent)]" />
                <span className="text-[11px] font-semibold text-[var(--foreground)]">New remark</span>
            </div>
            <div className="space-y-2">
                <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-subtle)]" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." rows={2} className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-subtle)]" />
                <div className="flex gap-1">
                    {SEVERITIES.map((s) => (
                        <Button key={s.id} size="sm" variant="light"
                            onPress={() => setSeverity(s.id)}
                            className={cn('!px-1.5 !py-0.5 text-[10px] font-medium min-w-0 h-auto',
                                severity === s.id ? s.color : 'text-[var(--text-muted)]')}>
                            {s.label}
                        </Button>
                    ))}
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                    <Button size="sm" variant="bordered" onPress={onCancel}>Cancel</Button>
                    <Button size="sm" color="primary" isDisabled={!title.trim()}
                        onPress={() => onSave({ title: title.trim(), description, severity })}>
                        Save remark
                    </Button>
                </div>
            </div>
        </div>
    );
}
