import { usePage } from '@inertiajs/react';
import { useTyping } from '@/features/inbox/components/useTyping';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import { IconCheck, IconChecks, IconChevronLeft, IconChevronDown, IconChevronUp, IconFileText, IconPhotoOff, IconInfoCircle, IconMessage2, IconPaperclip, IconSearch, IconSend, IconSettings, IconTrash, IconUserMinus, IconUserPlus, IconUsers, IconX } from '@tabler/icons-react';

import { Avatar, Button, Card, Chip, Input, ListBox, Modal, ScrollShadow, SearchField, Select, Spinner, TextArea } from '@heroui/react';
import { getAttachmentPreviewUrl, isImageAttachment } from '@/features/inbox/utils/fileFormatters';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';
import { getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, getLastMessagePreview, highlightSearchMatch, formatConversationTime } from '@/features/inbox/utils';
import { inboxApi, InboxApiError } from '@/features/inbox/api';
import { InboxIconButton } from '@/features/inbox/components/InboxIconButton';
import { MessageActionToolbar } from '@/features/inbox/components/MessageActionToolbar';
import { FileMessageCard } from '@/features/inbox/components/FileMessageCard';
import { FilePreviewModal } from '@/features/inbox/components/FilePreviewModal';
import { ReplyPreview } from '@/features/inbox/components/ReplyPreview';
import { MessageDeliveryStatus } from '@/features/inbox/components/MessageDeliveryStatus';
import { ForwardMessageDialog } from '@/features/inbox/components/ForwardMessageDialog';

function parseMessageDate(value?: string | null): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTime(dateStr?: string | null): string {
    const date = parseMessageDate(dateStr);
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
}

function dateSeparator(dateStr?: string | null, t?: (key: string) => string): string {
    const date = parseMessageDate(dateStr);
    if (!date) return '';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t ? t('inbox.today') : 'Aujourd hui';
    if (date.toDateString() === yesterday.toDateString()) return t ? t('inbox.yesterday') : 'Hier';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shouldGroup(prev: MessageRow | undefined, curr: MessageRow): boolean {
    if (!prev) return false;
    if (prev.userId !== curr.userId) return false;
    const currDate = parseMessageDate(curr.createdAt);
    const prevDate = parseMessageDate(prev.createdAt);
    if (!currDate || !prevDate) return false;
    return currDate.getTime() - prevDate.getTime() < 300000;
}

function avatarInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
}

function ImageGrid({ attachments, onImageClick }: { attachments: MessageAttachmentRow[]; onImageClick?: (index: number) => void }) {
    const { t } = useTranslation();
    const images = attachments.filter((a) => isImageAttachment(a));
    if (attachments.length === 0) return null;
    return (
        <div className="space-y-1">
            {images.length > 0 ? (
                <div className={`grid gap-1.5 overflow-hidden rounded-xl ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {images.slice(0, 4).map((image, index) => (
                        <Button key={image.id} isIconOnly variant="ghost" aria-label={t('inbox.openImage', { name: image.originalFilename })} onPress={() => onImageClick?.(index)} className={`relative w-full min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-0 ${images.length === 1 ? 'aspect-[4/3] max-h-64 min-h-44' : 'aspect-square'}`}>
                            <AttachmentImage attachment={image} />
                            {index === 3 && images.length > 4 ? <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-bold text-white">+{images.length - 4}</span> : null}
                        </Button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function AttachmentImage({ attachment }: { attachment: MessageAttachmentRow }) {
    const [failed, setFailed] = useState(false);
    const source = getAttachmentPreviewUrl(attachment);

    if (!source || failed) {
        return <span className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-[var(--text-muted)]"><IconPhotoOff size={20} /><span className="max-w-full truncate text-[9px]">{attachment.originalFilename}</span></span>;
    }

    return <img src={source} alt={attachment.originalFilename} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition hover:brightness-90" />;
}


function MessageBubble({ msg, isMine, grouped, isGroup, currentUserId, onReply, onForward: onForwardMsg, onImageClick, onEdit, onDelete, onRetry, searchQuery, onReplyClick, onFilePreview }: {
    msg: MessageRow; isMine: boolean; grouped: boolean; isGroup: boolean; currentUserId: number;
    onReply: (msg: MessageRow) => void; onForward: (msg: MessageRow) => void;
    onImageClick: (attachments: MessageAttachmentRow[], index: number) => void;
    onEdit?: (msg: MessageRow) => void; onDelete?: (msg: MessageRow) => void; onRetry?: (msg: MessageRow) => void;
    searchQuery?: string;
    onReplyClick?: (replyToId: number) => void;
    onFilePreview?: (attachment: MessageAttachmentRow, allAttachments: MessageAttachmentRow[]) => void;
}) {
    const { t } = useTranslation();
    const avatarTone = getAvatarTone(msg.userId ?? msg.user?.id ?? 0);
    const highlight = (text: string) => {
        if (!searchQuery || !text) return text;
        const match = highlightSearchMatch(text, searchQuery);
        if (!match) return text;
        return <>{match.before}<mark className="bg-[var(--crm-gold)]/30 text-inherit rounded px-0.5">{match.match}</mark>{match.after}</>;
    };
    const images = msg.attachments?.filter((a) => isImageAttachment(a)) || [];
    const files = msg.attachments?.filter((a) => !isImageAttachment(a)) || [];
    const hasBody = Boolean(msg.body?.trim());
    const isMediaOnly = images.length > 0 && !hasBody && files.length === 0;
    return (
        <div className={`group/message mb-1 flex items-start gap-2.5 ${isMine ? 'justify-end' : 'justify-start'} ${grouped ? '' : 'mt-3'}`}>
            {!isMine ? (
                <div className="w-8 shrink-0 pt-4">
                    {!grouped ? <Avatar size="sm" name={msg.user?.name || msg.userName || ''} className={`${avatarTone.bg} ${avatarTone.text}`}><Avatar.Fallback>{avatarInitials(msg.user?.name || msg.userName || '')}</Avatar.Fallback></Avatar> : null}
                </div>
            ) : null}
            {isMine ? (
                <div className="self-start pt-[10px]">
                    <MessageActionToolbar isMine={isMine} body={msg.body} onReply={() => onReply(msg)} onForward={() => onForwardMsg(msg)} onEdit={() => onEdit?.(msg)} onDelete={() => onDelete?.(msg)} />
                </div>
            ) : null}
            <div className="min-w-0 max-w-[88%] sm:max-w-[76%] xl:max-w-[70%]">
                {!grouped ? <div className={`mb-1 flex items-center gap-2 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}><p className={`text-[10px] font-semibold ${isMine ? 'text-[var(--foreground)]' : avatarTone.text}`}>{isMine ? t('inbox.you') : msg.user?.name || msg.userName || t('inbox.user')}</p><span className="text-[8px] text-[var(--text-muted)]">{formatTime(msg.createdAt)}</span>{isGroup && !isMine ? <Chip size="sm" variant="soft" className="h-4 px-1 text-[7px]">{t('inbox.member')}</Chip> : null}</div> : null}
                {msg.isForwarded ? <p className={`mb-0.5 text-[9px] text-[var(--crm-muted)] ${isMine ? 'text-right' : 'text-left'}`}>{t('inbox.forwarded')}</p> : null}
                {msg.replyTo ? (
                    <ReplyPreview replyTo={msg.replyTo} isMine={isMine} onClick={() => onReplyClick?.(msg.replyTo!.id)} />
                ) : null}
                <Card className={`overflow-hidden ${isMediaOnly ? 'rounded-xl border-0 bg-transparent text-[var(--text)] shadow-none' : isMine ? 'rounded-2xl rounded-br-md border-transparent bg-[var(--accent)] text-black shadow-sm' : 'rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-sm'}`}>
                    {msg.attachments && msg.attachments.length > 0 ? (
                        <div className={`${msg.body ? 'rounded-t-xl' : 'rounded-xl'} overflow-hidden`}>
                            {images.length > 0 ? <ImageGrid attachments={images} onImageClick={(imgIdx) => onImageClick(msg.attachments || [], imgIdx)} /> : null}
                            {files.length > 0 ? (
                                <div className={`space-y-1.5 p-2 ${images.length > 0 ? 'border-t border-black/10' : ''}`}>
                                    {files.map((file) => <FileMessageCard key={file.id} attachment={file} isMine={isMine} onPreview={(att) => onFilePreview?.(att, msg.attachments || [])} />)}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    {hasBody ? (
                        <div className={`whitespace-pre-wrap break-words px-2 py-1 text-[11px] leading-2 ${msg.attachments && msg.attachments.length > 0 ? 'border-t border-black/10' : ''}`}>
                            {highlight(msg.body)}
                        </div>
                    ) : null}
                </Card>
                <div className={`mt-0.5 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <MessageDeliveryStatus createdAt={msg.createdAt} isMine={isMine} readBy={msg.readBy} isEdited={msg.isEdited} isFailed={msg.isFailed} onRetry={() => onRetry?.(msg)} />
                </div>
            </div>
            {isMine ? (!grouped ? <Avatar size="sm" name={msg.user?.name || msg.userName || t('inbox.you')} className={`mt-4 shrink-0 ${avatarTone.bg} ${avatarTone.text}`}><Avatar.Fallback>{avatarInitials(msg.user?.name || msg.userName || t('inbox.you'))}</Avatar.Fallback></Avatar> : <div className="w-8 shrink-0" />) : null}
            {!isMine ? (
                <div className="self-start pt-[10px]">
                    <MessageActionToolbar isMine={isMine} body={msg.body} onReply={() => onReply(msg)} onForward={() => onForwardMsg(msg)} onEdit={() => onEdit?.(msg)} onDelete={() => onDelete?.(msg)} />
                </div>
            ) : null}
        </div>
    );
}

type Props = {
    conversation: ConversationRow;
    conversations: ConversationRow[];
    messages: MessageRow[];
    loading: boolean;
    loadingOlder: boolean;
    paginator: { currentPage: number; lastPage: number; perPage: number; total: number } | null;
    currentUserId: number;
    onSend: (body: string, files: File[], replyToId?: number) => Promise<MessageRow>;
    onLoadOlder: () => void;
    onMessageUpdate?: (message: MessageRow) => void;
    onMessageDelete?: (messageId: number) => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    onRetryMessage?: (message: MessageRow) => void;
    onSearchMessagesLoaded?: (messages: MessageRow[]) => void;
    users?: { id: number; name: string }[];
    onOpenInfo?: () => void;
    onBack?: () => void;
};

export function MessageThread({ conversation, conversations, messages, loading, loadingOlder, paginator, currentUserId, onSend, onLoadOlder, onMessageUpdate, onMessageDelete, onScroll, onRetryMessage, onSearchMessagesLoaded, users = [], onOpenInfo, onBack }: Props) {
    const { t } = useTranslation();
    const pageUsers = users;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const prevLastId = useRef<number | null>(null);
    const [text, setText] = useState('');
    const [selectedAttachments, setSelectedImages] = useState<File[]>([]);
    const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
    const [forwardMsg, setForwardMsg] = useState<MessageRow | null>(null);
    const [editingMsg, setEditingMsg] = useState<MessageRow | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
    const [groupSubject, setGroupSubject] = useState(conversation.subject || '');
    const [addUserId, setAddUserId] = useState('');
    const [availableUsers, setAvailableUsers] = useState<{ id: number; name: string }[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [searchIndex, setSearchIndex] = useState(0);
    const [filePreview, setFilePreview] = useState<{ attachments: MessageAttachmentRow[]; index: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const authUser = (usePage().props.auth?.user as { id: number; name: string } | undefined) || { id: 0, name: '' };
    const { typingUsers, sendTyping } = useTyping(
        conversation?.id ?? null,
        currentUserId,
        authUser?.name || 'User',
    );
    const filePreviews = useMemo(() => selectedAttachments.map((file) => ({
        file,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    })), [selectedAttachments]);

    useEffect(() => () => filePreviews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url);
    }), [filePreviews]);

    useEffect(() => {
        setText(conversation.draft || '');
    }, [conversation.id]);

    useEffect(() => {
        if (editingMsg) return;
        const timer = window.setTimeout(() => {
            inboxApi.preferences(conversation.id, { draft: text.trim() || null }).catch(() => undefined);
        }, 600);
        return () => window.clearTimeout(timer);
    }, [conversation.id, editingMsg, text]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastId = messages[messages.length - 1].id;
            if (lastId !== prevLastId.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            prevLastId.current = lastId;
        }
    }, [messages]);

    useEffect(() => {
        if (searchQuery.trim().length < 2) { setSearchResults([]); setSearchIndex(0); return; }
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            inboxApi.searchMessages(conversation.id, searchQuery.trim(), 1, controller.signal)
                .then((result) => {
                    onSearchMessagesLoaded?.(result.messages);
                    setSearchResults(result.messages.map((message) => message.id));
                    setSearchIndex(0);
                })
                .catch((error) => {
                    if (!(error instanceof DOMException && error.name === 'AbortError')) toast.error(t('inbox.toast.searchError'));
                });
        }, 250);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [conversation.id, searchQuery, onSearchMessagesLoaded]);

    useEffect(() => {
        if (searchResults.length > 0 && searchIndex < searchResults.length) {
            const el = document.getElementById(`msg-${searchResults[searchIndex]}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [searchResults, searchIndex]);

    const parts = Array.isArray(conversation.participants) ? conversation.participants : [];
    const others = parts.filter((p) => p?.user?.id !== currentUserId);
    const otherName = getConversationDisplayName(conversation, currentUserId);
    const isGroup = conversation.type === 'group';
    const canManageGroup = parts.some((participant) => participant.user?.id === currentUserId && ['owner', 'admin'].includes(participant.role || 'member'));
    const catMeta = getCategoryMeta(isGroup ? conversation.category : null);

    const statusLine = useMemo(() => {
        if (isGroup) {
            const pc = conversation.participantsCount ?? parts.length;
            const oc = conversation.onlineCount ?? parts.filter((p) => p?.user?.lastSeenAt && Date.now() - new Date(p.user.lastSeenAt).getTime() < 300000).length;
            return `${t('inbox.membersCount', { count: pc, s: pc !== 1 ? 's' : '' })}${oc > 0 ? ` · ${t('inbox.onlineCount', { count: oc })}` : ''}`;
        }
        const other = others[0];
        if (!other) return '';
        const ls = other.user?.lastSeenAt;
        if (!ls) return '';
        const diff = Date.now() - new Date(ls).getTime();
        if (diff < 300000) return t('inbox.onlineNow');
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return t('inbox.seenMinutes', { count: mins });
        const hours = Math.floor(mins / 60);
        if (hours < 24) return t('inbox.seenHours', { count: hours });
        return t('inbox.seenDate', { date: new Date(ls).toLocaleDateString([], { day: 'numeric', month: 'short' }) });
    }, [conversation, others, parts, isGroup, t]);

    const handleSend = useCallback(async () => {
        const body = text.trim();
        if (!body && selectedAttachments.length === 0) return;
        if (sending) return;
        setSending(true);
        try {
            await onSend(body, selectedAttachments, replyTo?.id);
            setText(''); setSelectedImages([]); setReplyTo(null);
            inboxApi.preferences(conversation.id, { draft: null }).catch(() => undefined);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch {
            // Error toast is handled by parent sendMessage
        } finally { setSending(false); }
    }, [text, selectedAttachments, replyTo, sending, onSend]);

    const handleUpdate = useCallback(async () => {
        const body = text.trim();
        if (!body || !editingMsg || sending) return;
        setSending(true);
        try {
            const updated = await inboxApi.updateMessage(conversation.id, editingMsg.id, body);
            onMessageUpdate?.(updated);
            setEditingMsg(null); setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch (error) { toast.error(error instanceof InboxApiError ? error.message : t('inbox.toast.updateError')); } finally { setSending(false); }
    }, [text, editingMsg, sending, conversation.id, onMessageUpdate]);

    const handleEdit = useCallback((msg: MessageRow) => {
        setEditingMsg(msg); setText(msg.body || ''); setReplyTo(null); setSelectedImages([]);
        setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } }, 0);
    }, []);

    const handleDelete = useCallback((msg: MessageRow) => setDeleteConfirmId(msg.id), []);
    const confirmDelete = useCallback(async () => {
        if (!deleteConfirmId) return;
        try {
            await inboxApi.deleteMessage(conversation.id, deleteConfirmId);
            onMessageDelete?.(deleteConfirmId);
            setDeleteConfirmId(null);
            toast.success(t('inbox.toast.deleted'));
        } catch (error) {
            toast.error(error instanceof InboxApiError ? error.message : t('inbox.toast.deleteError'));
        }
    }, [conversation.id, deleteConfirmId, onMessageDelete]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (editingMsg) handleUpdate(); else handleSend(); }
        if (e.key === 'Escape' && editingMsg) { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }
    }, [handleSend, handleUpdate, editingMsg]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files].slice(0, 10));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const removeImage = useCallback((i: number) => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i)), []);
    const handleImageClick = useCallback((allAttachments: MessageAttachmentRow[], imgIdx: number) => {
        const images = allAttachments.filter((a) => isImageAttachment(a));
        if (images.length === 0) return;
        const clickedImage = images[imgIdx];
        if (!clickedImage) return;
        const actualIndex = allAttachments.findIndex((a) => a.id === clickedImage.id);
        setFilePreview({ attachments: allAttachments, index: Math.max(0, actualIndex) });
    }, []);

    const handleReplyClick = useCallback((replyToId: number) => {
        const el = document.getElementById(`msg-${replyToId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg');
            setTimeout(() => el.classList.remove('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg'), 2000);
        }
    }, []);

    const handleFilePreview = useCallback((attachment: MessageAttachmentRow, allAttachments: MessageAttachmentRow[]) => {
        const index = allAttachments.findIndex((a) => a.id === attachment.id);
        setFilePreview({ attachments: allAttachments, index: index >= 0 ? index : 0 });
    }, []);

    const handleRenameGroup = useCallback(async () => {
        if (!groupSubject.trim() || !isGroup) return;
        try {
            await inboxApi.updateConversation(conversation.id, groupSubject.trim());
            toast.success(t('inbox.toast.renamed')); setGroupSettingsOpen(false);
        } catch { toast.error(t('inbox.toast.renameError')); }
    }, [conversation.id, isGroup, groupSubject]);

    const handleAddParticipant = useCallback(async () => {
        if (!addUserId) return;
        try {
            await inboxApi.addParticipant(conversation.id, Number(addUserId));
            toast.success(t('inbox.toast.participantAdded')); setAddUserId(''); setAvailableUsers([]);
        } catch { toast.error(t('inbox.toast.addParticipantError')); }
    }, [conversation.id, addUserId]);

    const handleRemoveParticipant = useCallback(async (userId: number) => {
        try {
            await inboxApi.removeParticipant(conversation.id, userId);
            toast.success(t('inbox.toast.participantRemoved'));
        } catch { toast.error(t('inbox.toast.removeParticipantError')); }
    }, [conversation.id]);

    const openGroupSettings = useCallback(() => {
        setGroupSubject(conversation.subject || '');
        setAvailableUsers(pageUsers.filter((u) => !parts.some((p) => p?.user?.id === u.id)));
        setGroupSettingsOpen(true);
    }, [conversation.subject, parts, pageUsers]);

    const groupedDates = useMemo(() => {
        const dates: { label: string; messageIds: number[] }[] = [];
        let lastLabel = '';
        for (const msg of messages) {
            const label = dateSeparator(msg.createdAt, t);
            if (label !== lastLabel) { dates.push({ label, messageIds: [msg.id] }); lastLabel = label; }
            else { dates[dates.length - 1].messageIds.push(msg.id); }
        }
        return dates;
    }, [messages]);
    const messagesById = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);
    const firstUnreadId = useMemo(() => {
        const participant = parts.find((item) => item.user?.id === currentUserId);
        if (!participant?.lastReadAt) return null;
        const readAt = new Date(participant.lastReadAt).getTime();
        return messages.find((message) => message.userId !== currentUserId && new Date(message.createdAt).getTime() > readAt)?.id ?? null;
    }, [currentUserId, messages, parts]);

    const canSend = editingMsg ? text.trim().length > 0 : text.trim().length > 0 || selectedAttachments.length > 0;
    const avatarTone = getAvatarTone(isGroup ? conversation.id : otherName + currentUserId);

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Header */}
            <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-5">
                <InboxIconButton label={t('inbox.back')} onPress={onBack} className="lg:hidden"><IconChevronLeft size={18} /></InboxIconButton>
                {!isGroup ? <div className="relative shrink-0">
                    <Avatar size="md" name={otherName} className={`${avatarTone.bg} ${avatarTone.text}`}>
                        <Avatar.Fallback>{getConversationInitials(conversation, currentUserId)}</Avatar.Fallback>
                    </Avatar>
                    {others.length === 1 && statusLine === t('inbox.onlineNow') ? (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-surface)] bg-emerald-400" />
                    ) : null}
                </div> : null}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--text)]">{otherName}</p>
                        {isGroup && conversation.category ? (
                            <Chip size="sm" variant="flat" className={`${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</Chip>
                        ) : null}
                    </div>
                    {isGroup ? <div className="mt-1 flex items-center gap-2"><div className="flex -space-x-1.5">{parts.slice(0, 5).map((participant) => <Avatar key={participant.id} size="sm" name={participant.user?.name || t('inbox.user')} className="size-5 border border-[var(--surface)] text-[7px]"><Avatar.Fallback>{avatarInitials(participant.user?.name || t('inbox.user'))}</Avatar.Fallback></Avatar>)}{parts.length > 5 ? <span className="z-10 flex size-5 items-center justify-center rounded-full border border-[var(--surface)] bg-[var(--surface-3)] text-[7px] text-[var(--text-muted)]">+{parts.length - 5}</span> : null}</div>{canManageGroup ? <Button variant="ghost" size="sm" onPress={openGroupSettings} className="h-5 rounded-md px-1.5 text-[8px] text-[var(--accent)]"><IconUserPlus size={10} />{t('inbox.newMember')}</Button> : null}</div> : statusLine ? <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">{statusLine}</p> : null}
                </div>
                {searchOpen ? (
                    <div className="flex items-center gap-1">
                        <SearchField value={searchQuery} onChange={setSearchQuery} aria-label={t('inbox.searchMessagesAria')} variant="secondary" className="w-48">
                            <IconSearch size={13} /><SearchField.Input ref={searchInputRef} placeholder={t('inbox.searchPlaceholder')} autoFocus /><SearchField.ClearButton />
                        </SearchField>
                        {searchResults.length > 0 ? <span className="text-[9px] text-[var(--crm-text-muted)] shrink-0">{searchIndex + 1}/{searchResults.length}</span> : null}
                        <InboxIconButton size="sm" label={t('inbox.prevResult')} isDisabled={searchResults.length === 0} onPress={() => setSearchIndex((index) => Math.min(index + 1, searchResults.length - 1))}><IconChevronUp size={12} /></InboxIconButton>
                        <InboxIconButton size="sm" label={t('inbox.nextResult')} isDisabled={searchResults.length === 0} onPress={() => setSearchIndex((index) => Math.max(index - 1, 0))}><IconChevronDown size={12} /></InboxIconButton>
                        <InboxIconButton size="sm" label={t('inbox.closeSearch')} onPress={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}><IconX size={12} /></InboxIconButton>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <InboxIconButton label={t('inbox.search')} tone="accent" onPress={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}><IconSearch size={14} /></InboxIconButton>
                        <InboxIconButton label={t('inbox.info')} tone="accent" onPress={onOpenInfo} className="xl:hidden"><IconInfoCircle size={14} /></InboxIconButton>
                        {isGroup && canManageGroup ? <InboxIconButton label={t('inbox.groupSettings')} tone="accent" onPress={openGroupSettings}><IconSettings size={14} /></InboxIconButton> : null}
                    </div>
                )}
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Messages area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto bg-[color-mix(in_srgb,var(--surface-2)_45%,var(--surface))] scrollbar-none" onScroll={onScroll}>
                        <div className="min-h-full w-full px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
                        {loading ? (
                            <div className="flex items-center justify-center py-8"><Spinner color="warning" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <IconMessage2 size={32} className="text-[var(--crm-muted)]" />
                                <p className="mt-2 text-xs text-[var(--crm-text-muted)]">{t('inbox.noMessages')}</p>
                                <p className="mt-0.5 text-[9px] text-[var(--crm-muted)]">{t('inbox.noMessagesDesc')}</p>
                            </div>
                        ) : (
                            <>
                                {paginator && paginator.currentPage < paginator.lastPage ? (
                                    <div className="flex justify-center py-3">
                                        <Button size="sm" variant="secondary" onPress={onLoadOlder} isDisabled={loadingOlder}>
                                            {loadingOlder ? <Spinner size="sm" color="warning" /> : null}
                                            {loadingOlder ? t('inbox.loading') : `${t('inbox.loadOlder')} (${paginator.total - (paginator.currentPage * paginator.perPage) > 0 ? paginator.total - (paginator.currentPage * paginator.perPage) : 0})`}
                                        </Button>
                                    </div>
                                ) : null}
                                {groupedDates.map((group) => (
                                    <div key={group.label}>
                                        <div className="flex items-center gap-3 py-4">
                                            <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--border)_70%,transparent)]" />
                                            <span className="whitespace-nowrap text-[9px] font-medium text-[var(--text-muted)]">{group.label}</span>
                                            <span className="h-px flex-1 bg-[color-mix(in_srgb,var(--border)_70%,transparent)]" />
                                        </div>
                                        {group.messageIds.map((msgId, idx) => {
                                            const msg = messagesById.get(msgId)!;
                                            const prev = idx > 0 ? messagesById.get(group.messageIds[idx - 1]) : undefined;
                                            const isSearchResult = searchResults.includes(msg.id);
                                            return (
                                                <div key={msg.id} id={`msg-${msg.id}`} className={`msg-slide-in ${isSearchResult ? (searchResults[searchIndex] === msg.id ? 'ring-2 ring-[var(--crm-gold)]/50 rounded-lg' : 'ring-1 ring-[var(--crm-gold)]/20 rounded-lg') : ''}`}>
                                                    {msg.id === firstUnreadId ? <div className="my-3 flex items-center gap-2"><span className="h-px flex-1 bg-[var(--crm-gold)]/30" /><span className="text-[9px] font-bold uppercase tracking-wider text-[var(--crm-gold)]">{t('inbox.newMessagesSeparator')}</span><span className="h-px flex-1 bg-[var(--crm-gold)]/30" /></div> : null}
                                                    <MessageBubble msg={msg} isMine={msg.userId === currentUserId} grouped={shouldGroup(prev, msg)} isGroup={isGroup}
                                                        currentUserId={currentUserId} onReply={setReplyTo} onForward={setForwardMsg} onImageClick={handleImageClick}
                                                        onEdit={handleEdit} onDelete={handleDelete} onRetry={onRetryMessage} searchQuery={searchQuery}
                                                        onReplyClick={handleReplyClick} onFilePreview={handleFilePreview} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                        </div>
                    </div>

                    {/* Reply preview in composer */}
                    {replyTo && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-[var(--crm-gold)]" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-semibold text-[var(--crm-gold)]">{t('inbox.replyTo')} {replyTo.userName || t('inbox.replyToFallback')}</p>
                                <p className="truncate text-[9px] text-[var(--crm-text-muted)]">{replyTo.body || (replyTo.attachments && replyTo.attachments.length > 0 ? t('inbox.photo') : '')}</p>
                            </div>
                            <InboxIconButton size="sm" label={t('inbox.cancelReply')} onPress={() => setReplyTo(null)}><IconX size={14} /></InboxIconButton>
                        </div>
                    ) : null}

                    {/* Editing bar */}
                    {editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-emerald-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-semibold text-emerald-400">{t('inbox.editing')}</p>
                                <p className="truncate text-[9px] text-[var(--crm-text-muted)]">{editingMsg.body || ''}</p>
                            </div>
                            <InboxIconButton size="sm" label={t('inbox.cancelEdit')} onPress={() => { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }}><IconX size={14} /></InboxIconButton>
                        </div>
                    ) : null}

                    {/* Image previews */}
                    {selectedAttachments.length > 0 ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 overflow-x-auto shrink-0">
                            {filePreviews.map(({ file, url }, i) => (
                                <div key={i} className="relative shrink-0">
                                    {url ? <img src={url} alt="" className="size-14 rounded-lg object-cover border border-[var(--crm-border)]" /> : (
                                        <div className="flex h-14 w-40 items-center gap-2 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-2">
                                            <IconFileText size={16} className="shrink-0 text-[var(--crm-gold)]" />
                                            <span className="truncate text-[9px] text-[var(--crm-text)]">{file.name}</span>
                                        </div>
                                    )}
                                    <InboxIconButton size="sm" label={t('inbox.removeFile', { name: file.name })} tone="danger" onPress={() => removeImage(i)} className="absolute -right-2 -top-2 size-6 min-w-6 bg-red-500 text-white"><IconX size={10} /></InboxIconButton>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && !editingMsg ? (
                        <div className="border-t border-[var(--crm-border)] bg-gradient-to-r from-[color-mix(in_srgb,var(--crm-gold)_6%,transparent)] via-[var(--crm-surface)] to-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="typing-indicator inline-flex max-w-full items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--crm-gold)_28%,var(--crm-border))] bg-[color-mix(in_srgb,var(--crm-surface-2)_82%,black)] px-2.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                                <div className="flex -space-x-1.5">
                                {typingUsers.slice(0, 2).map((u) => (
                                    <span key={u.id} className="typing-avatar flex size-6 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--crm-gold)_36%,var(--crm-border))] bg-[var(--crm-gold-soft)] text-[8px] font-black text-[var(--crm-gold)]">
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                ))}
                                </div>
                                <p className="min-w-0 truncate text-[10px] font-semibold text-[var(--crm-text-muted)]">
                                    <span className="text-[var(--crm-text)]">
                                        {typingUsers.length === 1 ? typingUsers[0].name :
                                            typingUsers.length === 2 ? `${typingUsers[0].name} + ${typingUsers[1].name}` :
                                            `${typingUsers[0].name} + ${typingUsers.length - 1}`}
                                    </span>
                                    <span className="ml-1">{t('inbox.typing')}</span>
                                </p>
                                <span className="typing-dots ml-0.5 inline-flex items-end gap-1 rounded-full bg-black/20 px-1.5 py-1" aria-hidden="true">
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                </span>
                            </div>
                        </div>
                    ) : null}

                    {/* Composer */}
                    <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-4 pt-3 sm:px-6 lg:px-8 xl:px-10">
                        <Card className="flex w-full flex-row items-end gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-1.5 shadow-sm">
                            {!editingMsg ? <InboxIconButton label={t('inbox.attachFile')} tone="accent" onPress={() => fileInputRef.current?.click()} className="shrink-0 rounded-full"><IconPaperclip size={17} /></InboxIconButton> : <div className="size-9 shrink-0" />}
                            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.zip" multiple className="hidden" onChange={handleImageSelect} />
                            <TextArea ref={textareaRef} value={text} onChange={(event) => { setText(event.target.value); sendTyping(); event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`; }} onKeyDown={handleKeyDown}
                                aria-label={t('inbox.messageAria')} placeholder={t('inbox.writePlaceholder')} rows={1}
                                className="min-h-9 flex-1 resize-none rounded-lg border-0 bg-transparent px-2 py-2 text-xs text-[var(--text)] outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)]" />
                            <Button isIconOnly variant="primary" size="sm" aria-label={editingMsg ? t('inbox.saveEditAria') : t('inbox.sendAria')} onPress={editingMsg ? handleUpdate : handleSend} isDisabled={!canSend || sending} className="shrink-0 rounded-full">
                                {sending ? <Spinner size="sm" color="current" /> : editingMsg ? <IconCheck size={16} /> : <IconSend size={16} />}
                            </Button>
                        </Card>
                    </div>
                </div>

            </div>

            {filePreview ? <FilePreviewModal attachments={filePreview.attachments} initialIndex={filePreview.index} onClose={() => setFilePreview(null)} /> : null}
            {forwardMsg ? <ForwardMessageDialog isOpen onClose={() => setForwardMsg(null)} message={forwardMsg} conversations={conversations} currentUserId={currentUserId} sourceConversationId={conversation.id} /> : null}
            {deleteConfirmId ? (
                <Modal.Backdrop isOpen onOpenChange={(open) => !open && setDeleteConfirmId(null)} isDismissable className="z-[95] bg-black/65 backdrop-blur-sm">
                    <Modal.Container size="xs">
                        <Modal.Dialog className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                            <Modal.Header><Modal.Heading>{t('inbox.deleteTitle')}</Modal.Heading><Modal.CloseTrigger /></Modal.Header>
                            <Modal.Body><p className="text-sm text-[var(--text-muted)]">{t('inbox.deleteDesc')}</p></Modal.Body>
                            <Modal.Footer><Button variant="ghost" onPress={() => setDeleteConfirmId(null)}>{t('inbox.cancel')}</Button><Button variant="danger" onPress={confirmDelete}><IconTrash size={14} /> {t('inbox.delete')}</Button></Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            ) : null}
            {groupSettingsOpen ? (
                <Modal.Backdrop isOpen onOpenChange={setGroupSettingsOpen} isDismissable className="z-[90] bg-black/65 backdrop-blur-sm">
                    <Modal.Container size="sm">
                        <Modal.Dialog className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                            <Modal.Header><Modal.Heading>{t('inbox.groupSettings')}</Modal.Heading><Modal.CloseTrigger /></Modal.Header>
                            <Modal.Body className="space-y-5">
                                <div className="flex items-end gap-2">
                                    <Input label={t('inbox.groupName')} value={groupSubject} onChange={(event) => setGroupSubject(event.target.value)} variant="secondary" fullWidth />
                                    <Button variant="primary" onPress={handleRenameGroup} isDisabled={!groupSubject.trim()}>{t('inbox.save')}</Button>
                                </div>

                                <section className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">{t('inbox.participants')}</h3>
                                        <Chip size="sm" variant="flat">{parts.length}</Chip>
                                    </div>
                                    <ScrollShadow className="max-h-48 space-y-1 rounded-xl border border-[var(--border)] p-1.5">
                                        {parts.filter((participant) => participant?.user?.id !== currentUserId).map((participant) => (
                                            <Card key={participant.id} className="flex-row items-center gap-3 border-0 bg-[var(--surface-2)] px-3 py-2 shadow-none">
                                                <Avatar size="sm" name={participant.user?.name || ''}><Avatar.Fallback>{avatarInitials(participant.user?.name || '')}</Avatar.Fallback></Avatar>
                                                <span className="min-w-0 flex-1 truncate text-sm font-medium">{participant.user?.name}</span>
                                                <InboxIconButton label={t('inbox.removeParticipant', { name: participant.user?.name || t('inbox.removeParticipantFallback') })} tone="danger" onPress={() => handleRemoveParticipant(participant.user!.id)}><IconUserMinus size={14} /></InboxIconButton>
                                            </Card>
                                        ))}
                                    </ScrollShadow>
                                </section>

                                <div className="flex items-end gap-2">
                                    <Select selectedKey={addUserId || null} onSelectionChange={(key) => setAddUserId(key ? String(key) : '')} aria-label={t('inbox.addParticipantAria')} className="flex-1">
                                        <Select.Trigger className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm">
                                            <Select.Value className="flex-1 truncate text-left" placeholder={t('inbox.chooseUser')} />
                                            <Select.Indicator><IconChevronDown size={14} /></Select.Indicator>
                                        </Select.Trigger>
                                        <Select.Popover isNonModal className="z-[100] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                                            <ListBox className="outline-none">
                                                {availableUsers.map((user) => <ListBox.Item key={user.id} id={String(user.id)} textValue={user.name} className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none data-[focused]:bg-[var(--surface-2)]">{user.name}</ListBox.Item>)}
                                            </ListBox>
                                        </Select.Popover>
                                    </Select>
                                    <Button variant="secondary" onPress={handleAddParticipant} isDisabled={!addUserId}><IconUserPlus size={14} /> {t('inbox.add')}</Button>
                                </div>
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            ) : null}
        </div>
    );
}
