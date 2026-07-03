import { FormEvent, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { useTranslation } from '@/lib/i18n';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    dossierId: number;
    dossierNumber: string;
    requirementKey: string | null;
    stepKey: string | null;
    clientId: number;
    documentLabel?: string;
};

export function UploadDocumentDrawer({
    isOpen,
    onOpenChange,
    dossierId,
    dossierNumber,
    requirementKey,
    stepKey,
    clientId,
    documentLabel,
}: Props) {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function reset() {
        setFile(null);
        setNotes('');
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!file && !notes) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('dossier_id', String(dossierId));
        if (file) formData.append('file', file);
        if (notes) formData.append('notes', notes);
        const returnUrl = `/clients/${clientId}?tab=workflow&dossier_id=${dossierId}`;
        formData.append('return_to', returnUrl);

        router.post('/documents', formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('workflow.documentUploaded'));
                reset();
                onOpenChange(false);
            },
            onError: (errors) => {
                toast.error(Object.values(errors).join(', ') || t('workflow.uploadFailed'));
            },
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={(open) => { if (!open) reset(); onOpenChange(open); }}
            title={documentLabel || t('workflow.uploadDocument')}
            description={`${dossierNumber}${requirementKey ? ` / ${requirementKey}` : ''}`}
            footer={(
                <div className="flex items-center justify-end gap-2">
                    <AppButton variant="bordered" onPress={() => { reset(); onOpenChange(false); }}>
                        {t('clients.cancel')}
                    </AppButton>
                    <AppButton variant="solid" isDisabled={!file && !notes} isLoading={submitting} onPress={handleSubmit as VoidFunction}>
                        {t('clients.save')}
                    </AppButton>
                </div>
            )}
        >
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-5">
                <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-[var(--foreground)]">
                        {t('workflow.fileLabel')}
                    </label>
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 p-6 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                    >
                        {file ? (
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-medium text-[var(--foreground)]">{file.name}</span>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="flex size-6 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--danger)]">
                                    <X size={13} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload size={24} className="text-[var(--text-muted)]" />
                                <p className="text-[12px] font-medium text-[var(--text-muted)]">{t('workflow.clickToUpload')}</p>
                                <p className="text-[10px] text-[var(--text-subtle)]">PDF, DOCX, XLSX, JPG, PNG &mdash; max 20MB</p>
                            </div>
                        )}
                        <input ref={inputRef} type="file" accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                            className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    </div>
                </div>

                <AppTextarea
                    label={t('workflow.notes')}
                    placeholder={t('workflow.notesPlaceholder')}
                    value={notes}
                    onChange={setNotes}
                />
            </form>
        </AppDrawer>
    );
}
