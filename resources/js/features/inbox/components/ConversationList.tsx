import { Avatar, Button, Dropdown, ListBox, Select, Spinner } from '@heroui/react';
import { IconArchive, IconBookmark, IconCheck, IconCircleDot, IconMessageCircle, IconMessage2, IconPlus, IconSearch, IconAdjustmentsHorizontal, IconUsers } from '@tabler/icons-react';

import { useMemo, useState } from 'react';
import type { ConversationRow } from '@/features/chat/types';
import { InboxIconButton } from '@/features/inbox/components/InboxIconButton';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import type { RealtimeState } from '@/features/inbox/components/useRealtimeConnection';
import { useTranslation } from '@/lib/i18n';
import {
    CATEGORY_OPTIONS,
    formatConversationTime,
    getAvatarTone,
    getCategoryLabel,
    getCategoryMeta,
    getConversationDisplayName,
    getConversationInitials,
    getLastMessagePreview,
} from '@/features/inbox/utils';

type Props = {
    conversations: ConversationRow[];
    selectedConvId: number | null;
    search: string;
    onSearchChange: (query: string) => void;
    onSelect: (conversation: ConversationRow) => void;
    onArchiveToggle?: (conversation: ConversationRow) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    currentUserId: number;
    onNewConversation?: () => void;
    loading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onlineUserIds?: Set<number>;
    realtimeState?: RealtimeState;
};

const inboxTabs = [
    { id: 'active', labelKey: 'inbox.tabs.active', icon: IconMessage2 },
    { id: 'unread', labelKey: 'inbox.tabs.unread', icon: IconCircleDot },
    { id: 'direct', labelKey: 'inbox.tabs.direct', icon: IconMessageCircle },
    { id: 'groups', labelKey: 'inbox.tabs.groups', icon: IconUsers },
    { id: 'archived', labelKey: 'inbox.tabs.archived', icon: IconArchive },
];

function isParticipantOnline(conversation: ConversationRow, currentUserId: number, onlineUserIds: Set<number>): boolean {
    if (conversation.type === 'group') return false;

    return (Array.isArray(conversation.participants) ? conversation.participants : [])
        .some((participant) => participant?.user?.id !== currentUserId && onlineUserIds.has(Number(participant?.user?.id)));
}

function initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
}

function ConversationListItem({
    conversation,
    selectedConversationId,
    currentUserId,
    onlineUserIds,
    onSelect,
    onArchiveToggle,
}: {
    conversation: ConversationRow;
    selectedConversationId: number | null;
    currentUserId: number;
    onlineUserIds: Set<number>;
    onSelect: (conversation: ConversationRow) => void;
    onArchiveToggle?: (conversation: ConversationRow) => void;
}) {
    const { t } = useTranslation();
    const name = getConversationDisplayName(conversation, currentUserId);
    const isGroup = conversation.type === 'group';
    const avatarTone = getAvatarTone(isGroup ? conversation.id : name);
    const category = getCategoryMeta(isGroup ? conversation.category : null);
    const isSelected = selectedConversationId === conversation.id;
    const isOnline = isParticipantOnline(conversation, currentUserId, onlineUserIds);

    return (
        <div className={`group flex items-center gap-1 rounded-xl border border-transparent transition-colors duration-150 ${isSelected ? 'border-[color-mix(in_srgb,var(--accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--accent)_13%,var(--surface-2))] shadow-[inset_2px_0_0_var(--accent)]' : 'hover:bg-[color-mix(in_srgb,var(--surface-2)_78%,var(--surface))]'}`}>
            <Button
                variant="ghost"
                onPress={() => onSelect(conversation)}
                className="h-auto min-h-[58px] min-w-0 flex-1 justify-start gap-2.5 rounded-xl px-2.5 py-2 text-left outline-none data-[hovered]:bg-transparent data-[pressed]:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] data-[focus-visible]:ring-1 data-[focus-visible]:ring-inset data-[focus-visible]:ring-[var(--focus-ring)]"
            >
                <div className="relative shrink-0 transition-transform duration-150 group-hover:scale-[1.04]">
                    <Avatar size="sm" className={`${avatarTone.bg} ${avatarTone.text} font-semibold`}>
                        <Avatar.Fallback>{isGroup ? <IconUsers size={15} /> : getConversationInitials(conversation, currentUserId)}</Avatar.Fallback>
                    </Avatar>
                    {isOnline ? <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[var(--surface)] bg-emerald-400" /> : null}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-2">
                        <p className={`min-w-0 flex-1 truncate text-[12px] ${conversation.unreadCount > 0 ? 'font-semibold text-[var(--foreground)]' : 'font-medium text-[var(--foreground)]'}`}>{name}</p>
                        {conversation.isPinned ? <IconBookmark size={11} className="shrink-0 fill-[var(--accent)] text-[var(--accent)]" aria-label={t('inbox.pinnedAria')} /> : null}
                        <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{formatConversationTime(conversation.lastMessageAt)}</span>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5">
                        <p className={`min-w-0 flex-1 truncate text-[10px] ${conversation.unreadCount > 0 ? 'font-medium text-[var(--foreground)]' : 'text-[var(--text-muted)]'}`}>{getLastMessagePreview(conversation, currentUserId, t)}</p>
                        {conversation.unreadCount > 0 ? <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[8px] font-bold text-black">{conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}</span> : null}
                    </div>
                    {isGroup && conversation.category ? <p className={`mt-0.5 truncate text-[8px] font-medium ${category.tone.text}`}>{getCategoryLabel(conversation.category, t)}</p> : null}
                </div>
            </Button>
            {onArchiveToggle ? <InboxIconButton label={conversation.archivedAt ? t('inbox.restoreAria') : t('inbox.archiveAria')} onPress={() => onArchiveToggle(conversation)} className="pointer-events-none mr-1 size-6 min-w-6 rounded-full opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 data-[focus-visible]:pointer-events-auto data-[focus-visible]:opacity-100 data-[hovered]:bg-[var(--surface)] data-[hovered]:text-[var(--accent)]">
                {conversation.archivedAt ? <IconArchive size={14} /> : <IconArchive size={14} />}
            </InboxIconButton> : null}
        </div>
    );
}

function ConversationSection({
    label,
    conversations,
    ...itemProps
}: Omit<Parameters<typeof ConversationListItem>[0], 'conversation'> & { label: string; conversations: ConversationRow[] }) {
    if (conversations.length === 0) return null;

    return (
        <section className="space-y-0.5">
            <div className="flex items-center gap-2 px-3 pb-0.5 pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--text-muted)]">{label}</p>
                <span className="h-px flex-1 bg-[var(--border)]" />
            </div>
            {conversations.map((conversation) => <ConversationListItem key={conversation.id} conversation={conversation} {...itemProps} />)}
        </section>
    );
}

export function ConversationList({
    conversations,
    selectedConvId,
    search,
    onSearchChange,
    onSelect,
    onArchiveToggle,
    activeTab,
    onTabChange,
    currentUserId,
    onNewConversation,
    loading = false,
    hasMore = false,
    onLoadMore,
    onlineUserIds = new Set<number>(),
    realtimeState = 'disconnected',
}: Props) {
    const { t } = useTranslation();
    const [categoryFilter, setCategoryFilter] = useState('');
    const filteredConversations = useMemo(() => {
        if (!categoryFilter || activeTab !== 'groups') return conversations;
        return conversations.filter((conversation) => conversation.category === categoryFilter);
    }, [activeTab, categoryFilter, conversations]);
    const pinnedConversations = useMemo(() => filteredConversations.filter((conversation) => conversation.isPinned), [filteredConversations]);
    const allOtherConversations = useMemo(() => filteredConversations.filter((conversation) => !conversation.isPinned), [filteredConversations]);
    const onlinePeople = useMemo(() => {
        const people = new Map<number, string>();
        conversations.forEach((conversation) => {
            (Array.isArray(conversation.participants) ? conversation.participants : []).forEach((participant) => {
                const user = participant?.user;
                if (user?.id && user.id !== currentUserId && onlineUserIds.has(Number(user.id))) people.set(user.id, user.name);
            });
        });
        return Array.from(people, ([id, name]) => ({ id, name }));
    }, [conversations, currentUserId, onlineUserIds]);

    const isConnected = realtimeState === 'connected';
    const activeFilter = inboxTabs.find((filter) => filter.id === activeTab) ?? inboxTabs[0];
    const ActiveFilterIcon = activeFilter.icon;
    const listItemProps = { selectedConversationId: selectedConvId, currentUserId, onlineUserIds, onSelect, onArchiveToggle };

    return (
        <aside className="flex h-full min-h-0 flex-col bg-[var(--surface)]">
            <header className="border-b border-[var(--border)] px-3 pb-3 pt-3">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><IconMessageCircle size={17} /></div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><h1 className="truncate text-base font-semibold tracking-tight text-[var(--foreground)]">{t('inbox.title')} <span className="text-[var(--accent)]">({conversations.length})</span></h1><span className={`size-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-[var(--text-muted)]'}`} /></div>
                        <p className="mt-0.5 truncate text-[9px] text-[var(--text-muted)]">{isConnected ? t('inbox.connectionOnline') : realtimeState === 'connecting' ? t('inbox.connecting') : t('inbox.connectionOffline')}</p>
                    </div>
                    {onNewConversation ? <InboxIconButton label={t('inbox.newConversation')} tone="accent" onPress={onNewConversation} className="bg-[var(--accent-soft)]"><IconPlus size={17} /></InboxIconButton> : null}
                </div>
                <div className="mt-3 flex gap-1.5">
                    <AppSearchInput ariaLabel={t('inbox.searchConversationAria')} value={search} onChange={onSearchChange} placeholder={t('inbox.searchPlaceholder')} className="min-w-0 flex-1" maxWidth="" />
                    <Dropdown>
                        <Dropdown.Trigger aria-label={t('inbox.filterConversationsAria')} className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition ${activeTab !== 'active' ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]'}`}><IconAdjustmentsHorizontal size={13} /></Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="min-w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                            <Dropdown.Menu aria-label={t('inbox.filterMenuAria')} selectionMode="single" selectedKeys={[activeTab]} onAction={(key) => onTabChange(String(key))}>
                                {inboxTabs.map(({ id, labelKey, icon: Icon }) => <Dropdown.Item key={id} id={id} textValue={t(labelKey)} className="rounded-lg px-2.5 py-2 text-xs data-[hover]:bg-[var(--surface-2)]"><div className="flex items-center gap-2"><Icon size={13} className={activeTab === id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} /><span className="flex-1">{t(labelKey)}</span>{activeTab === id ? <IconCheck size={12} className="text-[var(--accent)]" /> : null}</div></Dropdown.Item>)}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </div>
                <div className="mt-2 flex items-center justify-between"><p className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]"><ActiveFilterIcon size={10} />{t(activeFilter.labelKey)}</p>{onlinePeople.length > 0 ? <div className="flex -space-x-1.5">{onlinePeople.slice(0, 5).map((person) => <Avatar key={person.id} size="sm" className={`${getAvatarTone(person.id).bg} ${getAvatarTone(person.id).text} size-5 border border-[var(--surface)] text-[7px]`}><Avatar.Fallback>{initials(person.name)}</Avatar.Fallback></Avatar>)}{onlinePeople.length > 5 ? <span className="z-10 flex size-5 items-center justify-center rounded-full border border-[var(--surface)] bg-[var(--surface-3)] text-[7px] text-[var(--text-muted)]">+{onlinePeople.length - 5}</span> : null}</div> : null}</div>
            </header>

            {activeTab === 'groups' ? <div className="border-b border-[var(--border)] px-4 py-2"><Select selectedKey={categoryFilter} onSelectionChange={(key) => setCategoryFilter(String(key ?? ''))} aria-label={t('inbox.groupCategoryAria')}><Select.Trigger className="h-8 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 text-xs text-[var(--foreground)]"><Select.Value className="flex-1 truncate text-left" /><Select.Indicator /></Select.Trigger><Select.Popover isNonModal className="z-[120] min-w-[260px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl"><ListBox aria-label={t('inbox.groupCategoryListAria')} className="gap-0"><ListBox.Item id="" textValue={t('inbox.allCategories')} className="rounded-lg px-3 py-2 text-xs">{t('inbox.allCategories')}</ListBox.Item>{CATEGORY_OPTIONS.filter((category) => category.id !== 'custom').map((category) => <ListBox.Item key={category.id} id={category.id} textValue={getCategoryLabel(category.id, t)} className="rounded-lg px-3 py-2 text-xs">{getCategoryLabel(category.id, t)}</ListBox.Item>)}</ListBox></Select.Popover></Select></div> : null}

            <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-3 pt-1">
                {loading && filteredConversations.length === 0 ? <div className="flex items-center justify-center py-12"><Spinner size="sm" color="warning" /></div> : filteredConversations.length === 0 ? <div className="flex flex-col items-center px-6 py-14 text-center"><div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]"><IconSearch size={18} /></div><p className="mt-3 text-sm font-medium text-[var(--foreground)]">{t('inbox.emptyList')}</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{t('inbox.emptyListDesc')}</p></div> : <div className="space-y-2"><ConversationSection label={t('inbox.pinnedSection')} conversations={pinnedConversations} {...listItemProps} /><ConversationSection label={pinnedConversations.length > 0 ? t('inbox.allDiscussions') : t('inbox.messages')} conversations={allOtherConversations} {...listItemProps} />{hasMore ? <Button variant="ghost" onPress={onLoadMore} isDisabled={loading} className="mt-1 h-9 w-full rounded-lg text-xs text-[var(--text-muted)]">{loading ? <Spinner size="sm" color="warning" /> : t('inbox.loadMore')}</Button> : null}</div>}
            </div>
        </aside>
    );
}
