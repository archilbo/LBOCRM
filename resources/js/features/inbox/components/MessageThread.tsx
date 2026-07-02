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
    const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState<{ images: { url: string; originalFilename: string }[]; index: number } | null>(null);
    const [forwardMsg, setForwardMsg] = useState<MessageRow | null>(null);
    const [editingMsg, setEditingMsg] = useState<MessageRow | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
    const [groupSubject, setGroupSubject] = useState(conversation.subject || '');
    const [addUserId, setAddUserId] = useState('');
    const [availableUsers, setAvailableUsers] = useState<{ id: number; name: string }[]>([]);
    const [infoPanelOpen, setInfoPanelOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [searchIndex, setSearchIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const authUser = (usePage().props.auth?.user as { id: number; name: string } | undefined) || { id: 0, name: '' };
    const { typingUsers, sendTyping } = useTyping(
        conversation?.id ?? null,
        currentUserId,
        authUser?.name || 'User',
    );

    useEffect(() => {
        if (messages.length > 0) {
            const lastId = messages[messages.length - 1].id;
            if (lastId !== prevLastId.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            prevLastId.current = lastId;
        }
    }, [messages]);

    useEffect(() => {
        if (!searchQuery) { setSearchResults([]); setSearchIndex(0); return; }
        const q = searchQuery.toLowerCase();
        const ids = messages.filter((m) => (m.body || '').toLowerCase().includes(q) || (m.userName || '').toLowerCase().includes(q) || (m.replyTo?.body || '').toLowerCase().includes(q)).map((m) => m.id);
        setSearchResults(ids);
        setSearchIndex(0);
    }, [searchQuery, messages]);

    useEffect(() => {
        if (searchResults.length > 0 && searchIndex < searchResults.length) {
            const el = document.getElementById(`msg-${searchResults[searchIndex]}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [searchResults, searchIndex]);

    const parts = Array.isArray(conversation.participants) ? conversation.participants : [];
    const others = parts.filter((p) => p?.user?.id !== currentUserId);
    const otherName = getConversationDisplayName(conversation, currentUserId);
    const isGroup = conversation.type === 'group';
    const catMeta = getCategoryMeta(isGroup ? conversation.category : null);

    const statusLine = useMemo(() => {
        if (isGroup) {
            const pc = conversation.participantsCount ?? parts.length;
            const oc = conversation.onlineCount ?? parts.filter((p) => p?.user?.lastSeenAt && Date.now() - new Date(p.user.lastSeenAt).getTime() < 300000).length;
            return `${pc} member${pc !== 1 ? 's' : ''}${oc > 0 ? ` · ${oc} online` : ''}`;
        }
        const other = others[0];
        if (!other) return '';
        const ls = other.user?.lastSeenAt;
        if (!ls) return '';
        const diff = Date.now() - new Date(ls).getTime();
        if (diff < 300000) return 'Online';
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `Last seen ${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `Last seen ${hours}h ago`;
        return `Last seen ${new Date(ls).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }, [conversation, others, parts, isGroup]);

    const handleSend = useCallback(async () => {
        const body = text.trim();
        if (!body && selectedImages.length === 0) return;
        if (sending) return;
        setSending(true);
        try {
            await onSend(body, selectedImages, replyTo?.id);
            setText(''); setSelectedImages([]); setReplyTo(null);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { /* handled */ } finally { setSending(false); }
    }, [text, selectedImages, replyTo, sending, onSend]);

    const handleUpdate = useCallback(async () => {
        const body = text.trim();
        if (!body || !editingMsg || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${editingMsg.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ body }) });
            if (!res.ok) { toast.error('Failed to update message'); return; }
            const updated: MessageRow = await res.json();
            onMessageUpdate?.(updated);
            setEditingMsg(null); setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch { toast.error('Failed to update message'); } finally { setSending(false); }
    }, [text, editingMsg, sending, conversation.id, onMessageUpdate]);

    const handleEdit = useCallback((msg: MessageRow) => {
        setEditingMsg(msg); setText(msg.body || ''); setReplyTo(null); setSelectedImages([]);
        setTimeout(() => { if (textareaRef.current) { textareaRef.current.focus(); textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'; } }, 0);
    }, []);

    const handleDelete = useCallback((msg: MessageRow) => {
        if (deleteConfirmId === msg.id) {
            fetch(`/inbox/${conversation.id}/messages/${msg.id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then((res) => { if (res.ok) onMessageDelete?.(msg.id); }).catch(() => {});
            setDeleteConfirmId(null);
        } else { setDeleteConfirmId(msg.id); setTimeout(() => setDeleteConfirmId(null), 3000); }
    }, [deleteConfirmId, conversation.id, onMessageDelete]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (editingMsg) handleUpdate(); else handleSend(); }
        if (e.key === 'Escape' && editingMsg) { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }
    }, [handleSend, handleUpdate, editingMsg]);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages((prev) => [...prev, ...files].slice(0, 10));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const removeImage = useCallback((i: number) => setSelectedImages((prev) => prev.filter((_, idx) => idx !== i)), []);
    const handleImageClick = useCallback((attachments: MessageAttachmentRow[], index: number) => {
        const images = attachments.filter((a) => a.url).map((a) => ({ url: a.url!, originalFilename: a.originalFilename }));
        if (images.length > 0) setLightboxOpen({ images, index });
    }, []);

    const handleForward = useCallback(async (convIds: number[]) => {
        if (!forwardMsg) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/messages/${forwardMsg.id}/forward`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' },
                body: JSON.stringify({ conversation_ids: convIds }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.forwarded) {
                    toast.success(`Forwarded to ${convIds.length} conversation${convIds.length > 1 ? 's' : ''}`);
                }
            } else {
                toast.error('Failed to forward message');
            }
            setForwardMsg(null);
        } catch { toast.error('Failed to forward message'); }
    }, [forwardMsg, conversation.id]);

    const handleRenameGroup = useCallback(async () => {
        if (!groupSubject.trim() || !isGroup) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ subject: groupSubject.trim() }) });
            if (res.ok) { toast.success('Group renamed'); setGroupSettingsOpen(false); }
        } catch { toast.error('Failed to rename group'); }
    }, [conversation.id, isGroup, groupSubject]);

    const handleAddParticipant = useCallback(async () => {
        if (!addUserId) return;
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (window as any).csrfToken || '' }, body: JSON.stringify({ user_id: Number(addUserId) }) });
            if (res.ok) { toast.success('Participant added'); setAddUserId(''); setAvailableUsers([]); }
        } catch { toast.error('Failed to add participant'); }
    }, [conversation.id, addUserId]);

    const handleRemoveParticipant = useCallback(async (userId: number) => {
        try {
            const res = await fetch(`/inbox/${conversation.id}/participants/${userId}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } });
            if (res.ok) toast.success('Participant removed');
        } catch { toast.error('Failed to remove participant'); }
    }, [conversation.id]);

    const openGroupSettings = useCallback(() => {
        setGroupSubject(conversation.subject || '');
        setAvailableUsers(pageUsers.filter((u) => !parts.some((p) => p?.user?.id === u.id)));
        setGroupSettingsOpen(true);
    }, [conversation.subject, parts, pageUsers]);

    const groupedDates = useMemo(() => {
        const dates: { label: string; messageIds: number[] }[] = [];
        let lastLabel = '';
        for (const msg of messages) {
            const label = dateSeparator(msg.createdAt);
            if (label !== lastLabel) { dates.push({ label, messageIds: [msg.id] }); lastLabel = label; }
            else { dates[dates.length - 1].messageIds.push(msg.id); }
        }
        return dates;
    }, [messages]);

    const canSend = editingMsg ? text.trim().length > 0 : text.trim().length > 0 || selectedImages.length > 0;
    const avatarTone = getAvatarTone(isGroup ? conversation.id : otherName + currentUserId);

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                <div className="relative shrink-0">
                    {isGroup ? (
                        <div className={`flex size-9 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={16} /></div>
                    ) : (
                        <div className={`flex size-9 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-sm font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                    )}
                    {!isGroup && others.length === 1 && statusLine === 'Online' ? (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--crm-surface)] bg-emerald-400" />
                    ) : null}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--crm-text)]">{otherName}</p>
                        {isGroup && conversation.category ? (
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span>
                        ) : null}
                    </div>
                    {statusLine ? <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p> : null}
                </div>
                {searchOpen ? (
                    <div className="flex items-center gap-1">
                        <input ref={searchInputRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search messages..." autoFocus
                            className="h-7 w-40 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-2 text-[10px] text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                        {searchResults.length > 0 ? <span className="text-[9px] text-[var(--crm-text-muted)] shrink-0">{searchIndex + 1}/{searchResults.length}</span> : null}
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronUp size={12} /></button>
                        <button type="button" onClick={() => { setSearchIndex((i) => Math.max(i - 1, 0)); }} disabled={searchResults.length === 0} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] disabled:opacity-30"><ChevronDown size={12} /></button>
                        <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} className="flex size-6 items-center justify-center rounded text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={12} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Search size={14} /></button>
                        <button type="button" onClick={() => setInfoPanelOpen(!infoPanelOpen)} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Info size={14} /></button>
                        {isGroup ? <button type="button" onClick={openGroupSettings} className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><Settings size={14} /></button> : null}
                    </div>
                )}
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Messages area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none" onScroll={onScroll}>
                        {loading ? (
                            <div className="flex items-center justify-center py-8"><div className="size-5 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <MessageSquare size={32} className="text-[var(--crm-muted)]" />
                                <p className="mt-2 text-xs text-[var(--crm-text-muted)]">No messages yet</p>
                                <p className="mt-0.5 text-[10px] text-[var(--crm-muted)]">Send a message to start the conversation</p>
                            </div>
                        ) : (
                            <>
                                {paginator && paginator.currentPage < paginator.lastPage ? (
                                    <div className="flex justify-center py-3">
                                        <button type="button" onClick={onLoadOlder} disabled={loadingOlder}
                                            className="flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-1 text-[9px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition disabled:opacity-50">
                                            {loadingOlder ? <div className="size-3 animate-spin rounded-full border-2 border-[var(--crm-gold)] border-t-transparent" /> : null}
                                            {loadingOlder ? 'Loading...' : `Load older messages (${paginator.total - (paginator.currentPage * paginator.perPage) > 0 ? paginator.total - (paginator.currentPage * paginator.perPage) : 0} more)`}
                                        </button>
                                    </div>
                                ) : null}
                                {groupedDates.map((group) => (
                                    <div key={group.label}>
                                        <div className="flex items-center justify-center py-3">
                                            <span className="rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-0.5 text-[9px] font-semibold text-[var(--crm-text-muted)]">{group.label}</span>
                                        </div>
                                        {group.messageIds.map((msgId, idx) => {
                                            const msg = messages.find((m) => m.id === msgId)!;
                                            const prev = idx > 0 ? messages.find((m) => m.id === group.messageIds[idx - 1]) : undefined;
                                            const isSearchResult = searchResults.includes(msg.id);
                                            return (
                                                <div key={msg.id} id={`msg-${msg.id}`} className={`msg-slide-in ${isSearchResult ? (searchResults[searchIndex] === msg.id ? 'ring-2 ring-[var(--crm-gold)]/50 rounded-lg' : 'ring-1 ring-[var(--crm-gold)]/20 rounded-lg') : ''}`}>
                                                    <MessageBubble msg={msg} isMine={msg.userId === currentUserId} grouped={shouldGroup(prev, msg)} isGroup={isGroup}
                                                        currentUserId={currentUserId} onReply={setReplyTo} onForward={setForwardMsg} onImageClick={handleImageClick}
                                                        onEdit={handleEdit} onDelete={handleDelete} searchQuery={searchQuery} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Reply preview in composer */}
                    {replyTo && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-[var(--crm-gold)]" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-[var(--crm-gold)]">Replying to {replyTo.userName || 'a message'}</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{replyTo.body || (replyTo.attachments && replyTo.attachments.length > 0 ? 'Photo' : '')}</p>
                            </div>
                            <button type="button" onClick={() => setReplyTo(null)} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Editing bar */}
                    {editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 shrink-0">
                            <div className="h-8 w-0.5 rounded-full bg-emerald-400" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold text-emerald-400">Editing message</p>
                                <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{editingMsg.body || ''}</p>
                            </div>
                            <button type="button" onClick={() => { setEditingMsg(null); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto'; }} className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                    ) : null}

                    {/* Image previews */}
                    {selectedImages.length > 0 ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-2 overflow-x-auto shrink-0">
                            {selectedImages.map((file, i) => (
                                <div key={i} className="relative shrink-0">
                                    <img src={URL.createObjectURL(file)} alt="" className="size-14 rounded-lg object-cover border border-[var(--crm-border)]" />
                                    <button type="button" onClick={() => removeImage(i)} className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"><X size={8} /></button>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && !editingMsg ? (
                        <div className="flex items-center gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-1.5 shrink-0">
                            <div className="flex items-center gap-1">
                                {typingUsers.slice(0, 2).map((u) => (
                                    <span key={u.id} className="flex size-5 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[7px] font-bold text-[var(--crm-gold)]">
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-[var(--crm-text-muted)]">
                                {typingUsers.length === 1 ? `${typingUsers[0].name} is typing` :
                                    typingUsers.length === 2 ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing` :
                                    `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`}
                                <span className="inline-flex items-center gap-0.5 ml-1">
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                    <span className="typing-dot size-1 rounded-full bg-[var(--crm-muted)]" />
                                </span>
                            </p>
                        </div>
                    ) : null}

                    {/* Composer */}
                    <div className="flex items-end gap-2 border-t border-[var(--crm-border)] bg-[var(--crm-surface)] px-4 py-3 shrink-0">
                        {!editingMsg ? <button type="button" onClick={() => fileInputRef.current?.click()} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:text-[var(--crm-gold)] transition"><ImageIcon size={18} /></button> : <div className="size-9 shrink-0" />}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageSelect} />
                        <div className="relative flex-1">
                            <textarea ref={textareaRef} value={text} onChange={(e) => { setText(e.target.value); sendTyping(); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} onKeyDown={handleKeyDown}
                                placeholder="Type a message..." rows={1}
                                className="min-h-[36px] w-full resize-none rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] px-3 py-2 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" style={{ lineHeight: '1.4' }} />
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <button type="button" onClick={editingMsg ? handleUpdate : handleSend} disabled={!canSend || sending}
                                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold)] text-black disabled:opacity-40 transition hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0">
                                {sending ? <div className="size-4 animate-spin rounded-full border-2 border-black border-t-transparent" /> : editingMsg ? <Check size={16} /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info panel */}
                {infoPanelOpen ? (
                    <div className="w-72 shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-surface)] overflow-y-auto scrollbar-none">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--crm-border)]">
                            <p className="text-xs font-bold text-[var(--crm-text)]">Info</p>
                            <button type="button" onClick={() => setInfoPanelOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={14} /></button>
                        </div>
                        {isGroup ? (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-xl ${avatarTone.bg} ${avatarTone.text}`}><Users size={24} /></div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    {conversation.category ? <span className={`rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${catMeta.tone.bg} ${catMeta.tone.text}`}>{catMeta.label}</span> : null}
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide">Participants</p>
                                    <div className="space-y-1.5">
                                        {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => {
                                            const ls = p?.user?.lastSeenAt;
                                            const isOnline = ls && Date.now() - new Date(ls).getTime() < 300000;
                                            return (
                                                <div key={p.id} className="flex items-center gap-2">
                                                    <span className={`size-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-[var(--crm-muted)]'}`} />
                                                    <span className="text-xs text-[var(--crm-text)]">{p.user?.name}</span>
                                                    {!isOnline && ls ? <span className="text-[9px] text-[var(--crm-text-muted)]">{formatConversationTime(ls)}</span> : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                                <div className="space-y-1.5">
                                    <button type="button" onClick={() => { fetch(`/inbox/${conversation.id}/archive`, { method: 'POST', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then(() => window.location.reload()); }}
                                        className="w-full rounded-lg bg-[var(--crm-surface-2)] px-3 py-2 text-[10px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition text-left">Archive conversation</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`flex size-14 items-center justify-center rounded-full ${avatarTone.bg} ${avatarTone.text} text-lg font-bold`}>{getConversationInitials(conversation, currentUserId)}</div>
                                    <p className="text-sm font-bold text-[var(--crm-text)]">{otherName}</p>
                                    <p className="text-[10px] text-[var(--crm-text-muted)]">{statusLine}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-2 uppercase tracking-wide flex items-center gap-1"><ImageIcon size={12} /> Shared images</p>
                                    {(() => {
                                        const images = messages.flatMap((m) => m.attachments || []).filter((a) => a.url).slice(0, 9);
                                        if (images.length === 0) return <p className="text-[10px] text-[var(--crm-text-muted)]">No shared images yet.</p>;
                                        return <div className="grid grid-cols-3 gap-1">{images.map((img) => <img key={img.id} src={img.url!} alt="" className="aspect-square rounded-lg object-cover" />)}</div>;
                                    })()}
                                </div>
                                <div className="space-y-1.5">
                                    <button type="button" onClick={() => { fetch(`/inbox/${conversation.id}/archive`, { method: 'POST', headers: { 'X-CSRF-TOKEN': (window as any).csrfToken || '' } }).then(() => window.location.reload()); }}
                                        className="w-full rounded-lg bg-[var(--crm-surface-2)] px-3 py-2 text-[10px] font-semibold text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] transition text-left">Archive conversation</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {lightboxOpen ? <Lightbox images={lightboxOpen.images} initialIndex={lightboxOpen.index} onClose={() => setLightboxOpen(null)} /> : null}
            {forwardMsg ? <ForwardModal conversations={conversations} currentUserId={currentUserId} onClose={() => setForwardMsg(null)} onForward={handleForward} /> : null}
            {groupSettingsOpen ? (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" onClick={() => setGroupSettingsOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--crm-border)] px-4 py-3">
                            <p className="text-sm font-bold text-[var(--crm-text)]">Group settings</p>
                            <button type="button" onClick={() => setGroupSettingsOpen(false)} className="text-[var(--crm-muted)] hover:text-[var(--crm-text)]"><X size={16} /></button>
                        </div>
                        <div className="px-4 py-3 space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Group name</p>
                                <div className="flex gap-2">
                                    <input value={groupSubject} onChange={(e) => setGroupSubject(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none placeholder:text-[var(--crm-muted)] focus:border-[var(--crm-gold)]" />
                                    <button type="button" onClick={handleRenameGroup} className="h-8 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black hover:brightness-110 transition">Save</button>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Participants</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {parts.filter((p) => p?.user?.id !== currentUserId).map((p) => (
                                        <div key={p.id} className="flex items-center justify-between rounded-lg bg-[var(--crm-surface)] px-3 py-2">
                                            <span className="text-xs font-semibold text-[var(--crm-text)]">{p.user?.name}</span>
                                            <button type="button" onClick={() => handleRemoveParticipant(p.user!.id)} className="text-[var(--crm-text-muted)] hover:text-red-400 transition"><UserMinus size={13} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-[var(--crm-text-muted)] mb-1">Add participant</p>
                                <div className="flex gap-2">
                                    <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)} className="h-8 flex-1 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 text-xs text-[var(--crm-text)] outline-none focus:border-[var(--crm-gold)]">
                                        <option value="">Select a user...</option>
                                        {availableUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <button type="button" onClick={handleAddParticipant} disabled={!addUserId} className="flex h-8 items-center gap-1 rounded-lg bg-[var(--crm-gold)] px-3 text-[10px] font-bold text-black disabled:opacity-40 hover:brightness-110 transition"><UserPlus size={13} /> Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

