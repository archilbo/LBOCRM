import { Head, router } from '@inertiajs/react';
import {
    IconAlertTriangle,
    IconArrowBackUp,
    IconArrowLeft,
    IconArrowMoveRight,
    IconCircleCheck,
    IconLogout,
    IconPencil,
    IconRotateClockwise,
    IconTrash,
    IconUserCircle,
} from '@tabler/icons-react';
import { Alert, Card, TextArea } from '@heroui/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppButton } from '@/components/ui/AppButton';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppShell } from '@/components/layout/AppShell';
import { AppTextField } from '@/components/ui/AppTextField';
import { StatusPill } from '@/components/ui/StatusPill';
import { ArchiveDrawer } from '@/features/archives/drawers/ArchiveDrawer';
import { FlowTimeline } from '@/features/archives/components/FlowTimeline';
import { formatNotificationTime } from '@/features/notifications/helpers';
import { defaultDue } from '@/config/statuses';
import type { ArchiveClientOption, ArchiveDossierOption, ArchiveFormPayload, ArchiveRecordRow, ArchiveEventRow, TreeNode } from '@/features/archives/types';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/cn';

type PageProps = {
    archiveRecord: ArchiveRecordRow;
    events: ArchiveEventRow[];
    tree?: TreeNode[];
    clients?: ArchiveClientOption[];
    dossiers?: ArchiveDossierOption[];
};

export default function ArchiveShow({ archiveRecord, events, tree = [], clients = [], dossiers = [] }: PageProps) {
    const { t, locale } = useTranslation();
    const record = archiveRecord;

    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showLost, setShowLost] = useState(false);
    const [lostReason, setLostReason] = useState('');
    const [showMove, setShowMove] = useState(false);
    const [moveRoom, setMoveRoom] = useState('');
    const [moveShelf, setMoveShelf] = useState('');
    const [moveBox, setMoveBox] = useState('');

    function updateStatus(status: string) {
        const payload: Record<string, string> = { status };
        if (status === 'checked_out') {
            payload.due_at = defaultDue();
            payload.requested_by = record.requestedBy || '';
        }
        router.put(`/archives/${record.id}/status`, payload, {
            preserveScroll: true,
            onSuccess: () => { toast.success(t('archiveShow.toastStatusUpdated')); router.reload(); },
            onError: () => toast.error(t('archiveShow.toastFailed')),
        });
    }

    function doDelete() {
        router.delete(`/archives/${record.id}`, {
            onSuccess: () => { toast.success(t('archiveShow.toastDeleted')); router.visit('/archives'); },
            onError: () => toast.error(t('archiveShow.toastDeleteFailed')),
        });
    }

    function handleUpdate(payload: ArchiveFormPayload) {
        const backendPayload = {
            dossier_id: payload.dossierId,
            status: payload.status || 'ready_to_archive',
            room: payload.room || null,
            shelf: payload.shelf || null,
            box: payload.box || null,
            in_date: payload.inDate || null,
            out_date: payload.outDate || null,
            returned_at: payload.returnedAt || null,
            requested_by: payload.requestedBy || null,
            due_at: payload.dueAt || null,
            notes: payload.notes || null,
        };
        router.put(`/archives/${record.id}`, backendPayload, {
            preserveScroll: true,
            onSuccess: () => { setShowEdit(false); toast.success(t('archiveShow.toastStatusUpdated')); router.reload(); },
            onError: () => toast.error(t('archiveShow.toastFailed')),
        });
    }

    function doMarkLost() {
        if (!lostReason.trim()) return;
        router.put(`/archives/${record.id}/mark-lost`, { lost_reason: lostReason }, {
            preserveScroll: true,
            onSuccess: () => { setShowLost(false); setLostReason(''); toast.success(t('archiveShow.toastLost')); router.reload(); },
            onError: () => toast.error(t('archiveShow.toastFailed')),
        });
    }

    function doMove() {
        if (!moveRoom || !moveShelf || !moveBox) return;
        router.post('/archives/move', {
            archive_ids: [record.id],
            room: moveRoom,
            shelf: moveShelf,
            box: moveBox,
        }, {
            preserveScroll: true,
            onSuccess: () => { setShowMove(false); toast.success(t('archiveShow.toastMoved')); router.reload(); },
            onError: () => toast.error(t('archiveShow.toastMoveFailed')),
        });
    }

    function nextAction(): { labelKey: string; icon: typeof IconLogout; action: () => void } | null {
        if (record.isLost) {
            return {
                labelKey: 'restore',
                icon: IconRotateClockwise,
                action: () => router.put(`/archives/${record.id}/status`, { status: 'stored' }, {
                    preserveScroll: true,
                    onSuccess: () => { toast.success(t('archiveShow.toastRestored')); router.reload(); },
                    onError: () => toast.error(t('archiveShow.toastFailed')),
                }),
            };
        }
        if (record.status === 'ready_to_archive') return { labelKey: 'store', icon: IconCircleCheck, action: () => updateStatus('stored') };
        if (record.status === 'stored') return { labelKey: 'checkOut', icon: IconLogout, action: () => updateStatus('checked_out') };
        if (record.status === 'checked_out') return { labelKey: 'return', icon: IconArrowBackUp, action: () => updateStatus('returned') };
        return null;
    }

    const primary = nextAction();

    return (
        <>
            <Head title={record.archiveNumber} />
            <AppShell>
                <AppButton variant="quiet" size="sm" className="-ml-2 mb-3" onPress={() => router.visit('/archives')}>
                    <IconArrowLeft size={13} /> {t('archiveShow.backToArchives')}
                </AppButton>

                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-[var(--crm-text)]">{record.archiveNumber}</h1>
                            <StatusPill
                                status={record.status}
                                isOverdue={record.isOverdue}
                                label={t(`status.${record.isOverdue ? 'overdue' : record.status}`)}
                            />
                            {record.city ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                    style={{ backgroundColor: `${record.city.color}20`, color: record.city.color }}>
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: record.city.color }} />
                                    {record.city.name}
                                </span>
                            ) : null}
                        </div>
                        <p className="mt-1 text-sm text-[var(--crm-text-muted)]">
                            {record.projectObject} · {record.dossierNumber} · {record.clientName} ({record.clientCin})
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <AppButton variant="quiet" size="sm" isIconOnly tooltip={t('archiveShow.edit')} onPress={() => setShowEdit(true)}>
                            <IconPencil size={14} />
                        </AppButton>
                        <AppButton variant="quiet" size="sm" isIconOnly tooltip={t('archiveShow.delete')} onPress={() => setShowDelete(true)}>
                            <IconTrash size={14} className="text-[var(--crm-danger)]" />
                        </AppButton>
                    </div>
                </div>

                {record.isOverdue ? (
                    <Alert status="danger" className="mt-4">
                        <Alert.Content>
                            <Alert.Title>{t('archiveShow.overdueSince', { date: record.dueAt ?? '' })}</Alert.Title>
                        </Alert.Content>
                    </Alert>
                ) : null}
                {record.isLost ? (
                    <Alert status="danger" className="mt-4">
                        <Alert.Content>
                            <Alert.Title>{record.lostReason || t('archiveShow.markedLost')}</Alert.Title>
                        </Alert.Content>
                    </Alert>
                ) : null}

                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <Section title={t('archiveShow.location')}>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <InfoPair label={t('archiveShow.room')} value={record.room} />
                                <InfoPair label={t('archiveShow.shelf')} value={record.shelf} />
                                <InfoPair label={t('archiveShow.box')} value={record.box} />
                                <InfoPair label={t('archiveShow.folder')} value={record.folder} />
                            </div>
                        </Section>

                        <Section title={t('archiveShow.dates')}>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <InfoPair label={t('archiveShow.inDate')} value={record.inDate} />
                                <InfoPair label={t('archiveShow.outDate')} value={record.outDate} />
                                <InfoPair label={t('archiveShow.dueDate')} value={record.dueAt} color={record.isOverdue ? 'text-[var(--crm-danger)]' : undefined} />
                                <InfoPair label={t('archiveShow.returnedAt')} value={record.returnedAt} />
                            </div>
                        </Section>

                        {record.requestedBy ? (
                            <Section title={t('archiveShow.requester')}>
                                <div className="flex items-center gap-2 text-xs">
                                    <IconUserCircle size={14} className="text-[var(--crm-text-soft)]" />
                                    <span className="font-medium text-[var(--crm-text)]">{record.requestedBy}</span>
                                    {record.dueAt ? (
                                        <span className={cn('tabular-nums', record.isOverdue ? 'text-[var(--crm-danger)]' : 'text-[var(--crm-text-muted)]')}>
                                            · {t('archiveShow.dueDate')} {record.dueAt}
                                        </span>
                                    ) : null}
                                </div>
                            </Section>
                        ) : null}

                        {record.notes ? (
                            <Section title={t('archiveShow.notes')}>
                                <p className="text-xs leading-relaxed text-[var(--crm-text-muted)] whitespace-pre-line">{record.notes}</p>
                            </Section>
                        ) : null}

                        <Section title={t('archiveShow.timeline')}>
                            <FlowTimeline events={events} />
                        </Section>
                    </div>

                    <div className="space-y-4">
                        {primary ? (
                            <AppButton variant="primary" className="h-9 w-full text-xs" onPress={primary.action}>
                                <primary.icon size={14} /> {t(`archiveShow.${primary.labelKey}`)}
                            </AppButton>
                        ) : null}

                        <Card className="gap-0 border border-[var(--crm-border)] bg-[var(--crm-surface)] shadow-sm">
                            <Card.Content className="p-1.5">
                                <QuickAction icon={IconLogout} label={t('archiveShow.checkOut')} onClick={() => updateStatus('checked_out')} className="text-[var(--crm-gold)] hover:bg-[var(--crm-gold-soft)]" />
                                <QuickAction icon={IconArrowBackUp} label={t('archiveShow.return')} onClick={() => updateStatus('returned')} className="text-[var(--crm-success)] hover:bg-[var(--crm-success-soft)]" />
                                <QuickAction icon={IconArrowMoveRight} label={t('archiveShow.move')} onClick={() => setShowMove(true)} className="text-[var(--crm-info)] hover:bg-[var(--crm-info-soft)]" />
                                <QuickAction icon={IconAlertTriangle} label={t('archiveShow.markLost')} onClick={() => setShowLost(true)} className="text-[var(--crm-danger)] hover:bg-[var(--crm-danger-soft)]" />
                            </Card.Content>
                        </Card>

                        <Section title={t('archiveShow.metadata')}>
                            <div className="space-y-1 text-xs text-[var(--crm-text-muted)]">
                                <p>{t('archiveShow.created')} {record.createdAt}</p>
                                <p>{t('archiveShow.updated')} {record.updatedAtRaw ? formatNotificationTime(record.updatedAtRaw, locale) : (record.updatedAt || '-')}</p>
                            </div>
                        </Section>
                    </div>
                </div>

                <AppConfirmDialog
                    isOpen={showDelete}
                    title={t('archiveShow.deleteTitle')}
                    description={t('archiveShow.deleteConfirm', { archiveNumber: record.archiveNumber })}
                    confirmLabel={t('archiveShow.delete')}
                    cancelLabel={t('archiveShow.cancel')}
                    onConfirm={doDelete}
                    onCancel={() => setShowDelete(false)}
                />

                <ArchiveDrawer
                    isOpen={showEdit}
                    mode="edit"
                    archiveRecord={record}
                    clients={clients}
                    dossiers={dossiers}
                    rooms={tree.map((r) => ({ id: r.id, name: r.name, code: r.code }))}
                    shelves={tree.flatMap((r) => (r.shelves || []).map((s) => ({ id: s.id, roomId: r.id, name: s.name, code: s.code })))}
                    boxes={tree.flatMap((r) => (r.shelves || []).flatMap((s) => (s.boxes || []).map((b) => ({ id: b.id, shelfId: s.id, name: b.name, code: b.code, capacity: b.capacity }))))}
                    onOpenChange={setShowEdit}
                    onSubmit={handleUpdate}
                />

                <AppDrawer isOpen={showLost} onOpenChange={setShowLost} title={t('archiveShow.lostTitle')} description={t('archiveShow.lostDescription')} size="sm"
                    footer={
                        <>
                            <AppButton variant="secondary" onPress={() => setShowLost(false)}>{t('archiveShow.cancel')}</AppButton>
                            <AppButton variant="primary" type="submit" form="lost-form">{t('archiveShow.confirm')}</AppButton>
                        </>
                    }
                >
                    <form id="lost-form" onSubmit={(e) => { e.preventDefault(); doMarkLost(); }}>
                        <TextArea aria-label={t('archiveShow.reason')} value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder={t('archiveShow.reasonPlaceholder')} required />
                    </form>
                </AppDrawer>

                <AppDrawer isOpen={showMove} onOpenChange={setShowMove} title={t('archiveShow.moveTitle')} description={t('archiveShow.moveDescription')} size="sm"
                    footer={
                        <>
                            <AppButton variant="secondary" onPress={() => setShowMove(false)}>{t('archiveShow.cancel')}</AppButton>
                            <AppButton variant="primary" type="submit" form="move-form">{t('archiveShow.move')}</AppButton>
                        </>
                    }
                >
                    <form id="move-form" onSubmit={(e) => { e.preventDefault(); doMove(); }} className="space-y-3">
                        <AppTextField label={t('archiveShow.room')} value={moveRoom} onChange={setMoveRoom} placeholder={t('archiveShow.roomPlaceholder')} isRequired />
                        <AppTextField label={t('archiveShow.shelf')} value={moveShelf} onChange={setMoveShelf} placeholder={t('archiveShow.shelfPlaceholder')} isRequired />
                        <AppTextField label={t('archiveShow.box')} value={moveBox} onChange={setMoveBox} placeholder={t('archiveShow.boxPlaceholder')} isRequired />
                    </form>
                </AppDrawer>
            </AppShell>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card className="gap-0 border border-[var(--crm-border)] bg-[var(--crm-surface)] shadow-sm">
            <div className="border-b border-[var(--crm-border)] px-4 py-2.5">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--crm-text-soft)]">{title}</h2>
            </div>
            <Card.Content className="px-4 py-3">{children}</Card.Content>
        </Card>
    );
}

function InfoPair({ label, value, color }: { label: string; value: string | null; color?: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-[var(--crm-text-soft)]">{label}</p>
            <p className={cn('mt-0.5 font-medium text-[var(--crm-text)]', color)}>{value || '-'}</p>
        </div>
    );
}

function QuickAction({ icon: Icon, label, onClick, className }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; onClick: () => void; className?: string }) {
    return (
        <AppButton variant="quiet" size="sm" className={cn('h-9 w-full justify-start gap-2 px-2 text-xs', className)} onPress={onClick}>
            <Icon size={14} />
            {label}
        </AppButton>
    );
}
