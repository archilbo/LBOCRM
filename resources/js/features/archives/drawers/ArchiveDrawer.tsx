import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppSelect } from '@/components/ui/AppSelect';
import { ARCHIVE_STATUS } from '@/config/statuses';
import { AsyncCombobox } from '@/features/archives/components/AsyncCombobox';
import { DateField } from '@/features/archives/components/DateField';
import type { ArchiveFormPayload, ArchiveRecordRow, RoomOption, ShelfOption, BoxOption } from '@/features/archives/types';
import { format } from 'date-fns';

const schema = z.object({
    client_id: z.string().min(1, { message: 'Select a client' }),
    dossier_id: z.string().min(1, { message: 'Select a project' }),
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
    message: 'Out date must be after in date',
    path: ['out_date'],
});

type FormValues = z.infer<typeof schema>;

const statusOptions = Object.values(ARCHIVE_STATUS).map((s) => ({ id: s.key, label: s.label }));

async function apiGet(url: string, params: Record<string, string | number>) {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) search.set(k, String(v));
    const res = await fetch(`${url}?${search}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

async function fetchClients(q: string) {
    const json = await apiGet('/api/clients', { q, limit: 20 });
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
    onOpenChange,
    onSubmit,
}: ArchiveDrawerProps) {
    const {
        register,
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
    }, [archiveRecord, isOpen, mode, reset]);

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
        : undefined;

    const projectLabel = mode === 'edit' && archiveRecord?.dossierNumber
        ? `${archiveRecord.projectObject} · ${archiveRecord.dossierNumber}`
        : undefined;

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            panelClassName="sm:w-[520px]"
            title={mode === 'create' ? 'Create archive record' : 'Edit archive record'}
            description="Save physical archive tracking to the database."
            footer={
                <>
                    <AppButton variant="light" onPress={() => onOpenChange(false)}>
                        Cancel
                    </AppButton>
                    <AppButton variant="primary" type="submit" form="archive-form">
                        Save
                    </AppButton>
                </>
            }
        >
            <form id="archive-form" className="space-y-2" onSubmit={handleSubmit(handleFormSubmit)}>
                <section>
                    <h4 className="mb-3 mt-6 text-sm font-semibold text-white first:mt-0">Client and project</h4>

                    <div className="space-y-4">
                        <AsyncCombobox
                            label="Client"
                            placeholder="Search clients…"
                            value={clientId || null}
                            onChange={handleClientChange}
                            queryKey={['clients']}
                            queryFn={fetchClients}
                            emptyMessage="No clients found"
                            defaultLabel={clientLabel}
                            error={errors.client_id?.message}
                        />

                        <AsyncCombobox
                            label="Project"
                            placeholder={clientId ? 'Search projects…' : 'Select a client first'}
                            value={watch('dossier_id') || null}
                            onChange={(id) => setValue('dossier_id', id ?? '', { shouldDirty: true })}
                            queryKey={['projects', clientId ?? '']}
                            queryFn={(q) => fetchProjects(clientId ?? '', q)}
                            emptyMessage="No projects found"
                            isDisabled={!clientId}
                            defaultLabel={projectLabel}
                            error={errors.dossier_id?.message}
                        />

                        <div className="w-1/2 min-w-0">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <AppSelect
                                        label="Status"
                                        selectedKey={field.value || 'ready_to_archive'}
                                        onSelectionChange={(key) => field.onChange(String(key ?? 'ready_to_archive'))}
                                        options={statusOptions}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="mb-3 mt-6 text-sm font-semibold text-white">Physical location</h4>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <Controller
                            name="room"
                            control={control}
                            render={({ field }) => (
                                <AppSelect
                                    label="Room"
                                    placeholder="Select room"
                                    selectedKey={field.value || null}
                                    onSelectionChange={(key) => {
                                        field.onChange(key ? String(key) : null);
                                        setValue('shelf', null, { shouldDirty: true });
                                        setValue('box', null, { shouldDirty: true });
                                    }}
                                    options={roomOptions}
                                />
                            )}
                        />

                        <Controller
                            name="shelf"
                            control={control}
                            render={({ field }) => (
                                <AppSelect
                                    label="Shelf"
                                    placeholder={room ? 'Select shelf' : 'Room first'}
                                    selectedKey={field.value || null}
                                    onSelectionChange={(key) => {
                                        field.onChange(key ? String(key) : null);
                                        setValue('box', null, { shouldDirty: true });
                                    }}
                                    options={shelfOptions}
                                    isDisabled={!room}
                                />
                            )}
                        />

                        <Controller
                            name="box"
                            control={control}
                            render={({ field }) => (
                                <AppSelect
                                    label="Box"
                                    placeholder={shelf ? 'Select box' : 'Shelf first'}
                                    selectedKey={field.value || null}
                                    onSelectionChange={(key) => field.onChange(key ? String(key) : null)}
                                    options={boxOptions}
                                    isDisabled={!shelf}
                                />
                            )}
                        />

                        <Controller
                            name="folder"
                            control={control}
                            render={({ field }) => (
                                <AppTextField
                                    label="Folder"
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </section>

                <section>
                    <h4 className="mb-3 mt-6 text-sm font-semibold text-white">Movement dates</h4>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <DateField
                            label="In date"
                            value={watch('in_date')}
                            onChange={(d) => setValue('in_date', d, { shouldDirty: true })}
                            error={errors.in_date?.message}
                        />
                        <DateField
                            label="Out date"
                            value={watch('out_date')}
                            onChange={(d) => setValue('out_date', d, { shouldDirty: true })}
                            error={errors.out_date?.message}
                        />
                        <DateField
                            label="Returned at"
                            value={watch('returned_at')}
                            onChange={(d) => setValue('returned_at', d, { shouldDirty: true })}
                            error={errors.returned_at?.message}
                        />
                    </div>
                </section>

                <section>
                    <h4 className="mb-3 mt-6 text-sm font-semibold text-white">Additional info</h4>

                    <div className="space-y-4">
                        <Controller
                            name="requested_by"
                            control={control}
                            render={({ field }) => (
                                <AppTextField
                                    label="Requested by"
                                    placeholder="Name of requester"
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                />
                            )}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-white/50">Notes</label>
                            <textarea
                                {...register('notes')}
                                rows={4}
                                className="h-auto w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none transition placeholder:text-white/40 hover:border-white/20 focus:border-white/30"
                                placeholder="Optional notes…"
                            />
                        </div>
                    </div>
                </section>
            </form>
        </AppDrawer>
    );
}
