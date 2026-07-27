import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FileText, Paperclip, Upload, UploadCloud } from 'lucide-react';
import { TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerSection, DrawerField, DrawerSelect } from '@/components/drawers';
import { drawerStyles, type DrawerBaseProps } from '@/components/drawers';
import { firstError } from '@/lib/formErrors';
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
    }
  }, [initialClientId, initialDossierId, initialStatus, initialTemplateId, isOpen]);

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
        <DrawerSection icon={<FileText size={12} />} title="Informations document">
          <div className={drawerStyles.sectionGrid}>
            <DrawerField label="Client" error={firstError(errors, 'client_id')}>
              <DrawerSelect
                value={selectedClientId}
                onChange={handleClientChange}
                options={clients}
                placeholder="Sélectionner un client"
                isDisabled={lockProject}
              />
            </DrawerField>
            <DrawerField label="Projet" error={firstError(errors, 'dossier_id')}>
              <DrawerSelect
                value={form.dossierId}
                onChange={(v) => updateField('dossierId', v)}
                options={filteredDossiers}
                placeholder={dossierSelectDisabled ? 'Sélectionnez un client d\'abord' : 'Sélectionner un dossier'}
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

        <DrawerSection icon={<Paperclip size={12} />} title="Fichier">
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
        </DrawerSection>

        <DrawerSection icon={<FileText size={12} />} title="Notes">
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
