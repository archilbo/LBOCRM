import { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, Send, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { toast } from 'sonner';

const STEPS = ['Details', 'Files', 'Review', 'Confirm'];

const DISCIPLINES = ['architecture', 'structure', 'mep', 'interior', 'landscape'];

const EXT_TO_ASSET_TYPE: Record<string, string> = {
    dwg: 'source', dxf: 'source', pln: 'source', pla: 'source', rvt: 'source', skp: 'source', rfa: 'source',
    ifc: 'ifc',
    pdf: 'review_pdf',
    png: 'image', jpg: 'image', jpeg: 'image', webp: 'image', tiff: 'image', tif: 'image',
};

interface QueueFile {
    id: string;
    file: File;
    assetType: string;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
}

export function DesignUploadDrawer({ dossierId, folders, isOpen, onOpenChange, onComplete }: {
    dossierId: number; folders: { id: number; name: string }[]; isOpen: boolean; onOpenChange: (o: boolean) => void; onComplete: () => void;
}) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [folderId, setFolderId] = useState<number | null>(null);
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [changeSummary, setChangeSummary] = useState('');
    const [revisionCode, setRevisionCode] = useState('');
    const [note, setNote] = useState('');
    const [submitAction, setSubmitAction] = useState<'draft' | 'submit'>('submit');
    const [queue, setQueue] = useState<QueueFile[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function reset() {
        setStep(0);
        setName(''); setDiscipline(''); setFolderId(null); setCode(''); setDescription('');
        setChangeSummary(''); setRevisionCode(''); setNote(''); setSubmitAction('submit');
        setQueue([]); setSubmitting(false);
    }

    function handleClose(o: boolean) {
        if (!o) {
            if (queue.some((f) => f.status === 'pending' || f.status === 'uploading')) {
                if (!confirm('You have files queued. Close anyway?')) return;
            }
            reset();
        }
        onOpenChange(o);
    }

    function canNext(): boolean {
        if (step === 0) return name.trim().length > 0 && discipline.length > 0;
        if (step === 1) return queue.length > 0;
        if (step === 2) return true;
        return false;
    }

    function classifyAssetType(ext: string): string {
        return EXT_TO_ASSET_TYPE[ext] ?? 'supporting';
    }

    function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = e.target.files;
        if (!fileList) return;
        const newFiles: QueueFile[] = [];
        for (const file of Array.from(fileList)) {
            const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (!queue.some((f) => f.file.name === file.name && f.file.size === file.size)) {
                newFiles.push({ id: crypto.randomUUID(), file, assetType: classifyAssetType(ext), progress: 0, status: 'pending' });
            }
        }
        setQueue((prev) => [...prev, ...newFiles]);
        e.target.value = '';
    }

    function removeFile(id: string) {
        setQueue((prev) => prev.filter((f) => f.id !== id));
    }

    function retryFile(id: string) {
        setQueue((prev) => prev.map((f) => f.id === id ? { ...f, status: 'pending', progress: 0, error: undefined } : f));
    }

    const hasPending = queue.some((f) => f.status === 'pending');
    const hasErrors = queue.some((f) => f.status === 'error');

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const baseUrl = `/dossiers/${dossierId}/project-design`;

            const fileRes = await fetch(`${baseUrl}/files`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token, 'Accept': 'application/json' },
                body: JSON.stringify({
                    folder_id: folderId ?? undefined,
                    name: name.trim(),
                    code: code || undefined,
                    description: description || undefined,
                    discipline,
                }),
            });

            if (!fileRes.ok) {
                let msg = 'Failed to create file';
                try { const b = await fileRes.json(); msg = b.message ?? msg; } catch {}
                throw new Error(msg);
            }

            const fileData = await fileRes.json();
            const fileId = fileData.id;

            const formData = new FormData();
            formData.append('intent', submitAction);

            if (changeSummary) formData.append('change_summary', changeSummary);
            if (revisionCode) formData.append('revision_code', revisionCode);
            if (note) formData.append('note', note);

            for (let i = 0; i < queue.length; i++) {
                const item = queue[i];
                formData.append('files[]', item.file);
                formData.append(`asset_types[${i}]`, item.assetType);
            }

            setQueue((prev) => prev.map((f) => f.status === 'pending' ? { ...f, status: 'uploading' } : f));

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${baseUrl}/files/${fileId}/versions`);

                xhr.setRequestHeader('X-CSRF-TOKEN', token);
                xhr.setRequestHeader('Accept', 'application/json');

                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded / e.total) * 100);
                        setQueue((prev) => prev.map((f) => f.status === 'uploading' ? { ...f, progress: pct } : f));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setQueue((prev) => prev.map((f) => ({ ...f, status: 'done' as const, progress: 100 })));
                        resolve();
                    } else {
                        let msg = 'Upload failed';
                        try { const b = JSON.parse(xhr.responseText); msg = b.message ?? msg; } catch {}
                        reject(new Error(msg));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Network error')));

                xhr.send(formData);
            });

            toast.success('File uploaded successfully.');
            reset();
            onOpenChange(false);
            onComplete();
        } catch (err) {
            setQueue((prev) => prev.map((f) => f.status === 'uploading' ? { ...f, status: 'error', error: (err as Error)?.message ?? 'Upload failed' } : f));
            toast.error((err as Error)?.message ?? 'Upload failed.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppDrawer isOpen={isOpen} onOpenChange={handleClose} title="Upload design" description="Create a new design file or version">
            <div className="space-y-5">
                <div className="flex gap-1">
                    {STEPS.map((s, i) => (
                        <div key={s} className={cn('flex-1 h-1 rounded-full transition', i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]')} />
                    ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Step {step + 1} of {STEPS.length}</span>
                    <span className="font-medium text-[var(--foreground)]">{STEPS[step]}</span>
                </div>

                {step === 0 && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-[11px] font-medium text-[var(--text-muted)]">File name *</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ground floor plan"
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" aria-label="File name" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-[11px] font-medium text-[var(--text-muted)]">Discipline *</label>
                                <select value={discipline} onChange={(e) => setDiscipline(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" aria-label="Discipline">
                                    <option value="">Select...</option>
                                    {DISCIPLINES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-[var(--text-muted)]">Folder</label>
                                <select value={folderId ?? ''} onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : null)}
                                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" aria-label="Folder">
                                    <option value="">None</option>
                                    {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-[11px] font-medium text-[var(--text-muted)]">Code</label>
                                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. A-101"
                                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" aria-label="Code" />
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-[var(--text-muted)]">Description</label>
                                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description"
                                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" aria-label="Description" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-3">
                        <button type="button" onClick={() => inputRef.current?.click()}
                            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] p-6 text-center transition hover:border-[var(--accent)]/50 hover:bg-[var(--surface-2)]">
                            <Upload size={24} className="text-[var(--text-muted)]" />
                            <div>
                                <p className="text-[13px] font-medium text-[var(--foreground)]">Click to select files</p>
                                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">DWG, PDF, PNG, JPG, DXF, RVT, IFC, DOCX, XLSX, ZIP</p>
                            </div>
                        </button>
                        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles}
                            accept=".dwg,.dxf,.pdf,.png,.jpg,.jpeg,.webp,.tiff,.tif,.pln,.pla,.rvt,.skp,.ifc,.rfa,.doc,.docx,.xls,.xlsx,.csv,.zip" />

                        {queue.length > 0 && (
                            <div className="max-h-48 space-y-1 overflow-y-auto">
                                {queue.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-[var(--surface-2)]">
                                            {item.status === 'done' ? <CheckCircle2 size={12} className="text-emerald-400" /> :
                                             item.status === 'error' ? <AlertCircle size={12} className="text-red-400" /> :
                                             item.status === 'uploading' ? <Loader2 size={12} className="animate-spin text-[var(--accent)]" /> :
                                             <File size={12} className="text-[var(--text-muted)]" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{item.file.name}</p>
                                                <span className={cn('shrink-0 rounded px-1 py-0.5 text-[9px] font-medium leading-none',
                                                    item.assetType === 'source' ? 'bg-blue-400/10 text-blue-400' :
                                                    item.assetType === 'ifc' ? 'bg-orange-400/10 text-orange-400' :
                                                    item.assetType === 'review_pdf' ? 'bg-emerald-400/10 text-emerald-400' :
                                                    item.assetType === 'image' ? 'bg-purple-400/10 text-purple-400' :
                                                    'bg-amber-400/10 text-amber-400')}>
                                                    {item.assetType.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {(item.status === 'uploading') && (
                                                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                                                    <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${item.progress}%` }} />
                                                </div>
                                            )}
                                            {item.status === 'error' && item.error && (
                                                <p className="text-[10px] text-red-400">{item.error}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {item.status === 'error' && (
                                                <button type="button" onClick={() => retryFile(item.id)}
                                                    className="flex size-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-[var(--accent)]" title="Retry" aria-label="Retry upload">
                                                    <RefreshCw size={11} />
                                                </button>
                                            )}
                                            {item.status !== 'uploading' && item.status !== 'done' && (
                                                <button type="button" onClick={() => removeFile(item.id)}
                                                    className="flex size-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-red-400" title="Remove" aria-label="Remove file">
                                                    <X size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-[11px] font-medium text-[var(--text-muted)]">Change summary</label>
                            <textarea value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} rows={2} placeholder="What changed in this revision?"
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)] resize-none" aria-label="Change summary" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-[11px] font-medium text-[var(--text-muted)]">Revision code</label>
                                <input value={revisionCode} onChange={(e) => setRevisionCode(e.target.value)} placeholder="e.g. A"
                                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" aria-label="Revision code" />
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-[var(--text-muted)]">Internal note</label>
                                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for internal use"
                                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]" aria-label="Note" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-[var(--text-muted)]">After upload</label>
                            <div className="mt-1 flex gap-2">
                                <button type="button" onClick={() => setSubmitAction('draft')}
                                    className={cn('flex-1 rounded-lg border px-3 py-2 text-[12px] font-medium transition',
                                        submitAction === 'draft' ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50')}>
                                    <Save size={13} className="inline mr-1" /> Save draft
                                </button>
                                <button type="button" onClick={() => setSubmitAction('submit')}
                                    className={cn('flex-1 rounded-lg border px-3 py-2 text-[12px] font-medium transition',
                                        submitAction === 'submit' ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50')}>
                                    <Send size={13} className="inline mr-1" /> Submit for review
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-3">
                        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[12px]">
                                <div><span className="text-[var(--text-muted)]">Name:</span> <span className="font-medium text-[var(--foreground)]">{name}</span></div>
                                <div><span className="text-[var(--text-muted)]">Discipline:</span> <span className="font-medium text-[var(--foreground)] capitalize">{discipline}</span></div>
                                <div><span className="text-[var(--text-muted)]">Folder:</span> <span className="font-medium text-[var(--foreground)]">{folders.find((f) => f.id === folderId)?.name ?? '-'}</span></div>
                                <div><span className="text-[var(--text-muted)]">Code:</span> <span className="font-medium text-[var(--foreground)]">{code || '-'}</span></div>
                            </div>
                            <div className="border-t border-[var(--border)] pt-2">
                                <p className="text-[11px] text-[var(--text-muted)]">Files ({queue.length})</p>
                                <ul className="mt-1 space-y-0.5">
                                    {queue.map((f) => (
                                        <li key={f.id} className="flex items-center gap-1.5 text-[11px]">
                                            <span className="text-[var(--foreground)]">{f.file.name}</span>
                                            <span className={cn('rounded px-1 text-[9px] font-medium',
                                                f.assetType === 'source' ? 'bg-blue-400/10 text-blue-400' :
                                                f.assetType === 'ifc' ? 'bg-orange-400/10 text-orange-400' :
                                                f.assetType === 'review_pdf' ? 'bg-emerald-400/10 text-emerald-400' :
                                                f.assetType === 'image' ? 'bg-purple-400/10 text-purple-400' :
                                                'bg-amber-400/10 text-amber-400')}>
                                                {f.assetType.replace('_', ' ')}
                                            </span>
                                            <span className="text-[var(--text-subtle)]">({(f.file.size / 1024).toFixed(0)} KB)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-t border-[var(--border)] pt-2">
                                <p className="text-[11px] text-[var(--text-muted)]">Action: <span className="font-medium text-[var(--foreground)]">{submitAction === 'draft' ? 'Save as draft' : 'Submit for review'}</span></p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-2">
                        <AppButton variant="bordered" size="sm" className="h-8 text-[11px]" isDisabled={step === 0 || submitting}
                            onPress={() => setStep((s) => s - 1)}>
                            <ChevronLeft size={13} /> Back
                        </AppButton>
                    </div>

                    {step < STEPS.length - 1 ? (
                        <AppButton size="sm" className="h-8 text-[11px]" isDisabled={!canNext()} onPress={() => setStep((s) => s + 1)}>
                            Next <ChevronRight size={13} />
                        </AppButton>
                    ) : (
                        <AppButton size="sm" className="h-8 text-[11px]" isDisabled={submitting || hasErrors} onPress={handleSubmit}>
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : submitAction === 'draft' ? <Save size={13} /> : <Send size={13} />}
                            {' '}{submitting ? 'Uploading...' : submitAction === 'draft' ? 'Save draft' : 'Upload & submit'}
                        </AppButton>
                    )}
                </div>
            </div>
        </AppDrawer>
    );
}
