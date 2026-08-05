import { Head, router } from '@inertiajs/react';
import { IconAlertTriangle, IconArrowLeft, IconLogout, IconArrowMoveRight, IconPencil, IconArrowRotaryFirstLeft, IconTrash, IconArrowBackUp, IconUserCircle, IconCircleCheck } from '@tabler/icons-react';

import { useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppShell } from '@/components/layout/AppShell';
import { StatusPill } from '@/components/ui/StatusPill';
import { FlowTimeline } from '@/features/archives/components/FlowTimeline';
import { archiveVisualStatus, defaultDue } from '@/config/statuses';
import type { ArchiveRecordRow, ArchiveEventRow, TreeNode } from '@/features/archives/types';
import { cn } from '@/lib/cn';

type PageProps = {
    archiveRecord: ArchiveRecordRow;
    events: ArchiveEventRow[];
    tree?: TreeNode[];
};

export default function ArchiveShow({ archiveRecord, events, tree }: PageProps) {
    const record = archiveRecord;

    const [showDelete, setShowDelete] = useState(false);
    const [showLost, setShowLost] = useState(false);
    const [lostReason, setLostReason] = useState('');
    const [showMove, setShowMove] = useState(false);
    const [moveRoom, setMoveRoom] = useState('');
    const [moveShelf, setMoveShelf] = useState('');
    const [moveBox, setMoveBox] = useState('');

    const vs = archiveVisualStatus(record.status, record.isOverdue);

    function updateStatus(status: string) {
        const payload: Record<string, string> = { status };
        if (status === 'checked_out') {
            payload.due_at = defaultDue();
            payload.requested_by = record.requestedBy || '';
        }
        router.put(`/archives/${record.id}/status`, payload, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Status updated.'); router.reload(); },
            onError: () => toast.error('Failed.'),
        });
    }

    function doDelete() {
        router.delete(`/archives/${record.id}`, {
            onSuccess: () => { toast.success('Deleted.'); router.visit('/archives'); },
            onError: () => toast.error('Delete failed.'),
        });
    }

    function doMarkLost() {
        if (!lostReason.trim()) return;
        router.put(`/archives/${record.id}/mark-lost`, { lost_reason: lostReason }, {
            preserveScroll: true,
            onSuccess: () => { setShowLost(false); setLostReason(''); toast.success('Marked lost.'); router.reload(); },
            onError: () => toast.error('Failed.'),
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
            onSuccess: () => { setShowMove(false); toast.success('Moved.'); router.reload(); },
            onError: () => toast.error('Move failed.'),
        });
    }

    function nextAction(): { label: string; icon: typeof IconLogout; action: () => void } | null {
        if (record.isLost) return { label: 'Restore', icon: IconArrowRotaryFirstLeft, action: () => router.put(`/archives/${record.id}/status`, { status: 'stored' }, { preserveScroll: true, onSuccess: () => { toast.success('Restored.'); router.reload(); } }) };
        if (record.status === 'ready_to_archive') return { label: 'Store', icon: IconCircleCheck, action: () => updateStatus('stored') };
        if (record.status === 'stored') return { label: 'Check out', icon: IconLogout, action: () => updateStatus('checked_out') };
        if (record.status === 'checked_out') return { label: 'Return', icon: IconArrowBackUp, action: () => updateStatus('returned') };
        return null;
    }

    const primary = nextAction();

    return (
        <>
            <Head title={record.archiveNumber} />
            <AppShell>
                <button type="button" onClick={() => router.visit('/archives')}
                    className="mb-3 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]">
                    <IconArrowLeft size={13} /> Back to archives
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{record.archiveNumber}</h1>
                            <StatusPill status={record.status} isOverdue={record.isOverdue} />
                        </div>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            {record.projectObject} · {record.dossierNumber} · {record.clientName} ({record.clientCin})
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => router.visit(`/archives/${record.id}/edit`)}
                            className="flex size-7 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]" title="Edit">
                            <IconPencil size={14} />
                        </button>
                        <button type="button" onClick={() => setShowDelete(true)}
                            className="flex size-7 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-400" title="Delete">
                            <IconTrash size={14} />
                        </button>
                    </div>
                </div>

                {record.isOverdue ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/8 px-3 py-2 text-xs text-red-400">
                        <IconAlertTriangle size={14} /> Overdue since {record.dueAt}
                    </div>
                ) : null}
                {record.isLost ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/8 px-3 py-2 text-xs text-red-400">
                        <IconAlertTriangle size={14} /> {record.lostReason || 'Marked as lost'}
                    </div>
                ) : null}

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Section title="Location">
                            <div className="flex flex-wrap gap-3 text-xs">
                                <InfoPair label="Room" value={record.room} />
                                <InfoPair label="Shelf" value={record.shelf} />
                                <InfoPair label="Box" value={record.box} />
                                <InfoPair label="Folder" value={record.folder} />
                            </div>
                        </Section>

                        <Section title="Dates">
                            <div className="flex flex-wrap gap-3 text-xs">
                                <InfoPair label="In date" value={record.inDate} />
                                <InfoPair label="Out date" value={record.outDate} />
                                <InfoPair label="Due date" value={record.dueAt} color={record.isOverdue ? 'text-red-400' : undefined} />
                                <InfoPair label="Returned" value={record.returnedAt} />
                            </div>
                        </Section>

                        {record.requestedBy ? (
                            <Section title="Requester">
                                <div className="flex items-center gap-2 text-xs">
                                    <IconUserCircle size={13} className="text-[var(--text-subtle)]" />
                                    <span className="text-[var(--foreground)]">{record.requestedBy}</span>
                                    {record.dueAt ? (
                                        <span className={cn('tabular-nums', record.isOverdue ? 'text-red-400' : 'text-[var(--text-muted)]')}>
                                            due {record.dueAt}
                                        </span>
                                    ) : null}
                                </div>
                            </Section>
                        ) : null}

                        {record.notes ? (
                            <Section title="Notes">
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{record.notes}</p>
                            </Section>
                        ) : null}

                        <Section title="Timeline">
                            <FlowTimeline events={events} />
                        </Section>
                    </div>

                    <div className="space-y-3">
                        {primary ? (
                            <AppButton variant="primary" className="w-full h-8 text-xs" onPress={primary.action}>
                                <primary.icon size={14} /> {primary.label}
                            </AppButton>
                        ) : null}

                        <div className="space-y-0.5">
                            <QuickAction icon={IconLogout} label="Check out" onClick={() => updateStatus('checked_out')} />
                            <QuickAction icon={IconArrowBackUp} label="Return" onClick={() => updateStatus('returned')} />
                            <QuickAction icon={IconArrowMoveRight} label="Move" onClick={() => setShowMove(true)} />
                            <QuickAction icon={IconAlertTriangle} label="Mark lost" onClick={() => setShowLost(true)} className="text-red-400 hover:bg-red-400/10" />
                            <QuickAction icon={IconTrash} label="Delete" onClick={() => setShowDelete(true)} className="text-red-400 hover:bg-red-400/10" />
                        </div>

                        <Section title="Metadata">
                            <div className="space-y-1 text-xs text-[var(--text-muted)]">
                                <p>Created {record.createdAt}</p>
                                <p>Updated {record.updatedAt || '-'}</p>
                            </div>
                        </Section>
                    </div>
                </div>

                {showDelete ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={() => setShowDelete(false)}>
                        <div className="w-full max-w-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-sm font-semibold text-[var(--foreground)]">Delete archive?</h3>
                            <p className="mt-2 text-xs text-[var(--text-muted)]">Delete <strong>{record.archiveNumber}</strong>? Cannot be undone.</p>
                            <div className="mt-4 flex justify-end gap-2">
                                <AppButton variant="bordered" size="sm" onPress={() => setShowDelete(false)}>Cancel</AppButton>
                                <AppButton color="danger" variant="solid" size="sm" onPress={doDelete}>Delete</AppButton>
                            </div>
                        </div>
                    </div>
                ) : null}

                <AppDrawer isOpen={showLost} onOpenChange={setShowLost} title="Mark as lost" description="Provide a reason for marking this archive as lost." size="sm"
                    footer={
                        <>
                            <AppButton variant="secondary" onPress={() => setShowLost(false)}>Cancel</AppButton>
                            <AppButton variant="primary" type="submit" form="lost-form">Confirm</AppButton>
                        </>
                    }
                >
                    <form id="lost-form" onSubmit={(e) => { e.preventDefault(); doMarkLost(); }}>
                        <AppTextField label="Reason" value={lostReason} onChange={setLostReason} placeholder="e.g. Missing from shelf" isRequired />
                    </form>
                </AppDrawer>

                <AppDrawer isOpen={showMove} onOpenChange={setShowMove} title="Move archive" description="Select target location." size="sm"
                    footer={
                        <>
                            <AppButton variant="secondary" onPress={() => setShowMove(false)}>Cancel</AppButton>
                            <AppButton variant="primary" type="submit" form="move-form">Move</AppButton>
                        </>
                    }
                >
                    <form id="move-form" onSubmit={(e) => { e.preventDefault(); doMove(); }} className="space-y-3">
                        <AppTextField label="Room" value={moveRoom} onChange={setMoveRoom} placeholder="e.g. A1" isRequired />
                        <AppTextField label="Shelf" value={moveShelf} onChange={setMoveShelf} placeholder="e.g. A1-01" isRequired />
                        <AppTextField label="Box" value={moveBox} onChange={setMoveBox} placeholder="e.g. A1-01-01" isRequired />
                    </form>
                </AppDrawer>
            </AppShell>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2 className="mb-2 text-sm font-medium text-[var(--text-muted)]">{title}</h2>
            {children}
        </div>
    );
}

function InfoPair({ label, value, color }: { label: string; value: string | null; color?: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[var(--text-subtle)]">{label}</p>
            <p className={cn('font-medium text-[var(--foreground)]', color)}>{value || '-'}</p>
        </div>
    );
}

function QuickAction({ icon: Icon, label, onClick, className }: { icon: React.ComponentType<{ size?: number }>; label: string; onClick: () => void; className?: string }) {
    return (
        <button type="button" onClick={onClick}
            className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]', className)}>
            <Icon size={14} /> {label}
        </button>
    );
}
