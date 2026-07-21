import { Download, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { MessageAttachmentRow } from '@/features/chat/types';
import { FileTypeIcon } from '@/features/inbox/components/FileTypeIcon';
import { formatFileSize, getFileTypeAppearance, canPreviewFile, getAttachmentDisplayName } from '@/features/inbox/utils/fileFormatters';
import { cn } from '@/lib/cn';

type Props = {
    attachment: MessageAttachmentRow;
    isMine: boolean;
    onPreview?: (attachment: MessageAttachmentRow) => void;
};

export function FileMessageCard({ attachment, isMine, onPreview }: Props) {
    const [downloading, setDownloading] = useState(false);
    const appearance = getFileTypeAppearance(attachment.mimeType, attachment.originalFilename);
    const displayName = getAttachmentDisplayName(attachment);
    const canPreview = canPreviewFile(attachment.mimeType);

    async function handleDownload(e: React.MouseEvent) {
        e.stopPropagation();
        const url = attachment.downloadUrl || attachment.url;
        if (!url) { toast.error('Fichier non disponible'); return; }
        setDownloading(true);
        try {
            const a = document.createElement('a');
            a.href = url;
            a.download = attachment.originalFilename;
            a.click();
        } catch { toast.error('Téléchargement impossible'); }
        finally { setDownloading(false); }
    }

    function handlePreview() {
        onPreview?.(attachment);
    }

    return (
        <div
            onClick={canPreview ? handlePreview : undefined}
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition',
                isMine ? 'bg-black/15 hover:bg-black/20' : 'bg-[var(--surface-3)]/80 hover:bg-[var(--surface-3)]',
                canPreview ? 'cursor-pointer' : '',
            )}
        >
            {attachment.thumbnailUrl ? (
                <img
                    src={attachment.thumbnailUrl}
                    alt={displayName}
                    className="size-14 shrink-0 rounded-lg object-cover"
                />
            ) : (
                <FileTypeIcon appearance={appearance} size={18} />
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[var(--text)]" title={displayName}>
                    {displayName}
                </p>
                <p className="truncate text-[10px] text-[var(--text-muted)]">
                    {appearance.label} · {formatFileSize(attachment.size)}
                    {attachment.pages ? ` · ${attachment.pages} pages` : ''}
                    {attachment.width && attachment.height ? ` · ${attachment.width}×${attachment.height}` : ''}
                </p>
                {attachment.linkedDocument ? (
                    <p className="mt-0.5 text-[9px] font-medium text-[var(--accent)]">
                        {typeof attachment.linkedDocument === 'object' && 'code' in attachment.linkedDocument
                            ? (attachment.linkedDocument as { code: string }).code
                            : 'Document lié'}
                    </p>
                ) : null}
            </div>

            {canPreview ? (
                <button
                    onClick={handlePreview}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition"
                    title="Aperçu"
                >
                    <Eye size={15} />
                </button>
            ) : (
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] transition disabled:opacity-50"
                    title="Télécharger"
                >
                    <Download size={15} />
                </button>
            )}
        </div>
    );
}
