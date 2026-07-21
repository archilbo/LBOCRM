import { useCallback, useRef, useState } from 'react';
import { HardDrive, FileType, Layers, Upload, X, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type UploadZone = 'source' | 'review' | 'supporting';

const ZONES: { id: UploadZone; label: string; description: string; icon: typeof HardDrive; accept: string }[] = [
    { id: 'source', label: 'Source files', description: 'DWG, DXF, plans directeurs', icon: HardDrive, accept: '.dwg,.dxf,.pdf,.png,.jpg,.jpeg,.tiff,.tif' },
    { id: 'review', label: 'Review files', description: 'PDFs, images pour revue', icon: FileType, accept: '.pdf,.png,.jpg,.jpeg' },
    { id: 'supporting', label: 'Supporting files', description: 'Rapports, documents, notes', icon: Layers, accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg' },
];

interface UploadItem {
    id: string;
    name: string;
    type: UploadZone;
    fileId?: number;
    progress: number;
    status: 'creating' | 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
    xhr?: XMLHttpRequest;
}

async function createFileRecord(dossierId: number, name: string, type: UploadZone): Promise<number> {
    const res = await fetch('/dossiers/design/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ dossier_id: dossierId, name, type }),
    });
    if (!res.ok) throw new Error('Failed to create file record');
    const data = await res.json();
    return data.id;
}

export function DesignUploadZone({ dossierId, onUploadComplete }: { dossierId: number; onUploadComplete: () => void }) {
    const [activeZone, setActiveZone] = useState<UploadZone | null>(null);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const startUpload = useCallback(async (file: File, zone: UploadZone) => {
        const id = crypto.randomUUID();
        const item: UploadItem = { id, name: file.name, type: zone, progress: 0, status: 'creating' };
        setUploads((prev) => [...prev, item]);

        try {
            const fileId = await createFileRecord(dossierId, file.name, zone);
            setUploads((prev) => prev.map((u) => u.id === id ? { ...u, fileId, status: 'uploading' } : u));

            await new Promise<void>((resolve, reject) => {
                const formData = new FormData();
                formData.append('file_id', String(fileId));
                formData.append('file', file);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/dossiers/design/versions');
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded / e.total) * 100);
                        setUploads((prev) => prev.map((u) => u.id === id ? { ...u, progress: pct } : u));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: 'done', progress: 100 } : u));
                        onUploadComplete();
                        resolve();
                    } else {
                        const msg = xhr.status === 409 ? 'Duplicate' : 'Upload failed';
                        setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: 'error', error: msg } : u));
                        reject(new Error(msg));
                    }
                };

                xhr.onerror = () => {
                    setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: 'error', error: 'Network error' } : u));
                    reject(new Error('Network error'));
                };

                setUploads((prev) => prev.map((u) => u.id === id ? { ...u, xhr } : u));
                xhr.send(formData);
            });
        } catch {
            setUploads((prev) => prev.map((u) => u.id === id && u.status !== 'done' ? { ...u, status: 'error', error: 'Failed' } : u));
        }
    }, [dossierId, onUploadComplete]);

    const handleFiles = useCallback((zone: UploadZone, files: FileList) => {
        for (const file of Array.from(files)) {
            startUpload(file, zone);
        }
    }, [startUpload]);

    function cancel(item: UploadItem) {
        if (item.xhr) item.xhr.abort();
        setUploads((prev) => prev.filter((u) => u.id !== item.id));
    }

    function retry(item: UploadItem) {
        setUploads((prev) => prev.filter((u) => u.id !== item.id));
    }

    function handleZoneClick(zone: UploadZone) {
        setActiveZone(zone);
        setTimeout(() => inputRef.current?.click(), 50);
    }

    return (
        <div>
            <div className="grid gap-3 sm:grid-cols-3">
                {ZONES.map((zone) => (
                    <button key={zone.id} type="button" onClick={() => handleZoneClick(zone.id)}
                        className={cn(
                            'flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition',
                            activeZone === zone.id ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-2)]',
                        )}>
                        <zone.icon size={24} className="text-[var(--text-muted)]" />
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">{zone.label}</p>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{zone.description}</p>
                        </div>
                    </button>
                ))}
            </div>
            <input ref={inputRef} type="file" multiple className="hidden"
                accept={activeZone ? ZONES.find((z) => z.id === activeZone)?.accept : undefined}
                onChange={(e) => { if (e.target.files && activeZone) { handleFiles(activeZone, e.target.files); e.target.value = ''; } }} />

            {uploads.length > 0 && (
                <div className="mt-4 space-y-1.5">
                    {uploads.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)]">
                                {item.status === 'done' ? <CheckCircle2 size={13} className="text-emerald-400" /> :
                                 item.status === 'error' ? <AlertCircle size={13} className="text-red-400" /> :
                                 item.status === 'uploading' || item.status === 'creating' ? <Loader2 size={13} className="animate-spin text-[var(--accent)]" /> :
                                 <Upload size={13} className="text-[var(--text-muted)]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{item.name}</p>
                                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                                    <div className={cn('h-full rounded-full transition-all', item.status === 'done' ? 'bg-emerald-400' : item.status === 'error' ? 'bg-red-400' : 'bg-[var(--accent)]')}
                                        style={{ width: `${item.progress}%` }} />
                                </div>
                                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                    {item.status === 'creating' ? 'Creating...' :
                                     item.status === 'done' ? 'Uploaded' :
                                     item.status === 'error' ? (item.error || 'Failed') :
                                     item.status === 'uploading' ? `${item.progress}%` : 'Pending...'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {item.status === 'error' && (
                                    <button type="button" onClick={() => retry(item)}
                                        className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
                                        title="Retry">
                                        <RefreshCw size={13} />
                                    </button>
                                )}
                                {item.status !== 'uploading' && item.status !== 'creating' && (
                                    <button type="button" onClick={() => cancel(item)}
                                        className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-red-400/10 hover:text-red-400"
                                        title="Remove">
                                        <X size={13} />
                                    </button>
                                )}
                                {(item.status === 'uploading' || item.status === 'creating') && (
                                    <button type="button" onClick={() => cancel(item)}
                                        className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-red-400/10 hover:text-red-400"
                                        title="Cancel">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
