import { Archive, ArchiveRestore, ImageIcon, Info, PanelRightClose, PanelRightOpen, Users } from 'lucide-react';
import type { ConversationRow, MessageRow } from '@/features/chat/types';
import { conversationInitial, conversationName, conversationStatus } from '@/features/chat/helpers';

type Props = {
    conversation: ConversationRow | null;
    messages: MessageRow[];
    currentUserId: number;
    onArchiveToggle: (conversation: ConversationRow) => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
};

export function ConversationInfoPanel({ conversation, messages, currentUserId, onArchiveToggle, collapsed, onToggleCollapsed }: Props) {
    if (collapsed) {
        return (
            <aside className="hidden w-12 shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-elevated)] xl:flex xl:flex-col xl:items-center">
                <button type="button" onClick={onToggleCollapsed}
                    className="mt-3 flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                    title="Show details">
                    <PanelRightOpen size={15} />
                </button>
                {conversation ? (
                    <div className="mt-4 flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-black text-[var(--crm-gold)]">
                        {conversationInitial(conversation, currentUserId)}
                    </div>
                ) : null}
            </aside>
        );
    }

    if (!conversation) {
        return (
            <aside className="hidden w-[300px] shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-elevated)] xl:block">
                <div className="flex justify-end p-3">
                    <button type="button" onClick={onToggleCollapsed}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                        title="Hide details">
                        <PanelRightClose size={15} />
                    </button>
                </div>
                <div className="flex h-full items-center justify-center p-6 pt-0 text-center text-xs text-[var(--crm-muted)]">
                    Select a conversation to see details.
                </div>
            </aside>
        );
    }

    const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
    const images = messages.flatMap((message) => message.attachments || []).filter((attachment) => attachment.url).slice(0, 9);
    const isOnline = (lastSeenAt?: string | null, explicit?: boolean) => {
        if (explicit) return true;
        return !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < 300000;
    };
    const onlineCount = participants.filter((participant) => isOnline(participant.user?.lastSeenAt, participant.user?.isOnline)).length;
    const status = conversationStatus(conversation, currentUserId) || 'Conversation details';

    return (
        <aside className="hidden w-[300px] shrink-0 border-l border-[var(--crm-border)] bg-[var(--crm-elevated)] xl:flex xl:flex-col">
            <div className="border-b border-[var(--crm-border)] p-4">
                <div className="mb-2 flex justify-end">
                    <button type="button" onClick={onToggleCollapsed}
                        className="flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                        title="Hide details">
                        <PanelRightClose size={15} />
                    </button>
                </div>
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[var(--crm-gold-soft)] text-xl font-black text-[var(--crm-gold)]">
                    {conversationInitial(conversation, currentUserId)}
                </div>
                <h3 className="mt-3 truncate text-center text-base font-black text-[var(--crm-text)]">
                    {conversationName(conversation, currentUserId)}
                </h3>
                <p className="mt-1 text-center text-xs text-[var(--crm-muted)]">
                    {conversation.type === 'group' ? `${participants.length} members` : 'Direct conversation'}
                </p>
                <div className="mt-3 flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        onlineCount > 0
                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                            : 'border-[var(--crm-border)] bg-[var(--crm-surface)] text-[var(--crm-text-muted)]'
                    }`}>
                        <span className={`size-1.5 rounded-full ${onlineCount > 0 ? 'bg-emerald-400' : 'bg-[var(--crm-muted)]'}`} />
                        {conversation.type === 'group' ? `${onlineCount} online` : status}
                    </span>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-none">
                <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--crm-muted)]">
                        <Users size={14} /> Members
                    </div>
                    <div className="space-y-2">
                        {participants.map((participant) => {
                            const user = participant.user ?? participant;
                            const name = user?.name || 'Unknown user';
                            const email = user?.email || 'No email';
                            const initial = name?.charAt(0)?.toUpperCase() || '?';
                            const online = isOnline(user?.lastSeenAt, user?.isOnline);
                            return (
                                <div key={participant.id} className="flex items-center gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] p-2">
                                    <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-black text-[var(--crm-gold)]">
                                        {initial}
                                        {online ? <span className="absolute bottom-0 right-0 size-2 rounded-full border border-[var(--crm-surface)] bg-emerald-400" /> : null}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-[var(--crm-text)]">{name}</p>
                                        <p className="truncate text-[10px] text-[var(--crm-text-muted)]">{online ? 'Online now' : email}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--crm-muted)]">
                        <ImageIcon size={14} /> Shared images
                    </div>
                    {images.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5">
                            {images.map((image) => (
                                <img key={image.id} src={image.url || ''} alt={image.originalFilename}
                                    className="aspect-square rounded-lg object-cover" />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-[var(--crm-border)] p-4 text-center text-xs text-[var(--crm-muted)]">
                            No shared images yet.
                        </div>
                    )}
                </section>
            </div>

            <div className="border-t border-[var(--crm-border)] p-4">
                <button type="button" onClick={() => onArchiveToggle(conversation)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-surface)] px-3 py-2 text-xs font-black text-[var(--crm-text)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]">
                    {conversation.archivedAt ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    {conversation.archivedAt ? 'Unarchive conversation' : 'Archive conversation'}
                </button>
                <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[var(--crm-muted)]">
                    <Info size={11} /> Archive is private to your inbox.
                </p>
            </div>
        </aside>
    );
}
