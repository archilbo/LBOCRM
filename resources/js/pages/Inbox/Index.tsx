import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import type { FormErrors } from '@/lib/formErrors';
import type { ChatUserOption, ConversationRow, MessageRow } from '@/features/chat/types';
import { ConversationList } from '@/features/inbox/components/ConversationList';
import { MessageThread } from '@/features/inbox/components/MessageThread';
import { NewConversationDrawer } from '@/features/inbox/components/NewConversationDrawer';

type PageProps = {
    conversations: ConversationRow[];
    users: ChatUserOption[];
    unreadCount: number;
};

export default function InboxIndex({ conversations, users, unreadCount }: PageProps) {
    const [selectedConv, setSelectedConv] = useState<ConversationRow | null>(null);
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [messageBody, setMessageBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [newConvOpen, setNewConvOpen] = useState(false);
    const [newConvForm, setNewConvForm] = useState({ user_id: '', subject: '' });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [search, setSearch] = useState('');

    const filteredConvs = useMemo(() => conversations.filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const parts = Array.isArray(c.participants) ? c.participants : [];
        return parts.some((p) => p?.user?.name?.toLowerCase().includes(q)) || (c.subject || '').toLowerCase().includes(q);
    }), [conversations, search]);

    function openConversation(conv: ConversationRow) {
        setSelectedConv(conv);
        setLoading(true);
        fetch(`/inbox/${conv.id}`)
            .then((r) => r.json())
            .then((data) => {
                setMessages(data.messages || []);
            })
            .catch(() => toast.error('Failed to load messages'))
            .finally(() => setLoading(false));
    }

    function sendMessage() {
        if (!messageBody.trim() || !selectedConv) return;
        fetch(`/inbox/${selectedConv.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
            body: JSON.stringify({ body: messageBody }),
        })
            .then((r) => r.json())
            .then((msg) => {
                setMessages((prev) => [...prev, msg]);
                setMessageBody('');
            })
            .catch(() => toast.error('Failed to send message'));
    }

    function handleNewConv(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormErrors({});
        router.post('/inbox', {
            user_ids: [Number(newConvForm.user_id)],
            type: 'direct',
            subject: newConvForm.subject || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewConvOpen(false);
                setNewConvForm({ user_id: '', subject: '' });
                toast.success('Conversation created.');
            },
            onError: (err) => setFormErrors(err),
        });
    }

    return (
        <>
            <Head title="Inbox" />
            <AppShell eyebrowKey="nav.inbox" titleKey="nav.inbox" subtitleKey="Direct messages and context chats"
                action={
                    <AppButton variant="primary" onPress={() => { setFormErrors({}); setNewConvOpen(true); }}>
                        <Plus size={16} /> New conversation
                    </AppButton>
                }
            >
                <section className="grid min-w-0 flex-1 grid-cols-[320px_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border border-[var(--crm-border)]" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <ConversationList
                        conversations={filteredConvs}
                        selectedConvId={selectedConv?.id ?? null}
                        search={search}
                        onSearchChange={setSearch}
                        onSelect={openConversation}
                    />

                    <div className="flex flex-col">
                        <MessageThread
                            conversation={selectedConv}
                            messages={messages}
                            loading={loading}
                            messageBody={messageBody}
                            onMessageBodyChange={setMessageBody}
                            onSend={sendMessage}
                        />
                    </div>
                </section>

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
