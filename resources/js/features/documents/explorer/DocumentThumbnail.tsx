import { Skeleton } from '@heroui/react';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { DocumentFileIcon } from './DocumentFileIcon';
import type { DocumentExplorerItem, DocumentPreviewKind } from './documentExplorerTypes';

type DocumentThumbnailProps = {
    item: DocumentExplorerItem;
    /** Compact fixed-size variant used by list rows. */
    compact?: boolean;
    className?: string;
};

const KIND_TONES: Record<Exclude<DocumentPreviewKind, 'image'>, string> = {
    pdf: 'bg-red-500/10 text-red-600 dark:text-red-400',
    docx: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    markdown: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    text: 'bg-[var(--surface-3)] text-[var(--text-muted)]',
    unsupported: 'bg-[var(--surface-3)] text-[var(--text-muted)]',
};

function coverLabel(kind: Exclude<DocumentPreviewKind, 'image'>, extension: string | null): string {
    switch (kind) {
        case 'pdf':
            return 'PDF';
        case 'docx':
            return 'DOCX';
        case 'markdown':
            return 'MD';
        case 'text':
            return extension?.toUpperCase() || 'TXT';
        case 'unsupported':
            return extension?.toUpperCase() || 'FILE';
    }
}

/**
 * Decorative cover for PDF / DOCX / Markdown / Text / Unsupported files and
 * for image thumbnails that failed or are not authorized. Pure presentation:
 * no file content is ever fetched or rendered.
 */
function PreviewCover({
    kind,
    extension,
    name,
    unavailableMessage,
}: {
    kind: Exclude<DocumentPreviewKind, 'image'>;
    extension: string | null;
    name: string;
    unavailableMessage?: string | null;
}) {
    const hasDecorLines = kind === 'markdown' || kind === 'text';

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[var(--surface-2)] p-2">
            {hasDecorLines ? (
                <div aria-hidden="true" className="absolute inset-x-4 top-3 space-y-1 opacity-60">
                    <span className="block h-1 rounded-full bg-[var(--foreground)]/10" />
                    <span className="block h-1 w-3/4 rounded-full bg-[var(--foreground)]/10" />
                    <span className="block h-1 w-5/6 rounded-full bg-[var(--foreground)]/10" />
                    <span className="block h-1 w-2/3 rounded-full bg-[var(--foreground)]/10" />
                </div>
            ) : null}

            <span className={cn('flex size-10 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)]', KIND_TONES[kind])}>
                <DocumentFileIcon kind={kind} extension={extension} size={20} />
            </span>

            <span className="rounded-full bg-[var(--surface)]/80 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-[var(--text-muted)]">
                {coverLabel(kind, extension)}
            </span>

            {unavailableMessage ? (
                <span className="max-w-full truncate px-1 text-center text-[9px] text-[var(--text-muted)]">{unavailableMessage}</span>
            ) : null}

            {!unavailableMessage ? (
                <span className="max-w-full truncate px-1 text-center text-[9px] text-[var(--text-subtle)]">{name}</span>
            ) : null}
        </div>
    );
}

/**
 * Authorized image thumbnail with skeleton while loading and a compact safe
 * fallback on failure. No retry loop: a failed image stays failed until the
 * item changes (keyed by the parent).
 */
function ImageThumbnail({ src, name }: { src: string; name: string }) {
    const { t } = useTranslation();
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

    if (state === 'error') {
        return <PreviewCover kind="unsupported" extension={null} name={name} unavailableMessage={t('documentsExplorer.thumbnail.previewUnavailable')} />;
    }

    return (
        <>
            <img
                src={src}
                alt={name}
                loading="lazy"
                onLoad={() => setState('ready')}
                onError={() => setState('error')}
                className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
                    state === 'ready' ? 'opacity-100' : 'opacity-0',
                )}
            />
            {state === 'loading' ? <Skeleton className="absolute inset-0 h-full w-full rounded-none" /> : null}
        </>
    );
}

export function DocumentThumbnail({ item, compact = false, className }: DocumentThumbnailProps) {
    const { t } = useTranslation();

    const isImage = item.previewKind === 'image';
    const canShowImage = isImage && item.capabilities.canPreview && item.viewUrl !== null;

    return (
        <div className={cn('relative shrink-0 overflow-hidden bg-[var(--surface-2)]', compact ? 'size-11 rounded-lg' : 'aspect-[4/3] rounded-t-xl', className)}>
            {canShowImage && item.viewUrl ? (
                <ImageThumbnail key={item.id} src={item.viewUrl} name={item.name} />
            ) : (
                <PreviewCover
                    kind={item.previewKind === 'image' ? 'unsupported' : item.previewKind}
                    extension={item.extension}
                    name={item.name}
                    unavailableMessage={isImage ? t('documentsExplorer.thumbnail.previewUnavailable') : null}
                />
            )}
        </div>
    );
}
