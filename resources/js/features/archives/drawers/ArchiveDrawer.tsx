import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Archive, Calendar, User } from 'lucide-react';
import { Input, TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerSection, DrawerField, DrawerSelect, drawerStyles } from '@/components/drawers';
import { ARCHIVE_STATUS } from '@/config/statuses';
import { AsyncCombobox } from '@/features/archives/components/AsyncCombobox';
import { DateField } from '@/features/archives/components/DateField';
import type { ArchiveFormPayload, ArchiveRecordRow, RoomOption, ShelfOption, BoxOption } from '@/features/archives/types';
import { format } from 'date-fns';

const schema = z.object({
    client_id: z.string().min(1, { message: 'Selectionnez un client' }),
    dossier_id: z.string().min(1, { message: 'Selectionnez un projet' }),
    status: z.string().min(1),
    room: z.string().nullable().default(null),
    shelf: z.string().nullable().default(null),
    box: z.string().nullable().default(null),
    folder: z.string().optional().default(''),
    in_date: z.date().nullable().default(null),
    out_date: z.date().nullable().default(null),
    returned_at: z.date().nullable().default(null),
    requested_by: z.string().optional().default(''),
    notes: z.string().optional().default(''),
}).refine((d) => !d.out_date || !d.in_date || d.out_date >= d.in_date, {
    message: 'La date de sortie doit etre apres la date d entree',
    path: ['out_date'],
});

type FormValues = z.infer<typeof schema>;

const statusOptions = Object.values(ARCHIVE_STATUS).map((s) => ({ id: s.key, label: s.label }));

async function apiGet(url: string, params: Record<string, string | number>) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) search.set(k, String(v));
    const res = await fetch(`${url}?${search}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

async function fetchClients(q: string) {
    const json = await apiGet('/api/clients/search', { q, limit: 20 });
    return json.data.map((c: { id: number; code: string; name: string }) => ({
        id: String(c.id),
        label: `${c.name} · ${c.code}`,
    }));
}

async function fetchProjects(clientId: string, q: string) {
    if (!clientId) return [];
    const json = await apiGet(`/api/clients/${clientId}/projects`, { q, limit: 20 });
    return json.data.map((p: { id: number; code: string; name: string }) => ({
        id: String(p.id),
        label: `${p.name} · ${p.code}`,
    }));
}

type ArchiveDrawerProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    archiveRecord: ArchiveRecordRow | null;
    rooms: RoomOption[];
    shelves: ShelfOption[];
    boxes: BoxOption[];
    initialClientId?: string;
    initialDossierId?: string;
    initialClientName?: string;
    initialDossierLabel?: string;
    lockProject?: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (payload: ArchiveFormPayload) => void;
};

export function ArchiveDrawer({
    isOpen,
    mode,
    archiveRecord,
    rooms,
    shelves,
    boxes,
    initialClientId,
    initialDossierId,
    initialClientName,
    initialDossierLabel,
    lockProject,
    onOpenChange,
    onSubmit,
}: ArchiveDrawerProps) {
    const {
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            client_id: '',
            dossier_id: '',
            status: 'ready_to_archive',
            room: null,
            shelf: null,
            box: null,
            folder: '',
            in_date: null,
            out_date: null,
            returned_at: null,
            requested_by: '',
            notes: '',
        },
    });

    const clientId = watch('client_id');
    const room = watch('room');
    const shelf = watch('shelf');

    const roomOptions = useMemo(() => rooms.map((r) => ({ id: r.code, label: `${r.code} - ${r.name}` })), [rooms]);

    const shelfOptions = useMemo(() => {
        const selectedRoom = rooms.find((r) => r.code === room);
        if (!selectedRoom) return [];
        return shelves
            .filter((s) => s.roomId === selectedRoom.id)
            .map((s) => ({ id: s.code, label: `${s.code} - ${s.name}` }));
    }, [rooms, shelves, room]);

    const boxOptions = useMemo(() => {
        const selectedShelf = shelves.find((s) => s.code === shelf);
        if (!selectedShelf) return [];
        return boxes
            .filter((b) => b.shelfId === selectedShelf.id)
            .map((b) => ({ id: b.code, label: `${b.code} - ${b.name}` }));
    }, [shelves, boxes, shelf]);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && archiveRecord) {
            reset({
                client_id: archiveRecord.clientId ?? '',
                dossier_id: archiveRecord.dossierId,
                status: archiveRecord.status || 'ready_to_archive',
                room: archiveRecord.room,
                shelf: archiveRecord.shelf,
                box: archiveRecord.box,
                folder: archiveRecord.folder ?? '',
                in_date: archiveRecord.inDate ? new Date(archiveRecord.inDate) : null,
                out_date: archiveRecord.outDate ? new Date(archiveRecord.outDate) : null,
                returned_at: archiveRecord.returnedAt ? new Date(archiveRecord.returnedAt) : null,
                requested_by: archiveRecord.requestedBy ?? '',
                notes: archiveRecord.notes ?? '',
            });
        } else if (initialClientId && initialDossierId) {
            reset({
                client_id: initialClientId,
                dossier_id: initialDossierId,
                status: 'ready_to_archive',
                room: null,
                shelf: null,
                box: null,
                folder: '',
                in_date: null,
                out_date: null,
                returned_at: null,
                requested_by: '',
                notes: '',
            });
        } else {
            reset({
                client_id: '',
                dossier_id: '',
                status: 'ready_to_archive',
                room: null,
                shelf: null,
                box: null,
                folder: '',
                in_date: null,
                out_date: null,
                returned_at: null,
                requested_by: '',
                notes: '',
            });
        }
    }, [archiveRecord, initialClientId, initialDossierId, isOpen, mode, reset]);

    function handleClientChange(id: string | null) {
        setValue('client_id', id ?? '', { shouldDirty: true });
        setValue('dossier_id', '', { shouldDirty: true });
        setValue('room', null, { shouldDirty: true });
        setValue('shelf', null, { shouldDirty: true });
        setValue('box', null, { shouldDirty: true });
    }

    function handleFormSubmit(data: FormValues) {
        const serialize = (d: Date | null) => (d ? format(d, 'yyyy-MM-dd') : null);

        const payload: ArchiveFormPayload = {
            clientId: data.client_id,
            dossierId: data.dossier_id,
            status: data.status,
            room: data.room ?? '',
            shelf: data.shelf ?? '',
            box: data.box ?? '',
            folder: data.folder ?? '',
            inDate: serialize(data.in_date),
            outDate: serialize(data.out_date),
            returnedAt: serialize(data.returned_at),
            requestedBy: data.requested_by ?? '',
            notes: data.notes ?? '',
        };

        onSubmit(payload);
    }

    const clientLabel = mode === 'edit' && archiveRecord?.clientName
        ? archiveRecord.clientName
        : initialClientName;

    const projectLabel = mode === 'edit' && archiveRecord?.dossierNumber
        ? `${archiveRecord.projectObject} · ${archiveRecord.dossierNumber}`
        : initialDossierLabel;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            panelClassName="sm:w-[520px]"
            isDismissable={false}
            title={mode === 'create' ? 'Creer une fiche d archive' : 'Modifier la fiche d archive'}
            description="Enregistrer le suivi physique de l archivage."
            footer={
                <>
                    <AppButton variant="light" onPress={() => onOpenChange(false)}>
                        Annuler
                    </AppButton>
                    <AppButton variant="primary" type="submit" form="archive-form">
                        Enregistrer
                    </AppButton>
                </>
            }
        >
            <form id="archive-form" className="flex flex-col gap-3" onSubmit={handleSubmit(handleFormSubmit)}>
                <DrawerSection icon={<Archive size={12} />} title="Client et projet">
                    <div className="flex flex-col gap-2">
                        <AsyncCombobox
                            label="Client"
                            placeholder="Chercher un client…"
                            value={clientId || null}
                            onChange={handleClientChange}
                            queryKey={['clients']}
                            queryFn={fetchClients}
                            emptyMessage="Aucun client trouve"
                            defaultLabel={clientLabel}
                            isDisabled={lockProject}
                            error={errors.client_id?.message}
                        />

                        <AsyncCombobox
                            label="Projet"
                            placeholder={clientId ? 'Rechercher un projet…' : 'Selectionnez un client d abord'}
                            value={watch('dossier_id') || null}
                            onChange={(id) => setValue('dossier_id', id ?? '', { shouldDirty: true })}
                            queryKey={['projects', clientId ?? '']}
                            queryFn={(q) => fetchProjects(clientId ?? '', q)}
                            emptyMessage="Aucun projet trouve"
                            isDisabled={lockProject || !clientId}
                            defaultLabel={projectLabel}
                            error={errors.dossier_id?.message}
                        />

                        <DrawerField label="Statut" error={errors.status?.message}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <DrawerSelect
                                        value={field.value || ''}
                                        onChange={(v) => field.onChange(v || 'ready_to_archive')}
                                        options={statusOptions}
                                        placeholder="Selectionner..."
                                    />
                                )}
                            />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<MapPin size={12} />} title="Emplacement physique">
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <DrawerField label="Salle">
                            <Controller
                                name="room"
                                control={control}
                                render={({ field }) => (
                                    <DrawerSelect
                                        value={field.value || ''}
                                        onChange={(v) => {
                                            field.onChange(v || null);
                                            setValue('shelf', null, { shouldDirty: true });
                                            setValue('box', null, { shouldDirty: true });
                                        }}
                                        options={roomOptions}
                                        placeholder="Selectionner salle"
                                    />
                                )}
                            />
                        </DrawerField>

                        <DrawerField label="Etagere">
                            <Controller
                                name="shelf"
                                control={control}
                                render={({ field }) => (
                                    <DrawerSelect
                                        value={field.value || ''}
                                        onChange={(v) => {
                                            field.onChange(v || null);
                                            setValue('box', null, { shouldDirty: true });
                                        }}
                                        options={shelfOptions}
                                        placeholder={room ? 'Selectionner etagere' : 'Salle d abord'}
                                        isDisabled={!room}
                                    />
                                )}
                            />
                        </DrawerField>

                        <DrawerField label="Boite">
                            <Controller
                                name="box"
                                control={control}
                                render={({ field }) => (
                                    <DrawerSelect
                                        value={field.value || ''}
                                        onChange={(v) => field.onChange(v || null)}
                                        options={boxOptions}
                                        placeholder={shelf ? 'Selectionner boite' : 'Etagere d abord'}
                                        isDisabled={!shelf}
                                    />
                                )}
                            />
                        </DrawerField>

                        <DrawerField label="Dossier">
                            <Controller
                                name="folder"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="Numero dossier"
                                        className={drawerStyles.input}
                                    />
                                )}
                            />
                        </DrawerField>
                    </div>
                </DrawerSection>

                <DrawerSection icon={<Calendar size={12} />} title="Dates de mouvement">
                    <div className="grid gap-2 sm:grid-cols-3">
                        <DateField
                            label="Date d entree"
                            value={watch('in_date')}
                            onChange={(d) => setValue('in_date', d, { shouldDirty: true })}
                            error={errors.in_date?.message}
                        />
                        <DateField
                            label="Date de sortie"
                            value={watch('out_date')}
                            onChange={(d) => setValue('out_date', d, { shouldDirty: true })}
                            error={errors.out_date?.message}
                        />
                        <DateField
                            label="Retourne le"
                            value={watch('returned_at')}
                            onChange={(d) => setValue('returned_at', d, { shouldDirty: true })}
                            error={errors.returned_at?.message}
                        />
                    </div>
                </DrawerSection>

                <DrawerSection icon={<User size={12} />} title="Infos supplementaires">
                    <div className="flex flex-col gap-2">
                        <DrawerField label="Demande par">
                            <Controller
                                name="requested_by"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="text"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        placeholder="Nom du demandeur"
                                        className={drawerStyles.input}
                                    />
                                )}
                            />
                        </DrawerField>

                        <DrawerField label="Notes">
                            <TextArea
                                value={watch('notes') ?? ''}
                                onChange={(e) => setValue('notes', e.target.value, { shouldDirty: true })}
                                placeholder="Notes optionnelles…"
                                className={drawerStyles.textarea}
                            />
                        </DrawerField>
                    </div>
                </DrawerSection>
            </form>
        </AppDrawer>
    );
}
