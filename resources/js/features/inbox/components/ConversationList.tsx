import { Archive, ArchiveRestore, Hash, MessageSquare, Plus, Search, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ConversationRow } from '@/features/chat/types';
import { CATEGORY_OPTIONS, getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';

type Props = {
    conversations: ConversationRow[];
    selectedConvId: number | null;
    search: string;
    onSearchChange: (q: string) => void;
    onSelect: (conv: ConversationRow) => void;
    onArchiveToggle?: (conv: ConversationRow) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    currentUserId: number;
    onNewConversation?: () => void;
};

const MAIN_TABS = [
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
    { id: 'unread', label: 'Unread' },
    { id: 'direct', label: 'Direct' },
    { id: 'groups', label: 'Groups' },
];

export function ConversationList({ conversations, selectedConvId, search, onSearchChange, onSelect, onArchiveToggle, activeTab, onTabChange, currentUserId, onNewConversation }: Props) {
    const [catFilter, setCatFilter] = useState('');

    const displayedConvs = useMemo(() => {
        if (!catFilter || activeTab !== 'groups') return conversations;
        return conversations.filter((c) => c.category === catFilter);
    }, [conversations, catFilter, activeTab]);
    const [rowHoverId, setRowHoverId] = useState<number | null>(null);

    const onlineUsers = useMemo(() => {
        const seen = new Set<number>();
        const users: { id: number; name: string }[] = [];
        for (const conv of conversations) {
            if (!Array.isArray(conv.participants)) continue;
            for (const p of conv.participants) {
                if (p?.user?.id && p.user.id !== currentUserId && !seen.has(p.user.id)) {
                    const ls = p.user.lastSeenAt;
                    if (ls && Date.now() - new Date(ls).getTime() < 300000) {
                        seen.add(p.user.id);
                        users.push({ id: p.user.id, name: p.user.name });
                    }
                }
            }
        }
        return users;
    }, [conversations, currentUserId]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--crm-border)] px-4 py-3">
                <div>
                    <h2 className="text-sm font-bold text-[var(--crm-text)]">Messages</h2>
                    <p className="mt-0.5 text-[9px] text-[var(--crm-text-muted)]">Team conversations and project updates</p>
                </div>
                <button type="button" onClick={onNewConversation}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)] transition"
                    title="New conversation">
                    <Plus size={16} />
                </button>
            </div>

            {/* Search */}
            <div className="border-b border-[var(--crm-border)] px-3 py-2.5">
                <div className="relative">
                    <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input value={search} onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search conversations..."
                        className="h-8 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-8 pr-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)] focus:ring-2 focus:ring-[var(--crm-gold)]/20" />
                </div>
            </div>

            {/* Online now */}
            {onlineUsers.length > 0 ? (
                <div className="border-b border-[var(--crm-border)] px-3 py-2">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--crm-muted)]">Online now</p>
                    <div className="flex flex-wrap gap-1.5">
                        {onlineUsers.map((u) => (
                            <span key={u.id}
                                className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 py-0.5 text-[9px] font-semibold text-[var(--crm-text)]">
                                <span className="size-1.5 rounded-full bg-emerald-400" />
                                {u.name}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-[var(--crm-border)] px-3 py-2">
                {MAIN_TABS.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
                        className={`rounded-lg px-2.5 py-1 text-[9px] font-semibold transition ${
                            activeTab === tab.id
                                ? 'bg-[var(--crm-gold)] text-black'
                                : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'
                        }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Category filter (groups tab only) */}
            {activeTab === 'groups' && (
                <div className="flex items-center gap-2 border-b border-[var(--crm-border)] px-3 py-2">
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                        className="h-7 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 text-[9px] text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)] focus:ring-2 focus:ring-[var(--crm-gold)]/20">
                        <option value="">All categories</option>
                        {CATEGORY_OPTIONS.filter((c) => c.id !== 'custom').map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                    {catFilter && (
                        <button type="button" onClick={() => setCatFilter('')}
                            className="flex size-5 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)]">
                            <X size={12} />
                        </button>
                    )}
                </div>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
                {displayedConvs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--crm-surface-3)] mb-3">
                            <Search size={18} className="text-[var(--crm-muted)]" />
                        </div>
                        <p className="text-xs text-[var(--crm-text-muted)] text-center">No conversations found</p>
                        <p className="mt-1 text-[9px] text-[var(--crm-muted)] text-center">Start a new conversation to begin chatting</p>
                    </div>
                ) : (
                    displayedConvs.map((conv) => {
                        const name = getConversationDisplayName(conv, currentUserId);
                        const initials = getConversationInitials(conv, currentUserId);
                        const isSelected = selectedConvId === conv.id;
                        const isGroup = conv.type === 'group';
                        const catMeta = getCategoryMeta(isGroup ? conv.category : null);
                        const avatarTone = getAvatarTone(isGroup ? conv.id : name);
                        const preview = getLastMessagePreview(conv, currentUserId);

                        return (
                            <button key={conv.id} type="button" onClick={() => onSelect(conv)}
                                onMouseEnter={() => setRowHoverId(conv.id)}
                                onMouseLeave={() => setRowHoverId(null)}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                                    isSelected
                                        ? 'bg-[color-mix(in_srgb,var(--crm-gold)_10%,transparent)]'
                                        : 'hover:bg-[var(--crm-surface)]'
                                } ${conv.unreadCount > 0 && !isSelected ? 'border-l-2 border-[var(--crm-gold)]' : ''}`}>
                                <div className="relative shrink-0">
                                    {isGroup ? (
                                        <div className={`flex size-10 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}>
                                            <Users size={16} />
                                        </div>
                                    ) : (
                                        <div className={`flex size-10 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>
                                            {initials}
                                        </div>
                                    )}
                                    {!isGroup && conv.participants?.length === 2 ? (() => {
                                        const parts = Array.isArray(conv.participants) ? conv.participants : [];
                                        const other = parts.find((p) => p?.user?.id !== currentUserId);
                                        const ls = other?.user?.lastSeenAt;
                                        if (ls && Date.now() - new Date(ls).getTime() < 300000) {
                                            return <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-elevated)] bg-emerald-400" />;
                                        }
                                        return null;
                                    })() : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <p className={`truncate text-sm ${
                                                conv.unreadCount > 0 ? 'font-bold text-[var(--crm-text)]' : 'font-semibold text-[var(--crm-text)]'
                                            }`}>
                                                {name}
                                            </p>
                                            {isGroup && conv.category ? (
                                                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>
                                                    {catMeta.label}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {conv.lastMessageAt ? (
                                                <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(conv.lastMessageAt)}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5">
                                        {preview ? (
                                            <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{preview}</p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {rowHoverId === conv.id ? (
                                        <span role="button" tabIndex={0}
                                            onClick={(e) => { e.stopPropagation(); onArchiveToggle?.(conv); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onArchiveToggle?.(conv); } }}
                                            className="flex size-6 cursor-pointer items-center justify-center rounded-md text-[var(--crm-text-muted)] transition hover:text-[var(--crm-gold)]"
                                            title={conv.archivedAt ? 'Unarchive' : 'Archive'}>
                                            {conv.archivedAt ? <ArchiveRestore size={12} /> : <Archive size={12} />}
                                        </span>
                                    ) : null}
                                    {conv.unreadCount > 0 ? (
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                        </span>
                                    ) : null}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
