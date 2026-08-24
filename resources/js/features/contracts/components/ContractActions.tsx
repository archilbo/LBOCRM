import { router } from '@inertiajs/react';
import { IconCircleCheck, IconDots, IconDownload, IconFileDownload, IconFileText, IconFileUpload, IconPencil, IconPrinter, IconTrash } from '@tabler/icons-react';
import { Button, Dropdown } from '@heroui/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppModal } from '@/components/ui/AppModal';
import { useTranslation } from '@/lib/i18n';

export type ContractActionData = {
    id: number;
    contractNumber: string;
    status: string;
    hasGeneratedDocument?: boolean;
    hasGeneratedDoc?: boolean;
    hasPdf?: boolean;
};

type Props = {
    contract: ContractActionData;
    returnTo: string;
    onEdit?: () => void;
    onOpenDocuments?: () => void;
    signedOverride?: boolean;
    onSignedChange?: (signed: boolean) => void;
};

export function ContractActions({ contract, returnTo, onEdit, onOpenDocuments, signedOverride = false, onSignedChange }: Props) {
    const { t } = useTranslation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [generating, setGenerating] = useState<'docx' | 'pdf' | null>(null);
    const isSigned = signedOverride || contract.status === 'signed';
    const hasGeneratedDocument = contract.hasGeneratedDocument ?? contract.hasGeneratedDoc ?? false;
    const hasPdf = contract.hasPdf ?? false;

    function generate(type: 'docx' | 'pdf') {
        const label = type === 'pdf' ? 'PDF' : 'DOCX';
        setGenerating(type);
        toast.loading(t('dossiers.show.contract.generationLoading', { label }));
        router.put(type === 'pdf' ? `/contracts/${contract.id}/export-pdf` : `/contracts/${contract.id}/generate`, { return_to: returnTo }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.dismiss();
                toast.success(t('dossiers.show.contract.generationSuccess', { label }));
                setGenerating(null);
            },
            onError: () => {
                toast.dismiss();
                toast.error(t('dossiers.show.contract.generationFailed', { label }));
                setGenerating(null);
            },
        });
    }

    function markSigned() {
        onSignedChange?.(true);
        router.put(`/contracts/${contract.id}/signed`, { return_to: returnTo }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success(t('dossiers.show.contract.markedSignedSuccess')),
            onError: () => {
                onSignedChange?.(false);
                toast.error(t('dossiers.show.contract.markSignedFailed'));
            },
        });
    }

    function deleteContract() {
        setIsDeleting(true);
        router.post(`/contracts/${contract.id}`, { _method: 'DELETE', return_to: returnTo }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setIsDeleting(false);
                toast.success(t('dossiers.show.contract.deletedSuccess'));
            },
            onError: () => {
                setIsDeleting(false);
                toast.error(t('dossiers.show.contract.deleteFailed'));
            },
        });
    }

    return (
        <>
            <div className="flex shrink-0 items-center gap-1">
                {onEdit && !isSigned ? <Button variant="ghost" size="sm" isIconOnly aria-label={t('dossiers.show.edit')} className="size-7 min-w-0 text-[var(--text-muted)]" onPress={onEdit}><IconPencil size={13} /></Button> : null}
                <Dropdown>
                    <Dropdown.Trigger className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] data-[open]:text-[var(--accent)]" aria-label={t('dossiers.show.contract.actions')}>
                        <IconDots size={14} />
                    </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end" className="z-[80] min-w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
                        <Dropdown.Menu aria-label={t('dossiers.show.contract.actions')} disabledKeys={generating ? ['generate-docx', 'generate-pdf'] : []} onAction={(key) => {
                            switch (String(key)) {
                                case 'generate-docx': generate('docx'); break;
                                case 'generate-pdf': generate('pdf'); break;
                                case 'download-docx': window.open(`/contracts/${contract.id}/download/generated`, '_blank', 'noopener'); break;
                                case 'download-pdf': window.open(`/contracts/${contract.id}/download/pdf`, '_blank', 'noopener'); break;
                                case 'print': window.open(`/contracts/${contract.id}/print`, '_blank', 'noopener'); break;
                                case 'documents': onOpenDocuments?.(); break;
                                case 'mark-signed': markSigned(); break;
                                case 'delete': setDeleteOpen(true); break;
                            }
                        }}>
                            <Dropdown.Section>
                                {hasGeneratedDocument ? <Dropdown.Item id="download-docx"><IconFileDownload size={14} className="text-emerald-500" />{t('dossiers.show.contract.downloadDocx')}</Dropdown.Item> : <Dropdown.Item id="generate-docx"><IconFileUpload size={14} className="text-blue-500" />{generating === 'docx' ? t('dossiers.show.contract.generating') : t('dossiers.show.contract.generateDocx')}</Dropdown.Item>}
                                {hasPdf ? <Dropdown.Item id="download-pdf"><IconDownload size={14} className="text-emerald-500" />{t('dossiers.show.contract.downloadPdf')}</Dropdown.Item> : hasGeneratedDocument ? <Dropdown.Item id="generate-pdf"><IconFileText size={14} className="text-violet-500" />{generating === 'pdf' ? t('dossiers.show.contract.generating') : t('dossiers.show.contract.generatePdf')}</Dropdown.Item> : null}
                            </Dropdown.Section>
                            <Dropdown.Item id="print"><IconPrinter size={14} className="text-amber-500" />{t('dossiers.show.contract.print')}</Dropdown.Item>
                            {onOpenDocuments ? <Dropdown.Item id="documents"><IconFileText size={14} className="text-sky-500" />{t('dossiers.show.contract.documents')}</Dropdown.Item> : null}
                            {!isSigned ? <Dropdown.Item id="mark-signed"><IconCircleCheck size={14} className="text-emerald-500" />{t('dossiers.show.contract.markSigned')}</Dropdown.Item> : null}
                            <Dropdown.Section className="mt-1 border-t border-[var(--border)] pt-1"><Dropdown.Item id="delete" className="text-red-500 data-[hover]:bg-red-500/10"><IconTrash size={14} />{t('dossiers.show.contract.delete')}</Dropdown.Item></Dropdown.Section>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </div>

            <AppModal isOpen={deleteOpen} onOpenChange={setDeleteOpen} title={t('dossiers.show.contract.deleteModalTitle')} size="sm">
                <p className="text-sm text-[var(--text-muted)]">{t('dossiers.show.contract.deleteModalBody', { name: contract.contractNumber })}</p>
                <p className="mt-2 text-sm font-medium text-red-500">{t('dossiers.show.contract.deleteModalIrreversible')}</p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="outline" onPress={() => setDeleteOpen(false)} isDisabled={isDeleting}>{t('dossiers.show.contract.cancel')}</Button>
                    <Button variant="danger" onPress={deleteContract} isPending={isDeleting}>{t('dossiers.show.contract.delete')}</Button>
                </div>
            </AppModal>
        </>
    );
}
