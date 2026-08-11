import { useCallback, useMemo, useState } from 'react';

import type { MessageAttachmentRow } from '@/features/chat/types';
import { DocumentViewerModal } from '@/features/documents/explorer/DocumentViewerModal';
import type { DocumentExplorerItem, ExplorerDocument } from '@/features/documents/explorer/documentExplorerTypes';
import {
    getAttachmentDisplayName,
    getAttachmentDownloadUrl,
    getAttachmentPreviewUrl,
    isImageAttachment,
    isPdfAttachment,
} from '@/features/inbox/utils/fileFormatters';

type Props = {
    attachments: MessageAttachmentRow[];
    initialIndex: number;
    onClose: () => void;
};

function toViewerDocument(attachment: MessageAttachmentRow): DocumentExplorerItem {
    const name = getAttachmentDisplayName(attachment);
    const previewKind = isImageAttachment(attachment) ? 'image' : 'pdf';
    const extension = name.includes('.') ? (name.split('.').pop() ?? null).toLowerCase() : null;

    return {
        id: attachment.id,
        key: `inbox-attachment:${attachment.id}`,
        sourceType: 'client',
        sourceLabel: 'Inbox',
        name,
        status: 'uploaded',
        documentNumber: null,
        originalFilename: attachment.originalFilename,
        mimeType: attachment.mimeType,
        sizeLabel: attachment.size ? `${Math.ceil(attachment.size / 1024)} KB` : null,
        storageLocation: null,
        uploadedAt: attachment.createdAt,
        hasFile: true,
        canPreview: true,
        viewUrl: getAttachmentPreviewUrl(attachment),
        contentUrl: null,
        printUrl: null,
        downloadUrl: getAttachmentDownloadUrl(attachment),
        generated: false,
        version: null,
        extension,
        previewKind,
        capabilities: {
            canView: true,
            canPreview: true,
            canDownload: true,
            canPrint: false,
            canReplace: false,
            canUpdateStatus: false,
            canDelete: false,
        },
    };
}

/**
 * Inbox attachments use the same authorized document modal and format-specific
 * viewers as the client document workspace. This prevents parallel preview
 * controls and keeps PDF/image interactions consistent everywhere.
 */
export function FilePreviewModal({ attachments, initialIndex, onClose }: Props) {
    const previewable = useMemo(
        () => attachments.filter((attachment) => isImageAttachment(attachment) || isPdfAttachment(attachment)),
        [attachments],
    );
    const initialPreviewableIndex = useMemo(() => {
        const target = attachments[initialIndex];

        return previewable.findIndex((attachment) => attachment.id === target?.id);
    }, [attachments, initialIndex, previewable]);
    const [index, setIndex] = useState(Math.max(0, initialPreviewableIndex));
    const currentDocument = previewable[index] ? toViewerDocument(previewable[index]) : null;

    const handleDownload = useCallback(
        (document: ExplorerDocument) => {
            const attachment = previewable.find((item) => item.id === document.id);
            if (!attachment) {
                return;
            }

            const link = window.document.createElement('a');
            link.href = getAttachmentDownloadUrl(attachment);
            link.rel = 'noopener';
            link.download = attachment.originalFilename;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
        },
        [previewable],
    );

    return (
        <DocumentViewerModal
            document={currentDocument}
            isInvalid={!currentDocument}
            projectLabel="Inbox"
            position={currentDocument ? { current: index + 1, total: previewable.length } : null}
            canGoPrevious={index > 0}
            canGoNext={index < previewable.length - 1}
            onPrevious={() => setIndex((current) => Math.max(0, current - 1))}
            onNext={() => setIndex((current) => Math.min(previewable.length - 1, current + 1))}
            onClose={onClose}
            onDownload={handleDownload}
            onPrint={() => undefined}
            onReplace={() => undefined}
            onDelete={() => undefined}
        />
    );
}
