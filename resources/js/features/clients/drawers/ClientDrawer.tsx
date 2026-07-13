import { FormEvent, useEffect, useRef, useState } from 'react';
import type { Key } from 'react-aria-components';
import { ImageUp, Loader2, ScanLine, Upload, X } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { AppTextField } from '@/components/ui/AppTextField';
import { useTranslation } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { CinScanResult, ClientFormPayload, ClientRow, IntermediaryOption } from '@/features/clients/types';
import { cn } from '@/lib/cn';

const CIVILITY_OPTIONS = [
    { id: 'Mr', label: 'Mr' },
    { id: 'Ms', label: 'Ms' },
    { id: 'Mrs', label: 'Mrs' },
];

type ClientDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    client: ClientRow | null;
    intermediaries: IntermediaryOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ClientFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: ClientFormPayload = {
    civility: 'Mr', firstName: '', lastName: '', cin: '', phone: '', email: '',
    address: '', fatherName: '', motherName: '', cniExpirationDate: '',
    intermediaryId: '', notes: '',
};

function UploadZone({ label, file, preview, onSelect, onClear }: {
    label: string;
    file: File | null;
    preview: string | null;
    onSelect: (f: File) => void;
    onClear: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div
            onClick={() => !file && inputRef.current?.click()}
            className={cn(
                'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition',
                file
                    ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface-2)]',
            )}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onSelect(f);
                }}
            />
            {preview ? (
                <>
                    <img src={preview} alt={label}
                        className="mb-2 max-h-32 rounded-lg object-contain" />
                    <span className="text-[11px] font-medium text-[var(--foreground)]">{file?.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/20">
                        <X size={12} />
                    </button>
                </>
            ) : (
                <>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                        <ImageUp size={20} />
                    </div>
                    <span className="text-[12px] font-medium text-[var(--text-muted)]">{label}</span>
                    <span className="mt-0.5 text-[10px] text-[var(--text-subtle)]">Click to upload (JPG/PNG)</span>
                </>
            )}
        </div>
    );
}

export function ClientDrawer({ isOpen, mode, client, intermediaries, onOpenChange, onSubmit, errors = {} }: ClientDrawerProps) {
    const { t } = useTranslation();
    const [form, setForm] = useState<ClientFormPayload>(emptyForm);
    const [inputMode, setInputMode] = useState<'manual' | 'scan'>('manual');
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setInputMode('manual');
        setFrontFile(null);
        setBackFile(null);
        setFrontPreview(null);
        setBackPreview(null);
        setIsScanning(false);
        setScanError(null);
        if (mode === 'edit' && client) {
            setForm({
                civility: client.civility ?? 'Mr',
                firstName: client.firstName ?? '',
                lastName: client.lastName ?? '',
                cin: client.cin ?? '',
                phone: client.phone ?? '',
                email: client.email ?? '',
                address: client.address ?? '',
                fatherName: client.fatherName ?? '',
                motherName: client.motherName ?? '',
                cniExpirationDate: client.cniExpirationDate ?? '',
                intermediaryId: client.intermediaryId ?? '',
                notes: client.notes ?? '',
            });
            return;
        }
        setForm(emptyForm);
    }, [client, isOpen, mode]);

    useEffect(() => {
        return () => {
            if (frontPreview) URL.revokeObjectURL(frontPreview);
            if (backPreview) URL.revokeObjectURL(backPreview);
        };
    }, [frontPreview, backPreview]);

    function updateField(field: keyof ClientFormPayload, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    function handleFrontSelect(file: File) {
        if (frontPreview) URL.revokeObjectURL(frontPreview);
        setFrontFile(file);
        setFrontPreview(URL.createObjectURL(file));
        setScanError(null);
    }

    function handleBackSelect(file: File) {
        if (backPreview) URL.revokeObjectURL(backPreview);
        setBackFile(file);
        setBackPreview(URL.createObjectURL(file));
        setScanError(null);
    }

    function handleFrontClear() {
        if (frontPreview) URL.revokeObjectURL(frontPreview);
        setFrontFile(null);
        setFrontPreview(null);
    }

    function handleBackClear() {
        if (backPreview) URL.revokeObjectURL(backPreview);
        setBackFile(null);
        setBackPreview(null);
    }

    async function handleScan() {
        if (!frontFile || !backFile) return;
        setIsScanning(true);
        setScanError(null);
        const formData = new FormData();
        formData.append('front_image', frontFile);
        formData.append('back_image', backFile);

        try {
            const res = await fetch('/clients/scan-cin', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                    'Accept': 'application/json',
                },
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                setScanError(err.message || err.error || 'Failed to analyze CIN. Please try again.');
                return;
            }
            const data: CinScanResult = await res.json();
            const recto = data.recto ?? {};
            const verso = data.verso ?? {};

            if (!recto.cin_number && !recto.first_name && !recto.last_name && !verso.address) {
                setScanError('AI could not read the CIN card. Please use sharper images with even lighting and try again.');
                setIsScanning(false);
                return;
            }

            const sexToCivility: Record<string, string> = { M: 'Mr', F: 'Ms' };

            let fatherName = '';
            let motherName = '';
            const filiation = verso.filiation ?? '';
            if (filiation) {
                const raw = filiation.replace(/fils\s+de|fille\s+de|enfant\s+de/i, '').trim();
                const parts = raw.split(/\s*et\s*/i).filter(Boolean);
                if (parts.length >= 2) {
                    fatherName = parts[0].trim();
                    motherName = parts[1].trim();
                } else if (parts.length === 1) {
                    fatherName = parts[0].trim();
                }
            }

            setForm((prev) => ({
                ...prev,
                civility: (verso.sex ? sexToCivility[verso.sex] : null) || prev.civility,
                firstName: recto.first_name || prev.firstName,
                lastName: recto.last_name || prev.lastName,
                cin: recto.cin_number || prev.cin,
                fatherName: fatherName || prev.fatherName,
                motherName: motherName || prev.motherName,
                cniExpirationDate: recto.expiry_date || prev.cniExpirationDate,
            }));
            setInputMode('manual');
            setFrontFile(null);
            setBackFile(null);
            if (frontPreview) URL.revokeObjectURL(frontPreview);
            if (backPreview) URL.revokeObjectURL(backPreview);
            setFrontPreview(null);
            setBackPreview(null);
        } catch {
            setScanError('Network error. Please check your connection and try again.');
        } finally {
            setIsScanning(false);
        }
    }

    const title = mode === 'create' ? t('clients.drawer.createTitle') : t('clients.drawer.editTitle');
    const description = mode === 'create' ? t('clients.drawer.createDescription') : t('clients.drawer.editDescription');

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            footer={
                <>
                    <AppButton variant="bordered" onPress={() => onOpenChange(false)}>
                        {t('clients.cancel')}
                    </AppButton>
                    <AppButton variant="solid" color="primary" type="submit" form="client-form"
                        isDisabled={mode === 'create' && inputMode === 'scan'}>
                        {mode === 'create' ? t('clients.create') : t('clients.save')}
                    </AppButton>
                </>
            }
        >
            <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
                <AppFormErrorSummary errors={errors} />

                {mode === 'create' && (
                    <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                        <button type="button" onClick={() => setInputMode('manual')}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 py-2.5 text-[12px] font-medium transition',
                                inputMode === 'manual'
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
                            )}>
                            <Upload size={14} /> Manual entry
                        </button>
                        <button type="button" onClick={() => setInputMode('scan')}
                            className={cn(
                                'flex flex-1 items-center justify-center gap-2 py-2.5 text-[12px] font-medium transition',
                                inputMode === 'scan'
                                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
                            )}>
                            <ScanLine size={14} /> Scan CIN
                        </button>
                    </div>
                )}

                {inputMode === 'scan' ? (
                    <div className="space-y-4">
                        <p className="text-[12px] text-[var(--text-muted)]">
                            Upload the front and back of the client&apos;s CIN card. The system will extract identity information automatically.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <UploadZone label="Front of CIN" file={frontFile} preview={frontPreview}
                                onSelect={handleFrontSelect} onClear={handleFrontClear} />
                            <UploadZone label="Back of CIN" file={backFile} preview={backPreview}
                                onSelect={handleBackSelect} onClear={handleBackClear} />
                        </div>

                        {scanError && (
                            <p className="text-[12px] font-medium text-[var(--danger)]">{scanError}</p>
                        )}

                        <AppButton variant="solid" color="primary" className="w-full"
                            isDisabled={!frontFile || !backFile || isScanning}
                            isLoading={isScanning}
                            onPress={handleScan}>
                            {isScanning ? 'Analyzing CIN...' : 'Analyze CIN'}
                        </AppButton>
                    </div>
                ) : null}

                {inputMode === 'manual' ? (
                    <>
                        {/* ── Identity section ── */}
                        <div>
                            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                                {t('clients.form.identity')}
                            </p>
                            <div className="space-y-3">
                                <AppSelect
                                    label={t('clients.form.civility')}
                                    placeholder="Select civility"
                                    options={CIVILITY_OPTIONS}
                                    selectedKey={form.civility || null}
                                    onSelectionChange={(key: Key | null) => updateField('civility', key ? String(key) : 'Mr')}
                                    error={errors.civility}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <AppTextField
                                        label={t('clients.form.firstName')}
                                        placeholder={t('clients.form.firstNamePlaceholder')}
                                        value={form.firstName}
                                        onChange={(v) => updateField('firstName', v)}
                                        error={errors.first_name}
                                    />
                                    <AppTextField
                                        label={t('clients.form.lastName')}
                                        placeholder={t('clients.form.lastNamePlaceholder')}
                                        value={form.lastName}
                                        onChange={(v) => updateField('lastName', v)}
                                        error={errors.last_name}
                                    />
                                </div>
                                <AppTextField
                                    label={t('clients.form.cin')}
                                    placeholder={t('clients.form.cinPlaceholder')}
                                    value={form.cin}
                                    onChange={(v) => updateField('cin', v)}
                                    error={errors.cin}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <AppTextField
                                        label={t('clients.form.fatherName')}
                                        placeholder="Father name"
                                        value={form.fatherName}
                                        onChange={(v) => updateField('fatherName', v)}
                                        error={errors.father_name}
                                    />
                                    <AppTextField
                                        label={t('clients.form.motherName')}
                                        placeholder="Mother name"
                                        value={form.motherName}
                                        onChange={(v) => updateField('motherName', v)}
                                        error={errors.mother_name}
                                    />
                                </div>
                                <AppTextField
                                    label={t('clients.form.cniExpirationDate')}
                                    type="date"
                                    value={form.cniExpirationDate}
                                    onChange={(v) => updateField('cniExpirationDate', v)}
                                    error={errors.cni_expiration_date}
                                />
                            </div>
                        </div>

                        {/* ── Contact section ── */}
                        <div>
                            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                                {t('clients.form.contact')}
                            </p>
                            <div className="space-y-3">
                                <AppTextField
                                    label={t('clients.form.phone')}
                                    placeholder={t('clients.form.phonePlaceholder')}
                                    value={form.phone}
                                    onChange={(v) => updateField('phone', v)}
                                    error={errors.phone}
                                />
                                <AppTextField
                                    label={t('clients.form.email')}
                                    placeholder={t('clients.form.emailPlaceholder')}
                                    value={form.email}
                                    onChange={(v) => updateField('email', v)}
                                    error={errors.email}
                                />
                                <AppTextField
                                    label={t('clients.form.address')}
                                    placeholder={t('clients.form.addressPlaceholder')}
                                    value={form.address}
                                    onChange={(v) => updateField('address', v)}
                                    error={errors.address}
                                />
                            </div>
                        </div>

                        {/* ── Relationship section ── */}
                        <div>
                            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                                {t('clients.form.extra')}
                            </p>
                            <div className="space-y-3">
                                <AppSelect
                                    label={t('clients.form.intermediaryName')}
                                    placeholder={t('clients.selectIntermediary')}
                                    options={intermediaries}
                                    selectedKey={form.intermediaryId || null}
                                    onSelectionChange={(key: Key | null) => updateField('intermediaryId', key ? String(key) : '')}
                                    error={errors.intermediary_id}
                                />
                                <AppTextarea
                                    label={t('clients.form.notes')}
                                    placeholder={t('clients.form.notesPlaceholder')}
                                    value={form.notes}
                                    onChange={(v) => updateField('notes', v)}
                                    error={errors.notes}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </>
                ) : null}
            </form>
        </AppDrawer>
    );
}
