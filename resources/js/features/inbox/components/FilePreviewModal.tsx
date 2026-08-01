import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { MessageAttachmentRow } from '@/features/chat/types';
import { FileTypeIcon } from '@/features/inbox/components/FileTypeIcon';
import { formatFileSize, getFileTypeAppearance, getAttachmentDisplayName, getAttachmentPreviewUrl, isImageAttachment, isPdfAttachment } from '@/features/inbox/utils/fileFormatters';

type Props = {
    attachments: MessageAttachmentRow[];
    initialIndex: number;
    onClose: () => void;
};

export function FilePreviewModal({ attachments, initialIndex, onClose }: Props) {
    const previewable = useMemo(() =>
        attachments.filter((a) => isImageAttachment(a) || isPdfAttachment(a)),
        [attachments]
    );
    const initialPreviewableIndex = useMemo(() => {
        const target = attachments[initialIndex];
        return previewable.findIndex((a) => a.id === target?.id);
    }, [attachments, initialIndex, previewable]);

    const [index, setIndex] = useState(Math.max(0, initialPreviewableIndex));
    const current = previewable[index];
    const isImage = isImageAttachment(current || { mimeType: '' });
    const isPdf = isPdfAttachment(current || { mimeType: '' });

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && index > 0) setIndex((i) => i - 1);
            if (e.key === 'ArrowRight' && index < previewable.length - 1) setIndex((i) => i + 1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [previewable.length, index, onClose]);

    const handleDownload = useCallback(() => {
        if (!current) return;
        const url = current.downloadUrl || current.url;
        if (!url) { toast.error('Fichier non disponible'); return; }
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener';
        a.download = current.originalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [current]);

    if (!current) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div className="flex flex-1 items-center justify-center text-white/60">
                    <p>Aperçu non disponible pour ce fichier</p>
                </div>
            </div>
        );
    }

    const hasPrev = index > 0;
    const hasNext = index < previewable.length - 1;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <header className="flex items-center justify-between px-4 py-3">
                <p className="truncate text-sm font-medium text-white/80">{getAttachmentDisplayName(current)}</p>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={handleDownload} className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition" title="Télécharger"><Download size={18} /></button>
                    <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition" title="Fermer"><X size={18} /></button>
                </div>
            </header>

            <div className="flex flex-1 items-center justify-center overflow-hidden px-4 pb-4">
                {hasPrev ? (
                    <button type="button" onClick={() => setIndex((i) => i - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"><ChevronLeft size={22} /></button>
                ) : null}

                {isImage ? (
                    <img src={getAttachmentPreviewUrl(current)} alt={current.originalFilename} className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" />
                ) : isPdf ? (
                    <iframe src={getAttachmentPreviewUrl(current)} title={current.originalFilename} className="h-[85vh] w-full max-w-4xl rounded-xl bg-white" />
                ) : null}

                {hasNext ? (
                    <button type="button" onClick={() => setIndex((i) => i + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"><ChevronRight size={22} /></button>
                ) : null}
            </div>

            {previewable.length > 1 ? (
                <div className="flex justify-center gap-1.5 pb-4">
                    {previewable.map((_, i) => (
                        <button key={i} type="button" onClick={() => setIndex(i)} className={`size-2 rounded-full transition ${i === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
