import { Head, router, usePage } from '@inertiajs/react';
import { IconArrowLeft, IconMessage2 } from '@tabler/icons-react';

import { Button, Card } from '@heroui/react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { echo } from '@laravel/echo-react';
import { AppShell } from '@/components/layout/AppShell';
import type { FormErrors } from '@/lib/formErrors';
import type { ChatUserOption, ConversationRow, MessageRow } from '@/features/chat/types';
import { conversationName, messagePreview } from '@/features/chat/helpers';
import { ConversationList } from '@/features/inbox/components/ConversationList';
import { MessageThread } from '@/features/inbox/components/MessageThread';
import { NewConversationDrawer, type NewConvFormData } from '@/features/inbox/components/NewConversationDrawer';
import { ConversationInfoPanel } from '@/features/inbox/components/ConversationInfoPanel';
import { inboxApi, InboxApiError, type Paginator } from '@/features/inbox/api';
import { useInboxPresence } from '@/features/inbox/components/useInboxPresence';
import { useRealtimeConnection } from '@/features/inbox/components/useRealtimeConnection';

type PageProps = {
    conversations: ConversationRow[];
    users: ChatUserOption[];
    currentUserId?: number;
    unreadCount: number;
    archivedCount?: number;
    conversationPaginator?: Paginator;
    companyId?: number | null;
};

type InboxEventPayload = { conversation?: ConversationRow; eventType?: string; conversationId?: number };
type MessageEventPayload = { message?: MessageRow; messageId?: number; conversationId?: number };
type MessagesReadPayload = { conversationId?: number; userId?: number; lastReadMessageId?: number };

function playMessageSound() {
    try {
        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 660;
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } catch { /* silent */ }
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        conversation: params.get('conversation'),
        message: params.get('message'),
    };
}

function isTempMessage(message: MessageRow) {
    return Number(message.id) < 0;
}

function isLikelyOptimisticMatch(temp: MessageRow, real: MessageRow) {
    if (!isTempMessage(temp)) return false;
    if (real.clientMessageId && temp.clientMessageId && real.clientMessageId === temp.clientMessageId) return true;
    if (temp.userId !== real.userId) return false;
    if ((temp.body || '') !== (real.body || '')) return false;

    const tempTime = new Date(temp.createdAt).getTime();
    const realTime = new Date(real.createdAt).getTime();

    return Math.abs(realTime - tempTime) < 15000;
}

function upsertMessage(prev: MessageRow[], incoming: MessageRow) {
    let replaced = false;

    const next = prev
        .filter((message) => String(message.id) !== String(incoming.id))
        .map((message) => {
            if (isLikelyOptimisticMatch(message, incoming)) {
                replaced = true;
                return incoming;
            }

            return message;
        });

    if (!replaced) {
        next.push(incoming);
    }

    const unique = new Map<string, MessageRow>();
    for (const message of next) {
        unique.set(String(message.id), message);
    }

    return Array.from(unique.values()).sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

function upsertMessages(prev: MessageRow[], incoming: MessageRow[]) {
    return incoming.reduce((next, message) => upsertMessage(next, message), prev);
}

export default function InboxIndex({ conversations: _conversations, users, currentUserId: pageCurrentUserId, unreadCount: _unreadCount, conversationPaginator: initialConversationPaginator, companyId }: PageProps) {
    const authUser = (usePage().props.auth?.user as { id: number; name: string } | undefined) || { id: 0, name: '' };
    const currentUserId = pageCurrentUserId || authUser.id;
    const onlineUserIds = useInboxPresence(companyId);
    const realtimeState = useRealtimeConnection();

    const [conversations, setConversations] = useState<ConversationRow[]>(_conversations);
    const [archivedConversations, setArchivedConversations] = useState<ConversationRow[]>([]);
    const [selectedConv, setSelectedConv] = useState<ConversationRow | null>(null);
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [paginator, setPaginator] = useState<{ currentPage: number; lastPage: number; perPage: number; total: number } | null>(null);
    const [newConvOpen, setNewConvOpen] = useState(false);
    const [newConvForm, setNewConvForm] = useState<NewConvFormData>({ type: 'direct', user_ids: [], subject: '', category: 'general', custom_category: '' });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [search, setSearch] = useState('');
    const [convTab, setConvTab] = useState<'active' | 'archived' | 'unread' | 'direct' | 'groups'>('active');
    const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
    const [highlightMsgId, setHighlightMsgId] = useState<number | null>(null);
    const [newMsgAvailable, setNewMsgAvailable] = useState(false);
    const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(false);
    const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
    const [conversationPaginator, setConversationPaginator] = useState<Paginator | null>(initialConversationPaginator || null);
    const [loadingConversations, setLoadingConversations] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('command') !== 'create') return;
        setFormErrors({});
        setNewConvOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
    }, []);

    const prevLastMsgIds = useRef<Record<number, number | null>>({});
    const selectedConvRef = useRef<ConversationRow | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const nearBottomRef = useRef(true);
    const autoOpenDone = useRef(false);
    const messageRequestRef = useRef<AbortController | null>(null);

    selectedConvRef.current = selectedConv;

    // Helper to check if user is near bottom
    const isNearBottom = useCallback(() => {
        return nearBottomRef.current;
    }, []);

    // Track scroll position for "new message" button
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (nearBottomRef.current) setNewMsgAvailable(false);
    }, []);

    const filteredConvs = useMemo(() => {
        let items = convTab === 'archived' ? archivedConversations : conversations;
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter((c) =>
                conversationName(c, currentUserId).toLowerCase().includes(q) ||
                (c.subject || '').toLowerCase().includes(q) ||
                (c.lastMessage?.body || '').toLowerCase().includes(q) ||
                (Array.isArray(c.participants) ? c.participants : []).some((p) =>
                    p?.user?.name?.toLowerCase().includes(q) || p?.user?.email?.toLowerCase().includes(q)
                )
            );
        }
        if (convTab === 'unread') items = items.filter((c) => c.unreadCount > 0);
        if (convTab === 'direct') items = items.filter((c) => c.type === 'direct');
        if (convTab === 'groups') items = items.filter((c) => c.type === 'group');
        return items;
    }, [archivedConversations, conversations, convTab, currentUserId, search]);

    // Auto-open conversation from URL params on mount
    useEffect(() => {
        if (autoOpenDone.current || _conversations.length === 0) return;
        const { conversation } = getQueryParams();
        if (conversation) {
            const conv = _conversations.find((c) => String(c.id) === conversation);
            if (conv) {
                openConversation(conv);
                autoOpenDone.current = true;
            }
        }
    }, [_conversations]);

    // Scroll to and highlight message after messages load
    useEffect(() => {
        if (!highlightMsgId || messages.length === 0) return;
        const el = document.getElementById(`msg-${highlightMsgId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-[var(--crm-gold)]/50', 'rounded-lg');
                setHighlightMsgId(null);
            }, 2000);
        }
    }, [messages, highlightMsgId]);

    // Read query params for message highlight after opening
    useEffect(() => {
        if (!selectedConv) return;
        const { message } = getQueryParams();
        if (message && !autoOpenDone.current) {
            setHighlightMsgId(Number(message));
            autoOpenDone.current = true;
        }
    }, [selectedConv]);

    // Update URL when conversation changes
    useEffect(() => {
        if (selectedConv) {
            const params = new URLSearchParams();
            params.set('conversation', String(selectedConv.id));
            const msgId = highlightMsgId || selectedConv.lastMessage?.id;
            if (msgId) params.set('message', String(msgId));
            window.history.replaceState(null, '', `/inbox?${params.toString()}`);
        }
    }, [selectedConv?.id]);

    useEffect(() => {
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoadingConversations(true);
            try {
                const page = await inboxApi.conversations({
                    search: search.trim() || undefined,
                    type: convTab === 'direct' || convTab === 'groups' ? (convTab === 'groups' ? 'group' : 'direct') : undefined,
                    unread: convTab === 'unread',
                    archived: convTab === 'archived',
                    page: 1,
                }, controller.signal);
                if (convTab === 'archived') setArchivedConversations(page.conversations);
                else setConversations(page.conversations);
                setConversationPaginator(page.paginator);
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) toast.error('Impossible de charger les conversations.');
            } finally {
                if (!controller.signal.aborted) setLoadingConversations(false);
            }
        }, search.trim() ? 250 : 0);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [convTab, search]);

    useEffect(() => {
        setConversations(_conversations);

        const currentIds: Record<number, number | null> = {};
        for (const c of _conversations) {
            currentIds[c.id] = c.lastMessage?.id ?? null;
        }

        if (Object.keys(prevLastMsgIds.current).length > 0) {
            for (const c of _conversations) {
                const prevId = prevLastMsgIds.current[c.id];
                const currId = c.lastMessage?.id ?? null;
                if (prevId !== undefined && prevId !== null && currId !== null && currId !== prevId) {
                    if (c.id !== selectedConvRef.current?.id) {
                        toast(conversationName(c, currentUserId), { description: messagePreview(c.lastMessage) || 'New message' });
                        playMessageSound();
                    }
                }
            }
        }

        prevLastMsgIds.current = currentIds;
    }, [_conversations, currentUserId]);

    useEffect(() => {
        if (selectedConv) {
            const updated = conversations.find((c) => c.id === selectedConv.id);
            if (updated) setSelectedConv(updated);
        }
    }, [conversations, selectedConv?.id]);

    // Subscribe to inbox updates via Echo
    useEffect(() => {
        const e = echo();
        const channel = e.private(`user.${currentUserId}.inbox`);

        const applyInboxUpdate = (payload: InboxEventPayload) => {
            if (payload.eventType === 'participant_removed' && payload.conversationId && !payload.conversation) {
                setConversations((previous) => previous.filter((conversation) => conversation.id !== payload.conversationId));
                if (selectedConvRef.current?.id === payload.conversationId) goToConversationList();
                return;
            }
            if (!payload.conversation) return;

            const conv = payload.conversation as ConversationRow;
            setConversations((prev) => {
                const exists = prev.some((c) => c.id === conv.id);
                const next = exists
                    ? prev.map((c) => c.id === conv.id ? { ...c, ...conv } : c)
                    : [conv, ...prev];
                return next.sort((a, b) => {
                    const ad = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
                    const bd = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
                    return bd - ad;
                });
            });
            if (selectedConvRef.current?.id === conv.id) {
                setSelectedConv((current) => current ? { ...current, ...conv, unreadCount: 0 } : current);
            }
        };

        channel.error((error: unknown) => console.error('[chat] inbox subscription error', currentUserId, error));
        channel.listen('.inbox.updated', applyInboxUpdate);

        return () => {
            channel.stopListening('.inbox.updated', applyInboxUpdate);
            echo().leave(`user.${currentUserId}.inbox`);
        };
    }, [currentUserId]);

    // Subscribe to active conversation via Echo
    useEffect(() => {
        if (!selectedConv) return;
        const channel = echo().private(`conversation.${selectedConv.id}`);

        const applyMessageCreated = (payload: MessageEventPayload) => {
            const msg = payload.message as MessageRow | undefined;
            if (!msg) return;

            const incomingConversationId = Number(payload.conversationId || selectedConv.id);
            if (incomingConversationId !== selectedConvRef.current?.id) {
                return;
            }

            setMessages((prev) => upsertMessage(prev, msg));
            setConversations((prev) => prev.map((c) =>
                c.id === incomingConversationId
                    ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                    : c,
            ));

            if (msg.userId !== currentUserId && !nearBottomRef.current) {
                setNewMsgAvailable(true);
            } else {
                setNewMsgAvailable(false);
                requestAnimationFrame(() => {
                    document.getElementById(`msg-${msg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                });
            }
        };

        const applyMessageUpdated = (payload: MessageEventPayload) => {
            const msg = payload.message as MessageRow | undefined;
            if (!msg) return;
            setMessages((prev) => upsertMessage(prev, msg));
        };

        const applyMessageDeleted = (payload: MessageEventPayload) => {
            const messageId = Number(payload.messageId);
            if (!messageId) return;
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        };

        const applyMessagesRead = (payload: MessagesReadPayload) => {
            const userId = Number(payload.userId);
            const lastReadMessageId = Number(payload.lastReadMessageId);
            if (!userId || !lastReadMessageId || userId === currentUserId) return;
            setMessages((previous) => previous.map((message) => (
                message.userId === currentUserId && message.id <= lastReadMessageId
                    ? { ...message, readBy: Array.from(new Set([...(message.readBy || []), userId])) }
                    : message
            )));
        };

        channel.error((error: unknown) => console.error('[chat] conversation subscription error', selectedConv.id, error));
        channel.listen('.message.created', applyMessageCreated);
        channel.listen('.message.updated', applyMessageUpdated);
        channel.listen('.message.deleted', applyMessageDeleted);
        channel.listen('.messages.read', applyMessagesRead);

        return () => {
            channel.stopListening('.message.created', applyMessageCreated);
            channel.stopListening('.message.updated', applyMessageUpdated);
            channel.stopListening('.message.deleted', applyMessageDeleted);
            channel.stopListening('.messages.read', applyMessagesRead);
            echo().leave(`conversation.${selectedConv.id}`);
        };
    }, [selectedConv?.id, currentUserId]);

    // Reset new message available when user scrolls to bottom
    useEffect(() => {
        if (nearBottomRef.current) setNewMsgAvailable(false);
    }, [messages]);

    function openConversation(conv: ConversationRow) {
        messageRequestRef.current?.abort();
        const controller = new AbortController();
        messageRequestRef.current = controller;
        setSelectedConv(conv);
        setMobileView('chat');
        setLoading(true);
        setPaginator(null);
        setNewMsgAvailable(false);
        inboxApi.messages(conv.id, 1, controller.signal)
            .then((data) => {
                if (selectedConvRef.current?.id !== conv.id) return;
                setMessages(upsertMessages([], (data.messages || []).reverse()));
                setPaginator(data.paginator || null);
                setConversations((prev) => prev.map((c) =>
                    c.id === conv.id ? { ...c, unreadCount: 0 } : c
                ));
            })
            .catch((error) => {
                if (!(error instanceof DOMException && error.name === 'AbortError')) toast.error('Impossible de charger les messages.');
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }

    function loadOlderMessages() {
        if (!selectedConv || loadingOlder || (paginator && paginator.currentPage >= paginator.lastPage)) return;
        setLoadingOlder(true);
        const nextPage = (paginator?.currentPage || 1) + 1;
        const conversationId = selectedConv.id;
        inboxApi.messages(conversationId, nextPage)
            .then((data) => {
                if (selectedConvRef.current?.id !== conversationId) return;
                setMessages((prev) => upsertMessages(prev, (data.messages || []).reverse()));
                setPaginator(data.paginator || null);
            })
            .catch(() => toast.error('Failed to load older messages'))
            .finally(() => setLoadingOlder(false));
    }

    function goToConversationList() {
        setMobileView('list');
        setSelectedConv(null);
        setMessages([]);
        setPaginator(null);
        window.history.replaceState(null, '', '/inbox');
    }

    function toggleArchive(conv: ConversationRow) {
        const nextArchived = !conv.archivedAt;
        inboxApi.archive(conv.id, nextArchived)
            .then((data) => {
                const updated = (data.conversation || { ...conv, archivedAt: nextArchived ? new Date().toISOString() : null }) as ConversationRow;

                if (nextArchived) {
                    setConversations((prev) => prev.filter((item) => item.id !== conv.id));
                    setArchivedConversations((prev) => [updated, ...prev.filter((item) => item.id !== conv.id)]);
                    if (selectedConv?.id === conv.id) {
                        setSelectedConv(null);
                        setMessages([]);
                        setMobileView('list');
                    }
                    toast.success('Conversation archived.');
                } else {
                    setArchivedConversations((prev) => prev.filter((item) => item.id !== conv.id));
                    setConversations((prev) => [updated, ...prev.filter((item) => item.id !== conv.id)]);
                    if (selectedConv?.id === conv.id) {
                        setSelectedConv(updated);
                        setConvTab('active');
                    }
                    toast.success('Conversation restored.');
                }
            })
            .catch(() => toast.error('Archive action failed.'));
    }

    let tempIdCounter = useRef(0);

    function sendMessage(body: string, files: File[], replyToId?: number): Promise<MessageRow> {
        if (!selectedConv || (!body.trim() && files.length === 0)) return Promise.reject(new InboxApiError('Impossible d\'envoyer le message.', 0));
        const conversationId = selectedConv.id;

        // Optimistic message
        const tempId = -(Date.now() + (tempIdCounter.current++));
        const clientMessageId = `${currentUserId}_${Date.now()}_${tempIdCounter.current}`;
        const optimisticMsg: MessageRow = {
            id: tempId,
            clientMessageId,
            body: body.trim() || null,
            isEdited: false,
            editedAt: null,
            isForwarded: false,
            forwardedFromMessageId: null,
            forwardedFrom: null,
            userId: currentUserId,
            userName: authUser.name,
            readBy: [],
            replyTo: null,
            attachments: [],
            attachmentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pendingBody: body,
            pendingFiles: files,
            pendingReplyToId: replyToId,
        };

        setMessages((prev) => upsertMessage(prev, optimisticMsg));
        nearBottomRef.current = true;
        setNewMsgAvailable(false);

        // Scroll to bottom after optimistic add
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        return inboxApi.sendMessage(conversationId, body, files, replyToId, clientMessageId)
            .then((msg: MessageRow) => {
                setMessages((prev) => {
                    const withoutTempAndDuplicate = prev.filter((item) =>
                        String(item.id) !== String(tempId) && String(item.id) !== String(msg.id),
                    );
                    return upsertMessage(withoutTempAndDuplicate, msg);
                });
                setConversations((prev) => prev.map((c) =>
                    c.id === conversationId
                        ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                        : c
                ));
                return msg;
            })
            .catch((error) => {
                setMessages((prev) => prev.map((item) => item.id === tempId ? { ...item, isFailed: true } : item));
                toast.error(error instanceof InboxApiError ? error.message : 'Impossible d’envoyer le message.');
                throw error;
            });
    }

    function retryMessage(message: MessageRow) {
        setMessages((prev) => prev.filter((item) => item.id !== message.id));
        return sendMessage(message.pendingBody || message.body || '', message.pendingFiles || [], message.pendingReplyToId);
    }

    const handleSearchMessagesLoaded = useCallback((results: MessageRow[]) => {
        setMessages((current) => upsertMessages(current, results));
    }, []);

    async function loadMoreConversations() {
        if (loadingConversations || !conversationPaginator || conversationPaginator.currentPage >= conversationPaginator.lastPage) return;
        setLoadingConversations(true);
        try {
            const page = await inboxApi.conversations({
                search: search.trim() || undefined,
                type: convTab === 'direct' || convTab === 'groups' ? (convTab === 'groups' ? 'group' : 'direct') : undefined,
                unread: convTab === 'unread', archived: convTab === 'archived', page: conversationPaginator.currentPage + 1,
            });
            const setter = convTab === 'archived' ? setArchivedConversations : setConversations;
            setter((prev) => Array.from(new Map([...prev, ...page.conversations].map((item) => [item.id, item])).values()));
            setConversationPaginator(page.paginator);
        } catch { toast.error('Impossible de charger plus de conversations.'); }
        finally { setLoadingConversations(false); }
    }

    async function updatePreference(conversation: ConversationRow, preference: 'pinned' | 'muted', value: boolean) {
        try {
            await inboxApi.preferences(conversation.id, { [preference]: value });
            const patch = preference === 'pinned' ? { isPinned: value } : { isMuted: value };
            setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, ...patch } : item));
            setArchivedConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, ...patch } : item));
            setSelectedConv((current) => current?.id === conversation.id ? { ...current, ...patch } : current);
        } catch { toast.error('Impossible de mettre à jour la conversation.'); }
    }

    async function markConversationUnread(conversation: ConversationRow) {
        try {
            await inboxApi.markUnread(conversation.id);
            setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, unreadCount: Math.max(1, item.unreadCount) } : item));
            toast.success('Conversation marquée comme non lue.');
        } catch { toast.error('Impossible de marquer la conversation.'); }
    }

    function handleNewConv(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormErrors({});
        const isGroup = newConvForm.type === 'group';
        router.post('/inbox', {
            user_ids: newConvForm.user_ids,
            type: newConvForm.type,
            subject: newConvForm.subject || null,
            ...(isGroup ? {
                category: newConvForm.category === 'custom' ? newConvForm.custom_category || 'custom' : newConvForm.category,
                ...(newConvForm.category === 'custom' ? { custom_category: newConvForm.custom_category } : {}),
            } : {}),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewConvOpen(false);
                setNewConvForm({ type: 'direct', user_ids: [], subject: '', category: 'general', custom_category: '' });
                toast.success('Conversation created.');
            },
            onError: (err) => setFormErrors(err),
        });
    }

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setNewMsgAvailable(false);
    }

    return (
        <>
            <Head title="Messages" />
            <AppShell fullBleed hideMobileNav={selectedConv !== null}>
                <div className="flex h-full min-h-0 w-full overflow-hidden bg-[var(--surface-2)]">
                    {/* Conversation sidebar — mobile: full width when list, hidden when chat; md+: fixed width */}
                    <div className={`${mobileView === 'chat' ? 'hidden' : 'flex'} h-full min-w-0 w-full flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex lg:w-[310px] xl:w-[324px] ${mobileView === 'list' ? 'app-safe-bottom lg:pb-0' : ''}`}>
                        <ConversationList
                            conversations={filteredConvs}
                            selectedConvId={selectedConv?.id ?? null}
                            search={search}
                            onSearchChange={setSearch}
                            onSelect={openConversation}
                            activeTab={convTab}
                            onTabChange={setConvTab}
                            onArchiveToggle={toggleArchive}
                            currentUserId={currentUserId}
                            onNewConversation={() => { setFormErrors({}); setNewConvOpen(true); }}
                            loading={loadingConversations}
                            hasMore={!!conversationPaginator && conversationPaginator.currentPage < conversationPaginator.lastPage}
                            onLoadMore={loadMoreConversations}
                            onlineUserIds={onlineUserIds}
                            realtimeState={realtimeState}
                        />
                    </div>

                    {/* Chat area — mobile: full width when chat, hidden when list; md+: flex */}
                    <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex`}>
                        {selectedConv ? (
                            <>
                                <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                                    <MessageThread
                                        conversation={selectedConv}
                                        conversations={conversations}
                                        messages={messages}
                                        loading={loading}
                                        loadingOlder={loadingOlder}
                                        paginator={paginator}
                                        currentUserId={currentUserId}
                                        onSend={sendMessage}
                                        onLoadOlder={loadOlderMessages}
                                        onMessageUpdate={(message) => setMessages((prev) => upsertMessage(prev, message))}
                                        onMessageDelete={(messageId) => setMessages((prev) => prev.filter((item) => item.id !== messageId))}
                                        onScroll={handleScroll}
                                        onRetryMessage={retryMessage}
                                        onSearchMessagesLoaded={handleSearchMessagesLoaded}
                                        users={users}
                                        onOpenInfo={() => setMobileInfoOpen(true)}
                                        onBack={goToConversationList}
                                    />
                                    {/* New messages floating button */}
                                    {newMsgAvailable ? (
                                        <Button variant="secondary" size="sm" onPress={scrollToBottom}
                                            className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[var(--border)] text-[var(--accent)] shadow-xl animate-in fade-in slide-in-from-bottom-2">
                                            <IconMessage2 size={12} />
                                            Nouveaux messages
                                            <IconArrowLeft size={12} className="rotate-90" />
                                        </Button>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="hidden flex-1 items-center justify-center p-6 lg:flex">
                                <Card className="items-center border-dashed bg-transparent px-10 py-12 text-center shadow-none">
                                    <IconMessage2 size={40} className="mx-auto text-[var(--crm-muted)]" />
                                    <p className="mt-3 text-sm font-semibold text-[var(--text)]">Selectionnez une conversation</p>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">Vos messages et fichiers apparaitront ici.</p>
                                </Card>
                            </div>
                        )}
                    </div>

                    <ConversationInfoPanel
                        conversation={selectedConv}
                        messages={messages}
                        currentUserId={currentUserId}
                        onArchiveToggle={toggleArchive}
                        collapsed={infoPanelCollapsed}
                        onToggleCollapsed={() => setInfoPanelCollapsed((value) => !value)}
                        mobileOpen={mobileInfoOpen}
                        onMobileClose={() => setMobileInfoOpen(false)}
                        onPreference={updatePreference}
                        onMarkUnread={markConversationUnread}
                    />
                </div>

                <div ref={messagesEndRef} />

                <NewConversationDrawer
                    isOpen={newConvOpen}
                    users={users}
                    formErrors={formErrors}
                    form={newConvForm}
                    onOpenChange={(o) => { setNewConvOpen(o); if (!o) setFormErrors({}); }}
                    onFormChange={setNewConvForm}
                    onSubmit={handleNewConv}
                />
            </AppShell>
        </>
    );
}
