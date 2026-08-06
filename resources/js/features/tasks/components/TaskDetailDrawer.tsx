import { IconCircleCheck, IconSquareCheck, IconClockHour3, IconExternalLink, IconFileText, IconMessage2, IconNotebook, IconPaperclip, IconPlus, IconNotes, IconUser, IconArrowRight, IconCircle, IconEdit, IconListCheck, IconMessageCircle } from '@tabler/icons-react';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { TabPanel } from 'react-aria-components';
import { Button, Checkbox, Chip, Input, Link, ProgressBar, TextArea } from '@heroui/react';
import { router } from '@inertiajs/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppWorkspaceTabs, type AppWorkspaceTab } from '@/components/ui/AppWorkspaceTabs';
import { AvatarPill } from '@/components/ui/AvatarPill';
import { drawerStyles } from '@/components/drawers';
import { cn } from '@/lib/cn';
import type { TaskActivityLogRow, TaskRow } from '@/features/tasks/types';
import {
    CATEGORY_COLORS, CATEGORY_LABELS, IMPACT_LABELS, PRIORITY_COLORS, PRIORITY_LABELS,
    STATUS_COLORS, STATUS_LABELS, TYPE_LABELS,
} from '@/features/tasks/types';

type Props = {
    task: TaskRow | null;
    onClose: () => void;
    onComplete: (task: TaskRow) => void;
    onChecklistToggle: (taskId: number, itemId: number) => void;
    onChecklistAdd: (taskId: number, label: string) => void;
    onCommentAdd: (taskId: number, body: string) => void;
    onAttachmentUpload: (taskId: number, file: File) => void;
};

type TabId = 'overview' | 'checklist' | 'comments' | 'files' | 'activity';

const TABS: AppWorkspaceTab[] = [
    { id: 'overview', label: 'Overview', icon: IconCircle },
    { id: 'checklist', label: 'Checklist', icon: IconListCheck },
    { id: 'comments', label: 'Comments', icon: IconMessage2 },
    { id: 'files', label: 'Files', icon: IconPaperclip },
    { id: 'activity', label: 'Activity', icon: IconClockHour3 },
];

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
    return <Chip size="sm" className={cn('h-5 rounded-full border px-2 text-[9px] font-semibold', className)}>{children}</Chip>;
}

export function TaskDetailDrawer({ task, onClose, onComplete, onChecklistToggle, onChecklistAdd, onCommentAdd, onAttachmentUpload }: Props) {
    const [tab, setTab] = useState<TabId>('overview');
    const [checklistLabel, setChecklistLabel] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [noteBody, setNoteBody] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [showNote, setShowNote] = useState(false);
    const [fetchedTask, setFetchedTask] = useState<TaskRow | null>(null);

    useEffect(() => {
        if (!task) { setFetchedTask(null); return; }
        fetch(`/tasks/${task.id}/detail`, {
            headers: { Accept: 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => setFetchedTask(data))
            .catch(() => setFetchedTask(task));
    }, [task]);

    useEffect(() => {
        setTab('overview');
        setChecklistLabel('');
        setCommentBody('');
        setNoteBody('');
        setAttachment(null);
        setShowNote(false);
    }, [task?.id]);

    const links = useMemo(() => {
        if (!task) return [];
        return [
            task.client ? { label: `Client: ${task.client.name}`, href: `/clients/${task.client.id}` } : null,
            task.dossier ? { label: `Dossier: ${task.dossier.number}`, href: `/dossiers/${task.dossier.id}` } : null,
            task.conversationId ? { label: 'Conversation', href: '/inbox' } : null,
        ].filter(Boolean) as { label: string; href: string }[];
    }, [task]);

    const checklistItems = Array.isArray(task?.checklistItems) ? task.checklistItems : [];
    const doneCount = checklistItems.filter((i) => i.isDone).length;
    const isComplete = task?.status === 'completed' || task?.status === 'cancelled';

    if (!task) return null;

    const submitChecklist = (e: FormEvent) => { e.preventDefault(); if (!checklistLabel.trim()) return; onChecklistAdd(task.id, checklistLabel.trim()); setChecklistLabel(''); };
    const submitComment = (e: FormEvent) => { e.preventDefault(); if (!commentBody.trim()) return; onCommentAdd(task.id, commentBody.trim()); setCommentBody(''); };
    const submitNote = (e: FormEvent) => { e.preventDefault(); if (!noteBody.trim()) return; onCommentAdd(task.id, noteBody.trim()); setNoteBody(''); };
    const submitAttachment = (e: FormEvent) => { e.preventDefault(); if (!attachment) return; onAttachmentUpload(task.id, attachment); setAttachment(null); };

    return (
        <AppDrawer isOpen={!!task} onOpenChange={(o) => { if (!o) onClose(); }} size="lg"
            title={
                <div className="flex items-center gap-3 min-w-0">
                    <div>
                        <p className="text-sm font-bold text-[var(--crm-text)]">{task.title}</p>
                        <p className="text-[9px] text-[var(--crm-muted)]">{task.taskNumber}</p>
                    </div>
                </div>
            }
            footer={
                <div className="flex items-center gap-2">
                    <AppButton variant="secondary" onPress={onClose}>Fermer</AppButton>
                    {!isComplete ? (
                        <AppButton variant="primary" onPress={() => onComplete(task)}>
                            <IconCircleCheck size={14} /> Marquer terminée
                        </AppButton>
                    ) : null}
                </div>
            }>
            {/* Mini header */}
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <Badge className={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                <Badge className={PRIORITY_COLORS[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                <Badge className={CATEGORY_COLORS[task.category]}>{CATEGORY_LABELS[task.category]}</Badge>
            </div>

            {/* Tabs */}
            <AppWorkspaceTabs tabs={TABS} selectedKey={tab} onSelectionChange={(key) => setTab(key as TabId)}>
                <TabPanel id="overview" className="outline-none"><OverviewTab task={task} links={links} /></TabPanel>
                <TabPanel id="checklist" className="outline-none">
                    <ChecklistTab task={task} checklistItems={checklistItems} doneCount={doneCount} isComplete={isComplete}
                        onToggle={(id) => onChecklistToggle(task.id, id)} onAdd={submitChecklist}
                        label={checklistLabel} onLabelChange={setChecklistLabel} />
                </TabPanel>
                <TabPanel id="comments" className="outline-none">
                    <CommentsTab task={fetchedTask || task} commentBody={commentBody} noteBody={noteBody} showNote={showNote}
                        onCommentChange={setCommentBody} onNoteChange={setNoteBody}
                        onSubmitComment={submitComment} onSubmitNote={submitNote}
                        onToggleNote={() => setShowNote(!showNote)} />
                </TabPanel>
                <TabPanel id="files" className="outline-none">
                    <FilesTab task={fetchedTask || task} onAttachmentChange={setAttachment} onSubmit={submitAttachment} />
                </TabPanel>
                <TabPanel id="activity" className="outline-none"><ActivityTab task={fetchedTask || task} /></TabPanel>
            </AppWorkspaceTabs>
        </AppDrawer>
    );
}

function OverviewTab({ task, links }: { task: TaskRow; links: { label: string; href: string }[] }) {
    const row = (label: string, val: string | number | null) => val ? (
        <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--crm-text)]">{val}</p>
        </div>
    ) : null;

    return (
        <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
                {row('Type', TYPE_LABELS[task.type])}
                {row('Impact', IMPACT_LABELS[task.impact])}
                {row('Status', STATUS_LABELS[task.status])}
                {row('Progress', `${task.progress}%`)}
                {row('Start date', task.startDate)}
                {row('Due date', task.dueDate + (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled' ? ' (Overdue)' : ''))}
                {row('Estimated', task.estimatedMinutes ? `${task.estimatedMinutes} min` : null)}
                {row('Actual', task.actualMinutes ? `${task.actualMinutes} min` : null)}
            </div>

            {task.description ? (
                <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Description</p>
                    <p className="mt-0.5 text-sm text-[var(--crm-text)]">{task.description}</p>
                </div>
            ) : null}

            {/* People */}
            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">People</p>
                <div className="flex flex-wrap gap-2">
                    {Array.isArray(task.assignees) && task.assignees.map((a) => (
                        <Chip key={a.id} size="sm" className="h-7 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--text)]">
                            <AvatarPill name={a.name} size="sm" className="size-5 min-w-5 border-2 border-[var(--surface)] text-[8px]" />
                            {a.name}
                        </Chip>
                    ))}
                    {Array.isArray(task.watchers) && task.watchers.map((w) => (
                        <Chip key={w.id} size="sm" className="h-7 rounded-full border border-[var(--border)] px-2.5 text-[9px] text-[var(--text-muted)]">Watching: {w.name}</Chip>
                    ))}
                    {(!Array.isArray(task.assignees) || task.assignees.length === 0) && (!Array.isArray(task.watchers) || task.watchers.length === 0) ? (
                        <span className="text-xs text-[var(--text-muted)]">No people assigned.</span>
                    ) : null}
                </div>
            </div>

            {/* Linked records */}
            {links.length > 0 ? (
                <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Linked records</p>
                    <div className="flex flex-wrap gap-1.5">
                        {links.map((link) => (
                            <AppButton key={link.href} variant="bordered" size="sm" className="h-7 min-h-7 rounded-lg px-2.5 text-xs font-semibold text-[var(--text)]" onPress={() => router.visit(link.href)}>
                                <IconExternalLink size={12} /> {link.label}
                            </AppButton>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Quick actions */}
            {task.status !== 'completed' && task.status !== 'cancelled' ? (
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { s: 'in_progress', l: 'Start' },
                        { s: 'waiting_client', l: 'Waiting client' },
                        { s: 'blocked', l: 'Blocked' },
                        { s: 'in_review', l: 'In review' },
                    ].filter((a) => a.s !== task.status).map((action) => (
                        <AppButton key={action.s} variant="bordered" size="sm" className="h-7 min-h-7 rounded-lg px-2.5 text-[9px] font-semibold text-[var(--text-muted)]" onPress={() => router.put(`/tasks/${task.id}/status`, { status: action.s }, { preserveScroll: true, preserveState: true })}>
                            {action.l}
                        </AppButton>
                    ))}
                </div>
            ) : null}

            {task.blockedReason ? (
                <div className="rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-2 text-xs text-red-200">
                    <p className="font-semibold">Blocked reason:</p>
                    <p>{task.blockedReason}</p>
                </div>
            ) : null}
        </div>
    );
}

function ChecklistTab({ task, checklistItems, doneCount, isComplete, onToggle, onAdd, label, onLabelChange }: {
    task: TaskRow;
    checklistItems: TaskRow['checklistItems'];
    doneCount: number;
    isComplete: boolean;
    onToggle: (id: number) => void;
    onAdd: (e: FormEvent) => void;
    label: string;
    onLabelChange: (v: string) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--text-muted)]">Checklist {doneCount}/{checklistItems.length}</p>
                <span className="text-xs font-semibold text-[var(--text-muted)]">{task.progress}%</span>
            </div>
            <ProgressBar value={task.progress} aria-label={`${task.progress}% complete`} className="h-1.5">
                <ProgressBar.Track className="h-full rounded-full bg-[var(--surface-3)]">
                    <ProgressBar.Fill className="h-full rounded-full bg-[var(--accent)]" />
                </ProgressBar.Track>
            </ProgressBar>
            {checklistItems.length > 0 ? (
                <div className="space-y-1">
                    {checklistItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition hover:bg-[var(--surface)]">
                            <Checkbox isSelected={item.isDone} onChange={() => onToggle(item.id)} aria-label={item.label} />
                            <span className={item.isDone ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}>{item.label}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-3 text-sm text-[var(--text-muted)]">No checklist items yet.</p>
            )}
            {!isComplete ? (
                <form onSubmit={onAdd} className="flex gap-2">
                    <Input value={label} onChange={(e) => onLabelChange(e.target.value)} placeholder="Add checklist item" aria-label="Add checklist item" className={drawerStyles.input} />
                    <AppButton variant="secondary" type="submit"><IconPlus size={14} /> Add</AppButton>
                </form>
            ) : null}
        </div>
    );
}

function CommentsTab({ task, commentBody, noteBody, showNote, onCommentChange, onNoteChange, onSubmitComment, onSubmitNote, onToggleNote }: {
    task: TaskRow;
    commentBody: string;
    noteBody: string;
    showNote: boolean;
    onCommentChange: (v: string) => void;
    onNoteChange: (v: string) => void;
    onSubmitComment: (e: FormEvent) => void;
    onSubmitNote: (e: FormEvent) => void;
    onToggleNote: () => void;
}) {
    const comments = Array.isArray(task.comments) ? task.comments : [];
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--text-muted)]">Comments ({comments.length})</p>
                <Button size="sm" variant="ghost" onPress={onToggleNote} className="h-6 min-h-6 px-1.5 text-[9px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)]">
                    <IconNotes size={12} /> {showNote ? 'Write comment' : 'Internal note'}
                </Button>
            </div>
            {comments.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {comments.map((c) => (
                        <div key={c.id} className={`rounded-lg border px-3 py-2 ${c.isNote ? 'border-amber-400/15 bg-amber-400/5' : 'border-[var(--border)] bg-[var(--surface)]'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                                <AvatarPill name={c.user?.name || '?'} size="sm" className="size-5 min-w-5 text-[7px]" />
                                <span className="text-[9px] font-semibold text-[var(--text)]">{c.user?.name || 'Unknown'}</span>
                                {c.isNote ? <Chip size="sm" className="h-4 min-h-4 rounded bg-amber-400/15 px-1 text-[8px] font-bold text-amber-300">NOTE</Chip> : null}
                                <span className="ml-auto text-[9px] text-[var(--text-muted)]">{c.createdAt?.slice(0, 10)}</span>
                            </div>
                            <p className="text-xs text-[var(--text)] whitespace-pre-wrap">{c.body}</p>
                        </div>
                    ))}
                </div>
            ) : null}
            {!showNote ? (
                <form onSubmit={onSubmitComment} className="space-y-2">
                    <TextArea value={commentBody} onChange={(e) => onCommentChange(e.target.value)} placeholder="Write a comment or @mention someone..." rows={3} aria-label="Write a comment" className={drawerStyles.textarea} />
                    <AppButton variant="secondary" type="submit"><IconMessage2 size={14} /> Add comment</AppButton>
                </form>
            ) : (
                <form onSubmit={onSubmitNote} className="space-y-2">
                    <TextArea value={noteBody} onChange={(e) => onNoteChange(e.target.value)} placeholder="Internal note (team only)..." rows={3} aria-label="Internal note" className={cn(drawerStyles.textarea, 'border-amber-400/20')} />
                    <AppButton variant="secondary" type="submit"><IconNotebook size={14} /> Add note</AppButton>
                </form>
            )}
        </div>
    );
}

function FilesTab({ task, onAttachmentChange, onSubmit }: {
    task: TaskRow;
    onAttachmentChange: (f: File | null) => void;
    onSubmit: (e: FormEvent) => void;
}) {
    const attachments = Array.isArray(task.attachments) ? task.attachments : [];
    return (
        <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--crm-muted)]">Attachments ({attachments.length})</p>
            <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
                <Input type="file" onChange={(e) => onAttachmentChange(e.target.files?.[0] ?? null)} aria-label="Upload attachment" className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)]" />
                <AppButton variant="secondary" type="submit"><IconPaperclip size={14} /> Upload</AppButton>
            </form>
            {attachments.length > 0 ? (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {attachments.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                            <IconFileText size={16} className="shrink-0 text-[var(--text-muted)]" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-[var(--text)]">{a.originalFilename}</p>
                                <p className="text-[9px] text-[var(--text-muted)]">{a.sizeLabel || `${a.size} B`}{a.user ? ` by ${a.user.name}` : ''}</p>
                            </div>
                            {a.downloadUrl ? (
                                <Link href={a.downloadUrl} download target="_blank" rel="noopener noreferrer"
                                    className="shrink-0 rounded-lg border border-[var(--border)] px-2 py-1 text-[9px] font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                                    Download
                                </Link>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-center text-xs text-[var(--text-muted)]">
                    <IconFileText size={20} className="mx-auto mb-1 text-[var(--text-muted)]" />
                    No files uploaded yet.
                </div>
            )}
        </div>
    );
}

const ACTIVITY_ICONS: Record<string, { icon: typeof IconCircle; color: string; label: string }> = {
    created: { icon: IconPlus, color: 'text-blue-400', label: 'Task created' },
    updated: { icon: IconEdit, color: 'text-amber-400', label: 'Task updated' },
    status_changed: { icon: IconArrowRight, color: 'text-violet-400', label: 'Status changed' },
    checklist_added: { icon: IconListCheck, color: 'text-cyan-400', label: 'Checklist item added' },
    checklist_toggled: { icon: IconSquareCheck, color: 'text-emerald-400', label: 'Checklist toggled' },
    comment_added: { icon: IconMessageCircle, color: 'text-blue-400', label: 'Comment added' },
    note_added: { icon: IconNotebook, color: 'text-amber-400', label: 'Note added' },
    attachment_added: { icon: IconPaperclip, color: 'text-rose-400', label: 'Attachment added' },
    attachment_removed: { icon: IconPaperclip, color: 'text-red-400', label: 'Attachment removed' },
};

function ActivityIcon({ entry }: { entry: TaskActivityLogRow }) {
    const cfg = ACTIVITY_ICONS[entry.action] || { icon: IconCircle, color: 'text-zinc-400', label: entry.action };
    const Icon = cfg.icon;
    return (
        <div className="flex items-start gap-3 group">
            <div className="flex flex-col items-center">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--crm-surface-3)] ${cfg.color}`}>
                    <Icon size={12} />
                </span>
                <div className="mt-0.5 w-px flex-1 bg-[var(--crm-border)] group-last:hidden" />
            </div>
            <div className="pb-4">
                <p className="text-xs font-semibold text-[var(--crm-text)]">
                    {cfg.label}
                    {entry.action === 'status_changed' && entry.description ? (
                        <span className="ml-1 text-[var(--crm-text-muted)] font-normal">{entry.description}</span>
                    ) : null}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    {entry.user ? (
                        <span className="flex items-center gap-1 text-[9px] text-[var(--crm-text-muted)]">
                            <IconUser size={9} /> {entry.user.name}
                        </span>
                    ) : null}
                    <span className="text-[9px] text-[var(--crm-text-muted)]">{entry.createdAt?.slice(0, 16).replace('T', ' ')}</span>
                </div>
            </div>
        </div>
    );
}

function ActivityTab({ task }: { task: TaskRow }) {
    const logs = Array.isArray(task.activityLogs) ? task.activityLogs : [];
    return (
        <div className="space-y-1">
            <p className="text-xs font-bold text-[var(--crm-muted)] mb-3">Activity log</p>
            {logs.length > 0 ? (
                <div className="-ml-1">
                    {logs.map((entry) => (
                        <ActivityIcon key={entry.id} entry={entry} />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-[var(--crm-border)] px-4 py-4 text-center text-xs text-[var(--crm-text-muted)]">
                    <IconClockHour3 size={16} className="mx-auto mb-1 text-[var(--crm-muted)]" />
                    No activity recorded yet.
                </div>
            )}
        </div>
    );
}
