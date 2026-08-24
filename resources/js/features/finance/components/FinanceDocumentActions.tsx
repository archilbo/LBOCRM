import { IconCircleCheck, IconDownload, IconEye, IconFileSpreadsheet, IconFileText, IconPencil, IconPrinter, IconRefresh, IconTrash, IconWallet, IconCircleX } from '@tabler/icons-react';

import { FinanceRowActions, type FinanceRowAction } from '@/features/finance/components/FinanceRowActions';
import type { FinanceDocument } from '@/features/finance/types';
import { usePermissions } from '@/hooks/usePermissions';
import { t, useTranslation } from '@/lib/i18n';

export type FinanceDocumentActionHandlers = {
    onOpen: (document: FinanceDocument) => void;
    onEdit: (document: FinanceDocument) => void;
    onPreview: (document: FinanceDocument) => void;
    onPrint: (document: FinanceDocument) => void;
    onDownloadPdf: (document: FinanceDocument) => void;
    onDownloadExcel: (document: FinanceDocument) => void;
    onGeneratePdf: (document: FinanceDocument) => void;
    onGenerateExcel: (document: FinanceDocument) => void;
    onAccept: (document: FinanceDocument) => void;
    onReject: (document: FinanceDocument) => void;
    onConvert: (document: FinanceDocument) => void;
    onPayment: (document: FinanceDocument) => void;
    onCancel: (document: FinanceDocument) => void;
    onDelete: (document: FinanceDocument) => void;
};

export function createFinanceDocumentActions(
    document: FinanceDocument,
    handlers: FinanceDocumentActionHandlers,
    can: (permission: string) => boolean = () => true,
    translate: (key: string) => string = t,
): FinanceRowAction[] {
    const actions: Array<FinanceRowAction | false> = [
        can('finance.view') && { id: 'open', label: translate('finance.actions.open'), icon: <IconEye size={13} />, onPress: () => handlers.onOpen(document) },
        can('finance.documents.update') && { id: 'edit', label: translate('finance.actions.edit'), icon: <IconPencil size={13} />, onPress: () => handlers.onEdit(document) },
        can('finance.view') && { id: 'preview', label: translate('finance.actions.preview'), icon: <IconFileText size={13} />, onPress: () => handlers.onPreview(document), dividerBefore: true },
        can('finance.view') && { id: 'print', label: translate('finance.actions.print'), icon: <IconPrinter size={13} />, onPress: () => handlers.onPrint(document) },
        can('finance.view') && Boolean(document.hasPdf) && { id: 'download-pdf', label: translate('finance.actions.downloadPdf'), icon: <IconDownload size={13} />, onPress: () => handlers.onDownloadPdf(document) },
        can('finance.view') && Boolean(document.hasExcel) && { id: 'download-excel', label: translate('finance.actions.downloadExcel'), icon: <IconFileSpreadsheet size={13} />, onPress: () => handlers.onDownloadExcel(document) },
        can('finance.documents.update') && { id: 'generate-pdf', label: translate(document.hasPdf ? 'finance.actions.regeneratePdf' : 'finance.actions.generatePdf'), icon: <IconFileText size={13} />, onPress: () => handlers.onGeneratePdf(document), tone: 'accent', dividerBefore: true },
        can('finance.documents.update') && { id: 'generate-excel', label: translate(document.hasExcel ? 'finance.actions.regenerateExcel' : 'finance.actions.generateExcel'), icon: <IconFileSpreadsheet size={13} />, onPress: () => handlers.onGenerateExcel(document), tone: 'accent' },
        can('finance.documents.issue') && document.type === 'quote' && { id: 'accept', label: translate('finance.actions.acceptQuote'), icon: <IconCircleCheck size={13} />, onPress: () => handlers.onAccept(document), tone: 'success', dividerBefore: true },
        can('finance.documents.create') && document.type === 'quote' && Boolean(document.convertToInvoiceUrl) && { id: 'convert', label: translate('finance.actions.convertToInvoice'), icon: <IconRefresh size={13} />, onPress: () => handlers.onConvert(document), tone: 'accent' },
        can('finance.documents.issue') && document.type === 'quote' && { id: 'reject', label: translate('finance.actions.rejectQuote'), icon: <IconCircleX size={13} />, onPress: () => handlers.onReject(document), tone: 'danger' },
        can('finance.payments.create') && document.type === 'invoice' && Boolean(document.paymentUrl) && { id: 'payment', label: translate('finance.actions.registerPayment'), icon: <IconWallet size={13} />, onPress: () => handlers.onPayment(document), tone: 'success', dividerBefore: true },
        can('finance.documents.cancel') && { id: 'cancel', label: translate('finance.actions.cancelDocument'), icon: <IconCircleX size={13} />, onPress: () => handlers.onCancel(document), tone: 'danger', dividerBefore: document.type !== 'quote' },
        can('finance.documents.delete') && { id: 'delete', label: translate('finance.actions.delete'), icon: <IconTrash size={13} />, onPress: () => handlers.onDelete(document), tone: 'danger' },
    ];

    return actions.filter((action): action is FinanceRowAction => action !== false);
}

type FinanceDocumentActionsProps = {
    document: FinanceDocument;
    handlers: FinanceDocumentActionHandlers;
    visibleCount?: number;
    className?: string;
    buttonClassName?: string;
};

export function FinanceDocumentActions({ document, handlers, visibleCount = 2, className, buttonClassName }: FinanceDocumentActionsProps) {
    const { can } = usePermissions();
    const { t } = useTranslation();

    return <FinanceRowActions actions={createFinanceDocumentActions(document, handlers, can, t)} visibleCount={visibleCount} className={className} buttonClassName={buttonClassName} />;
}
