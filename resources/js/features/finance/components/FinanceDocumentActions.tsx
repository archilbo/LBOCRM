import { CheckCircle2, CreditCard, Eye, FileDown, Pencil, RefreshCw, Trash2, XCircle } from 'lucide-react';
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
            {document.downloadUrl ? (
                <AppTableActionButton label="Telecharger" tone="documents" onPress={() => window.open(document.downloadUrl || '', '_blank')}>
                    <FileDown size={15} />
                </AppTableActionButton>
            ) : null}
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
