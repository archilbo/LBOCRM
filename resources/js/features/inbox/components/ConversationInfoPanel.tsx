import { Avatar, Button, Chip, ScrollShadow } from '@heroui/react';
import { Archive, ArchiveRestore, Bell, BellOff, BriefcaseBusiness, FileText, FolderKanban, Image as ImageIcon, Info, ListChecks, MailOpen, PanelRightClose, PanelRightOpen, Pin, PinOff, ReceiptText, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';
import { conversationInitial, conversationName, conversationStatus } from '@/features/chat/helpers';
import { inboxApi } from '@/features/inbox/api';
import { InboxIconButton } from '@/features/inbox/components/InboxIconButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { isImageAttachment } from '@/features/inbox/utils/fileFormatters';

type Props = {
    conversation: ConversationRow | null;
    messages: MessageRow[];
    currentUserId: number;
    onArchiveToggle: (conversation: ConversationRow) => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
    onPreference?: (conversation: ConversationRow, preference: 'pinned' | 'muted', value: boolean) => void;
    onMarkUnread?: (conversation: ConversationRow) => void;
};

function isOnline(lastSeenAt?: string | null, explicit?: boolean): boolean {
    return Boolean(explicit || (lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < 300000));
}

export function ConversationInfoPanel({ conversation, messages, currentUserId, onArchiveToggle, collapsed, onToggleCollapsed, mobileOpen = false, onMobileClose, onPreference, onMarkUnread }: Props) {
    const [attachments, setAttachments] = useState<MessageAttachmentRow[]>([]);

    useEffect(() => {
        if (!conversation) { setAttachments([]); return; }
        const controller = new AbortController();
        inboxApi.attachments(conversation.id, 1, controller.signal)
            .then((result) => setAttachments(result.attachments))
            .catch(() => undefined);
        return () => controller.abort();
    }, [conversation?.id]);

    const panel = useMemo(() => {
        if (!conversation) return null;
        const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
        const availableAttachments = attachments.length > 0 ? attachments : messages.flatMap((message) => message.attachments || []);
        const images = availableAttachments.filter((a) => isImageAttachment(a)).slice(0, 9);
        const files = availableAttachments.filter((a) => !isImageAttachment(a)).slice(0, 6);
        const onlineCount = participants.filter((participant) => isOnline(participant.user?.lastSeenAt, participant.user?.isOnline)).length;
        const status = conversationStatus(conversation, currentUserId) || 'Details de la conversation';

        return (
            <div className="flex h-full min-h-0 flex-col bg-[var(--surface)] text-[var(--text)]">
                <header className="border-b border-[var(--border)] px-5 py-4 text-center">
                    <Avatar size="lg" name={conversationName(conversation, currentUserId)} className="mx-auto bg-[var(--accent-soft)] font-bold text-[var(--accent)]">
                        {conversation.type === 'group' ? <Users size={22} /> : conversationInitial(conversation, currentUserId)}
                    </Avatar>
                    <h2 className="mt-3 truncate text-base font-semibold">{conversationName(conversation, currentUserId)}</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {conversation.type === 'group' ? `${participants.length} membres` : 'Conversation directe'}
                    </p>
                    <Chip size="sm" variant="flat" color={onlineCount > 0 ? 'success' : 'default'} className="mt-3">
                        {conversation.type === 'group' ? `${onlineCount} en ligne` : status}
                    </Chip>
                </header>

                <ScrollShadow className="min-h-0 flex-1 space-y-5 px-4 py-4">
                    <section aria-labelledby="members-heading">
                        <h3 id="members-heading" className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"><Users size={14} /> Membres</h3>
                        <div>
                            {participants.map((participant) => {
                                const user = participant.user ?? participant;
                                const name = user?.name || 'Utilisateur';
                                const online = isOnline(user?.lastSeenAt, user?.isOnline);
                                return (
                                    <div key={participant.id} className="flex items-center gap-2.5 border-b border-[color-mix(in_srgb,var(--border)_60%,transparent)] px-1 py-2.5 last:border-0">
                                        <div className="relative">
                                            <Avatar size="sm" name={name} />
                                            {online ? <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--surface-2)] bg-emerald-400" /> : null}
                                        </div>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-xs font-semibold">{name}</span>
                                            <span className="block truncate text-[9px] text-[var(--text-muted)]">{online ? 'En ligne' : user?.email || 'Hors ligne'}</span>
                                        </span>
                                        {participant.role && participant.role !== 'member' ? <Chip size="sm" variant="soft">{participant.role}</Chip> : null}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section aria-labelledby="images-heading">
                        <h3 id="images-heading" className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"><ImageIcon size={14} /> Images partagees</h3>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1.5">
                                {images.map((image) => <img key={image.id} src={image.thumbnailUrl || image.url || ''} alt={image.originalFilename} loading="lazy" className="aspect-square rounded-lg object-cover" />)}
                            </div>
                        ) : <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--text-muted)]">Aucune image partagee.</div>}
                    </section>

                    {files.length > 0 ? (
                        <section aria-labelledby="files-heading">
                            <h3 id="files-heading" className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"><FileText size={14} /> Fichiers</h3>
                            <div className="space-y-1.5">
                                {files.map((file) => (
                                    <Button key={file.id} href={file.downloadUrl || file.url || '#'} variant="secondary" size="sm" className="w-full justify-start">
                                        <FileText size={13} className="text-[var(--accent)]" /><span className="truncate">{file.originalFilename}</span>
                                    </Button>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {conversation.context && Object.values(conversation.context).some(Boolean) ? (
                        <section aria-labelledby="context-heading">
                            <h3 id="context-heading" className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Contexte lie</h3>
                            <div className="grid grid-cols-2 gap-1.5">
                                {conversation.context.clientId ? <Button size="sm" variant="secondary" href={`/clients/${conversation.context.clientId}`}><BriefcaseBusiness size={13} />Client</Button> : null}
                                {conversation.context.dossierId ? <Button size="sm" variant="secondary" href={`/dossiers/${conversation.context.dossierId}`}><FolderKanban size={13} />Dossier</Button> : null}
                                {conversation.context.taskId ? <Button size="sm" variant="secondary" href={`/tasks?task=${conversation.context.taskId}`}><ListChecks size={13} />Tache</Button> : null}
                                {conversation.context.financeDocumentId ? <Button size="sm" variant="secondary" href={`/finance/documents/${conversation.context.financeDocumentId}`}><ReceiptText size={13} />Finance</Button> : null}
                            </div>
                        </section>
                    ) : null}
                </ScrollShadow>

                <footer className="border-t border-[var(--border)] p-4">
                    <div className="mb-2 grid grid-cols-3 gap-1.5">
                        <InboxIconButton label={conversation.isPinned ? 'Desepingler' : 'Epingler'} tone="accent" onPress={() => onPreference?.(conversation, 'pinned', !conversation.isPinned)} className="w-full border border-[var(--border)]">{conversation.isPinned ? <PinOff size={14} /> : <Pin size={14} />}</InboxIconButton>
                        <InboxIconButton label={conversation.isMuted ? 'Reactiver les notifications' : 'Mettre en sourdine'} tone="accent" onPress={() => onPreference?.(conversation, 'muted', !conversation.isMuted)} className="w-full border border-[var(--border)]">{conversation.isMuted ? <Bell size={14} /> : <BellOff size={14} />}</InboxIconButton>
                        <InboxIconButton label="Marquer non lu" tone="accent" onPress={() => onMarkUnread?.(conversation)} className="w-full border border-[var(--border)]"><MailOpen size={14} /></InboxIconButton>
                    </div>
                    <Button variant="secondary" onPress={() => onArchiveToggle(conversation)} className="w-full">
                        {conversation.archivedAt ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                        {conversation.archivedAt ? 'Restaurer la conversation' : 'Archiver la conversation'}
                    </Button>
                    <p className="mt-2 flex items-center justify-center gap-1 text-[9px] text-[var(--text-muted)]"><Info size={11} /> L archivage est personnel.</p>
                </footer>
            </div>
        );
    }, [attachments, conversation, currentUserId, messages, onArchiveToggle, onMarkUnread, onPreference]);

    return (
        <>
            <aside className={`hidden shrink-0 border-l border-[var(--border)] bg-[var(--surface)] xl:flex ${collapsed ? 'w-12 items-start justify-center' : 'w-[292px]'}`}>
                {collapsed ? (
                    <div className="space-y-3 py-3">
                        <InboxIconButton label="Afficher les details" tone="accent" onPress={onToggleCollapsed} className="border border-[var(--border)]"><PanelRightOpen size={15} /></InboxIconButton>
                        {conversation ? <Avatar size="sm" name={conversationName(conversation, currentUserId)}>{conversationInitial(conversation, currentUserId)}</Avatar> : null}
                    </div>
                ) : (
                    <div className="relative h-full min-h-0 w-full">
                        <InboxIconButton label="Masquer les details" onPress={onToggleCollapsed} className="absolute right-3 top-3 z-10 border border-[var(--border)] bg-[var(--surface)]"><PanelRightClose size={15} /></InboxIconButton>
                        {panel || <div className="flex h-full items-center justify-center p-8 text-center text-sm text-[var(--text-muted)]">Selectionnez une conversation.</div>}
                    </div>
                )}
            </aside>

            <AppDrawer
                isOpen={mobileOpen}
                onOpenChange={(open) => { if (!open) onMobileClose?.(); }}
                hideHeader
                isDismissable
                panelClassName="xl:hidden !w-[min(100vw,384px)]"
                contentClassName="!p-0"
            >
                {panel}
            </AppDrawer>
        </>
    );
}
