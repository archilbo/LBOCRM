import { IconFileText, IconUpload } from '@tabler/icons-react';

import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useTranslation } from '@/lib/i18n';
import type { ClientProjectSummary, ClientRow } from '@/features/clients/types';
import { toExplorerDocument } from '@/features/documents/explorer/documentExplorerItem';
import { DocumentExplorer } from '@/features/documents/explorer/DocumentExplorer';
import type { DocumentExplorerTab, ExplorerContext, ExplorerDocument, ExplorerDocumentPayload } from '@/features/documents/explorer/documentExplorerTypes';

type ClientDocumentsTabProps = {
    client: ClientRow;
    projects: ClientProjectSummary[];
    explorerContext: ExplorerContext | null;
    explorerDocuments: ExplorerDocumentPayload[];
    onUpload: () => void;
    onPreview: (document: ExplorerDocument) => void;
    onPrint: (document: ExplorerDocument) => void;
    onDownload: (document: ExplorerDocument) => void;
    onReplace: (document: ExplorerDocument) => void;
    onDelete: (document: ExplorerDocument) => void;
};

/**
 * Documents tab of the Client workspace: configures the shared
 * DocumentExplorer with the Client tab set and the Client-scoped backend
 * payload.
 *
 * Corrected business rule: Client → Documents is an aggregation of ALL
 * documents from ALL Projects belonging to that Client (uploaded project
 * files + generated Contract/Fiche artifacts). There is no direct Client
 * document pool in the schema, so no "client" source entries are fabricated.
 * The backend `explorerDocuments` payload is already scoped and authorized;
 * the explorer only renders it. Every entry carries its owning Project
 * reference (projectLabel/project) so the grid/list can show which Project
 * each file belongs to.
 *
 * The former "Fichiers partagés du client" tab was a static empty
 * placeholder depending on a direct Client-document concept that does not
 * exist in the schema; it was removed in favor of the two Project-derived
 * tabs below (Tous les documents / Projets). The page keeps owning the
 * upload drawer, the delete confirmation dialog, and all mutations.
 */
export function ClientDocumentsTab({
    client,
    projects,
    explorerContext: _explorerContext,
    explorerDocuments,
    onUpload,
    onPreview: _onPreview,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
}: ClientDocumentsTabProps) {
    // _explorerContext is the backend-provided scope context input (type +
    // clientId); the UI scope is already fixed through the `scope` prop and
    // every query/action is backend-authorized, so it is intentionally not
    // consumed for rendering yet.
    // _onPreview is still part of the page contract (Show.tsx keeps passing
    // it); the same-page viewer replaced the external preview for the Open
    // action, so it is intentionally unused here until the page is cleaned up.
    const { t } = useTranslation();

    const documents = explorerDocuments.map(toExplorerDocument);

    const tabs: DocumentExplorerTab[] = [
        { id: 'all', label: t('documentsExplorer.locations.all') },
        {
            id: 'projects',
            label: t('documentsExplorer.locations.projects'),
            // Every Client-scope document is Project-derived (no direct Client
            // pool exists), so this tab is a Project-grouped view of the same
            // set; per-entry project metadata is exposed for future grouping.
            filter: () => true,
        },
    ];

    if (projects.length === 0) {
        return (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
                <AppEmptyState title={t('clients.show.noDocuments')} description={t('clients.show.noDocumentsDesc')} />
            </div>
        );
    }

    return (
        <DocumentExplorer
            scope="client"
            tabs={tabs}
            documents={documents}
            projectLabel={null}
            title={t('documentsExplorer.title')}
            storageKey="archilbo-document-explorer-view"
            headerActions={
                projects.length > 0 ? (
                    <AppButton
                        isIconOnly
                        compact
                        variant="solid"
                        color="primary"
                        tooltip={t('clients.show.uploadDocument')}
                        aria-label={t('clients.show.uploadDocument')}
                        onPress={onUpload}
                    >
                        <IconUpload size={15} />
                    </AppButton>
                ) : null
            }
            onPrint={onPrint}
            onDownload={onDownload}
            onReplace={onReplace}
            onDelete={onDelete}
            renderFooter={(activeTabId) => {
                if (activeTabId !== 'all') {
                    return null;
                }

                return (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                        <h3 className="mb-3 text-[12px] font-semibold text-[var(--foreground)]">{t('documentsExplorer.sharedInformation.title')}</h3>
                        <p className="mb-4 text-[10px] text-[var(--text-muted)]">{t('documentsExplorer.sharedInformation.description')}</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                    <IconFileText size={14} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-medium text-[var(--foreground)]">CIN</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{client.cin || t('common.notAvailable')}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                    <IconFileText size={14} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-medium text-[var(--foreground)]">{t('clients.form.phone')}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{client.phone || t('common.notAvailable')}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                                    <IconFileText size={14} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[12px] font-medium text-[var(--foreground)]">{t('clients.form.email')}</p>
                                    <p className="text-[10px] text-[var(--text-muted)]">{client.email || t('common.notAvailable')}</p>
                                </div>
                                <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-medium text-[var(--accent)]">{t('clients.show.reusedFromClient')}</span>
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
}
