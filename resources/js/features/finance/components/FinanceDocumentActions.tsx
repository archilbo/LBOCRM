import { router } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Eye, FileDown, FileSpreadsheet, FileText, FolderOpen, Pencil, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { FinanceRowActions, type FinanceRowAction } from '@/features/finance/components/FinanceRowActions';
import type { FinanceDocument } from '@/features/finance/types';

type FinanceDocumentActionsProps = {
    document: FinanceDocument;
    onEdit: (document: FinanceDocument) => void;
    onAccept: (document: FinanceDocument) => void;
    onReject: (document: FinanceDocument) => void;
    onConvert: (document: FinanceDocument) => void;
    onPayment: (document: FinanceDocument) => void;
    onDelete: (document: FinanceDocument) => void;
};

function generateFile(url: string | null | undefined, label: string) {
    if (!url) {
        toast.error('Action indisponible.');
        return;
    }

    router.put(url, {}, {
        preserveScroll: true,
        onStart: () => toast.loading(`${label} en cours...`, { id: label }),
        onSuccess: () => toast.success(`${label} termine.`, { id: label }),
        onError: () => toast.error(`${label} impossible.`, { id: label }),
    });
}

function revealFiles(url: string | null | undefined) {
    if (!url) {
        toast.error('Aucun emplacement disponible.');
        return;
    }

    router.post(url, {}, {
        preserveScroll: true,
        onSuccess: () => toast.success('Emplacement ouvert dans Explorer.'),
        onError: () => toast.error('Impossible d ouvrir Explorer.'),
    });
}
function downloadFile(url: string | null | undefined) {
    if (!url) {
        toast.error('Fichier indisponible.');
        return;
    }

    window.open(url, '_blank');
}

export function FinanceDocumentActions({
    document,
    onEdit,
    onAccept,
    onReject,
    onConvert,
    onPayment,
    onDelete,
}: FinanceDocumentActionsProps) {
    const actions = ([
        { id: 'view', label: 'Voir', icon: <Eye size={14} />, onPress: () => window.open(document.showUrl || `/finance/documents/${document.id}`, '_self') },
        { id: 'edit', label: 'Modifier', icon: <Pencil size={14} />, onPress: () => onEdit(document) },
        document.pdfDownloadUrl && { id: 'download-pdf', label: 'Telecharger PDF', icon: <FileDown size={14} />, onPress: () => downloadFile(document.pdfDownloadUrl), tone: 'accent', dividerBefore: true },
        { id: 'generate-pdf', label: document.hasPdf ? 'Regenerer PDF' : 'Generer PDF', icon: <FileText size={14} />, onPress: () => generateFile(document.generatePdfUrl, 'Generation PDF'), tone: 'accent' },
        (document.excelDownloadUrl || document.downloadUrl) && { id: 'download-excel', label: 'Telecharger Excel', icon: <FileSpreadsheet size={14} />, onPress: () => downloadFile(document.excelDownloadUrl || document.downloadUrl), tone: 'accent' },
        { id: 'generate-excel', label: document.hasExcel ? 'Regenerer Excel' : 'Generer Excel', icon: <FileSpreadsheet size={14} />, onPress: () => generateFile(document.generateExcelUrl, 'Generation Excel'), tone: 'accent' },
        document.revealFilesUrl && { id: 'reveal', label: 'Afficher dans Explorer', icon: <FolderOpen size={14} />, onPress: () => revealFiles(document.revealFilesUrl) },
        document.type === 'quote' && { id: 'accept', label: 'Accepter', icon: <CheckCircle2 size={14} />, onPress: () => onAccept(document), tone: 'success', dividerBefore: true },
        document.type === 'quote' && { id: 'convert', label: 'Convertir en facture', icon: <RefreshCw size={14} />, onPress: () => onConvert(document), tone: 'accent' },
        document.type === 'quote' && { id: 'reject', label: 'Refuser', icon: <XCircle size={14} />, onPress: () => onReject(document), tone: 'danger' },
        document.type === 'invoice' && { id: 'payment', label: 'Paiement', icon: <CreditCard size={14} />, onPress: () => onPayment(document), tone: 'success', dividerBefore: true },
        { id: 'delete', label: 'Supprimer', icon: <Trash2 size={14} />, onPress: () => onDelete(document), tone: 'danger', dividerBefore: true },
    ] as Array<FinanceRowAction | false | null | undefined>)
        .filter((action): action is FinanceRowAction => Boolean(action));

    return <FinanceRowActions actions={actions} />;
}
