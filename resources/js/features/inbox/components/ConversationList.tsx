import { Search } from 'lucide-react';
import type { ConversationRow } from '@/features/chat/types';

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

type Props = {
    conversations: ConversationRow[];
    selectedConvId: number | null;
    search: string;
    onSearchChange: (q: string) => void;
    onSelect: (conv: ConversationRow) => void;
};

export function ConversationList({ conversations, selectedConvId, search, onSearchChange, onSelect }: Props) {
    return (
        <div className="flex flex-col border-r border-[var(--crm-border)]">
            <div className="border-b border-[var(--crm-border)] p-3">
                <div className="relative">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" />
                    <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search conversations..." className="crm-command-input h-9 w-full pl-8 text-xs" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => {
                    const parts = Array.isArray(conv.participants) ? conv.participants : [];
                    const other = parts.find((p) => p?.user?.name !== 'You');
                    return (
                        <button key={conv.id} type="button" onClick={() => onSelect(conv)}
                            className={`flex w-full items-center gap-3 border-b border-[var(--crm-border)] px-3 py-3 text-left transition hover:bg-[var(--crm-surface-2)] ${selectedConvId === conv.id ? 'bg-[color-mix(in_srgb,var(--crm-gold)_8%,transparent)]' : ''}`}>
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-sm font-bold text-[var(--crm-gold)]">
                                {other ? other.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{other?.user?.name || conv.subject || 'Conversation'}</p>
                                    {conv.lastMessageAt ? <span className="shrink-0 text-[10px] text-[var(--crm-text-muted)]">{timeAgo(conv.lastMessageAt)}</span> : null}
                                </div>
                                <p className="mt-0.5 truncate text-xs text-[var(--crm-text-muted)]">{conv.lastMessage?.body || 'No messages yet'}</p>
                            </div>
                            {conv.unreadCount > 0 ? (
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{conv.unreadCount}</span>
                            ) : null}
                        </button>
                    );
                })}
                {conversations.length === 0 ? (
                    <p className="p-6 text-center text-xs text-[var(--crm-text-muted)]">No conversations</p>
                ) : null}
            </div>
        </div>
    );
}
