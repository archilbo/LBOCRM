import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppTextarea } from '@/components/ui/AppTextarea';
import type {
    ArchiveDossierOption,
    ArchiveFormPayload,
    ArchiveRecordRow,
} from '@/features/archives/types';

type ArchiveDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    archiveRecord: ArchiveRecordRow | null;
    dossiers: ArchiveDossierOption[];
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ArchiveFormPayload) => void;
    errors?: FormErrors;
};

const emptyForm: ArchiveFormPayload = {
    dossierId: '',
    status: 'ready_to_archive',
    room: '',
    shelf: '',
    box: '',
    folder: '',
    inDate: '',
    outDate: '',
    returnedAt: '',
    requestedBy: '',
    notes: '',
};

const statusOptions = [
    { id: 'ready_to_archive', label: 'Ready to archive' },
    { id: 'stored', label: 'Stored' },
    { id: 'checked_out', label: 'Checked out' },
    { id: 'returned', label: 'Returned' },
    { id: 'lost', label: 'Lost' },
];

export function ArchiveDrawer({
    isOpen,
    mode,
    archiveRecord,
    dossiers,
    onOpenChange,
    onSubmit,
    errors = {},
}: ArchiveDrawerProps) {
    const [form, setForm] = useState<ArchiveFormPayload>(emptyForm);

    const dossierOptions = useMemo(
        () =>
            dossiers.map((dossier) => ({
                id: dossier.id,
                label:
                    mode === 'create' && dossier.hasArchiveRecord
                        ? `${dossier.label} - already archived`
                        : dossier.label,
            })),
        [dossiers, mode],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (mode === 'edit' && archiveRecord) {
            setForm({
                dossierId: archiveRecord.dossierId || '',
                status: archiveRecord.status || 'ready_to_archive',
                room: archiveRecord.room || '',
                shelf: archiveRecord.shelf || '',
                box: archiveRecord.box || '',
                folder: archiveRecord.folder || '',
                inDate: archiveRecord.inDate || '',
                outDate: archiveRecord.outDate || '',
                returnedAt: archiveRecord.returnedAt || '',
                requestedBy: archiveRecord.requestedBy || '',
                notes: archiveRecord.notes || '',
            });
            return;
        }

        setForm(emptyForm);
    }, [archiveRecord, isOpen, mode]);

    function updateField(field: keyof ArchiveFormPayload, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateSelect(field: keyof ArchiveFormPayload, value: Key | null) {
        setForm((current) => ({ ...current, [field]: value ? String(value) : '' }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(form);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={mode === 'create' ? 'Create archive record' : 'Edit archive record'}
            description="Save physical archive tracking to the database."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>

                    <AppButton variant="primary" type="submit" form="archive-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="archive-form" className="space-y-6" onSubmit={handleSubmit}>
                <AppFormErrorSummary errors={errors} />
                <section>
                    <h3 className="mb-3 text-sm font-semibold">Project and status</h3>

                    <div className="grid gap-4">
                        <AppSelect
                            label="Dossier / Project"
                            placeholder="Select dossier"
                            selectedKey={form.dossierId}
                            onSelectionChange={(value) => updateSelect('dossierId', value)}
                            options={dossierOptions}
                        />

                        <AppSelect
                            label="Status"
                            selectedKey={form.status}
                            onSelectionChange={(value) => updateSelect('status', value)}
                            options={statusOptions}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Physical location</h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        <AppTextField
                            label="Room"
                            value={form.room}
                            onChange={(value) => updateField('room', value)}
                        />

                        <AppTextField
                            label="Shelf"
                            value={form.shelf}
                            onChange={(value) => updateField('shelf', value)}
                        />

                        <AppTextField
                            label="Box"
                            value={form.box}
                            onChange={(value) => updateField('box', value)}
                        />

                        <AppTextField
                            label="Folder"
                            value={form.folder}
                            onChange={(value) => updateField('folder', value)}
                        />
                    </div>
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-semibold">Movement dates</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AppTextField
                            label="In date"
                            value={form.inDate}
                            onChange={(value) => updateField('inDate', value)}
                        />

                        <AppTextField
                            label="Out date"
                            value={form.outDate}
                            onChange={(value) => updateField('outDate', value)}
                        />

                        <AppTextField
                            label="Returned at"
                            value={form.returnedAt}
                            onChange={(value) => updateField('returnedAt', value)}
                        />
                    </div>
                </section>

                <section>
                    <AppTextField
                        label="Requested by"
                        value={form.requestedBy}
                        onChange={(value) => updateField('requestedBy', value)}
                    />
                </section>

                <section>
                    <AppTextarea
                        label="Notes"
                        value={form.notes}
                        onChange={(value) => updateField('notes', value)}
                    />
                </section>
            </form>
        </AppDrawer>
    );
}