import { FormEvent, useEffect, useRef, useState } from 'react';
import type { Key } from 'react-aria-components';
import { ImageUp, Loader2, ScanLine, Upload, X } from 'lucide-react';
import { Input, TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerSection, DrawerField, DrawerSelect } from '@/components/drawers';
import { drawerStyles, type DrawerBaseProps } from '@/components/drawers';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import { firstError } from '@/lib/formErrors';
import { DateField } from '@/features/archives/components/DateField';
import type { CinScanResult, ClientFormPayload, ClientRow, IntermediaryOption } from '@/features/clients/types';
import type { FormErrors } from '@/lib/formErrors';

const CIVILITY_OPTIONS = [
  { id: 'Mr', label: 'Mr' },
  { id: 'Ms', label: 'Ms' },
  { id: 'Mrs', label: 'Mrs' },
];

type ClientDrawerProps = DrawerBaseProps & {
  mode: 'create' | 'edit';
  client: ClientRow | null;
  intermediaries: IntermediaryOption[];
  onSubmit: (payload: ClientFormPayload) => void;
};

const emptyForm: ClientFormPayload = {
  civility: 'Mr', firstName: '', lastName: '', cin: '', phone: '', email: '',
  address: '', fatherName: '', motherName: '', cniExpirationDate: '',
  intermediaryId: '', notes: '',
};

function UploadZone({ label, uploadHint, file, preview, onSelect, onClear }: {
  label: string;
  uploadHint: string;
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
          <span className="mt-0.5 text-[10px] text-[var(--text-subtle)]">{uploadHint}</span>
        </>
      )}
    </div>
  );
}

export function ClientDrawer({ isOpen, mode, client, intermediaries, onOpenChange, onSubmit, errors = {}, isSubmitting = false }: ClientDrawerProps) {
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
        setScanError(err.message || err.error || t('clients.drawer.scanRequestError'));
        return;
      }
      const data: CinScanResult = await res.json();
      const recto = data.recto ?? {};
      const verso = data.verso ?? {};

      if (!recto.cin_number && !recto.first_name && !recto.last_name && !verso.address) {
        setScanError(t('clients.drawer.scanFailed'));
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
      setScanError(t('clients.drawer.scanNetworkError'));
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
        {mode === 'create' && (
          <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <button type="button" onClick={() => setInputMode('manual')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-2.5 text-[12px] font-medium transition',
                inputMode === 'manual'
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
              )}>
              <Upload size={14} /> {t('clients.drawer.manualEntry')}
            </button>
            <button type="button" onClick={() => setInputMode('scan')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-2.5 text-[12px] font-medium transition',
                inputMode === 'scan'
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
              )}>
              <ScanLine size={14} /> {t('clients.drawer.scanCin')}
            </button>
          </div>
        )}

        {inputMode === 'scan' ? (
          <div className="space-y-4">
            <p className="text-[12px] text-[var(--text-muted)]">
              {t('clients.drawer.scanDescription')}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <UploadZone label={t('clients.drawer.frontCin')} uploadHint={t('clients.drawer.uploadImage')} file={frontFile} preview={frontPreview}
                onSelect={handleFrontSelect} onClear={handleFrontClear} />
              <UploadZone label={t('clients.drawer.backCin')} uploadHint={t('clients.drawer.uploadImage')} file={backFile} preview={backPreview}
                onSelect={handleBackSelect} onClear={handleBackClear} />
            </div>

            {scanError && (
              <p className="text-[12px] font-medium text-[var(--danger)]">{scanError}</p>
            )}

            <AppButton variant="solid" color="primary" className="w-full"
              isDisabled={!frontFile || !backFile || isScanning}
              isLoading={isScanning}
              onPress={handleScan}>
              {isScanning ? t('clients.drawer.analyzingCin') : t('clients.drawer.analyzeCin')}
            </AppButton>
          </div>
        ) : null}

        {inputMode === 'manual' ? (
          <>
            <DrawerSection title={t('clients.form.identity')}>
              <div className={drawerStyles.sectionGrid}>
                <DrawerField label={t('clients.form.civility')} error={errors.civility}>
                  <DrawerSelect
                    value={form.civility || ''}
                    onChange={(v) => updateField('civility', v || 'Mr')}
                    options={CIVILITY_OPTIONS}
                    placeholder={t('clients.drawer.selectCivility')}
                  />
                </DrawerField>
                <div className="grid grid-cols-2 gap-2">
                  <DrawerField label={t('clients.form.firstName')} error={errors.first_name}>
                    <Input type="text" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder={t('clients.form.firstNamePlaceholder')}
                      aria-invalid={firstError(errors, 'first_name') ? true : undefined}
                      className={drawerStyles.input} />
                  </DrawerField>
                  <DrawerField label={t('clients.form.lastName')} error={errors.last_name}>
                    <Input type="text" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)}
                      placeholder={t('clients.form.lastNamePlaceholder')}
                      aria-invalid={firstError(errors, 'last_name') ? true : undefined}
                      className={drawerStyles.input} />
                  </DrawerField>
                </div>
                <DrawerField label={t('clients.form.cin')} error={errors.cin}>
                  <Input type="text" value={form.cin} onChange={(e) => updateField('cin', e.target.value)}
                    placeholder={t('clients.form.cinPlaceholder')}
                    aria-invalid={firstError(errors, 'cin') ? true : undefined}
                    className={drawerStyles.input} />
                </DrawerField>
                <div className="grid grid-cols-2 gap-2">
                  <DrawerField label={t('clients.form.fatherName')} error={errors.father_name}>
                    <Input type="text" value={form.fatherName} onChange={(e) => updateField('fatherName', e.target.value)}
                      placeholder={t('clients.drawer.fatherPlaceholder')}
                      aria-invalid={firstError(errors, 'father_name') ? true : undefined}
                      className={drawerStyles.input} />
                  </DrawerField>
                  <DrawerField label={t('clients.form.motherName')} error={errors.mother_name}>
                    <Input type="text" value={form.motherName} onChange={(e) => updateField('motherName', e.target.value)}
                      placeholder={t('clients.drawer.motherPlaceholder')}
                      aria-invalid={firstError(errors, 'mother_name') ? true : undefined}
                      className={drawerStyles.input} />
                  </DrawerField>
                </div>
                <DrawerField label={t('clients.form.cniExpirationDate')} error={errors.cni_expiration_date}>
                  <DateField
                    label=""
                    value={form.cniExpirationDate ? new Date(form.cniExpirationDate) : null}
                    onChange={(d) => updateField('cniExpirationDate', d ? d.toISOString().split('T')[0] : '')}
                    placeholder={t('clients.drawer.expirationPlaceholder')}
                  />
                </DrawerField>
              </div>
            </DrawerSection>

            <DrawerSection title={t('clients.form.contact')}>
              <div className={drawerStyles.sectionGrid}>
                <DrawerField label={t('clients.form.phone')} error={errors.phone}>
                  <Input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)}
                    placeholder={t('clients.form.phonePlaceholder')}
                    aria-invalid={firstError(errors, 'phone') ? true : undefined}
                    className={drawerStyles.input} />
                </DrawerField>
                <DrawerField label={t('clients.form.email')} error={errors.email}>
                  <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)}
                    placeholder={t('clients.form.emailPlaceholder')}
                    aria-invalid={firstError(errors, 'email') ? true : undefined}
                    className={drawerStyles.input} />
                </DrawerField>
                <DrawerField label={t('clients.form.address')} error={errors.address}>
                  <Input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)}
                    placeholder={t('clients.form.addressPlaceholder')}
                    aria-invalid={firstError(errors, 'address') ? true : undefined}
                    className={drawerStyles.input} />
                </DrawerField>
              </div>
            </DrawerSection>

            <DrawerSection title={t('clients.form.extra')}>
              <div className={drawerStyles.sectionGrid}>
                <DrawerField label={t('clients.form.intermediaryName')} error={errors.intermediary_id}>
                  <DrawerSelect
                    value={form.intermediaryId || ''}
                    onChange={(v) => updateField('intermediaryId', v)}
                    options={intermediaries}
                    placeholder={t('clients.selectIntermediary')}
                  />
                </DrawerField>
                <DrawerField label={t('clients.form.notes')} error={errors.notes}>
                  <TextArea value={form.notes} onChange={(e) => updateField('notes', e.target.value)}
                    placeholder={t('clients.form.notesPlaceholder')}
                    aria-invalid={firstError(errors, 'notes') ? true : undefined}
                    className={drawerStyles.textarea} />
                </DrawerField>
              </div>
            </DrawerSection>
          </>
        ) : null}
      </form>
    </AppDrawer>
  );
}
