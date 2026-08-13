import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Modal } from '@heroui/react';
import { IconCheck, IconChevronRight, IconPlayerSkipForward, IconMessageCircle, IconSearch, IconUsers, IconX } from '@tabler/icons-react';

import { toast } from 'sonner';
import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';
import { getAvatarTone, getCategoryMeta, getConversationDisplayName, getConversationInitials, getLastMessagePreview, formatConversationTime } from '@/features/inbox/utils';
import { inboxApi } from '@/features/inbox/api';
import { formatFileSize, getFileTypeAppearance, isImageAttachment } from '@/features/inbox/utils/fileFormatters';
import { FileTypeIcon } from '@/features/inbox/components/FileTypeIcon';
import { cn } from '@/lib/cn';

type ForwardMessageDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    message: MessageRow;
    conversations: ConversationRow[];
    currentUserId: number;
    sourceConversationId: number;
};

type FilterTab = 'all' | 'direct' | 'group';

// ── Forwarded message preview ───────────────────────────────

function ForwardMessagePreview({ message, currentUserId }: { message: MessageRow; currentUserId: number }) {
    const images = (message.attachments || []).filter((a) => isImageAttachment(a));
    const files = (message.attachments || []).filter((a) => !isImageAttachment(a));

    return (
        <div className="mx-5 mt-3 flex max-h-[76px] items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            {(message.attachments || []).length > 0 ? (
                <>
                    {images.length > 0 ? (
                        <img
                            src={images[0].thumbnailUrl || images[0].url || ''}
                            alt=""
                            className="size-10 shrink-0 rounded-lg object-cover"
                        />
                    ) : (
                        <FileTypeIcon
                            appearance={getFileTypeAppearance(files[0]?.mimeType || '', files[0]?.originalFilename)}
                            size={16}
                        />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold text-[var(--text)]">
                            {message.attachments.length === 1
                                ? (message.attachments[0].originalFilename || 'Fichier')
                                : `${message.attachments.length} fichiers`}
                        </p>
                        <p className="truncate text-[9px] text-[var(--text-muted)]">
                            {message.attachments.length > 1
                                ? `${message.attachments.length} pièces jointes`
                                : `${getFileTypeAppearance(files[0]?.mimeType || message.attachments[0]?.mimeType || '', message.attachments[0]?.originalFilename).label} · ${formatFileSize(message.attachments[0]?.size || 0)}`
                            }
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                        <IconPlayerSkipForward size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[var(--text)]">{message.userName || message.user?.name || 'Message'}</p>
                        <p className="line-clamp-2 text-[9px] text-[var(--text-muted)]">
                            {message.body || 'Message sans texte'}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

// ── IconSearch input ────────────────────────────────────────────

function ForwardConversationSearch({ value, onChange, onClear }: { value: string; onChange: (v: string) => void; onClear: () => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);
    return (
        <div className="mx-5 mt-3">
            <div className="relative">
                <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Rechercher une conversation…"
                    className="h-[42px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] pl-10 pr-10 text-[12px] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30"
                    aria-label="Rechercher une conversation"
                />
                {value ? (
                    <button
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)]"
                        aria-label="Effacer la recherche"
                    >
                        <IconX size={14} />
                    </button>
                ) : null}
            </div>
        </div>
    );
}

// ── Filter tabs ─────────────────────────────────────────────

function ForwardConversationFilters({ active, onChange }: { active: FilterTab; onChange: (f: FilterTab) => void }) {
    const tabs: { id: FilterTab; label: string }[] = [
        { id: 'all', label: 'Récentes' },
        { id: 'direct', label: 'Directes' },
        { id: 'group', label: 'Groupes' },
    ];
    return (
        <div className="mx-5 mt-3 flex gap-1.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'h-8 rounded-lg px-3 text-[10px] font-semibold transition outline-none',
                        'focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                        active === tab.id
                            ? 'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// ── Selected destinations chips ─────────────────────────────

function ForwardSelectedDestinations({
    conversations,
    selectedIds,
    onRemove,
}: {
    conversations: ConversationRow[];
    selectedIds: Set<number>;
    onRemove: (id: number) => void;
}) {
    const selected = conversations.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return null;
    return (
        <div className="mx-5 mt-3">
            <p className="mb-1.5 text-[9px] font-medium text-[var(--text-muted)]">
                {selected.length} conversation{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
            </p>
            <div className="flex max-h-[72px] flex-wrap gap-1.5 overflow-y-auto [scrollbar-width:none]">
                {selected.map((conv) => {
                    const tone = getAvatarTone(conv.displayName);
                    return (
                        <span
                            key={conv.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] py-1 pl-1.5 pr-1"
                        >
                            <Avatar size="sm" className={`size-5 min-w-5 text-[9px] ${tone.bg} ${tone.text}`}>
                                {conv.type === 'group' ? <IconUsers size={9} /> : null}
                            </Avatar>
                            <span className="max-w-24 truncate text-[9px] font-medium text-[var(--text)]">{conv.displayName}</span>
                            <button
                                onClick={() => onRemove(conv.id)}
                                className="flex size-4 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                                aria-label={`Retirer ${conv.displayName}`}
                            >
                                <IconX size={10} />
                            </button>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

// ── Conversation row ────────────────────────────────────────

function ForwardConversationRow({
    conversation,
    currentUserId,
    isSelected,
    onToggle,
    isFocused,
}: {
    conversation: ConversationRow;
    currentUserId: number;
    isSelected: boolean;
    onToggle: () => void;
    isFocused: boolean;
}) {
    const name = getConversationDisplayName(conversation, currentUserId);
    const initials = getConversationInitials(conversation, currentUserId);
    const preview = getLastMessagePreview(conversation, currentUserId);
    const tone = getAvatarTone(conversation.type === 'group' ? conversation.id : name);
    const catMeta = conversation.type === 'group' && conversation.category ? getCategoryMeta(conversation.category) : null;
    const memberCount = conversation.participantsCount ?? (conversation.participants || []).length;

    return (
        <div
            role="option"
            aria-selected={isSelected}
            tabIndex={-1}
            onClick={onToggle}
            className={cn(
                'flex h-[62px] cursor-pointer items-center gap-3 rounded-xl px-3 transition outline-none',
                isSelected
                    ? 'border border-[var(--accent)]/25 bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
                    : 'border border-transparent hover:bg-[var(--surface-2)]',
                isFocused && !isSelected ? 'bg-[var(--surface-2)]' : '',
            )}
        >
            <div className="relative shrink-0">
                <Avatar size="md" className={`${tone.bg} ${tone.text}`}>
                    {conversation.type === 'group' ? <IconUsers size={16} /> : initials}
                </Avatar>
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="truncate text-[12px] font-semibold text-[var(--text)]">{name}</span>
                    {catMeta ? (
                        <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-medium', catMeta.tone.bg, catMeta.tone.text)}>
                            {catMeta.label}
                        </span>
                    ) : null}
                </div>
                <div className="flex items-center gap-1.5">
                    <p className="min-w-0 flex-1 truncate text-[10px] text-[var(--text-muted)]">{preview || 'Aucun message'}</p>
                </div>
                {conversation.type === 'group' ? (
                    <p className="text-[9px] text-[var(--text-muted)]/60">{memberCount} membre{memberCount !== 1 ? 's' : ''}</p>
                ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-0.5 self-center">
                {conversation.lastMessageAt ? (
                    <span className="text-[9px] text-[var(--text-muted)]">{formatConversationTime(conversation.lastMessageAt)}</span>
                ) : null}
                {conversation.unreadCount > 0 ? (
                    <span className="flex size-[18px] items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-black">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                ) : null}
                {isSelected ? (
                    <span className="flex size-[22px] items-center justify-center rounded-full bg-[var(--accent)] text-black">
                        <IconCheck size={13} />
                    </span>
                ) : (
                    <span className="flex size-[22px] items-center justify-center rounded-full border-2 border-[var(--border)]" />
                )}
            </div>
        </div>
    );
}

// ── Empty state ─────────────────────────────────────────────

function ForwardEmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                {icon}
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--text)]">{title}</p>
            {description ? <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p> : null}
        </div>
    );
}

// ── Loading skeleton ────────────────────────────────────────

function ForwardLoadingSkeleton() {
    return (
        <div className="space-y-1 px-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex h-[62px] items-center gap-3 rounded-xl px-3">
                    <div className="size-[38px] shrink-0 rounded-full bg-[var(--surface-2)] animate-pulse" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-3/5 rounded bg-[var(--surface-2)] animate-pulse" />
                        <div className="h-2.5 w-4/5 rounded bg-[var(--surface-2)] animate-pulse" />
                    </div>
                    <div className="h-3 w-8 rounded bg-[var(--surface-2)] animate-pulse" />
                </div>
            ))}
        </div>
    );
}

// ── Main dialog ─────────────────────────────────────────────

export function ForwardMessageDialog({ isOpen, onClose, message, conversations, currentUserId, sourceConversationId }: ForwardMessageDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setActiveFilter('all');
            setSelectedIds(new Set());
            setFocusedIndex(0);
            setError(null);
        }
    }, [isOpen]);

    // Eligible conversations — exclude current conversation
    const eligible = useMemo(() => {
        return conversations
            .filter((c) => c.id && c.id !== sourceConversationId && !c.archivedAt)
            .sort((a, b) => {
                const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
                const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
                if (aTime !== bTime) return bTime - aTime;
                const aName = getConversationDisplayName(a, currentUserId).toLowerCase();
                const bName = getConversationDisplayName(b, currentUserId).toLowerCase();
                return aName.localeCompare(bName);
            });
    }, [conversations, currentUserId, sourceConversationId]);

    // Filter by search + active filter
    const filtered = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return eligible.filter((c) => {
            if (activeFilter === 'direct' && c.type !== 'direct') return false;
            if (activeFilter === 'group' && c.type !== 'group') return false;
            if (!query) return true;
            const name = getConversationDisplayName(c, currentUserId).toLowerCase();
            const preview = getLastMessagePreview(c, currentUserId).toLowerCase();
            const participants = (c.participants || [])
                .map((p) => `${p?.user?.name || ''} ${p?.user?.email || ''}`.toLowerCase())
                .join(' ');
            return name.includes(query) || preview.includes(query) || participants.includes(query);
        });
    }, [eligible, searchQuery, activeFilter, currentUserId]);

    const canForward = selectedIds.size > 0 && !isSubmitting;

    // Keyboard navigation — do not intercept when typing in inputs
    function handleKeyDown(e: React.KeyboardEvent) {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
        if (e.key === 'ArrowDown' && !isInput) { e.preventDefault(); setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
        if (e.key === 'ArrowUp' && !isInput) { e.preventDefault(); setFocusedIndex((i) => Math.max(i - 1, 0)); }
        if (e.key === 'Enter' && !isInput) {
            if (searchQuery && filtered.length > 0 && focusedIndex >= 0 && focusedIndex < filtered.length) {
                e.preventDefault();
                toggle(filtered[focusedIndex].id);
            } else if (!searchQuery && canForward) {
                e.preventDefault();
                handleForward();
            }
        }
        if (e.key === 'Escape') {
            if (searchQuery) { e.preventDefault(); setSearchQuery(''); }
            else onClose();
        }
        if (e.key === ' ' && !isInput && filtered.length > 0 && focusedIndex >= 0 && focusedIndex < filtered.length) {
            e.preventDefault();
            toggle(filtered[focusedIndex].id);
        }
    }

    function toggle(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    const handleForward = useCallback(async () => {
        if (!canForward) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const data = await inboxApi.forward(sourceConversationId, message.id, Array.from(selectedIds));
            if (data.forwarded) {
                toast.success(
                    selectedIds.size === 1
                        ? 'Message transféré.'
                        : `Message transféré à ${selectedIds.size} conversations.`,
                );
                onClose();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Impossible de transférer le message.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    }, [canForward, sourceConversationId, message.id, selectedIds, onClose]);

    function scrollToIndex(index: number) {
        const el = listRef.current;
        if (!el) return;
        const rows = el.querySelectorAll('[role="option"]');
        if (rows[index]) rows[index].scrollIntoView({ block: 'nearest' });
    }

    useEffect(() => {
        scrollToIndex(focusedIndex);
    }, [focusedIndex]);

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={(open) => { if (!open) onClose(); }}
            isDismissable
            className="z-[90] bg-black/60 backdrop-blur-sm"
        >
            <Modal.Container className="!m-0 !w-[460px] !max-w-[calc(100vw-32px)] !max-h-[min(680px,calc(100dvh-48px))] !rounded-[18px]">
                <Modal.Dialog
                    className="flex max-h-[min(680px,calc(100dvh-48px))] flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] outline-none"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-[18px]">
                        <div className="flex items-start gap-3">
                            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]">
                                <IconPlayerSkipForward size={16} />
                            </span>
                            <div>
                                <h2 className="text-[15px] font-semibold text-[var(--text)]">Transférer le message</h2>
                                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Sélectionnez une ou plusieurs conversations.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                            aria-label="Fermer"
                        >
                            <IconX size={16} />
                        </button>
                    </div>

                    {/* Message preview */}
                    <ForwardMessagePreview message={message} currentUserId={currentUserId} />

                    {/* IconSearch */}
                    <ForwardConversationSearch
                        value={searchQuery}
                        onChange={(v) => { setSearchQuery(v); setFocusedIndex(0); }}
                        onClear={() => { setSearchQuery(''); setFocusedIndex(0); }}
                    />

                    {/* Filter tabs */}
                    <ForwardConversationFilters active={activeFilter} onChange={setActiveFilter} />

                    {/* Selected chips — pass all eligible, not filtered */}
                    <ForwardSelectedDestinations conversations={eligible} selectedIds={selectedIds} onRemove={(id) => toggle(id)} />

                    {/* Conversation list */}
                    <div className="min-h-[220px] flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:none] [-ms-overflow-style:none]" ref={listRef}>
                        {filtered.length === 0 ? (
                            searchQuery ? (
                                <ForwardEmptyState
                                    icon={<IconSearch size={18} />}
                                    title="Aucun résultat"
                                    description="Essayez un autre nom ou mot-clé."
                                />
                            ) : (
                                <ForwardEmptyState
                                    icon={<IconMessageCircle size={18} />}
                                    title="Aucune conversation disponible"
                                    description="Créez d'abord une conversation pour pouvoir transférer ce message."
                                />
                            )
                        ) : (
                            filtered.map((conv, i) => (
                                <ForwardConversationRow
                                    key={conv.id}
                                    conversation={conv}
                                    currentUserId={currentUserId}
                                    isSelected={selectedIds.has(conv.id)}
                                    onToggle={() => toggle(conv.id)}
                                    isFocused={i === focusedIndex}
                                />
                            ))
                        )}
                    </div>

                    {/* Error inline */}
                    {error ? (
                        <p className="px-5 py-2 text-[10px] font-medium text-red-400">{error}</p>
                    ) : null}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-[14px]">
                        <span className="text-[10px] text-[var(--text-muted)]">
                            {selectedIds.size === 0
                                ? 'Aucune conversation sélectionnée'
                                : `${selectedIds.size} destination${selectedIds.size > 1 ? 's' : ''}`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="h-[38px] rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--surface)] transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleForward}
                                disabled={!canForward}
                                className={cn(
                                    'flex h-[38px] items-center gap-1.5 rounded-xl px-4 text-[11px] font-semibold transition',
                                    canForward
                                        ? 'bg-[var(--accent)] text-black hover:opacity-90'
                                        : 'bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed',
                                )}
                            >
                                {isSubmitting ? (
                                    <span className="size-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                ) : (
                                    <IconPlayerSkipForward size={14} />
                                )}
                                Transférer
                            </button>
                        </div>
                    </div>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
