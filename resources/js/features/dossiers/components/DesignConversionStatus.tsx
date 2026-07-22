import { Loader2, FileWarning, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@heroui/react';

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode; tip: string }> = {
    'uploaded': { label: 'Uploaded', color: 'text-blue-500', icon: <Loader2 size={20} className="animate-spin" />, tip: 'The file has been received and is waiting to be processed.' },
    'queued': { label: 'Queued', color: 'text-blue-500', icon: <Loader2 size={20} className="animate-spin" />, tip: 'The file is in queue for conversion processing.' },
    'validating': { label: 'Validating', color: 'text-blue-500', icon: <Loader2 size={20} className="animate-spin" />, tip: 'The file is being validated for conversion.' },
    'converting': { label: 'Converting', color: 'text-amber-500', icon: <Loader2 size={20} className="animate-spin" />, tip: 'The file is being converted to a browser-compatible format.' },
    'extracting_metadata': { label: 'Extracting metadata', color: 'text-amber-500', icon: <Loader2 size={20} className="animate-spin" />, tip: 'Metadata is being extracted from the source file.' },
    'generating_thumbnails': { label: 'Generating thumbnails', color: 'text-amber-500', icon: <Loader2 size={20} className="animate-spin" />, tip: 'Preview thumbnails are being generated.' },
    'ready': { label: 'Ready', color: 'text-green-500', icon: <CheckCircle2 size={20} />, tip: 'This file has been processed and is ready for review.' },
    'failed': { label: 'Failed', color: 'text-red-500', icon: <XCircle size={20} />, tip: 'Conversion failed. The file may be corrupted or in an unsupported format.' },
    'unsupported': { label: 'Unsupported', color: 'text-red-500', icon: <FileWarning size={20} />, tip: 'This file format is not supported for browser preview.' },
};

export function DesignConversionStatus({ conversionStatus, filename, onRetry }: {
    conversionStatus: string;
    filename: string;
    onRetry?: () => void;
}) {
    const meta = STATUS_META[conversionStatus] ?? STATUS_META['unsupported'];
    const isProcessing = ['uploaded', 'queued', 'validating', 'converting', 'extracting_metadata', 'generating_thumbnails'].includes(conversionStatus);

    return (
        <div className="flex h-full flex-col items-center justify-center p-8">
            <div className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                <div className={`mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--surface-2)] ${meta.color}`}>
                    {meta.icon}
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">{meta.label}</h3>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">{filename}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">{meta.tip}</p>

                {isProcessing && (
                    <div className="mt-4 space-y-2">
                        <div className="mx-auto h-1.5 w-32 overflow-hidden rounded-full bg-[var(--surface-2)]">
                            <div className="h-full w-2/3 animate-pulse rounded-full bg-[var(--accent)]" />
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]">Processing...</p>
                    </div>
                )}

                {conversionStatus === 'failed' && onRetry && (
                    <div className="mt-4">
                        <Button size="sm" variant="bordered" startContent={<RefreshCw size={14} />} onPress={onRetry}>
                            Retry Conversion
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
