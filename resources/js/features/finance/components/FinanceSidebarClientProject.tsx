import { router } from '@inertiajs/react';
import { IconFileText, IconUserCircle } from '@tabler/icons-react';

import type { FinanceDocument } from '@/features/finance/types';
import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';

type FinanceSidebarClientProjectProps = {
    document: FinanceDocument;
};

export function FinanceSidebarClientProject({ document }: FinanceSidebarClientProjectProps) {
    const { t } = useTranslation();

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <IconUserCircle size={14} className="text-[var(--text-muted)]" />
                <h2 className="text-xs font-semibold text-[var(--foreground)]">{t('finance.documentShow.clientProject')}</h2>
            </div>

            {/* Data rows */}
            <div className="divide-y divide-[var(--border)] text-xs">
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">{t('finance.documentShow.client')}</span>
                    <span className="col-span-2 truncate text-right font-semibold text-[var(--foreground)]">
                        {document.client?.name || '-'}
                    </span>
                </div>
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">CIN</span>
                    <span className="col-span-2 truncate text-right font-mono text-zinc-300">
                        {document.client?.cin || '-'}
                    </span>
                </div>
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">{t('finance.documentShow.dossier')}</span>
                    <span className="col-span-2 truncate text-right font-mono text-zinc-300">
                        {document.dossier?.number || '-'}
                    </span>
                </div>
                <div className="grid grid-cols-3 items-baseline gap-2 px-4 py-2.5">
                    <span className="text-[var(--text-muted)]">{t('finance.documentShow.project')}</span>
                    <span className="col-span-2 truncate text-right font-semibold text-[var(--foreground)]">
                        {document.dossier?.projectObject || '-'}
                    </span>
                </div>
            </div>

            {/* Utility footer */}
            <div className="flex gap-2 border-t border-[var(--border)] p-3">
                <AppButton
                    compact
                    variant="toolbar"
                    onClick={() => document.client?.id ? router.visit(`/clients/${document.client.id}`) : router.visit('/clients')}
                    className="flex-1"
                >
                    <IconUserCircle size={13} />
                    {t('finance.documentShow.viewClient')}
                </AppButton>
                <AppButton
                    compact
                    variant="toolbar"
                    onClick={() => document.dossier?.id ? router.visit(`/dossiers/${document.dossier.id}`) : router.visit('/dossiers')}
                    className="flex-1"
                >
                    <IconFileText size={13} />
                    {t('finance.documentShow.viewProject')}
                </AppButton>
            </div>
        </div>
    );
}
