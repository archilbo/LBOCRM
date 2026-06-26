import { router } from '@inertiajs/react';
import { CheckCircle2, CreditCard, Eye, FileDown, FileSpreadsheet, FileText, Pencil, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
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
    return (
        <AppTableActions>
            <AppTableActionButton label="Voir" tone="view" onPress={() => window.open(document.showUrl || `/finance/documents/${document.id}`, '_self')}>
                <Eye size={15} />
            </AppTableActionButton>
            <AppTableActionButton label="Modifier" tone="edit" onPress={() => onEdit(document)}>
                <Pencil size={15} />
            </AppTableActionButton>
            {document.hasPdf || document.pdfDownloadUrl ? (
                <AppTableActionButton label="Telecharger PDF" tone="documents" onPress={() => downloadFile(document.pdfDownloadUrl)}>
                    <FileDown size={15} />
                </AppTableActionButton>
            ) : (
                <AppTableActionButton label="Generer PDF" tone="documents" onPress={() => generateFile(document.generatePdfUrl, 'Generation PDF')}>
                    <FileText size={15} />
                </AppTableActionButton>
            )}
            {document.hasExcel || document.excelDownloadUrl || document.downloadUrl ? (
                <AppTableActionButton label="Telecharger Excel" tone="archive" onPress={() => downloadFile(document.excelDownloadUrl || document.downloadUrl)}>
                    <FileSpreadsheet size={15} />
                </AppTableActionButton>
            ) : (
                <AppTableActionButton label="Generer Excel" tone="archive" onPress={() => generateFile(document.generateExcelUrl, 'Generation Excel')}>
                    <FileSpreadsheet size={15} />
                </AppTableActionButton>
            )}
            {document.type === 'quote' ? (
                <>
                    <AppTableActionButton label="Accepter" tone="create" onPress={() => onAccept(document)}>
                        <CheckCircle2 size={15} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Refuser" tone="delete" onPress={() => onReject(document)}>
                        <XCircle size={15} />
                    </AppTableActionButton>
                    <AppTableActionButton label="Convertir en facture" tone="documents" onPress={() => onConvert(document)}>
                        <RefreshCw size={15} />
                    </AppTableActionButton>
                </>
            ) : null}
            {document.type === 'invoice' ? (
                <AppTableActionButton label="Paiement" tone="create" onPress={() => onPayment(document)}>
                    <CreditCard size={15} />
                </AppTableActionButton>
            ) : null}
            <AppTableActionButton label="Supprimer" tone="delete" onPress={() => onDelete(document)}>
                <Trash2 size={15} />
            </AppTableActionButton>
        </AppTableActions>
    );
}
