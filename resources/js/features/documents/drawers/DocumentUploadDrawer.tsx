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
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DocumentUploadPayload) => void;
    errors?: FormErrors;
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
    onOpenChange,
    onSubmit,
    errors = {},
}: DocumentUploadDrawerProps) {
    const [form, setForm] = useState<DocumentUploadPayload>(emptyForm);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm(emptyForm);
            setFileName('');
        }
    }, [isOpen]);

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

        setForm((current) => ({
            ...current,
            file,
        }));

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
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="document-upload-form">
                        Save document
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
                    <h3 className="mb-3 text-sm font-semibold">File</h3>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-[var(--surface)] p-6 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]">
                        <UploadCloud size={26} className="text-[var(--accent)]" />

                        <span className="mt-3 text-sm font-semibold">
                            {fileName || 'Choose file'}
                        </span>

                        <span className="mt-1 text-xs text-[var(--text-muted)]">
                            PDF, image, DOCX, or office file. Max 20 MB.
                        </span>

                        <input
                            type="file"
                            className="hidden"
                            onChange={(event) => handleFileChange(event.target.files)}
                        />
                    </label>

                    {firstError(errors, 'file') ? (
                        <p className="mt-2 text-xs font-medium text-[var(--danger)]">
                            {firstError(errors, 'file')}
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