import { useEffect, useState } from 'react';
import { Modal } from '@heroui/react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import type { ClientProjectDocument } from '@/features/clients/types';
import { DocumentDetailsPanel } from './DocumentDetailsPanel';
import { DocumentViewerFallback } from './DocumentViewerFallback';
import { DocumentViewerHeader } from './DocumentViewerHeader';
import { DocumentViewerNavigation } from './DocumentViewerNavigation';
import type { DocumentExplorerItem } from './documentExplorerTypes';
import { ImageDocumentViewer } from './viewers/ImageDocumentViewer';
import { PdfDocumentViewer } from './viewers/PdfDocumentViewer';
import { TextDocumentViewer } from './viewers/TextDocumentViewer';

type DocumentViewerModalProps = {
    /** Resolved authorized document; null with isInvalid renders the invalid state. */
    document: DocumentExplorerItem | null;
    isInvalid: boolean;
    projectLabel: string;
    position: { current: number; total: number } | null;
    canGoPrevious: boolean;
    canGoNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onClose: () => void;
    onDownload: (document: ClientProjectDocument) => void;
    onPrint: (document: ClientProjectDocument) => void;
    onReplace: (document: ClientProjectDocument) => void;
    onDelete: (document: ClientProjectDocument) => void;
};

/**
 * Preview body for one document. Rendered with key={document.id} so the
 * dedicated viewers (and their loading/failed state) reset naturally on
 * navigation — no effect needed.
 */
function ViewerPreview({
    document,
    isInvalid,
    onDownload,
}: {
    document: DocumentExplorerItem | null;
    isInvalid: boolean;
    onDownload: (document: DocumentExplorerItem) => void;
}) {
    if (!document || isInvalid) {
        return <DocumentViewerFallback document={null} isInvalid onDownload={null} onRetry={null} />;
    }

    const isTextKind = document.previewKind === 'text' || document.previewKind === 'markdown';
    const canPreview = isTextKind
        ? document.capabilities.canPreview && document.contentUrl !== null
        : document.capabilities.canPreview && document.viewUrl !== null;
    const canDownload = document.capabilities.canDownload;

    if (!canPreview) {
        return (
            <DocumentViewerFallback
                document={document}
                isInvalid={false}
                onDownload={canDownload ? () => onDownload(document) : null}
            />
        );
    }

    if (document.previewKind === 'text') {
        return <TextDocumentViewer document={document} onDownload={onDownload} />;
    }

    if (document.previewKind === 'image') {
        return <ImageDocumentViewer document={document} onDownload={onDownload} />;
    }

    if (document.previewKind === 'pdf') {
        return <PdfDocumentViewer document={document} onDownload={onDownload} />;
    }

    return (
        <DocumentViewerFallback
            document={document}
            isInvalid={false}
            onDownload={canDownload ? () => onDownload(document) : null}
        />
    );
}

/**
 * Header + workspace + bottom navigation for the open document. Mounted with
 * key={document.id} so Details resets to closed on every document change
 * (no effect, no stored preference). Desktop: the workspace is a grid whose
 * second column (fixed 320px details panel) is only reserved while Details is
 * open — closed, the viewer spans the full width; below lg the details become
 * a capped, scrollable section under the viewer and the modal is full-screen.
 */
function ViewerDialogContent({
    document,
    isInvalid,
    projectLabel,
    position,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
    onClose,
    onDownload,
    onPrint,
    onReplace,
    onDelete,
}: DocumentViewerModalProps) {
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

    const handleDownload = (entry: DocumentExplorerItem) => onDownload(entry);

    return (
        <>
            <DocumentViewerHeader
                document={document}
                projectLabel={projectLabel}
                detailsOpen={detailsOpen}
                onToggleDetails={() => setDetailsOpen((open) => !open)}
                onClose={onClose}
                onDownload={onDownload}
                onPrint={onPrint}
                onReplace={onReplace}
                onDelete={onDelete}
            />

            <div
                className={cn(
                    'grid min-h-0 min-w-0 flex-1 overflow-hidden',
                    detailsOpen
                        ? 'lg:grid-cols-[minmax(0,1fr)_320px]'
                        : 'lg:grid-cols-[minmax(0,1fr)]',
                )}
            >
                <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                    <ViewerPreview
                        key={document ? String(document.id) : 'invalid'}
                        document={document}
                        isInvalid={isInvalid}
                        onDownload={handleDownload}
                    />

                    {detailsOpen && document ? (
                        <DocumentDetailsPanel
                            document={document}
                            projectLabel={projectLabel}
                            className="max-h-[45%] shrink-0 overflow-y-auto border-t border-[var(--border)] lg:hidden"
                        />
                    ) : null}
                </div>

                {detailsOpen && document ? (
                    <DocumentDetailsPanel
                        document={document}
                        projectLabel={projectLabel}
                        className="hidden min-h-0 overflow-y-auto border-l border-[var(--border)] lg:block"
                    />
                ) : null}
            </div>

            <DocumentViewerNavigation
                position={position}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        </>
    );
}

/**
 * Same-page document viewer. Images and PDFs render in dedicated local
 * viewers on the authorized private viewUrl; text renders from the authorized
 * content endpoint; DOCX, Markdown, and unsupported files show the localized
 * fallback — their contents are never parsed or fetched here.
 *
 * The Dialog carries the real modal size: HeroUI's default `size="md"`
 * caps the Dialog at max-w-md (28rem) via unlayered component CSS that beats
 * plain utilities, so the overrides are important and applied on the Dialog
 * itself (project convention, see ForwardMessageDialog). Below lg the modal
 * goes full-screen; at lg+ it is min(94vw,1500px) × min(92vh,960px).
 */
export function DocumentViewerModal({
    document,
    isInvalid,
    projectLabel,
    position,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
    onClose,
    onDownload,
    onPrint,
    onReplace,
    onDelete,
}: DocumentViewerModalProps) {
    const { t } = useTranslation();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;

            if (!target) {
                return;
            }

            const tag = target.tagName;

            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
                return;
            }

            // react-aria menus/listboxes/comboboxes handle their own arrows.
            if (target.closest('[role="menu"], [role="listbox"], [role="combobox"], [role="slider"]')) {
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                onPrevious();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                onNext();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onPrevious, onNext]);

    return (
        <Modal.Backdrop isOpen onOpenChange={(open) => { if (!open) onClose(); }} isDismissable>
            <Modal.Container className="!p-0 sm:!p-4">
                <Modal.Dialog
                    aria-label={document ? document.name : t('documentsExplorer.viewer.title')}
                    className="!h-[92vh] !max-h-[960px] !w-[min(94vw,1500px)] !max-w-none !p-0 flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl max-lg:!h-dvh max-lg:!max-h-dvh max-lg:!w-full max-lg:!max-w-full max-lg:!rounded-none"
                >
                    <ViewerDialogContent
                        key={document ? String(document.id) : 'invalid'}
                        document={document}
                        isInvalid={isInvalid}
                        projectLabel={projectLabel}
                        position={position}
                        canGoPrevious={canGoPrevious}
                        canGoNext={canGoNext}
                        onPrevious={onPrevious}
                        onNext={onNext}
                        onClose={onClose}
                        onDownload={onDownload}
                        onPrint={onPrint}
                        onReplace={onReplace}
                        onDelete={onDelete}
                    />
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
