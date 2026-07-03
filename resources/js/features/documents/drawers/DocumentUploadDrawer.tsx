import { FormEvent, useEffect, useState } from 'react';
import type { Key } from 'react-aria-components';
import { UploadCloud } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    DocumentTemplateOption,
    DocumentUploadPayload,
    DossierOption,
} from '@/features/documents/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';

type DocumentUploadDrawerProps = {
    isOpen: boolean;
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    initialDossierId?: string;
    initialTemplateId?: string;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DocumentUploadPayload) => void;
    errors?: FormErrors;
    isSubmitting?: boolean;
};

const emptyForm: DocumentUploadPayload = {
    dossierId: '',
    documentTemplateId: '',
    status: 'uploaded',
    notes: '',
    file: null,
};

const statusOptions = [
    { id: 'uploaded', label: 'Uploaded' },
    { id: 'verified', label: 'Verified' },
    { id: 'missing', label: 'Missing' },
    { id: 'rejected', label: 'Rejected' },
];

export function DocumentUploadDrawer({
    isOpen,
    dossiers,
    templates,
    initialDossierId = '',
    initialTemplateId = '',
    onOpenChange,
    onSubmit,
    errors = {},
    isSubmitting = false,
}: DocumentUploadDrawerProps) {
    const [form, setForm] = useState<DocumentUploadPayload>(emptyForm);
    const [fileName, setFileName] = useState('');
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({
                ...emptyForm,
                dossierId: initialDossierId,
                documentTemplateId: initialTemplateId,
            });
            setFileName('');
            setFileError('');
        }
    }, [initialDossierId, initialTemplateId, isOpen]);

    function updateField(field: keyof DocumentUploadPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof DocumentUploadPayload, value: Key | null) {
        setForm((current) => ({
            ...current,
            [field]: value ? String(value) : '',
        }));
    }

    function handleFileChange(fileList: FileList | null) {
        const file = fileList?.[0] ?? null;

        if (file && file.size > 20 * 1024 * 1024) {
            setFileError('File is too large. Maximum size is 20 MB.');
            setForm((current) => ({ ...current, file: null }));
            setFileName('');
            return;
        }

        setFileError('');
        setForm((current) => ({ ...current, file }));
        setFileName(file?.name ?? '');
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Upload document"
            description="Attach a document to a project/dossier."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="document-upload-form" isLoading={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save document'}
                    </AppButton>
                </>
            }
        >
            <form id="document-upload-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Document information</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossiers}
                            error={firstError(errors, 'dossier_id')}
                        />

                        <AppSelect
                            label="Document template"
                            placeholder="Select document type"
                            selectedKey={form.documentTemplateId}
                            onSelectionChange={(value) => updateSelect('documentTemplateId', value)}
                            options={templates}
                            error={firstError(errors, 'document_template_id')}
                        />

                        <AppSelect
                            label="Status"
                            selectedKey={form.status}
                            onSelectionChange={(value) => updateSelect('status', value)}
                            options={statusOptions}
                            error={firstError(errors, 'status')}
                        />
                    </div>
                </section>

                <section>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">File</p>

                    {fileName ? (
                        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                            <UploadCloud size={20} className="shrink-0 text-[var(--accent)]" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{fileName}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">File selected</p>
                            </div>
                            <button type="button" onClick={() => { setFileName(''); setForm((f) => ({ ...f, file: null })); }}
                                className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[11px] text-[var(--text-muted)] transition hover:border-red-400/30 hover:text-red-400">
                                Remove
                            </button>
                        </div>
                    ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]">
                            <UploadCloud size={22} className="text-[var(--accent)]" />
                            <span className="mt-2 text-[13px] font-medium text-[var(--foreground)]">Choose file</span>
                            <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">PDF, image, DOCX, or office file. Max 20 MB.</span>
                            <input type="file" className="hidden" onChange={(event) => handleFileChange(event.target.files)} />
                        </label>
                    )}

                    {fileError || firstError(errors, 'file') ? (
                        <p className="mt-2 text-xs font-medium text-[var(--danger)]">
                            {fileError || firstError(errors, 'file')}
                        </p>
                    ) : null}
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                        error={firstError(errors, 'notes')}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}
