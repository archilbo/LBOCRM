import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { IconFileText, IconPhoto, IconPaperclip, IconUpload, IconCloudUpload } from '@tabler/icons-react';

import { TextArea } from '@heroui/react';
import { AppAutocomplete } from '@/components/ui/AppAutocomplete';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerSection, DrawerField, DrawerSelect } from '@/components/drawers';
import { drawerStyles, type DrawerBaseProps } from '@/components/drawers';
import { firstError, hasErrors } from '@/lib/formErrors';
import type { FormErrors } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import type { DocumentUploadPayload, ClientOption, DocumentTemplateOption, DossierOption } from '@/features/documents/types';

type DocumentDrawerProps = DrawerBaseProps & {
  clients: ClientOption[];
  dossiers: DossierOption[];
  templates: DocumentTemplateOption[];
  initialClientId?: string;
  initialDossierId?: string;
  initialTemplateId?: string;
  initialStatus?: string;
  lockProject?: boolean;
  lockTemplate?: boolean;
  mode?: 'upload' | 'replace';
  onSubmit: (payload: DocumentUploadPayload) => void;
};

type CinSide = 'front' | 'back';

const CIN_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf';

const SINGLE_FILE_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx';

const emptyForm: DocumentUploadPayload = {
  dossierId: '',
  documentTemplateId: '',
  status: 'verified',
  notes: '',
  file: null,
  cinFrontFile: null,
  cinBackFile: null,
};

const statusOptions = [
  { id: 'uploaded', label: 'Uploadé' },
  { id: 'verified', label: 'Vérifié' },
  { id: 'missing', label: 'Manquant' },
  { id: 'rejected', label: 'Rejeté' },
];

export function DocumentDrawer({
  isOpen, clients, dossiers, templates,
  initialClientId = '', initialDossierId = '', initialTemplateId = '', initialStatus = 'verified',
  lockProject = false, lockTemplate = false, mode = 'upload',
  onOpenChange, onSubmit, errors = {}, isSubmitting = false,
}: DocumentDrawerProps) {
  const [form, setForm] = useState<DocumentUploadPayload>(emptyForm);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  // Tracks sides the user corrected after a backend error so the stale error
  // disappears visually until the next submit (backend stays authoritative).
  const [correctedFields, setCorrectedFields] = useState<Set<CinSide | 'file'>>(new Set());
  const [sideLocalErrors, setSideLocalErrors] = useState<{ front: string; back: string }>({ front: '', back: '' });

  const frontFieldRef = useRef<HTMLDivElement>(null);
  const backFieldRef = useRef<HTMLDivElement>(null);
  const fileFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...emptyForm,
        dossierId: initialDossierId,
        documentTemplateId: initialTemplateId,
        status: initialStatus,
      });
      setSelectedClientId(initialClientId);
      setFileName('');
      setFileError('');
      setCorrectedFields(new Set());
      setSideLocalErrors({ front: '', back: '' });
    }
  }, [initialClientId, initialDossierId, initialStatus, initialTemplateId, isOpen]);

  const frontError = correctedFields.has('front') ? undefined : (firstError(errors, 'file_front') || sideLocalErrors.front);
  const backError = correctedFields.has('back') ? undefined : (firstError(errors, 'file_back') || sideLocalErrors.back);
  const fileFieldError = correctedFields.has('file') ? undefined : (firstError(errors, 'file') || fileError);

  // Focus/scroll the first invalid upload field when backend errors arrive.
  useEffect(() => {
    if (!isOpen || !hasErrors(errors)) return;
    const firstKey = (['file_front', 'file_back', 'file'] as const).find((key) => errors[key]);
    if (!firstKey) return;
    const target = firstKey === 'file_front' ? frontFieldRef : firstKey === 'file_back' ? backFieldRef : fileFieldRef;
    target.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    target.current?.focus();
  }, [errors, isOpen]);

  const filteredDossiers = useMemo(() => {
    if (!selectedClientId) return [];
    return dossiers.filter((d) => d.clientId === selectedClientId);
  }, [dossiers, selectedClientId]);

  const dossierSelectDisabled = !selectedClientId;

  function updateField(field: keyof DocumentUploadPayload, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
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

  const selectedTemplate = useMemo(() =>
    templates.find((t) => t.id === form.documentTemplateId),
  [form.documentTemplateId, templates]);

  const isCinTemplate = selectedTemplate?.code === 'cin'
    || selectedTemplate?.label?.toLowerCase().includes('cin')
    || selectedTemplate?.label?.toLowerCase().includes('cni');

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
    setCorrectedFields((current) => new Set(current).add('file'));
  }

  function handleCinFileChange(side: CinSide, fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    if (file && file.size > 20 * 1024 * 1024) {
      setSideLocalErrors((current) => ({
        ...current,
        [side]: `Le fichier (${side === 'front' ? 'Recto' : 'Verso'}) est trop volumineux. Maximum 20 Mo.`,
      }));
      return;
    }
    setSideLocalErrors((current) => ({ ...current, [side]: '' }));
    setForm((current) => ({
      ...current,
      [side === 'front' ? 'cinFrontFile' : 'cinBackFile']: file,
    }));
    setCorrectedFields((current) => new Set(current).add(side));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <AppDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={mode === 'replace' ? 'Remplacer le document' : 'Téléverser un document'}
      description={mode === 'replace' ? 'Le nouveau fichier remplacera la version actuelle.' : 'Attachez un document à un projet.'}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <AppButton variant="light" onPress={() => onOpenChange(false)} isDisabled={isSubmitting}>
            Annuler
          </AppButton>
          <AppButton variant="solid" color="primary" type="submit" form="document-form" isLoading={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </AppButton>
        </div>
      }
    >
      <form id="document-form" className="space-y-4" onSubmit={handleSubmit}>
        <DrawerSection icon={<IconFileText size={12} />} title="Informations du document">
          <div className={drawerStyles.sectionGrid}>
            <DrawerField label="Client" error={firstError(errors, 'client_id')}>
              <AppAutocomplete
                value={selectedClientId}
                onChange={handleClientChange}
                options={clients}
                placeholder="Rechercher un client..."
                isDisabled={lockProject}
              />
            </DrawerField>
            <DrawerField label="Projet" error={firstError(errors, 'dossier_id')}>
              <AppAutocomplete
                value={form.dossierId}
                onChange={(v) => updateField('dossierId', v)}
                options={filteredDossiers}
                placeholder={dossierSelectDisabled ? 'Sélectionnez un client d\'abord' : 'Rechercher un projet...'}
                isDisabled={dossierSelectDisabled || lockProject}
              />
            </DrawerField>
            {templates.length > 0 && (
              <DrawerField label="Type de document" error={firstError(errors, 'document_template_id')}>
                <DrawerSelect
                  value={form.documentTemplateId}
                  onChange={(v) => updateField('documentTemplateId', v)}
                  options={templates}
                  placeholder="Type de document"
                  isDisabled={lockTemplate}
                />
              </DrawerField>
            )}
            <DrawerField label="Statut" error={firstError(errors, 'status')}>
              <DrawerSelect
                value={form.status}
                onChange={(v) => updateField('status', v)}
                options={statusOptions}
                placeholder="Statut"
              />
            </DrawerField>
          </div>
        </DrawerSection>

        <DrawerSection icon={<IconPaperclip size={12} />} title={isCinTemplate ? 'Images de la CIN' : 'Fichier'}>
          {isCinTemplate ? (
            <div className="space-y-3">
              {/* Front (Recto) */}
              <div ref={frontFieldRef} tabIndex={-1} className="outline-none">
                <p className="mb-1 text-[10px] font-medium text-[var(--text-subtle)]">Recto (avant)</p>
                {form.cinFrontFile ? (
                  <div className={cn('flex items-center gap-3 rounded-lg border bg-[var(--surface-2)] p-2.5', frontError ? 'border-[var(--danger)]' : 'border-[var(--border)]')}>
                    <IconPhoto size={16} className="shrink-0 text-[var(--accent)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[var(--foreground)]">{form.cinFrontFile.name}</p>
                    </div>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, cinFrontFile: null }))}
                      className="flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[9px] text-[var(--text-muted)] transition hover:border-red-600/30 hover:text-red-600">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <label className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-[var(--surface)] p-3 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]', frontError ? 'border-[var(--danger)]' : 'border-[var(--border)]')}>
                    <IconUpload size={16} className="text-[var(--accent)]" />
                    <span className="mt-1 text-xs font-medium text-[var(--foreground)]">Recto de la CIN</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Photo, PDF. Max 20 Mo.</span>
                    <input type="file" className="hidden" accept={CIN_ACCEPT}
                      aria-invalid={frontError ? true : undefined}
                      aria-describedby={frontError ? 'document-front-error' : undefined}
                      onChange={(e) => handleCinFileChange('front', e.target.files)} />
                  </label>
                )}
                {frontError ? (
                  <p id="document-front-error" className="mt-1.5 text-[9px] font-medium text-[var(--danger)]">
                    {frontError}
                  </p>
                ) : null}
              </div>
              {/* Back (Verso) */}
              <div ref={backFieldRef} tabIndex={-1} className="outline-none">
                <p className="mb-1 text-[10px] font-medium text-[var(--text-subtle)]">Verso (arrière)</p>
                {form.cinBackFile ? (
                  <div className={cn('flex items-center gap-3 rounded-lg border bg-[var(--surface-2)] p-2.5', backError ? 'border-[var(--danger)]' : 'border-[var(--border)]')}>
                    <IconPhoto size={16} className="shrink-0 text-[var(--accent)]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[var(--foreground)]">{form.cinBackFile.name}</p>
                    </div>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, cinBackFile: null }))}
                      className="flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[9px] text-[var(--text-muted)] transition hover:border-red-600/30 hover:text-red-600">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <label className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-[var(--surface)] p-3 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]', backError ? 'border-[var(--danger)]' : 'border-[var(--border)]')}>
                    <IconUpload size={16} className="text-[var(--accent)]" />
                    <span className="mt-1 text-xs font-medium text-[var(--foreground)]">Verso de la CIN</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Photo, PDF. Max 20 Mo.</span>
                    <input type="file" className="hidden" accept={CIN_ACCEPT}
                      aria-invalid={backError ? true : undefined}
                      aria-describedby={backError ? 'document-back-error' : undefined}
                      onChange={(e) => handleCinFileChange('back', e.target.files)} />
                  </label>
                )}
                {backError ? (
                  <p id="document-back-error" className="mt-1.5 text-[9px] font-medium text-[var(--danger)]">
                    {backError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div ref={fileFieldRef} tabIndex={-1} className="outline-none">
              {fileName ? (
                <div className={cn('flex items-center gap-3 rounded-lg border bg-[var(--surface-2)] p-2.5', fileFieldError ? 'border-[var(--danger)]' : 'border-[var(--border)]')}>
                  <IconCloudUpload size={16} className="shrink-0 text-[var(--accent)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--foreground)]">{fileName}</p>
                    <p className="text-[9px] text-[var(--text-muted)]">Fichier sélectionné</p>
                  </div>
                  <button type="button" onClick={() => { setFileName(''); setForm((f) => ({ ...f, file: null })); }}
                    className="flex size-6 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[9px] text-[var(--text-muted)] transition hover:border-red-600/30 hover:text-red-600">
                    Retirer
                  </button>
                </div>
              ) : (
                <label className={cn('flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-[var(--surface)] p-4 text-center transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]', fileFieldError ? 'border-[var(--danger)]' : 'border-[var(--border)]')}>
                  <IconUpload size={18} className="text-[var(--accent)]" />
                  <span className="mt-1.5 text-xs font-medium text-[var(--foreground)]">Choisir un fichier</span>
                  <span className="mt-0.5 text-[9px] text-[var(--text-muted)]">PDF, image, DOCX. Max 20 Mo.</span>
                  <input type="file" className="hidden" accept={SINGLE_FILE_ACCEPT}
                    aria-invalid={fileFieldError ? true : undefined}
                    aria-describedby={fileFieldError ? 'document-file-error' : undefined}
                    onChange={(event) => handleFileChange(event.target.files)} />
                </label>
              )}
              {fileFieldError ? (
                <p id="document-file-error" className="mt-1.5 text-[9px] font-medium text-[var(--danger)]">
                  {fileFieldError}
                </p>
              ) : null}
            </div>
          )}
        </DrawerSection>

        <DrawerSection icon={<IconFileText size={12} />} title="Notes">
          <TextArea
            placeholder="Notes internes"
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            aria-invalid={firstError(errors, 'notes') ? true : undefined}
            className={drawerStyles.textarea}
          />
        </DrawerSection>
      </form>
    </AppDrawer>
  );
}
