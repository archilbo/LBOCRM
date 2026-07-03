import { FileCheck2 } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AuthorizationRow } from '@/features/authorizations/data/mockAuthorizations';
import { useTranslation } from '@/lib/i18n';

type AuthorizationPreviewPanelProps = {
    authorization: AuthorizationRow | null;
};

export function AuthorizationPreviewPanel({ authorization }: AuthorizationPreviewPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('authorizationsWorkspace.preview.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('authorizationsWorkspace.preview.description')}
                </p>
            </div>

            {authorization ? (
                <div className="space-y-4">
                    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                        <div className="text-center">
                            <FileCheck2 className="mx-auto text-[var(--text-muted)]" size={40} />
                            <p className="mt-3 text-sm font-semibold">{authorization.submissionNumber}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                {authorization.finalFileName !== '-' ? authorization.finalFileName : authorization.receiptFileName}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('authorizationsWorkspace.preview.fileName')}</span>
                            <span className="max-w-[220px] truncate font-medium">
                                {authorization.finalFileName !== '-' ? authorization.finalFileName : authorization.receiptFileName}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('authorizationsWorkspace.preview.uploadedBy')}</span>
                            <span className="font-medium">{authorization.uploadedBy}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('authorizationsWorkspace.preview.uploadedAt')}</span>
                            <span className="font-medium">{authorization.uploadedAt}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <AppBadge tone="blue">{authorization.dossierNumber}</AppBadge>
                        <AppBadge tone="green">{authorization.authorityName}</AppBadge>
                    </div>
                </div>
            ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <FileCheck2 className="mx-auto text-[var(--text-muted)]" size={38} />
                        <p className="mt-3 text-sm font-semibold">
                            {t('authorizationsWorkspace.preview.noFile')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}
