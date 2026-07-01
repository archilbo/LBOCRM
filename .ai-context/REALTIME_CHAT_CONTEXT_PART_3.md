  >
                        <Plus size={15} />
                        New
                    </button>

                    <button
                        type="button"
                        onClick={() => router.visit('/finance/documents?tab=monthly')}
                        className="crm-action-button hidden md:inline-flex"
                        title="Monthly summary"
                    >
                        <CalendarDays size={15} />
                    </button>

                    <MessagePopover />

                    <NotificationPopover />

                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="crm-action-button h-9 w-9 px-0"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </header>
    );
}

```

# FILE: resources/js/pages/Inbox/Index.tsx

```tsx
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
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

    const pollListRef = useRef<ReturnType<typeof setInterval>>();
    const pollConvRef = useRef<ReturnType<typeof setInterval>>();
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

    // Poll conversations list every 15s
    useEffect(() => {
        pollListRef.current = setInterval(() => {
            router.reload({ only: ['conversations', 'unreadCount'], preserveState: true, preserveScroll: true });
        }, 15000);
        return () => clearInterval(pollListRef.current);
    }, []);

    // Poll selected conversation messages every 8s
    useEffect(() => {
        if (!selectedConv || loading) return;
        pollConvRef.current = setInterval(() => {
            fetch(`/inbox/${selectedConv.id}?page=1`)
                .then((r) => r.json())
                .then((data) => {
                    const newMessages: MessageRow[] = (data.messages || []).reverse();
                    setMessages((prev) => {
                        const prevIds = new Set(prev.map((m) => m.id));
                        const added = newMessages.filter((m) => !prevIds.has(m.id));
                        if (added.length === 0) return prev;
                        if (isNearBottom()) {
                            return [...prev, ...added];
                        } else {
                            setNewMsgAvailable(true);
                            return prev;
                        }
                    });
                    setPaginator(data.paginator || null);
                })
                .catch(() => {});
        }, 8000);
        return () => clearInterval(pollConvRef.current);
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
   