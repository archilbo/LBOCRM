import { Avatar, Button, Card, Chip, ScrollShadow, Switch } from '@heroui/react';
import { IconArchive, IconBell, IconBellOff, IconBriefcase, IconFileText, IconFolder, IconPhoto, IconPhotoOff, IconInfoCircle, IconListCheck, IconMailOpened, IconMessage2, IconLayoutSidebarRightCollapse, IconLayoutSidebarRightExpand, IconPinned, IconPinnedOff, IconReceipt2, IconUsers } from '@tabler/icons-react';

import { useEffect, useMemo, useState } from 'react';
import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';
import { conversationInitial, conversationName, conversationStatus } from '@/features/chat/helpers';
import { inboxApi } from '@/features/inbox/api';
import { InboxIconButton } from '@/features/inbox/components/InboxIconButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { getAttachmentPreviewUrl, isImageAttachment } from '@/features/inbox/utils/fileFormatters';
import { useTranslation } from '@/lib/i18n';

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

function InfoSection({ icon: Icon, title, children }: { icon: typeof IconUsers; title: string; children: React.ReactNode }) {
    return <section><div className="mb-2 flex items-center gap-2"><Icon size={13} className="text-[var(--accent)]" /><h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</h3></div>{children}</section>;
}

function MediaThumbnail({ attachment }: { attachment: MessageAttachmentRow }) {
    const [failed, setFailed] = useState(false);
    const source = getAttachmentPreviewUrl(attachment);

    return source && !failed
        ? <img src={source} alt={attachment.originalFilename} loading="lazy" onError={() => setFailed(true)} className="aspect-square w-full rounded-lg object-cover" />
        : <div className="flex aspect-square items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]"><IconPhotoOff size={15} /></div>;
}

export function ConversationInfoPanel({ conversation, messages, currentUserId, onArchiveToggle, collapsed, onToggleCollapsed, mobileOpen = false, onMobileClose, onPreference, onMarkUnread }: Props) {
    const { t, locale } = useTranslation();
    const [attachments, setAttachments] = useState<MessageAttachmentRow[]>([]);

    useEffect(() => {
        if (!conversation) {
            setAttachments([]);
            return;
        }

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
        const images = availableAttachments.filter(isImageAttachment).slice(0, 6);
        const files = availableAttachments.filter((attachment) => !isImageAttachment(attachment)).slice(0, 5);
        const onlineCount = participants.filter((participant) => isOnline(participant.user?.lastSeenAt, participant.user?.isOnline)).length;
        const name = conversationName(conversation, currentUserId);
        const status = conversationStatus(conversation, currentUserId, locale) || t('inbox.details');

        return (
            <div className="flex h-full min-h-0 flex-col bg-[var(--surface)] text-[var(--foreground)]">
                <header className="flex h-[68px] shrink-0 items-center border-b border-[var(--border)] px-4 pr-12">
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{t('inbox.infoTitle')}</p><p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{t('inbox.infoSubtitle')}</p></div>
                </header>

                <ScrollShadow className="min-h-0 flex-1 space-y-4 px-4 py-4">
                    <section className="text-center">
                        <Avatar size="lg" name={name} className="mx-auto size-16 bg-[var(--accent-soft)] text-lg font-bold text-[var(--accent)]">
                            {conversation.type === 'group' ? <IconUsers size={23} /> : conversationInitial(conversation, currentUserId)}
                        </Avatar>
                        <h2 className="mt-2 truncate text-sm font-semibold">{name}</h2>
                        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{conversation.type === 'group' ? t('inbox.membersOnline', { count: participants.length, online: onlineCount }) : status}</p>
                    </section>

                    <Card className="flex-row items-center gap-3 border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 shadow-none">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">{conversation.isMuted ? <IconBellOff size={14} /> : <IconBell size={14} />}</div>
                        <div className="min-w-0 flex-1"><p className="text-[11px] font-medium">{t('inbox.notifications')}</p><p className="text-[9px] text-[var(--text-muted)]">{conversation.isMuted ? t('inbox.muted') : t('inbox.activeAlerts')}</p></div>
                        <Switch size="sm" isSelected={!conversation.isMuted} onChange={(selected) => onPreference?.(conversation, 'muted', !selected)} aria-label={t('inbox.notificationsAria')}><Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch.Content></Switch>
                    </Card>
                    <Card className="grid grid-cols-3 divide-x divide-[var(--border)] border border-[var(--border)] bg-[var(--surface-2)] p-0 shadow-none">
                        <div className="px-2 py-2.5 text-center"><p className="text-sm font-semibold">{participants.length}</p><p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{t('inbox.membersStat')}</p></div>
                        <div className="px-2 py-2.5 text-center"><p className="text-sm font-semibold">{messages.length}</p><p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{t('inbox.messagesStat')}</p></div>
                        <div className="px-2 py-2.5 text-center"><p className="text-sm font-semibold">{availableAttachments.length}</p><p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{t('inbox.filesStat')}</p></div>
                    </Card>

                    <InfoSection icon={IconUsers} title={t('inbox.membersSection')}>
                        <div className="space-y-1">
                            {participants.map((participant) => {
                                const user = participant.user ?? participant;
                                const online = isOnline(user?.lastSeenAt, user?.isOnline);
                                return <div key={participant.id} className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-[var(--surface-2)]"><div className="relative"><Avatar size="sm" name={user?.name || t('inbox.user')} />{online ? <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--surface)] bg-emerald-400" /> : null}</div><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{user?.name || t('inbox.user')}</span><span className="block truncate text-[10px] text-[var(--text-muted)]">{online ? t('inbox.online') : user?.email || t('inbox.offline')}</span></span>{participant.role && participant.role !== 'member' ? <Chip size="sm" variant="soft" className="h-5 text-[9px]">{participant.role}</Chip> : null}</div>;
                            })}
                        </div>
                    </InfoSection>

                    <InfoSection icon={IconPhoto} title={`${t('inbox.sharedMedia')}${images.length ? ` (${images.length})` : ''}`}>
                        {images.length > 0 ? <div className="grid grid-cols-3 gap-1.5">{images.map((image) => <MediaThumbnail key={image.id} attachment={image} />)}</div> : <Card className="border border-dashed border-[var(--border)] bg-transparent px-3 py-4 text-center text-xs text-[var(--text-muted)] shadow-none">{t('inbox.noMedia')}</Card>}
                    </InfoSection>

                    {files.length > 0 ? <InfoSection icon={IconFileText} title={t('inbox.filesSection')}><div className="space-y-1.5">{files.map((file) => <Button key={file.id} href={file.downloadUrl || file.url || '#'} variant="ghost" size="sm" className="h-10 w-full justify-start rounded-xl bg-[var(--surface-2)] px-2.5 text-xs"><IconFileText size={14} className="shrink-0 text-[var(--accent)]" /><span className="truncate">{file.originalFilename}</span></Button>)}</div></InfoSection> : null}

                    {conversation.context && Object.values(conversation.context).some(Boolean) ? <InfoSection icon={IconBriefcase} title={t('inbox.linkedContext')}><div className="grid grid-cols-2 gap-1.5">{conversation.context.clientId ? <Button size="sm" variant="ghost" href={`/clients/${conversation.context.clientId}`} className="justify-start bg-[var(--surface-2)] text-xs"><IconBriefcase size={13} />{t('inbox.client')}</Button> : null}{conversation.context.dossierId ? <Button size="sm" variant="ghost" href={`/dossiers/${conversation.context.dossierId}`} className="justify-start bg-[var(--surface-2)] text-xs"><IconFolder size={13} />{t('inbox.dossier')}</Button> : null}{conversation.context.taskId ? <Button size="sm" variant="ghost" href={`/tasks?task=${conversation.context.taskId}`} className="justify-start bg-[var(--surface-2)] text-xs"><IconListCheck size={13} />{t('inbox.task')}</Button> : null}{conversation.context.financeDocumentId ? <Button size="sm" variant="ghost" href={`/finance/documents/${conversation.context.financeDocumentId}`} className="justify-start bg-[var(--surface-2)] text-xs"><IconReceipt2 size={13} />{t('inbox.finance')}</Button> : null}</div></InfoSection> : null}
                </ScrollShadow>

                <footer className="border-t border-[var(--border)] px-4 py-3">
                    <div className="grid grid-cols-3 gap-1.5"><InboxIconButton label={conversation.isPinned ? t('inbox.unpin') : t('inbox.pin')} tone="accent" onPress={() => onPreference?.(conversation, 'pinned', !conversation.isPinned)} className="w-full border border-[var(--border)]">{conversation.isPinned ? <IconPinnedOff size={14} /> : <IconPinned size={14} />}</InboxIconButton><InboxIconButton label={conversation.isMuted ? t('inbox.unmute') : t('inbox.mute')} tone="accent" onPress={() => onPreference?.(conversation, 'muted', !conversation.isMuted)} className="w-full border border-[var(--border)]">{conversation.isMuted ? <IconBell size={14} /> : <IconBellOff size={14} />}</InboxIconButton><InboxIconButton label={t('inbox.markUnread')} tone="accent" onPress={() => onMarkUnread?.(conversation)} className="w-full border border-[var(--border)]"><IconMailOpened size={14} /></InboxIconButton></div>
                    <Button variant="ghost" onPress={() => onArchiveToggle(conversation)} className="mt-2 h-9 w-full rounded-xl border border-[var(--border)] text-xs">{conversation.archivedAt ? <IconArchive size={14} /> : <IconArchive size={14} />}{conversation.archivedAt ? t('inbox.restore') : t('inbox.archive')}</Button>
                    <p className="mt-2 flex items-center justify-center gap-1 text-[9px] text-[var(--text-muted)]"><IconInfoCircle size={11} /> {t('inbox.archiveNote')}</p>
                </footer>
            </div>
        );
    }, [attachments, conversation, currentUserId, locale, messages, onArchiveToggle, onMarkUnread, onPreference, t]);

    return <><aside className={`hidden shrink-0 border-l border-[var(--border)] bg-[var(--surface)] xl:flex ${collapsed ? 'w-12 items-start justify-center' : 'w-[288px]'}`}>{collapsed ? <div className="space-y-3 py-3"><InboxIconButton label={t('inbox.showDetails')} tone="accent" onPress={onToggleCollapsed} className="border border-[var(--border)]"><IconLayoutSidebarRightExpand size={15} /></InboxIconButton>{conversation ? <Avatar size="sm" name={conversationName(conversation, currentUserId)}>{conversationInitial(conversation, currentUserId)}</Avatar> : null}</div> : <div className="relative h-full min-h-0 w-full"><InboxIconButton label={t('inbox.hideDetails')} onPress={onToggleCollapsed} className="absolute right-3 top-3 z-10 border border-[var(--border)] bg-[var(--surface)]"><IconLayoutSidebarRightCollapse size={15} /></InboxIconButton>{panel || <div className="flex h-full items-center justify-center p-8 text-center text-sm text-[var(--text-muted)]">{t('inbox.selectConversation')}</div>}</div>}</aside><AppDrawer isOpen={mobileOpen} onOpenChange={(open) => { if (!open) onMobileClose?.(); }} hideHeader isDismissable panelClassName="xl:hidden !w-[min(100vw,384px)]" contentClassName="!p-0">{panel}</AppDrawer></>;
}
