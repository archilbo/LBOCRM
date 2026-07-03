import { FileText } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { RequiredDocumentRow } from '@/features/documents/data/mockDocuments';
import { useTranslation } from '@/lib/i18n';

type DocumentPreviewPanelProps = {
    document: RequiredDocumentRow | null;
};

export function DocumentPreviewPanel({ document }: DocumentPreviewPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('documentsWorkspace.preview.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {document
                        ? t('documentsWorkspace.preview.selectedTitle')
                        : t('documentsWorkspace.preview.emptyDescription')}
                </p>
            </div>

            {document ? (
                <div className="space-y-4">
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                        <div className="text-center">
                            <FileText className="mx-auto text-[var(--text-muted)]" size={36} />
                            <p className="mt-3 text-sm font-medium">{document.title}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{document.fileName}</p>
                        </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.fileName')}</span>
                            <span className="max-w-[220px] truncate font-medium">{document.fileName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.fileSize')}</span>
                            <span className="font-medium">{document.fileSize}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.uploadedBy')}</span>
                            <span className="font-medium">{document.uploadedBy}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('documentsWorkspace.preview.uploadedAt')}</span>
                            <span className="font-medium">{document.uploadedAt}</span>
                        </div>
                    </div>

                    <AppBadge tone="blue">{document.dossierNumber}</AppBadge>
                </div>
            ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <FileText className="mx-auto text-[var(--text-muted)]" size={38} />
                        <p className="mt-3 text-sm font-semibold">
                            {t('documentsWorkspace.preview.emptyTitle')}
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                            {t('documentsWorkspace.preview.emptyDescription')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}
