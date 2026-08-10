import { IconCircleCheck, IconDownload, IconEye, IconBuildingBank, IconPrinter, IconArrowRotaryFirstLeft, IconShieldCheck, IconTrash, IconCircleX } from '@tabler/icons-react';

import type { FinanceDocument } from '@/features/finance/types';
import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';

type FinanceSidebarActionsProps = {
    document: FinanceDocument;
    isProcessing: boolean;
    onGenerate: () => void;
    onView: () => void;
    onPrint: () => void;
    onDownloadPdf: () => void;
    onDownloadExcel: () => void;
    onAcceptQuote: () => void;
    onRejectQuote: () => void;
    onConvertToInvoice: () => void;
    onCancel: () => void;
    onDelete: () => void;
};

export function FinanceSidebarActions({
    document,
    isProcessing,
    onGenerate,
    onView,
    onPrint,
    onDownloadPdf,
    onDownloadExcel,
    onAcceptQuote,
    onRejectQuote,
    onConvertToInvoice,
    onCancel,
    onDelete,
}: FinanceSidebarActionsProps) {
    const disabled = isProcessing;
    const { t } = useTranslation();

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
                <IconShieldCheck size={14} className="text-amber-500" />
                <h2 className="text-xs font-semibold text-[var(--foreground)]">{t('finance.sidebar.actions')}</h2>
                <span className="ml-auto h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="space-y-4 p-4">

                {/* Export */}
                <div>
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('finance.sidebar.exports')}</p>
                    <div className="mb-2 grid grid-cols-2 gap-2">
                        <AppButton compact variant="toolbar" onPress={onView}><IconEye size={13} /> {t('finance.sidebar.view')}</AppButton>
                        <AppButton compact variant="toolbar" onPress={onPrint}><IconPrinter size={13} /> {t('finance.sidebar.print')}</AppButton>
                    </div>
                    <AppButton variant="accent" className="w-full" isDisabled={disabled} onPress={onGenerate}>
                        <IconArrowRotaryFirstLeft size={14} className={disabled ? 'animate-spin' : ''} />
                        {t('finance.sidebar.generateFiles')}
                    </AppButton>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <AppButton compact variant="toolbar" isDisabled={disabled} onPress={onDownloadPdf}><IconDownload size={13} /> PDF</AppButton>
                        <AppButton compact variant="toolbar" isDisabled={disabled} onPress={onDownloadExcel}><IconDownload size={13} /> Excel</AppButton>
                    </div>
                </div>

                {/* Quote workflow */}
                {document.acceptUrl || document.rejectUrl || document.convertToInvoiceUrl ? (
                    <div className="border-t border-[var(--border)] pt-4">
                        <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t('finance.sidebar.quote')}</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {document.acceptUrl ? (
                                <AppButton compact size="sm" color="success" variant="solid" isDisabled={disabled} onPress={onAcceptQuote}><IconCircleCheck size={12} /> {t('finance.sidebar.accept')}</AppButton>
                            ) : null}
                            {document.rejectUrl ? (
                                <AppButton compact size="sm" color="danger" variant="flat" isDisabled={disabled} onPress={onRejectQuote}><IconCircleX size={12} /> {t('finance.sidebar.reject')}</AppButton>
                            ) : null}
                            {document.convertToInvoiceUrl ? (
                                <AppButton compact size="sm" variant="accent" isDisabled={disabled} onPress={onConvertToInvoice}><IconBuildingBank size={12} /> {t('finance.sidebar.convert')}</AppButton>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {/* Cancel & Delete */}
                <div className="border-t border-[var(--border)] pt-4">
                    <p className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-red-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500/60" />
                        {t('finance.sidebar.dangerZone')}
                    </p>
                    <div className="flex gap-2">
                        <AppButton compact variant="danger-soft" className="flex-1" isDisabled={disabled} onPress={onCancel}><IconArrowRotaryFirstLeft size={13} /> {t('finance.sidebar.cancel')}</AppButton>
                        <AppButton compact variant="danger" className="flex-1" isDisabled={disabled} onPress={onDelete}><IconTrash size={13} /> {t('finance.actions.delete')}</AppButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
