import { Upload, Pause, Play, RotateCcw, X, Loader2, FileWarning, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatBytes, formatSpeed, formatEta, formatPercent } from './uploadFormatters';
import type { UploadSessionFile } from './uploadTypes';

interface UploadItemRowProps {
    file: UploadSessionFile;
    onPause: () => void;
    onResume: () => void;
    onRetry: () => void;
    onCancel: () => void;
    isUploading: boolean;
    batchOverallStatus: string;
}

export function UploadItemRow({ file, onPause, onResume, onRetry, onCancel, isUploading, batchOverallStatus }: UploadItemRowProps) {
    const pct = file.sizeBytes > 0 ? file.transferredBytes / file.sizeBytes : 0;

    const isActive = file.transferStatus === 'uploading';
    const isPaused = file.transferStatus === 'paused';
    const isFailed = file.transferStatus === 'failed' || file.processingStatus === 'failed';
    const isDone = file.transferStatus === 'transferred' && file.processingStatus === 'ready';
    const isProcessing = file.transferStatus === 'transferred' && batchOverallStatus === 'processing';

    return (
        <div className="flex flex-col gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    {isDone ? (
                        <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                    ) : isFailed ? (
                        <FileWarning size={14} className="shrink-0 text-red-500" />
                    ) : isProcessing ? (
                        <Loader2 size={14} className="shrink-0 animate-spin text-amber-500" />
                    ) : (
                        <Upload size={14} className="shrink-0 text-[var(--accent)]" />
                    )}
                    <span className="truncate font-medium text-[var(--foreground)]">{file.originalFilename}</span>
                </div>
                <span className="shrink-0 text-[10px] uppercase text-[var(--text-muted)]">{file.assetType}</span>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-300',
                                isDone ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-[var(--accent)]',
                            )}
                            style={{ width: `${Math.min(pct * 100, 100)}%` }}
                        />
                    </div>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{formatPercent(pct)}</span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                <span>
                    {formatBytes(file.transferredBytes)} / {formatBytes(file.sizeBytes)}
                    {file.speedBps ? ` · ${formatSpeed(file.speedBps)}` : ''}
                    {file.eta ? ` · ${formatEta(file.eta)}` : ''}
                </span>

                <div className="flex items-center gap-1">
                    {isActive && (
                        <button onClick={onPause} className="rounded p-0.5 hover:bg-[var(--surface-2)]" aria-label="Pause">
                            <Pause size={12} />
                        </button>
                    )}
                    {isPaused && (
                        <button onClick={onResume} className="rounded p-0.5 hover:bg-[var(--surface-2)]" aria-label="Resume">
                            <Play size={12} />
                        </button>
                    )}
                    {isFailed && (
                        <button onClick={onRetry} className="rounded p-0.5 hover:bg-[var(--surface-2)]" aria-label="Retry">
                            <RotateCcw size={12} />
                        </button>
                    )}
                    {!isDone && (
                        <button onClick={onCancel} className="rounded p-0.5 hover:bg-[var(--surface-2)]" aria-label="Cancel">
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {file.errorMessage && (
                <p className="text-[10px] text-red-500">{file.errorMessage}</p>
            )}
            {isProcessing && file.processingStatus !== 'ready' && (
                <p className="text-[10px] text-amber-500">Processing{file.processingStatus !== 'waiting' ? `: ${file.processingStatus}` : '...'}</p>
            )}
        </div>
    );
}
