import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, FileText, Paperclip, Upload, UploadCloud } from 'lucide-react';
import { ListBox, Select } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    ClientOption,
    DocumentTemplateOption,
    DocumentUploadPayload,
    DossierOption,
} from '@/features/documents/types';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import { cn } from '@/lib/cn';

const triggerSm = 'flex h-8 w-full min-w-0 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] outline-none transition border-[var(--border)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)]';
const popover = 'z-[70] min-w-[var(--trigger-width)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg';
const itemClass = 'flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs text-[var(--foreground)] outline-none transition hover:bg-[var(--surface-2)] data-[focus-visible]:bg-[var(--surface-2)] data-[selected]:bg-[var(--accent)]/10';

function HeroSelect<T extends string>({ placeholder, options, value, onChange, error, isDisabled }: {
    placeholder: string; options: { id: T; label: string }[]; value: T | ''; onChange: (v: T) => void; error?: string; isDisabled?: boolean;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <Select
                selectedKey={value || null}
                onSelectionChange={(k) => onChange((k ?? '') as T)}
                placeholder={placeholder}
                shouldCloseOnBlur={false}
                aria-label={placeholder}
                isDisabled={isDisabled}
            >
                <Select.Trigger className={cn(triggerSm, error && 'border-[var(--danger)]')}>
                    <Select.Value className="flex-1 truncate text-left text-xs" />
                    <Select.Indicator>
                        <ChevronDown size={14} className="text-[var(--text-muted)]" />
                    </Select.Indicator>
                </Select.Trigger>
                <Select.Popover isNonModal className={popover}>
                    <ListBox className="max-h-56 overflow-y-auto p-1">
                        {options.map((opt) => (
                            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label} className={itemClass}>
                                {opt.label}
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
            {error ? <p className="text-[10px] font-medium text-[var(--danger)]">{error}</p> : null}
        </div>
    );
}

type DocumentUploadDrawerProps = {
    isOpen: boolean;
    clients: ClientOption[];
    dossiers: DossierOption[];
    templates: DocumentTemplateOption[];
    initialClientId?: string;
    initialDossierId?: string;
    initialTemplateId?: string;
    lockProject?: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: DocumentUploadPayload) => void;
    errors?: FormErrors;
    isSubmitting?: boolean;
};

const emptyForm: DocumentUploadPayload = {
    dossierId: '',
    documentTemplateId: '',
    status: 'verified',
    notes: '',
    file: null,
};

const statusOptions = [
    { id: 'uploaded', label: 'Uploadé' },
    { id: 'verified', label: 'Vérifié' },
    { id: 'missing', label: 'Manquant' },
    { id: 'rejected', label: 'Rejeté' },
];

export function DocumentUploadDrawer({
    isOpen,
    clients,
    dossiers,
    templates,
    initialClientId = '',
    initialDossierId = '',
    initialTemplateId = '',
    lockProject = false,
    onOpenChange,
    onSubmit,
    errors = {},
    isSubmitting = false,
}: DocumentUploadDrawerProps) {
    const [form, setForm] = useState<DocumentUploadPayload>(emptyForm);
    const [selectedClientId, setSelectedClientId] = useState(initialClientId);
    const [fileName, setFileName] = useState('');
    const [fileError, setFileError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({
                ...emptyForm,
                dossierId: initialDossierId,
                documentTemplateId: initialTemplateId,
            });
            setSelectedClientId(initialClientId);
            setFileName('');
            setFileError('');
        }
    }, [initialClientId, initialDossierId, initialTemplateId, isOpen]);

    const filteredDossiers = useMemo(() => {
        if (!selectedClientId) return [];
        return dossiers.filter((d) => d.clientId === selectedClientId);
    }, [dossiers, selectedClientId]);

    const dossierSelectDisabled = !selectedClientId;

    function updateField(field: keyof DocumentUploadPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof DocumentUploadPayload, value: string) {
        setForm((current) => ({
            ...current,
            [field]: value || '',
        }));
    }

    function handleClientChange(value: string) {
        const clientId = value || '';
        setSelectedClientId(clientId);
        if (clientId !== selectedClientId) {
            const currentDossierBelongsToClient = clientId
                ? dossiers.some((d) => d.id === form.dossierId && d.clientId === clientId)
                : false;
            if (!currentDossierBelongsToClient) {
                setForm((current) => ({ ...current, dossierId: '' }));
            }
        }
    }

    function handleFileChange(fileList: FileList | null) {
        const file = fileList?.[0] ?? null;
        if (file && file.size > 20 * 1024 * 1024) {
            setFileError('Le fichier est trop volumineux. Maximum 20 Mo.');
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
            title="Téléverser un document"
            description="Attachez un document à un projet."
            footer={
                <div className="flex w-full items-center justify-end gap-2">
                    <AppButton variant="light" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>
                        Annuler
                    </AppButton>
                    <AppButton variant="solid" color="primary" type="submit" form="document-upload-form" isLoading={isSubmitting}>
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </AppButton>
                </div>
            }
        >
            <form id="document-upload-form" className="space-y-3" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <FileText size={12} /> Informations document
                    </p>
                    <div className="grid gap-2">
                        <HeroSelect
                            placeholder="Sélectionner un client"
                            value={selectedClientId}
                            onChange={handleClientChange}
                            options={clients}
                            error={firstError(errors, 'client_id')}
                            isDisabled={lockProject}
                        />
                        <HeroSelect
                            placeholder={dossierSelectDisabled ? 'Sélectionnez un client d\'abord' : 'Sélectionner un dossier'}
                            value={form.dossierId}
                            onChange={(v) => updateSelect('dossierId', v)}
                            options={filteredDossiers}
                            error={firstError(errors, 'dossier_id')}
                            isDisabled={dossierSelectDisabled || lockProject}
                        />
                        {templates.length > 0 && (
                            <HeroSelect
                                placeholder="Type de document"
                                value={form.documentTemplateId}
                                onChange={(v) => updateSelect('documentTemplateId', v)}
                                options={templates}
                                error={firstError(errors, 'document_template_id')}
                            />
                        )}
                        <HeroSelect
                            placeholder="Statut"
                            value={form.status}
                            onChange={(v) => updateSelect('status', v)}
                            options={statusOptions}
                            error={firstError(errors, 'status')}
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <Paperclip size={12} /> Fichier
                    </p>
                    {fileName ? (
                        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
                            <UploadCloud size={16} className="shrink-0 text-[var(--accent)]" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-[var(--foreground)]">{fileName}</p>
                                <p className="text-[10px] text-[var(--text-muted)]">Fichier sélectionné</p>
                            </div>
                            <button type="button" onClick={() => { setFileName(''); setForm((f) => ({ ...f, file: null })); }}
                                className="flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[10px] text-[var(--text-muted)] transition hover:border-red-400/30 hover:text-red-400">
                                Retirer
                            </button>
                        </div>
                    ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]">
                            <Upload size={18} className="text-[var(--accent)]" />
                            <span className="mt-1.5 text-xs font-medium text-[var(--foreground)]">Choisir un fichier</span>
                            <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">PDF, image, DOCX. Max 20 Mo.</span>
                            <input type="file" className="hidden" onChange={(event) => handleFileChange(event.target.files)} />
                        </label>
                    )}
                    {fileError || firstError(errors, 'file') ? (
                        <p className="mt-1.5 text-[10px] font-medium text-[var(--danger)]">
                            {fileError || firstError(errors, 'file')}
                        </p>
                    ) : null}
                </div>

                <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)]">
                        <FileText size={12} /> Notes
                    </p>
                    <AppTextarea
                        placeholder="Notes internes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                        error={firstError(errors, 'notes')}
                        size="sm"
                    />
                </div>
            </form>
        </AppDrawer>
    );
}
