import { FileText } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { ContractRow } from '@/features/contracts/data/mockContracts';
import { useTranslation } from '@/lib/i18n';

type ContractPreviewPanelProps = {
    contract: ContractRow | null;
};

export function ContractPreviewPanel({ contract }: ContractPreviewPanelProps) {
    const { t } = useTranslation();

    return (
        <AppCard className="p-5">
            <div className="mb-4">
                <h2 className="text-sm font-semibold">{t('contractsWorkspace.preview.title')}</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {t('contractsWorkspace.preview.description')}
                </p>
            </div>

            {contract ? (
                <div className="space-y-4">
                    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                        <div className="text-center">
                            <FileText className="mx-auto text-[var(--text-muted)]" size={40} />
                            <p className="mt-3 text-sm font-semibold">{contract.contractNumber}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{contract.fileName}</p>
                        </div>
                    </div>

                    <div className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.fileName')}</span>
                            <span className="max-w-[220px] truncate font-medium">{contract.fileName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.template')}</span>
                            <span className="font-medium">{contract.template}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.version')}</span>
                            <span className="font-medium">{contract.version}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[var(--text-muted)]">{t('contractsWorkspace.preview.lastGenerated')}</span>
                            <span className="font-medium">{contract.lastGenerated}</span>
                        </div>
                    </div>

                    <AppBadge tone="blue">{contract.dossierNumber}</AppBadge>
                </div>
            ) : (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed bg-[var(--surface-2)]">
                    <div className="px-6 text-center">
                        <FileText className="mx-auto text-[var(--text-muted)]" size={38} />
                        <p className="mt-3 text-sm font-semibold">
                            {t('contractsWorkspace.preview.noPreview')}
                        </p>
                    </div>
                </div>
            )}
        </AppCard>
    );
}
