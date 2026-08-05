import { router, usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
import { Avatar, Button, Card, Chip, Dropdown, Popover, ScrollShadow, SearchField } from '@heroui/react';
import { IconCheck, IconChevronDown, IconExternalLink, IconFilter, IconMail, IconMessage2, IconSearch, IconTrash, IconUserCircle, IconUsers } from '@tabler/icons-react';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ConversationRow } from '@/features/chat/types';
import { inboxApi } from '@/features/inbox/api';
import { InboxIconButton } from '@/features/inbox/components/InboxIconButton';
import { getAvatarTone, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';

const FILTERS = [
    { id: 'recent', label: 'Tous les messages', icon: IconMessage2 },
    { id: 'unread', label: 'Non lus', icon: IconMail },
    { id: 'direct', label: 'Conversations directes', icon: IconUserCircle },
    { id: 'groups', label: 'Groupes', icon: IconUsers },
] as const;
type PopoverFilter = typeof FILTERS[number]['id'];

function ConversationPreview({ conversation, currentUserId, onSelect, onRemove }: {
    conversation: ConversationRow;
    currentUserId: number;
    onSelect: () => void;
    onRemove: () => void;
}) {
    const name = getConversationDisplayName(conversation, currentUserId);
    const isGroup = conversation.type === 'group';
    const tone = getAvatarTone(isGroup ? conversation.id : name);
    const other = (conversation.participants || []).find((participant) => participant?.user?.id !== currentUserId);
    const online = !isGroup && Boolean(other?.user?.lastSeenAt && Date.now() - new Date(other.user.lastSeenAt).getTime() < 300000);

    return (
        <div className={`group flex items-center border-b border-[color-mix(in_srgb,var(--border)_55%,transparent)] px-2 py-1 last:border-0 ${conversation.unreadCount > 0 ? 'bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]' : ''}`}>
            <Button variant="ghost" onPress={onSelect} className="h-auto min-w-0 flex-1 justify-start rounded-lg px-2 py-2 text-left">
                <div className="relative shrink-0">
                    <Avatar size="sm" name={name} className={`${isGroup ? 'rounded-lg' : ''} ${tone.bg} ${tone.text}`}>{isGroup ? <IconUsers size={15} /> : getConversationInitials(conversation, currentUserId)}</Avatar>
                    {online ? <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--surface)] bg-emerald-400" /> : null}
                </div>
                <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                        <span className={`min-w-0 flex-1 truncate text-xs ${conversation.unreadCount > 0 ? 'font-bold text-[var(--text)]' : 'font-semibold text-[var(--text)]'}`}>{name}</span>
                        <span className="text-[9px] text-[var(--text-subtle)]">{formatConversationTime(conversation.lastMessageAt)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] text-[var(--text-muted)]">{getLastMessagePreview(conversation, currentUserId)}</span>
                </span>
                {conversation.unreadCount > 0 ? <Chip size="sm" color="danger" variant="solid">{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</Chip> : null}
            </Button>
            <InboxIconButton label="Retirer de la liste" tone="danger" size="sm" onPress={onRemove} className="shrink-0 text-red-400 sm:opacity-70 sm:group-hover:opacity-100"><IconTrash size={13} /></InboxIconButton>
        </div>
    );
}

export function MessagePopover() {
    const [filter, setFilter] = useState<PopoverFilter>('recent');
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { auth } = usePage().props as { auth: { user?: { recent_conversations?: ConversationRow[]; unread_messages?: number; id?: number } } };
    const [conversations, setConversations] = useState<ConversationRow[]>(auth?.user?.recent_conversations ?? []);
    const [unreadCount, setUnreadCount] = useState(auth?.user?.unread_messages ?? 0);
    const currentUserId = auth?.user?.id ?? 0;

    useEffect(() => {
        setConversations(auth?.user?.recent_conversations ?? []);
        setUnreadCount(auth?.user?.unread_messages ?? 0);
    }, [auth?.user?.recent_conversations, auth?.user?.unread_messages]);

    useEffect(() => {
        if (!currentUserId) return;
        const channel = echo().private(`user.${currentUserId}.inbox`);
        channel.listen('.inbox.updated', () => router.reload({ only: ['conversations', 'unreadCount'], preserveState: true, preserveScroll: true }));
        return () => echo().leaveChannel(`private-user.${currentUserId}.inbox`);
    }, [currentUserId]);

    const filtered = useMemo(() => conversations.filter((conversation) => {
        if (filter === 'unread' && conversation.unreadCount === 0) return false;
        if (filter === 'direct' && conversation.type !== 'direct') return false;
        if (filter === 'groups' && conversation.type !== 'group') return false;
        return getConversationDisplayName(conversation, currentUserId).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase());
    }), [conversations, currentUserId, filter, search]);

    function visitInbox(conversation?: ConversationRow) {
        const query = conversation ? `?conversation=${conversation.id}${conversation.lastMessage?.id ? `&message=${conversation.lastMessage.id}` : ''}` : '';
        setIsOpen(false);
        router.visit(`/inbox${query}`);
    }

    async function removeConversation(conversation: ConversationRow) {
        try {
            await inboxApi.archive(conversation.id, true);
            setConversations((items) => items.filter((item) => item.id !== conversation.id));
            setUnreadCount((count) => Math.max(0, count - conversation.unreadCount));
            toast.success('Conversation retiree de la liste.');
        } catch {
            toast.error('Impossible de retirer la conversation.');
        }
    }

    const activeFilter = FILTERS.find((item) => item.id === filter) ?? FILTERS[0];

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger>
                <Button isIconOnly variant="ghost" size="sm" aria-label="Messages" className="relative rounded-lg">
                    <IconMessage2 size={15} />
                    {unreadCount > 0 ? <Chip size="sm" color="danger" variant="solid" className="absolute -right-2 -top-2 min-w-5 px-1">{unreadCount > 99 ? '99+' : unreadCount}</Chip> : null}
                </Button>
            </Popover.Trigger>
            <Popover.Content placement="bottom end" className="w-[min(400px,calc(100vw-20px))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 shadow-2xl">
                <Popover.Dialog className="outline-none">
                    <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><IconMessage2 size={17} /></span>
                        <span className="min-w-0 flex-1"><Popover.Heading className="text-sm font-semibold">Messages</Popover.Heading><span className="block text-[9px] text-[var(--text-muted)]">Vos echanges recents</span></span>
                        {unreadCount > 0 ? <Chip size="sm" color="danger">{unreadCount}</Chip> : null}
                        <InboxIconButton label="Ouvrir la messagerie" onPress={() => visitInbox()}><IconExternalLink size={14} /></InboxIconButton>
                    </header>

                    <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
                        <SearchField value={search} onChange={setSearch} aria-label="Rechercher dans les messages" variant="secondary" className="min-w-0 flex-1">
                            <SearchField.Group>
                                <SearchField.SearchIcon><IconSearch size={13} /></SearchField.SearchIcon>
                                <SearchField.Input placeholder="Rechercher..." />
                                <SearchField.ClearButton />
                            </SearchField.Group>
                        </SearchField>
                        <Dropdown>
                            <Dropdown.Trigger aria-label="Filtrer les messages" className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-[9px] font-medium text-[var(--text)] data-[open]:border-[var(--accent)]">
                                <IconFilter size={13} /><span className="hidden sm:inline">{activeFilter.label}</span><IconChevronDown size={11} />
                            </Dropdown.Trigger>
                            <Dropdown.Popover placement="bottom end" className="min-w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                <Dropdown.Menu selectionMode="single" selectedKeys={[filter]} onAction={(key) => setFilter(String(key) as PopoverFilter)}>
                                    {FILTERS.map((item) => { const Icon = item.icon; return <Dropdown.Item key={item.id} id={item.id} textValue={item.label}><div className="flex items-center gap-2"><Icon size={14} />{item.label}{filter === item.id ? <IconCheck size={12} className="ml-auto text-[var(--accent)]" /> : null}</div></Dropdown.Item>; })}
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </div>

                    <ScrollShadow className="max-h-[52vh]">
                        {filtered.length === 0 ? (
                            <Card className="m-4 items-center border-dashed bg-transparent px-4 py-9 text-center shadow-none">
                                <IconMessage2 size={22} className="text-[var(--text-muted)]" />
                                <p className="mt-2 text-sm font-semibold">Aucune conversation</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">Aucun resultat pour ce filtre.</p>
                            </Card>
                        ) : filtered.map((conversation) => <ConversationPreview key={conversation.id} conversation={conversation} currentUserId={currentUserId} onSelect={() => visitInbox(conversation)} onRemove={() => removeConversation(conversation)} />)}
                    </ScrollShadow>

                    <footer className="border-t border-[var(--border)] p-2.5">
                        <Button variant="primary" size="sm" onPress={() => visitInbox()} className="w-full"><IconMessage2 size={13} /> Ouvrir tous les messages</Button>
                    </footer>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
