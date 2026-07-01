                         </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {conv.lastMessageAt ? (
                                                <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(conv.lastMessageAt)}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5">
                                        {preview ? (
                                            <p className="truncate text-[11px] text-[var(--crm-text-muted)]">{preview}</p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!conv.archivedAt && rowHoverId === conv.id ? (
                                        <button type="button" onClick={(e) => { e.stopPropagation(); onArchiveToggle?.(conv); }}
                                            className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"
                                            title="Archive">
                                            <Archive size={12} />
                                        </button>
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

```

# FILE: resources/js/features/inbox/components/MessageThread.tsx

```tsx
import { usePage } from '@inertiajs/react';
import { useTyping } from '@/features/inbox/components/useTyping';
import { toast } from 'sonner';
import { Check, CheckCheck, ChevronLeft, ChevronDown, ChevronUp, Copy, Forward, ImageIcon, MessageSquare, Pencil, Reply, Search, Send, Settings, Trash2, Users, X, UserMinus, UserPlus, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';
import { getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, highlightSearchMatch, formatConversationTime } from '@/features/inbox/utils';

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dateSeparator(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shouldGroup(prev: MessageRow | undefined, curr: MessageRow): boolean {
    if (!prev) return false;
    if (prev.userId !== curr.userId) return false;
    const diff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
    return diff < 300000;
}

function ImageGrid({ attachments, onImageClick }: { attachments: MessageAttachmentRow[]; onImageClick?: (index: number) => void }) {
    const count = attachments.length;
    if (count === 0) return null;
    const urls = attachments.map((a) => a.url || '').filter(Boolean);
    function img(url: string, i: number, cls: string) {
        return <img key={i} src={url} alt="" loading="lazy" className={`${cls} cursor-pointer hover:brightness-90 transition`} onClick={() => onImageClick?.(i)} />;
    }
    if (count === 1) return img(urls[0], 0, 'max-h-64 w-full rounded-lg object-cover');
    if (count === 2) return <div className="flex gap-1 rounded-lg overflow-hidden">{urls.map((url, i) => img(url, i, 'w-1/2 h-40 object-cover'))}</div>;
    if (count === 3) return <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">{img(urls[0], 0, 'row-span-2 h-48 w-full object-cover')}{img(urls[1], 1, 'h-[94px] w-full object-cover')}{img(urls[2], 2, 'h-[94px] w-full object-cover')}</div>;
    return (
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden relative">
            {urls.slice(0, 4).map((url, i) => (
                <div key={i} className="relative">
                    {img(url, i, 'h-32 w-full object-cover')}
                    {i === 3 && count > 4 ? <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white pointer-events-none">+{count - 4}</div> : null}
                </div>
            ))}
        </div>
    );
}

function Lightbox({ images, initialIndex, onClose }: { images: { url: string; originalFilename: string }[]; initialIndex: number; onClose: () => void }) {
    const [index, setIndex] = useState(initialIndex);
    const current = images[index];
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
            if (e.key === 'ArrowRight') setIndex((i) => Math.min(images.length - 1, i + 1));
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [images.length, onClose]);
    if (!current) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
            <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><X size={20} /></button>
            {images.length > 1 && index > 0 ? <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1); }} className="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft size={20} /></button> : null}
            {images.length > 1 && index < images.length - 1 ? <button type="button" onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1); }} className="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"><ChevronLeft size={20} className="rotate-180" /></button> : null}
            <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center max-w-[90vw] max-h-[90vh]">
                <img src={current.url} alt={current.originalFilename} className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain" />
                <p className="mt-2 text-xs text-white/60">{current.originalFilename}</p>
            </div>
        </div>
    );
}

function ForwardModal({ conversations, currentUserId, onClose, onForward }: {
    conversations: ConversationRow[]; currentUserId: number; onClose: () => void; onForward: (convIds: number[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const convs = useMemo(() => conversations
        .filter((c) => c.id)
        .map((c) => {
            const others = (c.participants || []).filter((p) => p?.user?.id !== currentUserId);
            return { id: c.id, name: others.map((p) => p?.user?.name).filter(Boolean).join(', ') || c.subject || `Conversation #${c.id}` };
        }), [conversations, currentUserId]);
    const filtered = convs.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    const toggle = (id: number) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                    <p className="text-sm font-bold text-[var(--crm-text)]">Forward message</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--crm-text-muted)]">{selected.size > 0 ? `${selected.size} selected` : ''}</span>
                        <button type="button" onClick={onClose} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={16} /></button>
                    </div>
                </div>
                <div className="px-4 py-3">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="h-8 w-full rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                </div>
                <div className="max-h-60 overflow-y-auto px-2 pb-2">
                    {filtered.length === 0 ? <p className="py-6 text-center text-xs text-[var(--crm-text-muted)]">No conversations found</p> : filtered.map((c) => (
                        <button key={c.id} type="button" onClick={() => toggle(c.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${selected.has(c.id) ? 'bg-[var(--crm-gold)]/10 text-[var(--crm-gold)]' : 'text-[var(--crm-text)] hover:bg-[var(--crm-surface)]'}`}>
                            <div className={`flex size-4 shrink-0 items-center justify-center rounded border ${selected.has(c.id) ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)] text-black' : 'border-[var(--crm-border)]'}`}>{selected.has(c.id) ? <Check size={10} /> : null}</div>
                            <Forward size={14} className="text-[var(--crm-muted)]" />
                            {c.name}
                        </button>
                    ))}
                </div>
                {selected.size > 0 ? (
                    <div className="border-t border-[var(--crm-border)] px-4 py-3">
                        <button type="button" onClick={() => { onForward(Array.from(selected)); setSelected(new Set()); }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--crm-gold)] px-4 py-2 text-xs font-bold text-black hover:brightness-110 transition">
                            <Forward size={14} /> Forward to {selected.size} conversation{selected.size > 1 ? 's' : ''}
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function MessageBubble({ msg, isMine, grouped, isGroup, currentUserId, onReply, onForward: onForwardMsg, onImageClick, onEdit, onDelete, searchQuery }: {
    msg: MessageRow; isMine: boolean; grouped: boolean; isGroup: boolean; currentUserId: number;
    onReply: (msg: MessageRow) => void; onForward: (msg: MessageRow) => void;
    onImageClick: (attachments: MessageAttachmentRow[], index: number) => void;
    onEdit?: (msg: MessageRow) => void; onDelete?: (msg: MessageRow) => void; searchQuery?: string;
}) {
    const [hovered, setHovered] = useState(false);
    const avatarTone = getAvatarTone(msg.userId);
    const highlight = (text: string) => {
        if (!searchQuery || !text) return text;
        const match = highlightSearchMatch(text, searchQuery);
        if (!match) return text;
        return <>{match.before}<mark className="bg-[var(--crm-gold)]/30 text-inherit rounded px-0.5">{match.match}</mark>{match.after}</>;
    };
    return (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-0.5`}>
            <div className={`max-w-[75%] min-w-0 ${grouped ? '' : 'mt-2'}`}>
                {isGroup && !isMine && !grouped ? (
                    <p className={`text-[10px] font-semibold mb-1 ${avatarTone.text}`}>{msg.user?.name || msg.userName || 'Unknown'}</p>
                ) : null}
                {msg.isForwarded ? <p className={`text-[9px] text-[var(--crm-muted)] mb-0.5 ${isMine ? 'text-right' : 'text-left'}`}>Forwarded</p> : null}
                {msg.replyTo ? (
                    <div className={`mb-1 rounded-lg border-l-2 px-2.5 py-1.5 ${isMine ? 'border-[var(--crm-gold)]/50 bg-black/20' : 'border-[var(--crm-border)] bg-[var(--crm-surface-3)]'}`}>
                        <p className="text-[9px] font-semibold text-[var(--crm-text-muted)]">Replied to {msg.replyTo.userName || 'a message'}</p>
                        <p className="text-[10px] text-[var(--crm-text-muted)] truncate">{msg.replyTo.body || (msg.replyTo.attachmentsCount > 0 ? 'Photo' : '')}</p>
                    </div>
                ) : null}
                <div className={`rounded-xl overflow-hidden ${isMine ? 'bg-[var(--crm-gold)] text-black' : 'border border-[var(--crm-border)] bg-[var(--crm-surface-2)]'}`}>
                    {msg.attachments && msg.attachments.length > 0 ? (
                        <div className={`${msg.body ? 'rounded-t-xl' : 'rounded-xl'} overflow-hidden`}>
                            <ImageGrid attachments={msg.attachments} onImageClick={(i) => onImageClick(msg.attachments!, i)} />
                        </div>
                    ) : null}
                    {msg.body ? (
                        <div className={`px-3 py-2 text-xs whitespace-pre-wrap break-words ${msg.attachments && msg.attachments.length > 0 ? 'border-t border-black/10' : ''}`}>
                            {highlight(msg.body)}
                        </div>
                    ) : null}
                </div>
                <div className={`mt-0.5 flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {msg.isEdited ? <span className="text-[9px] text-[var(--crm-text-muted)]">edited</span> : null}
                    <span className="text-[9px] text-[var(--crm-text-muted)]">{formatTime(msg.createdAt)}</span>
                    {isMine ? (
                        msg.readBy && msg.readBy.length > 0 ? <CheckCheck size={11} className="text-emerald-400" /> : <Check size={11} className="text-[var(--crm-text-muted)]" />
                    ) : null}
                </div>
                {hovered ? (
                    <div className={`flex gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <button type="button" onClick={() => onReply(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Reply size={11} /></button>
                        <button type="button" onClick={() => onForward(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Forward size={11} /></button>
                        {isMine && msg.body ? <button type="button" onClick={() => onEdit?.(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Pencil size={11} /></button> : msg.body ? <button type="button" onClick={() => { navigator.clipboard.writeText(msg.body || ''); }} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition"><Copy size={11} /></button> : null}
                        {isMine ? <button type="button" onClick={() => onDelete?.(msg)} className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-3)] text-[var(--crm-text-muted)] hover:text-red-400 transition"><Trash2 size={11} /></button> : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

type Props = {
    conversation: ConversationRow;
    conversations: ConversationRow[];
    messages: MessageRow[];
    loading: boolean;
    loadingOlder: boolean;
    paginator: { currentPage: number; lastPage: number; perPage: number; total: number } | null;
    currentUserId: number;
    onSend: (body: string, images: File[], replyToId?: number) => Promise<MessageRow> | undefined;
    onLoadOlder: () => void;
    onMessageUpdate?: (message: MessageRow) => void;
    onMessageDelete?: (messageId: number) => void;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
};

export function MessageThread({ conversation, conversations, messages, loading, loadingOlder, paginator, currentUserId, onSend, onLoadOlder, onMessageUpdate, onMessageDelete, onScroll }: Props) {
    const pageUsers = ((usePage().props as any)?.users || []) as { id: number; name: string }[];
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const prevLastId = useRef<number | null>(null);
    const [text, setText] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const 