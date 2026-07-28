import { CheckCircle2, Download, Eye, FileSpreadsheet, FileText, Pencil, Printer, RefreshCw, Trash2, WalletCards, XCircle } from 'lucide-react';
import { FinanceRowActions, type FinanceRowAction } from '@/features/finance/components/FinanceRowActions';
import type { FinanceDocument } from '@/features/finance/types';

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
): FinanceRowAction[] {
    return [
        { id: 'open', label: 'Ouvrir la fiche', icon: <Eye size={13} />, onPress: () => handlers.onOpen(document) },
        { id: 'edit', label: 'Modifier', icon: <Pencil size={13} />, onPress: () => handlers.onEdit(document) },
        { id: 'preview', label: 'Aperçu du document', icon: <FileText size={13} />, onPress: () => handlers.onPreview(document), dividerBefore: true },
        { id: 'print', label: 'Imprimer', icon: <Printer size={13} />, onPress: () => handlers.onPrint(document) },
        document.hasPdf && { id: 'download-pdf', label: 'Télécharger PDF', icon: <Download size={13} />, onPress: () => handlers.onDownloadPdf(document) },
        document.hasExcel && { id: 'download-excel', label: 'Télécharger Excel', icon: <FileSpreadsheet size={13} />, onPress: () => handlers.onDownloadExcel(document) },
        { id: 'generate-pdf', label: document.hasPdf ? 'Regénérer PDF' : 'Générer PDF', icon: <FileText size={13} />, onPress: () => handlers.onGeneratePdf(document), tone: 'accent', dividerBefore: true },
        { id: 'generate-excel', label: document.hasExcel ? 'Regénérer Excel' : 'Générer Excel', icon: <FileSpreadsheet size={13} />, onPress: () => handlers.onGenerateExcel(document), tone: 'accent' },
        document.type === 'quote' && { id: 'accept', label: 'Accepter le devis', icon: <CheckCircle2 size={13} />, onPress: () => handlers.onAccept(document), tone: 'success', dividerBefore: true },
        document.type === 'quote' && { id: 'convert', label: 'Convertir en facture', icon: <RefreshCw size={13} />, onPress: () => handlers.onConvert(document), tone: 'accent' },
        document.type === 'quote' && { id: 'reject', label: 'Refuser le devis', icon: <XCircle size={13} />, onPress: () => handlers.onReject(document), tone: 'danger' },
        document.type === 'invoice' && { id: 'payment', label: 'Enregistrer un paiement', icon: <WalletCards size={13} />, onPress: () => handlers.onPayment(document), tone: 'success', dividerBefore: true },
        { id: 'cancel', label: 'Annuler le document', icon: <XCircle size={13} />, onPress: () => handlers.onCancel(document), tone: 'danger', dividerBefore: document.type !== 'quote' },
        { id: 'delete', label: 'Supprimer', icon: <Trash2 size={13} />, onPress: () => handlers.onDelete(document), tone: 'danger' },
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
    return <FinanceRowActions actions={createFinanceDocumentActions(document, handlers)} visibleCount={visibleCount} className={className} buttonClassName={buttonClassName} />;
}
