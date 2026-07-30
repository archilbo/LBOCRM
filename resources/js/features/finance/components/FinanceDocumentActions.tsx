import { CheckCircle2, Download, Eye, FileSpreadsheet, FileText, Pencil, Printer, RefreshCw, Trash2, WalletCards, XCircle } from 'lucide-react';
import { FinanceRowActions, type FinanceRowAction } from '@/features/finance/components/FinanceRowActions';
import type { FinanceDocument } from '@/features/finance/types';
import { usePermissions } from '@/hooks/usePermissions';

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
): FinanceRowAction[] {
    return [
        can('finance.view') && { id: 'open', label: 'Open document', icon: <Eye size={13} />, onPress: () => handlers.onOpen(document) },
        can('finance.documents.update') && { id: 'edit', label: 'Edit', icon: <Pencil size={13} />, onPress: () => handlers.onEdit(document) },
        can('finance.view') && { id: 'preview', label: 'Preview', icon: <FileText size={13} />, onPress: () => handlers.onPreview(document), dividerBefore: true },
        can('finance.view') && { id: 'print', label: 'Print', icon: <Printer size={13} />, onPress: () => handlers.onPrint(document) },
        can('finance.view') && document.hasPdf && { id: 'download-pdf', label: 'Download PDF', icon: <Download size={13} />, onPress: () => handlers.onDownloadPdf(document) },
        can('finance.view') && document.hasExcel && { id: 'download-excel', label: 'Download Excel', icon: <FileSpreadsheet size={13} />, onPress: () => handlers.onDownloadExcel(document) },
        can('finance.documents.update') && { id: 'generate-pdf', label: document.hasPdf ? 'Regenerate PDF' : 'Generate PDF', icon: <FileText size={13} />, onPress: () => handlers.onGeneratePdf(document), tone: 'accent', dividerBefore: true },
        can('finance.documents.update') && { id: 'generate-excel', label: document.hasExcel ? 'Regenerate Excel' : 'Generate Excel', icon: <FileSpreadsheet size={13} />, onPress: () => handlers.onGenerateExcel(document), tone: 'accent' },
        can('finance.documents.issue') && document.type === 'quote' && { id: 'accept', label: 'Accept quote', icon: <CheckCircle2 size={13} />, onPress: () => handlers.onAccept(document), tone: 'success', dividerBefore: true },
        can('finance.documents.create') && document.type === 'quote' && { id: 'convert', label: 'Convert to invoice', icon: <RefreshCw size={13} />, onPress: () => handlers.onConvert(document), tone: 'accent' },
        can('finance.documents.issue') && document.type === 'quote' && { id: 'reject', label: 'Reject quote', icon: <XCircle size={13} />, onPress: () => handlers.onReject(document), tone: 'danger' },
        can('finance.payments.create') && document.type === 'invoice' && { id: 'payment', label: 'Register payment', icon: <WalletCards size={13} />, onPress: () => handlers.onPayment(document), tone: 'success', dividerBefore: true },
        can('finance.documents.cancel') && { id: 'cancel', label: 'Cancel document', icon: <XCircle size={13} />, onPress: () => handlers.onCancel(document), tone: 'danger', dividerBefore: document.type !== 'quote' },
        can('finance.documents.delete') && { id: 'delete', label: 'Delete', icon: <Trash2 size={13} />, onPress: () => handlers.onDelete(document), tone: 'danger' },
    ].filter((action): action is FinanceRowAction => Boolean(action));
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

    return <FinanceRowActions actions={createFinanceDocumentActions(document, handlers, can)} visibleCount={visibleCount} className={className} buttonClassName={buttonClassName} />;
}
