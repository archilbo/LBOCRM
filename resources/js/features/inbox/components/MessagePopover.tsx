import { router, usePage } from '@inertiajs/react';
import { ExternalLink, MessageSquare, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components';
import type { ConversationRow } from '@/features/chat/types';
import { getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';

type ConvData = { recent_conversations?: ConversationRow[] };

const TABS = [
    { id: 'recent', label: 'Recent' },
    { id: 'unread', label: 'Unread' },
    { id: 'direct', label: 'Direct' },
    { id: 'groups', label: 'Groups' },
] as const;

function ConvRow({ conv, currentUserId, onClose }: { conv: ConversationRow; currentUserId: number; onClose: () => void }) {
    const name = getConversationDisplayName(conv, currentUserId);
    const initials = getConversationInitials(conv, currentUserId);
    const isGroup = conv.type === 'group';
    const catMeta = getCategoryMeta(isGroup ? conv.category : null);
    const avatarTone = getAvatarTone(isGroup ? conv.id : name);
    const preview = getLastMessagePreview(conv, currentUserId);
    const messageId = conv.lastMessage?.id;

    function handleClick() {
        const params = new URLSearchParams({ conversation: String(conv.id) });
        if (messageId) params.set('message', String(messageId));
        router.visit(`/inbox?${params.toString()}`);
        onClose();
    }

    return (
        <button type="button" onClick={handleClick}
            className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--crm-surface)] ${conv.unreadCount > 0 ? 'bg-[var(--crm-gold)]/[0.03]' : ''}`}>
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
                    const other = (conv.participants || []).find((p) => p?.user?.id !== currentUserId);
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
                        <p className={`truncate text-xs ${conv.unreadCount > 0 ? 'font-bold text-[var(--crm-text)]' : 'font-semibold text-[var(--crm-text-muted)]'}`}>
                            {name}
                        </p>
                        {isGroup && conv.category ? (
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>
                                {catMeta.label}
                            </span>
                        ) : null}
                    </div>
                    <span className="shrink-0 text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(conv.lastMessageAt)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                    <p className={`truncate text-[11px] ${conv.unreadCount > 0 ? 'font-medium text-[var(--crm-text)]' : 'text-[var(--crm-text-muted)]'}`}>
                        {preview}
                    </p>
                </div>
            </div>
            {conv.unreadCount > 0 ? (
                <div className="shrink-0">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold)] text-[9px] font-bold text-black">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                </div>
            ) : null}
            {conv.unreadCount > 0 ? (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-[var(--crm-gold)]" />
            ) : null}
        </button>
    );
}

export function MessagePopover() {
    const [activeTab, setActiveTab] = useState<'recent' | 'unread' | 'direct' | 'groups'>('recent');

    const { auth } = usePage().props as { auth: { user?: { recent_conversations?: ConversationRow[]; unread_messages?: number; id?: number } } };
    const convs = auth?.user?.recent_conversations ?? [];
    const unreadCount = auth?.user?.unread_messages ?? 0;
    const currentUserId = auth?.user?.id ?? 0;

    const filtered = useMemo(() => {
        if (activeTab === 'recent') return convs;
        if (activeTab === 'unread') return convs.filter((c) => c.unreadCount > 0);
        if (activeTab === 'direct') return convs.filter((c) => c.type === 'direct');
        if (activeTab === 'groups') return convs.filter((c) => c.type === 'group');
        return convs;
    }, [convs, activeTab]);

    const tabCounts = useMemo(() => {
        return {
            recent: convs.length,
            unread: convs.filter((c) => c.unreadCount > 0).length,
            direct: convs.filter((c) => c.type === 'direct').length,
            groups: convs.filter((c) => c.type === 'group').length,
        };
    }, [convs]);

    return (
        <DialogTrigger>
            <Button className="crm-action-button relative h-9 w-9 px-0 sm:inline-flex" aria-label="Messages">
                <MessageSquare size={15} />
                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                ) : null}
            </Button>
            <Popover placement="bottom end" className="react-aria-Popover" style={{ maxWidth: '480px', minWidth: '420px' }}>
                <Dialog className="outline-none" aria-label="Messages">
                    {({ close }) => (
                        <div className="flex max-h-[70vh] flex-col rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl shadow-black/50">
                            <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[var(--crm-text)]">Messages</span>
                                    {unreadCount > 0 ? (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-md bg-[var(--crm-gold)] px-1.5 text-[10px] font-bold text-black">{unreadCount}</span>
                                    ) : null}
                                </div>
                                <button type="button" onClick={() => { router.visit('/inbox'); close(); }}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                    <ExternalLink size={13} />
                                </button>
                            </div>

                            <div className="flex gap-1 border-b border-[var(--crm-border)] px-3 py-2">
                                {TABS.map((tab) => {
                                    const count = tabCounts[tab.id];
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                            className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold transition ${isActive ? 'bg-[var(--crm-gold)] text-black' : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface)] hover:text-[var(--crm-text)]'}`}>
                                            {tab.label}
                                            {count > 0 ? (
                                                <span className={`flex h-4 min-w-[16px] items-center justify-center rounded px-1 text-[9px] font-bold ${isActive ? 'bg-black/20 text-black' : 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]'}`}>
                                                    {count}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-none">
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                        <MessageSquare size={24} className="text-[var(--crm-text-muted)]/40" />
                                        <p className="mt-2 text-xs font-semibold text-[var(--crm-text-muted)]">No messages yet</p>
                                        <p className="mt-1 text-[10px] text-[var(--crm-text-muted)]/60">Team conversations will appear here.</p>
                                    </div>
                                ) : (
                                    filtered.map((conv) => (
                                        <ConvRow key={conv.id} conv={conv} currentUserId={currentUserId} onClose={close} />
                                    ))
                                )}
                            </div>

                            <div className="border-t border-[var(--crm-border)] px-3 py-2">
                                <button type="button" onClick={() => { router.visit('/inbox'); close(); }}
                                    className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface)] hover:text-[var(--crm-gold)]">
                                    <ExternalLink size={12} />
                                    Open inbox
                                </button>
                            </div>
                        </div>
                    )}
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
}
