import { router } from '@inertiajs/react';
import { IconFileCheck, IconTrash, IconUpload } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { useTranslation } from '@/lib/i18n';
import { toExplorerDocument } from '@/features/documents/explorer/documentExplorerItem';
import { DocumentExplorer } from '@/features/documents/explorer/DocumentExplorer';
import type { DocumentExplorerTab, ExplorerDocument, ExplorerDocumentPayload } from '@/features/documents/explorer/documentExplorerTypes';

type ProjectDocumentsTabProps = {
    explorerDocuments: ExplorerDocumentPayload[];
    dossierNumber: string;
    projectLabel: string | null;
    canCreateDocuments: boolean;
    onUpload: () => void;
};

function openDocumentWindow(url: string | null, unavailableMessage: string) {
    if (!url) {
        toast.error(unavailableMessage);
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Documents tab of the Project workspace: the shared DocumentExplorer
 * configured with the Project tab set — "Tous les documents",
 * "Fichiers du projet" (uploaded files, sourceType 'project') and
 * "Documents générés" (contract DOCX/PDF, future efficiency sheets).
 *
 * The backend `explorerDocuments` payload is already authorized and carries
 * per-entry capabilities (view/download/delete flags); the explorer only
 * renders what the backend allows. The page keeps owning the upload drawer;
 * the delete confirmation dialog lives here, mirroring the legacy tab it
 * replaces.
 */
export function ProjectDocumentsTab({
    explorerDocuments,
    dossierNumber,
    projectLabel,
    canCreateDocuments,
    onUpload,
}: ProjectDocumentsTabProps) {
    const { t } = useTranslation();

    const [deleteTarget, setDeleteTarget] = useState<ExplorerDocument | null>(null);

    const tabs: DocumentExplorerTab[] = useMemo(
        () => [
            { id: 'all', label: t('documentsExplorer.locations.all') },
            { id: 'project', label: t('documentsExplorer.tabs.projectFiles'), filter: (document) => document.sourceType === 'project' },
            {
                id: 'generated',
                label: t('documentsExplorer.tabs.generated'),
                filter: (document) => document.sourceType === 'contract' || document.sourceType === 'efficiency_sheet',
                emptyDescription: t('documentsExplorer.tabs.generatedEmpty'),
            },
        ],
        [t],
    );

    return (
        <>
            <DocumentExplorer
                scope="project"
                tabs={tabs}
                documents={explorerDocuments.map(toExplorerDocument)}
                projectLabel={projectLabel}
                title={t('documentsExplorer.title')}
                headerActions={
                    <div className="flex items-center gap-2">
                        {canCreateDocuments ? (
                            <AppButton
                                isIconOnly
                                compact
                                variant="solid"
                                color="primary"
                                tooltip={t('documentsExplorer.actions.upload')}
                                aria-label={t('documentsExplorer.actions.upload')}
                                onPress={onUpload}
                            >
                                <IconUpload size={15} />
                            </AppButton>
                        ) : null}
                        <AppButton
                            isIconOnly
                            compact
                            variant="bordered"
                            tooltip={t('documentsExplorer.actions.openDocuments')}
                            aria-label={t('documentsExplorer.actions.openDocuments')}
                            onPress={() => router.visit(`/documents?search=${encodeURIComponent(dossierNumber)}`)}
                        >
                            <IconFileCheck size={15} />
                        </AppButton>
                    </div>
                }
                onPrint={(document) => openDocumentWindow(document.printUrl, t('clients.show.previewUnavailable'))}
                onDownload={(document) => openDocumentWindow(document.downloadUrl, t('clients.show.fileUnavailable'))}
                onReplace={() => undefined}
                onDelete={setDeleteTarget}
            />

            <AppModal
                isOpen={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title={t('documentsExplorer.deleteModal.title')}
                size="sm"
            >
                <p className="mb-5 flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <IconTrash size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <span>
                        {t('documentsExplorer.deleteModal.body', { name: deleteTarget?.name ?? '' })}
                    </span>
                </p>
                <div className="flex justify-end gap-2">
                    <AppButton variant="bordered" size="sm" onPress={() => setDeleteTarget(null)}>
                        {t('documentsExplorer.deleteModal.cancel')}
                    </AppButton>
                    <AppButton
                        variant="solid"
                        color="danger"
                        size="sm"
                        onPress={() => {
                            if (!deleteTarget) return;
                            router.delete(`/documents/${deleteTarget.id}`, {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: () => { setDeleteTarget(null); toast.success(t('documentsExplorer.deleteModal.success')); },
                            });
                        }}
                    >
                        {t('documentsExplorer.deleteModal.delete')}
                    </AppButton>
                </div>
            </AppModal>
        </>
    );
}
