import type { Key } from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextarea } from '@/components/ui/AppTextarea';
import { useTranslation } from '@/lib/i18n';
import type { ClientSelectedProjectWorkspace } from '@/features/clients/types';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    project: ClientSelectedProjectWorkspace | null;
    clientId: number;
};

const STATUS_OPTIONS = [
    { id: 'ready_to_archive' as Key, label: 'Ready to archive' },
    { id: 'stored' as Key, label: 'Stored' },
    { id: 'checked_out' as Key, label: 'Checked out' },
    { id: 'returned' as Key, label: 'Returned' },
];

export function ArchiveDrawer({ isOpen, onOpenChange, project, clientId }: Props) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<Key>('ready_to_archive');
    const [room, setRoom] = useState('');
    const [shelf, setShelf] = useState('');
    const [box, setBox] = useState('');
    const [folder, setFolder] = useState('');
    const [requestedBy, setRequestedBy] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const existingArchive = project?.archiveRecord;

    useEffect(() => {
        if (!isOpen) return;
        if (existingArchive) {
            setStatus(existingArchive.status as Key ?? 'ready_to_archive');
            setRoom(existingArchive.room ?? '');
            setShelf(existingArchive.shelf ?? '');
            setBox(existingArchive.box ?? '');
            setFolder(existingArchive.folder ?? '');
            setRequestedBy(existingArchive.requestedBy ?? '');
            setNotes('');
        } else {
            setStatus('ready_to_archive');
            setRoom('');
            setShelf('');
            setBox('');
            setFolder('');
            setRequestedBy('');
            setNotes('');
        }
    }, [isOpen, existingArchive]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!project) return;
        setSubmitting(true);

        const payload: Record<string, unknown> = {
            dossier_id: project.id,
            status: String(status),
            room: room || null,
            shelf: shelf || null,
            box: box || null,
            folder: folder || null,
            requested_by: requestedBy || null,
            notes: notes || null,
        };

        const returnUrl = `/clients/${clientId}?tab=workflow&dossier_id=${project.id}`;
        payload.return_to = returnUrl;

        const isUpdate = !!existingArchive;
        const method = isUpdate ? 'put' as const : 'post' as const;
        const url = isUpdate ? `/archives/${existingArchive!.id}` : '/archives';

        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isUpdate ? 'Archive updated.' : 'Archive created.');
                onOpenChange(false);
            },
            onError: (errors) => {
                toast.error(Object.values(errors).join(', ') || 'Failed to save archive.');
            },
            onFinish: () => setSubmitting(false),
        });
    }

    if (!project) return null;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={existingArchive ? 'Edit archive' : 'Create archive sheet'}
            description={`${project.dossierNumber} \u2014 ${project.projectObject || ''}`}
            footer={(
                <div className="flex items-center justify-end gap-2">
                    <AppButton variant="bordered" onPress={() => onOpenChange(false)}>
                        {t('clients.cancel')}
                    </AppButton>
                    <AppButton variant="solid" isLoading={submitting} onPress={handleSubmit as VoidFunction}>
                        {existingArchive ? t('clients.save') : t('clients.create')}
                    </AppButton>
                </div>
            )}
        >
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-5">
                <AppSelect label="Status" options={STATUS_OPTIONS} selectedKey={status} onSelectionChange={setStatus} />

                <p className="text-[11px] font-medium text-[var(--text-muted)]">Physical location</p>
                <div className="grid grid-cols-2 gap-3">
                    <AppInput label="Room" value={room} onChange={setRoom} placeholder="e.g. Salle A" />
                    <AppInput label="Shelf" value={shelf} onChange={setShelf} placeholder="e.g. E03" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <AppInput label="Box" value={box} onChange={setBox} placeholder="e.g. B12" />
                    <AppInput label="Folder" value={folder} onChange={setFolder} placeholder="e.g. Dossier 5" />
                </div>

                <AppInput label="Requested by" value={requestedBy} onChange={setRequestedBy} placeholder="Person who took the file" />
                <AppTextarea label="Notes" value={notes} onChange={setNotes} placeholder="Internal notes..." />
            </form>
        </AppDrawer>
    );
}
