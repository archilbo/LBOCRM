import { useRef, useState, type ChangeEvent } from 'react';
import {
    Button,
    Card,
    Chip,
    Drawer,
    Input,
    ListBox,
    Select,
    TextArea,
    Tooltip,
} from '@heroui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
    AlertCircle,
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
    Loader2,
    RefreshCw,
    Save,
    Send,
    Upload,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { projectDesignKeys } from '@/features/project-design/api/projectDesignKeys';

const STEPS = ['Details', 'Files', 'Review', 'Confirm'] as const;
const DISCIPLINES = ['architecture', 'structure', 'mep', 'interior', 'landscape'] as const;
const EXT_TO_ASSET_TYPE: Record<string, string> = {
    dwg: 'source',
    dxf: 'source',
    pln: 'source',
    pla: 'source',
    rvt: 'source',
    skp: 'source',
    rfa: 'source',
    ifc: 'ifc',
    pdf: 'review_pdf',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    webp: 'image',
    tiff: 'image',
    tif: 'image',
};

type SubmitAction = 'draft' | 'submit';
type QueueStatus = 'pending' | 'uploading' | 'done' | 'error';

interface QueueFile {
    id: string;
    file: File;
    assetType: string;
    progress: number;
    status: QueueStatus;
    error?: string;
}

function assetTone(assetType: string): string {
    if (assetType === 'source') return 'bg-blue-500/10 text-blue-300';
    if (assetType === 'ifc') return 'bg-orange-500/10 text-orange-300';
    if (assetType === 'review_pdf') return 'bg-emerald-500/10 text-emerald-300';
    if (assetType === 'image') return 'bg-violet-500/10 text-violet-300';
    return 'bg-amber-500/10 text-amber-300';
}

function IconAction({
    label,
    children,
    onPress,
    tone = 'default',
}: {
    label: string;
    children: React.ReactNode;
    onPress: () => void;
    tone?: 'default' | 'danger';
}) {
    return (
        <Tooltip delay={350}>
            <Tooltip.Trigger>
                <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    onPress={onPress}
                    aria-label={label}
                    className={cn(
                        'h-7 w-7 min-w-0 rounded-lg',
                        tone === 'danger'
                            ? 'text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-300'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                    )}
                >
                    {children}
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip>
    );
}

function QueueRow({
    item,
    onRemove,
    onRetry,
}: {
    item: QueueFile;
    onRemove: () => void;
    onRetry: () => void;
}) {
    return (
        <Card variant="secondary" className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/35">
            <Card.Content className="p-2.5">
                <div className="flex items-start gap-2">
                    <span className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                        item.status === 'done'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : item.status === 'error'
                                ? 'bg-red-500/10 text-red-300'
                                : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                    )}>
                        {item.status === 'uploading' ? <Loader2 size={14} className="animate-spin" /> : null}
                        {item.status === 'done' ? <Check size={14} /> : null}
                        {item.status === 'error' ? <AlertCircle size={14} /> : null}
                        {item.status === 'pending' ? <FileText size={14} /> : null}
                    </span>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-medium text-[var(--foreground)]">{item.file.name}</p>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <Chip size="sm" variant="soft" className={cn('h-4 px-1 text-[8px] capitalize', assetTone(item.assetType))}>
                                        {item.assetType.replace(/_/g, ' ')}
                                    </Chip>
                                    <span className="text-[8px] text-[var(--text-subtle)]">
                                        {(item.file.size / 1024).toFixed(0)} KB
                                    </span>
                                </div>
                            </div>

                            {item.status === 'error' ? (
                                <IconAction label="Retry upload" onPress={onRetry}>
                                    <RefreshCw size={12} />
                                </IconAction>
                            ) : null}
                            {item.status !== 'uploading' && item.status !== 'done' ? (
                                <IconAction label="Remove file" onPress={onRemove} tone="danger">
                                    <X size={12} />
                                </IconAction>
                            ) : null}
                        </div>

                        {item.status === 'uploading' ? (
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                                <div
                                    className="h-full rounded-full bg-[var(--accent)] transition-[width]"
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        ) : null}
                        {item.status === 'error' && item.error ? (
                            <p className="mt-1.5 text-[9px] leading-4 text-red-300">{item.error}</p>
                        ) : null}
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}

export function DesignUploadDrawer({
    dossierId,
    folders,
    isOpen,
    onOpenChange,
    onComplete,
    portalContainer,
}: {
    dossierId: number;
    folders: { id: number; name: string }[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
    portalContainer?: HTMLElement | null;
}) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [discipline, setDiscipline] = useState('');
    const [folderId, setFolderId] = useState<number | null>(null);
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [changeSummary, setChangeSummary] = useState('');
    const [revisionCode, setRevisionCode] = useState('');
    const [note, setNote] = useState('');
    const [submitAction, setSubmitAction] = useState<SubmitAction>('submit');
    const [queue, setQueue] = useState<QueueFile[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function reset() {
        setStep(0);
        setName('');
        setDiscipline('');
        setFolderId(null);
        setCode('');
        setDescription('');
        setChangeSummary('');
        setRevisionCode('');
        setNote('');
        setSubmitAction('submit');
        setQueue([]);
        setSubmitting(false);
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            const hasActiveQueue = queue.some((item) => item.status === 'pending' || item.status === 'uploading');
            if (hasActiveQueue && !window.confirm('You have files queued. Close anyway?')) return;
            reset();
        }
        onOpenChange(open);
    }

    function canNext(): boolean {
        if (step === 0) return name.trim().length > 0 && discipline.length > 0;
        if (step === 1) return queue.length > 0;
        if (step === 2) return true;
        return false;
    }

    function classifyAssetType(extension: string): string {
        return EXT_TO_ASSET_TYPE[extension] ?? 'supporting';
    }

    function handleFiles(event: ChangeEvent<HTMLInputElement>) {
        const fileList = event.target.files;
        if (!fileList) return;

        const additions: QueueFile[] = [];
        for (const file of Array.from(fileList)) {
            const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
            const duplicate = queue.some((item) => item.file.name === file.name && item.file.size === file.size);
            if (!duplicate) {
                additions.push({
                    id: crypto.randomUUID(),
                    file,
                    assetType: classifyAssetType(extension),
                    progress: 0,
                    status: 'pending',
                });
            }
        }

        setQueue((current) => [...current, ...additions]);
        event.target.value = '';
    }

    function removeFile(id: string) {
        setQueue((current) => current.filter((item) => item.id !== id));
    }

    function retryFile(id: string) {
        setQueue((current) => current.map((item) => (
            item.id === id
                ? { ...item, status: 'pending', progress: 0, error: undefined }
                : item
        )));
    }

    async function handleSubmit() {
        if (submitting) return;
        setSubmitting(true);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const baseUrl = `/dossiers/${dossierId}/project-design`;
            const fileResponse = await fetch(`${baseUrl}/files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    folder_id: folderId ?? undefined,
                    name: name.trim(),
                    code: code || undefined,
                    description: description || undefined,
                    discipline,
                }),
            });

            if (!fileResponse.ok) {
                let message = 'Failed to create file';
                try {
                    const body = await fileResponse.json() as { message?: string };
                    message = body.message ?? message;
                } catch {
                    // Keep the fallback message.
                }
                throw new Error(message);
            }

            const fileData = await fileResponse.json() as { id?: number; data?: { id?: number } };
            const fileId = fileData.id ?? fileData.data?.id;
            if (!fileId) throw new Error('The server did not return the created file identifier.');

            const formData = new FormData();
            formData.append('intent', submitAction);
            if (changeSummary) formData.append('change_summary', changeSummary);
            if (revisionCode) formData.append('revision_code', revisionCode);
            if (note) formData.append('note', note);

            queue.forEach((item, index) => {
                formData.append('files[]', item.file);
                formData.append(`asset_types[${index}]`, item.assetType);
            });

            setQueue((current) => current.map((item) => (
                item.status === 'pending' ? { ...item, status: 'uploading' } : item
            )));

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${baseUrl}/files/${fileId}/versions`);
                xhr.setRequestHeader('X-CSRF-TOKEN', token);
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.upload.addEventListener('progress', (event) => {
                    if (!event.lengthComputable) return;
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setQueue((current) => current.map((item) => (
                        item.status === 'uploading' ? { ...item, progress } : item
                    )));
                });
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setQueue((current) => current.map((item) => ({ ...item, status: 'done', progress: 100 })));
                        resolve();
                        return;
                    }

                    let message = 'Upload failed';
                    try {
                        const body = JSON.parse(xhr.responseText) as { message?: string };
                        message = body.message ?? message;
                    } catch {
                        // Keep the fallback message.
                    }
                    reject(new Error(message));
                });
                xhr.addEventListener('error', () => reject(new Error('Network error')));
                xhr.send(formData);
            });

            await queryClient.invalidateQueries({ queryKey: projectDesignKeys.all(dossierId) });
            toast.success('Design file uploaded successfully.');
            reset();
            onOpenChange(false);
            onComplete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed.';
            setQueue((current) => current.map((item) => (
                item.status === 'uploading'
                    ? { ...item, status: 'error', error: message }
                    : item
            )));
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    const hasErrors = queue.some((item) => item.status === 'error');

    return (
        <Drawer>
            <Drawer.Backdrop
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                variant="blur"
                isDismissable={!submitting}
                UNSTABLE_portalContainer={portalContainer ?? undefined}
                className="z-[180] bg-black/65"
            >
                <Drawer.Content placement="right" className="z-[181] p-0">
                    <Drawer.Dialog
                        aria-label="Upload design file"
                        className="flex h-dvh w-screen max-w-[620px] flex-col overflow-hidden rounded-none border-l border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[-24px_0_70px_rgb(0_0_0_/_0.4)]"
                    >
                        <Drawer.Header className="relative shrink-0 border-b border-[var(--border)] px-5 py-4 pr-14">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]">
                                    <Upload size={17} />
                                </span>
                                <div className="min-w-0">
                                    <Drawer.Heading className="text-sm font-semibold text-[var(--foreground)]">Upload design file</Drawer.Heading>
                                    <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Create the file record and upload its first revision.</p>
                                </div>
                            </div>
                            <Drawer.CloseTrigger
                                aria-label="Close upload drawer"
                                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] outline-none transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                            >
                                <X size={15} />
                            </Drawer.CloseTrigger>
                        </Drawer.Header>

                        <div className="shrink-0 border-b border-[var(--border)] px-5 py-3">
                            <div className="grid grid-cols-4 gap-1.5">
                                {STEPS.map((label, index) => (
                                    <div key={label} className="min-w-0">
                                        <div className={cn(
                                            'h-1 rounded-full transition-colors',
                                            index <= step ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]',
                                        )} />
                                        <p className={cn(
                                            'mt-1 truncate text-[8px] font-medium',
                                            index === step ? 'text-[var(--foreground)]' : 'text-[var(--text-subtle)]',
                                        )}>
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Drawer.Body className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
                            {step === 0 ? (
                                <div className="space-y-3">
                                    <Input
                                        label="File name"
                                        isRequired
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Ground floor plan"
                                        variant="secondary"
                                        fullWidth
                                    />
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Select
                                            aria-label="Discipline"
                                            placeholder="Discipline"
                                            value={discipline || null}
                                            onChange={(key) => setDiscipline(key ? String(key) : '')}
                                            fullWidth
                                            variant="secondary"
                                        >
                                            <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                            <Select.Popover className="z-[190] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                                                <ListBox>
                                                    {DISCIPLINES.map((item) => (
                                                        <ListBox.Item key={item} id={item} textValue={item} className="rounded-lg px-2 py-1.5 text-[11px] capitalize">
                                                            {item}
                                                        </ListBox.Item>
                                                    ))}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                        <Select
                                            aria-label="Folder"
                                            placeholder="Folder"
                                            value={folderId == null ? '__none__' : String(folderId)}
                                            onChange={(key) => setFolderId(!key || key === '__none__' ? null : Number(key))}
                                            fullWidth
                                            variant="secondary"
                                        >
                                            <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
                                            <Select.Popover className="z-[190] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                                                <ListBox>
                                                    <ListBox.Item id="__none__" textValue="No folder" className="rounded-lg px-2 py-1.5 text-[11px]">No folder</ListBox.Item>
                                                    {folders.map((folder) => (
                                                        <ListBox.Item key={folder.id} id={String(folder.id)} textValue={folder.name} className="rounded-lg px-2 py-1.5 text-[11px]">
                                                            {folder.name}
                                                        </ListBox.Item>
                                                    ))}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                    </div>
                                    <Input label="Code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="A-101" variant="secondary" fullWidth />
                                    <TextArea label="Description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional description" variant="secondary" fullWidth rows={3} />
                                </div>
                            ) : null}

                            {step === 1 ? (
                                <div className="space-y-3">
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFiles}
                                        aria-hidden="true"
                                        tabIndex={-1}
                                    />
                                    <Button
                                        variant="ghost"
                                        fullWidth
                                        onPress={() => inputRef.current?.click()}
                                        className="h-auto min-h-32 flex-col gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-6 hover:border-[var(--accent)]/50 hover:bg-[var(--surface-2)]/45"
                                    >
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><Upload size={18} /></span>
                                        <span className="text-[11px] font-medium text-[var(--foreground)]">Select design files</span>
                                        <span className="max-w-80 text-center text-[9px] leading-4 text-[var(--text-muted)]">DWG, PDF, PNG, JPG, DXF, RVT, IFC and supporting files</span>
                                    </Button>
                                    {queue.length ? (
                                        <div className="space-y-1.5">
                                            {queue.map((item) => (
                                                <QueueRow
                                                    key={item.id}
                                                    item={item}
                                                    onRemove={() => removeFile(item.id)}
                                                    onRetry={() => retryFile(item.id)}
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {step === 2 ? (
                                <div className="space-y-3">
                                    <TextArea label="Change summary" value={changeSummary} onChange={(event) => setChangeSummary(event.target.value)} placeholder="What changed in this revision?" variant="secondary" fullWidth rows={3} />
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Input label="Revision code" value={revisionCode} onChange={(event) => setRevisionCode(event.target.value)} placeholder="A" variant="secondary" fullWidth />
                                        <Input label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" variant="secondary" fullWidth />
                                    </div>
                                    <div>
                                        <p className="mb-2 text-[10px] font-medium text-[var(--text-muted)]">After upload</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant={submitAction === 'draft' ? 'secondary' : 'outline'}
                                                onPress={() => setSubmitAction('draft')}
                                                className={cn('h-10 text-[11px]', submitAction === 'draft' && 'border-[var(--accent)]/35 text-[var(--accent)]')}
                                            >
                                                <Save size={13} />
                                                Save draft
                                            </Button>
                                            <Button
                                                variant={submitAction === 'submit' ? 'secondary' : 'outline'}
                                                onPress={() => setSubmitAction('submit')}
                                                className={cn('h-10 text-[11px]', submitAction === 'submit' && 'border-[var(--accent)]/35 text-[var(--accent)]')}
                                            >
                                                <Send size={13} />
                                                Submit for review
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {step === 3 ? (
                                <Card variant="secondary" className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/30">
                                    <Card.Content className="space-y-3 p-4">
                                        <div className="grid gap-3 text-[10px] sm:grid-cols-2">
                                            <div><span className="text-[var(--text-muted)]">Name</span><p className="mt-0.5 font-medium text-[var(--foreground)]">{name}</p></div>
                                            <div><span className="text-[var(--text-muted)]">Discipline</span><p className="mt-0.5 font-medium capitalize text-[var(--foreground)]">{discipline}</p></div>
                                            <div><span className="text-[var(--text-muted)]">Folder</span><p className="mt-0.5 font-medium text-[var(--foreground)]">{folders.find((folder) => folder.id === folderId)?.name ?? 'No folder'}</p></div>
                                            <div><span className="text-[var(--text-muted)]">Code</span><p className="mt-0.5 font-medium text-[var(--foreground)]">{code || '—'}</p></div>
                                        </div>
                                        <div className="border-t border-[var(--border)] pt-3">
                                            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Files · {queue.length}</p>
                                            <div className="space-y-1.5">
                                                {queue.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-2 rounded-lg bg-[var(--surface)]/55 px-2.5 py-2">
                                                        <FileText size={12} className="shrink-0 text-[var(--text-muted)]" />
                                                        <span className="min-w-0 flex-1 truncate text-[10px] text-[var(--foreground)]">{item.file.name}</span>
                                                        <Chip size="sm" variant="soft" className={cn('h-4 px-1 text-[8px] capitalize', assetTone(item.assetType))}>{item.assetType.replace(/_/g, ' ')}</Chip>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Card.Content>
                                </Card>
                            ) : null}
                        </Drawer.Body>

                        <Drawer.Footer className="flex shrink-0 items-center justify-between border-t border-[var(--border)] px-5 py-3">
                            <Button
                                size="sm"
                                variant="ghost"
                                onPress={() => setStep((current) => Math.max(0, current - 1))}
                                isDisabled={step === 0 || submitting}
                                className="h-8 text-[11px]"
                            >
                                <ChevronLeft size={13} />
                                Back
                            </Button>

                            {step < STEPS.length - 1 ? (
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onPress={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))}
                                    isDisabled={!canNext()}
                                    className="h-8 text-[11px]"
                                >
                                    Next
                                    <ChevronRight size={13} />
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onPress={() => void handleSubmit()}
                                    isDisabled={submitting || hasErrors}
                                    isPending={submitting}
                                    className="h-8 text-[11px]"
                                >
                                    {!submitting ? (submitAction === 'draft' ? <Save size={13} /> : <Send size={13} />) : null}
                                    {submitAction === 'draft' ? 'Save draft' : 'Upload & submit'}
                                </Button>
                            )}
                        </Drawer.Footer>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </Drawer>
    );
}
