import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { echo } from '@laravel/echo-react';
import { AppShell } from '@/components/layout/AppShell';
import type { FormErrors } from '@/lib/formErrors';
import type { ChatUserOption, ConversationRow, MessageRow } from '@/features/chat/types';
import { conversationInitial, conversationName, messagePreview } from '@/features/chat/helpers';
import { ConversationList } from '@/features/inbox/components/ConversationList';
import { MessageThread } from '@/features/inbox/components/MessageThread';
import { NewConversationDrawer, type NewConvFormData } from '@/features/inbox/components/NewConversationDrawer';
import { ConversationInfoPanel } from '@/features/inbox/components/ConversationInfoPanel';

type PageProps = {
    conversations: ConversationRow[];
    users: ChatUserOption[];
    currentUserId?: number;
    unreadCount: number;
    archivedCount?: number;
};

function playMessageSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

export default function InboxIndex({ conversations: _conversations, users, currentUserId: pageCurrentUserId, unreadCount: _unreadCount }: PageProps) {
    const authUser = (usePage().props.auth?.user as { id: number; name: string } | undefined) || { id: 0, name: '' };
    const currentUserId = pageCurrentUserId || authUser.id;

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

    const prevLastMsgIds = useRef<Record<number, number | null>>({});
    const selectedConvRef = useRef<ConversationRow | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const nearBottomRef = useRef(true);
    const autoOpenDone = useRef(false);

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
        if (convTab !== 'archived') return;

        fetch('/inbox/archived')
            .then((response) => response.json())
            .then((data) => setArchivedConversations(data.conversations || []))
            .catch(() => toast.error('Failed to load archived conversations'));
    }, [convTab]);

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
        channel.listen('.inbox.updated', (payload: any) => {
            console.debug('[chat] inbox.updated', payload);
            if (payload.conversation) {
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
            }
        });
        return () => {
            echo().leave(`user.${currentUserId}.inbox`);
        };
    }, [currentUserId]);

    // Subscribe to active conversation via Echo
    useEffect(() => {
        if (!selectedConv) return;
        console.debug('[chat] subscribing conversation', selectedConv.id);
        const channel = echo().private(`conversation.${selectedConv.id}`);

        channel.listen('.message.created', (payload: any) => {
            console.debug('[chat] received message.created', payload);
            const msg = payload.message as MessageRow;
            const incomingConversationId = Number(payload.conversationId || selectedConv.id);

            if (incomingConversationId !== selectedConvRef.current?.id) {
                console.debug('[chat] ignored message for another conversation', incomingConversationId, selectedConvRef.current?.id);
                return;
            }

            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });

            setConversations((prev) => prev.map((c) =>
                c.id === incomingConversationId
                    ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                    : c
            ));

            if (msg.userId !== currentUserId && !nearBottomRef.current) {
                setNewMsgAvailable(true);
            } else {
                setNewMsgAvailable(false);
                requestAnimationFrame(() => {
                    document.getElementById(`msg-${msg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                });
            }
        });

        channel.listen('.message.updated', (payload: any) => {
            console.debug('[chat] received message.updated', payload);
            const msg = payload.message as MessageRow;
            setMessages((prev) => prev.map((m) => m.id === msg.id ? msg : m));
        });

        channel.listen('.message.deleted', (payload: any) => {
            console.debug('[chat] received message.deleted', payload);
            const { messageId } = payload;
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
        });

        return () => {
            echo().leave(`conversation.${selectedConv.id}`);
        };
    }, [selectedConv?.id]);

    // Reset new message available when user scrolls to bottom
    useEffect(() => {
        if (nearBottomRef.current) setNewMsgAvailable(false);
    }, [messages]);

    function openConversation(conv: ConversationRow) {
        setSelectedConv(conv);
        setMobileView('chat');
        setLoading(true);
        setPaginator(null);
        setNewMsgAvailable(false);
        fetch(`/inbox/${conv.id}?page=1`)
            .then((r) => r.json())
            .then((data) => {
                setMessages((data.messages || []).reverse());
                setPaginator(data.paginator || null);
                setConversations((prev) => prev.map((c) =>
                    c.id === conv.id ? { ...c, unreadCount: 0 } : c
                ));
            })
            .catch(() => toast.error('Failed to load messages'))
            .finally(() => setLoading(false));
    }

    function loadOlderMessages() {
        if (!selectedConv || loadingOlder || (paginator && paginator.currentPage >= paginator.lastPage)) return;
        setLoadingOlder(true);
        const nextPage = (paginator?.currentPage || 1) + 1;
        fetch(`/inbox/${selectedConv.id}?page=${nextPage}`)
            .then((r) => r.json())
            .then((data) => {
                setMessages((prev) => [...(data.messages || []).reverse(), ...prev]);
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
        const url = `/inbox/${conv.id}/${nextArchived ? 'archive' : 'unarchive'}`;

        fetch(url, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
        })
            .then((response) => {
                if (!response.ok) throw new Error('Archive failed');
                const updated = { ...conv, archivedAt: nextArchived ? new Date().toISOString() : null };

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
                    toast.success('Conversation restored.');
                }
            })
            .catch(() => toast.error('Archive action failed.'));
    }

    let tempIdCounter = useRef(0);

    function sendMessage(body: string, images: File[], replyToId?: number) {
        if (!selectedConv || (!body.trim() && images.length === 0)) return;

        // Optimistic message
        const tempId = -(Date.now() + (tempIdCounter.current++));
        const optimisticMsg: MessageRow = {
            id: tempId,
            body: body.trim() || null,
            isEdited: false,
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
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        nearBottomRef.current = true;
        setNewMsgAvailable(false);

        // Scroll to bottom after optimistic add
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        const hasImages = images.length > 0;
        let promise: Promise<Response>;

        if (hasImages) {
            const formData = new FormData();
            if (body.trim()) formData.append('body', body);
            for (const img of images) formData.append('images[]', img);
            if (replyToId) formData.append('reply_to_message_id', String(replyToId));

            promise = fetch(`/inbox/${selectedConv.id}/messages`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: formData,
            });
        } else {
            promise = fetch(`/inbox/${selectedConv.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: JSON.stringify({
                    body: body.trim(),
                    ...(replyToId ? { reply_to_message_id: replyToId } : {}),
                }),
            });
        }

        return promise
            .then((r) => r.json())
            .then((msg: MessageRow) => {
                setMessages((prev) => prev.map((item) => item.id === tempId ? msg : item));
                setConversations((prev) => prev.map((c) =>
                    c.id === selectedConv!.id
                        ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
                        : c
                ));
                return msg;
            })
            .catch(() => {
                setMessages((prev) => prev.map((item) => item.id === tempId ? { ...item, isFailed: true as any } : item));
                toast.error('Failed to send message');
                throw new Error('Send failed');
            });
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
            <AppShell fullBleed>
                <div className="flex h-full w-full overflow-hidden">
                    {/* Conversation sidebar */}
                    <div className={`${mobileView === 'chat' ? 'hidden' : 'flex'} w-full flex-col border-r border-[var(--crm-border)] bg-[var(--crm-elevated)] md:flex md:w-[360px] lg:w-[380px]`}>
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
                        />
                    </div>

                    {/* Chat area */}
                    <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} flex-1 flex-col min-w-0 md:flex`}>
                        {selectedConv ? (
                            <>
                                <div className="flex items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 md:hidden">
                                    <button type="button" onClick={goToConversationList}
                                        className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]">
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                                        {conversationInitial(selectedConv, currentUserId)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{conversationName(selectedConv, currentUserId)}</p>
                                    </div>
                                </div>
                                <div className="relative flex-1 flex flex-col min-h-0">
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
                                        onMessageUpdate={(message) => setMessages((prev) => prev.map((item) => item.id === message.id ? message : item))}
                                        onMessageDelete={(messageId) => setMessages((prev) => prev.filter((item) => item.id !== messageId))}
                                        onScroll={handleScroll}
                                    />
                                    {/* New messages floating button */}
                                    {newMsgAvailable ? (
                                        <button type="button" onClick={scrollToBottom}
                                            className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-4 py-2 text-[11px] font-semibold text-[var(--crm-gold)] shadow-xl transition hover:brightness-110 animate-in fade-in slide-in-from-bottom-2">
                                            <MessageSquare size={12} />
                                            New messages
                                            <ArrowLeft size={12} className="rotate-90" />
                                        </button>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="hidden flex-1 items-center justify-center md:flex">
                                <div className="text-center">
                                    <MessageSquare size={40} className="mx-auto text-[var(--crm-muted)]" />
                                    <p className="mt-3 text-sm text-[var(--crm-text-muted)]">Select a conversation</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <ConversationInfoPanel
                        conversation={selectedConv}
                        messages={messages}
                        currentUserId={currentUserId}
                        onArchiveToggle={toggleArchive}
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

            {import.meta.env.DEV ? (
                <div className="fixed bottom-2 right-2 z-[200] flex items-center gap-2 rounded-full bg-black/80 px-3 py-1 text-[9px] text-white/80 font-mono">
                    <span>UID:{currentUserId}</span>
                    <span>CID:{selectedConv?.id ?? '-'}</span>
                </div>
            ) : null}
        </>
    );
}
