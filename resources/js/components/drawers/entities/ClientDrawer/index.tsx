import {
    FormEvent,
    useEffect,
    useState,
} from 'react';
import type { Key } from 'react-aria-components';
import {
    CheckCircle2,
    ScanLine,
    Upload,
} from 'lucide-react';
import { Input, TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerSection, DrawerField, DrawerSelect } from '@/components/drawers';
import { drawerStyles, type DrawerBaseProps } from '@/components/drawers';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import { firstError } from '@/lib/formErrors';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import {
    CinScannerPanel,
} from '@/features/clients/cin-scanner/CinScannerPanel';
import {
    applyVerifiedCinScan,
} from '@/features/clients/cin-scanner/applyCinScan';
import type {
    CinScanResult,
} from '@/features/clients/cin-scanner/types';
import type { ClientFormPayload, ClientRow, IntermediaryOption } from '@/features/clients/types';
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


export function ClientDrawer({ isOpen, mode, client, intermediaries, onOpenChange, onSubmit, errors = {}, isSubmitting = false }: ClientDrawerProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ClientFormPayload>(emptyForm);
  const [inputMode, setInputMode] = useState<'manual' | 'scan'>('manual');
  const [lastScan, setLastScan] = useState<{
    generation: CinScanResult['document']['generation'];
    appliedCount: number;
    reviewCount: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setInputMode('manual');
    setLastScan(null);
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

  function updateField(field: keyof ClientFormPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  function handleCinAutoFill(
    result: CinScanResult,
  ): void {
    const applied = applyVerifiedCinScan(
      form,
      result,
      {
        /*
         * Never overwrite text the user already entered,
         * including in create mode.
         */
        overwriteExisting: false,
      },
    );

    setForm(applied.form);

    setLastScan({
      generation:
        result.document.generation,
      appliedCount:
        applied.appliedFields.length,
      reviewCount:
        applied.reviewFields.length,
    });
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
                'flex flex-1 items-center justify-center gap-2 py-2.5 text-[11px] font-medium transition',
                inputMode === 'manual'
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
              )}>
              <Upload size={14} /> {t('clients.drawer.manualEntry')}
            </button>
            <button type="button" onClick={() => setInputMode('scan')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-2.5 text-[11px] font-medium transition',
                inputMode === 'scan'
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
              )}>
              <ScanLine size={14} /> {t('clients.drawer.scanCin')}
            </button>
          </div>
        )}

        {inputMode === 'scan' ? (
    <CinScannerPanel
        onAutoFill={handleCinAutoFill}
        onContinue={() =>
            setInputMode('manual')
        }
        onCancel={() =>
            setInputMode('manual')
        }
    />
) : null}

        {inputMode === 'manual' ? (
          <>
            {lastScan ? (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5">
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <div>
                  <p className="text-[10px] font-medium text-emerald-500">
                    Données CNI appliquées
                  </p>
                  <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                    {lastScan.appliedCount} champ(s) remplis automatiquement
                    {lastScan.reviewCount > 0
                      ? ` · ${lastScan.reviewCount} valeur(s) doivent être vérifiées manuellement`
                      : ''}
                  </p>
                </div>
              </div>
            ) : null}

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
                  <AppDatePicker
                    value={form.cniExpirationDate || null}
                    onChange={(v) => updateField('cniExpirationDate', v)}
                    placeholder={t('clients.drawer.expirationPlaceholder')}
                    ariaLabel={t('clients.form.cniExpirationDate')}
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
