import { router, usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
import { Avatar, Button, Card, Chip, Dropdown, Popover, ScrollShadow } from '@heroui/react';
import { IconCheck, IconChevronDown, IconExternalLink, IconFilter, IconMail, IconMessage2, IconUserCircle, IconUsers } from '@tabler/icons-react';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import type { ConversationRow } from '@/features/chat/types';
import { getAvatarTone, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';

const FILTERS = [
    { id: 'recent', icon: IconMessage2 },
    { id: 'unread', icon: IconMail },
    { id: 'direct', icon: IconUserCircle },
    { id: 'groups', icon: IconUsers },
] as const;
type PopoverFilter = typeof FILTERS[number]['id'];

function getFilterLabel(filterId: string, t: (key: string) => string): string {
    return t(`inbox.filters.${filterId}`);
}

function ConversationPreview({ conversation, currentUserId, onSelect, t }: {
    conversation: ConversationRow;
    currentUserId: number;
    onSelect: () => void;
    t: (key: string) => string;
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
                    <Avatar size="sm" className={`${isGroup ? 'rounded-lg' : ''} ${tone.bg} ${tone.text}`}><Avatar.Fallback>{isGroup ? <IconUsers size={15} /> : getConversationInitials(conversation, currentUserId)}</Avatar.Fallback></Avatar>
                    {online ? <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--surface)] bg-emerald-400" /> : null}
                </div>
                <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                        <span className={`min-w-0 flex-1 truncate text-xs ${conversation.unreadCount > 0 ? 'font-bold text-[var(--text)]' : 'font-semibold text-[var(--text)]'}`}>{name}</span>
                        <span className="text-[9px] text-[var(--text-subtle)]">{formatConversationTime(conversation.lastMessageAt)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] text-[var(--text-muted)]">{getLastMessagePreview(conversation, currentUserId)}</span>
                </span>
                {conversation.unreadCount > 0 ? <Chip size="sm" color="danger" variant="soft">{conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}</Chip> : null}
            </Button>
        </div>
    );
}

export function MessagePopover() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<PopoverFilter>('recent');
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const pageProps = usePage().props as unknown as { auth: { user?: { recent_conversations?: ConversationRow[]; unread_messages?: number; id?: number } } };
    const [conversations, setConversations] = useState<ConversationRow[]>(pageProps.auth?.user?.recent_conversations ?? []);
    const [unreadCount, setUnreadCount] = useState(pageProps.auth?.user?.unread_messages ?? 0);
    const currentUserId = pageProps.auth?.user?.id ?? 0;

    useEffect(() => {
        setConversations(pageProps.auth?.user?.recent_conversations ?? []);
        setUnreadCount(pageProps.auth?.user?.unread_messages ?? 0);
    }, [pageProps.auth?.user?.recent_conversations, pageProps.auth?.user?.unread_messages]);

    useEffect(() => {
        if (!currentUserId) return;
        const channel = echo().private(`user.${currentUserId}.inbox`);
        channel.listen('.inbox.updated', () => router.reload({ only: ['conversations', 'unreadCount'] }));
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

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger>
                <Button isIconOnly variant="ghost" size="sm" aria-label="Messages" className="relative rounded-lg">
                    <IconMessage2 size={15} />
                    {unreadCount > 0 ? <Chip size="sm" color="danger" variant="soft" className="absolute -right-2 -top-2 min-w-5 px-1">{unreadCount > 99 ? '99+' : unreadCount}</Chip> : null}
                </Button>
            </Popover.Trigger>
            <Popover.Content placement="bottom end" className="w-[min(400px,calc(100vw-20px))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 shadow-2xl">
                <Popover.Dialog className="outline-none">
                    <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><IconMessage2 size={17} /></span>
                        <span className="min-w-0 flex-1"><Popover.Heading className="text-sm font-semibold">{t('inbox.title')}</Popover.Heading><span className="block text-[9px] text-[var(--text-muted)]">{t('inbox.subtitle')}</span></span>
                        {unreadCount > 0 ? <Chip size="sm" color="danger">{unreadCount}</Chip> : null}
                        <Button isIconOnly variant="ghost" size="sm" onPress={() => visitInbox()} aria-label={t('inbox.openInbox')}><IconExternalLink size={14} /></Button>
                    </header>

                    <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
                        <AppSearchInput value={search} onChange={setSearch} placeholder={t('inbox.searchPlaceholder')} ariaLabel={t('inbox.searchAriaLabel')} className="max-w-none" />
                        <Dropdown>
                            <Dropdown.Trigger aria-label={t('inbox.filterAriaLabel')} className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-[9px] font-medium text-[var(--text)] data-[open]:border-[var(--accent)]">
                                <IconFilter size={13} /><span className="hidden sm:inline">{getFilterLabel(filter, t)}</span><IconChevronDown size={11} />
                            </Dropdown.Trigger>
                            <Dropdown.Popover placement="bottom end" className="min-w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                <Dropdown.Menu selectionMode="single" selectedKeys={[filter]} onAction={(key) => setFilter(String(key) as PopoverFilter)}>
                                    {FILTERS.map((item) => { const Icon = item.icon; return <Dropdown.Item key={item.id} id={item.id} textValue={getFilterLabel(item.id, t)}><div className="flex items-center gap-2"><Icon size={14} />{getFilterLabel(item.id, t)}{filter === item.id ? <IconCheck size={12} className="ml-auto text-[var(--accent)]" /> : null}</div></Dropdown.Item>; })}
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </div>

                    <ScrollShadow className="max-h-[52vh]">
                        {filtered.length === 0 ? (
                            <Card className="m-4 items-center border-dashed bg-transparent px-4 py-9 text-center shadow-none">
                                <IconMessage2 size={22} className="text-[var(--text-muted)]" />
                                <p className="mt-2 text-sm font-semibold">{t('inbox.noConversations')}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{t('inbox.noConversationsDesc')}</p>
                            </Card>
                        ) : filtered.map((conversation) => <ConversationPreview key={conversation.id} conversation={conversation} currentUserId={currentUserId} onSelect={() => visitInbox(conversation)} t={t} />)}
                    </ScrollShadow>

                    <footer className="border-t border-[var(--border)] p-2.5">
                        <Button variant="primary" size="sm" onPress={() => visitInbox()} className="w-full"><IconMessage2 size={13} /> Ouvrir tous les messages</Button>
                    </footer>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
