import {
    FormEvent,
    useEffect,
    useState,
} from 'react';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { Key } from 'react-aria-components';
import { usePage } from '@inertiajs/react';
import { IconBuilding, IconCircleCheck, IconPlus, IconScan, IconTrash, IconUpload } from '@tabler/icons-react';

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
import { applyCinScan } from '@/features/clients/cin-scanner/applyCinScan';
import type {
    CinScanResult,
} from '@/features/clients/cin-scanner/types';
import type { ClientFormPayload, ClientRow, ClientType } from '@/features/clients/types';
import type { FormErrors } from '@/lib/formErrors';

const CIVILITY_OPTIONS = [
  { id: 'Mr', label: 'Mr' },
  { id: 'Ms', label: 'Ms' },
  { id: 'Mrs', label: 'Mrs' },
];

type ClientDrawerProps = DrawerBaseProps & {
  mode: 'create' | 'edit';
  client: ClientRow | null;
  onSubmit: (payload: ClientFormPayload) => void;
};

const emptyForm: ClientFormPayload = {
  clientType: 'person', civility: 'Mr', firstName: '', lastName: '', companyName: '', cin: '', ice: '', managers: [], phone: '', email: '',
  address: '', fatherName: '', motherName: '', cniExpirationDate: '',
  intermediaryId: '', notes: '',
};

const minimumPersonalCniExpiry = today(getLocalTimeZone())
  .add({ months: 3, days: 1 })
  .toString();

function importedNameParts(client: ClientRow): Pick<ClientFormPayload, 'firstName' | 'lastName'> {
  if (client.firstName || client.lastName) {
    return {
      firstName: client.firstName ?? '',
      lastName: client.lastName ?? '',
    };
  }

  const [firstName = '', ...lastNameParts] = client.fullName.trim().split(/\s+/);

  return {
    firstName,
    lastName: lastNameParts.join(' '),
  };
}

export function ClientDrawer({ isOpen, mode, client, onOpenChange, onSubmit, errors = {}, isSubmitting = false }: ClientDrawerProps) {
  const { t } = useTranslation();
  const clientTypeOptions = [
    { id: 'person', label: t('clients.form.person') },
    { id: 'company', label: t('clients.form.company') },
  ];
  // The Scan CIN mode posts to /clients/scan-cin; hide the toggle when the
  // backend would reject the call so the UI never advertises a 403.
  const canScanCin = Boolean(
    ((usePage().props as Record<string, unknown>).auth as { user?: { permissions?: string[] } } | undefined)?.user?.permissions?.includes('clients.cin.scan'),
  );
  const [form, setForm] = useState<ClientFormPayload>(emptyForm);
  const [cniExpiryTouched, setCniExpiryTouched] = useState(false);
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
    setCniExpiryTouched(false);
    if (mode === 'edit' && client) {
      const name = importedNameParts(client);

      setForm({
        clientType: client.clientType ?? 'person',
        civility: client.civility ?? 'Mr',
        firstName: name.firstName,
        lastName: name.lastName,
        companyName: client.companyName ?? '',
        cin: client.cin ?? '',
        ice: client.ice ?? '',
        managers: client.managers?.length ? client.managers : [''],
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

  function cniExpiryError(value: string): string | undefined {
    if (!value) {
      return mode === 'create'
        ? t('clients.form.cniExpirationRequired')
        : undefined;
    }

    return value < minimumPersonalCniExpiry
      ? t('clients.form.cniExpirationTooSoon')
      : undefined;
  }

  function updateCniExpirationDate(value: string) {
    setCniExpiryTouched(true);
    updateField('cniExpirationDate', value);
  }

  function changeClientType(clientType: ClientType) {
    setForm((current) => ({
      ...current,
      clientType,
      managers: clientType === 'company' && current.managers.length === 0 ? [''] : current.managers,
    }));
    if (clientType === 'company') setInputMode('manual');
  }

  function updateManager(index: number, value: string) {
    setForm((current) => ({
      ...current,
      managers: current.managers.map((manager, managerIndex) => managerIndex === index ? value : manager),
    }));
  }

  function addManager() {
    setForm((current) => ({ ...current, managers: [...current.managers, ''] }));
  }

  function removeManager(index: number) {
    setForm((current) => ({ ...current, managers: current.managers.filter((_, managerIndex) => managerIndex !== index) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.clientType === 'person') {
      setCniExpiryTouched(true);

      if (cniExpiryError(form.cniExpirationDate)) {
        return;
      }
    }

    onSubmit(form);
  }

  function handleCinAutoFill(
    result: CinScanResult,
  ): void {
    const applied = applyCinScan(
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
            isDisabled={inputMode === 'scan'}>
            {mode === 'create' ? t('clients.create') : t('clients.save')}
          </AppButton>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
        <DrawerSection title={t('clients.form.clientType')}>
          <DrawerSelect
            value={form.clientType}
            onChange={(value) => changeClientType(value as ClientType)}
            options={clientTypeOptions}
            placeholder={t('clients.form.clientType')}
          />
        </DrawerSection>

        {form.clientType === 'person' && (
          <div className="flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <button type="button" onClick={() => setInputMode('manual')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-2.5 text-[11px] font-medium transition',
                inputMode === 'manual'
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
              )}>
              <IconUpload size={14} /> {t('clients.drawer.manualEntry')}
            </button>
            {canScanCin && (
              <button type="button" onClick={() => setInputMode('scan')}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 py-2.5 text-[11px] font-medium transition',
                  inputMode === 'scan'
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
                )}>
                <IconScan size={14} /> {t('clients.drawer.scanCin')}
              </button>
            )}
          </div>
        )}

        {isOpen && form.clientType === 'person' && canScanCin ? (
          <div className={cn(inputMode !== 'scan' && 'hidden')}>
            <CinScannerPanel
              onApply={handleCinAutoFill}
              onContinue={() => setInputMode('manual')}
              onCancel={() => setInputMode('manual')}
            />
          </div>
        ) : null}

        {inputMode === 'manual' ? (
          <>
            {lastScan ? (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5">
                <IconCircleCheck
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
                  <AppButton
                    compact
                    size="sm"
                    variant="quiet"
                    onPress={() => setInputMode('scan')}
                    className="mt-1.5"
                  >
                    <IconScan size={13} />
                    Voir ou copier les données scannées
                  </AppButton>
                </div>
              </div>
            ) : null}

            {form.clientType === 'person' ? <DrawerSection title={t('clients.form.identity')}>
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
                <DrawerField label={t('clients.form.cniExpirationDate')}>
                  <AppDatePicker
                    value={form.cniExpirationDate || null}
                    onChange={updateCniExpirationDate}
                    placeholder={t('clients.drawer.expirationPlaceholder')}
                    ariaLabel={t('clients.form.cniExpirationDate')}
                    minValue={minimumPersonalCniExpiry}
                    isRequired={mode === 'create'}
                    error={cniExpiryTouched
                      ? cniExpiryError(form.cniExpirationDate)
                      : firstError(errors, 'cni_expiration_date')}
                  />
                </DrawerField>
              </div>
            </DrawerSection> : <DrawerSection icon={<IconBuilding size={12} />} title={t('clients.form.companyInformation')}>
              <div className="space-y-3">
                <DrawerField label={t('clients.form.companyName')} error={errors.company_name}>
                  <Input type="text" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder={t('clients.form.companyNamePlaceholder')} className={drawerStyles.input} />
                </DrawerField>
                <DrawerField label={t('clients.form.ice')} error={errors.ice}>
                  <Input type="text" value={form.ice} onChange={(e) => updateField('ice', e.target.value)}
                    placeholder={t('clients.form.icePlaceholder')} className={drawerStyles.input} />
                </DrawerField>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium text-[var(--text)]">{t('clients.form.managers')}</p>
                    <AppButton isIconOnly compact size="sm" variant="quiet" tooltip={t('clients.form.addManager')} aria-label={t('clients.form.addManager')} onPress={addManager}>
                      <IconPlus size={14} />
                    </AppButton>
                  </div>
                  {form.managers.map((manager, index) => (
                    <div className="flex items-center gap-2" key={index}>
                      <Input type="text" value={manager} onChange={(e) => updateManager(index, e.target.value)}
                        placeholder={t('clients.form.managerPlaceholder')} className={drawerStyles.input} />
                      {form.managers.length > 1 ? <AppButton isIconOnly compact size="sm" variant="quiet" color="danger" tooltip={t('clients.form.removeManager')} aria-label={t('clients.form.removeManager')} onPress={() => removeManager(index)} className="bg-transparent hover:bg-transparent"><IconTrash size={14} /></AppButton> : null}
                    </div>
                  ))}
                  {firstError(errors, 'managers', 'managers.0') ? <p className="text-[10px] text-[var(--danger)]">{firstError(errors, 'managers', 'managers.0')}</p> : null}
                </div>
              </div>
            </DrawerSection>}

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
